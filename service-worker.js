const VERSION = "v1.0.1";  // 🔥 CAMBIALA AD OGNI AGGIORNAMENTO
const CACHE_NAME = `buoni-pasto-cache-${VERSION}`;

const FILES_TO_CACHE = [
    "index.html",
    "manifest.json",
    "icon.png"
];

// Installazione: crea nuova cache
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting(); // attiva immediatamente
});

// Attivazione: elimina vecchie cache e avvisa i client
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    // Avvisa le pagine aperte che è disponibile una nuova versione
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: "NEW_VERSION" });
        });
    });

    self.clients.claim(); // controlla subito le pagine
});

// Risposte alle richieste
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
