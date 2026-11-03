/*
 * Riquadro "Internet" della home (controlPanel.html, colonna sinistra): stato in tempo reale della connessione
 * mobile e del dispositivo, come lista di voci con il valore a destra.
 * - Stato connessione, operatore, segnale, dati usati: ui_config.Dyn_Status.up_5s e .nw_usage, che controlPanel.js
 *   aggiorna ogni 5 s (data.ria?DynUpdate=up_5s e nw_usage).
 * - Dati radio LTE: data.ria?DynUpdate=get_networkserviceinfo e bm_GetCellLocationInfo di qcmap_fcgi (stessa
 *   sessione D-Link), ogni 10 s e solo con la SIM presente. Unità: RSSI e RSRP in dBm, RSRQ in dB, SINR in decimi di
 *   dB, Ec/Io in mezzi dB positivi, tx_power in decimi di dBm.
 * - Dati del dispositivo: /cgi-bin/custom_status.cgi ogni 5 s (risponde solo all'IP dell'ultimo login D-Link).
 * Gli aggiornamenti si fermano mentre la scheda del browser non è visibile. Il testo dei valori viene scritto con
 * textContent (mai come HTML).
 */
var customStatus = (function () {
	var TICK_MS = 5000;
	var tick = 0;
	var lte = null, lteMask = null, cell = null, dev = null, devNegato = false;

	var BANDE = {
		"40": "GSM 450", "41": "GSM 480", "42": "GSM 750", "43": "GSM 850", "44": "GSM 900", "45": "GSM 900",
		"46": "GSM 900", "47": "GSM 1800", "48": "GSM 1900", "80": "WCDMA 2100", "81": "WCDMA 1900",
		"82": "WCDMA 1800", "83": "WCDMA 1700", "84": "WCDMA 850", "85": "WCDMA 800", "86": "WCDMA 2600",
		"87": "WCDMA 900", "88": "WCDMA 1700", "90": "WCDMA 1500", "91": "WCDMA 850",
		"120": "B1", "121": "B2", "122": "B3", "123": "B4", "124": "B5", "125": "B6", "126": "B7", "127": "B8",
		"128": "B9", "129": "B10", "130": "B11", "131": "B12", "132": "B13", "133": "B14", "134": "B17",
		"135": "B33", "136": "B34", "137": "B35", "138": "B36", "139": "B37", "140": "B38", "141": "B39",
		"142": "B40", "143": "B18", "144": "B19", "145": "B20", "146": "B21", "147": "B24", "148": "B25",
		"149": "B41", "150": "B42", "151": "B43", "152": "B23", "153": "B26", "154": "B32", "158": "B28",
		"159": "B29", "160": "B30"
	};
	/* Bande LTE FDD: frequenza DL minima (MHz), offset EARFCN DL, distanza UL - DL (MHz), nome commerciale */
	var FREQ = {
		B1: [2110, 0, -190, "2100"], B2: [1930, 600, -80, "1900"], B3: [1805, 1200, -95, "1800"],
		B4: [2110, 1950, -400, "AWS"], B5: [869, 2400, -45, "850"], B7: [2620, 2750, -120, "2600"],
		B8: [925, 3450, -45, "900"], B12: [729, 5010, -30, "700"], B13: [746, 5180, 31, "700"],
		B17: [734, 5730, -30, "700"], B20: [791, 6150, 41, "800"], B28: [758, 9210, -55, "700"]
	};
	/* Larghezza di banda LTE (enum QMI NAS: 0 = 6 RB ... 5 = 100 RB) */
	var LARGHEZZE = ["1,4 MHz", "3 MHz", "5 MHz", "10 MHz", "15 MHz", "20 MHz"];
	/* Dominio di servizio (enum QMI NAS srv_domain) */
	var DOMINI = ["nessuno", "solo voce (CS)", "solo dati (PS)", "voce e dati", "agganciato"];

	function el(id) { return document.getElementById(id); }
	function scrivi(id, testo, titolo) {
		var e = el(id);
		if (!e) return;
		if (testo === undefined || testo === null || testo === "") testo = "—";
		if (e.textContent !== testo) e.textContent = testo;
		if (titolo !== undefined && e.title !== titolo) e.title = titolo;
	}
	/* Mostra o nasconde la riga della tabella che contiene la cella id */
	function riga(id, visibile) {
		var e = el(id);
		if (e && e.parentNode) e.parentNode.style.display = visibile ? "" : "none";
	}
	function virgola(x, dec) { return x.toFixed(dec).replace(".", ","); }
	function intero(v) { var n = parseInt(v, 10); return isNaN(n) ? null : n; }
	function numero(v) { return (typeof v === "number" && isFinite(v)) ? v : null; }
	function mhz(khz) {
		if (numero(khz) === null) return null;
		var s = virgola(khz / 1000, 1);
		return s.replace(/,0$/, "") + " MHz";
	}
	function byte(b) {
		if (numero(b) === null) return null;
		if (b < 1024) return b + " B";
		if (b < 1048576) return virgola(b / 1024, 1) + " KB";
		if (b < 1073741824) return virgola(b / 1048576, 1) + " MB";
		return virgola(b / 1073741824, 2) + " GB";
	}
	function velocita(bps) {
		if (numero(bps) === null) return null;
		var bit = bps * 8;
		if (bit < 1000) return bit + " b/s";
		if (bit < 1000000) return virgola(bit / 1000, 0) + " kb/s";
		return virgola(bit / 1000000, 1) + " Mb/s";
	}
	function durata(s) {
		s = intero(s);
		if (s === null || s < 0) return null;
		var g = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
		var hm = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
		return g > 0 ? g + " g " + hm : hm + ":" + (s % 60 < 10 ? "0" : "") + s % 60;
	}
	/* Valore con giudizio: soglie in ordine decrescente per ottimo, buono, discreto */
	function giudizio(v, s) {
		if (v >= s[0]) return "ottimo";
		if (v >= s[1]) return "buono";
		if (v >= s[2]) return "discreto";
		return "scarso";
	}
	function dyn(nome) {
		try { return ui_config.Dyn_Status[nome] || null; } catch (e) { return null; }
	}

	/* Bit impostati di un intero decimale senza segno a 64 bit, dato come stringa (bit 0 = B1) */
	function bandeAbilitate(dec) {
		if (!/^[0-9]+$/.test(dec || "")) return null;
		var cifre = dec.replace(/^0+/, "").split("").map(Number), bit = 0, lista = [];
		while (cifre.length && bit < 64) {
			var resto = 0, q = [];
			for (var i = 0; i < cifre.length; i++) {
				var x = resto * 10 + cifre[i];
				q.push(Math.floor(x / 2));
				resto = x % 2;
			}
			if (resto) lista.push("B" + (bit + 1));
			while (q.length && q[0] === 0) q.shift();
			cifre = q;
			bit++;
		}
		if (!lista.length) return null;
		return lista.length > 12 ? "tutte" : lista.join(" ");
	}

	function intestazione(up, nw) {
		var ipv4 = up.ipv4 || {}, modem = (up.signal && up.signal.modem) || {};
		var collegato = ipv4.status === "Connected";
		var tipo = (typeof global_disconnect_service !== "undefined" && global_disconnect_service) || modem.service || "";
		var livello = intero(modem.level);
		var sig = (collegato ? "signal" : "signalGray") +
			(livello !== null && livello >= 0 && livello <= 4 ? livello + 1 : (collegato ? 5 : 6));
		var modo;
		if (tipo === "2G" || tipo === "G" || tipo === "E") modo = 1;
		else if (tipo === "3G") modo = 2;
		else if (tipo === "LTE" || tipo === "4G") modo = 3;
		else modo = 0;
		var classeModo = collegato ? ["", "cpInternetMode1", "cpInternetMode2", "cpInternetMode"][modo]
			: ["cpInternetModeGray4", "cpInternetModeGray1", "cpInternetModeGray2", "cpInternetModeGray3"][modo];
		if (el("cst_sig") && el("cst_sig").className !== sig) el("cst_sig").className = sig;
		if (el("cst_mode") && el("cst_mode").className !== classeModo) el("cst_mode").className = classeModo;

		var op = modem.spn || ipv4.op_name || modem.opname || "";
		var speciali = { "NO SIM": "SIM assente", "PIN LOCK": "SIM bloccata (PIN)", "PUK LOCK": "SIM bloccata (PUK)",
			"Searching": "Ricerca rete…", "No Service": "Nessun servizio", "Limit Service": "Servizio limitato" };
		var stato = speciali[ipv4.op_name] || speciali[modem.opname];
		scrivi("cst_op", stato || op);
		var forza = intero(modem.strength);
		var senzaRete = stato || tipo === "" || tipo === "none";
		scrivi("cst_dbm", !senzaRete && forza !== null && forza !== 0 ? forza + " dBm" : "\u00a0");

		var usati = 0;
		if (nw && modem.service !== "none") usati = (Number(nw.tx) || 0) + (Number(nw.rx) || 0);
		scrivi("cst_used", byte(usati));
		var limite = "";
		try {
			var q = ui_config.net_stat.NWSTAT.quota_limit;
			if (q && q !== "0") limite = "avviso a " + virgola(q * 0.8, 0) + " MB";
		} catch (e) { }
		scrivi("cst_limit", limite || "\u00a0");
		return { stato: stato, collegato: collegato, tipo: tipo };
	}

	function reteMobile(up, nw, h) {
		var ipv4 = up.ipv4 || {}, ipv6 = up.ipv6 || {}, modem = (up.signal && up.signal.modem) || {};
		var stati = { Connected: "connesso", Disconnected: "disconnesso", Connecting: "connessione…",
			Disconnecting: "disconnessione…" };
		scrivi("cst_stato", h.stato || stati[ipv4.status] || ipv4.status);
		scrivi("cst_tipo", (lte && lte.service_type && lte.service_type !== "none") ? lte.service_type :
			(h.tipo && h.tipo !== "none" ? h.tipo : null));
		var plmn = lte && intero(lte.mcc) ? lte.mcc + " " + lte.mnc : null;
		scrivi("cst_plmn", plmn);
		var roaming = intero(modem.roaming);
		scrivi("cst_roaming", roaming === null ? null : (roaming ? "sì" : "no"));
		scrivi("cst_ip", h.collegato && ipv4.ip && ipv4.ip !== "0.0.0.0" ? ipv4.ip : null);
		var ip6 = h.collegato && ipv6.ip && ipv6.ip !== "::" ? ipv6.ip : null;
		scrivi("cst_ip6", ip6, ip6 || "");
		riga("cst_ip6", ip6);
		var dns = [ipv4.dns1, ipv4.dns2].filter(function (d) { return d && d !== "0.0.0.0"; });
		scrivi("cst_dns", h.collegato && dns.length ? dns.join(" ") : null);
		scrivi("cst_durata", h.collegato && nw ? durata(nw.period) : null);
		scrivi("cst_rx", nw ? byte(Number(nw.rx)) : null);
		scrivi("cst_tx", nw ? byte(Number(nw.tx)) : null);
		var w = dev && dev.wan;
		scrivi("cst_vel", w && w.rx !== null ? velocita(w.rx) + " / " + velocita(w.tx) : null);
	}

	function radio() {
		var l = lte || {};
		var lteAttiva = l.service_type === "LTE";
		var rssi = intero(l.rssi), rsrp = intero(l.rsrp), rsrq = intero(l.rsrq), sinr = intero(l.sinr);
		var ecio = intero(l.ecio), txp = intero(l.tx_power);
		scrivi("cst_rssi", rssi ? rssi + " dBm" : null);
		scrivi("cst_rsrp", lteAttiva && rsrp ? rsrp + " dBm · " + giudizio(rsrp, [-80, -90, -100]) : null);
		scrivi("cst_rsrq", lteAttiva && rsrq ? rsrq + " dB · " + giudizio(rsrq, [-10, -15, -20]) : null);
		scrivi("cst_sinr", lteAttiva && sinr !== null && (sinr || rsrp) ?
			virgola(sinr / 10, 1) + " dB · " + giudizio(sinr / 10, [20, 13, 0]) : null);
		scrivi("cst_ecio", !lteAttiva && ecio ? virgola(-ecio / 2, 1) + " dB" : null);
		riga("cst_ecio", !lteAttiva && ecio);
		scrivi("cst_txp", txp ? virgola(txp / 10, 1) + " dBm" : null,
			"Potenza di trasmissione del modem, disponibile solo durante il traffico dati");
		var livello = null;
		try { livello = intero(ui_config.Dyn_Status.up_5s.signal.modem.level); } catch (e) { }
		scrivi("cst_livello", livello !== null && rssi ? (livello + 1) + " / 5" : null);

		var banda = l.bm_currentBand !== undefined ? BANDE[String(l.bm_currentBand)] : null;
		var f = banda ? FREQ[banda] : null;
		scrivi("cst_banda", banda ? banda + (f ? " (" + f[3] + " MHz)" : "") : null);
		var earfcn = intero(l.earfcn);
		scrivi("cst_earfcn", earfcn ? String(earfcn) : null);
		if (f && earfcn) {
			var dl = f[0] + (earfcn - f[1]) / 10;
			scrivi("cst_freq", virgola(dl, 1) + " / " + virgola(dl + f[2], 1) + " MHz");
		} else {
			scrivi("cst_freq", null);
		}
		var bw = cell && cell.cmd_status === "Done" ? intero(cell.bm_BandWidth) : null;
		scrivi("cst_bw", lteAttiva && bw !== null && LARGHEZZE[bw] ? LARGHEZZE[bw] : null);

		var cid = intero(l.cell_id);
		scrivi("cst_cid", cid ? String(cid) : null);
		scrivi("cst_enb", lteAttiva && cid ? (cid >> 8) + " · cella " + (cid & 255) : null);
		var pci = intero(l.pci);
		scrivi("cst_pci", lteAttiva && cid ? String(pci) : null);
		var tac = intero(l.tac), lac = intero(l.lac);
		scrivi("cst_tac", tac ? "TAC " + tac : (lac ? "LAC " + lac : null));
		var dom = intero(l.ps_cs_info);
		scrivi("cst_dominio", lte && dom !== null && DOMINI[dom] ? DOMINI[dom] : null);
		var ims = intero(l.lte_ims_voice_avail);
		scrivi("cst_volte", lte && lteAttiva ? (ims ? "disponibile" : "non disponibile") : null);
		scrivi("cst_bande", bandeAbilitate(lteMask));
	}

	function dispositivo() {
		var d = dev || {}, t = d.temp || {}, c = d.cpu || {}, m = d.mem || {}, b = d.batt || {}, w = d.wifi || {};
		var gradi = function (v, dec) { return numero(v) === null ? null : virgola(v, dec) + " °C"; };
		scrivi("cst_tsoc", gradi(t.soc, 0), t.soc_all ? "Sensori tsens: " + t.soc_all + " °C" : "");
		scrivi("cst_tpmic", gradi(t.pmic, 1));
		scrivi("cst_txo", gradi(t.xo, 0));
		scrivi("cst_tbatt", numero(t.batt) === null ? null : "≈ " + virgola(t.batt, 0) + " °C",
			"Stima dal termistore della batteria (NTC 10 kΩ e pull-up 27 kΩ ipotizzati): errore possibile di qualche grado");

		scrivi("cst_freq_cpu", mhz(c.cur));
		scrivi("cst_gov", c.gov);
		scrivi("cst_limiti", numero(c.min) !== null && numero(c.max) !== null ?
			mhz(c.min).replace(" MHz", "") + " – " + mhz(c.max) : null);
		scrivi("cst_uso", numero(c.usage) === null ? null : Math.max(0, Math.min(100, c.usage)) + " %");
		scrivi("cst_carico", c.load ? c.load.split(" ").join(" · ").replace(/\./g, ",") : null);
		scrivi("cst_ram", numero(m.free) !== null && numero(m.total) ?
			Math.round(m.free / 1024) + " / " + Math.round(m.total / 1024) + " MB" : null);
		scrivi("cst_uptime", durata(d.uptime));

		scrivi("cst_bcap", numero(b.cap) === null ? null : b.cap + " %");
		scrivi("cst_bmv", numero(b.mv) === null ? null : virgola(b.mv / 1000, 2) + " V");
		var stati = { Charging: "in carica", Discharging: "in uso", Full: "carica", "Not charging": "non in carica" };
		scrivi("cst_bstato", stati[b.status] || (b.status && b.status !== "Unknown" ? b.status : null));
		var salute = { Good: "buona", Overheat: "surriscaldata", Dead: "esaurita", "Over voltage": "sovratensione",
			Cold: "fredda" };
		scrivi("cst_bsalute", salute[b.health] || b.health);
		scrivi("cst_bext", dev ? (b.ac || b.usb ? "collegata" : "assente") : null);

		scrivi("cst_wcli", numero(w.clients) === null ? null : String(w.clients));
		var bw = /^([0-9]+)M$/.exec(w.bw || "");
		scrivi("cst_wch", numero(w.chan) ? w.chan + (bw ? " · " + bw[1] + " MHz" : "") : null);
		var r = /^(?:(MCS[0-9]+) )?([0-9.]+)$/.exec(w.rate || "");
		scrivi("cst_wrate", r ? (r[1] ? r[1] + " · " : "") + r[2].replace(".", ",") + " Mb/s" : null);
		scrivi("cst_nat", numero(d.nat) === null ? null : String(d.nat));
		var nota = el("cst_nota");
		if (nota) nota.style.display = devNegato ? "" : "none";
	}

	function aggiorna() {
		var up = dyn("up_5s") || {}, nw = dyn("nw_usage");
		var parti = [function () { reteMobile(up, nw, intestazione(up, nw)); }, radio, dispositivo];
		for (var i = 0; i < parti.length; i++) {
			try { parti[i](); } catch (e) { }
		}
	}

	function simPresente() {
		var up = dyn("up_5s");
		if (!up || !up.ipv4) return false;
		var op = up.ipv4.op_name;
		return op !== "NO SIM" && op !== "PIN LOCK" && op !== "PUK LOCK";
	}

	function leggiLte() {
		if (!simPresente()) { lte = null; lteMask = null; cell = null; return; }
		$.ajax({ url: "data.ria?DynUpdate=get_networkserviceinfo", dataType: "text", timeout: 8000 })
			.done(function (t) {
				try {
					lte = JSON.parse(t);
					var m = /"netbandlte_value":([0-9]+)/.exec(t);
					lteMask = m ? m[1] : null;
				} catch (e) { lte = null; lteMask = null; }
				aggiorna();
			})
			.fail(function () { lte = null; aggiorna(); });
		$.ajax({ url: "data.ria?DynUpdate=bm_GetCellLocationInfo", dataType: "json", timeout: 8000 })
			.done(function (d) { cell = d; aggiorna(); })
			.fail(function () { cell = null; });
	}

	function leggiDispositivo() {
		$.ajax({ url: "/cgi-bin/custom_status.cgi", dataType: "json", timeout: 8000 })
			.done(function (d) { dev = d && d.ok ? d : null; devNegato = !dev; aggiorna(); })
			.fail(function (x) { dev = null; devNegato = x.status === 403; aggiorna(); });
	}

	function ciclo() {
		if (document.hidden) return;
		if (tick % 2 === 0) leggiLte();
		leggiDispositivo();
		aggiorna();
		tick++;
	}

	$(document).ready(function () {
		if (!el("cst_list")) return;
		setTimeout(ciclo, 300);
		setInterval(ciclo, TICK_MS);
	});

	return { aggiorna: aggiorna, bandeAbilitate: bandeAbilitate, durata: durata, velocita: velocita, mhz: mhz };
})();
