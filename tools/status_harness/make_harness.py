#!/usr/bin/env python3
"""Banco di prova locale del riquadro di stato della home (colonna sinistra di controlPanel.html).

Estrae il blocco <style> e il div.cpMainLeft dal controlPanel.html generato da tools/build_controlpanel.py, li mette
in una pagina con i CSS e jQuery della web UI stock e simula le risposte di qcmap_fcgi e di custom_status.cgi.
Scenari (hash dell'URL): #lte = connesso in LTE con valori tipici, #nosim = stato reale senza SIM,
#negato = custom_status.cgi risponde 403. Con "-full" la lista non scorre e mostra tutte le voci.

Uso: python3 -I tools/status_harness/make_harness.py <controlPanel.html generato> <custom_status.js> <webpages stock>
Scrive tools/status_harness/harness.html (i percorsi verso i file della web UI sono relativi).
"""
import os
import re
import sys

MOCK = r"""
var scenario = (location.hash || "#lte").slice(1);
var full = /-full$/.test(scenario);
scenario = scenario.replace(/-full$/, "");
var global_disconnect_service = null;
var conn = scenario === "lte";
var ui_config = { net_stat: { NWSTAT: { quota_limit: conn ? "10240" : "0" } }, Dyn_Status: {
	up_5s: {
		ipv4: conn ? { status: "Connected", connect_type: 0, op_name: "I TIM", ip: "10.154.23.87", gateway: "10.154.23.88",
			subnet_mask: "255.255.255.252", dns1: "10.205.41.16", dns2: "10.204.57.104" }
			: { status: "Disconnected", op_name: "NO SIM", ip: "0.0.0.0", gateway: "0.0.0.0", dns1: "", dns2: "" },
		ipv6: conn ? { ip: "2a01:4f8:c17:abcd:1234:5678:9abc:def0" } : {},
		signal: { modem: conn ? { strength: -67, level: 3, roaming: 0, service: "LTE", spn: "TIM", opname: "I TIM" }
			: { strength: 0, level: 0, roaming: 0, service: "none", spn: "", opname: "NO SIM" } },
		battery: { level: 4, charging: 0, capacity: 100 }, clientNum: { ssid1: 1 }, system_uptime: 2124 },
	nw_usage: conn ? { tx: 48234567, rx: 734567890, period: 5025 } : { tx: 0, rx: 0, period: 0 } } };
var NSI = '{"oper_name":"","service_type":"LTE","cell_broadcast":"","mcc":"222","mnc":"01","cell_id":12345678,' +
	'"pci":312,"lac":0,"tac":26013,"ecio":0,"rssi":-67,"rsrp":-96,"rsrq":-11,"sinr":124,"earfcn":6300,"ebid":48225,' +
	'"tx_power":118,"tm_mode":0,"ecgi":"22201bc614e","rrc":1,"emm":2,"bm_currentBand":145,"ps_cs_info":3,' +
	'"lte_ims_voice_avail":1,"roaming":0,"imsi":"","msisdn":"","smsc":"","PLMN":"22201","mimo":"1T2R",' +
	'"netband2G3G_value":0,"netbandlte_value":524485,"netbandtdscdma_value":0}';
var CELL = { cmd_status: "Done", bm_BandWidth: 3, bm_Bandearfcn: 6300, bm_Bandarfcn: 0 };
var DEV = {"ok":1,"uptime":2124,"temp":{"soc":40,"soc_all":"39 40 38 40 40","pmic":34.2,"xo":32,"batt":33.0,"batt_uv":386989},
	"cpu":{"cur":998400,"gov":"performance","min":300000,"max":998400,"hwmin":300000,"hwmax":998400,"usage":100,
	"load":"5.10 5.28 4.80"},"mem":{"total":168828,"free":133244},"batt":{"cap":100,"mv":4174,"status":"Full",
	"health":"Good","present":1,"ac":1,"usb":1},"wifi":{"clients":1,"chan":8,"bw":"20M","rate":"MCS15 144.5"},
	"nat":70,"nat_max":10540,"wan":{"rx":conn ? 154321 : 0,"tx":conn ? 12345 : 0}};
/* Sostituisce $.ajax: risposte simulate per gli URL usati da custom_status.js */
$.ajax = function (o) {
	var d = $.Deferred();
	setTimeout(function () {
		if (/get_networkserviceinfo/.test(o.url)) d.resolve(NSI);
		else if (/bm_GetCellLocationInfo/.test(o.url)) d.resolve(CELL);
		else if (/custom_status\.cgi/.test(o.url)) {
			if (scenario === "negato") d.reject({ status: 403 }); else d.resolve(DEV);
		} else d.reject({ status: 404 });
	}, 10);
	return d.promise();
};
if (full) document.write('<style>.cpMainLeft, .cpMainLeft > div, .cpMainLeft > div > div.cstList { height: auto !important; }</style>');
"""


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    cp = open(sys.argv[1], "rb").read().decode("utf-8").replace("\r\n", "\n")
    stile = re.search(r"<style type=\"text/css\">.*?</style>", cp, re.S).group(0)
    colonna = re.search(r"\t*<div class=\"cpMainLeft\">.*?(?=\t*<div class=\"cpMainMid\">)", cp, re.S).group(0)
    qui = os.path.dirname(os.path.abspath(__file__))
    wp = os.path.relpath(os.path.abspath(sys.argv[3]), qui)
    js = os.path.relpath(os.path.abspath(sys.argv[2]), qui)
    pagina = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Banco di prova riquadro di stato</title>
<link rel="stylesheet" type="text/css" href="{wp}/css/style.css" />
<link rel="stylesheet" type="text/css" href="{wp}/css/controlPanel.css" />
{stile}
<style>body {{ background: #fff; padding: 6px; }}</style>
<script src="{wp}/js/jquery-1.10.2.min.js"></script>
<script>{MOCK}</script>
<script src="{js}"></script>
</head><body>
{colonna}
</body></html>
"""
    pagina = pagina.replace('href="../images', f'href="{wp}/images')
    out = os.path.join(qui, "harness.html")
    open(out, "w", encoding="utf-8").write(pagina)
    print(out)


if __name__ == "__main__":
    main()
