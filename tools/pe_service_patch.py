# Crea il pe_service modificato per il controllo del governor della CPU (FW 01.11.EU).
# Il pe_service stock (ciclo power_led_monitor, FUN_0000c128) misura il carico della CPU da /proc/stat e chiama
# system("echo performance > .../scaling_governor") con carico >= 51%, poi system("echo ondemand > ...") dopo
# circa 61 campioni sotto il 51%. Le due stringhe diventano una chiamata a custom_cpufreq.sh, che inoltra la
# richiesta solo con il governor "auto": la patch tocca solo quei byte di .rodata, a lunghezza invariata (NUL in coda).
# Uso: python3 -I tools/pe_service_patch.py <pe_service originale> <file in uscita>
import hashlib
import sys

ORIG_SHA256 = 'efa94d89dfd4e0d66c8e4f2aa9756fd9d279fbb590bf22becf830f44133eb278'
GOV = b'/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor'
HOOK = b'/bmdefsys/usr/bin/custom_cpufreq.sh pe '
SOST = [(b'echo ' + g + b' > ' + GOV + b'\0', HOOK + g + b'\0') for g in (b'performance', b'ondemand')]

src, out = sys.argv[1], sys.argv[2]
data = bytearray(open(src, 'rb').read())
sha = hashlib.sha256(data).hexdigest()
if sha != ORIG_SHA256:
    sys.exit(f'sha256 inatteso {sha}: non è il pe_service 01.11 originale')
for vecchia, nuova in SOST:
    if data.count(vecchia) != 1:
        sys.exit(f'stringa non trovata una sola volta: {vecchia!r}')
    off = data.find(vecchia)
    data[off:off + len(vecchia)] = nuova.ljust(len(vecchia), b'\0')
    print(f'0x{off:x}: {vecchia[:-1].decode()} -> {nuova[:-1].decode()}')
open(out, 'wb').write(data)
diff = sum(1 for a, b in zip(open(src, 'rb').read(), data) if a != b)
print(f'byte modificati: {diff}, sha256 {hashlib.sha256(data).hexdigest()}')
