#!/bin/sh
# Sola lettura: stato di miniupnpd (pid, CPU in 5 s, fd verso terminali)
P=$(pidof miniupnpd); echo "pid $P"
for p in $P; do a=$(awk "{print \$14}" /proc/$p/stat); sleep 5; b=$(awk "{print \$14}" /proc/$p/stat); echo "$p CPU $(((b - a) / 5))% stato $(awk "{print \$3}" /proc/$p/stat)"; ls -l /proc/$p/fd | grep -E "pts|tty" ; done
grep -c ":14E7 " /proc/net/udp
