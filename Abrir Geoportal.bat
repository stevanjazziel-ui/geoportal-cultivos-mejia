@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "if (-not (Test-NetConnection 127.0.0.1 -Port 8765 -InformationLevel Quiet)) { Start-Process -FilePath 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','%~dp0server.ps1' -WindowStyle Hidden; Start-Sleep -Seconds 2 }; Start-Process 'http://127.0.0.1:8765/'"

endlocal
