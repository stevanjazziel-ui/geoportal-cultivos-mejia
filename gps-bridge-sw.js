const CACHE_NAME = "geoportal-gps-bridge-v8";
const CACHE_ASSETS = [
  "./gps-bridge.html",
  "./gps-bridge.webmanifest",
  "./gps-bridge-icon.svg",
];

function isBridgeAsset(requestUrl) {
  return [
    "/gps-bridge.html",
    "/gps-bridge.webmanifest",
    "/gps-bridge-icon.svg",
  ].some((path) => requestUrl.pathname.endsWith(path));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.endsWith("/api/agronomy/gps/ingest")) {
    return;
  }

  if (event.request.method !== "GET" || requestUrl.origin !== self.location.origin || !isBridgeAsset(requestUrl)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
