@echo off
cd /d "%~dp0"
set /p LICENSE_PATH=Ruta del archivo de licencia (.json): 
if "%LICENSE_PATH%"=="" exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\install_activation_license.ps1" -LicenseFilePath "%LICENSE_PATH%"
