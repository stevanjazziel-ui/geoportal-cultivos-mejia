import fs from "node:fs/promises";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const port = Number(args.port || 8765);
const debugPort = Number(args["debug-port"] || 9222);
const scenarioArg = String(args.scenario || "all");
const outputDir = path.resolve(String(args["output-dir"] || "D:/Geoportal Cultivos/tmp/smoke"));
const baseUrl = `http://127.0.0.1:${port}`;
const debugHttp = `http://127.0.0.1:${debugPort}`;

let messageId = 0;
let ws;
const pending = new Map();
const consoleMessages = [];

function formatRuntimeException(details = {}) {
  const rawText = details.text || details.exception?.description || details.exception?.value || "Runtime exception";
  const line = Number.isFinite(details.lineNumber) ? details.lineNumber + 1 : null;
  const column = Number.isFinite(details.columnNumber) ? details.columnNumber + 1 : null;
  const source = [details.url || details.scriptId || null, line != null ? `L${line}` : null, column != null ? `C${column}` : null]
    .filter(Boolean)
    .join(":");
  return source ? `${rawText} @ ${source}` : rawText;
}

function parseArgs(argv = []) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function nextId() {
  messageId += 1;
  return messageId;
}

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`No se pudo consultar ${url} (${response.status} ${response.statusText}).`);
  }
  return response.json();
}

async function getPageTarget() {
  const targets = await readJson(`${debugHttp}/json/list`);
  const pageTarget = targets.find((entry) => entry?.type === "page" && entry?.webSocketDebuggerUrl);
  if (!pageTarget) {
    throw new Error("No encontre una pestana CDP tipo page para automatizar.");
  }
  return pageTarget;
}

async function cdp(method, params = {}, sessionId = undefined) {
  const id = nextId();
  const payload = { id, method, params };
  if (sessionId) {
    payload.sessionId = sessionId;
  }
  const result = new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
  });
  ws.send(JSON.stringify(payload));
  return result;
}

async function evaluate(expression, sessionId) {
  const result = await cdp("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  }, sessionId);
  return result?.result?.value;
}

async function readText(selector, sessionId) {
  return evaluate(`
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      return element ? (element.textContent || "").trim() : null;
    })()
  `, sessionId);
}

async function readNodeInfo(selector, sessionId) {
  return evaluate(`
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      return {
        text: (element.textContent || "").trim(),
        className: element.className || "",
        hidden: element.classList.contains("hidden"),
        ariaHidden: element.getAttribute("aria-hidden"),
        checked: element.checked === true,
        disabled: element.disabled === true,
      };
    })()
  `, sessionId);
}

async function click(selector, sessionId) {
  const result = await evaluate(`
    (() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return { ok: false, reason: "missing" };
      element.click();
      return { ok: true, text: (element.textContent || "").trim() };
    })()
  `, sessionId);
  if (!result?.ok) {
    throw new Error(`No pude hacer click en ${selector}: ${result?.reason || "sin detalle"}.`);
  }
  return result;
}

async function waitFor(condition, { timeoutMs = 120000, intervalMs = 350, label = "condicion" } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = await condition();
    if (value) {
      return value;
    }
    await delay(intervalMs);
  }
  throw new Error(`Tiempo de espera agotado para ${label}.`);
}

async function navigate(url, sessionId) {
  await cdp("Page.navigate", { url }, sessionId);
}

async function waitForRoute(route, sessionId) {
  return waitFor(async () => {
    const snapshot = await evaluate(`
      (() => {
        const shell = document.querySelector("#appShell");
        const overlay = document.querySelector("#loginOverlay");
        return {
          route: shell?.dataset?.route ?? null,
          appVisible: shell ? !shell.classList.contains("hidden") : false,
          loginHidden: overlay ? overlay.classList.contains("hidden") : false,
          title: document.querySelector("#modulesSectionTitle")?.textContent?.trim() ?? null,
        };
      })()
    `, sessionId).catch(() => null);
    return snapshot?.route === route && snapshot?.appVisible && snapshot?.loginHidden ? snapshot : null;
  }, { label: `ruta ${route}` });
}

