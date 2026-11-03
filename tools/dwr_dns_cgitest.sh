#!/bin/sh
# Collaudo on-device dei DNS personalizzati di custom.cgi (?api=dns e POST action=dns).
# Invoca il CGI con le variabili CGI e un file utenti di prova (accettato solo da shell, mai sotto lighttpd).
# Per vedere a quale server inoltra davvero dnsmasq avvia due DNS finti (dnsmasq con -C /dev/null) su due indirizzi
# aggiunti a lo: A = 10.53.53.53 risponde 10.9.8.7 e fa da "DNS della rete" in /var/run/resolv.conf, B = 10.53.53.54
# risponde 10.9.8.8 e fa da DNS personalizzato. Il dnsmasq di QCMAP non ascolta su lo (-I lo -z), quindi non c'è
# conflitto di porte; il firewall respinge solo il TCP in ingresso, l'UDP su lo passa.
# Il nslookup di busybox 1.23 ignora il server passato come argomento e interroga quelli di /etc/resolv.conf: per
# passare dal dnsmasq del router il collaudo scrive in resolv.conf "nameserver 192.168.0.1" seguito da A. dnsmasq
# scarta 192.168.0.1 come server a monte (è un suo indirizzo) e, con i DNS automatici, usa A.
# Alla fine rimette /etc/dnsmasq.conf e /var/run/resolv.conf originali, toglie gli indirizzi e i DNS finti e
# controlla che dnsmasq giri con la riga di comando originale.
# Uso sul device: sh dwr_dns_cgitest.sh [percorso del CGI, default /cache/custom.cgi.new]

CGI=${1:-/cache/custom.cgi.new}
TU=/tmp/dnstest.users
CONF=/etc/dnsmasq.conf
RES=/var/run/resolv.conf
SALVA=/tmp/dnstest
PASS=0
FAIL=0

printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET QUERY_STRING="$1" sh "$CGI" 2>&1 | tr -d '\r' 2>/dev/null; }
post() {
	printf '%s' "$1" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN="${2:-https://192.168.0.1}" sh "$CGI" 2>&1 | tr -d '\r' | head -3
}
loc() { post "$@" | sed -n 's/^Location: //p'; }
json() { get "api=dns" | sed -n '/^{/p'; }
pid() { pidof dnsmasq | tr ' ' '\n' | while read -r p; do grep -q -- '--dhcp-range' "/proc/$p/cmdline" 2>/dev/null && echo "$p"; done | head -n 1; }
riga() { tr '\0' ' ' < "/proc/$(pid)/cmdline"; }
# Indirizzo restituito per il nome $1 dai server di resolv.conf
risolvi() { timeout -t 6 nslookup "$1" 2>/dev/null | sed -n '/^Name:/,$s/^Address 1: \([0-9.]*\).*/\1/p' | head -n 1; }
# resolv.conf come dopo una connessione: prima il router (così il client passa da dnsmasq), poi il "DNS della rete" A
rete() { printf 'nameserver 192.168.0.1\nnameserver 10.53.53.53\n' > "$RES"; sleep 2; }
# Righe di syslog del dnsmasq principale (PID attuale)
log_dm() { logread 2>/dev/null | grep "dnsmasq\[$(pid)\]"; }
# Corpo di $CONF senza il blocco dei DNS personalizzati
senza_blocco() { sed '/^# custom_dns inizio$/,/^# custom_dns fine$/d' "$CONF" | md5sum | cut -d' ' -f1; }

echo "== stato iniziale"
mkdir -p "$SALVA"
cp -p "$CONF" "$SALVA/dnsmasq.conf"
cp -p "$RES" "$SALVA/resolv.conf"
MD5=$(md5sum < "$CONF" | cut -d' ' -f1)
# Riga di comando come la scrive QCMAP (argv[0] "dnsmasq")
RIGA0=$(riga | sed 's|^/usr/bin/dnsmasq |dnsmasq |')
LEASE=$(md5sum < /var/lib/misc/dnsmasq.leases | cut -d' ' -f1)
echo "  dnsmasq $(pid): $RIGA0"
echo "  /etc/dnsmasq.conf md5 $MD5, resolv.conf $(wc -c < "$RES") byte"
grep -q '^# custom_dns inizio$' "$CONF" && { echo "il file contiene già DNS personalizzati: collaudo interrotto"; exit 1; }

echo "== DNS finti su lo"
ip addr add 10.53.53.53/32 dev lo
ip addr add 10.53.53.54/32 dev lo
dnsmasq -C /dev/null -k -z --listen-address=10.53.53.53 -p 53 --no-resolv --no-hosts --address=/#/10.9.8.7 \
	--pid-file="$SALVA/a.pid" </dev/null >/dev/null 2>&1 &
FA=$!
dnsmasq -C /dev/null -k -z --listen-address=10.53.53.54 -p 53 --no-resolv --no-hosts --address=/#/10.9.8.8 \
	--pid-file="$SALVA/b.pid" </dev/null >/dev/null 2>&1 &
