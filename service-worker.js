// 🔥 CAMBIA LA VERSIONE OGNI VOLTA CHE FAI UNA MODIFICA
const VERSION = "v1.0.12";

const CACHE_NAME = `buoni-pasto-cache-${VERSION}`;

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "icon.png"
];

// INSTALLATION — Cache dei file con bypass della cache HTTP
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    await Promise.all(
      FILES_TO_CACHE.map(async (url) => {
        const response = await fetch(url, { cache: "reload" });
        await cache.put(url, response.clone());
      })
    );
  })());

  // Attiva subito il nuovo service worker
  self.skipWaiting();
});

// ACTIVATE — elimina cache vecchie e notifica versione nuova
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    // Elimina tutte le cache vecchie
    await Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    );

    // Notifica a tutte le pagine che è disponibile una nuova versione
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => {
      client.postMessage({ type: "NEW_VERSION" });
    });
  })());

  // Prende immediatamente il controllo delle pagine
  self.clients.claim();
});

// FETCH — strategia: cache first + fallback a rete
self.addEventListener("fetch", (event) => {
  // Per navigazione usa index.html dalla cache
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match("index.html");
      return cached || fetch(event.request);
    })());
    return;
  }

  // Per gli altri file: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});





