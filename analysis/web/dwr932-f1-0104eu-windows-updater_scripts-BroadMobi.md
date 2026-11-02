# DWR-932 rev F1 — updater Windows 01.04.EU (2019): script di flash e tool ODM (BroadMobi)

Fonte archivio: https://ftp.dlink.de/dwr/dwr-932/archive/driver_software/DWR-932_fw_revf1_104eu_EU_multi_20190801.zip (74.658.528 byte)
Entry: `DWR-932_fw_revf1_104eu_EU_multi_20190801/dtlwe_r602b_04b0_4706_v1.0.0.1_190801_release(01.04.eu).exe` (WinZip SFX, 74.567.680 byte)
Metodo (2026-10-24): HTTP Range sui primi ~6 MB dell'entry + inflate parziale; lettura statica degli header ZIP interni del SFX.
NESSUN file eseguito. Solo i file di testo sono riportati integralmente; di dl.exe solo stringhe/version-info.

## Contenuto interno SFX (header locali visti nei primi 6 MB; il resto — immagini — non verificato)
```
1key.bat  adb.exe  AdbWinApi.dll  AdbWinUsbApi.dll  back.ini  CDSwitch.ini  dl.exe  DownLoad.bat
Driver/ADB/x64/{amd64,i386}/... android_winusb.inf ...
```
(DownLoad.bat referenzia anche fastboot.exe, CDToBootloaderFor9x15.exe e le immagini sotto: presumibilmente più avanti nello SFX, NON verificato)

## Version-info di dl.exe (PE resource)
- CompanyName: **Shanghai BroadMobi Communication Co.,Ltd**
- FileDescription: Download Application; InternalName/OriginalFilename: dl.exe; FileVersion 1,1,0,0; Copyright (C) 2009
- SHA-256 (dl.exe estratto): 0bc57f41385fddcbd30ef0d2d0014ff63715fe0550eee674b4beeb74a96ba54f

## Stringhe rilevanti in dl.exe (selezione)
- Comandi AT proprietari: `AT+BMCMD`, `AT+BMCMD=REBOOT`, `AT+BMCMD=NV_RF_BACKUP`, `AT+BMCMD=NV_RF_BACKUPFILE_CHECK`, `AT+BMCMD=NV_RF_BACKUP_END`, `AT+BMFTM=0/1` (factory test mode), `AT+BMSWVER`, `AT+BMMBNVER`, `AT+BMSN`, `AT+BMIMEI` (scrittura IMEI — non usare), `at+bmclrmru`
- Porte/modi USB: `Diagnostic`, `Connect diag port`, `QDLoader`, `VID_05C6&PID_9008`, `VID_05C6&PID_900E`, `Enter download mode...`, `0:CDROM`, `0:EFS2APPS`, `0:EFS2BAK`, `0:bmdefsys`
- adb: `adb.exe devices`, `adb pull/push /lib/firmware/ath6k/AR6003/hw2.1.1/bdata.SD31.bin`, `adb push ... /etc/backup/`
- fastboot flash di: sbl, tz, rpm, aboot, modem, dsp1, dsp2, boot, system, userdata, cache, misc, recovery, recoveryfs, efs2, backup, bmdefsys, bmfs, bmlog, cdrom
- Riferimenti multi-piattaforma: `9615-cdp-usr-image.usrfs.yaffs2`, `mdm9640*cdrom.ubi`, `CDToBootloaderFor9x15.exe`

## CDSwitch.ini
```
[CDSwitch]
CDID=SD Storage USB Device
[UPDATE]
lsDownloadbackup = false
lsNewNVMechanism = true
```

## 1key.bat
```bat
@echo off
cd /d %~dp0
%~d0

cd .\Driver

@if exist "InstallDriver.exe" (
call InstallDriver.exe
)

cd..


@if exist "Driver\Common" (
call Driver\Common\InstallDriver.exe
)
set DownloadType="1QUICK"


@if %DownloadType%=="QUICK" (
@call dl.exe -quick
) else (
@call dl.exe 
) 

```

