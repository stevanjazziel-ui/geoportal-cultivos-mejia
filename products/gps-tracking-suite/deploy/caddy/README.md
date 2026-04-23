# Caddy para GeoTrack RT

## Recomendado

Caddy es la opcion mas simple para publicar GeoTrack RT en HTTPS con renovacion automatica de certificados.

## Pasos

1. Instala Caddy en el servidor Windows.
2. Copia `Caddyfile.template` a `C:\Caddy\Caddyfile`.
3. Cambia `tracking.empresa.com` por el dominio real del cliente.
4. Verifica que `tracking.config.json` tenga:
   - `bindAddress = "127.0.0.1"`
   - `port = 8877`
   - `publicOrigin = "https://tracking.empresa.com"`
5. Abre puertos `80` y `443` hacia el servidor.
6. Arranca GeoTrack RT con `Instalar Inicio Automatico GeoTrack RT.bat`.
7. Arranca Caddy como servicio.

## Flujo resultante

- Caddy expone `https://tracking.empresa.com`
- GeoTrack RT escucha solo en `127.0.0.1:8877`
- Los celulares y operadores usan la URL publica
- El servidor queda licenciado localmente
