@echo off
setlocal
cd /d "%~dp0"
set /p COMPANY_NAME=Empresa cliente: 
set /p MACHINE_IDS=MachineIds (separa con coma): 
set /p LICENSE_CODE=Codigo licencia: 
set /p EXPIRES_AT=Vencimiento ISO opcional (ej. 2027-12-31T23:59:59Z): 
set /p OUTPUT_PATH=Ruta de salida opcional: 
if "%COMPANY_NAME%"=="" exit /b 1
if "%MACHINE_IDS%"=="" exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$machineIds = '%MACHINE_IDS%'.Split(',') ^| ForEach-Object { $_.Trim() } ^| Where-Object { $_ }; & '%~dp0generate_activation_license.ps1' -CompanyName '%COMPANY_NAME%' -MachineIds $machineIds -LicenseCode '%LICENSE_CODE%' -ExpiresAt '%EXPIRES_AT%' -OutputPath '%OUTPUT_PATH%'"
endlocal
