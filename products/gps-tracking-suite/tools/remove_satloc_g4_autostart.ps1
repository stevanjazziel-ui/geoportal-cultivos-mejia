param(
  [string]$TaskName = "GeoTrack Satloc G4 Gateway"
)

$ErrorActionPreference = "Stop"
$StartupDirectory = [Environment]::GetFolderPath("Startup")
$StartupLauncherPath = Join-Path $StartupDirectory "GeoTrack Satloc G4 Gateway.cmd"

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host ("Se elimino la tarea {0}." -f $TaskName) -ForegroundColor Green
} else {
  Write-Host ("No existe la tarea {0}." -f $TaskName) -ForegroundColor DarkYellow
}

if (Test-Path -LiteralPath $StartupLauncherPath) {
  Remove-Item -LiteralPath $StartupLauncherPath -Force -ErrorAction SilentlyContinue
  Write-Host ("Se elimino el lanzador de inicio {0}." -f $StartupLauncherPath) -ForegroundColor Green
}
