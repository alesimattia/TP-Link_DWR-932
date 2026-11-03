#!/bin/sh
# Disattiva (o riattiva) NAT-PMP in miniupnpd del DWR-932 fw 01.11. Motivo: nella build Qualcomm una sola richiesta
# NAT-PMP di mappatura manda il demone in un ciclo infinito (ProcessIncomingNATPMPPacket, 0x130e4-0x130fc) al 100%
# di CPU. L'UPnP IGD resta attivo. Backup una tantum in /cache/miniupnpd.conf.orig. Se miniupnpd è in esecuzione
# (UPnP acceso) viene riavviato come fa QCMAP EnableUPNP (killall -9 + /etc/init.d/miniupnpd start), senza
# terminale ereditato; con "applica" segue la verifica con una richiesta NAT-PMP di prova (RRQ tftp verso 5351).
# Uso sul device: sh /cache/dwr_natpmp_disable.sh applica|ripristina; cat /cache/natpmp_fix.log

CONF=/etc/miniupnpd/miniupnpd.conf
BAK=/cache/miniupnpd.conf.orig
LOG=/cache/natpmp_fix.log
for fd in $(ls /proc/self/fd); do [ "$fd" -gt 2 ] && eval "exec $fd>&-"; done
exec </dev/null >"$LOG" 2>&1

# Percentuale di CPU utente del processo $1 in 5 s (HZ 100)
cpu5() { a=$(awk '{print $14}' /proc/$1/stat); sleep 5; b=$(awk '{print $14}' /proc/$1/stat); echo $(((b - a) / 5)); }
socket() { echo "UDP 5351 (NAT-PMP): $(grep -c ':14E7 ' /proc/net/udp), UDP 1900 (SSDP): $(grep -c ':076C ' /proc/net/udp), TCP 8201 (UPnP HTTP): $(grep -c ':2009 ' /proc/net/tcp)"; }

attivo=0
pidof miniupnpd >/dev/null && attivo=1
case "$1" in
applica)
	[ -e "$BAK" ] || cp -p "$CONF" "$BAK"
	if grep -q '^enable_natpmp=' "$CONF"; then
		sed -i 's/^enable_natpmp=.*/enable_natpmp=no/' "$CONF"
	else
		echo "enable_natpmp=no" >> "$CONF"
	fi
	;;
ripristina)
	[ -e "$BAK" ] || { echo "manca $BAK: nulla da ripristinare"; exit 1; }
	cat "$BAK" > "$CONF"
	;;
*)
	echo "uso: $0 applica|ripristina"
	exit 1
	;;
esac
sync
echo "$(grep '^enable_natpmp=' "$CONF")"
sha256sum "$CONF" "$BAK"
if [ "$attivo" = 0 ]; then
	echo "miniupnpd non in esecuzione (UPnP spento): nessun riavvio, la modifica vale al prossimo avvio"
	exit 0
fi
killall -9 miniupnpd
sleep 1
/etc/init.d/miniupnpd start
sleep 2
P=$(pidof miniupnpd)
echo "miniupnpd riavviato: pid $P"
socket
[ "$1" = applica ] || exit 0
echo "CPU a riposo: $(cpu5 $P)%"
tftp -g -r AAbbccdddd -l /dev/null 192.168.0.1 5351 >/dev/null 2>&1 &
T=$!
sleep 3
kill $T 2>/dev/null
echo "CPU dopo una richiesta NAT-PMP di mappatura: $(cpu5 $P)%, stato $(awk '{print $3}' /proc/$P/stat)"
logread | grep miniupnpd | tail -3
