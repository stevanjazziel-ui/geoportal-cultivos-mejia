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
  selectedIndex: "NDVI",
  filteredImages: [],
  activeWizard: "Monitoreo",
  currentPlot: null,
  currentPlotLabel: "Sin seleccionar",
  baseLayer: "satellite",
};

const dom = {};
const mapState = {
  map: null,
  baseLayers: {},
  activeBaseLayer: null,
  controlGroup: null,
  lotLayer: null,
  sentinelLayer: null,
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
  dom.sentinelResults = document.querySelector("#sentinelResults");
  dom.indexButtons = document.querySelector("#indexButtons");
  dom.legendCard = document.querySelector("#legendCard");
  dom.mapTitle = document.querySelector("#mapTitle");
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
  }).setView([-0.503, -78.59], 11);

  L.control.zoom({ position: "bottomright" }).addTo(mapState.map);

  mapState.baseLayers.satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Esri World Imagery",
      maxZoom: 19,
    }
  );

  mapState.baseLayers.streets = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "OpenStreetMap",
      maxZoom: 19,
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
    runIntraloteAnalysis();
  });

  mapState.map.on(L.Draw.Event.DELETED, () => {
    clearCurrentPlot();
  });

  dom.overlayMode.textContent = state.activeWizard;
  updateLayerVisibility();
  updateMapSummary();
  renderSentinelOverlay();
}

function setDefaultDates() {
  dom.startDate.value = "2026-01-01";
  dom.endDate.value = "2026-04-09";
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
          runIntraloteAnalysis();
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

function filterSentinelImages() {
  const start = dom.startDate.value;
  const end = dom.endDate.value;
  const maxCloud = Number(dom.cloudRange.value);

  state.filteredImages = sentinelImages
    .filter((image) => (!start || image.date >= start) && (!end || image.date <= end) && image.cloud <= maxCloud)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (!state.filteredImages.length) {
    state.selectedImageId = null;
  } else if (!state.filteredImages.some((image) => image.id === state.selectedImageId)) {
    state.selectedImageId = state.filteredImages[0].id;
  }

  renderSentinelResults();
  renderLegend();
  renderSentinelOverlay();
}

function renderSentinelResults() {
  if (!state.filteredImages.length) {
    dom.sentinelResults.innerHTML = `
      <div class="empty-state">
        No hay escenas que cumplan el filtro actual. Amplia fechas o permite mayor nubosidad.
      </div>
    `;
    updateMapSummary();
    return;
  }

  dom.sentinelResults.innerHTML = state.filteredImages
    .map((image) => {
      const activeClass = image.id === state.selectedImageId ? "active" : "";
      return `
        <article class="sentinel-card ${activeClass}" data-image="${image.id}">
          <div class="section-head">
            <div>
              <p class="section-kicker">Escena disponible</p>
              <h2>${image.title}</h2>
            </div>
            <button class="secondary-button image-select" type="button" data-image="${image.id}">
              ${image.id === state.selectedImageId ? "Activa" : "Usar escena"}
            </button>
          </div>
          <div class="sentinel-meta">
            <span class="meta-pill">${localeDate.format(new Date(`${image.date}T00:00:00`))}</span>
            <span class="meta-pill">Nubes ${image.cloud}%</span>
            <span class="meta-pill">${image.orbit}</span>
          </div>
          <p>${image.note}</p>
        </article>
      `;
    })
    .join("");

  dom.sentinelResults.querySelectorAll(".image-select").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedImageId = button.dataset.image;
      renderSentinelResults();
      renderSentinelOverlay();
      updateMapSummary();
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
      renderSentinelOverlay();
      updateMapSummary();
    });
  });

  renderLegend();
}

