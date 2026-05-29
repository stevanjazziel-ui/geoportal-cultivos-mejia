from __future__ import annotations

import json
from datetime import datetime, timezone
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

import shapefile


ROOT = Path(__file__).resolve().parents[1]
INPUT_ROOT = ROOT / ".cache" / "piva-insumos"
OUTPUT_ROOT = ROOT / "public-data" / "mejia-piva"

WGS84_A = 6378137.0
WGS84_ECC_SQUARED = 0.00669438
UTM_K0 = 0.9996


def normalize_source_text(value: str | None) -> str:
    text = str(value or "").strip()
    if "Ã" in text or "Â" in text:
        try:
            text = text.encode("latin-1").decode("utf-8")
        except UnicodeError:
            pass
    return text \
        .replace("Ã", "A") \
        .replace("Ã‰", "E") \
        .replace("Ã", "I") \
        .replace("Ã“", "O") \
        .replace("Ãš", "U") \
        .replace("Ã¡", "a") \
        .replace("Ã©", "e") \
        .replace("Ã­", "i") \
        .replace("Ã³", "o") \
        .replace("Ãº", "u") \
        .replace("Ã±", "n") \
        .replace("Ã‘", "N") \
        .replace("Ã¼", "u") \
        .replace("Ãœ", "U") \
        .replace("Â", "") \
        .replace("\uFFFD", "") \
        .strip()


def utm17s_to_lonlat(easting: float, northing: float) -> list[float]:
    x = easting - 500000.0
    y = northing - 10000000.0

    ecc_prime_squared = WGS84_ECC_SQUARED / (1 - WGS84_ECC_SQUARED)
    m = y / UTM_K0
    mu = m / (
        WGS84_A
        * (
            1
            - WGS84_ECC_SQUARED / 4
            - 3 * WGS84_ECC_SQUARED * WGS84_ECC_SQUARED / 64
            - 5 * WGS84_ECC_SQUARED * WGS84_ECC_SQUARED * WGS84_ECC_SQUARED / 256
        )
    )

    e1 = (1 - (1 - WGS84_ECC_SQUARED) ** 0.5) / (1 + (1 - WGS84_ECC_SQUARED) ** 0.5)
    j1 = 3 * e1 / 2 - 27 * e1**3 / 32
    j2 = 21 * e1**2 / 16 - 55 * e1**4 / 32
    j3 = 151 * e1**3 / 96
    j4 = 1097 * e1**4 / 512
    fp = mu + j1 * __import__("math").sin(2 * mu) + j2 * __import__("math").sin(4 * mu) + j3 * __import__("math").sin(6 * mu) + j4 * __import__("math").sin(8 * mu)

    sin_fp = __import__("math").sin(fp)
    cos_fp = __import__("math").cos(fp)
    tan_fp = __import__("math").tan(fp)

    c1 = ecc_prime_squared * cos_fp**2
    t1 = tan_fp**2
    n1 = WGS84_A / (1 - WGS84_ECC_SQUARED * sin_fp**2) ** 0.5
    r1 = WGS84_A * (1 - WGS84_ECC_SQUARED) / (1 - WGS84_ECC_SQUARED * sin_fp**2) ** 1.5
    d = x / (n1 * UTM_K0)

    lat = fp - (
        n1
        * tan_fp
        / r1
        * (
            d * d / 2
            - (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * ecc_prime_squared) * d**4 / 24
            + (61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * ecc_prime_squared - 3 * c1 * c1) * d**6 / 720
        )
    )

    lon = (
        d
        - (1 + 2 * t1 + c1) * d**3 / 6
        + (5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * ecc_prime_squared + 24 * t1 * t1) * d**5 / 120
    ) / cos_fp

    lon_origin = -81.0
    lon = lon_origin + lon * 180 / __import__("math").pi
    lat = lat * 180 / __import__("math").pi
    return [round(lon, 6), round(lat, 6)]


def split_parts(points: list, parts: Iterable[int]) -> list[list]:
    part_indexes = list(parts) + [len(points)]
    return [points[part_indexes[index] : part_indexes[index + 1]] for index in range(len(part_indexes) - 1)]


