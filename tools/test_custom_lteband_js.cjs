// Test di js/custom_lteband.js (riquadro "Bande LTE" del popup Internet) senza browser: testi di stato e di
// carrier aggregation, elenco e nomi delle bande, aggancio a internet_cnmode_get_template.
// Uso: node tools/test_custom_lteband_js.cjs [percorso di custom_lteband.js]
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = process.argv[2] ||
	`${__dirname}/../analysis/device-pull-0111/modified/webpages/js/custom_lteband.js`;

// jQuery minimo: registra i gestori delegati; il selettore del riquadro non trova nulla (nessuna lettura)
const gestori = [];
const vuoto = { length: 0, find: () => vuoto, first: () => vuoto, text: () => vuoto, prop: () => vuoto, empty: () => vuoto, each: () => vuoto };
function $(sel) {
	if (sel === ctx.document) return { on: (ev, s, f) => gestori.push(`${ev} ${s}`) };
	return vuoto;
}
let disegniStock = 0;
const ctx = { document: {}, $: $, alert: () => {}, confirm: () => true };
ctx.window = ctx;
ctx.internet_cnmode_get_template = function () { disegniStock++; return "stock"; };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path, "utf8") + "\nthis.customLteBand = customLteBand;", ctx);
const lb = ctx.customLteBand;

let ok = 0, ko = 0;
function verifica(nome, ottenuto, atteso) {
	if (ottenuto === atteso) { ok++; console.log(`OK   ${nome}`); }
	else { ko++; console.log(`FAIL ${nome}: atteso ${JSON.stringify(atteso)}, ottenuto ${JSON.stringify(ottenuto)}`); }
}

const CAP = [1, 3, 7, 8, 20, 38, 40];
verifica("elenco ordinato", lb.elenco([20, 3, 7]), "B3, B7, B20");
verifica("elenco vuoto", lb.elenco([]), "nessuna");
verifica("nome con frequenza", lb.nome(3), "B3 · 1800 MHz");
verifica("nome TDD", lb.nome(40), "B40 · 2300 MHz TDD");
verifica("nome senza frequenza nota", lb.nome(66), "B66");
verifica("stato: tutte", lb.testoStato(CAP, CAP, CAP), "Tutte le bande supportate");
verifica("stato: tutte in altro ordine", lb.testoStato([40, 38, 20, 8, 7, 3, 1], CAP, CAP), "Tutte le bande supportate");
verifica("stato: bloccate", lb.testoStato([3, 7], CAP, [3, 7]), "Bloccate su B3, B7");
verifica("stato: scelta non applicata", lb.testoStato(CAP, CAP, [3]), "Tutte le bande supportate (modifica non applicata)");
verifica("stato: non letto", lb.testoStato([], CAP, []), "non disponibile");
verifica("CA con due bande", lb.testoCa([3, 20]), "Possibile tra le bande abilitate: la attiva la rete quando ne combina due.");
verifica("CA con una banda", lb.testoCa([3]).indexOf("Non possibile tra bande diverse") === 0, true);
verifica("CA senza bande", lb.testoCa([]), "Seleziona almeno una banda.");
// Aggancio: il disegno stock viene sempre eseguito e il suo valore restituito
verifica("aggancio sostituisce la funzione stock", ctx.internet_cnmode_get_template() === "stock" && disegniStock === 1, true);
verifica("gestori delegati registrati", gestori.join("|"),
	"change #cst_lteBand input.cstLb|click #cst_lteBand .cstLbTutte|click #cst_lteBand .cstLbApplica");

console.log(`\n${ok} OK, ${ko} FAIL`);
process.exit(ko ? 1 : 0);
