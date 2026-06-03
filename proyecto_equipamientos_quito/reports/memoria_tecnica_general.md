# Memoria tecnica general

## 1. Introduccion
Este documento resume la estructura reproducible del proyecto SIG para analizar equipamientos urbanos por Administracion Zonal en Distrito Metropolitano de Quito.

## 2. Objetivo general
Generar indicadores, coberturas, mapas, tablas y memoria tecnica para las administraciones zonales del DMQ.

## 3. Objetivos especificos
- Preparar insumos oficiales y verificar su consistencia.
- Calcular indicadores territoriales de poblacion, vivienda y edad.
- Medir cobertura de transporte y equipamientos.
- Identificar zonas servidas, parciales y deficitarias.
- Generar productos cartograficos y reportes tecnicos.

## 4. Base normativa
- Reglas Tecnicas de Arquitectura y Urbanismo del DMQ
- Plan de Uso y Gestion del Suelo del DMQ

## 5. Area de estudio
El area de estudio corresponde al Distrito Metropolitano de Quito, con enfasis en 10 administraciones zonales definidas en configuracion.

## 6. Insumos utilizados
- Geoportal Metropolitano de Quito
- SHOT / Visor PUGS
- INEC / Censo Ecuador

## 7. Procesamiento cartografico
El pipeline contempla verificacion de insumos, reproyeccion a EPSG 32717, limpieza geometrica, recorte por zona y estructuracion de salidas intermedias.

## 8. Variables analizadas
Poblacion, vivienda, grupos etarios, transporte, equipamientos, areas verdes, hidrografia y uso de suelo.

## 9. Indicadores calculados
- Zonas resumidas con indicadores: 0
- Filas de cobertura de transporte: 0
- Filas de cobertura de equipamientos: 0

## 10. Criterios de cobertura
- Barrial: 400 a 800 m
- Sectorial: 1000 a 1500 m
- Zonal: 2000 a 3000 m

## 11. Analisis por Administracion Zonal
Los productos por zona se almacenan en `reports/memoria_tecnica_por_zona/` y en `outputs/mapas_*` cuando hay insumos y dependencias suficientes.

## 12. Identificacion de deficit y superavit
La clasificacion usa tres estados: adecuada, parcial y deficit. En la implementacion actual, la lectura de cobertura se calcula con centroides de unidades espaciales cuando el stack geoespacial esta disponible.

## 13. Limitaciones
- [01] Falta el insumo obligatorio 'Limite DMQ' en data\raw\limite_dmq.
- [01] Falta el insumo obligatorio 'Administraciones zonales' en data\raw\administraciones_zonales.
- [01] Falta el insumo obligatorio 'Parroquias' en data\raw\parroquias.
- [01] Falta el insumo obligatorio 'Barrios o manzanas' en data\raw\barrios_manzanas.
- [01] Falta el insumo obligatorio 'Poblacion' en data\raw\poblacion.
- [01] Falta el insumo obligatorio 'Vivienda' en data\raw\vivienda.
- [01] Falta el insumo obligatorio 'Edades' en data\raw\edades.
- [01] Falta el insumo obligatorio 'Red vial' en data\raw\red_vial.
- [01] Falta el insumo obligatorio 'Transporte' en data\raw\transporte.
- [01] Falta el insumo obligatorio 'Equipamientos' en data\raw\equipamientos.
- [01] Falta el insumo obligatorio 'Areas verdes' en data\raw\areas_verdes.
- [01] Falta el insumo obligatorio 'Hidrografia' en data\raw\hidrografia.
- [01] Falta el insumo obligatorio 'PUGS uso de suelo' en data\raw\pugs_uso_suelo.
- [01] No estan disponibles geopandas y shapely; se genero el diagnostico base, pero no el recorte espacial.
- [02] Geopandas no esta disponible; no se puede calcular area ni generar capa de indicadores.
- [03] No estan disponibles geopandas y shapely; no se pueden construir buffers de cobertura.
- [04] Falta geopandas y/o matplotlib; no se pueden generar mapas en esta corrida.
- [05] No existen mapas PNG fuente para componer laminas.

## 14. Conclusiones
El modulo queda estructurado para correr de forma reproducible y emitir advertencias claras cuando faltan capas, campos o librerias geoespaciales.

## 15. Fuentes
- Geoportal Metropolitano de Quito
- SHOT / Visor PUGS
- INEC / Censo Ecuador
- Reglas Tecnicas de Arquitectura y Urbanismo del DMQ
- Plan de Uso y Gestion del Suelo del DMQ
