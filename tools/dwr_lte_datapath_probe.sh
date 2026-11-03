#!/bin/sh
# Probe in sola lettura del percorso dati LTE del DWR-932: configurazione netmgr/dsi/IPACM/QCMAP rilevante per
# prestazioni (aggregazione dati, MTU, offload), code e qdisc, opzioni del kernel (scheduler di rete, IPA, TCP),
# power collapse, file di configurazione del modem leggibili. Non stampa APN, credenziali o identificativi.
# Uso sul device: sh /cache/dwr_lte_datapath_probe.sh

sez() { echo; echo "##### $1"; }

sez "file di configurazione dati"
ls -la /etc/data/ 2>&1
for f in /etc/data/netmgr_config.xml /etc/data/dsi_config.xml /etc/IPACM_cfg.xml /etc/data/ipa/IPACM_cfg.xml; do
	[ -f "$f" ] || continue
	echo "== $f"
	grep -v -E '^\s*$' "$f" | grep -i -E 'aggreg|qmap|tlp|mbim|dl_|ul_|data_format|mtu|rmnet|iwlan|ipa|offload|throughput|num_|link_prot|qos|wan|lan|nat' | head -60
done

sez "mobileap_cfg.xml: voci di rete (senza APN/password)"
grep -i -E '<(MTU|TCP|MSS|WWAN|IPA|Default|Profile|EnableIPV6|EnableIPV4|NatType|NATEntry|Timeout|AutoConnect|Roaming|TechPref|Bearer)[^>]*>' /bmdefsys/etc/mobileap_cfg.xml 2>/dev/null | sed 's/^[ \t]*//' | head -40

sez "kernel: rete, scheduler, IPA, offload"
zcat /proc/config.gz 2>/dev/null | grep -E '^CONFIG_(NET_SCH_|NET_CLS_|IFB|TCP_CONG|DEFAULT_TCP|IPA|RMNET|MSM_RMNET|BRIDGE_NETFILTER|NF_CONNTRACK_|IP_NF_TARGET_TCPMSS|NETFILTER_XT_TARGET_TCPMSS|NETFILTER_XT_TARGET_TTL|IP_NF_TARGET_TTL|IP_NF_MANGLE|RPS|XPS|NET_FLOW|SMP|PREEMPT|HZ_|MSM_IPC|MSM_BAM|BAM_DMUX)' | sort
cat /proc/sys/net/ipv4/tcp_congestion_control /proc/sys/net/ipv4/tcp_available_congestion_control 2>&1
ls /sys/class/net/ | tr '\n' ' '; echo
ls -d /dev/ipa* /sys/bus/platform/drivers/ipa* 2>&1

sez "interfacce: MTU, coda, qdisc"
for i in rmnet0 rmnet1 bridge0 wlan0 wlan0-vxd; do
	[ -d /sys/class/net/$i ] && echo "$i mtu=$(cat /sys/class/net/$i/mtu) txqlen=$(cat /sys/class/net/$i/tx_queue_len) stato=$(cat /sys/class/net/$i/operstate)"
done
tc qdisc show 2>&1 | head -20

sez "regole iptables rilevanti (MSS, TTL, mangle)"
iptables -t mangle -S 2>&1 | head -20
iptables -S FORWARD 2>&1 | grep -i -E 'mss|tcpmss|ttl' | head

sez "sysctl rete"
for k in net/ipv4/ip_forward net/ipv4/tcp_mtu_probing net/core/netdev_max_backlog net/core/rmem_max net/core/wmem_max net/netfilter/nf_conntrack_tcp_timeout_established net/netfilter/nf_conntrack_udp_timeout net/netfilter/nf_conntrack_udp_timeout_stream net/ipv4/ip_default_ttl; do
	echo "$k = $(cat /proc/sys/$k 2>&1)"
done

sez "power collapse e sospensione"
cat /etc/rc5.d/S50power_config 2>/dev/null | grep -v '^\s*#' | grep -v '^\s*$' | head -40
for f in /sys/module/pm_8x60/modes/cpu0/*/suspend_enabled /sys/module/pm_8x60/modes/cpu0/*/idle_enabled /sys/power/autosleep; do
	[ -e "$f" ] && echo "$f = $(cat $f)"
done

sez "processi del percorso dati"
ps | grep -E '[n]etmgrd|[i]pacm|[q]ti|[q]muxd|[Q]CMAP|[d]si|[p]ort-bridge|[r]mnet' | cut -c1-110

sez "modem: file leggibili (senza identificativi)"
ls -la /etc/data/*.conf /etc/*.cfg 2>/dev/null | head
cat /sys/devices/soc0/soc_id /sys/devices/soc0/hw_platform /sys/devices/soc0/revision 2>&1
