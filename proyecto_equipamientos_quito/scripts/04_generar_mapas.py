from __future__ import annotations

from pathlib import Path

from common import (
    OUTPUT_ROOT,
    PROCESSED_ROOT,
    add_artifact,
    add_warning,
    detect_first_column,
    finalize_stage,
    load_project_config,
    load_symbology_config,
    load_vector_frame,
    load_zone_rows,
    new_stage_result,
    runtime_capabilities,
)


def _save_figure(fig, png_path: Path, pdf_path: Path):
    png_path.parent.mkdir(parents=True, exist_ok=True)
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(png_path, dpi=180, bbox_inches="tight")
    fig.savefig(pdf_path, dpi=180, bbox_inches="tight")


def _categorize_numeric(series, labels):
    import pandas as pd  # type: ignore

    clean = series.dropna()
    if clean.empty:
        return None
    class_count = min(len(labels), max(1, clean.nunique()))
    if class_count == 1:
        return pd.Series([labels[0] if value == value else None for value in series], index=series.index)
    ranked = clean.rank(method="first")
    categorized = pd.qcut(ranked, q=class_count, labels=labels[:class_count])
    output = pd.Series(index=series.index, dtype="object")
    output.loc[clean.index] = categorized.astype(str)
    return output


def _plot_location_map(plt, zones_gdf, zone_name, zone_slug, note, stage_result):
    zone_slice = zones_gdf[zones_gdf["zona_nombre"] == zone_name]
    if zone_slice.empty:
        add_warning(stage_result, "location_zone_missing", f"No se encontro la zona {zone_name} para el mapa de ubicacion.")
        return
    fig, ax = plt.subplots(figsize=(8, 8))
    zones_gdf.boundary.plot(ax=ax, color="#9aa5b1", linewidth=0.8)
    zone_slice.plot(ax=ax, color="#b79a6b", edgecolor="#5d3b23", linewidth=1.4)
    ax.set_title(f"Ubicacion de {zone_name} en el DMQ")
    ax.text(0.01, 0.02, note, transform=ax.transAxes, fontsize=8, va="bottom")
    ax.set_axis_off()
    _save_figure(
        fig,
        OUTPUT_ROOT / "mapas_png" / f"{zone_slug}__ubicacion.png",
        OUTPUT_ROOT / "mapas_pdf" / f"{zone_slug}__ubicacion.pdf",
    )
    plt.close(fig)


def _plot_indicator_map(plt, data_gdf, zone_name, zone_slug, field_name, title, colors, note, stage_result):
    zone_field = detect_first_column(list(data_gdf.columns), ["zona_nombre", "administracion_zonal", "zona"])
    zone_slice = data_gdf[data_gdf[zone_field] == zone_name] if zone_field else data_gdf
    if zone_slice.empty or field_name not in zone_slice.columns:
        add_warning(stage_result, "indicator_map_skipped", f"No hay datos suficientes para {title} en {zone_name}.")
        return
    categorized = _categorize_numeric(zone_slice[field_name], list(colors.keys()))
    if categorized is None:
        add_warning(stage_result, "indicator_map_empty", f"El campo {field_name} no tiene valores para {zone_name}.")
        return
    plot_data = zone_slice.copy()
    plot_data["clase_mapa"] = categorized
    fig, ax = plt.subplots(figsize=(9, 8))
    for category, color in colors.items():
        subset = plot_data[plot_data["clase_mapa"] == category]
        if subset.empty:
            continue
        subset.plot(ax=ax, color=color, edgecolor="#6c757d", linewidth=0.3, label=category)
    ax.legend(loc="lower left")
    ax.set_title(title)
    ax.text(0.01, 0.02, note, transform=ax.transAxes, fontsize=8, va="bottom")
    ax.set_axis_off()
    stem = field_name.replace("pct_", "edad_")
    _save_figure(
        fig,
        OUTPUT_ROOT / "mapas_png" / f"{zone_slug}__{stem}.png",
        OUTPUT_ROOT / "mapas_pdf" / f"{zone_slug}__{stem}.pdf",
    )
    plt.close(fig)


def _plot_category_map(plt, data_gdf, zone_name, zone_slug, field_name, title, colors, note, stage_result):
    zone_field = detect_first_column(list(data_gdf.columns), ["zona_nombre", "administracion_zonal", "zona"])
    zone_slice = data_gdf[data_gdf[zone_field] == zone_name] if zone_field else data_gdf
    if zone_slice.empty or field_name not in zone_slice.columns:
        add_warning(stage_result, "category_map_skipped", f"No hay datos suficientes para {title} en {zone_name}.")
        return
    fig, ax = plt.subplots(figsize=(9, 8))
    for category, color in colors.items():
        subset = zone_slice[zone_slice[field_name] == category]
        if subset.empty:
            continue
        subset.plot(ax=ax, color=color, edgecolor="#4f4f4f", linewidth=0.3, label=category)
    ax.legend(loc="lower left")
    ax.set_title(title)
    ax.text(0.01, 0.02, note, transform=ax.transAxes, fontsize=8, va="bottom")
    ax.set_axis_off()
    _save_figure(
        fig,
        OUTPUT_ROOT / "mapas_png" / f"{zone_slug}__{field_name}.png",
        OUTPUT_ROOT / "mapas_pdf" / f"{zone_slug}__{field_name}.pdf",
    )
    plt.close(fig)


