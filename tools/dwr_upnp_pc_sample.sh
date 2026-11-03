#!/bin/sh
# Sola lettura: individua il thread di miniupnpd che consuma CPU e campiona il suo program counter utente
# (campo 30 kstkeip di /proc/PID/task/TID/stat, cioè il PC salvato all'ultima interruzione) e lo stack pointer;
# stampa anche la mappa di memoria per tradurre gli indirizzi in binario o libreria.
# Uso sul device: sh /cache/dwr_upnp_pc_sample.sh [numero di campioni]

N=${1:-200}
P=$(pidof miniupnpd | cut -d' ' -f1)
[ -n "$P" ] || { echo "miniupnpd non in esecuzione"; exit 0; }
echo "pid $P"
echo "##### thread: tid stato utime stime kstkeip kstkesp"
for t in /proc/$P/task/*; do
	awk -v t="$(basename $t)" '{printf "%s %s utime=%s stime=%s pc=%x sp=%x\n", t, $3, $14, $15, $30, $29}' $t/stat
	echo "   wchan=$(cat $t/wchan 2>/dev/null) ctxt=$(grep -E 'voluntary' $t/status | awk '{printf "%s ", $2}')"
done
# Thread con più tempo utente
H=$(for t in /proc/$P/task/*; do awk -v t="$(basename $t)" '{print $14, t}' $t/stat; done | sort -rn | head -1 | cut -d' ' -f2)
echo "##### $N campioni del PC del thread $H"
i=0
while [ $i -lt "$N" ]; do
	awk '{printf "%x\n", $30}' /proc/$P/task/$H/stat
	i=$((i + 1))
done | sort | uniq -c | sort -rn | head -25
echo "##### registri lr (link register) non disponibili da /proc; stack pointer in 20 campioni"
i=0
while [ $i -lt 20 ]; do awk '{printf "%x\n", $29}' /proc/$P/task/$H/stat; i=$((i + 1)); done | sort | uniq -c
echo "##### mappa di memoria"
cat /proc/$P/maps
