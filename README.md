# Geoportal Cultivos Mejia

Geoportal navegable orientado al canton Mejia con rutas de agronomia y planificacion territorial, escenas Sentinel-2, Landsat 8/9 y Sentinel-1, analisis operativo por AOI y backend local opcional en PowerShell.

## Incluye

- Acceso como usuario publico desde navegador.
- Pantalla inicial con entrada directa a `Agronomia` o `Planificacion territorial`.
- Panel lateral con pestanas `Capas`, `Imagenes satelitales` y `Modulos`, con conmutacion de interfaz segun la ruta elegida.
- La planificacion territorial se muestra solo en su ruta dedicada y no dentro del modulo agricola.
- Visor web responsive con mapa base satelital o de calles.
- Selector de sensor con `Sentinel-2`, `Landsat 8/9` y `Sentinel-1 GRD`.
- Busqueda real de escenas Sentinel-2 por fecha y nubosidad usando Copernicus STAC.
- Busqueda real de escenas Landsat 8/9 y Sentinel-1 GRD usando Earth Search.
- Procesamiento operativo del AOI o lote activo con resumen, cobertura y zonas de manejo.
- Visualizacion de indices segun sensor:
  - Sentinel-2: `NDVI`, `NDWI`, `NDRE` y `MSAVI`.
  - Landsat 8/9: `NDVI`, `NDMI`, `NDWI` y `MSAVI`.
  - Sentinel-1 GRD: `RVI`, `VH/VV`, `VV` y `VH`.
- Selector temporal para elegir escena base, escena de comparacion y navegar la serie disponible.
- Comparacion entre dos escenas del sensor activo con resumen temporal y tarjetas de cambio por indice.
- Modo de mapa para alternar entre la escena activa y el cambio temporal estimado sobre el AOI.
- Previsualizacion de la escena real sobre el mapa con control de visibilidad y opacidad.
- Raster exacto de escena real usando COG publico de Sentinel-2 cuando existe coincidencia para la fecha y mosaico.
- Landsat 8/9 y Sentinel-1 se muestran como escena recortada a la huella real usando el thumbnail publico del catalogo.
- El render de escena prioriza previews web mas utiles y mejora el color/contraste del raster exacto para lectura mas limpia en el mapa.
- Analisis intralote con dibujo de poligonos o seleccion de lotes demo.
- Modulo de planificacion territorial con calculo multivariable para VIS, escuelas, hospitales y equipamientos.
- Modulo territorial adicional de `Huella urbana / Transformacion del suelo rural` para comparar 2010, 2016, 2022 y una proyeccion 2030 sobre Mejia.
- Capas demo de mancha urbana y equipamientos para medir crecimiento, deficit de cobertura y aptitud territorial.
- Selector territorial de fuente satelital con `Sentinel-2`, `Landsat`, `Sentinel-1` y `VIIRS` segun el objetivo de planificacion.
- Matriz visible de variables territoriales por fuente satelital y ponderacion integrada al puntaje multicriterio.
- Visualizador 3D urbano en el modulo territorial con extrusiones de construcciones reales y soporte catastral desde los shapes cargados en el proyecto.
- Integracion local de fotos georreferenciadas para el visor 3D, con consulta por cercania desde una carpeta externa.
- Backend local opcional con proxy STAC, cache en memoria y endpoint de analisis.
- Estimaciones beta de relieve, clima agricola y asistente guiado por etapa.

## Archivos

- `index.html`: estructura del geoportal.
- `styles.css`: identidad visual y comportamiento responsive.
- `app.js`: logica del visor, capas, escenas, modulos y rutas de trabajo.
- `server.ps1`: backend local sin dependencias para proxy, cache y resumen analitico.
- `tools/connect_satloc_g4.ps1`: puente local para leer telemetria NMEA de una aeronave Satloc G4 por puerto serie y publicarla en el geoportal.
- `construcciones 31/`: shape de construcciones usado por el visor 3D.
- `CATASTRO 2026/`: shape catastral usado como referencia parcelaria en el visor 3D.

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
5. En `Planificacion territorial`, abre el `Visualizador 3D urbano` para cargar construcciones y catastro.
6. Si tienes fotos en una carpeta local externa, `server.ps1` puede indexarlas para mostrar fachadas cercanas dentro del panel 3D.

## Conexion Satloc G4

1. Conecta el Satloc G4 al computador por su salida serie o adaptador USB-serial.
2. Ejecuta `Abrir Puente Satloc G4.bat`.
3. El puente detecta el puerto COM, prueba baudios comunes y publica la telemetria al endpoint local `POST /api/agronomy/gps/ingest`.
4. En el geoportal abre `Agronomia > Seguimiento GPS y telemetria en tiempo real` para ver la aeronave en el mapa.

El puente esta pensado para salida NMEA 0183 con sentencias `GGA`, `RMC` o `VTG`.

## Sensores: fase actual

- `Sentinel-2` consulta escenas reales en el catalogo STAC oficial de Copernicus Data Space.
- `Landsat 8/9` y `Sentinel-1 GRD` consultan escenas reales desde Earth Search.
- La escena seleccionada muestra metadata real, huella real y una superficie operativa sobre el AOI o lote activo.
- El control temporal permite comparar dos fechas dentro del sensor activo.
- El backend local agrega proxy STAC, cache y un endpoint de resumen analitico para Sentinel-2.
- El visualizador 3D funciona directo con los shapes; si el backend local esta activo tambien usa `n_piso` del DBF para calcular alturas mas realistas.
- El backend local puede indexar fotos georreferenciadas desde `E:\FOTOS MACHACHI`; la primera pasada corre en segundo plano y puede tardar varios minutos si el lote es grande.
- Si el backend no esta activo, el visor sigue funcionando con calculo local y fallback demo para los tres sensores.
- El modulo de planificacion territorial ya no depende de la escena agronomica activa; usa perfiles satelitales propios para ponderar expansion urbana, resiliencia y cobertura de servicios.

## Notas

- La superficie de indices ya responde al AOI y a la escena activa, pero todavia es un procesamiento operativo calibrado, no raster pixel a pixel.
- El cambio temporal actual es un analisis operativo comparativo entre escenas; sirve para lectura y priorizacion, no como reemplazo de un raster multitemporal calibrado.
- Sentinel-2 es el flujo mas completo porque conserva `NDRE` y soporte de raster exacto.
- Landsat 8/9 no incluye `NDRE` porque no dispone de banda red-edge.
- Landsat 8/9 ahora ya no cae al rectangulo bruto del `bbox`; se presenta recortado a la huella real de la escena.
- Sentinel-1 usa metricas radar propias y no indices opticos.
- El modulo territorial es beta: sintetiza crecimiento urbano, accesibilidad, pendiente, riesgo hidrico, brecha de servicios y compatibilidad de ocupacion con datos demo calibrados para Mejia.
- El estudio de transformacion del suelo rural es una replica metodologica sintetica inspirada en referentes nacionales; no reemplaza una delimitacion oficial de huella urbana ni un catastro normativo.
- El visor 3D actual ya muestra construcciones y catastro; la vinculacion de fotos de fachadas por coordenadas queda lista para una siguiente iteracion.
- La galeria de fotos del visor 3D es local: las imagenes no se empujan al repo ni a GitHub Pages, se sirven unicamente desde tu maquina mediante `server.ps1`.
