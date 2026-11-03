#!/bin/sh
# Pagina custom della web UI del DWR-932: repeater Wi-Fi (Wi-Fi come uscita internet, modalità QCMAP AP-STA),
# potenza TX Wi-Fi, beacon interval e DTIM, governor e limiti di frequenza della CPU. Il country code non compare:
# è fissato su IT da wlan_8192c.sh.
# Con ?api=autoreboot risponde in JSON alla tab "Riavvio programmato" del popup Amministrazione della web UI
# stock (js/custom_autoreboot.js); la POST action=autoreboot salva la configurazione.
# Con ?api=lteband risponde in JSON al riquadro "Bande LTE" della tab Modalità di connessione del popup Internet
# (js/custom_lteband.js); la POST action=lteband imposta le bande LTE nel modem con AT+BMBANDPREF su /dev/smd7.
# Eseguita da lighttpd come CGI, come root.
# Autenticazione HTTP Basic verificata qui: utente e password della web UI. /bmdefsys/www/lighttpd.user contiene
# "utente:md5(password)" (la pagina di login D-Link invia CryptoJS.MD5 della password), quindi lighttpd con
# auth.require non può verificarla; lighttpd passa l'header Authorization al CGI come HTTP_AUTHORIZATION.
# Dopo 5 tentativi errati in 10 minuti l'accesso resta bloccato per 10 minuti.
# Ogni POST richiede il token anti-CSRF della pagina e termina con un redirect 303.

IWPRIV=/bmdefsys/usr/bin/rtltools/iwpriv
CONF=/bmdefsys/etc/bm_custom.conf
CFG=/bmdefsys/etc/mobileap_cfg.xml
SUPP=/bmdefsys/etc/wpa_supplicant.conf
VXD=/var/rtl8192c/wlan0-vxd
# Configurazione persistente di wlan0 (rootfs yaffs2), letta da wlan_8192c.sh a ogni inizializzazione del Wi-Fi
WL0=/var/rtl8192c/wlan0
WPA="wpa_cli -i wlan0-vxd"
USERS=/bmdefsys/www/lighttpd.user
AR=/bmdefsys/usr/bin/custom_autoreboot.sh
CF=/bmdefsys/usr/bin/custom_cpufreq.sh
CPUFREQ=/sys/devices/system/cpu/cpu0/cpufreq
TOKF=/tmp/custom_cgi.csrf
FAILF=/tmp/custom_cgi.fail
LOCK=/tmp/custom_cgi.lock
# Canale AT del modem (lo stesso di debug_mode.sh) e lock che serializza i comandi AT di custom.cgi
AT_DEV=/dev/smd7
AT_LOCK=/tmp/custom_at.lock
TAB=$(printf '\t')
# File utenti alternativo solo per i collaudi da shell: lighttpd imposta sempre GATEWAY_INTERFACE
if [ -z "$GATEWAY_INTERFACE" ] && [ -n "$CUSTOM_CGI_USERS" ]; then
	USERS=$CUSTOM_CGI_USERS
fi

# --- Autenticazione ---
nega_accesso() {
	printf 'Status: 401 Unauthorized\r\nWWW-Authenticate: Basic realm="DWR-932 impostazioni avanzate", charset="UTF-8"\r\n'
	printf 'Content-Type: text/plain; charset=utf-8\r\nCache-Control: no-store\r\n\r\n'
	echo "Accesso non autorizzato: usa utente e password della web UI del router."
	exit 0
}
credenziali_ok() {
	case "$HTTP_AUTHORIZATION" in "Basic "*) ;; *) return 1;; esac
	cred=$(printf '%s' "${HTTP_AUTHORIZATION#Basic }" | base64 -d 2>/dev/null) || return 1
	case "$cred" in *:*) ;; *) return 1;; esac
	riga=$(head -n 1 "$USERS" 2>/dev/null)
	case "$riga" in *:*) ;; *) return 1;; esac
	[ "${cred%%:*}" = "${riga%%:*}" ] || return 1
	[ "$(printf '%s' "${cred#*:}" | md5sum | cut -d' ' -f1)" = "${riga#*:}" ]
}
ora=$(date +%s)
nfail=0
t0=$ora
[ -f "$FAILF" ] && read -r nfail t0 < "$FAILF"
case "$nfail$t0" in ''|*[!0-9]*) nfail=0; t0=$ora;; esac
[ $((ora - t0)) -ge 600 ] && { nfail=0; t0=$ora; }
if [ -n "$HTTP_AUTHORIZATION" ] && [ "$nfail" -ge 5 ]; then
	printf 'Status: 429 Too Many Requests\r\nRetry-After: 600\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n'
	echo "Troppi tentativi errati: riprova tra 10 minuti."
	exit 0
fi
if ! credenziali_ok; then
	if [ -n "$HTTP_AUTHORIZATION" ]; then
		echo "$((nfail + 1)) $t0" > "$FAILF"
		sleep 2
	fi
	nega_accesso
fi
rm -f "$FAILF"
unset cred riga

# --- Token anti-CSRF, uno per avvio del device ---
if [ ! -s "$TOKF" ]; then
	umask 077
	head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n' > "$TOKF"
fi
TOK=$(cat "$TOKF")

# Testo sicuro dentro HTML (anche negli attributi)
h() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g' -e "s/'/\&#39;/g"; }
# Valore di un campo del corpo POST (i nomi usati sono solo [a-z_])
field() { printf '&%s&' "$BODY" | sed -n "s/.*&$1=\([^&]*\)&.*/\1/p"; }
redirect() { printf 'Status: 303 See Other\r\nLocation: custom.cgi?m=%s\r\nCache-Control: no-store\r\n\r\n' "$1"; exit 0; }
redirect_api() { printf 'Status: 303 See Other\r\nLocation: custom.cgi?api=autoreboot&m=%s\r\nCache-Control: no-store\r\n\r\n' "$1"; exit 0; }
redirect_lte() { printf 'Status: 303 See Other\r\nLocation: custom.cgi?api=lteband&m=%s\r\nCache-Control: no-store\r\n\r\n' "$1"; exit 0; }
deny() { printf 'Status: 403 Forbidden\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n'; echo "Richiesta rifiutata: ricarica la pagina e riprova."; exit 0; }
conf_set() {
	tmp="$CONF.tmp.$$"
	grep -v "^$1=" "$CONF" 2>/dev/null > "$tmp"
	echo "$1=$2" >> "$tmp"
	mv "$tmp" "$CONF"
	sync
}
sta_cfg_on() { grep -q '<WlanMode>AP-STA</WlanMode>' "$CFG"; }
sta_running() { pidof wpa_supplicant >/dev/null 2>&1; }
backup_once() { [ -e "$2" ] || cp -p "$1" "$2"; }
# Vero se $1 è una delle frequenze in kHz supportate dalla CPU
freq_ok() {
	case "$1" in ''|*[!0-9]*) return 1;; esac
	case " $(cat "$CPUFREQ/scaling_available_frequencies" 2>/dev/null) " in *" $1 "*) return 0;; esac
	return 1
}
# Frequenza in kHz scritta in MHz (748800 -> 748,8 MHz)
mhz() { awk -v f="$1" 'BEGIN { s = sprintf("%.1f", f / 1000); sub(/\.0$/, "", s); sub(/\./, ",", s); print s " MHz" }'; }

