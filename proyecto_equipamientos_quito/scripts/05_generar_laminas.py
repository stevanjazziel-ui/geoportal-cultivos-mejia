from __future__ import annotations

from collections import defaultdict

from common import OUTPUT_ROOT, add_artifact, add_warning, finalize_stage, load_zone_rows, new_stage_result, runtime_capabilities


def run():
    stage_result = new_stage_result("05", "Generacion de laminas")
    runtime = runtime_capabilities()
    if not runtime["matplotlib"]:
        add_warning(stage_result, "matplotlib_missing", "Matplotlib no esta disponible; no se pueden componer laminas.")
        return finalize_stage(stage_result)

    maps_root = OUTPUT_ROOT / "mapas_png"
    grouped = defaultdict(list)
    for path in sorted(maps_root.glob("*.png")):
        if "__lamina_final" in path.name:
            continue
        zone_slug = path.name.split("__", 1)[0]
        grouped[zone_slug].append(path)

    if not grouped:
        add_warning(stage_result, "maps_missing", "No existen mapas PNG fuente para componer laminas.")
        return finalize_stage(stage_result)

    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt  # type: ignore

    lamina_count = 0
    for zone in load_zone_rows():
        zone_slug = zone["zona_slug"]
        images = grouped.get(zone_slug, [])
        if not images:
            continue
        fig, axes = plt.subplots(3, 3, figsize=(18, 14))
        axes_flat = axes.flatten()
        for axis in axes_flat:
            axis.set_axis_off()
        for axis, image_path in zip(axes_flat, images[:9]):
            image = plt.imread(image_path)
            axis.imshow(image)
            axis.set_title(image_path.stem.split("__", 1)[1].replace("_", " ").title(), fontsize=10)
        fig.suptitle(f"Lamina final | {zone['zona_nombre']}", fontsize=18)
        fig.text(0.02, 0.02, "Panel tecnico referencial generado automaticamente por el pipeline SIG.", fontsize=9)
        png_path = OUTPUT_ROOT / "mapas_png" / f"{zone_slug}__lamina_final.png"
        pdf_path = OUTPUT_ROOT / "mapas_pdf" / f"{zone_slug}__lamina_final.pdf"
        fig.savefig(png_path, dpi=180, bbox_inches="tight")
        fig.savefig(pdf_path, dpi=180, bbox_inches="tight")
        plt.close(fig)
        lamina_count += 1

    if lamina_count:
        add_artifact(stage_result, "Laminas finales PNG", OUTPUT_ROOT / "mapas_png", "directory")
        add_artifact(stage_result, "Laminas finales PDF", OUTPUT_ROOT / "mapas_pdf", "directory")
    stage_result["summary"] = {"laminas_generadas": lamina_count}
    return finalize_stage(stage_result)


if __name__ == "__main__":
    run()
