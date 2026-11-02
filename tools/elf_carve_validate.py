#!/usr/bin/env python3
"""Ricompone un ELF ARM32 da pagine (2048 byte) di un dump raw senza OOB e ne valida l'ordine.

Uso: python3 -I elf_carve_validate.py <dump.img> <output> <size> <tratti> [riferimento_strings]
  <tratti> = elenco "inizio-fine" di pagine del dump nell'ordine del file, es. 304-362,3216-3220
  [riferimento_strings] = binario di un'altra versione, usato per verificare le stringhe a cavallo
                          delle giunzioni tra tratti.
Controlli:
  1) somma pagine == size;
  2) giunzioni: la stringa stampabile che attraversa ogni confine tra tratti deve esistere nel riferimento
     (o il confine cade su un byte non stampabile);
  3) .text: le destinazioni delle istruzioni BL devono cadere in .text/.plt su un prologo di funzione
     (push/stmdb con lr, o mov ip/sub sp), percentuale per tratto;
  4) puntatori letterali in .text verso .rodata devono puntare a inizio stringa (byte precedente 0x00).
L'output viene scritto con permessi 0644 (dato non fidato, non eseguibile).
"""
import re
import struct
import sys
from pathlib import Path

PAGE = 2048


def sections(d):
    shoff, = struct.unpack_from("<I", d, 0x20)
    shentsize, shnum, shstrndx = struct.unpack_from("<HHH", d, 0x2e)
    secs = [struct.unpack_from("<10I", d, shoff + k * shentsize) for k in range(shnum)]
    so = secs[shstrndx][4]
    out = {}
    for s in secs:
        name = d[so + s[0]:so + s[0] + 32].split(b"\0")[0].decode("latin1")
        out[name] = dict(addr=s[3], off=s[4], size=s[5])
    return out


def main():
    dump = Path(sys.argv[1]).read_bytes()
    dest = Path(sys.argv[2])
    size = int(sys.argv[3])
    runs = [tuple(int(x) for x in r.split("-")) for r in sys.argv[4].split(",")]
    ref = Path(sys.argv[5]).read_bytes() if len(sys.argv) > 5 else None

    pages = [p for a, z in runs for p in range(a, z + 1)]
    print(f"pagine {len(pages)} attese {(size + PAGE - 1) // PAGE}")
    data = b"".join(dump[p * PAGE:(p + 1) * PAGE] for p in pages)[:size]
    dest.write_bytes(data)
    dest.chmod(0o644)

    # mappa offset file -> tratto
    bounds = []
    pos = 0
    for a, z in runs:
        n = (z - a + 1) * PAGE
        bounds.append((pos, pos + n, f"{a}-{z}"))
        pos += n

    def run_of(off):
        for lo, hi, name in bounds:
            if lo <= off < hi:
                return name
        return "?"

    # 2) giunzioni
    if ref:
        for lo, hi, name in bounds[1:]:
            left = re.search(rb"[\x20-\x7e]*$", data[max(0, lo - 200):lo]).group()
            right = re.match(rb"[\x20-\x7e]*", data[lo:lo + 200]).group()
            s = left + right
            if not left or not right:
                verdict = "confine su byte non stampabile (neutro)"
            elif len(s) >= 6 and s in ref:
                verdict = "OK stringa presente nel riferimento"
            else:
                verdict = "NON trovata"
            print(f"giunzione @0x{lo:05x} -> {name}: {s[-40:]!r} {verdict}")

    sec = sections(data)
    text, plt, rod = sec[".text"], sec.get(".plt"), sec[".rodata"]
    base = text["addr"] - text["off"]  # vaddr = off + base (segmento testo)

    def word(off):
        return struct.unpack_from("<I", data, off)[0]

    def is_prologue(off):
        if plt and plt["off"] <= off < plt["off"] + plt["size"]:
            return True
        w = word(off)
        return (w & 0xFFFF4000) == 0xE92D4000 or (w & 0xFFFFF000) == 0xE24DD000 or w == 0xE1A0C00D

    # 3) BL
    stats = {}
    t0, t1 = text["off"], text["off"] + text["size"]
    for off in range(t0, t1, 4):
        w = word(off)
        if (w & 0xFF000000) == 0xEB000000:  # BL incondizionato
            imm = w & 0xFFFFFF
            if imm & 0x800000:
                imm -= 1 << 24
            tgt = off + 8 + imm * 4
            ok = (plt and plt["off"] <= tgt < t1) and is_prologue(tgt)
            r = run_of(off)
            g, tot = stats.get(r, (0, 0))
            stats[r] = (g + bool(ok), tot + 1)
    for r, (g, tot) in stats.items():
        print(f"BL tratto {r}: {g}/{tot} verso prologo ({100 * g // max(tot, 1)}%)")

    # 4) puntatori a stringhe in .rodata
    rlo, rhi = rod["addr"], rod["addr"] + rod["size"]
    pstats = {}
    for off in range(t0, t1, 4):
        v = word(off)
        if rlo <= v < rhi:
            foff = v - base
            ok = data[foff - 1] == 0 or v == rlo
            r = run_of(off)
            g, tot = pstats.get(r, (0, 0))
            pstats[r] = (g + ok, tot + 1)
    for r, (g, tot) in pstats.items():
        print(f"puntatori .rodata da tratto {r}: {g}/{tot} a inizio stringa ({100 * g // max(tot, 1)}%)")
    # puntatori che cadono dentro ciascun tratto di .rodata (valida la posizione dei tratti di dati)
    tstats = {}
    for off in range(t0, t1, 4):
        v = word(off)
        if rlo <= v < rhi:
            foff = v - base
            ok = data[foff - 1] == 0
            r = run_of(foff)
            g, tot = tstats.get(r, (0, 0))
            tstats[r] = (g + ok, tot + 1)
    for r, (g, tot) in sorted(tstats.items()):
        print(f"puntatori che cadono nel tratto {r}: {g}/{tot} a inizio stringa ({100 * g // max(tot, 1)}%)")


if __name__ == "__main__":
    main()
