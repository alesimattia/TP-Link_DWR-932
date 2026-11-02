#!/bin/sh
# Sondaggio in sola lettura per progettare la pagina web "Repeater" del DWR-932 F1.
# Non stampa password: di lighttpd.user mostra solo i nomi utente e il numero di righe.

W=/bmdefsys/WEBSERVER/webpages
echo "##### lighttpd"
lighttpd -v 2>&1 | head -1
ps | grep -E '[l]ighttpd'
lighttpd -t -f /bmdefsys/etc/lighttpd.conf 2>&1 | head -3
echo "lighttpd.user: righe=$(wc -l < /bmdefsys/www/lighttpd.user) utenti=$(cut -d: -f1 /bmdefsys/www/lighttpd.user | tr '\n' ' ')"
ls -la /bmdefsys/www/

echo "##### cgi-bin ed ecne"
ls -la $W/cgi-bin $W/ecne 2>&1
sha256sum $W/cgi-bin/custom.cgi 2>/dev/null

echo "##### strumenti"
for b in openssl setsid nohup reboot md5sum sha256sum awk hexdump od xxd timeout flock; do
	printf '%s: %s\n' "$b" "$(which $b 2>/dev/null || echo -)"
done
echo "printf \\x: [$(printf '\x41\x7e\x22')]"
echo "printf %b: [$(printf '%b' '\x41\x25\x5c')]"
echo "awk %c: [$(awk 'BEGIN{printf "%c%c%c", 65, 37, 92}')]"
echo "dev urandom: $(head -c 8 /dev/urandom | od -An -tx1 | tr -d ' \n' | wc -c) caratteri hex"

echo "##### wpa_cli: formato di list_networks e scan_results"
wpa_cli -i wlan0-vxd list_networks
wpa_cli -i wlan0-vxd scan_results | head -1
echo "##### interfacce per il calcolo dell'uscita"
ip route | grep default
