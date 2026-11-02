#!/bin/sh
# Stato della modalità AP-STA sul DWR-932 F1 (sola lettura, nessuna chiave stampata).
# Uso sul device: sh dwr_apsta_status.sh ["regex SSID da mostrare"]
# Della scansione stampa il numero di reti trovate e solo le righe il cui SSID corrisponde al filtro.

FILTRO=${1:-Home 2.4GHz|H3140}
IWPRIV=/bmdefsys/usr/bin/rtltools/iwpriv

echo "##### uptime e modalita"
uptime
grep '<WlanMode>' /bmdefsys/etc/mobileap_cfg.xml
echo "reti in wpa_supplicant.conf: $(grep -c 'network=' /bmdefsys/etc/wpa_supplicant.conf)"

echo "##### processi"
ps | grep -E 'wpa_|dhcpcd|QCMAP|pimd' | grep -v grep

echo "##### interfacce"
ifconfig wlan0-vxd 2>&1 | head -3
iwconfig wlan0-vxd 2>&1 | head -3
iwconfig wlan0 2>&1 | head -2
brctl show
$IWPRIV wlan0-vxd get_mib opmode 2>&1
$IWPRIV wlan0 get_mib opmode 2>&1

echo "##### wpa_cli status"
wpa_cli -i wlan0-vxd status 2>&1 | grep -v -i -E 'psk|passphrase|key='

echo "##### scansione"
wpa_cli -i wlan0-vxd scan >/dev/null 2>&1
sleep 8
wpa_cli -i wlan0-vxd scan_results 2>/dev/null > /tmp/apsta_sr.txt
echo "reti trovate: $(grep -c ':' /tmp/apsta_sr.txt)"
grep -E "$FILTRO" /tmp/apsta_sr.txt
rm -f /tmp/apsta_sr.txt

echo "##### route e firewall"
ip route
iptables -S INPUT 2>/dev/null
iptables -t nat -S POSTROUTING 2>/dev/null

echo "##### log recenti (wpa/dhcpcd/vxd)"
logread 2>/dev/null | grep -i -E 'wpa_supplicant|wlan0-vxd|dhcpcd|Station|STA ' | grep -v -i 'preaseKey' | tail -20
