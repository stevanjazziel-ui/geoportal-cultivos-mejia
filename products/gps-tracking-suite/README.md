# GeoTrack RT

Producto standalone de seguimiento GPS y telemetria en tiempo real, separado del geoportal central. Esta carpeta esta pensada para empaquetarse, venderse e instalarse en un servidor o una PC de la empresa cliente sin arrastrar el resto del sistema.

## Que incluye

- Visor web independiente con mapa, dispositivos, trayectorias, eventos y estado de senal.
- Emisor GPS web para celular, tablet o laptop.
- API local para ingesta y visualizacion en tiempo real.
- Activacion local por computadora del cliente.
- Puente Satloc G4 por NMEA 0183 para avioneta, dron o equipo aeronautico compatible.
- Autoarranque del gateway Satloc para despliegues operativos.
- Empaquetador zip para entregar una version instalable al cliente.

## Estructura

- `server.ps1`: backend standalone.
- `tracking.config.json`: configuracion por cliente.
- `public/`: visor, emisor y activos web.
- `license/`: plantilla y licencia local instalada del cliente.
- `tools/connect_satloc_g4.ps1`: puente NMEA a API.
- `tools/run_satloc_g4_gateway.ps1`: supervisor persistente.
- `tools/install_satloc_g4_autostart.ps1`: instala autoarranque.
- `tools/export_activation_request.ps1`: genera la solicitud de activacion de la PC cliente.
- `tools/install_activation_license.ps1`: instala la licencia emitida.
- `tools/build_deploy_package.ps1`: genera zip de entrega.
- `vendor/generate_activation_license.ps1`: genera la licencia local del cliente desde el lado proveedor.

## Instalacion rapida

1. Edita `tracking.config.json`.
2. Ajusta `publicOrigin` si el servidor sera publico.
3. Si quieres seguridad de ingesta, define `ingestToken`.
4. Genera la solicitud con `Generar Solicitud de Activacion.bat`.
5. Emite la licencia desde el lado proveedor.
6. Instala la licencia con `Instalar Licencia de Activacion.bat`.
7. Ejecuta `Abrir Seguimiento GPS.bat`.
8. Abre `http://127.0.0.1:8877/`.

## Produccion

### En una PC o servidor Windows

1. Copia esta carpeta completa al equipo final.
2. Si se conectaran celulares o equipos externos, publica el puerto HTTP detras de HTTPS con el dominio de la empresa o con un proxy inverso.
3. Ajusta `publicOrigin` con la URL publica real, por ejemplo `https://tracking.cliente.com`.
4. Si usaras Satloc G4, conecta el equipo por USB/COM a la PC receptora.
5. Instala el autoarranque con `Instalar Inicio Automatico Satloc G4.bat`.

### Recomendacion de seguridad

- Usa `ingestToken` para evitar envios no autorizados.
- Solo comparte el token en links si `shareIngestTokenInSenderLinks` esta en `true`.
- Si el cliente tiene dominio publico, sirve el modulo por HTTPS para permitir geolocalizacion desde cualquier red.

## Activacion local por computadora

El producto queda amarrado a una o varias computadoras administradas por la empresa compradora.

### Flujo

1. En la PC cliente se ejecuta `Generar Solicitud de Activacion.bat`.
2. Eso crea un JSON con `machineId` y `computerName`.
3. El proveedor genera la licencia local usando `vendor/generate_activation_license.ps1`.
4. La empresa cliente instala la licencia con `Instalar Licencia de Activacion.bat`.
5. El servidor standalone solo habilita `config`, `network`, `live` e `ingest` cuando la licencia local es valida.

### Ejemplo proveedor

```powershell
powershell -ExecutionPolicy Bypass -File .\vendor\generate_activation_license.ps1 -CompanyName "Empresa Cliente" -MachineIds "GT-ABC1234567890XYZ987654" -OutputPath .\license-cliente.json
```

### Ejemplo cliente

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\install_activation_license.ps1 -LicenseFilePath .\license-cliente.json
```

## Flujo operativo

### Celular o tablet

1. Entra al visor.
2. Copia el link del emisor.
3. Abre el link en el otro dispositivo.
4. Pulsa `Iniciar envio`.
5. El visor empieza a mostrar la posicion, la trayectoria y los eventos.

### Satloc G4

1. Conecta Satloc G4 por serie o adaptador USB-serial a la PC receptora.
2. Ajusta `ServerUrl` al servidor del cliente si no sera local.
3. Ejecuta `tools/connect_satloc_g4.ps1` o instala el autoarranque.
4. Cuando el equipo empiece a emitir NMEA, el gateway detecta la senal y publica en `/api/tracking/ingest`.

## Empaquetar para entrega

Ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\build_deploy_package.ps1
```

El zip saldra en `dist/`.