# --- Modem: comandi AT ---
# Invia il comando $1 su $AT_DEV e stampa la risposta senza \r, aspettando OK o ERROR per al massimo 3 s
at_cmd() {
	(
		flock 8
		out=/tmp/custom_at.$$
		: > "$out"
		timeout -t 4 cat "$AT_DEV" > "$out" 2>/dev/null &
		lettore=$!
		usleep 200000
		printf '%s\r' "$1" > "$AT_DEV"
		n=0
		while [ $n -lt 30 ] && ! grep -q -E '^(OK|ERROR|\+CME ERROR)' "$out"; do
			usleep 100000
			n=$((n + 1))
		done
		kill $lettore 2>/dev/null
		wait $lettore 2>/dev/null
		tr -d '\r' < "$out"
		rm -f "$out"
	) 8>"$AT_LOCK"
}
# Maschere di AT+BMBANDPREF in BP_GW (GSM/WCDMA), BP_LTE e BP_TDS (TD-SCDMA), in esadecimale con 0x.
# $1 = "?" per le bande abilitate, "=?" per quelle supportate dal modem. Falso se la risposta non è valida.
bandpref() {
	r=$(at_cmd "AT+BMBANDPREF$1" | sed -n 's/^+BMBANDPREF: //p' | sed 's/^support band: //' | tr -d ' ' | head -n 1)
	printf '%s' "$r" | grep -Eq '^0x[0-9A-Fa-f]{1,16},0x[0-9A-Fa-f]{1,16},0x[0-9A-Fa-f]{1,16}$' || return 1
	BP_GW=${r%%,*}
	r=${r#*,}
	BP_LTE=${r%%,*}
	BP_TDS=${r#*,}
}
# Bande LTE della maschera $1 (bit n = banda n+1), come numeri separati da virgole
bande_lte() {
	m=$(($1))
	l=""
	b=1
	while [ $b -le 64 ]; do
		[ $(((m >> (b - 1)) & 1)) = 1 ] && l="$l${l:+,}$b"
		b=$((b + 1))
	done
	echo "$l"
}

# Pagina di attesa e riavvio del device. $1 = titolo, $2 = cosa viene applicato
reboot_page() {
	sync
	printf 'Content-Type: text/html; charset=utf-8\r\nCache-Control: no-store\r\n\r\n'
	cat <<HTML
<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>DWR-932 - Riavvio</title>
<style>:root{color-scheme:light dark}body{font-family:system-ui,sans-serif;max-width:560px;margin:24px auto;padding:0 16px;line-height:1.5}</style>
</head><body><h1>$1</h1>
<p>Il router si sta riavviando per applicare $2: il Wi-Fi del DWR resta spento per circa un minuto.
Ricollega il dispositivo al Wi-Fi del DWR se non lo fa da solo.</p>
<p>La pagina si ricarica da sola tra <span id="t">90</span> secondi, oppure <a href="custom.cgi">ricaricala ora</a>.</p>
<script>var n=90;setInterval(function(){n--;if(n<=0){location.href='custom.cgi';}else{document.getElementById('t').textContent=n;}},1000);</script>
</body></html>
HTML
	setsid sh -c 'sleep 3; /sbin/reboot' </dev/null >/dev/null 2>&1 &
	exit 0
}

# Imposta la modalità QCMAP (AP oppure AP-STA) e riavvia: QCMAP la legge solo all'avvio
set_mode_and_reboot() {
	if [ "$1" = on ]; then
		backup_once "$CFG" /cache/mobileap_cfg.xml.orig
		backup_once "$SUPP" /cache/wpa_supplicant.conf.orig
		backup_once "$VXD/wlan_mode" /cache/vxd_wlan_mode.orig
		backup_once "$VXD/network_type" /cache/vxd_network_type.orig
		sed -i 's|<WlanMode>[A-Z-]*</WlanMode>|<WlanMode>AP-STA</WlanMode>|' "$CFG"
		echo 1 > "$VXD/wlan_mode"
		echo 0 > "$VXD/network_type"
		reboot_page "Repeater attivato" "la modalità"
	else
		sed -i 's|<WlanMode>[A-Z-]*</WlanMode>|<WlanMode>AP</WlanMode>|' "$CFG"
		echo 0 > "$VXD/wlan_mode"
		reboot_page "Repeater disattivato" "la modalità"
	fi
}

# --- POST: azioni ---
if [ "$REQUEST_METHOD" = "POST" ]; then
	case "$CONTENT_LENGTH" in ''|*[!0-9]*) deny;; esac
	[ "$CONTENT_LENGTH" -le 4096 ] || deny
	case "$CONTENT_TYPE" in application/x-www-form-urlencoded*) ;; *) deny;; esac
	BODY=$(head -c "$CONTENT_LENGTH")
	[ "$(field csrf)" = "$TOK" ] || deny
	if [ -n "$HTTP_ORIGIN" ] && [ "$HTTP_ORIGIN" != "https://$HTTP_HOST" ]; then
		deny
	fi
	exec 9>"$LOCK"
	flock 9

	case "$(field action)" in
	power)
		power=$(field power)
		case "$power" in 15|25|35|50|70|85|100) ;; *) redirect err_val;; esac
		$IWPRIV wlan0 set_mib powerpercent=$power >/dev/null 2>&1
		$IWPRIV wlan0 txpwr_apply >/dev/null 2>&1
		conf_set wifi_power_percent "$power"
		redirect power_ok
		;;
	beacon)
		bcn=$(field bcn)
		dtim=$(field dtim)
		case "$bcn" in 100|150|200|300) ;; *) redirect err_val;; esac
		case "$dtim" in 1|2|3|4|5) ;; *) redirect err_val;; esac
		if [ "$bcn" = "$(cat "$WL0/beacon_interval")" ] && [ "$dtim" = "$(cat "$WL0/dtim_period")" ]; then
			redirect bcn_same
		fi
		backup_once "$WL0/beacon_interval" /cache/wlan0_beacon_interval.orig
		backup_once "$WL0/dtim_period" /cache/wlan0_dtim_period.orig
		echo "$bcn" > "$WL0/beacon_interval"
		echo "$dtim" > "$WL0/dtim_period"
		# Il driver programma il beacon interval nella radio solo quando inizializza wlan0. La ricarica a caldo
		# della web UI stock (init.sh) in modalità repeater lascia wlan0-vxd associato solo per wpa_supplicant,
		# senza traffico: si applica quindi con un riavvio, in cui wlan_8192c.sh legge questi file.
		reboot_page "Beacon e DTIM salvati" "beacon interval e DTIM"
		;;
	sta_on)
		set_mode_and_reboot on
		;;
	sta_off)
		set_mode_and_reboot off
		;;
	sta_add)
		ssid=$(field ssid_hex)
		psk=$(field psk_hex)
		printf '%s' "$ssid" | grep -Eq '^([0-9a-f]{2}){1,32}$' || redirect err_ssid
		if [ -n "$psk" ]; then
			# Passphrase WPA: da 8 a 63 caratteri ASCII stampabili (0x20-0x7e)
			printf '%s' "$psk" | grep -Eq '^([2-6][0-9a-f]|7[0-9a-e]){8,63}$' || redirect err_psk
		fi
		pass=""
		[ -n "$psk" ] && pass=$(P="$psk" awk 'function hx(c) { return index("0123456789abcdef", c) - 1 }
			BEGIN { p = ENVIRON["P"]; for (i = 1; i < length(p); i += 2) printf "%c", hx(substr(p, i, 1)) * 16 + hx(substr(p, i + 1, 1)) }')
		if sta_running; then
			# Aggiunta a caldo: "reconfigure" rileggerebbe il file interrompendo la connessione in corso
			nid=$($WPA add_network 2>/dev/null | tail -1)
			case "$nid" in ''|*[!0-9]*) redirect err_val;; esac
			ok=1
			$WPA set_network "$nid" ssid "$ssid" | grep -q OK || ok=0
			if [ -n "$pass" ]; then
				$WPA set_network "$nid" psk "\"$pass\"" | grep -q OK || ok=0
				$WPA set_network "$nid" key_mgmt WPA-PSK | grep -q OK || ok=0
			else
				$WPA set_network "$nid" key_mgmt NONE | grep -q OK || ok=0
			fi
			$WPA set_network "$nid" scan_ssid 1 | grep -q OK || ok=0
			if [ "$ok" = 0 ]; then
				$WPA remove_network "$nid" >/dev/null 2>&1
				redirect err_val
			fi
			$WPA enable_network "$nid" >/dev/null 2>&1
			$WPA save_config >/dev/null 2>&1
			if $WPA status 2>/dev/null | grep -q '^wpa_state=COMPLETED'; then
				redirect sta_reserve
			fi
			# Senza scansione esplicita wpa_supplicant aspetta il ciclo autoscan (120 s)
			$WPA scan >/dev/null 2>&1
			redirect sta_added
		fi
		P="$pass" S="$ssid" awk 'BEGIN {
			p = ENVIRON["P"]
			printf "network={\n\tssid=%s\n", ENVIRON["S"]
			if (p == "") printf "\tkey_mgmt=NONE\n"
			else printf "\tpsk=\"%s\"\n\tkey_mgmt=WPA-PSK\n", p
			printf "\tscan_ssid=1\n}\n"
		}' >> "$SUPP"
		sync
		redirect sta_saved
		;;
	sta_sel|sta_del)
		id=$(field id)
		case "$id" in ''|*[!0-9]*) redirect err_val;; esac
		sta_running || redirect err_off
		$WPA list_networks | awk -F"$TAB" -v id="$id" 'NR > 1 && $1 == id { f = 1 } END { exit !f }' || redirect err_val
		if [ "$(field action)" = sta_del ]; then
			$WPA remove_network "$id" >/dev/null 2>&1
			$WPA save_config >/dev/null 2>&1
			redirect sta_deleted
		fi
		# La rete scelta prende la priorità più alta (vale anche dopo i riavvii), le altre restano di riserva
		for n in $($WPA list_networks | awk -F"$TAB" 'NR > 1 { print $1 }'); do
			$WPA set_network "$n" priority 0 >/dev/null 2>&1
		done
		$WPA set_network "$id" priority 10 >/dev/null 2>&1
		$WPA select_network "$id" >/dev/null 2>&1
		$WPA enable_network all >/dev/null 2>&1
		$WPA save_config >/dev/null 2>&1
		redirect sta_selected
		;;
	cpu)
		gov=$(field gov)
		fmin=$(field fmin)
		fmax=$(field fmax)
		case "$gov" in auto|performance|ondemand|conservative|powersave) ;; *) redirect err_val;; esac
		freq_ok "$fmin" && freq_ok "$fmax" || redirect err_val
		[ "$fmin" -le "$fmax" ] || redirect err_cpu
		conf_set cpu_governor "$gov"
		conf_set cpu_min_freq "$fmin"
		conf_set cpu_max_freq "$fmax"
		$CF applica >/dev/null 2>&1
		redirect cpu_ok
		;;
	autoreboot)
		en=$(field enable)
		hh=$(field hour)
		mm=$(field minute)
		# Giorni cron 0-6 (0 = domenica) separati da virgole, che nel corpo urlencoded arrivano come %2C
		gg=$(field days | sed 's/%2[Cc]/,/g')
		case "$en" in 0|1) ;; *) redirect_api err_val;; esac
		case "$hh" in [01][0-9]|2[0-3]) ;; *) redirect_api err_val;; esac
		case "$mm" in [0-5][0-9]) ;; *) redirect_api err_val;; esac
		if [ -n "$gg" ]; then
			printf '%s' "$gg" | grep -Eq '^[0-6](,[0-6]){0,6}$' || redirect_api err_days
		fi
		giorni=""
		for d in 1 2 3 4 5 6 0; do
			case ",$gg," in *",$d,"*) giorni="$giorni${giorni:+,}$d";; esac
		done
		[ "$en" = 1 ] && [ -z "$giorni" ] && redirect_api err_days
		conf_set autoreboot_enable "$en"
		conf_set autoreboot_time "$hh:$mm"
		# Disattivando senza giorni restano quelli salvati prima
		[ -n "$giorni" ] && conf_set autoreboot_days "$giorni"
		$AR applica >/dev/null 2>&1
		redirect_api ar_ok
		;;
	lteband)
		# Bande LTE scelte: numeri separati da virgole, che nel corpo urlencoded arrivano come %2C
		sel=$(field bands | sed 's/%2[Cc]/,/g')
		printf '%s' "$sel" | grep -Eq '^[1-9][0-9]?(,[1-9][0-9]?){0,63}$' || redirect_lte err_val
		bandpref '=?' || redirect_lte err_at
		cap=$((BP_LTE))
		bandpref '?' || redirect_lte err_at
		maschera=0
		for b in $(echo "$sel" | tr ',' ' '); do
			[ "$b" -le 64 ] || redirect_lte err_val
			bit=$((1 << (b - 1)))
			[ $((cap & bit)) != 0 ] || redirect_lte err_val
			maschera=$((maschera | bit))
		done
		[ "$maschera" = "$((BP_LTE))" ] && redirect_lte lte_same
		# In scrittura il modem legge le maschere in esadecimale SENZA 0x: con 0x le legge come 0 e risponde OK senza
		# cambiare nulla. GSM/WCDMA resta quello letto; TD-SCDMA 0 la lascia invariata (il modem non ha TD-SCDMA e un
		# valore fuori dalla sua capacità, come lo 0x3F memorizzato, darebbe ERROR).
		nuova=$(printf '%X' "$maschera")
		at_cmd "AT+BMBANDPREF=${BP_GW#0x},$nuova,0" | grep -q '^OK' || redirect_lte err_at
		bandpref '?' && [ "$((BP_LTE))" = "$maschera" ] || redirect_lte err_at
		logger -t custom.cgi "bande LTE impostate: $(bande_lte "0x$nuova")"
		redirect_lte lte_ok
		;;
	*)
		redirect err_val
		;;
	esac
