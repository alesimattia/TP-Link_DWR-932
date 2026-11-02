---
name: dwr932-f1-device
description: Profilo del dispositivo dell'utente D-Link DWR-932 HW F1 FW 01.11.EU (hotspot 4G) - identità, specifiche, default, USB su Mac, credenziali (solo riferimento Portachiavi), file nel progetto
metadata:
  type: project
---

DEVICE (utente, analizzato 2026-10-24)
- D-Link DWR-932 "4G/LTE Mobile Router", HW F1, FW UI 01.11.EU (ultimo disponibile: ftp.dlink.de 20/09/2024). Cartella progetto si chiama "tp-link" ma il device è D-Link.
- SoC Qualcomm MDM9625 (dedotto da nomi immagini firmware + kernel ARCH_MSM9625). Dettagli fw/GPL → [[dwr932-f1-firmware-gpl]]. Sicurezza/altre revisioni → [[dwr932-security-revisions]].
- SSID attuale: dlink_dwr-932_59b0 (formato default dlink_DWR-932_xxxx; SSID+PSK default su etichetta coperchio batteria).

CREDENZIALI
- MAI in chiaro: policy org Automa vieta a Claude di elaborare credenziali in chiaro, anche con autorizzazione esplicita utente (utente ha insistito; rifiutato). Richiesta ripetuta 2026-10-24 con motivazione "sandbox + rete protetta" → rifiutata di nuovo, policy prevale.
- Portachiavi macOS, service "tplink-dwr-932": account "admin" = admin web UI; account "wifi:dlink_dwr-932_59b0" = PSK Wi-Fi. Salvate dall'utente 2026-10-24.
- Uso consentito: script lanciati DALL'UTENTE con `security find-generic-password -s tplink-dwr-932 -a <acct> -w`; Claude vede solo output. Verifica esistenza senza -w.
- Comandi da far incollare all'utente in zsh: niente righe commento `#` con apostrofi (interactive_comments off → prompt `quote>`).

DEFAULT / OPERAZIONI
- Web UI http(s)://192.168.0.1, user admin, password fabbrica vuota.
- Reset: tasto Reset sotto coperchio, 5–10 s a device acceso. Oppure System > Settings Profile > Reset & Reboot.
- Upgrade fw: System > Firmware Upgrade > Manual > file .dfw > Start Update (~1 min upload + ~2 min install, display mostra "Upgrading"); D-Link consiglia factory reset dopo.
- Roaming/APN manuale: Internet > APN Settings (modo "Manual", tradotto male "Benutzerhandbuch"); Internet > Connection Mode Settings > Allow Data Roaming.

SPECIFICHE REV E/F (manuale rev E/F appx B; manuale revf == reve, stesso file)
- LTE FDD B1/3/7/8/20 Cat4 150/50 Mbps; DC-HSPA+ 900/2100 (42/5.76); GSM/EDGE 900/1800.
- Wi-Fi 802.11b/g/n 2.4 GHz, max 100 mW EIRP; antenne: 1 cell interna 1x2 MIMO + 2 Wi-Fi interne.
- mini-SIM (standard), slot microSD, micro-USB (5V/1A), batteria Li-ion 2000 mAh, 97x60x16.47 mm, 95 g, 0–40 °C. Network standby 3.5 W.
- Indicatori: LED (power RGB, signal RGB, wifi, sms, sled1-4 da led_ctl.c) + display OLED SPI (driver kernel spi-oled; guida fw cita display). Manuale dice solo LED.
- CE DoC RevF1 24/02/2023: RED 2014/53/EU, RoHS; TCF presso D-Link (Deutschland) GmbH.
- Modalità: router Wi-Fi e "modem USB 4G" (QIG).

