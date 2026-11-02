// Scansione Wi-Fi via CoreWLAN: stampa canale, larghezza e RSSI di ogni rete a 2,4 GHz.
// Uso: wifiscan [canale]   (SSID/BSSID possono essere oscurati senza permesso di localizzazione)
import CoreWLAN
import Foundation

let filtro = CommandLine.arguments.count > 1 ? Int(CommandLine.arguments[1]) : nil
guard let iface = CWWiFiClient.shared().interface() else { print("nessuna interfaccia Wi-Fi"); exit(1) }
do {
    let reti = try iface.scanForNetworks(withSSID: nil)
    for r in reti.sorted(by: { $0.rssiValue > $1.rssiValue }) {
        guard let ch = r.wlanChannel, ch.channelBand == .band2GHz else { continue }
        if let f = filtro, ch.channelNumber != f { continue }
        let w: String
        switch ch.channelWidth { case .width20MHz: w = "20"; case .width40MHz: w = "40"; default: w = "?" }
        print("ch=\(ch.channelNumber) bw=\(w)MHz rssi=\(r.rssiValue) noise=\(r.noiseMeasurement) ssid=\(r.ssid ?? "<oscurato>")")
    }
} catch { print("scan fallita: \(error)"); exit(2) }
