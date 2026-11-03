#!/bin/sh
# Stato del dispositivo in JSON per il riquadro "Internet" della home della web UI stock (js/custom_status.js):
# temperature, CPU, memoria, batteria, Wi-Fi, connessioni NAT e velocità della WAN. Sola lettura, nessuna azione.
# Eseguito da lighttpd come CGI, come root (qualsiasi file in /cgi-bin/ è un CGI).
#
# Accesso: solo dall'IP dell'ultimo login della web UI D-Link. qcmap_fcgi scrive /www/qcmap_session al login e al
# logout (31 byte: tv_sec, tv_usec, IP in testo su 16 byte dall'offset 8, timeout, "APP"; al logout l'IP diventa
# 0.0.0.0). Il token di sessione resta nella memoria di qcmap_fcgi e un CGI non può verificarlo, quindi l'accesso
# vale per quell'IP fino al logout o al login successivo. L'header Host deve essere un indirizzo IPv4 (difesa dal
# DNS rebinding da pagine web aperte sullo stesso PC). La risposta negata è un 403 senza WWW-Authenticate, così
# il browser non chiede credenziali.
#
# Temperatura della batteria: il driver aw3215 espone solo il codice ADC grezzo. La stima usa la tensione
# raziometrica del canale MPP_02 del PMIC (µV riferiti a 1,8 V) con un NTC da 10 kΩ (B 3435) e un pull-up da 27 kΩ:
# con questi valori la soglia "batteria calda" del driver (codice 26855) corrisponde a 55 °C.

SESS=/www/qcmap_session
PREV=/tmp/custom_status.prev
# File di sessione alternativo solo per i collaudi da shell: lighttpd imposta sempre GATEWAY_INTERFACE
if [ -z "$GATEWAY_INTERFACE" ] && [ -n "$CUSTOM_STATUS_SESS" ]; then
	SESS=$CUSTOM_STATUS_SESS
fi

rifiuta() {
	printf 'Status: 403 Forbidden\r\nContent-Type: application/json\r\nCache-Control: no-store\r\n\r\n'
	echo '{"ok":0}'
	exit 0
}
[ "$REQUEST_METHOD" = "GET" ] || rifiuta
case "$HTTP_HOST" in ''|*[!0-9.:]*) rifiuta;; esac
ip=$(dd if="$SESS" bs=1 skip=8 count=16 2>/dev/null | tr -d '\000')
case "$ip" in ''|0.0.0.0|*[!0-9.]*) rifiuta;; esac
[ "$ip" = "${REMOTE_ADDR#::ffff:}" ] || rifiuta

