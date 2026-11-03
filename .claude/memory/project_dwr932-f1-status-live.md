---
name: dwr932-f1-status-live
description: DWR-932 F1 fw 01.11 - riquadro di stato live nella home FATTO 2026-11-03 (colonna sinistra cpMainLeft di controlPanel.html riscritta come lista voce→valore): fonti dati, mappa campi LTE con unità da RE di qcmap_fcgi, sensori leggibili e scartati, stima temperatura batteria, auth per IP del login D-Link, build/deploy/test, limiti e punti da verificare con SIM
metadata:
  type: project
---
UI/deploy → [[dwr932-f1-webui-mod]]. Mappa qcmap_fcgi → [[dwr932-f1-hidden-features]]. CPU → [[dwr932-f1-cpufreq]]. Root/adb → [[dwr932-f1-rootaccess]].

RICHIESTA E SCELTE UTENTE (2026-11-03)
- Stato live di sensori, CPU e altri parametri al posto del blocco "Modalità connessione"; poi: TUTTE le info LTE + potenza/qualità segnale; gruppi Temperature, CPU e memoria, Batteria e alimentazione, Wi-Fi e LAN; temperatura batteria voluta comunque.
- Layout scelto dall'utente: riscrivere TUTTA la colonna sinistra (Internet + Modalità connessione) come lista voce a sinistra / valore a destra, icone modo rete + segnale e dati usati in alto. Niente grafici. Controlli Connetti sempre/manuale tolti dalla home (restano nel popup Internet > Modalità connessione).
- Auth scelta: "legato al login D-Link per IP" (alternativa Basic scartata per il prompt a ogni sessione del browser).

