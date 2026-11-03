#!/bin/sh
# Collaudo da shell di custom_status.cgi sul DWR-932 (prima dell'installazione): controlli di accesso con un file
# di sessione finto nel formato di /www/qcmap_session, JSON prodotto, tempo di esecuzione.
# Il file di sessione vero non viene toccato. Uso: sh /cache/dwr_status_cgitest.sh [/cache/custom_status.cgi.new]

CGI=${1:-/cache/custom_status.cgi.new}
S=/tmp/test_status_sess
ok=0; ko=0
esito() { if [ "$1" = "$2" ]; then ok=$((ok + 1)); echo "OK   $3"; else ko=$((ko + 1)); echo "FAIL $3 (atteso $2, ottenuto $1)"; fi; }
# Stato HTTP: 403 se la prima riga è "Status: 403", altrimenti 200
stato() { case "$(head -n 1)" in "Status: 403"*) echo 403;; *) echo 200;; esac; }
# Sessione finta: tv_sec, tv_usec, IP su 16 byte, timeout, "APP" (31 byte)
sess() { printf '\001\002\003\004\005\006\007\010%s' "$1" > $S; n=$((16 - ${#1})); while [ $n -gt 0 ]; do printf '\000' >> $S; n=$((n - 1)); done; printf '\074\000\000\000APP' >> $S; }
run() { env -i PATH="$PATH" CUSTOM_STATUS_SESS=$S REQUEST_METHOD=${M:-GET} HTTP_HOST=${H-192.168.0.1} REMOTE_ADDR=${R:-192.168.0.77} ${G:+GATEWAY_INTERFACE=$G} sh "$CGI"; }

sess 192.168.0.77
echo "dimensione sessione finta: $(wc -c < $S) byte"
esito "$(run | stato)" 200 "IP del login"
esito "$(R=192.168.0.78 run | stato)" 403 "IP diverso"
esito "$(R=::ffff:192.168.0.77 run | stato)" 200 "IP del login in forma IPv4-mapped"
esito "$(H=dwr.example.com run | stato)" 403 "Host con nome (DNS rebinding)"
esito "$(H= run | stato)" 403 "Host assente"
esito "$(H=192.168.0.1:443 run | stato)" 200 "Host con porta"
esito "$(M=POST run | stato)" 403 "metodo POST"
esito "$(G=CGI/1.1 run | stato)" 403 "file di sessione di prova ignorato sotto lighttpd"
sess 0.0.0.0
esito "$(run | stato)" 403 "dopo il logout (0.0.0.0)"
sess "192.168.0.77;x"
esito "$(R='192.168.0.77;x' run | stato)" 403 "IP non numerico"
rm -f $S
esito "$(run | stato)" 403 "file di sessione assente"

sess 192.168.0.77
rm -f /tmp/custom_status.prev
echo "--- prima risposta (senza campione precedente)"
run | sed -n '/^{/p'
t0=$(awk '{print int($1*1000)}' /proc/uptime)
run > /dev/null
t1=$(awk '{print int($1*1000)}' /proc/uptime)
echo "tempo di una richiesta: $((t1 - t0)) ms"
sleep 2
echo "--- risposta dopo 2 s (con utilizzo CPU e velocità WAN)"
run | sed -n '/^{/p'
echo "--- intestazioni"
run | sed -n '1,/^\r*$/p' | tr -d '\r'
rm -f $S
echo "RISULTATO: $ok OK, $ko FAIL"
