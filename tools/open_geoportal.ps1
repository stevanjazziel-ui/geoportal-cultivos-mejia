param(
  [string]$Path = "/",
  [int]$Port = 8765
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ServerScript = Join-Path $Root "server.ps1"
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

function Test-GeoportalPort([int]$TargetPort) {
  $client = $null
  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $async = $client.BeginConnect("127.0.0.1", $TargetPort, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(350)) {
      return $false
    }
    $client.EndConnect($async)
    return $true
  } catch {
    return $false
  } finally {
    if ($client) {
      $client.Close()
    }
  }
}

if (-not (Test-Path -LiteralPath $ServerScript)) {
  throw "No se encontro server.ps1 en $Root"
}

if (-not (Test-GeoportalPort $Port)) {
  $serverArgs = '-NoProfile -ExecutionPolicy Bypass -File "{0}" -Port {1}' -f $ServerScript, $Port
  Start-Process -FilePath $PowerShellExe -ArgumentList $serverArgs -WorkingDirectory $Root -WindowStyle Hidden

  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    Start-Sleep -Milliseconds 350
    if (Test-GeoportalPort $Port) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    throw "No se pudo iniciar el backend local en el puerto $Port."
  }
}

$cleanPath = if ([string]::IsNullOrWhiteSpace($Path)) { "/" } else { $Path }
if (-not $cleanPath.StartsWith("/")) {
  $cleanPath = "/$cleanPath"
}

Start-Process ("http://127.0.0.1:{0}{1}" -f $Port, $cleanPath)
