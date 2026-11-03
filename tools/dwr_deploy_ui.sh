#!/bin/sh
# Installa sul DWR-932 la pagina custom.cgi (repeater, potenza TX, beacon e DTIM, API del riavvio programmato),
# il pulsante "FUNZIONALITÀ AVANZATE" sotto "Setup Wizard" nella home della web UI originale (controlPanel.html)
# e la tab "Riavvio programmato" del popup Amministrazione (systemManagementPopup.html, js/custom_autoreboot.js,
# /bmdefsys/usr/bin/custom_autoreboot.sh, /etc/init.d/custom_autoreboot con il link S99 in rc5.d), il controllo
# della CPU (/bmdefsys/usr/bin/custom_cpufreq.sh, /etc/init.d/custom_cpufreq con il link S99, pe_service modificato
# da tools/pe_service_patch.py per chiamare custom_cpufreq.sh al posto di scrivere scaling_governor) e il riquadro di
# stato della home (colonna sinistra di controlPanel.html generata da tools/build_controlpanel.py, js/custom_status.js,
# cgi-bin/custom_status.cgi) e il riquadro "Bande LTE" del popup Internet (internetPopup.html generato da
# tools/build_internetpopup.py, js/custom_lteband.js; le bande le imposta custom.cgi con AT+BMBANDPREF) e il riquadro
# "DNS personalizzati" della tab Impostazioni LAN dello stesso popup (js/custom_dns.js; i DNS li scrive custom.cgi in
# /etc/dnsmasq.conf).
# Prima copiare con adb push in /cache: custom.cgi.new, controlPanel.html.new, systemManagementPopup.html.new,
# custom_autoreboot.js.new, custom_autoreboot.sh.new, custom_autoreboot.init.new, custom_cpufreq.sh.new,
# custom_cpufreq.init.new, pe_service.new, custom_status.cgi.new, custom_status.js.new, internetPopup.html.new,
# custom_lteband.js.new, custom_dns.js.new
# Backup una tantum: /cache/custom.cgi.prev, /cache/controlPanel.html.orig, /cache/systemManagementPopup.html.orig,
# /cache/internetPopup.html.orig, /cache/pe_service.orig.
# Ripristino: dwr_deploy_ui.sh --ripristina (toglie anche la riga del riavvio programmato dal crontab di root,
# riporta governor e limiti della CPU a quelli del firmware originale e riabilita tutte le bande LTE supportate:
# il blocco resta salvato nel modem e senza la UI non si potrebbe più togliere; toglie i DNS personalizzati da
# /etc/dnsmasq.conf e riavvia dnsmasq).
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
IP=$WP/internetPopup.html
LBJS=$WP/js/custom_lteband.js
DNSJS=$WP/js/custom_dns.js
DNSCONF=/etc/dnsmasq.conf
JS=$WP/js/custom_autoreboot.js
STCGI=$WP/cgi-bin/custom_status.cgi
STJS=$WP/js/custom_status.js
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

# Risposta del modem al comando AT $1 su /dev/smd7, senza \r
at_cmd() {
	timeout -t 4 cat /dev/smd7 > /tmp/deploy_at.$$ 2>/dev/null &
	usleep 200000
	printf '%s\r' "$1" > /dev/smd7
	wait
	tr -d '\r' < /tmp/deploy_at.$$
	rm -f /tmp/deploy_at.$$
}
# Riabilita tutte le bande LTE supportate dal modem. In scrittura AT+BMBANDPREF vuole l'esadecimale senza 0x;
# GSM/WCDMA resta quello letto, TD-SCDMA 0 = invariata.
bande_tutte() {
	cap=$(at_cmd 'AT+BMBANDPREF=?' | sed -n 's/^+BMBANDPREF: support band: //p' | tr -d ' ')
	att=$(at_cmd 'AT+BMBANDPREF?' | sed -n 's/^+BMBANDPREF: //p' | tr -d ' ')
	case "$cap,$att" in
		0x*,0x*,0x*,0x*,0x*,0x*) ;;
		*) echo "bande LTE: risposta del modem non valida, nessuna modifica"; return;;
	esac
	c=${cap#*,}; c=${c%%,*}
	a=${att#*,}; a=${a%%,*}
	g=${att%%,*}
	if [ "$((c))" = "$((a))" ]; then
		echo "bande LTE: già tutte abilitate ($c)"
	elif at_cmd "AT+BMBANDPREF=${g#0x},${c#0x},0" | grep -q '^OK'; then
		echo "bande LTE: tutte riabilitate ($c)"
	else
		echo "bande LTE: il modem ha rifiutato il ripristino"
	fi
}

# Toglie i DNS personalizzati da /etc/dnsmasq.conf e riavvia il dnsmasq di QCMAP (l'unico con --dhcp-range) con la
# sua riga di comando, così torna ai DNS ricevuti dalla rete
dns_automatici() {
	grep -q '^# custom_dns inizio$' "$DNSCONF" || { echo "DNS: già automatici"; return; }
	sed '/^# custom_dns inizio$/,/^# custom_dns fine$/d' "$DNSCONF" > "$DNSCONF.tmp" && chmod 644 "$DNSCONF.tmp" &&
		mv "$DNSCONF.tmp" "$DNSCONF"
	sync
	for p in $(pidof dnsmasq); do
		a=$(tr '\0' ' ' < "/proc/$p/cmdline")
		case "$a" in *" --dhcp-range="*) ;; *) continue;; esac
		kill "$p"
		sleep 2
		env -i PATH=/usr/bin:/usr/sbin:/bin:/sbin setsid dnsmasq ${a#* } </dev/null >/dev/null 2>&1
		echo "DNS: tornati automatici, dnsmasq riavviato"
		return
	done
	echo "DNS: tornati automatici (dnsmasq non in esecuzione)"
}

