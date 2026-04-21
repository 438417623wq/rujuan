const CACHE_NAME = 'airp-v11';
const ASSETS = [
  '/',
  '/index.html',
  '/chat.html',
  '/settings.html',
  '/common.js',
  '/assets/bg.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Don't cache API calls or server data
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/data/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Network first for HTML and JS (code updates must be immediate)
      if (e.request.mode === 'navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
        return fetch(e.request).then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return resp;
        }).catch(() => cached);
      }
      // Cache first for static assets (images, icons, etc.)
      return cached || fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return resp;
      });
    })
  );
});
