#!/usr/bin/env python3
"""Genera controlPanel.html modificato a partire da quello stock della web UI del DWR-932 (fw 01.11).

Modifiche applicate (righe CRLF come l'originale):
1. css: regole del riquadro di stato (blocco <style> dopo l'ultimo foglio di stile);
2. script js/custom_autoreboot.js (tab "Riavvio programmato") e js/custom_status.js dopo js/system.js;
3. pulsante "FUNZIONALITÀ AVANZATE" sotto "Setup Wizard" verso /cgi-bin/custom.cgi;
4. colonna sinistra (div.cpMainLeft) riscritta: intestazione con icone di rete e segnale, operatore, dBm e dati
   usati; sotto, lista di voci con il valore a destra (connessione, segnale, cella, rete e dati, temperature, CPU e
   memoria, batteria, Wi-Fi e LAN) riempita da js/custom_status.js. I template doT stock cp_internetTemplate e
   cp_connectionModeTemplate restano nella pagina: controlPanel.js li legge a ogni aggiornamento (senza, il refresh
   di 5 s si interromperebbe); i loro contenitori non ci sono più, quindi non disegnano nulla.

Uso: python3 -I tools/build_controlpanel.py <controlPanel.html stock> <output>
"""
import hashlib
import re
import sys

NL = "\r\n"

STILE = """\t\t<style type="text/css">
\t\t\t.cpMainLeft > div > div.cstHead { height: 50px; padding: 4px 8px 4px 6px; }
\t\t\t.cstHead a { float: left; }
\t\t\t.cstHead #cst_sig { margin: 9px 0 0 0; }
\t\t\t.cstHeadTxt { overflow: hidden; padding-left: 4px; text-align: right; }
\t\t\t.cstHeadTxt p { color: #40464B; font-size: 11px; line-height: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
\t\t\t.cstHeadTxt p.cstOp { color: #345C7A; font-size: 13px; font-weight: bold; line-height: 15px; }
\t\t\t.cstHeadTxt b { color: #0075b5; font-size: 13px; }
\t\t\t.cstHeadTxt p.cstLimit { color: #8C8C8C; font-size: 10px; }
\t\t\t.cpMainLeft > div > div.cstList { height: 296px; overflow-x: hidden; overflow-y: auto; padding: 2px 6px 4px 10px; }
\t\t\t.cstTab { width: 100%; border-collapse: collapse; font-size: 11px; line-height: 16px; }
\t\t\t.cstTab td { color: #40464B; white-space: nowrap; vertical-align: top; }
\t\t\t.cstTab td + td { color: #0075b5; font-weight: bold; text-align: right; white-space: normal; word-break: break-word; padding-left: 6px; }
\t\t\t.cstTab tr.cstGrp th { color: #345C7A; font-size: 11px; font-weight: bold; text-align: left; padding: 7px 0 1px 0; border-bottom: 1px dotted #797979; }
\t\t\t.cstTab tr.cstGrp:first-child th { padding-top: 2px; }
\t\t\t.cstTab td.cstNota { color: #B5470B; font-weight: normal; text-align: left; white-space: normal; }
\t\t</style>"""

