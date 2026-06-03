from __future__ import annotations

import csv

from common import (
    OUTPUT_ROOT,
    PROCESSED_ROOT,
    REPORTS_ROOT,
    add_artifact,
    finalize_stage,
    load_project_config,
    load_stage_results,
    load_zone_rows,
    new_stage_result,
    write_text,
)


def _read_csv_rows(path):
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def _warning_lines(stage_results):
    lines = []
    for stage in stage_results:
        for warning in stage.get("warnings", []):
            lines.append(f"- [{stage.get('stage_id', '')}] {warning.get('message', '')}")
    if not lines:
        lines.append("- No se registraron advertencias en la ultima corrida.")
    return "\n".join(lines)


def _general_report(config, stage_results, zone_rows, indicators_rows, transport_rows, equip_rows):
    territory = config["proyecto"]["territorio"]
    indicator_zone_count = len(indicators_rows)
    return f"""# Memoria tecnica general

## 1. Introduccion
Este documento resume la estructura reproducible del proyecto SIG para analizar equipamientos urbanos por Administracion Zonal en {territory}.

## 2. Objetivo general
Generar indicadores, coberturas, mapas, tablas y memoria tecnica para las administraciones zonales del DMQ.

## 3. Objetivos especificos
- Preparar insumos oficiales y verificar su consistencia.
- Calcular indicadores territoriales de poblacion, vivienda y edad.
- Medir cobertura de transporte y equipamientos.
- Identificar zonas servidas, parciales y deficitarias.
- Generar productos cartograficos y reportes tecnicos.

## 4. Base normativa
{chr(10).join(f"- {item}" for item in config['fuentes']['normativa'])}

## 5. Area de estudio
El area de estudio corresponde al Distrito Metropolitano de Quito, con enfasis en {len(zone_rows)} administraciones zonales definidas en configuracion.

## 6. Insumos utilizados
{chr(10).join(f"- {item}" for item in config['fuentes']['cartografia'])}

## 7. Procesamiento cartografico
El pipeline contempla verificacion de insumos, reproyeccion a EPSG {config['proyecto']['epsg_metrico']}, limpieza geometrica, recorte por zona y estructuracion de salidas intermedias.

## 8. Variables analizadas
Poblacion, vivienda, grupos etarios, transporte, equipamientos, areas verdes, hidrografia y uso de suelo.

## 9. Indicadores calculados
- Zonas resumidas con indicadores: {indicator_zone_count}
- Filas de cobertura de transporte: {len(transport_rows)}
- Filas de cobertura de equipamientos: {len(equip_rows)}

## 10. Criterios de cobertura
- Barrial: {config['radios_cobertura']['barrial']['minimo_m']} a {config['radios_cobertura']['barrial']['maximo_m']} m
- Sectorial: {config['radios_cobertura']['sectorial']['minimo_m']} a {config['radios_cobertura']['sectorial']['maximo_m']} m
- Zonal: {config['radios_cobertura']['zonal']['minimo_m']} a {config['radios_cobertura']['zonal']['maximo_m']} m

## 11. Analisis por Administracion Zonal
Los productos por zona se almacenan en `reports/memoria_tecnica_por_zona/` y en `outputs/mapas_*` cuando hay insumos y dependencias suficientes.

## 12. Identificacion de deficit y superavit
La clasificacion usa tres estados: adecuada, parcial y deficit. En la implementacion actual, la lectura de cobertura se calcula con centroides de unidades espaciales cuando el stack geoespacial esta disponible.

## 13. Limitaciones
{_warning_lines(stage_results)}

## 14. Conclusiones
El modulo queda estructurado para correr de forma reproducible y emitir advertencias claras cuando faltan capas, campos o librerias geoespaciales.

## 15. Fuentes
{chr(10).join(f"- {item}" for item in config['fuentes']['cartografia'] + config['fuentes']['normativa'])}
"""


