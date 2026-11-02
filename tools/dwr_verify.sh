#!/bin/sh
# Verifica on-device delle modifiche: lock country IT e persistenza potenza TX.
# Scrive i risultati incrementalmente in /cache/verify.log (sopravvive al blackout del Wi-Fi).
IWPRIV=/bmdefsys/usr/bin/rtltools/iwpriv
L=/cache/verify.log
: > "$L"
log(){ echo "$@" >> "$L"; }

log "== TEST LOCK: scrivo FR nel file countrycode (simula web UI) =="
echo FR > /var/rtl8192c/wlan0/countrycode
log "file countrycode prima di init: $(cat /var/rtl8192c/wlan0/countrycode)"

log "== TEST PERSISTENZA: imposto bm_custom.conf a 35 =="
printf 'wifi_power_percent=35\n' > /bmdefsys/etc/bm_custom.conf

log "== riavvio Wi-Fi (init.sh) =="
sh /bmdefsys/usr/bin/rtltools/script/init.sh </dev/null >/cache/init_verify.log 2>&1
log "INIT_RC=$?"
log "countrystr dopo init (atteso 73 84 = IT): $($IWPRIV wlan0 get_mib countrystr)"
log "file countrycode dopo init (atteso IT): $(cat /var/rtl8192c/wlan0/countrycode)"
log "regdomain (atteso 3): $($IWPRIV wlan0 get_mib regdomain)"
log "powerpercent dopo init (atteso 35): $($IWPRIV wlan0 get_mib powerpercent)"
log "FINE"
sync