fi

# --- GET: stato corrente ---
msg=$(printf '&%s&' "$QUERY_STRING" | sed -n 's/.*&m=\([a-z_]*\)&.*/\1/p')

# Stato del riavvio programmato in JSON per la tab della web UI stock: ogni valore è validato o ha formato fisso
case "&$QUERY_STRING&" in *'&api=autoreboot&'*)
	en=$(sed -n 's/^autoreboot_enable=//p' "$CONF" 2>/dev/null | head -1)
	ora=$(sed -n 's/^autoreboot_time=//p' "$CONF" 2>/dev/null | head -1)
	gg=$(sed -n 's/^autoreboot_days=//p' "$CONF" 2>/dev/null | head -1)
	[ "$en" = 1 ] || en=0
	case "$ora" in [01][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]) ;; *) ora=04:00;; esac
	printf '%s' "$gg" | grep -Eq '^[0-6](,[0-6]){0,6}$' || gg=1,2,3,4,5,6,0
	set -- $(TZ=$(cat /etc/TZ 2>/dev/null) date '+%d/%m/%Y %H:%M %z %Y')
	adesso="$1 $2"
	fuso=$3
	case "$fuso" in [+-][0-9][0-9][0-9][0-9]) ;; *) fuso="";; esac
	if [ "$4" -ge 2025 ] 2>/dev/null; then orologio=1; else orologio=0; fi
	printf 'Content-Type: application/json; charset=utf-8\r\nCache-Control: no-store\r\n\r\n'
	printf '{"enable":%s,"time":"%s","days":"%s","now":"%s","utc_offset":"%s","clock_ok":%s,"csrf":"%s","m":"%s"}\n' \
		"$en" "$ora" "$gg" "$adesso" "$fuso" "$orologio" "$TOK" "$msg"
	exit 0
	;;
