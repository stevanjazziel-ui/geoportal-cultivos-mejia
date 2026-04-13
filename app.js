const localeDate = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const layerCatalog = [
  {
    group: "Contexto territorial",
    items: [
      {
        id: "parroquias",
        title: "Parroquias productivas",
        description: "Division referencial del canton para consultas agronomicas y extension rural.",
      },
      {
        id: "vias",
        title: "Vias de acceso",
        description: "Conectividad vial principal para entrada a lotes y logistica de cosecha.",
      },
      {
        id: "canales",
        title: "Canales y acequias",
        description: "Infraestructura lineal de riego de ejemplo.",
      },
    ],
  },
  {
    group: "Planeamiento territorial",
    items: [
      {
        id: "manchaUrbana",
        title: "Mancha urbana 2026",
        description: "Huella urbana sintetica con nodos de crecimiento para el modulo de planificacion.",
      },
      {
        id: "equipamientos",
        title: "Equipamientos existentes",
        description: "Escuelas, salud y servicios de apoyo para medir deficit territorial.",
      },
    ],
  },
  {
    group: "Operacion agricola",
    items: [
      {
        id: "lotes",
        title: "Lotes de referencia",
        description: "Parcelas demostrativas para pruebas de analisis intralote.",
      },
      {
        id: "estaciones",
        title: "Estaciones meteo",
        description: "Puntos de monitoreo para clima agricola y calibracion de campo.",
      },
    ],
  },
];

const demoImagesBySensor = {
  sentinel2: [
    {
      id: "S2A-2026-04-04",
      sensorId: "sentinel2",
      title: "Sentinel-2A / Orbita 039",
      date: "2026-04-04",
      cloud: 8,
      orbit: "R039",
      note: "Ventana limpia para monitoreo vegetativo en el eje Machachi - Aloag.",
      baseIndices: { NDVI: 0.72, NDWI: 0.23, NDRE: 0.41, MSAVI: 0.67 },
    },
    {
      id: "S2B-2026-03-20",
      sensorId: "sentinel2",
      title: "Sentinel-2B / Orbita 132",
      date: "2026-03-20",
      cloud: 15,
      orbit: "R132",
      note: "Escena util para revisar vigor pos siembra y humedad superficial.",
      baseIndices: { NDVI: 0.66, NDWI: 0.19, NDRE: 0.37, MSAVI: 0.61 },
    },
    {
      id: "S2A-2026-03-02",
      sensorId: "sentinel2",
      title: "Sentinel-2A / Orbita 039",
      date: "2026-03-02",
      cloud: 22,
      orbit: "R039",
      note: "Nubosidad media con buena lectura sobre la zona central del canton.",
      baseIndices: { NDVI: 0.61, NDWI: 0.17, NDRE: 0.34, MSAVI: 0.57 },
    },
    {
      id: "S2B-2026-02-14",
      sensorId: "sentinel2",
      title: "Sentinel-2B / Orbita 132",
      date: "2026-02-14",
      cloud: 31,
      orbit: "R132",
      note: "Escena util para comparar recuperacion vegetativa entre lotes.",
      baseIndices: { NDVI: 0.58, NDWI: 0.11, NDRE: 0.3, MSAVI: 0.52 },
    },
    {
      id: "S2A-2026-01-27",
      sensorId: "sentinel2",
      title: "Sentinel-2A / Orbita 039",
      date: "2026-01-27",
      cloud: 42,
      orbit: "R039",
      note: "Mayor nubosidad; sirve como respaldo para historico.",
      baseIndices: { NDVI: 0.55, NDWI: 0.14, NDRE: 0.28, MSAVI: 0.48 },
    },
    {
      id: "S2B-2025-12-18",
      sensorId: "sentinel2",
      title: "Sentinel-2B / Orbita 132",
      date: "2025-12-18",
      cloud: 12,
      orbit: "R132",
      note: "Buena referencia para revisar trazas de humedad y drenaje.",
      baseIndices: { NDVI: 0.64, NDWI: 0.26, NDRE: 0.36, MSAVI: 0.59 },
    },
  ],
  landsat: [
    {
      id: "L9-2026-04-02",
      sensorId: "landsat",
      title: "Landsat 9 / Path 010 Row 061",
      date: "2026-04-02",
      cloud: 18,
      orbit: "P010 R061",
      note: "Optica de 30 m para contraste regional de vigor, humedad y cobertura.",
      baseIndices: { NDVI: 0.67, NDMI: 0.18, NDWI: 0.11, MSAVI: 0.6 },
    },
    {
      id: "L8-2026-03-17",
      sensorId: "landsat",
      title: "Landsat 8 / Path 010 Row 061",
      date: "2026-03-17",
      cloud: 24,
      orbit: "P010 R061",
      note: "Escena util para seguir humedad estructural y respuesta vegetativa de fondo.",
      baseIndices: { NDVI: 0.62, NDMI: 0.15, NDWI: 0.08, MSAVI: 0.55 },
    },
    {
      id: "L9-2026-02-25",
      sensorId: "landsat",
      title: "Landsat 9 / Path 010 Row 061",
      date: "2026-02-25",
      cloud: 33,
      orbit: "P010 R061",
      note: "Lectura de soporte para ventana humeda con comparacion multitemporal.",
      baseIndices: { NDVI: 0.58, NDMI: 0.12, NDWI: 0.06, MSAVI: 0.52 },
    },
    {
      id: "L8-2026-01-12",
      sensorId: "landsat",
      title: "Landsat 8 / Path 010 Row 061",
      date: "2026-01-12",
      cloud: 27,
      orbit: "P010 R061",
      note: "Historico optico para revisar recuperacion y homogeneidad del cultivo.",
      baseIndices: { NDVI: 0.56, NDMI: 0.1, NDWI: 0.05, MSAVI: 0.49 },
    },
  ],
  sentinel1: [
    {
      id: "S1C-2026-04-09",
      sensorId: "sentinel1",
      title: "Sentinel-1C / IW Descendente",
      date: "2026-04-09",
      cloud: null,
      orbit: "DESC",
      orbitState: "descending",
      instrumentMode: "IW",
      polarizations: ["VV", "VH"],
      note: "Radar de paso descendente para lectura estructural aun con nubes.",
      baseIndices: { RVI: 0.56, VH_VV: 0.44, VV: -10.8, VH: -17.2 },
    },
    {
      id: "S1C-2026-03-28",
      sensorId: "sentinel1",
      title: "Sentinel-1C / IW Ascendente",
      date: "2026-03-28",
      cloud: null,
      orbit: "ASC",
      orbitState: "ascending",
      instrumentMode: "IW",
      polarizations: ["VV", "VH"],
      note: "Radar de apoyo para comparar textura, humedad relativa y estructura del dosel.",
      baseIndices: { RVI: 0.51, VH_VV: 0.41, VV: -11.6, VH: -18.4 },
    },
    {
      id: "S1A-2026-03-16",
      sensorId: "sentinel1",
      title: "Sentinel-1A / IW Descendente",
      date: "2026-03-16",
      cloud: null,
      orbit: "DESC",
      orbitState: "descending",
      instrumentMode: "IW",
      polarizations: ["VV", "VH"],
      note: "Escena radar de contraste para seguimiento estructural multitemporal.",
      baseIndices: { RVI: 0.47, VH_VV: 0.38, VV: -12.2, VH: -19.3 },
    },
    {
      id: "S1A-2026-02-27",
      sensorId: "sentinel1",
      title: "Sentinel-1A / IW Ascendente",
      date: "2026-02-27",
      cloud: null,
      orbit: "ASC",
      orbitState: "ascending",
      instrumentMode: "IW",
      polarizations: ["VV", "VH"],
      note: "Historico radar para detectar persistencia de humedad y cambios de cobertura.",
      baseIndices: { RVI: 0.43, VH_VV: 0.35, VV: -12.9, VH: -20.1 },
    },
  ],
};

const sentinelService = {
  catalogUrl: "https://stac.dataspace.copernicus.eu/v1",
  collection: "sentinel-2-l2a",
  limit: 18,
  fields: [
    "id",
    "geometry",
    "bbox",
    "collection",
    "assets.thumbnail",
    "properties.datetime",
    "properties.eo:cloud_cover",
    "properties.grid:code",
    "properties.platform",
    "properties.sat:relative_orbit",
    "properties.processing:level",
    "properties.product:timeliness_category",
  ],
};

const earthSearchService = {
  catalogUrl: "https://earth-search.aws.element84.com/v1",
  limit: 18,
};

const backendService = {
  healthPath: "/api/health",
  searchPath: "/api/stac/search",
  analysisPath: "/api/indices/analyze",
  defaultOrigins: ["http://127.0.0.1:8765", "http://localhost:8765"],
};

const exactSceneCache = new Map();
const exactSceneMatchCache = new Map();

const indexConfig = {
  NDVI: {
    label: "NDVI",
    min: 0,
    max: 1,
    unit: "",
    colors: ["#6a2f1a", "#d9b14d", "#7fbf6b", "#1f6d43"],
    description: "Vigor vegetativo y biomasa foliar.",
  },
  NDWI: {
    label: "NDWI",
    min: -0.2,
    max: 0.6,
    unit: "",
    colors: ["#6d4526", "#d1b256", "#77c8d8", "#16647a"],
    description: "Humedad del dosel y condiciones de agua superficial.",
  },
  NDMI: {
    label: "NDMI",
    min: -0.2,
    max: 0.6,
    unit: "",
    colors: ["#7f4f2b", "#d1aa5d", "#74b9a6", "#1b5e55"],
    description: "Humedad foliar y retencion de agua usando NIR y SWIR.",
  },
  NDRE: {
    label: "NDRE",
    min: 0,
    max: 0.6,
    unit: "",
    colors: ["#7a3557", "#c8746e", "#7db070", "#215b39"],
    description: "Estado del cultivo y respuesta clorofilica.",
  },
  MSAVI: {
    label: "MSAVI",
    min: 0,
    max: 1,
    unit: "",
    colors: ["#834529", "#d2953a", "#9bbb5b", "#2c6d46"],
    description: "Cobertura de suelo y vigor con reduccion del efecto del fondo.",
  },
  VV: {
    label: "VV",
    min: -22,
    max: -5,
    unit: " dB",
    colors: ["#0d2744", "#335f8b", "#75a9c6", "#e4f3fa"],
    description: "Retrodispersion radar co-polarizada sensible a estructura y rugosidad.",
  },
  VH: {
    label: "VH",
    min: -30,
    max: -10,
    unit: " dB",
    colors: ["#1b203f", "#4b5f8b", "#86a5c7", "#eef6fc"],
    description: "Retrodispersion cruzada asociada a volumen vegetal y humedad.",
  },
  RVI: {
    label: "RVI",
    min: 0,
    max: 1,
    unit: "",
    colors: ["#5d2d2a", "#c26f58", "#9ebc7a", "#2a6c50"],
    description: "Radar Vegetation Index para estructura y cobertura del cultivo.",
  },
  VH_VV: {
    label: "VH/VV",
    min: 0.1,
    max: 0.8,
    unit: "",
    colors: ["#412f56", "#8072ab", "#84b9b0", "#1b6a63"],
    description: "Relacion cruzada/co-polarizada util para humedad y densidad estructural.",
  },
};

const sensorCatalog = {
  sentinel2: {
    id: "sentinel2",
    label: "Sentinel-2",
    longLabel: "Sentinel-2 MSI",
    providerLabel: "Copernicus STAC",
    directProviderLabel: "CDSE STAC",
    searchProvider: "copernicus",
    collection: "sentinel-2-l2a",
    earthSearchCollection: "sentinel-2-l2a",
    limit: 18,
    indices: ["NDVI", "NDWI", "NDRE", "MSAVI"],
    defaultIndex: "NDVI",
    focusIndex: "NDVI",
    moistureIndex: "NDWI",
    zoneIndex: "NDVI",
    directionIndex: "NDVI",
    cloudEnabled: true,
    backendEligible: true,
    exactRaster: true,
    sceneResolutionLabel: "10 m",
    sensorTone: "sentinel2",
    footprintStyle: {
      color: "#3a6f8f",
      fillColor: "#3a6f8f",
      fillOpacity: 0.08,
      dashArray: "10 8",
    },
    previewFilter: "saturate(1.18) contrast(1.12) brightness(1.05)",
    demoImages: demoImagesBySensor.sentinel2,
    previewAssetKeys: ["thumbnail"],
    supportNote: "Sentinel-2 mantiene el flujo mas completo: NDVI, NDWI, NDRE, MSAVI y raster exacto a 10 m cuando existe COG publico coincidente.",
  },
  landsat: {
    id: "landsat",
    label: "Landsat 8/9",
    longLabel: "Landsat Collection 2 Level-2",
    providerLabel: "Earth Search",
    directProviderLabel: "Earth Search",
    searchProvider: "earth-search",
    collection: "landsat-c2-l2",
    limit: 18,
    indices: ["NDVI", "NDMI", "NDWI", "MSAVI"],
    defaultIndex: "NDVI",
    focusIndex: "NDVI",
    moistureIndex: "NDMI",
    zoneIndex: "NDVI",
    directionIndex: "NDVI",
    cloudEnabled: true,
    backendEligible: false,
    exactRaster: false,
    sceneResolutionLabel: "30 m",
    sensorTone: "landsat",
    footprintStyle: {
      color: "#9f7135",
      fillColor: "#c69344",
      fillOpacity: 0.08,
      dashArray: "12 8",
    },
    previewFilter: "saturate(1.22) contrast(1.12) brightness(1.05)",
    demoImages: demoImagesBySensor.landsat,
    previewAssetKeys: ["reduced_resolution_browse", "thumbnail"],
    supportNote: "Landsat 8/9 aporta analisis optico a 30 m con NDVI, NDMI, NDWI y MSAVI. NDRE no aplica porque Landsat no tiene banda red-edge.",
  },
  sentinel1: {
    id: "sentinel1",
    label: "Sentinel-1 GRD",
    longLabel: "Sentinel-1 GRD SAR",
    providerLabel: "Earth Search",
    directProviderLabel: "Earth Search",
    searchProvider: "earth-search",
    collection: "sentinel-1-grd",
    limit: 18,
    indices: ["RVI", "VH_VV", "VV", "VH"],
    defaultIndex: "RVI",
    focusIndex: "RVI",
    moistureIndex: "VH_VV",
    zoneIndex: "RVI",
    directionIndex: "RVI",
    cloudEnabled: false,
    backendEligible: false,
    exactRaster: false,
    sceneResolutionLabel: "SAR",
    sensorTone: "sentinel1",
    footprintStyle: {
      color: "#4a6f96",
      fillColor: "#4a6f96",
      fillOpacity: 0.08,
      dashArray: "8 6",
    },
    previewFilter: "grayscale(0.78) contrast(1.28) brightness(1.1)",
    demoImages: demoImagesBySensor.sentinel1,
    previewAssetKeys: ["thumbnail"],
    supportNote: "Sentinel-1 es radar: atraviesa nubes y trabaja con VV, VH, RVI y VH/VV para lectura estructural y de humedad relativa.",
  },
};

const wizardConfig = {
  Siembra: [
    {
      title: "Preparar el lote",
      body: "Revisa relieve, pendientes y sectores con mayor riesgo de anegamiento antes de definir mecanizacion y drenajes.",
      action: "dem",
      buttonLabel: "Preparar lote",
    },
    {
      title: "Cruzar humedad y temperatura",
      body: "Consulta el indice de humedad disponible, lluvia acumulada y temperatura superficial para decidir ventana de siembra.",
      action: "climate",
      buttonLabel: "Cruzar clima",
    },
    {
      title: "Definir zonas de manejo",
      body: "Segmenta el lote para dosificar densidad, fertilizacion de arranque y riego segun variabilidad interna.",
      action: "intralote",
      buttonLabel: "Definir zonas",
    },
    {
      title: "Emitir plan operativo",
      body: "Consolida pasos de campo, insumos y verificaciones para la cuadrilla agronomica.",
      action: "report",
      buttonLabel: "Emitir plan",
    },
  ],
  Monitoreo: [
    {
      title: "Buscar la escena mas reciente",
      body: "Filtra la escena mas reciente y selecciona el indice o metrica mas util para el estado fenologico actual.",
      action: "scene",
      buttonLabel: "Activar escena",
    },
    {
      title: "Localizar alertas intralote",
      body: "Identifica zonas de menor vigor o humedad dispar para priorizar visitas de inspeccion.",
      action: "intralote",
      buttonLabel: "Detectar alertas",
    },
    {
      title: "Cruzar clima y termica",
      body: "Analiza lluvia, amplitud termica y temperatura superficial para detectar estres o retrasos.",
      action: "climate",
      buttonLabel: "Cruzar clima",
    },
    {
      title: "Cerrar recomendaciones",
      body: "Resume acciones de fertilizacion, riego o control fitosanitario por sector.",
      action: "report",
      buttonLabel: "Cerrar recomendaciones",
    },
  ],
  Cosecha: [
    {
      title: "Evaluar acceso y pendientes",
      body: "Verifica topografia, vias y sectores blandos para planificar ingreso de maquinaria.",
      action: "dem",
      buttonLabel: "Evaluar acceso",
    },
    {
      title: "Revisar madurez heterogenea",
      body: "Usa las metricas disponibles para ubicar diferencias de desarrollo que puedan requerir cosecha escalonada.",
      action: "intralote",
      buttonLabel: "Revisar madurez",
    },
    {
      title: "Cruzar clima de corto plazo",
      body: "Consulta lluvia y temperatura para minimizar perdidas en el corte y el transporte.",
      action: "climate",
      buttonLabel: "Cruzar clima",
    },
    {
      title: "Definir ruta de cosecha",
      body: "Ordena lotes y sectores segun prioridad agronomica y condicion operativa.",
      action: "report",
      buttonLabel: "Definir ruta",
    },
  ],
  Diagnostico: [
    {
      title: "Delimitar el problema",
      body: "Selecciona el lote afectado y compara indices para acotar si el sintoma parece hidrico, nutricional o estructural.",
      action: "intralote",
      buttonLabel: "Delimitar problema",
    },
    {
      title: "Analizar relieve y drenaje",
      body: "Contrasta pendiente y riesgo de anegamiento para descartar o confirmar problemas topograficos.",
      action: "dem",
      buttonLabel: "Analizar relieve",
    },
    {
      title: "Cruzar clima y temperatura",
      body: "Busca anomalias termicas y eventos de lluvia que expliquen la respuesta del cultivo.",
      action: "climate",
      buttonLabel: "Cruzar clima",
    },
    {
      title: "Priorizar salida a campo",
      body: "Genera una ruta de inspeccion y checklist para validar la hipotesis en sitio.",
      action: "report",
      buttonLabel: "Generar checklist",
    },
  ],
};

const studyArea = {
  type: "Feature",
  properties: { name: "Canton Mejia" },
  geometry: {
    type: "Polygon",
    coordinates: [[
      [-78.735, -0.384],
      [-78.648, -0.374],
      [-78.548, -0.396],
      [-78.452, -0.442],
      [-78.41, -0.515],
      [-78.432, -0.607],
      [-78.512, -0.651],
      [-78.628, -0.646],
      [-78.724, -0.585],
      [-78.759, -0.472],
      [-78.735, -0.384],
    ]],
  },
};

const geoSources = {
  parroquias: {
    type: "FeatureCollection",
    features: [
      polygonFeature("Machachi", [
        [-78.64, -0.425],
        [-78.57, -0.412],
        [-78.53, -0.458],
        [-78.55, -0.512],
        [-78.63, -0.51],
        [-78.66, -0.46],
      ], { category: "parroquia" }),
      polygonFeature("Tambillo", [
        [-78.58, -0.405],
        [-78.49, -0.422],
        [-78.46, -0.468],
        [-78.53, -0.498],
        [-78.59, -0.472],
      ], { category: "parroquia" }),
      polygonFeature("Aloag", [
        [-78.71, -0.43],
        [-78.63, -0.428],
        [-78.62, -0.49],
        [-78.68, -0.53],
        [-78.74, -0.484],
      ], { category: "parroquia" }),
    ],
  },
  vias: {
    type: "FeatureCollection",
    features: [
      lineFeature("Eje Panamericana", [
        [-78.69, -0.39],
        [-78.64, -0.43],
        [-78.58, -0.48],
        [-78.52, -0.54],
      ], { category: "vial" }),
      lineFeature("Acceso oriental", [
        [-78.57, -0.43],
        [-78.51, -0.45],
        [-78.46, -0.49],
      ], { category: "vial" }),
    ],
  },
  canales: {
    type: "FeatureCollection",
    features: [
      lineFeature("Canal norte", [
        [-78.68, -0.45],
        [-78.62, -0.46],
        [-78.56, -0.49],
        [-78.49, -0.52],
      ], { category: "hidrico" }),
      lineFeature("Acequia sur", [
        [-78.66, -0.57],
        [-78.61, -0.55],
        [-78.54, -0.56],
        [-78.47, -0.58],
      ], { category: "hidrico" }),
    ],
  },
  lotes: {
    type: "FeatureCollection",
    features: [
      polygonFeature("Lote Papa San Jose", [
        [-78.618, -0.49],
        [-78.603, -0.488],
        [-78.598, -0.503],
        [-78.612, -0.511],
        [-78.623, -0.503],
      ], {
        category: "lote",
        crop: "Papa",
        owner: "Unidad demostrativa norte",
      }),
      polygonFeature("Lote Maiz El Chaupi", [
        [-78.561, -0.461],
        [-78.544, -0.462],
        [-78.538, -0.478],
        [-78.552, -0.486],
        [-78.566, -0.475],
      ], {
        category: "lote",
        crop: "Maiz",
        owner: "Productores del corredor central",
      }),
      polygonFeature("Lote Pasto Aloag", [
        [-78.681, -0.474],
        [-78.663, -0.471],
        [-78.655, -0.489],
        [-78.673, -0.502],
        [-78.688, -0.49],
      ], {
        category: "lote",
        crop: "Pasto",
        owner: "Bloque ganadero oeste",
      }),
    ],
  },
  estaciones: {
    type: "FeatureCollection",
    features: [
      pointFeature("EMA Machachi", [-78.58, -0.49], { category: "meteo" }),
      pointFeature("EMA Aloag", [-78.68, -0.47], { category: "meteo" }),
      pointFeature("EMA Tambillo", [-78.52, -0.45], { category: "meteo" }),
    ],
  },
  manchaUrbana: {
    type: "FeatureCollection",
    features: [
      polygonFeature("Machachi", [
        [-78.608, -0.495],
        [-78.584, -0.489],
        [-78.566, -0.503],
        [-78.568, -0.523],
        [-78.589, -0.53],
        [-78.611, -0.517],
      ], {
        category: "urbano",
        growthRate: 0.91,
        hierarchy: "primario",
      }),
      polygonFeature("Tambillo", [
        [-78.553, -0.444],
        [-78.532, -0.441],
        [-78.521, -0.456],
        [-78.528, -0.472],
        [-78.548, -0.474],
        [-78.559, -0.459],
      ], {
        category: "urbano",
        growthRate: 0.82,
        hierarchy: "subcentro",
      }),
      polygonFeature("Aloag", [
        [-78.707, -0.425],
        [-78.688, -0.423],
        [-78.677, -0.438],
        [-78.685, -0.454],
        [-78.704, -0.456],
        [-78.713, -0.441],
      ], {
        category: "urbano",
        growthRate: 0.74,
        hierarchy: "subcentro",
      }),
      polygonFeature("Aloasi", [
        [-78.635, -0.535],
        [-78.618, -0.532],
        [-78.607, -0.545],
        [-78.612, -0.561],
        [-78.629, -0.564],
        [-78.641, -0.55],
      ], {
        category: "urbano",
        growthRate: 0.68,
        hierarchy: "barrial",
      }),
      polygonFeature("El Chaupi", [
        [-78.662, -0.57],
        [-78.645, -0.567],
        [-78.636, -0.581],
        [-78.642, -0.595],
        [-78.658, -0.598],
        [-78.67, -0.584],
      ], {
        category: "urbano",
        growthRate: 0.62,
        hierarchy: "barrial",
      }),
    ],
  },
  equipamientos: {
    type: "FeatureCollection",
    features: [
      pointFeature("Hospital Basico Machachi", [-78.589, -0.507], {
        category: "equipamiento",
        serviceType: "hospital",
        level: "canton",
      }),
      pointFeature("Centro de Salud Tambillo", [-78.539, -0.455], {
        category: "equipamiento",
        serviceType: "hospital",
        level: "parroquial",
      }),
      pointFeature("Unidad Educativa Mejia", [-78.582, -0.5], {
        category: "equipamiento",
        serviceType: "escuela",
        level: "canton",
      }),
      pointFeature("Unidad Educativa Aloag", [-78.693, -0.437], {
        category: "equipamiento",
        serviceType: "escuela",
        level: "parroquial",
      }),
      pointFeature("Mercado y servicios Machachi", [-78.577, -0.515], {
        category: "equipamiento",
        serviceType: "equipamiento",
        level: "central",
      }),
      pointFeature("Centro barrial El Chaupi", [-78.651, -0.582], {
        category: "equipamiento",
        serviceType: "equipamiento",
        level: "barrial",
      }),
      pointFeature("Nodo comunitario Tambillo", [-78.533, -0.463], {
        category: "equipamiento",
        serviceType: "equipamiento",
        level: "barrial",
      }),
    ],
  },
};

const layerStyles = {
  parroquias: {
    color: "#7b4e39",
    weight: 2,
    fillColor: "#d7b285",
    fillOpacity: 0.12,
  },
  vias: {
    color: "#5b402f",
    weight: 3,
    opacity: 0.9,
    dashArray: "8 8",
  },
  canales: {
    color: "#28748a",
    weight: 3,
    opacity: 0.9,
  },
  lotes: {
    color: "#21704d",
    weight: 2,
    fillColor: "#4bb381",
    fillOpacity: 0.18,
  },
  manchaUrbana: {
    color: "#a15d42",
    weight: 1.4,
    fillColor: "#d7a56a",
    fillOpacity: 0.18,
  },
  estaciones: {},
  equipamientos: {},
};

const planningProgramCatalog = {
  vis: {
    id: "vis",
    label: "VIS",
    longLabel: "Vivienda de interes social",
    targetServiceLabel: "servicios base",
    markerColor: "#b45d3f",
    maxSlope: 12,
    weights: {
      growth: 0.27,
      access: 0.19,
      terrain: 0.14,
      service: 0.16,
      resilience: 0.12,
      land: 0.12,
    },
    urbanDistance: {
      idealMin: 0.2,
      idealMax: 1.8,
      hardMax: 4.8,
      insideScore: 0.32,
    },
    accessDistance: {
      idealMin: 0.05,
      idealMax: 0.7,
      hardMax: 2.2,
    },
  },
  escuela: {
    id: "escuela",
    label: "Escuela",
    longLabel: "Escuela",
    targetServiceLabel: "cobertura educativa",
    markerColor: "#cb9440",
    maxSlope: 11,
    weights: {
      growth: 0.22,
      access: 0.18,
      terrain: 0.13,
      service: 0.23,
      resilience: 0.14,
      land: 0.1,
    },
    urbanDistance: {
      idealMin: 0,
      idealMax: 1.5,
      hardMax: 4.2,
      insideScore: 0.72,
    },
    accessDistance: {
      idealMin: 0.05,
      idealMax: 0.65,
      hardMax: 1.8,
    },
  },
  hospital: {
    id: "hospital",
    label: "Hospital",
    longLabel: "Hospital",
    targetServiceLabel: "cobertura de salud",
    markerColor: "#8f4b60",
    maxSlope: 9,
    weights: {
      growth: 0.18,
      access: 0.25,
      terrain: 0.13,
      service: 0.22,
      resilience: 0.16,
      land: 0.06,
    },
    urbanDistance: {
      idealMin: 0,
      idealMax: 2.1,
      hardMax: 5.4,
      insideScore: 0.84,
    },
    accessDistance: {
      idealMin: 0.03,
      idealMax: 0.5,
      hardMax: 1.5,
    },
  },
  equipamiento: {
    id: "equipamiento",
    label: "Equipamiento",
    longLabel: "Equipamiento barrial",
    targetServiceLabel: "equipamiento barrial",
    markerColor: "#2f7f5f",
    maxSlope: 12,
    weights: {
      growth: 0.24,
      access: 0.18,
      terrain: 0.13,
      service: 0.21,
      resilience: 0.12,
      land: 0.12,
    },
    urbanDistance: {
      idealMin: 0,
      idealMax: 1.6,
      hardMax: 4.4,
      insideScore: 0.68,
    },
    accessDistance: {
      idealMin: 0.05,
      idealMax: 0.6,
      hardMax: 1.9,
    },
  },
};

const planningHorizonCatalog = {
  corto: {
    id: "corto",
    label: "Corto plazo 2026-2028",
    demandBoost: 0.1,
    expansionShift: 0.4,
  },
  medio: {
    id: "medio",
    label: "Mediano plazo 2028-2032",
    demandBoost: 0.18,
    expansionShift: 0.9,
  },
  largo: {
    id: "largo",
    label: "Reserva 2032-2038",
    demandBoost: 0.27,
    expansionShift: 1.35,
  },
};

const planningScenarioCatalog = {
  conservador: {
    id: "conservador",
    label: "Conservador",
    growthMultiplier: 0.88,
    corridorBoost: 0.92,
    reserveSensitivity: 1.18,
  },
  balanceado: {
    id: "balanceado",
    label: "Balanceado",
    growthMultiplier: 1,
    corridorBoost: 1,
    reserveSensitivity: 1,
  },
  expansivo: {
    id: "expansivo",
    label: "Expansivo",
    growthMultiplier: 1.14,
    corridorBoost: 1.1,
    reserveSensitivity: 0.82,
  },
};

const planningVariableCatalog = {
  urbanFootprint: {
    id: "urbanFootprint",
    label: "Huella urbana",
    role: "Crecimiento",
    copy: "Lee continuidad construida, vacios urbanos y consolidacion del borde.",
    tone: "growth",
    emphasis: "Alta",
  },
  periurbanTransition: {
    id: "periurbanTransition",
    label: "Borde periurbano",
    role: "Expansion",
    copy: "Ubica franjas de transicion aptas para crecimiento controlado.",
    tone: "growth",
    emphasis: "Alta",
  },
  historicalExpansion: {
    id: "historicalExpansion",
    label: "Trayectoria historica",
    role: "Cambio",
    copy: "Resume direccion y persistencia de la expansion urbana en el tiempo.",
    tone: "growth",
    emphasis: "Alta",
  },
  floodSafety: {
    id: "floodSafety",
    label: "Seguridad hidrica",
    role: "Resiliencia",
    copy: "Reduce penalizacion por anegamiento, drenaje y cercania a cauces.",
    tone: "resilience",
    emphasis: "Media",
  },
  serviceCentrality: {
    id: "serviceCentrality",
    label: "Centralidad de servicios",
    role: "Cobertura",
    copy: "Acerca la decision a nodos funcionales con equipamientos y demanda.",
    tone: "service",
    emphasis: "Media",
  },
  corridorAccessibility: {
    id: "corridorAccessibility",
    label: "Accesibilidad vial",
    role: "Acceso",
    copy: "Favorece conexiones con corredores, avenidas y ejes urbanos.",
    tone: "access",
    emphasis: "Alta",
  },
  reserveCompatibility: {
    id: "reserveCompatibility",
    label: "Compatibilidad de ocupacion",
    role: "Reserva",
    copy: "Favorece implantacion controlada con menor conflicto territorial.",
    tone: "land",
    emphasis: "Alta",
  },
  structuralContinuity: {
    id: "structuralContinuity",
    label: "Continuidad estructural",
    role: "Ocupacion",
    copy: "Lee textura construida y continuidad del tejido aun con nubosidad.",
    tone: "growth",
    emphasis: "Alta",
  },
  nightActivity: {
    id: "nightActivity",
    label: "Actividad nocturna",
    role: "Centralidad",
    copy: "Revela intensidad urbana, corredores activos y deficit funcional.",
    tone: "service",
    emphasis: "Media",
  },
};

const planningImageryCatalog = {
  sentinel2Urban: {
    id: "sentinel2Urban",
    label: "Sentinel-2 urbano 10 m",
    shortLabel: "Sentinel-2",
    providerLabel: "Copernicus Sentinel-2 L2A",
    spatialLabel: "10 m",
    temporalLabel: "5 dias",
    useCopy: "La mejor base abierta para seguir expansion urbana, borde periurbano, cobertura y vacios de suelo.",
    growthBias: 1.08,
    serviceBias: 0.96,
    resilienceBias: 0.94,
    reserveBias: 1,
    variables: [
      "urbanFootprint",
      "periurbanTransition",
      "corridorAccessibility",
      "floodSafety",
      "reserveCompatibility",
    ],
    signalMix: {
      growth: {
        urbanFootprint: 0.34,
        periurbanTransition: 0.4,
        corridorAccessibility: 0.12,
        reserveCompatibility: 0.14,
      },
      access: {
        corridorAccessibility: 0.52,
        urbanFootprint: 0.2,
        periurbanTransition: 0.28,
      },
      service: {
        urbanFootprint: 0.2,
        periurbanTransition: 0.24,
        corridorAccessibility: 0.26,
        reserveCompatibility: 0.3,
      },
      resilience: {
        floodSafety: 0.58,
        reserveCompatibility: 0.24,
        periurbanTransition: 0.18,
      },
      land: {
        reserveCompatibility: 0.46,
        floodSafety: 0.26,
        periurbanTransition: 0.28,
      },
    },
  },
  landsatHistoric: {
    id: "landsatHistoric",
    label: "Landsat historico 30 m",
    shortLabel: "Landsat",
    providerLabel: "USGS/NASA Landsat Collection 2",
    spatialLabel: "30 m",
    temporalLabel: "serie 2013-actual",
    useCopy: "Sirve para medir cambio de mancha urbana en serie larga y comparar periodos de expansion territorial.",
    growthBias: 1.16,
    serviceBias: 0.9,
    resilienceBias: 0.92,
    reserveBias: 1.08,
    variables: [
      "historicalExpansion",
      "periurbanTransition",
      "corridorAccessibility",
      "floodSafety",
      "reserveCompatibility",
    ],
    signalMix: {
      growth: {
        historicalExpansion: 0.48,
        periurbanTransition: 0.26,
        corridorAccessibility: 0.14,
        reserveCompatibility: 0.12,
      },
      access: {
        corridorAccessibility: 0.46,
        periurbanTransition: 0.2,
        historicalExpansion: 0.2,
        reserveCompatibility: 0.14,
      },
      service: {
        historicalExpansion: 0.28,
        corridorAccessibility: 0.32,
        reserveCompatibility: 0.16,
        floodSafety: 0.24,
      },
      resilience: {
        floodSafety: 0.54,
        reserveCompatibility: 0.22,
        historicalExpansion: 0.24,
      },
      land: {
        reserveCompatibility: 0.44,
        historicalExpansion: 0.24,
        floodSafety: 0.14,
        periurbanTransition: 0.18,
      },
    },
  },
  sentinel1Urban: {
    id: "sentinel1Urban",
    label: "Sentinel-1 radar urbano",
    shortLabel: "Sentinel-1",
    providerLabel: "Copernicus Sentinel-1 GRD",
    spatialLabel: "SAR",
    temporalLabel: "6-12 dias",
    useCopy: "Conviene para ocupacion urbana, humedad superficial e inundacion aun con nubes o mala visibilidad.",
    growthBias: 0.94,
    serviceBias: 0.88,
    resilienceBias: 1.18,
    reserveBias: 0.96,
    variables: [
      "structuralContinuity",
      "corridorAccessibility",
      "floodSafety",
      "reserveCompatibility",
      "serviceCentrality",
    ],
    signalMix: {
      growth: {
        structuralContinuity: 0.42,
        corridorAccessibility: 0.24,
        reserveCompatibility: 0.18,
        floodSafety: 0.16,
      },
      access: {
        corridorAccessibility: 0.48,
        structuralContinuity: 0.28,
        reserveCompatibility: 0.24,
      },
      service: {
        structuralContinuity: 0.26,
        corridorAccessibility: 0.3,
        reserveCompatibility: 0.22,
        serviceCentrality: 0.22,
      },
      resilience: {
        floodSafety: 0.64,
        reserveCompatibility: 0.18,
        structuralContinuity: 0.18,
      },
      land: {
        reserveCompatibility: 0.42,
        floodSafety: 0.36,
        structuralContinuity: 0.22,
      },
    },
  },
  viirsNight: {
    id: "viirsNight",
    label: "VIIRS luces nocturnas",
    shortLabel: "VIIRS",
    providerLabel: "NASA Black Marble VIIRS",
    spatialLabel: "500 m",
    temporalLabel: "diario/mensual",
    useCopy: "Ayuda a leer centralidades, actividad nocturna, consolidacion urbana y deficit funcional de servicios.",
    growthBias: 0.9,
    serviceBias: 1.18,
    resilienceBias: 0.82,
    reserveBias: 0.9,
    variables: [
      "nightActivity",
      "serviceCentrality",
      "corridorAccessibility",
      "reserveCompatibility",
    ],
    signalMix: {
      growth: {
        nightActivity: 0.38,
        corridorAccessibility: 0.24,
        serviceCentrality: 0.22,
        reserveCompatibility: 0.16,
      },
      access: {
        corridorAccessibility: 0.46,
        nightActivity: 0.32,
        serviceCentrality: 0.22,
      },
      service: {
        serviceCentrality: 0.42,
        nightActivity: 0.38,
        corridorAccessibility: 0.2,
      },
      resilience: {
        reserveCompatibility: 0.56,
        corridorAccessibility: 0.18,
        nightActivity: 0.26,
      },
      land: {
        reserveCompatibility: 0.52,
        corridorAccessibility: 0.16,
        nightActivity: 0.32,
      },
    },
  },
};

