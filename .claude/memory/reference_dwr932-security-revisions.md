---
name: dwr932-security-revisions
description: DWR-932 - revisioni HW B/C2/D/E/F (specifiche, ultimi firmware, URL download D-Link) e CVE note per revisione; nessuna CVE pubblica per F1 al 2026-10-24
metadata:
  type: reference
---

Device utente = F1 → [[dwr932-f1-device]], fw/GPL → [[dwr932-f1-firmware-gpl]].

DOWNLOAD UFFICIALI
- ftp.dlink.de/dwr/dwr-932/driver_software/ (fw + GPL per rev), …/documentation/ (datasheet, man, qig, CEDoC). index_info.txt obsoleto (dice F1 = 104eu).
- Ultimi fw: B 2.03EU (2016-10-12), C2 1.02EU (2017-04-24), D 4.00EUb04 (2015-08-24, no GPL), E1 1.04EU (2018-07-02), F1 1.11EU (2024-08-02, unica aggiornata di recente).
- GPL: B .bz2 257 MiB, C2 .zip 839 MiB, E1 .tar.gz 614 MiB, F1 .tar.gz 1052 MiB (= fw 01.04.EU). Server lento ~0.7 MB/s, connessione cade (curl exit 56) → usare `curl -C -` con retry.
- Datasheet rev F non pubblicato; usare manuale rev E/F.

REVISIONI (datasheet)
- B: LTE B1/3/7/8/20 + TDD B38, display LCD, 2020 mAh, 73x73x15 mm 77 g, DL MIMO 2x2, base Quanta (OpenEmbedded, Qualcomm MSM).
- C2: LTE B3/7/20, LED, 2000 mAh, 105x65x16 mm 100 g, USIM 6-pin.
- D: LTE B3/7/20, WCDMA B1/B8, display, microSD, 2640 mAh, 70.6x70.6x16.6 mm 140 g, 5V/1.5A.
- E/F: LTE B1/3/7/8/20, mini-SIM, 2000 mAh, 97x60x16.47 mm 95 g.
- DWR-932C = SKU distinto (varianti regionali, es. E1/F1 Asia/Russia), non confondere.
- ODM: B = Quanta; F1 = Shanghai BroadMobi (header GPL F1, vedi [[dwr932-f1-firmware-gpl]]); E1 probabile stesso ODM di F1 (stesso manuale/specifiche) = inferenza non verificata.

CVE
- Rev B1 (Pierre Kim, 2016-09-28, ~20 vuln, fw 2.02 testato; D-Link: B1 EOL, solo B1 affetto, D1 no):
  CVE-2016-10177 telnet/SSH con credenziali hardcoded root/admin (CVSS 9.8); CVE-2016-10178 UDP 39889 (/bin/appmgr) avvia telnetd root; CVE-2016-10179 PIN WPS hardcoded; CVE-2016-10185/10186 miniupnpd secure_mode=no + nessuna deny rule (TCP 2869); FOTA con credenziali hardcoded + TLS non valido; bug HTTP daemon qmiweb; binari world-writable; DDNS leak.
  Advisory: pierrekim.github.io/blog/2016-09-28-dlink-dwr-932b-lte-routers-vulnerabilities.html
- DWR-932C E1 fw 1.0.0.4: CVE-2021-42783 auth mancante debug_post_set.cgi; CVE-2021-42784 command injection debug_fcgi (CVSS 9.8). Advisory D-Link SAP10246 (credito GovTech Singapore), fix hotfix 1.0.0.5; nessun PoC pubblico. DWR-932C rev E = board R705B come DWR-932 E1 (stesso ODM BroadMobi); F1 = board R602B → presenza endpoint debug* su F1 da verificare (ricerca 2026-10-24).
- F1: nessuna CVE trovata (ricerca 2026-10-24). Stessa famiglia piattaforma di B (Qualcomm MDM + OpenEmbedded) → da verificare sul device quando raggiungibile: TCP 22/23, UDP 39889, endpoint debug*.cgi / debug_fcgi, UPnP 2869.
