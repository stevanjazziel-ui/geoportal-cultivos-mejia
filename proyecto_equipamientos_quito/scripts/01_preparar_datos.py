from __future__ import annotations

from pathlib import Path

from common import (
    PROCESSED_ROOT,
    RAW_DATASETS,
    SPATIAL_SUFFIXES,
    TARGET_EPSG,
    add_artifact,
    add_warning,
    canonical_zone_name,
    choose_first_input,
    detect_first_column,
    discover_raw_inputs,
    ensure_zone_directories,
    finalize_stage,
    load_project_config,
    load_vector_frame,
    new_stage_result,
    runtime_capabilities,
    standardize_vector_frame,
    write_csv_rows,
    write_json,
    write_vector_geojson,
)


def _spatial_specs():
    return [spec for spec in RAW_DATASETS if spec["kind"] in {"spatial", "mixed"}]


def run():
    stage_result = new_stage_result("01", "Preparacion de datos")
    config = load_project_config()
    zones = ensure_zone_directories()
    runtime = runtime_capabilities()
    inputs = discover_raw_inputs()

    manifest_path = PROCESSED_ROOT / "insumos_detectados.json"
    manifest_payload = {
        "generated_at": stage_result["generated_at"],
        "runtime": runtime,
        "epsg_metrico_objetivo": config["proyecto"].get("epsg_metrico", TARGET_EPSG),
        "insumos": inputs,
    }
    write_json(manifest_path, manifest_payload)
    add_artifact(stage_result, "Diagnostico de insumos", manifest_path, "json")

    write_csv_rows(
        PROCESSED_ROOT / "insumos_detectados.csv",
        ["dataset_id", "label", "status", "file_count", "spatial_count", "tabular_count", "folder"],
        inputs,
    )
    add_artifact(stage_result, "Matriz de insumos", PROCESSED_ROOT / "insumos_detectados.csv", "csv")

    missing_required = [row for row in inputs if row["status"] == "missing" and row["required"]]
    for row in missing_required:
        add_warning(
            stage_result,
            "missing_required_input",
            f"Falta el insumo obligatorio '{row['label']}' en {row['folder']}.",
        )

    if not runtime["geopandas"] or not runtime["shapely"]:
        add_warning(
            stage_result,
            "geospatial_stack_unavailable",
            "No estan disponibles geopandas y shapely; se genero el diagnostico base, pero no el recorte espacial.",
        )
        stage_result["summary"] = {
            "zones_expected": len(zones),
            "missing_required_inputs": len(missing_required),
            "prepared_layers": 0,
        }
        return finalize_stage(stage_result)

    prepared_layers = {}
    for spec in _spatial_specs():
        source = choose_first_input(spec["id"], SPATIAL_SUFFIXES)
        if source is None:
            continue
        try:
            gdf = load_vector_frame(source)
        except Exception as error:  # pragma: no cover - depende del entorno
            add_warning(
                stage_result,
                "vector_read_failed",
                f"No fue posible leer {spec['label']}: {error}",
                path=source,
            )
            continue

        gdf = standardize_vector_frame(
            gdf,
            stage_result,
            spec["label"],
            target_epsg=config["proyecto"].get("epsg_metrico", TARGET_EPSG),
        )
        if gdf is None:
            continue

        if spec["id"] == "administraciones_zonales":
            zone_column = detect_first_column(list(gdf.columns), config["campos_candidatos"]["administracion_zonal"])
            if zone_column is None:
                add_warning(
                    stage_result,
                    "zone_column_missing",
                    "No se encontro una columna reconocible para administracion zonal.",
                    path=source,
                )
            else:
                gdf = gdf.copy()
                gdf["zona_nombre"] = gdf[zone_column].map(canonical_zone_name)

        output_path = PROCESSED_ROOT / f"{spec['id']}_prepared.geojson"
        write_vector_geojson(gdf, output_path)
        add_artifact(stage_result, f"Capa preparada: {spec['label']}", output_path, "geojson")
        prepared_layers[spec["id"]] = gdf

    zones_gdf = prepared_layers.get("administraciones_zonales")
    if zones_gdf is not None and "zona_nombre" in zones_gdf.columns:
        import geopandas as gpd  # type: ignore

        for zone in zones:
            zone_slice = zones_gdf[zones_gdf["zona_nombre"] == zone["zona_nombre"]]
            if zone_slice.empty:
                add_warning(
                    stage_result,
                    "zone_not_found_in_layer",
                    f"La zona '{zone['zona_nombre']}' no aparece en la capa de administraciones.",
                )
                continue
            zone_geom = gpd.GeoDataFrame(zone_slice[["zona_nombre", "geometry"]], crs=zones_gdf.crs)
            for dataset_id, gdf in prepared_layers.items():
                if dataset_id == "administraciones_zonales":
                    continue
                try:
                    clipped = gpd.clip(gdf, zone_geom)
                except Exception as error:  # pragma: no cover - depende del entorno
                    add_warning(
                        stage_result,
                        "clip_failed",
                        f"No se pudo recortar {dataset_id} para {zone['zona_nombre']}: {error}",
                    )
                    continue
                if clipped.empty:
                    continue
                zone_output = PROCESSED_ROOT / "zonas" / zone["zona_slug"] / f"{dataset_id}.geojson"
                write_vector_geojson(clipped, zone_output)

    stage_result["summary"] = {
        "zones_expected": len(zones),
        "missing_required_inputs": len(missing_required),
        "prepared_layers": len(prepared_layers),
    }
    return finalize_stage(stage_result)


if __name__ == "__main__":
    run()
