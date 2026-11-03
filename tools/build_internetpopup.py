#!/usr/bin/env python3
"""Genera internetPopup.html della web UI del DWR-932 dal file stock (fw 01.11).

Nella tab Modalità di connessione (template doT cnmodeinfoTemplate) aggiunge, sotto il riquadro con Cellulare
preferito, roaming e modalità di connessione, il riquadro "Bande LTE e carrier aggregation" (div #cst_lteBand).
Il contenuto lo riempie js/custom_lteband.js dopo il disegno stock della tab. Il blocco non contiene sintassi doT
e usa entità HTML per gli accenti. Il file stock ha righe CRLF: anche il blocco inserito le usa.

Uso: python3 -I tools/build_internetpopup.py <internetPopup.html stock> <output>
"""
import re
import sys

NL = "\r\n"

BLOCCO = [
    '<h4>Bande LTE e carrier aggregation</h4>',
    '<div class="roundedBox" id="cst_lteBand">',
    '\t<div class="configRow">',
    '\t\t<label>Bande abilitate</label>',
    '\t\t<p class="cstLbStato" style="width:300px;line-height:20px;padding-top:5px">lettura dal modem...</p>',
    '\t</div>',
    '\t<div class="break">&nbsp;</div>',
    '\t<div class="configRow">',
    '\t\t<label>Bande LTE</label>',
    '\t\t<p class="cstLbScelta" style="width:300px"></p>',
    '\t</div>',
    '\t<div class="break">&nbsp;</div>',
    '\t<div class="configRow">',
    '\t\t<label>Carrier aggregation</label>',
    '\t\t<p class="cstLbCa" style="width:300px;line-height:20px;padding-top:5px"></p>',
    '\t</div>',
    '\t<div class="break">&nbsp;</div>',
    '\t<div class="configRow">',
    '\t\t<label>&nbsp;</label>',
    '\t\t<p style="width:300px;font-size:12px;line-height:18px">La scelta resta salvata nel modem anche dopo il'
    ' riavvio e vale con qualunque Cellulare preferito. Se nessuna delle bande scelte &egrave; coperta, il router'
    ' resta senza 4G (con Automatico passa al 3G). La carrier aggregation non ha un interruttore: nel modem non'
    ' risulta disattivata e la attiva la rete quando combina due bande abilitate; dal firmware non si vede se'
    ' &egrave; in uso.</p>',
    '\t</div>',
    '\t<div class="break">&nbsp;</div>',
    '\t<div class="configRow">',
    '\t\t<label>&nbsp;</label>',
    '\t\t<p>',
    '\t\t\t<input type="button" value="Tutte" class="btnSubmit cstLbTutte" disabled>',
    '\t\t\t<input type="button" value="Applica bande" class="btnSubmit cstLbApplica" disabled>',
    '\t\t</p>',
    '\t</div>',
    '</div>',
]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    with open(sys.argv[1], "rb") as f:
        testo = f.read().decode("utf-8")
    if "cst_lteBand" in testo:
        sys.exit("il file contiene già il riquadro delle bande: serve il file stock")
    # Fine del riquadro "Cellular Settings" (roundedBox), seguita dalla chiusura di configContent e configForm e
    # dalla riga dei pulsanti con internet_connectionModeSettingsValidate
    pat = re.compile(r'(\t\t\t\t</div>\r\n)(\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class="submitRowPopup">\r\n'
                     r'[^\n]*internet_connectionModeSettingsValidate)')
    trovati = list(pat.finditer(testo))
    if len(trovati) != 1:
        sys.exit(f"punto di inserimento trovato {len(trovati)} volte invece di 1: file stock diverso dal previsto")
    m = trovati[0]
    ind = "\t\t\t\t"
    blocco = "".join(ind + riga + NL for riga in BLOCCO)
    testo = testo[:m.end(1)] + blocco + testo[m.end(1):]
    with open(sys.argv[2], "wb") as f:
        f.write(testo.encode("utf-8"))


if __name__ == "__main__":
    main()
