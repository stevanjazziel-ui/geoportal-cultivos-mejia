/* global shp */
self.importScripts("https://unpkg.com/shpjs@6.1.0/dist/shp.js");

function getGeometryList(geometries) {
  if (Array.isArray(geometries)) {
    return geometries.filter(Boolean);
  }
  if (Array.isArray(geometries?.features)) {
    return geometries.features.map((feature) => feature.geometry).filter(Boolean);
  }
  return [];
}

function walkCoordinates(coordinates, callback) {
  if (!Array.isArray(coordinates)) {
    return;
  }
  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    callback(coordinates[0], coordinates[1]);
    return;
  }
  coordinates.forEach((child) => walkCoordinates(child, callback));
}

function estimateMetrics(geometry) {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  let vertices = 0;

  walkCoordinates(geometry?.coordinates, (lon, lat) => {
    vertices += 1;
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  });

  if (!Number.isFinite(minLon) || !Number.isFinite(minLat)) {
    return {
      footprintM2: 36,
      floors: 1,
      heightM: 4.3,
      centroid: [-78.59, -0.503],
      bounds: [-78.5901, -0.5031, -78.5899, -0.5029],
    };
  }

  const meanLat = ((minLat + maxLat) / 2) * Math.PI / 180;
  const widthM = Math.max(2, Math.abs(maxLon - minLon) * 111320 * Math.cos(meanLat));
  const depthM = Math.max(2, Math.abs(maxLat - minLat) * 110540);
  const footprintM2 = Math.max(18, widthM * depthM * 0.68);
  let floors = 1;
  if (footprintM2 > 160) floors = 2;
  if (footprintM2 > 340) floors = 3;
  if (footprintM2 > 640) floors = 4;
  if (footprintM2 > 980) floors = 5;
  if (vertices > 42 && footprintM2 > 220) floors += 1;

  return {
    footprintM2: Number(footprintM2.toFixed(1)),
    floors,
    heightM: Number((1.2 + floors * 3.05).toFixed(1)),
    centroid: [
      Number(((minLon + maxLon) / 2).toFixed(6)),
      Number(((minLat + maxLat) / 2).toFixed(6)),
    ],
    bounds: [
      Number(minLon.toFixed(6)),
      Number(minLat.toFixed(6)),
      Number(maxLon.toFixed(6)),
      Number(maxLat.toFixed(6)),
    ],
  };
}

function createBuildingFeature(geometry, index, metadata = null) {
  const estimate = estimateMetrics(geometry);
  const floors = Number(metadata?.floors?.[index]) || estimate.floors;
  const heightM = Number(metadata?.heights?.[index]) || Number((1.2 + floors * 3.05).toFixed(1));
  return {
    type: "Feature",
    properties: {
      recordIndex: index,
      buildingId: metadata?.ids?.[index] || index + 1,
      blockId: metadata?.blockIds?.[index] || null,
      floors,
      heightM,
      heightSource: metadata ? "dbf" : "estimado",
      footprintM2: estimate.footprintM2,
      centroid: estimate.centroid,
      bounds: estimate.bounds,
    },
    geometry,
  };
}

function createParcelFeature(geometry, index) {
  const estimate = estimateMetrics(geometry);
  return {
    type: "Feature",
    properties: {
      parcelIndex: index + 1,
      bounds: estimate.bounds,
    },
    geometry,
  };
}

function getPreviewIndexes(total, target = 3200) {
  if (!Number.isFinite(total) || total <= 0) {
    return [];
  }
  if (total <= target) {
    return Array.from({ length: total }, (_, index) => index);
  }

  const stride = Math.max(1, Math.ceil(total / target));
  const indexes = [];
  for (let index = 0; index < total; index += stride) {
    indexes.push(index);
  }
  if (indexes[indexes.length - 1] !== total - 1) {
    indexes.push(total - 1);
  }
  return indexes;
}

async function loadShapefile(basePath) {
  const [shpResponse, prjResponse] = await Promise.all([
    fetch(`${basePath}.shp`),
    fetch(`${basePath}.prj`),
  ]);

  if (!shpResponse.ok) {
    throw new Error(`No se pudo cargar ${basePath}.shp (${shpResponse.status}).`);
  }
  if (!prjResponse.ok) {
    throw new Error(`No se pudo cargar ${basePath}.prj (${prjResponse.status}).`);
  }

  const [shpBuffer, prjText] = await Promise.all([
    shpResponse.arrayBuffer(),
    prjResponse.text(),
  ]);

  return self.shp.parseShp(shpBuffer, prjText);
}

async function buildDataset(payload) {
  const {
    requestId,
    datasetKey,
    basePath,
    metadata,
    previewTarget = 0,
    batchSize = 1200,
  } = payload;

  const geometries = await loadShapefile(basePath);
  const geometryList = getGeometryList(geometries);
  const total = geometryList.length;

  if (datasetKey === "buildings" && previewTarget > 0 && total > previewTarget) {
    const previewIndexes = getPreviewIndexes(total, previewTarget);
    const previewFeatures = previewIndexes.map((index) =>
      createBuildingFeature(geometryList[index], index, metadata)
    );
    self.postMessage({
      type: "preview",
      requestId,
      datasetKey,
      total,
      previewCount: previewFeatures.length,
      collection: {
        type: "FeatureCollection",
        features: previewFeatures,
      },
    });
  }

  const features = [];
  for (let index = 0; index < total; index += 1) {
    const geometry = geometryList[index];
    if (!geometry) {
      continue;
    }

    features.push(
      datasetKey === "buildings"
        ? createBuildingFeature(geometry, index, metadata)
        : createParcelFeature(geometry, index)
    );

    const loaded = index + 1;
    if (loaded % batchSize === 0 || loaded === total) {
      self.postMessage({
        type: "progress",
        requestId,
        datasetKey,
        loaded,
        total,
      });
    }
  }

  self.postMessage({
    type: "complete",
    requestId,
    datasetKey,
    total,
    collection: {
      type: "FeatureCollection",
      features,
    },
  });
}

self.onmessage = (event) => {
  const payload = event.data || {};
  if (payload.type !== "buildDataset") {
    return;
  }

  buildDataset(payload).catch((error) => {
    self.postMessage({
      type: "error",
      requestId: payload.requestId,
      datasetKey: payload.datasetKey,
      message: error?.message || "Fallo el worker del visor 3D.",
    });
  });
};
