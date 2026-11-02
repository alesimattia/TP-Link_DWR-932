#!/usr/bin/env python3
"""Copertura a pagine: per ogni file indica quante sue pagine da 2048 byte compaiono identiche in un dump raw.
Se tutte compaiono, il file nel dump e identico al riferimento.
Uso: python3 -I page_coverage.py <dump.img> <file> [file ...]
"""
import sys
dump=open(sys.argv[1],'rb').read()
pages=set(dump[i:i+2048] for i in range(0,len(dump),2048))
for f in sys.argv[2:]:
    d=open(f,'rb').read()
    full=[d[i:i+2048] for i in range(0,len(d)-len(d)%2048,2048)]
    hit=sum(1 for p in full if p in pages)
    tail=d[len(d)-len(d)%2048:]
    tailhit=any(p.startswith(tail) for p in pages) if tail else None
    print(f"{hit}/{len(full)} pagine piene trovate, coda {len(tail)}B trovata={tailhit}  size={len(d)}  {f}")
