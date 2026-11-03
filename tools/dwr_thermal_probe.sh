#!/bin/sh
# Sola lettura: messaggi di thermal-engine (mitigazioni) nel log corrente e in quello salvato, processo e opzioni
logread 2>/dev/null | grep -i -E "thermal|mitigat" | tail -20
echo "----- /var/syslog_messages"
grep -i -E "thermal|mitigat" /var/syslog_messages | tail -20
echo "-----"
P=$(pidof thermal-engine); tr "\0" " " < /proc/$P/cmdline; echo
ls -l /proc/$P/fd 2>/dev/null | sed "s/.*-> //" | sort | uniq -c
ls -la /etc/thermal-engine* /data/thermal* 2>&1
