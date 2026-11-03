#!/bin/sh
# Sonda in sola lettura per blocco bande e carrier aggregation del DWR-932 fw 01.11: chi tiene aperti i canali AT
# (/dev/smd*), strumenti diag/QMI presenti, risposte del modem ai soli comandi di lettura (forme "?" e "=?") di
# AT+BMBANDPREF, AT$QCBANDPREF, AT+BMBANDLOCK, AT+BMSYSINFO e simili. Nessuna scrittura NV, nessuna forma "=valore".
# Uso sul device: sh /cache/dwr_band_probe.sh > /cache/band_probe.txt 2>&1

sez() { echo; echo "##### $1"; }

sez "processi con /dev/smd* o /dev/diag aperti"
for p in /proc/[0-9]*; do
	l=$(ls -l $p/fd 2>/dev/null | grep -E '/dev/(smd[0-9]+|diag|smdcntl[0-9]+|qmi[0-9]+|at_)' | sed 's/.*-> //' | sort -u | tr '\n' ' ')
	[ -n "$l" ] && echo "${p#/proc/} $(tr '\0' ' ' < $p/cmdline | cut -c1-60): $l"
done
ls -l /dev/smd* /dev/diag* 2>&1 | head -30

sez "strumenti diag/QMI/AT"
for d in /usr/bin /usr/sbin /bin /sbin /bmdefsys/usr/bin; do
	ls $d 2>/dev/null | grep -i -E 'diag|qmi|nv|efs|atcmd|atfwd|port.bridge|at_|qcmap|nas|band|modem|rild|ril' | sed "s|^|$d/|"
done
ls /usr/lib | grep -i -E 'diag|qmi|nas|qcmap' | head -30

at() {
	# $1 = comando; risposta raccolta per 2 s
	rm -f /tmp/band_probe.at
	timeout -t 3 cat /dev/smd7 > /tmp/band_probe.at 2>/dev/null &
	sleep 1
	printf '%s\r' "$1" > /dev/smd7
	sleep 2
	echo ">>> $1"
	tr -d '\r' < /tmp/band_probe.at | grep -v '^$'
	wait 2>/dev/null
}

sez "AT di sola lettura su /dev/smd7"
for c in 'AT+BMBANDPREF?' 'AT+BMBANDPREF=?' 'AT$QCBANDPREF?' 'AT$QCBANDPREF=?' 'AT+BMBANDLOCK?' 'AT+BMBANDLOCK=?' \
	'AT+BMBAND?' 'AT+BMBAND=?' 'AT+BMSYSINFO?' 'AT+BMSYSINFO=?' 'AT+BMSTBW?' 'AT+BMSTBW=?' 'AT+BMCELLINFO?' 'AT+BMCELLINFO=?' \
	'AT+BMTCELLINFO?' 'AT+BMTCELLINFO=?' 'AT+BMMODPREF?' 'AT+BMMODPREF=?' 'AT+BMLOCKCELL?' 'AT+BMLOCKCELL=?' 'AT+BMCMD=?'; do
	at "$c"
done
rm -f /tmp/band_probe.at