## DownLoad.bat
```bat
@echo off

cd %~dp0
%~d0

echo wait for device

set /a DeviceState=0
set /a ADBDevices=0
set /a CheckTime=0
set /a retry=0

:Retry
set /A retry=%retry%+1
set /a CheckTime=0
:CheckFastboot

::check bootloader mode or not
fastboot.exe devices |(find /i "fastboot")&&(set /a DeviceState=2)||(set /a DeviceState=1)

set /A CheckTime=%CheckTime%+1


::if it is bootloader, goto download
@if %DeviceState% equ 2 (goto :download)

::if not bootloader ,check adb device or not


if "%CheckTime%"=="10" (

@if %DeviceState% equ 0 (goto :exceptionEnd)


echo Switch CDRom..
CDToBootloaderFor9x15.exe  
@if "%retry%" == "5" (
goto :exceptionEnd
)

goto :Retry
)


echo Found bootloader or adb  %CheckTime%
ping -n 2 127.0.0.1>nul
goto :CheckFastboot
)


:download
@if exist "mdm-recovery-image-boot-mdm9625*.img" (
fastboot.exe flash recovery mdm-recovery-image-boot-mdm9625*.img
if %errorlevel% NEQ 0  (goto:exceptionEnd)
)
@if exist "msm-mdm-recovery-image-eglibc-ipk--mdm9625*.rootfs.yaffs2" (
fastboot.exe flash recoveryfs msm-mdm-recovery-image-eglibc-ipk--mdm9625*.rootfs.yaffs2
if %errorlevel% NEQ 0  (goto:exceptionEnd)
)
@if exist "mdm9625*bmdefsys.usrfs.yaffs2" (
fastboot.exe flash bmdefsys mdm9625*bmdefsys.usrfs.yaffs2
if %errorlevel% NEQ 0  (goto:exceptionEnd)
)
@if exist "mdm-perf-image-boot-mdm9625-perf.img" (
fastboot.exe flash boot mdm-perf-image-boot-mdm9625-perf.img
if %errorlevel% NEQ 0  (goto:exceptionEnd)
)
@if exist "mdm-image-boot-mdm9625.img" (
fastboot.exe flash boot mdm-image-boot-mdm9625.img
if %errorlevel% NEQ 0  (goto:exceptionEnd)
)
fastboot.exe -m 30 flash system *.rootfs.yaffs2
if %errorlevel% NEQ 0 (goto:exceptionEnd)

fastboot.exe -m 30 flash userdata mdm9625-*.usrfs.yaffs2
if %errorlevel% NEQ 0  (goto:exceptionEnd)

@if exist "cdrom.img" (
fastboot.exe -m 30 flash cdrom cdrom.img
if %errorlevel% NEQ 0  (goto:exceptionEnd)
)
fastboot.exe reboot

echo Update successfully!

ping -n 8 127.0.0.1>nul
exit 0


:reboot

adb wait-for-device

echo wait for reboot...
adb shell sys_reboot bootloader

goto :download


:exceptionEnd
adb kill-server

echo Failed to update,please try again!
pause
exit 1
```

## back.ini — sezioni [AT] e [INFO] (la sezione [NV] elenca 783 ID NV Qualcomm da salvare/ripristinare: omessa qui, primi ID 571, 4212, 4953, 4954, 24964...)
```
[AT]
RAT1=AT+BMCMD=MAC
RAT2=AT+BMCMD=SSID
RAT3=AT+BMCMD=SSIDPWD
[INFO]
MODEM_VER=R602_1.1.1_190219_led
EFS_VER=DTLWE_R602B_04B0_4706_1.0.0_190612
PC_VER=W1.0.0.2707_DTLW0_R602B
AP_VER=DTLWE_R602B_1.0.3_190801
```

## Istruzioni D-Link (PDF nello stesso zip, riassunto)
"Anleitung zur Installation des Upgrades" (DWR-932 Rev.F1, Windows 7–10): collegare il DWR-932 via USB acceso, avviare l'exe,
i file vengono estratti, si apre una finestra CMD, Enter per avviare l'upgrade, a fine procedura Enter per un altro dispositivo o Q per uscire.
Il device viene riportato ai default di fabbrica.

## Firmware F1 successivi (stesso FTP, per confronto)
- archive: `DWR-932_fw_revf1_108EU_EU_multi_20220113.zip` → `01_DTLWE_R602B_04B0_4706_V1.0.1.3_middleFW.dfw` + `02_DTLWE_R602B_04B0_4706_v1.0.1.5 (01.08.EU).dfw`
  (PDF: upgrade in DUE passi via Web UI System > Firmware Upgrade: prima la "Middle-Firmware", poi la definitiva)
- current: `DWR-932_fw_revf1_111EU_EU_multi_20240802.zip` → `encrypt_DTLWE_R602B_04B0_4706_V1.0.2.1.dfw`