# pe_service è in esecuzione: lo si sostituisce con un rename (con cat > fallirebbe con "Text file busy")
installa_pe() {
	cp -p "$PE" "$PE.tmp" && cat "$1" > "$PE.tmp" && mv "$PE.tmp" "$PE"
}

if [ "$1" = "--ripristina" ]; then
	if [ -d /var/spool/cron/crontabs ]; then
		crontab -l 2>/dev/null | grep -v -F "$AR" | crontab -
	fi
	rm -f "$LINK" "$INIT" "$AR" "$JS" "$CFLINK" "$CFINIT" "$CF" "$STCGI" "$STJS" "$LBJS" "$DNSJS" /tmp/custom_status.prev
	if [ -e /cache/pe_service.orig ] && ! cmp -s /cache/pe_service.orig "$PE"; then
		installa_pe /cache/pe_service.orig
		echo "pe_service originale ripristinato: attivo dal prossimo riavvio del device"
	fi
	# Governor e limiti come li lascia il firmware originale (power_config)
	cat "$CPUFREQ/cpuinfo_min_freq" > "$CPUFREQ/scaling_min_freq"
	cat "$CPUFREQ/cpuinfo_max_freq" > "$CPUFREQ/scaling_max_freq"
	echo ondemand > "$CPUFREQ/scaling_governor"
	bande_tutte
	dns_automatici
	[ -e /cache/custom.cgi.prev ] && cat /cache/custom.cgi.prev > "$CGI"
	[ -e /cache/controlPanel.html.orig ] && cat /cache/controlPanel.html.orig > "$CP"
	[ -e /cache/systemManagementPopup.html.orig ] && cat /cache/systemManagementPopup.html.orig > "$SMP"
	[ -e /cache/internetPopup.html.orig ] && cat /cache/internetPopup.html.orig > "$IP"
	sync
	conf_originale
	exit 0
fi

for f in custom.cgi controlPanel.html systemManagementPopup.html custom_autoreboot.js custom_autoreboot.sh \
	custom_autoreboot.init custom_cpufreq.sh custom_cpufreq.init pe_service custom_status.cgi custom_status.js \
	internetPopup.html custom_lteband.js custom_dns.js; do
	[ -s "/cache/$f.new" ] || { echo "manca /cache/$f.new: nulla installato"; exit 1; }
done
for f in custom.cgi custom_autoreboot.sh custom_autoreboot.init custom_cpufreq.sh custom_cpufreq.init custom_status.cgi; do
	sh -n "/cache/$f.new" || { echo "$f non valido: nulla installato"; exit 1; }
done
grep -q '/cgi-bin/custom.cgi' /cache/controlPanel.html.new || { echo "controlPanel.html senza pulsante: nulla installato"; exit 1; }
grep -q 'js/custom_autoreboot.js' /cache/controlPanel.html.new || { echo "controlPanel.html senza custom_autoreboot.js: nulla installato"; exit 1; }
grep -q 'page_id="tf1_autoReboot"' /cache/systemManagementPopup.html.new || { echo "systemManagementPopup.html senza la tab: nulla installato"; exit 1; }
grep -q 'function custom_autoRebootOnload' /cache/custom_autoreboot.js.new || { echo "custom_autoreboot.js non valido: nulla installato"; exit 1; }
grep -q 'js/custom_status.js' /cache/controlPanel.html.new && grep -q 'id="cst_list"' /cache/controlPanel.html.new &&
	grep -q 'id="cp_internetTemplate"' /cache/controlPanel.html.new &&
	grep -q 'id="cp_connectionModeTemplate"' /cache/controlPanel.html.new ||
	{ echo "controlPanel.html senza riquadro di stato o senza template stock: nulla installato"; exit 1; }
