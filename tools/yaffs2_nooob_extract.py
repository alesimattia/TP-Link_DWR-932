#!/usr/bin/env python3
"""Estrattore euristico YAFFS2 per dump raw di /dev/mtdN SENZA area OOB (solo pagine dati da 2048 byte).

Senza OOB mancano i tag (object id, chunk id, sequence): i file vengono ricostruiti assumendo che
le pagine dati seguano l'header dell'oggetto in modo contiguo, come avviene per i file scritti una
volta sola (binari installati dal firmware). I file riscritti più volte (config live) possono avere
più versioni o dati frammentati: ogni versione è salvata con il numero di pagina dell'header e il
manifest segnala se nel tratto di dati compare un altro header (ricostruzione inaffidabile).

Uso: python3 -I yaffs2_nooob_extract.py <dump.img> <dir_output_nuova> [nome_file ...]
Senza nomi estrae tutti i file regolari. Dati non fidati:
- file scritti con permessi 0644, nessun bit eseguibile;
- nessun symlink/hardlink creato, nomi sanificati;
- percorsi ricostruiti dai parent id solo se univoci, altrimenti "_dir<id>".
Scrive <dir_output>/_manifest.tsv: pagina header, parent, path, size, pagine dati, esito controllo.
"""
import struct
import sys
from pathlib import Path

PAGE = 2048


def parse_header(pg):
    obj_type, parent = struct.unpack_from("<II", pg, 0)
    if obj_type not in (1, 2, 3, 4, 5) or pg[8:10] != b"\xff\xff" or not 0 < parent < 1 << 18:
        return None
    raw = pg[10:266].split(b"\0")[0]
    if not raw or not all(32 <= c < 127 for c in raw):
        return None
    size_low = struct.unpack_from("<I", pg, 292)[0]
    size_high = struct.unpack_from("<I", pg, 496)[0]
    size = size_low if size_high in (0, 0xFFFFFFFF) else (size_high << 32) | size_low
    return dict(type=obj_type, parent=parent, name=raw.decode(), size=size)


def safe(name):
    return name.replace("/", "_").replace("..", "_") or "_"


def main():
    img = Path(sys.argv[1]).read_bytes()
    out = Path(sys.argv[2])
    wanted = set(sys.argv[3:])
    out.mkdir(parents=True, exist_ok=False)
    n = len(img) // PAGE
    heads = {}
    for i in range(n):
        h = parse_header(img[i * PAGE:(i + 1) * PAGE])
        if h:
            heads[i] = h

    # Directory: object id sconosciuto senza OOB; si associa nome→parent solo come etichetta
    dirs_by_name = {}
    for h in heads.values():
        if h["type"] == 3:
            dirs_by_name.setdefault(h["name"], set()).add(h["parent"])

    rows = []
    for i, h in sorted(heads.items()):
        if h["type"] != 1 or (wanted and h["name"] not in wanted):
            continue
        npages = (h["size"] + PAGE - 1) // PAGE
        span = range(i + 1, i + 1 + npages)
        clash = [p for p in span if p in heads]
        blank = sum(1 for p in span if img[p * PAGE:(p + 1) * PAGE] == b"\xff" * PAGE)
        data = b"".join(img[p * PAGE:(p + 1) * PAGE] for p in span)[:h["size"]]
        status = "ok"
        if clash:
            status = f"header_nel_tratto@{clash[0]}"
        elif blank:
            status = f"pagine_vuote={blank}"
        elif len(data) < h["size"]:
            status = "troncato"
        dest = out / f"_dir{h['parent']}" / f"{safe(h['name'])}@{i}"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        dest.chmod(0o644)
        rows.append(f"{i}\t{h['parent']}\t{dest.relative_to(out)}\t{h['size']}\t{npages}\t{status}")

    (out / "_manifest.tsv").write_text(
        "pagina_header\tparent\tpath\tsize\tpagine\tesito\n" + "\n".join(rows) + "\n")
    print(f"header totali {len(heads)}, file estratti {len(rows)}")
    for r in rows:
        print(r)


if __name__ == "__main__":
    main()
