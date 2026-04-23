param(
  [string]$ServerUrl = "http://127.0.0.1:8877",
  [string]$AreaId = "machachi",
  [string]$DeviceId = "satloc-g4-aeronave",
  [string]$DeviceLabel = "Aeronave Satloc G4",
  [string]$DeviceType = "Avioneta",
  [string]$PortName = "",
  [string]$IngestToken = "",
  [int]$RestartDelaySeconds = 8
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$BridgeScript = Join-Path $PSScriptRoot "connect_satloc_g4.ps1"
$LogDirectory = Join-Path $Root "data\logs"
$LogPath = Join-Path $LogDirectory "satloc_g4_gateway.log"

if (-not (Test-Path -LiteralPath $BridgeScript)) {
  throw "No se encontro $BridgeScript"
}

if (-not (Test-Path -LiteralPath $LogDirectory)) {
  New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
}

function Write-GatewayLog([string]$Message, [string]$Level = "INFO") {
  $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level.ToUpperInvariant(), $Message
  Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
}

function Build-BridgeArguments() {
  $arguments = @(
    "-NoProfile",
    "-ExecutionPolicy Bypass",
    "-File `"$BridgeScript`"",
    "-ServerUrl `"$ServerUrl`"",
    "-AreaId `"$AreaId`"",
    "-DeviceId `"$DeviceId`"",
    "-DeviceLabel `"$DeviceLabel`"",
    "-DeviceType `"$DeviceType`""
  )

  if (-not [string]::IsNullOrWhiteSpace($PortName)) {
    $arguments += "-PortName `"$PortName`""
  }
  if (-not [string]::IsNullOrWhiteSpace($IngestToken)) {
    $arguments += "-IngestToken `"$IngestToken`""
  }

  return $arguments -join " "
}

Write-GatewayLog ("Supervisor Satloc G4 iniciado para {0}." -f $DeviceLabel)

while ($true) {
  $arguments = Build-BridgeArguments
  Write-GatewayLog ("Lanzando puente Satloc con argumentos: {0}" -f $arguments)
  $process = $null
  try {
    $process = Start-Process -FilePath $PowerShellExe -ArgumentList $arguments -WorkingDirectory $Root -WindowStyle Hidden -PassThru
    Write-GatewayLog ("Puente Satloc ejecutandose con PID {0}." -f $process.Id)
    $process.WaitForExit()
    Write-GatewayLog ("El puente Satloc termino con codigo {0}. Reiniciando en {1} s." -f $process.ExitCode, $RestartDelaySeconds) "WARN"
  } catch {
    Write-GatewayLog ("Fallo el supervisor Satloc: {0}. Reintentando en {1} s." -f $_.Exception.Message, $RestartDelaySeconds) "ERROR"
  } finally {
    if ($process -and -not $process.HasExited) {
      try {
        $process.Kill()
      } catch {
      }
    }
  }

  Start-Sleep -Seconds ([Math]::Max($RestartDelaySeconds, 3))
}