def shape_to_geometry(shape: shapefile.Shape) -> dict | None:
    points = shape.points
    if not points:
        return None

    if shape.shapeTypeName in {"POINT", "POINTZ", "POINTM"}:
        lon, lat = utm17s_to_lonlat(points[0][0], points[0][1])
        return {"type": "Point", "coordinates": [lon, lat]}

    parts = split_parts(points, shape.parts)
    transformed = [[utm17s_to_lonlat(point[0], point[1]) for point in part] for part in parts if part]
    if not transformed:
        return None

    if shape.shapeTypeName in {"POLYLINE", "POLYLINEZ", "POLYLINEM"}:
        if len(transformed) == 1:
            return {"type": "LineString", "coordinates": transformed[0]}
        return {"type": "MultiLineString", "coordinates": transformed}

    if shape.shapeTypeName in {"POLYGON", "POLYGONZ", "POLYGONM"}:
        closed_parts = []
        for ring in transformed:
            if ring[0] != ring[-1]:
                ring = ring + [ring[0]]
            closed_parts.append(ring)
        if len(closed_parts) == 1:
            return {"type": "Polygon", "coordinates": [closed_parts[0]]}
        return {"type": "MultiPolygon", "coordinates": [[[ring]] if False else [ring] for ring in closed_parts]}

    return None


def clean_properties(record: dict, mapping: dict[str, str] | None = None, keep: list[str] | None = None) -> dict:
    payload = {}
    keys = keep or list(record.keys())
    for key in keys:
        value = record.get(key)
        if isinstance(value, str):
            value = normalize_source_text(value)
        out_key = mapping.get(key, key) if mapping else key
        payload[out_key] = value
    return payload


def feature_collection_from_shp(path: Path, property_keys: list[str], mapping: dict[str, str] | None = None, extra: dict | None = None) -> dict:
    reader = shapefile.Reader(str(path))
    features = []
    for shape_record in reader.iterShapeRecords():
        geometry = shape_to_geometry(shape_record.shape)
        if not geometry:
            continue
        properties = clean_properties(shape_record.record.as_dict(), mapping=mapping, keep=property_keys)
        if extra:
            properties.update(extra)
        properties = {
            key: normalize_source_text(item) if isinstance(item, str) else item
            for key, item in properties.items()
        }
        properties = {
            key: normalize_source_text(item) if isinstance(item, str) else item
            for key, item in properties.items()
        }
        features.append({"type": "Feature", "properties": properties, "geometry": geometry})
    return {"type": "FeatureCollection", "features": features}


def normalize_parish_name(value: str) -> str:
    text = normalize_source_text(value).upper()
    mapping = {
        "ALOASI": "Aloasí",
        "ALOAG": "Aloag",
        "CUTUGLAGUA": "Cutuglagua",
        "EL CHAUPI": "El Chaupi",
        "MACHACHI": "Machachi",
        "MANUEL CORNEJO ASTORGA (TANDAPI)": "Manuel Cornejo Astorga",
        "TAMBILLO": "Tambillo",
        "UYUMBICHO": "Uyumbicho",
    }
    if text == "ALOASI":
        return "Aloasi"
    return mapping.get(text, normalize_source_text(value).title())