const planning3dCatalog = {
  buildings: {
    id: "buildings",
    label: "Construcciones",
    shortLabel: "Construcciones 3D",
    basePath: "./construcciones%2031/construcciones_31oct",
    color: "#78a36d",
    description: "Huella edificada extruida desde el shape real de construcciones.",
  },
  parcels: {
    id: "parcels",
    label: "Catastro",
    shortLabel: "Predios",
    basePath: "./CATASTRO%202026/CATASTRO_2026",
    color: "#cb9440",
    description: "Huella catastral de referencia para implantacion y lectura de manzana.",
  },
};

const planning3dDemoData = {
  buildings: [
    [
      [-78.59318, -0.50688],
      [-78.59304, -0.50688],
      [-78.59304, -0.50672],
      [-78.59318, -0.50672],
      [-78.59318, -0.50688],
    ],
    [
      [-78.59298, -0.50688],
      [-78.59279, -0.50688],
      [-78.59279, -0.50667],
      [-78.59298, -0.50667],
      [-78.59298, -0.50688],
    ],
    [
      [-78.5927, -0.50684],
      [-78.59251, -0.50684],
      [-78.59251, -0.50662],
      [-78.5927, -0.50662],
      [-78.5927, -0.50684],
    ],
    [
      [-78.59314, -0.50658],
      [-78.59299, -0.50658],
      [-78.59299, -0.50641],
      [-78.59314, -0.50641],
      [-78.59314, -0.50658],
    ],
    [
      [-78.59294, -0.50656],
      [-78.59276, -0.50656],
      [-78.59276, -0.50634],
      [-78.59294, -0.50634],
      [-78.59294, -0.50656],
    ],
    [
      [-78.59266, -0.50654],
      [-78.59246, -0.50654],
      [-78.59246, -0.5063],
      [-78.59266, -0.5063],
      [-78.59266, -0.50654],
    ],
  ],
  parcels: [
    [
      [-78.59328, -0.50702],
      [-78.59298, -0.50702],
      [-78.59298, -0.50658],
      [-78.59328, -0.50658],
      [-78.59328, -0.50702],
    ],
    [
      [-78.59302, -0.50702],
      [-78.5927, -0.50702],
      [-78.5927, -0.50658],
      [-78.59302, -0.50658],
      [-78.59302, -0.50702],
    ],
    [
      [-78.59274, -0.50702],
      [-78.59238, -0.50702],
      [-78.59238, -0.50656],
      [-78.59274, -0.50656],
      [-78.59274, -0.50702],
    ],
    [
      [-78.59324, -0.50656],
      [-78.5929, -0.50656],
      [-78.5929, -0.50618],
      [-78.59324, -0.50618],
      [-78.59324, -0.50656],
    ],
    [
      [-78.59294, -0.50656],
      [-78.59238, -0.50656],
      [-78.59238, -0.50616],
      [-78.59294, -0.50616],
      [-78.59294, -0.50656],
    ],
  ],
};

const state = {
  activeTab: "capas",
  activeSensorId: "sentinel2",
  selectedImageId: null,
  selectedCompareImageId: null,
  selectedIndex: "NDVI",
  surfaceMode: "primary",
  showScenePreview: true,
  showAnalysisOverlay: true,
  scenePreviewOpacity: 0.85,
  sceneLayerKind: "off",
  filteredImages: [],
  sentinelMode: "loading",
  sentinelError: null,
  sentinelLoading: false,
  sentinelRequestId: 0,
  sentinelQueryScopeLabel: "Canton Mejia",
  sentinelTransport: "direct",
  sentinelCacheHit: false,
  activeWizard: "Monitoreo",
  currentPlot: null,
  currentPlotLabel: "Sin seleccionar",
  baseLayer: "satellite",
  backendChecked: false,
  backendAvailable: false,
  backendUrl: null,
  backendCacheEntries: 0,
  analysisBusy: false,
  analysisError: null,
  analysisRequestId: 0,
  analysisData: null,
  compareAnalysis: null,
  changeAnalysis: null,
  planningUseId: "vis",
  planningImageryId: "sentinel2Urban",
  planningHorizonId: "medio",
  planningGrowthScenarioId: "balanceado",
  planningData: null,
  planningHighlightId: null,
  entryRoute: "agronomia",
  agronomyOutputs: {
    intralote: null,
    dem: null,
    climate: null,
  },
  wizardProgress: {},
  wizardBusy: false,
};

const dom = {};
const mapState = {
  map: null,
  baseLayers: {},
  activeBaseLayer: null,
  controlGroup: null,
  lotLayer: null,
  sentinelLayer: null,
  sceneExactLayer: null,
  scenePreviewLayer: null,
  sceneFootprintLayer: null,
  managementLayer: null,
  planningLayer: null,
  planningCandidatesLayer: null,
  studyAreaLayer: null,
  currentPlotLayer: null,
};

const planning3dState = {
  modalOpen: false,
  currentBase: "light",
  manifest: null,
  photoStatus: null,
  backendMode: "unknown",
  manifestLoading: false,
  manifestPromise: null,
  photoStatusPromise: null,
  dataLoading: false,
  loadingPhotos: false,
  photoQueryMessage: null,
  buildingsVisible: true,
  parcelsVisible: false,
  heightScale: 1,
  map: null,
  readyPromise: null,
  eventsBound: false,
  popup: null,
  selectedFeatureId: null,
  selectedBuilding: null,
  selectedPhotos: [],
  datasetRequestId: {
    buildings: 0,
    parcels: 0,
  },
  datasetWorkers: {
    buildings: null,
    parcels: null,
  },
  datasetStatus: {
    buildings: {
      phase: "idle",
      loaded: 0,
      total: 0,
      previewCount: 0,
    },
    parcels: {
      phase: "idle",
      loaded: 0,
      total: 0,
      previewCount: 0,
    },
  },
  sourceData: {
    buildings: null,
    parcels: null,
    candidates: null,
  },
};

function getSensorConfig(sensorId = state.activeSensorId) {
  return sensorCatalog[sensorId] || sensorCatalog.sentinel2;
}

function getActiveSensor() {
  return getSensorConfig(state.activeSensorId);
}

function getPlanningProgram(programId = state.planningUseId) {
  return planningProgramCatalog[programId] || planningProgramCatalog.vis;
}

function getPlanningImageryProfile(imageryId = state.planningImageryId) {
  return planningImageryCatalog[imageryId] || planningImageryCatalog.sentinel2Urban;
}

function getPlanningVariableDefinition(variableId) {
  return planningVariableCatalog[variableId] || {
    id: variableId,
    label: variableId,
    role: "Variable",
    copy: "Variable territorial sin definicion detallada.",
    tone: "neutral",
    emphasis: "Media",
  };
}

function getPlanningHorizon(horizonId = state.planningHorizonId) {
  return planningHorizonCatalog[horizonId] || planningHorizonCatalog.medio;
}

function getPlanningScenario(scenarioId = state.planningGrowthScenarioId) {
  return planningScenarioCatalog[scenarioId] || planningScenarioCatalog.balanceado;
}

function getPlanning3dFallbackManifest() {
  return {
    ok: true,
    planning3dReady: true,
    projection: "EPSG:32717",
    viaBackend: false,
    buildings: {
      available: true,
      label: planning3dCatalog.buildings.label,
      basePath: planning3dCatalog.buildings.basePath,
      recordCount: null,
      stats: null,
    },
    parcels: {
      available: true,
      label: planning3dCatalog.parcels.label,
      basePath: planning3dCatalog.parcels.basePath,
      recordCount: null,
    },
  };
}

function getPlanning3dManifest() {
  return planning3dState.manifest || getPlanning3dFallbackManifest();
}

function getPlanning3dDemoGeometries(datasetKey) {
  const rings = planning3dDemoData[datasetKey];
  if (!Array.isArray(rings)) {
    return [];
  }

  return rings.map((ring) => ({
    type: "Polygon",
    coordinates: [ring],
  }));
}

function getPlanning3dRingCenter(ring) {
  if (!Array.isArray(ring) || !ring.length) {
    return [-78.59, -0.503];
  }

  const uniqueVertices = ring.length > 1
    && ring[0]?.[0] === ring[ring.length - 1]?.[0]
    && ring[0]?.[1] === ring[ring.length - 1]?.[1]
    ? ring.slice(0, -1)
    : ring;

  const totals = uniqueVertices.reduce((accumulator, point) => {
    return {
      lon: accumulator.lon + (Number(point?.[0]) || 0),
      lat: accumulator.lat + (Number(point?.[1]) || 0),
    };
  }, { lon: 0, lat: 0 });

  return [
    totals.lon / Math.max(uniqueVertices.length, 1),
    totals.lat / Math.max(uniqueVertices.length, 1),
  ];
}

function translatePlanning3dRing(ring, lonOffset = 0, latOffset = 0, scale = 1) {
  const [centerLon, centerLat] = getPlanning3dRingCenter(ring);
  return ring.map((point) => {
    const lon = Number(point?.[0]) || centerLon;
    const lat = Number(point?.[1]) || centerLat;
    return [
      Number((centerLon + ((lon - centerLon) * scale) + lonOffset).toFixed(6)),
      Number((centerLat + ((lat - centerLat) * scale) + latOffset).toFixed(6)),
    ];
  });
}

function buildPlanning3dLiteGeometries(datasetKey) {
  const rings = planning3dDemoData[datasetKey];
  if (!Array.isArray(rings) || !rings.length) {
    return [];
  }

  const config = datasetKey === "buildings"
    ? {
      rows: 7,
      cols: 8,
      lonStep: 0.00102,
      latStep: 0.00082,
      scaleBase: 0.96,
      scaleStep: 0.03,
      skipMod: 9,
    }
    : {
      rows: 4,
      cols: 5,
      lonStep: 0.00128,
      latStep: 0.00104,
      scaleBase: 1,
      scaleStep: 0.02,
      skipMod: 7,
    };

  const geometries = [];
  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const lonOffsetBase = (col - ((config.cols - 1) / 2)) * config.lonStep;
      const latOffsetBase = (((config.rows - 1) / 2) - row) * config.latStep;

      rings.forEach((ring, ringIndex) => {
        const seed = (row * 37) + (col * 19) + (ringIndex * 11);
        if (datasetKey === "buildings" && seed % config.skipMod === 0) {
          return;
        }
        if (datasetKey === "parcels" && seed % config.skipMod === 0 && ringIndex > 1) {
          return;
        }

        const jitterLon = (((seed % 5) - 2) * 0.000018);
        const jitterLat = ((((seed + 3) % 5) - 2) * 0.000014);
        const scale = config.scaleBase + ((seed % 4) * config.scaleStep);
        geometries.push({
          type: "Polygon",
          coordinates: [
            translatePlanning3dRing(
              ring,
              lonOffsetBase + jitterLon,
              latOffsetBase + jitterLat,
              scale
            ),
          ],
        });
      });
    }
  }

  return geometries;
}

function buildPlanning3dLiteCollection(datasetKey) {
  const geometries = buildPlanning3dLiteGeometries(datasetKey);
  return datasetKey === "buildings"
    ? buildPlanning3dBuildingsCollection(geometries)
    : buildPlanning3dParcelsCollection(geometries);
}

function primePlanning3dLiteDataset(datasetKey, manifest = getPlanning3dManifest()) {
  const collection = buildPlanning3dLiteCollection(datasetKey);
  planning3dState.sourceData[datasetKey] = collection;
  syncPlanning3dSource(datasetKey);

  const total = manifest?.[datasetKey]?.recordCount || collection.features.length;
  setPlanning3dDatasetStatus(datasetKey, {
    phase: manifest?.viaBackend ? "preview" : "demo",
    loaded: collection.features.length,
    total,
    previewCount: collection.features.length,
  });
  renderPlanning3dSummary();
  renderPlanning3dSelection();

  if (!manifest?.viaBackend) {
    setPlanning3dStatus(
      datasetKey === "buildings"
        ? `Vista publicada ligera lista: ${formatPlanning3dCount(collection.features.length)} construcciones 3D para navegacion inmediata.`
        : `Catastro ligero publicado listo: ${formatPlanning3dCount(collection.features.length)} predios de referencia.`,
      "demo"
    );
  }

  return collection;
}

function waitForPlanning3dYield() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    window.setTimeout(resolve, 0);
  });
}

function terminatePlanning3dWorker(datasetKey) {
  const worker = planning3dState.datasetWorkers?.[datasetKey];
  if (!worker) {
    return;
  }
  worker.terminate();
  planning3dState.datasetWorkers[datasetKey] = null;
}

function getPlanning3dWorkerUrl() {
  return "./planning3d-worker.js?v=20260412-1";
}

function getPlanning3dGeometryList(geometries) {
  if (Array.isArray(geometries)) {
    return geometries.filter(Boolean);
  }
  if (Array.isArray(geometries?.features)) {
    return geometries.features.map((feature) => feature.geometry).filter(Boolean);
  }
  return [];
}

function getPlanning3dPreviewIndexes(total, target = 3200) {
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

function slicePlanning3dMetadata(metadata, indexes) {
  if (!metadata || !Array.isArray(indexes) || !indexes.length) {
    return metadata;
  }

  const pick = (list) => indexes.map((index) => list?.[index] ?? null);
  return {
    ...metadata,
    floors: pick(metadata.floors),
    heights: pick(metadata.heights),
    ids: pick(metadata.ids),
    blockIds: pick(metadata.blockIds),
  };
}

function setPlanning3dDatasetStatus(datasetKey, patch = {}) {
  const current = planning3dState.datasetStatus[datasetKey] || {
    phase: "idle",
    loaded: 0,
    total: 0,
    previewCount: 0,
  };
  planning3dState.datasetStatus[datasetKey] = {
    ...current,
    ...patch,
  };
}

function runPlanning3dWorkerDataset(datasetKey, basePath, metadata = null, options = {}) {
  if (typeof Worker === "undefined") {
    return null;
  }

  terminatePlanning3dWorker(datasetKey);
  const worker = new Worker(getPlanning3dWorkerUrl());
  planning3dState.datasetWorkers[datasetKey] = worker;
  const requestId = options.requestId || planning3dState.datasetRequestId[datasetKey];

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      if (planning3dState.datasetWorkers[datasetKey] === worker) {
        planning3dState.datasetWorkers[datasetKey] = null;
      }
      worker.terminate();
    };

    worker.onmessage = (event) => {
      const payload = event.data || {};
      if (payload.requestId !== requestId || payload.datasetKey !== datasetKey) {
        return;
      }

      if (payload.type === "preview") {
        options.onPreview?.(payload);
        return;
      }

      if (payload.type === "progress") {
        options.onProgress?.(payload);
        return;
      }

      if (payload.type === "complete") {
        cleanup();
        resolve(payload.collection);
        return;
      }

      if (payload.type === "error") {
        cleanup();
        reject(new Error(payload.message || `No se pudo procesar ${datasetKey} en el worker 3D.`));
      }
    };

    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || `Fallo el worker del visualizador 3D para ${datasetKey}.`));
    };

    worker.postMessage({
      type: "buildDataset",
      requestId,
      datasetKey,
      basePath,
      metadata,
      previewTarget: datasetKey === "buildings" ? (options.previewTarget || 3200) : 0,
      batchSize: options.batchSize || (datasetKey === "buildings" ? 1800 : 1200),
    });
  });
}

function createPlanning3dBuildingFeature(geometry, index, metadata = null) {
  const estimate = estimatePlanning3dMetrics(geometry);
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
    },
    geometry,
  };
}

function createPlanning3dParcelFeature(geometry, index) {
  return {
    type: "Feature",
    properties: {
      parcelIndex: index + 1,
    },
    geometry,
  };
}

async function buildPlanning3dCollectionProgressive(datasetKey, geometries, metadata = null, options = {}) {
  const geometryList = getPlanning3dGeometryList(geometries);
  const total = geometryList.length;
  const batchSize = Math.max(250, options.batchSize || 1200);
  const features = [];

  for (let index = 0; index < total; index += 1) {
    const geometry = geometryList[index];
    if (!geometry) {
      continue;
    }

    features.push(
      datasetKey === "buildings"
        ? createPlanning3dBuildingFeature(geometry, index, metadata)
        : createPlanning3dParcelFeature(geometry, index)
    );

    const loaded = index + 1;
    if (loaded % batchSize === 0 || loaded === total) {
      options.onProgress?.({ loaded, total });
      await waitForPlanning3dYield();
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

function getPlanning3dLoadLabel(datasetStatus) {
  if (!datasetStatus) {
    return "Pendiente";
  }
  switch (datasetStatus.phase) {
    case "fetching":
      return "Descargando";
    case "preview":
      return `Vista rapida ${formatPlanning3dCount(datasetStatus.previewCount)}`;
    case "building":
      return datasetStatus.total
        ? `${Math.round((datasetStatus.loaded / datasetStatus.total) * 100)}%`
        : "Procesando";
    case "ready":
      return "Completo";
    case "demo":
      return "Demo web";
    default:
      return "Pendiente";
  }
}

function getSensorForImage(image = null) {
  return getSensorConfig(image?.sensorId || state.activeSensorId);
}

function getSupportedIndexKeys(subject = null) {
  if (!subject) {
    return [...getActiveSensor().indices];
  }
  if (typeof subject === "string") {
    return [...getSensorConfig(subject).indices];
  }
  return [...getSensorForImage(subject).indices];
}

function getFocusIndexKey(subject = null) {
  if (!subject) {
    return getActiveSensor().focusIndex;
  }
  if (typeof subject === "string") {
    return getSensorConfig(subject).focusIndex;
  }
  return getSensorForImage(subject).focusIndex;
}

function getMoistureIndexKey(subject = null) {
  if (!subject) {
    return getActiveSensor().moistureIndex;
  }
  if (typeof subject === "string") {
    return getSensorConfig(subject).moistureIndex;
  }
  return getSensorForImage(subject).moistureIndex;
}

function getFallbackScene() {
  const fallback = getActiveSensor().demoImages[0];
  if (!fallback) {
    return null;
  }
  return enrichSceneMetadata({
    ...fallback,
    source: "demo",
    datetime: `${fallback.date}T10:15:00Z`,
  });
}

function ensureSelectedIndex() {
  const supported = getSupportedIndexKeys();
  if (!supported.includes(state.selectedIndex)) {
    state.selectedIndex = getActiveSensor().defaultIndex;
  }
}

function normalizeMetricValue(value, config) {
  return clamp((value - config.min) / (config.max - config.min || 1), 0, 1);
}

function getSceneMetaLabel(image) {
  if (Number.isFinite(image?.cloud)) {
    return `Nubes ${formatCloudValue(image.cloud)}`;
  }
  if (Array.isArray(image?.polarizations) && image.polarizations.length) {
    return image.polarizations.join("/");
  }
  if (image?.orbitState) {
    return formatOrbitState(image.orbitState);
  }
  return getSensorForImage(image).label;
}

function getSceneLayerStatusLabel(imageOrSensor = null, layerKind = state.sceneLayerKind) {
  const sensor = typeof imageOrSensor === "string"
    ? getSensorConfig(imageOrSensor)
    : getSensorForImage(imageOrSensor);
  if (!state.showScenePreview) {
    return "capa oculta";
  }
  if (layerKind === "exact") {
    return `raster exacto ${sensor.sceneResolutionLabel}`;
  }
  if (layerKind === "footprint") {
    return sensor.id === "sentinel1"
      ? "preview radar recortado"
      : "escena recortada";
  }
  if (layerKind === "loading") {
    return sensor.exactRaster ? "cargando raster" : "preparando escena";
  }
  if (layerKind === "preview") {
    return "preview bbox";
  }
  return "sin capa";
}

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  bootstrapApp();
});

function cacheDom() {
  dom.loginOverlay = document.querySelector("#loginOverlay");
  dom.openAgronomyBtn = document.querySelector("#openAgronomyBtn");
  dom.openPlanningBtn = document.querySelector("#openPlanningBtn");
  dom.appShell = document.querySelector("#appShell");
  dom.mapStage = document.querySelector(".map-stage");
  dom.sidebar = document.querySelector("#sidebar");
  dom.sidebarToggle = document.querySelector("#sidebarToggle");
  dom.sidebarClose = document.querySelector("#sidebarClose");
  dom.sidebarTitle = document.querySelector("#sidebarTitle");
  dom.sidebarSubtitle = document.querySelector("#sidebarSubtitle");
  dom.tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  dom.tabImageryBtn = document.querySelector("#tabImageryBtn");
  dom.tabModulesBtn = document.querySelector("#tabModulesBtn");
  dom.tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  dom.layersTree = document.querySelector("#layersTree");
  dom.sensorSelect = document.querySelector("#sensorSelect");
  dom.sensorSupportNote = document.querySelector("#sensorSupportNote");
  dom.sentinelForm = document.querySelector("#sentinelForm");
  dom.startDate = document.querySelector("#startDate");
  dom.endDate = document.querySelector("#endDate");
  dom.cloudRange = document.querySelector("#cloudRange");
  dom.cloudLabel = document.querySelector("#cloudLabel");
  dom.cloudValue = document.querySelector("#cloudValue");
  dom.sentinelSourceStatus = document.querySelector("#sentinelSourceStatus");
  dom.sentinelSubmitBtn = document.querySelector("#sentinelSubmitBtn");
  dom.sentinelResults = document.querySelector("#sentinelResults");
  dom.primarySceneSelect = document.querySelector("#primarySceneSelect");
  dom.compareSceneSelect = document.querySelector("#compareSceneSelect");
  dom.toggleSurfaceModeBtn = document.querySelector("#toggleSurfaceModeBtn");
  dom.clearCompareBtn = document.querySelector("#clearCompareBtn");
  dom.toggleAnalysisOverlayBtn = document.querySelector("#toggleAnalysisOverlayBtn");
  dom.toggleScenePreviewBtn = document.querySelector("#toggleScenePreviewBtn");
  dom.scenePreviewOpacity = document.querySelector("#scenePreviewOpacity");
  dom.scenePreviewOpacityValue = document.querySelector("#scenePreviewOpacityValue");
  dom.sceneTimeline = document.querySelector("#sceneTimeline");
  dom.indexButtons = document.querySelector("#indexButtons");
  dom.legendCard = document.querySelector("#legendCard");
  dom.analysisStatus = document.querySelector("#analysisStatus");
  dom.sceneSummary = document.querySelector("#sceneSummary");
  dom.compareSummary = document.querySelector("#compareSummary");
  dom.rerunAnalysisBtn = document.querySelector("#rerunAnalysisBtn");
  dom.useStudyAreaBtn = document.querySelector("#useStudyAreaBtn");
  dom.mapTitle = document.querySelector("#mapTitle");
  dom.mapBadges = document.querySelector("#mapBadges");
  dom.mapSubtitle = document.querySelector("#mapSubtitle");
  dom.overlayIndex = document.querySelector("#overlayIndex");
  dom.overlayPlot = document.querySelector("#overlayPlot");
  dom.overlayMode = document.querySelector("#overlayMode");
  dom.statusBar = document.querySelector("#statusBar");
  dom.runIntraloteBtn = document.querySelector("#runIntraloteBtn");
  dom.runDemBtn = document.querySelector("#runDemBtn");
  dom.runClimateBtn = document.querySelector("#runClimateBtn");
  dom.runPlanningBtn = document.querySelector("#runPlanningBtn");
  dom.focusPlanningBtn = document.querySelector("#focusPlanningBtn");
  dom.clearPlanningBtn = document.querySelector("#clearPlanningBtn");
  dom.planningImagerySelect = document.querySelector("#planningImagerySelect");
  dom.planningUseSelect = document.querySelector("#planningUseSelect");
  dom.planningHorizonSelect = document.querySelector("#planningHorizonSelect");
  dom.planningGrowthSelect = document.querySelector("#planningGrowthSelect");
  dom.intraloteResults = document.querySelector("#intraloteResults");
  dom.demResults = document.querySelector("#demResults");
  dom.climateResults = document.querySelector("#climateResults");
  dom.planningResults = document.querySelector("#planningResults");
  dom.planningWeights = document.querySelector("#planningWeights");
  dom.planningCandidates = document.querySelector("#planningCandidates");
  dom.planningSourceNote = document.querySelector("#planningSourceNote");
  dom.planningVariableMatrix = document.querySelector("#planningVariableMatrix");
  dom.planningCard = document.querySelector("#planningCard");
  dom.planningModuleCards = Array.from(document.querySelectorAll('[data-module-track="planificacion"]'));
  dom.planning3dAvailability = document.querySelector("#planning3dAvailability");
  dom.openPlanning3dBtn = document.querySelector("#openPlanning3dBtn");
  dom.reloadPlanning3dBtn = document.querySelector("#reloadPlanning3dBtn");
  dom.planning3dModal = document.querySelector("#planning3dModal");
  dom.planning3dBackdrop = document.querySelector("#planning3dBackdrop");
  dom.planning3dCloseBtn = document.querySelector("#planning3dCloseBtn");
  dom.planning3dResetViewBtn = document.querySelector("#planning3dResetViewBtn");
  dom.planning3dStatus = document.querySelector("#planning3dStatus");
  dom.planning3dSummary = document.querySelector("#planning3dSummary");
  dom.planning3dSelection = document.querySelector("#planning3dSelection");
  dom.planning3dMap = document.querySelector("#planning3dMap");
  dom.planning3dSubtitle = document.querySelector("#planning3dSubtitle");
  dom.planning3dHeightScale = document.querySelector("#planning3dHeightScale");
  dom.planning3dHeightScaleValue = document.querySelector("#planning3dHeightScaleValue");
  dom.planning3dBuildingsToggle = document.querySelector("#planning3dBuildingsToggle");
  dom.planning3dParcelsToggle = document.querySelector("#planning3dParcelsToggle");
  dom.planning3dBaseButtons = Array.from(document.querySelectorAll("[data-planning-base]"));
  dom.modulesSectionKicker = document.querySelector("#modulesSectionKicker");
  dom.modulesSectionTitle = document.querySelector("#modulesSectionTitle");
  dom.modulesSectionCopy = document.querySelector("#modulesSectionCopy");
  dom.modeFooterPill = document.querySelector("#modeFooterPill");
  dom.agronomyModuleCards = Array.from(document.querySelectorAll('[data-module-track="agronomia"]'));
  dom.wizardModes = document.querySelector("#wizardModes");
  dom.wizardSteps = document.querySelector("#wizardSteps");
  dom.runWizardNextBtn = document.querySelector("#runWizardNextBtn");
  dom.runWizardPlanBtn = document.querySelector("#runWizardPlanBtn");
  dom.useDemoPlotBtn = document.querySelector("#useDemoPlotBtn");
  dom.resetWizardBtn = document.querySelector("#resetWizardBtn");
  dom.wizardAssistantStatus = document.querySelector("#wizardAssistantStatus");
  dom.wizardSummary = document.querySelector("#wizardSummary");
  dom.baseButtons = Array.from(document.querySelectorAll("[data-base]"));
}

function bootstrapApp() {
  setDefaultDates();
  bindUI();
  ensureSelectedIndex();
  updateSensorControls();
  renderLayerTree();
  renderIndexButtons();
  renderWizardAssistantState();
  renderPlanningModule();
  renderPlanning3dPanel();
  syncEntryRouteUi(state.entryRoute);
  renderSceneControls();
  renderAnalysisStatus();
  renderAnalysisSummary();
  renderCompareSummary();
  filterSentinelImages();
  hydratePlanning3dManifest();
  applyRouteFromUrl();
}

function bindUI() {
  dom.openAgronomyBtn.addEventListener("click", () => enterPublicView("agronomia"));
  dom.openPlanningBtn.addEventListener("click", () => enterPublicView("planificacion"));
  dom.sidebarToggle.addEventListener("click", () => dom.sidebar.classList.add("open"));
  dom.sidebarClose.addEventListener("click", () => dom.sidebar.classList.remove("open"));

  if (dom.sensorSelect) {
    dom.sensorSelect.addEventListener("change", () => {
      state.activeSensorId = dom.sensorSelect.value || "sentinel2";
      state.selectedImageId = null;
      state.selectedCompareImageId = null;
      state.filteredImages = [];
      state.surfaceMode = "primary";
      state.sceneLayerKind = "off";
      state.sentinelMode = "loading";
      state.sentinelTransport = "direct";
      state.sentinelError = null;
      state.sentinelCacheHit = false;
      state.analysisData = null;
      state.compareAnalysis = null;
      state.changeAnalysis = null;
      state.analysisError = null;
      ensureSelectedIndex();
      updateSensorControls();
      renderIndexButtons();
      renderSceneControls();
      renderSentinelSourceStatus();
      renderSentinelResults();
      renderAnalysisStatus();
      renderAnalysisSummary();
      renderCompareSummary();
      renderSentinelOverlay();
      updateMapSummary();
      filterSentinelImages();
    });
  }

  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  dom.cloudRange.addEventListener("input", () => {
    dom.cloudValue.textContent = getActiveSensor().cloudEnabled ? `${dom.cloudRange.value}%` : "No aplica";
  });

  dom.sentinelForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterSentinelImages();
  });

  dom.primarySceneSelect.addEventListener("change", () => {
    const nextId = dom.primarySceneSelect.value || null;
    if (!nextId || nextId === state.selectedImageId) {
      return;
    }

    state.selectedImageId = nextId;
    if (state.selectedCompareImageId === state.selectedImageId) {
      state.selectedCompareImageId = null;
      state.surfaceMode = "primary";
    }
    renderSceneControls();
    renderSentinelResults();
    refreshActiveAnalysis();
  });

  dom.compareSceneSelect.addEventListener("change", () => {
    const nextId = dom.compareSceneSelect.value || null;
    state.selectedCompareImageId = nextId && nextId !== state.selectedImageId ? nextId : null;
    if (!state.selectedCompareImageId) {
      state.surfaceMode = "primary";
    }
    renderSceneControls();
    renderSentinelResults();
    refreshActiveAnalysis();
  });

  dom.rerunAnalysisBtn.addEventListener("click", () => {
    refreshActiveAnalysis();
  });

  dom.toggleSurfaceModeBtn.addEventListener("click", () => {
    if (!getCompareImage()) {
      state.surfaceMode = "primary";
      renderSceneControls();
      return;
    }
    state.surfaceMode = state.surfaceMode === "change" ? "primary" : "change";
    renderSceneControls();
    renderLegend();
    renderAnalysisSummary();
    renderCompareSummary();
    renderSentinelOverlay();
    updateMapSummary();
  });

  dom.clearCompareBtn.addEventListener("click", () => {
    if (!state.selectedCompareImageId) {
      return;
    }
    state.selectedCompareImageId = null;
    state.surfaceMode = "primary";
    renderSceneControls();
    renderSentinelResults();
    refreshActiveAnalysis({ silent: true });
  });

  dom.toggleAnalysisOverlayBtn.addEventListener("click", () => {
    if (!getSelectedImage()) {
      return;
    }
    state.showAnalysisOverlay = !state.showAnalysisOverlay;
    renderSceneControls();
    renderSentinelOverlay();
    updateMapSummary();
  });

  dom.toggleScenePreviewBtn.addEventListener("click", () => {
    if (!canRenderSceneLayer()) {
      return;
    }
    state.showScenePreview = !state.showScenePreview;
    renderSceneControls();
    renderSentinelOverlay();
    updateMapSummary();
  });

  dom.scenePreviewOpacity.addEventListener("input", () => {
    state.scenePreviewOpacity = Number(dom.scenePreviewOpacity.value) / 100;
    dom.scenePreviewOpacityValue.textContent = `${Math.round(state.scenePreviewOpacity * 100)}%`;
    if (mapState.sceneExactLayer?.setOpacity) {
      mapState.sceneExactLayer.setOpacity(state.scenePreviewOpacity);
    }
    if (mapState.scenePreviewLayer) {
      mapState.scenePreviewLayer.setOpacity(state.scenePreviewOpacity);
    }
  });

  dom.useStudyAreaBtn.addEventListener("click", () => {
    if (state.currentPlot) {
      clearCurrentPlot(true);
    }
  });

  dom.runIntraloteBtn.addEventListener("click", runIntraloteAnalysis);
  dom.runDemBtn.addEventListener("click", runDemAnalysis);
  dom.runClimateBtn.addEventListener("click", runClimateAnalysis);
  dom.runWizardNextBtn?.addEventListener("click", runWizardNextStep);
  dom.runWizardPlanBtn?.addEventListener("click", runWizardPlan);
  dom.useDemoPlotBtn?.addEventListener("click", useWizardDemoPlot);
  dom.resetWizardBtn?.addEventListener("click", () => resetWizardAssistant());
  dom.runPlanningBtn.addEventListener("click", runPlanningAnalysis);
  dom.focusPlanningBtn.addEventListener("click", focusPlanningCandidates);
  dom.clearPlanningBtn.addEventListener("click", clearPlanningAnalysis);
  dom.planningImagerySelect.addEventListener("change", () => {
    state.planningImageryId = dom.planningImagerySelect.value || "sentinel2Urban";
    renderPlanningModule();
    if (state.planningData) {
      runPlanningAnalysis(true);
    }
  });

  dom.planningUseSelect.addEventListener("change", () => {
    state.planningUseId = dom.planningUseSelect.value || "vis";
    renderPlanningModule();
    if (state.planningData) {
      runPlanningAnalysis(true);
    }
  });

  dom.planningHorizonSelect.addEventListener("change", () => {
    state.planningHorizonId = dom.planningHorizonSelect.value || "medio";
    renderPlanningModule();
    if (state.planningData) {
      runPlanningAnalysis(true);
    }
  });

  dom.planningGrowthSelect.addEventListener("change", () => {
    state.planningGrowthScenarioId = dom.planningGrowthSelect.value || "balanceado";
    renderPlanningModule();
    if (state.planningData) {
      runPlanningAnalysis(true);
    }
  });

  dom.baseButtons.forEach((button) => {
    button.addEventListener("click", () => setBaseLayer(button.dataset.base));
  });

  dom.openPlanning3dBtn?.addEventListener("click", () => {
    openPlanning3dViewer();
  });
  dom.reloadPlanning3dBtn?.addEventListener("click", () => {
    reloadPlanning3dData();
  });
  dom.planning3dCloseBtn?.addEventListener("click", closePlanning3dViewer);
  dom.planning3dBackdrop?.addEventListener("click", closePlanning3dViewer);
  dom.planning3dResetViewBtn?.addEventListener("click", focusPlanning3dDataset);
  dom.planning3dBuildingsToggle?.addEventListener("change", () => {
    planning3dState.buildingsVisible = !!dom.planning3dBuildingsToggle.checked;
    syncPlanning3dLayerVisibility();
  });
  dom.planning3dParcelsToggle?.addEventListener("change", async () => {
    planning3dState.parcelsVisible = !!dom.planning3dParcelsToggle.checked;
    if (planning3dState.parcelsVisible) {
      await ensurePlanning3dDataset("parcels");
    }
    syncPlanning3dLayerVisibility();
  });
  dom.planning3dHeightScale?.addEventListener("input", () => {
    planning3dState.heightScale = Number(dom.planning3dHeightScale.value || 1);
    if (dom.planning3dHeightScaleValue) {
      dom.planning3dHeightScaleValue.textContent = `${planning3dState.heightScale.toFixed(1)}x`;
    }
    updatePlanning3dHeightScale();
  });
  dom.planning3dBaseButtons?.forEach((button) => {
    button.addEventListener("click", () => {
      setPlanning3dBase(button.dataset.planningBase || "satellite");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && planning3dState.modalOpen) {
      closePlanning3dViewer();
    }
  });
}

