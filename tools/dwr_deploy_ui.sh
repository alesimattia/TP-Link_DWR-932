#!/bin/sh
# Installa sul DWR-932 la pagina custom.cgi (repeater, potenza TX, beacon e DTIM) e il pulsante "FUNZIONALITÀ AVANZATE"
# sotto "Setup Wizard" nella home della web UI originale (controlPanel.html).
# Prima copiare con adb push: /cache/custom.cgi.new e /cache/controlPanel.html.new
# Backup una tantum: /cache/custom.cgi.prev, /cache/controlPanel.html.orig. Ripristino: dwr_deploy_ui.sh --ripristina
# lighttpd.conf resta l'originale (l'autenticazione la fa custom.cgi): se differisce da /cache/lighttpd.conf.orig
# viene ripristinato e il device si riavvia, perché lighttpd non si riavvia a caldo in modo affidabile (il backend
# qcmap_fcgi rilanciato non reinizializza i client QMI e termina).
# I file vengono scritti con cat, così mantengono proprietario e permessi di quelli installati.

CGI=/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi
CP=/bmdefsys/WEBSERVER/webpages/controlPanel.html
LC=/bmdefsys/etc/lighttpd.conf

conf_originale() {
	if [ -e /cache/lighttpd.conf.orig ] && ! cmp -s /cache/lighttpd.conf.orig "$LC"; then
		cat /cache/lighttpd.conf.orig > "$LC"
		sync
		echo "lighttpd.conf ripristinato all'originale: riavvio del device (la sessione adb si chiude)"
		/sbin/reboot
	else
		echo "lighttpd.conf originale: nessun riavvio necessario"
	fi
}

if [ "$1" = "--ripristina" ]; then
	[ -e /cache/custom.cgi.prev ] && cat /cache/custom.cgi.prev > "$CGI"
	[ -e /cache/controlPanel.html.orig ] && cat /cache/controlPanel.html.orig > "$CP"
	sync
	conf_originale
	exit 0
fi

for f in /cache/custom.cgi.new /cache/controlPanel.html.new; do
	[ -s "$f" ] || { echo "manca $f: nulla installato"; exit 1; }
done
sh -n /cache/custom.cgi.new || { echo "custom.cgi non valido: nulla installato"; exit 1; }
grep -q '/cgi-bin/custom.cgi' /cache/controlPanel.html.new || { echo "controlPanel.html senza pulsante: nulla installato"; exit 1; }

[ -e /cache/custom.cgi.prev ] || cp -p "$CGI" /cache/custom.cgi.prev
[ -e /cache/controlPanel.html.orig ] || cp -p "$CP" /cache/controlPanel.html.orig
cat /cache/custom.cgi.new > "$CGI"
cat /cache/controlPanel.html.new > "$CP"
rm -f /cache/custom.cgi.new /cache/controlPanel.html.new
sync
sha256sum "$CGI" "$CP" "$LC"
ls -la "$CGI" "$CP"
conf_originale
