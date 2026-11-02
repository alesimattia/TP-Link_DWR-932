#!/bin/sh
# Collaudo on-device del riavvio programmato: API JSON e POST di custom.cgi (autenticazione Basic con file utenti
# di prova, CSRF, validazione), crontab di root e processo crond, controlli di custom_autoreboot.sh esegui in
# dry-run (AUTOREBOOT_PROVA=1, non riavvia mai). Gli orari salvati sono a 12 ore da adesso, così crond non scatta.
# Alla fine ripristina bm_custom.conf e il crontab di root com'erano.
# Uso sul device: sh /cache/dwr_autoreboot_test.sh

CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
AR=/bmdefsys/usr/bin/custom_autoreboot.sh
CONF=/bmdefsys/etc/bm_custom.conf
LAST=/cache/custom_autoreboot.last
TU=/tmp/artest.users
TC=/tmp/artest.conf
PASS=0
FAIL=0

printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail
cp -p "$CONF" /tmp/artest.conf.bak
crontab -l > /tmp/artest.cron.bak 2>/dev/null
[ -e "$LAST" ] && cp -p "$LAST" /tmp/artest.last.bak

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
# $1 = header Authorization (vuoto = assente), $2 = query string
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$1" REQUEST_METHOD=GET QUERY_STRING="$2" sh "$CGI" 2>&1 | tr -d '\r'; }
# $1 = corpo, $2 = Origin; timeout: una POST bloccata sul flock fallisce invece di restare appesa
post() {
	printf '%s' "$1" | timeout -t 15 env CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE='application/x-www-form-urlencoded; charset=UTF-8' CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN="${2:-https://192.168.0.1}" sh "$CGI" 2>&1 | tr -d '\r' | head -3
}
loc() { post "$@" | sed -n 's/^Location: //p'; }
corpo() { get "$AUTH" "api=autoreboot$1" | sed '1,/^$/d'; }
confval() { sed -n "s/^$1=//p" "$CONF" | head -1; }
mkconf() { printf 'autoreboot_enable=%s\nautoreboot_time=%s\nautoreboot_days=%s\n' "$1" "$2" "$3" > "$TC"; }
prova() { AUTOREBOOT_PROVA=1 AUTOREBOOT_CONF="$TC" AUTOREBOOT_UPTIME="${1:-3600}" sh "$AR" esegui; }

echo "== API e autenticazione"
[ "$(get "" "api=autoreboot" | head -1)" = "Status: 401 Unauthorized" ]; check "API senza credenziali -> 401" $?
[ "$(get "$AUTH" "api=autoreboot" | head -1)" = "Content-Type: application/json; charset=utf-8" ]; check "API autenticata -> JSON" $?
j=$(corpo "")
echo "     $j" | sed 's/"csrf":"[0-9a-f]*"/"csrf":"…"/'
echo "$j" | grep -Eq '^\{"enable":[01],"time":"([01][0-9]|2[0-3]):[0-5][0-9]","days":"[0-6](,[0-6]){0,6}","now":"[0-9]{2}/[0-9]{2}/[0-9]{4} [0-9]{2}:[0-9]{2}","utc_offset":"([+-][0-9]{4})?","clock_ok":[01],"csrf":"[0-9a-f]{32}","m":""\}$'
check "JSON nel formato atteso" $?
TOK=$(cat /tmp/custom_cgi.csrf)
echo "$j" | grep -q "\"csrf\":\"$TOK\""; check "JSON con il token anti-CSRF della pagina" $?
echo "$(corpo "&m=ar_ok&_=123")" | grep -q '"m":"ar_ok"'; check "codice esito riportato (anche con il parametro anti-cache di jQuery)" $?
echo "$(corpo "&m=%3Cx%3E")" | grep -q '"m":""'; check "codice esito non alfabetico scartato" $?

