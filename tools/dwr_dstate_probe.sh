#!/bin/sh
# Sola lettura: processi in stato D (contano nel load average senza usare CPU) con wchan e stack del kernel
for s in /proc/[0-9]*/stat; do p=${s%/stat}; p=${p#/proc/}; st=$(awk "{print \$3}" $s 2>/dev/null); [ "$st" = D ] || continue; echo "== pid $p $(tr "\0" " " < /proc/$p/cmdline 2>/dev/null | cut -c1-80) [$(awk "{print \$2}" $s)] wchan=$(cat /proc/$p/wchan 2>/dev/null) avvio=$(awk "{print \$22}" $s)"; head -6 /proc/$p/stack 2>/dev/null; done
cat /proc/loadavg
