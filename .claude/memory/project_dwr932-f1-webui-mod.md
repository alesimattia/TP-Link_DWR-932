---
name: dwr932-f1-webui-mod
description: DWR-932 F1 fw 01.11 - modifiche alla web UI originale (pulsante "Repeater Wi-Fi" sotto Setup Wizard in controlPanel.html) e pagina custom.cgi; come funziona la web UI D-Link (lighttpd/qcmap_fcgi, login MD5, sessioni), autenticazione e anti-CSRF della pagina, file e hash, deploy, test, rollback, vincoli
metadata:
  type: project
---
Procedura repeater → [[dwr932-f1-repeater-procedure]]. Analisi firmware → [[dwr932-f1-hidden-features]].

WEB UI ORIGINALE (lighttpd 1.4.43 con ssl, /bmdefsys/etc/lighttpd.conf, docroot /bmdefsys/WEBSERVER/webpages/)
- .html .js .css .png .gif e /webpost.cgi /login.cgi /data.ria li serve qcmap_fcgi (FastCGI bin-path, socket /tmp/fcgi.sock-0); debug*.cgi li serve debug_fcgi. /cgi-bin/ = CGI (cgi.assign ""=>"") eseguiti come root; contiene solo custom.cgi. Tutto HTTP viene rediretto a HTTPS. Nessun server.errorlog né access log.
- /etc/init.d/lighttpd start rigenera a ogni boot il certificato autofirmato e cancella /www/qcmap_session e /www/login_attempt.
- Senza sessione qcmap_fcgi risponde 302 → http://192.168.0.1/ su /index.html e /js/*; "/" è la pagina di login (200).
- Login D-Link: index.html invia CryptoJS.MD5(password) (hex minuscolo) a login.cgi; qcmap_fcgi doLogin lo confronta con /bmdefsys/www/lighttpd.user = "admin:<md5hex>" (38 byte, senza newline). Anche il cambio password (system.js, setupWizard.js) salva l'MD5.
- Sessione: token di 32 caratteri solo nella memoria di qcmap_fcgi, legato all'IP del client (doCheckAuth 0x1c80c). /www/qcmap_session (31 byte) contiene solo tempo, IP, timeout ed etichetta, non il token. authID = 6 cifre (refreshToken 0x1c954) scritte anche nel syslog. Nessuno di questi è usabile da un CGI per verificare la sessione D-Link.
- I file persistono (yaffs2 rw). Il reset di fabbrica NON tocca webpages/ né lighttpd.conf; un upgrade firmware sì.

MODIFICA 1: pulsante nella home (controlPanel.html, righe CRLF)
- Originale: sha256 78f7fecb9e0f2d47…, 43574 B, www-data:www-data 770 (copia in analysis/device-pull-0111/pull0111/bmdefsys/WEBSERVER/webpages/).
- Inserito, subito dopo il <div class="cpSetupWizard"> del Setup Wizard, un secondo blocco con le stesse classi: `<div class="cpSetupWizard">` + `<input type="button" value="Repeater Wi-Fi" class="cpWizardButtom" onClick="window.location.href='/cgi-bin/custom.cgi';" />` + `</div>` (righe \r\n, indentazione con tab, testo fisso senza data-localize). Sotto il Setup Wizard c'è spazio sufficiente.
- Ricetta (python -I, binario): trovare l'unico 'class="cpWizardButtom" onClick="openSetupWizardPopup(' e inserire il blocco dopo il primo '</div>\r\n' che lo segue. Risultato sha256 eddc058c…, 43752 B → analysis/device-pull-0111/modified/webpages/controlPanel.html. Dopo un upgrade firmware rigenerarlo sul nuovo file invece di copiare quello vecchio.
- Il browser può mostrare la home dalla cache: ricaricare.

