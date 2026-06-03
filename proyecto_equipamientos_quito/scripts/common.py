from __future__ import annotations

import csv
import importlib.util
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_ROOT = PROJECT_ROOT / "config"
DATA_ROOT = PROJECT_ROOT / "data"
RAW_ROOT = DATA_ROOT / "raw"
PROCESSED_ROOT = DATA_ROOT / "processed"
REPORTS_ROOT = PROJECT_ROOT / "reports"
OUTPUT_ROOT = PROJECT_ROOT / "outputs"
TARGET_EPSG = 32717

SPATIAL_SUFFIXES = {".geojson", ".json", ".gpkg", ".shp", ".zip"}
TABULAR_SUFFIXES = {".csv", ".xlsx", ".xls"}

RAW_DATASETS = (
    {"id": "limite_dmq", "label": "Limite DMQ", "folder": "limite_dmq", "kind": "spatial", "required": True},
    {"id": "administraciones_zonales", "label": "Administraciones zonales", "folder": "administraciones_zonales", "kind": "spatial", "required": True},
    {"id": "parroquias", "label": "Parroquias", "folder": "parroquias", "kind": "spatial", "required": True},
    {"id": "barrios_manzanas", "label": "Barrios o manzanas", "folder": "barrios_manzanas", "kind": "spatial", "required": True},
    {"id": "poblacion", "label": "Poblacion", "folder": "poblacion", "kind": "tabular", "required": True},
    {"id": "vivienda", "label": "Vivienda", "folder": "vivienda", "kind": "tabular", "required": True},
    {"id": "edades", "label": "Edades", "folder": "edades", "kind": "tabular", "required": True},
    {"id": "red_vial", "label": "Red vial", "folder": "red_vial", "kind": "spatial", "required": True},
    {"id": "transporte", "label": "Transporte", "folder": "transporte", "kind": "mixed", "required": True},
    {"id": "equipamientos", "label": "Equipamientos", "folder": "equipamientos", "kind": "mixed", "required": True},
    {"id": "areas_verdes", "label": "Areas verdes", "folder": "areas_verdes", "kind": "mixed", "required": True},
    {"id": "hidrografia", "label": "Hidrografia", "folder": "hidrografia", "kind": "spatial", "required": True},
    {"id": "pugs_uso_suelo", "label": "PUGS uso de suelo", "folder": "pugs_uso_suelo", "kind": "spatial", "required": True},
)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def normalize_text(value: Any) -> str:
    text = str(value or "").strip()
    replacements = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "Á": "A",
        "É": "E",
        "Í": "I",
        "Ó": "O",
        "Ú": "U",
        "ñ": "n",
        "Ñ": "N",
        "ü": "u",
        "Ü": "U",
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    return text


