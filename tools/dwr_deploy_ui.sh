#!/bin/sh
# Installa sul DWR-932 la pagina custom.cgi (repeater, potenza TX, beacon e DTIM, API del riavvio programmato),
# il pulsante "FUNZIONALITÀ AVANZATE" sotto "Setup Wizard" nella home della web UI originale (controlPanel.html)
# e la tab "Riavvio programmato" del popup Amministrazione (systemManagementPopup.html, js/custom_autoreboot.js,
# /bmdefsys/usr/bin/custom_autoreboot.sh, /etc/init.d/custom_autoreboot con il link S99 in rc5.d), il controllo
# della CPU (/bmdefsys/usr/bin/custom_cpufreq.sh, /etc/init.d/custom_cpufreq con il link S99, pe_service modificato
# da tools/pe_service_patch.py per chiamare custom_cpufreq.sh al posto di scrivere scaling_governor).
# Prima copiare con adb push in /cache: custom.cgi.new, controlPanel.html.new, systemManagementPopup.html.new,
# custom_autoreboot.js.new, custom_autoreboot.sh.new, custom_autoreboot.init.new, custom_cpufreq.sh.new,
# custom_cpufreq.init.new, pe_service.new
# Backup una tantum: /cache/custom.cgi.prev, /cache/controlPanel.html.orig, /cache/systemManagementPopup.html.orig,
# /cache/pe_service.orig.
# Ripristino: dwr_deploy_ui.sh --ripristina (toglie anche la riga del riavvio programmato dal crontab di root e
# riporta governor e limiti della CPU a quelli del firmware originale).
# Il pe_service modificato diventa attivo al riavvio successivo: i processi in esecuzione restano quelli vecchi.
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
CF=/bmdefsys/usr/bin/custom_cpufreq.sh
CFINIT=/etc/init.d/custom_cpufreq
CFLINK=/etc/rc5.d/S99custom_cpufreq
PE=/bmdefsys/usr/bin/pe_service
PE_ORIG_MD5=774198f3bfc19330916369b6e573d948
PE_NEW_MD5=2cddca0c82fa44316fc8245dc77e8f7d
CPUFREQ=/sys/devices/system/cpu/cpu0/cpufreq
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

# pe_service è in esecuzione: lo si sostituisce con un rename (con cat > fallirebbe con "Text file busy")
installa_pe() {
	cp -p "$PE" "$PE.tmp" && cat "$1" > "$PE.tmp" && mv "$PE.tmp" "$PE"
}

if [ "$1" = "--ripristina" ]; then
	if [ -d /var/spool/cron/crontabs ]; then
		crontab -l 2>/dev/null | grep -v -F "$AR" | crontab -
	fi
	rm -f "$LINK" "$INIT" "$AR" "$JS" "$CFLINK" "$CFINIT" "$CF"
	if [ -e /cache/pe_service.orig ] && ! cmp -s /cache/pe_service.orig "$PE"; then
		installa_pe /cache/pe_service.orig
		echo "pe_service originale ripristinato: attivo dal prossimo riavvio del device"
	fi
	# Governor e limiti come li lascia il firmware originale (power_config)
	cat "$CPUFREQ/cpuinfo_min_freq" > "$CPUFREQ/scaling_min_freq"
	cat "$CPUFREQ/cpuinfo_max_freq" > "$CPUFREQ/scaling_max_freq"
	echo ondemand > "$CPUFREQ/scaling_governor"
	[ -e /cache/custom.cgi.prev ] && cat /cache/custom.cgi.prev > "$CGI"
	[ -e /cache/controlPanel.html.orig ] && cat /cache/controlPanel.html.orig > "$CP"
	[ -e /cache/systemManagementPopup.html.orig ] && cat /cache/systemManagementPopup.html.orig > "$SMP"
	sync
	conf_originale
	exit 0
fi

for f in custom.cgi controlPanel.html systemManagementPopup.html custom_autoreboot.js custom_autoreboot.sh \
	custom_autoreboot.init custom_cpufreq.sh custom_cpufreq.init pe_service; do
	[ -s "/cache/$f.new" ] || { echo "manca /cache/$f.new: nulla installato"; exit 1; }
