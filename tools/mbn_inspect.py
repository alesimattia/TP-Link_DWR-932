#!/usr/bin/env python3
"""Ispeziona immagini Qualcomm (.mbn) e Android boot.img per capire se sono firmate.

Uso: python3 -I mbn_inspect.py <file> [<file> ...]
- MBN "legacy" (header 40 B): stampa image_size, code_size, signature/cert chain size.
- ELF (sbl1, tz, rpm, modem): cerca il segmento hash (MBN header + firma + catena cert)
  e i certificati X.509 (DER) con soggetto/emittente leggibili.
- boot.img: header Android, layout e dati oltre la fine (firma appesa).
"""
import re
import struct
import sys
from pathlib import Path


def printable_cn(der):
    # Estrae stringhe OU/CN leggibili da un certificato DER senza dipendenze
    return sorted({m.decode(errors="replace") for m in re.findall(rb"[\x13\x0c\x16]([\x20-\x7e]{4,64})", der)})[:12]


def find_certs(data):
    certs = []
    for m in re.finditer(rb"\x30\x82(..)\x30\x82", data, re.S):
        ln = struct.unpack(">H", m.group(1))[0] + 4
        if 300 < ln < 4096:
            certs.append((m.start(), ln, printable_cn(data[m.start():m.start() + ln])))
    return certs


def legacy_mbn(d):
    f = struct.unpack_from("<10I", d, 0)
    keys = ["image_id", "header_vsn", "image_src", "image_dest", "image_size", "code_size",
            "sig_ptr", "sig_size", "cert_ptr", "cert_size"]
    return dict(zip(keys, f))


def elf_info(d):
    is64 = d[4] == 2
    if is64:
        phoff = struct.unpack_from("<Q", d, 0x20)[0]
        phentsize, phnum = struct.unpack_from("<HH", d, 0x36)
    else:
        phoff = struct.unpack_from("<I", d, 0x1C)[0]
        phentsize, phnum = struct.unpack_from("<HH", d, 0x2A)
    segs = []
    for i in range(phnum):
        o = phoff + i * phentsize
        if is64:
            p_type, p_flags, p_off, p_vaddr, p_paddr, p_filesz = struct.unpack_from("<IIQQQQ", d, o)
        else:
            p_type, p_off, p_vaddr, p_paddr, p_filesz, p_memsz, p_flags = struct.unpack_from("<7I", d, o)
        segs.append((i, p_type, p_flags, p_off, p_filesz))
    return segs


def boot_img(d):
    (kernel_size, kernel_addr, ramdisk_size, ramdisk_addr, second_size, second_addr,
     tags_addr, page_size, dt_size, unused) = struct.unpack_from("<10I", d, 8)
    name = d[48:64].split(b"\0")[0]
    cmdline = d[64:64 + 512].split(b"\0")[0]
    pad = lambda n: (n + page_size - 1) // page_size * page_size
    end = page_size + pad(kernel_size) + pad(ramdisk_size) + pad(second_size) + pad(dt_size)
    print(f"  kernel_size={kernel_size} kernel_addr=0x{kernel_addr:x} ramdisk_size={ramdisk_size} "
          f"second_size={second_size} tags=0x{tags_addr:x} page={page_size} dt_size={dt_size}")
    print(f"  name={name!r}\n  cmdline={cmdline.decode(errors='replace')!r}")
    print(f"  fine immagine calcolata={end} file={len(d)} extra={len(d) - end}")
    tail = d[end:]
    if tail.strip(b"\0\xff"):
        print(f"  dati oltre la fine: {len(tail)} B, primi 32: {tail[:32].hex()}")
        for c in find_certs(tail):
            print("  cert in coda:", c)
    else:
        print("  nessun dato oltre la fine (nessuna firma appesa)")
    return page_size, kernel_size, dt_size


def main():
    for p in sys.argv[1:]:
        d = Path(p).read_bytes()
        print(f"== {Path(p).name} ({len(d)} B)")
        if d[:8] == b"ANDROID!":
            boot_img(d)
        elif d[:4] == b"\x7fELF":
            for i, t, fl, off, sz in elf_info(d):
                print(f"  seg{i} type=0x{t:x} flags=0x{fl:08x} off=0x{off:x} size={sz}")
                # Segmento hash Qualcomm: flags con bit 0x02000000 (MI_PBT_HASH_SEGMENT)
                if (fl >> 24) & 0x7 == 2:
                    h = d[off:off + sz]
                    print("   hash segment header:", " ".join(f"{x:08x}" for x in struct.unpack_from("<10I", h, 0)))
        else:
            info = legacy_mbn(d)
            print("  " + " ".join(f"{k}=0x{v:x}" for k, v in info.items()))
        certs = find_certs(d)
        print(f"  certificati DER trovati: {len(certs)}")
        for off, ln, names in certs[:4]:
            print(f"   @0x{off:x} len={ln} {names}")


if __name__ == "__main__":
    main()
