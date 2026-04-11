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

const sentinelImages = [
  {
    id: "S2A-2026-04-04",
    title: "Sentinel-2A / Orbita 039",
    date: "2026-04-04",
    cloud: 8,
    orbit: "R039",
    note: "Ventana limpia para monitoreo vegetativo en el eje Machachi - Aloag.",
    baseIndices: { NDVI: 0.72, NDWI: 0.23, NDRE: 0.41, MSAVI: 0.67 },
  },
  {
    id: "S2B-2026-03-20",
    title: "Sentinel-2B / Orbita 132",
    date: "2026-03-20",
    cloud: 15,
    orbit: "R132",
    note: "Escena util para revisar vigor pos siembra y humedad superficial.",
    baseIndices: { NDVI: 0.66, NDWI: 0.19, NDRE: 0.37, MSAVI: 0.61 },
  },
  {
    id: "S2A-2026-03-02",
    title: "Sentinel-2A / Orbita 039",
    date: "2026-03-02",
    cloud: 22,
    orbit: "R039",
    note: "Nubosidad media con buena lectura sobre la zona central del canton.",
    baseIndices: { NDVI: 0.61, NDWI: 0.17, NDRE: 0.34, MSAVI: 0.57 },
  },
  {
    id: "S2B-2026-02-14",
    title: "Sentinel-2B / Orbita 132",
    date: "2026-02-14",
    cloud: 31,
    orbit: "R132",
    note: "Escena util para comparar recuperacion vegetativa entre lotes.",
    baseIndices: { NDVI: 0.58, NDWI: 0.11, NDRE: 0.3, MSAVI: 0.52 },
  },
  {
    id: "S2A-2026-01-27",
    title: "Sentinel-2A / Orbita 039",
    date: "2026-01-27",
    cloud: 42,
    orbit: "R039",
    note: "Mayor nubosidad; sirve como respaldo para historico.",
    baseIndices: { NDVI: 0.55, NDWI: 0.14, NDRE: 0.28, MSAVI: 0.48 },
  },
  {
    id: "S2B-2025-12-18",
    title: "Sentinel-2B / Orbita 132",
    date: "2025-12-18",
    cloud: 12,
    orbit: "R132",
    note: "Buena referencia para revisar trazas de humedad y drenaje.",
    baseIndices: { NDVI: 0.64, NDWI: 0.26, NDRE: 0.36, MSAVI: 0.59 },
  },
];

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
  collection: "sentinel-2-l2a",
  limit: 6,
};

const backendService = {
  healthPath: "/api/health",
  searchPath: "/api/stac/search",
  analysisPath: "/api/indices/analyze",
  defaultOrigins: ["http://127.0.0.1:8765", "http://localhost:8765"],
};

const exactSceneCache = new Map();

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
};

const wizardConfig = {
  Siembra: [
    {
      title: "Preparar el lote",
      body: "Revisa relieve, pendientes y sectores con mayor riesgo de anegamiento antes de definir mecanizacion y drenajes.",
    },
    {
      title: "Cruzar humedad y temperatura",
      body: "Consulta NDWI, lluvia acumulada y temperatura superficial para decidir ventana de siembra.",
    },
    {
      title: "Definir zonas de manejo",
      body: "Segmenta el lote para dosificar densidad, fertilizacion de arranque y riego segun variabilidad interna.",
    },
    {
      title: "Emitir plan operativo",
      body: "Consolida pasos de campo, insumos y verificaciones para la cuadrilla agronomica.",
    },
  ],
  Monitoreo: [
    {
      title: "Buscar la escena mas reciente",
      body: "Filtra Sentinel-2 por baja nubosidad y selecciona el indice mas util para el estado fenologico actual.",
    },
    {
      title: "Localizar alertas intralote",
      body: "Identifica zonas de menor vigor o humedad dispar para priorizar visitas de inspeccion.",
    },
    {
      title: "Cruzar clima y termica",
      body: "Analiza lluvia, amplitud termica y temperatura superficial para detectar estres o retrasos.",
    },
    {
      title: "Cerrar recomendaciones",
      body: "Resume acciones de fertilizacion, riego o control fitosanitario por sector.",
    },
  ],
  Cosecha: [
    {
      title: "Evaluar acceso y pendientes",
      body: "Verifica topografia, vias y sectores blandos para planificar ingreso de maquinaria.",
    },
    {
      title: "Revisar madurez heterogenea",
      body: "Usa NDRE y MSAVI para ubicar diferencias de desarrollo que puedan requerir cosecha escalonada.",
    },
    {
      title: "Cruzar clima de corto plazo",
      body: "Consulta lluvia y temperatura para minimizar perdidas en el corte y el transporte.",
    },
    {
      title: "Definir ruta de cosecha",
      body: "Ordena lotes y sectores segun prioridad agronomica y condicion operativa.",
    },
  ],
  Diagnostico: [
    {
      title: "Delimitar el problema",
      body: "Selecciona el lote afectado y compara indices para acotar si el sintoma parece hidrico, nutricional o estructural.",
    },
    {
      title: "Analizar relieve y drenaje",
      body: "Contrasta pendiente y riesgo de anegamiento para descartar o confirmar problemas topograficos.",
    },
    {
      title: "Cruzar clima y temperatura",
      body: "Busca anomalias termicas y eventos de lluvia que expliquen la respuesta del cultivo.",
    },
    {
      title: "Priorizar salida a campo",
      body: "Genera una ruta de inspeccion y checklist para validar la hipotesis en sitio.",
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
  estaciones: {},
};

const state = {
  activeTab: "capas",
  selectedImageId: null,
  selectedCompareImageId: null,
  selectedIndex: "NDVI",
  surfaceMode: "primary",
  showScenePreview: true,
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
  studyAreaLayer: null,
  currentPlotLayer: null,
};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  bootstrapApp();
});