function updateSensorControls() {
  const sensor = getActiveSensor();

  if (dom.sensorSelect) {
    dom.sensorSelect.value = sensor.id;
  }

  if (dom.cloudLabel) {
    dom.cloudLabel.textContent = sensor.cloudEnabled ? "Nubosidad maxima" : "Filtro meteorologico";
  }

  if (dom.cloudRange) {
    dom.cloudRange.disabled = !sensor.cloudEnabled;
  }

  if (dom.cloudValue) {
    dom.cloudValue.textContent = sensor.cloudEnabled ? `${dom.cloudRange.value}%` : "No aplica";
  }

  if (dom.sensorSupportNote) {
    dom.sensorSupportNote.textContent = sensor.backendEligible
      ? `${sensor.supportNote} Si activas server.ps1, ${sensor.label} puede sumar proxy local, cache STAC y trazabilidad extra.`
      : `${sensor.supportNote} Este sensor consulta directo Earth Search y usa analisis local en el navegador.`;
  }
}

function enterPublicView(route = state.entryRoute || "agronomia") {
  state.entryRoute = route;
  dom.loginOverlay.classList.add("hidden");
  dom.appShell.classList.remove("hidden");
  if (!mapState.map) {
    initializeMap();
  }
  window.setTimeout(() => {
    mapState.map.invalidateSize();
    applyEntryRoute(route);
  }, 160);
}

function applyRouteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const routeParam = params.get("route");
  const tabParam = params.get("tab");
  const route = routeParam === "planificacion" ? "planificacion" : routeParam === "agronomia" ? "agronomia" : null;
  if (!route) {
    return;
  }

  enterPublicView(route);
  if (tabParam) {
    window.setTimeout(() => {
      if (["capas", "sentinel", "modulos"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }, 260);
  }
}

function applyEntryRoute(route = state.entryRoute || "agronomia") {
  state.entryRoute = route;
  syncEntryRouteUi(route);

  if (route === "planificacion") {
    setActiveTab("modulos");
    hydratePlanning3dManifest();
    if (dom.sidebarTitle) {
      dom.sidebarTitle.textContent = "Centro de planificacion territorial";
    }
    if (dom.sidebarSubtitle) {
      dom.sidebarSubtitle.textContent = "Crecimiento urbano, deficit de servicios, aptitud territorial y candidatos para equipamientos.";
    }
    if (dom.overlayMode) {
      dom.overlayMode.textContent = "Territorial";
    }
    updateMapSummary();
    window.setTimeout(() => {
      focusPlanningModuleCard();
    }, 120);
    return;
  }

  setActiveTab("modulos");
  closePlanning3dViewer(true);
  if (dom.sidebarTitle) {
    dom.sidebarTitle.textContent = "Centro de trabajo agronomico";
  }
  if (dom.sidebarSubtitle) {
    dom.sidebarSubtitle.textContent = "Capas de ejemplo, analisis satelital e instrumentos beta para monitoreo de cultivos.";
  }
  if (dom.overlayMode) {
    dom.overlayMode.textContent = state.activeWizard;
  }
  clearPlanningModuleFocus();
  updateMapSummary();
}

function focusPlanningModuleCard() {
  if (!dom.planningCard) {
    return;
  }

  dom.planningCard.classList.add("entry-focus");
  dom.planningCard.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });

  window.clearTimeout(focusPlanningModuleCard.timeoutId);
  focusPlanningModuleCard.timeoutId = window.setTimeout(() => {
    clearPlanningModuleFocus();
  }, 2200);
}

function clearPlanningModuleFocus() {
  if (dom.planningCard) {
    dom.planningCard.classList.remove("entry-focus");
  }
}

function syncEntryRouteUi(route = state.entryRoute || "agronomia") {
  const isPlanning = route === "planificacion";
  if (dom.appShell) {
    dom.appShell.dataset.route = route;
  }
  if (dom.tabImageryBtn) {
    dom.tabImageryBtn.classList.toggle("hidden", isPlanning);
  }
  if (dom.tabModulesBtn) {
    dom.tabModulesBtn.textContent = isPlanning ? "Modulos territoriales" : "Modulos Agricolas";
  }
  if (dom.modulesSectionKicker) {
    dom.modulesSectionKicker.textContent = isPlanning ? "Planeamiento" : "Herramientas beta";
  }
  if (dom.modulesSectionTitle) {
    dom.modulesSectionTitle.textContent = isPlanning ? "Planificacion territorial" : "Modulos Agricolas";
  }
  if (dom.modulesSectionCopy) {
    dom.modulesSectionCopy.textContent = isPlanning
      ? "Ruta territorial con modulos de aptitud, priorizacion de candidatos y visor 3D urbano."
      : "Nucleo del sistema para agricultura de precision, relieve, clima y flujos guiados para monitoreo productivo.";
  }
  if (dom.modeFooterPill) {
    dom.modeFooterPill.textContent = isPlanning ? "Territorio inteligente" : "Agronomia digital";
  }
  if (Array.isArray(dom.planningModuleCards)) {
    dom.planningModuleCards.forEach((card) => {
      card.classList.toggle("hidden", !isPlanning);
    });
  }
  if (Array.isArray(dom.agronomyModuleCards)) {
    dom.agronomyModuleCards.forEach((card) => {
      card.classList.toggle("hidden", isPlanning);
    });
  }
}

function initializeMap() {
  mapState.map = L.map("map", {
    zoomControl: false,
    attributionControl: true,
    maxZoom: 22,
  }).setView([-0.503, -78.59], 11);

  L.control.zoom({ position: "bottomright" }).addTo(mapState.map);

  mapState.baseLayers.satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Esri World Imagery",
      // Overzoom the last stable Esri tiles to avoid the "Map data not yet available"
      // placeholders that appear in some areas at the deepest native levels.
      maxNativeZoom: 18,
      maxZoom: 22,
    }
  );

  mapState.baseLayers.streets = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "OpenStreetMap",
      maxNativeZoom: 19,
      maxZoom: 22,
    }
  );

  setBaseLayer(state.baseLayer, true);

  mapState.studyAreaLayer = L.geoJSON(studyArea, {
    style: {
      color: "#d6a96f",
      weight: 2,
      fillOpacity: 0,
      dashArray: "6 8",
    },
  }).addTo(mapState.map);

  mapState.controlGroup = new L.FeatureGroup();
  mapState.map.addLayer(mapState.controlGroup);

  const drawControl = new L.Control.Draw({
    position: "bottomright",
    edit: {
      featureGroup: mapState.controlGroup,
      edit: false,
      remove: true,
    },
    draw: {
      polyline: false,
      rectangle: false,
      circle: false,
      circlemarker: false,
      marker: false,
      polygon: {
        allowIntersection: false,
        showArea: true,
        shapeOptions: {
          color: "#cb9440",
          weight: 2,
          fillColor: "#cb9440",
          fillOpacity: 0.22,
        },
      },
    },
  });

  mapState.map.addControl(drawControl);

  mapState.map.on(L.Draw.Event.CREATED, (event) => {
    mapState.controlGroup.clearLayers();
    const layer = event.layer;
    mapState.controlGroup.addLayer(layer);
    setCurrentPlot(layer.toGeoJSON(), "Poligono dibujado");
  });

  mapState.map.on(L.Draw.Event.DELETED, () => {
    clearCurrentPlot(true);
  });

  mapState.map.on("zoomend", maybeRefreshScenePreviewQuality);

  dom.overlayMode.textContent = state.activeWizard;
  updateLayerVisibility();
  updateMapSummary();
  renderSentinelOverlay();
}

function setDefaultDates() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 365);

  dom.startDate.value = formatDateInput(startDate);
  dom.endDate.value = formatDateInput(endDate);
  dom.cloudValue.textContent = `${dom.cloudRange.value}%`;
}

function setActiveTab(tabId) {
  state.activeTab = tabId;
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
  dom.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabId);
  });
  dom.sidebar.classList.remove("open");
}

function renderLayerTree() {
  dom.layersTree.innerHTML = layerCatalog
    .map((group) => {
      const items = group.items
        .map(
          (item) => `
            <label class="layer-item">
              <span class="layer-toggle">
                <input type="checkbox" data-layer="${item.id}" ${item.id === "lotes" ? "checked" : ""}>
                <span>
                  <strong>${item.title}</strong>
                  <small>${item.description}</small>
                </span>
              </span>
            </label>
          `
        )
        .join("");

      return `
        <section class="layer-group">
          <strong>${group.group}</strong>
          ${items}
        </section>
      `;
    })
    .join("");

  dom.layersTree.querySelectorAll("input[data-layer]").forEach((input) => {
    input.addEventListener("change", updateLayerVisibility);
  });
}

function updateLayerVisibility() {
  if (!mapState.map) {
    return;
  }

  const toggles = Array.from(dom.layersTree.querySelectorAll("input[data-layer]"));
  toggles.forEach((input) => {
    const layerId = input.dataset.layer;
    const shouldShow = input.checked;
    if (shouldShow && !mapState[layerKey(layerId)]) {
      addGeoLayer(layerId);
    } else if (!shouldShow && mapState[layerKey(layerId)]) {
      mapState.map.removeLayer(mapState[layerKey(layerId)]);
      mapState[layerKey(layerId)] = null;
    }
  });
}

function addGeoLayer(layerId) {
  const geojson = geoSources[layerId];
  if (!geojson) {
    return;
  }

  const layer = L.geoJSON(geojson, {
    style: () => layerStyles[layerId],
    pointToLayer: (feature, latlng) =>
      L.circleMarker(latlng, {
        ...getPointMarkerStyle(layerId, feature),
      }),
    onEachFeature: (feature, featureLayer) => {
      const title = feature.properties?.name || "Elemento";
      const copy = buildLayerDescription(layerId, feature.properties);
      featureLayer.bindPopup(
        `<h3 class="popup-title">${title}</h3><p class="popup-copy">${copy}</p>`
      );

      if (layerId === "lotes") {
        featureLayer.on("click", () => {
          setCurrentPlot(feature, title);
          setActiveTab("modulos");
        });
      }
    },
  });

  layer.addTo(mapState.map);
  mapState[layerKey(layerId)] = layer;
}

function buildLayerDescription(layerId, properties = {}) {
  if (layerId === "lotes") {
    return `${properties.crop || "Cultivo"} / ${properties.owner || "Unidad de manejo"}. Toca el lote para usarlo como parcela activa.`;
  }
  if (layerId === "estaciones") {
    return "Punto de referencia climatica para integraciones futuras.";
  }
  if (layerId === "canales") {
    return "Infraestructura de riego demostrativa para analisis hidrico.";
  }
  if (layerId === "manchaUrbana") {
    return `Nodo ${properties.hierarchy || "urbano"} con crecimiento relativo ${(Number(properties.growthRate || 0) * 100).toFixed(0)}%.`;
  }
  if (layerId === "equipamientos") {
    return `${formatFacilityTypeLabel(properties.serviceType)} de escala ${properties.level || "local"} usado para medir cobertura territorial.`;
  }
  return "Capa demostrativa integrada en el visor del geoportal.";
}

function getPointMarkerStyle(layerId, feature = null) {
  if (layerId === "equipamientos") {
    const serviceType = feature?.properties?.serviceType;
    if (serviceType === "hospital") {
      return {
        radius: 8,
        weight: 2,
        color: "#7f3f57",
        fillColor: "#d97f9d",
        fillOpacity: 0.92,
      };
    }
    if (serviceType === "escuela") {
      return {
        radius: 8,
        weight: 2,
        color: "#966b22",
        fillColor: "#efc36b",
        fillOpacity: 0.94,
      };
    }
    return {
      radius: 7,
      weight: 2,
      color: "#1f6a50",
      fillColor: "#69bb8f",
      fillOpacity: 0.94,
    };
  }

  return {
    radius: 7,
    weight: 2,
    color: "#1a4f69",
    fillColor: "#6fc2d6",
    fillOpacity: 0.9,
  };
}

async function filterSentinelImages() {
  const requestId = ++state.sentinelRequestId;
  setSentinelBusy(true);

  try {
    const images = await fetchSentinelImages();
    if (requestId !== state.sentinelRequestId) {
      return;
    }

    state.sentinelMode = "real";
    state.sentinelError = null;
    state.filteredImages = images;
    applySelectedScene();
    await refreshActiveAnalysis({ silent: true });
  } catch (error) {
    if (requestId !== state.sentinelRequestId) {
      return;
    }

    const sensor = getActiveSensor();
    state.sentinelMode = "demo";
    state.sentinelTransport = "demo";
    state.sentinelCacheHit = false;
    state.sentinelError = error instanceof Error ? error.message : `No fue posible conectar con ${sensor.providerLabel}.`;
    state.filteredImages = filterDemoSentinelImages();
    applySelectedScene();
    await refreshActiveAnalysis({ silent: true });
  } finally {
    if (requestId === state.sentinelRequestId) {
      setSentinelBusy(false);
      renderSceneControls();
      renderSentinelSourceStatus();
      renderSentinelResults();
      renderLegend();
      renderAnalysisStatus();
      renderAnalysisSummary();
      renderCompareSummary();
      renderSentinelOverlay();
      renderWizardAssistantState();
    }
  }
}

async function fetchSentinelImages() {
  const sensor = getActiveSensor();
  const query = buildSentinelQuery();
  const backend = sensor.backendEligible
    ? await detectBackend(!state.backendAvailable)
    : { available: false, url: null };

  if (backend.available) {
    try {
      return await fetchSentinelImagesFromProxy(query);
    } catch (error) {
      state.backendAvailable = false;
      state.backendUrl = null;
      state.backendChecked = true;
    }
  }

  return fetchDirectSensorImages(query);
}

function buildSentinelQuery() {
  const { start, end } = normalizeDateRange(dom.startDate.value, dom.endDate.value);
  const maxCloud = Number(dom.cloudRange.value);
  const searchArea = getSearchArea();

  state.sentinelQueryScopeLabel = state.currentPlot ? state.currentPlotLabel : "Canton Mejia";

  return {
    sensorId: state.activeSensorId,
    collection: getActiveSensor().collection,
    start,
    end,
    maxCloud,
    bbox: turf.bbox(searchArea).map((value) => Number(value.toFixed(6))),
    scopeLabel: state.sentinelQueryScopeLabel,
  };
}

async function detectBackend(force = false) {
  if (state.backendChecked && !force) {
    return { available: state.backendAvailable, url: state.backendUrl };
  }

  const candidates = getBackendCandidates();
  for (const baseUrl of candidates) {
    try {
      const payload = await fetchJson(`${baseUrl}${backendService.healthPath}`);
      state.backendChecked = true;
      state.backendAvailable = true;
      state.backendUrl = baseUrl;
      state.backendCacheEntries = Number(payload.cacheEntries) || 0;
      return { available: true, url: baseUrl };
    } catch (error) {
      // Prueba el siguiente candidato.
    }
  }

  state.backendChecked = true;
  state.backendAvailable = false;
  state.backendUrl = null;
  return { available: false, url: null };
}

function getBackendCandidates() {
  const localOrigins = ["127.0.0.1", "localhost"];
  const candidates = [];

  if ((window.location.protocol === "http:" || window.location.protocol === "https:")
    && localOrigins.includes(window.location.hostname)) {
    candidates.push(window.location.origin);
  }

  candidates.push(...backendService.defaultOrigins);
  return [...new Set(candidates)];
}

async function fetchSentinelImagesFromProxy(query) {
  if (!state.backendUrl) {
    throw new Error("El backend local aun no esta disponible.");
  }

  const payload = await fetchJson(`${state.backendUrl}${backendService.searchPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  state.sentinelTransport = "proxy";
  state.sentinelCacheHit = Boolean(payload.cacheHit);
  state.backendCacheEntries = Number(payload.cacheEntries) || state.backendCacheEntries;

  return (Array.isArray(payload.images) ? payload.images : [])
    .map((image) => enrichSceneMetadata(image))
    .sort((a, b) => (b.datetime || b.date).localeCompare(a.datetime || a.date));
}

async function fetchDirectSensorImages(query) {
  const sensor = getSensorConfig(query.sensorId);
  if (sensor.searchProvider === "copernicus") {
    return fetchDirectSentinelImages(query, sensor);
  }
  return fetchEarthSearchImages(query, sensor);
}

async function fetchDirectSentinelImages(query, sensor = getActiveSensor()) {
  const params = new URLSearchParams({
    collections: sensor.collection || sentinelService.collection,
    limit: String(sensor.limit || sentinelService.limit),
    bbox: query.bbox.join(","),
    datetime: `${query.start}T00:00:00Z/${query.end}T23:59:59Z`,
    fields: sentinelService.fields.join(","),
  });

  const response = await fetch(`${sentinelService.catalogUrl}/search?${params.toString()}`, {
    headers: {
      Accept: "application/geo+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Copernicus STAC devolvio ${response.status}.`);
  }

  const payload = await response.json();
  const features = Array.isArray(payload.features) ? payload.features : [];
  state.sentinelTransport = "direct";
  state.sentinelCacheHit = false;

  return features
    .map(mapStacScene)
    .filter((image) => (Number.isFinite(image.cloud) ? image.cloud <= query.maxCloud : true))
    .sort((a, b) => b.datetime.localeCompare(a.datetime));
}

async function fetchEarthSearchImages(query, sensor = getActiveSensor()) {
  const response = await fetch(`${earthSearchService.catalogUrl}/search`, {
    method: "POST",
    headers: {
      Accept: "application/geo+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collections: [sensor.collection],
      bbox: query.bbox,
      datetime: `${query.start}T00:00:00Z/${query.end}T23:59:59Z`,
      limit: sensor.limit || earthSearchService.limit,
    }),
  });

  if (!response.ok) {
    throw new Error(`Earth Search devolvio ${response.status}.`);
  }

  const payload = await response.json();
  const features = Array.isArray(payload.features) ? payload.features : [];
  state.sentinelTransport = "direct";
  state.sentinelCacheHit = false;

  return features
    .map((feature) => mapEarthSearchScene(feature, sensor))
    .filter((image) => (!sensor.cloudEnabled || !Number.isFinite(image.cloud) || image.cloud <= query.maxCloud))
    .sort((a, b) => (b.datetime || b.date).localeCompare(a.datetime || a.date));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`La solicitud devolvio ${response.status}.`);
  }
  return response.json();
}

function mapStacScene(feature) {
  const properties = feature.properties || {};
  const platform = formatPlatform(properties.platform, "Sentinel-2");
  const gridCode = properties["grid:code"] || "Sin grilla";
  const orbit = properties["sat:relative_orbit"] != null
    ? `R${String(properties["sat:relative_orbit"]).padStart(3, "0")}`
    : "Sin orbita";
  const datetime = properties.datetime || "";
  const cloud = Number(properties["eo:cloud_cover"]);
  const level = properties["processing:level"] || "L2";
  const timeliness = properties["product:timeliness_category"] || "NRT";

  return enrichSceneMetadata({
    id: feature.id,
    sensorId: "sentinel2",
    title: `${platform} / ${gridCode}`,
    gridCode,
    date: datetime.slice(0, 10),
    datetime,
    cloud: Number.isFinite(cloud) ? Number(cloud.toFixed(2)) : null,
    orbit,
    note: `Escena real desde Copernicus STAC. Nivel ${level} y disponibilidad ${timeliness}.`,
    thumbnail: getFeatureThumbnailHref(feature, "sentinel2") || null,
    previewHref: getFeaturePreviewHref(feature, "sentinel2") || null,
    stacLink: feature.links?.find((link) => link.rel === "self")?.href || null,
    geometry: feature.geometry || null,
    bbox: feature.bbox || null,
    source: "real",
    baseIndices: deriveBetaIndicesFromScene(feature.id, cloud, "sentinel2"),
  });
}

function mapEarthSearchScene(feature, sensor = getActiveSensor()) {
  if (sensor.id === "landsat") {
    return mapLandsatScene(feature);
  }
  if (sensor.id === "sentinel1") {
    return mapSentinel1Scene(feature);
  }
  return mapStacScene(feature);
}

function mapLandsatScene(feature) {
  const properties = feature.properties || {};
  const datetime = properties.datetime || "";
  const platform = formatPlatform(properties.platform, "Landsat 8/9");
  const cloud = Number(properties["eo:cloud_cover"]);
  const wrsPath = Number(properties["landsat:wrs_path"]);
  const wrsRow = Number(properties["landsat:wrs_row"]);
  const pathRow = Number.isFinite(wrsPath) && Number.isFinite(wrsRow)
    ? `P${String(wrsPath).padStart(3, "0")} R${String(wrsRow).padStart(3, "0")}`
    : properties["landsat:scene_id"] || "Sin trayecto";

  return enrichSceneMetadata({
    id: feature.id,
    sensorId: "landsat",
    title: `${platform} / ${pathRow}`,
    gridCode: pathRow,
    date: datetime.slice(0, 10),
    datetime,
    cloud: Number.isFinite(cloud) ? Number(cloud.toFixed(2)) : null,
    orbit: pathRow,
    note: "Escena real Landsat Collection 2 Level-2 desde Earth Search. Ahora se presenta recortada a la huella real de la escena para una lectura espacial mas limpia.",
    thumbnail: getFeatureThumbnailHref(feature, "landsat") || null,
    previewHref: getFeaturePreviewHref(feature, "landsat") || null,
    stacLink: feature.links?.find((link) => link.rel === "self")?.href || null,
    externalSceneLink: feature.links?.find((link) => link.title === "USGS STAC Item")?.href || null,
    geometry: feature.geometry || null,
    bbox: feature.bbox || null,
    source: "real",
    baseIndices: deriveBetaIndicesFromScene(feature.id, cloud, "landsat"),
  });
}

function mapSentinel1Scene(feature) {
  const properties = feature.properties || {};
  const datetime = properties.datetime || "";
  const platform = formatPlatform(properties.platform, "Sentinel-1");
  const orbitState = properties["sat:orbit_state"] || null;
  const instrumentMode = properties["sar:instrument_mode"] || "IW";
  const polarizations = Array.isArray(properties["sar:polarizations"]) ? properties["sar:polarizations"] : [];
  const orbitLabel = orbitState === "ascending" ? "ASC" : orbitState === "descending" ? "DESC" : "SAR";

  return enrichSceneMetadata({
    id: feature.id,
    sensorId: "sentinel1",
    title: `${platform} / ${instrumentMode} ${formatOrbitState(orbitState)}`,
    date: datetime.slice(0, 10),
    datetime,
    cloud: null,
    orbit: orbitLabel,
    orbitState,
    instrumentMode,
    polarizations,
    note: `Escena radar GRD desde Earth Search con polarizaciones ${polarizations.join("/") || "VV/VH"} y pasada ${formatOrbitState(orbitState).toLowerCase()}.`,
    thumbnail: getFeatureThumbnailHref(feature, "sentinel1") || null,
    previewHref: getFeaturePreviewHref(feature, "sentinel1") || null,
    stacLink: feature.links?.find((link) => link.rel === "self")?.href || null,
    geometry: feature.geometry || null,
    bbox: feature.bbox || null,
    source: "real",
    baseIndices: deriveBetaIndicesFromScene(feature.id, null, "sentinel1"),
  });
}

function getFeatureThumbnailHref(feature, sensorId = state.activeSensorId) {
  const thumbLink = feature?.links?.find((link) => link.rel === "thumbnail")?.href || null;
  if (isBrowserPreviewHref(thumbLink)) {
    return thumbLink;
  }

  const assetThumb = feature?.assets?.thumbnail?.href || null;
  if (isBrowserPreviewHref(assetThumb)) {
    return assetThumb;
  }

  return getFeaturePreviewHref(feature, sensorId);
}

function getFeaturePreviewHref(feature, sensorId = state.activeSensorId) {
  const sensor = getSensorConfig(sensorId);
  const assetPreview = getPreviewAssetHref(feature?.assets, sensor.previewAssetKeys);
  if (isBrowserPreviewHref(assetPreview)) {
    return assetPreview;
  }

  const previewLink = feature?.links?.find((link) => link.rel === "preview" || link.rel === "thumbnail")?.href || null;
  if (isBrowserPreviewHref(previewLink)) {
    return previewLink;
  }

  const assetThumb = feature?.assets?.thumbnail?.href || null;
  return isBrowserPreviewHref(assetThumb) ? assetThumb : null;
}

function getPreviewAssetHref(assets = {}, assetKeys = []) {
  return assetKeys
    .map((key) => assets?.[key]?.href || null)
    .find(Boolean) || null;
}

function isBrowserPreviewHref(href) {
  return typeof href === "string"
    && /^https?:/i.test(href)
    && !/\.(tif|tiff)(?:\?|$)/i.test(href);
}

function filterDemoSentinelImages() {
  const { start, end } = normalizeDateRange(dom.startDate.value, dom.endDate.value);
  const maxCloud = Number(dom.cloudRange.value);
  const sensor = getActiveSensor();
  state.sentinelQueryScopeLabel = state.currentPlot ? state.currentPlotLabel : "Canton Mejia";

  return sensor.demoImages
    .filter((image) => {
      const passesDate = (!start || image.date >= start) && (!end || image.date <= end);
      const passesCloud = !sensor.cloudEnabled || !Number.isFinite(image.cloud) || image.cloud <= maxCloud;
      return passesDate && passesCloud;
    })
    .map((image) => enrichSceneMetadata({
      ...image,
      datetime: `${image.date}T10:15:00Z`,
      source: "demo",
      geometry: image.geometry || null,
      bbox: image.bbox || turf.bbox(studyArea),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function enrichSceneMetadata(image) {
  const sensorId = image.sensorId || state.activeSensorId;
  const normalized = {
    ...image,
    sensorId,
    source: image.source || "demo",
    datetime: image.datetime || `${image.date}T10:15:00Z`,
    previewHref: image.previewHref || image.thumbnail || null,
    baseIndices: image.baseIndices || deriveBetaIndicesFromScene(image.id || "scene", image.cloud, sensorId),
  };
  normalized.sceneAgeDays = getSceneAgeDays(normalized);
  normalized.qualityScore = estimateSceneConfidence(normalized, normalized.sceneAgeDays);
  return normalized;
}

function applySelectedScene() {
  ensureSelectedIndex();
  if (!state.filteredImages.length) {
    state.selectedImageId = null;
    state.selectedCompareImageId = null;
    state.analysisData = null;
    state.compareAnalysis = null;
    state.changeAnalysis = null;
    state.surfaceMode = "primary";
    return;
  }

  if (!state.filteredImages.some((image) => image.id === state.selectedImageId)) {
    state.selectedImageId = state.filteredImages[0].id;
  }

  if (!state.filteredImages.some((image) => image.id === state.selectedCompareImageId)
    || state.selectedCompareImageId === state.selectedImageId) {
    state.selectedCompareImageId = null;
  }

  if (!state.selectedCompareImageId) {
    state.surfaceMode = "primary";
  }
}

function renderSceneControls() {
  const sensor = getActiveSensor();
  const selectedImage = getSelectedImage();
  const compareImage = getCompareImage();
  const hasScenePreview = canRenderSceneLayer(selectedImage);
  const primaryOptions = state.filteredImages.length
    ? state.filteredImages.map((image) => `
        <option value="${image.id}" ${image.id === state.selectedImageId ? "selected" : ""}>
          ${formatSceneOption(image)}
        </option>
      `).join("")
    : `<option value="">Sin escenas</option>`;

  const compareOptions = [
    `<option value="">Sin comparacion</option>`,
    ...state.filteredImages
      .filter((image) => image.id !== state.selectedImageId)
      .map((image) => `
        <option value="${image.id}" ${image.id === state.selectedCompareImageId ? "selected" : ""}>
          ${formatSceneOption(image)}
        </option>
      `),
  ].join("");

  dom.primarySceneSelect.innerHTML = primaryOptions;
  dom.primarySceneSelect.disabled = !state.filteredImages.length;
  dom.compareSceneSelect.innerHTML = compareOptions;
  dom.compareSceneSelect.disabled = state.filteredImages.length < 2;
  dom.clearCompareBtn.disabled = !compareImage;
  dom.toggleSurfaceModeBtn.disabled = !compareImage;
  dom.toggleAnalysisOverlayBtn.disabled = !selectedImage;
  dom.toggleSurfaceModeBtn.textContent = state.surfaceMode === "change" ? "Ver escena activa" : "Ver cambio temporal";
  dom.toggleAnalysisOverlayBtn.textContent = state.showAnalysisOverlay ? "Ver solo escena" : "Ver escena + analisis";
  dom.scenePreviewOpacity.value = Math.round(state.scenePreviewOpacity * 100);
  dom.scenePreviewOpacityValue.textContent = `${Math.round(state.scenePreviewOpacity * 100)}%`;
  dom.scenePreviewOpacity.disabled = !hasScenePreview;
  dom.toggleScenePreviewBtn.disabled = !hasScenePreview;
  const sceneLayerLabel = selectedImage ? getSceneLayerStatusLabel(selectedImage, state.sceneLayerKind) : "escena en mapa";
  dom.toggleScenePreviewBtn.textContent = !hasScenePreview
    ? "Escena no disponible en mapa"
    : state.showScenePreview
      ? `Ocultar ${sceneLayerLabel}`
      : `Mostrar ${sceneLayerLabel}`;

  if (!state.filteredImages.length) {
    dom.sceneTimeline.innerHTML = `<div class="empty-state">Las escenas de ${sensor.label} apareceran aqui ordenadas por fecha.</div>`;
    return;
  }

  dom.sceneTimeline.innerHTML = state.filteredImages
    .map((image) => {
      const isPrimary = image.id === state.selectedImageId;
      const isCompare = image.id === state.selectedCompareImageId;
      return `
        <article class="timeline-chip ${isPrimary ? "primary" : ""} ${isCompare ? "compare" : ""}">
          <button class="chip-main" type="button" data-primary="${image.id}">
            <strong>${localeDate.format(new Date(`${image.date}T00:00:00`))}</strong>
            <span>${image.title}</span>
          </button>
          <button class="chip-compare" type="button" data-compare="${image.id}" ${isPrimary ? "disabled" : ""}>
            ${isCompare ? "Comparando" : "Comparar"}
          </button>
        </article>
      `;
    })
    .join("");

  dom.sceneTimeline.querySelectorAll("[data-primary]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextId = button.dataset.primary;
      if (!nextId || nextId === state.selectedImageId) {
        return;
      }
      state.selectedImageId = nextId;
      if (state.selectedCompareImageId === state.selectedImageId) {
        state.selectedCompareImageId = null;
        state.surfaceMode = "primary";
      }
      renderSceneControls();
      renderSentinelResults();
      refreshActiveAnalysis();
    });
  });

  dom.sceneTimeline.querySelectorAll("[data-compare]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextId = button.dataset.compare;
      if (!nextId || nextId === state.selectedImageId) {
        return;
      }
      state.selectedCompareImageId = state.selectedCompareImageId === nextId ? null : nextId;
      if (!state.selectedCompareImageId) {
        state.surfaceMode = "primary";
      }
      renderSceneControls();
      renderSentinelResults();
      refreshActiveAnalysis({ silent: true });
    });
  });
}

function formatSceneOption(image) {
  return `${localeDate.format(new Date(`${image.date}T00:00:00`))} | ${getSceneMetaLabel(image)} | ${image.title}`;
}

function renderSentinelSourceStatus() {
  const sensor = getActiveSensor();

  dom.sentinelSourceStatus.className = "service-banner";

  if (state.sentinelLoading) {
    dom.sentinelSourceStatus.classList.add("loading");
    dom.sentinelSourceStatus.textContent = `Consultando ${sensor.providerLabel} para ${sensor.label} en ${state.sentinelQueryScopeLabel}...`;
    return;
  }

  if (state.sentinelMode === "real") {
    if (state.sentinelTransport === "proxy") {
      dom.sentinelSourceStatus.classList.add("proxy");
      dom.sentinelSourceStatus.textContent = `Busqueda en vivo de ${sensor.label} via proxy local con cache. Ambito actual: ${state.sentinelQueryScopeLabel}. ${state.sentinelCacheHit ? "Respuesta servida desde cache local." : "Consulta fresca al catalogo."}`;
      return;
    }

    dom.sentinelSourceStatus.classList.add("real");
    dom.sentinelSourceStatus.textContent = sensor.backendEligible
      ? `Busqueda en vivo activa de ${sensor.label} desde ${sensor.directProviderLabel} para ${state.sentinelQueryScopeLabel}. Si activas server.ps1, el visor suma proxy local, cache y mejor trazabilidad.`
      : `Busqueda en vivo activa de ${sensor.label} desde ${sensor.directProviderLabel} para ${state.sentinelQueryScopeLabel}. Este sensor opera directo en el navegador sin proxy local.`;
    return;
  }

  dom.sentinelSourceStatus.classList.add("demo");
  dom.sentinelSourceStatus.textContent = `Sin conexion operativa con ${sensor.providerLabel} para ${sensor.label}. El visor usa escenas demo para no frenar el trabajo. ${state.sentinelError || ""}`.trim();
}

function setSentinelBusy(isBusy) {
  state.sentinelLoading = isBusy;
  dom.sentinelSubmitBtn.disabled = isBusy;
  dom.sentinelSubmitBtn.textContent = isBusy ? "Buscando escenas..." : "Buscar escenas";
  renderSentinelSourceStatus();
}