esac
# Bande LTE supportate e abilitate nel modem, in JSON per il riquadro del popup Internet
case "&$QUERY_STRING&" in *'&api=lteband&'*)
	printf 'Content-Type: application/json; charset=utf-8\r\nCache-Control: no-store\r\n\r\n'
	if bandpref '=?' && cap=$BP_LTE && bandpref '?'; then
		printf '{"ok":1,"cap":[%s],"lte":[%s],"csrf":"%s","m":"%s"}\n' "$(bande_lte "$cap")" "$(bande_lte "$BP_LTE")" "$TOK" "$msg"
	else
		printf '{"ok":0,"cap":[],"lte":[],"csrf":"%s","m":"%s"}\n' "$TOK" "$msg"
	fi
	exit 0
	;;
esac
case "&$QUERY_STRING&" in *'&scan=1&'*) SCAN=1;; *) SCAN=0;; esac
case "$msg" in
	power_ok) MSG="Potenza TX applicata."; MCL=ok;;
	cpu_ok) MSG="Impostazioni della CPU applicate."; MCL=ok;;
	err_cpu) MSG="La frequenza minima non può superare la massima: nessuna modifica."; MCL=err;;
	bcn_same) MSG="Beacon e DTIM sono già impostati su questi valori: nessuna modifica."; MCL=ok;;
	sta_added) MSG="Rete salvata: connessione in corso (può richiedere fino a 30 secondi, la pagina si aggiorna da sola)."; MCL=ok; RELOAD=20;;
	sta_saved) MSG="Rete salvata: verrà usata quando il repeater è attivo."; MCL=ok;;
	sta_reserve) MSG="Rete salvata come riserva: il DWR resta sulla rete attuale. Usa Connetti per passare a quella nuova."; MCL=ok;;
	sta_selected) MSG="Connessione alla rete scelta in corso (la pagina si aggiorna da sola)."; MCL=ok; RELOAD=15;;
	sta_deleted) MSG="Rete eliminata."; MCL=ok;;
	err_ssid) MSG="Nome rete (SSID) non valido: servono da 1 a 32 byte."; MCL=err;;
	err_psk) MSG="Password non valida: servono da 8 a 63 caratteri ASCII stampabili."; MCL=err;;
	err_off) MSG="Operazione disponibile solo con il repeater attivo."; MCL=err;;
	err_val) MSG="Valore non valido: nessuna modifica."; MCL=err;;
	*) MSG="";;
