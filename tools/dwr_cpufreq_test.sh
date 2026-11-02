#!/bin/sh
# Collaudo on-device del controllo della CPU: sezione e POST action=cpu di custom.cgi (autenticazione Basic con file
# utenti di prova, CSRF, validazione), effetto su governor e limiti in sysfs, custom_cpufreq.sh applica con
# configurazioni valide e corrotte, comando "pe" usato da pe_service modificato.
# Alla fine ripristina bm_custom.conf, /tmp/custom_cpufreq.pe e riapplica la configurazione di partenza.
# Uso sul device: sh /cache/dwr_cpufreq_test.sh

CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
CF=/bmdefsys/usr/bin/custom_cpufreq.sh
CONF=/bmdefsys/etc/bm_custom.conf
C=/sys/devices/system/cpu/cpu0/cpufreq
PE_REQ=/tmp/custom_cpufreq.pe
TU=/tmp/cftest.users
PASS=0
FAIL=0

printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail
cp -p "$CONF" /tmp/cftest.conf.bak
[ -e "$PE_REQ" ] && cp -p "$PE_REQ" /tmp/cftest.pe.bak

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$1" REQUEST_METHOD=GET QUERY_STRING="$2" sh "$CGI" 2>&1 | tr -d '\r'; }
post() {
	printf '%s' "$1" | timeout -t 15 env CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE='application/x-www-form-urlencoded; charset=UTF-8' CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN="${2:-https://192.168.0.1}" sh "$CGI" 2>&1 | tr -d '\r' | head -3
}
loc() { post "$@" | sed -n 's/^Location: //p'; }
confval() { sed -n "s/^$1=//p" "$CONF" | head -1; }
stato() { echo "$(cat $C/scaling_governor) $(cat $C/scaling_min_freq) $(cat $C/scaling_max_freq)"; }
# Governor atteso con "auto": l'ultima richiesta di pe_service, che può arrivare anche durante il collaudo
atteso_auto() { g=$(cat $PE_REQ 2>/dev/null); case "$g" in performance|ondemand) echo "$g";; *) echo ondemand;; esac; }
# Toglie le chiavi cpu_* dal file e aggiunge le righe passate
mkconf() { grep -v '^cpu_' /tmp/cftest.conf.bak > "$CONF"; for r in "$@"; do echo "$r" >> "$CONF"; done; }

echo "stato iniziale: $(stato), cur $(cat $C/scaling_cur_freq), pe: $(cat $PE_REQ 2>/dev/null)"
echo "conf iniziale: $(grep '^cpu_' "$CONF" | tr '\n' ' ')"

echo "== pagina"
g=$(get "$AUTH" "")
echo "$g" | grep -q '<legend>CPU: governor e frequenze</legend>'; check "sezione CPU presente" $?
[ "$(echo "$g" | grep -c -E '<option value="(auto|performance|ondemand|conservative|powersave)"')" = 5 ]; check "5 governor nel menu" $?
[ "$(echo "$g" | grep -c -E '<option value="(300000|600000|748800|998400)"')" = 8 ]; check "4 frequenze in ciascuno dei 2 menu" $?
echo "$g" | grep -q '<option value="748800"[^>]*>748,8 MHz</option>'; check "frequenze scritte in MHz" $?
echo "$g" | grep -q 'Potenza TX Wi-Fi' && echo "$g" | grep -q 'Beacon e DTIM' && echo "$g" | grep -q 'Repeater Wi-Fi'; check "altre sezioni intatte" $?
echo "$g" | sed -n '/<legend>CPU/,/<\/fieldset>/p' | sed 's/<input type="hidden" name="csrf" value="[0-9a-f]*">/<csrf>/'
[ "$(get "" "" | head -1)" = "Status: 401 Unauthorized" ]; check "pagina senza credenziali -> 401" $?

