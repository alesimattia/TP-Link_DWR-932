#!/bin/sh
# Test a caldo di beacon interval e DTIM sul DWR-932 F1: imposta solo il MIB del driver (RAM), non i file di /var/rtl8192c.
# Uso sul device: sh /cache/dwr_beacon_live_test.sh <beacon_TU> <dtim>
# Un reboot o init.sh riportano i valori dei file. Per tornare ai valori di fabbrica a caldo: sh /cache/dwr_beacon_live_test.sh 100 1

B=$1
T=$2
case "$B" in ''|*[!0-9]*) echo "beacon non valido"; exit 1;; esac
case "$T" in ''|*[!0-9]*) echo "dtim non valido"; exit 1;; esac

leggi() {
	echo "--- $1"
	iwpriv wlan0 get_mib bcnint
	iwpriv wlan0 get_mib dtimperiod
	for r in b,554 b,555 w,554 dw,554; do
		printf '%s ' "$r"; iwpriv wlan0 read_reg $r
	done
	grep -h -E 'dot11(BeaconPeriod|DTIMPeriod)' /proc/wlan0/mib_staconfig
}

leggi prima
iwpriv wlan0 set_mib bcnint=$B
iwpriv wlan0 set_mib dtimperiod=$T
leggi "dopo set_mib bcnint=$B dtimperiod=$T"
