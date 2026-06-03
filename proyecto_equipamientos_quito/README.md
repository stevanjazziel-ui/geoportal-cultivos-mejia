# Proyecto Equipamientos Quito

Pipeline SIG en Python para analizar equipamientos urbanos por administracion zonal del Distrito Metropolitano de Quito.

## Alcance

- Estructura reproducible de datos, configuracion y salidas.
- Pipeline por fases con `main.py`.
- Advertencias claras cuando faltan insumos, campos o dependencias.
- Degradacion controlada cuando no estan disponibles `geopandas`, `shapely`, `contextily` o `PyYAML`.

## Uso

```powershell
python .\proyecto_equipamientos_quito\main.py
```

Puedes correr fases puntuales:

```powershell
python .\proyecto_equipamientos_quito\main.py 01 02 06
```

## Dependencias

Este entorno ya tiene `pandas`, `matplotlib` y `openpyxl`.

Para habilitar recorte espacial, buffers, coberturas y mapas completos, instala de forma opcional:

- `PyYAML`
- `geopandas`
- `shapely`
- `contextily`
- `pyogrio` o `fiona`

Revisa `requirements-optional.txt`.

## Estructura

- `config/`: parametros normativos, simbologia y catalogo de zonas.
- `data/raw/`: insumos originales.
- `data/processed/`: diagnosticos, capas preparadas y resultados intermedios.
- `outputs/`: mapas, tablas y geopackages finales.
- `reports/`: memoria tecnica general y por zona.
- `scripts/`: fases del pipeline.
