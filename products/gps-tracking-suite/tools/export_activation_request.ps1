param(
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ConfigPath = Join-Path $Root "tracking.config.json"

function Read-JsonFile([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    return $null
  }
  $raw = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return $null
  }
  return $raw | ConvertFrom-Json
}

function Get-ProductCode() {
  $config = Read-JsonFile $ConfigPath
  if ($config -and $config.activation -and $config.activation.productCode) {
    return [string]$config.activation.productCode
  }
  return "GEOTRACK-RT"
}

function Get-TrackingMachineFingerprint([string]$ProductCode) {
  $machineGuid = ""
  try {
    $machineGuid = [string](Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Cryptography" -Name "MachineGuid" -ErrorAction Stop).MachineGuid
  } catch {
    $machineGuid = ""
  }

  $computerName = [System.Environment]::MachineName
  $seed = "{0}|{1}|{2}" -f $ProductCode, $computerName, $machineGuid
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($seed)
    $hashBytes = $sha.ComputeHash($bytes)
    $hash = ([System.BitConverter]::ToString($hashBytes)).Replace("-", "")
  } finally {
    $sha.Dispose()
  }

  return [pscustomobject]@{
    machineId = ("GT-" + $hash.Substring(0, 24))
    computerName = $computerName
    machineGuid = $machineGuid
  }
}

$productCode = Get-ProductCode
$fingerprint = Get-TrackingMachineFingerprint $productCode
$requestPayload = [ordered]@{
  productCode = $productCode
  machineId = $fingerprint.machineId
  computerName = $fingerprint.computerName
  machineGuid = $fingerprint.machineGuid
  requestedAt = (Get-Date).ToString("o")
  notes = "Enviar este archivo al proveedor para generar la licencia local."
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $Root ("activation-request-{0}.json" -f $fingerprint.computerName)
}

$requestPayload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host ("Solicitud generada en {0}" -f $OutputPath) -ForegroundColor Green
Write-Host ("Machine ID: {0}" -f $fingerprint.machineId) -ForegroundColor Cyan