FB=$!
sleep 2
echo "nameserver 10.53.53.53" > "$RES"
[ "$(risolvi x1.prova)" = 10.9.8.7 ]; check "DNS finto A risponde 10.9.8.7" $?
echo "nameserver 10.53.53.54" > "$RES"
[ "$(risolvi x2.prova)" = 10.9.8.8 ]; check "DNS finto B risponde 10.9.8.8" $?
rete
[ "$(risolvi a1.prova)" = 10.9.8.7 ]; check "automatici: il router inoltra al DNS della rete (A)" $?
log_dm | grep -q 'using nameserver 10.53.53.53#53'; check "syslog: dnsmasq legge A da resolv.conf" $?

echo "== autenticazione e lettura"
r=$(REQUEST_METHOD=GET QUERY_STRING=api=dns CUSTOM_CGI_USERS="$TU" sh "$CGI" | head -1 | tr -d '\r')
[ "$r" = "Status: 401 Unauthorized" ]; check "api=dns senza credenziali -> 401" $?
get "api=dns" | grep -q '^Content-Type: application/json'; check "api=dns autenticato -> JSON" $?
j=$(json)
echo "  $j"
echo "$j" | grep -q '"mode":"auto","dns1":"","dns2":"","rete":\["192.168.0.1","10.53.53.53"\],"dnsmasq":1,"lan":"192.168.0.1"'; check "JSON: automatici, DNS della rete, dnsmasq attivo, IP LAN" $?
TOK=$(cat /tmp/custom_cgi.csrf)
echo "$j" | grep -q "\"csrf\":\"$TOK\""; check "JSON con token anti-CSRF" $?

