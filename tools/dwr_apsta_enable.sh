#!/bin/sh
# Attiva la modalità AP-STA (Wi-Fi come WAN) sul DWR-932 F1 con lo stesso effetto di qcmap_fcgi wifi_mode ap_mode=3:
# WlanMode AP-STA in mobileap_cfg.xml e wlan0-vxd in modalità client (wlan_mode=1, network_type=0).
# QCMAP legge la modalità all'avvio: diventa effettiva dopo il riavvio del device.
# Gli originali vanno in /cache/*.orig solo se non esistono già. Ripristino: dwr_apsta_disable.sh
# Da eseguire come root sul device: adb push dwr_apsta_enable.sh /cache/ && adb shell sh /cache/dwr_apsta_enable.sh

CFG=/bmdefsys/etc/mobileap_cfg.xml
SUPP=/bmdefsys/etc/wpa_supplicant.conf
VXD=/var/rtl8192c/wlan0-vxd

bk() { [ -e "$2" ] || cp -p "$1" "$2"; }
bk "$CFG" /cache/mobileap_cfg.xml.orig
bk "$SUPP" /cache/wpa_supplicant.conf.orig
bk "$VXD/wlan_mode" /cache/vxd_wlan_mode.orig
bk "$VXD/network_type" /cache/vxd_network_type.orig

sed -i 's|<WlanMode>[A-Z-]*</WlanMode>|<WlanMode>AP-STA</WlanMode>|' "$CFG"
echo 1 > "$VXD/wlan_mode"
echo 0 > "$VXD/network_type"
sync

grep '<WlanMode>' "$CFG"
echo "wlan0-vxd wlan_mode=$(cat "$VXD/wlan_mode") network_type=$(cat "$VXD/network_type")"
ls -la /cache/*.orig
