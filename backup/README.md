# Backup partizioni MTD — D-Link DWR-932 rev F1, firmware 01.11.EU

Dump eseguito il 2026-10-24/25 da shell **root (adb, uid=0)** sul dispositivo
(kernel Linux 3.4.0+ build 28/06/2024, SoC Qualcomm MDM9625).
Procedura di accesso e caveat → `.claude/memory/project_dwr932-f1-rootaccess.md`.

## Metodo
- Lettura byte-esatta dei device a caratteri: `adb pull /dev/mtdN` (NON `/dev/mtdblockN`, che dà I/O error).
- Per aggirare l'instabilità del link PC→Mac: compressione `tar -czf` sul PC + trasferimento **resumable** (lettura da offset via PowerShell, append locale), poi estrazione sul Mac.
- Integrità verificata: le partizioni **statiche** hanno md5 identico device↔file
  (es. mtd7 qdsp `0e9b30a2…`, mtd9 appsbl `94dac935…`, mtd4 tz `62a4e7d7…`).

## Contenuto (20 di 22 partizioni)
Tutte le dimensioni corrispondono a `/proc/mtd`. md5 in `MD5SUMS.txt`.

| mtd | nome       | file                     | byte        | note |
|-----|------------|--------------------------|-------------|------|
| 0   | sbl        | mtd0_sbl.img             | 1.310.720   | bootloader primario |
| 3   | sdi        | mtd3_sdi.img             | 1.441.792   | |
| 4   | tz         | mtd4_tz.img              | 1.441.792   | TrustZone |
| 5   | mba        | mtd5_mba.img             | 786.432     | modem boot auth |
| 6   | rpm        | mtd6_rpm.img             | 1.441.792   | |
| 7   | qdsp       | mtd7_qdsp.img            | 50.200.576  | firmware modem (static, 2019) |
| 8   | pad        | mtd8_pad.img             | 262.144     | |
| 9   | appsbl     | mtd9_appsbl.img          | 917.504     | **aboot/LK** (fastboot) |
| 10  | apps       | mtd10_apps.img           | 4.587.520   | boot.img (kernel+dtb) |
| 11  | scrub      | mtd11_scrub.img          | 262.144     | |
| 12  | cache      | mtd12_cache.img          | 131.465.216 | scratch (live) |
| 13  | misc       | mtd13_misc.img           | 262.144     | |
| 14  | recovery   | mtd14_recovery.img       | 4.587.520   | boot.img recovery |
| 15  | fota       | mtd15_fota.img           | 127.926.272 | staging FOTA (live) |
| 16  | recoveryfs | mtd16_recoveryfs.img     | 11.927.552  | rootfs recovery (yaffs2) |
| 17  | cdrom      | mtd17_cdrom.img          | 4.325.376   | ISO CD-ROM virtuale |
| 18  | backup     | mtd18_backup.img         | 4.325.376   | |
| 19  | bmdefsys   | mtd19_bmdefsys.img       | 52.822.016  | web UI + config (yaffs2, **live**) |
| 20  | system     | mtd20_system.img         | 26.607.616  | rootfs (yaffs2, **live** = root rw) |
| 21  | userdata   | mtd21_userdata.img       | 97.124.352  | config/impostazioni (yaffs2, **live**) |

I file marcati **live** sono filesystem montati in lettura/scrittura: il dump è
uno snapshot puntuale, quindi un md5 ripreso sul device in un secondo momento
differisce (i byte cambiano con log/timestamp) pur avendo la stessa dimensione.

## Partizioni NON incluse
- **mtd1 mibib** (tabella partizioni Qualcomm) e **mtd2 efs2** (NV/EFS del modem):
  la lettura raw da Linux blocca il driver NAND in stato non interrompibile
  (`md5sum`/`dd` si impiantano) e può far cadere adb. Vanno dumpate, se necessario,
  con strumenti EDL/QPST/diag su Windows, non da `/dev/mtd`.