function renderLegend() {
  const config = indexConfig[state.selectedIndex];
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
  `;
}

function renderSentinelOverlay() {
  if (!mapState.map) {
    return;
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

  const bbox = turf.bbox(studyArea);
  const grid = turf.squareGrid(bbox, 2.1, { units: "kilometers" });
  const features = grid.features
    .map((cell, index) => {
      const centroid = turf.centroid(cell);
      if (!turf.booleanPointInPolygon(centroid, studyArea)) {
        return null;
      }
      const [lon, lat] = centroid.geometry.coordinates;
      const value = deriveIndexValue({
        lon,
        lat,
        seed: image.id.length + index,
        base: image.baseIndices[state.selectedIndex],
        config: indexConfig[state.selectedIndex],
      });
      cell.properties = { value };
      return cell;
    })
    .filter(Boolean);

  mapState.sentinelLayer = L.geoJSON(
    { type: "FeatureCollection", features },
    {
      style: (feature) => ({
        weight: 0,
        fillOpacity: 0.5,
        fillColor: interpolateColor(
          feature.properties.value,
          indexConfig[state.selectedIndex].min,
          indexConfig[state.selectedIndex].max,
          indexConfig[state.selectedIndex].colors
        ),
      }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `${state.selectedIndex}: ${formatValue(feature.properties.value, indexConfig[state.selectedIndex])}`,
          { sticky: true }
        );
      },
    }
  ).addTo(mapState.map);

  if (mapState.currentPlotLayer) {
    mapState.currentPlotLayer.bringToFront();
  }
  if (mapState.managementLayer) {
    mapState.managementLayer.bringToFront();
  }

  setStatus(
    `Escena ${image.title} activa con ${state.selectedIndex} sobre el area de trabajo de Mejia.`
  );
}

function getSelectedImage() {
  return state.filteredImages.find((image) => image.id === state.selectedImageId) || null;
}

function setCurrentPlot(feature, label) {
  state.currentPlot = feature;
  state.currentPlotLabel = label;
  dom.overlayPlot.textContent = label;

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
}

function clearCurrentPlot() {
  state.currentPlot = null;
  state.currentPlotLabel = "Sin seleccionar";
  dom.overlayPlot.textContent = state.currentPlotLabel;

  if (mapState.currentPlotLayer) {
    mapState.map.removeLayer(mapState.currentPlotLayer);
    mapState.currentPlotLayer = null;
  }

  if (mapState.managementLayer) {
    mapState.map.removeLayer(mapState.managementLayer);
    mapState.managementLayer = null;
  }

  resetMetricGrid(dom.intraloteResults, "Dibuja un lote en el mapa para empezar.");
  resetMetricGrid(dom.demResults, "Elige un lote o dibuja un poligono para estimar relieve.");
  updateMapSummary();
}

function runIntraloteAnalysis() {
  if (!ensurePlot("Analisis intralote requiere un lote activo o un poligono dibujado.")) {
    return;
  }

  const plot = state.currentPlot;
  const centroid = turf.centroid(plot).geometry.coordinates;
  const areaHa = turf.area(plot) / 10000;
  const image = getSelectedImage() || sentinelImages[0];

  const metrics = Object.keys(indexConfig).map((indexKey, index) => {
    const config = indexConfig[indexKey];
    const base = image.baseIndices[indexKey];
    const value = deriveIndexValue({
      lon: centroid[0],
      lat: centroid[1],
      seed: index + Math.round(areaHa * 10),
      base,
      config,
    });
    return {
      label: indexKey,
      value: formatValue(value, config),
    };
  });

  const zoneStats = renderManagementZones(plot, image);
  const managementText = `Alta ${zoneStats.high}% / Media ${zoneStats.medium}% / Baja ${zoneStats.low}%`;

  const cards = [
    { label: "Superficie", value: `${areaHa.toFixed(1)} ha`, copy: "Calculada sobre el poligono activo." },
    { label: "Zonas de manejo", value: managementText, copy: "Clasificacion generada sobre una malla interna del lote." },
    ...metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      copy: `Estimacion dinamica del indice ${metric.label} para el lote.`,
    })),
  ];

  paintMetricGrid(dom.intraloteResults, cards);
  setStatus(
    `Analisis intralote ejecutado para ${state.currentPlotLabel}. Se generaron zonas de manejo diferenciado.`
  );

  if (state.activeWizard === "Monitoreo" || state.activeWizard === "Diagnostico") {
    runClimateAnalysis(true);
  }
}

function renderManagementZones(plot, image) {
  if (mapState.managementLayer) {
    mapState.map.removeLayer(mapState.managementLayer);
  }

  const bbox = turf.bbox(plot);
  const cellSize = Math.max(0.18, Math.min(0.32, Math.sqrt(turf.area(plot) / 1000000) / 6));
  const grid = turf.squareGrid(bbox, cellSize, { units: "kilometers" });
  const config = indexConfig.NDVI;
  let counts = { high: 0, medium: 0, low: 0 };

  const features = grid.features
    .map((cell, index) => {
      const centroid = turf.centroid(cell);
      if (!turf.booleanPointInPolygon(centroid, plot)) {
        return null;
      }
      const [lon, lat] = centroid.geometry.coordinates;
      const score = deriveIndexValue({
        lon,
        lat,
        seed: image.id.charCodeAt(0) + index,
        base: image.baseIndices.NDVI,
        config,
      });
      let zone = "medium";
      if (score >= 0.68) {
        zone = "high";
      } else if (score <= 0.5) {
        zone = "low";
      }
      counts[zone] += 1;
      cell.properties = { zone, score };
      return cell;
    })
    .filter(Boolean);

  mapState.managementLayer = L.geoJSON(
    { type: "FeatureCollection", features },
    {
      style: (feature) => ({
        weight: 0.4,
        color: "#fff7ef",
        fillOpacity: 0.62,
        fillColor:
          feature.properties.zone === "high"
            ? "#3f9a60"
            : feature.properties.zone === "medium"
              ? "#d2a544"
              : "#b55a3f",
      }),
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `Zona ${feature.properties.zone} / NDVI ${feature.properties.score.toFixed(2)}`,
          { sticky: true }
        );
      },
    }
  ).addTo(mapState.map);

  mapState.managementLayer.bringToFront();
  if (mapState.currentPlotLayer) {
    mapState.currentPlotLayer.bringToFront();
  }

  const total = Math.max(features.length, 1);
  return {
    high: Math.round((counts.high / total) * 100),
    medium: Math.round((counts.medium / total) * 100),
    low: Math.round((counts.low / total) * 100),
  };
}

function runDemAnalysis(silent = false) {
  if (!ensurePlot("Analisis DEM requiere un lote activo o un poligono dibujado.", silent)) {
    return;
  }

  const centroid = turf.centroid(state.currentPlot).geometry.coordinates;
  const areaHa = turf.area(state.currentPlot) / 10000;
  const altitude = 2780 + Math.round((pseudoNoise(centroid[0], centroid[1], 11) + 1) * 140);
  const meanSlope = clamp(3 + Math.abs(pseudoNoise(centroid[0], centroid[1], 7)) * 12 + areaHa / 14, 2, 18);
  const maxSlope = clamp(meanSlope + 7 + Math.abs(pseudoNoise(centroid[1], centroid[0], 3)) * 8, 7, 31);
  const aspect = cardinalFromAngle((pseudoNoise(centroid[0], centroid[1], 13) + 1) * 180);
  const floodRisk = meanSlope < 6 ? "Medio - Alto" : meanSlope < 10 ? "Medio" : "Bajo";

  const cards = [
    { label: "Altitud media", value: `${Math.round(altitude)} msnm`, copy: "Estimacion basada en relieve de referencia Copernicus GLO-30." },
    { label: "Pendiente media", value: `${meanSlope.toFixed(1)}%`, copy: "Promedio de inclinacion del lote." },
    { label: "Pendiente maxima", value: `${maxSlope.toFixed(1)}%`, copy: "Sector de mayor exigencia para mecanizacion." },
    { label: "Orientacion", value: aspect, copy: "Exposicion dominante del relieve del lote." },
    { label: "Riesgo de anegamiento", value: floodRisk, copy: "Inferido a partir de pendiente y humedad relativa simulada." },
    { label: "Lectura operativa", value: meanSlope > 10 ? "Manejo cuidadoso" : "Operacion favorable", copy: "Sugerencia rapida para planificacion de campo." },
  ];

  paintMetricGrid(dom.demResults, cards);
  if (!silent) {
    setStatus(`Analisis topografico generado para ${state.currentPlotLabel}.`);
  }
}

function runClimateAnalysis(silent = false) {
  const anchorFeature = state.currentPlot || studyArea;
  const centroid = turf.centroid(anchorFeature).geometry.coordinates;
  const image = getSelectedImage() || sentinelImages[0];
  const baseline = image.baseIndices.NDWI;
  const rainfall = 9 + Math.round(Math.abs(pseudoNoise(centroid[0], centroid[1], 19)) * 32);
  const minTemp = 6 + Math.abs(pseudoNoise(centroid[1], centroid[0], 2)) * 3;
  const maxTemp = 18 + Math.abs(pseudoNoise(centroid[0], centroid[1], 5)) * 7;
  const soilMoisture = clamp(42 + baseline * 80 + pseudoNoise(centroid[0], centroid[1], 17) * 8, 24, 72);
  const lst = clamp(20 + Math.abs(pseudoNoise(centroid[0], centroid[1], 23)) * 10, 18, 31);
  const stress = lst > 27 ? "Atencion" : "Controlado";

  const cards = [
    { label: "Lluvia 7 dias", value: `${rainfall} mm`, copy: "Acumulado de referencia tipo ERA5-Land." },
    { label: "Temperatura aire", value: `${minTemp.toFixed(1)} - ${maxTemp.toFixed(1)} C`, copy: "Rango diario esperado sobre el lote o zona activa." },
    { label: "Humedad estimada", value: `${soilMoisture.toFixed(0)}%`, copy: "Humedad relativa del suelo como apoyo de riego." },
    { label: "LST MODIS", value: `${lst.toFixed(1)} C`, copy: "Temperatura superficial para seguimiento de estres termico." },
    { label: "Estado termico", value: stress, copy: "Alerta simple para priorizar seguimiento agronomico." },
    { label: "Escena base", value: localeDate.format(new Date(`${image.date}T00:00:00`)), copy: "Fecha de referencia de la ultima imagen activa." },
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
  dom.overlayIndex.textContent = state.selectedIndex;

  if (!image) {
    dom.mapTitle.textContent = "No hay escena activa";
    dom.mapSubtitle.textContent = "Ajusta el filtro Sentinel-2 para cargar una imagen sobre el visor.";
    return;
  }

  dom.mapTitle.textContent = `${state.selectedIndex} sobre ${image.title}`;
  dom.mapSubtitle.textContent = `${localeDate.format(new Date(`${image.date}T00:00:00`))} | ${image.cloud}% de nubosidad | ${image.note}`;
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
