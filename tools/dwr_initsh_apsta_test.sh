#!/bin/sh
# Verifica se la ricarica Wi-Fi nativa (init.sh, la stessa lanciata da qcmap_fcgi al salvataggio del Wi-Fi)
# lascia funzionante il collegamento a monte del repeater (wlan0-vxd) in modalità AP-STA.
# Da eseguire come root sul device: sh /cache/dwr_initsh_apsta_test.sh
# Non modifica file: init.sh riapplica i valori già presenti in /var/rtl8192c.
# ESITO (2026-11-02): in AP-STA init.sh lascia wlan0-vxd "COMPLETED" per wpa_supplicant ma senza traffico finché
# il device non viene riavviato, quindi i client restano senza internet. Non rilanciarlo con il repeater in uso.

W="wpa_cli -i wlan0-vxd -p /var/run/wpa_supplicant"

stato() {
	echo "--- $1 (uptime $(cut -d' ' -f1 /proc/uptime) s)"
	for i in wlan0 wlan0-vxd; do
		printf '%s: ' "$i"; ifconfig "$i" 2>/dev/null | grep -o -E 'UP|RUNNING' | tr '\n' ' '; echo
	done
	$W status 2>&1 | grep -E '^(wpa_state|ip_address|key_mgmt)='
	brctl show bridge0 2>/dev/null | tr -s ' \t' ' ' | tr '\n' ' '; echo
	ip route | grep default
	iwpriv wlan0 get_mib bcnint
	printf 'BCN_INTERVAL b,554 '; iwpriv wlan0 read_reg b,554
	if ping -c 2 -W 3 8.8.8.8 >/dev/null 2>&1; then echo "internet: OK"; else echo "internet: NO"; fi
}

stato prima
T0=$(cut -d. -f1 /proc/uptime)
/bmdefsys/usr/bin/rtltools/script/init.sh > /cache/initsh_test.log 2>&1
echo "init.sh uscito con $? in $(( $(cut -d. -f1 /proc/uptime) - T0 )) s; log in /cache/initsh_test.log ($(wc -l < /cache/initsh_test.log) righe)"
stato "subito dopo"
sleep 15
stato "dopo 15 s"
sleep 30
stato "dopo 45 s"
