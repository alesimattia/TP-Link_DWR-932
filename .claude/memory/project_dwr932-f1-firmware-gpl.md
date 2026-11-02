---
name: dwr932-f1-firmware-gpl
description: DWR-932 F1 - ODM BroadMobi, formato .dfw, contenuto firmware (01.04 in chiaro, 01.11 cifrato), kernel 3.4/DTB (Wi-Fi AR6003), vie root/custom-fw verificate (aboot fastboot, web UI debug_fcgi), verdetto OpenWrt
metadata:
  type: project
---

Device → [[dwr932-f1-device]]. Sicurezza/CVE → [[dwr932-security-revisions]].

ODM = Shanghai BroadMobi Communication Technology Co., Ltd (copyright header GPL + CompanyName dl.exe). Spiega prefissi bm/bmt/BM.
- Board R602B = DWR-932 F1 + DWR-932C RU. (R705B = DWR-932 E1 + DWR-932C rev E delle CVE 2021.)
- Project BMT_PRJ_DTLWP_R602B. Feature attive (bmtfeatures.h): PID_SWITCH_CTRL (composizione USB dipende da OS host), MAC_ENUM_ECM, DIAGCMD_REBOOT_FASTBOOT (DIAG→fastboot), WEB_UPDATE_CTRL, DIFF_FOTA_UPDATE_CTRL, MULTI_FLASH_CTRL (MCP NAND multipli), CHARGE_CTRL, SD_CTRL, STK. Disattive: HAS_OLED (ma driver spi-oled presente), WIFI_5G, WIFI_GUEST_AP, SAMBA.

HARDWARE (da DTB msm9625-v2.1-mtp, .dts in analysis/notes/)
- SoC Qualcomm MDM9625V2.1 (Cortex-A7 + Hexagon modem). Wi-Fi: DTB e mobileap_cfg dicono AR6003 ma il device reale 01.11 carica il driver Realtek RTL8192ES SDIO (rtl8192es.ko, 2.4 GHz 1x1 11n); l'AR6003 nel DT è un residuo. Dettagli driver/iwpriv → [[dwr932-f1-hidden-features]]. NAND qcom,msm-nand (QPIC). UART console serial@f991f000 (ttyHSL0, 115200) su pad interni. Display OLED SPI (spi-oled). Charger Awinic AW3215. GPIO key WPS. android_usb cdrom=1.

FORMATO .dfw (tools/dfw_inspect.py; container SENZA firma crittografica → autenticità solo via password ZIP + controlli ignoti updater/aboot)
- Intero file XOR 0x92. Header LE: magic 0x12344321 0x89abcdef, ver=1, hdr[3]=dim immagine decompressa, hdr[4]=0x2a988638 (check 32-bit, funzione non identificata), count partizioni, 1.
- Tabella @0x1c, entry 44B: name[32], f1=offset nell'immagine decompressa, f2=usz, f3=len nel file. Dati @0x258 contigui, nessuna coda.
- Ogni partizione = 1 ZIP ZipCrypto+deflate (local CRC in chiaro, usabile per riconoscere immagini). Creati su Windows. Password ZIP ignota MA non è più il blocco: immagini in chiaro disponibili dall'updater .exe 01.04 e, per 01.11, dumpabili dal device dopo root.

BACKUP PARTIZIONI 01.11 DAL DEVICE (2026-10-24/25, root adb) → ./backup/ (20 di 22 part, MD5SUMS.txt, README.md). Integrità verificata su partizioni statiche (md5 device==file). Saltate mtd1 mibib e mtd2 efs2 (lettura raw blocca il NAND). FS montati (system/bmdefsys/userdata/cache) = snapshot puntuale (md5 deriva nel tempo, size costante). Dettagli dump → [[dwr932-f1-rootaccess]].
- I dump yaffs2 (mtd16/19/20/21) sono letture /dev/mtdN SENZA OOB (pagine 2048 B, niente tag) → tools/yaffs2_extract.py NON va bene. File scritti a runtime sono FRAMMENTATI e interlacciati (header yaffs anche riscritti lontano dai dati) → tools/yaffs2_nooob_extract.py (header + pagine seguenti) è affidabile SOLO per file piccoli/contigui; esito "ok" non garantisce (libqcmap_cm era falso ok).
- Metodo validato per ricostruire binari 01.11 (2026-11-02): (1) tools/page_coverage.py <dump> <file_ref> → se 100% pagine trovate il file 01.11 è identico al riferimento (calibrato: qcmap_fcgi pull esatto 235/235); (2) header ELF in pagina con e_shoff+shnum*40 == size dell'header yaffs; (3) tools/yaffs_ref_align.py <dump> <stesso binario 01.04> → catena monotona pagina→offset (passo ~0x800) = ordine dei frammenti; (4) tools/elf_carve_validate.py <dump> <out> <size> <tratti> <rif> → BL verso prologhi (~96% baseline) + puntatori .rodata a inizio stringa (~99%) per tratto. Ricostruiti: QCMAP_ConnectionManager e libqcmap_cm.so.1 in analysis/backup-extract-0111/bmdefsys/ (vedi [[dwr932-f1-hidden-features]]). Mappe allineamento in analysis/notes/*_align.txt.

