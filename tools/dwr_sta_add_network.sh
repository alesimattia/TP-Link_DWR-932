#!/bin/zsh
# Collega il client Wi-Fi del DWR-932 (wlan0-vxd, modalità AP-STA) a una rete WPA/WPA2-PSK esistente.
# Va lanciato dall'utente: chiede SSID e password (nascosta), che non compaiono in output né nei log.
# Percorso: Mac -> PC Windows (scp, file temporaneo cancellato subito) -> adb push sul DWR -> dwr_sta_apply.sh.
# L'esito (solo stato, nessuna chiave) va anche in analysis/notes/device-sta-connect.txt.
# Uso dalla root del progetto: zsh tools/dwr_sta_add_network.sh [ip_pc]
set -eu

PC=${1:-192.168.1.150}
KEY=~/.ssh/castel-di-lama-win_key
SSHO=(-o BatchMode=yes -o ConnectTimeout=12 -o IdentitiesOnly=yes -i $KEY)
OUT=analysis/notes/device-sta-connect.txt

read "SSID?SSID della rete a monte [H3140]: "
SSID=${SSID:-H3140}
read -rs "PSK?Password Wi-Fi (non viene mostrata): "
echo
if (( ${#PSK} < 8 || ${#PSK} > 63 )); then
	echo "password non valida: servono da 8 a 63 caratteri"
	exit 1
fi

TMP=$(mktemp)
chmod 600 $TMP
trap 'rm -f $TMP' EXIT
# SSID in esadecimale: nessun problema con apostrofi, & o virgolette nel nome
HEX=$(printf '%s' "$SSID" | xxd -p | tr -d '\n')
printf 'network={\n\tssid=%s\n\tpsk="%s"\n\tkey_mgmt=WPA-PSK\n\tscan_ssid=1\n}\n' "$HEX" "$PSK" > $TMP
unset PSK

scp -q $SSHO $TMP User@$PC:dwr/sta_net.tmp 2>/dev/null
ssh $SSHO User@$PC "cd %USERPROFILE%\\dwr && adb.exe push sta_net.tmp /cache/sta_net.tmp >nul 2>&1 & del /q sta_net.tmp & adb.exe shell sh /cache/dwr_sta_apply.sh" 2>&1 \
	| grep -v -i -E 'post-quantum|upgraded|vulnerable|daemon' | tee $OUT
echo "esito salvato in $OUT"
