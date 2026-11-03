#!/bin/sh
# Collaudo on-device del blocco bande LTE di custom.cgi (?api=lteband e POST action=lteband).
# Invoca il CGI con le variabili CGI e un file utenti di prova (accettato solo da shell, mai sotto lighttpd), poi
# controlla con AT+BMBANDPREF letto direttamente su /dev/smd7 che cambi solo la maschera LTE. Alla fine rimette le
# tre maschere originali con il CGI e, se non coincidono, le riscrive direttamente con AT.
# Uso sul device: sh dwr_lteband_cgitest.sh [percorso del CGI, default /cache/custom.cgi.new]

CGI=${1:-/cache/custom.cgi.new}
TU=/tmp/ltetest.users
PASS=0
FAIL=0

printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
# Lettura diretta, indipendente dal CGI: stampa "gw,lte,tds"
at_bp() {
	rm -f /tmp/ltetest.at
	timeout -t 4 cat /dev/smd7 > /tmp/ltetest.at 2>/dev/null &
	sleep 1
	printf 'AT+BMBANDPREF?\r' > /dev/smd7
	sleep 2
	wait 2>/dev/null
	tr -d '\r ' < /tmp/ltetest.at | sed -n 's/^+BMBANDPREF://p' | head -n 1
	rm -f /tmp/ltetest.at
}
# Ripristino diretto: $1 = GSM/WCDMA, $2 = LTE come le legge at_bp (0x...). In scrittura il modem vuole l'esadecimale
# senza 0x; TD-SCDMA 0 = invariata.
at_scrivi() {
	timeout -t 4 cat /dev/smd7 > /dev/null 2>&1 &
	sleep 1
	printf 'AT+BMBANDPREF=%s,%s,0\r' "${1#0x}" "${2#0x}" > /dev/smd7
	sleep 2
	wait 2>/dev/null
}
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET QUERY_STRING="$1" sh "$CGI" 2>&1 | tr -d '\r'; }
post() {
	printf '%s' "$1" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN="${2:-https://192.168.0.1}" sh "$CGI" 2>&1 | tr -d '\r' | head -3
}
loc() { post "$@" | sed -n 's/^Location: //p'; }
json() { get "api=lteband" | sed -n '/^{/p'; }

ORIG=$(at_bp)
echo "maschere originali (GSM/WCDMA, LTE, TD-SCDMA): $ORIG"
case "$ORIG" in 0x*,0x*,0x*) ;; *) echo "lettura AT non valida: collaudo interrotto"; exit 1;; esac
GW=${ORIG%%,*}; TDS=${ORIG##*,}

echo "== autenticazione e lettura"
r=$(REQUEST_METHOD=GET QUERY_STRING=api=lteband CUSTOM_CGI_USERS="$TU" sh "$CGI" | head -1 | tr -d '\r')
[ "$r" = "Status: 401 Unauthorized" ]; check "api=lteband senza credenziali -> 401" $?
get "api=lteband" | grep -q '^Content-Type: application/json'; check "api=lteband autenticato -> JSON" $?
j=$(json)
echo "  $j"
echo "$j" | grep -q '"ok":1,"cap":\[1,3,7,8,20,38,40\]'; check "bande supportate B1 B3 B7 B8 B20 B38 B40" $?
echo "$j" | grep -q '"lte":\[1,3,7,8,20,38,40\]'; check "bande abilitate = maschera LTE del modem (0xA0000800C5)" $?
TOK=$(cat /tmp/custom_cgi.csrf)
echo "$j" | grep -q "\"csrf\":\"$TOK\""; check "JSON con token anti-CSRF" $?

echo "== anti-CSRF"
[ "$(post "action=lteband&bands=3" | head -1)" = "Status: 403 Forbidden" ]; check "POST senza token -> 403" $?
[ "$(post "csrf=$TOK&action=lteband&bands=3" "https://altro.example" | head -1)" = "Status: 403 Forbidden" ]; check "POST con Origin estraneo -> 403" $?

echo "== validazione"
for b in "" "0" "2" "3%2C2" "03" "65" "99" "3;7" "3%2C" "%2C3" "3%2C7%2C" "1%2C3%2C7%2C8%2C20%2C38%2C40%2C41"; do
	[ "$(loc "csrf=$TOK&action=lteband&bands=$b")" = "custom.cgi?api=lteband&m=err_val" ]; check "bands='$b' rifiutato" $?
done
[ "$(at_bp)" = "$ORIG" ]; check "nessuna modifica dopo gli input rifiutati" $?
[ "$(loc "csrf=$TOK&action=lteband&bands=1%2C3%2C7%2C8%2C20%2C38%2C40")" = "custom.cgi?api=lteband&m=lte_same" ]; check "stesse bande -> lte_same" $?

echo "== blocco su B3 + B7"
[ "$(loc "csrf=$TOK&action=lteband&bands=3%2C7")" = "custom.cgi?api=lteband&m=lte_ok" ]; check "bands=3,7 -> lte_ok" $?
d=$(at_bp)
echo "  dopo: $d"
[ "$d" = "$GW,0x44,$TDS" ]; check "modem: LTE 0x44, GSM/WCDMA e TD-SCDMA invariati" $?
json | grep -q '"lte":\[3,7\]'; check "api=lteband mostra B3, B7" $?
logread 2>/dev/null | grep 'custom.cgi' | tail -1 | grep -q 'bande LTE impostate: 3,7'; check "syslog registra la modifica" $?

echo "== ripristino di tutte le bande"
[ "$(loc "csrf=$TOK&action=lteband&bands=1%2C3%2C7%2C8%2C20%2C38%2C40")" = "custom.cgi?api=lteband&m=lte_ok" ]; check "tutte le bande -> lte_ok" $?
d=$(at_bp)
[ "$d" = "$ORIG" ]; check "maschere identiche all'originale ($d)" $?
if [ "$d" != "$ORIG" ]; then
	l=${ORIG#*,}
	at_scrivi "$GW" "${l%%,*}"
	echo "ripristino diretto con AT: $(at_bp)"
fi

rm -f "$TU" /tmp/custom_cgi.fail
echo
echo "esito: $PASS OK, $FAIL FAIL"
