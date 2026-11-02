#!/bin/sh
# Verifica in sola lettura di beacon interval e DTIM sul DWR-932 F1 (driver Realtek RTL8192ES).
# Da eseguire come root sul device: adb push dwr_beacon_probe.sh /cache/ && adb shell sh /cache/dwr_beacon_probe.sh
# Non modifica nulla.

D=/var/rtl8192c/wlan0

echo "##### identita"
uptime
grep -E '<WlanMode>' /bmdefsys/etc/mobileap_cfg.xml

echo "##### persistenza di /var/rtl8192c"
mount | grep -E ' / | /var| /bmdefsys'
ls -ld /var /var/rtl8192c "$D"
readlink -f /var/rtl8192c 2>/dev/null
df /var/rtl8192c 2>/dev/null | tail -1

echo "##### file di configurazione"
for f in beacon_interval dtim_period channel channel_bonding coexist_enabled wlan_disabled; do
	printf '%s=' "$f"; cat "$D/$f" 2>/dev/null || echo '-'
done
ls -l "$D/beacon_interval" "$D/dtim_period"

echo "##### MIB del driver"
for i in wlan0 wlan0-vxd; do
	ifconfig "$i" >/dev/null 2>&1 || { echo "$i assente"; continue; }
	echo "$i flags: $(ifconfig "$i" | head -1)"
	iwpriv "$i" get_mib bcnint 2>&1
	iwpriv "$i" get_mib dtimperiod 2>&1
done

echo "##### registro hardware BCN_INTERVAL (0x554, 2 byte)"
iwpriv wlan0 read_reg w,554 2>&1 || iwpriv wlan0 read_reg 554 2>&1

echo "##### /proc del driver"
ls /proc/wlan0 2>/dev/null | tr '\n' ' '
echo
grep -i -h -E 'beacon|dtim' /proc/wlan0/mib_staconfig /proc/wlan0/mib_all 2>/dev/null | head -10

echo "##### processi Wi-Fi"
ps | grep -E 'wpa_supplicant|hostapd|webs|init.sh' | grep -v grep