echo "== anti-CSRF"
[ "$(post "action=dns&mode=custom&dns1=1.1.1.1" | head -1)" = "Status: 403 Forbidden" ]; check "POST senza token -> 403" $?
[ "$(post "csrf=$TOK&action=dns&mode=custom&dns1=1.1.1.1" "https://altro.example" | head -1)" = "Status: 403 Forbidden" ]; check "POST con Origin estraneo -> 403" $?

echo "== validazione"
P0=$(pid)
for c in "mode=" "mode=x&dns1=1.1.1.1" "mode=custom" "mode=custom&dns1=" "mode=custom&dns1=1.1.1" "mode=custom&dns1=01.1.1.1" \
	"mode=custom&dns1=256.1.1.1" "mode=custom&dns1=0.1.1.1" "mode=custom&dns1=127.0.0.1" "mode=custom&dns1=224.0.0.1" \
	"mode=custom&dns1=192.168.0.1" "mode=custom&dns1=1.1.1.1%0Aserver%3D6.6.6.6" "mode=custom&dns1=1.1.1.1&dns2=1.1.1.1" \
	"mode=custom&dns1=1.1.1.1&dns2=x" "mode=custom&dns1=1.1.1.1&dns2=8.8.8.8%20" "mode=custom&dns1=::1"; do
	[ "$(loc "csrf=$TOK&action=dns&$c")" = "custom.cgi?api=dns&m=err_val" ]; check "'$c' rifiutato" $?
done
[ "$(md5sum < "$CONF" | cut -d' ' -f1)" = "$MD5" ] && [ "$(pid)" = "$P0" ]; check "nessuna modifica e nessun riavvio dopo gli input rifiutati" $?
[ "$(loc "csrf=$TOK&action=dns&mode=auto")" = "custom.cgi?api=dns&m=dns_same" ]; check "automatici quando lo sono già -> dns_same" $?
[ "$(pid)" = "$P0" ]; check "dns_same senza riavvio di dnsmasq" $?

echo "== personalizzati: B (10.53.53.54) + 1.1.1.1"
[ "$(loc "csrf=$TOK&action=dns&mode=custom&dns1=10.53.53.54&dns2=1.1.1.1")" = "custom.cgi?api=dns&m=dns_ok" ]; check "custom -> dns_ok" $?
P1=$(pid)
echo "  dnsmasq $P1: $(riga)"
[ -n "$P1" ] && [ "$P1" != "$P0" ]; check "dnsmasq riavviato (nuovo PID)" $?
[ "$(riga)" = "$RIGA0" ]; check "stessa riga di comando di QCMAP" $?
[ "$(sed -n '/^# custom_dns inizio$/,/^# custom_dns fine$/p' "$CONF" | tr '\n' '|')" = "# custom_dns inizio|no-resolv|server=10.53.53.54|server=1.1.1.1|# custom_dns fine|" ]; check "blocco in dnsmasq.conf" $?
[ "$(senza_blocco)" = "$MD5" ]; check "resto di dnsmasq.conf invariato" $?
[ "$(stat -c '%U %a' "$CONF")" = "root 644" ]; check "dnsmasq.conf root 644" $?
[ "$(md5sum < /var/lib/misc/dnsmasq.leases | cut -d' ' -f1)" = "$LEASE" ]; check "lease DHCP conservati" $?
netstat -lnu 2>/dev/null | grep -q '192.168.0.1:53 '; check "dnsmasq ascolta su 192.168.0.1:53 UDP" $?
netstat -lnt 2>/dev/null | grep -q '192.168.0.1:53 '; check "dnsmasq ascolta su 192.168.0.1:53 TCP" $?
! tr '\0' '\n' < "/proc/$P1/environ" | grep -q -E '^(HTTP_|CUSTOM_CGI|REQUEST_)'; check "ambiente di dnsmasq senza variabili del CGI" $?
! ls -l "/proc/$P1/fd" 2>/dev/null | grep -q -E 'custom_cgi|custom_at'; check "dnsmasq senza i lock del CGI" $?
logread 2>/dev/null | grep "dnsmasq\[$P1\]" | grep -q 'using nameserver 10.53.53.54#53'; check "syslog: dnsmasq usa 10.53.53.54" $?
logread 2>/dev/null | grep 'custom.cgi' | tail -1 | grep -q 'DNS a monte di dnsmasq: 10.53.53.54 1.1.1.1'; check "syslog registra la modifica" $?
json | grep -q '"mode":"custom","dns1":"10.53.53.54","dns2":"1.1.1.1"'; check "api=dns mostra i personalizzati" $?
[ "$(risolvi b1.prova)" = 10.9.8.8 ]; check "il router inoltra al DNS personalizzato (B), non a quello della rete" $?
rete
[ "$(risolvi b2.prova)" = 10.9.8.8 ]; check "dopo una riscrittura di resolv.conf (riconnessione) resta B" $?
[ "$(loc "csrf=$TOK&action=dns&mode=custom&dns1=10.53.53.54&dns2=1.1.1.1")" = "custom.cgi?api=dns&m=dns_same" ]; check "stessi server -> dns_same" $?

echo "== un solo server"
[ "$(loc "csrf=$TOK&action=dns&mode=custom&dns1=10.53.53.54&dns2=")" = "custom.cgi?api=dns&m=dns_ok" ]; check "solo dns1 -> dns_ok" $?
[ "$(sed -n '/^# custom_dns inizio$/,/^# custom_dns fine$/p' "$CONF" | tr '\n' '|')" = "# custom_dns inizio|no-resolv|server=10.53.53.54|# custom_dns fine|" ]; check "blocco con un solo server" $?
[ "$(risolvi c1.prova)" = 10.9.8.8 ]; check "risolve con B" $?

echo "== ritorno agli automatici"
[ "$(loc "csrf=$TOK&action=dns&mode=auto")" = "custom.cgi?api=dns&m=dns_ok" ]; check "auto -> dns_ok" $?
[ "$(md5sum < "$CONF" | cut -d' ' -f1)" = "$MD5" ]; check "dnsmasq.conf identico all'originale" $?
[ "$(riga)" = "$RIGA0" ]; check "stessa riga di comando di QCMAP" $?
[ "$(risolvi d1.prova)" = 10.9.8.7 ]; check "il router torna al DNS della rete (A)" $?
log_dm | grep -q 'using nameserver 10.53.53.53#53'; check "syslog: dnsmasq riavviato legge A da resolv.conf" $?
json | grep -q '"mode":"auto"'; check "api=dns mostra automatici" $?

echo "== pulizia"
kill "$FA" "$FB" 2>/dev/null
wait 2>/dev/null
ip addr del 10.53.53.53/32 dev lo
ip addr del 10.53.53.54/32 dev lo
cat "$SALVA/resolv.conf" > "$RES"
if [ "$(md5sum < "$CONF" | cut -d' ' -f1)" != "$MD5" ]; then
	echo "dnsmasq.conf diverso: rimetto l'originale e riavvio dnsmasq"
	cat "$SALVA/dnsmasq.conf" > "$CONF"
	p=$(pid)
	set -- $RIGA0
	shift
	kill "$p"
	sleep 2
	env -i PATH=/usr/bin:/usr/sbin:/bin:/sbin setsid dnsmasq "$@" </dev/null >/dev/null 2>&1
fi
[ "$(md5sum < "$CONF" | cut -d' ' -f1)" = "$MD5" ]; check "dnsmasq.conf originale" $?
[ "$(md5sum < "$RES" | cut -d' ' -f1)" = "$(md5sum < "$SALVA/resolv.conf" | cut -d' ' -f1)" ]; check "resolv.conf originale" $?
[ "$(riga)" = "$RIGA0" ] && [ "$(pidof dnsmasq | wc -w)" = 1 ]; check "un solo dnsmasq, con la riga di comando originale" $?
! ip addr show dev lo | grep -q '10.53.53'; check "indirizzi di prova tolti da lo" $?
rm -rf "$SALVA" "$TU" /tmp/custom_cgi.fail
echo
echo "esito: $PASS OK, $FAIL FAIL"
