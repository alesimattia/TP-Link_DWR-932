#!/bin/sh
# Interroga miniupnpd sul DWR-932 F1 con richieste UPnP in sola lettura (nessuna mappatura creata o cancellata).
# Da eseguire come root sul device: adb push dwr_upnp_soap_ro.sh /cache/ && adb shell sh /cache/dwr_upnp_soap_ro.sh
# La sorgente delle richieste e 192.168.0.1 (bridge0), quindi miniupnpd la considera LAN.
# Il REJECT TCP di QCMAP colpisce anche il loopback: la regola "-i lo ACCEPT" serve solo durante il test
# e viene rimossa all'uscita.

iptables -I INPUT -i lo -j ACCEPT
trap 'iptables -D INPUT -i lo -j ACCEPT' EXIT

H=192.168.0.1
P=8201
NC="busybox nc"

richiesta() {
	# $1 = testo HTTP completo; stampa la risposta del server
	printf '%b' "$1" | $NC -w 5 $H $P 2>&1
	echo
}

soap() {
	# $1 = control URL, $2 = service type, $3 = azione, $4 = argomenti XML
	corpo="<?xml version=\"1.0\"?><s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><s:Body><u:$3 xmlns:u=\"$2\">$4</u:$3></s:Body></s:Envelope>"
	lun=$(printf '%s' "$corpo" | wc -c)
	richiesta "POST $1 HTTP/1.1\r\nHost: $H:$P\r\nContent-Type: text/xml; charset=\"utf-8\"\r\nSOAPAction: \"$2#$3\"\r\nContent-Length: $lun\r\nConnection: close\r\n\r\n$corpo"
}

echo "##### busybox nc"
$NC 2>&1 | head -3

echo "##### rootDesc.xml"
richiesta "GET /rootDesc.xml HTTP/1.1\r\nHost: $H:$P\r\nConnection: close\r\n\r\n" > /cache/upnp_rootdesc.txt
cat /cache/upnp_rootdesc.txt

CTL=$(sed -n 's|.*<controlURL>\(/[^<]*IPConn[^<]*\)</controlURL>.*|\1|p' /cache/upnp_rootdesc.txt | head -1)
[ -z "$CTL" ] && CTL=/ctl/IPConn
SVC=urn:schemas-upnp-org:service:WANIPConnection:1
echo "##### control URL usato: $CTL"

echo "##### GetExternalIPAddress"
soap "$CTL" "$SVC" GetExternalIPAddress ""

echo "##### GetStatusInfo"
soap "$CTL" "$SVC" GetStatusInfo ""

echo "##### GetGenericPortMappingEntry 0"
soap "$CTL" "$SVC" GetGenericPortMappingEntry "<NewPortMappingIndex>0</NewPortMappingIndex>"

echo "##### SCPD WANIPConnection (solo nomi delle azioni)"
SCPD=$(sed -n 's|.*<SCPDURL>\(/[^<]*IPConn[^<]*\)</SCPDURL>.*|\1|p' /cache/upnp_rootdesc.txt | head -1)
[ -z "$SCPD" ] && SCPD=/WANIPCn.xml
richiesta "GET $SCPD HTTP/1.1\r\nHost: $H:$P\r\nConnection: close\r\n\r\n" | grep -o '<name>[A-Za-z]*</name>' | sort -u | tr '\n' ' '
echo
rm -f /cache/upnp_rootdesc.txt