FIRMWARE 01.11EU encrypt_DTLWE_R602B_04B0_4706_V1.0.2.1.dfw (device utente; in analysis/fw-extract/). Partizioni + CRC local (per match con immagini in chiaro):
- boot mdm-perf-image-boot-mdm9625-perf.img usz 3999744 CRC 934d2c04
- system ...rootfs.yaffs2 usz 15400704 CRC dfb83c42
- userdata ...usr-image.usrfs.yaffs2 usz 27077952 CRC 7b095a1c
- qdsp qdsp6sw.mbn (modem) usz 41658091 CRC 4feacd33 — mtime 2019-02-19 (modem invariato dal 2019)
- bmdefsys ...bmdefsys.usrfs.yaffs2 usz 10433280 CRC 378e64c6 (web UI). Partizioni non-modem mtime 2024-06-28.
- Niente sbl/aboot/tz/rpm nel .dfw → bootloader NON aggiornato dagli update .dfw.
- 01.11 rootfs cifrato: NON ispezionato direttamente. Per contenuto reale 01.11 serve dump dal device.

FIRMWARE 01.04EU IN CHIARO (updater ufficiale DWR-932_fw_revf1_104eu_EU_multi_20190801.zip nella root progetto; .exe estratto in analysis/fw0104-extract/, immagini in exe/image/, rootfs estratti con tools/yaffs2_extract.py in rootfs/ usrfs/ bmdefsys/). Base F1 reale; device utente è 01.11, da cui possono differire i fix.
- build.prop LNX.LE.4.1-41009-9x35 (Qualcomm LE 4.1). busybox ARM statico (telnetd incluso), adbd /sbin/adbd. init SysV, inittab runlevel 5, getty su ttyHSL0. passwd: root shell /bin/sh (hash non estratto, policy).
- USB /etc/bm_pvid.config "2001,7e41,1". Composizione 7e41 (usrfs/bin/usb/compositions/) sceglie per OS: Windows→rndis+mass_storage, Mac→ecm_qc+mass_storage (spiega ECM inerte + nessun adb/diag su Mac). Composizioni che espongono adb+diag+serial: 9025 e 2034. /etc/backup/bmftm (factory mode) cambia ramo.
- boot.img cmdline root=/dev/mtdblock20 rootfstype=yaffs2 console=ttyHSL0,115200; recovery=mtdblock16. NESSUNA firma appesa al boot.img (tools/mbn_inspect.py).

MECCANISMO AGGIORNAMENTO (da binari 01.11 pullati in analysis/device-pull-0111/ con root; vedi [[dwr932-f1-rootaccess]])
- Upgrade MANUALE web = qcmap_fcgi: fcgi_api_do_upgrade / fcgi_api_do_zip_fw_upgrade. Controlla magic1/magic2/version; se fallisce "try encryption process" → de-XOR 0x92. Poi per ogni partizione: `/usr/bin/funzip -<PASSWORD> /cache/upgrade.zip > /cache/upgrade.bin` → decifra ZipCrypto. La PASSWORD ZIP è incorporata in qcmap_fcgi (recuperabile con strings/debug; NON estratta in chiaro per policy org). NESSUNA verifica di firma crittografica nel percorso .dfw → autenticità solo = XOR 0x92 (banale) + password ZIP (nel binario). Config restore usa `unzip` semplice in /etc/backup.
- Upgrade FOTA/server = bm_fota: scarica versione, verifica md5 (remote_cfg.zip_md5), scrive /cache/update.zip, `echo --update_package=/cache/update.zip > /cache/recovery/command` + reboot recovery. fota_type 0=dlink,1=diff.
- → Custom FW FATTIBILE: (a) craftare .dfw con la password da qcmap_fcgi e usare upgrade web (nessuna firma); (b) più pulito, con root: fastboot flash immagini modificate, o scrivere direttamente le partizioni MTD (rootfs montato rw). Resta da confermare secure-boot/fuse per boot.img non firmato.

