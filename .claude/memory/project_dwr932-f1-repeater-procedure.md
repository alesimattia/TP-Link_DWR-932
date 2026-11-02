---
name: dwr932-f1-repeater-procedure
description: DWR-932 F1 fw 01.11 - procedura ESATTA e collaudata (2026-11-02) per sbloccare o riapplicare il repeater Wi-Fi (QCMAP AP-STA, Wi-Fi a monte come uscita internet) con pagina web; prerequisiti, passi, verifiche, rollback, trappole, stato lasciato
metadata:
  type: project
---
Analisi fw/flusso QCMAP → [[dwr932-f1-hidden-features]]. Pagina e web UI → [[dwr932-f1-webui-mod]]. Root/adb → [[dwr932-f1-rootaccess]]. Accesso al PC Windows → CLAUDE.md globale (castel-di-lama-win).

COSA SI SBLOCCA
- Modalità nativa QCMAP AP-STA (WlanMode=3), presente ma nascosta nel fw 01.11: wlan0-vxd (vdev Realtek) = client verso una rete Wi-Fi 2,4 GHz a monte = uscita internet con NAT; wlan0 resta AP (LAN 192.168.0.0/24, DHCP dnsmasq). L'AP del DWR segue il canale della rete a monte.
- Wi-Fi a monte ha priorità sull'LTE; caduto il Wi-Fi QCMAP rimette il NAT sull'LTE (da codice; non collaudato, niente SIM). Nessun binario da aggiungere: solo configurazione + pagina web.

PREREQUISITI
- PC Windows in SSH (2026-11-02: Ethernet 192.168.1.150), cartella C:\Users\User\dwr con adb.exe. Comandi: `ssh ... User@<ip> "cd /d C:\Users\User\dwr && adb.exe ..."`; MAI `>nul` (cmd risponde "Impossibile trovare il percorso specificato").
- DWR via USB con adb root. `adb devices` vuoto e nessun evento USB su Windows → l'utente stacca/ricollega il cavo lato DWR. In modalità normale (2001:7e41 RNDIS) → debug_post_set.cgi debug_enable_adb + debug_enable_test_mode → 05C6:9025 con adb (procedura in [[dwr932-f1-rootaccess]]).
- Metodo esecuzione: script in tools/ → scp sul PC in dwr/ → `adb push` in /cache → `adb shell sh /cache/<script>`. Output solo stato, mai chiavi.

