---
name: dwr932-f1-autoreboot
description: DWR-932 F1 fw 01.11 - riavvio programmato (orario + giorni) FATTO 2026-11-02: analisi firmware (AUTOREBOOT_* inerti, crond via SIGUSR1 di qcmap_fcgi, TZ, ora al boot, riavvio stock, upgrade), implementazione (custom_autoreboot.sh, init S99, API in custom.cgi, tab UI stock), trappole, test, limiti
metadata:
  type: project
---
UI/deploy → [[dwr932-f1-webui-mod]]. Inventario funzioni → [[dwr932-f1-hidden-features]]. Root/adb → [[dwr932-f1-rootaccess]].

RICHIESTA UTENTE (2026-11-02): tab "Riavvio programmato" accanto ad Account/Lingua/Data e ora nel popup Amministrazione della UI stock; orario HH:MM + giorni della settimana a scelta; auth = Basic del browser (scelta utente).

ANALISI FIRMWARE (qcmap_fcgi 01.11 ade3017a…, REA/Ghidra + llvm-objdump; rootfs 01.04 per gli script)
- AUTOREBOOT_default/enable/Schedule_hour/minute/Type/WEEK/DAY = byte struct bm_config +0x1167..+0x116d; usati SOLO da lettore 0x18ca4 e scrittore 0x19fac di bm_config.conf (nessun altro accesso, neanche base+offset); nessun CfgType/UI; altrove solo default in debug_fcgi. → funzione nativa inesistente; NON scrivere le chiavi in bm_config.conf (qcmap_fcgi lo riscrive dalla struct; reset di fabbrica lo ripristina).
- crond: solo qcmap_fcgi lo avvia, nel gestore SIGUSR1 0xe054 (signal registrato a 0x151a8) chiamato da ntpclient.sh dopo ogni sync NTP riuscito (NTPSyncInterval=3600): `kill -9 $(ps -ef | grep crond)` + `TZ=\`cat /etc/TZ\`;export TZ;crond` + DMS_Client::qmi_dms_set_modem_time. Il kill uccide anche ogni PID numerico nelle righe con "crond" → niente "crond" né argomenti numerici nelle nostre righe di comando. /etc/init.d/busybox-cron inutile (punta a /usr/sbin/crond, non in rc5.d); binario reale /sbin/crond → busybox 1.23.1.
- PRIMA della modifica /var/spool/cron/crontabs NON esisteva → crond (e crontab) morivano subito (xchdir) → crond mai attivo. /var/spool è su rootfs persistente: creata da custom_autoreboot.sh applica.
- busybox crond 1.23.1: rilegge alla modifica della directory o con cron.update; salto in avanti <1 h → esegue i job saltati; >1 h → nessuno; cambio d'ora ottobre → 02:xx due volte, marzo nessuna. Daemonize chiude solo gli fd sotto quello di /dev/null → eredita gli fd >2 del chiamante (osservato: fd 11 /dev/pts/0 di adb shell → sessione adb appesa; sotto CGI erediterebbe il flock fd 9 → tutte le POST di custom.cgi bloccate). Ash chiude anche fd a più cifre: `for fd in $(ls /proc/self/fd); do [ "$fd" -gt 2 ] && eval "exec $fd>&-"; done` (chiudere fd non aperti non fa uscire la shell).
- /etc/TZ: rigenerato da qcmap_fcgi all'avvio (0x1512c) in formato POSIX `GMT<off>[<LDT>Mm.w.d/h,Mm.w.d/h]`. STATO LIVE 2026-11-02: "GMT-8" (UTC+8, DST off; regole DST di default 1a dom aprile→ultima dom ottobre, NON EU) → l'orario del riavvio segue UTC+8 finché l'utente non cambia fuso in Data e ora. `TZ=$(cat /etc/TZ) date` = ora mostrata dalla UI stock.
- Ora al boot: RTC PMIC (QPNP, HCTOSYS) parte dal 1970 (hwclock -r = 1/1/1970) → bootmisc.sh porta l'ora a /etc/timestamp (scritto da save-rtc.sh, S25 in rc0/rc6, a ogni spegnimento) → poi NTP. time_daemon non risultava attivo. Senza NTP ogni riavvio perde la durata del boot (~15-40 s) e dopo uno spegnimento lungo l'ora riparte da quella di spegnimento. Misurato: device -15 s rispetto al Mac dopo un riavvio.
- Riavvio stock 0x449ac: avviso a miniui = no-op (0x132d4 ritorna subito per "miniui"); `logread >> /var/syslog_messages` (se <2 MB, altrimenti >); `sleep 3 && reboot&`. /sbin/reboot → rc6.d (K..., S20sendsigs, S25save-rtc.sh, S99reboot).
- Upgrade web UI (fcgi_api_do_upgrade 0x5a894 → 0x5a3c4): partizioni del .dfw scritte in /cache/upgrade.zip → funzip (password ZIP fissa nel binario: NON trascritta per policy) → /cache/upgrade.bin → QCMAP_Client::WebUIUpdate (scrive flash) → file rimossi; successo: bm_backup.sh& + sleep 3 && reboot&; fallimento (0x5ba04): `rm -f /cache/lighttpd*`. → riavvio vietato se esistono /cache/upgrade.zip o /cache/upgrade.bin. Nessun processo ha /dev/mtd* aperto a riposo.