# Gruppi e voci della lista: (id, etichetta)
GRUPPI = [
    ("Connessione", [("cst_stato", "Stato"), ("cst_tipo", "Tecnologia"), ("cst_vel", "Velocit&agrave; &darr; / &uarr;"),
                     ("cst_durata", "Durata"), ("cst_roaming", "Roaming")]),
    ("Segnale", [("cst_livello", "Livello"), ("cst_rssi", "RSSI"), ("cst_rsrp", "RSRP (potenza)"),
                 ("cst_rsrq", "RSRQ (qualit&agrave;)"), ("cst_sinr", "SINR (rumore)"), ("cst_ecio", "Ec/Io"),
                 ("cst_txp", "Potenza TX")]),
    ("Cella", [("cst_banda", "Banda"), ("cst_bw", "Larghezza"), ("cst_earfcn", "EARFCN"),
               ("cst_freq", "Freq. DL / UL"), ("cst_cid", "Cell ID"), ("cst_enb", "eNodeB"), ("cst_pci", "PCI"),
               ("cst_tac", "Area")]),
    ("Rete e dati", [("cst_plmn", "Rete (MCC MNC)"), ("cst_dominio", "Servizio"), ("cst_volte", "VoLTE"),
                     ("cst_bande", "Bande LTE"), ("cst_ip", "IP"), ("cst_ip6", "IPv6"), ("cst_dns", "DNS"),
                     ("cst_rx", "Ricevuti"), ("cst_tx", "Inviati")]),
    ("Temperature", [("cst_tsoc", "Processore"), ("cst_tpmic", "PMIC"), ("cst_txo", "Oscillatore"),
                     ("cst_tbatt", "Batteria")]),
    ("CPU e memoria", [("cst_freq_cpu", "Frequenza"), ("cst_gov", "Governor"), ("cst_limiti", "Limiti"),
                       ("cst_uso", "Utilizzo"), ("cst_carico", "Carico medio"), ("cst_ram", "RAM libera"),
                       ("cst_uptime", "Acceso da")]),
    ("Batteria", [("cst_bcap", "Livello"), ("cst_bmv", "Tensione"), ("cst_bstato", "Stato"),
                  ("cst_bsalute", "Salute"), ("cst_bext", "Alimentazione")]),
    ("Wi-Fi e LAN", [("cst_wcli", "Client Wi-Fi"), ("cst_wch", "Canale"), ("cst_wrate", "Velocit&agrave; TX"),
                     ("cst_nat", "Connessioni NAT")]),
]
# Riga mostrata da custom_status.js quando custom_status.cgi nega l'accesso (IP diverso da quello del login)
NOTA = ('<tr id="cst_nota" style="display:none"><td colspan="2" class="cstNota">Dati del dispositivo non disponibili: '
        'esci e rientra nella web UI da questo dispositivo.</td></tr>')

POPUP_MODO = ("openPopup(event,'tf1_popupInternetDialog','button.config.popSettings',-1,'tf1_dialog',"
              "'tf1_popupInternetContent','controlPanel','internetPopup.html', 'tf1_connectModeSettings',"
              "'internet_onloadConnmodeConfig');")
POPUP_RETE = ("openPopup(event,'tf1_popupInternetDialog','button.config.popSettings',-1,'tf1_dialog',"
              "'tf1_popupInternetContent','controlPanel','internetPopup.html', 'tf1_networkStatus','network_info');")

PULSANTE = ('\t\t\t\t\t<div class="cpSetupWizard">' + NL +
            '\t\t\t\t\t\t<input type="button" value="FUNZIONALIT&Agrave; AVANZATE" class="cpWizardButtom" '
            'onClick="window.location.href=\'/cgi-bin/custom.cgi\';" />' + NL +
            '\t\t\t\t\t</div>' + NL)


def unico(testo, pattern, cosa):
    trovati = [m for m in re.finditer(pattern, testo, re.S)]
    if len(trovati) != 1:
        sys.exit(f"{cosa}: {len(trovati)} occorrenze invece di 1")
    return trovati[0]


