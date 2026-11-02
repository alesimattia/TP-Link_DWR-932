# Risolve le stringhe referenziate in modo PC-relativo (ldr rX, [pc, #imm] seguito da add rY, pc, rX) in un
# disassemblato ARM di llvm-objdump ed elenca le chiamate bl nell'intervallo, per leggere i system()/popen()
# di funzioni che Ghidra non ha delimitato. Mappatura indirizzo -> offset nel file: va - 0x8000 (ELF di qcmap_fcgi).
# Disassemblato: xcrun llvm-objdump -d --triple=armv7 <binario> > <file.dis>
# Uso: python3 -I tools/resolve_pcrel.py <file.dis> <binario> <inizio_hex> <fine_hex>
import re
import struct
import sys

dis, binp, a, b = sys.argv[1], sys.argv[2], int(sys.argv[3], 16), int(sys.argv[4], 16)
data = open(binp, 'rb').read()
ent = []
for l in open(dis).read().splitlines():
    m = re.match(r'\s+([0-9a-f]+):\s+[0-9a-f]{8}\s+(.*)', l)
    if m:
        ent.append((int(m.group(1), 16), m.group(2)))


def word(va):
    return struct.unpack('<I', data[va - 0x8000:va - 0x8000 + 4])[0]


def cstr(va):
    o = va - 0x8000
    if not (0 <= o < len(data)):
        return None
    s = data[o:data.find(b'\0', o)]
    return s.decode('latin1') if 0 < len(s) < 200 and all(32 <= c < 127 or c in (9, 10) for c in s) else None


lit = {}
for va, ins in ent:
    if not (a <= va <= b):
        continue
    m = re.match(r'ldr\s+(\w+), \[pc, #(-?0x[0-9a-f]+)\]', ins)
    if m:
        lit[m.group(1)] = word(va + 8 + int(m.group(2), 16))
    m = re.match(r'add\s+(\w+), pc, (\w+)', ins)
    if m and m.group(2) in lit:
        t = (lit[m.group(2)] + va + 8) & 0xffffffff
        print(hex(va), hex(t), repr(cstr(t)))
    m = re.match(r'bl\s+(0x[0-9a-f]+)', ins)
    if m:
        print(hex(va), '  bl', m.group(1))
