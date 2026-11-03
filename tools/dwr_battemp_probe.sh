#!/bin/sh
# Sola lettura: configurazione delle soglie di temperatura della batteria (driver aw3215) e messaggi del kernel correlati.
# Uso sul device: sh /cache/dwr_battemp_probe.sh
ls -la /etc/backup/ 2>&1
echo "bm_temp_cfg: $(cat /etc/backup/bm_temp_cfg 2>&1)"
dmesg 2>/dev/null | grep -i -E 'aw3215|temperature|tmp_adc|battery|R602' | tail -20
cat /sys/kernel/debug/bm_battery_debug/bm_battery_vadc
grep -i -E 'adc_tm|btm|therm' /proc/interrupts 2>/dev/null | head
ls /sys/devices/qpnp-adc-tm-cf5cf800/ 2>&1 | tr '\n' ' '
