param(
  [int]$Port = 8765,
  [string]$BindAddress = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = [System.IO.Path]::GetFullPath($Root)
$Cache = @{}
$StaticFiles = @{
  "/" = "index.html"
  "/index.html" = "index.html"
  "/styles.css" = "styles.css"
  "/app.js" = "app.js"
  "/.nojekyll" = ".nojekyll"
}

$Planning3dDatasets = @{
  buildings = @{
    label = "Construcciones"
    baseRelativePath = "construcciones 31/construcciones_31oct"
    shpPath = Join-Path $Root "construcciones 31\construcciones_31oct.shp"
    dbfPath = Join-Path $Root "construcciones 31\construcciones_31oct.dbf"
    prjPath = Join-Path $Root "construcciones 31\construcciones_31oct.prj"
    floorsField = "n_piso"
  }
  parcels = @{
    label = "Catastro"
    baseRelativePath = "CATASTRO 2026/CATASTRO_2026"
    shpPath = Join-Path $Root "CATASTRO 2026\CATASTRO_2026.shp"
    dbfPath = Join-Path $Root "CATASTRO 2026\CATASTRO_2026.dbf"
    prjPath = Join-Path $Root "CATASTRO 2026\CATASTRO_2026.prj"
  }
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

function Get-ContentType([string]$FilePath) {
  switch ([System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".geojson" { return "application/geo+json; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".webp" { return "image/webp" }
    ".shp" { return "application/octet-stream" }
    ".shx" { return "application/octet-stream" }
    ".dbf" { return "application/octet-stream" }
    ".prj" { return "text/plain; charset=utf-8" }
    ".cpg" { return "text/plain; charset=utf-8" }
    ".tif" { return "image/tiff" }
    ".tiff" { return "image/tiff" }
    default { return "application/octet-stream" }
  }
}

function Convert-ToUrlPath([string]$RelativePath) {
  if ([string]::IsNullOrWhiteSpace($RelativePath)) {
    return "/"
  }

  $segments = $RelativePath -split "[\\/]+" | Where-Object { $_ }
  return "/" + (($segments | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join "/")
}

function Resolve-ProjectFile([string]$RequestPath) {
  if ([string]::IsNullOrWhiteSpace($RequestPath) -or $RequestPath -eq "/") {
    return $null
  }

  $decodedPath = [System.Uri]::UnescapeDataString($RequestPath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($decodedPath)) {
    return $null
  }
  if ($decodedPath -match "(^|[\\/])\.git([\\/]|$)") {
    return $null
  }

  $candidate = [System.IO.Path]::GetFullPath((Join-Path $RootPath $decodedPath))
  $rootWithSeparator = $RootPath.TrimEnd("\/") + [System.IO.Path]::DirectorySeparatorChar
  if (-not $candidate.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }
  $allowedExtensions = @(
    ".html", ".css", ".js", ".json", ".geojson",
    ".svg", ".png", ".jpg", ".jpeg", ".webp",
    ".shp", ".shx", ".dbf", ".prj", ".cpg", ".tif", ".tiff"
  )
  if ($allowedExtensions -notcontains [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()) {
    return $null
  }

  if (-not [System.IO.File]::Exists($candidate)) {
    return $null
  }

  return $candidate
}

function Get-Planning3dDatasetInfo([string]$DatasetKey) {
  if (-not $Planning3dDatasets.ContainsKey($DatasetKey)) {
    return $null
  }
  return $Planning3dDatasets[$DatasetKey]
}

function Get-ShapefileBounds([string]$Path) {
  if (-not [System.IO.File]::Exists($Path)) {
    return $null
  }

  $fs = [System.IO.File]::OpenRead($Path)
  try {
    $br = [System.IO.BinaryReader]::new($fs)
    $fs.Position = 36
    return @{
      xmin = [Math]::Round($br.ReadDouble(), 4)
      ymin = [Math]::Round($br.ReadDouble(), 4)
      xmax = [Math]::Round($br.ReadDouble(), 4)
      ymax = [Math]::Round($br.ReadDouble(), 4)
    }
  } finally {
    $fs.Dispose()
  }
}

function Get-DbfSchema([string]$Path) {
  if (-not [System.IO.File]::Exists($Path)) {
    return $null
  }

  $fs = [System.IO.File]::OpenRead($Path)
  try {
    $br = [System.IO.BinaryReader]::new($fs)
    $null = $br.ReadBytes(4)
    $recordCount = $br.ReadInt32()
    $headerLength = $br.ReadInt16()
    $recordLength = $br.ReadInt16()
    $fs.Position = 32
    $fields = @()

    while ($fs.Position -lt ($headerLength - 1)) {
      $nameBytes = $br.ReadBytes(11)
      if ($nameBytes.Length -lt 11 -or $nameBytes[0] -eq 0x0D) {
        break
      }

      $name = ([System.Text.Encoding]::ASCII.GetString($nameBytes)).Trim([char]0x00).Trim()
      $type = [char]$br.ReadByte()
      $null = $br.ReadBytes(4)
      $length = $br.ReadByte()
      $decimals = $br.ReadByte()
      $null = $br.ReadBytes(14)

      $fields += [pscustomobject]@{
        Name = $name
        Type = $type
        Length = $length
        Decimals = $decimals
      }
    }

    $offset = 1
    foreach ($field in $fields) {
      $field | Add-Member -NotePropertyName Offset -NotePropertyValue $offset
      $offset += $field.Length
    }

    return @{
      RecordCount = $recordCount
      HeaderLength = $headerLength
      RecordLength = $recordLength
      Fields = $fields
    }
  } finally {
    $fs.Dispose()
  }
}

function Get-DbfValue([byte[]]$RecordBytes, $Field) {
  if (-not $Field) {
    return ""
  }

  return ([System.Text.Encoding]::ASCII.GetString($RecordBytes, $Field.Offset, $Field.Length)).Trim()
}

function Convert-FloorCodeToInt([string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) {
    return 0
  }

  $match = [System.Text.RegularExpressions.Regex]::Match($Value, "\d+")
  if (-not $match.Success) {
    return 0
  }

  return [int]$match.Value
}

function Get-Building3dMetadata() {
  $cacheKey = "planning3d|building-meta"
  $cached = Get-Cached $cacheKey 3600
  if ($cached) {
    return $cached
  }

  $dataset = Get-Planning3dDatasetInfo "buildings"
  if (-not $dataset -or -not [System.IO.File]::Exists($dataset.dbfPath)) {
    return @{ available = $false; message = "No se encontro el DBF de construcciones." }
  }

  $schema = Get-DbfSchema $dataset.dbfPath
  $fieldLookup = @{}
  foreach ($field in $schema.Fields) {
    $fieldLookup[$field.Name] = $field
  }

  $idField = $fieldLookup["id"]
  $blockField = $fieldLookup["bloque_id"]
  $floorsField = $fieldLookup[$dataset.floorsField]

  $ids = [System.Collections.Generic.List[int]]::new()
  $blockIds = [System.Collections.Generic.List[int]]::new()
  $floors = [System.Collections.Generic.List[int]]::new()
  $heights = [System.Collections.Generic.List[double]]::new()

  $knownFloorCount = 0
  $estimatedFloorCount = 0
  $floorTotal = 0.0
  $heightTotal = 0.0
  $minFloors = [int]::MaxValue
  $maxFloors = 0

  $fs = [System.IO.File]::OpenRead($dataset.dbfPath)
  try {
    $br = [System.IO.BinaryReader]::new($fs)
    for ($index = 0; $index -lt $schema.RecordCount; $index++) {
      $fs.Position = $schema.HeaderLength + ($index * $schema.RecordLength)
      $recordBytes = $br.ReadBytes($schema.RecordLength)
      if ($recordBytes.Length -lt $schema.RecordLength) {
        break
      }

      $buildingIdRaw = Get-DbfValue $recordBytes $idField
      $blockIdRaw = Get-DbfValue $recordBytes $blockField
      $floorCode = Get-DbfValue $recordBytes $floorsField
      $floorCount = Convert-FloorCodeToInt $floorCode

      if ($floorCount -gt 0) {
        $knownFloorCount++
      } else {
        $estimatedFloorCount++
        $floorCount = 1
      }

      $heightM = [Math]::Round(1.2 + ($floorCount * 3.05), 1)
      $buildingId = if ([string]::IsNullOrWhiteSpace($buildingIdRaw)) { 0 } else { [int]$buildingIdRaw }
      $blockId = if ([string]::IsNullOrWhiteSpace($blockIdRaw)) { 0 } else { [int]$blockIdRaw }

      $ids.Add($buildingId)
      $blockIds.Add($blockId)
      $floors.Add($floorCount)
      $heights.Add($heightM)

      $floorTotal += $floorCount
      $heightTotal += $heightM
      $minFloors = [Math]::Min($minFloors, $floorCount)
      $maxFloors = [Math]::Max($maxFloors, $floorCount)
    }
  } finally {
    $fs.Dispose()
  }

  $recordCount = $floors.Count
  $payload = @{
    available = $true
    projection = "EPSG:32717"
    recordCount = $recordCount
    ids = $ids.ToArray()
    blockIds = $blockIds.ToArray()
    floors = $floors.ToArray()
    heights = $heights.ToArray()
    stats = @{
      knownFloorCount = $knownFloorCount
      estimatedFloorCount = $estimatedFloorCount
      minFloors = if ($recordCount -gt 0) { $minFloors } else { 0 }
      maxFloors = $maxFloors
      meanFloors = if ($recordCount -gt 0) { [Math]::Round($floorTotal / $recordCount, 2) } else { 0 }
      meanHeightM = if ($recordCount -gt 0) { [Math]::Round($heightTotal / $recordCount, 2) } else { 0 }
    }
  }

  Set-Cached $cacheKey $payload
  return $payload
}

function Get-Planning3dManifest() {
  $cacheKey = "planning3d|manifest"
  $cached = Get-Cached $cacheKey 3600
  if ($cached) {
    return $cached
  }

  $buildings = Get-Planning3dDatasetInfo "buildings"
  $parcels = Get-Planning3dDatasetInfo "parcels"
  $buildingSchema = if ($buildings) { Get-DbfSchema $buildings.dbfPath } else { $null }
  $parcelSchema = if ($parcels) { Get-DbfSchema $parcels.dbfPath } else { $null }
  $buildingMeta = if ($buildings) { Get-Building3dMetadata } else { $null }

  $payload = @{
    ok = $true
    projection = "EPSG:32717"
    planning3dReady = [bool]($buildings -and $parcels)
    buildings = @{
      available = [bool]($buildings -and [System.IO.File]::Exists($buildings.shpPath))
      label = $buildings.label
      basePath = Convert-ToUrlPath $buildings.baseRelativePath
      bounds = if ($buildings) { Get-ShapefileBounds $buildings.shpPath } else { $null }
      recordCount = if ($buildingSchema) { $buildingSchema.RecordCount } else { 0 }
      floorsField = $buildings.floorsField
      stats = if ($buildingMeta) { $buildingMeta.stats } else { $null }
    }
    parcels = @{
      available = [bool]($parcels -and [System.IO.File]::Exists($parcels.shpPath))
      label = $parcels.label
      basePath = Convert-ToUrlPath $parcels.baseRelativePath
      bounds = if ($parcels) { Get-ShapefileBounds $parcels.shpPath } else { $null }
      recordCount = if ($parcelSchema) { $parcelSchema.RecordCount } else { 0 }
    }
  }

  Set-Cached $cacheKey $payload
  return $payload
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
      if ($request.Path -eq "/api/planning/3d/manifest") {
        $result = Get-Planning3dManifest
        Write-Json $stream 200 $result
        continue
      }
      if ($request.Path -eq "/api/planning/3d/building-meta") {
        $result = Get-Building3dMetadata
        Write-Json $stream 200 $result
        continue
      }
      if ($StaticFiles.ContainsKey($request.Path)) {
        $filePath = Join-Path $Root $StaticFiles[$request.Path]
        Write-Response $stream 200 (Get-ContentType $filePath) ([System.IO.File]::ReadAllBytes($filePath))
        continue
      }
      $projectFile = Resolve-ProjectFile $request.Path
      if ($projectFile) {
        Write-Response $stream 200 (Get-ContentType $projectFile) ([System.IO.File]::ReadAllBytes($projectFile))
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
