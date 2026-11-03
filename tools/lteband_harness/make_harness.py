#!/usr/bin/env python3
"""Banco di prova locale del riquadro "Bande LTE e carrier aggregation" (tab Modalità di connessione del popup Internet).

Estrae il div tf1_connectModeSettings dall'internetPopup.html generato da tools/build_internetpopup.py e lo mette nella
cornice del popup (stesse classi e CSS della web UI stock), con jQuery, doT, js/api/internetApi.js stock e
js/custom_lteband.js. Simula le risposte di custom.cgi?api=lteband e della POST action=lteband.
Scenari (hash dell'URL): #tutte = tutte le bande supportate abilitate, #bloccate = solo B3 e B7, #errore = il modem
non risponde, #negato = 401. Con "-full" il contenuto della tab non scorre e mostra tutto.

Uso: python3 -I tools/lteband_harness/make_harness.py <internetPopup.html generato> <custom_lteband.js> <webpages stock>
Scrive tools/lteband_harness/harness.html (i percorsi verso i file della web UI sono relativi).
"""
import os
import re
import sys

MOCK = r"""
var scenario = (location.hash || "#tutte").slice(1);
var full = /-full$/.test(scenario);
scenario = scenario.replace(/-full$/, "");
var CAP = [1, 3, 7, 8, 20, 38, 40];
var stato = { lte: scenario === "bloccate" ? [3, 7] : CAP.slice() };
var global_lang = { internet_popup: {}, cpsection: {}, common: {} };
var ui_config = { apn_info: { apn: { COMMON: { netpref_value: "0", roaming_conx: "0", auto_conx: "1" } } },
	Dyn_Status: { up_5s: { ipv4: { status: "Disconnected" } } } };
window.alert = function (m) { console.log("ALERT " + m); };
window.confirm = function (m) { console.log("CONFIRM " + m); return true; };
$.ajax = function (o) {
	var d = $.Deferred();
	setTimeout(function () {
		if (scenario === "negato") { d.reject({ status: 401 }); return; }
		if (o.type === "POST") { stato.lte = o.data.bands.split(",").map(Number); }
		if (scenario === "errore") { d.resolve({ ok: 0, cap: [], lte: [], csrf: "x", m: "" }); return; }
		d.resolve({ ok: 1, cap: CAP, lte: stato.lte, csrf: "0123456789abcdef", m: o.type === "POST" ? "lte_ok" : "" });
	}, 10);
	return d.promise();
};
"""


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    popup, js, stock = sys.argv[1:]
    testo = open(popup, "rb").read().decode("utf-8")
    m = re.search(r'<div id="tf1_connectModeSettings">.*?(?=\s*<!-- Connection Settings Ends here -->)', testo, re.S)
    if not m:
        sys.exit("tf1_connectModeSettings non trovato")
    tab = m.group(0)
    out_dir = os.path.dirname(os.path.abspath(__file__))
    rel = lambda p: os.path.relpath(os.path.abspath(p), out_dir)
    s = rel(stock)
    pagina = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Banco bande LTE</title>
<link rel="stylesheet" href="{s}/css/style.css"><link rel="stylesheet" href="{s}/css/popSettings.css">
<link rel="stylesheet" href="{s}/css/window.css">
<style>body{{background:#fff;margin:0}} .full .configContent{{height:auto;overflow:visible}}
.full .networkContent,.full .popupContainer{{height:auto}}</style>
<script src="{s}/js/jquery-1.10.2.min.js"></script><script src="{s}/js/doT.js"></script>
<script src="{s}/js/api/internetApi.js"></script>
<script>{MOCK}</script>
<script src="{rel(js)}"></script>
</head><body>
<div class="popupContainer"><div class="networkMenu"></div>
<div class="networkContent rightContent"><div class="contentArea">
{tab}
</div></div></div>
<script>
if (full) {{ document.body.className = "full"; }}
internet_cnmode_get_template();
if (/applica/.test(location.search)) {{
	setTimeout(function () {{ $("#cst_lteBand input.cstLb").prop("checked", false);
		$("#cst_lteBand input.cstLb[value=3], #cst_lteBand input.cstLb[value=20]").prop("checked", true).trigger("change");
		$("#cst_lteBand .cstLbApplica").trigger("click"); }}, 100);
}}
</script>
</body></html>
"""
    with open(os.path.join(out_dir, "harness.html"), "w", encoding="utf-8") as f:
        f.write(pagina)


if __name__ == "__main__":
    main()
