#!/bin/sh
# Riavvio programmato del DWR-932. Configurazione in /bmdefsys/etc/bm_custom.conf:
#   autoreboot_enable=0|1, autoreboot_time=HH:MM (ora locale di /etc/TZ, la stessa della tab "Data e ora"),
#   autoreboot_days=giorni cron 0-6 separati da virgole (0 = domenica).
# Uso:
#   applica  scrive la riga nel crontab di root, o la toglie, e avvia crond se non gira.
#            Lo chiamano custom.cgi dopo ogni modifica e /etc/init.d/custom_autoreboot all'avvio.
#   esegui   lanciato da crond all'orario scelto: riavvia solo se passano i controlli di sicurezza.
#            Con AUTOREBOOT_PROVA=1 stampa la decisione senza riavviare; solo in questo caso accetta
#            AUTOREBOOT_CONF (file di configurazione di prova) e AUTOREBOOT_UPTIME (secondi di uptime simulati).
# qcmap_fcgi, dopo ogni sincronizzazione NTP, esegue "kill -9 $(ps -ef | grep crond)" e riavvia crond:
# nessun processo di questo script deve avere "crond" o argomenti numerici nella riga di comando.

PATH=/sbin:/usr/sbin:/bin:/usr/bin
CONF=/bmdefsys/etc/bm_custom.conf
SELF=/bmdefsys/usr/bin/custom_autoreboot.sh
# crond e crontab di busybox terminano se questa directory manca
CRONDIR=/var/spool/cron/crontabs
LAST=/cache/custom_autoreboot.last
SYSLOG_SALVATO=/var/syslog_messages
UPTIME=$(cut -d. -f1 /proc/uptime)
if [ "$AUTOREBOOT_PROVA" = 1 ]; then
	[ -n "$AUTOREBOOT_CONF" ] && CONF=$AUTOREBOOT_CONF
	[ -n "$AUTOREBOOT_UPTIME" ] && UPTIME=$AUTOREBOOT_UPTIME
fi

conf_get() { [ -f "$CONF" ] && sed -n "s/^$1=//p" "$CONF" | head -1; }

# Valori validati: finiscono nella riga del crontab
leggi_conf() {
	EN=$(conf_get autoreboot_enable)
	ORA=$(conf_get autoreboot_time)
	GIORNI=$(conf_get autoreboot_days)
	[ "$EN" = 1 ] || EN=0
	case "$ORA" in [01][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]) ;; *) EN=0;; esac
	printf '%s' "$GIORNI" | grep -Eq '^[0-6](,[0-6]){0,6}$' || EN=0
}

avvia_crond() {
	pidof crond >/dev/null && return 0
	# crond resta in esecuzione e il daemonize di busybox chiude solo i descrittori sotto quello di /dev/null:
	# senza queste cautele erediterebbe l'ambiente del chiamante (le variabili CGI, compresa HTTP_AUTHORIZATION)
	# e i suoi descrittori sopra il 2 (il flock delle POST di custom.cgi, il terminale di adb shell, socket)
	(
		for fd in $(ls /proc/self/fd); do [ "$fd" -gt 2 ] && eval "exec $fd>&-"; done
		exec env -i PATH="$PATH" TZ="$(cat /etc/TZ 2>/dev/null)" crond
	) </dev/null >/dev/null 2>&1
}

applica() {
	leggi_conf
	mkdir -p "$CRONDIR"
	# Le altre righe del crontab di root restano com'erano
	altre=$(crontab -l 2>/dev/null | grep -v -F "$SELF")
	{
		[ -n "$altre" ] && printf '%s\n' "$altre"
		[ "$EN" = 1 ] && echo "${ORA#*:} ${ORA%%:*} * * $GIORNI $SELF esegui"
	} | crontab -
	[ "$EN" = 1 ] && avvia_crond
	return 0
}

nega() {
	echo "riavvio programmato non eseguito: $1"
	[ "$AUTOREBOOT_PROVA" = 1 ] || logger -t riavvio_programmato "non eseguito: $1"
	exit 0
}

esegui() {
	leggi_conf
	[ "$EN" = 1 ] || nega "funzione disattivata"
	# Dopo un riavvio l'orologio riparte dall'ora di spegnimento (/etc/timestamp): niente cicli di riavvii
	[ "$UPTIME" -ge 600 ] || nega "router acceso da meno di 10 minuti"
	set -- $(TZ=$(cat /etc/TZ 2>/dev/null) date '+%Y %w %H %M %Y-%m-%d')
	anno=$1 gsett=$2 hh=$3 mm=$4 oggi=$5
	[ "$anno" -ge 2025 ] || nega "orologio non impostato"
	case ",$GIORNI," in *",$gsett,"*) ;; *) nega "giorno non previsto";; esac
	# crond recupera i job saltati da salti in avanti dell'orologio fino a un'ora: oltre 5 minuti di ritardo no
	h=${ORA%%:*}
	m=${ORA#*:}
	ritardo=$(( (${hh#0} * 60 + ${mm#0} - ${h#0} * 60 - ${m#0} + 1440) % 1440 ))
	[ "$ritardo" -lt 5 ] || nega "in ritardo di $ritardo minuti sull'orario $ORA"
	# Nel giorno del ritorno all'ora solare lo stesso orario capita due volte
	[ "$(cat "$LAST" 2>/dev/null)" = "$oggi $ORA" ] && nega "riavvio programmato delle $ORA già eseguito oggi"
	# Aggiornamento firmware dalla web UI: le partizioni passano da questi file mentre vengono scritte
	for f in /cache/upgrade.zip /cache/upgrade.bin; do
		[ -e "$f" ] && nega "aggiornamento firmware in corso ($f)"
	done
	ls -l /proc/[0-9]*/fd 2>/dev/null | grep -q ' -> /dev/mtd' && nega "scrittura in flash in corso"
	if [ "$AUTOREBOOT_PROVA" = 1 ]; then
		echo "riavvio programmato: il router verrebbe riavviato ora"
		exit 0
	fi
	logger -t riavvio_programmato "riavvio programmato alle $hh:$mm"
	echo "$oggi $ORA" > "$LAST"
	# Come il riavvio della web UI stock: syslog salvato in /var/syslog_messages, al massimo circa 2 MB
	if [ -f "$SYSLOG_SALVATO" ] && [ "$(wc -c < "$SYSLOG_SALVATO")" -lt 2097152 ]; then
		logread >> "$SYSLOG_SALVATO"
	else
		logread > "$SYSLOG_SALVATO"
	fi
	sync
	/sbin/reboot
}

case "$1" in
	applica) applica;;
	esegui) esegui;;
	*) echo "uso: $0 applica|esegui" >&2; exit 1;;
esac
