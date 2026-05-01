param(
  [int]$Port = 8765,
  [string]$BindAddress = "0.0.0.0"
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
  "/gps-bridge.html" = "gps-bridge.html"
  "/gps-sender" = "gps-bridge.html"
  "/gps-sender.html" = "gps-bridge.html"
  "/gps-bridge.webmanifest" = "gps-bridge.webmanifest"
  "/gps-bridge-sw.js" = "gps-bridge-sw.js"
  "/gps-bridge-icon.svg" = "gps-bridge-icon.svg"
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

$Planning3dPhotoRoot = "E:\FOTOS MACHACHI"
$AgronomyInamhiLiveFeedPath = Join-Path $Root "data\inamhi_live_feed.json"
$AgronomyGpsLiveFeedPath = Join-Path $Root "data\gps_live_feed.json"
$AgronomyGpsGeofenceEventsPath = Join-Path $Root "data\gps_geofence_events.json"
$AgronomyGpsLiveMemory = $null
$AgronomyGpsGeofenceMemory = $null
$AgronomyRealtimeStations = @(
  @{
    stationCode = "M120"
    name = "EMA Machachi"
    provider = "INAMHI"
    areaIds = @("mejia", "machachi")
    lat = -0.4900
    lon = -78.5800
  },
  @{
    stationCode = "M113"
    name = "EMA Aloag"
    provider = "INAMHI"
    areaIds = @("mejia", "machachi")
    lat = -0.4700
    lon = -78.6800
  },
  @{
    stationCode = "M003"
    name = "EMA Tambillo"
    provider = "INAMHI"
    areaIds = @("mejia", "machachi")
    lat = -0.4500
    lon = -78.5200
  },
  @{
    stationCode = "M363"
    name = "EMA Cutuglagua"
    provider = "INAMHI"
    areaIds = @("mejia", "cutuglagua")
    lat = -0.3660
    lon = -78.5940
  },
  @{
    stationCode = "M116"
    name = "EMA Quevedo"
    provider = "INAMHI"
    areaIds = @("quevedo")
    lat = -1.0280
    lon = -79.4680
  },
  @{
    stationCode = "M354"
    name = "INIAP Pichilingue"
    provider = "INIAP / INAMHI"
    areaIds = @("quevedo")
    lat = -1.0490
    lon = -79.4970
  },
  @{
    stationCode = "M362"
    name = "EMA San Carlos"
    provider = "INAMHI"
    areaIds = @("quevedo")
    lat = -1.0140
    lon = -79.4460
  }
)
$AgronomyGpsRoutes = @{
  mejia = @(
    @{
      id = "tractor-mejia-01"
      label = "Tractor demostrativo Mejia"
      deviceType = "Maquinaria"
      mobilityMode = "ground"
      route = @(
        @(-78.618, -0.490),
        @(-78.612, -0.504),
        @(-78.602, -0.503),
        @(-78.598, -0.492),
        @(-78.607, -0.485),
        @(-78.618, -0.490)
      )
    },
    @{
      id = "brigada-mejia-02"
      label = "Brigada de campo Mejia"
      deviceType = "Brigada"
      mobilityMode = "ground"
      route = @(
        @(-78.560, -0.463),
        @(-78.552, -0.479),
        @(-78.541, -0.476),
        @(-78.544, -0.462),
        @(-78.560, -0.463)
      )
    },
    @{
      id = "dron-mejia-03"
      label = "Dron de reconocimiento Mejia"
      deviceType = "Dron"
      mobilityMode = "air"
      homePoint = @(-78.607, -0.486)
      altitudeBaseM = 82
      altitudeSwingM = 18
      climbSwingMps = 1.8
      cruiseSpeedKmh = 38
      route = @(
        @(-78.612, -0.486),
        @(-78.606, -0.495),
        @(-78.596, -0.494),
        @(-78.593, -0.486),
        @(-78.602, -0.480),
        @(-78.612, -0.486)
      )
    }
  )
  machachi = @(
    @{
      id = "tractor-machachi-01"
      label = "Tractor Machachi"
      deviceType = "Maquinaria"
      mobilityMode = "ground"
      route = @(
        @(-78.603, -0.488),
        @(-78.599, -0.500),
        @(-78.608, -0.509),
        @(-78.621, -0.503),
        @(-78.619, -0.492),
        @(-78.603, -0.488)
      )
    },
    @{
      id = "riego-machachi-02"
      label = "Cuadrilla de riego"
      deviceType = "Brigada"
      mobilityMode = "ground"
      route = @(
        @(-78.589, -0.497),
        @(-78.580, -0.505),
        @(-78.572, -0.514),
        @(-78.579, -0.523),
        @(-78.591, -0.515),
        @(-78.589, -0.497)
      )
    },
    @{
      id = "dron-machachi-03"
      label = "Dron de seguimiento Machachi"
      deviceType = "Dron"
      mobilityMode = "air"
      homePoint = @(-78.603, -0.497)
      altitudeBaseM = 88
      altitudeSwingM = 24
      climbSwingMps = 2.1
      cruiseSpeedKmh = 42
      route = @(
        @(-78.607, -0.493),
        @(-78.596, -0.498),
        @(-78.587, -0.507),
        @(-78.595, -0.516),
        @(-78.609, -0.508),
        @(-78.607, -0.493)
      )
    }
  )
  cutuglagua = @(
    @{
      id = "pickup-cutuglagua-01"
      label = "Camioneta tecnica Cutuglagua"
      deviceType = "Vehiculo"
      mobilityMode = "ground"
      route = @(
        @(-78.602, -0.353),
        @(-78.594, -0.362),
        @(-78.586, -0.370),
        @(-78.579, -0.378),
        @(-78.588, -0.382),
        @(-78.601, -0.372),
        @(-78.602, -0.353)
      )
    },
    @{
      id = "dron-cutuglagua-02"
      label = "Dron de inspeccion Cutuglagua"
      deviceType = "Dron"
      mobilityMode = "air"
      homePoint = @(-78.596, -0.366)
      altitudeBaseM = 76
      altitudeSwingM = 16
      climbSwingMps = 1.5
      cruiseSpeedKmh = 34
      route = @(
        @(-78.598, -0.361),
        @(-78.589, -0.368),
        @(-78.582, -0.375),
        @(-78.589, -0.381),
        @(-78.600, -0.374),
        @(-78.598, -0.361)
      )
    }
  )
  quevedo = @(
    @{
      id = "tractor-quevedo-01"
      label = "Tractor Quevedo"
      deviceType = "Maquinaria"
      mobilityMode = "ground"
      route = @(
        @(-79.503, -1.034),
        @(-79.495, -1.046),
        @(-79.486, -1.044),
        @(-79.489, -1.032),
        @(-79.503, -1.034)
      )
    },
    @{
      id = "brigada-quevedo-02"
      label = "Brigada fitosanitaria"
      deviceType = "Brigada"
      mobilityMode = "ground"
      route = @(
        @(-79.458, -1.014),
        @(-79.451, -1.024),
        @(-79.443, -1.030),
        @(-79.439, -1.020),
        @(-79.447, -1.012),
        @(-79.458, -1.014)
      )
    },
    @{
      id = "riego-quevedo-03"
      label = "Monitoreo drenaje"
      deviceType = "Riego"
      mobilityMode = "ground"
      route = @(
        @(-79.521, -1.064),
        @(-79.514, -1.074),
        @(-79.503, -1.078),
        @(-79.499, -1.069),
        @(-79.507, -1.061),
        @(-79.521, -1.064)
      )
    },
    @{
      id = "avioneta-quevedo-04"
      label = "Avioneta de monitoreo Quevedo"
      deviceType = "Avioneta"
      mobilityMode = "air"
      homePoint = @(-79.473, -1.028)
      altitudeBaseM = 340
      altitudeSwingM = 110
      climbSwingMps = 3.2
      cruiseSpeedKmh = 152
      route = @(
        @(-79.510, -1.020),
        @(-79.485, -1.002),
        @(-79.450, -1.008),
        @(-79.436, -1.030),
        @(-79.447, -1.058),
        @(-79.482, -1.072),
        @(-79.515, -1.056),
        @(-79.510, -1.020)
      )
    }
  )
}
$PlanningOrthophoto = @{
  label = "Ortofoto Machachi"
  tifPath = "E:\Ortofotos\actuales\07 MACHACHI\MACHACHIOTF.TIF"
  worldFilePath = "E:\Ortofotos\actuales\07 MACHACHI\MACHACHIOTF.tfw"
  metadataXmlPath = "E:\Ortofotos\actuales\07 MACHACHI\MACHACHIOTF.TIF.xml"
  auxXmlPath = "E:\Ortofotos\actuales\07 MACHACHI\MACHACHIOTF.TIF.aux.xml"
}
$Planning3dPhotoIndexPath = Join-Path $Root "planning3d_photo_index.json"
$script:Planning3dPhotoIndexJob = $null

function Clamp([double]$Value, [double]$Min, [double]$Max) {
  return [Math]::Min([Math]::Max($Value, $Min), $Max)
}

function Convert-ToInvariantDouble($Value, [double]$Fallback = 0) {
  $parsed = 0.0
  $text = if ($null -eq $Value) { "" } else { [string]$Value }
  if ([double]::TryParse($text, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$parsed)) {
    return $parsed
  }
  return $Fallback
}

function Get-XmlNodeText($Document, [string]$XPath) {
  if (-not $Document) {
    return $null
  }
  $node = $Document.SelectSingleNode($XPath)
  if ($node) {
    return $node.InnerText
  }
  return $null
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

function Get-LocalNetworkHints([int]$TargetPort) {
  $addresses = @()
  foreach ($network in [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
    if ($network.OperationalStatus -ne [System.Net.NetworkInformation.OperationalStatus]::Up) {
      continue
    }
    foreach ($unicast in $network.GetIPProperties().UnicastAddresses) {
      $ip = $unicast.Address
      if ($ip.AddressFamily -ne [System.Net.Sockets.AddressFamily]::InterNetwork) {
        continue
      }
      $text = $ip.ToString()
      if ($text.StartsWith("127.") -or $text.StartsWith("169.254.")) {
        continue
      }
      $addresses += [pscustomobject]@{
        interface = $network.Name
        address = $text
        portalUrl = "http://$text`:$TargetPort/"
        bridgeUrl = "http://$text`:$TargetPort/gps-sender"
      }
    }
  }

  $unique = @{}
  foreach ($entry in $addresses) {
    if (-not $unique.ContainsKey($entry.address)) {
      $unique[$entry.address] = $entry
    }
  }

  return @(
    $unique.GetEnumerator() |
      Sort-Object Name |
      ForEach-Object { $_.Value }
  )
}

function Get-ContentType([string]$FilePath) {
  switch ([System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".webmanifest" { return "application/manifest+json; charset=utf-8" }
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

function Read-PlanningOrthophotoWorldFile([string]$Path) {
  if (-not [System.IO.File]::Exists($Path)) {
    return $null
  }

  $lines = Get-Content -LiteralPath $Path | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  if ($lines.Count -lt 6) {
    return $null
  }

  return @{
    pixelSizeX = Convert-ToInvariantDouble $lines[0]
    rotationX = Convert-ToInvariantDouble $lines[1]
    rotationY = Convert-ToInvariantDouble $lines[2]
    pixelSizeY = Convert-ToInvariantDouble $lines[3]
    originX = Convert-ToInvariantDouble $lines[4]
    originY = Convert-ToInvariantDouble $lines[5]
  }
}

function Get-PlanningOrthophotoInfo() {
  $cacheKey = "planning|orthophoto"
  $cached = Get-Cached $cacheKey 3600
  if ($cached) {
    return $cached
  }

  $tifPath = $PlanningOrthophoto.tifPath
  if (-not [System.IO.File]::Exists($tifPath)) {
    $payload = @{
      available = $false
      label = $PlanningOrthophoto.label
      tifPath = $tifPath
      message = "No se encontro la ortofoto local de Machachi."
    }
    Set-Cached $cacheKey $payload
    return $payload
  }

  $file = Get-Item -LiteralPath $tifPath
  $world = Read-PlanningOrthophotoWorldFile $PlanningOrthophoto.worldFilePath
  $metadataXml = $null
  if ([System.IO.File]::Exists($PlanningOrthophoto.metadataXmlPath)) {
    try {
      $metadataXml = [xml](Get-Content -LiteralPath $PlanningOrthophoto.metadataXmlPath -Raw)
    } catch {
      $metadataXml = $null
    }
  }

  $west = Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//dataExt/geoEle/GeoBndBox/westBL") ([double]::NaN)
  $east = Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//dataExt/geoEle/GeoBndBox/eastBL") ([double]::NaN)
  $south = Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//dataExt/geoEle/GeoBndBox/southBL") ([double]::NaN)
  $north = Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//dataExt/geoEle/GeoBndBox/northBL") ([double]::NaN)
  $pixelResolutionM = if ($world) {
    [Math]::Round([Math]::Abs([double]$world.pixelSizeX), 4)
  } else {
    [Math]::Round([Math]::Abs((Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//axisDimension[@type='002']/dimResol/value") 0)), 4)
  }

  $payload = @{
    available = $true
    label = $PlanningOrthophoto.label
    tifPath = $tifPath
    tifName = $file.Name
    sizeBytes = [int64]$file.Length
    sizeGb = [Math]::Round($file.Length / 1GB, 2)
    modifiedAt = $file.LastWriteTime.ToString("o")
    worldFileAvailable = [bool][System.IO.File]::Exists($PlanningOrthophoto.worldFilePath)
    metadataAvailable = [bool]$metadataXml
    projection = (Get-XmlNodeText $metadataXml "//coordRef/projcsn")
    epsg = (Get-XmlNodeText $metadataXml "//refSysInfo/RefSystem/refSysID/identCode")
    width = [int](Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//axisDimension[@type='002']/dimSize") 0)
    height = [int](Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//axisDimension[@type='001']/dimSize") 0)
    bands = [int](Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//RasterProperties/General/NumBands") 0)
    pixelDepth = [int](Convert-ToInvariantDouble (Get-XmlNodeText $metadataXml "//RasterProperties/General/PixelDepth") 0)
    resolutionM = $pixelResolutionM
    resolutionCm = if ($pixelResolutionM -gt 0) { [Math]::Round($pixelResolutionM * 100, 2) } else { 0 }
    bounds = if ([double]::IsNaN($west) -or [double]::IsNaN($east) -or [double]::IsNaN($south) -or [double]::IsNaN($north)) {
      $null
    } else {
      @{
        west = $west
        east = $east
        south = $south
        north = $north
      }
    }
    directWebReady = $false
    recommendedMode = "local-preview-or-tiles"
    previewUrl = "./public-data/planning3d/machachi_orthophoto_center.jpg"
    message = if ($pixelResolutionM -gt 0) {
      "Ortofoto local detectada con resolucion aproximada de $([Math]::Round($pixelResolutionM * 100, 2)) cm por pixel. Conviene servirla como preview liviano o teselas locales, no abrir el TIFF crudo en navegador."
    } else {
      "Ortofoto local detectada. Conviene servirla como preview liviano o teselas locales, no abrir el TIFF crudo en navegador."
    }
  }

  Set-Cached $cacheKey $payload
  return $payload
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

function Convert-ToPhotoToken([string]$RelativePath) {
  if ([string]::IsNullOrWhiteSpace($RelativePath)) {
    return ""
  }

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($RelativePath)
  return [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function Convert-FromPhotoToken([string]$PhotoToken) {
  if ([string]::IsNullOrWhiteSpace($PhotoToken)) {
    return $null
  }

  try {
    $base64 = $PhotoToken.Replace("-", "+").Replace("_", "/")
    switch ($base64.Length % 4) {
      2 { $base64 += "==" }
      3 { $base64 += "=" }
    }
    return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($base64))
  } catch {
    return $null
  }
}

function Resolve-PlanningPhotoFile([string]$PhotoToken) {
  if (-not (Test-Path -LiteralPath $Planning3dPhotoRoot)) {
    return $null
  }

  $relativePath = Convert-FromPhotoToken $PhotoToken
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    return $null
  }

  $rootPath = [System.IO.Path]::GetFullPath($Planning3dPhotoRoot)
  $candidate = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))
  $rootWithSeparator = $rootPath.TrimEnd("\/") + [System.IO.Path]::DirectorySeparatorChar
  if (-not $candidate.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  $allowedExtensions = @(".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff")
  if ($allowedExtensions -notcontains [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()) {
    return $null
  }

  if (-not [System.IO.File]::Exists($candidate)) {
    return $null
  }

  return $candidate
}

function Get-PhotoGpsDecimal($Image, [int]$RefId, [int]$CoordId) {
  $reference = $Image.PropertyItems | Where-Object Id -eq $RefId | Select-Object -First 1
  $coordinate = $Image.PropertyItems | Where-Object Id -eq $CoordId | Select-Object -First 1
  if (-not $reference -or -not $coordinate -or $coordinate.Value.Length -lt 24) {
    return $null
  }

  $parts = @()
  for ($index = 0; $index -lt 3; $index++) {
    $numerator = [BitConverter]::ToUInt32($coordinate.Value, $index * 8)
    $denominator = [BitConverter]::ToUInt32($coordinate.Value, $index * 8 + 4)
    if ($denominator -eq 0) {
      return $null
    }
    $parts += ($numerator / $denominator)
  }

  $decimal = $parts[0] + ($parts[1] / 60.0) + ($parts[2] / 3600.0)
  $referenceText = ([System.Text.Encoding]::ASCII.GetString($reference.Value)).Trim([char]0)
  if ($referenceText -in @("S", "W")) {
    $decimal *= -1
  }

  return [Math]::Round($decimal, 7)
}

function Get-HaversineMeters([double]$Lat1, [double]$Lon1, [double]$Lat2, [double]$Lon2) {
  $rad = [Math]::PI / 180.0
  $deltaLat = ($Lat2 - $Lat1) * $rad
  $deltaLon = ($Lon2 - $Lon1) * $rad
  $lat1Rad = $Lat1 * $rad
  $lat2Rad = $Lat2 * $rad
  $a = [Math]::Sin($deltaLat / 2) * [Math]::Sin($deltaLat / 2) +
    [Math]::Cos($lat1Rad) * [Math]::Cos($lat2Rad) *
    [Math]::Sin($deltaLon / 2) * [Math]::Sin($deltaLon / 2)
  $c = 2 * [Math]::Atan2([Math]::Sqrt($a), [Math]::Sqrt(1 - $a))
  return 6371000 * $c
}

function Get-PlanningPhotoIndexJobInfo() {
  if (-not $script:Planning3dPhotoIndexJob) {
    return @{
      state = "idle"
      error = $null
    }
  }

  if ($script:Planning3dPhotoIndexJob.State -in @("Completed", "Failed", "Stopped")) {
    $errorText = $null
    try {
      $jobOutput = Receive-Job $script:Planning3dPhotoIndexJob -Keep -ErrorAction SilentlyContinue | Out-String
      if ($script:Planning3dPhotoIndexJob.State -ne "Completed") {
        $errorText = $jobOutput.Trim()
      }
    } catch {
      $errorText = $_.Exception.Message
    }
    Remove-Job $script:Planning3dPhotoIndexJob -Force -ErrorAction SilentlyContinue
    $state = $script:Planning3dPhotoIndexJob.State.ToLowerInvariant()
    $script:Planning3dPhotoIndexJob = $null
    return @{
      state = $state
      error = $errorText
    }
  }

  return @{
    state = $script:Planning3dPhotoIndexJob.State.ToLowerInvariant()
    error = $null
  }
}

function Start-PlanningPhotoIndexJob() {
  $jobInfo = Get-PlanningPhotoIndexJobInfo
  if ($jobInfo.state -in @("running", "notstarted")) {
    return $jobInfo
  }

  if (-not (Test-Path -LiteralPath $Planning3dPhotoRoot)) {
    return @{
      state = "missing"
      error = "No se encontro la carpeta local de fotos."
    }
  }

  $script:Planning3dPhotoIndexJob = Start-Job -ArgumentList $Planning3dPhotoRoot, $Planning3dPhotoIndexPath -ScriptBlock {
    param($photoRoot, $indexPath)
    $ErrorActionPreference = "Stop"
    Add-Type -AssemblyName System.Drawing | Out-Null

    function Convert-ToPhotoToken([string]$RelativePath) {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($RelativePath)
      return [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
    }

    function Get-PhotoGpsDecimal($Image, [int]$RefId, [int]$CoordId) {
      $reference = $Image.PropertyItems | Where-Object Id -eq $RefId | Select-Object -First 1
      $coordinate = $Image.PropertyItems | Where-Object Id -eq $CoordId | Select-Object -First 1
      if (-not $reference -or -not $coordinate -or $coordinate.Value.Length -lt 24) {
        return $null
      }

      $parts = @()
      for ($index = 0; $index -lt 3; $index++) {
        $numerator = [BitConverter]::ToUInt32($coordinate.Value, $index * 8)
        $denominator = [BitConverter]::ToUInt32($coordinate.Value, $index * 8 + 4)
        if ($denominator -eq 0) {
          return $null
        }
        $parts += ($numerator / $denominator)
      }

      $decimal = $parts[0] + ($parts[1] / 60.0) + ($parts[2] / 3600.0)
      $referenceText = ([System.Text.Encoding]::ASCII.GetString($reference.Value)).Trim([char]0)
      if ($referenceText -in @("S", "W")) {
        $decimal *= -1
      }

      return [Math]::Round($decimal, 7)
    }

    $files = Get-ChildItem -LiteralPath $photoRoot -File -Recurse -ErrorAction SilentlyContinue |
      Where-Object { $_.Extension -match '^(?i)\.(jpg|jpeg)$' }
    $photos = [System.Collections.Generic.List[object]]::new()
    $folders = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $rootPath = [System.IO.Path]::GetFullPath($photoRoot)
    $scanStartedAt = Get-Date

    foreach ($file in $files) {
      $image = $null
      try {
        $image = [System.Drawing.Image]::FromFile($file.FullName)
        $lat = Get-PhotoGpsDecimal $image 1 2
        $lon = Get-PhotoGpsDecimal $image 3 4
        if ($null -eq $lat -or $null -eq $lon) {
          continue
        }

        $relativePath = $file.FullName.Substring($rootPath.Length).TrimStart("\/")
        $folderLabel = (Split-Path $relativePath -Parent)
        if ([string]::IsNullOrWhiteSpace($folderLabel)) {
          $folderLabel = "Raiz"
        }
        [void]$folders.Add($folderLabel)
        $token = Convert-ToPhotoToken $relativePath

        $photos.Add([pscustomobject]@{
          id = $token
          fileName = $file.Name
          folder = $folderLabel
          relativePath = $relativePath
          lat = $lat
          lon = $lon
          width = $image.Width
          height = $image.Height
          modifiedAt = $file.LastWriteTime.ToString("o")
          url = "/api/planning/3d/photo/$token"
        })
      } finally {
        if ($image) {
          $image.Dispose()
        }
      }
    }

    $payload = @{
      available = $true
      rootPath = $photoRoot
      totalFiles = $files.Count
      geotaggedCount = $photos.Count
      sampleFolders = @($folders | Select-Object -First 18)
      indexedAt = (Get-Date).ToString("o")
      indexedSeconds = [Math]::Round(((Get-Date) - $scanStartedAt).TotalSeconds, 2)
      photos = $photos.ToArray()
    }

    $payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $indexPath -Encoding UTF8
  }

  return @{
    state = "running"
    error = $null
  }
}

function Read-PlanningPhotoIndexFile() {
  if (-not (Test-Path -LiteralPath $Planning3dPhotoIndexPath)) {
    return $null
  }

  try {
    return Get-Content -LiteralPath $Planning3dPhotoIndexPath -Raw | ConvertFrom-Json
  } catch {
    Remove-Item -LiteralPath $Planning3dPhotoIndexPath -Force -ErrorAction SilentlyContinue
    return $null
  }
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
  $orthophoto = Get-PlanningOrthophotoInfo

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
    orthophoto = $orthophoto
  }

  Set-Cached $cacheKey $payload
  return $payload
}

function Get-PlanningPhotoIndex() {
  $cacheKey = "planning3d|photo-index"
  $cached = Get-Cached $cacheKey 21600
  if ($cached) {
    return $cached
  }

  $jobInfo = Get-PlanningPhotoIndexJobInfo
  $fileIndex = Read-PlanningPhotoIndexFile
  if ($fileIndex) {
    Set-Cached $cacheKey $fileIndex
    return $fileIndex
  }

  if ($jobInfo.state -notin @("running", "notstarted")) {
    [void](Start-PlanningPhotoIndexJob)
  }

  return $null
}

function Get-PlanningPhotoStatus() {
  $index = Get-PlanningPhotoIndex
  $jobInfo = Get-PlanningPhotoIndexJobInfo
  if (-not $index) {
    return @{
      available = [bool](Test-Path -LiteralPath $Planning3dPhotoRoot)
      rootPath = $Planning3dPhotoRoot
      totalFiles = 0
      geotaggedCount = 0
      sampleFolders = @()
      indexedAt = $null
      indexedSeconds = $null
      indexing = [bool]($jobInfo.state -in @("running", "notstarted"))
      jobState = $jobInfo.state
      message = if (-not (Test-Path -LiteralPath $Planning3dPhotoRoot)) {
        "No se encontro la carpeta local de fotos."
      } elseif ($jobInfo.state -eq "failed") {
        "Fallo la indexacion inicial de fotos."
      } else {
        "Indexando fotos georreferenciadas en segundo plano. La primera pasada puede tardar."
      }
      error = $jobInfo.error
    }
  }

  return @{
    available = $index.available
    rootPath = $index.rootPath
    totalFiles = $index.totalFiles
    geotaggedCount = $index.geotaggedCount
    sampleFolders = $index.sampleFolders
    indexedAt = $index.indexedAt
    indexedSeconds = $index.indexedSeconds
    indexing = $false
    jobState = "ready"
    message = $index.message
  }
}

function Find-NearbyPlanningPhotos($Body) {
  $index = Get-PlanningPhotoIndex
  $jobInfo = Get-PlanningPhotoIndexJobInfo
  if (-not $index -or -not $index.available) {
    return @{
      available = [bool](Test-Path -LiteralPath $Planning3dPhotoRoot)
      indexing = [bool]($jobInfo.state -in @("running", "notstarted"))
      rootPath = $Planning3dPhotoRoot
      matches = @()
      totalFiles = 0
      geotaggedCount = 0
      message = if (-not (Test-Path -LiteralPath $Planning3dPhotoRoot)) {
        "No se encontro la carpeta local de fotos."
      } elseif ($jobInfo.state -eq "failed") {
        "Fallo la indexacion de fotos."
      } else {
        "Las fotos se estan indexando en segundo plano. Vuelve a intentar en un momento."
      }
      error = $jobInfo.error
    }
  }

  $lat = [double]$Body.lat
  $lon = [double]$Body.lon
  $radiusM = if ($null -ne $Body.radiusM) { Clamp ([double]$Body.radiusM) 15 250 } else { 70 }
  $limit = if ($null -ne $Body.limit) { [Math]::Min([Math]::Max([int]$Body.limit, 1), 12) } else { 6 }

  $matches = @(
    foreach ($photo in $index.photos) {
      $distanceM = [Math]::Round((Get-HaversineMeters $lat $lon ([double]$photo.lat) ([double]$photo.lon)), 1)
      [pscustomobject]@{
        id = $photo.id
        fileName = $photo.fileName
        folder = $photo.folder
        lat = $photo.lat
        lon = $photo.lon
        width = $photo.width
        height = $photo.height
        modifiedAt = $photo.modifiedAt
        url = $photo.url
        distanceM = $distanceM
        withinRadius = [bool]($distanceM -le $radiusM)
      }
    }
  ) | Sort-Object distanceM | Select-Object -First $limit

  return @{
    available = $true
    indexing = $false
    rootPath = $index.rootPath
    totalFiles = $index.totalFiles
    geotaggedCount = $index.geotaggedCount
    radiusM = $radiusM
    nearbyCount = @($matches | Where-Object withinRadius).Count
    matches = @($matches)
    indexedAt = $index.indexedAt
  }
}

function Convert-RgbToHex([double]$R, [double]$G, [double]$B) {
  $rValue = [int](Clamp ([Math]::Round($R)) 0 255)
  $gValue = [int](Clamp ([Math]::Round($G)) 0 255)
  $bValue = [int](Clamp ([Math]::Round($B)) 0 255)
  return "#{0:x2}{1:x2}{2:x2}" -f $rValue, $gValue, $bValue
}

function Get-Planning3dFallbackFacadeProfiles() {
  return @{
    source = "fallback"
    label = "Catalogo base urbano"
    derivedFromPhotos = $false
    sampledPhotos = 0
    profiles = @(
      @{
        id = "estuco_crema"
        label = "Estuco crema"
        material = "Estuco"
        pattern = "stucco-grid"
        frontColor = "#c8b5a1"
        sideColor = "#9f836c"
        roofColor = "#d9cbbb"
        accentColor = "#b9987b"
        windowColor = "#51636c"
      },
      @{
        id = "ladrillo_terracota"
        label = "Ladrillo terracota"
        material = "Ladrillo"
        pattern = "brick"
        frontColor = "#a86246"
        sideColor = "#7d4735"
        roofColor = "#c98d73"
        accentColor = "#d8b19a"
        windowColor = "#4c3a37"
      },
      @{
        id = "bloque_oliva"
        label = "Bloque pintado"
        material = "Bloque pintado"
        pattern = "panel"
        frontColor = "#8d9a7c"
        sideColor = "#65745b"
        roofColor = "#bcc7ae"
        accentColor = "#dbe2d0"
        windowColor = "#47545c"
      },
      @{
        id = "concreto_gris"
        label = "Concreto gris"
        material = "Concreto"
        pattern = "slab"
        frontColor = "#8e9496"
        sideColor = "#666d71"
        roofColor = "#bcc2c5"
        accentColor = "#dfe3e5"
        windowColor = "#495865"
      },
      @{
        id = "pintado_azul"
        label = "Fachada pintada"
        material = "Fachada pintada"
        pattern = "window-grid"
        frontColor = "#6e8ea3"
        sideColor = "#4f6d82"
        roofColor = "#a8c0cf"
        accentColor = "#dce8ef"
        windowColor = "#3d4d59"
      }
    )
  }
}

function Get-Planning3dPhotoFacadeSample([string]$PhotoPath) {
  if (-not (Test-Path -LiteralPath $PhotoPath)) {
    return $null
  }

  Add-Type -AssemblyName System.Drawing | Out-Null
  $bitmap = $null
  $thumb = $null
  $graphics = $null

  try {
    $bitmap = [System.Drawing.Bitmap]::new($PhotoPath)
    if ($bitmap.Width -lt 12 -or $bitmap.Height -lt 12) {
      return $null
    }

    $cropX = [int]([Math]::Floor($bitmap.Width * 0.16))
    $cropY = [int]([Math]::Floor($bitmap.Height * 0.18))
    $cropWidth = [int]([Math]::Max(12, [Math]::Floor($bitmap.Width * 0.68)))
    $cropHeight = [int]([Math]::Max(12, [Math]::Floor($bitmap.Height * 0.62)))
    if (($cropX + $cropWidth) -gt $bitmap.Width) { $cropWidth = $bitmap.Width - $cropX }
    if (($cropY + $cropHeight) -gt $bitmap.Height) { $cropHeight = $bitmap.Height - $cropY }

    $thumb = New-Object System.Drawing.Bitmap 24, 24
    $graphics = [System.Drawing.Graphics]::FromImage($thumb)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage(
      $bitmap,
      [System.Drawing.Rectangle]::new(0, 0, 24, 24),
      [System.Drawing.Rectangle]::new($cropX, $cropY, $cropWidth, $cropHeight),
      [System.Drawing.GraphicsUnit]::Pixel
    )

    $samples = @()
    for ($y = 0; $y -lt 24; $y += 2) {
      for ($x = 0; $x -lt 24; $x += 2) {
        $color = $thumb.GetPixel($x, $y)
        $samples += $color
      }
    }

    if (-not $samples.Count) {
      return $null
    }

    $avgR = ($samples | Measure-Object R -Average).Average
    $avgG = ($samples | Measure-Object G -Average).Average
    $avgB = ($samples | Measure-Object B -Average).Average
    $meanColor = [System.Drawing.Color]::FromArgb([int][Math]::Round($avgR), [int][Math]::Round($avgG), [int][Math]::Round($avgB))
    $hue = $meanColor.GetHue()
    $saturation = $meanColor.GetSaturation()
    $brightness = $meanColor.GetBrightness()

    $material = "Bloque pintado"
    $pattern = "panel"
    if ($hue -ge 12 -and $hue -le 35 -and $saturation -ge 0.22) {
      $material = "Ladrillo"
      $pattern = "brick"
    } elseif ($brightness -ge 0.66 -and $saturation -le 0.18) {
      $material = "Estuco"
      $pattern = "stucco-grid"
    } elseif ($brightness -le 0.42 -and $saturation -le 0.16) {
      $material = "Cubierta metalica"
      $pattern = "bands"
    } elseif ($saturation -le 0.12) {
      $material = "Concreto"
      $pattern = "slab"
    } elseif ($hue -ge 170 -and $hue -le 245) {
      $material = "Fachada pintada"
      $pattern = "window-grid"
    }

    return @{
      avgR = [Math]::Round($avgR, 2)
      avgG = [Math]::Round($avgG, 2)
      avgB = [Math]::Round($avgB, 2)
      hue = [Math]::Round($hue, 2)
      saturation = [Math]::Round($saturation, 3)
      brightness = [Math]::Round($brightness, 3)
      material = $material
      pattern = $pattern
    }
  } finally {
    if ($graphics) { $graphics.Dispose() }
    if ($thumb) { $thumb.Dispose() }
    if ($bitmap) { $bitmap.Dispose() }
  }
}

function Get-Planning3dFacadeProfiles() {
  $cacheKey = "planning3d|facade-profiles"
  $cached = Get-Cached $cacheKey 21600
  if ($cached) {
    return $cached
  }

  $fallback = Get-Planning3dFallbackFacadeProfiles
  $index = Get-PlanningPhotoIndex
  $jobInfo = Get-PlanningPhotoIndexJobInfo

  if (-not $index -or -not $index.available -or -not $index.photos) {
    $fallback["indexing"] = [bool]($jobInfo.state -in @("running", "notstarted"))
    $fallback["message"] = if (-not (Test-Path -LiteralPath $Planning3dPhotoRoot)) {
      "No se encontro la carpeta local de fotos para derivar texturas."
    } elseif ($jobInfo.state -eq "failed") {
      "No se pudo indexar la carpeta de fotos para derivar texturas."
    } else {
      "Aun no hay indice local de fotos; usando catalogo base de materiales."
    }
    return $fallback
  }

  $photos = @($index.photos)
  if (-not $photos.Count) {
    return $fallback
  }

  $targetSamples = 42
  $step = [Math]::Max(1, [int][Math]::Floor($photos.Count / $targetSamples))
  $samples = [System.Collections.Generic.List[object]]::new()

  for ($indexValue = 0; $indexValue -lt $photos.Count -and $samples.Count -lt $targetSamples; $indexValue += $step) {
    $photo = $photos[$indexValue]
    $photoPath = Resolve-PlanningPhotoFile $photo.id
    if (-not $photoPath) {
      continue
    }

    $sample = Get-Planning3dPhotoFacadeSample $photoPath
    if ($sample) {
      $samples.Add([pscustomobject]@{
        avgR = $sample.avgR
        avgG = $sample.avgG
        avgB = $sample.avgB
        material = $sample.material
        pattern = $sample.pattern
      })
    }
  }

  if (-not $samples.Count) {
    return $fallback
  }

  $profiles = @()
  foreach ($group in ($samples | Group-Object material | Sort-Object Count -Descending | Select-Object -First 6)) {
    $avgR = ($group.Group | Measure-Object avgR -Average).Average
    $avgG = ($group.Group | Measure-Object avgG -Average).Average
    $avgB = ($group.Group | Measure-Object avgB -Average).Average
    $pattern = ($group.Group | Group-Object pattern | Sort-Object Count -Descending | Select-Object -First 1).Name
    $profileId = ($group.Name.ToLowerInvariant() -replace "[^a-z0-9]+", "_").Trim([char]"_")

    $profiles += @{
      id = if ([string]::IsNullOrWhiteSpace($profileId)) { "perfil_$($profiles.Count + 1)" } else { $profileId }
      label = $group.Name
      material = $group.Name
      pattern = if ([string]::IsNullOrWhiteSpace($pattern)) { "window-grid" } else { $pattern }
      frontColor = Convert-RgbToHex $avgR $avgG $avgB
      sideColor = Convert-RgbToHex ($avgR * 0.78) ($avgG * 0.78) ($avgB * 0.78)
      roofColor = Convert-RgbToHex ($avgR + ((255 - $avgR) * 0.16)) ($avgG + ((255 - $avgG) * 0.16)) ($avgB + ((255 - $avgB) * 0.16))
      accentColor = Convert-RgbToHex ($avgR + ((255 - $avgR) * 0.34)) ($avgG + ((255 - $avgG) * 0.34)) ($avgB + ((255 - $avgB) * 0.34))
      windowColor = Convert-RgbToHex ($avgR * 0.46) ($avgG * 0.5) ($avgB * 0.56)
    }
  }

  if (-not $profiles.Count) {
    return $fallback
  }

  $payload = @{
    source = "local-photos"
    label = "Perfiles derivados de fachadas"
    derivedFromPhotos = $true
    sampledPhotos = $samples.Count
    indexedAt = $index.indexedAt
    profiles = $profiles
  }

  Set-Cached $cacheKey $payload
  return $payload
}

function Read-LiveJsonFile([string]$Path) {
  if (-not [System.IO.File]::Exists($Path)) {
    return $null
  }

  try {
    return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Ensure-ParentDirectory([string]$Path) {
  $parent = [System.IO.Path]::GetDirectoryName($Path)
  if (-not [string]::IsNullOrWhiteSpace($parent) -and -not [System.IO.Directory]::Exists($parent)) {
    [System.IO.Directory]::CreateDirectory($parent) | Out-Null
  }
}

function Convert-ToNullableInvariantDouble($Value) {
  $text = if ($null -eq $Value) { "" } else { [string]$Value }
  if ([string]::IsNullOrWhiteSpace($text)) {
    return $null
  }

  $parsed = 0.0
  if ([double]::TryParse($text, [System.Globalization.NumberStyles]::Float, [System.Globalization.CultureInfo]::InvariantCulture, [ref]$parsed)) {
    return $parsed
  }
  return $null
}

function Convert-ToGpsDeviceId([string]$Id, [string]$Label) {
  $seed = if (-not [string]::IsNullOrWhiteSpace($Id)) { $Id } elseif (-not [string]::IsNullOrWhiteSpace($Label)) { $Label } else { "gps-device" }
  $slug = [regex]::Replace($seed.Trim().ToLowerInvariant(), "[^a-z0-9]+", "-")
  $slug = [regex]::Replace($slug, "-{2,}", "-").Trim("-")
  if ([string]::IsNullOrWhiteSpace($slug)) {
    return "gps-device"
  }
  return $slug
}

function Normalize-AgronomyAreaId([string]$AreaId) {
  if ([string]::IsNullOrWhiteSpace($AreaId)) {
    return "mejia"
  }

  switch ($AreaId.Trim().ToLowerInvariant()) {
    "todo mejia" { return "mejia" }
    "todo_mejia" { return "mejia" }
    default { return $AreaId.Trim().ToLowerInvariant() }
  }
}

function New-AgronomyGpsDeviceRecord($Device, [string]$FallbackAreaId, [datetime]$Now) {
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
  $areaId = Normalize-AgronomyAreaId $(if ($Device.PSObject.Properties.Name -contains "areaId") { [string]$Device.areaId } else { $FallbackAreaId })
  $timestamp = if ($Device.PSObject.Properties.Name -contains "timestamp" -and -not [string]::IsNullOrWhiteSpace([string]$Device.timestamp)) {
    [string]$Device.timestamp
  } else {
    $Now.ToString("o")
  }

  return [pscustomobject][ordered]@{
    id = Convert-ToGpsDeviceId $(if ($Device.PSObject.Properties.Name -contains "id") { [string]$Device.id } else { "" }) $label
    label = $label
    deviceType = if ($Device.PSObject.Properties.Name -contains "deviceType" -and -not [string]::IsNullOrWhiteSpace([string]$Device.deviceType)) { [string]$Device.deviceType } else { "GPS" }
    mobilityMode = if ($Device.PSObject.Properties.Name -contains "mobilityMode" -and -not [string]::IsNullOrWhiteSpace([string]$Device.mobilityMode)) { [string]$Device.mobilityMode } else { "ground" }
    areaId = $areaId
    lat = [Math]::Round([double]$lat, 6)
    lon = [Math]::Round([double]$lon, 6)
    speedKmh = [Math]::Round((Convert-ToInvariantDouble $Device.speedKmh), 1)
    headingDeg = [Math]::Round((Convert-ToInvariantDouble $Device.headingDeg), 0)
    batteryPct = [Math]::Round((Convert-ToInvariantDouble $Device.batteryPct 100), 0)
    accuracyM = [Math]::Round((Convert-ToInvariantDouble $Device.accuracyM 8), 0)
    altitudeM = $(if ($Device.PSObject.Properties.Name -contains "altitudeM") { [Math]::Round((Convert-ToInvariantDouble $Device.altitudeM), 1) } else { $null })
    verticalSpeedMps = $(if ($Device.PSObject.Properties.Name -contains "verticalSpeedMps") { [Math]::Round((Convert-ToInvariantDouble $Device.verticalSpeedMps), 1) } else { $null })
    homeLat = $(if ($Device.PSObject.Properties.Name -contains "homeLat") { [Math]::Round((Convert-ToInvariantDouble $Device.homeLat), 6) } else { $null })
    homeLon = $(if ($Device.PSObject.Properties.Name -contains "homeLon") { [Math]::Round((Convert-ToInvariantDouble $Device.homeLon), 6) } else { $null })
    flightStatus = $(if ($Device.PSObject.Properties.Name -contains "flightStatus" -and -not [string]::IsNullOrWhiteSpace([string]$Device.flightStatus)) { [string]$Device.flightStatus } else { $null })
    timestamp = $timestamp
    statusLabel = if ($Device.PSObject.Properties.Name -contains "statusLabel" -and -not [string]::IsNullOrWhiteSpace([string]$Device.statusLabel)) { [string]$Device.statusLabel } else { "En seguimiento" }
  }
}

function Save-AgronomyGpsLiveFeed($Body) {
  $now = Get-Date
  $defaultAreaId = Normalize-AgronomyAreaId $(if ($Body -and $Body.PSObject.Properties.Name -contains "areaId") { [string]$Body.areaId } else { "mejia" })
  $incomingDevices = @()

  if ($Body -and $Body.PSObject.Properties.Name -contains "devices" -and $Body.devices) {
    $incomingDevices = @($Body.devices)
  } elseif ($Body -and $Body.PSObject.Properties.Name -contains "device" -and $Body.device) {
    $incomingDevices = @($Body.device)
  } elseif ($Body) {
    $incomingDevices = @($Body)
  }

  $normalizedIncoming = @()
  foreach ($device in $incomingDevices) {
    $record = New-AgronomyGpsDeviceRecord $device $defaultAreaId $now
    if ($record) {
      $normalizedIncoming += $record
    }
  }

  if (-not $normalizedIncoming.Count) {
    return @{
      ok = $false
      error = "No se recibieron coordenadas GPS validas."
      receivedCount = @($incomingDevices).Count
    }
  }

  $merged = @{}
  $currentFeed = Read-LiveJsonFile $AgronomyGpsLiveFeedPath
  if ($currentFeed -and $currentFeed.devices) {
    foreach ($device in @($currentFeed.devices)) {
      $record = New-AgronomyGpsDeviceRecord $device $defaultAreaId $now
      if ($record) {
        $merged[$record.id] = $record
      }
    }
  }

  foreach ($device in $normalizedIncoming) {
    $merged[$device.id] = $device
  }

  $devices = @(
    $merged.GetEnumerator() |
      Sort-Object Name |
      ForEach-Object { $_.Value }
  )

  $payload = [ordered]@{
    fetchedAt = $now.ToString("o")
    devices = $devices
  }

  $script:AgronomyGpsLiveMemory = [pscustomobject]$payload
  Ensure-ParentDirectory $AgronomyGpsLiveFeedPath
  $payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $AgronomyGpsLiveFeedPath -Encoding UTF8

  return @{
    ok = $true
    mode = "ingest"
    fetchedAt = $payload.fetchedAt
    savedCount = $normalizedIncoming.Count
    deviceCount = $devices.Count
    devices = $devices
    message = "Lectura GPS almacenada para el geoportal."
  }
}

function New-AgronomyGpsGeofenceEventRecord($Event, [string]$FallbackAreaId, [string]$FallbackGeofenceLabel, [datetime]$Now) {
  if (-not $Event) {
    return $null
  }

  $deviceLabel = if ($Event.PSObject.Properties.Name -contains "deviceLabel" -and -not [string]::IsNullOrWhiteSpace([string]$Event.deviceLabel)) {
    [string]$Event.deviceLabel
  } elseif ($Event.PSObject.Properties.Name -contains "label" -and -not [string]::IsNullOrWhiteSpace([string]$Event.label)) {
    [string]$Event.label
  } else {
    "GPS"
  }
  $eventTimestamp = if ($Event.PSObject.Properties.Name -contains "timestamp" -and -not [string]::IsNullOrWhiteSpace([string]$Event.timestamp)) {
    [string]$Event.timestamp
  } else {
    $Now.ToString("o")
  }
  $eventKind = if ($Event.PSObject.Properties.Name -contains "kind" -and -not [string]::IsNullOrWhiteSpace([string]$Event.kind)) {
    [string]$Event.kind
  } else {
    "warning"
  }
  $areaId = Normalize-AgronomyAreaId $(if ($Event.PSObject.Properties.Name -contains "areaId") { [string]$Event.areaId } else { $FallbackAreaId })
  $geofenceLabel = if ($Event.PSObject.Properties.Name -contains "geofenceLabel" -and -not [string]::IsNullOrWhiteSpace([string]$Event.geofenceLabel)) {
    [string]$Event.geofenceLabel
  } else {
    $FallbackGeofenceLabel
  }

  return [pscustomobject][ordered]@{
    id = if ($Event.PSObject.Properties.Name -contains "id" -and -not [string]::IsNullOrWhiteSpace([string]$Event.id)) {
      [string]$Event.id
    } else {
      ("gps-geofence-{0}-{1}" -f (Convert-ToGpsDeviceId $(if ($Event.PSObject.Properties.Name -contains "deviceId") { [string]$Event.deviceId } else { "" }) $deviceLabel), $Now.ToFileTimeUtc())
    }
    kind = $eventKind
    title = if ($Event.PSObject.Properties.Name -contains "title" -and -not [string]::IsNullOrWhiteSpace([string]$Event.title)) { [string]$Event.title } else { "Evento GPS" }
    copy = if ($Event.PSObject.Properties.Name -contains "copy" -and -not [string]::IsNullOrWhiteSpace([string]$Event.copy)) { [string]$Event.copy } else { "Evento de corredor GPS registrado." }
    areaId = $areaId
    geofenceLabel = $geofenceLabel
    sourceName = if ($Event.PSObject.Properties.Name -contains "sourceName" -and -not [string]::IsNullOrWhiteSpace([string]$Event.sourceName)) { [string]$Event.sourceName } else { "" }
    toleranceM = [Math]::Round((Convert-ToInvariantDouble $Event.toleranceM 0), 0)
    deviceId = Convert-ToGpsDeviceId $(if ($Event.PSObject.Properties.Name -contains "deviceId") { [string]$Event.deviceId } else { "" }) $deviceLabel
    deviceLabel = $deviceLabel
    deviceType = if ($Event.PSObject.Properties.Name -contains "deviceType" -and -not [string]::IsNullOrWhiteSpace([string]$Event.deviceType)) { [string]$Event.deviceType } else { "GPS" }
    distanceM = [Math]::Round((Convert-ToInvariantDouble $Event.distanceM 0), 1)
    outsideByM = [Math]::Round((Convert-ToInvariantDouble $Event.outsideByM 0), 1)
    speedKmh = [Math]::Round((Convert-ToInvariantDouble $Event.speedKmh 0), 1)
    timestamp = $eventTimestamp
    recordedAt = $Now.ToString("o")
  }
}

function Save-AgronomyGpsGeofenceEvents($Body) {
  $now = Get-Date
  $defaultAreaId = Normalize-AgronomyAreaId $(if ($Body -and $Body.PSObject.Properties.Name -contains "areaId") { [string]$Body.areaId } else { "mejia" })
  $fallbackGeofenceLabel = if ($Body -and $Body.PSObject.Properties.Name -contains "geofenceLabel") { [string]$Body.geofenceLabel } else { "" }
  $incomingEvents = @()

  if ($Body -and $Body.PSObject.Properties.Name -contains "events" -and $Body.events) {
    $incomingEvents = @($Body.events)
  } elseif ($Body -and $Body.PSObject.Properties.Name -contains "event" -and $Body.event) {
    $incomingEvents = @($Body.event)
  } elseif ($Body) {
    $incomingEvents = @($Body)
  }

  $normalizedIncoming = @()
  foreach ($entry in $incomingEvents) {
    $record = New-AgronomyGpsGeofenceEventRecord $entry $defaultAreaId $fallbackGeofenceLabel $now
    if ($record) {
      $normalizedIncoming += $record
    }
  }

  if (-not $normalizedIncoming.Count) {
    return @{
      ok = $false
      error = "No se recibieron eventos de corredor GPS validos."
      receivedCount = @($incomingEvents).Count
    }
  }

  $merged = @{}
  $currentFeed = if ($script:AgronomyGpsGeofenceMemory) { $script:AgronomyGpsGeofenceMemory } else { Read-LiveJsonFile $AgronomyGpsGeofenceEventsPath }
  if ($currentFeed -and $currentFeed.events) {
    foreach ($eventItem in @($currentFeed.events)) {
      $record = New-AgronomyGpsGeofenceEventRecord $eventItem $defaultAreaId $fallbackGeofenceLabel $now
      if ($record) {
        $merged[[string]$record.id] = $record
      }
    }
  }

  foreach ($record in $normalizedIncoming) {
    $merged[[string]$record.id] = $record
  }

  $events = @(
    $merged.GetEnumerator() |
      Sort-Object { [datetime]$_.Value.timestamp } -Descending |
      Select-Object -First 300 |
      ForEach-Object { $_.Value }
  )

  $payload = [ordered]@{
    fetchedAt = $now.ToString("o")
    events = $events
  }

  $script:AgronomyGpsGeofenceMemory = [pscustomobject]$payload
  Ensure-ParentDirectory $AgronomyGpsGeofenceEventsPath
  $payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $AgronomyGpsGeofenceEventsPath -Encoding UTF8

  return @{
    ok = $true
    mode = "ingest"
    fetchedAt = $payload.fetchedAt
    savedCount = $normalizedIncoming.Count
    eventCount = $events.Count
    events = $events | Select-Object -First 25
    message = "Bitacora GPS del corredor almacenada."
  }
}

function Get-AgronomyGpsGeofenceEventsPayload($Body) {
  $areaId = Normalize-AgronomyAreaId $(if ($Body -and $Body.PSObject.Properties.Name -contains "areaId") { [string]$Body.areaId } else { "mejia" })
  $geofenceLabel = if ($Body -and $Body.PSObject.Properties.Name -contains "geofenceLabel") { [string]$Body.geofenceLabel } else { "" }
  $limit = [Math]::Min([Math]::Max([int](Convert-ToInvariantDouble $(if ($Body -and $Body.PSObject.Properties.Name -contains "limit") { $Body.limit } else { 18 }) 18), 1), 60)
  $feed = if ($script:AgronomyGpsGeofenceMemory) { $script:AgronomyGpsGeofenceMemory } else { Read-LiveJsonFile $AgronomyGpsGeofenceEventsPath }
  $events = @()

  if ($feed -and $feed.events) {
    $events = @(
      foreach ($entry in @($feed.events)) {
        $record = New-AgronomyGpsGeofenceEventRecord $entry $areaId $geofenceLabel (Get-Date)
        if (-not $record) {
          continue
        }
        if (-not [string]::IsNullOrWhiteSpace($areaId) -and [string]$record.areaId -ne $areaId) {
          continue
        }
        if (-not [string]::IsNullOrWhiteSpace($geofenceLabel) -and [string]$record.geofenceLabel -ne $geofenceLabel) {
          continue
        }
        $record
      }
    )
  }

  $ordered = @(
    $events |
      Sort-Object { [datetime]$_.timestamp } -Descending |
      Select-Object -First $limit
  )

  return @{
    ok = $true
    mode = "file"
    fetchedAt = if ($feed -and $feed.fetchedAt) { [string]$feed.fetchedAt } else { (Get-Date).ToString("o") }
    areaId = $areaId
    geofenceLabel = $geofenceLabel
    eventCount = $ordered.Count
    events = $ordered
    message = if ($ordered.Count) { "Bitacora de corredor GPS recuperada." } else { "Sin eventos guardados para este corredor." }
  }
}

function Get-AgronomyLiveWeatherBase([string]$AreaId) {
  switch ($AreaId) {
    "machachi" {
      return @{
        temperatureC = 14.3
        humidityPct = 76
        precip1hMm = 0.7
        windKmh = 12
        pressureHpa = 1016
        solarWm2 = 790
      }
    }
    "cutuglagua" {
      return @{
        temperatureC = 16.1
        humidityPct = 72
        precip1hMm = 0.6
        windKmh = 13
        pressureHpa = 1014
        solarWm2 = 810
      }
    }
    "quevedo" {
      return @{
        temperatureC = 26.6
        humidityPct = 86
        precip1hMm = 3.2
        windKmh = 9
        pressureHpa = 1008
        solarWm2 = 690
      }
    }
    default {
      return @{
        temperatureC = 15.4
        humidityPct = 78
        precip1hMm = 0.9
        windKmh = 11
        pressureHpa = 1015
        solarWm2 = 760
      }
    }
  }
}

function Get-AgronomyRealtimeStationsForArea([string]$AreaId) {
  $targetArea = if ([string]::IsNullOrWhiteSpace($AreaId)) { "mejia" } else { $AreaId.ToLowerInvariant() }
  return @(
    $AgronomyRealtimeStations | Where-Object {
      @($_.areaIds) -contains $targetArea
    }
  )
}

function Get-InamhiLiveSummary($Stations) {
  $stationList = @($Stations)
  if (-not $stationList.Count) {
    return @{
      stationCount = 0
      onlineCount = 0
      meanTemperatureC = 0
      meanHumidityPct = 0
      maxWindKmh = 0
      maxPrecip1hMm = 0
      rainiestStationName = "Sin dato"
      freshestMinutes = 999
    }
  }

  $meanTemperature = [Math]::Round((($stationList | Measure-Object -Property temperatureC -Average).Average), 1)
  $meanHumidity = [Math]::Round((($stationList | Measure-Object -Property humidityPct -Average).Average), 0)
  $maxWind = [Math]::Round((($stationList | Measure-Object -Property windKmh -Maximum).Maximum), 1)
  $maxPrecip = [Math]::Round((($stationList | Measure-Object -Property precip1hMm -Maximum).Maximum), 1)
  $freshest = [Math]::Round((($stationList | Measure-Object -Property updateAgeMinutes -Minimum).Minimum), 1)
  $rainiest = $stationList | Sort-Object precip1hMm -Descending | Select-Object -First 1
  $onlineCount = @($stationList | Where-Object { (Convert-ToInvariantDouble $_.updateAgeMinutes 999) -le 20 }).Count

  return @{
    stationCount = $stationList.Count
    onlineCount = $onlineCount
    meanTemperatureC = $meanTemperature
    meanHumidityPct = $meanHumidity
    maxWindKmh = $maxWind
    maxPrecip1hMm = $maxPrecip
    rainiestStationName = if ($rainiest) { $rainiest.name } else { "Sin dato" }
    freshestMinutes = $freshest
  }
}

function Get-AgronomyInamhiLivePayload($Body) {
  $areaId = if ($Body -and $Body.areaId) { [string]$Body.areaId } else { "mejia" }
  $now = Get-Date
  $feed = Read-LiveJsonFile $AgronomyInamhiLiveFeedPath

  if ($feed -and $feed.stations) {
    $stations = @(
      @(
        foreach ($station in @($feed.stations)) {
          $stationAreaId = if ($station.PSObject.Properties.Name -contains "areaId") { [string]$station.areaId } else { "" }
          if (-not [string]::IsNullOrWhiteSpace($stationAreaId) -and $stationAreaId.ToLowerInvariant() -ne $areaId.ToLowerInvariant()) {
            continue
          }

          [pscustomobject]@{
            id = if ($station.id) { [string]$station.id } else { [string]$station.stationCode }
            stationCode = [string]$station.stationCode
            name = [string]$station.name
            provider = if ($station.provider) { [string]$station.provider } else { "INAMHI" }
            areaId = if ($stationAreaId) { $stationAreaId } else { $areaId }
            lat = Convert-ToInvariantDouble $station.lat
            lon = Convert-ToInvariantDouble $station.lon
            temperatureC = [Math]::Round((Convert-ToInvariantDouble $station.temperatureC), 1)
            humidityPct = [Math]::Round((Convert-ToInvariantDouble $station.humidityPct), 0)
            precip1hMm = [Math]::Round((Convert-ToInvariantDouble $station.precip1hMm), 1)
            windKmh = [Math]::Round((Convert-ToInvariantDouble $station.windKmh), 1)
            pressureHpa = [Math]::Round((Convert-ToInvariantDouble $station.pressureHpa 1012), 0)
            solarWm2 = [Math]::Round((Convert-ToInvariantDouble $station.solarWm2), 0)
            statusLabel = if ($station.statusLabel) { [string]$station.statusLabel } else { "En linea" }
            updateAgeMinutes = [Math]::Round((Convert-ToInvariantDouble $station.updateAgeMinutes), 1)
            timestamp = if ($station.timestamp) { [string]$station.timestamp } else { $now.ToString("o") }
          }
        }
      ) | Where-Object {
        $lat = [double]$_.lat
        $lon = [double]$_.lon
        (-not [double]::IsNaN($lat)) -and (-not [double]::IsInfinity($lat)) -and (-not [double]::IsNaN($lon)) -and (-not [double]::IsInfinity($lon))
      }
    )

    if ($stations.Count -gt 0) {
      return @{
        ok = $true
        mode = "file"
        sourceLabel = "Feed local"
        fetchedAt = if ($feed.fetchedAt) { [string]$feed.fetchedAt } else { $now.ToString("o") }
        areaId = $areaId
        stations = $stations
        summary = Get-InamhiLiveSummary $stations
        message = "Lectura meteorologica entregada por feed local."
      }
    }
  }

  $base = Get-AgronomyLiveWeatherBase $areaId
  $stations = Get-AgronomyRealtimeStationsForArea $areaId
  $minuteOfDay = ($now.Hour * 60) + $now.Minute
  $daySignal = [Math]::Sin(($minuteOfDay / 1440.0) * [Math]::PI * 2)
  $rainSignal = [Math]::Cos(($minuteOfDay / 1440.0) * [Math]::PI * 2 + 0.8)
  $records = @()
  $index = 0

  foreach ($station in $stations) {
    $localShift = ($index - (($stations.Count - 1) / 2.0)) * 0.7
    $temperature = $base.temperatureC + $daySignal * $(if ($areaId -eq "quevedo") { 3.8 } else { 5.2 }) + $localShift
    $humidity = Clamp ($base.humidityPct - $daySignal * 8 + $rainSignal * 6 + $index * 1.5) 55 98
    $precip = Clamp ($base.precip1hMm + [Math]::Max(0, $rainSignal + $index * 0.2) * $(if ($areaId -eq "quevedo") { 5.6 } else { 2.2 })) 0 18
    $wind = Clamp ($base.windKmh + [Math]::Abs([Math]::Sin(($minuteOfDay / 240.0) + $index)) * 9) 2 34
    $pressure = Clamp ($base.pressureHpa + [Math]::Cos(($minuteOfDay / 360.0) + $index) * 3) 995 1022
    $solar = Clamp ([Math]::Sin((($minuteOfDay - 360) / 720.0) * [Math]::PI) * $base.solarWm2) 0 1100
    $updateAge = [Math]::Round(($index * 2) + (($minuteOfDay % 3) * 0.4), 1)

    $records += [pscustomobject]@{
      id = $station.stationCode
      stationCode = $station.stationCode
      name = $station.name
      provider = $station.provider
      areaId = $areaId
      lat = [double]$station.lat
      lon = [double]$station.lon
      temperatureC = [Math]::Round($temperature, 1)
      humidityPct = [Math]::Round($humidity, 0)
      precip1hMm = [Math]::Round($precip, 1)
      windKmh = [Math]::Round($wind, 1)
      pressureHpa = [Math]::Round($pressure, 0)
      solarWm2 = [Math]::Round($solar, 0)
      statusLabel = if ($updateAge -le 10) { "En linea" } else { "Atrasada" }
      updateAgeMinutes = $updateAge
      timestamp = $now.AddMinutes(-$updateAge).ToString("o")
    }
    $index += 1
  }

  return @{
    ok = $true
    mode = "simulated"
    sourceLabel = "Simulacion operativa"
    fetchedAt = $now.ToString("o")
    areaId = $areaId
    stations = $records
    summary = Get-InamhiLiveSummary $records
    message = "No hay feed local conectado; se entrega una lectura operativa simulada del ambito."
  }
}

function Get-AgronomyGpsRoutesForArea([string]$AreaId) {
  $key = if ([string]::IsNullOrWhiteSpace($AreaId)) { "mejia" } else { $AreaId.ToLowerInvariant() }
  if ($AgronomyGpsRoutes.ContainsKey($key)) {
    return @($AgronomyGpsRoutes[$key])
  }
  return @($AgronomyGpsRoutes["mejia"])
}

function Get-InterpolatedGpsRoutePosition($Route, [double]$Progress) {
  $points = @($Route)
  if ($points.Count -lt 2) {
    return @{
      lon = Convert-ToInvariantDouble $points[0][0]
      lat = Convert-ToInvariantDouble $points[0][1]
      headingDeg = 0
    }
  }

  $segments = @()
  $totalLength = 0.0
  for ($index = 0; $index -lt ($points.Count - 1); $index++) {
    $start = $points[$index]
    $end = $points[$index + 1]
    $dx = (Convert-ToInvariantDouble $end[0]) - (Convert-ToInvariantDouble $start[0])
    $dy = (Convert-ToInvariantDouble $end[1]) - (Convert-ToInvariantDouble $start[1])
    $length = [Math]::Sqrt(($dx * $dx) + ($dy * $dy))
    $segments += @{
      start = $start
      end = $end
      length = $length
    }
    $totalLength += $length
  }

  if ($totalLength -le 0) {
    return @{
      lon = Convert-ToInvariantDouble $points[0][0]
      lat = Convert-ToInvariantDouble $points[0][1]
      headingDeg = 0
    }
  }

  $remaining = ((((($Progress % 1) + 1) % 1)) * $totalLength)
  foreach ($segment in $segments) {
    if ($remaining -gt $segment.length) {
      $remaining -= $segment.length
      continue
    }

    $ratio = if ($segment.length -gt 0) { $remaining / $segment.length } else { 0 }
    $startLon = Convert-ToInvariantDouble $segment.start[0]
    $startLat = Convert-ToInvariantDouble $segment.start[1]
    $endLon = Convert-ToInvariantDouble $segment.end[0]
    $endLat = Convert-ToInvariantDouble $segment.end[1]
    $lon = $startLon + (($endLon - $startLon) * $ratio)
    $lat = $startLat + (($endLat - $startLat) * $ratio)
    $heading = [Math]::Atan2(($endLon - $startLon), ($endLat - $startLat)) * 180 / [Math]::PI
    if ($heading -lt 0) {
      $heading += 360
    }
    return @{
      lon = [Math]::Round($lon, 6)
      lat = [Math]::Round($lat, 6)
      headingDeg = [Math]::Round($heading, 0)
    }
  }

  $last = $points[$points.Count - 1]
  return @{
    lon = Convert-ToInvariantDouble $last[0]
    lat = Convert-ToInvariantDouble $last[1]
    headingDeg = 0
  }
}

function Get-AgronomyGpsLivePayload($Body) {
  $areaId = if ($Body -and $Body.areaId) { [string]$Body.areaId } else { "mejia" }
  $now = Get-Date
  $feed = if ($script:AgronomyGpsLiveMemory) { $script:AgronomyGpsLiveMemory } else { Read-LiveJsonFile $AgronomyGpsLiveFeedPath }

  if ($feed -and $feed.devices) {
    $devices = @(
      @(
        foreach ($device in @($feed.devices)) {
          $deviceAreaId = if ($device.PSObject.Properties.Name -contains "areaId") { [string]$device.areaId } else { "" }
          if (-not [string]::IsNullOrWhiteSpace($deviceAreaId) -and $deviceAreaId.ToLowerInvariant() -ne $areaId.ToLowerInvariant()) {
            continue
          }

          [pscustomobject]@{
            id = if ($device.id) { [string]$device.id } else { [string]$device.label }
            label = if ($device.label) { [string]$device.label } else { "Dispositivo GPS" }
            deviceType = if ($device.deviceType) { [string]$device.deviceType } else { "GPS" }
            mobilityMode = if ($device.mobilityMode) { [string]$device.mobilityMode } else { "" }
            areaId = if ($deviceAreaId) { $deviceAreaId } else { $areaId }
            lat = Convert-ToInvariantDouble $device.lat
            lon = Convert-ToInvariantDouble $device.lon
          speedKmh = [Math]::Round((Convert-ToInvariantDouble $device.speedKmh), 1)
          headingDeg = [Math]::Round((Convert-ToInvariantDouble $device.headingDeg), 0)
          batteryPct = [Math]::Round((Convert-ToInvariantDouble $device.batteryPct 100), 0)
          accuracyM = [Math]::Round((Convert-ToInvariantDouble $device.accuracyM 8), 0)
          altitudeM = if ($device.PSObject.Properties.Name -contains "altitudeM") { $alt = Convert-ToNullableInvariantDouble $device.altitudeM; if ($null -ne $alt) { [Math]::Round([double]$alt, 1) } else { $null } } else { $null }
          verticalSpeedMps = if ($device.PSObject.Properties.Name -contains "verticalSpeedMps") { $vs = Convert-ToNullableInvariantDouble $device.verticalSpeedMps; if ($null -ne $vs) { [Math]::Round([double]$vs, 1) } else { $null } } else { $null }
          homeLat = if ($device.PSObject.Properties.Name -contains "homeLat") { $homeLatValue = Convert-ToNullableInvariantDouble $device.homeLat; if ($null -ne $homeLatValue) { [Math]::Round([double]$homeLatValue, 6) } else { $null } } else { $null }
          homeLon = if ($device.PSObject.Properties.Name -contains "homeLon") { $homeLonValue = Convert-ToNullableInvariantDouble $device.homeLon; if ($null -ne $homeLonValue) { [Math]::Round([double]$homeLonValue, 6) } else { $null } } else { $null }
            flightStatus = if ($device.flightStatus) { [string]$device.flightStatus } else { $null }
            timestamp = if ($device.timestamp) { [string]$device.timestamp } else { $now.ToString("o") }
            statusLabel = if ($device.statusLabel) { [string]$device.statusLabel } else { "En seguimiento" }
          }
        }
      ) | Where-Object {
        $lat = [double]$_.lat
        $lon = [double]$_.lon
        (-not [double]::IsNaN($lat)) -and (-not [double]::IsInfinity($lat)) -and (-not [double]::IsNaN($lon)) -and (-not [double]::IsInfinity($lon))
      }
    )

    if ($devices.Count -gt 0) {
      return @{
        ok = $true
        mode = "file"
        sourceLabel = "Feed local"
        fetchedAt = if ($feed.fetchedAt) { [string]$feed.fetchedAt } else { $now.ToString("o") }
        areaId = $areaId
        devices = $devices
        message = "Seguimiento GPS entregado por feed local."
      }
    }
  }

  $routes = Get-AgronomyGpsRoutesForArea $areaId
  $unixSeconds = [DateTimeOffset]::new($now).ToUnixTimeSeconds()
  $devices = @()
  $index = 0

  foreach ($route in $routes) {
    $progress = (($unixSeconds / (185 + ($index * 45))) + ($index * 0.17)) % 1
    $position = Get-InterpolatedGpsRoutePosition $route.route $progress
    $isAerial = ($route.mobilityMode -eq "air") -or ([string]$route.deviceType -match "Dron|Drone|UAV|Avioneta|Aeronave|Aircraft")
    $speedBase = if ($route.cruiseSpeedKmh) { Convert-ToInvariantDouble $route.cruiseSpeedKmh } elseif ($isAerial) { if ($areaId -eq "quevedo") { 138 } else { 34 } } else { if ($areaId -eq "quevedo") { 17 } else { 11 } }
    $speedAmplitude = if ($isAerial) { 18 } else { 14 }
    $speed = $speedBase + ([Math]::Abs([Math]::Sin(($unixSeconds / 70.0) + $index)) * $speedAmplitude)
    $battery = if ($isAerial) {
      [Math]::Max(24, 96 - (([Math]::Floor($unixSeconds / 90) + ($index * 7)) % 62))
    } else {
      [Math]::Max(38, 96 - (([Math]::Floor($unixSeconds / 90) + ($index * 7)) % 48))
    }
    $altitudeBase = if ($route.altitudeBaseM) { Convert-ToInvariantDouble $route.altitudeBaseM } else { 0 }
    $altitudeSwing = if ($route.altitudeSwingM) { Convert-ToInvariantDouble $route.altitudeSwingM } else { 0 }
    $verticalSwing = if ($route.climbSwingMps) { Convert-ToInvariantDouble $route.climbSwingMps } else { 1.5 }
    $altitude = if ($isAerial) {
      [Math]::Round(($altitudeBase + ([Math]::Sin(($unixSeconds / (31.0 + ($index * 3))) + $index) * $altitudeSwing)), 1)
    } else {
      $null
    }
    $verticalSpeed = if ($isAerial) {
      [Math]::Round(([Math]::Cos(($unixSeconds / (25.0 + ($index * 2))) + $index) * $verticalSwing), 1)
    } else {
      $null
    }
    $homePoint = if ($route.homePoint -and $route.homePoint.Count -ge 2) { $route.homePoint } else { $null }
    $statusLabel = if ($isAerial) { "En vuelo" } else { "En movimiento" }
    $flightStatus = if ($isAerial) {
      if ($altitude -ge [Math]::Max(40, ($altitudeBase * 0.45))) { "En vuelo" } else { "En ascenso" }
    } else {
      $null
    }

    $devices += [pscustomobject]@{
      id = [string]$route.id
      label = [string]$route.label
      deviceType = [string]$route.deviceType
      mobilityMode = if ($isAerial) { "air" } else { "ground" }
      areaId = $areaId
      lat = $position.lat
      lon = $position.lon
      speedKmh = [Math]::Round($speed, 1)
      headingDeg = [Math]::Round($position.headingDeg, 0)
      batteryPct = [Math]::Round($battery, 0)
      accuracyM = 4 + ($index * 2)
      altitudeM = $altitude
      verticalSpeedMps = $verticalSpeed
      homeLat = if ($homePoint) { [Math]::Round((Convert-ToInvariantDouble $homePoint[1]), 6) } else { $null }
      homeLon = if ($homePoint) { [Math]::Round((Convert-ToInvariantDouble $homePoint[0]), 6) } else { $null }
      flightStatus = $flightStatus
      timestamp = $now.AddSeconds(-($index * 5)).ToString("o")
      statusLabel = $statusLabel
    }
    $index += 1
  }

  return @{
    ok = $true
    mode = "simulated"
    sourceLabel = "Feed local simulado"
    fetchedAt = $now.ToString("o")
    areaId = $areaId
    devices = $devices
    message = "No hay feed GPS local conectado; se entrega un seguimiento simulado del ambito."
  }
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
    400 { "Bad Request" }
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
      if ($request.Path -eq "/api/network/local-ip") {
        Write-Json $stream 200 @{
          ok = $true
          bindAddress = $BindAddress
          port = $Port
          localhostPortalUrl = "http://127.0.0.1:$Port/"
          localhostBridgeUrl = "http://127.0.0.1:$Port/gps-sender"
          addresses = Get-LocalNetworkHints $Port
        }
        continue
      }
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
      if ($request.Path -eq "/api/agronomy/inamhi-live" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        $result = Get-AgronomyInamhiLivePayload $body
        Write-Json $stream 200 $result
        continue
      }
      if ($request.Path -eq "/api/agronomy/gps/live" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        $result = Get-AgronomyGpsLivePayload $body
        Write-Json $stream 200 $result
        continue
      }
      if ($request.Path -eq "/api/agronomy/gps/ingest" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        $result = Save-AgronomyGpsLiveFeed $body
        if ($result.ok) {
          Write-Json $stream 200 $result
        } else {
          Write-Json $stream 400 $result
        }
        continue
      }
      if ($request.Path -eq "/api/agronomy/gps/geofence/events" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        $result = Save-AgronomyGpsGeofenceEvents $body
        if ($result.ok) {
          Write-Json $stream 200 $result
        } else {
          Write-Json $stream 400 $result
        }
        continue
      }
      if ($request.Path -eq "/api/agronomy/gps/geofence/log" -and $request.Method -eq "POST") {
        $body = if ([string]::IsNullOrWhiteSpace($request.Body)) { @{} } else { $request.Body | ConvertFrom-Json }
        $result = Get-AgronomyGpsGeofenceEventsPayload $body
        Write-Json $stream 200 $result
        continue
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
      if ($request.Path -eq "/api/planning/3d/photo-status") {
        $result = Get-PlanningPhotoStatus
        Write-Json $stream 200 $result
        continue
      }
      if ($request.Path -eq "/api/planning/3d/facade-profiles") {
        $result = Get-Planning3dFacadeProfiles
        Write-Json $stream 200 $result
        continue
      }
      if ($request.Path -eq "/api/planning/3d/photos/nearby" -and $request.Method -eq "POST") {
        $result = Find-NearbyPlanningPhotos ($request.Body | ConvertFrom-Json)
        Write-Json $stream 200 $result
        continue
      }
      if ($request.Path.StartsWith("/api/planning/3d/photo/")) {
        $photoToken = $request.Path.Substring("/api/planning/3d/photo/".Length)
        $photoPath = Resolve-PlanningPhotoFile $photoToken
        if ($photoPath) {
          Write-Response $stream 200 (Get-ContentType $photoPath) ([System.IO.File]::ReadAllBytes($photoPath))
        } else {
          Write-Json $stream 404 @{ error = "Foto no encontrada."; path = $request.Path }
        }
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
