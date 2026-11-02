#!/bin/sh
# Prova reale del riavvio programmato sul DWR-932, attraverso custom.cgi (file utenti di prova, accettato solo da
# shell) -> custom_autoreboot.sh applica -> crontab -> crond -> esegui -> riavvio.
# Uso sul device:
#   sh dwr_autoreboot_e2e.sh programma N   riavvio di oggi fra N minuti (ora locale di /etc/TZ); il router si riavvia
#   sh dwr_autoreboot_e2e.sh verifica      dopo il boot: uptime, ora, crond, crontab, file .last, syslog salvato
#   sh dwr_autoreboot_e2e.sh disattiva     spegne il riavvio programmato e rimette i valori predefiniti (04:00, tutti i giorni)

CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
TU=/tmp/are2e.users

post() {
	printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
	CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="Basic $(printf 'admin:password-di-prova' | base64)" REQUEST_METHOD=GET \
		QUERY_STRING="api=autoreboot" sh "$CGI" >/dev/null 2>&1
	b="csrf=$(cat /tmp/custom_cgi.csrf)&$1"
	printf '%s' "$b" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="Basic $(printf 'admin:password-di-prova' | base64)" \
		REQUEST_METHOD=POST CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#b} HTTP_HOST=192.168.0.1 \
		sh "$CGI" 2>&1 | tr -d '\r' | sed -n 's/^Location: //p'
	rm -f "$TU"
}

case "$1" in
programma)
	n=${2:-3}
	set -- $(TZ=$(cat /etc/TZ) date '+%H %M %w')
	t=$(( (${1#0} * 60 + ${2#0} + n) % 1440 ))
	hh=$(printf '%02d' $((t / 60)))
	mm=$(printf '%02d' $((t % 60)))
	echo "ora del router: $1:$2, giorno $3, uptime $(cut -d. -f1 /proc/uptime) s"
	echo "esito: $(post "action=autoreboot&enable=1&hour=$hh&minute=$mm&days=$3")"
	crontab -l
	echo "crond: $(pidof crond)"
	;;
verifica)
	echo "uptime: $(cut -d. -f1 /proc/uptime) s"
	echo "UTC: $(date -u '+%Y-%m-%d %H:%M:%S')   locale: $(TZ=$(cat /etc/TZ) date '+%Y-%m-%d %H:%M:%S')"
	echo "crond: $(pidof crond) cmdline: $(for p in $(pidof crond); do tr '\0' ' ' < /proc/$p/cmdline; done)"
	echo "crontab:"; crontab -l
	echo "ultimo riavvio programmato: $(cat /cache/custom_autoreboot.last 2>&1)"
	echo "syslog salvato prima del riavvio:"; grep 'riavvio_programmato' /var/syslog_messages | tail -3
	grep '^autoreboot_' /bmdefsys/etc/bm_custom.conf
	;;
disattiva)
	echo "esito: $(post "action=autoreboot&enable=0&hour=04&minute=00&days=1%2C2%2C3%2C4%2C5%2C6%2C0")"
	crontab -l
	grep '^autoreboot_' /bmdefsys/etc/bm_custom.conf
	;;
*)
	echo "uso: $0 programma N | verifica | disattiva" >&2
	exit 1
	;;
esac
