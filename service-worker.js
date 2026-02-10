const VERSION = "v1.0.5"; // 🔥 CAMBIA QUESTA STRINGA AD OGNI MODIFICA
const CACHE_NAME = `buoni-pasto-cache-${VERSION}`;

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "icon.png"
];

// Install: carica file ignorando la cache HTTP del CDN
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      FILES_TO_CACHE.map(url =>
        fetch(new Request(url, { cache: 'reload' })) // bypass HTTP cache
          .then(resp => cache.put(url, resp))
      )
    );
  })());
  self.skipWaiting(); // attiva subito il nuovo SW
});

// Activate: elimina cache vecchie e avvisa i client
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))
    );

    // Avvisa tutte le pagine controllate
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: "NEW_VERSION" });
    });
  })());
  self.clients.claim(); // prendi subito il controllo delle pagine
});

// Fetch: cache-first semplice
self.addEventListener("fetch", (event) => {
  // Per navigazioni, serviamo l'index dalla cache se possibile
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match("index.html");
      if (cached) return cached;
      return fetch(event.request);
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
