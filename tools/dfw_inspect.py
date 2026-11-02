#!/usr/bin/env python3
"""Ispeziona un file .dfw DWR-932 F1 (XOR 0x92 + un ZIP ZipCrypto per partizione).

Uso: python3 -I dfw_inspect.py <file.dfw> [--dump <dir>]
Stampa header, tabella partizioni, local header / central directory di ogni ZIP
e verifica se i campi sconosciuti dell'header sono CRC32 di qualche regione.
Con --dump salva ogni partizione decodificata (ZIP cifrato) in <dir>.
"""
import struct
import sys
import zlib
from pathlib import Path

XOR = 0x92


def load(path):
    raw = Path(path).read_bytes()
    return bytes(b ^ XOR for b in raw)


def dos_dt(t, d):
    return f"{1980 + (d >> 9):04d}-{(d >> 5) & 15:02d}-{d & 31:02d} {t >> 11:02d}:{(t >> 5) & 63:02d}:{(t & 31) * 2:02d}"


def parse_zip(blob):
    out = {}
    sig, ver, flags, meth, mt, md, crc, csz, usz, nlen, xlen = struct.unpack_from("<IHHHHHIIIHH", blob, 0)
    assert sig == 0x04034B50, "local header mancante"
    name = blob[30:30 + nlen].decode(errors="replace")
    data_off = 30 + nlen + xlen
    out.update(local_ver=ver, flags=flags, method=meth, mtime=dos_dt(mt, md), local_crc=crc,
               local_csz=csz, local_usz=usz, name=name, extra=blob[30 + nlen:data_off].hex(),
               data_off=data_off, enc_hdr_last=None)
    # EOCD e central directory
    eocd = blob.rfind(b"PK\x05\x06")
    cd_size, cd_off = struct.unpack_from("<II", blob, eocd + 12)
    c = cd_off
    (csig, vmade, vneed, cflags, cmeth, cmt, cmd, ccrc, ccsz, cusz, cnlen, cxlen, cclen,
     disk, iattr, eattr, loff) = struct.unpack_from("<IHHHHHHIIIHHHHHII", blob, c)
    assert csig == 0x02014B50
    out.update(made_by=f"host={vmade >> 8} ver={vmade & 0xff}", cd_crc=f"{ccrc:08x}", cd_csz=ccsz,
               cd_usz=cusz, cd_extra=blob[c + 46 + cnlen:c + 46 + cnlen + cxlen].hex(),
               eattr=f"{eattr:08x}", eocd_off=eocd, total=len(blob))
    # Data descriptor (flag bit 3)
    dd = data_off + ccsz
    if blob[dd:dd + 4] == b"PK\x07\x08":
        out["data_descriptor"] = blob[dd:dd + 16].hex()
    else:
        out["data_descriptor"] = blob[dd:dd + 12].hex() + " (senza firma)"
    # Byte di verifica: ultimo byte dell'header di cifratura (12 B)
    out["enc_header_len"] = 12
    return out


def main():
    path = sys.argv[1]
    d = load(path)
    hdr = struct.unpack_from("<7I", d, 0)
    print("header:", " ".join(f"{x:08x}" for x in hdr))
    count = hdr[5]
    parts = []
    off = 0x258
    for i in range(count):
        e = 0x1C + i * 44
        name = d[e:e + 32].split(b"\0")[0].decode()
        f1, f2, f3 = struct.unpack_from("<III", d, e + 32)
        parts.append((name, f1, f2, f3, off))
        off += f3
    print(f"fine dati 0x{off:x}, file 0x{len(d):x}, coda {len(d) - off} B")
    print("byte header 0x00-0x258 non nulli dopo tabella:",
          d[0x1C + count * 44:0x258].strip(b"\0").hex() or "nessuno")
    for name, f1, f2, f3, o in parts:
        blob = d[o:o + f3]
        z = parse_zip(blob)
        print(f"\n[{name}] file_off=0x{o:x} f1=0x{f1:x} usz={f2} len={f3}")
        for k, v in z.items():
            print(f"  {k}: {v}")
    # Ipotesi: campi header 3/4 = CRC32 di qualche regione
    targets = {hdr[3], hdr[4]}
    regions = {"dati": d[0x258:], "tabella": d[0x1C:0x258], "header+tabella": d[0x1C:0x258],
               "tutto_da_0x1c": d[0x1C:], "tutto_da_0x14": d[0x14:]}
    regions.update({f"part:{p[0]}": d[p[4]:p[4] + p[3]] for p in parts})
    raw = Path(path).read_bytes()
    regions["raw_dati"] = raw[0x258:]
    for rname, data in regions.items():
        c = zlib.crc32(data) & 0xFFFFFFFF
        a = zlib.adler32(data) & 0xFFFFFFFF
        s = sum(data) & 0xFFFFFFFF
        for label, val in (("crc32", c), ("crc32^ff", c ^ 0xFFFFFFFF), ("adler32", a), ("sum", s)):
            if val in targets:
                print(f"MATCH: {label}({rname}) = {val:08x}")
    if "--dump" in sys.argv:
        outdir = Path(sys.argv[sys.argv.index("--dump") + 1])
        outdir.mkdir(parents=True, exist_ok=True)
        for name, f1, f2, f3, o in parts:
            (outdir / f"{name}.zip").write_bytes(d[o:o + f3])
        print("dump in", outdir)


if __name__ == "__main__":
    main()
