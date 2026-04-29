@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\validate_deploy_bundle.ps1" %*
endlocal
