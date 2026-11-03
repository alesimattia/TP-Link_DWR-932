#!/bin/sh
# Probe in sola lettura sul DWR-932: quali sensori e parametri di sistema sono leggibili
# (zone termiche, hwmon, power_supply, ADC del PMIC, cpufreq, carico, memoria, flash, rete, Wi-Fi Realtek).
# Misura anche quanto costa leggerli, per decidere la frequenza di aggiornamento della web UI.
# Uso sul device: sh /cache/dwr_sysstatus_probe.sh > /cache/sysstatus_probe.txt 2>&1

sez() { echo; echo "##### $1"; }
ms() { awk '{printf "%d", $1*1000}' /proc/uptime; }

sez "uptime / carico"
cat /proc/uptime /proc/loadavg
head -1 /proc/stat
grep -E '^(processes|procs_running|ctxt)' /proc/stat

sez "zone termiche"
for z in /sys/class/thermal/thermal_zone*; do
	t0=$(ms)
	v=$(cat $z/temp 2>&1)
	t1=$(ms)
	echo "$(basename $z) type=$(cat $z/type 2>&1) temp=$v mode=$(cat $z/mode 2>&1) lettura_ms=$((t1-t0))"
	for tp in $z/trip_point_*_temp; do [ -e "$tp" ] && echo "   $(basename $tp)=$(cat $tp 2>&1) $(cat ${tp%_temp}_type 2>&1)"; done
done
ls /sys/class/thermal/ 2>&1
for c in /sys/class/thermal/cooling_device*; do [ -e "$c" ] && echo "$(basename $c) type=$(cat $c/type) cur=$(cat $c/cur_state 2>&1) max=$(cat $c/max_state 2>&1)"; done

sez "hwmon"
for h in /sys/class/hwmon/hwmon*; do
	[ -e "$h" ] || continue
	echo "$h name=$(cat $h/name 2>&1)"; ls $h 2>&1 | tr '\n' ' '; echo
	for f in $h/*_input $h/device/*_input; do [ -e "$f" ] && echo "   $f=$(cat $f 2>&1)"; done
done

sez "power_supply"
for p in /sys/class/power_supply/*; do
	[ -e "$p" ] || continue
	echo "== $p"
	t0=$(ms)
	for f in $p/*; do [ -f "$f" ] && [ -r "$f" ] && echo "   $(basename $f)=$(cat $f 2>&1 | head -1)"; done
	echo "   lettura_ms=$(( $(ms) - t0 ))"
done

sez "ADC del PMIC (qpnp-vadc / iadc / bm_battery_debug)"
find /sys/devices -maxdepth 6 \( -name '*vadc*' -o -name '*iadc*' -o -name '*adc-tm*' -o -name '*tsens*' -o -name '*pm8019*' -o -name '*bms*' \) 2>/dev/null | head -40
for d in $(find /sys/devices -maxdepth 6 -name '*vadc*' -type d 2>/dev/null | head -5); do
	echo "== $d"; ls $d 2>&1 | tr '\n' ' '; echo
	for f in $d/*; do
		case "$(basename $f)" in uevent|modalias|name|driver|subsystem|power|of_node) continue;; esac
		[ -f "$f" ] && [ -r "$f" ] || continue
		t0=$(ms); v=$(cat $f 2>&1 | head -2 | tr '\n' ' '); echo "   $(basename $f)=$v ms=$(( $(ms) - t0 ))"
	done
done
ls -la /sys/kernel/debug/bm_battery_debug/ 2>&1
cat /sys/kernel/debug/bm_battery_debug/bm_battery_vadc 2>&1
mount | grep -c debugfs

sez "cpufreq / cpu"
C=/sys/devices/system/cpu/cpu0/cpufreq
for f in scaling_governor scaling_cur_freq cpuinfo_cur_freq scaling_min_freq scaling_max_freq cpuinfo_min_freq cpuinfo_max_freq; do echo "$f=$(cat $C/$f 2>&1)"; done
cat $C/stats/time_in_state 2>&1
echo "total_trans=$(cat $C/stats/total_trans 2>&1)"
ls /sys/devices/system/cpu/ 2>&1 | tr '\n' ' '; echo
grep -E 'Processor|BogoMIPS|Hardware|Revision' /proc/cpuinfo

sez "memoria"
head -6 /proc/meminfo
grep -E '^(SwapTotal|Slab|Committed_AS)' /proc/meminfo

sez "flash / filesystem"
df 2>&1
for m in 10 12 19 20 21; do echo "mtd$m: $(cat /sys/class/mtd/mtd$m/name 2>&1) ecc_failures=$(cat /sys/class/mtd/mtd$m/ecc_failures 2>&1) corrected=$(cat /sys/class/mtd/mtd$m/corrected_bits 2>&1) bad=$(cat /sys/class/mtd/mtd$m/bad_blocks 2>&1)"; done
ls /sys/class/mtd/mtd20/ 2>&1 | tr '\n' ' '; echo
ls /dev/mmcblk* 2>&1; grep -E 'mmc|sd' /proc/partitions

sez "rete"
cat /proc/net/dev
echo "conntrack=$(cat /proc/sys/net/netfilter/nf_conntrack_count 2>&1) max=$(cat /proc/sys/net/netfilter/nf_conntrack_max 2>&1)"
ip -4 addr 2>&1 | grep -E '^[0-9]|inet'
ip route 2>&1

sez "Wi-Fi Realtek /proc/wlan0"
ls /proc/wlan0 2>&1 | tr '\n' ' '; echo
t0=$(ms); grep -c hwaddr /proc/wlan0/sta_info 2>&1; echo "sta_info_ms=$(( $(ms) - t0 ))"
grep -i -E 'ther|temp|tx_?power|channel|txpwr|bw|band' /proc/wlan0/mib_rf 2>&1 | head -30
grep -i -E 'channel|bw|band|opmode|ssid' /proc/wlan0/mib_all 2>&1 | head -20
grep -i -E 'ther|temp' /proc/wlan0/* 2>/dev/null | head -20
head -40 /proc/wlan0/stats 2>&1
for f in /proc/wlan0-vxd/stats; do [ -e "$f" ] && { echo "== $f"; head -20 $f; }; done
grep -i -E 'state|rssi|signal|channel|ssid|tx_rate|rx_rate' /proc/wlan0-vxd/mib_rf /proc/wlan0-vxd/sta_info 2>&1 | head -20

sez "LED / display / OLED"
ls /sys/class/leds 2>&1 | tr '\n' ' '; echo
for l in /sys/class/leds/*; do [ -e "$l" ] && echo "$(basename $l) b=$(cat $l/brightness 2>&1) trig=$(sed 's/.*\[\([^]]*\)\].*/\1/' $l/trigger 2>&1)"; done

sez "modem / SIM (solo stato già esposto, nessun comando AT)"
grep -E '^(manual_|bm_|network|band|lte)' /bmdefsys/etc/bm_config.conf 2>/dev/null | cut -c1-80 | head -20
ls /sys/class/net 2>&1 | tr '\n' ' '; echo

sez "costo di lettura complessivo"
t0=$(ms)
i=0; while [ $i -lt 10 ]; do
	cat /sys/class/thermal/thermal_zone*/temp $C/scaling_cur_freq /proc/loadavg /proc/meminfo /proc/net/dev >/dev/null 2>&1
	i=$((i+1))
done
echo "10 letture base: $(( $(ms) - t0 )) ms"

sez "processi e daemon rilevanti"
ps | grep -E '[t]hermal|[p]e_service|[b]m_|[d]eep_sleep|[m]iniui|[l]ighttpd|[q]cmap' | cut -c1-100