function renderSentinelResults() {
  const sensor = getActiveSensor();
  if (!state.filteredImages.length) {
    dom.sentinelResults.innerHTML = `
      <div class="empty-state">
        No hay escenas de ${sensor.label} que cumplan el filtro actual para ${state.sentinelQueryScopeLabel}. ${sensor.cloudEnabled ? "Ajusta fechas o permite mayor nubosidad." : "Ajusta fechas para abrir otra ventana temporal."}
      </div>
    `;
    updateMapSummary();
    return;
  }

  dom.sentinelResults.innerHTML = state.filteredImages
    .map((image) => {
      const activeClass = image.id === state.selectedImageId ? "active" : "";
      const compareClass = image.id === state.selectedCompareImageId ? "compare" : "";
      const thumbnailMarkup = image.thumbnail
        ? `<img class="sentinel-thumb" src="${image.thumbnail}" alt="Previsualizacion de ${image.title}" loading="lazy">`
        : "";
      const sourceMarkup = image.source === "real"
        ? `<span class="source-pill">${state.sentinelTransport === "proxy" ? "Proxy local" : sensor.directProviderLabel}</span>`
        : `<span class="source-pill">Demo local</span>`;
      const stacLinkMarkup = image.stacLink
        ? `<a class="text-link" href="${image.stacLink}" target="_blank" rel="noreferrer">Ficha STAC</a>`
        : "";
      const metaPills = [
        `<span class="meta-pill">${localeDate.format(new Date(`${image.date}T00:00:00`))}</span>`,
        `<span class="meta-pill">${getSceneMetaLabel(image)}</span>`,
        image.orbit ? `<span class="meta-pill">${image.orbit}</span>` : "",
        image.instrumentMode ? `<span class="meta-pill">${image.instrumentMode}</span>` : "",
        `<span class="meta-pill">Conf. ${image.qualityScore}/100</span>`,
        `<span class="meta-pill">${formatAgeLabel(image.sceneAgeDays)}</span>`,
        sourceMarkup,
      ].filter(Boolean).join("");

      return `
        <article class="sentinel-card ${activeClass} ${compareClass}" data-image="${image.id}">
          ${thumbnailMarkup}
          <div class="section-head">
            <div>
              <p class="section-kicker">${sensor.label}</p>
              <h2>${image.title}</h2>
            </div>
            <div class="card-actions">
              <button class="secondary-button image-select" type="button" data-image="${image.id}">
                ${image.id === state.selectedImageId ? "Activa" : "Usar escena"}
              </button>
              <button class="ghost-button image-compare" type="button" data-compare-image="${image.id}" ${image.id === state.selectedImageId ? "disabled" : ""}>
                ${image.id === state.selectedCompareImageId ? "Comparando" : "Comparar"}
              </button>
            </div>
          </div>
          <div class="sentinel-meta">
            ${metaPills}
          </div>
          <p>${image.note}</p>
          <div class="action-row">
            ${stacLinkMarkup}
          </div>
        </article>
      `;
    })
    .join("");

  dom.sentinelResults.querySelectorAll(".image-select").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedImageId = button.dataset.image;
      if (state.selectedCompareImageId === state.selectedImageId) {
        state.selectedCompareImageId = null;
        state.surfaceMode = "primary";
      }
      renderSceneControls();
      renderSentinelResults();
      refreshActiveAnalysis();
    });
  });

  dom.sentinelResults.querySelectorAll(".image-compare").forEach((button) => {
    button.addEventListener("click", () => {
      const nextId = button.dataset.compareImage;
      if (!nextId || nextId === state.selectedImageId) {
        return;
      }
      state.selectedCompareImageId = state.selectedCompareImageId === nextId ? null : nextId;
      if (!state.selectedCompareImageId) {
        state.surfaceMode = "primary";
      }
      renderSceneControls();
      renderSentinelResults();
      refreshActiveAnalysis({ silent: true });
    });
  });

  updateMapSummary();
}

function renderIndexButtons() {
  ensureSelectedIndex();
  dom.indexButtons.innerHTML = getSupportedIndexKeys()
    .map(
      (indexKey) => `
        <button
          class="index-button ${indexKey === state.selectedIndex ? "active" : ""}"
          type="button"
          data-index="${indexKey}"
        >
          ${indexConfig[indexKey].label}
        </button>
      `
    )
    .join("");

  dom.indexButtons.querySelectorAll(".index-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedIndex = button.dataset.index;
      renderIndexButtons();
      renderLegend();
      renderAnalysisSummary();
      renderCompareSummary();
      renderSentinelOverlay();
      updateMapSummary();
    });
  });

  renderLegend();
}

function renderLegend() {
  const config = getSurfaceConfig();
  const stats = state.surfaceMode === "change"
    ? getRenderableChangeAnalysis()?.summary?.[state.selectedIndex] || null
    : getRenderableAnalysis()?.summary?.[state.selectedIndex] || null;
  const statsMarkup = stats
    ? `
      <div class="legend-values compact">
        <span>Media ${formatLegendStat(stats.mean, config)}</span>
        <span>P10 ${formatLegendStat(stats.p10, config)}</span>
        <span>P90 ${formatLegendStat(stats.p90, config)}</span>
      </div>
    `
    : "";

  dom.legendCard.innerHTML = `
    <strong>${config.label}</strong>
    <span>${config.description}</span>
    <div
      class="legend-scale"
      style="background: linear-gradient(90deg, ${config.colors.join(", ")});"
    ></div>
    <div class="legend-values">
      <span>${formatValue(config.min, config)}</span>
      <span>${formatValue((config.min + config.max) / 2, config)}</span>
      <span>${formatValue(config.max, config)}</span>
    </div>
    ${statsMarkup}
  `;
}

async function refreshActiveAnalysis({ silent = false } = {}) {
  const image = getSelectedImage();
  const compareImage = getCompareImage();

  if (!image) {
    state.analysisData = null;
    state.compareAnalysis = null;
    state.changeAnalysis = null;
    state.analysisError = null;
    renderAnalysisStatus();
    renderAnalysisSummary();
    renderCompareSummary();
    renderLegend();
    renderSentinelOverlay();
    updateMapSummary();
    renderWizardAssistantState();
    return null;
  }

  const requestId = ++state.analysisRequestId;
  const context = buildAnalysisContext(image);
  state.analysisBusy = true;
  state.analysisError = null;
  state.analysisData = null;
  state.compareAnalysis = null;
  state.changeAnalysis = null;
  renderAnalysisStatus();
  renderAnalysisSummary();
  renderCompareSummary();
  renderLegend();
  updateMapSummary();

  try {
    const backend = getSensorForImage(image).backendEligible
      ? await detectBackend(!state.backendAvailable)
      : { available: false, url: null };
    const analysis = await computeAnalysisForImage(image, context, backend);
    let compareAnalysis = null;
    let changeAnalysis = null;

    if (compareImage && compareImage.id !== image.id) {
      const compareContext = buildAnalysisContext(compareImage);
      compareAnalysis = await computeAnalysisForImage(compareImage, compareContext, backend);
      changeAnalysis = buildChangeAnalysis(analysis, compareAnalysis);
    }

    if (requestId !== state.analysisRequestId) {
      return null;
    }

    state.analysisData = analysis;
    state.compareAnalysis = compareAnalysis;
    state.changeAnalysis = changeAnalysis;
    if (!silent) {
      const sourceLabel = analysis.processingMode === "backend"
        ? "backend local"
        : image.source === "real"
          ? "motor local calibrado"
          : "modo demo";
      const compareLabel = compareAnalysis
        ? ` y comparado contra ${compareAnalysis.imageId}`
        : "";
      setStatus(`AOI ${analysis.context.scopeLabel} procesado en ${indexConfig[state.selectedIndex].label} usando ${sourceLabel}${compareLabel}.`);
    }

    return analysis;
  } catch (error) {
    if (requestId !== state.analysisRequestId) {
      return null;
    }

    state.analysisError = error instanceof Error ? error.message : "No fue posible completar el analisis.";
    state.analysisData = buildLocalAnalysis(image, context);
    return state.analysisData;
  } finally {
    if (requestId === state.analysisRequestId) {
      state.analysisBusy = false;
      renderAnalysisStatus();
      renderAnalysisSummary();
      renderCompareSummary();
      renderLegend();
      renderSentinelOverlay();
      updateMapSummary();
      syncAnalysisDrivenModules();
      renderWizardAssistantState();
    }
  }
}

async function computeAnalysisForImage(image, context, backend = null) {
  const sensor = getSensorForImage(image);
  const backendStatus = sensor.backendEligible
    ? backend || await detectBackend(!state.backendAvailable)
    : { available: false, url: null };

  if (backendStatus.available) {
    try {
      return await fetchBackendAnalysis(image, context);
    } catch (error) {
      state.analysisError = error instanceof Error ? error.message : "El backend local no respondio.";
    }
  }

  return buildLocalAnalysis(image, context);
}

async function fetchBackendAnalysis(image, context) {
  if (!state.backendUrl) {
    throw new Error("El backend local no esta listo.");
  }

  const payload = await fetchJson(`${state.backendUrl}${backendService.analysisPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: {
        id: image.id,
        date: image.date,
        datetime: image.datetime,
        cloud: image.cloud,
      source: image.source,
      orbit: image.orbit,
      sensorId: image.sensorId,
      baseIndices: image.baseIndices,
    },
      target: {
        scopeLabel: context.scopeLabel,
        scopeType: context.scopeType,
        areaHa: context.areaHa,
        centroid: context.centroid,
        bbox: context.bbox,
      },
      activeWizard: state.activeWizard,
    }),
  });

  state.backendCacheEntries = Number(payload.cacheEntries) || state.backendCacheEntries;
  const summary = normalizeAnalysisSummary(payload.summary, image, context);

  return {
    imageId: image.id,
    imageDate: image.date,
    sensorId: image.sensorId,
    context,
    summary,
    quality: {
      confidenceScore: Number(payload.quality?.confidenceScore) || estimateSceneConfidence(image, context.freshnessDays),
      coveragePct: Number(payload.quality?.coveragePct) || 0,
      freshnessDays: Number(payload.quality?.freshnessDays) || context.freshnessDays,
    },
    management: payload.management || deriveManagementMix(summary[getFocusIndexKey(image)], context.areaHa, image),
    diagnostics: payload.diagnostics || deriveDiagnostics(summary, {
      confidenceScore: Number(payload.quality?.confidenceScore) || estimateSceneConfidence(image, context.freshnessDays),
      coveragePct: Number(payload.quality?.coveragePct) || 0,
    }, image),
    surface: buildAnalysisSurface(context, summary, image),
    processingMode: "backend",
    cacheHit: Boolean(payload.cacheHit),
    generatedAt: payload.generatedAt || new Date().toISOString(),
  };
}

function buildAnalysisContext(image, target = getCurrentAnalysisTarget()) {
  const areaHa = turf.area(target.feature) / 10000;
  const centroid = turf.centroid(target.feature).geometry.coordinates.map((value) => Number(value.toFixed(6)));
  const bbox = turf.bbox(target.feature).map((value) => Number(value.toFixed(6)));

  return {
    feature: target.feature,
    targetKey: target.targetKey,
    scopeLabel: target.scopeLabel,
    scopeType: target.scopeType,
    areaHa,
    centroid,
    bbox,
    freshnessDays: getSceneAgeDays(image),
  };
}

function getCurrentAnalysisTarget() {
  const feature = getSearchArea();
  return {
    feature,
    scopeLabel: state.currentPlot ? state.currentPlotLabel : "Canton Mejia",
    scopeType: state.currentPlot ? "plot" : "studyArea",
    targetKey: getFeatureKey(feature),
  };
}

function resolveAnalysisForTarget(image, targetInfo) {
  const context = buildAnalysisContext(image, targetInfo);
  if (state.analysisData
    && state.analysisData.imageId === image.id
    && state.analysisData.context.targetKey === context.targetKey) {
    return state.analysisData;
  }
  return buildLocalAnalysis(image, context);
}

function buildLocalAnalysis(image, context) {
  const summary = buildIndexSummary(image, context);
  const quality = estimateQualityProfile(image, context, summary);
  return {
    imageId: image.id,
    imageDate: image.date,
    sensorId: image.sensorId,
    context,
    summary,
    quality,
    management: deriveManagementMix(summary[getFocusIndexKey(image)], context.areaHa, image),
    diagnostics: deriveDiagnostics(summary, quality, image),
    surface: buildAnalysisSurface(context, summary, image),
    processingMode: "local",
    cacheHit: false,
    generatedAt: new Date().toISOString(),
  };
}

function buildChangeAnalysis(primaryAnalysis, compareAnalysis) {
  const supportedIndexKeys = getSupportedIndexKeys(primaryAnalysis.sensorId);
  const directionKey = getSensorConfig(primaryAnalysis.sensorId).directionIndex;
  const zoneKey = getSensorConfig(primaryAnalysis.sensorId).zoneIndex;
  const zoneThreshold = getZoneDeltaThreshold(zoneKey);
  const summary = {};
  supportedIndexKeys.forEach((indexKey) => {
    summary[indexKey] = {
      mean: primaryAnalysis.summary[indexKey].mean - compareAnalysis.summary[indexKey].mean,
      p10: primaryAnalysis.summary[indexKey].p10 - compareAnalysis.summary[indexKey].p10,
      p90: primaryAnalysis.summary[indexKey].p90 - compareAnalysis.summary[indexKey].p90,
      variability: Math.abs(primaryAnalysis.summary[indexKey].variability - compareAnalysis.summary[indexKey].variability),
    };
  });

  const primaryFeatures = primaryAnalysis.surface?.features || [];
  const compareFeatures = compareAnalysis.surface?.features || [];
  const surface = {
    type: "FeatureCollection",
    features: primaryFeatures.map((feature, index) => {
      const compareFeature = compareFeatures[index];
      const properties = {};
      supportedIndexKeys.forEach((indexKey) => {
        properties[indexKey] = feature.properties[indexKey] - (compareFeature?.properties?.[indexKey] ?? 0);
      });
      properties.zone = properties[zoneKey] >= zoneThreshold
        ? "improve"
        : properties[zoneKey] <= -zoneThreshold
          ? "decline"
          : "stable";
      return {
        ...feature,
        properties,
      };
    }),
  };

  const daysBetween = Math.abs(dayDiff(primaryAnalysis.imageDate, compareAnalysis.imageDate));
  const strongestIndex = getStrongestChangeIndex(summary);

  return {
    sensorId: primaryAnalysis.sensorId,
    summary,
    surface,
    strongestIndex,
    daysBetween,
    direction: summary[directionKey].mean >= 0 ? "recuperacion" : "caida",
  };
}

function normalizeAnalysisSummary(summary, image, context) {
  const fallback = buildIndexSummary(image, context);
  const normalized = {};

  getSupportedIndexKeys(image).forEach((indexKey) => {
    const config = indexConfig[indexKey];
    const source = summary?.[indexKey];
    const mean = Number(source?.mean);
    const p10 = Number(source?.p10);
    const p90 = Number(source?.p90);

    normalized[indexKey] = {
      mean: Number.isFinite(mean) ? clamp(mean, config.min, config.max) : fallback[indexKey].mean,
      p10: Number.isFinite(p10) ? clamp(p10, config.min, config.max) : fallback[indexKey].p10,
      p90: Number.isFinite(p90) ? clamp(p90, config.min, config.max) : fallback[indexKey].p90,
      variability: Number.isFinite(Number(source?.variability))
        ? Math.round(Number(source.variability))
        : fallback[indexKey].variability,
    };
  });

  return normalized;
}

function estimateQualityProfile(image, context, summary) {
  const focusKey = getFocusIndexKey(image);
  const confidenceScore = estimateSceneConfidence(image, context.freshnessDays);
  const focusStability = 100 - Math.min(summary[focusKey].variability, 45);
  const areaPenalty = Math.min(Math.log10(context.areaHa + 1) * 6, 14);
  const coveragePct = Math.round(clamp(confidenceScore * 0.88 + focusStability * 0.12 - areaPenalty, 42, 99));

  return {
    confidenceScore,
    coveragePct,
    freshnessDays: context.freshnessDays,
  };
}

function buildIndexSummary(image, context) {
  const sensor = getSensorForImage(image);
  const summary = {};
  const wizardBias = getWizardBiasBySensor(sensor.id);

  sensor.indices.forEach((indexKey, index) => {
    const config = indexConfig[indexKey];
    const base = image.baseIndices[indexKey];
    const localBias = pseudoNoise(context.centroid[0] * 6.4, context.centroid[1] * 4.7, 17 + index * 13) * 0.045;
    const areaBias = clamp(Math.log10(context.areaHa + 1) * 0.016, -0.05, 0.08) * (context.scopeType === "plot" ? 1 : -0.35);
    const freshnessBias = clamp((18 - Math.min(context.freshnessDays, 18)) / 18 * 0.028, -0.01, 0.028);
    const cloudBias = Number.isFinite(image.cloud) ? (0.18 - image.cloud / 100) * 0.05 : 0;
    const thematicBias = wizardBias[state.activeWizard]?.[indexKey] || 0;
    const mean = clamp(base + localBias + areaBias + freshnessBias + cloudBias + thematicBias, config.min, config.max);
    const spread = clamp(
      0.035
        + (100 - image.qualityScore) / 480
        + Math.abs(pseudoNoise(context.centroid[1] * 8.1, context.centroid[0] * 3.3, 29 + index * 7)) * 0.028
        + (context.scopeType === "plot" ? 0.02 : 0.05),
      0.025,
      (config.max - config.min) * 0.3
    );

    const p10 = clamp(mean - spread, config.min, config.max);
    const p90 = clamp(mean + spread, config.min, config.max);
    const variability = Math.round(((p90 - p10) / (config.max - config.min || 1)) * 100);
    summary[indexKey] = { mean, p10, p90, variability };
  });

  return summary;
}

function buildAnalysisSurface(context, summary, image) {
  const sensor = getSensorForImage(image);
  const zoneKey = sensor.zoneIndex;
  const zoneConfig = indexConfig[zoneKey];
  const zoneRange = zoneConfig.max - zoneConfig.min || 1;
  const cellSize = context.scopeType === "plot"
    ? clamp(Math.sqrt(context.areaHa + 0.1) / 28, 0.06, 0.24)
    : clamp(Math.sqrt(context.areaHa + 1) / 16, 1.2, 2.6);

  const grid = turf.squareGrid(context.bbox, cellSize, { units: "kilometers" });
  const features = grid.features
    .map((cell, index) => {
      const centroid = turf.centroid(cell);
      if (!turf.booleanPointInPolygon(centroid, context.feature)) {
        return null;
      }

      const [lon, lat] = centroid.geometry.coordinates;
      const properties = {};

      sensor.indices.forEach((indexKey, position) => {
        const config = indexConfig[indexKey];
        const stats = summary[indexKey];
        const amplitude = Math.max((stats.p90 - stats.p10) / 2, 0.012);
        const waveA = pseudoNoise(lon * 7.1, lat * 5.3, image.id.length + index * 11 + position * 17);
        const waveB = pseudoNoise(lat * 12.4, lon * 3.8, 41 + index * 13 + position * 5);
        properties[indexKey] = clamp(
          stats.mean + waveA * amplitude * 0.9 + waveB * amplitude * 0.32,
          config.min,
          config.max
        );
      });

      properties.zone = properties[zoneKey] >= summary[zoneKey].mean + zoneRange * 0.035
        ? "high"
        : properties[zoneKey] <= summary[zoneKey].mean - zoneRange * 0.04
          ? "low"
          : "medium";
      return { ...cell, properties };
    })
    .filter(Boolean);

  return { type: "FeatureCollection", features };
}

function deriveManagementMix(focusStats, areaHa, imageOrSensor = null) {
  const sensor = typeof imageOrSensor === "string"
    ? getSensorConfig(imageOrSensor)
    : getSensorForImage(imageOrSensor);
  const focusConfig = indexConfig[sensor.focusIndex];
  const normalizedMean = normalizeMetricValue(focusStats.mean, focusConfig);
  const rawHigh = clamp(18 + normalizedMean * 42 - focusStats.variability * 0.16, 10, 58);
  const rawLow = clamp(14 + (1 - normalizedMean) * 40 + focusStats.variability * 0.2 + areaHa * 0.01, 8, 56);
  const high = Math.round(rawHigh);
  const low = Math.round(rawLow);
  const medium = Math.max(100 - high - low, 8);
  const adjustedHigh = Math.max(100 - medium - low, 8);

  return {
    high: adjustedHigh,
    medium,
    low,
    recommendedAction: adjustedHigh > low
      ? `Prioriza sectores con ${focusConfig.label} alto.`
      : `Enfoca verificacion en zonas con ${focusConfig.label} bajo.`,
  };
}

function deriveDiagnostics(summary, quality, image = null) {
  const sensor = getSensorForImage(image);
  const moistureKey = sensor.moistureIndex;
  const focusKey = sensor.focusIndex;
  const moistureConfig = indexConfig[moistureKey];
  const focusConfig = indexConfig[focusKey];
  const moistureNormalized = normalizeMetricValue(summary[moistureKey].mean, moistureConfig);
  const focusNormalized = normalizeMetricValue(summary[focusKey].mean, focusConfig);
  const moistureSignal = sensor.id === "sentinel1"
    ? moistureNormalized < 0.34
      ? "Retrodispersion humeda baja"
      : moistureNormalized > 0.64
        ? "Retrodispersion humeda alta"
        : "Retrodispersion equilibrada"
    : moistureNormalized < 0.34
      ? "Deficit hidrico probable"
      : moistureNormalized > 0.64
        ? "Humedad alta"
        : "Humedad equilibrada";
  const vigorSignal = sensor.id === "sentinel1"
    ? focusNormalized < 0.4
      ? "Cobertura estructural irregular"
      : focusNormalized > 0.68
        ? "Cobertura estructural alta"
        : "Cobertura estructural media"
    : focusNormalized < 0.45
      ? "Vigor irregular"
      : focusNormalized > 0.7
        ? "Vigor alto"
        : "Vigor medio";
  const recommendedIndex = getRecommendedIndex(summary, image);
  const alertLevel = quality.confidenceScore < 55 || summary[focusKey].variability > 26
    ? "Seguimiento prioritario"
    : "Condicion estable";

  return { moistureSignal, vigorSignal, recommendedIndex, alertLevel };
}

function getRecommendedIndex(summary, image = null) {
  const sensor = getSensorForImage(image);

  if (sensor.id === "landsat") {
    if (summary.NDMI.mean < 0.11) {
      return "NDMI";
    }
    if (summary.NDVI.variability > 24) {
      return "MSAVI";
    }
    if (summary.NDWI.mean > 0.18) {
      return "NDWI";
    }
    return "NDVI";
  }

  if (sensor.id === "sentinel1") {
    if (summary.RVI.mean < 0.38) {
      return "RVI";
    }
    if (summary.VH_VV.mean > 0.54) {
      return "VH_VV";
    }
    if (summary.RVI.variability > 22) {
      return "VV";
    }
    return "RVI";
  }

  if (summary.NDWI.mean < 0.12) {
    return "NDWI";
  }
  if (summary.NDRE.mean < 0.3) {
    return "NDRE";
  }
  if (summary.NDVI.variability > 24) {
    return "MSAVI";
  }
  return "NDVI";
}

function renderAnalysisStatus() {
  const image = getSelectedImage();
  const compareImage = getCompareImage();
  const sensor = image ? getSensorForImage(image) : getActiveSensor();
  dom.useStudyAreaBtn.disabled = !state.currentPlot;
  dom.rerunAnalysisBtn.disabled = state.analysisBusy || !image;
  dom.analysisStatus.className = "service-banner";

  if (!image) {
    dom.analysisStatus.classList.add("local-processing");
    dom.analysisStatus.textContent = `Selecciona una escena de ${sensor.label} para generar el perfil operativo del AOI.`;
    return;
  }

  if (state.analysisBusy) {
    dom.analysisStatus.classList.add("loading");
    dom.analysisStatus.textContent = `Procesando ${indexConfig[state.selectedIndex].label} para ${state.currentPlot ? state.currentPlotLabel : "Canton Mejia"}...`;
    return;
  }

  if (state.analysisData) {
    if (state.analysisData.processingMode === "backend") {
      dom.analysisStatus.classList.add("proxy");
      const compareLabel = compareImage ? ` Comparando contra ${localeDate.format(new Date(`${compareImage.date}T00:00:00`))}.` : "";
      dom.analysisStatus.textContent = `Procesamiento del AOI via backend local. Cobertura util ${state.analysisData.quality.coveragePct}% y ${state.analysisData.cacheHit ? "respuesta en cache." : "resultado recien calculado."}${compareLabel}`;
      return;
    }

    dom.analysisStatus.classList.add(image.source === "real" ? "local-processing" : "demo");
    dom.analysisStatus.textContent = image.source === "real"
      ? `Procesamiento local calibrado para ${sensor.label}${compareImage ? " y una segunda escena temporal" : ""}. Sirve para exploracion operativa del AOI; el pixel-raster real requerira un motor geoespacial adicional.`
      : "Procesamiento local en modo demo para mantener el flujo de analisis.";
    return;
  }

  dom.analysisStatus.classList.add("demo");
  dom.analysisStatus.textContent = state.analysisError || "No fue posible preparar el analisis del AOI.";
}

function renderAnalysisSummary() {
  const image = getSelectedImage();
  const analysis = getRenderableAnalysis(image);

  if (!image || !analysis) {
    resetMetricGrid(dom.sceneSummary, "Selecciona una escena para generar un resumen operativo del AOI.");
    return;
  }

  const stats = analysis.summary[state.selectedIndex];
  const managementText = `Alta ${analysis.management.high}% / Media ${analysis.management.medium}% / Baja ${analysis.management.low}%`;
  const cards = [
    {
      label: analysis.context.scopeType === "plot" ? "Lote activo" : "Ambito activo",
      value: analysis.context.scopeLabel,
      copy: `${analysis.context.areaHa.toFixed(1)} ha procesadas para el AOI actual.`,
    },
    {
      label: "Confianza escena",
      value: `${analysis.quality.confidenceScore}/100`,
      copy: `Nubes ${formatCloudValue(image.cloud)} y antiguedad ${formatAgeLabel(analysis.quality.freshnessDays).toLowerCase()}.`,
    },
    {
      label: indexConfig[state.selectedIndex].label,
      value: formatValue(stats.mean, indexConfig[state.selectedIndex]),
      copy: `Rango operativo P10 ${formatValue(stats.p10, indexConfig[state.selectedIndex])} / P90 ${formatValue(stats.p90, indexConfig[state.selectedIndex])}.`,
      highlight: true,
    },
    {
      label: "Cobertura util",
      value: `${analysis.quality.coveragePct}%`,
      copy: analysis.processingMode === "backend" ? "Resumen calculado y trazado por backend local." : "Resumen calculado en el navegador para no detener el visor.",
    },
    {
      label: "Zonas de manejo",
      value: managementText,
      copy: analysis.management.recommendedAction,
    },
    {
      label: "Foco recomendado",
      value: analysis.diagnostics.recommendedIndex,
      copy: `${analysis.diagnostics.alertLevel}. ${analysis.diagnostics.moistureSignal}.`,
    },
  ];

  dom.sceneSummary.classList.add("scene-summary");
  dom.sceneSummary.classList.remove("empty-state");
  dom.sceneSummary.classList.add("has-data");
  dom.sceneSummary.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card ${card.highlight ? "highlight" : ""}">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderCompareSummary() {
  const primary = getSelectedImage();
  const compare = getCompareImage();
  const compareAnalysis = getRenderableCompareAnalysis(compare);
  const change = getRenderableChangeAnalysis(primary, compare);

  if (!primary || !compare || !compareAnalysis || !change) {
    resetMetricGrid(dom.compareSummary, "Activa una segunda escena para comparar fechas y cambios del indice.");
    return;
  }

  const currentDelta = change.summary[state.selectedIndex];
  const cards = [
    {
      label: "Escena comparada",
      value: localeDate.format(new Date(`${compare.date}T00:00:00`)),
      copy: `${compare.title} | Nubes ${formatCloudValue(compare.cloud)}.`,
    },
    {
      label: `Cambio ${indexConfig[state.selectedIndex].label}`,
      value: formatDelta(currentDelta.mean, indexConfig[state.selectedIndex]),
      copy: `Rango delta P10 ${formatDelta(currentDelta.p10, indexConfig[state.selectedIndex])} / P90 ${formatDelta(currentDelta.p90, indexConfig[state.selectedIndex])}.`,
      highlight: true,
    },
    {
      label: "Ventana temporal",
      value: `${change.daysBetween} dias`,
      copy: `Comparacion entre ${primary.date} y ${compare.date}.`,
    },
    {
      label: "Lectura dominante",
      value: change.direction === "recuperacion" ? "Mejora" : "Descenso",
      copy: `Indice con mayor cambio: ${indexConfig[change.strongestIndex].label}.`,
    },
    {
      label: "Mapa",
      value: state.surfaceMode === "change" ? "Cambio temporal" : "Escena activa",
      copy: "Alterna entre la superficie de la escena activa y la diferencia temporal.",
    },
    {
      label: "Escena base",
      value: localeDate.format(new Date(`${primary.date}T00:00:00`)),
      copy: `${primary.title} | Confianza ${primary.qualityScore}/100.`,
    },
  ];

  dom.compareSummary.classList.add("compare-summary");
  dom.compareSummary.classList.remove("empty-state");
  dom.compareSummary.classList.add("has-data");
  dom.compareSummary.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card ${card.highlight ? "highlight" : ""}">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.copy}</p>
        </article>
      `
    )
    .join("");
}

function renderSentinelOverlay() {
  if (!mapState.map) {
    return;
  }

  if (mapState.sceneExactLayer) {
    mapState.map.removeLayer(mapState.sceneExactLayer);
    mapState.sceneExactLayer = null;
  }

  if (mapState.scenePreviewLayer) {
    mapState.map.removeLayer(mapState.scenePreviewLayer);
    mapState.scenePreviewLayer = null;
  }

  if (mapState.sceneFootprintLayer) {
    mapState.map.removeLayer(mapState.sceneFootprintLayer);
    mapState.sceneFootprintLayer = null;
  }

  if (mapState.sentinelLayer) {
    mapState.map.removeLayer(mapState.sentinelLayer);
    mapState.sentinelLayer = null;
  }

  const image = getSelectedImage();
  if (!image) {
    setStatus(`No hay escena activa. Usa el filtro de ${getActiveSensor().label} para seleccionar una imagen.`);
    return;
  }

  const analysis = getRenderableAnalysis(image) || buildLocalAnalysis(image, buildAnalysisContext(image));
  const changeAnalysis = getRenderableChangeAnalysis(image, getCompareImage());
  const surfaceConfig = getSurfaceConfig();
  const surfaceDataset = state.surfaceMode === "change" && changeAnalysis ? changeAnalysis.surface : analysis.surface;
  state.sceneLayerKind = state.showScenePreview && canRenderSceneLayer(image) ? "loading" : "off";
  updateMapSummary();

  if (canRenderSceneLayer(image) && state.showScenePreview) {
    renderSceneLayer(image);
  }

  if (image.source === "real" && image.geometry) {
    renderRealSceneFootprint(image, !state.currentPlot);
  }

  if (state.showAnalysisOverlay && surfaceDataset?.features?.length) {
    mapState.sentinelLayer = L.geoJSON(surfaceDataset, {
      style: (feature) => ({
        weight: 0,
        fillOpacity: getAnalysisOverlayOpacity(image),
        fillColor: interpolateColor(
          feature.properties[state.selectedIndex],
          surfaceConfig.min,
          surfaceConfig.max,
          surfaceConfig.colors
        ),
      }),
      onEachFeature: (feature, layer) => {
        const tooltipValue = state.surfaceMode === "change"
          ? formatDelta(feature.properties[state.selectedIndex], indexConfig[state.selectedIndex])
          : formatValue(feature.properties[state.selectedIndex], indexConfig[state.selectedIndex]);
        const zoneLabel = state.surfaceMode === "change"
          ? feature.properties.zone === "improve"
            ? "Mejora"
            : feature.properties.zone === "decline"
              ? "Descenso"
              : "Estable"
          : `Zona ${feature.properties.zone}`;
        layer.bindTooltip(
          `${indexConfig[state.selectedIndex].label}: ${tooltipValue} | ${zoneLabel}`,
          { sticky: true }
        );
      },
    }).addTo(mapState.map);
  }

  if (mapState.currentPlotLayer) {
    mapState.currentPlotLayer.bringToFront();
  }
  if (mapState.managementLayer) {
    mapState.managementLayer.bringToFront();
  }
  if (mapState.sceneExactLayer?.bringToBack) {
    mapState.sceneExactLayer.bringToBack();
  }
  if (mapState.scenePreviewLayer) {
    mapState.scenePreviewLayer.bringToBack();
  }

  if (!state.analysisBusy) {
    if (state.surfaceMode === "change" && changeAnalysis && getCompareImage()) {
      setStatus(`Cambio temporal ${indexConfig[state.selectedIndex].label} entre ${image.date} y ${getCompareImage().date} sobre ${analysis.context.scopeLabel}.`);
    } else {
      const sourceLabel = analysis.processingMode === "backend"
        ? "backend local"
        : image.source === "real"
          ? "motor local calibrado"
          : "motor demo";
      setStatus(`Escena ${image.title} activa con ${indexConfig[state.selectedIndex].label} sobre ${analysis.context.scopeLabel} usando ${sourceLabel}.`);
    }
  }
}

function renderRealSceneFootprint(image, fitBounds = false) {
  if (!image.geometry) {
    return;
  }

  const sensor = getSensorForImage(image);
  const footprintStyle = sensor.footprintStyle || sensorCatalog.sentinel2.footprintStyle;

  const popupThumb = image.thumbnail
    ? `<img class="sentinel-thumb" src="${image.thumbnail}" alt="Previsualizacion de ${image.title}">`
    : "";

  mapState.sceneFootprintLayer = L.geoJSON(
    {
      type: "Feature",
      geometry: image.geometry,
      properties: { title: image.title },
    },
    {
      style: {
        color: footprintStyle.color,
        weight: 2.5,
        fillColor: footprintStyle.fillColor,
        fillOpacity: footprintStyle.fillOpacity,
        dashArray: footprintStyle.dashArray,
      },
    }
  ).addTo(mapState.map);

  mapState.sceneFootprintLayer.bindPopup(
    `<div>${popupThumb}<h3 class="popup-title">${image.title}</h3><p class="popup-copy">Escena real consultada desde ${getSensorForImage(image).providerLabel}. ${image.note}</p></div>`
  );

  if (mapState.currentPlotLayer) {
    mapState.currentPlotLayer.bringToFront();
  }
  if (mapState.managementLayer) {
    mapState.managementLayer.bringToFront();
  }

  if (fitBounds) {
    mapState.map.fitBounds(mapState.sceneFootprintLayer.getBounds(), {
      padding: [36, 36],
    });
  }
}

function renderScenePreview(image) {
  const bounds = getScenePreviewBounds(image);
  const previewHref = image?.previewHref || image?.thumbnail;
  if (!previewHref || !bounds) {
    return;
  }
  const sensor = getSensorForImage(image);

  mapState.scenePreviewLayer = L.imageOverlay(previewHref, bounds, {
    opacity: state.scenePreviewOpacity,
    interactive: false,
    className: `scene-preview-overlay scene-preview-${sensor.id}`,
    crossOrigin: "anonymous",
  }).addTo(mapState.map);
}

function renderFootprintScenePreview(image) {
  const bounds = getScenePreviewBounds(image);
  const previewHref = image?.previewHref || image?.thumbnail;
  if (!image?.geometry || !previewHref || !bounds) {
    return false;
  }

  const bbox = Array.isArray(image.bbox) && image.bbox.length >= 4
    ? image.bbox.map((value) => Number(value))
    : turf.bbox({ type: "Feature", geometry: image.geometry, properties: {} });
  const pathData = buildGeometryClipPath(image.geometry, bbox);
  if (!pathData) {
    return false;
  }

  const sensor = getSensorForImage(image);
  const clipId = `scene-clip-${String(image.id || "scene").replace(/[^a-z0-9_-]/gi, "-")}`;
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("xmlns", svgNs);
  svg.setAttribute("viewBox", "0 0 1000 1000");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.classList.add("scene-footprint-preview");
  svg.dataset.sensor = sensor.id;

  const defs = document.createElementNS(svgNs, "defs");
  const clipPath = document.createElementNS(svgNs, "clipPath");
  clipPath.setAttribute("id", clipId);
  clipPath.setAttribute("clipPathUnits", "userSpaceOnUse");

  const path = document.createElementNS(svgNs, "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill-rule", "evenodd");
  clipPath.appendChild(path);
  defs.appendChild(clipPath);
  svg.appendChild(defs);

  const imageNode = document.createElementNS(svgNs, "image");
  imageNode.setAttributeNS("http://www.w3.org/1999/xlink", "href", previewHref);
  imageNode.setAttribute("href", previewHref);
  imageNode.setAttribute("x", "0");
  imageNode.setAttribute("y", "0");
  imageNode.setAttribute("width", "1000");
  imageNode.setAttribute("height", "1000");
  imageNode.setAttribute("preserveAspectRatio", "none");
  imageNode.setAttribute("clip-path", `url(#${clipId})`);
  imageNode.setAttribute("class", `scene-footprint-preview-image is-${sensor.id}`);
  imageNode.style.filter = sensor.previewFilter || "none";
  svg.appendChild(imageNode);

  const shadowPath = document.createElementNS(svgNs, "path");
  shadowPath.setAttribute("d", pathData);
  shadowPath.setAttribute("fill", "none");
  shadowPath.setAttribute("stroke", sensor.footprintStyle?.color || "#3a6f8f");
  shadowPath.setAttribute("stroke-opacity", "0.38");
  shadowPath.setAttribute("stroke-width", sensor.id === "landsat" ? "1.4" : "1.2");
  shadowPath.setAttribute("stroke-dasharray", sensor.id === "sentinel1" ? "5 4" : "7 5");
  shadowPath.setAttribute("vector-effect", "non-scaling-stroke");
  svg.appendChild(shadowPath);

  mapState.scenePreviewLayer = L.svgOverlay(svg, bounds, {
    opacity: state.scenePreviewOpacity,
    interactive: false,
    className: `scene-preview-overlay scene-preview-${sensor.id}`,
  }).addTo(mapState.map);
  if (mapState.scenePreviewLayer?.bringToBack) {
    mapState.scenePreviewLayer.bringToBack();
  }
  if (mapState.currentPlotLayer) {
    mapState.currentPlotLayer.bringToFront();
  }
  if (mapState.managementLayer) {
    mapState.managementLayer.bringToFront();
  }
  return true;
}

