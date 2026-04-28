param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$NodeArgs
)

$ErrorActionPreference = "Stop"

$runtimeRoot = Join-Path $PSScriptRoot "runtime"

if (-not (Test-Path $runtimeRoot)) {
  throw "No se encontro tools/runtime. Descarga primero Node portable en el proyecto."
}

$nodeExe = Get-ChildItem -Path $runtimeRoot -Directory -Filter "node-v*-win-x64" |
  Sort-Object Name -Descending |
  ForEach-Object { Join-Path $_.FullName "node.exe" } |
  Where-Object { Test-Path $_ } |
  Select-Object -First 1

if (-not $nodeExe) {
  throw "No se encontro node.exe dentro de tools/runtime."
}

if (-not $NodeArgs -or $NodeArgs.Count -eq 0) {
  Write-Output "Node local: $nodeExe"
  & $nodeExe --version
  exit $LASTEXITCODE
}

& $nodeExe @NodeArgs
exit $LASTEXITCODE
