#!/bin/sh
# Collaudo end-to-end del pe_service modificato (dopo il riavvio che lo carica): con il governor "auto" il carico
# della CPU deve portare a performance e il ritorno a riposo a ondemand (circa 2 minuti), come nel firmware
# originale; con un governor manuale le richieste di pe_service vanno registrate ma ignorate.
# Il carico è un ciclo di shell a vuoto per 15 secondi. Dura circa 10 minuti: si stacca dalla sessione adb e scrive
# in /cache/cpufreq_e2e.log, che termina con la riga FINE. Nel frattempo niente comandi adb frequenti: ogni picco di
# carico sopra il 51% azzera il conteggio di pe_service e ritarda il ritorno a ondemand.
# Uso sul device: sh /cache/dwr_cpufreq_e2e.sh

LOG=/cache/cpufreq_e2e.log
if [ "$1" != --figlio ]; then
	setsid sh "$0" --figlio </dev/null >"$LOG" 2>&1 &
	# Senza attesa la chiusura della sessione adb uccide il figlio prima che setsid lo stacchi
	sleep 2
	echo "avviato: log in $LOG"
	exit 0
fi
# Niente descrittori ereditati da adb shell (terminale, socket): la sessione adb resterebbe appesa
for fd in $(ls /proc/self/fd); do [ "$fd" -gt 2 ] && eval "exec $fd>&-"; done

CF=/bmdefsys/usr/bin/custom_cpufreq.sh
CONF=/bmdefsys/etc/bm_custom.conf
C=/sys/devices/system/cpu/cpu0/cpufreq
PE_REQ=/tmp/custom_cpufreq.pe
PASS=0
FAIL=0

check() {
	if [ "$2" = 0 ]; then PASS=$((PASS + 1)); echo "OK   $1"; else FAIL=$((FAIL + 1)); echo "FAIL $1"; fi
}
t() { cut -d. -f1 /proc/uptime; }
gov() { cat $C/scaling_governor; }
# Attende fino a $2 secondi che il governor diventi $1; stampa i secondi trascorsi
attendi_gov() {
	i=0
	while [ "$(gov)" != "$1" ] && [ "$i" -lt "$2" ]; do sleep 1; i=$((i + 1)); done
	echo "$i"
	[ "$(gov)" = "$1" ]
}
carico_avvia() { ( while :; do :; done ) & CARICO=$!; }
carico_ferma() { kill "$CARICO" 2>/dev/null; wait "$CARICO" 2>/dev/null; }

echo "inizio: uptime $(t) s, governor $(gov), limiti $(cat $C/scaling_min_freq)-$(cat $C/scaling_max_freq), pe: $(cat $PE_REQ 2>/dev/null)"
echo "conf: $(grep '^cpu_' "$CONF" | tr '\n' ' ')"
md5sum /bmdefsys/usr/bin/pe_service
for p in $(pidof pe_service); do echo "pe_service $p: $(ls -l /proc/$p/exe | sed 's/.*-> //')"; done
ls -l /proc/[0-9]*/exe 2>/dev/null | grep pe_service | grep -q deleted; [ $? != 0 ]; check "pe_service in esecuzione = file modificato (nessun exe cancellato)" $?
grep -q custom_cpufreq.sh /bmdefsys/usr/bin/pe_service; check "pe_service su disco modificato" $?
cp -p "$CONF" /tmp/e2e.conf.bak

echo "== auto: riposo"
grep -v '^cpu_' /tmp/e2e.conf.bak > "$CONF"
printf 'cpu_governor=auto\ncpu_min_freq=300000\ncpu_max_freq=998400\n' >> "$CONF"
sh "$CF" applica
s=$(attendi_gov ondemand 240); r=$?
check "auto a riposo: ondemand (dopo $s s)" $r
[ "$(cat $PE_REQ 2>/dev/null)" = ondemand ]; check "ultima richiesta di pe_service: ondemand" $?

echo "== auto: carico"
carico_avvia
s=$(attendi_gov performance 15); r=$?
check "auto sotto carico: performance (dopo $s s)" $r
[ "$(cat $PE_REQ)" = performance ]; check "richiesta di pe_service registrata: performance" $?
sleep 3
f=$(cat $C/scaling_cur_freq)
[ "$f" = 998400 ]; check "sotto carico a 998,4 MHz (letto $f)" $?
carico_ferma
s=$(attendi_gov ondemand 240); r=$?
check "auto dopo il carico: torna ondemand (dopo $s s)" $r

echo "== manuale (powersave, 300-748,8 MHz): carico"
grep -v '^cpu_' /tmp/e2e.conf.bak > "$CONF"
printf 'cpu_governor=powersave\ncpu_min_freq=300000\ncpu_max_freq=748800\n' >> "$CONF"
sh "$CF" applica
rm -f "$PE_REQ"
carico_avvia
cambi=0
i=0
while [ "$i" -lt 15 ]; do
	[ "$(gov)" = powersave ] || cambi=$((cambi + 1))
	sleep 1
	i=$((i + 1))
done
f=$(cat $C/scaling_cur_freq)
carico_ferma
[ "$cambi" = 0 ]; check "powersave mantenuto per 15 s sotto carico" $?
[ "$f" = 300000 ]; check "powersave sotto carico a 300 MHz (letto $f)" $?
[ "$(cat $PE_REQ 2>/dev/null)" = performance ]; check "richiesta performance di pe_service registrata e ignorata" $?

echo "== ritorno ad auto"
grep -v '^cpu_' /tmp/e2e.conf.bak > "$CONF"
printf 'cpu_governor=auto\ncpu_min_freq=300000\ncpu_max_freq=998400\n' >> "$CONF"
sh "$CF" applica
[ "$(gov)" = performance ]; check "auto riprende la richiesta in sospeso: performance" $?
s=$(attendi_gov ondemand 240); r=$?
check "poi pe_service torna a ondemand (dopo $s s)" $r
[ "$(cat $C/scaling_min_freq)-$(cat $C/scaling_max_freq)" = 300000-998400 ]; check "limiti 300000-998400" $?

echo "== statistiche"
cat $C/stats/time_in_state
echo "transizioni: $(cat $C/stats/total_trans)"
for z in /sys/class/thermal/thermal_zone*; do echo "$(cat $z/type) $(cat $z/temp)"; done
logread 2>/dev/null | grep -i -E 'pe_service|custom_cpufreq' | tail -5

cp -p /tmp/e2e.conf.bak "$CONF"
rm -f /tmp/e2e.conf.bak
sh "$CF" applica
echo "fine: governor $(gov), limiti $(cat $C/scaling_min_freq)-$(cat $C/scaling_max_freq), conf: $(grep '^cpu_' "$CONF" | tr '\n' ' ')"
echo
echo "RISULTATO: $PASS OK, $FAIL FAIL"
echo FINE
