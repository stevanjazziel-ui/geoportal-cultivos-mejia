# Geoportal Cultivos Mejia

Primera version navegable de un geoportal agronomico orientado al canton Mejia.

## Incluye

- Acceso como usuario publico desde navegador.
- Panel lateral con pestanas `Capas`, `Imagenes Sentinel-2` y `Modulos Agricolas`.
- Visor web responsive con mapa base satelital o de calles.
- Busqueda real de escenas Sentinel-2 por fecha y nubosidad usando Copernicus STAC.
- Visualizacion de indices `NDVI`, `NDWI`, `NDRE` y `MSAVI` con leyenda.
- Analisis intralote con dibujo de poligonos o seleccion de lotes demo.
- Estimaciones beta de relieve, clima agricola y asistente guiado por etapa.

## Archivos

- `index.html`: estructura del geoportal.
- `styles.css`: identidad visual y comportamiento responsive.
- `app.js`: logica del visor, capas, escenas e interacciones agronomicas.

## Uso

1. Abre `index.html` en el navegador.
2. Ingresa como `usuario publico`.
3. Explora las capas del visor, filtra escenas Sentinel-2 y prueba los modulos agricolas.

## Sentinel-2 real: fase actual

- La pestana `Imagenes Sentinel-2` consulta escenas reales en el catalogo STAC oficial de Copernicus Data Space.
- La escena seleccionada muestra metadata real y su huella geografica en el mapa.
- Los indices espectrales sobre el mapa y los modulos agricolas siguen en fase beta local mientras se integra el procesamiento real.

## Siguiente paso recomendado

Profundizar la integracion real:

- procesamiento real de indices sobre AOI y lote activo;
- proxy o backend para stats, cache y procesamiento seguro;
- DEM Copernicus GLO-30;
- ERA5-Land y MODIS;
- autenticacion y persistencia de proyectos o lotes.
