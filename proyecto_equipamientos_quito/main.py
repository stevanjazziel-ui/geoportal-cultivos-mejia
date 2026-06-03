from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent
SCRIPTS_ROOT = PROJECT_ROOT / "scripts"
if str(SCRIPTS_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_ROOT))

from common import OUTPUT_ROOT, PROCESSED_ROOT, load_project_config, write_csv_rows, write_json  # noqa: E402


STAGES = (
    ("01", "01_preparar_datos.py"),
    ("02", "02_calcular_indicadores.py"),
    ("03", "03_calcular_coberturas.py"),
    ("04", "04_generar_mapas.py"),
    ("05", "05_generar_laminas.py"),
    ("06", "06_generar_memoria_tecnica.py"),
)


def load_stage_module(filename: str):
    script_path = SCRIPTS_ROOT / filename
    module_name = f"quito_pipeline_{script_path.stem.replace('-', '_')}"
    spec = importlib.util.spec_from_file_location(module_name, script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"No se pudo cargar el script {filename}.")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def aggregate_results(results: list[dict]) -> None:
    pipeline_payload = {"generated_at": results[-1]["generated_at"] if results else None, "stages": results}
    write_json(PROCESSED_ROOT / "pipeline_run.json", pipeline_payload)

    stage_rows = []
    warning_rows = []
    for result in results:
        stage_rows.append(
            {
                "stage_id": result.get("stage_id", ""),
                "title": result.get("title", ""),
                "warning_count": len(result.get("warnings", [])),
                "artifact_count": len(result.get("artifacts", [])),
            }
        )
        for warning in result.get("warnings", []):
            warning_rows.append(
                {
                    "stage_id": result.get("stage_id", ""),
                    "code": warning.get("code", ""),
                    "message": warning.get("message", ""),
                    "path": warning.get("path", ""),
                }
            )

    write_csv_rows(
        OUTPUT_ROOT / "tablas_csv" / "resumen_pipeline.csv",
        ["stage_id", "title", "warning_count", "artifact_count"],
        stage_rows,
    )
    write_csv_rows(
        OUTPUT_ROOT / "tablas_csv" / "advertencias_pipeline.csv",
        ["stage_id", "code", "message", "path"],
        warning_rows,
    )

    config = load_project_config()
    inputs_payload = {}
    inputs_path = PROCESSED_ROOT / "insumos_detectados.json"
    if inputs_path.exists():
        try:
            inputs_payload = json.loads(inputs_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            inputs_payload = {}

    input_rows = inputs_payload.get("insumos", []) if isinstance(inputs_payload, dict) else []
    required_inputs = [row for row in input_rows if row.get("required")]
    required_ready = [row for row in required_inputs if row.get("status") == "ready"]
    required_missing = [row for row in required_inputs if row.get("status") != "ready"]
    runtime = inputs_payload.get("runtime", {}) if isinstance(inputs_payload, dict) else {}
    total_warning_count = sum(len(result.get("warnings", [])) for result in results)

    public_manifest = {
        "project": {
            "name": config["proyecto"].get("nombre"),
            "territory": config["proyecto"].get("territorio"),
            "character": config["proyecto"].get("caracter"),
            "landing_page": "./index.html",
            "readme": "./README.md",
            "general_report": "./reports/memoria_tecnica_general.md",
            "pipeline_json": "./data/processed/pipeline_run.json",
            "summary_csv": "./outputs/tablas_csv/resumen_pipeline.csv",
            "warnings_csv": "./outputs/tablas_csv/advertencias_pipeline.csv",
            "config_path": "./config/parametros_normativos.yaml",
        },
        "generated_at": pipeline_payload["generated_at"],
        "zones_configured": len(config.get("administraciones_zonales", [])),
        "stage_count": len(results),
        "runtime": runtime,
        "status": {
            "code": "ready" if not required_missing and total_warning_count == 0 else "needs_attention",
            "label": "Publicado y listo para integracion" if not required_missing else "Publicado y pendiente de insumos oficiales",
            "warning_count": total_warning_count,
            "required_inputs_missing": len(required_missing),
            "required_inputs_ready": len(required_ready),
            "geospatial_ready": bool(runtime.get("geopandas") and runtime.get("shapely")),
        },
        "input_summary": {
            "required_total": len(required_inputs),
            "required_ready": len(required_ready),
            "required_missing": len(required_missing),
            "ready_labels": [row.get("label", "") for row in required_ready],
            "missing_labels": [row.get("label", "") for row in required_missing],
        },
        "stages": stage_rows,
        "warnings_preview": warning_rows[:12],
    }
    write_json(PROJECT_ROOT / "public_manifest.json", public_manifest)


def run_pipeline(selected_stage_ids: set[str]) -> list[dict]:
    results = []
    for stage_id, filename in STAGES:
        if stage_id not in selected_stage_ids:
            continue
        module = load_stage_module(filename)
        result = module.run()
        if isinstance(result, dict):
            results.append(result)
    aggregate_results(results)
    return results


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Pipeline SIG de equipamientos de Quito.")
    parser.add_argument(
        "stages",
        nargs="*",
        help="Fases a ejecutar: 01 02 03 04 05 06. Si se omite, corre todas.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    if not args.stages:
        selected = {stage_id for stage_id, _ in STAGES}
    else:
        selected = {item.zfill(2) for item in args.stages}
    run_pipeline(selected)
    print(f"Pipeline Quito ejecutado. Revisa {OUTPUT_ROOT / 'tablas_csv' / 'resumen_pipeline.csv'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