def build_service_summary() -> tuple[dict, dict]:
    folder = next((INPUT_ROOT / "infraestructura").glob("INFRAESTRUCTURA*"))
    service_files = {
        "agua": next(folder.glob("SERVICIO DE AGUA URBANO.shp")),
        "alcantarillado": next(folder.glob("SERVICIO DE ALCANTARILLADO URBANO.shp")),
        "luz": next(folder.glob("SERVICIO DE LUZ URBANO.shp")),
        "telefono": next(folder.glob("SERVICIO DE TELEFONO URBANO.shp")),
    }
    field_names = {
        "agua": "Agua",
        "alcantarillado": "Alcantaril",
        "luz": "Luz",
        "telefono": "Telefono",
    }

    summary_by_parish: dict[str, dict] = {}
    global_counts = {"parcelCount": 0, "coverage": {}}

    for service_key, shp_path in service_files.items():
        reader = shapefile.Reader(str(shp_path))
        service_field = field_names[service_key]
        service_counter = Counter()
        for shape_record in reader.iterShapeRecords():
            record = shape_record.record.as_dict()
            parish_key = normalize_parish_name(str(record.get("parroquia") or "").strip())
            entry = summary_by_parish.setdefault(
                parish_key,
                {
                    "parroquia": parish_key,
                    "parcelCount": 0,
                    "services": {},
                    "_bbox": [None, None, None, None],
                },
            )

            if service_key == "agua":
                entry["parcelCount"] += 1
                global_counts["parcelCount"] += 1

            service_value = normalize_source_text(record.get(service_field) or "") or "Sin dato"
            entry["services"].setdefault(service_key, Counter())
            entry["services"][service_key][service_value] += 1
            service_counter[service_value] += 1

            if hasattr(shape_record.shape, "bbox"):
                xmin, ymin, xmax, ymax = shape_record.shape.bbox
                bbox = entry["_bbox"]
                bbox[0] = xmin if bbox[0] is None else min(bbox[0], xmin)
                bbox[1] = ymin if bbox[1] is None else min(bbox[1], ymin)
                bbox[2] = xmax if bbox[2] is None else max(bbox[2], xmax)
                bbox[3] = ymax if bbox[3] is None else max(bbox[3], ymax)

        global_counts["coverage"][service_key] = dict(service_counter)

    features = []
    parish_summaries = []
    for entry in sorted(summary_by_parish.values(), key=lambda item: item["parroquia"]):
        bbox = entry.pop("_bbox")
        if bbox[0] is None:
            continue
        cx = (bbox[0] + bbox[2]) / 2
        cy = (bbox[1] + bbox[3]) / 2
        geometry = {"type": "Point", "coordinates": utm17s_to_lonlat(cx, cy)}
        metrics = {}
        service_index_parts = []
        for service_key in ("agua", "alcantarillado", "luz", "telefono"):
            counts = entry["services"].get(service_key, Counter())
            total = sum(counts.values()) or 1
            yes_count = counts.get("SI", 0)
            no_count = counts.get("NO", 0)
            info_gap = total - yes_count - no_count
            yes_pct = round((yes_count / total) * 100, 1)
            metrics[service_key] = {
                "yes": yes_count,
                "no": no_count,
                "gap": info_gap,
                "yesPct": yes_pct,
            }
            service_index_parts.append(yes_pct)
        service_index = round(sum(service_index_parts) / len(service_index_parts), 1)
        properties = {
            "parroquia": entry["parroquia"],
            "parcelCount": entry["parcelCount"],
            "serviceIndex": service_index,
            "aguaPct": metrics["agua"]["yesPct"],
            "alcantarilladoPct": metrics["alcantarillado"]["yesPct"],
            "luzPct": metrics["luz"]["yesPct"],
            "telefonoPct": metrics["telefono"]["yesPct"],
            "aguaNo": metrics["agua"]["no"],
            "alcantarilladoNo": metrics["alcantarillado"]["no"],
            "luzNo": metrics["luz"]["no"],
            "telefonoNo": metrics["telefono"]["no"],
            "category": "servicios-basicos",
            "source": "GAD Mejía | infraestructura de servicios básicos",
            "summary": f"{entry['parroquia']} registra agua {metrics['agua']['yesPct']}%, alcantarillado {metrics['alcantarillado']['yesPct']}%, luz {metrics['luz']['yesPct']}% y telefono {metrics['telefono']['yesPct']}%.",
        }
        features.append({"type": "Feature", "properties": properties, "geometry": geometry})
        parish_summaries.append(properties)

    return (
        {"type": "FeatureCollection", "features": features},
        {"parroquias": parish_summaries, "global": {"parcelCount": global_counts["parcelCount"], "coverage": global_counts["coverage"]}},
    )


