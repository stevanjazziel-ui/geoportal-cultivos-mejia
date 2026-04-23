const state = {
  config: null,
  network: null,
  activation: null,
  map: null,
  baseLayers: {},
  activeBase: "satellite",
  markers: new Map(),
  tracks: new Map(),
  selectedDeviceId: "",
  pollId: null,
  firstFitDone: false
};

const dom = {
  productTitle: document.querySelector("#productTitle"),
  productSubtitle: document.querySelector("#productSubtitle"),
  areaSelect: document.querySelector("#areaSelect"),
  refreshSelect: document.querySelector("#refreshSelect"),
  refreshNowBtn: document.querySelector("#refreshNowBtn"),
  fitAllBtn: document.querySelector("#fitAllBtn"),
  statusBanner: document.querySelector("#statusBanner"),
  senderLinks: document.querySelector("#senderLinks"),
  activationPanel: document.querySelector("#activationPanel"),
  metricsGrid: document.querySelector("#metricsGrid"),
  eventFeed: document.querySelector("#eventFeed"),
  deviceList: document.querySelector("#deviceList"),
  satelliteBaseBtn: document.querySelector("#satelliteBaseBtn"),
  streetsBaseBtn: document.querySelector("#streetsBaseBtn"),
  openSenderBtn: document.querySelector("#openSenderBtn")
};

function setStatus(tone, copy) {
  dom.statusBanner.className = `status-banner ${tone || ""}`.trim();
  dom.statusBanner.textContent = copy;
}

function formatAge(timestamp) {
  if (!timestamp) {
    return "sin senal";
  }
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.round(diffMs / 1000));
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  return `${(minutes / 60).toFixed(1)} h`;
}

function getDeviceTone(device) {
  if (!device) {
    return "calm";
  }
  if ((device.mobilityMode || "").toLowerCase() === "air") {
    return "accent";
  }
  if ((device.accuracyM || 0) > 25) {
    return "warning";
  }
  return "calm";
}

function createMarker(device) {
  const tone = getDeviceTone(device);
  const className = `gps-pin ${tone}`;
  const html = `<span class="${className}"><i></i></span>`;
  return L.marker([device.lat, device.lon], {
    icon: L.divIcon({
      className: "gps-pin-wrap",
      html,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  });
}

function initializeMap(center = [-0.49, -78.57], zoom = 10) {
  state.map = L.map("map", {
    zoomControl: true,
    preferCanvas: true
  }).setView(center, zoom);

  state.baseLayers.streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  });
  state.baseLayers.satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 18,
    attribution: "Esri World Imagery"
  });

  state.baseLayers.satellite.addTo(state.map);
}

function switchBase(baseId) {
  if (!state.map || !state.baseLayers[baseId]) {
    return;
  }
  Object.entries(state.baseLayers).forEach(([id, layer]) => {
    if (state.map.hasLayer(layer)) {
      state.map.removeLayer(layer);
    }
    const button = id === "satellite" ? dom.satelliteBaseBtn : dom.streetsBaseBtn;
    button?.classList.toggle("active", id === baseId);
  });
  state.baseLayers[baseId].addTo(state.map);
  state.activeBase = baseId;
}

async function fetchJson(path, payload = null) {
  const response = await fetch(path, {
    method: payload ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.error || "No se pudo completar la solicitud.");
  }
  return json;
}