def _plot_overlay_map(plt, zones_gdf, overlay_gdf, zone_name, zone_slug, title, note, suffix, stage_result):
    zone_slice = zones_gdf[zones_gdf["zona_nombre"] == zone_name]
    zone_geom = zone_slice.iloc[0].geometry if not zone_slice.empty else None
    if zone_geom is None:
        add_warning(stage_result, "overlay_zone_missing", f"No se encontro la geometria de {zone_name}.")
        return
    try:
        overlay_slice = overlay_gdf[overlay_gdf.intersects(zone_geom)]
    except Exception:
        overlay_slice = overlay_gdf.copy()
    fig, ax = plt.subplots(figsize=(9, 8))
    zone_slice.boundary.plot(ax=ax, color="#5d3b23", linewidth=1.4)
    if not overlay_slice.empty:
        overlay_slice.plot(ax=ax, color="#005f73", linewidth=1.0, markersize=10)
    ax.set_title(title)
    ax.text(0.01, 0.02, note, transform=ax.transAxes, fontsize=8, va="bottom")
    ax.set_axis_off()
    _save_figure(
        fig,
        OUTPUT_ROOT / "mapas_png" / f"{zone_slug}__{suffix}.png",
        OUTPUT_ROOT / "mapas_pdf" / f"{zone_slug}__{suffix}.pdf",
    )
    plt.close(fig)


def run():
    stage_result = new_stage_result("04", "Generacion de mapas")
    runtime = runtime_capabilities()
    config = load_project_config()
    symbology = load_symbology_config()

    if not runtime["geopandas"] or not runtime["matplotlib"]:
        add_warning(
            stage_result,
            "map_stack_unavailable",
            "Falta geopandas y/o matplotlib; no se pueden generar mapas en esta corrida.",
        )
        return finalize_stage(stage_result)

    zones_path = PROCESSED_ROOT / "administraciones_zonales_prepared.geojson"
    if not zones_path.exists():
        add_warning(stage_result, "zones_layer_missing", "No existe la capa preparada de administraciones zonales.")
        return finalize_stage(stage_result)

    indicator_path = PROCESSED_ROOT / "indicadores_unidades.geojson"
    coverage_path = PROCESSED_ROOT / "coberturas_unidades.geojson"
    transport_path = PROCESSED_ROOT / "transporte_prepared.geojson"
    equip_path = PROCESSED_ROOT / "equipamientos_prepared.geojson"

    zones_gdf = load_vector_frame(zones_path)
    indicator_gdf = load_vector_frame(indicator_path) if indicator_path.exists() else None
    coverage_gdf = load_vector_frame(coverage_path) if coverage_path.exists() else None
    transport_gdf = load_vector_frame(transport_path) if transport_path.exists() else None
    equip_gdf = load_vector_frame(equip_path) if equip_path.exists() else None

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt  # type: ignore

    note = symbology.get("nota_mapa", "Producto referencial.")
    color_classes = symbology["colores_clases"]
    coverage_colors = symbology["cobertura"]
    zones_rendered = 0

    for zone in load_zone_rows():
        zone_name = zone["zona_nombre"]
        zone_slug = zone["zona_slug"]
        _plot_location_map(plt, zones_gdf, zone_name, zone_slug, note, stage_result)
        if indicator_gdf is not None:
            for field_name, title in (
                ("densidad_poblacional", f"Poblacion en {zone_name}"),
                ("densidad_vivienda", f"Vivienda en {zone_name}"),
            ):
                _plot_indicator_map(plt, indicator_gdf, zone_name, zone_slug, field_name, title, color_classes, note, stage_result)
            age_field = next((field for field in indicator_gdf.columns if str(field).startswith("pct_")), None)
            if age_field:
                _plot_indicator_map(
                    plt,
                    indicator_gdf,
                    zone_name,
                    zone_slug,
                    age_field,
                    f"Composicion etaria en {zone_name}",
                    color_classes,
                    note,
                    stage_result,
                )
        if transport_gdf is not None:
            _plot_overlay_map(plt, zones_gdf, transport_gdf, zone_name, zone_slug, f"Transporte en {zone_name}", note, "transporte", stage_result)
        if equip_gdf is not None:
            _plot_overlay_map(plt, zones_gdf, equip_gdf, zone_name, zone_slug, f"Equipamientos en {zone_name}", note, "equipamientos", stage_result)
        if coverage_gdf is not None:
            _plot_category_map(
                plt,
                coverage_gdf,
                zone_name,
                zone_slug,
                "cobertura_equipamientos",
                f"Cobertura de equipamientos en {zone_name}",
                coverage_colors,
                note,
                stage_result,
            )
            _plot_category_map(
                plt,
                coverage_gdf,
                zone_name,
                zone_slug,
                "deficit_prioridad",
                f"Deficit y superavit en {zone_name}",
                {
                    "zona_servida": "#2a9d8f",
                    "cobertura_parcial": "#e9c46a",
                    "deficit_prioritario": "#e76f51",
                },
                note,
                stage_result,
            )
        zones_rendered += 1

    add_artifact(stage_result, "Carpeta de mapas PNG", OUTPUT_ROOT / "mapas_png", "directory")
    add_artifact(stage_result, "Carpeta de mapas PDF", OUTPUT_ROOT / "mapas_pdf", "directory")
    stage_result["summary"] = {"zones_rendered": zones_rendered}
    return finalize_stage(stage_result)


if __name__ == "__main__":
    run()
