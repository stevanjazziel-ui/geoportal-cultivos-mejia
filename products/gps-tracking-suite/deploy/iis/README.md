# IIS para GeoTrack RT

## Requisitos

- IIS instalado
- URL Rewrite instalado
- Application Request Routing (ARR) instalado
- Certificado HTTPS del dominio del cliente

## Pasos

1. Crea un sitio IIS para `tracking.empresa.com`.
2. Asigna el binding HTTPS del dominio real.
3. Copia `web.config` a la raiz del sitio IIS.
4. En `tracking.config.json` define:
   - `bindAddress = "127.0.0.1"`
   - `port = 8877`
   - `publicOrigin = "https://tracking.empresa.com"`
5. Instala el autoarranque del servidor con `Instalar Inicio Automatico GeoTrack RT.bat`.
6. Habilita ARR proxy en IIS.
7. Reinicia IIS.

## Flujo resultante

- IIS publica el dominio HTTPS
- GeoTrack RT corre interno en `127.0.0.1:8877`
- La empresa usa navegador web, sin instalar el modulo en cada PC
