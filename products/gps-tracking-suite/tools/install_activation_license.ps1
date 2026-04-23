param(
  [Parameter(Mandatory = $true)]
  [string]$LicenseFilePath
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$TargetDirectory = Join-Path $Root "license"
$TargetPath = Join-Path $TargetDirectory "license.json"

if (-not (Test-Path -LiteralPath $LicenseFilePath)) {
  throw "No se encontro el archivo de licencia: $LicenseFilePath"
}

$raw = Get-Content -LiteralPath $LicenseFilePath -Raw
if ([string]::IsNullOrWhiteSpace($raw)) {
  throw "El archivo de licencia esta vacio."
}

$license = $raw | ConvertFrom-Json
if (-not $license.productCode -or -not $license.machineIds) {
  throw "La licencia no tiene la estructura esperada."
}

if (-not (Test-Path -LiteralPath $TargetDirectory)) {
  New-Item -ItemType Directory -Path $TargetDirectory -Force | Out-Null
}

Set-Content -LiteralPath $TargetPath -Value $raw -Encoding UTF8
Write-Host ("Licencia instalada en {0}" -f $TargetPath) -ForegroundColor Green
