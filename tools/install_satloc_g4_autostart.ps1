param(
  [string]$TaskName = "Geoportal Satloc G4 Gateway",
  [string]$AreaId = "machachi",
  [string]$DeviceId = "satloc-g4-aeronave",
  [string]$DeviceLabel = "Aeronave Satloc G4",
  [string]$DeviceType = "Avioneta",
  [string]$PortName = "",
  [string]$ServerUrl = "http://127.0.0.1:8765",
  [switch]$StartNow
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$GatewayScript = Join-Path $Root "tools\run_satloc_g4_gateway.ps1"
$StartupDirectory = [Environment]::GetFolderPath("Startup")
$StartupLauncherPath = Join-Path $StartupDirectory "Geoportal Satloc G4 Gateway.cmd"

if (-not (Test-Path -LiteralPath $GatewayScript)) {
  throw "No se encontro $GatewayScript"
}

$quotedGateway = '"' + $GatewayScript + '"'
$arguments = @(
  "-NoProfile",
  "-WindowStyle Hidden",
  "-ExecutionPolicy Bypass",
  "-File $quotedGateway",
  "-AreaId `"$AreaId`"",
  "-DeviceId `"$DeviceId`"",
  "-DeviceLabel `"$DeviceLabel`"",
  "-DeviceType `"$DeviceType`"",
  "-ServerUrl `"$ServerUrl`""
)

if (-not [string]::IsNullOrWhiteSpace($PortName)) {
  $arguments += "-PortName `"$PortName`""
}

$joinedArguments = $arguments -join " "

function Install-StartupLauncher([string]$CommandArguments) {
  if (-not (Test-Path -LiteralPath $StartupDirectory)) {
    New-Item -ItemType Directory -Path $StartupDirectory -Force | Out-Null
  }

  $portArgument = if (-not [string]::IsNullOrWhiteSpace($PortName)) { ' -PortName "' + $PortName + '"' } else { "" }
  $launchLine = 'start ""Geoportal Satloc G4 Gateway"" /min powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}" -AreaId "{1}" -DeviceId "{2}" -DeviceLabel "{3}" -DeviceType "{4}" -ServerUrl "{5}"{6}' -f $GatewayScript, $AreaId, $DeviceId, $DeviceLabel, $DeviceType, $ServerUrl, $portArgument
  $content = @(
    "@echo off"
    $launchLine
  )
  Set-Content -LiteralPath $StartupLauncherPath -Value $content -Encoding ASCII
}

function Start-GatewayNow([string]$CommandArguments) {
  Start-Process -FilePath $PowerShellExe -ArgumentList $CommandArguments -WorkingDirectory $Root -WindowStyle Hidden
}

$installedMode = ""
$canUseSystemTask = $true
try {
  $action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument ($arguments -join " ")
  $trigger = New-ScheduledTaskTrigger -AtStartup
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650)
  $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Arranca el gateway Satloc G4 para publicar telemetria de vuelo al geoportal desde el inicio del sistema." -Force | Out-Null
  if (Test-Path -LiteralPath $StartupLauncherPath) {
    Remove-Item -LiteralPath $StartupLauncherPath -Force -ErrorAction SilentlyContinue
  }
  $installedMode = "system"
  Write-Host "Inicio automatico industrial instalado." -ForegroundColor Green
  Write-Host ("Tarea: {0}" -f $TaskName)
  Write-Host "Cuenta: SYSTEM"
  Write-Host "A partir de ahora, el gateway Satloc arrancara con Windows, sin depender de abrir sesion."
} catch {
  $errorMessage = [string]$_.Exception.Message
  if ($errorMessage -match "Acceso denegado|Access denied|0x80070005|0x80041003") {
    $canUseSystemTask = $false
  } else {
    throw
  }
}

if (-not $canUseSystemTask) {
  Install-StartupLauncher $joinedArguments
  $installedMode = "startup-folder"
  Write-Host "No hubo permisos de administrador para SYSTEM; deje un autoarranque de usuario." -ForegroundColor DarkYellow
  Write-Host ("Inicio del usuario: {0}" -f $StartupLauncherPath)
  Write-Host "El gateway arrancara automaticamente al iniciar sesion en esta cuenta."
}

if ($StartNow) {
  Start-GatewayNow $joinedArguments
  Write-Host "Gateway Satloc iniciado ahora mismo en segundo plano." -ForegroundColor Green
}
