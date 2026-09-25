// Service worker. It keeps the page and the libraries in a cache, so the app works offline.
// Change VERSION when the library URLs change. The old cache is then deleted.
const VERSION = 'v1';
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.6.1/papaparse.min.js',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/sql-wasm.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/sql-wasm.wasm',
];
const PAGE = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll([...PAGE, ...LIBS.map(u => new Request(u, { mode: 'cors' }))])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.pathname === '/proxy') return;   // Data from links is never cached.
  if (url.origin !== location.origin) {
    // Library URLs include the version, so they do not change. Use the cache first.
    if (LIBS.includes(req.url)) e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  // Get the page from the network first, so a new deploy shows at once. Use the cache when offline.
  e.respondWith(fetch(req).then(res => {
    if (res.ok && req.mode === 'navigate') { const copy = res.clone(); caches.open(VERSION).then(c => c.put('/', copy)); }
    return res;
  }).catch(() => caches.match(req.mode === 'navigate' ? '/' : req, { ignoreSearch: true }).then(r => r || Response.error())));
});