esac

cur=100
[ -f "$CONF" ] && cur=$(sed -n 's/^wifi_power_percent=//p' "$CONF" | head -1)
case "$cur" in ''|*[!0-9]*) cur=100;; esac
mibpwr=$($IWPRIV wlan0 get_mib powerpercent 2>/dev/null | sed -n 's/.*get_mib:\([0-9]*\).*/\1/p')
bcn=$(cat "$WL0/beacon_interval" 2>/dev/null)
dtim=$(cat "$WL0/dtim_period" 2>/dev/null)
# Beacon interval in uso dalla radio: registro BCN_INTERVAL (read_reg stampa i byte in decimale, dal più significativo)
bcnhw=$($IWPRIV wlan0 read_reg w,554 2>/dev/null | sed -n 's/.*read_reg://p' | awk 'NF >= 2 { print $1 * 256 + $2 }')
dtimdrv=$($IWPRIV wlan0 get_mib dtimperiod 2>/dev/null | sed -n 's/.*get_mib:\([0-9]*\).*/\1/p')
apfreq=$(iwconfig wlan0 2>/dev/null | sed -n 's/.*Frequency:\([0-9.]*\) GHz.*/\1/p')
apch=$(awk -v f="$apfreq" 'BEGIN { m = int(f * 1000 + 0.5); if (m == 2484) print 14; else if (m > 0) print (m - 2407) / 5 }')
uscita=$(ip route 2>/dev/null | awk '/^default/ { for (i = 1; i <= NF; i++) if ($i == "dev") print $(i + 1); exit }')
case "$uscita" in
	wlan0-vxd) USCITA="Wi-Fi a monte (repeater)";;
	rmnet*) USCITA="Rete mobile (SIM)";;
	'') USCITA="Nessuna";;
	*) USCITA="$uscita";;
esac

if sta_cfg_on; then MODO=on; else MODO=off; fi
if sta_running; then RUN=1; else RUN=0; fi

opt() { sel=""; [ "$1" = "$cur" ] && sel=" selected"; echo "<option value=\"$1\"$sel>$1%</option>"; }
# $1 = valore, $2 = valore corrente, $3 = testo
opt2() { sel=""; [ "$1" = "$2" ] && sel=" selected"; echo "<option value=\"$1\"$sel>$3</option>"; }
csrf_input() { echo "<input type=\"hidden\" name=\"csrf\" value=\"$TOK\">"; }

