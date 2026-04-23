param(
  [Parameter(Mandatory = $true)]
  [string]$CompanyName,
  [string[]]$MachineIds = @(),
  [string[]]$HostNames = @(),
  [string]$ProductCode = "GEOTRACK-RT",
  [string]$LicenseCode = "",
  [string]$ExpiresAt = "",
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

if (-not $MachineIds.Count -and -not $HostNames.Count) {
  throw "Debes indicar al menos un MachineId o un HostName."
}

$safeLicenseCode = if ([string]::IsNullOrWhiteSpace($LicenseCode)) {
  "GT-" + (Get-Date -Format "yyyyMMddHHmmss")
} else {
  $LicenseCode.Trim()
}

$payload = [ordered]@{
  productCode = $ProductCode
  companyName = $CompanyName
  licenseCode = $safeLicenseCode
  issuedAt = (Get-Date).ToUniversalTime().ToString("o")
  expiresAt = $ExpiresAt
  machineIds = @($MachineIds | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
  hostNames = @($HostNames | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
  notes = "Licencia local generada para instalacion cliente."
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path (Get-Location) ("license-{0}.json" -f $safeLicenseCode.ToLowerInvariant())
}

$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host ("Licencia generada en {0}" -f $OutputPath) -ForegroundColor Green
