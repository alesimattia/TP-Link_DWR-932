#!/bin/sh
# Collaudo isolato di mod_auth (backend plain) di lighttpd 1.4.43 sul DWR-932: istanza separata su 127.0.0.1:8081
# con un file utenti di prova SENZA newline finale (come /bmdefsys/www/lighttpd.user) e credenziali fittizie.
# Verifica: 401 senza credenziali e con password errata, 200 con quelle giuste, REMOTE_USER passato al CGI.
# Non tocca il lighttpd di sistema né le credenziali reali.

D=/tmp/authtest
rm -rf $D
mkdir -p $D/www/cgi-bin
printf 'prova:segreto-di-test' > $D/users
cat > $D/www/cgi-bin/env.cgi <<'EOF'
#!/bin/sh
printf 'Content-Type: text/plain\r\n\r\n'
echo "REMOTE_USER=$REMOTE_USER AUTH_TYPE=$AUTH_TYPE"
EOF
chmod 755 $D/www/cgi-bin/env.cgi
cat > $D/lighttpd.conf <<EOF
server.modules = ( "mod_access", "mod_auth", "mod_cgi" )
server.document-root = "$D/www/"
server.bind = "127.0.0.1"
server.port = 8081
server.pid-file = "$D/pid"
server.errorlog = "$D/error.log"
auth.backend = "plain"
auth.backend.plain.userfile = "$D/users"
auth.require = ( "/cgi-bin/" => ( "method" => "basic", "realm" => "test", "require" => "valid-user" ) )
\$HTTP["url"] =~ "/cgi-bin/" { cgi.assign = ( "" => "" ) }
EOF
lighttpd -t -f $D/lighttpd.conf
lighttpd -f $D/lighttpd.conf
# Il firewall QCMAP rifiuta il TCP in ingresso da ogni interfaccia diversa da bridge0, loopback compreso
iptables -I INPUT -i lo -j ACCEPT
sleep 1

req() {
	{
		printf 'GET /cgi-bin/env.cgi HTTP/1.0\r\nHost: 127.0.0.1\r\n'
		[ -n "$1" ] && printf 'Authorization: Basic %s\r\n' "$1"
		printf '\r\n'
	} | timeout -t 5 nc 127.0.0.1 8081 | sed -n '1p;/REMOTE_USER/p;/WWW-Authenticate/p'
}
echo "== senza credenziali (atteso 401)"; req ""
echo "== password errata (atteso 401)"; req "$(printf 'prova:sbagliata' | base64)"
echo "== credenziali corrette (atteso 200 + REMOTE_USER=prova)"; req "$(printf 'prova:segreto-di-test' | base64)"

kill "$(cat $D/pid)"
iptables -D INPUT -i lo -j ACCEPT
echo "== error.log"
tail -5 $D/error.log
rm -rf $D
