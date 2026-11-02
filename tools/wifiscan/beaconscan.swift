// Scansione Wi-Fi via CoreWLAN: per ogni rete a 2,4 GHz stampa beacon interval e, se negli IE c'è il TIM, il periodo DTIM.
// Uso: beaconscan [canale]   (SSID/BSSID possono essere oscurati senza permesso di localizzazione)
// Il TIM compare solo se CoreWLAN conserva gli IE di un beacon (nelle probe response non c'è): "dtim=-" significa IE assente.
import CoreWLAN
import Foundation

func dtimDaIE(_ dati: Data?) -> String {
    guard let d = dati else { return "-" }
    let b = [UInt8](d)
    var i = 0
    while i + 2 <= b.count {
        let id = b[i], len = Int(b[i + 1])
        if i + 2 + len > b.count { break }
        if id == 5 && len >= 2 { return "\(b[i + 3]) (count \(b[i + 2]))" }
        i += 2 + len
    }
    return "-"
}

let filtro = CommandLine.arguments.count > 1 ? Int(CommandLine.arguments[1]) : nil
guard let iface = CWWiFiClient.shared().interface() else { print("nessuna interfaccia Wi-Fi"); exit(1) }
do {
    let reti = try iface.scanForNetworks(withSSID: nil)
    for r in reti.sorted(by: { $0.rssiValue > $1.rssiValue }) {
        guard let ch = r.wlanChannel, ch.channelBand == .band2GHz else { continue }
        if let f = filtro, ch.channelNumber != f { continue }
        let ie = r.informationElementData?.count ?? 0
        print("ch=\(ch.channelNumber) rssi=\(r.rssiValue) beacon=\(r.beaconInterval) dtim=\(dtimDaIE(r.informationElementData)) ie=\(ie)B ssid=\(r.ssid ?? "<oscurato>") bssid=\(r.bssid ?? "<oscurato>")")
    }
} catch { print("scan fallita: \(error)"); exit(2) }
