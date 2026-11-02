# TP-Link M7350 (v3 = MDM9625) — note della community m0veax/tplink_m7350

Fonti:
- https://github.com/m0veax/tplink_m7350 (README.md)
- https://github.com/m0veax/tplink_m7350/blob/main/firmware_research/README.md
- https://github.com/m0veax/tplink_m7350/blob/main/README-v3.md
- https://github.com/m0veax/tplink_m7350/blob/main/assets/4pda/README.md
Scaricato: 2026-10-24 via GitHub API. Contenuto copiato senza modifiche salvo REDAZIONE di credenziali
(hash/password root e credenziali web di default sono state rimosse: la fonte originale le riporta nella sezione ./system/etc/{passwd-,shadow} e ./system/etc/lighttpd.user).
Rilevanza: stesso SoC (MDM9625), stesso stack Qualcomm LE/OE kernel 3.4.0, rootfs YAFFS2, LK aboot/fastboot.

---

## README.md (root del repo)

# TP-Link M7350

The [TP-Link M7350](http://www.tp-link.de/products/details/cat-5032_M7350.html)
is a series of portable 4G routers roughly equivalent to the Orbic RC400L as
found in the US and also used for the [Rayhunter project](
https://efforg.github.io/rayhunter/supported-devices.html).

## Device infos

The devices are generally based on Qualcomm SoCs.

There are multiple hardware revisions. We have taken them apart and added
photos, notes on specific parts and possible hardware modification:

- [M7350 v2](README-v2.md)
- [M7350 v3](README-v3.md)
- [M7350 v4](README-v4.md)
- [M7350 v5](README-v5.md)
- [M7350 v6](README-v6.md)
- [M7350 v8](README-v8.md)
- [M7350 v9](README-v9.md)

## OEM support

Note that the sources are a bit messy. For example, we have found the display
driver for earlier devices to be in the v2 and v4 tarballs, but not in v3.

- <https://www.tp-link.com/en/support/download/m7350/>
- <https://archive.org/download/tp-link-gpl-source/LTE/M7350/>

## Community

Join our [Matrix Channel](https://matrix.to/#/#tplink_rayhunter:chaospott.de)

## Related projects

- [Rayhunter repository](https://github.com/EFForg/rayhunter)
    - [porting to the M7350](https://github.com/m0veax/rayhunter-tplink-m7350) (obsolete)
- [femto8](https://github.com/untitaker/femto8/tree/framebuffer) - femto8 is an open-source reimplementation of the PICO-8 fantasy console adapted for the TP-Link M7350

## TOC

- [Device Infos](#device-infos)
- [OEM support](#oem-support)
- [TOC](#toc)
- [Notes](#notes)
    - [fastboot](#fastboot)
    - [mount SD card](#sdcard)
    - [Firmware](#firmware)
        - [`./system/etc/{passwd-,shadow}`](#systemetcpasswd-shadow)
        - [`./system/etc/lighttpd.user`](#systemetclighttpduser)
        - [`./system/sbin`](#systemsbin)
        - [`./META-INF/com/google/android/updater-script`](#meta-infcomgoogleandroidupdater-script)
        - [Webinterface RCE to start telnet](#telnet)
    - [.dtb files](#dtb-files)
    - [Testpoint and Bootpoint PBL](#testpoint-and-bootpoint-pbl)
    - [Backup methods](#backup-methods)
    - [Start adbd](#start-adbd)
    - [Stop adbd](#stop-adbd)
- [TODO](#todo)
- [Weblinks](#weblinks)
    - [OpenWRT discussions](#openwrt-discussions)
    - [4pda](#4pda)

## Notes

Qualcomm has different kinds of chips:

- MDM is [_Mobile Data Modem_](https://www.qualcomm.com/news/releases/2011/02/qualcomm-delivers-faster-mobile-broadband-experience-new-higher-speed-lte)
- MSM is [_Mobile Station Modem_](https://www.qualcomm.com/news/releases/1997/03/qualcomm-announces-next-generation-mobile-station-modem)
- APQ is [_Application Processor_](https://www.qualcomm.com/products/technology/processors/application-processors/apq8053) 

See also <https://www.qualcomm.com/products/technology/processors> and
<https://www.ntia.gov/files/ntia/qc_comments_on_firstnet_noi.pdf>.

The chips on the portable routers as described here are mostly MDMs.
They are powerful enough for small applications.

## Kernel

Based on the [official Linux kernel sources](https://kernel.org/) and with
vendor code `rsync`ed over, we are working on getting them to build in 2025.

<https://github.com/m0veax/tplink_m7350-kernel>

A config from a real v3 device: [`kernel/config`](kernel/config)

## fastboot

If you remove the battery and plugin USB, `lsusb` briefly shows:

```
Bus 001 Device 031: ID 18d1:d00d Google Inc. Xiaomi Mi/Redmi 2 (fastboot)
```

Then `fastboot devices` gets:

```
MDM9625	fastboot
```

The device disappears after a few seconds.

If you boot normally, it shows:

```
Bus 001 Device 032: ID 2357:0005 TP-Link M7350 4G Mi-Fi Router
```

To enter fastboot permanently (until reset), run `fastboot reboot bootloader`.

An easier way to enter fastboot is to get a telnet root shell, and then:
```
/ # reboot-bootloader
```

Qualcomm [documents their fastboot commands](
https://docs.qualcomm.com/bundle/publicresource/topics/80-70014-4/fastboot.html).

The following `getvar` commands yield results:

| variable            | result           |
| ------------------- | ---------------- |
| `version`           | `0.5`            |
| `kernel`            | `lk`             |
| `max-download-size` | `0x2f00000`      |
| `product`           | `MDM9625`        |
| `serialno`          | `MDM9625`        |

You can use `fastboot` to [run a custom kernel](firmware_research/README.md).

On the v2 revision, a fastboot device briefly appears on normal boot, without 
removing the battery.

## sdcard

An SD card with the stock system needs to be FAT32 formatted:

```sh
sudo mkfs.vfat -F 32 /dev/mmcblk0
```

Afterwards, via `adb shell`, run `mount /dev/mmcblk0p1 /mnt/` on the device, and
you can access the SD card at `/mnt/` now.

Bonus:

```
> usb_composition 
> 902B
```

Your SD Card will be served as usb device afterwards

## Firmware

The main system seems to be based on Android, however without `/dev/binder`.

We have extracted the root file system for a better understanding.

See [more detailed notes on the firmware](firmware_research/README.md) from
further research regarding other partitions.

### `./system/etc/{passwd-,shadow}`

```
```

A quick search for the hash gives us [REDATTO] as a possible value.
We have confirmed this to be the password.

Source: https://svson.xyz/posts/zte-dongle/part4/

### `./system/etc/lighttpd.user`

```
```

### `./system/sbin`

The firmware contains an `adbd`. [ADB access](#start-adbd) can be obtained
permanently.

It also contains a few `reboot` scripts: `reboot-recovery` and `reboot-bootloader`:

```
/ # cat /sbin/reboot-recovery
#! /bin/sh

echo 2 > /etc/reboot-cookie
reboot
/ # cat /sbin/reboot-bootloader
#! /bin/sh

echo 1 > /etc/reboot-cookie
reboot
```

### `./META-INF/com/google/android/updater-script`

This contains paths to files and creates symlinks for autostart etc.

### telnet

In the linked 4pda forum thread is a PoC for a Remote Code Execution (RCE)
vulnerability which allows to start the telnet daemon. There are only Windows
scripts linked right now. We have developed our own tools thusly.

More about this [here](webinterface_rce_telnet/README.md)

We implemented a [Rust command line tool](tp-opener/README.md) and a
[curl based shell script](open.sh). The latter performs the login automaticly.

There is a [Ruby implementation](https://github.com/ecdsa521/tpown/tree/main](
https://github.com/ecdsa521/tpown/tree/main) as well.

### .dtb files

The .dtb files of HW rev v3 and v4 are stored in [dtb_files](dtb_files/) and can be visualized with [dtvis](https://github.com/platform-system-interface/dtvis/)

### Testpoint and Bootpoint PBL

There are [photos on 4PDA from other variants of the same general board design](
assets/4pda/README.md). They are similar for our device.

### Backup methods

4PDA has found [several ways to backup the installed firmware](
https://4pda.to/forum/index.php?showtopic=669936&view=findpost&p=110738476).

### Start adbd

Via [telnet](#telnet), run the `usb_composition` command on the device as follows:

```sh
usb_composition
902B
nyy
```

Persistent `adbd` connection should be etablished now.

Now via a USB cable on your laptop, `adb shell` will get you a shell.

### Stop adbd

After a reboot, the access point seems to be down.
To deactivate `adbd` again:

```
adb shell
usb_composition
tplink
nyy
```

## TODO

- [ ] Compare Kernel 3.4.0 with TP Link Sources
- [ ] Find Qualcomm debug stuff online
- [x] implement script to start telnet based on the vuln quoted in the 4pda forum
- [ ] Explore Android / iOS App to find hidden Endpoints
- [ ] Can we do Stuff with the ISP Files from the Download Section?
- [ ] Try to get OpenWRT running on the Device
- [x] Find a way to start `adbd`
- [x] Link v3 Firmware instead of v4
- [ ] Test Tailscale project (from related projects) on other Hardware Revisions

## Weblinks

### Related Projects

- [alceawisteria/DeviceHacking](https://codeberg.org/alceawisteria/DeviceHacking/src/branch/main/routers/TPLink_M7350) awesome scripts collection related to TPLink-M7350
- [MHSEA/Rayhunter-Tailscale-Telegram](https://github.com/MHSEA/Rayhunter-Tailscale-Telegram) run tailscale on the TPLink-M7350 (v9 tested only)

### OpenWRT discussions

- <http://forum.archive.openwrt.org/viewtopic.php?id=72055>
- <http://forum.archive.openwrt.org/viewtopic.php?id=69257>
- <https://forum.openwrt.org/t/add-support-for-tp-link-m7350-v4/132119>

### 4pda

- <https://4pda-to.translate.goog/forum/index.php?showtopic=669936&st=100&_x_tr_sl=auto&_x_tr_tl=de&_x_tr_hl=de&_x_tr_pto=wapp#entry95895999> (translated)
- <https://4pda.to/forum/index.php?showtopic=669936&st=100#entry95895999> (Russian)

---

## firmware_research/README.md

# firmware

The firmware resides in a NAND flash and is split into various parts.
The exact boot flow is unclear. Notes on other Qualcomm platforms are in the
[Postmarket OS wiki](https://wiki.postmarketos.org/wiki/Category:Qualcomm).

For some details on boot security, look at this [talk from BlackHat USA 2019](
https://i.blackhat.com/USA-19/Thursday/us-19-Pi-Exploiting-Qualcomm-WLAN-And-Modem-Over-The-Air.pdf).

## partition table

Given the [MIBIB](https://boxmatrix.info/wiki/Property:MIBIB), we can learn a
bit more, using information encoded in the [coreboot project's Qualcoom tool](
https://github.com/coreboot/coreboot/blob/master/util/qualcomm/mbn_tools.py).

The partition table partially looks like the one in Yuriy Serdyuk and Alexey
Kondikov's [presentation from HITB 2023](
https://conference.hitb.org/hitbsecconf2023hkt/materials/D1T1%20-%20FrankeNAND%20%E2%80%93%20Extracting%20Info%20From%20Automotive%20Internet%20Units%20-%20Alexey%20Kondikov.pdf).

A few partitions are named as per the [Android architecture specification](
https://source.android.com/docs/core/architecture/partitions).

| #  | start        | end          | name         | meaning                   |
| -- | ------------ | ------------ | ------------ | ------------------------- |
|  0 | `0x00000000` | `0x00140000` | `sbl`        | Secondary Boot Loader     |
|  1 | `0x00140000` | `0x00280000` | `mibib`      | Multi Image Boot Info Blk |
|  2 | `0x00280000` | `0x00d80000` | `efs2`       | RAM file system           |
|  3 | `0x00d80000` | `0x010e0000` | `sdi`        | Secure Debug Image        |
|  4 | `0x010e0000` | `0x01440000` | `tz`         | Arm TrustZone firmware    |
|  5 | `0x01440000` | `0x01500000` | `mba`        | Modem Boot Authenticator  |
|  6 | `0x01500000` | `0x01860000` | `rpm`        | Resource Power Manager FW |
|  7 | `0x01860000` | `0x04b20000` | `qdsp`       | Qualcomm DSP firmware     |
|  8 | `0x04b20000` | `0x04b60000` | `pad`        | Padding, empty (`ffff`)   |
|  9 | `0x04b60000` | `0x04c40000` | `appsbl`     | Applications Bootloader   |
| 10 | `0x04c40000` | `0x05680000` | `apps`       | Android image, kernel etc |
| 11 | `0x05680000` | `0x056c0000` | `scrub`      | empty (all `ffff`)        |
| 12 | `0x056c0000` | `0x09820000` | `cache`      | Android cache (?)         |
| 13 | `0x09820000` | `0x09c80000` | `misc`       | Android misc (?)          |
| 14 | `0x09c80000` | `0x0a6e0000` | `recovery`   | U-Boot derivative (?)     |
| 15 | `0x0a6e0000` | `0x0a840000` | `fota`       | Firmware Over The Air Upd |
| 16 | `0x0a840000` | `0x0a880000` | `recoveryfs` | empty (all `ffff`)        |
| 17 | `0x0a880000` | `0x0cd20000` | `system`     | Linux rootfs with `/boot` |
| 18 | `0x0cd20000` | `0x10000000` | `userdata`   | user data, settings etc   |

Some partitions can be dumped via `adb pull /dev/mtd${PART_NO}ro`.
Partitins 1-7 fail, unfortunately, causing a reset. The firmware probably sets
up read protection on those ranges for security/obscurity reasons.

## boot flow

Qualcomm document a flow that can be roughly mapped to the above partitions:
https://www.qualcomm.com/news/onq/2017/01/secure-boot-and-image-authentication-mobile-tech

Roughly: `mask ROM --> SBL --> Applications Bootloader --> OS`

The applications boot loader is apparently a derivative of Little Kernel (lk).
See https://github.com/littlekernel/lk/blob/7538a6df673de6b73221fdbd1045928615673413/top/main.c#L84
Those strings also appear in partition 9, `"welcome to lk"`, `"bootstrap2"`,
and some others. This is where `fastboot` is implemented and loads the kernel
as an Android image. Partition 10 holds such a kernel image, and it has the
cmdline in it that we also see in-system, except for the additional trailing
`androidboot.serialno=MDM9625 androidboot.baseband=msm`.
To compare, run: `adb shell "cat /proc/cmdline"`.

See also:
https://web.archive.org/web/20160402060151/https://developer.qualcomm.com/qfile/28821/lm80-p0436-1_little_kernel_boot_loader_overview.pdf

## Custom kernel

From Qualcomm's LK boot loader docs, we learn that `fastboot oem unlock` allows
us to run `fastboot boot`. This works; see also `fastboot oem device-info`.

Using a hex editor, we can modify the cmdline at the top of partition 10.
For a simple test, change `ttyHSL0` into `ttyHSL1`. It won't matter for us.
Then boot it: `fastboot boot mtd10ro`
And lo and behold, you will now see `ttyHSL1` in the cmdline. :tada:

## Boot image

`binwalk mtd10ro`

```
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Android bootimg, kernel size: 3564792 bytes, kernel addr: 0x308000, ramdisk size: 0 bytes, ramdisk addr: 0x308000, product name: ""
2048          0x800           Linux kernel ARM boot executable zImage (little-endian)
18403         0x47E3          gzip compressed data, maximum compression, from Unix, last modified: 1970-01-01 00:00:00 (null date)
3567616       0x367000        Qualcomm device tree container, version: 1, DTB entries: 55
3569664       0x367800        Flattened device tree, size: 49302 bytes, version: 17
3620864       0x374000        Flattened device tree, size: 49218 bytes, version: 17
3672064       0x380800        Flattened device tree, size: 49088 bytes, version: 17
3721216       0x38C800        Flattened device tree, size: 48730 bytes, version: 17
3770368       0x398800        Flattened device tree, size: 49193 bytes, version: 17
3821568       0x3A5000        Flattened device tree, size: 48516 bytes, version: 17
3870720       0x3B1000        Flattened device tree, size: 47693 bytes, version: 17
```

---

## README-v3.md (estratto: componenti, mainline, sorgenti OEM, build kernel, EDL)

# TP-Link M7350 v3

## Components

- SoC: Qualcomm MSM 9625 (Flattened Device Tree)
- Model: Qualcomm MSM 9625V2.1 MTP
- Flash: 2Gbit (256MB) [Winbond W71NW20GF3FW](https://www.winbond.com/hq/product/code-storage-flash-memory/nand-based-mcp/index.html?__locale=en&partNo=W71NW20GF3FW)
- Mobile wireless: [Skyworks SKY77629](https://www.skyworksinc.com/Products/Amplifiers/SKY77629)

Note: The SoC is part of the [Qualcomm MDM9x25 family](
https://www.qualcomm.com/products/technology/modems/snapdragon-modems-4g-lte-x5).
They were [announced in 2012](
https://www.qualcomm.com/news/releases/2012/02/qualcomm-third-generation-lte-chipsets-are-first-support-hspa-release-10).

It is confusing why the chip is sometimes called MDM and sometimes MSM.
The package itself reads MDM.

And it has also been [used by Apple](https://theapplewiki.com/wiki/MDM9625).

## Mainline Linux

There is no mainline support as of 2025-08-18, but for the MDM9615. It may be
similar enough.

## OEM sources

Note: The display is the same between v2, v3 and [v4](README-v4.md), but
**the v3 sources do not include the display driver**.

The [display](#display) driver is in `apps_proc/kernel/drivers/oled/`.

Besides some identifiers and prints, the driver code between v2 and v4 is the
same, so you can technically take either.

However, the v2 and v3 kernels are both based on Linux 3.4.0, whereas v4 is
based on 3.18.20, so better use the sources from v2 which also contain the
device tree for the v3.

- <https://static.tp-link.com/resources/gpl/M7350v2_en_gpl.tar.gz>
- <https://static.tp-link.com/resources/gpl/M7350v3_en_gpl.tar.gz>

### Build and run the kernel

This requires the `fastboot` mechanism in the bootloader to be [unlocked](
./firmware_research/README.md#custom-kernel).

With the full vendor SDK based on OpenEmbedded and GCC 4, we were able to build
a kernel (once) that boots fine. It still differs from the image we dumped from
a real device. We are seeing a slight diff between the defconfig we dumped and
the config generated via the defconfig in the sources, indicating that they are
not exactly the same.

Using only the [kernel sources](./kernel/README.md), some necessary fixes, the
vendor defconfig and the latest Linaro GCC 4 toolchain, we have so far built a
kernel that would crash and reset.
With a reduced config and some hacks into the display driver, we confirmed that
it ran.

Note that you will need to create an Android image and include the QCDT.

The `mkbootimg` tool is part of the [Android platform system tools](
https://android.googlesource.com/platform/system/tools/mkbootimg/) and can be
found as its own package on Ubuntu based systems and others.

Use <https://github.com/rajatgupta1998/android_tools_system_dtbTool> to create
the `qcdt.bin`:

```sh
dtbTool -s 2048 -o qcdt.bin -p kernel/scripts/dtc/ kernel/arch/arm/boot/
```

```sh
QCDT=qcdt.bin
KERNEL=kernel/arch/arm/boot/Image
BOOTIMG=boot.img
PREIMG=boot_pre.img

# create Android image
mkbootimg --header_version 0 --kernel $KERNEL -o $PREIMG \
  --base 0x300000 --pagesize 2048 --tags_offset 0x6500000 \
  --cmdline " noinitrd root=/dev/mtdblock17 rw rootfstype=yaffs2 console=ttyHSL0,115200,n8 androidboot.hardware=qcom ehci-hcd.park=3 g-android.rx_trigger_enabled=1"

# concatenate with QCDT
cat $PREIMG $QCDT > $BOOTIMG

# field `unused` (dtb header version?) must be != 0
echo -en '\0001' | dd of=$IMG bs=1 seek=40 conv=notrunc

# run it
fastboot boot $BOOTIMG
```

## Photos

![top](assets/v3-top.jpg)

![bottom](assets/v3-bottom.jpg)

## EDL Mode

To gain access to EDL mode, short the test point between the SoC and the flash
part to GND when supplying power via USB with the battery detached.

Add a wire to the test point as shown here:

![v3 EDL test point and wire](assets/v3-wire-tp.jpg)

There is enough space to route it out to the battery slot for convenience.
With that in place, you just need to have the wire touch the SIM slot.

![v3 EDL wire outside](assets/v3-wire-outside.jpg)

## Display

---

## assets/4pda/README.md (testpoint EDL / bootpoint PBL, foto su 4PDA)

## Imagesources

### {testpoint,testpoint2}.jpg

![testpoint](testpoint.jpg)
![testpoint2](testpoint2.jpg)

https://4pda.to/forum/index.php?act=findpost&pid=99923985&anchor=Spoil-99923985-3

### testpoint3.jpg

![testpoint3](testpoint3.jpg)

https://4pda.to/forum/index.php?act=findpost&pid=100174631&anchor=Spoil-100174631-1

### bootpoint_pbl.png

![bootpoint_pbl.png](bootpoint_pbl.png)

https://4pda.to/forum/index.php?act=findpost&pid=101061106&anchor=Spoil-101061106-1