function buildGeometryClipPath(geometry, bbox) {
  if (!geometry || !bbox || bbox.length < 4) {
    return "";
  }

  const [west, south, east, north] = bbox.map((value) => Number(value));
  if (![west, south, east, north].every(Number.isFinite) || west >= east || south >= north) {
    return "";
  }

  const projectPoint = ([lon, lat]) => {
    const x = clamp(((lon - west) / (east - west)) * 1000, 0, 1000);
    const y = clamp(((north - lat) / (north - south)) * 1000, 0, 1000);
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  };

  const ringToPath = (ring = []) => ring.length
    ? `${ring.map((coord, index) => `${index === 0 ? "M" : "L"} ${projectPoint(coord)}`).join(" ")} Z`
    : "";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => ringToPath(ring)).filter(Boolean).join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .flatMap((polygon) => polygon.map((ring) => ringToPath(ring)))
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

async function renderSceneLayer(image) {
  if (!mapState.map || !state.showScenePreview) {
    return;
  }

  state.sceneLayerKind = "loading";
  updateMapSummary();

  let exactMatch = null;

  if (image.source === "real" && getSensorForImage(image).exactRaster) {
    exactMatch = await fetchEarthSearchMatch(image);
    const exactLayer = await createExactSceneLayer(image, exactMatch);
    if (exactLayer && image.id === state.selectedImageId && state.showScenePreview) {
      mapState.sceneExactLayer = exactLayer.addTo(mapState.map);
      if (mapState.sceneExactLayer.bringToBack) {
        mapState.sceneExactLayer.bringToBack();
      }
      if (mapState.currentPlotLayer) {
        mapState.currentPlotLayer.bringToFront();
      }
      if (mapState.managementLayer) {
        mapState.managementLayer.bringToFront();
      }
      state.sceneLayerKind = "exact";
      updateMapSummary();
      return;
    }
  }

  const previewImage = getRenderableScenePreviewImage(image, exactMatch);

  if (previewImage.id === state.selectedImageId && state.showScenePreview && previewImage.source === "real" && renderFootprintScenePreview(previewImage)) {
    state.sceneLayerKind = "footprint";
    updateMapSummary();
    return;
  }

  if (previewImage.id === state.selectedImageId && state.showScenePreview && canRenderThumbnailPreview(previewImage)) {
    renderScenePreview(previewImage);
    state.sceneLayerKind = "preview";
    updateMapSummary();
    return;
  }

  state.sceneLayerKind = "off";
  updateMapSummary();
}

async function createExactSceneLayer(image, earthItem = null) {
  const GeoRasterLayerCtor = getGeoRasterLayerCtor();
  const exactScene = await getExactSceneData(image, earthItem);
  if (!exactScene || !GeoRasterLayerCtor) {
    return null;
  }
  const renderResolution = getExactSceneRenderResolution();

  const layer = new GeoRasterLayerCtor({
    georaster: exactScene.georaster,
    opacity: state.scenePreviewOpacity,
    resolution: renderResolution,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 4,
    mask: {
      type: "Feature",
      geometry: exactScene.geometry,
      properties: {},
    },
    mask_strategy: "outside",
    mask_srs: "EPSG:4326",
    resampleMethod: "bilinear",
    pixelValuesToColorFn: colorizeVisualPixel,
  });
  layer.codexResolution = renderResolution;
  return layer;
}

async function getExactSceneData(image, earthItem = null) {
  const parseGeorasterFn = getParseGeorasterFn();
  if (!image || image.source !== "real" || !parseGeorasterFn || !getSensorForImage(image).exactRaster) {
    return null;
  }

  const cacheKey = getExactSceneCacheKey(image);
  if (!exactSceneCache.has(cacheKey)) {
    exactSceneCache.set(cacheKey, (async () => {
      const matchedEarthItem = earthItem || await fetchEarthSearchMatch(image);
      const visualHref = matchedEarthItem?.assets?.visual?.href;
      if (!visualHref) {
        return null;
      }

      const response = await fetch(visualHref);
      if (!response.ok) {
        throw new Error(`Earth Search visual devolvio ${response.status}.`);
      }

      const buffer = await response.arrayBuffer();
      const georaster = await parseGeorasterFn(buffer);
      return {
        georaster,
        geometry: matchedEarthItem.geometry || image.geometry,
        bbox: matchedEarthItem.bbox || image.bbox,
      };
    })().catch((error) => {
      exactSceneCache.delete(cacheKey);
      console.warn("No se pudo cargar el raster exacto de Earth Search.", error);
      return null;
    }));
  }

  return exactSceneCache.get(cacheKey);
}

async function fetchEarthSearchMatch(image) {
  const cacheKey = getExactSceneCacheKey(image);
  if (!exactSceneMatchCache.has(cacheKey)) {
    exactSceneMatchCache.set(cacheKey, (async () => {
      const sceneBounds = Array.isArray(image?.bbox) && image.bbox.length >= 4
        ? image.bbox
        : turf.bbox({
        type: "Feature",
        geometry: image.geometry || studyArea.geometry,
          properties: {},
        });
      const payload = await fetchJson(`${earthSearchService.catalogUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          collections: [sensorCatalog.sentinel2.earthSearchCollection],
          bbox: sceneBounds,
          datetime: `${image.date}T00:00:00Z/${image.date}T23:59:59Z`,
          limit: earthSearchService.limit,
        }),
      });
      const features = Array.isArray(payload.features) ? payload.features : [];
      const gridCode = getSceneGridCode(image);

      return features.find((feature) => {
        if (!gridCode) {
          return true;
        }
        return (feature.properties?.["grid:code"] || null) === gridCode;
      }) || features[0] || null;
    })().catch((error) => {
      exactSceneMatchCache.delete(cacheKey);
      console.warn("No se pudo resolver la escena equivalente en Earth Search.", error);
      return null;
    }));
  }
  return exactSceneMatchCache.get(cacheKey);
}

function getExactSceneCacheKey(image) {
  return `${getSceneGridCode(image) || image?.id || "scene"}|${image?.date || "sin-fecha"}`;
}

function getRenderableScenePreviewImage(image, earthItem = null) {
  if (!image || getSensorForImage(image).id !== "sentinel2") {
    return image;
  }

  const earthPreviewHref = earthItem ? getFeaturePreviewHref(earthItem, "sentinel2") : null;
  const earthThumbnailHref = earthItem ? getFeatureThumbnailHref(earthItem, "sentinel2") : null;
  if (!earthPreviewHref && !earthThumbnailHref) {
    return image;
  }

  return {
    ...image,
    previewHref: earthPreviewHref || image.previewHref,
    thumbnail: earthThumbnailHref || earthPreviewHref || image.thumbnail,
    note: `${image.note} Fallback visual desde Earth Search cuando el preview de Copernicus no esta disponible.`,
  };
}

function getExactSceneRenderResolution() {
  const zoom = mapState.map?.getZoom?.() || 11;
  if (zoom >= 13) {
    return 256;
  }
  if (zoom >= 11) {
    return 192;
  }
  return 160;
}

function colorizeVisualPixel(values) {
  if (!Array.isArray(values) || values.length < 3) {
    return null;
  }

  const [red, green, blue] = values.map((value) => Number(value));
  if (![red, green, blue].every(Number.isFinite) || (red === 0 && green === 0 && blue === 0)) {
    return null;
  }

  const divisor = Math.max(red, green, blue) > 255 ? 2800 : 255;
  const channels = [red, green, blue].map((value) => toneMapVisualChannel(value, divisor));
  if (channels.every((value) => value < 4)) {
    return null;
  }
  return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
}

function toneMapVisualChannel(value, divisor = 255) {
  const normalized = clamp(value / divisor, 0, 1);
  const lifted = clamp((normalized - 0.03) / 0.9, 0, 1);
  const gamma = Math.pow(lifted, 0.88);
  return Math.round(clamp(gamma * 255 * 1.04, 0, 255));
}

function getAnalysisOverlayOpacity(image) {
  const sensor = getSensorForImage(image);
  if (state.surfaceMode === "change") {
    return 0.42;
  }

  if (image?.source === "real" && state.showScenePreview) {
    if (state.sceneLayerKind === "exact") {
      return sensor.id === "sentinel2" ? 0.1 : 0.14;
    }
    if (state.sceneLayerKind === "footprint") {
      return sensor.id === "sentinel1" ? 0.18 : 0.12;
    }
    return sensor.id === "sentinel1" ? 0.22 : 0.15;
  }

  if (image?.source === "real") {
    return sensor.id === "sentinel1" ? 0.34 : 0.32;
  }

  return 0.46;
}

function maybeRefreshScenePreviewQuality() {
  if (!mapState.map || state.analysisBusy || state.sceneLayerKind !== "exact" || !state.showScenePreview) {
    return;
  }

  const image = getSelectedImage();
  if (!image || image.source !== "real" || !getSensorForImage(image).exactRaster || !mapState.sceneExactLayer) {
    return;
  }

  const nextResolution = getExactSceneRenderResolution();
  if (mapState.sceneExactLayer.codexResolution === nextResolution) {
    return;
  }

  renderSentinelOverlay();
}

function getGeoRasterLayerCtor() {
  if (typeof GeoRasterLayer === "function") {
    return GeoRasterLayer;
  }
  if (typeof globalThis.GeoRasterLayer === "function") {
    return globalThis.GeoRasterLayer;
  }
  if (globalThis.GeoRasterLayer && typeof globalThis.GeoRasterLayer.default === "function") {
    return globalThis.GeoRasterLayer.default;
  }
  return null;
}

function getParseGeorasterFn() {
  if (typeof parseGeoraster === "function") {
    return parseGeoraster;
  }
  if (typeof globalThis.parseGeoraster === "function") {
    return globalThis.parseGeoraster;
  }
  if (typeof globalThis.georaster === "function") {
    return globalThis.georaster;
  }
  return null;
}

function getSelectedImage() {
  return state.filteredImages.find((image) => image.id === state.selectedImageId) || null;
}

function getCompareImage() {
  return state.filteredImages.find((image) => image.id === state.selectedCompareImageId) || null;
}

function getRenderableAnalysis(image = getSelectedImage()) {
  if (!image || !state.analysisData || state.analysisData.imageId !== image.id) {
    return null;
  }

  const currentTargetKey = getCurrentAnalysisTarget().targetKey;
  return state.analysisData.context?.targetKey === currentTargetKey ? state.analysisData : null;
}

function getRenderableCompareAnalysis(image = getCompareImage()) {
  if (!image || !state.compareAnalysis || state.compareAnalysis.imageId !== image.id) {
    return null;
  }

  const currentTargetKey = getCurrentAnalysisTarget().targetKey;
  return state.compareAnalysis.context?.targetKey === currentTargetKey ? state.compareAnalysis : null;
}

function getRenderableChangeAnalysis(primary = getSelectedImage(), compare = getCompareImage()) {
  if (!primary || !compare || !state.changeAnalysis) {
    return null;
  }

  const primaryMatch = state.analysisData?.imageId === primary.id;
  const compareMatch = state.compareAnalysis?.imageId === compare.id;
  const currentTargetKey = getCurrentAnalysisTarget().targetKey;
  return primaryMatch && compareMatch && state.analysisData?.context?.targetKey === currentTargetKey ? state.changeAnalysis : null;
}

function canRenderSceneLayer(image = getSelectedImage()) {
  if (!image) {
    return false;
  }

  if (getSensorForImage(image).exactRaster && image.source === "real" && getSceneGridCode(image)) {
    return true;
  }

  return canRenderThumbnailPreview(image);
}

function canRenderThumbnailPreview(image = getSelectedImage()) {
  return Boolean((image?.previewHref || image?.thumbnail) && getScenePreviewBounds(image));
}

function getScenePreviewBounds(image) {
  if (!image) {
    return null;
  }

  let bbox = Array.isArray(image.bbox) && image.bbox.length >= 4
    ? image.bbox
    : null;

  if (!bbox && image.geometry) {
    bbox = turf.bbox({
      type: "Feature",
      geometry: image.geometry,
      properties: {},
    });
  }

  if (!bbox || bbox.length < 4) {
    return null;
  }

  const [west, south, east, north] = bbox.map((value) => Number(value));
  if (![west, south, east, north].every(Number.isFinite) || south >= north || west >= east) {
    return null;
  }

  return [[south, west], [north, east]];
}

function getSceneGridCode(image) {
  if (!image) {
    return null;
  }

  if (image.gridCode) {
    return image.gridCode;
  }

  const titleParts = String(image.title || "").split("/");
  return titleParts.length > 1 ? titleParts[1].trim() : null;
}

function syncAnalysisDrivenModules() {
  if (state.currentPlot) {
    runIntraloteAnalysis(true);
    runDemAnalysis(true);
    if (!(state.activeWizard === "Monitoreo" || state.activeWizard === "Diagnostico")) {
      runClimateAnalysis(true);
    }
    return;
  }

  if (dom.climateResults.classList.contains("has-data")) {
    runClimateAnalysis(true);
  }
}

function setCurrentPlot(feature, label) {
  state.currentPlot = feature;
  state.currentPlotLabel = label;
  state.analysisData = null;
  dom.overlayPlot.textContent = label;
  renderSentinelSourceStatus();
  renderAnalysisStatus();

  if (!mapState.map) {
    return;
  }

  if (mapState.currentPlotLayer) {
    mapState.map.removeLayer(mapState.currentPlotLayer);
  }

  mapState.currentPlotLayer = L.geoJSON(feature, {
    style: {
      color: "#ffce73",
      weight: 2,
      fillColor: "#ffce73",
      fillOpacity: 0.18,
    },
  }).addTo(mapState.map);

  mapState.currentPlotLayer.bringToFront();
  mapState.map.fitBounds(mapState.currentPlotLayer.getBounds(), {
    padding: [36, 36],
  });

  updateMapSummary();
  runIntraloteAnalysis();
  runDemAnalysis(true);
  runClimateAnalysis(true);
  if (state.planningData) {
    runPlanningAnalysis(true);
  }
  filterSentinelImages();
  renderWizardAssistantState();
}

function clearCurrentPlot(triggerRefresh = false) {
  state.currentPlot = null;
  state.currentPlotLabel = "Sin seleccionar";
  state.analysisData = null;
  state.agronomyOutputs.intralote = null;
  state.agronomyOutputs.dem = null;
  state.agronomyOutputs.climate = null;
  dom.overlayPlot.textContent = state.currentPlotLabel;
  renderSentinelSourceStatus();
  renderAnalysisStatus();

  if (mapState.currentPlotLayer) {
    mapState.map.removeLayer(mapState.currentPlotLayer);
    mapState.currentPlotLayer = null;
  }

  if (mapState.managementLayer) {
    mapState.map.removeLayer(mapState.managementLayer);
    mapState.managementLayer = null;
  }

  if (mapState.controlGroup) {
    mapState.controlGroup.clearLayers();
  }

  resetMetricGrid(dom.intraloteResults, "Dibuja un lote en el mapa para empezar.");
  resetMetricGrid(dom.demResults, "Elige un lote o dibuja un poligono para estimar relieve.");
  resetMetricGrid(dom.climateResults, "Ejecuta el modulo para cargar indicadores climaticos.");
  if (state.planningData) {
    runPlanningAnalysis(true);
  }
  renderAnalysisSummary();
  renderCompareSummary();
  renderLegend();
  updateMapSummary();

  if (triggerRefresh) {
    filterSentinelImages();
  }
  renderWizardAssistantState();
}

function runIntraloteAnalysis(silent = false) {
  if (!ensurePlot("Analisis intralote requiere un lote activo o un poligono dibujado.", silent)) {
    return null;
  }

  const image = getSelectedImage() || getFallbackScene();
  if (!image) {
    return null;
  }
  const plotTarget = {
    feature: state.currentPlot,
    scopeLabel: state.currentPlotLabel,
    scopeType: "plot",
    targetKey: getFeatureKey(state.currentPlot),
  };
  const analysis = resolveAnalysisForTarget(image, plotTarget);
  const zoneStats = renderManagementZones(analysis);
  const managementText = `Alta ${zoneStats.high}% / Media ${zoneStats.medium}% / Baja ${zoneStats.low}%`;

  const cards = [
    { label: "Superficie", value: `${analysis.context.areaHa.toFixed(1)} ha`, copy: "Calculada sobre el poligono activo." },
    { label: "Cobertura util", value: `${analysis.quality.coveragePct}%`, copy: `Confianza ${analysis.quality.confidenceScore}/100 para la escena activa.` },
    { label: "Zonas de manejo", value: managementText, copy: analysis.management.recommendedAction },
    ...getSupportedIndexKeys(image).map((indexKey) => ({
      label: indexConfig[indexKey].label,
      value: formatValue(analysis.summary[indexKey].mean, indexConfig[indexKey]),
      copy: `Rango P10 ${formatValue(analysis.summary[indexKey].p10, indexConfig[indexKey])} / P90 ${formatValue(analysis.summary[indexKey].p90, indexConfig[indexKey])}.`,
    })),
  ];

  paintMetricGrid(dom.intraloteResults, cards);
  const result = {
    image,
    analysis,
    zoneStats,
    cards,
    scopeLabel: state.currentPlotLabel,
    managementText,
    recommendedAction: analysis.management.recommendedAction,
  };
  state.agronomyOutputs.intralote = result;
  if (!silent) {
    setStatus(
      `Analisis intralote ejecutado para ${state.currentPlotLabel}. Se actualizaron superficies y zonas de manejo.`
    );
  }

  if (state.activeWizard === "Monitoreo" || state.activeWizard === "Diagnostico") {
    runClimateAnalysis(true);
  }
  renderWizardAssistantState();
  return result;
}

function renderManagementZones(analysis) {
  const focusKey = getFocusIndexKey(analysis.sensorId);
  const focusLabel = indexConfig[focusKey].label;
  if (mapState.managementLayer) {
    mapState.map.removeLayer(mapState.managementLayer);
    mapState.managementLayer = null;
  }

  const features = analysis.surface?.features || [];
  if (features.length && mapState.map) {
    mapState.managementLayer = L.geoJSON(
      { type: "FeatureCollection", features },
      {
        style: (feature) => ({
          weight: 0.4,
          color: "#fff7ef",
          fillOpacity: 0.58,
          fillColor:
            feature.properties.zone === "high"
              ? "#3f9a60"
              : feature.properties.zone === "medium"
                ? "#d2a544"
                : "#b55a3f",
        }),
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(
            `Zona ${feature.properties.zone} / ${focusLabel} ${formatValue(feature.properties[focusKey], indexConfig[focusKey])}`,
            { sticky: true }
          );
        },
      }
    ).addTo(mapState.map);

    mapState.managementLayer.bringToFront();
    if (mapState.currentPlotLayer) {
      mapState.currentPlotLayer.bringToFront();
    }
  }

  return analysis.management;
}

function runDemAnalysis(silent = false) {
  if (!ensurePlot("Analisis DEM requiere un lote activo o un poligono dibujado.", silent)) {
    return null;
  }

  const image = getSelectedImage() || getFallbackScene();
  if (!image) {
    return null;
  }
  const plotTarget = {
    feature: state.currentPlot,
    scopeLabel: state.currentPlotLabel,
    scopeType: "plot",
    targetKey: getFeatureKey(state.currentPlot),
  };
  const analysis = resolveAnalysisForTarget(image, plotTarget);
  const centroid = turf.centroid(state.currentPlot).geometry.coordinates;
  const areaHa = turf.area(state.currentPlot) / 10000;
  const altitude = 2780 + Math.round((pseudoNoise(centroid[0], centroid[1], 11) + 1) * 140);
  const meanSlope = clamp(3 + Math.abs(pseudoNoise(centroid[0], centroid[1], 7)) * 12 + areaHa / 14, 2, 18);
  const maxSlope = clamp(meanSlope + 7 + Math.abs(pseudoNoise(centroid[1], centroid[0], 3)) * 8, 7, 31);
  const aspect = cardinalFromAngle((pseudoNoise(centroid[0], centroid[1], 13) + 1) * 180);
  const moistureKey = getMoistureIndexKey(image);
  const focusKey = getFocusIndexKey(image);
  const moistureNormalized = normalizeMetricValue(analysis.summary[moistureKey].mean, indexConfig[moistureKey]);
  const floodRisk = moistureNormalized > 0.58 && meanSlope < 7
    ? "Medio - Alto"
    : meanSlope < 10
      ? "Medio"
      : "Bajo";

  const cards = [
    { label: "Altitud media", value: `${Math.round(altitude)} msnm`, copy: "Estimacion basada en relieve de referencia Copernicus GLO-30." },
    { label: "Pendiente media", value: `${meanSlope.toFixed(1)}%`, copy: "Promedio de inclinacion del lote." },
    { label: "Pendiente maxima", value: `${maxSlope.toFixed(1)}%`, copy: "Sector de mayor exigencia para mecanizacion." },
    { label: "Orientacion", value: aspect, copy: "Exposicion dominante del relieve del lote." },
    { label: "Riesgo de anegamiento", value: floodRisk, copy: "Cruza pendiente y senal de humedad del AOI." },
    { label: "Lectura operativa", value: meanSlope > 10 ? "Manejo cuidadoso" : "Operacion favorable", copy: `Variabilidad ${indexConfig[focusKey].label} ${analysis.summary[focusKey].variability}%.` },
  ];

  paintMetricGrid(dom.demResults, cards);
  const result = {
    image,
    analysis,
    cards,
    scopeLabel: state.currentPlotLabel,
    altitude,
    meanSlope: Number(meanSlope.toFixed(1)),
    maxSlope: Number(maxSlope.toFixed(1)),
    aspect,
    floodRisk,
    operationLabel: meanSlope > 10 ? "Manejo cuidadoso" : "Operacion favorable",
  };
  state.agronomyOutputs.dem = result;
  if (!silent) {
    setStatus(`Analisis topografico generado para ${state.currentPlotLabel}.`);
  }
  renderWizardAssistantState();
  return result;
}

function runClimateAnalysis(silent = false) {
  const anchorFeature = state.currentPlot || studyArea;
  const image = getSelectedImage() || getFallbackScene();
  if (!image) {
    return null;
  }
  const target = state.currentPlot
    ? {
      feature: state.currentPlot,
      scopeLabel: state.currentPlotLabel,
      scopeType: "plot",
      targetKey: getFeatureKey(state.currentPlot),
    }
    : {
      feature: studyArea,
      scopeLabel: "Canton Mejia",
      scopeType: "studyArea",
      targetKey: getFeatureKey(studyArea),
    };
  const analysis = resolveAnalysisForTarget(image, target);
  const centroid = turf.centroid(anchorFeature).geometry.coordinates;
  const moistureKey = getMoistureIndexKey(image);
  const focusKey = getFocusIndexKey(image);
  const baseline = normalizeMetricValue(analysis.summary[moistureKey].mean, indexConfig[moistureKey]);
  const vigor = normalizeMetricValue(analysis.summary[focusKey].mean, indexConfig[focusKey]);
  const rainfall = 9 + Math.round(Math.abs(pseudoNoise(centroid[0], centroid[1], 19)) * 32 + (0.55 - baseline) * 16);
  const minTemp = 6 + Math.abs(pseudoNoise(centroid[1], centroid[0], 2)) * 3;
  const maxTemp = 18 + Math.abs(pseudoNoise(centroid[0], centroid[1], 5)) * 7 + (vigor < 0.45 ? 1.2 : 0);
  const soilMoisture = clamp(24 + baseline * 48 + pseudoNoise(centroid[0], centroid[1], 17) * 8, 24, 72);
  const lst = clamp(20 + Math.abs(pseudoNoise(centroid[0], centroid[1], 23)) * 10 - baseline * 3, 18, 31);
  const stress = lst > 27 || vigor < 0.45 ? "Atencion" : "Controlado";

  const cards = [
    { label: "Lluvia 7 dias", value: `${rainfall} mm`, copy: "Acumulado de referencia tipo ERA5-Land." },
    { label: "Temperatura aire", value: `${minTemp.toFixed(1)} - ${maxTemp.toFixed(1)} C`, copy: "Rango diario esperado sobre el lote o zona activa." },
    { label: "Humedad estimada", value: `${soilMoisture.toFixed(0)}%`, copy: `Ajustada con la senal ${indexConfig[moistureKey].label} del AOI.` },
    { label: "LST MODIS", value: `${lst.toFixed(1)} C`, copy: "Temperatura superficial para seguimiento de estres termico." },
    { label: "Estado termico", value: stress, copy: `Lectura de vigor: ${analysis.diagnostics.vigorSignal}.` },
    { label: "Escena base", value: localeDate.format(new Date(`${image.date}T00:00:00`)), copy: `AOI ${analysis.context.scopeLabel}.` },
  ];

  paintMetricGrid(dom.climateResults, cards);
  const result = {
    image,
    analysis,
    cards,
    scopeLabel: target.scopeLabel,
    rainfall,
    minTemp: Number(minTemp.toFixed(1)),
    maxTemp: Number(maxTemp.toFixed(1)),
    soilMoisture: Number(soilMoisture.toFixed(0)),
    lst: Number(lst.toFixed(1)),
    stress,
  };
  state.agronomyOutputs.climate = result;
  if (!silent) {
    setStatus("Modulo de clima agricola actualizado con variables de referencia.");
  }
  renderWizardAssistantState();
  return result;
}

function getPlanning3dEmptyCollection() {
  return {
    type: "FeatureCollection",
    features: [],
  };
}

function formatPlanning3dCount(value, fallback = "Shape listo") {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return new Intl.NumberFormat("es-EC").format(value);
}

function setPlanning3dStatus(message, tone = "loading") {
  if (!dom.planning3dStatus) {
    return;
  }

  dom.planning3dStatus.className = `service-banner ${tone}`;
  dom.planning3dStatus.textContent = message;
}

function renderPlanning3dPanel() {
  if (!dom.planning3dAvailability) {
    return;
  }

  if (planning3dState.manifestLoading && !planning3dState.manifest) {
    dom.planning3dAvailability.classList.add("empty-state");
    dom.planning3dAvailability.classList.remove("has-data");
    dom.planning3dAvailability.textContent = "Verificando disponibilidad de shapes y metadata 3D...";
    return;
  }

  const manifest = getPlanning3dManifest();
  const buildingsReady = !!manifest.buildings?.available;
  const parcelsReady = !!manifest.parcels?.available;
  const stats = manifest.buildings?.stats || null;
  const backendCopy = manifest.viaBackend
    ? "Backend local activo: pisos y alturas reales leidos desde el DBF de construcciones."
    : "Modo publicado: si no activas server.ps1 el visor usa alturas estimadas y, si hace falta, una muestra 3D ligera para no bloquear la carga.";

  dom.planning3dAvailability.classList.remove("empty-state");
  dom.planning3dAvailability.classList.add("has-data");
  dom.planning3dAvailability.innerHTML = `
    <div class="planning-3d-availability-grid">
      <article class="planning-3d-stat">
        <span>Construcciones</span>
        <strong>${buildingsReady ? formatPlanning3dCount(manifest.buildings.recordCount) : "No detectado"}</strong>
      </article>
      <article class="planning-3d-stat">
        <span>Catastro</span>
        <strong>${parcelsReady ? formatPlanning3dCount(manifest.parcels.recordCount) : "No detectado"}</strong>
      </article>
      <article class="planning-3d-stat">
        <span>Pisos medios</span>
        <strong>${stats?.meanFloors ? `${stats.meanFloors}` : "Estimado"}</strong>
      </article>
      <article class="planning-3d-stat">
        <span>Modo</span>
        <strong>${manifest.viaBackend ? "DBF + shapes" : "Shapes directos"}</strong>
      </article>
    </div>
    <p class="planning-3d-meta">${backendCopy}</p>
  `;

  if (dom.openPlanning3dBtn) {
    dom.openPlanning3dBtn.disabled = !buildingsReady;
  }
  if (dom.reloadPlanning3dBtn) {
    dom.reloadPlanning3dBtn.disabled = planning3dState.manifestLoading;
  }

  renderPlanning3dSummary();
  renderPlanning3dSelection();
}

async function hydratePlanning3dManifest(force = false) {
  if (planning3dState.manifestPromise && !force) {
    return planning3dState.manifestPromise;
  }

  planning3dState.manifestLoading = true;
  renderPlanning3dPanel();

  const fallbackManifest = getPlanning3dFallbackManifest();
  const request = (async () => {
    try {
      const response = await fetch("./api/planning/3d/manifest", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Manifest 3D no disponible (${response.status}).`);
      }

      const payload = await response.json();
      planning3dState.manifest = {
        ...fallbackManifest,
        ...payload,
        viaBackend: true,
        buildings: {
          ...fallbackManifest.buildings,
          ...(payload.buildings || {}),
        },
        parcels: {
          ...fallbackManifest.parcels,
          ...(payload.parcels || {}),
        },
      };
      planning3dState.backendMode = "backend";
      return planning3dState.manifest;
    } catch (error) {
      planning3dState.manifest = fallbackManifest;
      planning3dState.backendMode = "static";
      return planning3dState.manifest;
    } finally {
      planning3dState.manifestLoading = false;
      planning3dState.manifestPromise = null;
      renderPlanning3dPanel();
    }
  })();

  planning3dState.manifestPromise = request;
  return request;
}

