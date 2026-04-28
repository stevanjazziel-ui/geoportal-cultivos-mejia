@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\run_geoportal_smoke_suite.ps1" %*
endlocal
