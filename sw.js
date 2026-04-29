// CSN Automação - Service Worker Network-First
const CACHE = 'clp-csn-v4';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// NETWORK FIRST: sempre tenta buscar da rede primeiro
// Só usa cache se estiver offline
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Salva cópia fresca no cache
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // Sem rede: usa cache (modo offline)
        return caches.match(e.request);
      })
  );
});
