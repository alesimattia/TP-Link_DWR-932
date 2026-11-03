#!/bin/sh
# Probe in sola lettura del consumo di CPU di miniupnpd sul DWR-932: tempo utente/kernel, syscall in corso
# (campionata), contatori di I/O, file descriptor e socket, log di sistema, configurazione, interfacce di rete.
# Uso sul device: sh /cache/dwr_upnp_cpu_probe.sh

sez() { echo; echo "##### $1"; }
P=$(pidof miniupnpd | cut -d' ' -f1)
echo "pid miniupnpd: $P"
[ -n "$P" ] || exit 0
HZ=100

sez "processo"
tr '\0' ' ' < /proc/$P/cmdline; echo
ls -l /proc/$P/exe
md5sum /proc/$P/exe
grep -E '^(State|VmRSS|Threads|voluntary_ctxt_switches|nonvoluntary_ctxt_switches)' /proc/$P/status
echo "uptime: $(cut -d' ' -f1 /proc/uptime)"
# Campi 14-15 di /proc/PID/stat = utime, stime (tick); 22 = starttime
awk '{print "utime=" $14 " stime=" $15 " starttime=" $22}' /proc/$P/stat
echo "wchan: $(cat /proc/$P/wchan 2>&1)"

sez "consumo in 5 s"
a=$(awk '{print $14, $15}' /proc/$P/stat); ioa=$(grep -E '^(syscr|syscw)' /proc/$P/io | awk '{printf "%s ", $2}')
cv=$(grep voluntary_ctxt /proc/$P/status | awk '{printf "%s ", $2}')
sleep 5
b=$(awk '{print $14, $15}' /proc/$P/stat); iob=$(grep -E '^(syscr|syscw)' /proc/$P/io | awk '{printf "%s ", $2}')
cv2=$(grep voluntary_ctxt /proc/$P/status | awk '{printf "%s ", $2}')
echo "$a $b" | awk '{printf "utime +%d tick, stime +%d tick su 500 tick (%.0f%% utente, %.0f%% kernel)\n", $3-$1, $4-$2, ($3-$1)/5, ($4-$2)/5}'
echo "$ioa $iob" | awk '{printf "syscall di lettura +%d, di scrittura +%d in 5 s\n", $3-$1, $4-$2}'
echo "$cv $cv2" | awk '{printf "cambi di contesto volontari +%d, involontari +%d\n", $3-$1, $4-$2}'

sez "syscall in corso (20 campioni)"
i=0
while [ $i -lt 20 ]; do
	cat /proc/$P/syscall 2>&1
	i=$((i + 1))
done | sort | uniq -c | sort -rn | head -10

sez "stack del kernel"
cat /proc/$P/stack 2>&1 | head -15

sez "file descriptor"
ls -l /proc/$P/fd 2>&1
sez "socket UDP/TCP/unix (inode dei fd)"
for f in /proc/$P/fd/*; do l=$(readlink $f); case "$l" in socket:*) echo "$l";; esac; done | sed 's/socket:\[\(.*\)\]/\1/' > /tmp/upnp_inodes
cat /tmp/upnp_inodes | tr '\n' ' '; echo
for t in udp tcp unix; do
	echo "== $t"
	head -1 /proc/net/$t
	while read -r ino; do grep -w "$ino" /proc/net/$t; done < /tmp/upnp_inodes
done
rm -f /tmp/upnp_inodes

sez "configurazione"
grep -v -E '^\s*(#|$)' /etc/miniupnpd/miniupnpd.conf 2>&1
ls -la /etc/miniupnpd/ /var/run/miniupnpd* 2>&1

sez "interfacce"
ip -4 addr 2>&1 | grep -E '^[0-9]|inet'
ip link 2>&1 | grep -E '^[0-9]'
ip route 2>&1

sez "log di sistema (miniupnpd)"
logread 2>/dev/null | grep -i miniupnpd | tail -25
echo "righe miniupnpd nel log: $(logread 2>/dev/null | grep -c -i miniupnpd)"
ls -la /var/syslog_messages 2>&1
grep -c -i miniupnpd /var/syslog_messages 2>&1

sez "altri processi che consumano CPU"
top -n 1 -b | head -12
