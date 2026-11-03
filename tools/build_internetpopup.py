#!/usr/bin/env python3
"""Genera internetPopup.html della web UI del DWR-932 dal file stock (fw 01.11).

Nella tab Modalità di connessione (template doT cnmodeinfoTemplate) aggiunge, sotto il riquadro con Cellulare
preferito, roaming e modalità di connessione, il riquadro "Bande LTE e carrier aggregation" (div #cst_lteBand),
che riempie js/custom_lteband.js. Nella tab Impostazioni LAN del router (template lanInfoTemplate) aggiunge, sotto
il riquadro del servizio DHCP, il riquadro "DNS personalizzati" (div #cst_dns), che riempie js/custom_dns.js.
I blocchi non contengono sintassi doT e usano entità HTML per gli accenti. Il file stock ha righe CRLF: anche i
blocchi inseriti le usano.

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


BLOCCO_DNS = [
    '<div id="cst_dns">',
    '\t<h4>DNS personalizzati</h4>',
    '\t<div class="roundedBox">',
    '\t\t<div class="configRow">',
    '\t\t\t<label>DNS in uso</label>',
    '\t\t\t<p class="cstDnsStato" style="width:300px;line-height:20px;padding-top:5px">lettura...</p>',
    '\t\t</div>',
    '\t\t<div class="break">&nbsp;</div>',
    '\t\t<div class="configRow">',
    '\t\t\t<label>Server DNS</label>',
    '\t\t\t<select class="cstDnsScelta" disabled>',
    '\t\t\t\t<option value="auto">Automatici (dalla rete)</option>',
    '\t\t\t\t<option value="cloudflare">Cloudflare</option>',
    '\t\t\t\t<option value="quad9">Quad9 (blocca siti malevoli)</option>',
    '\t\t\t\t<option value="google">Google</option>',
    '\t\t\t\t<option value="adguard">AdGuard (blocca la pubblicit&agrave;)</option>',
    '\t\t\t\t<option value="custom">Personalizzati</option>',
    '\t\t\t</select>',
    '\t\t</div>',
    '\t\t<div class="break">&nbsp;</div>',
    '\t\t<div class="configRow">',
    '\t\t\t<label>Server DNS 1</label>',
    '\t\t\t<input type="text" class="cstDns1" maxlength="15" disabled>',
    '\t\t</div>',
    '\t\t<div class="break">&nbsp;</div>',
    '\t\t<div class="configRow">',
    '\t\t\t<label>Server DNS 2</label>',
    '\t\t\t<input type="text" class="cstDns2" maxlength="15" placeholder="facoltativo" disabled>',
    '\t\t</div>',
    '\t\t<div class="break">&nbsp;</div>',
    '\t\t<div class="configRow">',
    '\t\t\t<label>&nbsp;</label>',
    '\t\t\t<p style="width:300px;font-size:12px;line-height:18px">I dispositivi collegati usano il router come'
    ' DNS e il router inoltra le richieste ai server scelti, sia con l&#39;LTE sia in modalit&agrave; repeater. La'
    ' scelta resta dopo il riavvio. Non cambia i DNS usati dal router stesso n&eacute; quelli dei dispositivi con'
    ' DNS impostati a mano o DNS cifrato nel browser. Riguarda i DNS IPv4: con una connessione IPv6 l&#39;operatore'
    ' pu&ograve; indicare ai dispositivi anche i propri DNS IPv6.</p>',
    '\t\t</div>',
    '\t\t<div class="break">&nbsp;</div>',
    '\t\t<div class="configRow">',
    '\t\t\t<label>&nbsp;</label>',
    '\t\t\t<p><input type="button" value="Applica DNS" class="btnSubmit cstDnsApplica" disabled></p>',
    '\t\t</div>',
    '\t</div>',
    '</div>',
]


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    with open(sys.argv[1], "rb") as f:
        testo = f.read().decode("utf-8")
    if "cst_lteBand" in testo or "cst_dns" in testo:
        sys.exit("il file contiene già i riquadri custom: serve il file stock")
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
    # Tab Impostazioni LAN: subito prima del separatore che chiude il riquadro del servizio DHCP
    pat = re.compile(r'\t\t\t\t<div class="break" id="break_dhcpService_div">\r\n')
    trovati = list(pat.finditer(testo))
    if len(trovati) != 1:
        sys.exit(f"separatore del servizio DHCP trovato {len(trovati)} volte invece di 1: file stock diverso dal previsto")
    inizio = trovati[0].start()
    blocco = "".join(ind + riga + NL for riga in BLOCCO_DNS)
    testo = testo[:inizio] + blocco + testo[inizio:]
    with open(sys.argv[2], "wb") as f:
        f.write(testo.encode("utf-8"))


if __name__ == "__main__":
    main()
