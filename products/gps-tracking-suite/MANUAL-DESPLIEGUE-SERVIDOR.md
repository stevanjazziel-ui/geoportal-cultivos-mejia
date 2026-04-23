# Manual corto de despliegue en servidor

## Objetivo

Instalar GeoTrack RT en un servidor Windows de la empresa compradora para que el modulo quede centralizado, licenciado localmente en ese servidor y accesible por navegador desde toda la empresa.

## 1. Copiar el producto

- Copia la carpeta `gps-tracking-suite` al servidor, por ejemplo `C:\GeoTrackRT`.

## 2. Ajustar configuracion

Edita `tracking.config.json`:

- `bindAddress`: `127.0.0.1`
- `port`: `8877`
- `publicOrigin`: `https://tracking.empresa.com`
- `ingestToken`: token privado de la empresa
- `shareIngestTokenInSenderLinks`: `false`

Puedes tomar como base `tracking.config.server.example.json`.

## 3. Activar la licencia en el servidor

1. Ejecuta `Generar Solicitud de Activacion.bat`.
2. Envianos el archivo `activation-request-<SERVIDOR>.json`.
3. Te devolvemos la licencia.
4. Ejecuta `Instalar Licencia de Activacion.bat`.

La licencia queda instalada sobre ese servidor, no en cada computadora usuaria.

## 4. Instalar el arranque automatico del servidor

Ejecuta:

- `Instalar Inicio Automatico GeoTrack RT.bat`

Eso deja un host persistente que vuelve a levantar GeoTrack RT si el proceso cae.

## 5. Publicar por HTTPS

### Recomendado: Caddy

- Usa `deploy/caddy/Caddyfile.template`
- Cambia el dominio del cliente
- Publica `https://tracking.empresa.com`

### Alternativa: IIS

- Usa `deploy/iis/web.config`
- Instala URL Rewrite y ARR
- Publica el sitio HTTPS del cliente

## 6. Si Satloc G4 estara en el mismo servidor

- Conecta el equipo Satloc por COM/USB al servidor.
- Ejecuta `Instalar Inicio Automatico Satloc G4.bat`.

## 7. Si Satloc G4 estara en otra PC

- Instala solo el gateway Satloc en esa PC.
- Configura `ServerUrl` apuntando al servidor central, por ejemplo `https://tracking.empresa.com`.

## 8. Verificacion final

- Abre `https://tracking.empresa.com`
- Confirma que el modulo aparece activado
- Abre el emisor GPS desde un celular
- Verifica que el mapa reciba la senal
- Si aplica, prende Satloc G4 y comprueba que la telemetria llegue sola

## 9. Archivos clave

- `server.ps1`
- `tracking.config.json`
- `license\license.json`
- `data\logs\geotrack_server_host.log`
- `data\logs\satloc_g4_gateway.log`
