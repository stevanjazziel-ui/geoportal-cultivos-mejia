from __future__ import annotations

import json
import math
import re
import statistics
import unicodedata
from collections import Counter
from pathlib import Path

from openpyxl import load_workbook
from PIL import Image


SOURCE_ROOT = Path(r"E:\info de campo")
REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = REPO_ROOT / "public-data" / "field" / "field_evidence.json"
Image.MAX_IMAGE_PIXELS = None

MONTH_CODES = {
    "ENE": 0,
    "FEB": 1,
    "MAR": 2,
    "ABR": 3,
    "MAY": 4,
    "JUN": 5,
    "JUL": 6,
    "AGO": 7,
    "SEP": 8,
    "OCT": 9,
    "NOV": 10,
    "DIC": 11,
}
MONTH_NAMES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
]


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFD", str(value or ""))
    text = "".join(char for char in text if unicodedata.category(char) != "Mn")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "sin-id"


def to_float(value) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        if math.isnan(value):
            return None
        return float(value)
    text = str(value).strip().replace(",", ".")
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def utm17s_to_lonlat(easting: float, northing: float) -> tuple[float, float]:
    a = 6378137.0
    ecc_sq = 0.00669437999014
    k0 = 0.9996
    x = easting - 500000.0
    y = northing - 10000000.0
    zone = 17
    long_origin = (zone - 1) * 6 - 180 + 3
    ecc_prime_sq = ecc_sq / (1 - ecc_sq)

    m = y / k0
    mu = m / (
        a
        * (
            1
            - ecc_sq / 4
            - 3 * ecc_sq * ecc_sq / 64
            - 5 * ecc_sq * ecc_sq * ecc_sq / 256
        )
    )

    e1 = (1 - math.sqrt(1 - ecc_sq)) / (1 + math.sqrt(1 - ecc_sq))
    phi1 = (
        mu
        + (3 * e1 / 2 - 27 * e1**3 / 32) * math.sin(2 * mu)
        + (21 * e1**2 / 16 - 55 * e1**4 / 32) * math.sin(4 * mu)
        + (151 * e1**3 / 96) * math.sin(6 * mu)
        + (1097 * e1**4 / 512) * math.sin(8 * mu)
    )

    n1 = a / math.sqrt(1 - ecc_sq * math.sin(phi1) ** 2)
    t1 = math.tan(phi1) ** 2
    c1 = ecc_prime_sq * math.cos(phi1) ** 2
    r1 = a * (1 - ecc_sq) / (1 - ecc_sq * math.sin(phi1) ** 2) ** 1.5
    d = x / (n1 * k0)

    lat = (
        phi1
        - (n1 * math.tan(phi1) / r1)
        * (
            d * d / 2
            - (5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * ecc_prime_sq) * d**4 / 24
            + (
                61
                + 90 * t1
                + 298 * c1
                + 45 * t1 * t1
                - 252 * ecc_prime_sq
                - 3 * c1 * c1
            )
            * d**6
            / 720
        )
    )

    lon = (
        d
        - (1 + 2 * t1 + c1) * d**3 / 6
        + (
            5
            - 2 * c1
            + 28 * t1
            - 3 * c1 * c1
            + 8 * ecc_prime_sq
            + 24 * t1 * t1
        )
        * d**5
        / 120
    ) / math.cos(phi1)

    latitude = math.degrees(lat)
    longitude = long_origin + math.degrees(lon)
    return round(longitude, 6), round(latitude, 6)


def build_geojson_polygon(corners_utm: list[tuple[float, float]]) -> tuple[dict, list[float], float]:
    lonlat_ring = [utm17s_to_lonlat(x, y) for x, y in corners_utm]
    if lonlat_ring[0] != lonlat_ring[-1]:
        lonlat_ring.append(lonlat_ring[0])
    xs = [corner[0] for corner in corners_utm]
    ys = [corner[1] for corner in corners_utm]
    bbox = [round(min(xs), 3), round(min(ys), 3), round(max(xs), 3), round(max(ys), 3)]
    area_ha = round(((bbox[2] - bbox[0]) * (bbox[3] - bbox[1])) / 10000, 2)
    return {
        "type": "Polygon",
        "coordinates": [lonlat_ring],
    }, bbox, area_ha


