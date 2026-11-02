#!/bin/sh
# Collaudo isolato su istanza lighttpd separata (127.0.0.1:8081): senza auth.require, l'header Authorization della
# richiesta arriva al CGI come HTTP_AUTHORIZATION? Usa solo credenziali di prova; non tocca il lighttpd di sistema.

D=/tmp/hdrtest
rm -rf $D
mkdir -p $D/www/cgi-bin
cat > $D/www/cgi-bin/env.cgi <<'EOF'
#!/bin/sh
printf 'Content-Type: text/plain\r\n\r\n'
case "$HTTP_AUTHORIZATION" in
	Basic\ *) echo "HTTP_AUTHORIZATION presente, utente=$(printf '%s' "${HTTP_AUTHORIZATION#Basic }" | base64 -d | cut -d: -f1)";;
	*) echo "HTTP_AUTHORIZATION assente";;
esac
EOF
chmod 755 $D/www/cgi-bin/env.cgi
cat > $D/lighttpd.conf <<EOF
server.modules = ( "mod_access", "mod_auth", "mod_cgi" )
server.document-root = "$D/www/"
server.bind = "127.0.0.1"
server.port = 8081
server.pid-file = "$D/pid"
server.errorlog = "$D/error.log"
\$HTTP["url"] =~ "/cgi-bin/" { cgi.assign = ( "" => "" ) }
EOF
lighttpd -f $D/lighttpd.conf
# Il firewall QCMAP rifiuta il TCP in ingresso da ogni interfaccia diversa da bridge0, loopback compreso
iptables -I INPUT -i lo -j ACCEPT
sleep 1
{
	printf 'GET /cgi-bin/env.cgi HTTP/1.0\r\nHost: 127.0.0.1\r\n'
	printf 'Authorization: Basic %s\r\n\r\n' "$(printf 'prova:segreto-di-test' | base64)"
} | timeout -t 5 nc 127.0.0.1 8081 | sed -n '1p;/HTTP_AUTHORIZATION/p'
kill "$(cat $D/pid)"
iptables -D INPUT -i lo -j ACCEPT
rm -rf $D
