#!/usr/bin/env python3
"""Allinea le pagine (2048 byte) di un dump raw senza OOB a un binario di riferimento di un'altra versione.

Per ogni pagina del dump cerca impronte di 8 byte (allineate a 4) che compaiono UNA sola volta nel
riferimento; ogni impronta vota l'offset del riferimento a cui corrisponde l'inizio della pagina.
Stampa le pagine con almeno <min_voti> voti concordi, ordinate per offset stimato nel riferimento.
Serve a ritrovare i frammenti di un file riscritto/frammentato da yaffs quando mancano i tag OOB.

Uso: python3 -I yaffs_ref_align.py <dump.img> <riferimento> [min_voti=24]
"""
import sys
from collections import Counter
from pathlib import Path

PAGE = 2048


def main():
    dump = Path(sys.argv[1]).read_bytes()
    ref = Path(sys.argv[2]).read_bytes()
    min_votes = int(sys.argv[3]) if len(sys.argv) > 3 else 24

    seen = Counter(ref[k:k + 8] for k in range(0, len(ref) - 8, 4))
    uniq = {}
    for k in range(0, len(ref) - 8, 4):
        s = ref[k:k + 8]
        if seen[s] == 1 and len(set(s)) > 2:  # scarta impronte banali (zeri, 0xff, ripetizioni)
            uniq[s] = k

    rows = []
    for p in range(len(dump) // PAGE):
        pg = dump[p * PAGE:(p + 1) * PAGE]
        votes = Counter()
        for j in range(0, PAGE - 8, 4):
            k = uniq.get(pg[j:j + 8])
            if k is not None:
                votes[(k - j) // 4 * 4] += 1
        if votes:
            # raggruppa voti entro ±0x40 (piccoli spostamenti dentro la pagina tra versioni)
            best, n = votes.most_common(1)[0]
            near = sum(v for o, v in votes.items() if abs(o - best) <= 0x40)
            if near >= min_votes:
                rows.append((best, p, near))
    rows.sort()
    for off, p, n in rows:
        print(f"ref_off=0x{off:06x} pagina={p} voti={n}")


if __name__ == "__main__":
    main()
