#!/bin/sh
# Collaudo on-device della sezione "Beacon e DTIM" di custom.cgi, con lo stesso file utenti di prova di dwr_cgitest.sh
# (admin + password fittizia salvata come md5; il CGI lo accetta solo da shell, mai sotto lighttpd).
# Uso sul device:
#   sh dwr_beacon_cgitest.sh                  test senza modifiche: pagina, valori correnti, input rifiutati
#   sh dwr_beacon_cgitest.sh applica B D      POST valido con beacon B e DTIM D: scrive i file e RIAVVIA il device
#   sh dwr_beacon_cgitest.sh verifica B D     dopo il riavvio: file, MIB, registro radio e repeater

CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
WL0=/var/rtl8192c/wlan0
TU=/tmp/cgitest.users
PASS=0
FAIL=0

printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET QUERY_STRING="$1" sh "$CGI" 2>&1; }
post() {
	printf '%s' "$1" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN=https://192.168.0.1 sh "$CGI" 2>&1 | tr -d '\r'
}
loc() { post "$@" | sed -n 's/^Location: //p'; }
# Valore a 16 bit da read_reg w,: byte in decimale, dal più significativo
reg_bcn() { iwpriv wlan0 read_reg w,554 | sed -n 's/.*read_reg://p' | awk '{ print $1 * 256 + $2 }'; }
# Valore da get_mib: byte in decimale, dal meno significativo
mib() { iwpriv wlan0 get_mib "$1" | sed -n 's/.*get_mib://p' | awk '{ print $1 + 256 * $2 }'; }

g=$(get "")
TOK=$(cat /tmp/custom_cgi.csrf)
B0=$(cat "$WL0/beacon_interval")
D0=$(cat "$WL0/dtim_period")

case "$1" in
applica)
	echo "== POST beacon=$2 dtim=$3 (il device si riavvia)"
	r=$(post "csrf=$TOK&action=beacon&bcn=$2&dtim=$3")
	echo "$r" | grep -q '<h1>Beacon e DTIM salvati</h1>'; check "pagina di riavvio" $?
	[ "$(cat "$WL0/beacon_interval")" = "$2" ]; check "file beacon_interval=$2" $?
	[ "$(cat "$WL0/dtim_period")" = "$3" ]; check "file dtim_period=$3" $?
	echo "superati $PASS, falliti $FAIL"
	exit 0
	;;
verifica)
	echo "== dopo il riavvio (uptime $(cut -d' ' -f1 /proc/uptime) s)"
	[ "$B0" = "$2" ] && [ "$D0" = "$3" ]; check "file persistenti: $B0/$D0" $?
	b=$(mib bcnint); d=$(mib dtimperiod); rb=$(reg_bcn)
	[ "$b" = "$2" ]; check "MIB bcnint=$b" $?
	[ "$d" = "$3" ]; check "MIB dtimperiod=$d" $?
	[ "$rb" = "$2" ]; check "registro radio BCN_INTERVAL=$rb" $?
	echo "$g" | grep -q "In uso: beacon=$2 TU (radio), DTIM=$3 (driver)"; check "la pagina mostra i valori in uso" $?
	echo "$g" | grep -q "<option value=\"$2\" selected>"; check "beacon selezionato nella pagina" $?
	echo "$g" | grep -q "<option value=\"$3\" selected>$3"; check "DTIM selezionato nella pagina" $?
	if grep -q '<WlanMode>AP-STA</WlanMode>' /bmdefsys/etc/mobileap_cfg.xml; then
		a=$(sed -n 's/.*active: \([0-9]*\).*/\1/p' /proc/wlan0-vxd/sta_info)
		[ "$a" = 1 ]; check "repeater associato nel driver (attivi=$a)" $?
		wget -q -O - http://www.msftconnecttest.com/connecttest.txt 2>/dev/null | grep -q 'Microsoft Connect Test'; check "internet tramite il repeater" $?
	fi
	echo "superati $PASS, falliti $FAIL"
	exit 0
	;;
esac

echo "== pagina (valori salvati $B0/$D0)"
echo "$g" | grep -q '<legend>Beacon e DTIM</legend>'; check "sezione presente" $?
echo "$g" | grep -q 'name="action" value="beacon"'; check "form con azione beacon" $?
echo "$g" | grep -q "<option value=\"$B0\" selected>"; check "beacon salvato selezionato" $?
echo "$g" | grep -q "<option value=\"$D0\" selected>$D0"; check "DTIM salvato selezionato" $?
echo "$g" | grep -q "In uso: beacon=$(reg_bcn) TU (radio), DTIM=$(mib dtimperiod) (driver)"; check "valori in uso dal registro e dal driver" $?
echo "$g" | grep -q 'Potenza TX Wi-Fi'; check "sezione potenza ancora presente" $?

echo "== input rifiutati (nessun riavvio)"
for q in "bcn=250&dtim=1" "bcn=100&dtim=0" "bcn=100&dtim=6" "bcn=&dtim=1" "bcn=100" "bcn=1000&dtim=1" "bcn=100;reboot&dtim=1" "bcn=0100&dtim=1"; do
	[ "$(loc "csrf=$TOK&action=beacon&$q")" = "custom.cgi?m=err_val" ]; check "rifiutato: $q" $?
done
[ "$(post "action=beacon&bcn=200&dtim=3" | head -1)" = "Status: 403 Forbidden" ]; check "POST senza token -> 403" $?
[ "$(loc "csrf=$TOK&action=beacon&bcn=$B0&dtim=$D0")" = "custom.cgi?m=bcn_same" ]; check "valori invariati: nessun riavvio" $?
get "m=bcn_same" | grep -q 'già impostati su questi valori'; check "messaggio valori invariati" $?
[ "$(cat "$WL0/beacon_interval")/$(cat "$WL0/dtim_period")" = "$B0/$D0" ]; check "file non modificati" $?

echo "superati $PASS, falliti $FAIL"
