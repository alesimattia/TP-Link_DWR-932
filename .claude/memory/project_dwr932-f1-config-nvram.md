---
name: dwr932-f1-config-nvram
description: DWR-932 F1 (fw 01.11) - config on-device (feature flags in bm_config.conf), funzioni presenti-ma-disattivate sbloccabili con root, accesso NVRAM/modem via AT /dev/smd7 e QMI, mapping versioni
metadata:
  type: project
---

Device → [[dwr932-f1-device]]. Root/accesso → [[dwr932-f1-rootaccess]]. Firmware → [[dwr932-f1-firmware-gpl]].
Esplorato 2026-10-25 da shell root (adb). Copia config sul PC in %USERPROFILE%\dwr\cfg\bmdefsys_etc.

CONFIG ON-DEVICE (/bmdefsys/etc/, scrivibili con root)
- bm_config.conf = config LIVE (mtime recente, non il default di build) → EDITARLO cambia le impostazioni. Flag notevoli (0=off): samba, netstat_enable, urlFilterEnable, nodogsplash_enable (captive portal), wwan_upnp_disable=1, manual_wwanDns_enable, apn_profile_mode, DefaultPasswd, lcd_off_password, AUTOREBOOT_enable, quota_limit/block_onlimit, MacFilterMode. Country_code=CN (regolatorio Wi-Fi), Default_lan_ip=192.168.0.1, web_language=0.
- mobileap_cfg.xml: Module=ar6003; WlanMode AP; EnableIPV6=1; DHCP 192.168.0.20-60; **GuestAPCfg presente** (/etc/hostapd-wlan1.conf, AccessProfile INTERNETONLY) nonostante BMT_FEATURE_WIFI_GUEST_AP off a compile-time; StationModeCfg (STA/repeater) presente; Roaming=0; VPN passthrough IPSEC/PPTP/L2TP=1; DmzIP; EnableWebserverWWANAccess=0; UPnP/DLNA/MDNS=0.
- altri: mobileap_firewall.xml, fota_info.xml (+ fota server), wpa_supplicant.conf, wscd.conf (WPS), simplecfgservice.xml, lighttpd.conf, dhparams.pem. bm_login_pw.conf = password admin (NON letta, policy).
- hostapd.conf NON esiste statico: generato a runtime da QCMAP_ConnectionManager (/bmdefsys/etc/mobileap_cfg.xml → hostapd). Per cambiare canale/country Wi-Fi: Country_code in bm_config.conf + config QCMAP.

FUNZIONI SBLOCCABILI: inventario completo con livello di blocco ed evidenze → [[dwr932-f1-hidden-features]].

NVRAM / MODEM
- efs2 (mtd2) = NV/EFS modem: NON dumpabile raw da Linux (blocca NAND, vedi [[dwr932-f1-rootaccess]]); si tratta con EDL/QPST/QXDM o diag su Windows. Lettura file EFS FATTA via DIAG COM10 con tools/dwr_diag_efs_read.ps1 (sola lettura) e log F3 con tools/dwr_diag_f3_capture.ps1 → [[dwr932-f1-lteband]].
- Accesso AT: /dev/smd7 (canale usato da debug_mode.sh per AT+BMFTM/AT+BMCMD). Verificato: ATI/AT+CGMM/AT+CGMR/AT+BMSWVER/AT+CGSN/AT+CFUN rispondono; AT+COPS?/AT+CGDCONT? → ERROR su smd7 (comandi rete/APN su altro canale: provare smd8/smd11 o /dev/smdcntl*, o QMI). Scrittura NV via AT+BMFTM/BMCMD confermata (causa reboot). IMEI leggibile (AT+CGSN) e scrivibile (AT+BMIMEI, da dl.exe) — NON toccare. IMEI del device NON memorizzato (policy).
- QMI: /dev/qmi0-2, smdcntl0-11, rmnet_ctrl* (band/APN/registrazione via libqmi/QCMAP). diag: /dev/diag.
- Bande da AT: AT+BMBANDPREF su smd7 (lettura con 0x; scrittura esadecimale SENZA 0x, tds 0 = invariata) → [[dwr932-f1-lteband]].
- Modo factory/test: AT+BMFTM=1 (+reboot) → test mode (espone adb/diag, modem non registra); AT+BMFTM=0 ripristina.

MAPPING VERSIONI (AT+BMSWVER): UI "01.11.EU" = AP interno DTLWE_R602B_1.2.0_240628; strati: modem R602_1.1.1_190219 (2019, = qdsp), DTLWE_R602B_04B0_4706_1.0.1_201217, W1.0.0.2765_DTLW0_R602B. Model AT = "LTE WIRELESS MODEM", Revision 1.1.1.