def read_world_file(tfw_path: Path) -> tuple[float, float, float, float, float, float] | None:
    if not tfw_path.exists():
        return None
    lines = [line.strip() for line in tfw_path.read_text(encoding="utf-8", errors="ignore").splitlines() if line.strip()]
    if len(lines) < 6:
        return None
    values = [to_float(line) for line in lines[:6]]
    if not all(value is not None for value in values):
        return None
    return tuple(values)  # type: ignore[return-value]


def corners_from_world_file(image_path: Path, tfw_path: Path) -> tuple[list[tuple[float, float]], list[float], float] | None:
    transform = read_world_file(tfw_path)
    if not transform:
        return None
    with Image.open(image_path) as image:
        width, height = image.size
    a, d, b, e, c, f = transform
    pixel_corners = [
        (-0.5, -0.5),
        (width - 0.5, -0.5),
        (width - 0.5, height - 0.5),
        (-0.5, height - 0.5),
    ]
    corners = []
    for px, py in pixel_corners:
        x = a * px + b * py + c
        y = d * px + e * py + f
        corners.append((x, y))
    geometry, bbox_utm, area_ha = build_geojson_polygon(corners)
    return geometry, bbox_utm, area_ha


def corners_from_geotiff(image_path: Path) -> tuple[dict, list[float], float] | None:
    try:
        with Image.open(image_path) as image:
            tags = image.tag_v2
            scale = tags.get(33550)
            tie = tags.get(33922)
            width, height = image.size
    except Exception:
        return None

    if not scale or not tie or len(scale) < 2 or len(tie) < 6:
        return None

    pixel_x = float(scale[0])
    pixel_y = float(scale[1])
    origin_x = float(tie[3])
    origin_y = float(tie[4])
    corners = [
        (origin_x, origin_y),
        (origin_x + pixel_x * width, origin_y),
        (origin_x + pixel_x * width, origin_y - pixel_y * height),
        (origin_x, origin_y - pixel_y * height),
    ]
    return build_geojson_polygon(corners)


def extract_year(value: str) -> int | None:
    match = re.search(r"(19|20)\d{2}", str(value or ""))
    if not match:
        return None
    return int(match.group(0))


def describe_sector_type(name: str) -> str:
    lowered = name.lower()
    if "r." in lowered or lowered.startswith("r."):
        return "Rio"
    if "uyumbicho" in lowered:
        return "Quebrada / sector lineal"
    if "q." in lowered or lowered.startswith("q."):
        return "Quebrada"
    return "Sector de campo"


def build_sector_features() -> list[dict]:
    field_root = SOURCE_ROOT / "Información de campo"
    features: list[dict] = []
    for folder in sorted(field_root.iterdir()):
        if not folder.is_dir():
            continue

        raster_files = [path for path in folder.rglob("*") if path.is_file() and path.suffix.lower() in {".tif", ".tiff"}]
        orthomosaic = next((path for path in folder.glob("*transparent_mosaic_group1.tif")), None)
        dtm = next((path for path in (folder / "dtm").glob("*_dtm.tif")), None)
        reference = orthomosaic or dtm
        if not reference:
            continue

        tfw = reference.with_suffix(".tfw")
        extent = corners_from_world_file(reference, tfw) or corners_from_geotiff(reference)
        if not extent:
            continue
        geometry, bbox_utm, area_ha = extent
        feature = {
            "type": "Feature",
            "id": slugify(folder.name),
            "geometry": geometry,
            "properties": {
                "name": folder.name,
                "sectorType": describe_sector_type(folder.name),
                "sectorLabel": folder.name.split(".", 1)[-1].strip(),
                "rasterCount": len(raster_files),
                "hasOrthomosaic": orthomosaic is not None,
                "hasDtm": dtm is not None,
                "orthomosaicName": orthomosaic.name if orthomosaic else None,
                "dtmName": dtm.name if dtm else None,
                "orthomosaicMb": round((orthomosaic.stat().st_size / (1024 * 1024)), 1) if orthomosaic else None,
                "dtmMb": round((dtm.stat().st_size / (1024 * 1024)), 1) if dtm else None,
                "coverageHa": area_ha,
                "bboxUtm": bbox_utm,
                "sourceGroup": "informacion_campo",
                "summary": (
                    f"{folder.name}: {len(raster_files)} rasters detectados, "
                    f"{'ortomosaico' if orthomosaic else 'sin ortomosaico'}, "
                    f"{'DTM' if dtm else 'sin DTM'} y cobertura aproximada de {area_ha} ha."
                ),
            },
        }
        features.append(feature)
    return features