printf 'Content-Type: text/html; charset=utf-8\r\nCache-Control: no-store\r\n\r\n'
cat <<'HTML'
<!doctype html>
<html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DWR-932 - Impostazioni avanzate</title>
<style>
 :root{color-scheme:light dark}
 body{font-family:system-ui,sans-serif;max-width:640px;margin:24px auto;padding:0 16px;line-height:1.5}
 h1{font-size:1.3rem} fieldset{border:1px solid #8884;border-radius:8px;margin:16px 0;padding:12px 16px}
 legend{font-weight:600} label{display:block;margin:8px 0 4px}
 select,button,input{font-size:1rem;padding:6px 10px;border-radius:6px;max-width:100%;box-sizing:border-box}
 input[type=text],input[type=password]{width:100%}
 input[type=checkbox]{width:auto;padding:0}
 button{cursor:pointer;margin-top:8px}
 .msg{padding:10px 12px;border-radius:6px;background:#2e7d3222;border:1px solid #2e7d3288}
 .msg.err{background:#c6282822;border-color:#c6282888}
 small{color:#8889}
 table{width:100%;border-collapse:collapse;margin:8px 0} td,th{text-align:left;padding:4px 6px;border-bottom:1px solid #8883;vertical-align:middle}
 th{font-weight:600} td form{display:inline;margin:0} td button{margin:0 4px 0 0;padding:3px 8px;font-size:.9rem}
 .stato td:first-child{width:40%;color:#888}
 .wrap{overflow-x:auto}
</style></head><body>
<h1>Impostazioni avanzate DWR-932</h1>
<p><small><a href="/">&larr; Web UI del router</a></small></p>
<noscript><p class="msg err">Serve JavaScript attivo per aggiungere reti al repeater.</p></noscript>
HTML
[ -n "$MSG" ] && echo "<p class=\"msg $MCL\">$(h "$MSG")</p>"
[ -n "$RELOAD" ] && echo "<span id=\"reload\" data-s=\"$RELOAD\"></span>"

# --- Sezione repeater ---
echo '<fieldset><legend>Repeater Wi-Fi (Wi-Fi come uscita internet)</legend>'
echo '<p><small>Il DWR si collega come client a una rete Wi-Fi a 2,4 GHz e la usa per uscire su internet al posto della SIM; i dispositivi restano collegati al Wi-Fi del DWR. Se la rete a monte cade, il DWR torna sulla rete mobile.</small></p>'
if [ "$MODO" = on ]; then
	stato_modo="Attivo"
	[ "$RUN" = 0 ] && stato_modo="Attivo (in attesa di riavvio)"
else
	stato_modo="Disattivato"
	[ "$RUN" = 1 ] && stato_modo="Disattivato (in attesa di riavvio)"
fi
echo '<table class="stato">'
echo "<tr><td>Modalità</td><td>$(h "$stato_modo")</td></tr>"
if [ "$RUN" = 1 ]; then
	st=$($WPA status 2>/dev/null)
	wst=$(printf '%s\n' "$st" | sed -n 's/^wpa_state=//p')
	wssid=$(printf '%s\n' "$st" | sed -n 's/^ssid=//p')
	wbssid=$(printf '%s\n' "$st" | sed -n 's/^bssid=//p')
	wfreq=$(printf '%s\n' "$st" | sed -n 's/^freq=//p')
	wip=$(printf '%s\n' "$st" | sed -n 's/^ip_address=//p')
	case "$wst" in
		COMPLETED) testo="Connesso";;
		SCANNING) testo="Ricerca della rete";;
		ASSOCIATING|ASSOCIATED|AUTHENTICATING|4WAY_HANDSHAKE|GROUP_HANDSHAKE) testo="Connessione in corso";;
		*) testo="Non connesso";;
	esac
	echo "<tr><td>Stato</td><td>$(h "$testo")</td></tr>"
	if [ -n "$wssid" ]; then
		printf '%s\n' "<tr><td>Rete a monte</td><td><span data-wpa=\"$(h "$wssid")\">$(h "$wssid")</span></td></tr>"
	fi
	if [ "$wst" = COMPLETED ]; then
		sig=$($WPA scan_results 2>/dev/null | awk -F"$TAB" -v b="$wbssid" '$1 == b { print $3; exit }')
		ch=$(awk -v f="$wfreq" 'BEGIN { if (f == 2484) print 14; else if (f > 0) print (f - 2407) / 5 }')
		[ -n "$sig" ] && echo "<tr><td>Segnale</td><td>$(h "$sig") dBm</td></tr>"
		[ -n "$ch" ] && echo "<tr><td>Canale</td><td>$(h "$ch")</td></tr>"
		echo "<tr><td>IP ottenuto</td><td>$(h "${wip:-in attesa}")</td></tr>"
	fi
fi
echo "<tr><td>Uscita internet attuale</td><td>$(h "$USCITA")</td></tr>"
[ -n "$apch" ] && echo "<tr><td>Canale Wi-Fi del DWR</td><td>$(h "$apch")</td></tr>"
echo '</table>'

if [ "$MODO" = on ]; then
	echo '<form method="post" action="custom.cgi" data-confirm="Disattivare il repeater? Il router si riavvia (circa un minuto) e torna a usare solo la rete mobile.">'
	csrf_input
	echo '<input type="hidden" name="action" value="sta_off"><button type="submit">Disattiva repeater e riavvia</button></form>'
else
	echo '<form method="post" action="custom.cgi" data-confirm="Attivare il repeater? Il router si riavvia (circa un minuto); poi potrai scegliere la rete Wi-Fi a cui collegarlo.">'
	csrf_input
	echo '<input type="hidden" name="action" value="sta_on"><button type="submit">Attiva repeater e riavvia</button></form>'
fi

if [ "$RUN" = 1 ]; then
	echo '<h3>Reti salvate</h3>'
	reti=$($WPA list_networks 2>/dev/null | awk 'NR > 1')
	if [ -z "$reti" ]; then
		echo '<p><small>Nessuna rete salvata.</small></p>'
	else
		echo '<div class="wrap"><table><tr><th>Rete</th><th>Stato</th><th></th></tr>'
		printf '%s\n' "$reti" | while IFS="$TAB" read -r nid nssid nbssid nflags; do
			case "$nflags" in
				*CURRENT*) nst="In uso";;
				*TEMP-DISABLED*) nst="Errore (password errata o rete assente)";;
				*DISABLED*) nst="Disattivata";;
				*) nst="Di riserva";;
			esac
			printf '%s\n' "<tr><td><span data-wpa=\"$(h "$nssid")\">$(h "$nssid")</span></td><td>$(h "$nst")</td><td>"
			case "$nflags" in
				*CURRENT*) ;;
				*) echo "<form method=\"post\" action=\"custom.cgi\">$(csrf_input)<input type=\"hidden\" name=\"action\" value=\"sta_sel\"><input type=\"hidden\" name=\"id\" value=\"$(h "$nid")\"><button type=\"submit\">Connetti</button></form>";;
			esac
			echo "<form method=\"post\" action=\"custom.cgi\" data-confirm=\"Eliminare questa rete?\">$(csrf_input)<input type=\"hidden\" name=\"action\" value=\"sta_del\"><input type=\"hidden\" name=\"id\" value=\"$(h "$nid")\"><button type=\"submit\">Elimina</button></form>"
			echo '</td></tr>'
		done
		echo '</table></div>'
		echo '<p><small>Per cambiare la password di una rete: eliminala e aggiungila di nuovo.</small></p>'
	fi

	echo '<h3>Reti disponibili</h3>'
	if [ "$SCAN" = 1 ]; then
		$WPA scan >/dev/null 2>&1
		sleep 6
		ris=$($WPA scan_results 2>/dev/null | awk -F"$TAB" 'NR > 1 && $5 != ""' | sort -t "$TAB" -k3 -n -r)
		if [ -z "$ris" ]; then
			echo '<p><small>Nessuna rete trovata.</small></p>'
		else
			echo '<div class="wrap"><table><tr><th>Rete</th><th>Segnale</th><th>Canale</th><th>Sicurezza</th><th></th></tr>'
			printf '%s\n' "$ris" | while IFS="$TAB" read -r sbssid sfreq ssig sflags sssid; do
				aperta=0
				case "$sflags" in
					*EAP*) sec="Enterprise (non supportata)";;
					*WPA2*) sec="WPA2";;
					*WPA*) sec="WPA";;
					*WEP*) sec="WEP (non supportata)";;
					*) sec="Aperta"; aperta=1;;
				esac
				sch=$(awk -v f="$sfreq" 'BEGIN { if (f == 2484) print 14; else print (f - 2407) / 5 }')
				printf '%s\n' "<tr><td><span data-wpa=\"$(h "$sssid")\">$(h "$sssid")</span></td><td>$(h "$ssig") dBm</td><td>$(h "$sch")</td><td>$(h "$sec")</td><td>"
				case "$sec" in
					*supportata*) ;;
					*) printf '%s\n' "<button type=\"button\" data-use=\"$(h "$sssid")\" data-open=\"$aperta\">Usa</button>";;
				esac
				echo '</td></tr>'
			done
			echo '</table></div>'
		fi
		echo '<p><a href="custom.cgi?scan=1">Ripeti la ricerca</a></p>'
	else
		echo '<p><a href="custom.cgi?scan=1">Cerca reti Wi-Fi</a> <small>(qualche secondo)</small></p>'
	fi
fi

echo '<h3>Aggiungi rete</h3>'
echo '<form method="post" action="custom.cgi" id="addnet">'
csrf_input
cat <<'HTML'
 <input type="hidden" name="action" value="sta_add">
 <input type="hidden" name="ssid_hex" id="ssid_hex">
 <input type="hidden" name="psk_hex" id="psk_hex">
 <label for="ssid">Nome della rete (SSID)</label>
 <input type="text" id="ssid" maxlength="32" autocomplete="off" required>
 <label for="pw">Password Wi-Fi</label>
 <input type="password" id="pw" maxlength="63" autocomplete="off">
 <label><input type="checkbox" id="open"> Rete aperta (senza password)</label>
 <button type="submit">Salva e collega</button>
 <p><small>Supportate reti WPA/WPA2 personali e aperte a 2,4 GHz. La password resta salvata solo sul DWR e non viene mostrata.</small></p>