VIE ROOT / CUSTOM FW (verificate sul 01.04; ROOT 01.11 OTTENUTO — endpoint web debug senza auth, vedi [[dwr932-f1-rootaccess]])
- Web UI (lighttpd bmdefsys): NESSUN auth.require attivo → CGI senza autenticazione. debug_fcgi mappato su /debug_post_set.cgi, /debug_login.cgi, /debug_at_info.cgi, ecc. Chiama via system() `sh debug_mode.sh adbd_enable|telnetd_enable|diag_usb_port_enable|diag_debug_server_send_at <postData>`. = CVE-2021-42783 (no auth) + CVE-2021-42784 (AT/command injection via postData→/dev/smd7), presenti nel ramo F1/BroadMobi. → shell root o adb/telnet senza credenziali.
- FASTBOOT/aboot 01.11 VERIFICATO SUL DEVICE (2026-10-25): `adb reboot bootloader` → `fastboot devices` OK (d2fd18441c14). `getvar all` NON implementato (vuoto); getvar secure/unlocked/version-bootloader vuoti; product=MDM9625; partition-type:system=ext4 (report errato LK, è yaffs2). `oem device-info` → **Device unlocked: false, tampered: false** = bootloader LOCKED. `fastboot reboot` riporta all'OS, adb root ritorna.
- SECURE BOOT: LK (mtd9 in ./backup) HA codice di autenticazione ("Authenticating boot image start/done return=%d", "ERROR: Cannot read boot image signature", "bootimage: incomplete or not signed", `use_signed_kernel/is_unlocked/is_tampered`, `oem unlock`). Enforcement reale = fuse QFPROM, NON leggibile via getvar. NON testati unsigned-boot (rischio power-cycle) né `oem unlock` (cancella userdata). Indizio: M7350 stesso SoC/LK → fuse NON blown, unsigned boot OK dopo unlock; PROBABILE anche su F1 ma NON verificato.
- NB: la via custom-fw via WEB .dfw NON tocca lock/secure-boot (nessuna firma) → fattibile a prescindere dal fuse. Il lock conta solo per flashare kernel/immagini modificate via fastboot (servirebbe `oem unlock` distruttivo + fuse non blown).
- Ingresso a fastboot: `adb reboot bootloader` (verificato); alt: CDToBootloaderFor9x15.exe (SCSI al CD-ROM), dload. UART ttyHSL0 su pad = console/sulogin.

VERDETTO OpenWrt / custom fw (pagine in analysis/web/)
- OpenWrt/postmarketOS/Debian su MDM9625: NESSUN port esistente; MDM9625 assente da mainline (c'è solo MDM9615). Port nativo = progetto di ricerca (DT/clk/NAND/SMD/BAM-DMUX/remoteproc modem/AR6003 + userspace QMI proprietario); kernel 3.4 incompatibile con OpenWrt moderno. NON realistico.
- Realistico: (1) root sul firmware stock (web debug_fcgi, o fastboot/UART) → opkg, iptables TTL, moduli; (2) "custom fw" = immagini stock modificate riflashate via fastboot; (3) DWR come solo uplink per router OpenWrt esterno.
- Kernel 3.4: TUN/PPP/L2TP/KEXEC non abilitati (no OpenVPN/WireGuard di serie); IP_NF_TARGET_TTL + XT_TARGET_HL sì (mangle TTL/HL per tethering). MODULES=y, MODVERSIONS off → .ko out-of-tree caricabili se vermagic "3.4.0+ preempt mod_unload ARMv7" combacia (serve sorgente kernel CAF msm-3.4, NON nel GPL). Hardening debole (no SELinux, DEVMEM/DEVKMEM, no stack protector).

GPL gpl/DWR-932_sw_revf1_GPLcode.tar.gz (= fw 01.04; indice analysis/notes/gpl_list.txt): contiene SOLO sysroots di build (header, .o, lib, kernel compilato) + attr/led_ctl/sqlite/zlib. NIENTE sorgenti .c kernel, ricette o immagini deploy → incompleto. Tool host utili: mkbootimg, dtbtool, mkyaffs2image, toolchain arm gcc 4.6.3.

TOOL (./tools): dfw_inspect.py, dfw_crc_check.py, mbn_inspect.py, yaffs2_extract.py (+ zipcd_list/partial_inflate/zip_extract_entry da agent). Estrarre dal GPL solo path mirati con `tar -xzf gpl/… -C analysis/gpl-extract <path>`; dati non fidati → python3 -I, script solo in ./tools.
