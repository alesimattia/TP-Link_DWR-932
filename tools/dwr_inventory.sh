#!/bin/sh
# Inventario on-device (DWR-932 F1, busybox sh) per funzioni nascoste, Wi-Fi, consumi e web UI.
# Non stampa segreti: per i file con credenziali mostra solo i nomi delle chiavi.
# Uso: adb push dwr_inventory.sh /cache/ ; adb shell sh /cache/dwr_inventory.sh > out.txt

s() { echo; echo "##### $*"; }

s "uname / uptime"
uname -a; uptime

s "binari funzioni"
for b in smbd nmbd samba nodogsplash ndsctl minidlna minidlnad miniupnpd upnpd avahi-daemon \
         hostapd hostapd_cli wpa_supplicant wpa_cli iw iwconfig iwpriv iwlist wmiconfig athtool \
         iptables ip6tables tc led_ctl setleds miniui deep_sleep_server bm_netstat bm_dataLimit \
         ntfs-3g mount.cifs crond crontab httpd ethtool cpufreq-set; do
  p=$(which $b 2>/dev/null)
  [ -z "$p" ] && for d in /bmdefsys/usr/bin /usr/sbin /usr/bin /sbin /bin; do [ -e $d/$b ] && p=$d/$b && break; done
  echo "$b: ${p:--}"
done

s "busybox applets"
busybox 2>&1 | sed -n '/Currently defined functions/,$p' | tr -s ' \t\n' ' '
echo

s "init scripts"
ls /etc/init.d; echo "-- rc5.d:"; ls /etc/rc5.d; echo "-- bmdefsys init.d:"; ls /bmdefsys/etc/init.d

s "consumatori dei flag di bm_config.conf (solo script di testo; binari analizzati offline)"
for k in samba nodogsplash_enable netstat_enable urlFilterEnable quota_limit AUTOREBOOT_enable deepsleeptime batteryidletime lcd_off_time Country_code wwan_upnp_disable; do
  f=$(grep -l "$k" /etc/init.d/* /bmdefsys/etc/init.d/* /bmdefsys/usr/bin/*.sh /usr/bin/*.sh /etc/*.sh 2>/dev/null | tr '\n' ' ')
  echo "$k: $f"
done

s "processi"
ps

s "rete"
ifconfig -a 2>/dev/null | grep -E '^[a-z]|inet '
echo "-- iwconfig:"; iwconfig 2>&1 | grep -vE 'Encryption key|^$'
echo "-- iw dev:"; iw dev 2>&1
echo "-- /proc/net/wireless:"; cat /proc/net/wireless 2>&1

s "mobileap_cfg.xml (solo tag, valori sensibili mascherati)"
sed -E 's/(<[A-Za-z]*([Pp]ass|[Kk]ey|[Pp]sk)[A-Za-z]*>)[^<]*/\1***/' /bmdefsys/etc/mobileap_cfg.xml

s "hostapd config runtime (solo nomi chiave)"
for f in /etc/hostapd*.conf /data/hostapd*.conf /var/run/hostapd*.conf /tmp/hostapd*.conf; do
  [ -f "$f" ] && echo "-- $f:" && sed 's/=.*//' "$f" | tr '\n' ' ' && echo
done
echo "-- valori non sensibili hostapd.conf:"
for f in /etc/hostapd.conf /etc/hostapd-wlan1.conf; do
  [ -f "$f" ] && echo "-- $f:" && grep -E '^(interface|driver|ssid|hw_mode|channel|country_code|ieee80211[dhn]|ht_capab|max_num_sta|ignore_broadcast_ssid|ap_isolate|wmm_enabled|beacon_int|dtim_period|wpa|wpa_key_mgmt|wpa_pairwise|rsn_pairwise|ctrl_interface)=' "$f"
done

s "cpufreq"
for c in /sys/devices/system/cpu/cpu*/cpufreq; do
  [ -d "$c" ] || continue
  echo "-- $c"
  for f in scaling_governor scaling_available_governors scaling_available_frequencies scaling_cur_freq scaling_min_freq scaling_max_freq cpuinfo_min_freq cpuinfo_max_freq; do
    [ -f $c/$f ] && echo "$f: $(cat $c/$f)"
  done
done
ls /sys/devices/system/cpu/

s "LED / display / backlight"
ls /sys/class/leds 2>&1
for l in /sys/class/leds/*; do [ -d "$l" ] && echo "$l: brightness=$(cat $l/brightness 2>/dev/null) max=$(cat $l/max_brightness 2>/dev/null) trigger=$(cat $l/trigger 2>/dev/null)"; done
ls /sys/class/backlight /sys/class/graphics /dev/fb* 2>&1
find /sys -maxdepth 4 -iname '*oled*' 2>/dev/null

s "alimentazione"
for p in /sys/class/power_supply/*; do [ -d "$p" ] || continue; echo "-- $p"; for f in type status capacity voltage_now current_now online present health; do [ -f $p/$f ] && echo "$f: $(cat $p/$f)"; done; done
cat /sys/power/state 2>&1; cat /sys/power/autosleep 2>&1; ls /sys/power 2>&1

s "moduli e parametri wifi"
lsmod
for m in /sys/module/ath6kl* /sys/module/ar6000 /sys/module/wlan* /sys/module/cfg80211; do [ -d $m/parameters ] && echo "-- $m" && for p in $m/parameters/*; do echo "$(basename $p)=$(cat $p 2>/dev/null)"; done; done

s "Wi-Fi driver / rtltools"
ls -la /bmdefsys/usr/bin/rtltools 2>&1
ls /proc/net/rtl* /proc/net/rtl*/* 2>/dev/null | head -40
ls /lib/modules/*/ 2>/dev/null; find / -xdev -name '*.ko' 2>/dev/null | head -30
dmesg | grep -iE 'rtl|ath6|ar600|wlan|sdio' | tail -30

s "web UI"
ls -la /bmdefsys/WEBSERVER/webpages /bmdefsys/WEBSERVER/webpages/cgi-bin 2>&1
grep -nE 'cgi|mod_|document-root|auth\.require|socket' /bmdefsys/etc/lighttpd.conf | grep -v '^[0-9]*:\s*#'
ls -la /www 2>&1
echo "-- struttura /www/qcmap_session (caratteri alfanumerici mascherati):"
[ -f /www/qcmap_session ] && sed 's/[0-9A-Za-z]/x/g' /www/qcmap_session | head -5

s "spazio"
df
