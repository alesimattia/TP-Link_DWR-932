#!/bin/sh
# Sola lettura: righe di log di miniupnpd e NAT-PMP (boot corrente e syslog salvato ai riavvii precedenti)
logread 2>/dev/null | grep -i -E "miniupnpd|NAT-PMP|natpmp" | tail -40
echo "----- /var/syslog_messages"
grep -i -E "miniupnpd|NAT-PMP|natpmp" /var/syslog_messages | tail -40
echo "----- livello di log di syslogd"
ps | grep "[s]yslogd"