def colonna_sinistra(regione):
    h1 = unico(regione, r'\t*<h1><a [^\n]*data-localize="menu\.internet"[^\n]*</h1>', "titolo Internet").group(0)
    t_internet = unico(regione, r'<script id="cp_internetTemplate".*?</script>', "template internet").group(0)
    t_modo = unico(regione, r'<script id="cp_connectionModeTemplate".*?</script>', "template modalità").group(0)
    righe = [
        '\t\t\t\t<div class="cpMainLeft">',
        '\t\t\t\t\t<div>',
        '\t\t\t\t\t\t' + h1.strip(),
        '\t\t\t\t\t\t<div class="cstHead">',
        f'\t\t\t\t\t\t\t<a href="#" id="cst_mode" class="cpInternetModeGray4" onClick="{POPUP_MODO}"></a>',
        f'\t\t\t\t\t\t\t<a href="#" id="cst_sig" class="signalGray6" onClick="{POPUP_RETE}"></a>',
        '\t\t\t\t\t\t\t<div class="cstHeadTxt">',
        '\t\t\t\t\t\t\t\t<p id="cst_op" class="cstOp">&mdash;</p>',
        '\t\t\t\t\t\t\t\t<p id="cst_dbm">&nbsp;</p>',
        '\t\t\t\t\t\t\t\t<p><b id="cst_used">&mdash;</b> usati</p>',
        '\t\t\t\t\t\t\t\t<p id="cst_limit" class="cstLimit">&nbsp;</p>',
        '\t\t\t\t\t\t\t</div>',
        '\t\t\t\t\t\t</div>',
        '\t\t\t\t\t\t<div class="cstList" id="cst_list">',
        '\t\t\t\t\t\t\t<table class="cstTab">',
    ]
    for titolo, voci in GRUPPI:
        righe.append(f'\t\t\t\t\t\t\t\t<tr class="cstGrp"><th colspan="2">{titolo}</th></tr>')
        if titolo == "Temperature":
            righe.append('\t\t\t\t\t\t\t\t' + NOTA)
        for ident, etichetta in voci:
            righe.append(f'\t\t\t\t\t\t\t\t<tr><td>{etichetta}</td><td id="{ident}">&mdash;</td></tr>')
    righe += [
        '\t\t\t\t\t\t\t</table>',
        '\t\t\t\t\t\t</div>',
        '\t\t\t\t\t\t<!-- Template stock letti da controlPanel.js a ogni aggiornamento: senza contenitore non disegnano -->',
        '\t\t\t\t\t\t' + t_internet,
        '\t\t\t\t\t\t' + t_modo,
        '\t\t\t\t\t</div>',
        '\t\t\t\t</div>',
    ]
    return NL.join(righe) + NL


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    testo = open(sys.argv[1], "rb").read().decode("utf-8")
    if "custom_status.js" in testo or "cstList" in testo:
        sys.exit("il file di ingresso contiene già le modifiche: usare il controlPanel.html stock")

    # 1. stile dopo l'ultimo foglio di stile
    m = unico(testo, r'[^\n]*href="css/window\.css" />\r\n', "foglio window.css")
    testo = testo[:m.end()] + STILE.replace("\n", NL) + NL + testo[m.end():]

    # 2. script dopo system.js
    m = unico(testo, r'(\t*)<script [^\n]*src="js/system\.js"></script>\r\n', "script system.js")
    ind = m.group(1)
    script = "".join(f'{ind}<script type="text/javascript" language="javascript" src="js/{n}"></script>{NL}'
                     for n in ("custom_autoreboot.js", "custom_status.js"))
    testo = testo[:m.end()] + script + testo[m.end():]

    # 3. pulsante dopo il blocco del Setup Wizard
    m = unico(testo, r'class="cpWizardButtom" onClick="openSetupWizardPopup\(', "pulsante Setup Wizard")
    fine = testo.index("</div>" + NL, m.end()) + len("</div>" + NL)
    testo = testo[:fine] + PULSANTE + testo[fine:]

    # 4. colonna sinistra
    inizio = unico(testo, r'\t*<div class="cpMainLeft">\r\n', "inizio cpMainLeft").start()
    fine = unico(testo, r'\t*<div class="cpMainMid">\r\n', "inizio cpMainMid").start()
    testo = testo[:inizio] + colonna_sinistra(testo[inizio:fine]) + testo[fine:]

    dati = testo.encode("utf-8")
    open(sys.argv[2], "wb").write(dati)
    print(f"{sys.argv[2]}: {len(dati)} byte, sha256 {hashlib.sha256(dati).hexdigest()}")


if __name__ == "__main__":
    main()