echo "== regressione della pagina custom.cgi (senza modifiche)"
g=$(get "$AUTH" "")
[ "$(echo "$g" | head -1)" = "Content-Type: text/html; charset=utf-8" ]; check "pagina HTML senza api" $?
echo "$g" | grep -q 'Potenza TX Wi-Fi' && echo "$g" | grep -q 'Repeater Wi-Fi'; check "pagina con le sezioni repeater e potenza" $?
[ "$(loc "csrf=$(cat /tmp/custom_cgi.csrf)&action=power&power=33")" = "custom.cgi?m=err_val" ]; check "POST potenza non valida -> redirect alla pagina" $?

echo "== anti-CSRF"
[ "$(post "action=autoreboot&enable=0&hour=04&minute=00&days=1" | head -1)" = "Status: 403 Forbidden" ]; check "POST senza token -> 403" $?
[ "$(post "csrf=deadbeef&action=autoreboot&enable=0&hour=04&minute=00&days=1" | head -1)" = "Status: 403 Forbidden" ]; check "POST con token errato -> 403" $?
[ "$(post "csrf=$TOK&action=autoreboot&enable=0&hour=04&minute=00&days=1" "https://altro.example" | head -1)" = "Status: 403 Forbidden" ]; check "POST con Origin estraneo -> 403" $?

echo "== validazione"
prima=$(md5sum "$CONF")
E="custom.cgi?api=autoreboot&m="
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=24&minute=00&days=1")" = "${E}err_val" ]; check "hour=24 rifiutata" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=04&minute=60&days=1")" = "${E}err_val" ]; check "minute=60 rifiutato" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=04&minute=5&days=1")" = "${E}err_val" ]; check "minute a una cifra rifiutato" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=2&hour=04&minute=00&days=1")" = "${E}err_val" ]; check "enable=2 rifiutato" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=04&minute=00&days=7")" = "${E}err_days" ]; check "giorno 7 rifiutato" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=04&minute=00&days=1%3B2")" = "${E}err_days" ]; check "separatore ; rifiutato" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=04&minute=00&days=")" = "${E}err_days" ]; check "attivazione senza giorni rifiutata" $?
[ "$(md5sum "$CONF")" = "$prima" ]; check "bm_custom.conf invariato dopo i rifiuti" $?

