#!/bin/sh
# Test on-device: verifica se la MIB powerpercent del driver Realtek cambia i registri TX AGC.
# Uso: sh dwr_power_test.sh <percento>   (es. 15, poi 100 per ripristinare)
IWPRIV=/bmdefsys/usr/bin/rtltools/iwpriv
P=${1:-100}

agc() {
  echo "-- $1"
  $IWPRIV wlan0 get_mib powerpercent
  for r in e00 e04 e08 e10 e14 830 834 838 86c; do echo "reg $r: $($IWPRIV wlan0 read_reg dw,$r 2>&1 | tr -s ' ' | cut -c1-80)"; done
  echo "rf_pwr: $($IWPRIV wlan0 rf_pwr 2>&1 | tr -s ' ' | cut -c1-120)"
}

agc "prima (powerpercent attuale)"
$IWPRIV wlan0 set_mib powerpercent=$P
echo "txpwr_apply: $($IWPRIV wlan0 txpwr_apply 2>&1 | tr -s ' ' | cut -c1-120)"
agc "dopo set_mib powerpercent=$P + txpwr_apply"
sh /bmdefsys/usr/bin/rtltools/script/init.sh </dev/null >/cache/init_pw.log 2>&1
agc "dopo riavvio Wi-Fi (init.sh)"
echo "canale: $($IWPRIV wlan0 get_mib channel)"
