#!/bin/sh
# Verifica in sola lettura dei componenti UPnP (miniupnpd + QCMAP) sul DWR-932 F1.
# Da eseguire come root sul device: adb push dwr_upnp_probe.sh /cache/ && adb shell sh /cache/dwr_upnp_probe.sh
# Non modifica nulla e non stampa chiavi: di mobileap_cfg.xml mostra solo i tag UPnP/NAT/port forwarding.

echo "##### identita"
id
uname -a
uptime

echo "##### binari e file (percorso + sha256)"
for p in /usr/sbin/miniupnpd /etc/init.d/miniupnpd /etc/miniupnpd/miniupnpd.conf /usr/lib/libqcmap_client.so.1 /usr/sbin/minissdpd; do
	if [ -f "$p" ]; then
		echo "$p $(sha256sum "$p" | cut -d' ' -f1) $(wc -c < "$p")B"
	else
		echo "$p -"
	fi
done
ls -l /etc/rc*.d 2>/dev/null | grep -i upnp

echo "##### miniupnpd.conf (senza commenti)"
grep -v -E '^[[:space:]]*(#|$)' /etc/miniupnpd/miniupnpd.conf

echo "##### configurazione QCMAP e bm_config"
grep -E '<UPnP>|<DLNA>|<MDNS>|<WlanMode>|<DmzIP>|<EnableWebserverWWANAccess>|<NatType>' /bmdefsys/etc/mobileap_cfg.xml
echo "voci PortFwding in mobileap_cfg.xml: $(grep -c '<PortFwding>' /bmdefsys/etc/mobileap_cfg.xml)"
grep -E 'PortFwding(PrivateIP|PrivatePort|GlobalPort|Protocol)' /bmdefsys/etc/mobileap_cfg.xml
grep -E '^wwan_upnp_disable=' /bmdefsys/etc/bm_config.conf

echo "##### processi"
ps | grep -E 'miniupnp|minissdp|avahi|QCMAP_C|dnsmasq' | grep -v grep
cat /var/run/miniupnpd.pid 2>/dev/null

echo "##### interfacce e indirizzi"
ip -4 addr show 2>/dev/null | grep -E '^[0-9]+:|inet '
ip route

echo "##### socket in ascolto"
netstat -lnu 2>/dev/null
netstat -lnt 2>/dev/null

echo "##### firewall (filter completo, nat PREROUTING/POSTROUTING)"
iptables -S 2>/dev/null || iptables -L -n -v
iptables -t nat -S PREROUTING 2>/dev/null || iptables -t nat -L PREROUTING -n
iptables -t nat -S POSTROUTING 2>/dev/null || iptables -t nat -L POSTROUTING -n

echo "##### syslog: righe miniupnpd/UPnP recenti"
logread 2>/dev/null | grep -i -E 'miniupnpd|upnp' | tail -n 20
