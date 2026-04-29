param(
  [string]$OutputName = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DistDirectory = Join-Path $Root "dist"
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$safeName = if ([string]::IsNullOrWhiteSpace($OutputName)) { "geotrack-rt-$timestamp.zip" } else { $OutputName }
$zipPath = Join-Path $DistDirectory $safeName
$folderName = [System.IO.Path]::GetFileNameWithoutExtension($safeName)
$folderPath = Join-Path $DistDirectory $folderName

function Get-RelativePath {
  param(
    [Parameter(Mandatory = $true)][string]$BasePath,
    [Parameter(Mandatory = $true)][string]$TargetPath
  )

  $baseUri = New-Object System.Uri(($BasePath.TrimEnd('\') + '\'))
  $targetUri = New-Object System.Uri($TargetPath)
  return [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString()).Replace('/', '\')
}

if (-not (Test-Path -LiteralPath $DistDirectory)) {
  New-Item -ItemType Directory -Path $DistDirectory -Force | Out-Null
}

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

if (Test-Path -LiteralPath $folderPath) {
  Remove-Item -LiteralPath $folderPath -Recurse -Force
}

New-Item -ItemType Directory -Path $folderPath -Force | Out-Null

$items = @(
  (Join-Path $Root "public")
  (Join-Path $Root "tools")
  (Join-Path $Root "deploy")
  (Join-Path $Root "license")
  (Join-Path $Root "README.md")
  (Join-Path $Root "MANUAL-DESPLIEGUE-SERVIDOR.md")
  (Join-Path $Root "server.ps1")
  (Join-Path $Root "tracking.config.json")
  (Join-Path $Root "tracking.config.server.example.json")
  (Join-Path $Root "Abrir Seguimiento GPS.bat")
  (Join-Path $Root "Generar Solicitud de Activacion.bat")
  (Join-Path $Root "Instalar Licencia de Activacion.bat")
  (Join-Path $Root "Instalar Inicio Automatico GeoTrack RT.bat")
  (Join-Path $Root "Instalar Inicio Automatico Satloc G4.bat")
  (Join-Path $Root "Quitar Inicio Automatico GeoTrack RT.bat")
  (Join-Path $Root "Quitar Inicio Automatico Satloc G4.bat")
  (Join-Path $Root "Verificar Instalacion GeoTrack RT.bat")
)

$emptyDirectories = @(
  (Join-Path $folderPath "data")
  (Join-Path $folderPath "data\logs")
)

foreach ($directory in $emptyDirectories) {
  if (-not (Test-Path -LiteralPath $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }
}

$placeholderFiles = @(
  @{
    Path = Join-Path $folderPath "data\.keep"
    Content = "Directorio reservado para datos operativos del cliente."
  },
  @{
    Path = Join-Path $folderPath "data\logs\.keep"
    Content = "Directorio reservado para logs operativos del cliente."
  }
)

foreach ($item in $items) {
  if (-not (Test-Path -LiteralPath $item)) {
    continue
  }

  $destination = Join-Path $folderPath (Split-Path -Leaf $item)
  Copy-Item -LiteralPath $item -Destination $destination -Recurse -Force
}

foreach ($placeholder in $placeholderFiles) {
  Set-Content -LiteralPath $placeholder.Path -Value $placeholder.Content -Encoding UTF8
}

$manifestPath = Join-Path $folderPath "release-manifest.json"
$packagedFiles = Get-ChildItem -LiteralPath $folderPath -Recurse -File | Where-Object { $_.FullName -ne $manifestPath } | Sort-Object FullName
$manifestFiles = foreach ($file in $packagedFiles) {
  $hash = Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256
  [pscustomobject]@{
    path = (Get-RelativePath -BasePath $folderPath -TargetPath $file.FullName).Replace('\', '/')
    size = [int64]$file.Length
    sha256 = $hash.Hash.ToLowerInvariant()
  }
}

$totalBytes = 0
if ($manifestFiles) {
  $totalBytes = ($manifestFiles | Measure-Object -Property size -Sum).Sum
}

$manifest = [ordered]@{
  productName = "GeoTrack RT"
  generatedAt = (Get-Date).ToString("o")
  packageFolder = (Split-Path -Leaf $folderPath)
  zipFileName = (Split-Path -Leaf $zipPath)
  sourceRoot = $Root
  fileCount = @($manifestFiles).Count
  totalBytes = [int64]$totalBytes
  files = $manifestFiles
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

Compress-Archive -Path (Join-Path $folderPath "*") -DestinationPath $zipPath -CompressionLevel Optimal
Write-Host ("Carpeta de entrega generada en {0}" -f $folderPath) -ForegroundColor Green
Write-Host ("Paquete generado en {0}" -f $zipPath) -ForegroundColor Green
