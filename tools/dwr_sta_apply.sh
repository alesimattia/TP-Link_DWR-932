#!/bin/sh
# Aggiunge a wpa_supplicant.conf la rete preparata in /cache/sta_net.tmp (da dwr_sta_add_network.sh), cancella il file
# temporaneo, riconfigura wpa_supplicant su wlan0-vxd e attende associazione, DHCP e NAT di QCMAP.
# Stampa solo lo stato: nessuna chiave o password.

SUPP=/bmdefsys/etc/wpa_supplicant.conf
[ -s /cache/sta_net.tmp ] || { echo "nessuna rete da aggiungere in /cache/sta_net.tmp"; exit 1; }
cat /cache/sta_net.tmp >> "$SUPP"
rm -f /cache/sta_net.tmp
sync
wpa_cli -i wlan0-vxd reconfigure
wpa_cli -i wlan0-vxd enable_network all
# Senza una scansione esplicita wpa_supplicant attende il ciclo autoscan (120 s) prima di associarsi
wpa_cli -i wlan0-vxd scan
echo "reti in wpa_supplicant.conf: $(grep -c 'network=' "$SUPP")"

i=0
while [ $i -lt 15 ]; do
	wpa_cli -i wlan0-vxd status | grep -q '^wpa_state=COMPLETED' && break
	sleep 3
	i=$((i + 1))
done
# Margine per dhcpcd, ProcessAddrAssign e attivazione del NAT su wlan0-vxd
sleep 12

echo "##### stato STA"
wpa_cli -i wlan0-vxd status | grep -E '^(wpa_state|ssid|bssid|freq|key_mgmt|pairwise_cipher|ip_address)='
ifconfig wlan0-vxd | grep 'inet addr'
iwconfig wlan0 2>&1 | grep -o 'Frequency:[0-9.]* GHz'
echo "##### route, NAT e firewall"
ip route
iptables -t nat -S POSTROUTING
iptables -S INPUT
echo "##### connettivita dal DWR"
ping -c 3 -W 3 8.8.8.8
nslookup example.com 2>&1 | tail -2
echo "##### log"
logread 2>/dev/null | grep -i -E 'wpa_supplicant|wlan0-vxd|dhcpcd|CTRL-EVENT' | grep -v -i 'preaseKey' | tail -15