def normalize_field_name(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", "", normalize_text(value).lower())


def slugify(value: Any) -> str:
    text = normalize_text(value).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return re.sub(r"-{2,}", "-", text)


def ensure_directory(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_text(path: Path, content: str) -> None:
    ensure_directory(path.parent)
    path.write_text(content, encoding="utf-8")


def write_json(path: Path, payload: Any) -> None:
    write_text(path, json.dumps(payload, ensure_ascii=False, indent=2))


def write_csv_rows(path: Path, fieldnames: list[str], rows: list[dict[str, Any]]) -> None:
    ensure_directory(path.parent)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({name: row.get(name, "") for name in fieldnames})


def load_yaml_like(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    yaml_spec = importlib.util.find_spec("yaml")
    if yaml_spec is not None:
        import yaml  # type: ignore

        payload = yaml.safe_load(text)
        if isinstance(payload, dict):
            return payload
    payload = json.loads(text)
    if not isinstance(payload, dict):
        raise ValueError(f"El archivo {path} no contiene un objeto valido.")
    return payload


def load_project_config() -> dict[str, Any]:
    return load_yaml_like(CONFIG_ROOT / "parametros_normativos.yaml")


def load_symbology_config() -> dict[str, Any]:
    return load_yaml_like(CONFIG_ROOT / "simbologia.yaml")


def load_zone_rows() -> list[dict[str, str]]:
    path = CONFIG_ROOT / "administraciones_zonales.csv"
    with path.open("r", encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def zone_alias_lookup() -> dict[str, str]:
    lookup: dict[str, str] = {}
    for row in load_zone_rows():
        canonical = row["zona_nombre"]
        lookup[normalize_text(canonical).upper()] = canonical
        aliases = [item for item in row.get("aliases", "").split("|") if item]
        for alias in aliases:
            lookup[normalize_text(alias).upper()] = canonical
    return lookup


def canonical_zone_name(value: Any) -> str:
    cleaned = normalize_text(value).upper()
    return zone_alias_lookup().get(cleaned, str(value or "").strip())


def runtime_capabilities() -> dict[str, bool]:
    modules = ("yaml", "pandas", "geopandas", "shapely", "matplotlib", "contextily", "openpyxl")
    return {name: importlib.util.find_spec(name) is not None for name in modules}


def discover_raw_inputs() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for spec in RAW_DATASETS:
        folder = RAW_ROOT / spec["folder"]
        files = sorted(
            path
            for path in folder.rglob("*")
            if path.is_file() and path.name not in {".gitkeep", ".gitignore"}
        ) if folder.exists() else []
        spatial_count = len([path for path in files if path.suffix.lower() in SPATIAL_SUFFIXES])
        tabular_count = len([path for path in files if path.suffix.lower() in TABULAR_SUFFIXES])
        status = "missing" if not files else "ready"
        rows.append(
            {
                "dataset_id": spec["id"],
                "label": spec["label"],
                "required": spec["required"],
                "kind": spec["kind"],
                "folder": str(folder.relative_to(PROJECT_ROOT)),
                "status": status,
                "file_count": len(files),
                "spatial_count": spatial_count,
                "tabular_count": tabular_count,
                "files": [str(path.relative_to(PROJECT_ROOT)) for path in files],
            }
        )
    return rows


def choose_first_input(dataset_id: str, allowed_suffixes: set[str] | None = None) -> Path | None:
    for row in discover_raw_inputs():
        if row["dataset_id"] != dataset_id:
            continue
        files = [PROJECT_ROOT / relative for relative in row["files"]]
        if not allowed_suffixes:
            return files[0] if files else None
        filtered = [path for path in files if path.suffix.lower() in allowed_suffixes]
        if filtered:
            filtered.sort(key=lambda item: item.suffix.lower())
            return filtered[0]
    return None


def detect_first_column(columns: list[str], candidates: list[str]) -> str | None:
    normalized = {normalize_field_name(column): column for column in columns}
    for candidate in candidates:
        probe = normalize_field_name(candidate)
        if probe in normalized:
            return normalized[probe]
    for candidate in candidates:
        probe = normalize_field_name(candidate)
        for normalized_name, original in normalized.items():
            if probe and probe in normalized_name:
                return original
    return None


def read_table(path: Path):
    import pandas as pd  # type: ignore

    suffix = path.suffix.lower()
    if suffix == ".csv":
        return pd.read_csv(path)
    if suffix in {".xlsx", ".xls"}:
        return pd.read_excel(path)
    raise ValueError(f"Formato tabular no soportado: {path.suffix}")


def load_vector_frame(path: Path):
    import geopandas as gpd  # type: ignore

    return gpd.read_file(path)


def standardize_vector_frame(gdf, stage_result: dict[str, Any], dataset_label: str, target_epsg: int = TARGET_EPSG):
    if gdf.crs is None:
        add_warning(stage_result, "missing_crs", f"{dataset_label}: la capa no tiene CRS definido.")
        return None
    current_epsg = gdf.crs.to_epsg()
    if current_epsg != target_epsg:
        gdf = gdf.to_crs(epsg=target_epsg)
    invalid_mask = ~gdf.geometry.is_valid
    invalid_count = int(invalid_mask.sum())
    if invalid_count:
        gdf = gdf.copy()
        gdf.loc[invalid_mask, "geometry"] = gdf.loc[invalid_mask, "geometry"].buffer(0)
        add_warning(
            stage_result,
            "fixed_invalid_geometry",
            f"{dataset_label}: se corrigieron {invalid_count} geometrias invalidas con buffer(0).",
        )
    return gdf


def write_vector_geojson(gdf, path: Path) -> None:
    write_text(path, gdf.to_json(drop_id=True))


def try_write_gpkg(gdf, path: Path, layer_name: str, stage_result: dict[str, Any]) -> None:
    try:
        ensure_directory(path.parent)
        gdf.to_file(path, layer=layer_name, driver="GPKG")
    except Exception as error:  # pragma: no cover - depende del entorno
        add_warning(
            stage_result,
            "gpkg_write_skipped",
            f"No fue posible escribir el GeoPackage {path.name}: {error}",
        )


def relative_path(path: Path | str) -> str:
    path_obj = Path(path)
    return str(path_obj.relative_to(PROJECT_ROOT)) if path_obj.is_absolute() else str(path_obj)


def new_stage_result(stage_id: str, title: str) -> dict[str, Any]:
    return {
        "stage_id": stage_id,
        "title": title,
        "generated_at": utc_now_iso(),
        "summary": {},
        "warnings": [],
        "artifacts": [],
    }


def add_warning(
    stage_result: dict[str, Any],
    code: str,
    message: str,
    path: Path | str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    warning = {"code": code, "message": message}
    if path is not None:
        warning["path"] = relative_path(path)
    if details:
        warning["details"] = details
    stage_result["warnings"].append(warning)


def add_artifact(stage_result: dict[str, Any], label: str, path: Path | str, kind: str) -> None:
    stage_result["artifacts"].append({"label": label, "path": relative_path(path), "kind": kind})


def finalize_stage(stage_result: dict[str, Any]) -> dict[str, Any]:
    output_path = PROCESSED_ROOT / f"{stage_result['stage_id']}_stage_result.json"
    write_json(output_path, stage_result)
    return stage_result


def ensure_zone_directories() -> list[dict[str, str]]:
    zones = load_zone_rows()
    for row in zones:
        ensure_directory(PROCESSED_ROOT / "zonas" / row["zona_slug"])
        ensure_directory(DATA_ROOT / "outputs" / "zonas" / row["zona_slug"])
        ensure_directory(REPORTS_ROOT / "memoria_tecnica_por_zona")
    return zones


def load_stage_results() -> list[dict[str, Any]]:
    results = []
    for path in sorted(PROCESSED_ROOT.glob("*_stage_result.json")):
        try:
            results.append(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            continue
    return results