</form>
</fieldset>
HTML

# --- Potenza TX e beacon/DTIM ---
echo '<form method="post" action="custom.cgi">'
csrf_input
cat <<HTML
<input type="hidden" name="action" value="power">
<fieldset><legend>Potenza TX Wi-Fi</legend>
 <label for="power">Livello di potenza di trasmissione</label>
 <select id="power" name="power">
HTML
for v in 100 85 70 50 35 25 15; do opt $v; done
cat <<HTML
 </select>
 <button type="submit">Applica</button>
 <p><small>Valore driver corrente: powerpercent=$(h "${mibpwr:-?}"). 100% = potenza piena, valori più bassi riducono consumo e copertura. Persistente al riavvio.</small></p>
</fieldset>
</form>
HTML

echo '<form method="post" action="custom.cgi" data-confirm="Applicare beacon e DTIM? Il router si riavvia (circa un minuto) e i dispositivi collegati si disconnettono.">'
csrf_input
cat <<HTML
<input type="hidden" name="action" value="beacon">
<fieldset><legend>Beacon e DTIM</legend>
 <label for="bcn">Beacon interval</label>
 <select id="bcn" name="bcn">
HTML
for v in 100 150 200 300; do
	t="$v TU (circa $((v * 1024 / 1000)) ms)"
	[ "$v" = 100 ] && t="$t, predefinito"
	opt2 "$v" "$bcn" "$t"
done
cat <<HTML
 </select>
 <label for="dtim">DTIM period (ogni quanti beacon)</label>
 <select id="dtim" name="dtim">
HTML
for v in 1 2 3 4 5; do
	t=$v
	[ "$v" = 1 ] && t="1, predefinito"
	opt2 "$v" "$dtim" "$t"
done
case "$bcn$dtim" in
	''|*[!0-9]*) dtms="?";;
	*) dtms=$((bcn * dtim * 1024 / 1000));;
esac
cat <<HTML
 </select>
 <button type="submit">Applica e riavvia</button>
 <p><small>I dispositivi in risparmio energetico si svegliano a ogni beacon DTIM per ricevere broadcast e multicast: un DTIM più alto allunga la batteria di telefoni e tablet, ma ritarda broadcast e multicast (ARP, ricerca di stampanti, AirPlay, Chromecast). Un beacon interval più alto riduce il tempo radio occupato dai beacon, ma alcuni dispositivi possono metterci di più a trovare la rete. Sul consumo del DWR l'effetto è minimo.</small></p>
 <p><small>Intervallo DTIM salvato: circa $(h "$dtms") ms. In uso: beacon=$(h "${bcnhw:-?}") TU (radio), DTIM=$(h "${dtimdrv:-?}") (driver). Persistente al riavvio; il reset di fabbrica riporta 100 e 1.</small></p>
</fieldset>
</form>
HTML

# --- CPU: governor e limiti di frequenza ---
cgov=$(sed -n 's/^cpu_governor=//p' "$CONF" 2>/dev/null | head -1)
case "$cgov" in auto|performance|ondemand|conservative|powersave) ;; *) cgov=auto;; esac
hwmin=$(cat "$CPUFREQ/cpuinfo_min_freq" 2>/dev/null)
hwmax=$(cat "$CPUFREQ/cpuinfo_max_freq" 2>/dev/null)
cmin=$(sed -n 's/^cpu_min_freq=//p' "$CONF" 2>/dev/null | head -1)
cmax=$(sed -n 's/^cpu_max_freq=//p' "$CONF" 2>/dev/null | head -1)
freq_ok "$cmin" || cmin=$hwmin
freq_ok "$cmax" || cmax=$hwmax
if [ "$cmin" -gt "$cmax" ] 2>/dev/null; then cmin=$hwmin; cmax=$hwmax; fi
govnow=$(cat "$CPUFREQ/scaling_governor" 2>/dev/null)
fnow=$(cat "$CPUFREQ/scaling_cur_freq" 2>/dev/null)
lmin=$(cat "$CPUFREQ/scaling_min_freq" 2>/dev/null)
lmax=$(cat "$CPUFREQ/scaling_max_freq" 2>/dev/null)
tis=$(awk '{ f[NR] = $1; t[NR] = $2; s += $2 }
	END { if (s > 0) for (i = 1; i <= NR; i++) { m = sprintf("%.1f", f[i] / 1000); sub(/\.0$/, "", m); sub(/\./, ",", m)
		printf "%s%s MHz %d%%", (i > 1 ? ", " : ""), m, int(t[i] * 100 / s + 0.5) } }' "$CPUFREQ/stats/time_in_state" 2>/dev/null)
temp=""
for z in /sys/class/thermal/thermal_zone*; do
	case "$(cat "$z/type" 2>/dev/null)" in tsens_tz_sensor*) ;; *) continue;; esac
	t=$(cat "$z/temp" 2>/dev/null)
	case "$t" in ''|*[!0-9]*) continue;; esac
	[ -z "$temp" ] || [ "$t" -gt "$temp" ] && temp=$t
done
# pe_service modificato: 1 = attivo, 2 = installato ma in uso ancora quello vecchio (fino al riavvio), 0 = originale
pe_mod=0
grep -q custom_cpufreq.sh /bmdefsys/usr/bin/pe_service 2>/dev/null && pe_mod=1
for p in $(pidof pe_service); do
	ls -l "/proc/$p/exe" 2>/dev/null | grep -q deleted && pe_mod=2
done

echo '<form method="post" action="custom.cgi">'
csrf_input
echo '<input type="hidden" name="action" value="cpu">'
echo '<fieldset><legend>CPU: governor e frequenze</legend>'
echo '<table class="stato">'
govtxt=$govnow
[ "$cgov" = auto ] && govtxt="$govnow (scelto da pe_service)"
echo "<tr><td>Governor in uso</td><td>$(h "$govtxt")</td></tr>"
echo "<tr><td>Frequenza attuale</td><td>$(h "$(mhz "$fnow")")</td></tr>"
echo "<tr><td>Limiti attuali</td><td>$(h "$(mhz "$lmin") – $(mhz "$lmax")")</td></tr>"
[ -n "$tis" ] && echo "<tr><td>Tempo per frequenza dall'avvio</td><td>$(h "$tis")</td></tr>"
[ -n "$temp" ] && echo "<tr><td>Temperatura (sensore più caldo)</td><td>$(h "$temp") °C</td></tr>"
echo '</table>'
if [ "$lmin" != "$cmin" ] || [ "$lmax" != "$cmax" ]; then
	echo '<p><small>I limiti attuali sono diversi da quelli salvati: li ha cambiati la protezione termica (thermal-engine) oppure non sono ancora stati applicati. Tornano quelli salvati con Applica o al riavvio.</small></p>'