MODIFICA 2: pagina custom.cgi (/bmdefsys/WEBSERVER/webpages/cgi-bin/custom.cgi; sorgente analysis/device-pull-0111/modified/custom.cgi, sha256 adad9223…)
- Sezioni: Repeater Wi-Fi (stato, Attiva/Disattiva con riavvio, reti salvate con Connetti/Elimina, ricerca reti, Aggiungi rete), Potenza TX (whitelist, /bmdefsys/etc/bm_custom.conf), Country code IT (sola lettura).
- AUTENTICAZIONE (fatta nel CGI): lighttpd passa l'header Authorization come HTTP_AUTHORIZATION (verificato con tools/dwr_lighttpd_hdrtest.sh) → base64 -d → l'utente deve coincidere con il campo 1 di lighttpd.user e `md5sum` della password (passata via stdin) con il campo 2. Altrimenti 401 con `WWW-Authenticate: Basic realm="DWR-932 impostazioni avanzate", charset="UTF-8"`. Stesse credenziali della web UI.
- Anti-bruteforce: /tmp/custom_cgi.fail; 2 s di attesa per ogni errore; con almeno 5 errori in 10 minuti → 429 per 10 minuti; il contatore si azzera a ogni accesso riuscito.
- File utenti alternativo CUSTOM_CGI_USERS accettato SOLO se GATEWAY_INTERFACE è vuoto (test da shell; lighttpd lo imposta sempre).
- NON usare `auth.require` di lighttpd: il backend plain confronta la password in chiaro con l'MD5 e rifiuta sempre. È stato l'errore del primo tentativo (2026-11-02), non visto perché il test isolato usava un file con password in chiaro: controllare sempre il formato del file reale. lighttpd.conf deve restare l'originale (sha256 4b0a2d05…, backup /cache/lighttpd.conf.orig); contiene già un "#auth.require" commentato (/server-status).
- Anti-CSRF: token /tmp/custom_cgi.csrf (16 byte urandom in hex, uno per boot) in ogni form. Il POST è accettato solo con Content-Type urlencoded, CONTENT_LENGTH ≤ 4096 e Origin == https://$HTTP_HOST se presente; lock con flock /tmp/custom_cgi.lock; risposta 303 → custom.cgi?m=<codice in whitelist>.
- Input: il JS manda SSID e password in esadecimale (TextEncoder); il CGI accetta ^([0-9a-f]{2}){1,32}$ e ^([2-6][0-9a-f]|7[0-9a-e]){8,63}$ (ASCII stampabile, da 8 a 63 caratteri); l'id viene verificato in list_networks; la decodifica hex la fa awk %c leggendo da ENVIRON (niente eval, niente argomenti). Tutto l'output HTML passa da h() (escape di & < > " '); le righe con SSID si stampano con printf '%s\n', non con echo.
- Questa build di wpa_cli 2.0 codifica gli SSID con printf_encode (\" \\ \xHH) in list_networks e scan_results; la funzione JS wpaBytes() li decodifica in testo e hex esatti.
- Aggiunta rete: con wpa_supplicant attivo add_network/set_network/enable_network/save_config a caldo (`reconfigure` interromperebbe la connessione); con il repeater spento append al file.
- Cambio modalità: sed WlanMode + MIB di vxd + pagina di attesa 90 s + `setsid sh -c 'sleep 3; /sbin/reboot'`.

DEPLOY, TEST, ROLLBACK
- tools/dwr_deploy_ui.sh sul device (input /cache/custom.cgi.new e /cache/controlPanel.html.new): sh -n, verifica che ci sia il pulsante, backup una tantum (/cache/custom.cgi.prev = versione del 25/10 solo potenza; /cache/controlPanel.html.orig), scrittura con cat (mantiene owner e permessi), ripristino di lighttpd.conf.orig con reboot sincrono se diverso. `--ripristina` riporta agli originali.
- Modifiche a custom.cgi e controlPanel.html sono attive subito (lette a ogni richiesta); modifiche a lighttpd.conf solo dopo reboot del device (mai riavvio a caldo di lighttpd).
- Test: `node tools/test_custom_js.cjs` (JS estratto dal CGI, tutto OK); sul device tools/dwr_cgitest.sh = 59/59 (Basic con file utenti di prova MD5, lockout 429, CSRF e Origin, validazioni, aggiunta a caldo, SSID ostile/XSS, Connetti/Elimina, scansione, HTTPS su loopback: 401 prodotto dal CGI, web UI originale 200, pulsante presente) e tools/dwr_cgitest_mode.sh on|off.
- L'utente ha verificato dal browser il login reale e il funzionamento (2026-11-02).
