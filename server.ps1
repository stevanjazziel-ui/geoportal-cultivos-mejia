param(
  [int]$Port = 8765,
  [string]$BindAddress = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Cache = @{}
$StaticFiles = @{
  "/" = "index.html"
  "/index.html" = "index.html"
  "/styles.css" = "styles.css"
  "/app.js" = "app.js"
  "/.nojekyll" = ".nojekyll"
}

function Clamp([double]$Value, [double]$Min, [double]$Max) {
  return [Math]::Min([Math]::Max($Value, $Min), $Max)
}

function Noise([double]$X, [double]$Y, [double]$Seed) {
  $value = [Math]::Sin(($X + $Seed) * 12.9898 + ($Y - $Seed) * 78.233) * 43758.5453
  return ($value - [Math]::Floor($value)) * 2 - 1
}

function Get-SceneAges($Image) {
  $reference = if ($Image.datetime) { [datetime]$Image.datetime } else { [datetime]"$($Image.date)T00:00:00Z" }
  return [Math]::Max(0, [Math]::Round(([datetime]::UtcNow - $reference.ToUniversalTime()).TotalDays))
}

function Get-Confidence($Image) {
  $cloud = if ($null -ne $Image.cloud) { [double]$Image.cloud } else { 35 }
  $freshness = Get-SceneAges $Image
  $sourceBonus = if ($Image.source -eq "real") { 12 } else { 0 }
  return [Math]::Round((Clamp (92 - $cloud * 0.55 - [Math]::Min($freshness * 1.4, 24) + $sourceBonus) 28 98))
}

function Get-BaseIndices($SceneId, $CloudCover) {
  $cloudPenalty = if ($null -ne $CloudCover) { [double]$CloudCover / 100 } else { 0.25 }
  $seed = 0
  foreach ($char in $SceneId.ToCharArray()) { $seed += [int][char]$char }
  $base = Clamp (0.74 - $cloudPenalty * 0.22 + (Noise $seed $cloudPenalty 3) * 0.04) 0.28 0.82
  return @{
    NDVI = Clamp $base 0.2 0.92
    NDWI = Clamp (0.2 - $cloudPenalty * 0.08 + (Noise $seed $cloudPenalty 5) * 0.05) -0.12 0.42
    NDRE = Clamp ($base - 0.23 + (Noise $seed $cloudPenalty 7) * 0.04) 0.12 0.62
    MSAVI = Clamp ($base - 0.05 + (Noise $seed $cloudPenalty 11) * 0.04) 0.18 0.86
  }
}

function Get-Cached($Key, [int]$TtlSeconds) {
  if (-not $script:Cache.ContainsKey($Key)) { return $null }
  $entry = $script:Cache[$Key]
  if (((Get-Date) - $entry.Timestamp).TotalSeconds -gt $TtlSeconds) { $script:Cache.Remove($Key); return $null }
  return $entry.Payload
}

function Set-Cached($Key, $Payload) {
  $script:Cache[$Key] = @{ Timestamp = Get-Date; Payload = $Payload }
}

function Invoke-StacSearch($Body) {
  $bbox = ($Body.bbox | ForEach-Object { [string]$_ }) -join ","
  $fields = "id,geometry,bbox,collection,assets.thumbnail,properties.datetime,properties.eo:cloud_cover,properties.grid:code,properties.platform,properties.sat:relative_orbit,properties.processing:level,properties.product:timeliness_category"
  $uri = "https://stac.dataspace.copernicus.eu/v1/search?collections=sentinel-2-l2a&limit=18&bbox=$bbox&datetime=$($Body.start)T00:00:00Z/$($Body.end)T23:59:59Z&fields=$fields"
  $payload = Invoke-RestMethod -Uri $uri -Headers @{ Accept = "application/geo+json" } -TimeoutSec 30
  $images = @()

  foreach ($feature in @($payload.features)) {
    $cloud = [double]$feature.properties.'eo:cloud_cover'
    if (($null -ne $Body.maxCloud) -and $cloud -gt [double]$Body.maxCloud) { continue }
    $platform = if ($feature.properties.platform) { "$($feature.properties.platform)".ToUpper().Replace("SENTINEL-", "Sentinel-") } else { "Sentinel-2" }
    $gridCode = if ($feature.properties.'grid:code') { $feature.properties.'grid:code' } else { "Sin grilla" }
    $orbitValue = $feature.properties.'sat:relative_orbit'
    $orbit = if ($null -ne $orbitValue) { "R$("{0:D3}" -f [int]$orbitValue)" } else { "Sin orbita" }
    $selfLink = (@($feature.links) | Where-Object { $_.rel -eq "self" } | Select-Object -First 1).href
    $images += @{
      id = $feature.id
      title = "$platform / $gridCode"
      date = "$($feature.properties.datetime)".Substring(0, 10)
      datetime = $feature.properties.datetime
      cloud = [Math]::Round($cloud, 2)
      orbit = $orbit
      note = "Escena real desde Copernicus STAC. Nivel $($feature.properties.'processing:level') y disponibilidad $($feature.properties.'product:timeliness_category')."
      thumbnail = $feature.assets.thumbnail.href
      stacLink = $selfLink
      geometry = $feature.geometry
      bbox = $feature.bbox
      source = "real"
      baseIndices = Get-BaseIndices $feature.id $cloud
    }
  }

  return @{ images = $images; fetchedAt = (Get-Date).ToString("o") }
}

function Invoke-Analysis($Body) {
  $image = $Body.image
  $target = $Body.target
  $freshness = Get-SceneAges $image
  $confidence = Get-Confidence $image
  $areaHa = [double]$target.areaHa
  $summary = @{}
  foreach ($indexKey in @("NDVI", "NDWI", "NDRE", "MSAVI")) {
    $base = [double]$image.baseIndices.$indexKey
    $mean = Clamp ($base + (Noise $target.centroid[0] $target.centroid[1] $areaHa) * 0.04 + (18 - [Math]::Min($freshness, 18)) / 18 * 0.02) -0.2 1
    $spread = Clamp (0.04 + (100 - $confidence) / 500 + (Noise $areaHa $freshness 7) * 0.02) 0.025 0.18
    $summary[$indexKey] = @{
      mean = [Math]::Round($mean, 4)
      p10 = [Math]::Round($mean - $spread, 4)
      p90 = [Math]::Round($mean + $spread, 4)
      variability = [Math]::Round($spread * 180)
    }
  }
  $high = [Math]::Round((Clamp (24 + ($summary.NDVI.mean - 0.58) * 120 - $summary.NDVI.variability * 0.16) 10 58))
  $low = [Math]::Round((Clamp (18 + (0.56 - $summary.NDVI.mean) * 135 + $summary.NDVI.variability * 0.2 + $areaHa * 0.01) 8 56))
  $medium = [Math]::Max(100 - $high - $low, 8)
  $recommended = if ($summary.NDWI.mean -lt 0.12) { "NDWI" } elseif ($summary.NDRE.mean -lt 0.3) { "NDRE" } elseif ($summary.NDVI.variability -gt 24) { "MSAVI" } else { "NDVI" }
  return @{
    summary = $summary
    quality = @{ confidenceScore = $confidence; coveragePct = [Math]::Round((Clamp ($confidence * 0.9 - [Math]::Min([Math]::Log10($areaHa + 1) * 6, 14)) 42 99)); freshnessDays = $freshness }
    management = @{ high = $high; medium = $medium; low = [Math]::Max(100 - $high - $medium, 8) }
    diagnostics = @{ recommendedIndex = $recommended; alertLevel = if ($confidence -lt 55) { "Seguimiento prioritario" } else { "Condicion estable" } }
    generatedAt = (Get-Date).ToString("o")
  }
}

function Get-StatusText([int]$StatusCode) {
  switch ($StatusCode) {
    200 { "OK" }
    204 { "No Content" }
    404 { "Not Found" }
    default { "Internal Server Error" }
  }
}

function Write-Response($Stream, [int]$StatusCode, [string]$ContentType, [byte[]]$BodyBytes) {
  $headers = "HTTP/1.1 $StatusCode $(Get-StatusText $StatusCode)`r`nContent-Type: $ContentType`r`nContent-Length: $($BodyBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccess-Control-Allow-Methods: GET, POST, OPTIONS`r`nAccess-Control-Allow-Headers: Content-Type`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($BodyBytes.Length -gt 0) { $Stream.Write($BodyBytes, 0, $BodyBytes.Length) }
  $Stream.Flush()
}

function Write-Json($Stream, [int]$StatusCode, $Body) {
  Write-Response $Stream $StatusCode "application/json; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 8)))
}

function Read-Request($Client) {
  $stream = $Client.GetStream()
  $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8, $false, 1024, $true)
  $requestLine = $reader.ReadLine()
  if ([string]::IsNullOrWhiteSpace($requestLine)) { return @{ Stream = $stream; Method = ""; Path = "/"; Body = "" } }
  $parts = $requestLine.Split(" ")
  $headers = @{}
  while ($true) {
    $line = $reader.ReadLine()
    if ([string]::IsNullOrEmpty($line)) { break }
    $pair = $line.Split(":", 2)
    if ($pair.Length -eq 2) { $headers[$pair[0].Trim()] = $pair[1].Trim() }
  }
  $contentLength = if ($headers.ContainsKey("Content-Length")) { [int]$headers["Content-Length"] } else { 0 }
  $body = ""
  if ($contentLength -gt 0) {
    $buffer = New-Object char[] $contentLength
    $read = 0
    while ($read -lt $contentLength) {
      $chunk = $reader.Read($buffer, $read, $contentLength - $read)
      if ($chunk -le 0) { break }
      $read += $chunk
    }
    $body = -join $buffer[0..($read - 1)]
  }
  $path = $parts[1].Split("?")[0]
  return @{ Stream = $stream; Method = $parts[0]; Path = $path; Body = $body }
}