function cacheDom() {
  dom.loginOverlay = document.querySelector("#loginOverlay");
  dom.publicAccessBtn = document.querySelector("#publicAccessBtn");
  dom.appShell = document.querySelector("#appShell");
  dom.sidebar = document.querySelector("#sidebar");
  dom.sidebarToggle = document.querySelector("#sidebarToggle");
  dom.sidebarClose = document.querySelector("#sidebarClose");
  dom.tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  dom.tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  dom.layersTree = document.querySelector("#layersTree");
  dom.sentinelForm = document.querySelector("#sentinelForm");
  dom.startDate = document.querySelector("#startDate");
  dom.endDate = document.querySelector("#endDate");
  dom.cloudRange = document.querySelector("#cloudRange");
  dom.cloudValue = document.querySelector("#cloudValue");
  dom.sentinelSourceStatus = document.querySelector("#sentinelSourceStatus");
  dom.sentinelSubmitBtn = document.querySelector("#sentinelSubmitBtn");
  dom.sentinelResults = document.querySelector("#sentinelResults");
  dom.primarySceneSelect = document.querySelector("#primarySceneSelect");
  dom.compareSceneSelect = document.querySelector("#compareSceneSelect");
  dom.toggleSurfaceModeBtn = document.querySelector("#toggleSurfaceModeBtn");
  dom.clearCompareBtn = document.querySelector("#clearCompareBtn");
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
  dom.intraloteResults = document.querySelector("#intraloteResults");
  dom.demResults = document.querySelector("#demResults");
  dom.climateResults = document.querySelector("#climateResults");
  dom.wizardModes = document.querySelector("#wizardModes");
  dom.wizardSteps = document.querySelector("#wizardSteps");
  dom.baseButtons = Array.from(document.querySelectorAll(".base-button"));
}

function bootstrapApp() {
  setDefaultDates();
  bindUI();
  renderLayerTree();
  renderIndexButtons();
  renderWizardModes();
  renderWizardSteps();
  renderSceneControls();
  renderAnalysisStatus();
  renderAnalysisSummary();
  renderCompareSummary();
  filterSentinelImages();
}

function bindUI() {
  dom.publicAccessBtn.addEventListener("click", enterPublicView);
  dom.sidebarToggle.addEventListener("click", () => dom.sidebar.classList.add("open"));
  dom.sidebarClose.addEventListener("click", () => dom.sidebar.classList.remove("open"));

  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  dom.cloudRange.addEventListener("input", () => {
    dom.cloudValue.textContent = `${dom.cloudRange.value}%`;
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

  dom.baseButtons.forEach((button) => {
    button.addEventListener("click", () => setBaseLayer(button.dataset.base));
  });
}

function enterPublicView() {
  dom.loginOverlay.classList.add("hidden");
  dom.appShell.classList.remove("hidden");
  if (!mapState.map) {
    initializeMap();
  }
  window.setTimeout(() => {
    mapState.map.invalidateSize();
  }, 160);
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
        radius: 7,
        weight: 2,
        color: "#1a4f69",
        fillColor: "#6fc2d6",
        fillOpacity: 0.9,
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
  return "Capa demostrativa integrada en el visor del geoportal.";
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

    state.sentinelMode = "demo";
    state.sentinelTransport = "demo";
    state.sentinelCacheHit = false;
    state.sentinelError = error instanceof Error ? error.message : "No fue posible conectar con Copernicus STAC.";
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
    }
  }
}

async function fetchSentinelImages() {
  const query = buildSentinelQuery();
  const backend = await detectBackend(!state.backendAvailable);

  if (backend.available) {
    try {
      return await fetchSentinelImagesFromProxy(query);
    } catch (error) {
      state.backendAvailable = false;
      state.backendUrl = null;
      state.backendChecked = true;
    }
  }

  return fetchDirectSentinelImages(query);
}