def write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def main() -> None:
    banco_dir = INPUT_ROOT / "banco" / "BANCO_USO_SUELO_MUNICIPAL"
    equip_dir = INPUT_ROOT / "equipamiento" / "EQUIPAMIENTO"
    patrimonio_dir = INPUT_ROOT / "patrimonio"
    infra_dir = next((INPUT_ROOT / "infraestructura").glob("INFRAESTRUCTURA*"))

    banco = feature_collection_from_shp(
        banco_dir / "BANCO_SUELO_MUNICIPAL.shp",
        ["cod_catast", "area_terre", "area_contr", "DESCR", "NOMBRE", "TIPOLOGIA", "DPA_DESPAR", "tipo"],
        mapping={
            "DESCR": "descr",
            "NOMBRE": "nombre",
            "TIPOLOGIA": "tipologia",
            "DPA_DESPAR": "parroquia",
            "tipo": "ambito",
        },
        extra={"category": "banco-suelo", "source": "GAD Mejía | banco de suelo municipal"},
    )

    equipamiento = feature_collection_from_shp(
        equip_dir / "Equipamiento.shp",
        ["OBJECTID", "DESCR", "NOMBRE", "CODIGOACT", "TIPOLOGIA"],
        mapping={
            "OBJECTID": "objectId",
            "DESCR": "descr",
            "NOMBRE": "nombre",
            "CODIGOACT": "codigo",
            "TIPOLOGIA": "tipologia",
        },
        extra={"category": "equipamiento-local", "source": "GAD Mejía | equipamiento"},
    )

    patrimonio = feature_collection_from_shp(
        patrimonio_dir / "PATRIMONIO.shp",
        ["objectid", "fcode", "tde", "obs"],
        mapping={"objectid": "objectId"},
        extra={"category": "patrimonio", "source": "GAD Mejía | patrimonio"},
    )

    alta_tension = feature_collection_from_shp(
        infra_dir / "LINEA ALTA TENSION.shp",
        ["objectid", "fcode", "tde", "obs", "ret"],
        mapping={"objectid": "objectId", "ret": "resguardoM"},
        extra={"category": "alta-tension", "source": "GAD Mejía | infraestructura de servicios básicos"},
    )

    servicios_basicos, servicios_resumen = build_service_summary()

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "datasets": {
            "bancoSueloMunicipal": {"path": "./public-data/mejia-piva/banco_suelo_municipal.geojson", "count": len(banco["features"])},
            "equipamientoMunicipal": {"path": "./public-data/mejia-piva/equipamiento_municipal.geojson", "count": len(equipamiento["features"])},
            "patrimonioMunicipal": {"path": "./public-data/mejia-piva/patrimonio_municipal.geojson", "count": len(patrimonio["features"])},
            "altaTensionMejia": {"path": "./public-data/mejia-piva/linea_alta_tension.geojson", "count": len(alta_tension["features"])},
            "serviciosBasicosParroquia": {"path": "./public-data/mejia-piva/servicios_basicos_parroquia.geojson", "count": len(servicios_basicos["features"])},
            "serviciosBasicosResumen": {"path": "./public-data/mejia-piva/servicios_basicos_resumen.json", "count": len(servicios_resumen["parroquias"])},
        },
        "summary": {
            "bancoSueloMunicipal": Counter(normalize_source_text(feature["properties"].get("descr")) for feature in banco["features"]),
            "equipamientoTipologia": Counter(normalize_source_text(feature["properties"].get("tipologia")) for feature in equipamiento["features"]),
            "patrimonio": len(patrimonio["features"]),
            "altaTension": len(alta_tension["features"]),
        },
    }
    manifest["summary"]["bancoSueloMunicipal"] = dict(manifest["summary"]["bancoSueloMunicipal"])
    manifest["summary"]["equipamientoTipologia"] = dict(manifest["summary"]["equipamientoTipologia"])

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    write_json(OUTPUT_ROOT / "banco_suelo_municipal.geojson", banco)
    write_json(OUTPUT_ROOT / "equipamiento_municipal.geojson", equipamiento)
    write_json(OUTPUT_ROOT / "patrimonio_municipal.geojson", patrimonio)
    write_json(OUTPUT_ROOT / "linea_alta_tension.geojson", alta_tension)
    write_json(OUTPUT_ROOT / "servicios_basicos_parroquia.geojson", servicios_basicos)
    write_json(OUTPUT_ROOT / "servicios_basicos_resumen.json", servicios_resumen)
    write_json(OUTPUT_ROOT / "manifest.json", manifest)
    print(f"Datasets PIVA de Mejía generados en {OUTPUT_ROOT}")


if __name__ == "__main__":
    main()
