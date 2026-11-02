#!/bin/sh
# Diagnosi in sola lettura della connessione STA (wlan0-vxd) del DWR-932 F1: stato wpa_supplicant, rete configurata
# (senza chiavi), visibilità della rete a monte e messaggi del driver Realtek nel log del kernel.
# Uso sul device: sh dwr_sta_diag.sh ["regex SSID"]

FILTRO=${1:-H3140}
W="wpa_cli -i wlan0-vxd"

echo "##### wpa_supplicant"
$W status | grep -E '^(wpa_state|ssid|bssid|freq|id)='
$W list_networks
echo "key_mgmt=$($W get_network 0 key_mgmt) scan_ssid=$($W get_network 0 scan_ssid) disabled=$($W get_network 0 disabled)"
$W get_network 0 ssid
echo "psk impostata: $($W get_network 0 psk | grep -q '^\*' && echo si || echo no)"

echo "##### visibilita rete a monte"
$W scan >/dev/null
sleep 8
$W scan_results | grep -E "$FILTRO"

echo "##### interfacce"
iwconfig wlan0-vxd 2>&1 | head -3
iwconfig wlan0 2>&1 | grep -o 'Frequency:[0-9.]* GHz'

echo "##### kernel (driver Realtek / vxd)"
dmesg | grep -i -E 'cliW|acli|join|vxd|clnt|auth|assoc|deauth|wpas|4-way|EAPOL|repeater' | tail -40
