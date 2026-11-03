#!/bin/sh
# Verifica dopo il deploy del riquadro "Bande LTE": file installati, risposta di custom.cgi?api=lteband attraverso
# lighttpd (HTTPS su loopback, senza credenziali: 401 prodotto dal CGI) e collaudo funzionale del CGI installato con
# dwr_lteband_cgitest.sh (che alla fine rimette le maschere originali).
# Per la richiesta su loopback aggiunge una regola iptables temporanea (INPUT -i lo ACCEPT), tolta subito dopo.
# Uso sul device: sh /cache/dwr_lteband_live.sh
WP=/bmdefsys/WEBSERVER/webpages
PASS=0
FAIL=0
check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}

echo "== file installati"
grep -q 'id="cst_lteBand"' $WP/internetPopup.html; check "internetPopup.html con il riquadro delle bande" $?
grep -q 'id="cnmodeinfoTemplate"' $WP/internetPopup.html; check "template stock della tab presente" $?
grep -q 'src="js/custom_lteband.js"' $WP/controlPanel.html; check "controlPanel.html carica custom_lteband.js" $?
[ "$(stat -c '%U:%G %a' $WP/js/custom_lteband.js)" = "www-data:www-data 770" ]; check "custom_lteband.js www-data 770" $?

echo "== lighttpd: HTTPS su loopback"
regole_prima=$(iptables -S INPUT | md5sum)
iptables -I INPUT -i lo -j ACCEPT
richiesta() {
	printf 'GET %s HTTP/1.0\r\nHost: 192.168.0.1\r\n\r\n' "$1" |
		timeout -t 10 openssl s_client -quiet -connect 127.0.0.1:443 2>/dev/null | tr -d '\r'
}
r=$(richiesta '/cgi-bin/custom.cgi?api=lteband')
[ "$(echo "$r" | head -1 | cut -d' ' -f2)" = 401 ]; check "api=lteband senza credenziali -> 401" $?
echo "$r" | grep -q '^WWW-Authenticate: Basic realm="DWR-932'; check "il browser riceve la richiesta di login" $?
echo "$r" | grep -q 'usa utente e password della web UI'; check "401 prodotto da custom.cgi, non da lighttpd" $?
c=$(richiesta / | head -1 | cut -d' ' -f2)
[ "$c" = 200 ]; check "web UI originale / -> $c" $?
iptables -D INPUT -i lo -j ACCEPT
[ "$(iptables -S INPUT | md5sum)" = "$regole_prima" ]; check "catena INPUT tornata com'era (regola temporanea rimossa)" $?
rm -f /tmp/custom_cgi.fail
echo "RISULTATO: $PASS OK, $FAIL FAIL"

echo
echo "== collaudo funzionale del CGI installato"
sh /cache/dwr_lteband_cgitest.sh $WP/cgi-bin/custom.cgi
