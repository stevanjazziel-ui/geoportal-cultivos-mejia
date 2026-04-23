param(
  [string]$TaskName = "Geoportal Satloc G4 Bridge",
  [string]$AreaId = "machachi",
  [string]$DeviceId = "satloc-g4-aeronave",
  [string]$DeviceLabel = "Aeronave Satloc G4",
  [string]$DeviceType = "Avioneta",
  [string]$PortName = "",
  [string]$ServerUrl = "http://127.0.0.1:8765"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$BridgeScript = Join-Path $Root "tools\connect_satloc_g4.ps1"

if (-not (Test-Path -LiteralPath $BridgeScript)) {
  throw "No se encontro $BridgeScript"
}

$quotedBridge = '"' + $BridgeScript + '"'
$arguments = @(
  "-NoProfile",
  "-WindowStyle Hidden",
  "-ExecutionPolicy Bypass",
  "-File $quotedBridge",
  "-AreaId `"$AreaId`"",
  "-DeviceId `"$DeviceId`"",
  "-DeviceLabel `"$DeviceLabel`"",
  "-DeviceType `"$DeviceType`"",
  "-ServerUrl `"$ServerUrl`""
)

if (-not [string]::IsNullOrWhiteSpace($PortName)) {
  $arguments += "-PortName `"$PortName`""
}

$action = New-ScheduledTaskAction -Execute $PowerShellExe -Argument ($arguments -join " ")
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$userId = if ($env:USERDOMAIN) { "$($env:USERDOMAIN)\$($env:USERNAME)" } else { $env:USERNAME }
$principal = New-ScheduledTaskPrincipal -UserId $userId -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Arranca el puente Satloc G4 para publicar telemetria de vuelo al geoportal." -Force | Out-Null

Write-Host "Inicio automatico instalado." -ForegroundColor Green
Write-Host ("Tarea: {0}" -f $TaskName)
Write-Host ("Usuario: {0}" -f $userId)
Write-Host "A partir de ahora, al iniciar sesion en Windows el puente Satloc quedara escuchando automaticamente."
