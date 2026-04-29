param(
  [string]$Scenario = "all",
  [switch]$SkipSmoke,
  [switch]$BuildStandalonePackage,
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$ValidationScript = Join-Path $Root "products\gps-tracking-suite\tools\validate_deploy_bundle.ps1"
$checks = New-Object System.Collections.Generic.List[object]
$summary = $null
$failure = $null

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $OutputPath = Join-Path $Root "tmp\release\release-readiness-summary.json"
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outputDirectory) -and -not (Test-Path -LiteralPath $outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

function Add-CheckResult {
  param(
    [string]$Name,
    [string]$Status,
    [string]$Detail
  )

  $checks.Add([pscustomobject]@{
    name = $Name
    status = $Status
    detail = $Detail
  })
}

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  Write-Host ("== {0} ==" -f $Name) -ForegroundColor Cyan
  try {
    & $Action
    Add-CheckResult -Name $Name -Status "ok" -Detail "Completado"
  } catch {
    Add-CheckResult -Name $Name -Status "error" -Detail $_.Exception.Message
    throw
  }
}

try {
  Invoke-Step "Sintaxis app.js" {
    & (Join-Path $Root "tools\use_local_node.ps1") --check (Join-Path $Root "app.js")
  }

  Invoke-Step "Sintaxis smoke suite" {
    & (Join-Path $Root "tools\use_local_node.ps1") --check (Join-Path $Root "tools\browser_smoke_suite.mjs")
  }

  Invoke-Step "Consistencia git diff" {
    git -C $Root diff --check | Out-Null
  }

  if (-not $SkipSmoke) {
    Invoke-Step "Smoke suite geoportal" {
      & (Join-Path $Root "tools\run_geoportal_smoke_suite.ps1") -Scenario $Scenario
    }
  } else {
    Add-CheckResult -Name "Smoke suite geoportal" -Status "skipped" -Detail "Omitida por parametro -SkipSmoke"
  }

  Invoke-Step "Validacion GeoTrack RT" {
    & $ValidationScript -BuildPackage:$BuildStandalonePackage -OutputPath (Join-Path $Root "tmp\release\geotrack-validation-summary.json")
  }
} catch {
  $failure = $_
} finally {
  $summary = [pscustomobject]@{
    ok = -not ($checks | Where-Object { $_.status -eq "error" })
    generatedAt = (Get-Date).ToString("o")
    root = $Root
    outputPath = $OutputPath
    checks = $checks
  }

  $summaryJson = $summary | ConvertTo-Json -Depth 6
  Set-Content -LiteralPath $OutputPath -Value $summaryJson -Encoding UTF8
  Write-Host ("Resumen de release readiness guardado en {0}" -f $OutputPath) -ForegroundColor Green
  $summaryJson
}

if ($failure) {
  throw $failure
}
