#!/bin/sh
# Collaudo on-device di custom.cgi (repeater, potenza TX) e della sua autenticazione HTTP Basic.
# 1) Invoca il CGI direttamente con le variabili CGI e un file utenti di prova (admin + password fittizia, salvata
#    come md5 come fa la web UI): il CGI lo accetta solo da shell, mai sotto lighttpd (GATEWAY_INTERFACE).
# 2) Verifica via HTTPS su loopback la richiesta di credenziali, il pulsante nella home e la web UI originale.
# Le reti di prova TEST-CGI* vengono rimosse alla fine. Richiede il repeater attivo e connesso.
# Uso sul device: sh dwr_cgitest.sh

CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
SUPP=/bmdefsys/etc/wpa_supplicant.conf
WPA="wpa_cli -i wlan0-vxd"
TAB=$(printf '\t')
TU=/tmp/cgitest.users
PASS=0
FAIL=0

printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
hex() { printf '%s' "$1" | od -An -tx1 | tr -d ' \n'; }
# $1 = header Authorization (vuoto = assente)
stato_get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$1" REQUEST_METHOD=GET sh "$CGI" 2>&1 | head -1 | tr -d '\r'; }
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET QUERY_STRING="$1" sh "$CGI" 2>&1; }
post() {
	printf '%s' "$1" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN="${2:-https://192.168.0.1}" sh "$CGI" 2>&1 | tr -d '\r' | head -3
}
loc() { post "$@" | sed -n 's/^Location: //p'; }
idof() { $WPA list_networks | awk -F"$TAB" -v s="$1" 'NR > 1 && $2 == s { print $1 }'; }
connesso() { $WPA status | grep -q '^wpa_state=COMPLETED'; }

echo "== autenticazione Basic"
[ "$(stato_get "")" = "Status: 401 Unauthorized" ]; check "senza credenziali -> 401" $?
CUSTOM_CGI_USERS="$TU" REQUEST_METHOD=GET sh "$CGI" | grep -q '^WWW-Authenticate: Basic realm='; check "401 con richiesta di credenziali Basic" $?
[ "$(stato_get "Basic $(printf 'admin:sbagliata' | base64)")" = "Status: 401 Unauthorized" ]; check "password errata -> 401" $?
[ "$(stato_get "Basic $(printf 'root:password-di-prova' | base64)")" = "Status: 401 Unauthorized" ]; check "utente errato -> 401" $?
[ "$(stato_get "Basic !!nonbase64!!")" = "Status: 401 Unauthorized" ]; check "header malformato -> 401" $?
[ "$(stato_get "$AUTH")" = "Content-Type: text/html; charset=utf-8" ]; check "credenziali corrette -> pagina" $?
[ ! -e /tmp/custom_cgi.fail ]; check "contatore tentativi azzerato dopo l'accesso" $?
r=$(printf '' | GATEWAY_INTERFACE=CGI/1.1 CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET sh "$CGI" | head -1 | tr -d '\r')
[ "$r" = "Status: 401 Unauthorized" ]; check "file utenti di prova ignorato sotto lighttpd -> 401" $?
rm -f /tmp/custom_cgi.fail
for i in 1 2 3 4 5; do stato_get "Basic $(printf 'admin:sbagliata' | base64)" >/dev/null; done
[ "$(stato_get "$AUTH")" = "Status: 429 Too Many Requests" ]; check "blocco dopo 5 tentativi errati (429 anche con password giusta)" $?
rm -f /tmp/custom_cgi.fail
[ "$(stato_get "$AUTH")" = "Content-Type: text/html; charset=utf-8" ]; check "accesso di nuovo possibile a blocco scaduto" $?

