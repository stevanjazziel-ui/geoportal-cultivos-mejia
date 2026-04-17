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

$Planning3dPhotoRoot = "E:\FOTOS MACHACHI"
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
