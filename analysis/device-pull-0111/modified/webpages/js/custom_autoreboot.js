/*
 * Tab "Riavvio programmato" del popup Amministrazione (systemManagementPopup.html, div tf1_autoReboot).
 * Legge e salva la configurazione con /cgi-bin/custom.cgi?api=autoreboot, protetto da autenticazione HTTP
 * Basic con le credenziali della web UI: la prima volta il browser le chiede. Ogni POST porta il token
 * anti-CSRF ricevuto con la lettura; custom.cgi risponde con un redirect 303 al JSON aggiornato.
 */
var CUSTOM_AR_URL = "/cgi-bin/custom.cgi";
var custom_autoRebootCsrf = "";

function custom_autoRebootPad(n) {
	return (n < 10 ? "0" : "") + n;
}

function custom_autoRebootOnload() {
	var i, h = "", m = "";

	showTabs();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	for (i = 0; i < 24; i++) {
		h += '<option value="' + custom_autoRebootPad(i) + '">' + custom_autoRebootPad(i) + '</option>';
	}
	for (i = 0; i < 60; i++) {
		m += '<option value="' + custom_autoRebootPad(i) + '">' + custom_autoRebootPad(i) + '</option>';
	}
	$("#tf1_arHour").html(h);
	$("#tf1_arMinute").html(m);
	custom_autoRebootCsrf = "";

	$.ajax({
		url: CUSTOM_AR_URL + "?api=autoreboot",
		type: "GET",
		dataType: "json",
		cache: false
	}).done(function (r) {
		custom_autoRebootShow(r);
	}).fail(function (jqXHR) {
		$("#tf1_arNow").text("non disponibile");
		custom_autoRebootError(jqXHR);
	});
}

function custom_autoRebootShow(r) {
	var t = r.time.split(":"), giorni = "," + r.days + ",", testo;

	custom_autoRebootCsrf = r.csrf;
	$("#tf1_arEnable").val(String(r.enable));
	$("#tf1_arHour").val(t[0]);
	$("#tf1_arMinute").val(t[1]);
	$("#ajax-content input.arDay").each(function () {
		this.checked = giorni.indexOf("," + this.value + ",") >= 0;
	});
	testo = r.now;
	if (r.utc_offset != "") {
		testo += " (UTC" + r.utc_offset.substr(0, 3) + ":" + r.utc_offset.substr(3, 2) + ")";
	}
	if (r.clock_ok != 1) {
		testo += " - orologio non impostato";
	}
	$("#tf1_arNow").text(testo);
}

function custom_autoRebootError(jqXHR) {
	if (jqXHR.status == 401) {
		alert("Per il riavvio programmato servono utente e password della web UI: inseriscili quando il browser li chiede, oppure apri /cgi-bin/custom.cgi, poi riapri la tab.");
	} else if (jqXHR.status == 429) {
		alert("Troppi tentativi di accesso errati: riprova tra 10 minuti.");
	} else if (jqXHR.status == 403) {
		alert("Richiesta rifiutata: riapri la tab e riprova.");
	} else {
		alert("Impossibile leggere o salvare il riavvio programmato: riprova.");
	}
}

function custom_autoRebootApply() {
	var giorni = [], en = $("#tf1_arEnable").val(), ora;

	$("#ajax-content input.arDay:checked").each(function () {
		giorni.push(this.value);
	});
	if (en == "1" && giorni.length == 0) {
		alert("Seleziona almeno un giorno.");
		return false;
	}
	if (custom_autoRebootCsrf == "") {
		alert("Impostazioni non ancora lette dal router: riapri la tab e riprova.");
		return false;
	}
	ora = $("#tf1_arHour").val() + ":" + $("#tf1_arMinute").val();

	$.ajax({
		url: CUSTOM_AR_URL,
		type: "POST",
		dataType: "json",
		data: {
			csrf: custom_autoRebootCsrf,
			action: "autoreboot",
			enable: en,
			hour: $("#tf1_arHour").val(),
			minute: $("#tf1_arMinute").val(),
			days: giorni.join(",")
		}
	}).done(function (r) {
		if (r.m == "ar_ok") {
			HideDialog('tf1_dialog', 'tf1_overlay');
			if (en == "1") {
				alert("Riavvio programmato attivato alle " + ora + " (ora del router).");
			} else {
				alert("Riavvio programmato disattivato.");
			}
		} else if (r.m == "err_days") {
			alert("Giorni non validi: nessuna modifica.");
		} else {
			alert("Valore non valido: nessuna modifica.");
		}
	}).fail(custom_autoRebootError);
	return false;
}
