// Test delle funzioni JavaScript di custom.cgi (decodifica SSID di wpa_supplicant e conversione in esadecimale).
// Estrae il codice direttamente dal CGI per testare quello reale. Uso: node tools/test_custom_js.cjs
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../analysis/device-pull-0111/modified/custom.cgi', 'utf8');
const start = src.indexOf('  function wpaBytes');
const end = src.indexOf('  var i, els');
const lib = new Function(src.slice(start, end) + '; return { wpaBytes, toHex, utf8, text };')();
const casi = [
  ['H3140', '4833313430', 'H3140'],
  ["M&M's Home 2.4GHz", Buffer.from("M&M's Home 2.4GHz").toString('hex'), "M&M's Home 2.4GHz"],
  ['\\xe2\\x9c\\x93ok', 'e29c936f6b', '✓ok'],
  ['a\\"b\\\\c', '6122625c63', 'a"b\\c'],
  ['x\\ty', '780979', 'x\ty'],
  ['<script>', '3c7363726970743e', '<script>'],
];
let ko = 0;
for (const [ingresso, hexAtteso, testoAtteso] of casi) {
  const b = lib.wpaBytes(ingresso);
  const hex = lib.toHex(b), testo = lib.text(b);
  const ok = hex === hexAtteso && testo === testoAtteso;
  if (!ok) ko++;
  console.log(`${ok ? 'OK ' : 'KO '} ${JSON.stringify(ingresso)} -> hex=${hex} testo=${JSON.stringify(testo)}`);
}
const digitato = lib.toHex(lib.utf8('Caffè WiFi'));
const okUtf8 = digitato === Buffer.from('Caffè WiFi', 'utf8').toString('hex');
if (!okUtf8) ko++;
console.log(`${okUtf8 ? 'OK ' : 'KO '} SSID digitato UTF-8 -> ${digitato}`);
console.log(ko ? `FALLITI: ${ko}` : 'TUTTI OK');
process.exit(ko ? 1 : 0);
