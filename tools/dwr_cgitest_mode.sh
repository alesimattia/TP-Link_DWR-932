#!/bin/sh
# Collaudo on-device del cambio modalità da custom.cgi: invia "Attiva" o "Disattiva" come farebbe il browser
# (il CGI risponde con la pagina di riavvio e riavvia il device). Usa un file utenti di prova con password fittizia,
# accettato dal CGI solo da shell. Uso: sh dwr_cgitest_mode.sh on|off
CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
TU=/tmp/cgitest.users
printf 'admin:%s' "$(printf '%s' 'password-di-prova' | md5sum | cut -d' ' -f1)" > "$TU"
AUTH="Basic $(printf 'admin:password-di-prova' | base64)"
CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=GET sh "$CGI" >/dev/null
TOK=$(cat /tmp/custom_cgi.csrf)
case "$1" in on) a=sta_on;; off) a=sta_off;; *) echo "uso: $0 on|off"; exit 1;; esac
body="csrf=$TOK&action=$a"
printf '%s' "$body" | CUSTOM_CGI_USERS="$TU" HTTP_AUTHORIZATION="$AUTH" REQUEST_METHOD=POST \
	CONTENT_TYPE=application/x-www-form-urlencoded CONTENT_LENGTH=${#body} HTTP_HOST=192.168.0.1 \
	HTTP_ORIGIN=https://192.168.0.1 sh "$CGI" | grep -o '<h1>[^<]*</h1>'
rm -f "$TU"
grep '<WlanMode>' /bmdefsys/etc/mobileap_cfg.xml
echo "wlan0-vxd wlan_mode=$(cat /var/rtl8192c/wlan0-vxd/wlan_mode)"