async function captureScreenshot(name, sessionId) {
  const capture = await cdp("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  }, sessionId);
  const targetPath = path.join(outputDir, `${name}.png`);
  await fs.writeFile(targetPath, Buffer.from(capture.data, "base64"));
  return targetPath;
}

async function runAgronomyScenario(sessionId) {
  await navigate(`${baseUrl}/?route=agronomia`, sessionId);
  await waitForRoute("agronomia", sessionId);
  const wizard = await waitFor(async () => {
    const info = await readNodeInfo("#wizardSummary", sessionId);
    return info?.text ? info : null;
  }, { label: "modulo agricola visible" });
  const modulesTitle = await readText("#modulesSectionTitle", sessionId);
  const sidebarTitle = await readText("#sidebarTitle", sessionId);
  const screenshotPath = await captureScreenshot("smoke-agronomia", sessionId);
  return {
    scenario: "agronomia",
    ok: true,
    modulesTitle,
    sidebarTitle,
    wizardSummary: wizard.text.slice(0, 300),
    screenshotPath,
  };
}

async function runAiGeoScenario(sessionId) {
  await navigate(`${baseUrl}/?route=agronomia`, sessionId);
  await waitForRoute("agronomia", sessionId);
  await click("#runAiGeoBtn", sessionId);
  const agronomyAi = await waitFor(async () => {
    const results = await readNodeInfo("#aiGeoResults", sessionId);
    const signals = await readNodeInfo("#aiGeoSignals", sessionId);
    const interpretation = await readNodeInfo("#aiGeoInterpretation", sessionId);
    if (
      results?.text
      && signals?.text
      && interpretation?.text
      && /Clasificacion dominante|Confianza IA|Hotspots de cambio/i.test(results.text)
      && /Hallazgo IA|Alerta|Cambio/i.test(signals.text)
      && /Interpretacion:|Conclusion:|Recomendacion:/i.test(interpretation.text)
    ) {
      return { results, signals, interpretation };
    }
    return null;
  }, { timeoutMs: 180000, label: "IA agronomica" });
  await click("#focusAiGeoBtn", sessionId);
  await delay(900);
  const agronomyOverlay = {
    index: await readText("#overlayIndex", sessionId),
    title: await readText("#mapTitle", sessionId),
  };
  const agronomyScreenshotPath = await captureScreenshot("smoke-ai-geo-agronomia", sessionId);

  await navigate(`${baseUrl}/?route=planificacion`, sessionId);
  await waitForRoute("planificacion", sessionId);
  await ensurePlanningResults(sessionId);
  await click("#runAiGeoBtn", sessionId);
  const territorialAi = await waitFor(async () => {
    const results = await readNodeInfo("#aiGeoResults", sessionId);
    const signals = await readNodeInfo("#aiGeoSignals", sessionId);
    const interpretation = await readNodeInfo("#aiGeoInterpretation", sessionId);
    const statusBar = await readText("#statusBar", sessionId);
    if (
      results?.text
      && signals?.text
      && interpretation?.text
      && /Clase dominante IA|Confianza IA|Verificacion 3D/i.test(results.text)
      && /3D|Cambio|Alerta/i.test(signals.text)
      && /Interpretacion:|Conclusion:|Recomendacion:/i.test(interpretation.text)
      && /IA territorial lista|IA territorial/i.test(statusBar || "")
    ) {
      return { results, signals, interpretation, statusBar };
    }
    return null;
  }, { timeoutMs: 180000, label: "IA territorial" });
  await click("#focusAiGeoBtn", sessionId);
  await delay(1100);
  const territorialOverlay = {
    index: await readText("#overlayIndex", sessionId),
    title: await readText("#mapTitle", sessionId),
  };
  const territorialScreenshotPath = await captureScreenshot("smoke-ai-geo-territorial", sessionId);

  return {
    scenario: "inteligencia-geo",
    ok: true,
    agronomy: {
      overlayIndex: agronomyOverlay.index,
      mapTitle: agronomyOverlay.title,
      resultsSample: agronomyAi.results.text.slice(0, 320),
      signalsSample: agronomyAi.signals.text.slice(0, 320),
      screenshotPath: agronomyScreenshotPath,
    },
    territorial: {
      overlayIndex: territorialOverlay.index,
      mapTitle: territorialOverlay.title,
      statusBar: territorialAi.statusBar,
      resultsSample: territorialAi.results.text.slice(0, 320),
      signalsSample: territorialAi.signals.text.slice(0, 320),
      screenshotPath: territorialScreenshotPath,
    },
  };
}

async function ensurePlanningResults(sessionId) {
  await click("#runPlanningBtn", sessionId);
  return waitFor(async () => {
    const candidates = await readNodeInfo("#planningCandidates", sessionId);
    const metrics = await readNodeInfo("#planningResults", sessionId);
    if (
      candidates?.text
      && metrics?.text
      && /Candidato 1|Ver en mapa/i.test(candidates.text)
      && /Suelo clase A|Indice multicriterio/i.test(metrics.text)
    ) {
      return { candidates, metrics };
    }
    return null;
  }, { label: "resultados de aptitud territorial" });
}

async function runPlanningFodaScenario(sessionId) {
  await navigate(`${baseUrl}/?route=planificacion`, sessionId);
  await waitForRoute("planificacion", sessionId);
  const planning = await ensurePlanningResults(sessionId);
  await click("#runFodaCameBtn", sessionId);
  const foda = await waitFor(async () => {
    const results = await readNodeInfo("#fodaCameResults", sessionId);
    const swot = await readNodeInfo("#fodaCameSwot", sessionId);
    const strategies = await readNodeInfo("#fodaCameStrategies", sessionId);
    const statusBar = await readText("#statusBar", sessionId);
    if (
      results?.text
      && swot?.text
      && strategies?.text
      && /Analisis FODA \+ CAME listo/i.test(statusBar || "")
    ) {
      return { results, swot, strategies, statusBar };
    }
    return null;
  }, { label: "salida FODA + CAME" });
  await click("#focusFodaCameBtn", sessionId);
  await delay(1200);
  const focused = {
    overlayIndex: await readText("#overlayIndex", sessionId),
    mapTitle: await readText("#mapTitle", sessionId),
  };
  const screenshotPath = await captureScreenshot("smoke-planificacion-foda", sessionId);
  return {
    scenario: "planificacion-foda",
    ok: true,
    planningSample: planning.candidates.text.slice(0, 400),
    mapTitle: focused.mapTitle,
    overlayIndex: focused.overlayIndex,
    statusBar: foda.statusBar,
    swotSample: foda.swot.text.slice(0, 400),
    strategiesSample: foda.strategies.text.slice(0, 400),
    screenshotPath,
  };
}

async function runEvidenceScenario(sessionId) {
  await navigate(`${baseUrl}/?route=evidencia`, sessionId);
  await waitForRoute("evidencia", sessionId);
  await click("#runFieldEvidenceBtn", sessionId);
  const evidence = await waitFor(async () => {
    const results = await readNodeInfo("#fieldEvidenceResults", sessionId);
    const sectors = await readNodeInfo("#fieldEvidenceSectors", sessionId);
    const stations = await readNodeInfo("#fieldEvidenceStations", sessionId);
    if (
      results?.text
      && sectors?.text
      && stations?.text
      && /Soporte de evidencia|Sectores de campo|Estaciones FONAG/i.test(results.text)
      && !/Aqui apareceran/i.test(sectors.text)
      && !/Aqui apareceran/i.test(stations.text)
    ) {
      return { results, sectors, stations };
    }
    return null;
  }, { label: "evidencia territorial" });
  const screenshotPath = await captureScreenshot("smoke-evidencia-territorial", sessionId);
  return {
    scenario: "evidencia-territorial",
    ok: true,
    resultsSample: evidence.results.text.slice(0, 400),
    sectorsSample: evidence.sectors.text.slice(0, 400),
    stationsSample: evidence.stations.text.slice(0, 400),
    screenshotPath,
  };
}

async function runPlanning3dScenario(sessionId) {
  await navigate(`${baseUrl}/?route=planificacion`, sessionId);
  await waitForRoute("planificacion", sessionId);
  await ensurePlanningResults(sessionId);
  const consoleStartIndex = consoleMessages.length;
  await click("#openPlanning3dBtn", sessionId);
  const viewer = await waitFor(async () => {
    const modal = await readNodeInfo("#planning3dModal", sessionId);
    const availability = await readNodeInfo("#planning3dAvailability", sessionId);
    const status = await readNodeInfo("#planning3dStatus", sessionId);
    const summary = await readNodeInfo("#planning3dSummary", sessionId);
    const hasCanvas = await evaluate(`
      (() => Boolean(
        document.querySelector("#planning3dMap canvas")
        || document.querySelector("#planning3dMap .maplibregl-canvas")
      ))()
    `, sessionId).catch(() => false);
    if (
      modal && !modal.hidden && modal.ariaHidden === "false"
      && availability?.text
      && summary?.text
      && hasCanvas
      && /Construcciones|Catastro|Base 3D/i.test(availability.text)
      && /Construcciones/i.test(summary.text)
      && /Pisos medios/i.test(summary.text)
      && /Altura media/i.test(summary.text)
      && !/Aqui veras el estado de carga/i.test(summary.text)
      && !/Cargando visor 3D/i.test(summary.text)
    ) {
      return { modal, availability, status, summary, hasCanvas };
    }
    return null;
  }, { timeoutMs: 180000, label: "visor 3D disponible" });

  await click("#planning3dOrthographicBtn", sessionId);
  await click("#planning3dParcelsToggle", sessionId);
  await click("#planning3dShadowsToggle", sessionId);
  const toggles = await waitFor(async () => {
    const ortho = await readNodeInfo("#planning3dOrthographicBtn", sessionId);
    const parcels = await readNodeInfo("#planning3dParcelsToggle", sessionId);
    const shadows = await readNodeInfo("#planning3dShadowsToggle", sessionId);
    return String(ortho?.className || "").includes("active") && parcels?.checked && shadows?.checked
      ? { ortho, parcels, shadows }
      : null;
  }, { label: "controles del visor 3D" });

  const visuals = await waitFor(async () => {
    const snapshot = await evaluate(`
      (() => {
        const mapRoot = document.querySelector("#planning3dMap");
        const canvas = mapRoot?.querySelector(".maplibregl-canvas");
        const summaryText = (document.querySelector("#planning3dSummary")?.textContent || "").trim();
        const svgCount = mapRoot?.querySelectorAll(".planning-3d-svg-building")?.length || 0;
        const markerCount = Array.from(mapRoot?.querySelectorAll(".planning-3d-block-marker") || [])
          .filter((node) => getComputedStyle(node).display !== "none").length;
        return {
          canvasWidth: canvas?.width || canvas?.clientWidth || 0,
          canvasHeight: canvas?.height || canvas?.clientHeight || 0,
          svgCount,
          markerCount,
          renderVisible: /Render\\s*Visible/i.test(summaryText),
        };
      })()
    `, sessionId).catch(() => null);
    if (
      snapshot
      && snapshot.canvasWidth > 0
      && snapshot.canvasHeight > 0
      && (snapshot.svgCount > 0 || snapshot.markerCount > 0 || snapshot.renderVisible)
    ) {
      return snapshot;
    }
    return null;
  }, { timeoutMs: 180000, label: "escena 3D visible" });

  await delay(900);

  const newConsoleMessages = consoleMessages
    .slice(consoleStartIndex)
    .filter((entry) => /sky-type|sky-gradient|actualizar la luz solar del visor 3D/i.test(entry.text || ""));
  if (newConsoleMessages.length) {
    throw new Error(`El visor 3D sigue generando errores de consola: ${newConsoleMessages.map((entry) => entry.text).join(" | ")}`);
  }

  const screenshotPath = await captureScreenshot("smoke-planificacion-3d", sessionId);
  await click("#planning3dCloseBtn", sessionId);

  return {
    scenario: "planificacion-3d",
    ok: true,
    status: viewer.status?.text || "",
    availabilitySample: viewer.availability.text.slice(0, 350),
    summarySample: viewer.summary.text.slice(0, 350),
    consoleMessages: consoleMessages.slice(consoleStartIndex),
    toggles: {
      orthographic: String(toggles.ortho.className || "").includes("active"),
      parcels: toggles.parcels.checked,
      shadows: toggles.shadows.checked,
    },
    visuals,
    screenshotPath,
  };
}

async function connectSession() {
  const target = await getPageTarget();
  ws = new WebSocket(target.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("No abrio el socket CDP.")), 15000);
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    ws.addEventListener("error", (event) => {
      clearTimeout(timer);
      reject(event.error || new Error("Fallo el socket CDP."));
    }, { once: true });
  });

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(String(event.data));
    if (data.id && pending.has(data.id)) {
      const entry = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) {
        entry.reject(new Error(`${entry.method}: ${data.error.message}`));
      } else {
        entry.resolve(data.result);
      }
      return;
    }

    if (data.method === "Runtime.consoleAPICalled") {
      const message = data.params?.args?.map((item) => item.value ?? item.description ?? "").join(" ").trim();
      if (message) {
        consoleMessages.push({
          level: data.params?.type || "log",
          text: message,
        });
      }
    }

    if (data.method === "Runtime.exceptionThrown") {
      consoleMessages.push({
        level: "exception",
        text: formatRuntimeException(data.params?.exceptionDetails),
      });
    }
  });

  const attach = await cdp("Target.attachToTarget", {
    targetId: target.id,
    flatten: true,
  });
  const sessionId = attach.sessionId;
  await cdp("Page.enable", {}, sessionId);
  await cdp("Runtime.enable", {}, sessionId);
  await cdp("Network.enable", {}, sessionId);
  await cdp("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);
  return sessionId;
}

