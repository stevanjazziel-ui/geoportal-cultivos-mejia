self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("geotrack-sender-v1").then((cache) => cache.addAll([
      "./sender.html",
      "./styles.css",
      "./icon.svg",
      "./sender.webmanifest"
    ]))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