USB SU QUESTO MAC (riconfermato live su fw 01.11, 2026-10-24: device inaccessibile via Mac)
- VID 0x2001 PID 0x7e41 bcdDevice 0x0228, "Mobile Connect", serial d2fd18441c14, 480 Mb/s.
- Su Mac il device sceglie la composizione "mac": 3 interfacce = CDC-ECM control (2/6) + CDC data (10/0) → en14 "Mobile Connect"; Mass Storage (8/6/80, bBB) SENZA media. NESSUNA seriale/DIAG/AT/adb (confermato: nessun /dev/cu USB, AppleUSBSerial=0).
- ECM inerte lato device: en14 attiva ma DHCP fallisce (169.254), con IP statico 192.168.0.100/24 l'ARP a 192.168.0.1 resta "incomplete", no mDNS → web UI/LAN IRRAGGIUNGIBILE via USB. Causa: il fw non fa bridge di ecm_qc alla LAN nel ramo Mac (su Windows userebbe rndis, funzionante).
- CONCLUSIONE: dal Mac non c'è alcun canale al sistema Linux del device → per root/diagnostica serve Windows (rndis/adb/DIAG + switch CD-ROM) o la web UI con rete funzionante. Lasciare en14 su DHCP.
- Uplink Mac = Wi-Fi en0 192.168.1.0/24 gw 192.168.1.1; unica scheda Wi-Fi (porte: en0 Wi-Fi, en4-6 Ethernet, en1-3 Thunderbolt). macOS 27.0.1.
- Wi-Fi del device: collegamento CONSENTITO (utente 2026-10-24), ma cade internet + sessione Claude, salvo SIM dati nel DWR-932 o uplink alternativo (Ethernet/tethering USB) sopra il Wi-Fi nell'ordine dei servizi. Altrimenti: script autonomo con timeout (connetti → esegui → salva output nel repo → torna su rete abituale), lanciato dall'utente perché usa la PSK.
- Mac: niente sudo non interattivo, niente BPF/tcpdump, niente nmap/binwalk; disponibili 7z, pdftotext, dtc/fdtdump (brew). bkcrack non installato.

ACCESSO / ROOT (2026-10-24) — SERVE UN PC WINDOWS; da macOS FALLISCE (ECM "mac" inerte: no web UI/adb/diag). Su Windows il DWR espone RNDIS → PC prende IP DHCP (es. 192.168.0.57), web UI del device https://192.168.0.1 raggiungibile; in modalità diag diventa Qualcomm VID_05C6 PID_9025 con adb/DIAG (driver Windows). Il PC Windows specifico e come raggiungerlo sono nel CLAUDE.md globale.
- ROOT OTTENUTO (uid=0): web UI debug senza auth → abilita adb + reboot in test mode → adb shell = root. Procedura completa, API debug, driver, restore, stato device → [[dwr932-f1-rootaccess]].
- AUTORIZZAZIONE utente 2026-10-24: Claude può cambiare stato del DWR (riavvii, fastboot/download mode, driver, root) senza ulteriore conferma. Scritture flash irreversibili comunque evitate salvo necessità chiara.

FILE NEL PROGETTO (/Users/alesimattia/Documents/PROGETTi/tp-link)
- docs/: datasheet rev B/C2/D/E, CEDoC RevF1, QIG revF, manuale revF (EN), howto roaming rev E/F, guida installazione fw F1.
- DWR-932_fw_revf1_111EU_EU_multi_20240802.zip (SHA-256 5b5a44601efdb03ca9400f7c337a67ee931a329a6811dad1a7db3b12b320c98f).
- gpl/DWR-932_sw_revf1_GPLcode.tar.gz (1103117599 B, gzip -t ok; contenuto = FW 01.04.EU, non 01.11).
- DWR-932_fw_revf1_104eu_EU_multi_20190801.zip (updater ufficiale 01.04 con immagini, vedi [[dwr932-f1-firmware-gpl]]).
- analysis/: notes/ (indici, output tool, .dts), gpl-extract/ (file estratti dal GPL), fw-extract/ (dfw 1.11 + partitions-zip/), web/ (pagine ricerca, credenziali rimosse), web-downloads/ (download parziali: script updater, dl.exe, code zip, pagine grezze m7350 NON ripulite).
- tools/: dfw_inspect.py, dfw_crc_check.py, zipcd_list.py, partial_inflate.py, zip_extract_entry.py.

PREFERENZE UTENTE (progetto, 2026-10-24)
- Tutto ciò che si scarica/analizza va nel repo (no scratchpad/tmp); tool/script creati o scaricati in ./tools; anche i sotto-agenti vanno istruiti così.
- Aggiornare progressivamente le memorie esistenti durante il lavoro.