function getScenarioList() {
  if (scenarioArg === "all") {
    return ["agronomia", "inteligencia-geo", "planificacion-foda", "planificacion-3d"];
  }
  return scenarioArg.split(",").map((item) => item.trim()).filter(Boolean);
}

async function main() {
  await ensureDir(outputDir);
  const sessionId = await connectSession();
  const selectedScenarios = getScenarioList();
  const results = [];

  for (const scenario of selectedScenarios) {
    if (scenario === "agronomia") {
      results.push(await runAgronomyScenario(sessionId));
      continue;
    }
    if (scenario === "inteligencia-geo") {
      results.push(await runAiGeoScenario(sessionId));
      continue;
    }
    if (scenario === "planificacion-foda") {
      results.push(await runPlanningFodaScenario(sessionId));
      continue;
    }
    if (scenario === "evidencia-territorial") {
      results.push(await runEvidenceScenario(sessionId));
      continue;
    }
    if (scenario === "planificacion-3d") {
      results.push(await runPlanning3dScenario(sessionId));
      continue;
    }
    throw new Error(`Escenario no soportado: ${scenario}.`);
  }

  const payload = {
    ok: true,
    baseUrl,
    debugPort,
    executedAt: new Date().toISOString(),
    scenarios: results,
    consoleMessages: consoleMessages.slice(-20),
  };

  const targetPath = path.join(outputDir, "smoke-suite-results.json");
  await fs.writeFile(targetPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  ws.close();
}

main().catch(async (error) => {
  const failure = {
    ok: false,
    baseUrl,
    debugPort,
    executedAt: new Date().toISOString(),
    error: error.message,
    consoleMessages,
  };
  try {
    await ensureDir(outputDir);
    await fs.writeFile(path.join(outputDir, "smoke-suite-results.json"), JSON.stringify(failure, null, 2));
  } catch {}
  console.error(JSON.stringify(failure, null, 2));
  try {
    ws?.close();
  } catch {}
  process.exitCode = 1;
});