PROCEDURA CONSIGLIATA (pagina web)
1. Controllare sul device: sha256 /bmdefsys/WEBSERVER/webpages/controlPanel.html == 78f7fecb9e0f2d47… (originale 01.11). Se diverso → rigenerare il pulsante sul file attuale (ricetta in [[dwr932-f1-webui-mod]]).
2. Copiare sul PC: analysis/device-pull-0111/modified/custom.cgi → dwr/custom.cgi.new; analysis/device-pull-0111/modified/webpages/controlPanel.html → dwr/controlPanel.html.new; tools/dwr_deploy_ui.sh. `adb push` dei tre file in /cache, poi `adb shell sh /cache/dwr_deploy_ui.sh` (sh -n, backup una tantum, scrittura con cat che mantiene owner/permessi, reboot solo se lighttpd.conf ≠ /cache/lighttpd.conf.orig).
3. Utente, da un dispositivo sul Wi-Fi del DWR: home della web UI → pulsante "Repeater Wi-Fi" sotto "Setup Wizard" (oppure https://192.168.0.1/cgi-bin/custom.cgi) → login del browser con admin + password della web UI → "Attiva repeater e riavvia" (circa 1 min) → "Cerca reti Wi-Fi" → "Usa" sulla rete → password → "Salva e collega" → riquadro Repeater: Stato "Connesso", Uscita internet "Wi-Fi a monte (repeater)".

PROCEDURA ALTERNATIVA (solo adb, senza pagina)
1. tools/dwr_apsta_enable.sh sul device: backup /cache/{mobileap_cfg.xml,wpa_supplicant.conf,vxd_wlan_mode,vxd_network_type}.orig una tantum; `sed -i 's|<WlanMode>[A-Z-]*</WlanMode>|<WlanMode>AP-STA</WlanMode>|' /bmdefsys/etc/mobileap_cfg.xml`; `echo 1 > /var/rtl8192c/wlan0-vxd/wlan_mode`; `echo 0 > /var/rtl8192c/wlan0-vxd/network_type`; sync.
2. `adb reboot` (QCMAP legge la modalità solo all'avvio).
3. tools/dwr_sta_apply.sh in /cache; poi l'UTENTE lancia `zsh tools/dwr_sta_add_network.sh [ip_pc]` (chiede SSID e password nascosta, SSID in hex). Esito in analysis/notes/device-sta-connect.txt.

VERIFICHE (in ordine)
- tools/dwr_apsta_status.sh: `wpa_supplicant -i wlan0-vxd -Dwext -B -c /bmdefsys/etc/wpa_supplicant.conf` e `wpa_cli ... -a /bmdefsys/usr/bin/QCMAP_StaInterface` attivi; opmode vxd=8, wlan0=16; scansione con risultati.
- tools/dwr_sta_connectivity.sh: wpa_state=COMPLETED, IP DHCP su wlan0-vxd, `default via <gw a monte> dev wlan0-vxd`, `MASQUERADE -o wlan0-vxd`, INPUT -i wlan0-vxd ESTABLISHED/DROP, ping 8.8.8.8 + DNS + HTTP.
- Dalla rete a monte (es. Mac sulla stessa rete) nessuna porta dell'IP STA risponde (80/443/22/23/53/5555/8080, ping, DNS).
- Un client sul Wi-Fi del DWR naviga senza SIM (verificato con il Mac, 192.168.0.28).
- tools/dwr_cgitest.sh = 59/59; tools/dwr_cgitest_mode.sh off|on = cambio modalità con riavvio. Dopo un riavvio la riconnessione automatica richiede circa 50 s.

ROLLBACK
- Pagina e pulsante: `sh /cache/dwr_deploy_ui.sh --ripristina` (custom.cgi.prev, controlPanel.html.orig, lighttpd.conf.orig + reboot se serve).
- Modalità: pulsante "Disattiva repeater" (le reti salvate restano) oppure tools/dwr_apsta_disable.sh (ripristina i /cache/*.orig, wpa_supplicant.conf senza reti) + reboot.

TRAPPOLE
- lighttpd: mai riavviarlo a caldo (qcmap_fcgi rilanciato non reinizializza QMI → web UI giù, rimedio = reboot) e mai avviarlo da adb (resta legato allo stderr della sessione).
- Da una sessione adb `setsid sh -c 'sleep 3; reboot' &` a volte non parte → negli script reboot sincrono; da CGI sotto lighttpd funziona.
- `wpa_cli reconfigure` interrompe la connessione in corso; dopo serve `wpa_cli scan` (autoscan ogni 120 s).
- Firewall QCMAP rifiuta TCP anche sul loopback: test locali con `iptables -I INPUT -i lo -j ACCEPT` temporaneo e poi `-D`.
- Reset di fabbrica: perde modalità, reti e password admin (torna quella di fabbrica); pagina, pulsante, lock IT e potenza restano → basta riattivare dalla pagina. Upgrade firmware: perde tutto → ripetere la procedura (più l'hook wlan_8192c.sh).
- Test mode (05C6:9025): il modem non si registra → con una SIM l'LTE non funziona. Per l'uso reale con SIM uscire dal test mode (debug_mode.sh adbd_disable + test_mode_disable, poi replug; vedi [[dwr932-f1-rootaccess]]). La modalità repeater sta in mobileap_cfg.xml e resta.
- Credenziali: la password Wi-Fi a monte la digita l'utente (pagina o script). Claude non legge wpa_supplicant.conf né lighttpd.user (al più formato e lunghezza).

STATO LASCIATO 2026-11-02
- AP-STA attivo; rete H3140 (router di casa, BSSID 40:b6:e7:45:e1:0a, canale 7) con priority 10; IP STA 192.168.1.151.
- Installati: custom.cgi (sha256 adad9223…), controlPanel.html con pulsante (eddc058c…), lighttpd.conf originale (4b0a2d05…).
- DWR ancora in test mode. L'utente ha confermato dal browser login e funzionamento.
