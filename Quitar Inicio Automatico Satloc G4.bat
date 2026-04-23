@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\remove_satloc_g4_autostart.ps1"

endlocal
