#!/bin/sh
# Governor e limiti di frequenza della CPU del DWR-932 (un solo core, cpu0). Configurazione in
# /bmdefsys/etc/bm_custom.conf:
#   cpu_governor=auto|performance|ondemand|conservative|powersave
#   cpu_min_freq=, cpu_max_freq= frequenze in kHz tra scaling_available_frequencies, con minima <= massima.
# Senza configurazione valgono "auto" e i limiti hardware (cpuinfo_min_freq, cpuinfo_max_freq).
# "auto" è il comportamento originale del firmware: power_config (S50) imposta ondemand e pe_service passa a
# performance con carico >= 51%, poi torna a ondemand dopo circa 2 minuti di carico basso.
# Uso:
#   applica          scrive limiti e governor; lo chiamano custom.cgi dopo ogni modifica e
#                    /etc/init.d/custom_cpufreq all'avvio.
#   pe <governor>    lo chiama pe_service, modificato per eseguire questo comando al posto di
#                    "echo <governor> > scaling_governor": la richiesta vale solo con il governor "auto".
# thermal-engine scrive scaling_max_freq (e abbassa scaling_min_freq) solo quando cambia il livello di mitigazione
# termica; a fine mitigazione riporta il massimo a cpuinfo_max_freq. Qui non si contrasta: i limiti salvati
# tornano al prossimo "applica" o al riavvio.

PATH=/sbin:/usr/sbin:/bin:/usr/bin
CONF=/bmdefsys/etc/bm_custom.conf
CPUFREQ=/sys/devices/system/cpu/cpu0/cpufreq
# Ultima richiesta di pe_service, per riprenderla quando si torna ad "auto"
PE_REQ=/tmp/custom_cpufreq.pe

conf_get() { [ -f "$CONF" ] && sed -n "s/^$1=//p" "$CONF" | head -1; }

leggi_governor() {
	GOV=$(conf_get cpu_governor)
	case "$GOV" in auto|performance|ondemand|conservative|powersave) ;; *) GOV=auto;; esac
}

# Vero se $1 è una delle frequenze supportate dalla CPU
frequenza_ok() {
	case "$1" in ''|*[!0-9]*) return 1;; esac
	case " $(cat "$CPUFREQ/scaling_available_frequencies") " in *" $1 "*) return 0;; esac
	return 1
}

leggi_limiti() {
	HWMIN=$(cat "$CPUFREQ/cpuinfo_min_freq")
	HWMAX=$(cat "$CPUFREQ/cpuinfo_max_freq")
	FMIN=$(conf_get cpu_min_freq)
	FMAX=$(conf_get cpu_max_freq)
	frequenza_ok "$FMIN" || FMIN=$HWMIN
	frequenza_ok "$FMAX" || FMAX=$HWMAX
	if [ "$FMIN" -gt "$FMAX" ]; then
		FMIN=$HWMIN
		FMAX=$HWMAX
	fi
}

imposta_governor() {
	[ "$(cat "$CPUFREQ/scaling_governor")" = "$1" ] || echo "$1" > "$CPUFREQ/scaling_governor"
}

applica() {
	leggi_governor
	leggi_limiti
	# Il kernel rifiuta un minimo sopra il massimo attuale e viceversa: questo ordine va bene da qualunque stato
	echo "$HWMIN" > "$CPUFREQ/scaling_min_freq"
	echo "$FMAX" > "$CPUFREQ/scaling_max_freq"
	echo "$FMIN" > "$CPUFREQ/scaling_min_freq"
	if [ "$GOV" = auto ]; then
		g=$(cat "$PE_REQ" 2>/dev/null)
		# Nessuna richiesta di pe_service ancora: ondemand, come lo lascia power_config all'avvio
		case "$g" in performance|ondemand) ;; *) g=ondemand;; esac
		imposta_governor "$g"
	else
		imposta_governor "$GOV"
	fi
	return 0
}

pe() {
	case "$1" in performance|ondemand) ;; *) exit 1;; esac
	echo "$1" > "$PE_REQ"
	leggi_governor
	[ "$GOV" = auto ] && imposta_governor "$1"
	return 0
}

case "$1" in
	applica) applica;;
	pe) pe "$2";;
	*) echo "uso: $0 applica|pe <governor>" >&2; exit 1;;
esac
