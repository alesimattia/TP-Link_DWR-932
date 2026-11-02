#!/bin/sh
#
#
#    NTP_ENABLE=1
#    NTP_SERVER=pool.ntp.br
#    NTP_SERVER2=a.ntp.br
#    NTP_SERVER3=b.ntp.br
#    NTP_SERVER4=gps.ntp.br
#    NTP_CURRENT=1
#    NTP_TIMEOUT=10
#    NTP_RETRY_SLEEP=5
#    NTP_INTERVAL=600
#
#	Options:
#		
#		1. daemon : run in daemon mode. Caller should put this script in background.
#		2. sync: one time sync.
#

NTPCLIENT=/bmdefsys/usr/bin/ntpclient
NTP_ENABLE=1
NTP_SERVER=`sed -n 's/NTPServer=//p' /bmdefsys/etc/bm_config.conf`
NTP_SERVER2=`sed -n 's/NTPServer2=//p' /bmdefsys/etc/bm_config.conf`
NTP_SERVER3=`sed -n 's/NTPServer3=//p' /bmdefsys/etc/bm_config.conf`
NTP_SERVER4=`sed -n 's/NTPServer4=//p' /bmdefsys/etc/bm_config.conf`
NTP_CURRENT=1
NTP_TIMEOUT=`sed -n 's/NTPTimeout=//p' /bmdefsys/etc/bm_config.conf`
NTP_RETRY_SLEEP=`sed -n 's/NTPRetrySleep=//p' /bmdefsys/etc/bm_config.conf`
NTP_INTERVAL=`sed -n 's/NTPSyncInterval=//p' /bmdefsys/etc/bm_config.conf`

while [ 1 ]
do
		# SHOULD use NTP_CURRENT as run-time key
	if [ -z $NTP_CURRENT ]; then NTP_CURRENT=1; fi
	if [ $NTP_CURRENT = 1 ]; then
		eval NTPServer="$"NTP_SERVER
	else
		eval NTPServer="$"NTP_SERVER$NTP_CURRENT
	fi
	if ! [ AAA"$NTPServer" = "AAA" ]; then
		NTP_OPT="-c 1 -i $NTP_TIMEOUT -s -l"
		$NTPCLIENT $NTP_OPT -h $NTPServer 2>&1 > /dev/null               
		NTPRet=$?
	else
		NTPRet=3
	fi
	if [ $NTPRet = 0 ]; then
		if [ AAA"$1" = "AAAsync" ]; then
			exit 0
		fi
		
		killall -SIGUSR1 qcmap_fcgi
		sleep $NTP_INTERVAL
	else
		NTP_CURRENT=$(($NTP_CURRENT+1))
		if [ $NTP_CURRENT = 5 ]; then
			NTP_CURRENT=1
		fi		
		sleep $NTP_RETRY_SLEEP
	fi
	
done
