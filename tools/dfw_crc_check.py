#!/usr/bin/env python3
"""Verifica se il campo header[4] del .dfw è un CRC32 dell'immagine decompressa.

Usa i CRC32 delle partizioni (dalla central directory degli ZIP) e crc32_combine,
quindi non serve decifrare le partizioni. Prova varie combinazioni
(con/senza i 0x258 byte di header, header azzerato, ecc.).
Uso: python3 -I dfw_crc_check.py <file.dfw>
"""
import struct
import sys
import zlib
from pathlib import Path

XOR = 0x92


def gf2_times(mat, vec):
    s = 0
    i = 0
    while vec:
        if vec & 1:
            s ^= mat[i]
        vec >>= 1
        i += 1
    return s


def gf2_square(mat):
    return [gf2_times(mat, mat[n]) for n in range(32)]


def crc32_combine(crc1, crc2, len2):
    """Porting di zlib crc32_combine (polinomio riflesso 0xEDB88320)."""
    if len2 <= 0:
        return crc1
    odd = [0xEDB88320] + [1 << n for n in range(31)]
    even = gf2_square(odd)
    odd = gf2_square(even)
    while True:
        even = gf2_square(odd)
        if len2 & 1:
            crc1 = gf2_times(even, crc1)
        len2 >>= 1
        if not len2:
            break
        odd = gf2_square(even)
        if len2 & 1:
            crc1 = gf2_times(odd, crc1)
        len2 >>= 1
        if not len2:
            break
    return crc1 ^ crc2


def main():
    raw = Path(sys.argv[1]).read_bytes()
    d = bytes(b ^ XOR for b in raw)
    hdr = list(struct.unpack_from("<7I", d, 0))
    target = hdr[4]
    parts = []
    off = 0x258
    for i in range(hdr[5]):
        e = 0x1C + i * 44
        f1, f2, f3 = struct.unpack_from("<III", d, e + 32)
        blob = d[off:off + f3]
        eocd = blob.rfind(b"PK\x05\x06")
        cd_off = struct.unpack_from("<I", blob, eocd + 16)[0]
        crc = struct.unpack_from("<I", blob, cd_off + 16)[0]
        parts.append((f1, f2, crc))
        off += f3

    def chain(start_crc, items):
        c = start_crc
        for _, usz, crc in items:
            c = crc32_combine(c, crc, usz)
        return c

    cands = {}
    cands["solo partizioni"] = chain(0, parts)
    h = bytearray(d[:0x258])
    cands["header+partizioni"] = chain(zlib.crc32(bytes(h)), parts)
    for idx in (3, 4):
        hz = bytearray(h)
        struct.pack_into("<I", hz, idx * 4, 0)
        cands[f"header(campo{idx}=0)+partizioni"] = chain(zlib.crc32(bytes(hz)), parts)
    hz = bytearray(h)
    struct.pack_into("<I", hz, 16, 0)
    struct.pack_into("<I", hz, 12, 0)
    cands["header(campi3,4=0)+partizioni"] = chain(zlib.crc32(bytes(hz)), parts)
    cands["tabella+partizioni"] = chain(zlib.crc32(bytes(h[0x1C:])), parts)
    cands["header XOR+partizioni"] = chain(zlib.crc32(raw[:0x258]), parts)
    print(f"target header[4] = {target:08x}")
    for k, v in cands.items():
        for lab, val in (("", v), (" ^ffffffff", v ^ 0xFFFFFFFF)):
            mark = "  <== MATCH" if val == target else ""
            print(f"{k}{lab}: {val:08x}{mark}")


if __name__ == "__main__":
    main()
