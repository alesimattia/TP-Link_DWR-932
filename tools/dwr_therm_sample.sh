#!/bin/sh
# Campiona 5 volte (ogni 2 s) i canali termici del PMIC e i tsens, per valutarne stabilità e plausibilità.
# Uso sul device: sh /cache/dwr_therm_sample.sh
V=/sys/devices/qpnp-vadc-cf5cf600
i=0
while [ $i -lt 5 ]; do
	l="t=$(cut -d' ' -f1 /proc/uptime)"
	for c in die_temp xo_therm_amux case_therm ambient_therm pa_therm0 pa_therm1 MPP_02_temperature batt_id_therm; do
		r=$(cat $V/$c 2>/dev/null | head -1)
		l="$l $c=${r#Result:}"
	done
	for z in 0 1 2 3 4; do l="$l ts$z=$(cat /sys/class/thermal/thermal_zone$z/temp)"; done
	l="$l bat=$(cat /sys/class/power_supply/battery/temp) mV=$(cat /sys/class/power_supply/battery/voltage_now)"
	echo "$l"
	i=$((i+1)); sleep 2
done