echo "== anti-CSRF"
g=$(get "")
TOK=$(cat /tmp/custom_cgi.csrf)
echo "$g" | grep -q 'Repeater Wi-Fi'; check "GET autenticato mostra la sezione repeater" $?
echo "$g" | grep -q "name=\"csrf\" value=\"$TOK\""; check "form con token anti-CSRF" $?
[ "$(post "action=power&power=100" | head -1)" = "Status: 403 Forbidden" ]; check "POST senza token -> 403" $?
[ "$(post "csrf=deadbeef&action=power&power=100" | head -1)" = "Status: 403 Forbidden" ]; check "POST con token errato -> 403" $?
[ "$(post "csrf=$TOK&action=power&power=100" "https://altro.example" | head -1)" = "Status: 403 Forbidden" ]; check "POST con Origin estraneo -> 403" $?

echo "== potenza TX"
[ "$(loc "csrf=$TOK&action=power&power=100")" = "custom.cgi?m=power_ok" ]; check "power=100 applicata" $?
[ "$(loc "csrf=$TOK&action=power&power=33")" = "custom.cgi?m=err_val" ]; check "power=33 rifiutata" $?

echo "== validazione input"
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=zz&psk_hex=")" = "custom.cgi?m=err_ssid" ]; check "SSID non esadecimale rifiutato" $?
lungo=$(hex "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$lungo&psk_hex=")" = "custom.cgi?m=err_ssid" ]; check "SSID di 33 byte rifiutato" $?
s=$(hex "TEST-CGI-X")
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$s&psk_hex=$(hex abcd)")" = "custom.cgi?m=err_psk" ]; check "password di 4 caratteri rifiutata" $?
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$s&psk_hex=616263646566677f")" = "custom.cgi?m=err_psk" ]; check "password con byte 0x7f rifiutata" $?
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$s&psk_hex=61626364656667680a")" = "custom.cgi?m=err_psk" ]; check "password con a capo rifiutata" $?
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$s&psk_hex=6162636465666768a")" = "custom.cgi?m=err_psk" ]; check "esadecimale di lunghezza dispari rifiutato" $?
[ "$(loc "csrf=$TOK&action=boh")" = "custom.cgi?m=err_val" ]; check "azione sconosciuta rifiutata" $?
[ "$(loc "csrf=$TOK&action=sta_del&id=1x")" = "custom.cgi?m=err_val" ]; check "id non numerico rifiutato" $?
[ "$(loc "csrf=$TOK&action=sta_del&id=99")" = "custom.cgi?m=err_val" ]; check "id inesistente rifiutato" $?
[ -z "$(idof TEST-CGI-X)" ]; check "nessuna rete creata dagli input rifiutati" $?

echo "== aggiunta reti a caldo"
connesso; check "STA connessa prima delle aggiunte" $?
n0=$($WPA list_networks | awk 'NR > 1' | wc -l)
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$(hex TEST-CGI)&psk_hex=")" = "custom.cgi?m=sta_reserve" ]; check "rete aperta salvata come riserva" $?
connesso; check "connessione attuale non interrotta dall'aggiunta" $?
id1=$(idof TEST-CGI)
[ -n "$id1" ]; check "TEST-CGI in list_networks (id $id1)" $?
[ "$($WPA get_network "$id1" key_mgmt)" = "NONE" ]; check "TEST-CGI key_mgmt=NONE" $?
grep -q 'ssid="TEST-CGI"' "$SUPP"; check "TEST-CGI salvata nel file" $?
pw='segreto di prova "%\'
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$(hex TEST-CGI-WPA)&psk_hex=$(hex "$pw")")" = "custom.cgi?m=sta_reserve" ]; check "rete WPA salvata come riserva" $?
id2=$(idof TEST-CGI-WPA)
[ "$($WPA get_network "$id2" key_mgmt)" = "WPA-PSK" ]; check "TEST-CGI-WPA key_mgmt=WPA-PSK" $?
grep -qF "psk=\"$pw\"" "$SUPP"; check "password con spazi, virgolette, % e \\ scritta esattamente" $?
xss='<b>"x&y'"'"
[ "$(loc "csrf=$TOK&action=sta_add&ssid_hex=$(hex "$xss")&psk_hex=")" = "custom.cgi?m=sta_reserve" ]; check "rete con SSID ostile salvata" $?
g=$(get "")
echo "$g" | grep -q '&lt;b&gt;\\&quot;x&amp;y&#39;'; check "SSID ostile mostrato con escape HTML" $?
echo "$g" | grep -q '<b>\\"x'; [ $? = 1 ]; check "nessun tag dall'SSID nella pagina" $?
echo "$g" | grep -q 'data-wpa="TEST-CGI-WPA"'; check "reti salvate elencate" $?

