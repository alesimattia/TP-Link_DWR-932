#!/bin/sh
# Ripristina la modalità solo AP sul DWR-932 F1 dagli originali salvati da dwr_apsta_enable.sh (/cache/*.orig).
# wpa_supplicant.conf torna senza reti (eventuali reti aggiunte e la loro password vengono rimosse).
# Effettivo dopo il riavvio del device.

CFG=/bmdefsys/etc/mobileap_cfg.xml
SUPP=/bmdefsys/etc/wpa_supplicant.conf
VXD=/var/rtl8192c/wlan0-vxd

for f in mobileap_cfg.xml.orig wpa_supplicant.conf.orig vxd_wlan_mode.orig vxd_network_type.orig; do
	[ -e "/cache/$f" ] || { echo "manca /cache/$f: ripristino annullato"; exit 1; }
done
killall -15 wpa_cli wpa_supplicant dhcpcd 2>/dev/null
cp -p /cache/mobileap_cfg.xml.orig "$CFG"
cp -p /cache/wpa_supplicant.conf.orig "$SUPP"
cp -p /cache/vxd_wlan_mode.orig "$VXD/wlan_mode"
cp -p /cache/vxd_network_type.orig "$VXD/network_type"
sync

grep '<WlanMode>' "$CFG"
echo "wlan0-vxd wlan_mode=$(cat "$VXD/wlan_mode") network_type=$(cat "$VXD/network_type")"
echo "reti in wpa_supplicant.conf: $(grep -c 'network=' "$SUPP")"
