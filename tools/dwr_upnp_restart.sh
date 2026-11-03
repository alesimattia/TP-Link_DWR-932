#!/bin/sh
# Riavvia miniupnpd come QCMAP EnableUPNP (killall -9 + /etc/init.d/miniupnpd start) senza fargli ereditare il
# terminale della sessione adb: chiude gli fd > 2 e collega stdin, stdout e stderr a /dev/null prima dell'avvio
# (altrimenti il demone tiene aperto /dev/pts/N e la sessione adb non termina). Esito in /cache/upnp_restart.log.
# Uso sul device: sh /cache/dwr_upnp_restart.sh; cat /cache/upnp_restart.log

LOG=/cache/upnp_restart.log
for fd in $(ls /proc/self/fd); do [ "$fd" -gt 2 ] && eval "exec $fd>&-"; done
exec </dev/null >"$LOG" 2>&1
echo "prima: pid $(pidof miniupnpd)"
killall -9 miniupnpd
sleep 1
/etc/init.d/miniupnpd start
sleep 2
P=$(pidof miniupnpd)
echo "dopo: pid $P"
ls -l /proc/$P/fd | grep -E 'pts|tty' || echo "nessun terminale ereditato"