async function fetchJsonAllowFailure(path, payload = null) {
  const response = await fetch(path, {
    method: payload ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const json = await response.json();
  return { ok: response.ok && json.ok, status: response.status, body: json };
}

function populateAreas() {
  const areas = Array.isArray(state.config?.areas) ? state.config.areas : [];
  dom.areaSelect.innerHTML = areas.map((area) => `<option value="${area.id}">${area.label}</option>`).join("");
  dom.areaSelect.value = state.config.defaultAreaId || "all";
}

function buildSenderUrl(origin, areaId) {
  const url = new URL("./sender.html", origin);
  url.searchParams.set("server", origin.replace(/\/+$/, ""));
  url.searchParams.set("areaId", areaId || state.config.defaultAreaId || "machachi");
  if (state.config.shareIngestTokenInSenderLinks && state.network?.senderToken) {
    url.searchParams.set("token", state.network.senderToken);
  }
  return url.toString();
}

function renderSenderLinks() {
  if (state.activation && !state.activation.activated) {
    dom.senderLinks.className = "link-stack empty-state";
    dom.senderLinks.textContent = "El emisor quedara habilitado cuando esta instalacion tenga una licencia local valida.";
    return;
  }

  const addresses = Array.isArray(state.network?.addresses) ? state.network.addresses : [];
  if (!addresses.length) {
    dom.senderLinks.className = "link-stack empty-state";
    dom.senderLinks.textContent = "No pude detectar URLs del servidor todavia.";
    return;
  }

  dom.senderLinks.className = "link-stack";
  dom.senderLinks.innerHTML = addresses.map((entry) => {
    const url = buildSenderUrl(entry.url, dom.areaSelect.value);
    return `
      <article class="link-card">
        <div>
          <strong>${entry.label}</strong>
          <span>${entry.host}</span>
        </div>
        <code>${url}</code>
        <div class="action-row">
          <button class="ghost-button" type="button" data-copy-url="${url}">Copiar</button>
          <a class="ghost-button" href="${url}" target="_blank" rel="noreferrer">Abrir</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderActivationPanel() {
  const activation = state.activation;
  if (!activation) {
    dom.activationPanel.className = "empty-state";
    dom.activationPanel.textContent = "Leyendo activacion del modulo...";
    return;
  }

  if (activation.activated) {
    dom.activationPanel.className = "metrics-grid";
    dom.activationPanel.innerHTML = `
      <article class="mini-stat">
        <span>Estado</span>
        <strong>Activo</strong>
      </article>
      <article class="mini-stat">
        <span>Empresa</span>
        <strong>${activation.companyName || "Cliente"}</strong>
      </article>
      <article class="mini-stat">
        <span>Maquina</span>
        <strong>${activation.machineId}</strong>
      </article>
      <article class="mini-stat">
        <span>Vence</span>
        <strong>${activation.expiresAt ? new Date(activation.expiresAt).toLocaleDateString("es-EC") : "Sin vencimiento"}</strong>
      </article>
    `;
    return;
  }

  dom.activationPanel.className = "activation-panel";
  dom.activationPanel.innerHTML = `
    <div class="status-banner warning">
      <strong>Modulo no activado</strong>
      <span>${activation.message || "Esta instalacion necesita licencia local."}</span>
    </div>
    <article class="mini-stat">
      <span>ID de maquina</span>
      <strong>${activation.machineId || "sin ID"}</strong>
    </article>
    <article class="mini-stat">
      <span>Computadora</span>
      <strong>${activation.computerName || "sin nombre"}</strong>
    </article>
    <article class="mini-stat">
      <span>Ruta licencia</span>
      <strong>${activation.licensePath || "license/license.json"}</strong>
    </article>
    <article class="mini-stat">
      <span>Producto</span>
      <strong>${activation.productCode || "GEOTRACK-RT"}</strong>
    </article>
    <p class="activation-copy">Ejecuta <code>tools/export_activation_request.ps1</code>, envianos el JSON y luego instala la licencia local con <code>tools/install_activation_license.ps1</code>.</p>
  `;
}

function renderMetrics(payload) {
  const devices = Array.isArray(payload.devices) ? payload.devices : [];
  if (!devices.length) {
    dom.metricsGrid.className = "metrics-grid empty-state";
    dom.metricsGrid.textContent = "Aun no hay telemetria cargada.";
    return;
  }

  const aerial = devices.filter((device) => (device.mobilityMode || "").toLowerCase() === "air");
  const avgSpeed = devices.reduce((sum, device) => sum + Number(device.speedKmh || 0), 0) / devices.length;
  const latest = devices.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  const cards = [
    { label: "Dispositivos", value: devices.length },
    { label: "Aereos", value: aerial.length },
    { label: "Velocidad media", value: `${avgSpeed.toFixed(1)} km/h` },
    { label: "Ultima senal", value: formatAge(latest?.timestamp) }
  ];

  dom.metricsGrid.className = "metrics-grid";
  dom.metricsGrid.innerHTML = cards.map((card) => `
    <article class="mini-stat">
      <span>${card.label}</span>
      <strong>${card.value}</strong>
    </article>
  `).join("");
}

function renderEvents(payload) {
  const events = Array.isArray(payload.events) ? payload.events : [];
  if (!events.length) {
    dom.eventFeed.className = "event-feed empty-state";
    dom.eventFeed.textContent = "Todavia no hay eventos registrados.";
    return;
  }

  dom.eventFeed.className = "event-feed";
  dom.eventFeed.innerHTML = events.map((event) => `
    <article class="event-card tone-${event.type === "warning" ? "warning" : "calm"}">
      <strong>${new Date(event.timestamp).toLocaleTimeString("es-EC")}</strong>
      <p>${event.message}</p>
    </article>
  `).join("");
}

function flyToDevice(device) {
  if (!state.map || !device) {
    return;
  }
  state.selectedDeviceId = device.id;
  state.map.flyTo([device.lat, device.lon], Math.max(state.map.getZoom(), 15), { duration: 0.8 });
  renderDeviceList(state.lastPayload);
}

function renderDeviceList(payload) {
  state.lastPayload = payload;
  const devices = Array.isArray(payload.devices) ? payload.devices : [];
  if (!devices.length) {
    dom.deviceList.className = "device-list empty-state";
    dom.deviceList.textContent = "Esperando la primera senal GPS.";
    return;
  }

  dom.deviceList.className = "device-list";
  dom.deviceList.innerHTML = devices.map((device) => {
    const active = state.selectedDeviceId === device.id;
    return `
      <article class="device-card ${active ? "active" : ""}" data-device-id="${device.id}">
        <div class="device-card-head">
          <div>
            <h3>${device.label}</h3>
            <p>${device.deviceType || "GPS"} · ${device.areaId || "sin area"}</p>
          </div>
          <span class="device-pill tone-${getDeviceTone(device)}">${device.statusLabel || "En seguimiento"}</span>
        </div>
        <div class="device-grid">
          <span>Velocidad <strong>${Number(device.speedKmh || 0).toFixed(1)} km/h</strong></span>
          <span>Precision <strong>${Math.round(Number(device.accuracyM || 0))} m</strong></span>
          <span>Altitud <strong>${device.altitudeM != null ? `${Number(device.altitudeM).toFixed(1)} m` : "n/d"}</strong></span>
          <span>Senal <strong>${formatAge(device.timestamp)}</strong></span>
        </div>
      </article>
    `;
  }).join("");
}

function updateMap(payload) {
  const devices = Array.isArray(payload.devices) ? payload.devices : [];
  const history = payload.history || {};
  const activeIds = new Set();

  devices.forEach((device) => {
    activeIds.add(device.id);
    let marker = state.markers.get(device.id);
    if (!marker) {
      marker = createMarker(device);
      marker.addTo(state.map);
      state.markers.set(device.id, marker);
    } else {
      marker.setLatLng([device.lat, device.lon]);
      marker.setIcon(createMarker(device).options.icon);
    }

    marker.off("click");
    marker.on("click", () => {
      const current = (state.lastPayload?.devices || []).find((entry) => entry.id === device.id) || device;
      flyToDevice(current);
    });

    marker.bindPopup(`
      <strong>${device.label}</strong><br>
      ${device.deviceType || "GPS"} · ${device.statusLabel || "En seguimiento"}<br>
      Velocidad: ${Number(device.speedKmh || 0).toFixed(1)} km/h<br>
      Ultima senal: ${formatAge(device.timestamp)}
    `);

    const points = Array.isArray(history[device.id]) ? history[device.id] : [];
    let track = state.tracks.get(device.id);
    if (!track) {
      track = L.polyline([], {
        color: (device.mobilityMode || "").toLowerCase() === "air" ? "#f2994a" : "#0f766e",
        weight: 3,
        opacity: 0.86
      }).addTo(state.map);
      state.tracks.set(device.id, track);
    }
    track.setLatLngs(points.map((point) => [point.lat, point.lon]));
  });

  [...state.markers.keys()].forEach((deviceId) => {
    if (!activeIds.has(deviceId)) {
      state.map.removeLayer(state.markers.get(deviceId));
      state.markers.delete(deviceId);
    }
  });
  [...state.tracks.keys()].forEach((deviceId) => {
    if (!activeIds.has(deviceId)) {
      state.map.removeLayer(state.tracks.get(deviceId));
      state.tracks.delete(deviceId);
    }
  });

  if (!state.firstFitDone && devices.length) {
    const bounds = L.latLngBounds(devices.map((device) => [device.lat, device.lon]));
    state.map.fitBounds(bounds.pad(0.2), { maxZoom: 15 });
    state.firstFitDone = true;
  }
}

async function refreshTracking() {
  if (state.activation && !state.activation.activated) {
    setStatus("warning", "Modulo pendiente de activacion local.");
    return;
  }

  try {
    const payload = await fetchJson("./api/tracking/live", {
      areaId: dom.areaSelect.value || "all"
    });
    setStatus("", payload.message || "Seguimiento actualizado.");
    renderMetrics(payload);
    renderEvents(payload);
    renderDeviceList(payload);
    updateMap(payload);
  } catch (error) {
    setStatus("danger", error.message || "No se pudo leer el feed.");
  }
}

function restartPolling() {
  if (state.pollId) {
    window.clearInterval(state.pollId);
    state.pollId = null;
  }
  const intervalMs = Number(dom.refreshSelect.value || state.config.pollIntervalMs || 4000);
  state.pollId = window.setInterval(refreshTracking, intervalMs);
}

async function initialize() {
  try {
    const activation = await fetchJson("./api/tracking/activation-info");
    state.activation = activation;
    renderActivationPanel();

    if (!activation.activated) {
      initializeMap([-0.49, -78.57], 10);
      setStatus("warning", activation.message || "Esta instalacion necesita licencia local.");
      renderSenderLinks();
      return;
    }

    const [config, network] = await Promise.all([
      fetchJson("./api/tracking/config"),
      fetchJson("./api/tracking/network")
    ]);
    state.config = config;
    state.network = network;
    dom.productTitle.textContent = config.productName;
    dom.productSubtitle.textContent = `${config.companyName} · seguimiento GPS y telemetria en tiempo real.`;
    dom.refreshSelect.value = String(config.pollIntervalMs || 4000);
    populateAreas();
    initializeMap(config.map.center, config.map.zoom);
    renderSenderLinks();
    renderActivationPanel();
    dom.openSenderBtn.href = buildSenderUrl(network.publicOrigin || window.location.origin, config.defaultAreaId);
    restartPolling();
    await refreshTracking();
  } catch (error) {
    setStatus("danger", error.message || "No se pudo iniciar el modulo.");
  }
}

dom.satelliteBaseBtn?.addEventListener("click", () => switchBase("satellite"));
dom.streetsBaseBtn?.addEventListener("click", () => switchBase("streets"));
dom.refreshNowBtn?.addEventListener("click", refreshTracking);
dom.refreshSelect?.addEventListener("change", restartPolling);
dom.areaSelect?.addEventListener("change", () => {
  renderSenderLinks();
  restartPolling();
  refreshTracking();
});
dom.fitAllBtn?.addEventListener("click", () => {
  if (!state.map || !state.markers.size) {
    return;
  }
  const bounds = L.latLngBounds([...state.markers.values()].map((marker) => marker.getLatLng()));
  state.map.fitBounds(bounds.pad(0.2), { maxZoom: 15 });
});
dom.senderLinks?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-url]");
  if (!button) {
    return;
  }
  const url = button.getAttribute("data-copy-url");
  try {
    await navigator.clipboard.writeText(url);
    setStatus("", "Link del emisor copiado.");
  } catch (error) {
    setStatus("warning", "No pude copiar automaticamente el link.");
  }
});
dom.deviceList?.addEventListener("click", (event) => {
  const card = event.target.closest("[data-device-id]");
  if (!card || !state.lastPayload) {
    return;
  }
  const device = (state.lastPayload.devices || []).find((entry) => entry.id === card.dataset.deviceId);
  if (device) {
    flyToDevice(device);
  }
});

initialize();