function buildSentinelQuery() {
  const { start, end } = normalizeDateRange(dom.startDate.value, dom.endDate.value);
  const maxCloud = Number(dom.cloudRange.value);
  const searchArea = getSentinelSearchArea();

  state.sentinelQueryScopeLabel = state.currentPlot ? state.currentPlotLabel : "Canton Mejia";

  return {
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

async function fetchDirectSentinelImages(query) {
  const params = new URLSearchParams({
    collections: sentinelService.collection,
    limit: String(sentinelService.limit),
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

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`La solicitud devolvio ${response.status}.`);
  }
  return response.json();
}

function mapStacScene(feature) {
  const properties = feature.properties || {};
  const platform = formatPlatform(properties.platform);
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
    title: `${platform} / ${gridCode}`,
    gridCode,
    date: datetime.slice(0, 10),
    datetime,
    cloud: Number.isFinite(cloud) ? Number(cloud.toFixed(2)) : null,
    orbit,
    note: `Escena real desde Copernicus STAC. Nivel ${level} y disponibilidad ${timeliness}.`,
    thumbnail: feature.assets?.thumbnail?.href || null,
    stacLink: feature.links?.find((link) => link.rel === "self")?.href || null,
    geometry: feature.geometry || null,
    bbox: feature.bbox || null,
    source: "real",
    baseIndices: deriveBetaIndicesFromScene(feature.id, cloud),
  });
}

function filterDemoSentinelImages() {
  const { start, end } = normalizeDateRange(dom.startDate.value, dom.endDate.value);
  const maxCloud = Number(dom.cloudRange.value);
  state.sentinelQueryScopeLabel = state.currentPlot ? state.currentPlotLabel : "Canton Mejia";

  return sentinelImages
    .filter((image) => (!start || image.date >= start) && (!end || image.date <= end) && image.cloud <= maxCloud)
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
  const normalized = {
    ...image,
    source: image.source || "demo",
    datetime: image.datetime || `${image.date}T10:15:00Z`,
    baseIndices: image.baseIndices || deriveBetaIndicesFromScene(image.id || "scene", image.cloud),
  };
  normalized.sceneAgeDays = getSceneAgeDays(normalized);
  normalized.qualityScore = estimateSceneConfidence(normalized, normalized.sceneAgeDays);
  return normalized;
}

