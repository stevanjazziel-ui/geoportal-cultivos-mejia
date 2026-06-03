from __future__ import annotations

from pathlib import Path

from common import (
    OUTPUT_ROOT,
    PROCESSED_ROOT,
    SPATIAL_SUFFIXES,
    TABULAR_SUFFIXES,
    add_artifact,
    add_warning,
    choose_first_input,
    detect_first_column,
    finalize_stage,
    load_project_config,
    load_vector_frame,
    new_stage_result,
    normalize_text,
    read_table,
    runtime_capabilities,
    write_csv_rows,
    write_vector_geojson,
)


def _prepared_vector_path(dataset_id: str) -> Path:
    return PROCESSED_ROOT / f"{dataset_id}_prepared.geojson"


def _load_base_units(stage_result, config):
    for dataset_id in ("barrios_manzanas", "parroquias", "administraciones_zonales"):
        prepared = _prepared_vector_path(dataset_id)
        if not prepared.exists():
            continue
        gdf = load_vector_frame(prepared)
        return dataset_id, gdf
    add_warning(
        stage_result,
        "base_units_missing",
        "No hay capa espacial preparada para calcular indicadores. Ejecuta la fase 01 con dependencias geoespaciales.",
    )
    return None, None


def _normalize_key_series(series):
    return series.fillna("").map(lambda value: normalize_text(value).upper().strip())


def _join_table(base_gdf, table_df, table_label, config, stage_result):
    base_columns = list(base_gdf.columns)
    table_columns = list(table_df.columns)
    code_candidates = config["campos_candidatos"]["codigo_territorial"]
    zone_candidates = config["campos_candidatos"]["administracion_zonal"]

    base_key = detect_first_column(base_columns, code_candidates)
    table_key = detect_first_column(table_columns, code_candidates)
    join_mode = "codigo"

    if base_key is None or table_key is None:
        base_key = detect_first_column(base_columns, zone_candidates + ["zona_nombre", "parroquia", "nombre"])
        table_key = detect_first_column(table_columns, zone_candidates + ["zona_nombre", "parroquia", "nombre"])
        join_mode = "nombre"

    if base_key is None or table_key is None:
        add_warning(
            stage_result,
            "join_key_missing",
            f"No se encontro una clave comun para integrar la tabla {table_label}.",
        )
        return base_gdf

    payload = table_df.copy()
    payload["_join_key"] = _normalize_key_series(payload[table_key].astype(str))
    merged = base_gdf.copy()
    merged["_join_key"] = _normalize_key_series(merged[base_key].astype(str))
    keep_columns = [column for column in payload.columns if column != table_key]
    merged = merged.merge(payload[keep_columns], on="_join_key", how="left", suffixes=("", "_dup"))
    add_warning(
        stage_result,
        "table_join_applied",
        f"Se integro {table_label} usando clave por {join_mode}.",
    )
    return merged


def _coerce_numeric_columns(gdf, config):
    import pandas as pd  # type: ignore

    numeric_map = {
        "poblacion_total": config["campos_candidatos"]["poblacion_total"],
        "viviendas": config["campos_candidatos"]["viviendas"],
        "edad_0_4": config["campos_candidatos"]["grupo_edad_0_4"],
        "edad_5_11": config["campos_candidatos"]["grupo_edad_5_11"],
        "edad_12_17": config["campos_candidatos"]["grupo_edad_12_17"],
        "edad_18_29": config["campos_candidatos"]["grupo_edad_18_29"],
        "edad_30_44": config["campos_candidatos"]["grupo_edad_30_44"],
        "edad_45_64": config["campos_candidatos"]["grupo_edad_45_64"],
        "edad_65_mas": config["campos_candidatos"]["grupo_edad_65_mas"],
    }
    for target_field, candidates in numeric_map.items():
        source_column = detect_first_column(list(gdf.columns), [target_field] + candidates)
        if source_column is not None:
            gdf[target_field] = pd.to_numeric(gdf[source_column], errors="coerce")
    return gdf


