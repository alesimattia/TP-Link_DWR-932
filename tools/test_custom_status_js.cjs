// Test delle funzioni di formattazione di js/custom_status.js (riquadro di stato della home), senza browser.
// Uso: node tools/test_custom_status_js.cjs [percorso di custom_status.js]
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = process.argv[2] ||
	`${__dirname}/../analysis/device-pull-0111/modified/webpages/js/custom_status.js`;
const ctx = { document: { getElementById: () => null, hidden: false }, $: () => ({ ready: () => {} }) };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path, "utf8") + "\nthis.customStatus = customStatus;", ctx);
const cs = ctx.customStatus;

let ok = 0, ko = 0;
function verifica(nome, ottenuto, atteso) {
	if (ottenuto === atteso) { ok++; console.log(`OK   ${nome}`); }
	else { ko++; console.log(`FAIL ${nome}: atteso ${JSON.stringify(atteso)}, ottenuto ${JSON.stringify(ottenuto)}`); }
}

// Maschera delle bande LTE: bit 0 = B1
verifica("bande B1 B3 B7 B8 B20", cs.bandeAbilitate("524485"), "B1 B3 B7 B8 B20");
verifica("banda B1", cs.bandeAbilitate("1"), "B1");
verifica("bit 63 (oltre 2^53)", cs.bandeAbilitate("9223372036854775808"), "B64");
verifica("tutte le bande", cs.bandeAbilitate("18446744073709551615"), "tutte");
verifica("maschera zero", cs.bandeAbilitate("0"), null);
verifica("maschera non numerica", cs.bandeAbilitate("12a"), null);
verifica("maschera assente", cs.bandeAbilitate(null), null);
// Durate
verifica("durata 0", cs.durata(0), "00:00:00");
verifica("durata 3725 s", cs.durata(3725), "01:02:05");
verifica("durata con giorni", cs.durata(90061), "1 g 01:01");
verifica("durata negativa", cs.durata(-5), null);
verifica("durata non numerica", cs.durata("x"), null);
// Velocità (byte/s in ingresso)
verifica("velocità 0", cs.velocita(0), "0 b/s");
verifica("velocità 12345 B/s", cs.velocita(12345), "99 kb/s");
verifica("velocità 154321 B/s", cs.velocita(154321), "1,2 Mb/s");
verifica("velocità null", cs.velocita(null), null);
// Frequenze in kHz
verifica("300 MHz", cs.mhz(300000), "300 MHz");
verifica("748,8 MHz", cs.mhz(748800), "748,8 MHz");
verifica("998,4 MHz", cs.mhz(998400), "998,4 MHz");
verifica("frequenza assente", cs.mhz(undefined), null);

console.log(`RISULTATO: ${ok} OK, ${ko} FAIL`);
process.exit(ko ? 1 : 0);
