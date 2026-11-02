# D-Link: mappa firmware/revisioni della famiglia DWR-932 / DWR-932C / DWR-933 (ODM BroadMobi)

Fonti (consultate 2026-10-24):
- https://ftp.dlink.de/dwr/dwr-932/driver_software/  (+ index_info.txt)
- https://ftp.dlink.de/dwr/dwr-932/archive/driver_software/
- https://ftp.dlink.de/dwr/dwr-932/documentation/
- https://ftp.dlink.ru/pub/Wireless/DWR-932C/Firmware/  e  /Description/
- https://ftp.dlink.de/dwr/dwr-933/driver_software/
- https://support.dlink.com/resource/SECURITY_ADVISEMENTS/DWR-932C/REVE/DWR-932C_REVE_FIRMWARE_v1.0.0.5_HOTFIX.zip
Metodo: listing HTTP delle directory + lettura della sola central directory ZIP (HTTP Range sugli ultimi 64 KB). Nessun firmware scaricato per intero.

## ftp.dlink.de /dwr/dwr-932/driver_software/
```
19.10.2016   63857702  DWR-932_fw_revb_203eu_ALL_multi_20161012.zip
23.06.2017   38986516  DWR-932_fw_revc2_102eu_eu_multi_20170424.zip
10.05.2016   47003101  DWR-932_fw_revd_400eub04_ALL_multi_20150824.zip
12.10.2018  105512464  DWR-932_fw_reve1_104eu_EU_multi_20180702.zip
20.09.2024   46581460  DWR-932_fw_revf1_111EU_EU_multi_20240802.zip
15.06.2016  269522776  DWR-932_sw_revb_GPLcode.bz2
25.04.2017  879595173  DWR-932_sw_revc2_GPLcode.zip
09.11.2020  643526439  DWR-932_sw_reve1_GPLcode.tar.gz
27.10.2020 1103117599  DWR-932_sw_revf1_GPLcode.tar.gz
```
archive/driver_software/:
```
27.04.2015   54598025  DWR-932_fw_revb_202eu_ALL_multi_20150119.zip
19.03.2020   74658528  DWR-932_fw_revf1_104eu_EU_multi_20190801.zip
19.04.2022   92734611  DWR-932_fw_revf1_108EU_EU_multi_20220113.zip
```
documentation/: CEDoC RevB1/C2/D1/E1/F1, datasheet, manuali reve/revf, QIG reve/revf, howto "revef_Roaming..." (E e F condividono manuale/howto).

## Contenuto degli ZIP (central directory)
| Revisione | Archivio | File interno |
|---|---|---|
| DWR-932 C2 | revc2_102eu (2017) | `ap.zip` / `ap.bin` (ZIP cifrato), changes.txt |
| DWR-932 E1 | reve1_104eu (2018) | `DTLW1_R705B_04B0_4700_V1.0.0.7_180702_Release.exe` (updater Windows) |
| DWR-932 F1 | revf1_104eu (2019) | `dtlwe_r602b_04b0_4706_v1.0.0.1_190801_release(01.04.eu).exe` (updater Windows, WinZip SFX) |
| DWR-932 F1 | revf1_108EU (2022) | `01_DTLWE_R602B_04B0_4706_V1.0.1.3_middleFW.dfw`, `02_DTLWE_R602B_04B0_4706_v1.0.1.5 (01.08.EU).dfw` |
| DWR-932 F1 | revf1_111EU (2024) | `encrypt_DTLWE_R602B_04B0_4706_V1.0.2.1.dfw` |
| DWR-932C E (non-US) | hotfix v1.0.0.5 (2021) | `DTLWS_R705B_04B0_5409_V1.0.0.5_210823_Release(01.06DRS).exe` + release notes PDF |
| DWR-932C (RU, F1?) | ftp.dlink.ru | `DLKER_R602B_00_A08_A29_V1.0.0.2.dfw` (44M), `DLKER_R602B_00_AI9_A29_V1.0.0.2_221011(01.05.DRU).zip` (→ `encrypt_DLKER_R602B_00_AI9_A29_V1.0.0.2.dfw`), `DLKER_R602B_00_AI9_A29_V1.0.0.2_221011_Release.exe` (67M, updater Windows), `DWR-932C_RU.01.00.3.081_1Key.rar`, `FW_DWR-932C_G1_RU_Rel_01.01.3.082.rar` |
| DWR-933 B1 | revb1_112eub02 (2023) | `DWR-933_RevB_Firmware_112EUb02.dfw` + changes.txt |

ftp.dlink.ru /DWR-932C/Description/: `DWR-932C_F1_Manual_v1.00(LA).pdf`, `DWR-932C_G1_Manual_v1.00(WW).pdf`.

## Confronto container .dfw (header letto via Range / dal file locale)
- DWR-932 F1 01.11EU: header XOR 0x92 → magic `21 43 34 12  ef cd ab 89  01 00 00 00`, tabella partizioni: boot, system, userdata, qdsp, bmdefsys;
  membri ZIP (tutti ZipCrypto + deflate): `mdm-perf-image-boot-mdm9625-perf.img`, `msm-mdm-perf-image-eglibc-ipk--mdm9625-perf.rootfs.yaffs2`,
  `mdm9625-perf-usr-image.usrfs.yaffs2`, `qdsp6sw.mbn`, `mdm9625-perf-bmdefsys.usrfs.yaffs2`.
- DWR-933 B1 1.12EUb02: STESSO magic `21433412efcdab8901000000` ma header in chiaro (non XOR); partizioni boot, bmfs, system;
  primo membro `mdm9640-2k-perf-boot.img` (ZipCrypto, flags 0x9, deflate) → piattaforma MDM9640, stesso formato/ODM.

## Note dedotte (inferenze, non affermazioni delle fonti)
- Schema nomi `<cliente>_<board>_<hw>_<sku>_V<ver>`: DTLW1/DTLWS/DTLWE/DLKER = codici cliente/regione D-Link; R705B = board DWR-932 E1 e DWR-932C E; R602B = board DWR-932 F1 e DWR-932C RU (F1?).
- Il prefisso "bm"/"BM" (bmdefsys, bmfs, bmlog, AT+BMCMD) coincide con Shanghai BroadMobi Communication Co., Ltd (CompanyName di dl.exe nell'updater F1, vedi dwr932-f1-0104eu-windows-updater_scripts-BroadMobi.md).
- Gli updater Windows (.exe) flashano via adb+fastboot, quindi contengono quasi certamente le immagini di partizione NON cifrate (contenuto delle immagini non verificato: servirebbe scaricare 67–75 MB).
