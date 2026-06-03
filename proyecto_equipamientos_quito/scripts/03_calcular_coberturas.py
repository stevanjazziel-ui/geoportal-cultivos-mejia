from __future__ import annotations

from pathlib import Path

from common import (
    OUTPUT_ROOT,
    PROCESSED_ROOT,
    TARGET_EPSG,
    SPATIAL_SUFFIXES,
    add_artifact,
    add_warning,
    choose_first_input,
    detect_first_column,
    finalize_stage,
    load_project_config,
    load_vector_frame,
    new_stage_result,
    runtime_capabilities,
    standardize_vector_frame,
    write_csv_rows,
    write_vector_geojson,
)


def _load_units(stage_result):
    path = PROCESSED_ROOT / "indicadores_unidades.geojson"
    if not path.exists():
        add_warning(stage_result, "indicators_layer_missing", "No existe indicadores_unidades.geojson. Ejecuta la fase 02 primero.")
        return None
    return load_vector_frame(path)


def _load_support_layer(dataset_id: str, label: str, stage_result, target_epsg: int):
    prepared = PROCESSED_ROOT / f"{dataset_id}_prepared.geojson"
    source = prepared if prepared.exists() else choose_first_input(dataset_id, SPATIAL_SUFFIXES)
    if source is None:
        add_warning(stage_result, "support_layer_missing", f"No se encontro la capa de {label}.")
        return None
    try:
        gdf = load_vector_frame(source)
    except Exception as error:  # pragma: no cover - depende del entorno
        add_warning(stage_result, "support_layer_read_failed", f"No se pudo leer {label}: {error}", path=source)
        return None
    return standardize_vector_frame(gdf, stage_result, label, target_epsg=target_epsg)


def _apply_coverage_status(units_gdf, union_min, union_max, field_name: str):
    centroids = units_gdf.geometry.centroid
    units_gdf[field_name] = "deficit"
    if union_max is not None:
        units_gdf.loc[centroids.intersects(union_max), field_name] = "parcial"
    if union_min is not None:
        units_gdf.loc[centroids.intersects(union_min), field_name] = "adecuada"
    return units_gdf


