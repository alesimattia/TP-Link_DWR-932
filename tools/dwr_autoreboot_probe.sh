#!/bin/sh
# Probe in sola lettura sul DWR-932 per il riavvio programmato: fuso orario e ora, RTC, crond e crontab,
# persistenza di /var/spool, script di avvio e spegnimento, syslog salvato, processi con /dev/mtd* aperti.
# Non stampa valori sensibili: di /etc/passwd solo un conteggio, delle variabili d'ambiente solo i nomi.
# Uso sul device: sh /cache/dwr_autoreboot_probe.sh

sez() { echo; echo "##### $1"; }

sez "uptime / data"
cat /proc/uptime
date
date -u
echo "TZ file:"; cat /etc/TZ 2>&1
echo "date con TZ: $(TZ=$(cat /etc/TZ 2>/dev/null) date '+%Y-%m-%d %H:%M:%S %Z %u %w')"
hwclock -r 2>&1
cat /sys/class/rtc/rtc0/since_epoch 2>&1
ls -la /etc/timestamp 2>&1; cat /etc/timestamp 2>&1
cat /sys/power/autosleep 2>&1

sez "NTP / ora in bm_config.conf"
grep -E '^(NTP|TZ_|SNTP|time)' /bmdefsys/etc/bm_config.conf 2>&1
grep -E '^AUTOREBOOT' /bmdefsys/etc/bm_config.conf 2>&1
pidof ntpclient.sh time_daemon 2>&1

sez "busybox / crond"
busybox 2>&1 | head -1
ls -la /sbin/crond /bin/crontab /usr/sbin/crond 2>&1
echo "pidof crond: $(pidof crond)"
ps | grep '[c]rond'
for p in $(pidof crond); do
	echo "crond $p cmdline: $(tr '\0' ' ' < /proc/$p/cmdline)"
	echo "crond $p env (solo nomi): $(tr '\0' '\n' < /proc/$p/environ | sed 's/=.*//' | tr '\n' ' ')"
	echo "crond $p fd:"; ls -l /proc/$p/fd 2>&1
done
grep -c '^root:' /etc/passwd

sez "/var/spool e crontab"
ls -la /var /var/spool /var/spool/cron /var/spool/cron/crontabs 2>&1
crontab -l 2>&1
mount
df / /cache /bmdefsys 2>&1

sez "init: rc5.d e rc6.d"
ls -la /etc/rc5.d 2>&1 | tail -8
ls -la /etc/rc6.d /etc/rc0.d 2>&1
ls -la /etc/init.d/busybox-cron /etc/init.d/custom_autoreboot 2>&1

sez "syslog salvato dal riavvio stock"
ls -la /var/syslog_messages 2>&1

sez "processi con /dev/mtd* aperti"
for d in /proc/[0-9]*; do
	l=$(ls -l $d/fd 2>/dev/null | grep '/dev/mtd')
	[ -n "$l" ] && echo "$(basename $d) $(tr '\0' ' ' < $d/cmdline | cut -c1-60): $l"
done
echo "fine elenco mtd"

sez "upgrade in corso"
ls -la /cache/upgrade.zip /cache/upgrade.bin /tmp/WebFUploadState 2>&1
ls -la /cache 2>&1 | head -40