def parse_precipitation_station(ws) -> dict:
    monthly = []
    for row in range(9, ws.max_row + 1):
        month_code = ws.cell(row, 1).value
        if month_code not in MONTH_CODES:
            continue
        monthly_mm = to_float(ws.cell(row, 2).value)
        max_24h = to_float(ws.cell(row, 3).value)
        max_day = to_float(ws.cell(row, 4).value)
        rainy_days = to_float(ws.cell(row, 5).value)
        historical = to_float(ws.cell(row, 6).value)
        monthly.append({
            "month": month_code,
            "monthlyMm": monthly_mm,
            "max24hMm": max_24h,
            "maxDay": max_day,
            "rainyDays": rainy_days,
            "historicalMm": historical,
        })

    total_mm = round(sum(item["monthlyMm"] or 0 for item in monthly), 1)
    rainy_days_total = round(sum(item["rainyDays"] or 0 for item in monthly))
    historical_total = round(sum(item["historicalMm"] or 0 for item in monthly), 1)
    max_24h = max((item["max24hMm"] or 0 for item in monthly), default=0)
    wettest = max(monthly, key=lambda item: item["monthlyMm"] or -1, default=None)
    return {
        "kind": "precipitacion",
        "monthlyRecords": monthly,
        "annualMetric": total_mm,
        "annualMetricLabel": f"{total_mm} mm/anio",
        "historicalMetric": historical_total,
        "historicalMetricLabel": f"{historical_total} mm/anio historicos",
        "peakMetric": max_24h,
        "peakMetricLabel": f"{max_24h:.1f} mm max 24h" if max_24h else "Sin maximo 24h",
        "rainyDays": rainy_days_total,
        "headline": wettest["month"] if wettest else "Sin mes pico",
    }


def parse_flow_station(ws) -> dict:
    monthly = []
    for row in range(8, ws.max_row + 1):
        month_code = ws.cell(row, 1).value
        if month_code not in MONTH_CODES:
            continue
        maximum = to_float(ws.cell(row, 2).value)
        minimum = to_float(ws.cell(row, 3).value)
        mean = to_float(ws.cell(row, 4).value)
        historical = to_float(ws.cell(row, 5).value)
        monthly.append({
            "month": month_code,
            "maxLs": maximum,
            "minLs": minimum,
            "meanLs": mean,
            "historicalLs": historical,
        })

    mean_values = [item["meanLs"] for item in monthly if item["meanLs"] is not None]
    historical_values = [item["historicalLs"] for item in monthly if item["historicalLs"] is not None]
    annual_mean = round(statistics.mean(mean_values), 1) if mean_values else 0
    historical_mean = round(statistics.mean(historical_values), 1) if historical_values else 0
    peak_flow = max((item["maxLs"] or 0 for item in monthly), default=0)
    low_flow = min((item["minLs"] for item in monthly if item["minLs"] is not None), default=0)
    return {
        "kind": "caudal",
        "monthlyRecords": monthly,
        "annualMetric": annual_mean,
        "annualMetricLabel": f"{annual_mean} l/s medios",
        "historicalMetric": historical_mean,
        "historicalMetricLabel": f"{historical_mean} l/s historicos",
        "peakMetric": peak_flow,
        "peakMetricLabel": f"{peak_flow:.1f} l/s max" if peak_flow else "Sin caudal maximo",
        "lowMetric": low_flow,
        "headline": "Caudal medio anual",
    }