done
for f in custom.cgi custom_autoreboot.sh custom_autoreboot.init custom_cpufreq.sh custom_cpufreq.init; do
	sh -n "/cache/$f.new" || { echo "$f non valido: nulla installato"; exit 1; }
done
grep -q '/cgi-bin/custom.cgi' /cache/controlPanel.html.new || { echo "controlPanel.html senza pulsante: nulla installato"; exit 1; }
grep -q 'js/custom_autoreboot.js' /cache/controlPanel.html.new || { echo "controlPanel.html senza custom_autoreboot.js: nulla installato"; exit 1; }
grep -q 'page_id="tf1_autoReboot"' /cache/systemManagementPopup.html.new || { echo "systemManagementPopup.html senza la tab: nulla installato"; exit 1; }
grep -q 'function custom_autoRebootOnload' /cache/custom_autoreboot.js.new || { echo "custom_autoreboot.js non valido: nulla installato"; exit 1; }
[ "$(md5sum /cache/pe_service.new | cut -d' ' -f1)" = "$PE_NEW_MD5" ] || { echo "pe_service.new diverso da quello atteso: nulla installato"; exit 1; }
md5_pe=$(md5sum "$PE" | cut -d' ' -f1)
case "$md5_pe" in
	"$PE_ORIG_MD5"|"$PE_NEW_MD5") ;;
	*) echo "pe_service installato sconosciuto (md5 $md5_pe): nulla installato"; exit 1;;
esac

[ -e /cache/custom.cgi.prev ] || cp -p "$CGI" /cache/custom.cgi.prev
[ -e /cache/controlPanel.html.orig ] || cp -p "$CP" /cache/controlPanel.html.orig
[ -e /cache/systemManagementPopup.html.orig ] || cp -p "$SMP" /cache/systemManagementPopup.html.orig
[ -e /cache/pe_service.orig ] || [ "$md5_pe" != "$PE_ORIG_MD5" ] || cp -p "$PE" /cache/pe_service.orig
# File nuovi della web UI: stesso proprietario e permessi degli altri script (www-data, 770)
[ -e "$JS" ] || cp -p "$WP/js/system.js" "$JS"
cat /cache/custom.cgi.new > "$CGI"
cat /cache/controlPanel.html.new > "$CP"
cat /cache/systemManagementPopup.html.new > "$SMP"
cat /cache/custom_autoreboot.js.new > "$JS"
cat /cache/custom_autoreboot.sh.new > "$AR"
cat /cache/custom_autoreboot.init.new > "$INIT"
cat /cache/custom_cpufreq.sh.new > "$CF"
cat /cache/custom_cpufreq.init.new > "$CFINIT"
chmod 755 "$AR" "$INIT" "$CF" "$CFINIT"
ln -sf ../init.d/custom_autoreboot "$LINK"
ln -sf ../init.d/custom_cpufreq "$CFLINK"
pe_nuovo=0
if [ "$md5_pe" != "$PE_NEW_MD5" ]; then
	installa_pe /cache/pe_service.new
	pe_nuovo=1
fi
rm -f /cache/custom.cgi.new /cache/controlPanel.html.new /cache/systemManagementPopup.html.new \
	/cache/custom_autoreboot.js.new /cache/custom_autoreboot.sh.new /cache/custom_autoreboot.init.new \
	/cache/custom_cpufreq.sh.new /cache/custom_cpufreq.init.new /cache/pe_service.new
sync
"$AR" applica
"$CF" applica
sha256sum "$CGI" "$CP" "$SMP" "$JS" "$AR" "$INIT" "$CF" "$CFINIT" "$PE" "$LC"
ls -la "$CGI" "$CP" "$SMP" "$JS" "$AR" "$INIT" "$LINK" "$CF" "$CFINIT" "$CFLINK" "$PE"
[ "$pe_nuovo" = 1 ] && echo "pe_service modificato installato: attivo dal prossimo riavvio del device"
conf_originale
