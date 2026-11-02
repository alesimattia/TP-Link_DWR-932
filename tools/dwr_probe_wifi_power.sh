#!/bin/sh
# Probe on-device (DWR-932 F1): stato runtime Wi-Fi Realtek e consumi.
# Non stampa segreti: salta i file di chiavi/PSK/PIN/password in /var/rtl8192c.
# Uso: adb push dwr_probe_wifi_power.sh /cache/ ; adb shell sh /cache/dwr_probe_wifi_power.sh > out.txt

s() { echo; echo "##### $*"; }
SECRET='psk|wep|key|pass|pin|secret|rs_|radius|wsc'

s "/var/rtl8192c (valori non sensibili)"
cat /var/rtl8192c/wifi_script_dir /var/rtl8192c/wifi_bin_dir 2>/dev/null
for d in /var/rtl8192c/*/; do
  echo "-- $d"
  for f in "$d"*; do
    n=$(basename "$f")
    if echo "$n" | grep -qiE "$SECRET"; then echo "$n=<omesso>"; else echo "$n=$(head -c 120 "$f" 2>/dev/null | tr '\n' ' ')"; fi
  done
done

s "/proc driver Realtek"
ls /proc/wlan0 2>&1
for f in mib_rf mib_operation mib_11n mib_misc mib_dot11d mib_vap txpower_info; do
  [ -f /proc/wlan0/$f ] && echo "-- $f" && grep -viE "$SECRET" /proc/wlan0/$f | head -60
done
echo "-- wlan0-va0:"; ls /proc/wlan0-va0 2>&1 | head; [ -f /proc/wlan0-va0/mib_operation ] && grep -viE "$SECRET" /proc/wlan0-va0/mib_operation | head -30

s "iwpriv wlan0 (comandi disponibili)"
/bmdefsys/usr/bin/rtltools/iwpriv wlan0 2>&1 | head -60

s "consumo CPU (top 1 iterazione)"
top -b -n 1 2>/dev/null | head -25

s "cpuidle"
for st in /sys/devices/system/cpu/cpu0/cpuidle/state*; do [ -d "$st" ] && echo "$(basename $st): $(cat $st/name) usage=$(cat $st/usage) time=$(cat $st/time)"; done
cat /sys/module/pm_8x60/modes/*/*/idle_enabled 2>/dev/null | head -5

s "thermal-engine / power_config"
cat /etc/init.d/power_config 2>/dev/null | head -40
ls /etc/thermal-engine*.conf 2>/dev/null && head -40 /etc/thermal-engine*.conf

s "wakelock / autosleep"
cat /sys/power/autosleep /sys/power/wake_lock 2>&1 | head -5

s "LED attivi (trigger e timer)"
for l in /sys/class/leds/*; do echo "$(basename $l) b=$(cat $l/brightness) t=$(sed 's/.*\[\(.*\)\].*/\1/' $l/trigger) on=$(cat $l/delay_on 2>/dev/null) off=$(cat $l/delay_off 2>/dev/null)"; done

s "display"
cat /sys/class/graphics/fb0/blank 2>&1; ls /sys/class/graphics/fb0/ 2>&1 | tr '\n' ' '
echo
ls /sys/bus/spi/drivers/qcom,spi-oled/ 2>&1 | tr '\n' ' '