TOK=$(cat /tmp/custom_cgi.csrf)
echo "== anti-CSRF"
[ "$(post "action=cpu&gov=powersave&fmin=300000&fmax=998400" | head -1)" = "Status: 403 Forbidden" ]; check "POST senza token -> 403" $?
[ "$(post "csrf=$TOK&action=cpu&gov=powersave&fmin=300000&fmax=998400" "https://altro.example" | head -1)" = "Status: 403 Forbidden" ]; check "POST con Origin estraneo -> 403" $?

echo "== validazione"
prima=$(md5sum "$CONF")
sprima=$(stato)
[ "$(loc "csrf=$TOK&action=cpu&gov=userspace&fmin=300000&fmax=998400")" = "custom.cgi?m=err_val" ]; check "governor userspace rifiutato" $?
[ "$(loc "csrf=$TOK&action=cpu&gov=x%3Bid&fmin=300000&fmax=998400")" = "custom.cgi?m=err_val" ]; check "governor con caratteri estranei rifiutato" $?
[ "$(loc "csrf=$TOK&action=cpu&gov=auto&fmin=400000&fmax=998400")" = "custom.cgi?m=err_val" ]; check "frequenza non supportata rifiutata" $?
[ "$(loc "csrf=$TOK&action=cpu&gov=auto&fmin=300000%3B&fmax=998400")" = "custom.cgi?m=err_val" ]; check "frequenza non numerica rifiutata" $?
[ "$(loc "csrf=$TOK&action=cpu&gov=auto&fmin=&fmax=998400")" = "custom.cgi?m=err_val" ]; check "frequenza vuota rifiutata" $?
[ "$(loc "csrf=$TOK&action=cpu&gov=auto&fmin=998400&fmax=300000")" = "custom.cgi?m=err_cpu" ]; check "minima sopra la massima rifiutata" $?
[ "$(md5sum "$CONF")" = "$prima" ]; check "bm_custom.conf invariato dopo i rifiuti" $?
[ "$(stato)" = "$sprima" ]; check "sysfs invariato dopo i rifiuti" $?
get "$AUTH" "m=err_cpu" | grep -q 'class="msg err">La frequenza minima'; check "messaggio err_cpu mostrato" $?

echo "== governor e limiti applicati"
[ "$(loc "csrf=$TOK&action=cpu&gov=performance&fmin=300000&fmax=998400")" = "custom.cgi?m=cpu_ok" ]; check "performance accettato" $?
[ "$(confval cpu_governor) $(confval cpu_min_freq) $(confval cpu_max_freq)" = "performance 300000 998400" ]; check "conf salvata" $?
[ "$(stato)" = "performance 300000 998400" ]; check "sysfs: performance 300000-998400" $?
[ "$(cat $C/scaling_cur_freq)" = 998400 ]; check "performance -> 998,4 MHz" $?
loc "csrf=$TOK&action=cpu&gov=performance&fmin=300000&fmax=600000" >/dev/null
[ "$(stato)" = "performance 300000 600000" ] && [ "$(cat $C/scaling_cur_freq)" = 600000 ]; check "performance con massima 600 MHz -> 600 MHz" $?
loc "csrf=$TOK&action=cpu&gov=powersave&fmin=748800&fmax=998400" >/dev/null
[ "$(stato)" = "powersave 748800 998400" ] && [ "$(cat $C/scaling_cur_freq)" = 748800 ]; check "powersave con minima 748,8 MHz -> 748,8 MHz" $?
loc "csrf=$TOK&action=cpu&gov=powersave&fmin=600000&fmax=600000" >/dev/null
[ "$(stato)" = "powersave 600000 600000" ] && [ "$(cat $C/scaling_cur_freq)" = 600000 ]; check "minima = massima = 600 MHz" $?
loc "csrf=$TOK&action=cpu&gov=conservative&fmin=300000&fmax=998400" >/dev/null
[ "$(stato)" = "conservative 300000 998400" ]; check "conservative 300000-998400" $?
loc "csrf=$TOK&action=cpu&gov=ondemand&fmin=300000&fmax=748800" >/dev/null
[ "$(stato)" = "ondemand 300000 748800" ]; check "ondemand con massima 748,8 MHz" $?
get "$AUTH" "m=cpu_ok" | grep -q '<option value="748800" selected>'; check "pagina: massima salvata selezionata" $?
get "$AUTH" "" | grep -q '<option value="ondemand" selected>'; check "pagina: governor salvato selezionato" $?
echo ondemand > $C/scaling_governor
echo performance > $C/scaling_governor
[ "$(stato)" = "performance 300000 748800" ]; check "il kernel conserva i limiti al cambio di governor" $?
sh "$CF" applica

echo "== pe (richieste di pe_service)"
loc "csrf=$TOK&action=cpu&gov=powersave&fmin=300000&fmax=998400" >/dev/null
sh "$CF" pe performance
[ "$(cat $C/scaling_governor)" = powersave ] && [ "$(cat $PE_REQ)" = performance ]; check "governor manuale: richiesta di pe_service registrata e ignorata" $?
loc "csrf=$TOK&action=cpu&gov=auto&fmin=300000&fmax=998400" >/dev/null
[ "$(cat $C/scaling_governor)" = "$(atteso_auto)" ]; check "ritorno ad auto: riprende l'ultima richiesta di pe_service" $?
sh "$CF" pe ondemand
[ "$(cat $C/scaling_governor)" = ondemand ] && [ "$(cat $PE_REQ)" = ondemand ]; check "auto: pe ondemand applicato" $?
sh "$CF" pe performance
[ "$(cat $C/scaling_governor)" = performance ]; check "auto: pe performance applicato" $?
sh "$CF" pe powersave; r=$?
[ "$r" = 1 ] && [ "$(cat $PE_REQ)" = performance ] && [ "$(cat $C/scaling_governor)" = performance ]; check "pe con governor non previsto rifiutato" $?
rm -f "$PE_REQ"
sh "$CF" applica
[ "$(cat $C/scaling_governor)" = ondemand ]; check "auto senza richieste di pe_service -> ondemand (come power_config)" $?

echo "== applica con configurazioni anomale"
echo 998400 > $C/scaling_max_freq; echo 998400 > $C/scaling_min_freq
mkconf cpu_governor=ondemand cpu_min_freq=300000 cpu_max_freq=600000
sh "$CF" applica
[ "$(stato)" = "ondemand 300000 600000" ]; check "da minima 998,4 MHz a massima 600 MHz senza errori" $?
mkconf cpu_governor=xyz cpu_min_freq=abc cpu_max_freq=123
sh "$CF" applica
[ "$(stato)" = "$(atteso_auto) 300000 998400" ]; check "valori corrotti -> auto e limiti hardware" $?
mkconf cpu_governor=powersave cpu_min_freq=998400 cpu_max_freq=300000
sh "$CF" applica
[ "$(stato)" = "powersave 300000 998400" ]; check "minima sopra la massima nel file -> limiti hardware" $?
get "$AUTH" "" | grep -q '<option value="300000" selected>'; check "pagina: con file anomalo mostra i limiti hardware" $?
mkconf
sh "$CF" applica
[ "$(stato)" = "$(atteso_auto) 300000 998400" ]; check "senza chiavi cpu_* -> auto, 300000-998400" $?
get "$AUTH" "" | grep -q '<option value="auto" selected>'; check "pagina: predefinito Automatico" $?
sh "$CF" boh >/dev/null 2>&1; [ $? = 1 ]; check "comando sconosciuto -> errore" $?

echo "== ripristino"
cp -p /tmp/cftest.conf.bak "$CONF"
rm -f "$PE_REQ"
[ -e /tmp/cftest.pe.bak ] && cp -p /tmp/cftest.pe.bak "$PE_REQ"
sh "$CF" applica
rm -f "$TU" /tmp/cftest.conf.bak /tmp/cftest.pe.bak /tmp/custom_cgi.fail
echo "stato finale: $(stato), pe: $(cat $PE_REQ 2>/dev/null)"
echo "conf finale: $(grep '^cpu_' "$CONF" | tr '\n' ' ')"

echo
echo "RISULTATO: $PASS OK, $FAIL FAIL"
