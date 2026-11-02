#!/bin/sh
# Verifica in sola lettura dell'uscita internet via client Wi-Fi (wlan0-vxd) del DWR-932 F1:
# IP da DHCP, route di default, NAT e firewall impostati da QCMAP, DNS e ping verso internet.

echo "##### STA"
wpa_cli -i wlan0-vxd status | grep -E '^(wpa_state|ssid|freq|ip_address)='
ifconfig wlan0-vxd | grep -E 'inet addr|RX bytes'
ps | grep -E 'dhcpcd|pimd' | grep -v grep
ls -la /etc/sta_connected /etc/gateway.txt 2>/dev/null
echo "gateway.txt: $(cat /etc/gateway.txt 2>/dev/null)"
cat /etc/resolv.conf 2>/dev/null

echo "##### route e bridge"
ip route
brctl show

echo "##### NAT e firewall"
iptables -t nat -S POSTROUTING
iptables -S INPUT
iptables -S FORWARD | head -10
cat /proc/sys/net/ipv4/ip_forward

echo "##### connettivita"
ping -c 3 -W 3 8.8.8.8
nslookup example.com 2>&1 | tail -3
wget -q -O - http://www.msftconnecttest.com/connecttest.txt 2>&1 | head -1
echo

echo "##### kernel"
dmesg | grep -i -E 'cliW|deauth|disassoc|promiscuous|wlan0-vxd' | tail -8