$ip = [System.Net.IPAddress]::Parse($BindAddress)
$listener = [System.Net.Sockets.TcpListener]::new($ip, $Port)
$listener.Start()
Write-Host "Geoportal backend activo en http://$BindAddress`:$Port"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $request = Read-Request $client
      $stream = $request.Stream
      if ($request.Method -eq "OPTIONS") { Write-Response $stream 204 "text/plain; charset=utf-8" ([byte[]]@()); continue }
      if ($request.Path -eq "/api/health") { Write-Json $stream 200 @{ ok = $true; cacheEntries = $Cache.Count; startedAt = (Get-Date).ToString("o") }; continue }
      if ($request.Path -eq "/api/stac/search" -and $request.Method -eq "POST") {
        $key = "search|$($request.Body)"; $cached = Get-Cached $key 900
        if ($cached) { Write-Json $stream 200 @{ images = $cached.images; fetchedAt = $cached.fetchedAt; cacheHit = $true; cacheEntries = $Cache.Count }; continue }
        $result = Invoke-StacSearch ($request.Body | ConvertFrom-Json); Set-Cached $key $result
        Write-Json $stream 200 @{ images = $result.images; fetchedAt = $result.fetchedAt; cacheHit = $false; cacheEntries = $Cache.Count }; continue
      }
      if ($request.Path -eq "/api/indices/analyze" -and $request.Method -eq "POST") {
        $key = "analysis|$($request.Body)"; $cached = Get-Cached $key 1800
        if ($cached) { Write-Json $stream 200 @{ summary = $cached.summary; quality = $cached.quality; management = $cached.management; diagnostics = $cached.diagnostics; generatedAt = $cached.generatedAt; cacheHit = $true; cacheEntries = $Cache.Count }; continue }
        $result = Invoke-Analysis ($request.Body | ConvertFrom-Json); Set-Cached $key $result
        Write-Json $stream 200 @{ summary = $result.summary; quality = $result.quality; management = $result.management; diagnostics = $result.diagnostics; generatedAt = $result.generatedAt; cacheHit = $false; cacheEntries = $Cache.Count }; continue
      }
      if ($StaticFiles.ContainsKey($request.Path)) {
        $filePath = Join-Path $Root $StaticFiles[$request.Path]
        $contentType = switch ([System.IO.Path]::GetExtension($filePath).ToLowerInvariant()) {
          ".html" { "text/html; charset=utf-8" }
          ".css" { "text/css; charset=utf-8" }
          ".js" { "application/javascript; charset=utf-8" }
          default { "text/plain; charset=utf-8" }
        }
        Write-Response $stream 200 $contentType ([System.IO.File]::ReadAllBytes($filePath))
        continue
      }
      Write-Json $stream 404 @{ error = "Ruta no encontrada."; path = $request.Path }
    } catch {
      try { Write-Json $request.Stream 500 @{ error = $_.Exception.Message; path = $request.Path } } catch { }
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
