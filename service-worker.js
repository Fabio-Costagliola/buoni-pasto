const VERSION = "v1.0.0";   // 🔥 CAMBIALA OGNI VOLTA CHE MODIFICHI IL CODICE

const CACHE_NAME = `buoni-pasto-cache-${VERSION}`;

const FILES_TO_CACHE = [
    "index.html",
    "manifest.json",
    "icon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting(); // forza attivazione immediata
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keyList =>
            Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key); // elimina cache vecchie
                    }
                })
        )
    );
    self.clients.claim(); // aggiorna subito le pagine aperte
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