grep -q 'custom_status.cgi' /cache/custom_status.js.new || { echo "custom_status.js non valido: nulla installato"; exit 1; }
grep -q 'js/custom_lteband.js' /cache/controlPanel.html.new || { echo "controlPanel.html senza custom_lteband.js: nulla installato"; exit 1; }
grep -q 'id="cst_lteBand"' /cache/internetPopup.html.new && grep -q 'id="cnmodeinfoTemplate"' /cache/internetPopup.html.new ||
	{ echo "internetPopup.html senza riquadro delle bande o senza template stock: nulla installato"; exit 1; }
grep -q 'api=lteband' /cache/custom_lteband.js.new || { echo "custom_lteband.js non valido: nulla installato"; exit 1; }
grep -q 'api=lteband' /cache/custom.cgi.new || { echo "custom.cgi senza API delle bande: nulla installato"; exit 1; }
grep -q 'js/custom_dns.js' /cache/controlPanel.html.new || { echo "controlPanel.html senza custom_dns.js: nulla installato"; exit 1; }
grep -q 'id="cst_dns"' /cache/internetPopup.html.new && grep -q 'id="lanInfoTemplate"' /cache/internetPopup.html.new ||
	{ echo "internetPopup.html senza riquadro dei DNS o senza template stock: nulla installato"; exit 1; }
grep -q 'api=dns' /cache/custom_dns.js.new || { echo "custom_dns.js non valido: nulla installato"; exit 1; }
grep -q 'api=dns' /cache/custom.cgi.new || { echo "custom.cgi senza API dei DNS: nulla installato"; exit 1; }
[ "$(md5sum /cache/pe_service.new | cut -d' ' -f1)" = "$PE_NEW_MD5" ] || { echo "pe_service.new diverso da quello atteso: nulla installato"; exit 1; }
md5_pe=$(md5sum "$PE" | cut -d' ' -f1)
case "$md5_pe" in
	"$PE_ORIG_MD5"|"$PE_NEW_MD5") ;;
	*) echo "pe_service installato sconosciuto (md5 $md5_pe): nulla installato"; exit 1;;
esac

[ -e /cache/custom.cgi.prev ] || cp -p "$CGI" /cache/custom.cgi.prev
[ -e /cache/controlPanel.html.orig ] || cp -p "$CP" /cache/controlPanel.html.orig
[ -e /cache/systemManagementPopup.html.orig ] || cp -p "$SMP" /cache/systemManagementPopup.html.orig
[ -e /cache/internetPopup.html.orig ] || cp -p "$IP" /cache/internetPopup.html.orig
[ -e /cache/pe_service.orig ] || [ "$md5_pe" != "$PE_ORIG_MD5" ] || cp -p "$PE" /cache/pe_service.orig
# File nuovi della web UI: stesso proprietario e permessi degli altri script (www-data, 770)
[ -e "$JS" ] || cp -p "$WP/js/system.js" "$JS"
[ -e "$STJS" ] || cp -p "$WP/js/system.js" "$STJS"
[ -e "$LBJS" ] || cp -p "$WP/js/system.js" "$LBJS"
[ -e "$DNSJS" ] || cp -p "$WP/js/system.js" "$DNSJS"
# CGI nuovo: stesso proprietario e permessi (eseguibile) di custom.cgi
[ -e "$STCGI" ] || cp -p "$CGI" "$STCGI"
cat /cache/custom.cgi.new > "$CGI"
cat /cache/controlPanel.html.new > "$CP"
cat /cache/systemManagementPopup.html.new > "$SMP"
cat /cache/custom_autoreboot.js.new > "$JS"
cat /cache/custom_status.js.new > "$STJS"
cat /cache/internetPopup.html.new > "$IP"
cat /cache/custom_lteband.js.new > "$LBJS"
cat /cache/custom_dns.js.new > "$DNSJS"
cat /cache/custom_status.cgi.new > "$STCGI"
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
	/cache/custom_cpufreq.sh.new /cache/custom_cpufreq.init.new /cache/pe_service.new \
	/cache/custom_status.cgi.new /cache/custom_status.js.new /cache/internetPopup.html.new /cache/custom_lteband.js.new \
	/cache/custom_dns.js.new
sync
"$AR" applica
"$CF" applica
sha256sum "$CGI" "$CP" "$SMP" "$JS" "$AR" "$INIT" "$CF" "$CFINIT" "$PE" "$STCGI" "$STJS" "$IP" "$LBJS" "$DNSJS" "$LC"
ls -la "$CGI" "$CP" "$SMP" "$JS" "$AR" "$INIT" "$LINK" "$CF" "$CFINIT" "$CFLINK" "$PE" "$STCGI" "$STJS" "$IP" "$LBJS" "$DNSJS"
[ "$pe_nuovo" = 1 ] && echo "pe_service modificato installato: attivo dal prossimo riavvio del device"
conf_originale
