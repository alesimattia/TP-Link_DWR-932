#!/bin/sh
# Verifica in sola lettura dei componenti AP-STA (repeater Wi-Fi come WAN) sul DWR-932 F1.
# Da eseguire come root sul device: adb push dwr_apsta_check.sh /cache/ && adb shell sh /cache/dwr_apsta_check.sh
# Non stampa chiavi o password: di wpa_supplicant.conf mostra solo le direttive globali e il numero di reti.

echo "##### identita"
id
uname -a
uptime

echo "##### binari (percorso + sha256)"
for b in QCMAP_ConnectionManager QCMAP_StaInterface qcmap_fcgi wpa_supplicant wpa_cli dhcpcd pimd ebtables iptables; do
	p=""
	for d in /bmdefsys/usr/bin /usr/bin /usr/sbin /sbin /bin; do
		[ -z "$p" ] && [ -f "$d/$b" ] && p="$d/$b"
	done
	if [ -n "$p" ]; then
		echo "$b: $p $(sha256sum "$p" | cut -d' ' -f1) $(wc -c < "$p")B"
	else
		echo "$b: -"
	fi
done
for l in /bmdefsys/usr/lib/libqcmap_cm.so.1 /usr/lib/libqcmap_cm.so.1; do
	[ -f "$l" ] && echo "libqcmap_cm: $l $(sha256sum "$l" | cut -d' ' -f1) $(wc -c < "$l")B"
done

echo "##### wpa_supplicant"
wpa_supplicant -v 2>&1 | head -2
wpa_supplicant -h 2>&1 | grep -i -A6 'drivers:'

echo "##### configurazione (solo chiavi rilevanti)"
grep -E 'WlanMode|STAModeConnType|SupplicantCfg|MobileAPEnableAtBootup|WLANEnableAtBootup|APIPAddr|Module' /bmdefsys/etc/mobileap_cfg.xml
grep -E '^(ctrl_interface|autoscan|update_config)' /bmdefsys/etc/wpa_supplicant.conf
echo "reti configurate in wpa_supplicant.conf: $(grep -c 'network=' /bmdefsys/etc/wpa_supplicant.conf)"
for k in wlan_mode network_type wlan_disabled channel channel_bonding; do
	echo "wlan0-vxd $k=$(cat /var/rtl8192c/wlan0-vxd/$k 2>/dev/null)  wlan0 $k=$(cat /var/rtl8192c/wlan0/$k 2>/dev/null)"
done

echo "##### stato runtime"
ps | grep -E 'wpa_|dhcpcd|QCMAP|pimd' | grep -v grep
ifconfig wlan0-vxd 2>&1 | head -2
iwconfig wlan0-vxd 2>&1 | head -2
/bmdefsys/usr/bin/rtltools/iwpriv wlan0-vxd get_mib opmode 2>&1
/bmdefsys/usr/bin/rtltools/iwpriv wlan0 get_mib opmode 2>&1

echo "##### firewall e route"
iptables -S INPUT 2>/dev/null || iptables -L INPUT -n -v
iptables -t nat -S POSTROUTING 2>/dev/null || iptables -t nat -L POSTROUTING -n
ip route
grep -E 'wlan|rmnet|bridge' /proc/net/dev

echo "##### syslog: occorrenze di valori stringa registrati da qcmap_fcgi (solo conteggio)"
logread 2>/dev/null | grep -c 'wifi_apsta_preaseKey'
