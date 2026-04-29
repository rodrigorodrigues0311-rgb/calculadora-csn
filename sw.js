// CSN Automação v3 - Service Worker
// Altere o número da versão abaixo para forçar atualização do cache
const CACHE_VERSION = 'clp-csn-v3';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instala e faz cache dos arquivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(FILES))
  );
  // Força ativação imediata sem esperar fechar abas
  self.skipWaiting();
});

// Remove caches antigos automaticamente
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log('[SW] Removendo cache antigo:', k);
            return caches.delete(k);
          })
      )
    )
  );
  // Assume controle imediato de todas as abas
  self.clients.claim();
});

// Serve do cache, busca na rede se não encontrar
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Atualiza o cache com a resposta nova
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
