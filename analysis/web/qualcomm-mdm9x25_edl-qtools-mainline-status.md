# Qualcomm MDM9x25: strumenti EDL/DLOAD, loader, stato mainline Linux, progetti correlati

Consultato 2026-10-24.

## 1. forth32/qtools — https://github.com/forth32/qtools (ultimo push 2018-10-10)
Descrizione (RU): "Набор инструментов для работы с flash модемов на чипсете qualcom" — utility + loader patchati.
- qcommand (terminale comandi), qrmem (dump memoria), qrflash (lettura flash per blocchi/partizioni), qwflash (scrittura partizioni via user-partitions del loader, come QPST),
  qwdirect (scrittura diretta blocchi NAND con/senza OOB via registri controller), qdload (carica il loader con il modem in download mode / PBL emergency), dload.sh.
- chipset.cfg, voce MDM9x25:
```
[MDM9x25]
id=3
addr=f9af0000      (base controller NAND)
udflag=1
ctrl=0
msmid=07f1
sahara=1
nprg=NPRG9x25p.bin
enprg=ENPRG9x25p.bin
```
- loader presenti: `loaders/NPRG9x25p.bin`, `ENPRG9x25p.bin`, `NPRG9x25_ZTE.mbn`, `ENPRG9x25_ZTE.mbn`, `NPRG9x25_TCT.mbn`, `ENPRG9x25_TCT.mbn` (+ 9x15, 9x35, 9x45 ...).
  Nota: protocollo "streaming download" (NPRG/ENPRG), non firehose. Su device con secure boot attivo (PK hash OEM fuso) un loader non firmato dall'OEM viene rifiutato dal PBL — non verificato per la DWR-932 F1.

## 2. bkerler/edl — https://github.com/bkerler/edl (README)
- Sezione "Streaming mode (credits to forth32)": esempi Sierra (AT!BOOTHOLD, AT!QPSTDLOAD), Netgear MR1100 (NPRG9x55p), ZTE MF920V/Quectel/Telit (`enableadb` o AT `AT+ZCDRUN=E`, poi `adb reboot edl`).
- `edl secureboot` / `edl qfp` per leggere fuse secure boot / QFPROM (solo con loader EL3).
- Repo loader https://github.com/bkerler/Loaders: presenti patched mdm9x06, mdm9x07, mdm9x3x, mdm9x5x, mdm9x6x; NESSUN loader mdm9x25 (verificato sul tree).

## 3. Mainline Linux (torvalds/linux, verificato via GitHub API)
- arch/arm/boot/dts/qcom: esistono `qcom-mdm9615.dtsi`, `qcom-mdm9615-wp8548*.dts`, `qcom-sdx55*`, `qcom-sdx65*`. NESSUN dts mdm9625 né mdm9607.
- MDM9607: driver mainline presenti (gcc-mdm9607.c, pinctrl-mdm9607.c, qcom_nandc `qcom,mdm9607-nand`, rpmpd, clk-smd-rpm, qcom_q6v5_mss, socinfo, tsens) ma DTS non mergiato
  (patch 2021 "ARM: dts: Add MDM9607, PM8019 and Quectel EG25-G DTS files", Konrad Dybcio — https://lkml.iu.edu/hypermail/linux/kernel/2108.0/05458.html).
- MDM9625: nessun riferimento in mainline (ricerca codice "mdm9625" nel repo torvalds/linux: 0 risultati). Le occorrenze su GitHub sono solo in kernel vendor msm-3.4/3.10 (es. `arch/arm/boot/dts/msm9625.dtsi`, `sound/soc/msm/mdm9625.c` in sonyxperiadev/kernel-copyleft).
- MDM9615: serie di fix bindings/DT di Neil Armstrong nel 2022 (https://lore.kernel.org/all/Y2A+TMwdsMn3C5Wm@mit.edu/T/).
- m0veax/tplink_m7350 README-v3: "There is no mainline support as of 2025-08-18, but for the MDM9615. It may be similar enough."

## 4. Progetti/port per SoC vicini
- Biktorgj/linux-4.14-mdm9607 (kernel per Quectel EG25, base del firmware open "pinephone_modem_sdk") — https://github.com/Biktorgj/linux-4.14-mdm9607
- hkfuertes/msm8916-openwrt — OpenWrt SNAPSHOT per dongle 4G cinesi MSM8916 (UZ801 ecc.; SoC diverso, supportato in mainline) — https://github.com/hkfuertes/msm8916-openwrt
- OpenWrt forum: per MDM9207 "no mainline kernel support... porting OpenWrt would be a significant undertaking" — https://forum.openwrt.org/t/pocket-dual-band-router/156075
- OpenWrt forum TP-Link M7350 v4: https://forum.openwrt.org/t/add-support-for-tp-link-m7350-v4/132119 ; archivio: http://forum.archive.openwrt.org/viewtopic.php?id=72055 , id=69257

## 5. EFF Rayhunter — https://efforg.github.io/rayhunter/supported-devices.html
Dispositivi supportati (root ottenuto dall'installer): Orbic RC400L, TP-Link M7350 (hw 1.0, 3.0, 3.2, 5.0, 5.2, 7.0, 8.0, 9.0; 4.0 con downgrade; 10.0 non funzionante),
Wingtech CT2MHS01, T-Mobile TMOHS1, TP-Link M7310, TP-Link M7200, PinePhone/Pro, FY UZ801, Moxee. Requisito: modem Qualcomm con /dev/diag.
TP-Link: `./installer util tplink-shell` (shell root); dalla v4.0 usa un port trigger "rayhunter-root" per avviare telnet. Dettagli exploit: https://github.com/m0veax/rayhunter-tplink-m7350

## 6. EMBA — riferimento esplicito al firmware F1
https://github.com/e-m-b-a/emba/blob/master/modules/P02_firmware_bin_file_check.sh contiene il commento
`# e.g.: D-Link/dtlwe_r602b_04b0_4706_v1.0.0.1_190801_release_01.04.eu_.exe` (gestito come PE/Windows exe con deep extraction). Nessun modulo specifico per .dfw.
