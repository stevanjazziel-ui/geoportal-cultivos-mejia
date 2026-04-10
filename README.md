# Geoportal Cultivos Mejia

Geoportal agronomico navegable orientado al canton Mejia con escenas Sentinel-2, analisis operativo por AOI y backend local opcional en PowerShell.

## Incluye

- Acceso como usuario publico desde navegador.
- Panel lateral con pestanas `Capas`, `Imagenes Sentinel-2` y `Modulos Agricolas`.
- Visor web responsive con mapa base satelital o de calles.
- Busqueda real de escenas Sentinel-2 por fecha y nubosidad usando Copernicus STAC.
- Procesamiento operativo del AOI o lote activo con resumen, cobertura y zonas de manejo.
- Visualizacion de indices `NDVI`, `NDWI`, `NDRE` y `MSAVI` con leyenda y superficie analitica.
- Selector temporal para elegir escena base, escena de comparacion y navegar la serie disponible.
- Comparacion entre dos escenas Sentinel-2 con resumen temporal y tarjetas de cambio por indice.
- Modo de mapa para alternar entre la escena activa y el cambio temporal estimado sobre el AOI.
- Previsualizacion de la escena real sobre el mapa con control de visibilidad y opacidad.
- Raster exacto de escena real usando COG publico de Sentinel-2 cuando existe coincidencia para la fecha y mosaico.
- Analisis intralote con dibujo de poligonos o seleccion de lotes demo.
- Backend local opcional con proxy STAC, cache en memoria y endpoint de analisis.
- Estimaciones beta de relieve, clima agricola y asistente guiado por etapa.

## Archivos

- `index.html`: estructura del geoportal.
- `styles.css`: identidad visual y comportamiento responsive.
- `app.js`: logica del visor, capas, escenas e interacciones agronomicas.
- `server.ps1`: backend local sin dependencias para proxy, cache y resumen analitico.

## Uso

Modo rapido:

1. Abre `index.html` en el navegador.
2. Ingresa como `usuario publico`.
3. Explora el visor en modo local.

Modo recomendado:

1. Ejecuta `powershell -ExecutionPolicy Bypass -File .\server.ps1`.
2. Abre `http://127.0.0.1:8765/` en el navegador.
3. Ingresa como `usuario publico`.
4. Filtra escenas, selecciona un lote o dibuja un AOI y reprocesa si hace falta.

## Sentinel-2 real: fase actual

- La pestana `Imagenes Sentinel-2` consulta escenas reales en el catalogo STAC oficial de Copernicus Data Space.
- La escena seleccionada muestra metadata real, huella real y una superficie operativa sobre el AOI o lote activo.
- El control temporal permite comparar dos fechas y resaltar deltas de `NDVI`, `NDWI`, `NDRE` y `MSAVI`.
- El backend local agrega proxy STAC, cache y un endpoint de resumen analitico para mejorar estabilidad del flujo.
- Si el backend no esta activo, el visor sigue funcionando con calculo local y fallback demo.

## Notas

- La superficie de indices ya responde al AOI y a la escena activa, pero todavia es un procesamiento operativo calibrado, no raster pixel a pixel.
- El cambio temporal actual es un analisis operativo comparativo entre escenas; sirve para lectura y priorizacion, no como reemplazo de un raster multitemporal calibrado.
- Para llevarlo a analitica plenamente productiva, el siguiente salto natural es incorporar un motor geoespacial que calcule indices reales sobre assets Sentinel-2 o servicios raster dedicados.
