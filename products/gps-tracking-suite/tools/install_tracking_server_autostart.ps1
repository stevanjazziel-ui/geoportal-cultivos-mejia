param(
  [string]$TaskName = "GeoTrack RT Server Host",
  [int]$Port = 0,
  [string]$BindAddress = "",
  [switch]$StartNow
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ConfigPath = Join-Path $Root "tracking.config.json"
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$HostScript = Join-Path $PSScriptRoot "run_tracking_server_host.ps1"
$StartupDirectory = [Environment]::GetFolderPath("Startup")
$StartupLauncherPath = Join-Path $StartupDirectory "GeoTrack RT Server Host.cmd"

if (-not (Test-Path -LiteralPath $HostScript)) {
  throw "No se encontro $HostScript"
}

function Read-Config() {
  if (-not (Test-Path -LiteralPath $ConfigPath)) {
    return $null
  }
  $raw = Get-Content -LiteralPath $ConfigPath -Raw -ErrorAction SilentlyContinue
  if ([string]::IsNullOrWhiteSpace($raw)) {
    return $null
  }
  return $raw | ConvertFrom-Json
}

$config = Read-Config
if ($Port -le 0) {
  $Port = if ($config -and $config.port) { [int]$config.port } else { 8877 }
}
if ([string]::IsNullOrWhiteSpace($BindAddress)) {
  $BindAddress = if ($config -and $config.bindAddress) { [string]$config.bindAddress } else { "127.0.0.1" }
}

$quotedScript = '"' + $HostScript + '"'
$arguments = @(
  "-NoProfile",
  "-WindowStyle Hidden",
  "-ExecutionPolicy Bypass",
  "-File $quotedScript",
  "-Port $Port",
  "-BindAddress `"$BindAddress`""
) -join " "

function Install-StartupLauncher() {
  if (-not (Test-Path -LiteralPath $StartupDirectory)) {
    New-Item -ItemType Directory -Path $StartupDirectory -Force | Out-Null
  }
  $launchLine = 'start ""GeoTrack RT Server Host"" /min powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -Port {1} -BindAddress "{2}"' -f $HostScript, $Port, $BindAddress
  Set-Content -LiteralPath $StartupLauncherPath -Value @("@echo off", $launchLine) -Encoding ASCII
}

function Start-HostNow() {
  Start-Process -FilePath $PowerShellExe -ArgumentList $arguments -WorkingDirectory $Root -WindowStyle Hidden
}

$canUseSystemTask = $true
try {
  $action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument $arguments
  $trigger = New-ScheduledTaskTrigger -AtStartup
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650)
  $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Arranca GeoTrack RT como host persistente desde el inicio del sistema." -Force | Out-Null
  if (Test-Path -LiteralPath $StartupLauncherPath) {
    Remove-Item -LiteralPath $StartupLauncherPath -Force -ErrorAction SilentlyContinue
  }
  Write-Host "Inicio automatico del servidor instalado." -ForegroundColor Green
  Write-Host ("Tarea: {0}" -f $TaskName)
  Write-Host ("Escucha interna: {0}:{1}" -f $BindAddress, $Port)
} catch {
  $errorMessage = [string]$_.Exception.Message
  if ($errorMessage -match "Acceso denegado|Access denied|0x80070005|0x80041003") {
    $canUseSystemTask = $false
  } else {
    throw
  }
}

if (-not $canUseSystemTask) {
  Install-StartupLauncher
  Write-Host "No hubo permisos para SYSTEM; deje autoarranque de usuario." -ForegroundColor DarkYellow
  Write-Host ("Inicio del usuario: {0}" -f $StartupLauncherPath)
}

if ($StartNow) {
  Start-HostNow
  Write-Host "Servidor GeoTrack RT iniciado ahora mismo en segundo plano." -ForegroundColor Green
}
