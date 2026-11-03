#!/bin/sh
# Prova di persistenza dei DNS personalizzati al riavvio del device.
# "prima": imposta 1.1.1.1 e 9.9.9.9 con il custom.cgi installato (file utenti di prova, solo da shell).
# "dopo" (dopo il riavvio): controlla che il dnsmasq avviato da QCMAP al boot usi quei server, poi torna agli
# automatici e verifica che /etc/dnsmasq.conf sia di nuovo identico a /cache/dnsmasq.conf.orig.
# Uso sul device: sh dwr_dns_reboot_test.sh prima|dopo
CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
TU=/tmp/dnsreboot.users
PASS=0
FAIL=0
printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
rm -f /tmp/custom_cgi.fail
check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
get() { CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET QUERY_STRING="$1" sh "$CGI" 2>/dev/null | tr -d '\r'; }
loc() {
	printf '%s' "$1" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
		CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#1} HTTP_HOST=192.168.0.1 \
		HTTP_ORIGIN=https://192.168.0.1 sh "$CGI" 2>/dev/null | tr -d '\r' | sed -n 's/^Location: //p'
}
pid() { for p in $(pidof dnsmasq); do grep -q -- '--dhcp-range' "/proc/$p/cmdline" 2>/dev/null && { echo "$p"; return; }; done; }
blocco() { sed -n '/^# custom_dns inizio$/,/^# custom_dns fine$/p' /etc/dnsmasq.conf | tr '\n' '|'; }
TOK=$(get "api=dns" | sed -n 's/.*"csrf":"\([0-9a-f]*\)".*/\1/p')

case "$1" in
prima)
	[ "$(loc "csrf=$TOK&action=dns&mode=custom&dns1=1.1.1.1&dns2=9.9.9.9")" = "custom.cgi?api=dns&m=dns_ok" ]; check "1.1.1.1 + 9.9.9.9 -> dns_ok" $?
	echo "  blocco: $(blocco)"
	sync
	;;
dopo)
	p=$(pid)
	echo "  uptime $(cut -d' ' -f1 /proc/uptime) s; dnsmasq $p avviato a $(awk '{print int($22/100)}' /proc/$p/stat) s dal boot"
	echo "  riga: $(tr '\0' ' ' < /proc/$p/cmdline)"
	echo "  padre: $(sed -n 's/^PPid:[[:space:]]*//p' /proc/$p/status)"
	[ "$(blocco)" = "# custom_dns inizio|no-resolv|server=1.1.1.1|server=9.9.9.9|# custom_dns fine|" ]; check "blocco ancora in dnsmasq.conf dopo il riavvio" $?
	logread 2>/dev/null | grep "dnsmasq\[$p\]" | grep -E 'using nameserver|reading /etc/resolv' | sed 's/^/  /'
	logread 2>/dev/null | grep "dnsmasq\[$p\]" | grep -q 'using nameserver 1.1.1.1#53'; check "il dnsmasq del boot usa 1.1.1.1" $?
	logread 2>/dev/null | grep "dnsmasq\[$p\]" | grep -q 'using nameserver 9.9.9.9#53'; check "il dnsmasq del boot usa 9.9.9.9" $?
	! logread 2>/dev/null | grep "dnsmasq\[$p\]" | grep -q 'reading /etc/resolv.conf'; check "il dnsmasq del boot non legge resolv.conf" $?
	get "api=dns" | grep -q '"mode":"custom","dns1":"1.1.1.1","dns2":"9.9.9.9"'; check "api=dns mostra i personalizzati" $?
	[ "$(loc "csrf=$TOK&action=dns&mode=auto")" = "custom.cgi?api=dns&m=dns_ok" ]; check "ritorno agli automatici -> dns_ok" $?
	cmp -s /etc/dnsmasq.conf /cache/dnsmasq.conf.orig; check "dnsmasq.conf identico all'originale" $?
	echo "  dnsmasq $(pid): $(tr '\0' ' ' < /proc/$(pid)/cmdline)"
	;;
*)
	echo "uso: sh dwr_dns_reboot_test.sh prima|dopo"
	;;
esac
rm -f "$TU" /tmp/custom_cgi.fail
echo "esito: $PASS OK, $FAIL FAIL"
