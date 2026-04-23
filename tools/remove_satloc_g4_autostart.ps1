param(
  [string]$TaskName = "Geoportal Satloc G4 Bridge"
)

$ErrorActionPreference = "Stop"

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host ("Se elimino la tarea {0}." -f $TaskName) -ForegroundColor Green
} else {
  Write-Host ("No existe la tarea {0}." -f $TaskName) -ForegroundColor DarkYellow
}
