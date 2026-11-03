/*
 * Riquadro "DNS personalizzati" nella tab Impostazioni LAN del popup Internet (internetPopup.html, template
 * lanInfoTemplate, div #cst_dns sotto il riquadro del servizio DHCP). Si aggancia a lan_info di internet.js: dopo il
 * disegno stock della tab legge lo stato con /cgi-bin/custom.cgi?api=dns e applica la scelta con POST action=dns.
 * custom.cgi scrive i server in /etc/dnsmasq.conf e riavvia dnsmasq: i dispositivi della LAN continuano a usare il
 * router come DNS, che inoltra le richieste ai server scelti invece che a quelli ricevuti dalla rete.
 * Stessa autenticazione Basic della pagina avanzata: la prima volta il browser chiede utente e password della web UI.
 * Ogni POST porta il token anti-CSRF ricevuto con la lettura.
 */
var customDns = (function () {
	var URL = "/cgi-bin/custom.cgi";
	// Server noti: si scelgono dal menu, che compila i due campi
	var PRESET = {
		cloudflare: { nome: "Cloudflare", dns: ["1.1.1.1", "1.0.0.1"] },
		quad9: { nome: "Quad9", dns: ["9.9.9.9", "149.112.112.112"] },
		google: { nome: "Google", dns: ["8.8.8.8", "8.8.4.4"] },
		adguard: { nome: "AdGuard", dns: ["94.140.14.14", "94.140.15.15"] }
	};
	var csrf = "", lan = "", stato = null;

	// Stessa regola di ip4_ok in custom.cgi: IPv4 senza zeri iniziali, unicast, fuori da 0/8 e 127/8, diverso dal router
	function ip4Ok(s, ipLan) {
		var o = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/.test(s);
		var p = parseInt(String(s).split(".")[0], 10);
		return o && p != 0 && p != 127 && p < 224 && s !== ipLan;
	}
	// Chiave del menu che corrisponde ai server indicati ("custom" se non sono quelli di un servizio noto)
	function presetDi(d1, d2) {
		for (var k in PRESET) {
			if (PRESET.hasOwnProperty(k) && PRESET[k].dns[0] === d1 && PRESET[k].dns[1] === d2) {
				return k;
			}
		}
		return "custom";
	}
	function elenco(l) { return l.filter(function (s) { return s; }).join(", "); }
	// Testo della riga "DNS in uso"
	function testoStato(r) {
		var k;
		if (!r.dnsmasq) {
			return "Il servizio DNS del router non è attivo: i dispositivi non ricevono il router come DNS.";
		}
		if (r.mode === "custom") {
			k = presetDi(r.dns1, r.dns2);
			return (k === "custom" ? "Personalizzati" : PRESET[k].nome) + ": " + elenco([r.dns1, r.dns2]);
		}
		if (r.rete && r.rete.length) {
			return "Automatici, ricevuti dalla rete: " + elenco(r.rete);
		}
		return "Automatici: nessun DNS ricevuto, il router non è connesso a internet.";
	}
	// Controllo della scelta prima dell'invio: testo dell'errore oppure "" se va bene
	function errore(modo, d1, d2, ipLan) {
		if (modo === "auto") {
			return "";
		}
		if (!ip4Ok(d1, ipLan)) {
			return "Server DNS 1 non valido: serve un indirizzo IPv4 pubblico o della LAN (per esempio 1.1.1.1), diverso dal router.";
		}
		if (d2 !== "" && !ip4Ok(d2, ipLan)) {
			return "Server DNS 2 non valido: lascialo vuoto oppure scrivi un indirizzo IPv4 diverso dal router.";
		}
		if (d2 === d1) {
			return "I due server DNS sono uguali: lascia vuoto il secondo.";
		}
		return "";
	}

	function box() { return $("#tf1_tmpl_lan_information").find("#cst_dns").first(); }
	function campi(abilita) { box().find(".cstDnsScelta, .cstDnsApplica").prop("disabled", !abilita); }
	// Allinea i campi alla voce del menu: i servizi noti compilano i campi, Personalizzati li rende modificabili
	function scelta() {
		var k = box().find(".cstDnsScelta").val();
		var c1 = box().find(".cstDns1"), c2 = box().find(".cstDns2");
		if (PRESET[k]) {
			c1.val(PRESET[k].dns[0]);
			c2.val(PRESET[k].dns[1]);
		} else if (k === "auto") {
			c1.val("");
			c2.val("");
		} else if (stato && stato.mode === "custom" && c1.val() === "" && c2.val() === "") {
			c1.val(stato.dns1);
			c2.val(stato.dns2);
		}
		c1.add(c2).prop("disabled", k !== "custom");
	}

	function mostra(r) {
		csrf = r.csrf || "";
		lan = r.lan || "";
		stato = r;
		box().find(".cstDnsStato").text(testoStato(r));
		box().find(".cstDnsScelta").val(r.mode === "custom" ? presetDi(r.dns1, r.dns2) : "auto");
		box().find(".cstDns1").val(r.mode === "custom" ? r.dns1 : "");
		box().find(".cstDns2").val(r.mode === "custom" ? r.dns2 : "");
		campi(!!r.dnsmasq);
		scelta();
		if (!r.dnsmasq) {
			box().find(".cstDns1, .cstDns2").prop("disabled", true);
		}
	}

	function messaggioErrore(jqXHR) {
		if (jqXHR.status == 401) {
			return "Servono utente e password della web UI: inseriscili quando il browser li chiede (oppure apri /cgi-bin/custom.cgi), poi riapri la tab.";
		}
		if (jqXHR.status == 429) {
			return "Troppi tentativi di accesso errati: riprova tra 10 minuti.";
		}
		if (jqXHR.status == 403) {
			return "Richiesta rifiutata: riapri la tab e riprova.";
		}
		return "Impossibile leggere o impostare i DNS: riprova.";
	}

	function leggi() {
		csrf = "";
		stato = null;
		box().find(".cstDnsStato").text("lettura...");
		campi(false);
		box().find(".cstDns1, .cstDns2").prop("disabled", true);
		$.ajax({ url: URL + "?api=dns", type: "GET", dataType: "json", cache: false })
			.done(mostra)
			.fail(function (jqXHR) {
				box().find(".cstDnsStato").text(messaggioErrore(jqXHR));
			});
	}

	function applica() {
		var k = box().find(".cstDnsScelta").val();
		var modo = k === "auto" ? "auto" : "custom";
		var d1 = $.trim(box().find(".cstDns1").val() || ""), d2 = $.trim(box().find(".cstDns2").val() || "");
		var e, cosa;
		if (!stato || csrf == "") {
			alert("Stato dei DNS non ancora letto: riapri la tab e riprova.");
			return false;
		}
		if (modo === "auto") {
			d1 = "";
			d2 = "";
		}
		e = errore(modo, d1, d2, lan);
		if (e) {
			alert(e);
			return false;
		}
		if (modo === stato.mode && d1 === (stato.dns1 || "") && d2 === (stato.dns2 || "")) {
			alert("I DNS scelti sono già quelli in uso: nessuna modifica.");
			return false;
		}
		cosa = modo === "auto" ? "i DNS ricevuti dalla rete" : "i server " + elenco([d1, d2]);
		if (!confirm("Usare " + cosa + " per i dispositivi collegati al router? Il servizio DNS e DHCP del router si riavvia: per un attimo i nomi non si risolvono, gli indirizzi dei dispositivi restano gli stessi.")) {
			return false;
		}
		campi(false);
		$.ajax({
			url: URL,
			type: "POST",
			dataType: "json",
			data: { csrf: csrf, action: "dns", mode: modo, dns1: d1, dns2: d2 }
		}).done(function (r) {
			mostra(r);
			if (r.m == "dns_ok") {
				alert("DNS applicati: " + testoStato(r));
			} else if (r.m == "dns_same") {
				alert("I DNS scelti erano già in uso: nessuna modifica.");
			} else if (r.m == "err_dnsmasq") {
				alert("Il servizio DNS del router non ha accettato la modifica: nessuna modifica.");
			} else {
				alert("Indirizzi non validi: nessuna modifica.");
			}
		}).fail(function (jqXHR) {
			campi(true);
			alert(messaggioErrore(jqXHR));
		});
		return false;
	}

	$(document).on("change", "#cst_dns .cstDnsScelta", scelta);
	$(document).on("click", "#cst_dns .cstDnsApplica", applica);
	// Invio nei campi: niente invio del modulo stock della tab
	$(document).on("keydown", "#cst_dns input[type=text]", function (ev) {
		if (ev.keyCode == 13) {
			ev.preventDefault();
			return false;
		}
	});

	// Dopo il disegno stock della tab (internet_onloadInternetlanConfig) si legge lo stato dei DNS
	if (typeof window.lan_info === "function") {
		var disegnaStock = window.lan_info;
		window.lan_info = function () {
			var v = disegnaStock.apply(this, arguments);
			if (box().length) {
				leggi();
			}
			return v;
		};
	}

	return { leggi: leggi, applica: applica, ip4Ok: ip4Ok, presetDi: presetDi, testoStato: testoStato, errore: errore };
})();