async function hydratePlanning3dPhotoStatus(force = false) {
  if (planning3dState.photoStatusPromise && !force) {
    return planning3dState.photoStatusPromise;
  }

  const request = (async () => {
    try {
      const response = await fetch("./api/planning/3d/photo-status", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Servicio local de fotos no disponible (${response.status}).`);
      }
      planning3dState.photoStatus = await response.json();
      return planning3dState.photoStatus;
    } catch (error) {
      planning3dState.photoStatus = {
        available: false,
        totalFiles: 0,
        geotaggedCount: 0,
        sampleFolders: [],
        message: "Las fotos locales requieren server.ps1 activo y acceso a la carpeta externa.",
      };
      return planning3dState.photoStatus;
    } finally {
      planning3dState.photoStatusPromise = null;
      renderPlanning3dSummary();
      renderPlanning3dSelection();
    }
  })();

  planning3dState.photoStatusPromise = request;
  return request;
}

function formatPlanning3dDistance(distanceM) {
  if (!Number.isFinite(distanceM)) {
    return "Sin distancia";
  }
  if (distanceM >= 1000) {
    return `${(distanceM / 1000).toFixed(2)} km`;
  }
  return `${Math.round(distanceM)} m`;
}

function createPlanning3dStyle(baseId = planning3dState.currentBase) {
  const isSatellite = baseId === "satellite";
  const style = {
    version: 8,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": isSatellite ? "#dbe5ea" : "#eef2ee",
        },
      },
    ],
    sky: {
      "sky-type": "gradient",
      "sky-gradient": [
        "interpolate",
        ["linear"],
        ["sky-radial-progress"],
        0,
        "#dceaf2",
        1,
        "#f5f0e6",
      ],
      "sky-gradient-center": [0, 0],
      "sky-gradient-radius": 90,
    },
    light: {
      anchor: "viewport",
      color: "#fef7df",
      intensity: 0.62,
      position: [1.3, 180, 38],
    },
  };

  if (isSatellite) {
    style.sources.basemap = {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri World Imagery",
    };
    style.layers.push({
      id: "basemap",
      type: "raster",
      source: "basemap",
      paint: {
        "raster-opacity": 1,
        "raster-saturation": 0.18,
        "raster-contrast": 0.12,
      },
    });
  }

  return style;
}

function syncPlanning3dBaseButtons() {
  dom.planning3dBaseButtons?.forEach((button) => {
    button.classList.toggle("active", button.dataset.planningBase === planning3dState.currentBase);
  });
}

function addPlanning3dRuntimeLayers() {
  if (!planning3dState.map || planning3dState.map.getSource("planning3d-buildings")) {
    return;
  }

  const emptyCollection = getPlanning3dEmptyCollection();
  planning3dState.map.addSource("planning3d-buildings", {
    type: "geojson",
    data: planning3dState.sourceData.buildings || emptyCollection,
    generateId: true,
  });
  planning3dState.map.addSource("planning3d-parcels", {
    type: "geojson",
    data: planning3dState.sourceData.parcels || emptyCollection,
  });
  planning3dState.map.addSource("planning3d-candidates", {
    type: "geojson",
    data: planning3dState.sourceData.candidates || emptyCollection,
  });

  planning3dState.map.addLayer({
    id: "planning3d-buildings-fill",
    type: "fill-extrusion",
    source: "planning3d-buildings",
    minzoom: 12,
    paint: {
      "fill-extrusion-height": [
        "*",
        ["coalesce", ["get", "heightM"], 4.2],
        planning3dState.heightScale,
      ],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": 0.9,
      "fill-extrusion-color": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        "#f4d35e",
        [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "floors"], 1],
          1,
          "#8ab17d",
          2,
          "#76a5c9",
          3,
          "#5387b0",
          5,
          "#315f83",
        ],
      ],
    },
  });

  planning3dState.map.addLayer({
    id: "planning3d-buildings-outline",
    type: "line",
    source: "planning3d-buildings",
    minzoom: 13,
    paint: {
      "line-color": "rgba(23, 39, 31, 0.42)",
      "line-width": 0.7,
      "line-opacity": 0.55,
    },
  });

  planning3dState.map.addLayer({
    id: "planning3d-parcels-line",
    type: "line",
    source: "planning3d-parcels",
    minzoom: 14,
    layout: {
      visibility: "none",
    },
    paint: {
      "line-color": "#cb9440",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14,
        0.5,
        18,
        1.2,
      ],
      "line-opacity": 0.58,
    },
  });

  planning3dState.map.addLayer({
    id: "planning3d-candidates-circle",
    type: "circle",
    source: "planning3d-candidates",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        11,
        4,
        16,
        8,
      ],
      "circle-color": "#f4d35e",
      "circle-stroke-color": "#6b4e1f",
      "circle-stroke-width": 1.2,
      "circle-opacity": 0.92,
    },
  });

  if (!planning3dState.eventsBound) {
    planning3dState.map.on("click", "planning3d-buildings-fill", (event) => {
      const feature = event.features?.[0];
      if (feature) {
        selectPlanning3dBuilding(feature, event.lngLat);
      }
    });

    planning3dState.map.on("mouseenter", "planning3d-buildings-fill", () => {
      planning3dState.map.getCanvas().style.cursor = "pointer";
    });
    planning3dState.map.on("mouseleave", "planning3d-buildings-fill", () => {
      planning3dState.map.getCanvas().style.cursor = "";
    });
    planning3dState.eventsBound = true;
  }
}

async function initializePlanning3dMap() {
  if (!dom.planning3dMap) {
    return null;
  }

  if (planning3dState.map) {
    planning3dState.map.resize();
    return planning3dState.readyPromise || Promise.resolve(planning3dState.map);
  }

  if (!window.maplibregl) {
    throw new Error("MapLibre GL no esta disponible en esta sesion.");
  }

  planning3dState.map = new window.maplibregl.Map({
    container: dom.planning3dMap,
    style: createPlanning3dStyle(),
    center: [-78.59, -0.503],
    zoom: 12.3,
    pitch: 56,
    bearing: -18,
    attributionControl: false,
    antialias: false,
    fadeDuration: 0,
    refreshExpiredTiles: false,
  });
  planning3dState.map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

  planning3dState.readyPromise = new Promise((resolve) => {
    let settled = false;
    const finalize = () => {
      if (settled) {
        return;
      }
      if (!planning3dState.map?.isStyleLoaded?.()) {
        window.setTimeout(finalize, 180);
        return;
      }
      settled = true;
      addPlanning3dRuntimeLayers();
      updatePlanning3dCandidateSource();
      syncPlanning3dLayerVisibility();
      resolve(planning3dState.map);
    };

    planning3dState.map.once("style.load", finalize);
    planning3dState.map.once("load", finalize);
    window.setTimeout(finalize, 900);
  });

  return planning3dState.readyPromise;
}

function walkPlanning3dCoordinates(coordinates, callback) {
  if (!Array.isArray(coordinates)) {
    return;
  }
  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    callback(coordinates[0], coordinates[1]);
    return;
  }
  coordinates.forEach((child) => walkPlanning3dCoordinates(child, callback));
}

function estimatePlanning3dMetrics(geometry) {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  let vertices = 0;

  walkPlanning3dCoordinates(geometry?.coordinates, (lon, lat) => {
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
  };
}

async function loadPlanning3dShapefile(basePath) {
  if (!window.shp?.parseShp) {
    throw new Error("La libreria de shapefile no esta disponible.");
  }

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

  return window.shp.parseShp(shpBuffer, prjText);
}

async function loadPlanning3dBuildingMetadata() {
  const manifest = getPlanning3dManifest();
  if (!manifest.viaBackend) {
    return null;
  }

  try {
    const response = await fetch("./api/planning/3d/building-meta", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Metadata 3D no disponible (${response.status}).`);
    }
    return response.json();
  } catch (error) {
    planning3dState.backendMode = "static";
    if (planning3dState.manifest) {
      planning3dState.manifest.viaBackend = false;
      planning3dState.manifest.buildings.stats = null;
    }
    renderPlanning3dPanel();
    return null;
  }
}

function buildPlanning3dBuildingsCollection(geometries, metadata = null) {
  return {
    type: "FeatureCollection",
    features: getPlanning3dGeometryList(geometries).map((geometry, index) =>
      createPlanning3dBuildingFeature(geometry, index, metadata)
    ),
  };
}

function buildPlanning3dParcelsCollection(geometries) {
  return {
    type: "FeatureCollection",
    features: getPlanning3dGeometryList(geometries).map((geometry, index) =>
      createPlanning3dParcelFeature(geometry, index)
    ),
  };
}

async function ensurePlanning3dDataset(datasetKey, force = false) {
  await hydratePlanning3dManifest();
  await initializePlanning3dMap();

  if (!force && planning3dState.sourceData[datasetKey]) {
    return planning3dState.sourceData[datasetKey];
  }

  const requestId = (planning3dState.datasetRequestId[datasetKey] || 0) + 1;
  planning3dState.datasetRequestId[datasetKey] = requestId;
  const isActiveRequest = () => planning3dState.datasetRequestId[datasetKey] === requestId;

  const manifest = getPlanning3dManifest();
  const datasetManifest = manifest[datasetKey];
  const datasetConfig = planning3dCatalog[datasetKey];
  const basePath = datasetManifest?.basePath || datasetConfig?.basePath;

  if (!basePath) {
    throw new Error(`No hay ruta disponible para el dataset ${datasetKey}.`);
  }

  planning3dState.dataLoading = true;
  setPlanning3dDatasetStatus(datasetKey, {
    phase: "fetching",
    loaded: 0,
    total: 0,
    previewCount: 0,
  });
  renderPlanning3dSummary();
  setPlanning3dStatus(
    datasetKey === "buildings"
      ? "Cargando construcciones 3D desde el shape real..."
      : "Cargando huella catastral para referencia parcelaria...",
    "loading"
  );

  try {
    if (!manifest.viaBackend) {
      return primePlanning3dLiteDataset(datasetKey, manifest);
    }

    if (datasetKey === "buildings" && !planning3dState.sourceData[datasetKey]) {
      primePlanning3dLiteDataset(datasetKey, manifest);
      setPlanning3dStatus(
        `Vista rapida inicial lista: ${formatPlanning3dCount(planning3dState.sourceData[datasetKey]?.features?.length)} construcciones. Completando shape real en segundo plano...`,
        "loading"
      );
    }

    const metadata = datasetKey === "buildings"
      ? await loadPlanning3dBuildingMetadata()
      : null;

    const workerCollectionPromise = runPlanning3dWorkerDataset(datasetKey, basePath, metadata, {
      requestId,
      previewTarget: datasetKey === "buildings" ? (manifest.viaBackend ? 3600 : 2400) : 0,
      batchSize: datasetKey === "buildings" ? 1800 : 1200,
      onPreview: ({ collection, total, previewCount }) => {
        if (!isActiveRequest()) {
          return;
        }
        planning3dState.sourceData[datasetKey] = collection;
        syncPlanning3dSource(datasetKey);
        setPlanning3dDatasetStatus(datasetKey, {
          phase: "preview",
          loaded: previewCount,
          total,
          previewCount,
        });
        renderPlanning3dSummary();
        renderPlanning3dSelection();
        setPlanning3dStatus(
          `Vista rapida lista: ${formatPlanning3dCount(previewCount)} construcciones. Completando detalle total en segundo plano...`,
          "loading"
        );
      },
      onProgress: ({ loaded, total }) => {
        if (!isActiveRequest()) {
          return;
        }
        setPlanning3dDatasetStatus(datasetKey, {
          phase: "building",
          loaded,
          total,
          previewCount: planning3dState.datasetStatus[datasetKey]?.previewCount || 0,
        });
        renderPlanning3dSummary();
        if (loaded !== total) {
          setPlanning3dStatus(
            datasetKey === "buildings"
              ? `Procesando construcciones 3D ${Math.round((loaded / total) * 100)}% (${formatPlanning3dCount(loaded)}/${formatPlanning3dCount(total)}).`
              : `Procesando catastro ${Math.round((loaded / total) * 100)}% (${formatPlanning3dCount(loaded)}/${formatPlanning3dCount(total)}).`,
            "loading"
          );
        }
      },
    });

    if (workerCollectionPromise) {
      try {
        const collection = await workerCollectionPromise;
        if (!isActiveRequest()) {
          return planning3dState.sourceData[datasetKey] || getPlanning3dEmptyCollection();
        }

        const total = collection.features.length;
        planning3dState.sourceData[datasetKey] = collection;
        syncPlanning3dSource(datasetKey);
        setPlanning3dDatasetStatus(datasetKey, {
          phase: "ready",
          loaded: total,
          total,
          previewCount: planning3dState.datasetStatus[datasetKey]?.previewCount || 0,
        });
        renderPlanning3dSummary();
        renderPlanning3dSelection();

        setPlanning3dStatus(
          datasetKey === "buildings"
            ? `Construcciones 3D listas: ${formatPlanning3dCount(collection.features.length)} edificaciones extruidas.`
            : `Catastro listo: ${formatPlanning3dCount(collection.features.length)} predios de apoyo cargados.`,
          datasetKey === "buildings" && manifest.viaBackend ? "real" : "demo"
        );

        return collection;
      } catch (workerError) {
        if (isActiveRequest()) {
          setPlanning3dStatus(
            `Compatibilidad activa: retomando carga directa para ${datasetKey === "buildings" ? "construcciones" : "catastro"}...`,
            "loading"
          );
          setPlanning3dDatasetStatus(datasetKey, {
            phase: "fetching",
            loaded: 0,
            total: 0,
            previewCount: 0,
          });
          renderPlanning3dSummary();
        }
      }
    }

    const geometries = await loadPlanning3dShapefile(basePath);
    const geometryList = getPlanning3dGeometryList(geometries);
    const total = geometryList.length;

    if (!isActiveRequest()) {
      return planning3dState.sourceData[datasetKey] || getPlanning3dEmptyCollection();
    }

    setPlanning3dDatasetStatus(datasetKey, {
      phase: "building",
      loaded: 0,
      total,
      previewCount: 0,
    });
    renderPlanning3dSummary();

    if (datasetKey === "buildings" && total > 4200) {
      const previewIndexes = getPlanning3dPreviewIndexes(total, manifest.viaBackend ? 3600 : 2400);
      const previewGeometries = previewIndexes.map((index) => geometryList[index]);
      const previewMetadata = slicePlanning3dMetadata(metadata, previewIndexes);
      const previewCollection = buildPlanning3dBuildingsCollection(previewGeometries, previewMetadata);

      if (isActiveRequest()) {
        planning3dState.sourceData[datasetKey] = previewCollection;
        syncPlanning3dSource(datasetKey);
        setPlanning3dDatasetStatus(datasetKey, {
          phase: "preview",
          loaded: previewIndexes.length,
          total,
          previewCount: previewIndexes.length,
        });
        renderPlanning3dSummary();
        renderPlanning3dSelection();
        setPlanning3dStatus(
          `Vista rapida lista: ${formatPlanning3dCount(previewIndexes.length)} construcciones. Completando detalle total en segundo plano...`,
          "loading"
        );
        await waitForPlanning3dYield();
      }
    }

    const collection = await buildPlanning3dCollectionProgressive(
      datasetKey,
      geometryList,
      metadata,
      {
        batchSize: datasetKey === "buildings" ? 1800 : 1200,
        onProgress: ({ loaded, total: totalFeatures }) => {
          if (!isActiveRequest()) {
            return;
          }
          setPlanning3dDatasetStatus(datasetKey, {
            phase: "building",
            loaded,
            total: totalFeatures,
          });
          renderPlanning3dSummary();
          if (loaded !== totalFeatures) {
            setPlanning3dStatus(
              datasetKey === "buildings"
                ? `Procesando construcciones 3D ${Math.round((loaded / totalFeatures) * 100)}% (${formatPlanning3dCount(loaded)}/${formatPlanning3dCount(totalFeatures)}).`
                : `Procesando catastro ${Math.round((loaded / totalFeatures) * 100)}% (${formatPlanning3dCount(loaded)}/${formatPlanning3dCount(totalFeatures)}).`,
              "loading"
            );
          }
        },
      }
    );

    if (!isActiveRequest()) {
      return planning3dState.sourceData[datasetKey] || getPlanning3dEmptyCollection();
    }

    planning3dState.sourceData[datasetKey] = collection;
    syncPlanning3dSource(datasetKey);
    setPlanning3dDatasetStatus(datasetKey, {
      phase: "ready",
      loaded: collection.features.length,
      total,
      previewCount: planning3dState.datasetStatus[datasetKey]?.previewCount || 0,
    });
    renderPlanning3dSummary();
    renderPlanning3dSelection();

    setPlanning3dStatus(
      datasetKey === "buildings"
        ? `Construcciones 3D listas: ${formatPlanning3dCount(collection.features.length)} edificaciones extruidas.`
        : `Catastro listo: ${formatPlanning3dCount(collection.features.length)} predios de apoyo cargados.`,
      datasetKey === "buildings" && manifest.viaBackend ? "real" : "demo"
    );

    return collection;
  } catch (error) {
    const demoGeometries = getPlanning3dDemoGeometries(datasetKey);
    if (!demoGeometries.length) {
      setPlanning3dDatasetStatus(datasetKey, {
        phase: "idle",
        loaded: 0,
        total: 0,
        previewCount: 0,
      });
      renderPlanning3dSummary();
      throw error;
    }

    const collection = datasetKey === "buildings"
      ? buildPlanning3dBuildingsCollection(demoGeometries)
      : buildPlanning3dParcelsCollection(demoGeometries);

    planning3dState.sourceData[datasetKey] = collection;
    syncPlanning3dSource(datasetKey);
    setPlanning3dDatasetStatus(datasetKey, {
      phase: "demo",
      loaded: collection.features.length,
      total: collection.features.length,
      previewCount: collection.features.length,
    });
    renderPlanning3dSummary();
    renderPlanning3dSelection();

    setPlanning3dStatus(
      datasetKey === "buildings"
        ? "Visor 3D publicado con muestra ligera de construcciones. Activa server.ps1 para usar los shapes completos."
        : "Catastro demo cargado para mantener operativo el visor 3D publicado.",
      "demo"
    );

    return collection;
  } finally {
    planning3dState.dataLoading = false;
  }
}

function syncPlanning3dSource(datasetKey) {
  const sourceId = datasetKey === "buildings" ? "planning3d-buildings" : "planning3d-parcels";
  const source = planning3dState.map?.getSource(sourceId);
  if (!source) {
    return;
  }
  source.setData(planning3dState.sourceData[datasetKey] || getPlanning3dEmptyCollection());
  updatePlanning3dHeightScale();
}

function syncPlanning3dLayerVisibility() {
  if (!planning3dState.map) {
    return;
  }

  if (planning3dState.map.getLayer("planning3d-buildings-fill")) {
    planning3dState.map.setLayoutProperty(
      "planning3d-buildings-fill",
      "visibility",
      planning3dState.buildingsVisible ? "visible" : "none"
    );
  }
  if (planning3dState.map.getLayer("planning3d-buildings-outline")) {
    planning3dState.map.setLayoutProperty(
      "planning3d-buildings-outline",
      "visibility",
      planning3dState.buildingsVisible ? "visible" : "none"
    );
  }
  if (planning3dState.map.getLayer("planning3d-parcels-line")) {
    planning3dState.map.setLayoutProperty(
      "planning3d-parcels-line",
      "visibility",
      planning3dState.parcelsVisible ? "visible" : "none"
    );
  }
}

function updatePlanning3dHeightScale() {
  if (!planning3dState.map?.getLayer("planning3d-buildings-fill")) {
    return;
  }

  planning3dState.map.setPaintProperty("planning3d-buildings-fill", "fill-extrusion-height", [
    "*",
    ["coalesce", ["get", "heightM"], 4.2],
    planning3dState.heightScale,
  ]);
}

function renderPlanning3dSummary() {
  if (!dom.planning3dSummary) {
    return;
  }

  const buildings = planning3dState.sourceData.buildings;
  const manifest = getPlanning3dManifest();
  const photoStatus = planning3dState.photoStatus;
  const buildingStatus = planning3dState.datasetStatus.buildings;
  if (!buildings?.features?.length) {
    dom.planning3dSummary.classList.add("empty-state");
    dom.planning3dSummary.classList.remove("has-data");
    dom.planning3dSummary.textContent = buildingStatus?.phase && buildingStatus.phase !== "idle"
      ? `Cargando visor 3D: ${getPlanning3dLoadLabel(buildingStatus)}${buildingStatus.total ? ` (${formatPlanning3dCount(buildingStatus.loaded)}/${formatPlanning3dCount(buildingStatus.total)})` : ""}.`
      : "Aqui veras el estado de carga, el conteo de construcciones y la altura media disponible.";
    return;
  }

  const buildingCount = buildings.features.length;
  const floorsMean = Number((buildings.features.reduce((sum, feature) => sum + (Number(feature.properties?.floors) || 1), 0) / buildingCount).toFixed(2));
  const heightMean = Number((buildings.features.reduce((sum, feature) => sum + (Number(feature.properties?.heightM) || 4.2), 0) / buildingCount).toFixed(1));
  const parcelCount = planning3dState.sourceData.parcels?.features?.length || manifest.parcels?.recordCount || null;
  const candidateCount = state.planningData?.candidates?.length || 0;
  const photoCount = photoStatus?.available ? photoStatus.geotaggedCount : null;

  dom.planning3dSummary.classList.remove("empty-state");
  dom.planning3dSummary.classList.add("has-data");
  dom.planning3dSummary.innerHTML = `
    <div class="planning-3d-summary-grid">
      <article class="planning-3d-chip">
        <span>Construcciones</span>
        <strong>${formatPlanning3dCount(buildingCount)}</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Pisos medios</span>
        <strong>${floorsMean}</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Altura media</span>
        <strong>${heightMean} m</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Catastro</span>
        <strong>${formatPlanning3dCount(parcelCount, planning3dState.parcelsVisible ? "Cargando" : "Listo")}</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Fotos GPS</span>
        <strong>${photoStatus ? (photoStatus.indexing ? "Indexando" : (photoStatus.available ? formatPlanning3dCount(photoCount) : "Sin indice")) : "Pendiente"}</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Carga</span>
        <strong>${getPlanning3dLoadLabel(buildingStatus)}</strong>
      </article>
    </div>
    <p class="planning-3d-copy-small">
      ${manifest.viaBackend
        ? "El backend local esta usando el campo n_piso para definir alturas y mejorar la extrusion del tejido urbano."
        : "Estas alturas son aproximadas para no depender del backend local; al correr server.ps1 el visor usa el campo real n_piso."}
      ${buildingStatus?.phase === "preview"
        ? ` Ya tienes una vista rapida activa mientras se completa el detalle total del tejido urbano.`
        : buildingStatus?.phase === "building"
          ? ` El visor sigue refinando el detalle completo en segundo plano para no bloquear la navegacion inicial.`
          : ""}
      ${photoStatus
        ? (photoStatus.indexing
          ? ` ${photoStatus.message || "Las fotos se estan indexando en segundo plano para habilitar la galeria local."}`
          : (photoStatus.available
          ? ` El servicio local encontro ${formatPlanning3dCount(photoStatus.totalFiles)} fotos, con ${formatPlanning3dCount(photoStatus.geotaggedCount)} georreferenciadas.`
          : ` ${photoStatus.message || "Sin acceso a fotos locales por ahora."}`))
        : ""}
      ${candidateCount ? ` Hay ${candidateCount} sectores priorizados del analisis territorial visibles como nodos amarillos.` : ""}
    </p>
  `;
}

function renderPlanning3dSelection() {
  if (!dom.planning3dSelection) {
    return;
  }

  const feature = planning3dState.selectedBuilding;
  if (!feature) {
    dom.planning3dSelection.classList.add("empty-state");
    dom.planning3dSelection.classList.remove("has-data");
    dom.planning3dSelection.textContent = "Selecciona una construccion en el visor 3D para revisar altura, bloque y huella.";
    return;
  }

  const props = feature.properties || {};
  const photoStatus = planning3dState.photoStatus;
  const photos = planning3dState.selectedPhotos || [];
  const photoStateMarkup = planning3dState.loadingPhotos
    ? `
      <div class="planning-3d-photo-state loading">
        Buscando fotos georreferenciadas cercanas a esta construccion...
      </div>
    `
    : photos.length
      ? `
        <div class="planning-3d-photo-grid">
          ${photos.map((photo) => `
            <a class="planning-3d-photo-card" href="${photo.url}" target="_blank" rel="noopener noreferrer">
              <img src="${photo.url}" alt="${photo.fileName}">
              <div class="planning-3d-photo-meta">
                <strong>${photo.fileName}</strong>
                <span>${photo.folder}</span>
                <span>${formatPlanning3dDistance(photo.distanceM)}</span>
              </div>
            </a>
          `).join("")}
        </div>
      `
      : `
        <div class="planning-3d-photo-state ${photoStatus?.indexing ? "loading" : (photoStatus?.available ? "empty" : "warning")}">
          ${planning3dState.photoQueryMessage
            || (photoStatus?.indexing
              ? (photoStatus.message || "Indexando fotos georreferenciadas. Esta primera pasada puede tardar varios minutos.")
              : (photoStatus?.available
                ? "No encontre fotos cercanas a este edificio dentro del indice local. Intentare las mas proximas cuando haya mejor enlace fachada-edificio."
                : (photoStatus?.message || "El servicio local de fotos no esta activo en este momento.")))}
        </div>
      `;

  dom.planning3dSelection.classList.remove("empty-state");
  dom.planning3dSelection.classList.add("has-data");
  dom.planning3dSelection.innerHTML = `
    <h4>Construccion ${props.buildingId || props.recordIndex + 1}</h4>
    <div class="planning-3d-selection-grid">
      <article class="planning-3d-chip">
        <span>Bloque</span>
        <strong>${props.blockId || "Sin bloque"}</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Pisos</span>
        <strong>${props.floors || 1}</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Altura</span>
        <strong>${props.heightM || 4.2} m</strong>
      </article>
      <article class="planning-3d-chip">
        <span>Huella aprox.</span>
        <strong>${props.footprintM2 || 0} m2</strong>
      </article>
    </div>
    <p class="planning-3d-note">
      Fuente de altura: ${props.heightSource === "dbf" ? "campo n_piso del shape de construcciones" : "estimacion geometrica local"}.
      Las fotos se buscan por cercania al centroide del edificio usando el indice GPS local.
    </p>
    <section class="planning-3d-photo-section">
      <div class="planning-3d-photo-head">
        <h5>Fachadas cercanas</h5>
        <span>${photoStatus?.indexing ? "Indexando" : (photoStatus?.available ? `${photos.length} visibles` : "Servicio local")}</span>
      </div>
      ${photoStateMarkup}
    </section>
  `;
}

async function loadPlanning3dNearbyPhotos(feature) {
  if (!feature) {
    planning3dState.selectedPhotos = [];
    planning3dState.loadingPhotos = false;
    renderPlanning3dSelection();
    return [];
  }

  planning3dState.loadingPhotos = true;
  planning3dState.photoQueryMessage = null;
  renderPlanning3dSelection();

  const activeFeatureId = feature.id;
  const [lon, lat] = feature.properties?.centroid || turf.centroid(feature).geometry.coordinates;
  await hydratePlanning3dPhotoStatus();

  if (!planning3dState.photoStatus?.available) {
    planning3dState.selectedPhotos = [];
    planning3dState.loadingPhotos = false;
    planning3dState.photoQueryMessage = planning3dState.photoStatus?.message || null;
    renderPlanning3dSelection();
    return [];
  }

  try {
    const response = await fetch("./api/planning/3d/photos/nearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        lat,
        lon,
        radiusM: 80,
        limit: 8,
      }),
    });
    if (!response.ok) {
      throw new Error(`No se pudieron consultar fotos cercanas (${response.status}).`);
    }

    const payload = await response.json();
    if (planning3dState.selectedFeatureId !== activeFeatureId) {
      return [];
    }
    planning3dState.photoQueryMessage = payload.message || null;
    if (payload.indexing) {
      planning3dState.selectedPhotos = [];
      planning3dState.photoStatus = {
        ...(planning3dState.photoStatus || {}),
        indexing: true,
        message: payload.message || "Indexando fotos georreferenciadas en segundo plano.",
      };
      return [];
    }
    planning3dState.selectedPhotos = Array.isArray(payload.matches)
      ? payload.matches.filter((item) => item.withinRadius).concat(
        payload.matches.filter((item) => !item.withinRadius)
      ).slice(0, 8)
      : [];
    return planning3dState.selectedPhotos;
  } catch (error) {
    if (planning3dState.selectedFeatureId !== activeFeatureId) {
      return [];
    }
    planning3dState.selectedPhotos = [];
    planning3dState.photoStatus = {
      ...(planning3dState.photoStatus || {}),
      available: false,
      message: error.message,
    };
    return [];
  } finally {
    if (planning3dState.selectedFeatureId === activeFeatureId) {
      planning3dState.loadingPhotos = false;
      renderPlanning3dSelection();
    }
  }
}

function clearPlanning3dSelection() {
  if (planning3dState.selectedFeatureId != null && planning3dState.map?.getSource("planning3d-buildings")) {
    planning3dState.map.setFeatureState(
      { source: "planning3d-buildings", id: planning3dState.selectedFeatureId },
      { selected: false }
    );
  }
  planning3dState.selectedFeatureId = null;
  planning3dState.selectedBuilding = null;
  planning3dState.selectedPhotos = [];
  planning3dState.loadingPhotos = false;
  planning3dState.photoQueryMessage = null;
  planning3dState.popup?.remove();
  planning3dState.popup = null;
  renderPlanning3dSelection();
}

async function selectPlanning3dBuilding(feature, lngLat = null) {
  if (!planning3dState.map) {
    return;
  }

  if (planning3dState.selectedFeatureId != null) {
    planning3dState.map.setFeatureState(
      { source: "planning3d-buildings", id: planning3dState.selectedFeatureId },
      { selected: false }
    );
  }

  planning3dState.selectedFeatureId = feature.id;
  planning3dState.selectedBuilding = feature;
  planning3dState.map.setFeatureState(
    { source: "planning3d-buildings", id: feature.id },
    { selected: true }
  );
  planning3dState.selectedPhotos = [];
  planning3dState.loadingPhotos = true;
  renderPlanning3dSelection();

  if (!lngLat) {
    const [lon, lat] = feature.properties?.centroid || [-78.59, -0.503];
    lngLat = { lng: lon, lat };
  }

  planning3dState.popup?.remove();
  planning3dState.popup = new window.maplibregl.Popup({
    closeButton: false,
    offset: 18,
  })
    .setLngLat(lngLat)
    .setHTML(`
      <p class="popup-title">Construccion ${feature.properties?.buildingId || feature.properties?.recordIndex + 1}</p>
      <p class="popup-copy">${feature.properties?.floors || 1} pisos | ${feature.properties?.heightM || 4.2} m | huella aprox. ${feature.properties?.footprintM2 || 0} m2</p>
    `)
    .addTo(planning3dState.map);

  await loadPlanning3dNearbyPhotos(feature);
}

function getPlanning3dCandidateCollection() {
  const candidates = state.planningData?.candidates || [];
  if (!candidates.length) {
    return getPlanning3dEmptyCollection();
  }

  return {
    type: "FeatureCollection",
    features: candidates.map((candidate, index) => {
      const feature = candidate.feature || candidate;
      const center = turf.centroid(feature).geometry.coordinates;
      return {
        type: "Feature",
        properties: {
          id: candidate.id || `candidate-${index + 1}`,
          label: candidate.label || `Candidato ${index + 1}`,
          score: candidate.score || candidate.feature?.properties?.score || 0,
        },
        geometry: {
          type: "Point",
          coordinates: center,
        },
      };
    }),
  };
}

function updatePlanning3dCandidateSource() {
  planning3dState.sourceData.candidates = getPlanning3dCandidateCollection();
  const source = planning3dState.map?.getSource("planning3d-candidates");
  if (source) {
    source.setData(planning3dState.sourceData.candidates);
  }
  renderPlanning3dSummary();
}

function focusPlanning3dDataset() {
  if (!planning3dState.map) {
    return;
  }

  let focusFeature = null;
  if (state.planningData?.candidates?.[0]?.feature) {
    focusFeature = state.planningData.candidates[0].feature;
  } else if (planning3dState.sourceData.buildings?.features?.length) {
    focusFeature = planning3dState.sourceData.buildings;
  }
  if (!focusFeature) {
    return;
  }

  const bbox = turf.bbox(focusFeature);
  planning3dState.map.fitBounds([
    [bbox[0], bbox[1]],
    [bbox[2], bbox[3]],
  ], {
    padding: 48,
    duration: 900,
  });
}

function setPlanning3dBase(baseId = "satellite") {
  planning3dState.currentBase = baseId;
  syncPlanning3dBaseButtons();
  if (!planning3dState.map) {
    return;
  }
  planning3dState.map.setStyle(createPlanning3dStyle(baseId));
  planning3dState.readyPromise = new Promise((resolve) => {
    planning3dState.map.once("style.load", () => {
      addPlanning3dRuntimeLayers();
      updatePlanning3dCandidateSource();
      syncPlanning3dLayerVisibility();
      updatePlanning3dHeightScale();
      resolve(planning3dState.map);
    });
  });
}

async function openPlanning3dViewer() {
  planning3dState.modalOpen = true;
  dom.planning3dModal?.classList.remove("hidden");
  if (dom.planning3dModal) {
    dom.planning3dModal.setAttribute("aria-hidden", "false");
  }
  syncPlanning3dBaseButtons();
  setPlanning3dStatus("Preparando visualizador 3D urbano con vista rapida inicial...", "loading");
  setPlanning3dDatasetStatus("buildings", {
    phase: "fetching",
    loaded: 0,
    total: 0,
    previewCount: 0,
  });
  renderPlanning3dSummary();

  try {
    await hydratePlanning3dManifest();
    const mapPromise = initializePlanning3dMap();
    const buildingPromise = ensurePlanning3dDataset("buildings");
    hydratePlanning3dPhotoStatus();
    await mapPromise;
    planning3dState.map.resize();
    await buildingPromise;
    if (planning3dState.parcelsVisible) {
      await ensurePlanning3dDataset("parcels");
    }
    updatePlanning3dCandidateSource();
    syncPlanning3dLayerVisibility();
    updatePlanning3dHeightScale();
    focusPlanning3dDataset();
  } catch (error) {
    setPlanning3dStatus(`No se pudo abrir el visor 3D: ${error.message}`, "demo");
  }
}

function closePlanning3dViewer(silent = false) {
  planning3dState.modalOpen = false;
  dom.planning3dModal?.classList.add("hidden");
  if (dom.planning3dModal) {
    dom.planning3dModal.setAttribute("aria-hidden", "true");
  }
  if (!silent) {
    clearPlanning3dSelection();
  }
}

async function reloadPlanning3dData() {
  terminatePlanning3dWorker("buildings");
  terminatePlanning3dWorker("parcels");
  planning3dState.manifest = null;
  planning3dState.manifestPromise = null;
  planning3dState.photoStatus = null;
  planning3dState.photoStatusPromise = null;
  planning3dState.datasetRequestId.buildings += 1;
  planning3dState.datasetRequestId.parcels += 1;
  planning3dState.datasetStatus.buildings = {
    phase: "idle",
    loaded: 0,
    total: 0,
    previewCount: 0,
  };
  planning3dState.datasetStatus.parcels = {
    phase: "idle",
    loaded: 0,
    total: 0,
    previewCount: 0,
  };
  planning3dState.sourceData.buildings = null;
  planning3dState.sourceData.parcels = null;
  planning3dState.sourceData.candidates = getPlanning3dEmptyCollection();
  clearPlanning3dSelection();
  renderPlanning3dPanel();
  renderPlanning3dSummary();
  if (planning3dState.map?.getSource("planning3d-buildings")) {
    planning3dState.map.getSource("planning3d-buildings").setData(getPlanning3dEmptyCollection());
  }
  if (planning3dState.map?.getSource("planning3d-parcels")) {
    planning3dState.map.getSource("planning3d-parcels").setData(getPlanning3dEmptyCollection());
  }
  if (planning3dState.map?.getSource("planning3d-candidates")) {
    planning3dState.map.getSource("planning3d-candidates").setData(getPlanning3dEmptyCollection());
  }

  await hydratePlanning3dManifest(true);
  if (planning3dState.modalOpen) {
    await ensurePlanning3dDataset("buildings", true);
    if (planning3dState.parcelsVisible) {
      await ensurePlanning3dDataset("parcels", true);
    }
    updatePlanning3dCandidateSource();
    focusPlanning3dDataset();
  }
}

function renderPlanningModule() {
  const imageryProfile = getPlanningImageryProfile();
  renderPlanningVariableMatrix();
  renderPlanning3dPanel();
  if (dom.planningImagerySelect) {
    dom.planningImagerySelect.value = state.planningImageryId;
  }
  if (dom.planningUseSelect) {
    dom.planningUseSelect.value = state.planningUseId;
  }
  if (dom.planningHorizonSelect) {
    dom.planningHorizonSelect.value = state.planningHorizonId;
  }
  if (dom.planningGrowthSelect) {
    dom.planningGrowthSelect.value = state.planningGrowthScenarioId;
  }
  if (dom.focusPlanningBtn) {
    dom.focusPlanningBtn.disabled = !(state.planningData?.candidates?.length);
  }
  if (dom.clearPlanningBtn) {
    dom.clearPlanningBtn.disabled = !state.planningData;
  }
  if (dom.planningSourceNote) {
    dom.planningSourceNote.textContent = `${imageryProfile.label}: ${imageryProfile.useCopy} Resolucion ${imageryProfile.spatialLabel} y frecuencia ${imageryProfile.temporalLabel}.`;
  }
  if (state.entryRoute === "planificacion" && !state.planningData) {
    updateMapSummary();
  }

  if (!state.planningData) {
    resetMetricGrid(dom.planningResults, "Ejecuta el modulo para obtener celdas aptas y candidatos priorizados.");
    dom.planningWeights.classList.add("empty-state");
    dom.planningWeights.classList.remove("has-data");
    dom.planningWeights.textContent = "La ponderacion se ajusta automaticamente segun el tipo de equipamiento, la fuente satelital y el escenario de crecimiento.";
    dom.planningCandidates.classList.add("empty-state");
    dom.planningCandidates.classList.remove("has-data");
    dom.planningCandidates.textContent = "Aqui apareceran los sectores recomendados para implantacion territorial.";
  }
}

function renderPlanningVariableMatrix() {
  if (!dom.planningVariableMatrix) {
    return;
  }

  const planning = state.planningData?.imageryProfile?.id === state.planningImageryId
    ? state.planningData
    : null;
  const imageryProfile = planning?.imageryProfile || getPlanningImageryProfile();
  const items = planning?.imagerySummary?.items
    || imageryProfile.variables.map((variableId) => {
      const definition = getPlanningVariableDefinition(variableId);
      return {
        ...definition,
        mean: null,
        strengthLabel: definition.emphasis,
      };
    });
  const summaryCopy = planning?.imagerySummary?.copy
    || `Esta fuente aporta ${items.length} variables territoriales para modular crecimiento, acceso, servicios, resiliencia y compatibilidad de ocupacion.`;

  dom.planningVariableMatrix.classList.remove("empty-state");
  dom.planningVariableMatrix.innerHTML = `
    <p class="planning-variable-summary">${summaryCopy}</p>
    <div class="planning-variable-grid">
      ${items.map((item) => `
        <article class="planning-variable-card tone-${item.tone || "neutral"}">
          <div class="planning-variable-head">
            <div>
              <p class="planning-variable-role">${item.role}</p>
              <h4>${item.label}</h4>
            </div>
            <span class="planning-variable-score">${item.mean == null ? item.strengthLabel : `${item.mean}%`}</span>
          </div>
          <p class="planning-variable-copy">${item.copy}</p>
          ${item.mean == null ? "" : `
            <div class="planning-variable-bar">
              <span style="width: ${item.mean}%"></span>
            </div>
          `}
        </article>
      `).join("")}
    </div>
  `;
}

function runPlanningAnalysis(silent = false) {
  const planning = buildPlanningAnalysis();
  state.planningData = planning;
  state.planningHighlightId = planning.candidates[0]?.id || null;

  const cards = [
    {
      label: "Suelo clase A",
      value: `${planning.summary.priorityAreaHa.toFixed(0)} ha`,
      copy: "Celdas con puntaje >= 70 y compatibilidad urbana-alta para implantacion.",
    },
    {
      label: "Indice multicriterio",
      value: `${planning.summary.meanScore}/100`,
      copy: `${planning.program.longLabel} para ${planning.context.scopeLabel}.`,
    },
    {
      label: "Expansion dominante",
      value: planning.summary.anchorLabel,
      copy: `Presion urbana media ${planning.summary.growthMean}% en escenario ${planning.scenario.label}.`,
    },
    {
      label: "Cobertura objetivo",
      value: planning.summary.serviceGapLabel,
      copy: `Brecha territorial para ${planning.program.targetServiceLabel}.`,
    },
    {
      label: "Riesgo hidrico",
      value: planning.summary.riskLabel,
      copy: `Resiliencia ${planning.summary.resilienceMean}% con pendiente media ${planning.summary.meanSlope}%.`,
    },
    {
      label: "Compatibilidad territorial",
      value: planning.summary.landLabel,
      copy: `${planning.imageryProfile.shortLabel} prioriza ${planning.summary.landCopy}.`,
    },
    {
      label: "Fuente satelital",
      value: planning.imageryProfile.shortLabel,
      copy: `${planning.imageryProfile.providerLabel} / ${planning.imageryProfile.spatialLabel}.`,
    },
    {
      label: "Variables satelitales",
      value: planning.imagerySummary.headline,
      copy: planning.imagerySummary.copy,
    },
  ];

  paintMetricGrid(dom.planningResults, cards);
  renderPlanningWeights(planning);
  renderPlanningCandidates(planning);
  renderPlanningOverlay(planning);
  updatePlanning3dCandidateSource();
  renderPlanningModule();
  updateMapSummary();

  if (!silent) {
    setStatus(
      `Planificacion ${planning.program.longLabel} lista para ${planning.context.scopeLabel} con ${planning.imageryProfile.shortLabel}. Se priorizaron ${planning.candidates.length} sectores.`
    );
  }

  return planning;
}

