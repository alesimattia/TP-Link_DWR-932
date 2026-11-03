# Cattura dei messaggi di debug F3 del modem del DWR-932 dalla porta Qualcomm DIAG (COM in test mode, PC Windows)
# mentre si esegue un comando sul device con adb. Abilita le maschere runtime dei messaggi (DIAG 0x7D, sottocomando 5:
# tutte le SSID) solo per la durata della cattura e alla fine le azzera; non scrive NV né EFS.
# Stampa i messaggi estesi (0x79) il cui testo corrisponde a -Match: file:riga, formato e argomenti.
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File dwr_diag_f3_capture.ps1 -Adb "shell sh /cache/ltew.sh 0x44"
#      [-Port COM10] [-Seconds 8] [-Match 'dsat|cmph|band']
param(
	[string]$Port = 'COM10',
	[string]$Adb = '',
	[int]$Seconds = 8,
	[string]$Match = 'dsat|cmph|band|sys_sel|pref'
)
$ErrorActionPreference = 'Stop'

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
function Hex([byte[]]$b) { if ($null -eq $b -or $b.Length -eq 0) { return '' }; return ($b | ForEach-Object { $_.ToString('x2') }) -join '' }

# Decodifica dei frame HDLC in arrivo: restituisce la lista dei frame completi con CRC valido
$script:buf = New-Object System.Collections.Generic.List[byte]
$script:esc = $false
function Frames($sp) {
	$out = New-Object System.Collections.Generic.List[object]
	$n = $sp.BytesToRead
	if ($n -le 0) { return ,$out }
	$chunk = New-Object byte[] $n
	$r = $sp.Read($chunk, 0, $n)
	for ($k = 0; $k -lt $r; $k++) {
		$b = $chunk[$k]
		if ($b -eq 0x7E) {
			if ($script:buf.Count -ge 3) {
				$a = $script:buf.ToArray()
				$data = [byte[]]$a[0..($a.Length - 3)]
				$crc = [int]$a[$a.Length - 2] -bor ([int]$a[$a.Length - 1] -shl 8)
				if ((Crc16 $data) -eq $crc) { $out.Add($data) }
			}
			$script:buf.Clear()
			continue
		}
		if ($script:esc) { $script:buf.Add([byte]($b -bxor 0x20)); $script:esc = $false }
		elseif ($b -eq 0x7D) { $script:esc = $true }
		else { $script:buf.Add($b) }
	}
	return ,$out
}

function Cstr([byte[]]$d, [int]$o) {
	$e = $o
	while ($e -lt $d.Length -and $d[$e] -ne 0) { $e++ }
	return @([Text.Encoding]::ASCII.GetString($d, $o, $e - $o), ($e + 1))
}

function SetAllMasks($sp, [uint32]$mask) {
	$p = New-Object System.Collections.Generic.List[byte]
	$p.AddRange([byte[]](0x7D, 0x05, 0x00, 0x00)); $p.AddRange([BitConverter]::GetBytes($mask))
	$f = Encode $p.ToArray()
	$sp.Write($f, 0, $f.Length)
}

$sp = New-Object System.IO.Ports.SerialPort $Port, 115200, 'None', 8, 'One'
$sp.ReadTimeout = 500; $sp.WriteTimeout = 2000; $sp.DtrEnable = $true; $sp.RtsEnable = $true
$sp.Open()
$stat = @{}
try {
	$sp.DiscardInBuffer()
	SetAllMasks $sp 0x1F
	Start-Sleep -Milliseconds 300
	if ($Adb -ne '') { $proc = Start-Process -FilePath '.\adb.exe' -ArgumentList $Adb -NoNewWindow -PassThru }
	$fine = [DateTime]::Now.AddSeconds($Seconds)
	while ([DateTime]::Now -lt $fine) {
		$lista = Frames $sp
		if ($lista.Count -eq 0) { Start-Sleep -Milliseconds 20; continue }
		foreach ($d in $lista) {
			$c = $d[0]
			$stat[$c] = 1 + [int]$stat[$c]
			if ($c -eq 0x7D) { Write-Output "risposta 0x7D: $(Hex $d)"; continue }
			if ($c -ne 0x79 -or $d.Length -lt 20) { continue }
			$na = $d[2]; $line = [BitConverter]::ToUInt16($d, 12); $ssid = [BitConverter]::ToUInt16($d, 14)
			$argv = @(); for ($i = 0; $i -lt $na; $i++) { $argv += [BitConverter]::ToInt32($d, 20 + 4 * $i) }
			$s1 = Cstr $d (20 + 4 * $na); $s2 = Cstr $d $s1[1]
			$testo = "$($s2[0]):$line [ssid $ssid] $($s1[0]) | $($argv -join ', ')"
			if ($testo -match $Match) { Write-Output $testo }
		}
	}
} finally {
	SetAllMasks $sp 0
	Start-Sleep -Milliseconds 300
	$null = Frames $sp
	$sp.Close()
	Write-Output ("frame per comando: " + (($stat.Keys | Sort-Object | ForEach-Object { '0x{0:x2}={1}' -f $_, $stat[$_] }) -join ' '))
}
