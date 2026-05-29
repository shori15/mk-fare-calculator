const CACHE_NAME = 'mk-fare-v3';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './wrong.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // index.html と app.enc は常にネットワーク優先（最新を取得）
  if (url.includes('index.html') || url.includes('app.enc') || url.endsWith('/') || url.endsWith('/mk-fare-calculator')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // その他はキャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