function clearPlanningAnalysis() {
  state.planningData = null;
  state.planningHighlightId = null;
  clearPlanningOverlay();
  updatePlanning3dCandidateSource();
  renderPlanningModule();
  updateMapSummary();
  setStatus("Modulo de planificacion limpiado. Puedes lanzar un nuevo escenario territorial.");
}

function buildPlanningAnalysis() {
  const program = getPlanningProgram();
  const imageryProfile = getPlanningImageryProfile();
  const horizon = getPlanningHorizon();
  const scenario = getPlanningScenario();
  const target = getCurrentAnalysisTarget();
  const urbanFeatures = geoSources.manchaUrbana.features;
  const roadFeatures = geoSources.vias.features;
  const canalFeatures = geoSources.canales.features;
  const facilityFeatures = geoSources.equipamientos.features;
  const targetAreaHa = turf.area(target.feature) / 10000;
  const cellSize = target.scopeType === "plot"
    ? clamp(Math.sqrt(targetAreaHa + 0.4) / 16, 0.12, 0.48)
    : clamp(0.88 + horizon.expansionShift * 0.18, 0.88, 1.42);
  const grid = turf.squareGrid(turf.bbox(target.feature), cellSize, { units: "kilometers" });
  const features = [];

  grid.features.forEach((cell, index) => {
    const centroid = turf.centroid(cell);
    if (!turf.booleanPointInPolygon(centroid, target.feature)) {
      return;
    }

    const [lon, lat] = centroid.geometry.coordinates;
    const nearestUrban = getNearestFeatureMatch(centroid, urbanFeatures);
    const nearestRoad = getNearestFeatureMatch(centroid, roadFeatures);
    const nearestCanal = getNearestFeatureMatch(centroid, canalFeatures);
    const facilityDistances = {
      escuela: getNearestFeatureMatch(centroid, facilityFeatures, (feature) => feature.properties?.serviceType === "escuela"),
      hospital: getNearestFeatureMatch(centroid, facilityFeatures, (feature) => feature.properties?.serviceType === "hospital"),
      equipamiento: getNearestFeatureMatch(centroid, facilityFeatures, (feature) => feature.properties?.serviceType === "equipamiento"),
    };
    const insideUrban = urbanFeatures.some((feature) => turf.booleanPointInPolygon(centroid, feature));
    const slope = computePlanningSlope(lon, lat, nearestRoad.distanceKm, nearestCanal.distanceKm, insideUrban);
    const variableScores = computePlanningBaseVariableScores(
      lon,
      lat,
      nearestUrban,
      nearestRoad,
      nearestCanal,
      insideUrban,
      slope
    );
    const imageryEvidence = computePlanningImageryEvidence(imageryProfile, variableScores);
    const growthScore = clamp(
      computePlanningGrowthScore(program, horizon, scenario, nearestUrban, nearestRoad, insideUrban) * 0.72
      + imageryEvidence.growth * 0.28,
      0,
      1
    );
    const accessScore = clamp(
      computePlanningAccessScore(program, scenario, nearestRoad, nearestUrban) * 0.76
      + imageryEvidence.access * 0.24,
      0,
      1
    );
    const urbanSignal = imageryEvidence.growth;
    const terrainScore = clamp(1 - slope / (program.maxSlope * 1.45), 0, 1);
    const resilienceScore = computePlanningResilienceScore(slope, nearestCanal.distanceKm, imageryEvidence.resilience, insideUrban);
    const serviceScore = computePlanningServiceScore(program.id, facilityDistances, growthScore, horizon, scenario, imageryEvidence.service);
    const landScore = computePlanningLandReserveScore(
      program,
      scenario,
      nearestUrban.distanceKm,
      nearestRoad.distanceKm,
      insideUrban,
      slope,
      nearestCanal.distanceKm,
      imageryEvidence.land
    );
    const score = Math.round(clamp(
      (clamp((growthScore + urbanSignal) / 2, 0, 1) * program.weights.growth)
      + (accessScore * program.weights.access)
      + (terrainScore * program.weights.terrain)
      + (serviceScore * program.weights.service)
      + (resilienceScore * program.weights.resilience)
      + (landScore * program.weights.land),
      0,
      1
    ) * 100);
    const anchorCentroid = nearestUrban.feature
      ? turf.centroid(nearestUrban.feature).geometry.coordinates
      : turf.centroid(target.feature).geometry.coordinates;

    cell.properties = {
      id: `planning-cell-${index}`,
      score,
      classLabel: getPlanningClassLabel(score),
      anchorName: nearestUrban.feature?.properties?.name || "Nodo urbano",
      anchorCoords: anchorCentroid,
      growthScore: Math.round(growthScore * 100),
      accessScore: Math.round(accessScore * 100),
      serviceScore: Math.round(serviceScore * 100),
      resilienceScore: Math.round(resilienceScore * 100),
      landScore: Math.round(landScore * 100),
      urbanSignal: Math.round(urbanSignal * 100),
      primaryVariableLabel: imageryEvidence.variables[0]?.label || imageryProfile.shortLabel,
      primaryVariableScore: imageryEvidence.variables[0]?.score || Math.round(urbanSignal * 100),
      secondaryVariableLabel: imageryEvidence.variables[1]?.label || "Soporte territorial",
      secondaryVariableScore: imageryEvidence.variables[1]?.score || Math.round(accessScore * 100),
      variableScores: imageryEvidence.variableScoreMap,
      slope: Number(slope.toFixed(1)),
      urbanDistanceKm: Number(nearestUrban.distanceKm.toFixed(2)),
      roadDistanceKm: Number(nearestRoad.distanceKm.toFixed(2)),
      canalDistanceKm: Number(nearestCanal.distanceKm.toFixed(2)),
      schoolDistanceKm: Number(facilityDistances.escuela.distanceKm.toFixed(2)),
      hospitalDistanceKm: Number(facilityDistances.hospital.distanceKm.toFixed(2)),
      equipmentDistanceKm: Number(facilityDistances.equipamiento.distanceKm.toFixed(2)),
      summary: buildPlanningSectorSummary(program.id, {
        anchorName: nearestUrban.feature?.properties?.name || "Nodo urbano",
        roadDistanceKm: nearestRoad.distanceKm,
        schoolDistanceKm: facilityDistances.escuela.distanceKm,
        hospitalDistanceKm: facilityDistances.hospital.distanceKm,
        equipmentDistanceKm: facilityDistances.equipamiento.distanceKm,
      }),
    };
    features.push(cell);
  });

  const candidates = selectPlanningCandidates(features, program, imageryProfile, target.scopeType);
  const summary = summarizePlanningSurface(features, program, scenario);
  const imagerySummary = summarizePlanningImageryVariables(features, imageryProfile);

  return {
    context: target,
    program,
    imageryProfile,
    horizon,
    scenario,
    surface: {
      type: "FeatureCollection",
      features,
    },
    candidates,
    imagerySummary,
    summary,
  };
}

function computePlanningGrowthScore(program, horizon, scenario, nearestUrban, nearestRoad, insideUrban) {
  const urbanDistance = nearestUrban.distanceKm;
  const growthRate = Number(nearestUrban.feature?.properties?.growthRate) || 0.62;
  const adjustedUrban = {
    idealMin: Math.max(0, program.urbanDistance.idealMin - (scenario.id === "expansivo" ? 0.08 : 0)),
    idealMax: program.urbanDistance.idealMax + horizon.expansionShift * scenario.growthMultiplier,
    hardMax: program.urbanDistance.hardMax + horizon.expansionShift * 1.8,
    insideScore: program.urbanDistance.insideScore,
  };
  const urbanBand = scoreDistanceBand(urbanDistance, adjustedUrban, insideUrban);
  const corridorBand = scoreDistanceBand(nearestRoad.distanceKm, {
    idealMin: 0.04,
    idealMax: 0.9 * scenario.corridorBoost,
    hardMax: 2.8,
    insideScore: 0.64,
  }, false);
  return clamp(
    urbanBand * (0.68 + growthRate * 0.32) * scenario.growthMultiplier
    + corridorBand * 0.14,
    0,
    1
  );
}

function computePlanningAccessScore(program, scenario, nearestRoad, nearestUrban) {
  const roadBand = scoreDistanceBand(nearestRoad.distanceKm, {
    idealMin: program.accessDistance.idealMin,
    idealMax: program.accessDistance.idealMax * scenario.corridorBoost,
    hardMax: program.accessDistance.hardMax,
    insideScore: 0.82,
  }, false);
  const centrality = scoreDistanceBand(nearestUrban.distanceKm, {
    idealMin: 0,
    idealMax: 2.4,
    hardMax: 5.2,
    insideScore: 0.78,
  }, nearestUrban.distanceKm === 0);
  return clamp(roadBand * 0.76 + centrality * 0.24, 0, 1);
}

function computePlanningBaseVariableScores(lon, lat, nearestUrban, nearestRoad, nearestCanal, insideUrban, slope) {
  const growthRate = Number(nearestUrban.feature?.properties?.growthRate) || 0.62;
  const corridorAccessibility = scoreDistanceBand(nearestRoad.distanceKm, {
    idealMin: 0.04,
    idealMax: 0.82,
    hardMax: 2.7,
    insideScore: 0.76,
  }, false);
  const urbanFootprint = clamp(
    0.32
    + (insideUrban ? 0.28 : 0)
    + Math.max(0, 1 - nearestUrban.distanceKm / 3.4) * 0.2
    + corridorAccessibility * 0.12
    + pseudoNoise(lon * 7.4, lat * 5.6, 91) * 0.08,
    0,
    1
  );
  const periurbanTransition = clamp(
    scoreDistanceBand(nearestUrban.distanceKm, {
      idealMin: 0.12,
      idealMax: 1.55,
      hardMax: 3.6,
      insideScore: 0.44,
    }, insideUrban) * 0.72
    + corridorAccessibility * 0.16
    + growthRate * 0.12,
    0,
    1
  );
  const historicalExpansion = clamp(
    0.24
    + growthRate * 0.5
    + periurbanTransition * 0.18
    + corridorAccessibility * 0.08
    + pseudoNoise(lat * 8.8, lon * 4.2, 17) * 0.08,
    0,
    1
  );
  const floodExposure = clamp(
    ((0.95 - Math.min(nearestCanal.distanceKm, 0.95)) / 0.95) * 0.58
    + clamp((8 - slope) / 8, 0, 1) * 0.22
    + pseudoNoise(lon * 4.3, lat * 6.2, 55) * 0.08,
    0,
    1
  );
  const floodSafety = clamp(
    1 - floodExposure * 0.86 + clamp(slope / 18, 0, 1) * 0.12,
    0,
    1
  );
  const serviceCentrality = clamp(
    scoreDistanceBand(nearestUrban.distanceKm, {
      idealMin: 0,
      idealMax: 2.2,
      hardMax: 5.4,
      insideScore: 0.82,
    }, insideUrban) * 0.58
    + corridorAccessibility * 0.28
    + growthRate * 0.14,
    0,
    1
  );
  const reserveCompatibility = clamp(
    periurbanTransition * 0.36
    + floodSafety * 0.22
    + corridorAccessibility * 0.14
    + clamp(1 - Math.abs(urbanFootprint - 0.58) / 0.58, 0, 1) * 0.28,
    0,
    1
  );
  const structuralContinuity = clamp(
    urbanFootprint * 0.56
    + corridorAccessibility * 0.18
    + (insideUrban ? 0.16 : 0)
    + pseudoNoise(lon * 5.2, lat * 6.9, 73) * 0.1,
    0,
    1
  );
  const nightActivity = clamp(
    serviceCentrality * 0.46
    + corridorAccessibility * 0.18
    + historicalExpansion * 0.18
    + (insideUrban ? 0.1 : 0)
    + pseudoNoise(lon * 2.8, lat * 9.1, 14) * 0.08,
    0,
    1
  );

  return {
    urbanFootprint,
    periurbanTransition,
    historicalExpansion,
    floodSafety,
    serviceCentrality,
    corridorAccessibility,
    reserveCompatibility,
    structuralContinuity,
    nightActivity,
  };
}

function blendPlanningSignalMix(signalMix, variableScores) {
  const entries = Object.entries(signalMix || {});
  if (!entries.length) {
    return 0;
  }
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  return entries.reduce((sum, [variableId, weight]) => sum + (variableScores[variableId] || 0) * weight, 0) / totalWeight;
}

function computePlanningImageryEvidence(imageryProfile, variableScores) {
  const variables = imageryProfile.variables
    .map((variableId) => {
      const definition = getPlanningVariableDefinition(variableId);
      return {
        ...definition,
        score: Math.round((variableScores[variableId] || 0) * 100),
      };
    })
    .sort((left, right) => right.score - left.score);

  return {
    growth: clamp(blendPlanningSignalMix(imageryProfile.signalMix?.growth, variableScores) * imageryProfile.growthBias, 0, 1),
    access: clamp(blendPlanningSignalMix(imageryProfile.signalMix?.access, variableScores), 0, 1),
    service: clamp(blendPlanningSignalMix(imageryProfile.signalMix?.service, variableScores) * imageryProfile.serviceBias, 0, 1),
    resilience: clamp(blendPlanningSignalMix(imageryProfile.signalMix?.resilience, variableScores) * imageryProfile.resilienceBias, 0, 1),
    land: clamp(blendPlanningSignalMix(imageryProfile.signalMix?.land, variableScores) * imageryProfile.reserveBias, 0, 1),
    variables,
    variableScoreMap: Object.fromEntries(
      Object.entries(variableScores).map(([variableId, value]) => [variableId, Math.round(value * 100)])
    ),
  };
}

function computePlanningSlope(lon, lat, roadDistanceKm, canalDistanceKm, insideUrban) {
  return clamp(
    2.4
    + Math.abs(pseudoNoise(lon * 6.2, lat * 4.7, 71)) * 9.8
    + Math.abs(pseudoNoise(lat * 11.4, lon * 3.2, 19)) * 4.2
    + roadDistanceKm * 1.4
    - (insideUrban ? 1.2 : 0)
    + Math.max(0, 0.4 - canalDistanceKm) * 4.8,
    1.2,
    24
  );
}

function computePlanningResilienceScore(slope, canalDistanceKm, resilienceSignal, insideUrban) {
  const floodPenalty = clamp((0.95 - Math.min(canalDistanceKm, 0.95)) / 0.95, 0, 1);
  const slopePenalty = clamp(slope / 20, 0, 1) * 0.26;
  const resilienceBoost = clamp((resilienceSignal - 0.5) * 0.24, -0.08, 0.14);
  return clamp(
    1 - (floodPenalty * 0.52 + slopePenalty) + resilienceBoost + (insideUrban ? 0.05 : 0),
    0,
    1
  );
}

function computePlanningServiceScore(programId, facilityDistances, growthScore, horizon, scenario, serviceSupport) {
  const demandBoost = clamp(growthScore * (0.78 + horizon.demandBoost) * scenario.growthMultiplier, 0, 1);
  const schoolDistance = facilityDistances.escuela.distanceKm;
  const hospitalDistance = facilityDistances.hospital.distanceKm;
  const equipmentDistance = facilityDistances.equipamiento.distanceKm;

  if (programId === "vis") {
    const schoolScore = scoreDistanceBand(schoolDistance, { idealMin: 0.3, idealMax: 1.7, hardMax: 4.2, insideScore: 0.72 }, false);
    const hospitalScore = scoreDistanceBand(hospitalDistance, { idealMin: 0.8, idealMax: 3, hardMax: 5.5, insideScore: 0.66 }, false);
    const equipmentScore = scoreDistanceBand(equipmentDistance, { idealMin: 0.2, idealMax: 1.4, hardMax: 3.4, insideScore: 0.76 }, false);
    const baseScore = ((schoolScore + hospitalScore + equipmentScore) / 3 * 0.82) + demandBoost * 0.18;
    return clamp(baseScore * 0.76 + serviceSupport * 0.24, 0, 1);
  }

  if (programId === "escuela") {
    const schoolGap = clamp(schoolDistance / 2.4, 0, 1);
    const baseScore = schoolGap * 0.58 + demandBoost * 0.42;
    return clamp(baseScore * 0.74 + serviceSupport * 0.26, 0, 1);
  }

  if (programId === "hospital") {
    const hospitalGap = clamp(hospitalDistance / 3.4, 0, 1);
    const supportAccess = scoreDistanceBand(equipmentDistance, { idealMin: 0.3, idealMax: 1.6, hardMax: 3.6, insideScore: 0.62 }, false);
    const baseScore = hospitalGap * 0.56 + demandBoost * 0.28 + supportAccess * 0.16;
    return clamp(baseScore * 0.74 + serviceSupport * 0.26, 0, 1);
  }

  const equipmentGap = clamp(equipmentDistance / 1.9, 0, 1);
  const schoolSupport = scoreDistanceBand(schoolDistance, { idealMin: 0.2, idealMax: 1.2, hardMax: 3, insideScore: 0.68 }, false);
  const baseScore = equipmentGap * 0.54 + demandBoost * 0.3 + schoolSupport * 0.16;
  return clamp(baseScore * 0.74 + serviceSupport * 0.26, 0, 1);
}

function computePlanningLandReserveScore(program, scenario, urbanDistanceKm, roadDistanceKm, insideUrban, slope, canalDistanceKm, landSupport) {
  const urbanBand = scoreDistanceBand(urbanDistanceKm, {
    idealMin: program.id === "hospital" ? 0 : 0.1,
    idealMax: program.id === "vis" ? 2.2 : 1.8,
    hardMax: program.id === "hospital" ? 4.8 : 4.2,
    insideScore: program.id === "hospital" ? 0.88 : 0.6,
  }, insideUrban);
  const corridorBand = scoreDistanceBand(roadDistanceKm, {
    idealMin: 0.04,
    idealMax: 1,
    hardMax: 2.6,
    insideScore: 0.72,
  }, false);
  const floodPenalty = clamp((0.7 - Math.min(canalDistanceKm, 0.7)) / 0.7, 0, 1) * 0.24;
  const slopePenalty = clamp((slope - program.maxSlope) / Math.max(program.maxSlope, 1), 0, 1) * 0.22;
  const baseScore = clamp(
    (urbanBand * 0.62 + corridorBand * 0.38 - floodPenalty - slopePenalty) * scenario.reserveSensitivity,
    0,
    1
  );
  return clamp(
    baseScore * 0.74 + landSupport * 0.26,
    0,
    1
  );
}

function summarizePlanningSurface(features, program, scenario) {
  if (!features.length) {
    return {
      priorityAreaHa: 0,
      meanScore: 0,
      growthMean: 0,
      resilienceMean: 0,
      meanSlope: 0,
      anchorLabel: "Sin lectura",
      serviceGapLabel: "Sin lectura",
      riskLabel: "Sin lectura",
      landLabel: "Sin lectura",
      landCopy: "reserva de ocupacion disponible",
    };
  }

  const totals = features.reduce((accumulator, feature) => {
    accumulator.score += feature.properties.score;
    accumulator.growth += feature.properties.growthScore;
    accumulator.service += feature.properties.serviceScore;
    accumulator.resilience += feature.properties.resilienceScore;
    accumulator.land += feature.properties.landScore;
    accumulator.slope += feature.properties.slope;
    if (feature.properties.score >= 70) {
      accumulator.priorityAreaHa += turf.area(feature) / 10000;
    }
    accumulator.anchors[feature.properties.anchorName] = (accumulator.anchors[feature.properties.anchorName] || 0) + 1;
    return accumulator;
  }, {
    score: 0,
    growth: 0,
    service: 0,
    resilience: 0,
    land: 0,
    slope: 0,
    priorityAreaHa: 0,
    anchors: {},
  });
  const count = features.length;
  const anchorLabel = Object.entries(totals.anchors).sort((left, right) => right[1] - left[1])[0]?.[0] || "Sin lectura";
  const serviceMean = Math.round(totals.service / count);
  const resilienceMean = Math.round(totals.resilience / count);
  const landMean = Math.round(totals.land / count);

  return {
    priorityAreaHa: totals.priorityAreaHa,
    meanScore: Math.round(totals.score / count),
    growthMean: Math.round(totals.growth / count),
    resilienceMean,
    meanSlope: Number((totals.slope / count).toFixed(1)),
    anchorLabel,
    serviceGapLabel: serviceMean >= 72
      ? "Brecha alta"
      : serviceMean >= 58
        ? "Brecha media"
        : "Cobertura relativamente cercana",
    riskLabel: resilienceMean >= 72
      ? "Bajo"
      : resilienceMean >= 56
        ? "Moderado"
        : "Atencion",
    landLabel: landMean >= 70
      ? scenario.id === "conservador"
        ? "Reserva alta"
        : "Compatibilidad alta"
      : landMean >= 54
        ? "Balanceado"
        : program.id === "hospital"
          ? "Compatibilidad media"
          : "Reserva limitada",
    landCopy: landMean >= 70
      ? "frentes de expansion o consolidacion con baja restriccion"
      : landMean >= 54
        ? "bordes urbanos con ocupacion controlada"
        : "sectores que requieren mas restricciones o fases previas",
  };
}

function summarizePlanningImageryVariables(features, imageryProfile) {
  const items = imageryProfile.variables.map((variableId) => {
    const definition = getPlanningVariableDefinition(variableId);
    const mean = features.length
      ? Math.round(features.reduce((sum, feature) => sum + (feature.properties.variableScores?.[variableId] || 0), 0) / features.length)
      : 0;
    return {
      ...definition,
      mean,
      strengthLabel: getPlanningVariableStrengthLabel(mean),
    };
  });
  const ranked = [...items].sort((left, right) => right.mean - left.mean);
  const primary = ranked[0];
  const secondary = ranked[1];

  return {
    items,
    headline: primary && secondary
      ? `${primary.label} + ${secondary.label}`
      : primary?.label || "Sin lectura",
    copy: primary
      ? `${imageryProfile.shortLabel} esta empujando la decision sobre todo con ${primary.label.toLowerCase()}${secondary ? ` y ${secondary.label.toLowerCase()}` : ""}.`
      : `La fuente ${imageryProfile.shortLabel} aun no genero lectura territorial.`,
  };
}

function selectPlanningCandidates(features, program, imageryProfile, scopeType) {
  const sorted = [...features].sort((left, right) => right.properties.score - left.properties.score);
  const minimumDistanceKm = scopeType === "plot" ? 0.45 : 1.65;
  const candidates = [];

  sorted.forEach((feature) => {
    if (candidates.length >= 5 || feature.properties.score < 64) {
      return;
    }

    const centroid = turf.centroid(feature);
    const centroidCoords = centroid.geometry.coordinates;
    const isFarEnough = candidates.every((candidate) => {
      const candidatePoint = turf.point(candidate.centroid);
      return turf.distance(candidatePoint, centroid, { units: "kilometers" }) >= minimumDistanceKm;
    });

    if (!isFarEnough) {
      return;
    }

    const direction = getRelativeDirectionLabel(feature.properties.anchorCoords, centroidCoords);
    const candidateId = `candidate-${program.id}-${candidates.length + 1}`;
    feature.properties.candidateId = candidateId;
    feature.properties.candidateRank = candidates.length + 1;
    candidates.push({
      id: candidateId,
      title: `Sector ${feature.properties.anchorName} ${direction}`,
      rank: candidates.length + 1,
      score: feature.properties.score,
      centroid: centroidCoords,
      feature,
      summary: feature.properties.summary,
      tags: [
        `${imageryProfile.shortLabel} ${feature.properties.primaryVariableLabel} ${feature.properties.primaryVariableScore}%`,
        `Crecimiento ${feature.properties.growthScore}%`,
        `Servicio ${feature.properties.serviceScore}%`,
        `Resiliencia ${feature.properties.resilienceScore}%`,
      ],
    });
  });

  return candidates;
}

function getPlanningVariableStrengthLabel(score) {
  if (score >= 72) {
    return "Alta";
  }
  if (score >= 56) {
    return "Media";
  }
  return "Base";
}

function renderPlanningWeights(planning) {
  dom.planningWeights.classList.remove("empty-state");
  dom.planningWeights.classList.add("has-data");
  dom.planningWeights.innerHTML = Object.entries(planning.program.weights)
    .map(([key, weight]) => `
      <span class="planning-pill">
        <strong>${Math.round(weight * 100)}%</strong>
        ${getPlanningWeightLabel(key)}
      </span>
    `)
    .join("")
    + `
      <span class="planning-pill emphasis">${planning.imageryProfile.shortLabel}</span>
      <span class="planning-pill emphasis">${planning.imagerySummary.headline}</span>
      <span class="planning-pill emphasis">${planning.horizon.label}</span>
      <span class="planning-pill emphasis">${planning.scenario.label}</span>
    `;
}

function renderPlanningCandidates(planning) {
  if (!planning.candidates.length) {
    dom.planningCandidates.classList.add("empty-state");
    dom.planningCandidates.classList.remove("has-data");
    dom.planningCandidates.textContent = "No aparecieron candidatos con puntaje suficiente. Prueba con otro escenario u horizonte.";
    return;
  }

  dom.planningCandidates.classList.remove("empty-state");
  dom.planningCandidates.classList.add("has-data");
  dom.planningCandidates.innerHTML = planning.candidates
    .map((candidate) => `
      <article class="planning-candidate ${candidate.id === state.planningHighlightId ? "active" : ""}">
        <div class="planning-candidate-head">
          <div>
            <p class="candidate-rank">Candidato ${candidate.rank}</p>
            <h4>${candidate.title}</h4>
          </div>
          <span class="planning-score tone-${getPlanningScoreTone(candidate.score)}">${candidate.score}/100</span>
        </div>
        <p class="candidate-copy">${candidate.summary}</p>
        <div class="planning-tags">
          ${candidate.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
        <button class="ghost-button" type="button" data-candidate-id="${candidate.id}">Ver en mapa</button>
      </article>
    `)
    .join("");

  dom.planningCandidates.querySelectorAll("[data-candidate-id]").forEach((button) => {
    button.addEventListener("click", () => focusPlanningCandidate(button.dataset.candidateId));
  });
}

function renderPlanningOverlay(planning) {
  clearPlanningOverlay();
  if (!mapState.map) {
    return;
  }

  mapState.planningLayer = L.geoJSON(planning.surface, {
    style: (feature) => ({
      color: feature.properties.score >= 78 ? "#224d3d" : "#ffffff",
      weight: feature.properties.score >= 78 ? 0.8 : 0.4,
      fillColor: interpolateColor(feature.properties.score, 35, 90, ["#7c4834", "#d6a250", "#95be78", "#2f7f5f"]),
      fillOpacity: feature.properties.score >= 78 ? 0.34 : 0.22,
    }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        `<h3 class="popup-title">${planning.program.longLabel}</h3><p class="popup-copy">${planning.imageryProfile.shortLabel} / ${feature.properties.anchorName} / Puntaje ${feature.properties.score}/100 / ${feature.properties.classLabel}. ${feature.properties.summary}</p>`
      );
    },
  }).addTo(mapState.map);

  const candidatePoints = planning.candidates.map((candidate) => pointFeature(candidate.title, candidate.centroid, {
    candidateId: candidate.id,
    candidateRank: candidate.rank,
    score: candidate.score,
    summary: candidate.summary,
  }));

  mapState.planningCandidatesLayer = L.geoJSON({
    type: "FeatureCollection",
    features: candidatePoints,
  }, {
    pointToLayer: (feature, latlng) => {
      const active = feature.properties?.candidateId === state.planningHighlightId;
      return L.circleMarker(latlng, {
        radius: active ? 9 : 7,
        weight: 2.6,
        color: active ? "#fff6ea" : "#f7f2e8",
        fillColor: planning.program.markerColor,
        fillOpacity: active ? 1 : 0.88,
      });
    },
    onEachFeature: (feature, layer) => {
      layer.bindPopup(
        `<h3 class="popup-title">${feature.properties.name || "Candidato"}</h3><p class="popup-copy">${feature.properties.summary} Puntaje ${feature.properties.score}/100.</p>`
      );
    },
  }).addTo(mapState.map);

  if (mapState.planningLayer.bringToFront) {
    mapState.planningLayer.bringToFront();
  }
  if (mapState.currentPlotLayer) {
    mapState.currentPlotLayer.bringToFront();
  }
  if (mapState.managementLayer) {
    mapState.managementLayer.bringToFront();
  }
  if (mapState.planningCandidatesLayer?.bringToFront) {
    mapState.planningCandidatesLayer.bringToFront();
  }
}

function clearPlanningOverlay() {
  if (mapState.planningLayer) {
    mapState.map.removeLayer(mapState.planningLayer);
    mapState.planningLayer = null;
  }
  if (mapState.planningCandidatesLayer) {
    mapState.map.removeLayer(mapState.planningCandidatesLayer);
    mapState.planningCandidatesLayer = null;
  }
}

function focusPlanningCandidates() {
  if (!mapState.map || !mapState.planningCandidatesLayer) {
    return;
  }

  const bounds = mapState.planningCandidatesLayer.getBounds();
  if (bounds.isValid()) {
    mapState.map.fitBounds(bounds, {
      padding: [48, 48],
      maxZoom: 13,
    });
  }
}

function focusPlanningCandidate(candidateId) {
  const candidate = state.planningData?.candidates?.find((item) => item.id === candidateId);
  if (!candidate || !mapState.map) {
    return;
  }

  state.planningHighlightId = candidateId;
  renderPlanningCandidates(state.planningData);
  renderPlanningOverlay(state.planningData);
  const bounds = L.geoJSON(candidate.feature).getBounds();
  mapState.map.fitBounds(bounds, {
    padding: [54, 54],
    maxZoom: 14,
  });
  if (mapState.planningCandidatesLayer) {
    mapState.planningCandidatesLayer.eachLayer((layer) => {
      if (layer.feature?.properties?.candidateId === candidateId) {
        layer.openPopup();
      }
    });
  }
}

function getPlanningWeightLabel(weightKey) {
  const labels = {
    growth: "Crecimiento urbano",
    access: "Accesibilidad",
    terrain: "Pendiente",
    service: "Deficit de servicio",
    resilience: "Riesgo hidrico",
    land: "Compatibilidad territorial",
  };
  return labels[weightKey] || weightKey;
}

function getPlanningClassLabel(score) {
  if (score >= 80) {
    return "Muy alta";
  }
  if (score >= 70) {
    return "Alta";
  }
  if (score >= 58) {
    return "Media";
  }
  return "Baja";
}

function getPlanningScoreTone(score) {
  if (score >= 80) {
    return "high";
  }
  if (score >= 68) {
    return "mid";
  }
  return "low";
}

function scoreDistanceBand(distanceKm, config, insideBand = false) {
  if (!Number.isFinite(distanceKm)) {
    return 0;
  }
  if (distanceKm === 0 && insideBand) {
    return config.insideScore ?? 1;
  }
  if (distanceKm < config.idealMin) {
    return clamp((distanceKm / (config.idealMin || 0.1)) * (config.insideScore ?? 0.85), 0, 1);
  }
  if (distanceKm <= config.idealMax) {
    return 1;
  }
  return clamp(1 - ((distanceKm - config.idealMax) / Math.max(config.hardMax - config.idealMax, 0.1)), 0, 1);
}

function getNearestFeatureMatch(pointFeature, features, predicate = null) {
  let match = { feature: null, distanceKm: Number.POSITIVE_INFINITY };
  features.forEach((feature) => {
    if (predicate && !predicate(feature)) {
      return;
    }
    const distanceKm = distanceToFeatureKm(pointFeature, feature);
    if (distanceKm < match.distanceKm) {
      match = { feature, distanceKm };
    }
  });
  return match;
}

function distanceToFeatureKm(pointFeature, feature) {
  if (!feature?.geometry) {
    return Number.POSITIVE_INFINITY;
  }

  const type = feature.geometry.type;
  if (type === "Point") {
    return turf.distance(pointFeature, feature, { units: "kilometers" });
  }
  if (type === "LineString" || type === "MultiLineString") {
    return turf.pointToLineDistance(pointFeature, feature, { units: "kilometers" });
  }
  if (type === "Polygon" || type === "MultiPolygon") {
    if (turf.booleanPointInPolygon(pointFeature, feature)) {
      return 0;
    }
    return turf.pointToLineDistance(pointFeature, geometryToBoundaryLine(feature.geometry), { units: "kilometers" });
  }
  return Number.POSITIVE_INFINITY;
}

function geometryToBoundaryLine(geometry) {
  if (geometry.type === "Polygon") {
    return turf.lineString(geometry.coordinates[0]);
  }
  if (geometry.type === "MultiPolygon") {
    return turf.multiLineString(geometry.coordinates.map((polygon) => polygon[0]));
  }
  return turf.lineString([]);
}

function buildPlanningSectorSummary(programId, metrics) {
  if (programId === "vis") {
    return `Borde de expansion de ${metrics.anchorName} con acceso vial a ${formatDistanceKm(metrics.roadDistanceKm)} y servicios base en radio funcional.`;
  }
  if (programId === "escuela") {
    return `Sector con demanda residencial alta en ${metrics.anchorName} y vacio educativo relativo de ${formatDistanceKm(metrics.schoolDistanceKm)}.`;
  }
  if (programId === "hospital") {
    return `Nodo accesible de ${metrics.anchorName} con cobertura de salud abierta y soporte territorial para emergencias.`;
  }
  return `Refuerza centralidad barrial en ${metrics.anchorName} con brecha de equipamientos y buena conectividad local.`;
}

function getRelativeDirectionLabel(originCoords, targetCoords) {
  if (!Array.isArray(originCoords) || !Array.isArray(targetCoords)) {
    return "Centro";
  }
  const deltaLon = targetCoords[0] - originCoords[0];
  const deltaLat = targetCoords[1] - originCoords[1];
  const angle = (Math.atan2(deltaLon, deltaLat) * 180 / Math.PI + 360) % 360;
  return cardinalFromAngle(angle);
}

function cloneFeature(feature) {
  return feature ? JSON.parse(JSON.stringify(feature)) : null;
}

function createWizardProgress(mode = state.activeWizard) {
  return {
    mode,
    steps: (wizardConfig[mode] || []).map(() => ({
      status: "pending",
      note: "",
      updatedAt: null,
    })),
    report: null,
    lastUpdatedAt: null,
  };
}

function getWizardProgress(mode = state.activeWizard) {
  const stepCount = wizardConfig[mode]?.length || 0;
  const progress = state.wizardProgress[mode];
  if (!progress || !Array.isArray(progress.steps) || progress.steps.length !== stepCount) {
    state.wizardProgress[mode] = createWizardProgress(mode);
  }
  return state.wizardProgress[mode];
}

function getWizardCompletedCount(mode = state.activeWizard) {
  return getWizardProgress(mode).steps.filter((step) => step.status === "done").length;
}

function getWizardNextPendingIndex(mode = state.activeWizard) {
  return getWizardProgress(mode).steps.findIndex((step) => step.status !== "done");
}

