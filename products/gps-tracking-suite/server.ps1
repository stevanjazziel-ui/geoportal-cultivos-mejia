param(
  [int]$Port = 0,
  [string]$BindAddress = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = [System.IO.Path]::GetFullPath($Root)
$PublicRoot = Join-Path $RootPath "public"
$DataRoot = Join-Path $RootPath "data"
$LiveFeedPath = Join-Path $DataRoot "live_feed.json"
$HistoryFeedPath = Join-Path $DataRoot "device_history.json"
$EventFeedPath = Join-Path $DataRoot "event_feed.json"
$ConfigPath = Join-Path $RootPath "tracking.config.json"
$StartedAt = (Get-Date).ToString("o")

function Ensure-ParentDirectory([string]$Path) {
  $parent = Split-Path -Parent $Path
  if ($parent -and -not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function Read-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }

  $raw = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return $null
  }

  try {
    return $raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Write-JsonFile([string]$Path, $Payload) {
  Ensure-ParentDirectory $Path
  $Payload | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Convert-ToNullableInvariantDouble($Value) {
  if ($null -eq $Value) {
    return $null
  }

  $text = [string]$Value
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  $parsed = 0.0
  if ([double]::TryParse($text.Trim(), [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$parsed)) {
    return [double]$parsed
  }
  return $null
}

function Convert-ToInvariantDouble($Value, [double]$Fallback = 0.0) {
  $parsed = Convert-ToNullableInvariantDouble $Value
  if ($null -eq $parsed -or [double]::IsNaN($parsed) -or [double]::IsInfinity($parsed)) {
    return [double]$Fallback
  }
  return [double]$parsed
}

function Convert-ToNullableInvariantInt($Value) {
  $parsed = Convert-ToNullableInvariantDouble $Value
  if ($null -eq $parsed) {
    return $null
  }
  return [int][Math]::Round([double]$parsed, 0)
}

function Normalize-AreaId([string]$AreaId, [string]$FallbackAreaId) {
  $value = if ([string]::IsNullOrWhiteSpace($AreaId)) { $FallbackAreaId } else { $AreaId.Trim() }
  if ([string]::IsNullOrWhiteSpace($value)) {
    return "mejia"
  }

  switch ($value.ToLowerInvariant()) {
    "todo" { return "all" }
    "todos" { return "all" }
    "todo mejia" { return "mejia" }
    "todo_mejia" { return "mejia" }
    default { return $value.ToLowerInvariant() }
  }
}

function Convert-ToDeviceId([string]$Id, [string]$Label) {
  $seed = if (-not [string]::IsNullOrWhiteSpace($Id)) { $Id } elseif (-not [string]::IsNullOrWhiteSpace($Label)) { $Label } else { "gps-device" }
  $slug = [regex]::Replace($seed.Trim().ToLowerInvariant(), "[^a-z0-9]+", "-")
  $slug = [regex]::Replace($slug, "-{2,}", "-").Trim("-")
  if ([string]::IsNullOrWhiteSpace($slug)) {
    return "gps-device"
  }
  return $slug
}

function Convert-ToIsoTimestamp([string]$Timestamp) {
  if ([string]::IsNullOrWhiteSpace($Timestamp)) {
    return (Get-Date).ToUniversalTime().ToString("o")
  }

  try {
    return ([datetime]::Parse($Timestamp, [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::AdjustToUniversal)).ToUniversalTime().ToString("o")
  } catch {
    return (Get-Date).ToUniversalTime().ToString("o")
  }
}

function Get-TrackingConfig() {
  $config = Read-JsonFile $ConfigPath
  if (-not $config) {
    $config = [pscustomobject]@{}
  }

  $defaultAreas = @(
    [pscustomobject]@{ id = "all"; label = "Todos" }
    [pscustomobject]@{ id = "mejia"; label = "Mejia" }
    [pscustomobject]@{ id = "machachi"; label = "Machachi" }
    [pscustomobject]@{ id = "cutuglagua"; label = "Cutuglagua" }
    [pscustomobject]@{ id = "quevedo"; label = "Quevedo" }
  )

  $map = if ($config.map) { $config.map } else { [pscustomobject]@{} }
  $center = if ($map.center -and @($map.center).Count -ge 2) { @([double]$map.center[0], [double]$map.center[1]) } else { @(-0.49, -78.57) }
  $zoom = Convert-ToInvariantDouble $map.zoom 10
  return [pscustomobject]@{
    productName = if ($config.productName) { [string]$config.productName } else { "GeoTrack RT" }
    companyName = if ($config.companyName) { [string]$config.companyName } else { "Tu empresa" }
    bindAddress = if ($config.bindAddress) { [string]$config.bindAddress } else { "0.0.0.0" }
    port = [int](Convert-ToInvariantDouble $config.port 8877)
    publicOrigin = if ($config.publicOrigin) { ([string]$config.publicOrigin).TrimEnd("/") } else { "" }
    ingestToken = if ($config.ingestToken) { [string]$config.ingestToken } else { "" }
    shareIngestTokenInSenderLinks = [bool]$config.shareIngestTokenInSenderLinks
    defaultAreaId = Normalize-AreaId ([string]$config.defaultAreaId) "mejia"
    pollIntervalMs = [int](Convert-ToInvariantDouble $config.pollIntervalMs 4000)
    map = [pscustomobject]@{
      center = @([double]$center[0], [double]$center[1])
      zoom = [Math]::Round([double]$zoom, 0)
    }
    areas = if ($config.areas) { @($config.areas) } else { $defaultAreas }
  }
}

$TrackingConfig = Get-TrackingConfig
if (-not $PSBoundParameters.ContainsKey("Port") -or $Port -le 0) {
  $Port = $TrackingConfig.port
}
if (-not $PSBoundParameters.ContainsKey("BindAddress") -or [string]::IsNullOrWhiteSpace($BindAddress)) {
  $BindAddress = $TrackingConfig.bindAddress
}

$StaticFiles = @{
  "/" = "index.html"
  "/index.html" = "index.html"
  "/styles.css" = "styles.css"
  "/app.js" = "app.js"
  "/sender.html" = "sender.html"
  "/sender" = "sender.html"
  "/sender.webmanifest" = "sender.webmanifest"
  "/sender-sw.js" = "sender-sw.js"
  "/icon.svg" = "icon.svg"
}

function Get-ContentType([string]$Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".webmanifest" { return "application/manifest+json; charset=utf-8" }
    default { return "application/octet-stream" }
  }
}

function Get-StatusText([int]$StatusCode) {
  switch ($StatusCode) {
    200 { "OK" }
    201 { "Created" }
    204 { "No Content" }
    400 { "Bad Request" }
    401 { "Unauthorized" }
    404 { "Not Found" }
    default { "Internal Server Error" }
  }
}

function Write-Response($Stream, [int]$StatusCode, [string]$ContentType, [byte[]]$BodyBytes) {
  $headers = "HTTP/1.1 $StatusCode $(Get-StatusText $StatusCode)`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type, X-Ingest-Token`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($BodyBytes.Length -gt 0) {
    $Stream.Write($BodyBytes, 0, $BodyBytes.Length)
  }
  $Stream.Flush()
}

function Write-Json($Stream, [int]$StatusCode, $Body) {
  Write-Response $Stream $StatusCode "application/json; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 12)))
}

function Read-Request($Client) {
  $stream = $Client.GetStream()
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $false, 1024, $true)
  $requestLine = $reader.ReadLine()
  if ([string]::IsNullOrWhiteSpace($requestLine)) {
    return @{ Stream = $stream; Method = ""; Path = "/"; RawPath = "/"; Headers = @{}; Body = "" }
  }

  $parts = $requestLine.Split(" ")
  $headers = @{}
  while ($true) {
    $line = $reader.ReadLine()
    if ([string]::IsNullOrEmpty($line)) {
      break
    }
    $pair = $line.Split(":", 2)
    if ($pair.Length -eq 2) {
      $headers[$pair[0].Trim()] = $pair[1].Trim()
    }
  }

  $contentLength = if ($headers.ContainsKey("Content-Length")) { [int]$headers["Content-Length"] } else { 0 }
  $body = ""
  if ($contentLength -gt 0) {
    $buffer = New-Object char[] $contentLength
    $read = 0
    while ($read -lt $contentLength) {
      $chunk = $reader.Read($buffer, $read, $contentLength - $read)
      if ($chunk -le 0) {
        break
      }
      $read += $chunk
    }
    $body = -join $buffer[0..($read - 1)]
  }

  $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
  $path = $rawPath.Split("?")[0]
  return @{
    Stream = $stream
    Method = $parts[0]
    Path = $path
    RawPath = $rawPath
    Headers = $headers
    Body = $body
  }
}

function Get-LocalNetworkHints([int]$TargetPort) {
  $addresses = New-Object System.Collections.Generic.List[object]
  try {
    $records = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
      Where-Object {
        $_.IPAddress -and
        $_.IPAddress -ne "127.0.0.1" -and
        $_.IPAddress -notlike "169.254.*"
      } |
      Select-Object -ExpandProperty IPAddress -Unique
    foreach ($address in @($records)) {
      $addresses.Add([pscustomobject]@{
        label = "LAN"
        host = $address
        url = "http://$address`:$TargetPort"
      })
    }
  } catch {
    # Si falla Get-NetIPAddress se devuelven al menos localhost y publicOrigin.
  }

  if ($TrackingConfig.publicOrigin) {
    $addresses.Insert(0, [pscustomobject]@{
      label = "Internet"
      host = $TrackingConfig.publicOrigin
      url = $TrackingConfig.publicOrigin
    })
  }

  $addresses.Insert(0, [pscustomobject]@{
    label = "Localhost"
    host = "127.0.0.1"
    url = "http://127.0.0.1:$TargetPort"
  })

  return @($addresses | Group-Object url | ForEach-Object { $_.Group[0] })
}

function Get-PublicTrackingConfig() {
  return [ordered]@{
    ok = $true
    productName = $TrackingConfig.productName
    companyName = $TrackingConfig.companyName
    defaultAreaId = $TrackingConfig.defaultAreaId
    pollIntervalMs = $TrackingConfig.pollIntervalMs
    publicOrigin = $TrackingConfig.publicOrigin
    shareIngestTokenInSenderLinks = $TrackingConfig.shareIngestTokenInSenderLinks
    hasIngestToken = -not [string]::IsNullOrWhiteSpace($TrackingConfig.ingestToken)
    senderToken = if ($TrackingConfig.shareIngestTokenInSenderLinks) { $TrackingConfig.ingestToken } else { "" }
    areas = $TrackingConfig.areas
    map = $TrackingConfig.map
    startedAt = $StartedAt
  }
}

function Resolve-IngestToken($Body, $Headers) {
  if ($Body -and $Body.PSObject.Properties.Name -contains "token" -and -not [string]::IsNullOrWhiteSpace([string]$Body.token)) {
    return [string]$Body.token
  }
  if ($Headers.ContainsKey("X-Ingest-Token")) {
    return [string]$Headers["X-Ingest-Token"]
  }
  if ($Headers.ContainsKey("x-ingest-token")) {
    return [string]$Headers["x-ingest-token"]
  }
  return ""
}

function New-TrackingDeviceRecord($Device, [string]$FallbackAreaId, [datetime]$Now) {
  if (-not $Device) {
    return $null
  }

  $lat = Convert-ToNullableInvariantDouble $Device.lat
  $lon = Convert-ToNullableInvariantDouble $Device.lon
  if ($null -eq $lat -or $null -eq $lon -or [double]::IsNaN($lat) -or [double]::IsInfinity($lat) -or [double]::IsNaN($lon) -or [double]::IsInfinity($lon)) {
    return $null
  }

  $label = if ($Device.PSObject.Properties.Name -contains "label" -and -not [string]::IsNullOrWhiteSpace([string]$Device.label)) {
    [string]$Device.label
  } else {
    "Dispositivo GPS"
  }

  $areaId = Normalize-AreaId $(if ($Device.PSObject.Properties.Name -contains "areaId") { [string]$Device.areaId } else { $FallbackAreaId }) $TrackingConfig.defaultAreaId
  $timestamp = Convert-ToIsoTimestamp $(if ($Device.PSObject.Properties.Name -contains "timestamp") { [string]$Device.timestamp } else { $Now.ToString("o") })

  return [pscustomobject][ordered]@{
    id = Convert-ToDeviceId $(if ($Device.PSObject.Properties.Name -contains "id") { [string]$Device.id } else { "" }) $label
    label = $label
    deviceType = if ($Device.PSObject.Properties.Name -contains "deviceType" -and -not [string]::IsNullOrWhiteSpace([string]$Device.deviceType)) { [string]$Device.deviceType } else { "GPS" }
    mobilityMode = if ($Device.PSObject.Properties.Name -contains "mobilityMode" -and -not [string]::IsNullOrWhiteSpace([string]$Device.mobilityMode)) { [string]$Device.mobilityMode } else { "ground" }
    areaId = $areaId
    lat = [Math]::Round([double]$lat, 6)
    lon = [Math]::Round([double]$lon, 6)
    speedKmh = [Math]::Round((Convert-ToInvariantDouble $Device.speedKmh 0), 1)
    headingDeg = [Math]::Round((Convert-ToInvariantDouble $Device.headingDeg 0), 0)
    batteryPct = Convert-ToNullableInvariantInt $Device.batteryPct
    accuracyM = [Math]::Round((Convert-ToInvariantDouble $Device.accuracyM 8), 1)
    altitudeM = $(if ($Device.PSObject.Properties.Name -contains "altitudeM") { $altitude = Convert-ToNullableInvariantDouble $Device.altitudeM; if ($null -ne $altitude) { [Math]::Round([double]$altitude, 1) } else { $null } } else { $null })
    verticalSpeedMps = $(if ($Device.PSObject.Properties.Name -contains "verticalSpeedMps") { $vertical = Convert-ToNullableInvariantDouble $Device.verticalSpeedMps; if ($null -ne $vertical) { [Math]::Round([double]$vertical, 1) } else { $null } } else { $null })
    homeLat = $(if ($Device.PSObject.Properties.Name -contains "homeLat") { $value = Convert-ToNullableInvariantDouble $Device.homeLat; if ($null -ne $value) { [Math]::Round([double]$value, 6) } else { $null } } else { $null })
    homeLon = $(if ($Device.PSObject.Properties.Name -contains "homeLon") { $value = Convert-ToNullableInvariantDouble $Device.homeLon; if ($null -ne $value) { [Math]::Round([double]$value, 6) } else { $null } } else { $null })
    flightStatus = if ($Device.PSObject.Properties.Name -contains "flightStatus" -and -not [string]::IsNullOrWhiteSpace([string]$Device.flightStatus)) { [string]$Device.flightStatus } else { $null }
    statusLabel = if ($Device.PSObject.Properties.Name -contains "statusLabel" -and -not [string]::IsNullOrWhiteSpace([string]$Device.statusLabel)) { [string]$Device.statusLabel } else { "En seguimiento" }
    source = if ($Device.PSObject.Properties.Name -contains "source" -and -not [string]::IsNullOrWhiteSpace([string]$Device.source)) { [string]$Device.source } else { "browser-gps" }
    timestamp = $timestamp
  }
}

function Merge-DeviceHistory($CurrentHistory, $Devices) {
  $historyTable = @{}
  if ($CurrentHistory) {
    foreach ($entry in $CurrentHistory.PSObject.Properties) {
      $points = @()
      foreach ($point in @($entry.Value)) {
        if ($point.PSObject.Properties.Name -contains "lat" -and $point.PSObject.Properties.Name -contains "lon") {
          $points += [pscustomobject]@{
            lat = [Math]::Round((Convert-ToInvariantDouble $point.lat 0), 6)
            lon = [Math]::Round((Convert-ToInvariantDouble $point.lon 0), 6)
            timestamp = Convert-ToIsoTimestamp $point.timestamp
          }
        }
      }
      $historyTable[$entry.Name] = $points
    }
  }

  foreach ($device in @($Devices)) {
    if (-not $historyTable.ContainsKey($device.id)) {
      $historyTable[$device.id] = @()
    }

    $existing = @($historyTable[$device.id])
    $append = $true
    if ($existing.Count -gt 0) {
      $last = $existing[$existing.Count - 1]
      $deltaLat = [Math]::Abs(([double]$device.lat) - ([double]$last.lat))
      $deltaLon = [Math]::Abs(([double]$device.lon) - ([double]$last.lon))
      $append = ($deltaLat -gt 0.00002) -or ($deltaLon -gt 0.00002) -or ($last.timestamp -ne $device.timestamp)
    }

    if ($append) {
      $existing += [pscustomobject]@{
        lat = $device.lat
        lon = $device.lon
        timestamp = $device.timestamp
      }
    }

    if ($existing.Count -gt 240) {
      $existing = @($existing | Select-Object -Last 240)
    }
    $historyTable[$device.id] = $existing
  }

  return [pscustomobject]$historyTable
}

function Merge-TrackingEvents($CurrentEvents, $MergedDevices, $IncomingDevices) {
  $events = @()
  foreach ($event in @($CurrentEvents)) {
    if ($event.timestamp -and $event.type -and $event.message) {
      $events += [pscustomobject]@{
        timestamp = Convert-ToIsoTimestamp $event.timestamp
        type = [string]$event.type
        message = [string]$event.message
        deviceId = if ($event.deviceId) { [string]$event.deviceId } else { "" }
      }
    }
  }

  foreach ($device in @($IncomingDevices)) {
    $events += [pscustomobject]@{
      timestamp = $device.timestamp
      type = "signal"
      message = "{0} reporto posicion en {1}." -f $device.label, $device.areaId
      deviceId = $device.id
    }
  }

  $nowUtc = (Get-Date).ToUniversalTime()
  foreach ($device in @($MergedDevices)) {
    try {
      $ageMinutes = [Math]::Abs(($nowUtc - ([datetime]::Parse($device.timestamp, [System.Globalization.CultureInfo]::InvariantCulture, [System.Globalization.DateTimeStyles]::AdjustToUniversal))).TotalMinutes)
      if ($ageMinutes -gt 15) {
        $events += [pscustomobject]@{
          timestamp = $nowUtc.ToString("o")
          type = "warning"
          message = "{0} lleva {1:N0} min sin nueva senal." -f $device.label, $ageMinutes
          deviceId = $device.id
        }
      }
    } catch {
      # Si no se puede calcular la antiguedad, se omite el aviso.
    }
  }

  return @(
    $events |
      Sort-Object timestamp -Descending |
      Select-Object -First 40
  )
}

function Save-TrackingFeed($Body, $Headers) {
  $receivedToken = Resolve-IngestToken $Body $Headers
  if (-not [string]::IsNullOrWhiteSpace($TrackingConfig.ingestToken) -and $receivedToken -ne $TrackingConfig.ingestToken) {
    return @{
      ok = $false
      error = "Token de ingesta invalido."
    }
  }

  $now = Get-Date
  $fallbackAreaId = Normalize-AreaId $(if ($Body -and $Body.PSObject.Properties.Name -contains "areaId") { [string]$Body.areaId } else { $TrackingConfig.defaultAreaId }) $TrackingConfig.defaultAreaId
  $incomingDevices = @()
  if ($Body -and $Body.PSObject.Properties.Name -contains "devices" -and $Body.devices) {
    $incomingDevices = @($Body.devices)
  } elseif ($Body -and $Body.PSObject.Properties.Name -contains "device" -and $Body.device) {
    $incomingDevices = @($Body.device)
  } elseif ($Body) {
    $incomingDevices = @($Body)
  }

  $normalized = @()
  foreach ($device in @($incomingDevices)) {
    $record = New-TrackingDeviceRecord $device $fallbackAreaId $now
    if ($record) {
      $normalized += $record
    }
  }

  if (-not $normalized.Count) {
    return @{
      ok = $false
      error = "No se recibieron coordenadas validas."
      receivedCount = @($incomingDevices).Count
    }
  }

  $currentFeed = Read-JsonFile $LiveFeedPath
  $merged = @{}
  if ($currentFeed -and $currentFeed.devices) {
    foreach ($device in @($currentFeed.devices)) {
      $record = New-TrackingDeviceRecord $device $fallbackAreaId $now
      if ($record) {
        $merged[$record.id] = $record
      }
    }
  }
  foreach ($device in @($normalized)) {
    $merged[$device.id] = $device
  }

  $devices = @(
    $merged.GetEnumerator() |
      Sort-Object Name |
      ForEach-Object { $_.Value }
  )

  $history = Merge-DeviceHistory (Read-JsonFile $HistoryFeedPath) $normalized
  $events = Merge-TrackingEvents @((Read-JsonFile $EventFeedPath)) $devices $normalized

  $feedPayload = [ordered]@{
    fetchedAt = $now.ToString("o")
    deviceCount = $devices.Count
    devices = $devices
  }

  Write-JsonFile $LiveFeedPath $feedPayload
  Write-JsonFile $HistoryFeedPath $history
  Write-JsonFile $EventFeedPath $events

  return @{
    ok = $true
    mode = "ingest"
    savedCount = $normalized.Count
    deviceCount = $devices.Count
    fetchedAt = $feedPayload.fetchedAt
    devices = $devices
    message = "Telemetria recibida correctamente."
  }
}

function Get-LiveTrackingPayload($Body) {
  $areaId = Normalize-AreaId $(if ($Body -and $Body.PSObject.Properties.Name -contains "areaId") { [string]$Body.areaId } else { "all" }) "all"
  $feed = Read-JsonFile $LiveFeedPath
  $history = Read-JsonFile $HistoryFeedPath
  $events = Read-JsonFile $EventFeedPath
  $devices = @()
  if ($feed -and $feed.devices) {
    foreach ($device in @($feed.devices)) {
      $deviceAreaId = Normalize-AreaId ([string]$device.areaId) $TrackingConfig.defaultAreaId
      if ($areaId -ne "all" -and $deviceAreaId -ne $areaId) {
        continue
      }
      $devices += [pscustomobject]@{
        id = [string]$device.id
        label = [string]$device.label
        deviceType = [string]$device.deviceType
        mobilityMode = [string]$device.mobilityMode
        areaId = $deviceAreaId
        lat = [Math]::Round((Convert-ToInvariantDouble $device.lat 0), 6)
        lon = [Math]::Round((Convert-ToInvariantDouble $device.lon 0), 6)
        speedKmh = [Math]::Round((Convert-ToInvariantDouble $device.speedKmh 0), 1)
        headingDeg = [Math]::Round((Convert-ToInvariantDouble $device.headingDeg 0), 0)
        batteryPct = Convert-ToNullableInvariantInt $device.batteryPct
        accuracyM = [Math]::Round((Convert-ToInvariantDouble $device.accuracyM 8), 1)
        altitudeM = Convert-ToNullableInvariantDouble $device.altitudeM
        verticalSpeedMps = Convert-ToNullableInvariantDouble $device.verticalSpeedMps
        homeLat = Convert-ToNullableInvariantDouble $device.homeLat
        homeLon = Convert-ToNullableInvariantDouble $device.homeLon
        flightStatus = if ($device.flightStatus) { [string]$device.flightStatus } else { $null }
        statusLabel = if ($device.statusLabel) { [string]$device.statusLabel } else { "En seguimiento" }
        source = if ($device.source) { [string]$device.source } else { "gps" }
        timestamp = Convert-ToIsoTimestamp ([string]$device.timestamp)
      }
    }
  }

  $historyMap = @{}
  if ($history) {
    foreach ($entry in $history.PSObject.Properties) {
      if (-not ($devices.id -contains $entry.Name)) {
        continue
      }
      $historyMap[$entry.Name] = @(
        foreach ($point in @($entry.Value)) {
          [pscustomobject]@{
            lat = [Math]::Round((Convert-ToInvariantDouble $point.lat 0), 6)
            lon = [Math]::Round((Convert-ToInvariantDouble $point.lon 0), 6)
            timestamp = Convert-ToIsoTimestamp ([string]$point.timestamp)
          }
        }
      )
    }
  }

  return @{
    ok = $true
    fetchedAt = if ($feed -and $feed.fetchedAt) { [string]$feed.fetchedAt } else { (Get-Date).ToString("o") }
    areaId = $areaId
    deviceCount = $devices.Count
    devices = $devices
    history = [pscustomobject]$historyMap
    events = @($events | Select-Object -First 25)
    message = if ($devices.Count -gt 0) { "Seguimiento en tiempo real listo." } else { "Aun no hay telemetria recibida." }
  }
}

function Read-StaticFile([string]$RequestPath) {
  if (-not $StaticFiles.ContainsKey($RequestPath)) {
    return $null
  }

  $relativePath = $StaticFiles[$RequestPath]
  $absolutePath = Join-Path $PublicRoot $relativePath
  if (-not (Test-Path -LiteralPath $absolutePath)) {
    return $null
  }

  return @{
    Bytes = [System.IO.File]::ReadAllBytes($absolutePath)
    ContentType = Get-ContentType $absolutePath
  }
}

Ensure-ParentDirectory $LiveFeedPath
Ensure-ParentDirectory $HistoryFeedPath
Ensure-ParentDirectory $EventFeedPath

$ip = [System.Net.IPAddress]::Parse($BindAddress)
$listener = [System.Net.Sockets.TcpListener]::new($ip, $Port)
$listener.Start()
Write-Host ("GeoTrack RT activo en http://{0}:{1}" -f $BindAddress, $Port) -ForegroundColor Green

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $request = Read-Request $client
      $stream = $request.Stream
      if ($request.Method -eq "OPTIONS") {
        Write-Response $stream 204 "text/plain; charset=utf-8" ([byte[]]@())
        continue
      }

      if ($request.Path -eq "/api/health") {
        Write-Json $stream 200 @{
          ok = $true
          product = $TrackingConfig.productName
          startedAt = $StartedAt
          fetchedAt = (Get-Date).ToString("o")
        }
        continue
      }

      if ($request.Path -eq "/api/tracking/config") {
        Write-Json $stream 200 (Get-PublicTrackingConfig)
        continue
      }

      if ($request.Path -eq "/api/tracking/network") {
        Write-Json $stream 200 @{
          ok = $true
          bindAddress = $BindAddress
          port = $Port
          publicOrigin = $TrackingConfig.publicOrigin
          shareIngestTokenInSenderLinks = $TrackingConfig.shareIngestTokenInSenderLinks
          hasIngestToken = -not [string]::IsNullOrWhiteSpace($TrackingConfig.ingestToken)
          senderToken = if ($TrackingConfig.shareIngestTokenInSenderLinks) { $TrackingConfig.ingestToken } else { "" }
          addresses = Get-LocalNetworkHints $Port
        }
        continue
      }

      if ($request.Path -eq "/api/tracking/live" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        Write-Json $stream 200 (Get-LiveTrackingPayload $body)
        continue
      }

      if ($request.Path -eq "/api/tracking/ingest" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        $result = Save-TrackingFeed $body $request.Headers
        if ($result.ok) {
          Write-Json $stream 200 $result
        } else {
          Write-Json $stream $(if ($result.error -eq "Token de ingesta invalido.") { 401 } else { 400 }) $result
        }
        continue
      }

      $staticFile = Read-StaticFile $request.Path
      if ($staticFile) {
        Write-Response $stream 200 $staticFile.ContentType $staticFile.Bytes
        continue
      }

      Write-Json $stream 404 @{ ok = $false; error = "Ruta no encontrada."; path = $request.Path }
    } catch {
      Write-Json $stream 500 @{ ok = $false; error = $_.Exception.Message }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
