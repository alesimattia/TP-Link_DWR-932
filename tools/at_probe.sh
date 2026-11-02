#!/bin/sh
# Sonda AT su /dev/smd7: legge info modem/NVRAM (solo query, nessuna scrittura NV).
timeout -t 5 cat /dev/smd7 > /tmp/at_out.txt 2>/dev/null &
sleep 1
for c in 'ATI' 'AT+CGMM' 'AT+CGMR' 'AT+BMSWVER' 'AT+CGSN' 'AT+CFUN?' 'AT+COPS?' 'AT+CGDCONT?'; do
  printf '%s\r\n' "$c" > /dev/smd7
  sleep 0
done
sleep 4
echo "===== AT OUT ====="
cat /tmp/at_out.txt
