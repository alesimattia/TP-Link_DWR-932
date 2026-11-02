---
name: dwr932-f1-rootaccess
description: DWR-932 F1 (fw 01.11) - procedura verificata per shell root (adb uid=0) via web UI debug senza auth; richiede un PC Windows (macOS fallisce); driver, comandi, restore, stato device
metadata:
  type: project
---

Device → [[dwr932-f1-device]]. Firmware/vie → [[dwr932-f1-firmware-gpl]].

ROOT su DWR-932 F1 fw 01.11 OTTENUTO (uid=0, 2026-10-24). Meccanismo: la web UI espone endpoint di debug SENZA autenticazione (il fix delle CVE 2021 NON è applicato al ramo F1); adbd gira come root → `adb shell` = root senza password (preferito a telnet, la cui pw è hardcoded e per policy NON va usata).

SERVE UN PC WINDOWS — da macOS NON è possibile. Su Mac il DWR usa la composizione USB "mac" (ecm_qc) che il firmware lascia inerte: nessun IP/ARP/web UI, nessuna seriale/adb/diag. Su Windows invece il DWR espone RNDIS → il PC prende IP via DHCP (es. 192.168.0.57) e la web UI del device su https://192.168.0.1 è raggiungibile; e in modalità diag il device espone adb/DIAG (driver Qualcomm Windows). Il PC Windows da usare e come raggiungerlo (SSH) sono descritti nel CLAUDE.md globale; qui la procedura è PC-agnostica.

PREPARAZIONE sul PC Windows (device collegato via USB):
- Procurarsi adb.exe + fastboot.exe + la cartella Driver\ dell'updater ufficiale 01.04 (nel repo: analysis/fw0104-extract/exe/). Copiarli in una cartella di lavoro sul PC.
- Registrare i driver nello store (admin): `pnputil /add-driver Driver\ADB\x64\android_winusb.inf` e `Driver\Win8\qcser.inf`. Servono perché in modalità diag/adb il device cambia identità in Qualcomm VID_05C6 PID_9025 (adb su MI_01); l'INF adb copre VID_05C6&PID_9025&MI_01.
- Modalità normale: DWR = VID_2001 PID_7E41 (rndis+mass_storage), web UI su 192.168.0.1 (lighttpd, HTTP→HTTPS 301).

PASSI per shell root (comandi eseguiti sul PC Windows; <PC> = web UI del device):
1. Abilita adb: `curl.exe -s -k -X POST -H "Content-Type: application/json" --data "{\"CfgType\":\"debug_enable_adb\"}" https://192.168.0.1/debug_post_set.cgi` → {"cmd_status":"done"}. (Da solo NON basta: in rndis+ms adb non ha trasporto, TCP 5555 chiuso, switch runtime a comp 2034 non tiene.)
2. Riavvia in test/factory mode per ri-enumerare con interfaccia adb su USB: POST {"CfgType":"debug_enable_test_mode"} a debug_post_set.cgi → device reboot ~40s.
3. `adb.exe devices` → `d2fd18441c14  device`; poi `adb.exe shell "<cmd>"` = root (uid=0).
- RESTORE a modalità normale (eseguito 2026-10-25): `adb shell sh /bmdefsys/usr/bin/debug_mode.sh adbd_disable` poi `... test_mode_disable` (= AT+BMFTM=0 >/dev/smd7 + reboot). CAVEAT: dopo questo reboot il DWR NON si è ri-enumerato automaticamente sull'USB del PC (né RNDIS né CD-ROM) → serve REPLUG FISICO del cavo (o prossimo uso normale) per riavere web UI/adb. Firmware STOCK/intatto (toccati solo flag adb e bmftm, reversibili) → device sano, non brickato. Per rifare root: replug → web UI → ripetere i PASSI.

STATO 2026-11-02: al ricollegamento USB il DWR si è presentato GIÀ in test mode (05C6:9025: ADB, DIAG COM10, NMEA COM9, mass storage SD; 2 interfacce "Mobile Connect" in errore = senza driver, innocue) → `adb devices` = d2fd18441c14, root immediato senza passare dalla web UI. Prima del replug fisico Windows non registrava NESSUN evento USB (neanche con cavo collegato): se il DWR non compare, chiedere di staccare/ricollegare il cavo lato DWR. PC raggiunto via Ethernet 192.168.1.150 (vedi CLAUDE.md globale).

API debug_post_set.cgi (POST JSON {"CfgType":"<az>"}): debug_enable_adb/disable_adb, debug_enable_telnet/disable_telnet, debug_enable_diag_mode/disable_diag_mode (comp 2034), debug_enable_test_mode/disable_test_mode (AT+BMFTM + reboot). GET info senza auth: debug_basic_info.cgi (sw_ver, SIM), debug_at_info/device_info/wireless_info.cgi. (Mappa azioni/CfgType dal binario debug_fcgi 01.04 in analysis/fw0104-extract/bmdefsys/usr/bin/.)

