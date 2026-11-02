#!/bin/sh
# Collaudo dell'applicazione all'avvio del controllo della CPU (/etc/rc5.d/S99custom_cpufreq dopo S50power_config).
#   prepara   salva bm_custom.conf in /cache/cfboot.conf.bak e scrive powersave 300000-748800 senza applicarlo
#   verifica  dopo il riavvio: controlla governor e limiti impostati all'avvio e il pe_service caricato, poi
#             ripristina bm_custom.conf e lo applica
# Uso sul device: sh /cache/dwr_cpufreq_boot.sh prepara|verifica

CF=/bmdefsys/usr/bin/custom_cpufreq.sh
CONF=/bmdefsys/etc/bm_custom.conf
BAK=/cache/cfboot.conf.bak
C=/sys/devices/system/cpu/cpu0/cpufreq
PASS=0
FAIL=0

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}

case "$1" in
prepara)
	cp -p "$CONF" "$BAK"
	grep -v '^cpu_' "$BAK" > "$CONF"
	printf 'cpu_governor=powersave\ncpu_min_freq=300000\ncpu_max_freq=748800\n' >> "$CONF"
	sync
	echo "conf di prova: $(grep '^cpu_' "$CONF" | tr '\n' ' ')"
	;;
verifica)
	echo "uptime $(cut -d' ' -f1 /proc/uptime) s"
	echo "governor $(cat $C/scaling_governor), limiti $(cat $C/scaling_min_freq)-$(cat $C/scaling_max_freq), cur $(cat $C/scaling_cur_freq), pe: $(cat /tmp/custom_cpufreq.pe 2>/dev/null)"
	ls -l /etc/rc5.d/S99custom_cpufreq /etc/init.d/custom_cpufreq "$CF"
	[ "$(cat $C/scaling_governor)" = powersave ]; check "all'avvio governor powersave (power_config aveva messo ondemand)" $?
	[ "$(cat $C/scaling_min_freq)-$(cat $C/scaling_max_freq)" = 300000-748800 ]; check "all'avvio limiti 300000-748800" $?
	[ "$(cat $C/scaling_cur_freq)" = 300000 ]; check "frequenza 300 MHz" $?
	pidof pe_service >/dev/null; check "pe_service in esecuzione ($(pidof pe_service | wc -w) processi)" $?
	ls -l /proc/[0-9]*/exe 2>/dev/null | grep pe_service | grep -q deleted; [ $? != 0 ]; check "pe_service caricato dal file modificato" $?
	[ -s "$BAK" ] && cp -p "$BAK" "$CONF" && rm -f "$BAK"
	sh "$CF" applica
	echo "ripristinato: governor $(cat $C/scaling_governor), limiti $(cat $C/scaling_min_freq)-$(cat $C/scaling_max_freq), conf: $(grep '^cpu_' "$CONF" | tr '\n' ' ')"
	echo
	echo "RISULTATO: $PASS OK, $FAIL FAIL"
	;;
*)
	echo "uso: $0 prepara|verifica" >&2
	exit 1
	;;
esac