def build_hydromet_features() -> list[dict]:
    hydro_root = SOURCE_ROOT / "FONAG" / "DATOS HIDROLOGICOS Y METEOROLOGICOS"
    features: list[dict] = []

    for workbook_path in sorted(hydro_root.glob("*.xlsx")):
        workbook = load_workbook(workbook_path, data_only=True, read_only=True)
        worksheet = workbook[workbook.sheetnames[0]]
        code = str(worksheet["A1"].value or workbook_path.stem).strip()
        name = str(worksheet["D1"].value or code).strip()
        northing = to_float(worksheet["B3"].value)
        easting = to_float(worksheet["F3"].value)
        altitude = to_float(worksheet["H3"].value)
        if not northing or not easting:
            continue
        longitude, latitude = utm17s_to_lonlat(easting, northing)
        section_label = str(worksheet["A5"].value or "").lower()
        metrics = parse_precipitation_station(worksheet) if "precipit" in section_label else parse_flow_station(worksheet)

        features.append({
            "type": "Feature",
            "id": slugify(code),
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude],
            },
            "properties": {
                "code": code,
                "name": name,
                "stationKind": metrics["kind"],
                "annualMetric": metrics["annualMetric"],
                "annualMetricLabel": metrics["annualMetricLabel"],
                "historicalMetric": metrics["historicalMetric"],
                "historicalMetricLabel": metrics["historicalMetricLabel"],
                "peakMetric": metrics["peakMetric"],
                "peakMetricLabel": metrics["peakMetricLabel"],
                "lowMetric": metrics.get("lowMetric"),
                "rainyDays": metrics.get("rainyDays"),
                "altitudeM": altitude,
                "utmNorthing": northing,
                "utmEasting": easting,
                "headline": metrics["headline"],
                "monthlyRecords": metrics["monthlyRecords"],
                "summary": (
                    f"{name} ({code}) registra {metrics['annualMetricLabel']} "
                    f"frente a {metrics['historicalMetricLabel']}."
                ),
                "sourceGroup": "fonag",
            },
        })
    return features


def build_climate_history() -> list[dict]:
    workbook = load_workbook(SOURCE_ROOT / "INHAMI" / "INHAMI.xlsx", data_only=True, read_only=True)
    records = []
    for sheet_name in workbook.sheetnames:
        worksheet = workbook[sheet_name]
        annual_totals = []
        month_totals = [0.0] * 12
        month_counts = [0] * 12
        years = []

        for row in worksheet.iter_rows(min_row=2, values_only=True):
            year = row[0]
            if not isinstance(year, (int, float)):
                continue
            year = int(year)
            monthly_values = []
            for index in range(12):
                value = to_float(row[index + 1] if index + 1 < len(row) else None)
                if value is not None:
                    monthly_values.append(value)
                    month_totals[index] += value
                    month_counts[index] += 1
            if monthly_values:
                annual_totals.append(sum(monthly_values))
                years.append(year)

        if not years:
            continue

        month_means = [
            (month_totals[index] / month_counts[index]) if month_counts[index] else 0
            for index in range(12)
        ]
        wettest_index = max(range(12), key=lambda idx: month_means[idx])
        driest_index = min(range(12), key=lambda idx: month_means[idx] if month_counts[idx] else 10**9)
        records.append({
            "stationCode": sheet_name,
            "yearStart": min(years),
            "yearEnd": max(years),
            "sampleCount": len(years),
            "annualMeanMm": round(statistics.mean(annual_totals), 1),
            "wettestMonth": MONTH_NAMES[wettest_index],
            "wettestMonthMm": round(month_means[wettest_index], 1),
            "driestMonth": MONTH_NAMES[driest_index],
            "driestMonthMm": round(month_means[driest_index], 1),
            "summary": (
                f"Serie {sheet_name}: {min(years)}-{max(years)} con media anual "
                f"de {round(statistics.mean(annual_totals), 1)} mm."
            ),
        })
    return sorted(records, key=lambda item: item["annualMeanMm"], reverse=True)