printf 'Content-Type: application/json\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\n\r\n'
VADC=$(ls -d /sys/devices/qpnp-vadc-* 2>/dev/null | head -n 1)
exec awk -v vadc="$VADC" -v prevf="$PREV" '
# Prima riga di un file ("" se manca)
function rd(f,   v) { v = ""; if ((getline v < f) <= 0) v = ""; close(f); return v }
# Numero decimale oppure null
function num(v) { return (v ~ /^-?[0-9]+(\.[0-9]+)?$/) ? v : "null" }
# Stringa JSON con i soli caratteri ammessi
function str(v) { gsub(/[^A-Za-z0-9 ._()+-]/, "", v); return "\"" v "\"" }
# Valore "Result:<n>" di un canale del PMIC
function adc(c,   v) { v = rd(vadc "/" c); if (v !~ /^Result:-?[0-9]+/) return ""; sub(/^Result:/, "", v); sub(/ .*/, "", v); return v }
# Testo che segue la chiave k nella prima riga di f che la contiene ("k: valore")
function campo(f, k,   l, r) {
	r = ""
	while ((getline l < f) > 0) if (r == "" && index(l, k)) { r = substr(l, index(l, k) + length(k)); sub(/^[ \t]+/, "", r) }
	close(f); return r
}
BEGIN {
	split(rd("/proc/uptime"), a, " "); up = a[1]

	# Temperature: SoC = sensore tsens più caldo; PMIC in m°C; oscillatore XO in °C
	soc = ""; tl = ""
	for (i = 0; i < 16; i++) {
		t = rd("/sys/class/thermal/thermal_zone" i "/type")
		if (t == "") break
		if (t !~ /^tsens_tz_sensor/) continue
		v = rd("/sys/class/thermal/thermal_zone" i "/temp")
		if (v !~ /^-?[0-9]+$/) continue
		if (tl != "") tl = tl " "
		tl = tl v
		if (soc == "" || v + 0 > soc + 0) soc = v
	}
	pmic = adc("die_temp"); if (pmic != "") pmic = sprintf("%.1f", pmic / 1000)
	xo = adc("xo_therm_amux")
	bt = ""; mpp = adc("MPP_02_temperature")
	if (mpp ~ /^[0-9]+$/ && mpp + 0 > 0 && mpp + 0 < 1800000) {
		r = mpp / 1800000; rt = 27000 * r / (1 - r)
		bt = sprintf("%.1f", 1 / (1 / 298.15 + log(rt / 10000) / 3435) - 273.15)
	}

	# CPU
	C = "/sys/devices/system/cpu/cpu0/cpufreq"
	n = split(rd("/proc/stat"), s, " "); tot = 0
	for (i = 2; i <= n; i++) tot += s[i]
	idle = s[5] + s[6]
	split(rd("/proc/loadavg"), la, " ")

	# Memoria: libera = MemFree + Buffers + Cached (kernel 3.4 senza MemAvailable)
	while ((getline l < "/proc/meminfo") > 0) {
		split(l, m, /[: \t]+/)
		if (m[1] == "MemTotal") mt = m[2]
		else if (m[1] == "MemFree" || m[1] == "Buffers" || m[1] == "Cached") mf += m[2]
	}
	close("/proc/meminfo")

	# Batteria e alimentazione
	B = "/sys/class/power_supply"
	mv = rd(B "/battery/voltage_now")
	if (mv ~ /^[0-9]+$/ && mv + 0 > 100000) mv = int(mv / 1000)

	# Wi-Fi (driver Realtek): client associati, canale, larghezza in uso, velocità TX più recente
	nc = 0
	while ((getline l < "/proc/wlan0/sta_info") > 0) if (l ~ /hwaddr/) nc++
	close("/proc/wlan0/sta_info")
	ch = campo("/proc/wlan0/mib_rf", "dot11channel:")
	bw = campo("/proc/wlan0/mib_all", "currBW(op):")
	txr = campo("/proc/wlan0/stats", "cur_tx_rate:")

	# Traffico WAN: interfacce rmnet (rete mobile) e wlan0-vxd (repeater)
	rx = 0; tx = 0
	while ((getline l < "/proc/net/dev") > 0) {
		if (l !~ /:/) continue
		sub(/:/, " ", l); n = split(l, f, " ")
		if (f[1] ~ /^rmnet[0-9]+$/ || f[1] == "wlan0-vxd") { rx += f[2]; tx += f[10] }
	}
	close("/proc/net/dev")

	# Differenze rispetto alla richiesta precedente (utilizzo CPU e velocità)
	cpu = "null"; rxs = "null"; txs = "null"
	if ((getline l < prevf) > 0) {
		split(l, p, " "); dt = up - p[1]; dtot = tot - p[2]
		if (dtot > 0) cpu = sprintf("%d", 100 * (dtot - (idle - p[3])) / dtot + 0.5)
		if (dt >= 1 && rx + 0 >= p[4] + 0 && tx + 0 >= p[5] + 0) { rxs = sprintf("%d", (rx - p[4]) / dt); txs = sprintf("%d", (tx - p[5]) / dt) }
	}
	close(prevf)
	printf "%s %.0f %.0f %.0f %.0f\n", up, tot, idle, rx, tx > prevf
	close(prevf)

	printf "{\"ok\":1,\"uptime\":%s", num(sprintf("%d", up))
	printf ",\"temp\":{\"soc\":%s,\"soc_all\":%s,\"pmic\":%s,\"xo\":%s,\"batt\":%s,\"batt_uv\":%s}", num(soc), str(tl), num(pmic), num(xo), num(bt), num(mpp)
	printf ",\"cpu\":{\"cur\":%s,\"gov\":%s,\"min\":%s,\"max\":%s,\"hwmin\":%s,\"hwmax\":%s,\"usage\":%s,\"load\":%s}", num(rd(C "/scaling_cur_freq")), str(rd(C "/scaling_governor")), num(rd(C "/scaling_min_freq")), num(rd(C "/scaling_max_freq")), num(rd(C "/cpuinfo_min_freq")), num(rd(C "/cpuinfo_max_freq")), cpu, str(la[1] " " la[2] " " la[3])
	printf ",\"mem\":{\"total\":%s,\"free\":%s}", num(mt), num(mf + 0)
	printf ",\"batt\":{\"cap\":%s,\"mv\":%s,\"status\":%s,\"health\":%s,\"present\":%s,\"ac\":%s,\"usb\":%s}", num(rd(B "/battery/capacity")), num(mv), str(rd(B "/battery/status")), str(rd(B "/battery/health")), num(rd(B "/battery/present")), num(rd(B "/ac/online")), num(rd(B "/usb/online"))
	printf ",\"wifi\":{\"clients\":%d,\"chan\":%s,\"bw\":%s,\"rate\":%s}", nc, num(ch), str(bw), str(txr)
	printf ",\"nat\":%s,\"nat_max\":%s", num(rd("/proc/sys/net/netfilter/nf_conntrack_count")), num(rd("/proc/sys/net/netfilter/nf_conntrack_max"))
	printf ",\"wan\":{\"rx\":%s,\"tx\":%s}}\n", rxs, txs
}'
