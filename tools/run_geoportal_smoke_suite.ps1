param(
  [int]$Port = 8765,
  [int]$DebugPort = 9222,
  [string]$Scenario = "all",
  [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$PowerShellExe = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
$NodeWrapper = Join-Path $PSScriptRoot "use_local_node.ps1"
$SuiteScript = Join-Path $PSScriptRoot "browser_smoke_suite.mjs"
$ServerScript = Join-Path $Root "server.ps1"
$BrowserCandidates = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
  $OutputDir = Join-Path $Root "tmp\smoke"
}

function Test-TcpPort([int]$TargetPort) {
  $client = $null
  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $async = $client.BeginConnect("127.0.0.1", $TargetPort, $null, $null)
    if (-not $async.AsyncWaitHandle.WaitOne(400)) {
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

function Wait-HttpReady([string]$Url, [int]$Attempts = 35, [int]$DelayMs = 500) {
  for ($attempt = 0; $attempt -lt $Attempts; $attempt++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
    }
    Start-Sleep -Milliseconds $DelayMs
  }
  return $false
}

function Resolve-BrowserPath() {
  foreach ($candidate in $BrowserCandidates) {
    if (Test-Path $candidate) {
      return $candidate
    }
  }
  throw "No encontre Chrome ni Edge para ejecutar la suite de humo."
}

if (-not (Test-Path $ServerScript)) {
  throw "No se encontro server.ps1 en $Root"
}

if (-not (Test-Path $NodeWrapper)) {
  throw "No se encontro use_local_node.ps1 en $PSScriptRoot"
}

if (-not (Test-TcpPort $Port)) {
  $stdout = Join-Path $Root "server_stdout.log"
  $stderr = Join-Path $Root "server_stderr.log"
  Start-Process -FilePath $PowerShellExe `
    -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File "{0}" -Port {1}' -f $ServerScript, $Port) `
    -WorkingDirectory $Root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr
}

if (-not (Wait-HttpReady -Url ("http://127.0.0.1:{0}/" -f $Port))) {
  throw "No se pudo levantar el geoportal local en http://127.0.0.1:$Port/"
}

if (-not (Test-TcpPort $DebugPort)) {
  $browser = Resolve-BrowserPath
  $profileDir = Join-Path $OutputDir "browser-profile"
  New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
  Start-Process -FilePath $browser `
    -ArgumentList @(
      "--remote-debugging-address=127.0.0.1",
      "--remote-debugging-port=$DebugPort",
      "--user-data-dir=$profileDir",
      "--new-window",
      "about:blank"
    ) `
    -WindowStyle Hidden
}

if (-not (Wait-HttpReady -Url ("http://127.0.0.1:{0}/json/version" -f $DebugPort) -Attempts 20 -DelayMs 450)) {
  throw "No se pudo habilitar la depuracion remota del navegador en 127.0.0.1:$DebugPort."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

& $NodeWrapper $SuiteScript --port $Port --debug-port $DebugPort --scenario $Scenario --output-dir $OutputDir
exit $LASTEXITCODE