def run():
    stage_result = new_stage_result("02", "Calculo de indicadores")
    config = load_project_config()
    runtime = runtime_capabilities()

    empty_outputs = {
        "indicators": OUTPUT_ROOT / "tablas_csv" / "indicadores_zonales.csv",
        "tables": OUTPUT_ROOT / "tablas_csv" / "tablas_detectadas.csv",
    }
    write_csv_rows(empty_outputs["indicators"], ["zona_nombre", "area_ha", "poblacion_total", "densidad_poblacional", "viviendas", "densidad_vivienda"], [])
    write_csv_rows(empty_outputs["tables"], ["dataset_id", "path", "columnas"], [])

    if not runtime["pandas"]:
        add_warning(stage_result, "pandas_missing", "Pandas no esta disponible; no se pueden leer tablas alfanumericas.")
        return finalize_stage(stage_result)
    if not runtime["geopandas"]:
        add_warning(stage_result, "geopandas_missing", "Geopandas no esta disponible; no se puede calcular area ni generar capa de indicadores.")
        return finalize_stage(stage_result)

    base_id, base_gdf = _load_base_units(stage_result, config)
    if base_gdf is None:
        return finalize_stage(stage_result)

    detected_tables = []
    for dataset_id in ("poblacion", "vivienda", "edades"):
        source = choose_first_input(dataset_id, TABULAR_SUFFIXES)
        if source is None:
            add_warning(stage_result, "table_missing", f"No se encontro la tabla requerida para {dataset_id}.")
            continue
        try:
            table = read_table(source)
        except Exception as error:  # pragma: no cover - depende del entorno
            add_warning(stage_result, "table_read_failed", f"No se pudo leer {source.name}: {error}", path=source)
            continue
        detected_tables.append({"dataset_id": dataset_id, "path": str(source), "columnas": ", ".join(map(str, table.columns))})
        base_gdf = _join_table(base_gdf, table, dataset_id, config, stage_result)

    write_csv_rows(
        empty_outputs["tables"],
        ["dataset_id", "path", "columnas"],
        detected_tables,
    )
    add_artifact(stage_result, "Tablas detectadas", empty_outputs["tables"], "csv")

    import pandas as pd  # type: ignore

    base_gdf = _coerce_numeric_columns(base_gdf, config)
    base_gdf["area_ha"] = base_gdf.geometry.area / 10000.0
    if "poblacion_total" in base_gdf.columns:
        base_gdf["densidad_poblacional"] = base_gdf["poblacion_total"] / base_gdf["area_ha"].replace(0, pd.NA)
    else:
        add_warning(stage_result, "population_field_missing", "No se encontro un campo de poblacion total para calcular densidad.")
    if "viviendas" in base_gdf.columns:
        base_gdf["densidad_vivienda"] = base_gdf["viviendas"] / base_gdf["area_ha"].replace(0, pd.NA)
    else:
        add_warning(stage_result, "housing_field_missing", "No se encontro un campo de viviendas para calcular densidad.")

    age_fields = (
        "edad_0_4",
        "edad_5_11",
        "edad_12_17",
        "edad_18_29",
        "edad_30_44",
        "edad_45_64",
        "edad_65_mas",
    )
    if "poblacion_total" in base_gdf.columns:
        for field in age_fields:
            if field in base_gdf.columns:
                suffix = field.replace("edad_", "")
                base_gdf[f"pct_{suffix}"] = (base_gdf[field] / base_gdf["poblacion_total"].replace(0, pd.NA)) * 100.0

    zone_column = detect_first_column(list(base_gdf.columns), ["zona_nombre"] + config["campos_candidatos"]["administracion_zonal"])
    if zone_column is None:
        base_gdf["zona_nombre"] = "Sin zona identificada"
        zone_column = "zona_nombre"

    summary_rows = []
    for zone_name, group in base_gdf.groupby(zone_column, dropna=False):
        area_ha = float(group["area_ha"].fillna(0).sum())
        population_total = float(group["poblacion_total"].fillna(0).sum()) if "poblacion_total" in group else 0.0
        viviendas = float(group["viviendas"].fillna(0).sum()) if "viviendas" in group else 0.0
        densidad_p = population_total / area_ha if area_ha else None
        densidad_v = viviendas / area_ha if area_ha else None
        row = {
            "zona_nombre": zone_name,
            "area_ha": round(area_ha, 2),
            "poblacion_total": round(population_total, 2),
            "densidad_poblacional": round(densidad_p, 4) if densidad_p is not None else "",
            "viviendas": round(viviendas, 2),
            "densidad_vivienda": round(densidad_v, 4) if densidad_v is not None else "",
        }
        for field in age_fields:
            pct_field = f"pct_{field.replace('edad_', '')}"
            if pct_field in group:
                value = float(group[pct_field].fillna(0).mean())
                row[pct_field] = round(value, 2)
        summary_rows.append(row)

    indicator_fields = sorted({key for row in summary_rows for key in row.keys()})
    write_csv_rows(empty_outputs["indicators"], indicator_fields, summary_rows)
    add_artifact(stage_result, "Indicadores por zona", empty_outputs["indicators"], "csv")

    spatial_output = PROCESSED_ROOT / "indicadores_unidades.geojson"
    write_vector_geojson(base_gdf, spatial_output)
    add_artifact(stage_result, "Indicadores por unidad espacial", spatial_output, "geojson")

    stage_result["summary"] = {
        "base_units_dataset": base_id,
        "rows_with_geometry": int(len(base_gdf)),
        "zones_summarized": len(summary_rows),
    }
    return finalize_stage(stage_result)


if __name__ == "__main__":
    run()