UI (controlPanel.html generato da tools/build_controlpanel.py sullo stock: applica anche pulsante FUNZIONALITÀ AVANZATE e script custom_autoreboot.js; CRLF)
- <style> dopo window.css; script js/custom_status.js dopo system.js (dopo controlPanel.js → il suo ready gira dopo quello stock).
- cpMainLeft: h1 Internet stock (popup network_info) + div.cstHead (a#cst_mode classi cpInternetMode*/Gray*, a#cst_sig classi signal1-5/signalGray1-6 come il template stock, operatore, dBm, "X usati", "avviso a N MB" = 80% quota) + div.cstList (altezza 296 px, scroll verticale) con table.cstTab: gruppi Connessione, Segnale, Cella (senza RRC/EMM), Rete e dati, Temperature (+ riga cst_nota se 403), CPU e memoria, Batteria, Wi-Fi e LAN. Spazio: colonna 254×430, lista ~15 righe visibili.
- I template doT cp_internetTemplate e cp_connectionModeTemplate DEVONO restare: controlPanel.js fa document.getElementById(...).text a ogni cp_up_5s (senza → eccezione → refresh 5 s interrotto). Tolti solo i contenitori #tf1_tmpl_cpinternetinfo / #tf1_tmpl_cp_connectionMode (render jQuery su selettore vuoto = no-op; l'alert del limite dati in cp_internetInfo_template continua a funzionare).

FONTI DATI (js/custom_status.js, ciclo 5 s, fermo con document.hidden, valori via textContent)
- Stock già nel browser: ui_config.Dyn_Status.up_5s (ipv4{status,connect_type,op_name,ip,gateway,subnet_mask,dns1,dns2}, ipv6, signal.modem{strength,level,roaming,service,spn,opname}, battery, clientNum) e .nw_usage (tx,rx,period; anche bm_current*Rate ecc. ma unità ignote, NON usati).
- data.ria?DynUpdate=get_networkserviceinfo ogni 10 s, solo con SIM (op_name ≠ NO SIM/PIN LOCK/PUK LOCK); dataType text perché netbandlte_value è un uint64 (>2^53) → bit estratti dalla stringa decimale.
- data.ria?DynUpdate=bm_GetCellLocationInfo ogni 10 s (solo per bm_BandWidth).
- /cgi-bin/custom_status.cgi ogni 5 s (sensori).

MAPPA get_networkserviceinfo = fcgi_api_bm_get_network_service_info FUN_00025960 (qcmap_fcgi ade3017a…; nessun chiamante nella UI 01.11)
- oper_name ("Searching"/"No Service"/"Limit Service", altrimenti "" → usare spn/op_name di up_5s), service_type none|2G|3G|LTE, cell_broadcast, mcc, mnc (stringhe), cell_id (ECI 28 bit), pci, lac, tac, ecio, rssi, rsrp, rsrq, sinr, earfcn, ebid (=cell_id>>8, eNodeB), tx_power (GetTxRxInfo), tm_mode (sempre 0, ignorato), ecgi "%d%02d%lx", rrc/emm (-1 se non validi; semantica dei codici NON nota; riga RIMOSSA su richiesta dell'utente 2026-11-03), bm_currentBand (enum NAS active band: 120=B1 122=B3 126=B7 127=B8 145=B20; tabella in bm_band.html), ps_cs_info (srv_domain: 0 nessuno,1 CS,2 PS,3 CS+PS,4 camped), lte_ims_voice_avail, roaming, imsi, msisdn, smsc (NON mostrati: identificativi SIM), PLMN, mimo "1T2R" fisso, netband2G3G/lte/tdscdma_value (maschere; LTE bit0=B1).
- Unità (da GetSigInfo per RAT): LTE rssi dBm int8, rsrq dB int8, rsrp dBm int16, sinr = snr in 0,1 dB (anche HDR tabella -90..90 e TD-SCDMA ×10 → coerente); WCDMA ecio in 0,5 dB positivi (→ -ecio/2 dB); GSM solo rssi. tx_power assunto 0,1 dBm (QMI GET_TX_RX_INFO), valido solo in traffico → DA VERIFICARE con SIM.
- bm_GetCellLocationInfo FUN_00026ccc: cmd_status Done|Fail, bm_BandWidth (byte; mappato come enum QMI 0..5 = 1,4/3/5/10/15/20 MHz → DA VERIFICARE), bm_Bandearfcn, bm_Bandarfcn. bm_GetCurrentBandInfo FUN_000257f4: bm_currentBand.
- Frequenze DL/UL calcolate in JS (3GPP: F_DL = FDL_low + (EARFCN − N_offs)/10; UL = DL + duplex, B20 +41).
- NON verificato dal vivo: device senza SIM → endpoint LTE mai chiamati finora. Rischio: se un endpoint facesse cadere qcmap_fcgi la web UI resterebbe giù fino al riavvio (rimedio: adb + `dwr_deploy_ui.sh --ripristina`).

SENSORI (probe tools/dwr_sysstatus_probe.sh → analysis/notes/device-sysstatus-probe-0111.txt; stabilità tools/dwr_therm_sample.sh → device-therm-sample-0111.txt)
- OK: tsens_tz_sensor0-4 (°C interi, SoC = max), qpnp-vadc die_temp (m°C, PMIC), xo_therm_amux (°C), cpufreq, /proc/stat, loadavg, meminfo (kernel 3.4: niente MemAvailable → free = MemFree+Buffers+Cached), power_supply battery (capacity, voltage_now in mV NON µV, status, health), ac/usb online, /proc/wlan0/sta_info (righe hwaddr = client), mib_rf dot11channel, mib_all "currBW(op):" (20M reale: MCS15 144,5 = 20 MHz), stats cur_tx_rate, nf_conntrack_count, /proc/net/dev (WAN = rmnet* + wlan0-vxd).
- SCARTATI: pa_therm0 (~850000, non montato), pa_therm1 (80-120 rumoroso), ambient_therm (125 fisso), case_therm (10-22 instabile), Realtek "ther" (0), power_supply battery/temp (= codice ADC grezzo di MPP_02, non °C).
- Lettura vadc 20-40 ms per canale; CGI completo 50-150 ms.

TEMPERATURA BATTERIA (stima, mostrata "≈ N °C" con title esplicativo)
- Driver kernel aw3215_charger (oggetto in analysis/gpl-extract/.../drivers/power/aw3215_charger.o; nessun sorgente): lavora su codici ADC grezzi; tabella bm_temperature_me (.data+0x20c, 4×{tipo,soglia,callback}): 26796 emergency_hot (kernel_power_off immediato), 26855 hot (power off dopo >50 eventi), 30722 good, 30890 cold; override da /etc/backup/bm_temp_cfg "%d,%d,%d,%d" (assente sul device).
- Formula nel CGI: r = MPP_02_temperature µV / 1800000 (calibrazione raziometrica 1,8 V); Rt = 27k·r/(1−r); T = 1/(1/298,15 + ln(Rt/10k)/3435) − 273,15. Pull-up 27 kΩ scelto perché porta la soglia hot a 55,0 °C (emergency 55,9). Ipotesi NON verificate (NTC 10k B3435): errore possibile di qualche grado. Letture: 31,5 °C in carica, 33,3 °C con SoC a 41 °C.

AUTH custom_status.cgi (sola lettura)
- /www/qcmap_session (31 B, verificato con od): [0]tv_sec [4]tv_usec [8..23] IP testo NUL-padded [24] timeout (0x12c=300) [28..30] "APP"; scritto solo da doLogin (0x1bf34/0x1c514) e doLogout (0x1c6a4 → IP "0.0.0.0", tempi 0); nessun aggiornamento per attività.
- Accetta solo GET, Host IPv4 letterale (anti DNS rebinding: nessun nome host), IP del file == REMOTE_ADDR (prefisso ::ffff: tolto). Altrimenti 403 {"ok":0} SENZA WWW-Authenticate (nessun prompt). Debolezza accettata dall'utente: vale per quell'IP fino a logout/nuovo login/riavvio, token non verificato.
- CUSTOM_STATUS_SESS solo con GATEWAY_INTERFACE vuoto (collaudi). Stato tra richieste in /tmp/custom_status.prev (uptime, cpu total/idle, byte WAN) → utilizzo CPU % e velocità.
- busybox awk 1.23.1: `var (` viene preso come chiamata di funzione ("Call to undefined function"); valori da getline/sub sono stringhe → confronti numerici con +0.

FILE (sorgenti in analysis/device-pull-0111/modified/; hash 2026-11-03)
- webpages/controlPanel.html 7f3fe2fe… (49861 B, dal 2026-11-03 carica anche js/custom_lteband.js → [[dwr932-f1-lteband]]), webpages/js/custom_status.js 1087e01f… (UTF-8 letterale: la pagina dichiara charset utf-8 e lo script lo eredita), custom_status.cgi 2cc8359b… → /bmdefsys/WEBSERVER/webpages/{controlPanel.html, js/custom_status.js, cgi-bin/custom_status.cgi} (www-data 770, creati con cp -p).
- Deploy: tools/dwr_deploy_ui.sh (ora richiede anche custom_status.cgi.new e custom_status.js.new; controlla marcatori cst_list e i due template stock; --ripristina rimuove i due file e /tmp/custom_status.prev). Output: analysis/notes/device-status-deploy-0111.txt.

TEST
- tools/dwr_status_cgitest.sh [cgi] sul device: 11/11 (IP login, IP diverso, IPv4-mapped, Host nome/assente/con porta, POST, file di prova ignorato sotto lighttpd, logout 0.0.0.0, IP non numerico, file assente) + JSON valido → analysis/notes/device-status-cgitest-0111.txt.
- node tools/test_custom_status_js.cjs: 20/20 (maschera bande uint64, durate, velocità, MHz).
- tools/status_harness/make_harness.py <controlPanel generato> <custom_status.js> <webpages stock> → harness.html con mock (#lte, #nosim, #negato, suffisso -full); screenshot con ~/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell --virtual-time-budget=3000 --window-size=280,460 (Brave headless si blocca) → tools/status_harness/shots/.
- NON verificato da Claude: pagina reale nel browser dopo login (credenziali solo dell'utente) → da fare all'utente; dati LTE reali (serve SIM).

OSSERVAZIONE 2026-11-03: miniupnpd al 95% di CPU → causa trovata (ciclo infinito NAT-PMP) e corretta disattivando NAT-PMP, vedi [[dwr932-f1-hidden-features]] sezione UPNP. La riga "Carico medio" a riposo vale ≈ 4 per 4 kthread sempre in stato D (non è consumo di CPU).