fi
case "$pe_mod" in
	0) echo '<p class="msg err">pe_service non è la versione modificata: con un governor diverso da Automatico può sostituirlo con performance o ondemand.</p>';;
	2) echo '<p class="msg err">pe_service modificato installato: diventa attivo al prossimo riavvio del router. Fino ad allora può sostituire il governor scelto con performance o ondemand.</p>';;
esac
echo ' <label for="gov">Governor</label>'
echo ' <select id="gov" name="gov">'
opt2 auto "$cgov" "Automatico (originale D-Link), predefinito"
opt2 performance "$cgov" "performance: sempre alla frequenza massima"
opt2 ondemand "$cgov" "ondemand: sale subito sotto carico, scende a riposo"
opt2 conservative "$cgov" "conservative: sale e scende per gradi"
opt2 powersave "$cgov" "powersave: sempre alla frequenza minima"
echo ' </select>'
for campo in fmin fmax; do
	if [ "$campo" = fmin ]; then
		echo ' <label for="fmin">Frequenza minima</label>'
		fsel=$cmin
	else
		echo ' <label for="fmax">Frequenza massima</label>'
		fsel=$cmax
	fi
	echo " <select id=\"$campo\" name=\"$campo\">"
	for f in $(cat "$CPUFREQ/scaling_available_frequencies" 2>/dev/null); do
		case "$f" in *[!0-9]*) continue;; esac
		opt2 "$f" "$fsel" "$(mhz "$f")"
	done
	echo ' </select>'
done
echo ' <button type="submit">Applica</button>'
echo "<p><small>Automatico è il comportamento originale del firmware: governor ondemand, che pe_service sostituisce con performance quando il carico della CPU supera il 51% e ripristina dopo circa 2 minuti di carico basso. Le frequenze minima e massima valgono per tutti i governor: performance usa la massima, powersave la minima. Frequenze basse riducono consumo e calore, ma anche la velocità del Wi-Fi e dell'instradamento. Applicato subito, persistente al riavvio; il reset di fabbrica non lo cambia.</small></p>"
echo "<p><small>Se la temperatura sale troppo, la protezione termica (thermal-engine) abbassa la frequenza massima; quando la temperatura rientra riporta i limiti a $(h "$(mhz "$hwmin")") – $(h "$(mhz "$hwmax")") fino al prossimo Applica o riavvio.</small></p>"
echo '</fieldset>'
echo '</form>'

cat <<'HTML'
<script>
(function () {
  // Byte di una stringa codificata da wpa_supplicant (printf_encode: \" \\ \n \r \t \e \xHH)
  function wpaBytes(s) {
    var out = [], i, c, n;
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i);
      if (c === '\\' && i + 1 < s.length) {
        n = s.charAt(++i);
        if (n === 'x' && i + 2 < s.length) { out.push(parseInt(s.substr(i + 1, 2), 16)); i += 2; }
        else if (n === 'n') out.push(10);
        else if (n === 'r') out.push(13);
        else if (n === 't') out.push(9);
        else if (n === 'e') out.push(27);
        else out.push(n.charCodeAt(0));
      } else {
        out.push(c.charCodeAt(0) & 0xff);
      }
    }
    return out;
  }
  function toHex(bytes) {
    var s = '', i;
    for (i = 0; i < bytes.length; i++) s += ('0' + bytes[i].toString(16)).slice(-2);
    return s;
  }
  function utf8(str) { return Array.prototype.slice.call(new TextEncoder().encode(str)); }
  function text(bytes) {
    try { return new TextDecoder('utf-8').decode(new Uint8Array(bytes)); }
    catch (e) { return String.fromCharCode.apply(null, bytes); }
  }

  var i, els = document.querySelectorAll('[data-wpa]');
  for (i = 0; i < els.length; i++) els[i].textContent = text(wpaBytes(els[i].getAttribute('data-wpa')));

  var form = document.getElementById('addnet');
  var ssid = document.getElementById('ssid'), pw = document.getElementById('pw'), open = document.getElementById('open');
  var scelta = null;
  var usa = document.querySelectorAll('button[data-use]');
  for (i = 0; i < usa.length; i++) {
    usa[i].addEventListener('click', function () {
      var b = wpaBytes(this.getAttribute('data-use'));
      scelta = { testo: text(b), hex: toHex(b) };
      ssid.value = scelta.testo;
      open.checked = this.getAttribute('data-open') === '1';
      pw.value = '';
      (open.checked ? ssid : pw).focus();
      form.scrollIntoView();
    });
  }
  open.addEventListener('change', function () { pw.disabled = open.checked; if (open.checked) pw.value = ''; });

  form.addEventListener('submit', function (e) {
    var sh = (scelta && ssid.value === scelta.testo) ? scelta.hex : toHex(utf8(ssid.value));
    if (sh.length < 2 || sh.length > 64) { e.preventDefault(); alert('Nome della rete non valido: da 1 a 32 byte.'); return; }
    var ph = '';
    if (!open.checked) {
      if (!/^[\x20-\x7e]{8,63}$/.test(pw.value)) { e.preventDefault(); alert('La password deve avere da 8 a 63 caratteri ASCII stampabili.'); return; }
      for (var k = 0; k < pw.value.length; k++) ph += ('0' + pw.value.charCodeAt(k).toString(16)).slice(-2);
    }
    document.getElementById('ssid_hex').value = sh;
    document.getElementById('psk_hex').value = ph;
  });

  var conf = document.querySelectorAll('form[data-confirm]');
  for (i = 0; i < conf.length; i++) {
    conf[i].addEventListener('submit', function (e) { if (!confirm(this.getAttribute('data-confirm'))) e.preventDefault(); });
  }

  var r = document.getElementById('reload');
  if (r) setTimeout(function () { location.replace('custom.cgi'); }, parseInt(r.getAttribute('data-s'), 10) * 1000);
})();
</script>
</body></html>
HTML