STATO DEVICE da shell root (01.11): kernel Linux 3.4.0+ PREEMPT build 28/06/2024 CST, cmdline root=/dev/mtdblock20 rw yaffs2 console=ttyHSL0,115200, androidboot.serialno=MDM9625, baseband=msm. Servizi LISTEN: lighttpd 80/443, dnsmasq 53, adbd; no telnet/ssh. Layout MTD (22 part): mtd0 sbl, 1 mibib, 2 efs2, 3 sdi, 4 tz, 5 mba, 6 rpm, 7 qdsp, 9 appsbl(aboot), 10 apps, 12 cache, 13 misc, 14 recovery, 15 fota, 16 recoveryfs, 17 cdrom, 18 backup, 19 bmdefsys, 20 system, 21 userdata.

DUMP / BACKUP PARTIZIONI (caveat verificati 2026-10-24):
- Usare device a CARATTERI: `adb.exe pull /dev/mtdN mtd\mtdN.img` = byte-esatto (md5 device == file). NON usare /dev/mtdblockN → "Input/output error" sulle partizioni con bad block.
- mtd1 (mibib = tabella partizioni Qualcomm): la lettura raw BLOCCA il driver NAND in stato D non interrompibile (busybox `timeout` NON riesce a killarlo) e può far cadere la connessione adb → SALTARE mtd1 nel backup. Dopo un hang: `taskkill /F /IM adb.exe` sul PC, poi `adb kill-server` + riconnessione; il device resta vivo (root).
- Per dumpare tutte tranne mibib: loop PowerShell sul PC `cd $env:USERPROFILE\dwr; $idx=@(0); $idx+=2..21; foreach($i in $idx){ .\adb.exe pull /dev/mtd$i mtd\mtd$i.img *>$null }`. Poi scp PC→Mac in ./backup.
- Tool device: dd, cat, busybox (NO nanddump). busybox timeout sintassi VECCHIA: `timeout -t <sec> <cmd>`.
- Loop: cmd `for /L %i` NON espande %i via SSH; zsh NON fa word-split su `$var` unquoted (usare array PowerShell sul PC, o `$(seq 0 21)` che in zsh splitta).

CAVEAT PING PC (2026-10-25): dopo un riavvio del PC Windows il ping ICMP verso 192.168.1.149 resta BLOCCATO (0 risposte, firewall) MENTRE SSH funziona. NON usare `ping` per capire se il PC è su (attese ping-based danno falsi negativi): usare un tentativo SSH breve (`ssh ... "echo OK"`) o l'ARP per MAC. Il DWR in test mode sopravvive al reboot del PC; dopo, su PC: `adb kill-server & adb start-server & adb devices`. adb reboot del DWR → torna in test mode, `adb wait-for-device` poi riconnette.

CAVEAT TRASFERIMENTO PC→Mac (link SSH/Wi-Fi molto instabile, 2026-10-24/25):
- I trasferimenti grandi/sostenuti MUOIONO a metà (scp si chiude, a volte a un byte count ~fisso ~5,5 MB, a volte prima; poi l'host resta irraggiungibile per un po'). NON è rekey/KEX (provati KexAlgorithms classici + RekeyLimit alto: identico). I comandi SSH brevi funzionano.
- scp NON riprende i parziali; retry ravvicinati peggiorano (uccidono la connessione). Manifest generati su Windows hanno CRLF → nei confronti dimensioni fare `tr -d '\r'`.
- SOLUZIONE che funziona: (1) comprimere sul PC con `tar.exe -czf x.gz x` (le partizioni scratch/0xFF crollano: cache 125MB→130KB, fota→124KB; qdsp 50MB→21MB); (2) FETCH RESUMABLE byte-esatto leggendo da offset via PowerShell su stdout e appendendo localmente:
  `ssh ... 'powershell -NoProfile -Command "$p=Join-Path $env:USERPROFILE dwr\mtd\F.gz; $f=[IO.File]::OpenRead($p); [void]$f.Seek(OFFSET,0); $o=[Console]::OpenStandardOutput(); $f.CopyTo($o); $o.Flush(); $f.Close()"' >> local.gz 2>/dev/null`
  loop: offset = dimensione locale corrente; ripeti finché size == atteso. Verificato md5-identico. Poi `gunzip`/ricompone sul Mac.
- Niente `sleep` in foreground (bloccato): per backoff usare `ping -c N`.

NOTA quoting SSH→cmd→adb: comandi semplici (id, cat, ls singolo) OK; pipe a grep con pattern tra virgolette o `\|` si rompono (doppio escaping). Preferire `adb.exe pull <path>` + analisi locale, o `adb push` di uno script sul device + `adb shell sh /cache/x.sh`, o comandi senza virgolette annidate.
