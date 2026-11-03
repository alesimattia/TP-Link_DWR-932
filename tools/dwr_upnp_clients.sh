#!/bin/sh
# Sola lettura: flussi verso NAT-PMP/PCP (UDP 5351) e SSDP (UDP 1900) nella tabella conntrack, ARP e lease DHCP per riconoscere i client
grep -E "dport=(5351|1900) " /proc/net/nf_conntrack 2>/dev/null | sed "s/ mark=.*//"
echo "----- ARP"
cat /proc/net/arp
echo "----- lease DHCP (solo IP e nome host)"
for f in /var/lib/misc/dnsmasq.leases /tmp/dnsmasq.leases /var/run/dnsmasq.leases /data/dnsmasq.leases; do [ -f $f ] && awk "{print \$3, \$4}" $f; done
echo "----- coda socket 5351/1900"
grep -E ":(14E7|076C) " /proc/net/udp
