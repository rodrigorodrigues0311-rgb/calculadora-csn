// ══════════════════════════════════════════════
//  CSN AUTOMAÇÃO — Service Worker
//  App: Ferramentas de Automação Industrial
//  Scope: /csn-automacao/
//  Cache ID: CSN-AUTOMACAO-v1  ← ÚNICO, nunca igual ao Simulado
// ══════════════════════════════════════════════
const APP_ID  = 'CSN-AUTOMACAO';
const CACHE   = 'CSN-AUTOMACAO-v1';
const FILES   = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── Instala e limpa caches de OUTROS apps ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// ── Ativa: apaga SOMENTE caches antigos DESTE app ──
// Não apaga caches de outros apps (ex: Simulado Escolar)
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // Apaga apenas caches que começam com CSN-AUTOMACAO (versões antigas)
    // e caches genéricos antigos que causavam conflito
    const toDelete = keys.filter(k =>
      k !== CACHE && (
        k.startsWith('CSN-AUTOMACAO') ||
        k.startsWith('clp-csn') ||
        k.startsWith('csn-v')
      )
    );
    await Promise.all(toDelete.map(k => {
      console.log('[CSN-AUTOMACAO SW] Removendo cache antigo:', k);
      return caches.delete(k);
    }));
    await self.clients.claim();
  })())
});

// ── Network First: sempre busca da rede, cache como fallback ──
self.addEventListener('fetch', e => {
  // Só intercepta requests do mesmo escopo deste SW
  if (!e.request.url.includes(self.registration.scope)) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(response => {
        // Atualiza cache com versão nova
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Responde a mensagem de skip waiting ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
