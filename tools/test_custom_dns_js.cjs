// Test di js/custom_dns.js (riquadro "DNS personalizzati" del popup Internet) senza browser: validazione degli
// indirizzi (stessa regola di ip4_ok in custom.cgi), riconoscimento dei servizi noti, testi di stato ed errori,
// aggancio a lan_info.
// Uso: node tools/test_custom_dns_js.cjs [percorso di custom_dns.js]
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = process.argv[2] ||
	`${__dirname}/../analysis/device-pull-0111/modified/webpages/js/custom_dns.js`;

// jQuery minimo: registra i gestori delegati; il selettore del riquadro non trova nulla (nessuna lettura)
const gestori = [];
const vuoto = { length: 0, find: () => vuoto, first: () => vuoto, text: () => vuoto, prop: () => vuoto, val: () => "", add: () => vuoto };
function $(sel) {
	if (sel === ctx.document) return { on: (ev, s) => gestori.push(`${ev} ${s}`) };
	return vuoto;
}
$.trim = (s) => String(s).trim();
let disegniStock = 0;
const ctx = { document: {}, $: $, alert: () => {}, confirm: () => true };
ctx.window = ctx;
ctx.lan_info = function () { disegniStock++; return "stock"; };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path, "utf8") + "\nthis.customDns = customDns;", ctx);
const d = ctx.customDns;

let ok = 0, ko = 0;
function verifica(nome, ottenuto, atteso) {
	if (ottenuto === atteso) { ok++; console.log(`OK   ${nome}`); }
	else { ko++; console.log(`FAIL ${nome}: atteso ${JSON.stringify(atteso)}, ottenuto ${JSON.stringify(ottenuto)}`); }
}

const LAN = "192.168.0.1";
for (const s of ["1.1.1.1", "9.9.9.9", "149.112.112.112", "94.140.14.14", "192.168.0.53", "10.0.0.1", "223.255.255.254"]) {
	verifica(`ip4Ok accetta ${s}`, d.ip4Ok(s, LAN), true);
}
for (const s of ["", "1.1.1", "1.1.1.1.1", "01.1.1.1", "1.1.1.01", "256.1.1.1", "1.1.1.256", "0.1.1.1", "127.0.0.1",
	"224.0.0.1", "255.255.255.255", "192.168.0.1", "1.1.1.1 ", " 1.1.1.1", "1.1.1.1;", "a.b.c.d", "::1", "1..1.1"]) {
	verifica(`ip4Ok rifiuta ${JSON.stringify(s)}`, d.ip4Ok(s, LAN), false);
}

verifica("presetDi Cloudflare", d.presetDi("1.1.1.1", "1.0.0.1"), "cloudflare");
verifica("presetDi Quad9", d.presetDi("9.9.9.9", "149.112.112.112"), "quad9");
verifica("presetDi AdGuard", d.presetDi("94.140.14.14", "94.140.15.15"), "adguard");
verifica("presetDi ordine invertito = personalizzati", d.presetDi("1.0.0.1", "1.1.1.1"), "custom");
verifica("presetDi un solo server = personalizzati", d.presetDi("8.8.8.8", ""), "custom");

verifica("stato: personalizzati noti", d.testoStato({ dnsmasq: 1, mode: "custom", dns1: "1.1.1.1", dns2: "1.0.0.1", rete: [] }),
	"Cloudflare: 1.1.1.1, 1.0.0.1");
verifica("stato: personalizzati, un server", d.testoStato({ dnsmasq: 1, mode: "custom", dns1: "192.168.0.53", dns2: "", rete: ["10.1.1.1"] }),
	"Personalizzati: 192.168.0.53");
verifica("stato: automatici dalla rete", d.testoStato({ dnsmasq: 1, mode: "auto", dns1: "", dns2: "", rete: ["10.1.1.1", "10.1.1.2"] }),
	"Automatici, ricevuti dalla rete: 10.1.1.1, 10.1.1.2");
verifica("stato: automatici senza rete", d.testoStato({ dnsmasq: 1, mode: "auto", dns1: "", dns2: "", rete: [] }),
	"Automatici: nessun DNS ricevuto, il router non è connesso a internet.");
verifica("stato: dnsmasq spento", d.testoStato({ dnsmasq: 0, mode: "auto", rete: [] }).indexOf("non è attivo") > 0, true);

verifica("errore: automatici", d.errore("auto", "", "", LAN), "");
verifica("errore: due server validi", d.errore("custom", "1.1.1.1", "9.9.9.9", LAN), "");
verifica("errore: secondo vuoto", d.errore("custom", "1.1.1.1", "", LAN), "");
verifica("errore: primo vuoto", d.errore("custom", "", "1.1.1.1", LAN).indexOf("Server DNS 1") === 0, true);
verifica("errore: secondo non valido", d.errore("custom", "1.1.1.1", "1.1.1", LAN).indexOf("Server DNS 2") === 0, true);
verifica("errore: router come DNS", d.errore("custom", LAN, "", LAN).indexOf("Server DNS 1") === 0, true);
verifica("errore: server uguali", d.errore("custom", "1.1.1.1", "1.1.1.1", LAN).indexOf("uguali") > 0, true);

verifica("gestori delegati registrati", gestori.join("|"),
	"change #cst_dns .cstDnsScelta|click #cst_dns .cstDnsApplica|keydown #cst_dns input[type=text]");
verifica("lan_info sostituita", ctx.lan_info !== undefined && ctx.lan_info.toString().indexOf("disegnaStock") > 0, true);
verifica("lan_info chiama il disegno stock", ctx.lan_info(), "stock");
verifica("disegno stock eseguito una volta", disegniStock, 1);

console.log(`\nesito: ${ok} OK, ${ko} FAIL`);
process.exit(ko ? 1 : 0);
