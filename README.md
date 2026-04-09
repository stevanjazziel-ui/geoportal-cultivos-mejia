# Geoportal Cultivos Mejia

Primera version navegable de un geoportal agronomico orientado al canton Mejia.

## Incluye

- Acceso como usuario publico desde navegador.
- Panel lateral con pestanas `Capas`, `Imagenes Sentinel-2` y `Modulos Agricolas`.
- Visor web responsive con mapa base satelital o de calles.
- Busqueda de escenas Sentinel-2 por fecha y nubosidad.
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

## Siguiente paso recomendado

Conectar esta interfaz con servicios reales:

- catalogo STAC o API Sentinel-2 para escenas reales;
- procesamiento de indices sobre AOI real;
- DEM Copernicus GLO-30;
- ERA5-Land y MODIS;
- autenticacion y persistencia de proyectos o lotes.