def build_inventory_catalog() -> dict:
    workbook = load_workbook(SOURCE_ROOT / "INFORMACION_HMEJIA.xlsx", data_only=True, read_only=True)
    worksheet = workbook["INFORMACION"]
    categories = []
    current = None

    for row_index in range(9, worksheet.max_row + 1):
        category_id = worksheet.cell(row_index, 1).value
        category_label = worksheet.cell(row_index, 2).value
        item_code = worksheet.cell(row_index, 3).value
        item_label = worksheet.cell(row_index, 4).value

        if category_id is not None or category_label:
            current = {
                "id": str(category_id or len(categories) + 1),
                "label": str(category_label or f"Categoria {len(categories) + 1}").strip(),
                "items": [],
            }
            categories.append(current)

        if current and item_code and item_label:
            current["items"].append({
                "code": str(item_code).strip(),
                "label": str(item_label).strip(),
            })

    return {
        "categories": [
            {
                "id": item["id"],
                "label": item["label"],
                "itemCount": len(item["items"]),
                "items": item["items"],
            }
            for item in categories
        ],
        "categoryCount": len(categories),
        "itemCount": sum(len(item["items"]) for item in categories),
    }


def build_raster_features(folder: Path, group: str) -> list[dict]:
    features: list[dict] = []
    for raster_path in sorted(path for path in folder.rglob("*") if path.is_file() and path.suffix.lower() in {".tif", ".tiff"}):
        if raster_path.name.lower().endswith(".ovr"):
            continue
        extent = corners_from_geotiff(raster_path)
        if not extent:
            tfw_extent = corners_from_world_file(raster_path, raster_path.with_suffix(".tfw"))
            if not tfw_extent:
                continue
            geometry, bbox_utm, area_ha = tfw_extent
        else:
            geometry, bbox_utm, area_ha = extent

        source_kind = "historico"
        name_lower = raster_path.name.lower()
        if "dem" in name_lower:
            source_kind = "dem"
        elif "planet" in name_lower or "nicfi" in name_lower:
            source_kind = "planet"
        elif "orto" in name_lower or "mosaic" in name_lower:
            source_kind = "ortofoto"

        features.append({
            "type": "Feature",
            "id": slugify(f"{group}-{raster_path.stem}"),
            "geometry": geometry,
            "properties": {
                "name": raster_path.stem,
                "sourceGroup": group,
                "sourceKind": source_kind,
                "year": extract_year(raster_path.name),
                "coverageHa": area_ha,
                "bboxUtm": bbox_utm,
                "fileName": raster_path.name,
                "sizeMb": round(raster_path.stat().st_size / (1024 * 1024), 1),
                "summary": f"{raster_path.stem} ({group}) cubre aproximadamente {area_ha} ha.",
            },
        })
    return features


def build_dataset() -> dict:
    sectors = build_sector_features()
    stations = build_hydromet_features()
    climate_history = build_climate_history()
    inventory = build_inventory_catalog()
    historical = build_raster_features(SOURCE_ROOT / "Cartas Historicas IGM", "cartas_historicas_igm")
    terrain = build_raster_features(SOURCE_ROOT / "MDT historico", "mdt_historico")

    sector_types = Counter(feature["properties"]["sectorType"] for feature in sectors)
    station_types = Counter(feature["properties"]["stationKind"] for feature in stations)

    return {
        "generatedAt": __import__("datetime").datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "sourceRoot": str(SOURCE_ROOT),
        "summary": {
            "fieldSectorCount": len(sectors),
            "hydrometStationCount": len(stations),
            "climateSeriesCount": len(climate_history),
            "historicalRasterCount": len(historical),
            "terrainRasterCount": len(terrain),
            "inventoryCategoryCount": inventory["categoryCount"],
            "inventoryItemCount": inventory["itemCount"],
            "sectorTypes": dict(sector_types),
            "stationTypes": dict(station_types),
        },
        "sectors": {
            "type": "FeatureCollection",
            "features": sectors,
        },
        "hydrometStations": {
            "type": "FeatureCollection",
            "features": stations,
        },
        "historicalSources": {
            "type": "FeatureCollection",
            "features": historical,
        },
        "terrainSources": {
            "type": "FeatureCollection",
            "features": terrain,
        },
        "climateHistory": {
            "stations": climate_history,
        },
        "inventoryCatalog": inventory,
    }


def main() -> None:
    dataset = build_dataset()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(dataset, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"OK {OUTPUT_PATH}")
    print(json.dumps(dataset["summary"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
