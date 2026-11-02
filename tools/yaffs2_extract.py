#!/usr/bin/env python3
"""Estrattore YAFFS2 minimale per immagini mkyaffs2image (chunk 2048 + spare 64, packed tags2 senza ECC).

Uso: python3 -I yaffs2_extract.py <immagine.yaffs2> <dir_output_nuova>
Per sicurezza (dati non fidati):
- file regolari scritti con permessi 0644 (nessun bit eseguibile/setuid);
- symlink, hardlink e file speciali NON creati: elencati nel manifest;
- nomi sanificati (niente '/', '..').
Scrive <dir_output>/_manifest.tsv con: tipo, mode ottale, uid, gid, size, path, destinazione link.
"""
import os
import struct
import sys
from pathlib import Path

CHUNK = 2048
SPARE = 64
TYPES = {0: "unknown", 1: "file", 2: "symlink", 3: "dir", 4: "hardlink", 5: "special"}


def parse_header(data):
    obj_type, parent = struct.unpack_from("<II", data, 0)
    name = data[10:10 + 256].split(b"\0")[0].decode("utf-8", "replace")
    mode, uid, gid, atime, mtime, ctime, size_low, equiv_id = struct.unpack_from("<8I", data, 268)
    alias = data[300:300 + 160].split(b"\0")[0].decode("utf-8", "replace")
    size_high = struct.unpack_from("<I", data, 496)[0]
    size = size_low if size_high in (0, 0xFFFFFFFF) else (size_high << 32) | size_low
    return dict(type=obj_type, parent=parent, name=name, mode=mode, uid=uid, gid=gid,
                mtime=mtime, size=size, equiv=equiv_id, alias=alias)


def main():
    img = Path(sys.argv[1]).read_bytes()
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=False)
    objs = {1: dict(type=3, parent=1, name="", mode=0o40755, uid=0, gid=0, size=0, alias="", equiv=0)}
    seqs = {}
    chunks = {}
    for i in range(len(img) // (CHUNK + SPARE)):
        base = i * (CHUNK + SPARE)
        data = img[base:base + CHUNK]
        seq, obj_id, chunk_id, n_bytes = struct.unpack_from("<4I", img, base + CHUNK)
        if seq in (0, 0xFFFFFFFF):
            continue  # chunk vuoto/cancellato
        if chunk_id & 0x80000000:  # header con info extra nei tag
            chunk_id = 0
        obj_id &= 0x0FFFFFFF
        if chunk_id == 0:
            if seq >= seqs.get(obj_id, 0):
                seqs[obj_id] = seq
                objs[obj_id] = parse_header(data)
        else:
            prev = chunks.get((obj_id, chunk_id))
            if prev is None or seq >= prev[0]:
                chunks[(obj_id, chunk_id)] = (seq, data[:n_bytes])

    def path_of(oid, depth=0):
        if oid == 1 or depth > 64:
            return Path()
        o = objs.get(oid)
        if o is None:
            return Path(f"_orfani/{oid}")
        name = o["name"].replace("/", "_")
        if name in ("", ".", ".."):
            name = f"_obj{oid}"
        return path_of(o["parent"], depth + 1) / name

    manifest = []
    # Prima le directory
    for oid, o in objs.items():
        if o["type"] == 3:
            (out / path_of(oid)).mkdir(parents=True, exist_ok=True)
    for oid, o in sorted(objs.items()):
        p = path_of(oid)
        t = TYPES.get(o["type"], str(o["type"]))
        link = ""
        if o["type"] == 1:
            parts = sorted((cid, d) for (ob, cid), (_, d) in chunks.items() if ob == oid)
            blob = b"".join(d for _, d in parts)[:o["size"]]
            dest = out / p
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(blob)
            os.chmod(dest, 0o644)
        elif o["type"] == 2:
            link = o["alias"]
        elif o["type"] == 4:
            link = "hardlink->" + str(path_of(o["equiv"]))
        manifest.append(f"{t}\t{o['mode'] & 0o7777:04o}\t{o['uid']}\t{o['gid']}\t{o['size']}\t/{p}\t{link}")
    (out / "_manifest.tsv").write_text("\n".join(manifest) + "\n")
    print(f"oggetti {len(objs)}, chunk dati {len(chunks)}, manifest {len(manifest)} righe -> {out}")


if __name__ == "__main__":
    main()
