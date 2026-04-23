param(
  [int]$Port = 8877,
  [string]$BindAddress = "127.0.0.1",
  [int]$RestartDelaySeconds = 6
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$ServerScript = Join-Path $Root "server.ps1"
$LogDirectory = Join-Path $Root "data\logs"
$LogPath = Join-Path $LogDirectory "geotrack_server_host.log"

if (-not (Test-Path -LiteralPath $ServerScript)) {
  throw "No se encontro $ServerScript"
}

if (-not (Test-Path -LiteralPath $LogDirectory)) {
  New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null
}

function Write-HostLog([string]$Message, [string]$Level = "INFO") {
  $line = "[{0}] [{1}] {2}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Level.ToUpperInvariant(), $Message
  Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
}

function Build-ServerArguments() {
  return @(
    "-NoProfile",
    "-ExecutionPolicy Bypass",
    "-File `"$ServerScript`"",
    "-Port $Port",
    "-BindAddress `"$BindAddress`""
  ) -join " "
}

Write-HostLog ("Supervisor GeoTrack RT iniciado sobre {0}:{1}." -f $BindAddress, $Port)

while ($true) {
  $arguments = Build-ServerArguments
  Write-HostLog ("Lanzando servidor con argumentos: {0}" -f $arguments)
  $process = $null
  try {
    $process = Start-Process -FilePath $PowerShellExe -ArgumentList $arguments -WorkingDirectory $Root -WindowStyle Hidden -PassThru
    Write-HostLog ("Servidor GeoTrack RT ejecutandose con PID {0}." -f $process.Id)
    $process.WaitForExit()
    Write-HostLog ("El servidor GeoTrack RT termino con codigo {0}. Reiniciando en {1} s." -f $process.ExitCode, $RestartDelaySeconds) "WARN"
  } catch {
    Write-HostLog ("Fallo el supervisor GeoTrack RT: {0}. Reintentando en {1} s." -f $_.Exception.Message, $RestartDelaySeconds) "ERROR"
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