IMPLEMENTAZIONE (sorgenti in analysis/device-pull-0111/modified/)
- Config in /bmdefsys/etc/bm_custom.conf (non toccato dal reset di fabbrica): autoreboot_enable=0|1, autoreboot_time=HH:MM, autoreboot_days=giorni cron 0-6 (0=dom) normalizzati 1,2,3,4,5,6,0. Default API: 0, 04:00, tutti.
- custom_autoreboot.sh → /bmdefsys/usr/bin/ (root 755). `applica`: valida conf, mkdir crontabs, crontab di root = altre righe + `MM HH * * <giorni> /bmdefsys/usr/bin/custom_autoreboot.sh esegui`; se attivo e crond fermo lo avvia in subshell con fd>2 chiusi, `env -i PATH TZ=$(cat /etc/TZ)`, stdio /dev/null, senza argomenti. `esegui` riavvia solo se: attivo; uptime ≥600 s; anno ≥2025; giorno nella lista; ritardo <5 min dall'orario; /cache/custom_autoreboot.last ≠ "<oggi> <HH:MM>"; niente /cache/upgrade.{zip,bin}; nessun /dev/mtd* aperto. Poi logger -t riavvio_programmato, scrive .last, salva syslog come lo stock, sync, /sbin/reboot. AUTOREBOOT_PROVA=1 = dry-run (solo allora accetta AUTOREBOOT_CONF, AUTOREBOOT_UPTIME).
- init.d/custom_autoreboot → /etc/init.d/ + /etc/rc5.d/S99custom_autoreboot: start = applica (crond attivo dal boot senza aspettare NTP).
- custom.cgi: GET ?api=autoreboot → JSON {enable,time,days,now,utc_offset,clock_ok,csrf,m} (valori validati/formato fisso, m solo [a-z_]); POST action=autoreboot (enable, hour [01][0-9]|2[0-3], minute [0-5][0-9], days con %2C decodificato, regex ^[0-6](,[0-6]){0,6}$, ≥1 giorno se attivo; disattivando senza giorni restano quelli salvati) → conf_set + applica → 303 custom.cgi?api=autoreboot&m=ar_ok|err_val|err_days.
- UI: systemManagementPopup.html (tab + div tf1_autoReboot), js/custom_autoreboot.js, riga script in controlPanel.html.
- Hash 2026-11-02: custom.cgi 2a696dea…, controlPanel.html 2359a8e6…, systemManagementPopup.html 534015ce…, custom_autoreboot.js 8a1564e2…, custom_autoreboot.sh 1002d743…, init 74b92de7….

TEST
- Probe sola lettura: tools/dwr_autoreboot_probe.sh → analysis/notes/device-autoreboot-probe-0111.txt.
- tools/dwr_autoreboot_test.sh (file utenti di prova, orari a +12 h, dry-run, ripristina conf e crontab) = 48/48 → analysis/notes/device-autoreboot-test-2.txt (test-1 = primo giro, rivelato l'fd ereditato).
- Prova HTTPS su loopback (iptables -I INPUT -i lo) NEGATA di nuovo dal classificatore auto-mode il 2026-11-02 anche con autorizzazione generica dell'utente → serve consenso esplicito e specifico, o farla fare all'utente.
- dwr_cgitest.sh NON eseguito: repeater spento (aggiungerebbe reti TEST-CGI non rimovibili a caldo); regressione minima della pagina nel test autoreboot.
- tools/dwr_autoreboot_e2e.sh programma N | verifica | disattiva (via custom.cgi da shell).
- E2E 2026-11-02 (analysis/notes/device-autoreboot-e2e-0111.txt): programmato 21:56 ora router (13:56 UTC, uptime 1238 s) → riavvio alle 21:56:00 esatte (riga riavvio_programmato in /var/syslog_messages), boot in ~35 s; dopo il boot crond attivo da S99 (cmdline "crond"), riga di crontab presente, .last "2026-11-02 21:56". Orologio dopo il riavvio ~30 s indietro rispetto al Mac (prima -15 s): deriva da /etc/timestamp senza NTP (device senza internet: niente SIM, repeater spento). Poi disattivato con valori predefiniti (04:00, tutti i giorni), crontab vuoto.
- Non verificato da Claude: tab nel browser con login Basic reale (credenziali solo dell'utente) → da fare all'utente.
- STATO LASCIATO: funzione disattivata; file installati (vedi hash); /etc/TZ ancora GMT-8 (fuso da correggere dall'utente in Data e ora se vuole l'ora italiana).

LIMITI NOTI
- Senza NTP: deriva ~boot per riavvio; ora stantia dopo spegnimenti lunghi (controllo anno inutile). Mostrata "Ora del router" nella tab.
- Riavvio saltato se crond viene riavviato da qcmap_fcgi nel secondo esatto del minuto programmato (finestra ~1 s/ora) o con device sospeso/in ritardo >5 min.
- Upgrade firmware ufficiale cancella tutto (script, init, tab); reset di fabbrica no.
