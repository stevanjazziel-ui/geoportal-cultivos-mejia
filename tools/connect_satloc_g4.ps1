param(
  [string]$ServerUrl = "http://127.0.0.1:8765",
  [string]$AreaId = "machachi",
  [string]$DeviceId = "satloc-g4-aeronave",
  [string]$DeviceLabel = "Aeronave Satloc G4",
  [string]$DeviceType = "Avioneta",
  [string]$PortName = "",
  [int[]]$BaudRates = @(4800, 9600, 19200, 38400),
  [int]$SendEveryMs = 2000,
  [int]$RescanEverySeconds = 8,
  [switch]$ListPorts
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ServerScript = Join-Path $Root "server.ps1"
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

function Convert-ToNullableInvariantDouble([string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  $parsed = 0.0
  if ([double]::TryParse($Value.Trim(), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$parsed)) {
    return $parsed
  }
  return $null
}

function Normalize-ServerUrl([string]$Value) {
  $raw = if ([string]::IsNullOrWhiteSpace($Value)) { "http://127.0.0.1:8765" } else { $Value.Trim() }
  $withProtocol = if ($raw -match "^[a-z]+://") { $raw } else { "http://$raw" }
  return $withProtocol.TrimEnd("/")
}

function Test-GeoportalPort([string]$HostName, [int]$TargetPort) {
  $client = $null
  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $async = $client.BeginConnect($HostName, $TargetPort, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(500)) {
      return $false
    }
    $client.EndConnect($async)
    return $true
  } catch {
    return $false
  } finally {
    if ($client) {
      $client.Close()
    }
  }
}

function Ensure-GeoportalBackend([uri]$ServerUri) {
  if (-not $ServerUri) {
    return
  }

  if ($ServerUri.Host -notin @("127.0.0.1", "localhost", "::1")) {
    return
  }

  $targetPort = if ($ServerUri.Port -gt 0) { $ServerUri.Port } else { 80 }
  if (Test-GeoportalPort $ServerUri.Host $targetPort) {
    return
  }

  if (-not (Test-Path -LiteralPath $ServerScript)) {
    throw "No se encontro server.ps1 en $Root"
  }

  $serverArgs = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Port {1}' -f $ServerScript, $targetPort
  Start-Process -FilePath $PowerShellExe -ArgumentList $serverArgs -WorkingDirectory $Root -WindowStyle Hidden

  $ready = $false
  for ($attempt = 0; $attempt -lt 36; $attempt++) {
    Start-Sleep -Milliseconds 350
    if (Test-GeoportalPort $ServerUri.Host $targetPort) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    throw "No se pudo iniciar el backend local del geoportal en $($ServerUri.Scheme)://$($ServerUri.Host):$targetPort"
  }
}

function Get-SerialPortHints() {
  $ports = [System.IO.Ports.SerialPort]::GetPortNames() | Sort-Object
  $hintTable = @{}

  try {
    $devices = Get-CimInstance Win32_PnPEntity -ErrorAction Stop | Where-Object { $_.Name -match "\(COM\d+\)" }
    foreach ($device in $devices) {
      $match = [regex]::Match([string]$device.Name, "\(COM\d+\)")
      if ($match.Success) {
        $port = $match.Value.Trim("()")
        $hintTable[$port] = [string]$device.Name
      }
    }
  } catch {
    # Si la descripcion del dispositivo no esta disponible, igual devolvemos los puertos.
  }

  return @(
    foreach ($port in $ports) {
      [pscustomobject]@{
        PortName = $port
        Description = if ($hintTable.ContainsKey($port)) { $hintTable[$port] } else { $port }
      }
    }
  )
}

function Get-CandidateSerialPorts([string]$RequestedPort) {
  $ports = Get-SerialPortHints
  if ($RequestedPort) {
    $match = $ports | Where-Object { $_.PortName -ieq $RequestedPort } | Select-Object -First 1
    if (-not $match) {
      throw "El puerto $RequestedPort no esta disponible. Puertos detectados: $((@($ports.PortName) -join ', '))."
    }
    return @($match.PortName)
  }

  if (-not $ports.Count) {
    return @()
  }

  $ordered = @(
    $ports | Sort-Object {
    $description = [string]$_.Description
    if ($description -match "satloc|gnss|gps|usb serial|ftdi|prolific") { 0 } else { 1 }
  }, PortName | Select-Object -First 1
  )

  $preferred = $ordered | Select-Object -First 1

  if ($preferred) {
    Write-Host "Puertos serie detectados:" -ForegroundColor Cyan
    foreach ($entry in $ports) {
      Write-Host (" - {0}: {1}" -f $entry.PortName, $entry.Description)
    }
    Write-Host ("Intentare primero {0}. Si quieres fijar otro, vuelve a ejecutar con -PortName COMx." -f $preferred.PortName) -ForegroundColor DarkYellow
  }

  $preferredPortName = if ($preferred) { $preferred.PortName } else { $null }
  $orderedPorts = [System.Collections.Generic.List[string]]::new()
  if ($preferredPortName) {
    $orderedPorts.Add($preferredPortName)
  }
  foreach ($entry in $ports) {
    if ($entry.PortName -and -not $orderedPorts.Contains($entry.PortName)) {
      $orderedPorts.Add($entry.PortName)
    }
  }

  return @($orderedPorts)
}

function Test-NmeaSentence([string]$Line) {
  if ([string]::IsNullOrWhiteSpace($Line)) {
    return $false
  }

  $trimmed = $Line.Trim()
  if ($trimmed.Length -lt 10 -or $trimmed[0] -ne '$') {
    return $false
  }

  $body = $trimmed.Split("*")[0].TrimStart('$')
  if ([string]::IsNullOrWhiteSpace($body)) {
    return $false
  }

  $fields = $body.Split(",")
  if (-not $fields.Length) {
    return $false
  }

  $type = [string]$fields[0]
  return $type -match "(RMC|GGA|VTG|GLL)$"
}

function Open-SerialPort([string]$SelectedPort, [int]$BaudRate) {
  $serialPort = New-Object System.IO.Ports.SerialPort $SelectedPort, $BaudRate, ([System.IO.Ports.Parity]::None), 8, ([System.IO.Ports.StopBits]::One)
  $serialPort.Handshake = [System.IO.Ports.Handshake]::None
  $serialPort.DtrEnable = $false
  $serialPort.RtsEnable = $false
  $serialPort.NewLine = "`n"
  $serialPort.ReadTimeout = 1400
  $serialPort.WriteTimeout = 1400
  $serialPort.Open()
  return $serialPort
}

function Find-SatlocSerialStream([string[]]$SelectedPorts, [int[]]$Candidates) {
  $candidateList = @($Candidates | Where-Object { $_ -gt 0 } | Select-Object -Unique)
  if (-not $candidateList.Count) {
    $candidateList = @(4800, 9600, 19200)
  }

  foreach ($selectedPort in @($SelectedPorts)) {
    foreach ($baudRate in $candidateList) {
      $serialPort = $null
      try {
        Write-Host ("Probando {0} a {1} bps..." -f $selectedPort, $baudRate) -ForegroundColor Cyan
        $serialPort = Open-SerialPort $selectedPort $baudRate
        $deadline = (Get-Date).AddSeconds(8)
        while ((Get-Date) -lt $deadline) {
          try {
            $line = $serialPort.ReadLine()
          } catch [System.TimeoutException] {
            continue
          }

          if (Test-NmeaSentence $line) {
            return [pscustomobject]@{
              SerialPort = $serialPort
              PortName = $selectedPort
              BaudRate = $baudRate
              FirstLine = $line
            }
          }
        }
      } catch {
        Write-Host ("No fue posible leer {0} a {1} bps: {2}" -f $selectedPort, $baudRate, $_.Exception.Message) -ForegroundColor DarkYellow
      }

      if ($serialPort) {
        if ($serialPort.IsOpen) {
          $serialPort.Close()
        }
        $serialPort.Dispose()
      }
    }
  }

  return $null
}

function Convert-NmeaCoordinate([string]$Value, [string]$Hemisphere) {
  if ([string]::IsNullOrWhiteSpace($Value) -or [string]::IsNullOrWhiteSpace($Hemisphere)) {
    return $null
  }

  $digits = if ($Hemisphere -match "^[NS]$") { 2 } elseif ($Hemisphere -match "^[EW]$") { 3 } else { return $null }
  if ($Value.Length -lt ($digits + 2)) {
    return $null
  }

  $degrees = Convert-ToNullableInvariantDouble $Value.Substring(0, $digits)
  $minutes = Convert-ToNullableInvariantDouble $Value.Substring($digits)
  if ($null -eq $degrees -or $null -eq $minutes) {
    return $null
  }

  $decimal = [double]$degrees + ([double]$minutes / 60.0)
  if ($Hemisphere -in @("S", "W")) {
    $decimal *= -1
  }
  return [Math]::Round($decimal, 6)
}

function Get-NmeaTimestamp([string]$TimeText, [string]$DateText, [datetime]$FallbackDateUtc) {
  $dateBase = if ($FallbackDateUtc) { $FallbackDateUtc.ToUniversalTime() } else { [DateTime]::UtcNow }
  $currentDate = $dateBase.Date

  if (-not [string]::IsNullOrWhiteSpace($DateText) -and $DateText.Length -ge 6) {
    try {
      $day = [int]$DateText.Substring(0, 2)
      $month = [int]$DateText.Substring(2, 2)
      $year = 2000 + [int]$DateText.Substring(4, 2)
      $currentDate = [datetime]::SpecifyKind((Get-Date -Year $year -Month $month -Day $day -Hour 0 -Minute 0 -Second 0), [DateTimeKind]::Utc)
    } catch {
      $currentDate = $dateBase.Date
    }
  }

  if ([string]::IsNullOrWhiteSpace($TimeText) -or $TimeText.Length -lt 6) {
    return $currentDate.ToString("o")
  }

  try {
    $fractional = 0
    $wholePart = $TimeText
    if ($TimeText.Contains(".")) {
      $parts = $TimeText.Split(".", 2)
      $wholePart = $parts[0]
      $fractionalText = ($parts[1] + "000").Substring(0, 3)
      $fractional = [int]$fractionalText
    }
    $wholePart = ($wholePart + "000000").Substring(0, 6)
    $hour = [int]$wholePart.Substring(0, 2)
    $minute = [int]$wholePart.Substring(2, 2)
    $second = [int]$wholePart.Substring(4, 2)
    $timestamp = [datetime]::SpecifyKind((Get-Date -Year $currentDate.Year -Month $currentDate.Month -Day $currentDate.Day -Hour $hour -Minute $minute -Second $second -Millisecond $fractional), [DateTimeKind]::Utc)
    return $timestamp.ToString("o")
  } catch {
    return $currentDate.ToString("o")
  }
}

function Update-TelemetryFromNmea([string]$Line, [hashtable]$Telemetry) {
  if (-not (Test-NmeaSentence $Line)) {
    return $false
  }

  $payload = $Line.Trim().Split("*")[0].TrimStart('$')
  $fields = $payload.Split(",")
  $sentenceType = [string]$fields[0]
  $sentenceKey = if ($sentenceType.Length -ge 3) { $sentenceType.Substring($sentenceType.Length - 3).ToUpperInvariant() } else { $sentenceType.ToUpperInvariant() }
  $updated = $false

  switch ($sentenceKey) {
    "RMC" {
      if ($fields.Length -lt 10 -or $fields[2] -ne "A") {
        break
      }
      $lat = Convert-NmeaCoordinate $fields[3] $fields[4]
      $lon = Convert-NmeaCoordinate $fields[5] $fields[6]
      if ($null -ne $lat -and $null -ne $lon) {
        $Telemetry.lat = $lat
        $Telemetry.lon = $lon
        $updated = $true
      }

      $speedKnots = Convert-ToNullableInvariantDouble $fields[7]
      if ($null -ne $speedKnots) {
        $Telemetry.speedKmh = [Math]::Round(([double]$speedKnots * 1.852), 1)
      }

      $course = Convert-ToNullableInvariantDouble $fields[8]
      if ($null -ne $course) {
        $Telemetry.headingDeg = [Math]::Round([double]$course, 0)
      }

      $Telemetry.timestamp = Get-NmeaTimestamp $fields[1] $fields[9] $Telemetry.lastDateUtc
      try {
        $Telemetry.lastDateUtc = [datetime]::Parse($Telemetry.timestamp, [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::AdjustToUniversal)
      } catch {
        $Telemetry.lastDateUtc = [DateTime]::UtcNow
      }
      $Telemetry.fixQuality = [Math]::Max([int]$Telemetry.fixQuality, 1)
      $Telemetry.lastSentence = $sentenceType
      break
    }
    "GGA" {
      if ($fields.Length -lt 10) {
        break
      }
      $fixQualityValue = Convert-ToNullableInvariantDouble $fields[6]
      $fixQuality = if ($null -ne $fixQualityValue) { [int][Math]::Round([double]$fixQualityValue, 0) } else { 0 }
      if ($fixQuality -lt 1) {
        break
      }

      $lat = Convert-NmeaCoordinate $fields[2] $fields[3]
      $lon = Convert-NmeaCoordinate $fields[4] $fields[5]
      if ($null -ne $lat -and $null -ne $lon) {
        $Telemetry.lat = $lat
        $Telemetry.lon = $lon
        $updated = $true
      }

      $altitude = Convert-ToNullableInvariantDouble $fields[9]
      if ($null -ne $altitude) {
        $Telemetry.altitudeM = [Math]::Round([double]$altitude, 1)
      }

      $satellites = Convert-ToNullableInvariantDouble $fields[7]
      if ($null -ne $satellites) {
        $Telemetry.satellites = [int][Math]::Round([double]$satellites, 0)
      }

      $hdop = Convert-ToNullableInvariantDouble $fields[8]
      if ($null -ne $hdop) {
        $Telemetry.accuracyM = [Math]::Round(([double]$hdop * 5.0), 1)
      }

      $Telemetry.fixQuality = $fixQuality
      $Telemetry.timestamp = Get-NmeaTimestamp $fields[1] "" $Telemetry.lastDateUtc
      $Telemetry.lastSentence = $sentenceType
      break
    }
    "VTG" {
      if ($fields.Length -ge 9) {
        $track = Convert-ToNullableInvariantDouble $fields[1]
        if ($null -ne $track) {
          $Telemetry.headingDeg = [Math]::Round([double]$track, 0)
        }

        $speedKmh = Convert-ToNullableInvariantDouble $fields[7]
        if ($null -ne $speedKmh) {
          $Telemetry.speedKmh = [Math]::Round([double]$speedKmh, 1)
        }
      }
      $Telemetry.lastSentence = $sentenceType
      break
    }
  }

  if ($updated -and $null -eq $Telemetry.homeLat -and $null -eq $Telemetry.homeLon) {
    $Telemetry.homeLat = $Telemetry.lat
    $Telemetry.homeLon = $Telemetry.lon
  }

  return $updated
}

function Get-FlightStatus([hashtable]$Telemetry) {
  $speed = if ($null -ne $Telemetry.speedKmh) { [double]$Telemetry.speedKmh } else { 0.0 }
  if ($speed -ge 70) {
    return "En vuelo"
  }
  if ($speed -ge 15) {
    return "Rodaje"
  }
  return "En espera"
}

function Publish-Telemetry([uri]$ServerUri, [hashtable]$Telemetry, [string]$SelectedPort, [int]$BaudRate, [string]$ResolvedAreaId, [string]$ResolvedDeviceId, [string]$ResolvedLabel, [string]$ResolvedType) {
  $payload = [ordered]@{
    id = $ResolvedDeviceId
    label = $ResolvedLabel
    deviceType = $ResolvedType
    mobilityMode = "air"
    areaId = $ResolvedAreaId
    lat = [Math]::Round([double]$Telemetry.lat, 6)
    lon = [Math]::Round([double]$Telemetry.lon, 6)
    speedKmh = [Math]::Round($(if ($null -ne $Telemetry.speedKmh) { [double]$Telemetry.speedKmh } else { 0.0 }), 1)
    headingDeg = [Math]::Round($(if ($null -ne $Telemetry.headingDeg) { [double]$Telemetry.headingDeg } else { 0.0 }), 0)
    accuracyM = if ($null -ne $Telemetry.accuracyM) { [Math]::Round([double]$Telemetry.accuracyM, 1) } else { $null }
    altitudeM = if ($null -ne $Telemetry.altitudeM) { [Math]::Round([double]$Telemetry.altitudeM, 1) } else { $null }
    homeLat = $Telemetry.homeLat
    homeLon = $Telemetry.homeLon
    timestamp = $Telemetry.timestamp
    flightStatus = Get-FlightStatus $Telemetry
    statusLabel = "Satloc G4 por serial $SelectedPort @ $BaudRate"
    source = "satloc-g4-nmea"
    fixQuality = $Telemetry.fixQuality
    satellites = $Telemetry.satellites
    sourceSentence = $Telemetry.lastSentence
  }

  $endpoint = [uri]::new($ServerUri, "/api/agronomy/gps/ingest")
  $response = Invoke-RestMethod -Uri $endpoint.AbsoluteUri -Method Post -ContentType "application/json" -Body ($payload | ConvertTo-Json -Depth 6) -TimeoutSec 8
  if (-not $response.ok) {
    throw "El geoportal rechazo la telemetria del Satloc G4."
  }
  return $response
}

function New-TelemetryState() {
  return @{
    lat = $null
    lon = $null
    speedKmh = 0.0
    headingDeg = 0.0
    altitudeM = $null
    accuracyM = $null
    satellites = $null
    timestamp = [DateTime]::UtcNow.ToString("o")
    homeLat = $null
    homeLon = $null
    fixQuality = 0
    lastSentence = ""
    lastDateUtc = [DateTime]::UtcNow
  }
}

$ServerUrl = Normalize-ServerUrl $ServerUrl
$ServerUri = [uri]$ServerUrl
Ensure-GeoportalBackend $ServerUri

if ($ListPorts) {
  $ports = Get-SerialPortHints
  if (-not $ports.Count) {
    Write-Host "No se detectaron puertos serie." -ForegroundColor DarkYellow
    exit 0
  }

  Write-Host "Puertos serie detectados:" -ForegroundColor Cyan
  foreach ($entry in $ports) {
    Write-Host (" - {0}: {1}" -f $entry.PortName, $entry.Description)
  }
  exit 0
}

$publishEvery = [TimeSpan]::FromMilliseconds([Math]::Max($SendEveryMs, 1200))
$rescanDelay = [TimeSpan]::FromSeconds([Math]::Max($RescanEverySeconds, 3))
$targetAreaId = if ([string]::IsNullOrWhiteSpace($AreaId)) { "machachi" } else { $AreaId.Trim().ToLowerInvariant() }
$targetDeviceId = if ([string]::IsNullOrWhiteSpace($DeviceId)) { "satloc-g4-aeronave" } else { $DeviceId.Trim() }
$targetLabel = if ([string]::IsNullOrWhiteSpace($DeviceLabel)) { "Aeronave Satloc G4" } else { $DeviceLabel.Trim() }
$targetType = if ([string]::IsNullOrWhiteSpace($DeviceType)) { "Avioneta" } else { $DeviceType.Trim() }

Write-Host ("Puente automatico Satloc G4 listo para {0}." -f $targetLabel) -ForegroundColor Green
Write-Host ("Publicando telemetria a {0}/api/agronomy/gps/ingest para el ambito {1}." -f $ServerUri.AbsoluteUri.TrimEnd("/"), $targetAreaId) -ForegroundColor Cyan
Write-Host ("El puente escaneara puertos COM cada {0} segundos hasta detectar NMEA y seguira reconectando si la aeronave se apaga o se desconecta." -f [int]$rescanDelay.TotalSeconds) -ForegroundColor DarkYellow
Write-Host "Pulsa Ctrl+C para detener el puente." -ForegroundColor DarkYellow

while ($true) {
  Ensure-GeoportalBackend $ServerUri
  $candidatePorts = Get-CandidateSerialPorts $PortName
  if (-not @($candidatePorts).Count) {
    Write-Host "No hay puertos COM disponibles todavia. Reintentando..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds ([int][Math]::Max([double]$rescanDelay.TotalSeconds, 3))
    continue
  }

  $stream = Find-SatlocSerialStream $candidatePorts $BaudRates
  if (-not $stream) {
    Write-Host "Aun no aparece una salida NMEA valida del Satloc G4. Reintentando..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds ([int][Math]::Max([double]$rescanDelay.TotalSeconds, 3))
    continue
  }

  $SerialPort = $stream.SerialPort
  $ResolvedPort = $stream.PortName
  $SelectedBaudRate = $stream.BaudRate
  $Telemetry = New-TelemetryState
  $lastPublishAt = [DateTime]::MinValue
  $lastSignalAt = Get-Date

  Write-Host ("Satloc G4 enlazado por {0} a {1} bps." -f $ResolvedPort, $SelectedBaudRate) -ForegroundColor Green

  try {
    if ($stream.FirstLine) {
      [void](Update-TelemetryFromNmea $stream.FirstLine $Telemetry)
    }

    while ($true) {
      try {
        $line = $SerialPort.ReadLine()
        $lastSignalAt = Get-Date
      } catch [System.TimeoutException] {
        if (((Get-Date) - $lastSignalAt).TotalSeconds -ge ([Math]::Max([int]$rescanDelay.TotalSeconds * 2, 18))) {
          throw "El puerto $ResolvedPort dejo de entregar sentencias NMEA."
        }
        continue
      }

      $updated = Update-TelemetryFromNmea $line $Telemetry
      if (-not $updated -or $null -eq $Telemetry.lat -or $null -eq $Telemetry.lon) {
        continue
      }

      if (((Get-Date) - $lastPublishAt) -lt $publishEvery) {
        continue
      }

      $result = Publish-Telemetry $ServerUri $Telemetry $ResolvedPort $SelectedBaudRate $targetAreaId $targetDeviceId $targetLabel $targetType
      $lastPublishAt = Get-Date
      $speedText = "{0:N1}" -f $(if ($null -ne $Telemetry.speedKmh) { [double]$Telemetry.speedKmh } else { 0.0 })
      $altitudeText = if ($null -ne $Telemetry.altitudeM) { "{0:N1} m" -f [double]$Telemetry.altitudeM } else { "sin altura" }
      Write-Host ("[{0}] {1}: {2}, {3} km/h, {4}." -f (Get-Date -Format "HH:mm:ss"), $result.message, $targetLabel, $speedText, $altitudeText) -ForegroundColor Green
    }
  } catch {
    Write-Host ("Se perdio el enlace Satloc en {0}: {1}" -f $ResolvedPort, $_.Exception.Message) -ForegroundColor DarkYellow
    Start-Sleep -Milliseconds 1200
  } finally {
    if ($SerialPort) {
      if ($SerialPort.IsOpen) {
        $SerialPort.Close()
      }
      $SerialPort.Dispose()
    }
  }
}
