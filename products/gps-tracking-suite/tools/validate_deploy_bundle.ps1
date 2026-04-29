param(
  [switch]$BuildPackage,
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$requiredItems = @(
  "server.ps1",
  "tracking.config.json",
  "README.md",
  "MANUAL-DESPLIEGUE-SERVIDOR.md",
  "Verificar Instalacion GeoTrack RT.bat",
  "public\index.html",
  "public\sender.html",
  "public\app.js",
  "tools\connect_satloc_g4.ps1",
  "tools\install_tracking_server_autostart.ps1",
  "tools\run_tracking_server_host.ps1",
  "tools\validate_deploy_bundle.ps1",
  "deploy\caddy\Caddyfile.template",
  "deploy\iis\web.config",
  "license\license.template.json"
)

$missing = @($requiredItems | Where-Object { -not (Test-Path -LiteralPath (Join-Path $Root $_)) })
if ($missing.Count) {
  throw ("Faltan archivos obligatorios: {0}" -f ($missing -join ", "))
}

$configPath = Join-Path $Root "tracking.config.json"
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
if (-not $config.productName) {
  throw "tracking.config.json no tiene productName."
}
if (-not $config.port) {
  throw "tracking.config.json no tiene port."
}
if (-not $config.activation) {
  throw "tracking.config.json no tiene bloque activation."
}
if (-not $config.activation.productCode) {
  throw "tracking.config.json no tiene activation.productCode."
}
if (-not $config.activation.licenseRelativePath) {
  throw "tracking.config.json no tiene activation.licenseRelativePath."
}
if (-not $config.areas -or @($config.areas).Count -lt 1) {
  throw "tracking.config.json no tiene areas disponibles."
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $Root "dist\validation-summary.json"
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outputDirectory) -and -not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

$result = [ordered]@{
  ok = $true
  generatedAt = (Get-Date).ToString("o")
  root = $Root
  config = [ordered]@{
    productName = $config.productName
    bindAddress = $config.bindAddress
    port = $config.port
    publicOrigin = $config.publicOrigin
    activationRequired = [bool]$config.activation.required
    productCode = $config.activation.productCode
  }
  requiredFiles = $requiredItems
  package = $null
}

if ($BuildPackage) {
  & (Join-Path $Root "tools\build_deploy_package.ps1")
  $distRoot = Join-Path $Root "dist"
  $latestFolder = Get-ChildItem -LiteralPath $distRoot -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $latestZip = Get-ChildItem -LiteralPath $distRoot -File -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $latestFolderPath = if ($latestFolder) { $latestFolder.FullName } else { $null }
  $latestZipPath = if ($latestZip) { $latestZip.FullName } else { $null }
  $manifestPath = if ($latestFolderPath) { Join-Path $latestFolderPath "release-manifest.json" } else { $null }
  $manifestPresent = [bool]($manifestPath -and (Test-Path -LiteralPath $manifestPath))
  $manifest = $null
  if ($manifestPresent) {
    $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
  }
  $result.package = [ordered]@{
    folder = $latestFolderPath
    zip = $latestZipPath
    manifest = $manifestPath
    manifestPresent = $manifestPresent
    manifestFileCount = if ($manifest -and $manifest.files) { @($manifest.files).Count } else { 0 }
  }
  if (-not $result.package.manifestPresent) {
    throw "El paquete generado no contiene release-manifest.json."
  }

  $manifestPaths = @($manifest.files | ForEach-Object { $_.path })
  $requiredManifestEntries = @(
    "server.ps1",
    "tracking.config.json",
    "public/index.html",
    "public/sender.html",
    "tools/validate_deploy_bundle.ps1",
    "Verificar Instalacion GeoTrack RT.bat"
  )
  $missingManifestEntries = @($requiredManifestEntries | Where-Object { $manifestPaths -notcontains $_ })
  if ($missingManifestEntries.Count) {
    throw ("El manifest del paquete no incluye archivos clave: {0}" -f ($missingManifestEntries -join ", "))
  }
}

$resultJson = $result | ConvertTo-Json -Depth 6
Set-Content -LiteralPath $OutputPath -Value $resultJson -Encoding UTF8
Write-Host ("Resumen de validacion guardado en {0}" -f $OutputPath) -ForegroundColor Green
$resultJson
