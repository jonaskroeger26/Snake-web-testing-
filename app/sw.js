const CACHE_NAME = 'snake-solana-v4';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './',
        './manifest.json',
        './icons/icon.svg',
        './mwa-bundle.js'
      ]).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  const cacheable = request.mode === 'navigate' ||
    /\.(html|json|svg|js|css)$/.test(request.url) ||
    url.pathname.endsWith('/');
  if (!cacheable) return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      return res;
    }))
  );
});
