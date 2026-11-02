#!/bin/sh
# Installa sul DWR-932 la pagina custom.cgi (repeater, potenza TX, beacon e DTIM, API del riavvio programmato),
# il pulsante "FUNZIONALITÀ AVANZATE" sotto "Setup Wizard" nella home della web UI originale (controlPanel.html)
# e la tab "Riavvio programmato" del popup Amministrazione (systemManagementPopup.html, js/custom_autoreboot.js,
# /bmdefsys/usr/bin/custom_autoreboot.sh, /etc/init.d/custom_autoreboot con il link S99 in rc5.d).
# Prima copiare con adb push in /cache: custom.cgi.new, controlPanel.html.new, systemManagementPopup.html.new,
# custom_autoreboot.js.new, custom_autoreboot.sh.new, custom_autoreboot.init.new
# Backup una tantum: /cache/custom.cgi.prev, /cache/controlPanel.html.orig, /cache/systemManagementPopup.html.orig.
# Ripristino: dwr_deploy_ui.sh --ripristina (toglie anche la riga del riavvio programmato dal crontab di root).
# lighttpd.conf resta l'originale (l'autenticazione la fa custom.cgi): se differisce da /cache/lighttpd.conf.orig
# viene ripristinato e il device si riavvia, perché lighttpd non si riavvia a caldo in modo affidabile (il backend
# qcmap_fcgi rilanciato non reinizializza i client QMI e termina). Un aggiornamento firmware fallito fa
# "rm -f /cache/lighttpd*" (qcmap_fcgi): in quel caso il backup non c'è più e conf_originale non fa nulla.
# I file già presenti vengono scritti con cat, così mantengono proprietario e permessi di quelli installati.

WP=/bmdefsys/WEBSERVER/webpages
CGI=$WP/cgi-bin/custom.cgi
CP=$WP/controlPanel.html
SMP=$WP/systemManagementPopup.html
JS=$WP/js/custom_autoreboot.js
AR=/bmdefsys/usr/bin/custom_autoreboot.sh
INIT=/etc/init.d/custom_autoreboot
LINK=/etc/rc5.d/S99custom_autoreboot
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
	if [ -d /var/spool/cron/crontabs ]; then
		crontab -l 2>/dev/null | grep -v -F "$AR" | crontab -
	fi
	rm -f "$LINK" "$INIT" "$AR" "$JS"
	[ -e /cache/custom.cgi.prev ] && cat /cache/custom.cgi.prev > "$CGI"
	[ -e /cache/controlPanel.html.orig ] && cat /cache/controlPanel.html.orig > "$CP"
	[ -e /cache/systemManagementPopup.html.orig ] && cat /cache/systemManagementPopup.html.orig > "$SMP"
	sync
	conf_originale
	exit 0
fi

for f in custom.cgi controlPanel.html systemManagementPopup.html custom_autoreboot.js custom_autoreboot.sh \
	custom_autoreboot.init; do
	[ -s "/cache/$f.new" ] || { echo "manca /cache/$f.new: nulla installato"; exit 1; }
done
for f in custom.cgi custom_autoreboot.sh custom_autoreboot.init; do
	sh -n "/cache/$f.new" || { echo "$f non valido: nulla installato"; exit 1; }
done
grep -q '/cgi-bin/custom.cgi' /cache/controlPanel.html.new || { echo "controlPanel.html senza pulsante: nulla installato"; exit 1; }
grep -q 'js/custom_autoreboot.js' /cache/controlPanel.html.new || { echo "controlPanel.html senza custom_autoreboot.js: nulla installato"; exit 1; }
grep -q 'page_id="tf1_autoReboot"' /cache/systemManagementPopup.html.new || { echo "systemManagementPopup.html senza la tab: nulla installato"; exit 1; }
grep -q 'function custom_autoRebootOnload' /cache/custom_autoreboot.js.new || { echo "custom_autoreboot.js non valido: nulla installato"; exit 1; }

[ -e /cache/custom.cgi.prev ] || cp -p "$CGI" /cache/custom.cgi.prev
[ -e /cache/controlPanel.html.orig ] || cp -p "$CP" /cache/controlPanel.html.orig
[ -e /cache/systemManagementPopup.html.orig ] || cp -p "$SMP" /cache/systemManagementPopup.html.orig
# File nuovi della web UI: stesso proprietario e permessi degli altri script (www-data, 770)
[ -e "$JS" ] || cp -p "$WP/js/system.js" "$JS"
cat /cache/custom.cgi.new > "$CGI"
cat /cache/controlPanel.html.new > "$CP"
cat /cache/systemManagementPopup.html.new > "$SMP"
cat /cache/custom_autoreboot.js.new > "$JS"
cat /cache/custom_autoreboot.sh.new > "$AR"
cat /cache/custom_autoreboot.init.new > "$INIT"
chmod 755 "$AR" "$INIT"
ln -sf ../init.d/custom_autoreboot "$LINK"
rm -f /cache/custom.cgi.new /cache/controlPanel.html.new /cache/systemManagementPopup.html.new \
	/cache/custom_autoreboot.js.new /cache/custom_autoreboot.sh.new /cache/custom_autoreboot.init.new
sync
"$AR" applica
sha256sum "$CGI" "$CP" "$SMP" "$JS" "$AR" "$INIT" "$LC"
ls -la "$CGI" "$CP" "$SMP" "$JS" "$AR" "$INIT" "$LINK"
conf_originale