echo "== salvataggio, crontab e crond"
set -- $(TZ=$(cat /etc/TZ) date '+%H %M %w')
hh=$(( (${1#0} + 12) % 24 )); [ "$hh" -lt 10 ] && hh="0$hh"
{ crontab -l 2>/dev/null; echo "0 0 1 1 * /bin/true prova-artest"; } | crontab -
killall crond 2>/dev/null
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=$hh&minute=30&days=0%2C1%2C1")" = "${E}ar_ok" ]; check "attivazione alle $hh:30 accettata" $?
[ "$(confval autoreboot_enable)" = 1 ] && [ "$(confval autoreboot_time)" = "$hh:30" ]; check "conf: attivo alle $hh:30" $?
[ "$(confval autoreboot_days)" = "1,0" ]; check "giorni normalizzati: 0,1,1 -> 1,0" $?
corpo "" | grep -q "\"enable\":1,\"time\":\"$hh:30\",\"days\":\"1,0\""; check "API riporta i valori salvati" $?
crontab -l | grep -qx "30 $hh \* \* 1,0 $AR esegui"; check "riga di crontab corretta" $?
crontab -l | grep -q 'prova-artest'; check "riga estranea del crontab intatta" $?
pid=$(pidof crond)
[ -n "$pid" ]; check "crond avviato" $?
for p in $pid; do
	tr '\0' '\n' < /proc/$p/environ | grep -q '^HTTP_'; [ $? != 0 ]; check "crond $p senza variabili HTTP_ del CGI" $?
	ls -l /proc/$p/fd 2>/dev/null | grep -q 'custom_cgi.lock'; [ $? != 0 ]; check "crond $p senza il lock di custom.cgi" $?
	ls -l /proc/$p/fd 2>/dev/null | grep -q -E '/dev/pts|pipe:'; [ $? != 0 ]; check "crond $p senza terminale né pipe del chiamante" $?
	[ "$(tr '\0' ' ' < /proc/$p/cmdline)" = "crond " ]; check "crond $p senza argomenti" $?
done
[ "$(loc "csrf=$TOK&action=autoreboot&enable=1&hour=$hh&minute=31&days=1%2C0")" = "${E}ar_ok" ]; check "seconda POST subito dopo non bloccata" $?
crontab -l | grep -c -F "$AR" | grep -qx 1; check "una sola riga del riavvio programmato" $?
[ "$(loc "csrf=$TOK&action=autoreboot&enable=0&hour=$hh&minute=31&days=")" = "${E}ar_ok" ]; check "disattivazione accettata" $?
[ "$(confval autoreboot_enable)" = 0 ] && [ "$(confval autoreboot_days)" = "1,0" ]; check "conf: disattivo, giorni conservati" $?
crontab -l | grep -q -F "$AR"; [ $? != 0 ]; check "riga tolta dal crontab" $?
crontab -l | grep -q 'prova-artest'; check "riga estranea ancora intatta" $?

echo "== esegui (dry-run)"
set -- $(TZ=$(cat /etc/TZ) date '+%H %M %w %Y-%m-%d')
ora="$1:$2"
g=$3
oggi=$4
altro=$(( (g + 1) % 7 ))
t=$(( (${1#0} * 60 + ${2#0} - 10 + 1440) % 1440 ))
tardi=$(printf '%02d:%02d' $((t / 60)) $((t % 60)))
rm -f "$LAST"
mkconf 1 "$ora" "$g"
prova | grep -q 'verrebbe riavviato'; check "accetta: attivo, giorno e orario di adesso" $?
mkconf 0 "$ora" "$g"
prova | grep -q 'funzione disattivata'; check "rifiuta: funzione disattivata" $?
mkconf 1 "25:00" "$g"
prova | grep -q 'funzione disattivata'; check "rifiuta: orario non valido nel file (trattato come disattivato)" $?
mkconf 1 "$ora" "$altro"
prova | grep -q 'giorno non previsto'; check "rifiuta: giorno non previsto" $?
mkconf 1 "$tardi" "$g"
prova | grep -q 'in ritardo'; check "rifiuta: 10 minuti di ritardo" $?
mkconf 1 "$ora" "$g"
prova 120 | grep -q 'meno di 10 minuti'; check "rifiuta: uptime di 2 minuti" $?
echo "$oggi $ora" > "$LAST"
prova | grep -q 'già eseguito oggi'; check "rifiuta: riavvio dello stesso orario già fatto oggi" $?
echo "$oggi $tardi" > "$LAST"
prova | grep -q 'verrebbe riavviato'; check "accetta: oggi riavvio già fatto ma a un altro orario" $?
rm -f "$LAST"
: > /cache/upgrade.zip
prova | grep -q 'aggiornamento firmware in corso'; check "rifiuta: /cache/upgrade.zip presente" $?
rm -f /cache/upgrade.zip
prova | grep -q 'verrebbe riavviato'; check "accetta di nuovo dopo i rifiuti" $?

echo "== ripristino"
cp -p /tmp/artest.conf.bak "$CONF"
crontab /tmp/artest.cron.bak
[ -e /tmp/artest.last.bak ] && cp -p /tmp/artest.last.bak "$LAST"
sh "$AR" applica
rm -f "$TU" "$TC" /tmp/artest.conf.bak /tmp/artest.cron.bak /tmp/artest.last.bak /tmp/custom_cgi.fail
crontab -l 2>/dev/null | grep -q 'prova-artest'; [ $? != 0 ]; check "crontab ripristinato" $?
echo "crontab attuale:"; crontab -l 2>/dev/null
echo "conf attuale:"; grep '^autoreboot_' "$CONF"

echo
echo "RISULTATO: $PASS OK, $FAIL FAIL"