echo "== eliminazione reti di prova"
for n in TEST-CGI-WPA TEST-CGI; do
	i=$(idof "$n")
	[ "$(loc "csrf=$TOK&action=sta_del&id=$i")" = "custom.cgi?m=sta_deleted" ]; check "eliminata $n" $?
done
i=$($WPA list_networks | awk -F"$TAB" 'NR > 1 && $2 ~ /^<b>/ { print $1 }')
[ "$(loc "csrf=$TOK&action=sta_del&id=$i")" = "custom.cgi?m=sta_deleted" ]; check "eliminata rete con SSID ostile" $?
[ "$($WPA list_networks | awk 'NR > 1' | wc -l)" = "$n0" ]; check "numero di reti tornato a $n0" $?
grep -q 'TEST-CGI' "$SUPP"; [ $? = 1 ]; check "nessuna rete di prova nel file" $?
connesso; check "connessione a monte ancora attiva" $?

echo "== Connetti (priorità alla rete scelta)"
idh=$(idof H3140)
[ "$(loc "csrf=$TOK&action=sta_sel&id=$idh")" = "custom.cgi?m=sta_selected" ]; check "Connetti su H3140" $?
i=0
while ! connesso && [ $i -lt 20 ]; do sleep 2; i=$((i + 1)); done
connesso; check "di nuovo connessa a H3140 dopo Connetti" $?
[ "$($WPA get_network "$idh" priority)" = "10" ]; check "H3140 priority=10" $?

echo "== ricerca reti"
g=$(get "scan=1")
echo "$g" | grep -q 'Reti disponibili'; check "sezione reti disponibili" $?
echo "$g" | grep -q 'data-use="H3140"'; check "H3140 trovata con pulsante Usa" $?

echo "== lighttpd: HTTPS su loopback"
cmp -s /bmdefsys/etc/lighttpd.conf /cache/lighttpd.conf.orig; check "lighttpd.conf identico all'originale" $?
iptables -I INPUT -i lo -j ACCEPT
richiesta() {
	{
		printf 'GET %s HTTP/1.0\r\nHost: 192.168.0.1\r\n' "$1"
		[ -n "$2" ] && printf 'Authorization: Basic %s\r\n' "$2"
		printf '\r\n'
	} | timeout -t 10 openssl s_client -quiet -connect 127.0.0.1:443 2>/dev/null | tr -d '\r'
}
r=$(richiesta /cgi-bin/custom.cgi)
[ "$(echo "$r" | head -1 | cut -d' ' -f2)" = 401 ]; check "custom.cgi senza credenziali -> 401" $?
echo "$r" | grep -q '^WWW-Authenticate: Basic realm="DWR-932'; check "il browser riceve la richiesta di login" $?
echo "$r" | grep -q 'usa utente e password della web UI'; check "401 prodotto da custom.cgi, non da lighttpd" $?
r=$(richiesta /cgi-bin/custom.cgi "$(printf 'admin:password-sbagliata' | base64)")
[ "$(echo "$r" | head -1 | cut -d' ' -f2)" = 401 ]; check "custom.cgi con password errata -> 401" $?
rm -f /tmp/custom_cgi.fail
# Web UI originale: "/" è la pagina di login (200); senza sessione qcmap_fcgi rimanda le altre pagine alla home (302)
c=$(richiesta / | head -1 | cut -d' ' -f2)
[ "$c" = 200 ]; check "web UI originale / -> $c" $?
iptables -D INPUT -i lo -j ACCEPT
grep -q "window.location.href='/cgi-bin/custom.cgi'" /bmdefsys/WEBSERVER/webpages/controlPanel.html; check "pulsante Repeater Wi-Fi nella home" $?
[ "$(grep -c 'class="cpSetupWizard"' /bmdefsys/WEBSERVER/webpages/controlPanel.html)" = 2 ]; check "pulsante sotto Setup Wizard (2 blocchi cpSetupWizard)" $?

rm -f "$TU" /tmp/custom_cgi.fail
echo "RISULTATO: $PASS OK, $FAIL FAIL"
