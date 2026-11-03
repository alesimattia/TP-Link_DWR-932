/*
 * Riquadro "Bande LTE e carrier aggregation" nella tab Modalità di connessione del popup Internet
 * (internetPopup.html, template cnmodeinfoTemplate, div #cst_lteBand). Si aggancia a internet_cnmode_get_template
 * di internetApi.js: dopo il disegno stock della tab legge le bande con /cgi-bin/custom.cgi?api=lteband e applica
 * la scelta con POST action=lteband, che custom.cgi traduce in AT+BMBANDPREF. L'impostazione resta salvata nel
 * modem anche dopo il riavvio. Stessa autenticazione Basic della pagina avanzata: la prima volta il browser chiede
 * utente e password della web UI. Ogni POST porta il token anti-CSRF ricevuto con la lettura.
 * La carrier aggregation non ha un interruttore: la attiva la rete quando combina due bande abilitate nel modem;
 * qui si mostra solo se le bande scelte la rendono possibile.
 */
var customLteBand = (function () {
	var URL = "/cgi-bin/custom.cgi";
	// Frequenza delle bande LTE (le altre si mostrano solo con il numero)
	var FREQ = { 1: "2100 MHz", 3: "1800 MHz", 7: "2600 MHz", 8: "900 MHz", 20: "800 MHz", 28: "700 MHz", 32: "1500 MHz",
		38: "2600 MHz TDD", 40: "2300 MHz TDD", 41: "2500 MHz TDD" };
	var csrf = "", attive = [], lette = false;

	function num(a, b) { return a - b; }
	function ordinate(l) { return l.slice().sort(num); }
	function stesse(a, b) { return ordinate(a).join(",") === ordinate(b).join(","); }
	function elenco(l) {
		return l.length ? ordinate(l).map(function (b) { return "B" + b; }).join(", ") : "nessuna";
	}
	function nome(b) { return "B" + b + (FREQ[b] ? " · " + FREQ[b] : ""); }

	// Testo della riga "Carrier aggregation" per le bande selezionate
	function testoCa(sel) {
		if (sel.length >= 2) {
			return "Possibile tra le bande abilitate: la attiva la rete quando ne combina due.";
		}
		if (sel.length == 1) {
			return "Non possibile tra bande diverse: con una sola banda abilitata il modem non può aggregarne un'altra.";
		}
		return "Seleziona almeno una banda.";
	}
	// Testo della riga di stato: bande abilitate nel modem e scelta non ancora applicata
	function testoStato(att, cap, sel) {
		var t;
		if (!att.length) {
			return "non disponibile";
		}
		t = stesse(att, cap) ? "Tutte le bande supportate" : "Bloccate su " + elenco(att);
		if (sel && !stesse(sel, att)) {
			t += " (modifica non applicata)";
		}
		return t;
	}

	function box() { return $("#tf1_tmpl_cnmode_info").find("#cst_lteBand").first(); }
	function scelte() {
		var s = [];
		box().find("input.cstLb:checked").each(function () { s.push(parseInt(this.value, 10)); });
		return s;
	}
	function supportate() {
		var s = [];
		box().find("input.cstLb").each(function () { s.push(parseInt(this.value, 10)); });
		return s;
	}
	function aggiorna() {
		var sel = scelte();
		box().find(".cstLbCa").text(testoCa(sel));
		box().find(".cstLbStato").text(testoStato(attive, supportate(), sel));
	}
	function pulsanti(attivi) { box().find(".cstLbTutte, .cstLbApplica").prop("disabled", !attivi); }

	function mostra(r) {
		var p = box().find(".cstLbScelta").empty();
		csrf = r.csrf || "";
		if (!r.ok || !r.cap || !r.cap.length) {
			lette = false;
			attive = [];
			box().find(".cstLbStato").text("Il modem non risponde: riapri la tab tra qualche secondo.");
			box().find(".cstLbCa").text("");
			pulsanti(false);
			return;
		}
		attive = r.lte.map(function (b) { return parseInt(b, 10); });
		ordinate(r.cap).forEach(function (v) {
			var b = parseInt(v, 10);
			var c = $('<input type="checkbox" class="cstLb">').val(String(b)).prop("checked", attive.indexOf(b) >= 0);
			p.append($('<span style="white-space:nowrap;display:inline-block;width:150px"></span>').append(c, document.createTextNode(" " + nome(b))));
		});
		lette = true;
		pulsanti(true);
		aggiorna();
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
		return "Impossibile leggere o impostare le bande: riprova.";
	}

	function leggi() {
		lette = false;
		csrf = "";
		box().find(".cstLbStato").text("lettura dal modem...");
		pulsanti(false);
		$.ajax({ url: URL + "?api=lteband", type: "GET", dataType: "json", cache: false })
			.done(mostra)
			.fail(function (jqXHR) {
				box().find(".cstLbStato").text(messaggioErrore(jqXHR));
			});
	}

	function applica() {
		var sel = scelte();
		if (!lette || csrf == "") {
			alert("Bande non ancora lette dal modem: riapri la tab e riprova.");
			return false;
		}
		if (!sel.length) {
			alert("Seleziona almeno una banda LTE.");
			return false;
		}
		if (stesse(sel, attive)) {
			alert("Le bande selezionate sono già quelle abilitate: nessuna modifica.");
			return false;
		}
		if (!confirm("Abilitare solo " + elenco(sel) + "? Il modem cerca di nuovo la rete e la connessione mobile può interrompersi per qualche secondo. Se nessuna di queste bande è coperta, il router resta senza 4G.")) {
			return false;
		}
		pulsanti(false);
		$.ajax({
			url: URL,
			type: "POST",
			dataType: "json",
			data: { csrf: csrf, action: "lteband", bands: ordinate(sel).join(",") }
		}).done(function (r) {
			mostra(r);
			if (r.m == "lte_ok") {
				alert("Bande LTE abilitate: " + elenco(attive) + ".");
			} else if (r.m == "lte_same") {
				alert("Le bande selezionate erano già abilitate: nessuna modifica.");
			} else if (r.m == "err_at") {
				alert("Il modem non ha accettato il comando: nessuna modifica.");
			} else {
				alert("Selezione non valida: nessuna modifica.");
			}
		}).fail(function (jqXHR) {
			pulsanti(true);
			alert(messaggioErrore(jqXHR));
		});
		return false;
	}

	function tutte() {
		box().find("input.cstLb").prop("checked", true);
		aggiorna();
		return false;
	}

	$(document).on("change", "#cst_lteBand input.cstLb", aggiorna);
	$(document).on("click", "#cst_lteBand .cstLbTutte", tutte);
	$(document).on("click", "#cst_lteBand .cstLbApplica", applica);

	// Dopo il disegno stock della tab (internet_onloadConnmodeConfig) si leggono le bande dal modem
	if (typeof window.internet_cnmode_get_template === "function") {
		var disegnaStock = window.internet_cnmode_get_template;
		window.internet_cnmode_get_template = function () {
			var v = disegnaStock.apply(this, arguments);
			if (box().length) {
				leggi();
			}
			return v;
		};
	}

	return { leggi: leggi, applica: applica, tutte: tutte, testoCa: testoCa, testoStato: testoStato, elenco: elenco, nome: nome };
})();