function setWizardAssistantStatus(message, tone = "loading") {
  if (!dom.wizardAssistantStatus) {
    return;
  }
  dom.wizardAssistantStatus.className = `service-banner ${tone}`;
  dom.wizardAssistantStatus.textContent = message;
}

function getWizardDemoPlot() {
  const sourceFeature = geoSources.lotes?.features?.[0];
  if (!sourceFeature) {
    return null;
  }
  return {
    feature: cloneFeature(sourceFeature),
    label: sourceFeature.properties?.name || "Lote demo",
  };
}

function ensureWizardPlotContext({ forceDemo = false } = {}) {
  if (state.currentPlot && !forceDemo) {
    return {
      feature: state.currentPlot,
      label: state.currentPlotLabel,
      usedDemo: false,
    };
  }

  const demoPlot = getWizardDemoPlot();
  if (!demoPlot) {
    throw new Error("No hay un lote demo disponible para el asistente.");
  }

  setCurrentPlot(demoPlot.feature, demoPlot.label);
  return {
    feature: state.currentPlot,
    label: state.currentPlotLabel,
    usedDemo: true,
  };
}

async function ensureWizardSceneContext({ refresh = false } = {}) {
  if (refresh || !state.filteredImages.length) {
    await filterSentinelImages();
  } else if (!getSelectedImage()) {
    applySelectedScene();
    renderSceneControls();
    renderSentinelResults();
  }

  if (!state.filteredImages.length) {
    const fallback = getFallbackScene();
    if (fallback) {
      state.filteredImages = [fallback];
      applySelectedScene();
      renderSceneControls();
      renderSentinelResults();
    }
  }

  const image = getSelectedImage() || state.filteredImages[0] || null;
  if (!image) {
    throw new Error("No hay escenas disponibles para activar el asistente.");
  }

  if (image.id !== state.selectedImageId) {
    state.selectedImageId = image.id;
    state.selectedCompareImageId = null;
    state.surfaceMode = "primary";
    renderSceneControls();
    renderSentinelResults();
  }

  await refreshActiveAnalysis({ silent: true });
  return {
    image: getSelectedImage() || image,
    sourceMode: state.sentinelMode,
    transport: state.sentinelTransport,
  };
}

function formatWizardSceneLabel(image) {
  if (!image) {
    return "Sin escena";
  }
  const sensor = getSensorForImage(image);
  const dateLabel = image.date
    ? localeDate.format(new Date(`${image.date}T00:00:00`))
    : sensor.label;
  return `${sensor.label} ${dateLabel}`;
}

function buildWizardStepNote(action, result, mode = state.activeWizard) {
  if (!result) {
    return "Paso ejecutado.";
  }

  if (action === "scene") {
    return `${formatWizardSceneLabel(result.image)} activa en el mapa con fuente ${result.sourceMode === "real" ? "real" : "demo"}.`;
  }

  if (action === "dem") {
    return `Pendiente media ${result.meanSlope}% y riesgo ${result.floodRisk}.`;
  }

  if (action === "climate") {
    return `Lluvia ${result.rainfall} mm, humedad ${result.soilMoisture}% y estado ${result.stress}.`;
  }

  if (action === "intralote") {
    return `${result.managementText}. ${result.recommendedAction}`;
  }

  if (action === "report") {
    const bullets = Array.isArray(result?.bullets) ? result.bullets.length : 0;
    return `${bullets || 3} recomendaciones operativas listas para ${mode.toLowerCase()}.`;
  }

  return "Paso ejecutado.";
}

function buildWizardOperationalReport(mode = state.activeWizard) {
  const progress = getWizardProgress(mode);
  const steps = wizardConfig[mode] || [];
  const completedCount = progress.steps.filter((step) => step.status === "done").length;
  const plotLabel = state.currentPlot ? state.currentPlotLabel : "Canton Mejia";
  const scene = getSelectedImage() || state.filteredImages[0] || getFallbackScene();
  const sceneLabel = formatWizardSceneLabel(scene);
  const intralote = state.agronomyOutputs.intralote;
  const dem = state.agronomyOutputs.dem;
  const climate = state.agronomyOutputs.climate;
  const bullets = [];

  if (mode === "Siembra") {
    if (dem) {
      bullets.push(`Pendiente media ${dem.meanSlope}% y riesgo ${dem.floodRisk}; ajusta drenaje y mecanizacion antes de entrar al lote.`);
    }
    if (climate) {
      bullets.push(`Lluvia de referencia ${climate.rainfall} mm y humedad ${climate.soilMoisture}%; define la ventana de siembra y el arranque de riego con ese margen.`);
    }
    if (intralote) {
      bullets.push(`Zonas de manejo ${intralote.managementText}; ${intralote.recommendedAction.toLowerCase()}.`);
    }
  } else if (mode === "Monitoreo") {
    bullets.push(`${sceneLabel} queda como escena activa para seguimiento del lote y lectura de alertas.`);
    if (intralote) {
      bullets.push(`El lote presenta ${intralote.managementText}; prioriza visita a sectores de baja respuesta.`);
    }
    if (climate) {
      bullets.push(`Cruce clima-termico: ${climate.stress.toLowerCase()} con ${climate.rainfall} mm y LST ${climate.lst} C; ajusta riego o control segun sector.`);
    }
  } else if (mode === "Cosecha") {
    if (dem) {
      bullets.push(`Acceso y relieve: pendiente media ${dem.meanSlope}% con lectura ${dem.operationLabel.toLowerCase()}; ordena primero los sectores mas favorables.`);
    }
    if (intralote) {
      bullets.push(`Madurez heterogenea detectada en ${intralote.managementText}; programa cosecha escalonada si el cultivo no responde parejo.`);
    }
    if (climate) {
      bullets.push(`Clima corto plazo: ${climate.rainfall} mm y estado ${climate.stress.toLowerCase()}; protege la ventana de corte y transporte.`);
    }
  } else if (mode === "Diagnostico") {
    if (intralote) {
      bullets.push(`Hipotesis inicial: ${intralote.recommendedAction.toLowerCase()} sobre los sectores de menor vigor.`);
    }
    if (dem) {
      bullets.push(`Relieve y drenaje: pendiente ${dem.meanSlope}% con riesgo ${dem.floodRisk}; confirma en campo si el problema se concentra en bajos o bordes.`);
    }
    if (climate) {
      bullets.push(`Contexto clima-termico: ${climate.stress.toLowerCase()} con humedad ${climate.soilMoisture}% y LST ${climate.lst} C; cruza esa senal con sintomas visibles.`);
    }
  }

  if (!bullets.length) {
    bullets.push("Selecciona un lote o usa el lote demo para que el asistente genere recomendaciones reales.");
  }

  const summaryByMode = {
    Siembra: `Flujo guiado para preparar ${plotLabel}, revisar relieve, clima y zonas de manejo antes de sembrar.`,
    Monitoreo: `Seguimiento operativo sobre ${plotLabel} para localizar alertas, cruzar clima y cerrar acciones de campo.`,
    Cosecha: `Orden operativo para cosecha sobre ${plotLabel} con foco en acceso, heterogeneidad y ventana climatica.`,
    Diagnostico: `Ruta de diagnostico sobre ${plotLabel} para contrastar vigor, drenaje y contexto termico.`,
  };

  return {
    title: `${mode} sobre ${plotLabel}`,
    summary: summaryByMode[mode] || `Asistente activo sobre ${plotLabel}.`,
    bullets,
    badges: [
      { label: "Pasos", value: `${completedCount}/${steps.length || 0}` },
      { label: "Lote", value: plotLabel },
      { label: "Escena", value: sceneLabel },
    ],
    completedCount,
    totalSteps: steps.length,
    statusText: completedCount >= steps.length && steps.length
      ? `Plan ${mode.toLowerCase()} listo para ${plotLabel}.`
      : `${completedCount}/${steps.length || 0} pasos del asistente ${mode.toLowerCase()} listos.`,
  };
}

function renderWizardAssistantStatus() {
  const progress = getWizardProgress();
  const steps = wizardConfig[state.activeWizard] || [];
  const completedCount = getWizardCompletedCount();
  const runningIndex = progress.steps.findIndex((step) => step.status === "running");
  const nextIndex = getWizardNextPendingIndex();

  if (state.wizardBusy && runningIndex >= 0) {
    setWizardAssistantStatus(`Ejecutando paso ${runningIndex + 1}: ${steps[runningIndex].title}.`, "loading");
    return;
  }

  if (completedCount >= steps.length && steps.length) {
    setWizardAssistantStatus(buildWizardOperationalReport().statusText, "real");
    return;
  }

  if (!state.currentPlot) {
    setWizardAssistantStatus("No hay lote activo. Puedes usar el lote demo o tocar un lote en el mapa y el asistente seguira desde ahi.", "demo");
    return;
  }

  if (!getSelectedImage() && !state.filteredImages.length) {
    setWizardAssistantStatus("No hay escena activa todavia. El siguiente paso puede buscar una escena automaticamente.", "loading");
    return;
  }

  if (nextIndex >= 0) {
    setWizardAssistantStatus(`Siguiente paso sugerido: ${steps[nextIndex].title}.`, completedCount > 0 ? "proxy" : "loading");
    return;
  }

  setWizardAssistantStatus("El asistente esta listo para seguir trabajando sobre el lote actual.", "real");
}

function renderWizardSummary() {
  const progress = getWizardProgress();
  const report = progress.report || (getWizardCompletedCount() > 0 ? buildWizardOperationalReport() : null);

  if (!report || !report.completedCount) {
    dom.wizardSummary.classList.add("empty-state");
    dom.wizardSummary.innerHTML = "Ejecuta un paso o el plan completo para ver recomendaciones operativas del asistente.";
    return;
  }

  dom.wizardSummary.classList.remove("empty-state");
  dom.wizardSummary.innerHTML = `
    <div class="wizard-summary-head">
      <div>
        <p class="section-kicker">Salida operativa</p>
        <h4>${report.title}</h4>
      </div>
      <span class="wizard-summary-pill">${report.completedCount}/${report.totalSteps} pasos</span>
    </div>
    <p class="wizard-summary-copy">${report.summary}</p>
    <div class="wizard-summary-metrics">
      ${report.badges.map((badge) => `
        <article class="wizard-summary-metric">
          <span>${badge.label}</span>
          <strong>${badge.value}</strong>
        </article>
      `).join("")}
    </div>
    <ul class="wizard-summary-list">
      ${report.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}
    </ul>
  `;
}

function renderWizardAssistantControls() {
  const steps = wizardConfig[state.activeWizard] || [];
  const progress = getWizardProgress();
  const completedCount = progress.steps.filter((step) => step.status === "done").length;
  const nextIndex = getWizardNextPendingIndex();
  const nextStep = nextIndex >= 0 ? steps[nextIndex] : null;

  if (dom.runWizardNextBtn) {
    dom.runWizardNextBtn.disabled = state.wizardBusy || !nextStep;
    dom.runWizardNextBtn.textContent = state.wizardBusy
      ? "Ejecutando..."
      : nextStep
        ? `Ejecutar: ${nextStep.buttonLabel}`
        : "Plan listo";
  }

  if (dom.runWizardPlanBtn) {
    dom.runWizardPlanBtn.disabled = state.wizardBusy || completedCount >= steps.length;
    dom.runWizardPlanBtn.textContent = state.wizardBusy
      ? "Procesando..."
      : completedCount >= steps.length
        ? "Plan completo listo"
        : "Ejecutar plan completo";
  }

  if (dom.useDemoPlotBtn) {
    dom.useDemoPlotBtn.disabled = state.wizardBusy;
  }

  if (dom.resetWizardBtn) {
    dom.resetWizardBtn.disabled = state.wizardBusy;
  }
}

function renderWizardAssistantState() {
  renderWizardModes();
  renderWizardSteps();
  renderWizardSummary();
  renderWizardAssistantControls();
  renderWizardAssistantStatus();
}

async function executeWizardAction(action, { mode = state.activeWizard } = {}) {
  if (action === "scene") {
    return ensureWizardSceneContext({ refresh: true });
  }

  if (action === "dem") {
    ensureWizardPlotContext();
    await ensureWizardSceneContext();
    return runDemAnalysis(true);
  }

  if (action === "climate") {
    if (mode !== "Monitoreo") {
      ensureWizardPlotContext();
    }
    await ensureWizardSceneContext();
    return runClimateAnalysis(true);
  }

  if (action === "intralote") {
    ensureWizardPlotContext();
    await ensureWizardSceneContext();
    return runIntraloteAnalysis(true);
  }

  if (action === "report") {
    return buildWizardOperationalReport(mode);
  }

  throw new Error("El asistente recibio un paso no soportado.");
}

async function runWizardUpToStep(targetIndex) {
  const steps = wizardConfig[state.activeWizard] || [];
  if (!steps[targetIndex] || state.wizardBusy) {
    return null;
  }

  const progress = getWizardProgress();
  state.wizardBusy = true;
  renderWizardAssistantState();

  try {
    setActiveTab("modulos");

    for (let index = 0; index <= targetIndex; index += 1) {
      const step = steps[index];
      const stepState = progress.steps[index];
      if (stepState.status === "done") {
        continue;
      }

      stepState.status = "running";
      stepState.note = "Procesando este paso...";
      renderWizardAssistantState();

      const result = await executeWizardAction(step.action, { mode: state.activeWizard });
      stepState.status = "done";
      stepState.note = buildWizardStepNote(step.action, result, state.activeWizard);
      stepState.updatedAt = new Date().toISOString();
      progress.lastUpdatedAt = stepState.updatedAt;
      progress.report = buildWizardOperationalReport(state.activeWizard);
      renderWizardAssistantState();
    }

    progress.report = buildWizardOperationalReport(state.activeWizard);
    setStatus(progress.report.statusText);
    return progress.report;
  } catch (error) {
    const runningStep = progress.steps.find((step) => step.status === "running");
    if (runningStep) {
      runningStep.status = "blocked";
      runningStep.note = error instanceof Error ? error.message : "El paso no pudo completarse.";
    }
    const message = error instanceof Error ? error.message : "El asistente no pudo completar el plan.";
    setWizardAssistantStatus(message, "demo");
    setStatus(message);
    return null;
  } finally {
    state.wizardBusy = false;
    renderWizardAssistantState();
  }
}

async function runWizardNextStep() {
  const nextIndex = getWizardNextPendingIndex();
  if (nextIndex < 0) {
    const report = buildWizardOperationalReport();
    getWizardProgress().report = report;
    renderWizardAssistantState();
    setStatus(report.statusText);
    return report;
  }
  return runWizardUpToStep(nextIndex);
}

async function runWizardPlan() {
  const finalIndex = (wizardConfig[state.activeWizard] || []).length - 1;
  if (finalIndex < 0) {
    return null;
  }
  return runWizardUpToStep(finalIndex);
}

function resetWizardAssistant(mode = state.activeWizard) {
  state.wizardProgress[mode] = createWizardProgress(mode);
  renderWizardAssistantState();
  setStatus(`Asistente Agricola reiniciado para el modo ${mode}.`);
}

function useWizardDemoPlot() {
  ensureWizardPlotContext({ forceDemo: true });
  renderWizardAssistantState();
  setStatus(`Lote demo ${state.currentPlotLabel} activado para el asistente.`);
}

function renderWizardModes() {
  dom.wizardModes.innerHTML = Object.keys(wizardConfig)
    .map(
      (mode) => `
        <button
          class="wizard-mode ${mode === state.activeWizard ? "active" : ""}"
          type="button"
          data-mode="${mode}"
        >
          ${mode}
        </button>
      `
    )
    .join("");

  dom.wizardModes.querySelectorAll(".wizard-mode").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeWizard = button.dataset.mode;
      dom.overlayMode.textContent = state.activeWizard;
      renderWizardAssistantState();
      setStatus(`Asistente Agricola ajustado al modo ${state.activeWizard}.`);
      refreshActiveAnalysis({ silent: true });
    });
  });
}

function renderWizardSteps() {
  const steps = wizardConfig[state.activeWizard];
  const progress = getWizardProgress();
  dom.wizardSteps.innerHTML = steps
    .map(
      (step, index) => `
        <article class="wizard-step is-${progress.steps[index].status}">
          <div class="wizard-step-head">
            <div>
              <p class="section-kicker">Paso ${index + 1}</p>
              <h4>${step.title}</h4>
            </div>
            <span class="wizard-step-state tone-${progress.steps[index].status}">
              ${progress.steps[index].status === "done"
                ? "Hecho"
                : progress.steps[index].status === "running"
                  ? "En curso"
                  : progress.steps[index].status === "blocked"
                    ? "Revisar"
                    : "Pendiente"}
            </span>
          </div>
          <p>${step.body}</p>
          <div class="wizard-step-actions">
            <button
              class="ghost-button wizard-step-action"
              type="button"
              data-step-index="${index}"
              ${state.wizardBusy ? "disabled" : ""}
            >
              ${step.buttonLabel}
            </button>
            <p class="wizard-step-note">${progress.steps[index].note || "Aun no ejecutado."}</p>
          </div>
        </article>
      `
    )
    .join("");

  dom.wizardSteps.querySelectorAll(".wizard-step-action").forEach((button) => {
    button.addEventListener("click", () => {
      const stepIndex = Number(button.dataset.stepIndex);
      if (Number.isFinite(stepIndex)) {
        runWizardUpToStep(stepIndex);
      }
    });
  });
}

function paintMetricGrid(target, cards) {
  target.classList.remove("empty-state");
  target.classList.add("has-data");
  target.innerHTML = cards
    .map(
      (card) => `
        <article class="metric-card">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.copy}</p>
        </article>
      `
    )
    .join("");
}

function resetMetricGrid(target, message) {
  target.classList.remove("has-data");
  target.classList.add("empty-state");
  target.textContent = message;
}

function ensurePlot(message, silent = false) {
  if (state.currentPlot) {
    return true;
  }
  if (!silent) {
    setStatus(message);
  }
  return false;
}

function updateMapSummary() {
  const image = getSelectedImage();
  const sensor = image ? getSensorForImage(image) : getActiveSensor();
  const analysis = getRenderableAnalysis(image);
  const compareImage = getCompareImage();
  const changeAnalysis = getRenderableChangeAnalysis(image, compareImage);
  const previewLabel = getSceneLayerStatusLabel(image || sensor.id, state.sceneLayerKind);
  dom.overlayIndex.textContent = indexConfig[state.selectedIndex].label;

  if (dom.mapStage) {
    dom.mapStage.dataset.sensor = sensor.id;
  }

  if (!image) {
    if (state.entryRoute === "planificacion") {
      const planning = state.planningData;
      const imageryProfile = planning?.imageryProfile || getPlanningImageryProfile();
      dom.overlayIndex.textContent = planning ? "Aptitud" : imageryProfile.shortLabel;
      renderMapBadges();
      if (planning) {
        dom.mapTitle.textContent = `${planning.program.longLabel} sobre ${planning.context.scopeLabel}`;
        dom.mapSubtitle.textContent = `Fuente ${planning.imageryProfile.shortLabel}, horizonte ${planning.horizon.label}, escenario ${planning.scenario.label} y ${planning.candidates.length} candidatos priorizados.`;
      } else {
        dom.mapTitle.textContent = "Planificacion territorial lista";
        dom.mapSubtitle.textContent = `Elige ${imageryProfile.label} y ejecuta la aptitud territorial para evaluar VIS, escuelas, hospitales o equipamientos.`;
      }
      return;
    }
    dom.mapTitle.textContent = "No hay escena activa";
    renderMapBadges();
    dom.mapSubtitle.textContent = `Ajusta el filtro de ${sensor.label} para cargar una imagen sobre el visor.`;
    return;
  }

  renderMapBadges(image, compareImage, previewLabel);

  if (analysis) {
    if (state.surfaceMode === "change" && changeAnalysis && compareImage) {
      const delta = changeAnalysis.summary[state.selectedIndex];
      dom.mapTitle.textContent = `Cambio ${indexConfig[state.selectedIndex].label} sobre ${analysis.context.scopeLabel}`;
      dom.mapSubtitle.textContent = `Lectura temporal ${changeAnalysis.direction} con delta medio ${formatDelta(delta.mean, indexConfig[state.selectedIndex])}.`;
      return;
    }

    const stats = analysis.summary[state.selectedIndex];
    const modeLabel = compareImage
      ? `vs ${localeDate.format(new Date(`${compareImage.date}T00:00:00`))}`
      : analysis.processingMode === "backend"
        ? "proxy local"
        : image.source === "real"
          ? "AOI local"
          : "motor demo";
    dom.mapTitle.textContent = `${indexConfig[state.selectedIndex].label} sobre ${analysis.context.scopeLabel}`;
    dom.mapSubtitle.textContent = `Media ${formatValue(stats.mean, indexConfig[state.selectedIndex])} con ${modeLabel}.`;
    return;
  }

  if (image.source === "real") {
    dom.mapTitle.textContent = `Escena real ${image.title}`;
    dom.mapSubtitle.textContent = "Preparando la capa satelital y el AOI operativo.";
    return;
  }

  dom.mapTitle.textContent = `${indexConfig[state.selectedIndex].label} sobre ${image.title}`;
  dom.mapSubtitle.textContent = image.note;
}

function renderMapBadges(image = null, compareImage = null, previewLabel = "sin capa") {
  if (!dom.mapBadges) {
    return;
  }

  if (!image) {
    if (state.entryRoute === "planificacion") {
      const planning = state.planningData;
      const imageryProfile = planning?.imageryProfile || getPlanningImageryProfile();
      const badges = [
        {
          tone: "analysis",
          label: "Territorial",
        },
        {
          tone: "neutral",
          label: imageryProfile.shortLabel,
        },
        {
          tone: "neutral",
          label: imageryProfile.spatialLabel,
        },
        planning
          ? {
              tone: "analysis",
              label: `Plan ${planning.program.label}`,
            }
          : {
              tone: "muted",
              label: "Sin escenario",
            },
      ];
      dom.mapBadges.innerHTML = badges
        .map((badge) => `<span class="map-badge ${badge.tone}">${badge.label}</span>`)
        .join("");
      return;
    }
    const sensor = getActiveSensor();
    const planningBadge = state.planningData
      ? `<span class="map-badge analysis">Plan ${state.planningData.program.label}</span>`
      : "";
    dom.mapBadges.innerHTML = `
      <span class="map-badge sensor sensor-${sensor.id}">${sensor.label}</span>
      <span class="map-badge muted">Sin escena</span>
      ${planningBadge}
    `;
    return;
  }

  const rasterTone = state.sceneLayerKind === "exact"
    ? "exact"
    : state.sceneLayerKind === "loading"
      ? "loading"
      : state.sceneLayerKind === "preview" || state.sceneLayerKind === "footprint"
        ? "preview"
        : "muted";
  const sensor = getSensorForImage(image);
  const badges = [
    {
      tone: `sensor sensor-${sensor.id}`,
      label: sensor.label,
    },
    {
      tone: "neutral",
      label: sensor.sceneResolutionLabel,
    },
    {
      tone: "neutral",
      label: localeDate.format(new Date(`${image.date}T00:00:00`)),
    },
    {
      tone: "neutral",
      label: getSceneMetaLabel(image),
    },
    {
      tone: rasterTone,
      label: state.showScenePreview ? previewLabel : "capa oculta",
    },
    {
      tone: state.showAnalysisOverlay ? "analysis" : "muted",
      label: state.showAnalysisOverlay ? "analisis visible" : "solo escena",
    },
  ];

  if (compareImage) {
    badges.push({
      tone: "compare",
      label: `Comp ${localeDate.format(new Date(`${compareImage.date}T00:00:00`))}`,
    });
  }

  if (state.planningData) {
    badges.push({
      tone: "analysis",
      label: `Plan ${state.planningData.program.label}`,
    });
  }

  dom.mapBadges.innerHTML = badges
    .map((badge) => `<span class="map-badge ${badge.tone}">${badge.label}</span>`)
    .join("");
}

function setBaseLayer(baseId, initial = false) {
  state.baseLayer = baseId;
  dom.baseButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.base === baseId);
  });

  if (!mapState.map) {
    return;
  }

  if (mapState.activeBaseLayer) {
    mapState.map.removeLayer(mapState.activeBaseLayer);
  }

  mapState.activeBaseLayer = mapState.baseLayers[baseId];
  mapState.activeBaseLayer.addTo(mapState.map);

  if (!initial) {
    setStatus(`Mapa base cambiado a ${baseId === "satellite" ? "Satelite" : "Calles"}.`);
  }
}

function setStatus(text) {
  dom.statusBar.textContent = text;
}

function getSurfaceConfig() {
  if (state.surfaceMode === "change" && getRenderableChangeAnalysis()) {
    return getChangeConfig(state.selectedIndex);
  }
  return indexConfig[state.selectedIndex];
}

function getChangeConfig(indexKey) {
  const ranges = {
    NDVI: 0.28,
    NDWI: 0.22,
    NDMI: 0.22,
    NDRE: 0.2,
    MSAVI: 0.28,
    VV: 3.2,
    VH: 3.6,
    RVI: 0.24,
    VH_VV: 0.18,
  };
  return {
    label: `Delta ${indexConfig[indexKey].label}`,
    min: -(ranges[indexKey] || 0.2),
    max: ranges[indexKey] || 0.2,
    unit: "",
    colors: ["#9f4a36", "#d69a64", "#f6f1e7", "#88c2b0", "#1d6b49"],
    description: `Cambio temporal de ${indexConfig[indexKey].label} entre la escena activa y la comparada.`,
  };
}

function formatLegendStat(value, config) {
  if (state.surfaceMode === "change" && getRenderableChangeAnalysis()) {
    return formatDelta(value, config);
  }
  return formatValue(value, config);
}

function formatDelta(value, config) {
  const digits = Math.abs(config.max) <= 1 ? 2 : 1;
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(digits)}${config.unit || ""}`;
}

function getStrongestChangeIndex(summary) {
  return Object.keys(summary)
    .map((indexKey) => ({ indexKey, score: Math.abs(summary[indexKey].mean) }))
    .sort((a, b) => b.score - a.score)[0]?.indexKey || getActiveSensor().defaultIndex;
}

function dayDiff(dateA, dateB) {
  const first = new Date(`${dateA}T00:00:00Z`);
  const second = new Date(`${dateB}T00:00:00Z`);
  return Math.round((first.getTime() - second.getTime()) / 86400000);
}

function getSceneAgeDays(image) {
  const reference = image.datetime || `${image.date}T00:00:00Z`;
  const milliseconds = Date.now() - new Date(reference).getTime();
  return Math.max(0, Math.round(milliseconds / 86400000));
}

function estimateSceneConfidence(image, freshnessDays = getSceneAgeDays(image)) {
  const sensor = getSensorForImage(image);
  const cloudPenalty = sensor.cloudEnabled
    ? Number.isFinite(image.cloud)
      ? image.cloud * 0.55
      : 18
    : 6;
  const freshnessPenalty = Math.min(freshnessDays * (sensor.id === "sentinel1" ? 1.1 : 1.4), sensor.id === "sentinel1" ? 18 : 24);
  const sourceBonus = image.source === "real" ? 12 : 0;
  const sensorBonus = sensor.id === "sentinel1" ? 4 : sensor.id === "landsat" ? 2 : 0;
  return Math.round(clamp(92 - cloudPenalty - freshnessPenalty + sourceBonus + sensorBonus, 28, 98));
}

function formatAgeLabel(days) {
  if (!Number.isFinite(days) || days <= 0) {
    return "Hoy";
  }
  if (days === 1) {
    return "Hace 1 d";
  }
  return `Hace ${days} d`;
}

function getFeatureKey(feature) {
  return JSON.stringify(feature?.geometry || feature || null);
}

function deriveIndexValue({ lon, lat, seed, base, config }) {
  const raw = base + pseudoNoise(lon * 5, lat * 7, seed) * 0.13 + pseudoNoise(lat * 11, lon * 3, seed + 9) * 0.06;
  return clamp(raw, config.min, config.max);
}

function pseudoNoise(x, y, seed) {
  const value = Math.sin((x + seed) * 12.9898 + (y - seed) * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolateColor(value, min, max, colors) {
  const normalized = clamp((value - min) / (max - min || 1), 0, 1);
  const steps = colors.map(hexToRgb);
  const scaled = normalized * (steps.length - 1);
  const index = Math.min(Math.floor(scaled), steps.length - 2);
  const local = scaled - index;
  const start = steps[index];
  const end = steps[index + 1];
  const mix = {
    r: Math.round(start.r + (end.r - start.r) * local),
    g: Math.round(start.g + (end.g - start.g) * local),
    b: Math.round(start.b + (end.b - start.b) * local),
  };
  return `rgb(${mix.r}, ${mix.g}, ${mix.b})`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
}

function formatValue(value, config) {
  const digits = config.max <= 1 ? 2 : 1;
  return `${value.toFixed(digits)}${config.unit}`;
}

function cardinalFromAngle(angle) {
  const directions = ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste"];
  const normalized = ((angle % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % directions.length;
  return directions[index];
}

function formatDateInput(value) {
  return value.toISOString().slice(0, 10);
}

function normalizeDateRange(start, end) {
  if (!start && !end) {
    const today = formatDateInput(new Date());
    return { start: today, end: today };
  }

  if (!start) {
    return { start: end, end };
  }

  if (!end) {
    return { start, end: start };
  }

  return start <= end ? { start, end } : { start: end, end: start };
}

function getSearchArea() {
  return state.currentPlot || studyArea;
}

function getSentinelSearchArea() {
  return getSearchArea();
}

function formatCloudValue(value) {
  if (!Number.isFinite(value)) {
    return "s/d";
  }
  return `${Number(value.toFixed(1))}%`;
}

function formatDistanceKm(value) {
  if (!Number.isFinite(value)) {
    return "s/d";
  }
  if (value < 1) {
    return `${Math.round(value * 1000)} m`;
  }
  return `${value.toFixed(1)} km`;
}

function formatFacilityTypeLabel(serviceType) {
  if (serviceType === "escuela") {
    return "Escuela";
  }
  if (serviceType === "hospital") {
    return "Salud";
  }
  if (serviceType === "equipamiento") {
    return "Equipamiento";
  }
  return "Servicio";
}

function formatPlatform(platform, fallback = getActiveSensor().label) {
  if (!platform) {
    return fallback;
  }

  if (/^landsat-/i.test(platform)) {
    return platform.replace(/^landsat-(\d+)/i, "Landsat $1");
  }

  return platform
    .replace(/^sentinel-/i, "Sentinel-")
    .replace(/([0-9])([a-z])/i, (_, number, letter) => `${number}${letter.toUpperCase()}`);
}

function formatOrbitState(orbitState) {
  if (!orbitState) {
    return "Orbita s/d";
  }
  return orbitState === "ascending"
    ? "Ascendente"
    : orbitState === "descending"
      ? "Descendente"
      : orbitState;
}

function getWizardBiasBySensor(sensorId) {
  if (sensorId === "landsat") {
    return {
      Monitoreo: { NDVI: 0.02, NDMI: 0.015, NDWI: 0.01, MSAVI: 0 },
      Siembra: { NDVI: -0.01, NDMI: 0.02, NDWI: 0.01, MSAVI: 0.02 },
      Cosecha: { NDVI: -0.02, NDMI: -0.01, NDWI: -0.01, MSAVI: 0.02 },
      Diagnostico: { NDVI: -0.01, NDMI: 0.02, NDWI: 0.02, MSAVI: 0.01 },
    };
  }

  if (sensorId === "sentinel1") {
    return {
      Monitoreo: { RVI: 0.03, VH_VV: 0.02, VV: 0.5, VH: 0.3 },
      Siembra: { RVI: -0.01, VH_VV: 0.03, VV: 0.2, VH: 0.2 },
      Cosecha: { RVI: -0.03, VH_VV: -0.01, VV: -0.4, VH: -0.5 },
      Diagnostico: { RVI: -0.02, VH_VV: 0.04, VV: 0.6, VH: 0.5 },
    };
  }

  return {
    Monitoreo: { NDVI: 0.02, NDWI: 0.01, NDRE: 0.01, MSAVI: 0 },
    Siembra: { NDVI: -0.01, NDWI: 0.02, NDRE: 0, MSAVI: 0.02 },
    Cosecha: { NDVI: -0.02, NDWI: -0.01, NDRE: 0.03, MSAVI: 0.01 },
    Diagnostico: { NDVI: -0.01, NDWI: 0.02, NDRE: 0.02, MSAVI: 0 },
  };
}

function getZoneDeltaThreshold(indexKey) {
  const thresholdMap = {
    NDVI: 0.04,
    NDWI: 0.035,
    NDMI: 0.035,
    NDRE: 0.03,
    MSAVI: 0.04,
    VV: 0.8,
    VH: 0.9,
    RVI: 0.05,
    VH_VV: 0.04,
  };
  return thresholdMap[indexKey] || 0.04;
}

function deriveBetaIndicesFromScene(sceneId, cloudCover, sensorId = state.activeSensorId) {
  const cloudPenalty = Number.isFinite(cloudCover) ? cloudCover / 100 : 0.25;
  const seed = Array.from(sceneId || "scene").reduce((total, char) => total + char.charCodeAt(0), 0);

  if (sensorId === "landsat") {
    const base = clamp(0.68 - cloudPenalty * 0.18 + pseudoNoise(seed, cloudPenalty, 13) * 0.05, 0.24, 0.82);
    return {
      NDVI: clamp(base, 0.18, 0.9),
      NDMI: clamp(0.16 - cloudPenalty * 0.1 + pseudoNoise(seed, cloudPenalty, 17) * 0.05, -0.08, 0.42),
      NDWI: clamp(0.1 - cloudPenalty * 0.08 + pseudoNoise(seed, cloudPenalty, 19) * 0.04, -0.12, 0.32),
      MSAVI: clamp(base - 0.07 + pseudoNoise(seed, cloudPenalty, 23) * 0.04, 0.16, 0.82),
    };
  }

  if (sensorId === "sentinel1") {
    const rvi = clamp(0.5 + pseudoNoise(seed, cloudPenalty, 29) * 0.12 + pseudoNoise(seed, cloudPenalty, 31) * 0.05, 0.18, 0.86);
    const ratio = clamp(0.42 + pseudoNoise(seed, cloudPenalty, 37) * 0.09, 0.14, 0.76);
    const vv = clamp(-11.4 + pseudoNoise(seed, cloudPenalty, 41) * 2.4 - ratio * 1.6, -20.8, -6.2);
    const vh = clamp(vv - 6.2 + pseudoNoise(seed, cloudPenalty, 43) * 1.7, -27.8, -11.4);
    return {
      RVI: rvi,
      VH_VV: ratio,
      VV: vv,
      VH: vh,
    };
  }

  const base = clamp(0.74 - cloudPenalty * 0.22 + pseudoNoise(seed, cloudPenalty, 3) * 0.04, 0.28, 0.82);

  return {
    NDVI: clamp(base, 0.2, 0.92),
    NDWI: clamp(0.2 - cloudPenalty * 0.08 + pseudoNoise(seed, cloudPenalty, 5) * 0.05, -0.12, 0.42),
    NDRE: clamp(base - 0.23 + pseudoNoise(seed, cloudPenalty, 7) * 0.04, 0.12, 0.62),
    MSAVI: clamp(base - 0.05 + pseudoNoise(seed, cloudPenalty, 11) * 0.04, 0.18, 0.86),
  };
}

function layerKey(layerId) {
  return `${layerId}Layer`;
}

function polygonFeature(name, points, properties = {}) {
  return {
    type: "Feature",
    properties: { name, ...properties },
    geometry: {
      type: "Polygon",
      coordinates: [[...points, points[0]]],
    },
  };
}

function lineFeature(name, points, properties = {}) {
  return {
    type: "Feature",
    properties: { name, ...properties },
    geometry: {
      type: "LineString",
      coordinates: points,
    },
  };
}

function pointFeature(name, point, properties = {}) {
  return {
    type: "Feature",
    properties: { name, ...properties },
    geometry: {
      type: "Point",
      coordinates: point,
    },
  };
}
