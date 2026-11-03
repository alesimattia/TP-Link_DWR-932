# Lettura in SOLA LETTURA di file EFS del modem del DWR-932 tramite la porta Qualcomm DIAG (COM in test mode, PC Windows).
# Protocollo DIAG: frame HDLC (escape 0x7D, terminatore 0x7E, CRC-16/X-25 little endian), sottosistema EFS2 (0x4B 0x13).
# Comandi inviati: HELLO (0), STAT (15), GET (26, per gli item file; su questo modem risponde corto e si ripiega su
# OPEN/READ, che funziona anche sugli item file), OPEN con O_RDONLY (2), READ (4), CLOSE (3).
# Con -Nv legge item NV numerati con NV_READ (0x26), senza percorsi EFS se -Paths non è indicato.
# Nessun comando di scrittura (WRITE/PUT/UNLINK/MKDIR/NV_WRITE/...) è presente nello script.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File dwr_diag_efs_read.ps1 [-Port COM10] [-Paths p1,p2,...] [-Nv n1,n2]
param(
	[string]$Port = 'COM10',
	[string[]]$Nv = @(),
	[string[]]$Paths = @(
		'/nv/item_files/modem/lte/common/ca_disable',
		'/nv/item_files/modem/lte/common/lte_category',
		'/nv/item_files/modem/lte/rrc/cap/disable_ca_bandwidth_combo',
		'/nv/item_files/modem/lte/rrc/cap/disable_ca_intra_band_validation',
		'/nv/item_files/modem/mmode/lte_bandpref',
		'/nv/item_files/conf/lte_rrc.conf'
	)
)
$ErrorActionPreference = 'Stop'
# con -File i percorsi arrivano come un'unica stringa separata da virgole
$Paths = @($Paths | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
$Nv = @($Nv | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
if ($Nv.Count -gt 0 -and -not $PSBoundParameters.ContainsKey('Paths')) { $Paths = @() }

function Crc16([byte[]]$d) {
	$c = 0xFFFF
	foreach ($b in $d) {
		$c = $c -bxor $b
		for ($i = 0; $i -lt 8; $i++) { if ($c -band 1) { $c = ($c -shr 1) -bxor 0x8408 } else { $c = $c -shr 1 } }
	}
	return ($c -bxor 0xFFFF) -band 0xFFFF
}

function Encode([byte[]]$p) {
	$crc = Crc16 $p
	$raw = New-Object System.Collections.Generic.List[byte]
	$raw.AddRange($p); $raw.Add([byte]($crc -band 0xFF)); $raw.Add([byte](($crc -shr 8) -band 0xFF))
	$o = New-Object System.Collections.Generic.List[byte]
	foreach ($b in $raw) { if ($b -eq 0x7E -or $b -eq 0x7D) { $o.Add(0x7D); $o.Add([byte]($b -bxor 0x20)) } else { $o.Add($b) } }
	$o.Add(0x7E)
	return ,$o.ToArray()
}

function U32([int64]$v) { return [BitConverter]::GetBytes([uint32]($v -band 4294967295)) }
function Hdr([int]$cmd) { return [byte[]](0x4B, 0x13, ($cmd -band 0xFF), (($cmd -shr 8) -band 0xFF)) }
function PathBytes([string]$p) { return [Text.Encoding]::ASCII.GetBytes($p + [char]0) }
function Hex([byte[]]$b) { if ($null -eq $b -or $b.Length -eq 0) { return '' }; return ($b | ForEach-Object { $_.ToString('x2') }) -join '' }

# Legge un frame completo (fino a 0x7E), lo decodifica e verifica il CRC. $null se scade il tempo.
function ReadFrame($sp) {
	$buf = New-Object System.Collections.Generic.List[byte]
	$esc = $false
	$deadline = [DateTime]::Now.AddSeconds(3)
	while ([DateTime]::Now -lt $deadline) {
		if ($sp.BytesToRead -eq 0) { Start-Sleep -Milliseconds 20; continue }
		$b = [byte]$sp.ReadByte()
		if ($b -eq 0x7E) {
			if ($buf.Count -lt 3) { $buf.Clear(); continue }
			$a = $buf.ToArray()
			$data = $a[0..($a.Length - 3)]
			$crc = [int]$a[$a.Length - 2] -bor ([int]$a[$a.Length - 1] -shl 8)
			if ((Crc16 $data) -ne $crc) { Write-Host "  [frame con CRC errato: $(Hex $a)]"; $buf.Clear(); continue }
			return ,([byte[]]$data)
		}
		if ($esc) { $buf.Add([byte]($b -bxor 0x20)); $esc = $false } elseif ($b -eq 0x7D) { $esc = $true } else { $buf.Add($b) }
	}
	return $null
}

# Invia una richiesta EFS2 e restituisce la risposta con la stessa intestazione (o un codice di errore DIAG).
function Req($sp, [int]$cmd, [byte[]]$body) {
	$p = New-Object System.Collections.Generic.List[byte]
	$p.AddRange([byte[]](Hdr $cmd)); if ($body) { $p.AddRange($body) }
	$f = Encode $p.ToArray()
	$sp.Write($f, 0, $f.Length)
	for ($n = 0; $n -lt 20; $n++) {
		$r = ReadFrame $sp
		if ($null -eq $r) { return $null }
		if ($r.Length -ge 4 -and $r[0] -eq 0x4B -and $r[1] -eq 0x13 -and $r[2] -eq ($cmd -band 0xFF) -and $r[3] -eq (($cmd -shr 8) -band 0xFF)) { return ,$r }
		if ($r[0] -in 0x13, 0x14, 0x15, 0x16, 0x18, 0x42, 0x47) { Write-Host "  [errore DIAG 0x$($r[0].ToString('x2')): $(Hex $r)]"; return $null }
		Write-Host "  [frame asincrono ignorato: $(Hex ($r[0..([Math]::Min(15, $r.Length - 1))]))]"
	}
	return $null
}

function I32([byte[]]$r, [int]$o) { return [BitConverter]::ToInt32($r, $o) }

# NV_READ (0x26): item (2 byte), dati (128 byte), stato (2 byte: 0 = letto, 5 = item mai scritto)
function NvRead($sp, [int]$item) {
	$p = New-Object System.Collections.Generic.List[byte]
	$p.Add(0x26); $p.Add([byte]($item -band 0xFF)); $p.Add([byte](($item -shr 8) -band 0xFF))
	$p.AddRange((New-Object byte[] 130))
	$f = Encode $p.ToArray()
	$sp.Write($f, 0, $f.Length)
	for ($n = 0; $n -lt 20; $n++) {
		$r = ReadFrame $sp
		if ($null -eq $r) { return $null }
		if ($r.Length -ge 133 -and $r[0] -eq 0x26) { return ,$r }
		if ($r[0] -in 0x13, 0x14, 0x15, 0x16, 0x18, 0x42, 0x47) { Write-Host "  [errore DIAG 0x$($r[0].ToString('x2')): $(Hex $r)]"; return $null }
	}
	return $null
}

$sp = New-Object System.IO.Ports.SerialPort $Port, 115200, 'None', 8, 'One'
$sp.ReadTimeout = 500; $sp.WriteTimeout = 2000; $sp.DtrEnable = $true; $sp.RtsEnable = $true
$sp.Open()
try {
	$sp.DiscardInBuffer()
	$hello = New-Object System.Collections.Generic.List[byte]
	foreach ($v in 0x100000, 0x100000, 0x100000, 0x100000, 0x100000, 0x100000, 1, 1, 1, 0xFFFFFFFF) { $hello.AddRange([byte[]](U32 $v)) }
	$r = Req $sp 0 $hello.ToArray()
	Write-Output "HELLO: $(if ($r) { Hex $r } else { 'nessuna risposta' })"
	foreach ($it in $Nv) {
		$r = NvRead $sp ([int]$it)
		if ($null -eq $r) { Write-Output "== NV $it : nessuna risposta"; continue }
		$st = [BitConverter]::ToUInt16($r, 131)
		$d = [byte[]]$r[3..130]
		$fine = $d.Length - 1
		while ($fine -ge 0 -and $d[$fine] -eq 0) { $fine-- }
		$util = if ($fine -ge 0) { $d[0..$fine] } else { @() }
		Write-Output "== NV $it : stato=$st (0 = letto, 5 = mai scritto) dati=$(Hex $util)"
	}
	foreach ($path in $Paths) {
		Write-Output "== $path"
		$r = Req $sp 15 (PathBytes $path)
		if ($null -eq $r) { Write-Output '  STAT: nessuna risposta'; continue }
		$err = I32 $r 4
		if ($err -ne 0) { Write-Output "  STAT errno=$err (2 = file assente)"; continue }
		$mode = I32 $r 8; $size = I32 $r 12
		Write-Output ("  STAT mode=0{0} size={1}" -f [Convert]::ToString($mode, 8), $size)
		if (($mode -band 0xF000) -eq 0xE000) {
			# item file: EFS2_DIAG_GET (data_length = dimensione da STAT, path_length, sequence_number, path)
			$pb = [byte[]](PathBytes $path)
			$g = New-Object System.Collections.Generic.List[byte]
			$g.AddRange([byte[]](U32 $size)); $g.AddRange([byte[]](U32 $pb.Length)); $g.AddRange([byte[]](1, 0)); $g.AddRange($pb)
			$r = Req $sp 26 $g.ToArray()
			if ($null -ne $r -and $r.Length -lt 14) { Write-Output "  GET risposta corta: $(Hex $r)"; $r = $null }
			if ($null -ne $r) {
				$nb = I32 $r 4; $ge = I32 $r 8
				$data = if ($nb -gt 0 -and $r.Length -ge 14 + $nb) { $r[14..(13 + $nb)] } else { @() }
				Write-Output "  GET num_bytes=$nb errno=$ge data=$(Hex $data)"
				continue
			}
			Write-Output '  GET non riuscito: provo OPEN/READ'
		} elseif (($mode -band 0xF000) -ne 0x8000) { Write-Output '  tipo non regolare: non letto'; continue }
		$o = New-Object System.Collections.Generic.List[byte]
		$o.AddRange([byte[]](U32 0)); $o.AddRange([byte[]](U32 0)); $o.AddRange([byte[]](PathBytes $path))
		$r = Req $sp 2 $o.ToArray()
		if ($null -eq $r) { Write-Output '  OPEN: nessuna risposta'; continue }
		$fd = I32 $r 4; $oe = I32 $r 8
		if ($fd -lt 0) { Write-Output "  OPEN errno=$oe"; continue }
		$all = New-Object System.Collections.Generic.List[byte]
		$off = 0
		while ($off -lt [Math]::Min($size, 8192)) {
			$rd = New-Object System.Collections.Generic.List[byte]
			$rd.AddRange([byte[]](U32 $fd)); $rd.AddRange([byte[]](U32 512)); $rd.AddRange([byte[]](U32 $off))
			$r = Req $sp 4 $rd.ToArray()
			if ($null -eq $r) { break }
			$n = I32 $r 12; $re = I32 $r 16
			if ($n -le 0) { if ($re -ne 0) { Write-Output "  READ errno=$re" }; break }
			$all.AddRange([byte[]]$r[20..(19 + $n)]); $off += $n
		}
		$null = Req $sp 3 ([byte[]](U32 $fd))
		$b = $all.ToArray()
		Write-Output "  READ $($b.Length) byte: $(Hex $b)"
		if ($b.Length -gt 0 -and ($b | Where-Object { ($_ -lt 9) -or ($_ -gt 126 -and $_ -ne 10 -and $_ -ne 13) }).Count -eq 0) {
			Write-Output '  testo:'; ([Text.Encoding]::ASCII.GetString($b) -split "`n") | ForEach-Object { "    $_" }
		}
	}
} finally {
	$sp.Close()
}
