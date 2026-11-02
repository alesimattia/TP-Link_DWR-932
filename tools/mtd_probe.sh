#!/bin/sh
# Classifica leggibilità partizioni MTD con timeout lato device (busybox -t).
for i in 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21; do
  r=$(timeout -t 12 dd if=/dev/mtd$i of=/dev/null bs=131072 2>&1 | tail -1)
  echo "mtd$i: $r"
done
