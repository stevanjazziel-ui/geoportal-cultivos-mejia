param(
  [string]$OutputName = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DistDirectory = Join-Path $Root "dist"
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$safeName = if ([string]::IsNullOrWhiteSpace($OutputName)) { "geotrack-rt-$timestamp.zip" } else { $OutputName }
$zipPath = Join-Path $DistDirectory $safeName

if (-not (Test-Path -LiteralPath $DistDirectory)) {
  New-Item -ItemType Directory -Path $DistDirectory -Force | Out-Null
}

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

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
)

Compress-Archive -Path $items -DestinationPath $zipPath -CompressionLevel Optimal
Write-Host ("Paquete generado en {0}" -f $zipPath) -ForegroundColor Green
