#!/bin/sh
# Sonda in SOLA LETTURA per i DNS personalizzati: come gira dnsmasq (versione, riga di comando, processo padre),
# da dove prende i server a monte (/etc/resolv.conf, /etc/dnsmasq.conf), chi li riscrive, IPv6/radvd,
# eventuali redirect della porta 53 e stato della connessione (LTE o repeater).
# Uso sul device: sh /cache/dwr_dns_probe.sh
sez() { echo; echo "== $1"; }

sez "dnsmasq: versione e opzioni"
dnsmasq --version 2>&1 | head -3
dnsmasq --help 2>&1 | grep -i -E 'servers-file|resolv-file|no-resolv|strict-order|all-servers|no-poll|conf-file|conf-dir|server=' | head -20

sez "dnsmasq: processi, riga di comando, padre"
for p in $(pidof dnsmasq); do
	echo "pid $p: $(tr '\0' ' ' < /proc/$p/cmdline)"
	pp=$(sed -n 's/^PPid:[[:space:]]*//p' /proc/$p/status)
	echo "  padre $pp: $(tr '\0' ' ' < /proc/$pp/cmdline 2>/dev/null)"
	echo "  uid: $(sed -n 's/^Uid:[[:space:]]*//p' /proc/$p/status)"
	echo "  avviato (s dal boot): $(awk '{print int($22/100)}' /proc/$p/stat) uptime: $(cut -d. -f1 /proc/uptime)"
	ls -l /proc/$p/fd 2>/dev/null | sed 's/^/  /'
done

sez "file di configurazione"
for f in /etc/resolv.conf /etc/dnsmasq.conf /etc/dhcp_hosts /etc/hosts /var/run/resolv.conf /etc/dhcpcd.conf; do
	echo "-- $f"
	ls -la "$f" 2>&1
	[ -L "$f" ] && echo "  link -> $(readlink "$f")"
	[ -f "$f" ] && sed 's/^/  | /' "$f" | head -60
done
ls -la /etc/dnsmasq.d 2>&1 | head

sez "filesystem di /etc e /var"
df /etc /var /tmp 2>&1
mount | grep -E ' / | /etc| /var| /tmp'

sez "chi cita dnsmasq.conf o resolv.conf negli script"
grep -l -E 'dnsmasq|resolv\.conf' /etc/init.d/* /bmdefsys/etc/init.d/* /bmdefsys/usr/bin/*.sh /usr/bin/*.sh /etc/*.sh 2>/dev/null
grep -n -E 'dnsmasq|resolv\.conf' /etc/init.d/* /bmdefsys/etc/init.d/* /bmdefsys/usr/bin/*.sh /usr/bin/*.sh 2>/dev/null | head -40
ls /lib/dhcpcd/dhcpcd-hooks /usr/lib/dhcpcd/dhcpcd-hooks /etc/dhcpcd-hooks 2>/dev/null

sez "config: chiavi DNS e modalità"
grep -n -i -E 'dns' /bmdefsys/etc/bm_config.conf 2>/dev/null
grep -n -E 'WlanMode|EnableIPV6|APIPAddr|DHCP' /bmdefsys/etc/mobileap_cfg.xml 2>/dev/null | head -20
cat /bmdefsys/etc/bm_custom.conf 2>/dev/null

sez "IPv6: radvd / dhcpv6 / indirizzi"
ps | grep -E 'radvd|dhcp6|odhcp|dhcpcd|udhcpc' | grep -v grep
ls -la /etc/radvd.conf 2>&1 && sed 's/^/  | /' /etc/radvd.conf 2>/dev/null | head -40
ip -6 addr 2>/dev/null | grep -E 'inet6|^[0-9]' | head -20

sez "rete: route, interfacce WAN, porta 53"
ip route 2>/dev/null
ip addr 2>/dev/null | grep -E '^[0-9]|inet ' | head -30
iptables -t nat -S 2>/dev/null | grep -E 'dport 53|DNAT|REDIRECT' | head
iptables -S INPUT 2>/dev/null | grep -E '53' | head
netstat -lnup 2>/dev/null | grep -E ':53 ' ; netstat -lntp 2>/dev/null | grep -E ':53 '

sez "risoluzione di prova (solo lettura, timeout breve)"
for s in 192.168.0.1; do
	echo "-- nslookup via $s"
	timeout -t 5 nslookup dns.google $s 2>&1 | head -8
done
