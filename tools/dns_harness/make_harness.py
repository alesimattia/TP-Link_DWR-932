#!/usr/bin/env python3
"""Banco di prova locale del riquadro "DNS personalizzati" (tab Impostazioni LAN del router, popup Internet).

Estrae il div tf1_routerLANSetting dall'internetPopup.html generato da tools/build_internetpopup.py e lo mette nella
cornice del popup (stesse classi e CSS della web UI stock), con jQuery, doT, js/internet.js stock e js/custom_dns.js.
Simula le risposte di custom.cgi?api=dns e della POST action=dns.
Scenari (hash dell'URL): #auto = DNS ricevuti dalla rete, #nessuno = automatici senza connessione, #cloudflare =
personalizzati Cloudflare, #pers = un server della LAN, #spento = dnsmasq non attivo, #negato = 401.
Con "-full" il contenuto della tab non scorre e mostra tutto. Con ?applica sceglie Quad9 e applica.

Uso: python3 -I tools/dns_harness/make_harness.py <internetPopup.html generato> <custom_dns.js> <webpages stock>
Scrive tools/dns_harness/harness.html (i percorsi verso i file della web UI sono relativi).
"""
import os
import re
import sys

MOCK = r"""
var scenario = (location.hash || "#auto").slice(1);
var full = /-full$/.test(scenario);
scenario = scenario.replace(/-full$/, "");
var stato = { mode: "auto", dns1: "", dns2: "", rete: ["10.4.4.4", "10.5.5.5"], dnsmasq: 1, lan: "192.168.0.1" };
if (scenario === "nessuno") { stato.rete = []; }
if (scenario === "cloudflare") { stato.mode = "custom"; stato.dns1 = "1.1.1.1"; stato.dns2 = "1.0.0.1"; }
if (scenario === "pers") { stato.mode = "custom"; stato.dns1 = "192.168.0.53"; }
if (scenario === "spento") { stato.dnsmasq = 0; }
var global_lang = { internet_popup: {}, common: {} };
var global_cploaded = true;
var ui_config = { lan: { DHCP4S: { enable: 1, start_ip: "192.168.0.20", num: "41" }, LAN: { ip4_addr: "192.168.0.1", ip4_subnet_mask: 24 } } };
window.alert = function (m) { console.log("ALERT " + m); document.title = "ALERT " + m; };
window.confirm = function (m) { console.log("CONFIRM " + m); return true; };
$.ajax = function (o) {
	var d = $.Deferred();
	setTimeout(function () {
		if (scenario === "negato") { d.reject({ status: 401 }); return; }
		var m = "";
		if (o.type === "POST") {
			stato.mode = o.data.mode; stato.dns1 = o.data.dns1; stato.dns2 = o.data.dns2; m = "dns_ok";
		}
		d.resolve($.extend({}, stato, { csrf: "0123456789abcdef", m: m }));
	}, 10);
	return d.promise();
};
"""


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    popup, js, stock = sys.argv[1:]
    testo = open(popup, "rb").read().decode("utf-8")
    m = re.search(r'<div id="tf1_routerLANSetting">.*?(?=\s*<!-- Router Local IP Settings Ends here -->)', testo, re.S)
    if not m:
        sys.exit("tf1_routerLANSetting non trovato")
    tab = m.group(0)
    out_dir = os.path.dirname(os.path.abspath(__file__))
    rel = lambda p: os.path.relpath(os.path.abspath(p), out_dir)
    s = rel(stock)
    pagina = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>Banco DNS</title>
<link rel="stylesheet" href="{s}/css/style.css"><link rel="stylesheet" href="{s}/css/popSettings.css">
<link rel="stylesheet" href="{s}/css/window.css">
<style>body{{background:#fff;margin:0}} .full .configStatusContent{{height:auto;overflow:visible}}
.full .networkContent,.full .popupContainer,.full .contentArea{{height:auto}}</style>
<script src="{s}/js/jquery-1.10.2.min.js"></script><script src="{s}/js/doT.js"></script>
<script>{MOCK}</script>
<script src="{s}/js/internet.js"></script>
<script src="{rel(js)}"></script>
</head><body>
<div class="popupContainer"><div class="networkMenu"></div>
<div class="networkContent rightContent"><div class="contentArea">
{tab}
</div></div></div>
<script>
if (full) {{ document.body.className = "full"; }}
lan_info();
if (/applica/.test(location.search)) {{
	setTimeout(function () {{ $("#cst_dns .cstDnsScelta").val("quad9").trigger("change");
		$("#cst_dns .cstDnsApplica").trigger("click"); }}, 100);
}}
</script>
</body></html>
"""
    with open(os.path.join(out_dir, "harness.html"), "w", encoding="utf-8") as f:
        f.write(pagina)


if __name__ == "__main__":
    main()