function applySelectedScene() {
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
  dom.toggleSurfaceModeBtn.textContent = state.surfaceMode === "change" ? "Ver escena activa" : "Ver cambio temporal";
  dom.scenePreviewOpacity.value = Math.round(state.scenePreviewOpacity * 100);
  dom.scenePreviewOpacityValue.textContent = `${Math.round(state.scenePreviewOpacity * 100)}%`;
  dom.scenePreviewOpacity.disabled = !hasScenePreview;
  dom.toggleScenePreviewBtn.disabled = !hasScenePreview;
  const sceneLayerLabel = state.sceneLayerKind === "exact" ? "raster exacto" : "escena en mapa";
  dom.toggleScenePreviewBtn.textContent = !hasScenePreview
    ? "Escena no disponible en mapa"
    : state.showScenePreview
      ? `Ocultar ${sceneLayerLabel}`
      : `Mostrar ${sceneLayerLabel}`;

  if (!state.filteredImages.length) {
    dom.sceneTimeline.innerHTML = `<div class="empty-state">Las escenas apareceran aqui ordenadas por fecha.</div>`;
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
  return `${localeDate.format(new Date(`${image.date}T00:00:00`))} | Nubes ${formatCloudValue(image.cloud)} | ${image.title}`;
}

function renderSentinelSourceStatus() {
  const areaLabel = state.currentPlot ? state.currentPlotLabel : "Canton Mejia";

  dom.sentinelSourceStatus.className = "service-banner";

  if (state.sentinelLoading) {
    dom.sentinelSourceStatus.classList.add("loading");
    dom.sentinelSourceStatus.textContent = `Consultando Copernicus STAC para ${areaLabel}...`;
    return;
  }

  if (state.sentinelMode === "real") {
    if (state.sentinelTransport === "proxy") {
      dom.sentinelSourceStatus.classList.add("proxy");
      dom.sentinelSourceStatus.textContent = `Busqueda en vivo via proxy local con cache. Ambito actual: ${state.sentinelQueryScopeLabel}. ${state.sentinelCacheHit ? "Respuesta servida desde cache local." : "Consulta fresca al catalogo."}`;
      return;
    }

    dom.sentinelSourceStatus.classList.add("real");
    dom.sentinelSourceStatus.textContent = `Busqueda en vivo activa desde el navegador para ${state.sentinelQueryScopeLabel}. Si activas server.ps1, el visor suma proxy local, cache y mejor trazabilidad de consultas.`;
    return;
  }

  dom.sentinelSourceStatus.classList.add("demo");
  dom.sentinelSourceStatus.textContent = `Sin conexion operativa con Copernicus STAC. El visor usa escenas demo para no frenar el trabajo. ${state.sentinelError || ""}`.trim();
}

function setSentinelBusy(isBusy) {
  state.sentinelLoading = isBusy;
  dom.sentinelSubmitBtn.disabled = isBusy;
  dom.sentinelSubmitBtn.textContent = isBusy ? "Buscando escenas..." : "Buscar escenas";
  renderSentinelSourceStatus();
}

function renderSentinelResults() {
  if (!state.filteredImages.length) {
    dom.sentinelResults.innerHTML = `
      <div class="empty-state">
        No hay escenas que cumplan el filtro actual para ${state.sentinelQueryScopeLabel}. Ajusta fechas o permite mayor nubosidad.
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
        ? `<span class="source-pill">${state.sentinelTransport === "proxy" ? "Proxy local" : "CDSE STAC"}</span>`
        : `<span class="source-pill">Demo local</span>`;
      const stacLinkMarkup = image.stacLink
        ? `<a class="text-link" href="${image.stacLink}" target="_blank" rel="noreferrer">Ficha STAC</a>`
        : "";

      return `
        <article class="sentinel-card ${activeClass} ${compareClass}" data-image="${image.id}">
          ${thumbnailMarkup}
          <div class="section-head">
            <div>
              <p class="section-kicker">Escena disponible</p>
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
            <span class="meta-pill">${localeDate.format(new Date(`${image.date}T00:00:00`))}</span>
            <span class="meta-pill">Nubes ${formatCloudValue(image.cloud)}</span>
            <span class="meta-pill">${image.orbit}</span>
            <span class="meta-pill">Conf. ${image.qualityScore}/100</span>
            <span class="meta-pill">${formatAgeLabel(image.sceneAgeDays)}</span>
            ${sourceMarkup}
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
  dom.indexButtons.innerHTML = Object.values(indexConfig)
    .map(
      (index) => `
        <button
          class="index-button ${index.label === state.selectedIndex ? "active" : ""}"
          type="button"
          data-index="${index.label}"
        >
          ${index.label}
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
    const backend = await detectBackend(!state.backendAvailable);
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
      setStatus(`AOI ${analysis.context.scopeLabel} procesado en ${state.selectedIndex} usando ${sourceLabel}${compareLabel}.`);
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
    }
  }
}

async function computeAnalysisForImage(image, context, backend = null) {
  const backendStatus = backend || await detectBackend(!state.backendAvailable);

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
    context,
    summary,
    quality: {
      confidenceScore: Number(payload.quality?.confidenceScore) || estimateSceneConfidence(image, context.freshnessDays),
      coveragePct: Number(payload.quality?.coveragePct) || 0,
      freshnessDays: Number(payload.quality?.freshnessDays) || context.freshnessDays,
    },
    management: payload.management || deriveManagementMix(summary.NDVI, context.areaHa),
    diagnostics: payload.diagnostics || deriveDiagnostics(summary, {
      confidenceScore: Number(payload.quality?.confidenceScore) || estimateSceneConfidence(image, context.freshnessDays),
      coveragePct: Number(payload.quality?.coveragePct) || 0,
    }),
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
  const feature = getSentinelSearchArea();
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
    context,
    summary,
    quality,
    management: deriveManagementMix(summary.NDVI, context.areaHa),
    diagnostics: deriveDiagnostics(summary, quality),
    surface: buildAnalysisSurface(context, summary, image),
    processingMode: "local",
    cacheHit: false,
    generatedAt: new Date().toISOString(),
  };
}

function buildChangeAnalysis(primaryAnalysis, compareAnalysis) {
  const summary = {};
  Object.keys(indexConfig).forEach((indexKey) => {
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
      Object.keys(indexConfig).forEach((indexKey) => {
        properties[indexKey] = feature.properties[indexKey] - (compareFeature?.properties?.[indexKey] ?? 0);
      });
      properties.zone = properties.NDVI >= 0.04 ? "improve" : properties.NDVI <= -0.04 ? "decline" : "stable";
      return {
        ...feature,
        properties,
      };
    }),
  };

  const daysBetween = Math.abs(dayDiff(primaryAnalysis.imageDate, compareAnalysis.imageDate));
  const strongestIndex = getStrongestChangeIndex(summary);

  return {
    summary,
    surface,
    strongestIndex,
    daysBetween,
    direction: summary.NDVI.mean >= 0 ? "recuperacion" : "caida",
  };
}

function normalizeAnalysisSummary(summary, image, context) {
  const fallback = buildIndexSummary(image, context);
  const normalized = {};

  Object.keys(indexConfig).forEach((indexKey) => {
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
  const confidenceScore = estimateSceneConfidence(image, context.freshnessDays);
  const ndviStability = 100 - Math.min(summary.NDVI.variability, 45);
  const areaPenalty = Math.min(Math.log10(context.areaHa + 1) * 6, 14);
  const coveragePct = Math.round(clamp(confidenceScore * 0.88 + ndviStability * 0.12 - areaPenalty, 42, 99));

  return {
    confidenceScore,
    coveragePct,
    freshnessDays: context.freshnessDays,
  };
}

function buildIndexSummary(image, context) {
  const summary = {};
  const wizardBias = {
    Monitoreo: { NDVI: 0.02, NDWI: 0.01, NDRE: 0.01, MSAVI: 0 },
    Siembra: { NDVI: -0.01, NDWI: 0.02, NDRE: 0, MSAVI: 0.02 },
    Cosecha: { NDVI: -0.02, NDWI: -0.01, NDRE: 0.03, MSAVI: 0.01 },
    Diagnostico: { NDVI: -0.01, NDWI: 0.02, NDRE: 0.02, MSAVI: 0 },
  };

  Object.keys(indexConfig).forEach((indexKey, index) => {
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

      Object.keys(indexConfig).forEach((indexKey, position) => {
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

      properties.zone = properties.NDVI >= Math.max(summary.NDVI.mean + 0.035, 0.66)
        ? "high"
        : properties.NDVI <= Math.min(summary.NDVI.mean - 0.04, 0.5)
          ? "low"
          : "medium";
      return { ...cell, properties };
    })
    .filter(Boolean);

  return { type: "FeatureCollection", features };
}

function deriveManagementMix(ndviStats, areaHa) {
  const rawHigh = clamp(24 + (ndviStats.mean - 0.58) * 120 - ndviStats.variability * 0.16, 10, 58);
  const rawLow = clamp(18 + (0.56 - ndviStats.mean) * 135 + ndviStats.variability * 0.2 + areaHa * 0.01, 8, 56);
  const high = Math.round(rawHigh);
  const low = Math.round(rawLow);
  const medium = Math.max(100 - high - low, 8);
  const adjustedHigh = Math.max(100 - medium - low, 8);

  return {
    high: adjustedHigh,
    medium,
    low,
    recommendedAction: adjustedHigh > low ? "Prioriza sectores de alto potencial." : "Enfoca verificacion en zonas bajas.",
  };
}

function deriveDiagnostics(summary, quality) {
  const moistureSignal = summary.NDWI.mean < 0.12
    ? "Deficit hidrico probable"
    : summary.NDWI.mean > 0.24
      ? "Humedad alta"
      : "Humedad equilibrada";
  const vigorSignal = summary.NDVI.mean < 0.55
    ? "Vigor irregular"
    : summary.NDVI.mean > 0.7
      ? "Vigor alto"
      : "Vigor medio";
  const recommendedIndex = getRecommendedIndex(summary);
  const alertLevel = quality.confidenceScore < 55 || summary.NDVI.variability > 26
    ? "Seguimiento prioritario"
    : "Condicion estable";

  return { moistureSignal, vigorSignal, recommendedIndex, alertLevel };
}

function getRecommendedIndex(summary) {
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
  dom.useStudyAreaBtn.disabled = !state.currentPlot;
  dom.rerunAnalysisBtn.disabled = state.analysisBusy || !image;
  dom.analysisStatus.className = "service-banner";

  if (!image) {
    dom.analysisStatus.classList.add("local-processing");
    dom.analysisStatus.textContent = "Selecciona una escena para generar el perfil operativo del AOI.";
    return;
  }

  if (state.analysisBusy) {
    dom.analysisStatus.classList.add("loading");
    dom.analysisStatus.textContent = `Procesando ${state.selectedIndex} para ${state.currentPlot ? state.currentPlotLabel : "Canton Mejia"}...`;
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
      ? `Procesamiento local calibrado por la escena real${compareImage ? " y una segunda escena temporal" : ""}. Sirve para exploracion operativa del AOI; el pixel-raster real requerira un motor geoespacial adicional.`
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
      label: state.selectedIndex,
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
      label: `Cambio ${state.selectedIndex}`,
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
      copy: `Indice con mayor cambio: ${change.strongestIndex}.`,
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
    setStatus("No hay escena activa. Usa el filtro Sentinel-2 para seleccionar una imagen.");
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

  if (surfaceDataset?.features?.length) {
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
          `${state.selectedIndex}: ${tooltipValue} | ${zoneLabel}`,
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
      setStatus(`Cambio temporal ${state.selectedIndex} entre ${image.date} y ${getCompareImage().date} sobre ${analysis.context.scopeLabel}.`);
    } else {
      const sourceLabel = analysis.processingMode === "backend"
        ? "backend local"
        : image.source === "real"
          ? "motor local calibrado"
          : "motor demo";
      setStatus(`Escena ${image.title} activa con ${state.selectedIndex} sobre ${analysis.context.scopeLabel} usando ${sourceLabel}.`);
    }
  }
}

function renderRealSceneFootprint(image, fitBounds = false) {
  if (!image.geometry) {
    return;
  }

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
        color: "#3a6f8f",
        weight: 2.5,
        fillColor: "#3a6f8f",
        fillOpacity: 0.08,
        dashArray: "10 8",
      },
    }
  ).addTo(mapState.map);

  mapState.sceneFootprintLayer.bindPopup(
    `<div>${popupThumb}<h3 class="popup-title">${image.title}</h3><p class="popup-copy">Escena real consultada desde Copernicus STAC. ${image.note}</p></div>`
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
  if (!image?.thumbnail || !bounds) {
    return;
  }

  mapState.scenePreviewLayer = L.imageOverlay(image.thumbnail, bounds, {
    opacity: state.scenePreviewOpacity,
    interactive: false,
    className: "scene-preview-overlay",
    crossOrigin: "anonymous",
  }).addTo(mapState.map);
}

async function renderSceneLayer(image) {
  if (!mapState.map || !state.showScenePreview) {
    return;
  }

  state.sceneLayerKind = "loading";
  updateMapSummary();

  if (image.source === "real") {
    const exactLayer = await createExactSceneLayer(image);
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

  if (image.id === state.selectedImageId && state.showScenePreview && canRenderThumbnailPreview(image)) {
    renderScenePreview(image);
    state.sceneLayerKind = "preview";
    updateMapSummary();
    return;
  }

  state.sceneLayerKind = "off";
  updateMapSummary();
}

async function createExactSceneLayer(image) {
  const GeoRasterLayerCtor = getGeoRasterLayerCtor();
  const exactScene = await getExactSceneData(image);
  if (!exactScene || !GeoRasterLayerCtor) {
    return null;
  }

  return new GeoRasterLayerCtor({
    georaster: exactScene.georaster,
    opacity: state.scenePreviewOpacity,
    resolution: 128,
    updateWhenIdle: true,
    keepBuffer: 2,
    mask: {
      type: "Feature",
      geometry: exactScene.geometry,
      properties: {},
    },
    mask_strategy: "outside",
    mask_srs: "EPSG:4326",
    pixelValuesToColorFn: colorizeVisualPixel,
  });
}

async function getExactSceneData(image) {
  const parseGeorasterFn = getParseGeorasterFn();
  if (!image || image.source !== "real" || !parseGeorasterFn) {
    return null;
  }

  const cacheKey = `${getSceneGridCode(image) || image.id}|${image.date}`;
  if (!exactSceneCache.has(cacheKey)) {
    exactSceneCache.set(cacheKey, (async () => {
      const earthItem = await fetchEarthSearchMatch(image);
      const visualHref = earthItem?.assets?.visual?.href;
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
        geometry: earthItem.geometry || image.geometry,
        bbox: earthItem.bbox || image.bbox,
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
      collections: [earthSearchService.collection],
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
}

function colorizeVisualPixel(values) {
  if (!Array.isArray(values) || values.length < 3) {
    return null;
  }

  const [red, green, blue] = values.map((value) => Number(value));
  if (![red, green, blue].every(Number.isFinite) || (red === 0 && green === 0 && blue === 0)) {
    return null;
  }

  return `rgb(${red}, ${green}, ${blue})`;
}

function getAnalysisOverlayOpacity(image) {
  if (state.surfaceMode === "change") {
    return 0.42;
  }

  if (image?.source === "real" && state.showScenePreview) {
    return state.sceneLayerKind === "exact" ? 0.14 : 0.18;
  }

  if (image?.source === "real") {
    return 0.32;
  }

  return 0.46;
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

  if (image.source === "real" && getSceneGridCode(image)) {
    return true;
  }

  return canRenderThumbnailPreview(image);
}

function canRenderThumbnailPreview(image = getSelectedImage()) {
  return Boolean(image?.thumbnail && getScenePreviewBounds(image));
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
  filterSentinelImages();
}

function clearCurrentPlot(triggerRefresh = false) {
  state.currentPlot = null;
  state.currentPlotLabel = "Sin seleccionar";
  state.analysisData = null;
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
  renderAnalysisSummary();
  renderCompareSummary();
  renderLegend();
  updateMapSummary();

  if (triggerRefresh) {
    filterSentinelImages();
  }
}

function runIntraloteAnalysis(silent = false) {
  if (!ensurePlot("Analisis intralote requiere un lote activo o un poligono dibujado.", silent)) {
    return;
  }

  const image = getSelectedImage() || enrichSceneMetadata({ ...sentinelImages[0], source: "demo", datetime: `${sentinelImages[0].date}T10:15:00Z` });
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
    ...Object.keys(indexConfig).map((indexKey) => ({
      label: indexKey,
      value: formatValue(analysis.summary[indexKey].mean, indexConfig[indexKey]),
      copy: `Rango P10 ${formatValue(analysis.summary[indexKey].p10, indexConfig[indexKey])} / P90 ${formatValue(analysis.summary[indexKey].p90, indexConfig[indexKey])}.`,
    })),
  ];

  paintMetricGrid(dom.intraloteResults, cards);
  if (!silent) {
    setStatus(
      `Analisis intralote ejecutado para ${state.currentPlotLabel}. Se actualizaron superficies y zonas de manejo.`
    );
  }

  if (state.activeWizard === "Monitoreo" || state.activeWizard === "Diagnostico") {
    runClimateAnalysis(true);
  }
}

function renderManagementZones(analysis) {
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
            `Zona ${feature.properties.zone} / NDVI ${feature.properties.NDVI.toFixed(2)}`,
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
    return;
  }

  const image = getSelectedImage() || enrichSceneMetadata({ ...sentinelImages[0], source: "demo", datetime: `${sentinelImages[0].date}T10:15:00Z` });
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
  const floodRisk = analysis.summary.NDWI.mean > 0.22 && meanSlope < 7
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
    { label: "Lectura operativa", value: meanSlope > 10 ? "Manejo cuidadoso" : "Operacion favorable", copy: `Variabilidad NDVI ${analysis.summary.NDVI.variability}%.` },
  ];

  paintMetricGrid(dom.demResults, cards);
  if (!silent) {
    setStatus(`Analisis topografico generado para ${state.currentPlotLabel}.`);
  }
}

function runClimateAnalysis(silent = false) {
  const anchorFeature = state.currentPlot || studyArea;
  const image = getSelectedImage() || enrichSceneMetadata({ ...sentinelImages[0], source: "demo", datetime: `${sentinelImages[0].date}T10:15:00Z` });
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
  const baseline = analysis.summary.NDWI.mean;
  const vigor = analysis.summary.NDVI.mean;
  const rainfall = 9 + Math.round(Math.abs(pseudoNoise(centroid[0], centroid[1], 19)) * 32 + (0.24 - baseline) * 16);
  const minTemp = 6 + Math.abs(pseudoNoise(centroid[1], centroid[0], 2)) * 3;
  const maxTemp = 18 + Math.abs(pseudoNoise(centroid[0], centroid[1], 5)) * 7 + (vigor < 0.55 ? 1.2 : 0);
  const soilMoisture = clamp(42 + baseline * 80 + pseudoNoise(centroid[0], centroid[1], 17) * 8, 24, 72);
  const lst = clamp(20 + Math.abs(pseudoNoise(centroid[0], centroid[1], 23)) * 10 - baseline * 3, 18, 31);
  const stress = lst > 27 || vigor < 0.55 ? "Atencion" : "Controlado";

  const cards = [
    { label: "Lluvia 7 dias", value: `${rainfall} mm`, copy: "Acumulado de referencia tipo ERA5-Land." },
    { label: "Temperatura aire", value: `${minTemp.toFixed(1)} - ${maxTemp.toFixed(1)} C`, copy: "Rango diario esperado sobre el lote o zona activa." },
    { label: "Humedad estimada", value: `${soilMoisture.toFixed(0)}%`, copy: "Ajustada con la senal NDWI del AOI." },
    { label: "LST MODIS", value: `${lst.toFixed(1)} C`, copy: "Temperatura superficial para seguimiento de estres termico." },
    { label: "Estado termico", value: stress, copy: `Lectura de vigor: ${analysis.diagnostics.vigorSignal}.` },
    { label: "Escena base", value: localeDate.format(new Date(`${image.date}T00:00:00`)), copy: `AOI ${analysis.context.scopeLabel}.` },
  ];

  paintMetricGrid(dom.climateResults, cards);
  if (!silent) {
    setStatus("Modulo de clima agricola actualizado con variables de referencia.");
  }
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
      renderWizardModes();
      renderWizardSteps();
      setStatus(`Asistente Agricola ajustado al modo ${state.activeWizard}.`);
      refreshActiveAnalysis({ silent: true });
    });
  });
}

function renderWizardSteps() {
  const steps = wizardConfig[state.activeWizard];
  dom.wizardSteps.innerHTML = steps
    .map(
      (step, index) => `
        <article class="wizard-step">
          <p class="section-kicker">Paso ${index + 1}</p>
          <h4>${step.title}</h4>
          <p>${step.body}</p>
        </article>
      `
    )
    .join("");
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
  const analysis = getRenderableAnalysis(image);
  const compareImage = getCompareImage();
  const changeAnalysis = getRenderableChangeAnalysis(image, compareImage);
  const previewLabel = state.showScenePreview
    ? state.sceneLayerKind === "exact"
      ? "raster exacto 10 m"
      : state.sceneLayerKind === "loading"
        ? "cargando raster"
        : state.sceneLayerKind === "preview"
          ? "preview"
          : "sin capa"
    : "capa oculta";
  dom.overlayIndex.textContent = state.selectedIndex;

  if (!image) {
    dom.mapTitle.textContent = "No hay escena activa";
    renderMapBadges();
    dom.mapSubtitle.textContent = "Ajusta el filtro Sentinel-2 para cargar una imagen sobre el visor.";
    return;
  }

  renderMapBadges(image, compareImage, previewLabel);

  if (analysis) {
    if (state.surfaceMode === "change" && changeAnalysis && compareImage) {
      const delta = changeAnalysis.summary[state.selectedIndex];
      dom.mapTitle.textContent = `Cambio ${state.selectedIndex} sobre ${analysis.context.scopeLabel}`;
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
    dom.mapTitle.textContent = `${state.selectedIndex} sobre ${analysis.context.scopeLabel}`;
    dom.mapSubtitle.textContent = `Media ${formatValue(stats.mean, indexConfig[state.selectedIndex])} con ${modeLabel}.`;
    return;
  }

  if (image.source === "real") {
    dom.mapTitle.textContent = `Escena real ${image.title}`;
    dom.mapSubtitle.textContent = "Preparando la capa satelital y el AOI operativo.";
    return;
  }

  dom.mapTitle.textContent = `${state.selectedIndex} sobre ${image.title}`;
  dom.mapSubtitle.textContent = image.note;
}

function renderMapBadges(image = null, compareImage = null, previewLabel = "sin capa") {
  if (!dom.mapBadges) {
    return;
  }

  if (!image) {
    dom.mapBadges.innerHTML = `<span class="map-badge muted">Sin escena</span>`;
    return;
  }

  const rasterTone = state.sceneLayerKind === "exact"
    ? "exact"
    : state.sceneLayerKind === "loading"
      ? "loading"
      : state.sceneLayerKind === "preview"
        ? "preview"
        : "muted";
  const badges = [
    {
      tone: "neutral",
      label: localeDate.format(new Date(`${image.date}T00:00:00`)),
    },
    {
      tone: "neutral",
      label: `Nubes ${formatCloudValue(image.cloud)}`,
    },
    {
      tone: rasterTone,
      label: state.showScenePreview ? previewLabel : "capa oculta",
    },
  ];

  if (compareImage) {
    badges.push({
      tone: "compare",
      label: `Comp ${localeDate.format(new Date(`${compareImage.date}T00:00:00`))}`,
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
    NDRE: 0.2,
    MSAVI: 0.28,
  };
  return {
    label: `Delta ${indexKey}`,
    min: -ranges[indexKey],
    max: ranges[indexKey],
    unit: "",
    colors: ["#9f4a36", "#d69a64", "#f6f1e7", "#88c2b0", "#1d6b49"],
    description: `Cambio temporal de ${indexKey} entre la escena activa y la comparada.`,
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
    .sort((a, b) => b.score - a.score)[0]?.indexKey || "NDVI";
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
  const cloudPenalty = Number.isFinite(image.cloud) ? image.cloud * 0.55 : 18;
  const freshnessPenalty = Math.min(freshnessDays * 1.4, 24);
  const sourceBonus = image.source === "real" ? 12 : 0;
  return Math.round(clamp(92 - cloudPenalty - freshnessPenalty + sourceBonus, 28, 98));
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

function getSentinelSearchArea() {
  return state.currentPlot || studyArea;
}

function formatCloudValue(value) {
  if (!Number.isFinite(value)) {
    return "s/d";
  }
  return `${Number(value.toFixed(1))}%`;
}

function formatPlatform(platform) {
  if (!platform) {
    return "Sentinel-2";
  }
  return platform
    .replace(/^sentinel-/i, "Sentinel-")
    .replace(/([0-9])([a-z])/i, (_, number, letter) => `${number}${letter.toUpperCase()}`);
}

function deriveBetaIndicesFromScene(sceneId, cloudCover) {
  const cloudPenalty = Number.isFinite(cloudCover) ? cloudCover / 100 : 0.25;
  const seed = Array.from(sceneId || "scene").reduce((total, char) => total + char.charCodeAt(0), 0);
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