def _zone_report(zone_row, indicators_rows, transport_rows, equip_rows):
    zone_name = zone_row["zona_nombre"]
    indicator = next((row for row in indicators_rows if row.get("zona_nombre") == zone_name), {})
    transport = next((row for row in transport_rows if row.get("zona_nombre") == zone_name), {})
    equip = next((row for row in equip_rows if row.get("zona_nombre") == zone_name), {})
    return f"""# Memoria tecnica | {zone_name}

## 1. Introduccion
Ficha tecnica automatizada para la administracion zonal {zone_name}.

## 2. Objetivo general
Sintetizar el diagnostico territorial y la cobertura de equipamientos de la zona.

## 3. Objetivos especificos
- Consolidar los indicadores disponibles.
- Revisar cobertura local de transporte.
- Revisar cobertura local de equipamientos.

## 4. Base normativa
Se aplican los parametros configurados en `config/parametros_normativos.yaml`.

## 5. Area de estudio
Administracion Zonal {zone_name}.

## 6. Insumos utilizados
Los insumos dependen de los archivos cargados en `data/raw/`.

## 7. Procesamiento cartografico
La zona se analiza con la misma cadena metodologica definida para el proyecto general.

## 8. Variables analizadas
Poblacion, vivienda, grupos etarios, transporte y equipamientos.

## 9. Indicadores calculados
- Area ha: {indicator.get('area_ha', 'sin dato')}
- Poblacion total: {indicator.get('poblacion_total', 'sin dato')}
- Densidad poblacional: {indicator.get('densidad_poblacional', 'sin dato')}
- Viviendas: {indicator.get('viviendas', 'sin dato')}
- Densidad de vivienda: {indicator.get('densidad_vivienda', 'sin dato')}

## 10. Criterios de cobertura
- Transporte adecuada %: {transport.get('adecuada_pct', 'sin dato')}
- Transporte parcial %: {transport.get('parcial_pct', 'sin dato')}
- Transporte deficit %: {transport.get('deficit_pct', 'sin dato')}
- Equipamientos adecuada %: {equip.get('adecuada_pct', 'sin dato')}
- Equipamientos parcial %: {equip.get('parcial_pct', 'sin dato')}
- Equipamientos deficit %: {equip.get('deficit_pct', 'sin dato')}

## 11. Analisis por Administracion Zonal
Esta ficha debe completarse con lectura urbana y cartografica cuando existan insumos oficiales completos.

## 12. Identificacion de deficit y superavit
Usa la clasificacion adecuada, parcial y deficit cuando la fase de coberturas ha podido ejecutarse.

## 13. Limitaciones
Si faltan capas o librerias geoespaciales, la salida queda como estructura referencial.

## 14. Conclusiones
La zona queda preparada para continuar con una corrida completa cuando se incorporen los datos faltantes.

## 15. Fuentes
- Geoportal Metropolitano de Quito
- SHOT / Visor PUGS
- INEC / Censo Ecuador
"""


def run():
    stage_result = new_stage_result("06", "Generacion de memoria tecnica")
    config = load_project_config()
    stage_results = load_stage_results()
    zone_rows = load_zone_rows()
    indicators_rows = _read_csv_rows(OUTPUT_ROOT / "tablas_csv" / "indicadores_zonales.csv")
    transport_rows = _read_csv_rows(OUTPUT_ROOT / "tablas_csv" / "cobertura_transporte_por_zona.csv")
    equip_rows = _read_csv_rows(OUTPUT_ROOT / "tablas_csv" / "cobertura_equipamientos_por_zona.csv")

    general_report = _general_report(config, stage_results, zone_rows, indicators_rows, transport_rows, equip_rows)
    general_path = REPORTS_ROOT / "memoria_tecnica_general.md"
    write_text(general_path, general_report)
    add_artifact(stage_result, "Memoria tecnica general", general_path, "markdown")

    for zone in zone_rows:
        zone_path = REPORTS_ROOT / "memoria_tecnica_por_zona" / f"{zone['zona_slug']}.md"
        write_text(zone_path, _zone_report(zone, indicators_rows, transport_rows, equip_rows))

    stage_result["summary"] = {
        "reports_generated": len(zone_rows) + 1,
        "warnings_reported": sum(len(stage.get("warnings", [])) for stage in stage_results),
    }
    return finalize_stage(stage_result)


if __name__ == "__main__":
    run()