def run():
    stage_result = new_stage_result("03", "Calculo de coberturas")
    config = load_project_config()
    runtime = runtime_capabilities()
    output_transport = OUTPUT_ROOT / "tablas_csv" / "cobertura_transporte_por_zona.csv"
    output_equip = OUTPUT_ROOT / "tablas_csv" / "cobertura_equipamientos_por_zona.csv"
    output_tipologias = OUTPUT_ROOT / "tablas_csv" / "cobertura_equipamientos_tipologia.csv"

    write_csv_rows(output_transport, ["zona_nombre", "poblacion_total", "adecuada_pct", "parcial_pct", "deficit_pct"], [])
    write_csv_rows(output_equip, ["zona_nombre", "poblacion_total", "adecuada_pct", "parcial_pct", "deficit_pct"], [])
    write_csv_rows(output_tipologias, ["tipologia", "escala", "poblacion_cubierta", "porcentaje_cobertura"], [])

    if not runtime["geopandas"] or not runtime["shapely"]:
        add_warning(stage_result, "geospatial_stack_unavailable", "No estan disponibles geopandas y shapely; no se pueden construir buffers de cobertura.")
        return finalize_stage(stage_result)

    units_gdf = _load_units(stage_result)
    if units_gdf is None:
        return finalize_stage(stage_result)

    target_epsg = config["proyecto"].get("epsg_metrico", TARGET_EPSG)
    transport_gdf = _load_support_layer("transporte", "transporte", stage_result, target_epsg)
    equip_gdf = _load_support_layer("equipamientos", "equipamientos", stage_result, target_epsg)
    if transport_gdf is None or equip_gdf is None:
        return finalize_stage(stage_result)

    population_field = detect_first_column(list(units_gdf.columns), ["poblacion_total"] + config["campos_candidatos"]["poblacion_total"])
    zone_field = detect_first_column(list(units_gdf.columns), ["zona_nombre"] + config["campos_candidatos"]["administracion_zonal"])
    if zone_field is None:
        units_gdf["zona_nombre"] = "Sin zona identificada"
        zone_field = "zona_nombre"
    if population_field is None:
        add_warning(stage_result, "population_field_missing", "No se encontro un campo de poblacion total en la capa de unidades.")
        return finalize_stage(stage_result)

    radio_barrial = config["radios_cobertura"]["barrial"]
    transport_min_union = transport_gdf.buffer(radio_barrial["minimo_m"]).unary_union if not transport_gdf.empty else None
    transport_max_union = transport_gdf.buffer(radio_barrial["maximo_m"]).unary_union if not transport_gdf.empty else None
    units_gdf = _apply_coverage_status(units_gdf, transport_min_union, transport_max_union, "cobertura_transporte")

    equip_min_union = equip_gdf.buffer(radio_barrial["minimo_m"]).unary_union if not equip_gdf.empty else None
    equip_max_union = equip_gdf.buffer(radio_barrial["maximo_m"]).unary_union if not equip_gdf.empty else None
    units_gdf = _apply_coverage_status(units_gdf, equip_min_union, equip_max_union, "cobertura_equipamientos")
    units_gdf["deficit_prioridad"] = units_gdf["cobertura_equipamientos"].map(
        lambda value: "deficit_prioritario" if value == "deficit" else ("cobertura_parcial" if value == "parcial" else "zona_servida")
    )

    transport_rows = []
    equip_rows = []
    for zone_name, group in units_gdf.groupby(zone_field, dropna=False):
        population_total = float(group[population_field].fillna(0).sum())
        transport_row = {"zona_nombre": zone_name, "poblacion_total": round(population_total, 2)}
        equip_row = {"zona_nombre": zone_name, "poblacion_total": round(population_total, 2)}
        for label in ("adecuada", "parcial", "deficit"):
            transport_population = float(group.loc[group["cobertura_transporte"] == label, population_field].fillna(0).sum())
            equip_population = float(group.loc[group["cobertura_equipamientos"] == label, population_field].fillna(0).sum())
            transport_row[f"{label}_pct"] = round((transport_population / population_total) * 100.0, 2) if population_total else ""
            equip_row[f"{label}_pct"] = round((equip_population / population_total) * 100.0, 2) if population_total else ""
        transport_rows.append(transport_row)
        equip_rows.append(equip_row)

    write_csv_rows(output_transport, ["zona_nombre", "poblacion_total", "adecuada_pct", "parcial_pct", "deficit_pct"], transport_rows)
    write_csv_rows(output_equip, ["zona_nombre", "poblacion_total", "adecuada_pct", "parcial_pct", "deficit_pct"], equip_rows)
    add_artifact(stage_result, "Cobertura de transporte por zona", output_transport, "csv")
    add_artifact(stage_result, "Cobertura de equipamientos por zona", output_equip, "csv")

    tipology_field = detect_first_column(list(equip_gdf.columns), ["tipologia"] + config["campos_candidatos"]["tipologia_equipamiento"])
    tipology_rows = []
    if tipology_field is None:
        add_warning(stage_result, "facility_type_field_missing", "No se encontro un campo de tipologia en la capa de equipamientos.")
    else:
        scales = ("barrial", "sectorial", "zonal")
        population_total = float(units_gdf[population_field].fillna(0).sum())
        centroids = units_gdf.geometry.centroid
        for scale_name in scales:
            buffer_distance = config["radios_cobertura"][scale_name]["maximo_m"]
            for typology, subset in equip_gdf.groupby(tipology_field, dropna=False):
                if subset.empty:
                    continue
                union_geom = subset.buffer(buffer_distance).unary_union
                covered_population = float(units_gdf.loc[centroids.intersects(union_geom), population_field].fillna(0).sum())
                tipology_rows.append(
                    {
                        "tipologia": typology,
                        "escala": scale_name,
                        "poblacion_cubierta": round(covered_population, 2),
                        "porcentaje_cobertura": round((covered_population / population_total) * 100.0, 2) if population_total else "",
                    }
                )
        write_csv_rows(output_tipologias, ["tipologia", "escala", "poblacion_cubierta", "porcentaje_cobertura"], tipology_rows)
        add_artifact(stage_result, "Cobertura por tipologia", output_tipologias, "csv")

    spatial_output = PROCESSED_ROOT / "coberturas_unidades.geojson"
    write_vector_geojson(units_gdf, spatial_output)
    add_artifact(stage_result, "Coberturas por unidad espacial", spatial_output, "geojson")

    stage_result["summary"] = {
        "units_analyzed": int(len(units_gdf)),
        "transport_rows": len(transport_rows),
        "facility_typology_rows": len(tipology_rows),
    }
    return finalize_stage(stage_result)


if __name__ == "__main__":
    run()
