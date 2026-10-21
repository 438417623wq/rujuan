const CACHE_NAME = 'airp-v7';
const ASSETS = [
  '/',
  '/index.html',
  '/chat.html',
  '/settings.html',
  '/common.js',
  '/agnes.js',
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
  // 跨域请求（AI 接口等）直接放行，不经过 SW：resp.clone() 做缓存写入会把流式响应的
  // 底层字节流分叉，导致早到的小 chunk（比如 SSE 的 ping 心跳）被攒住不及时交给页面，
  // 长时间静默期间页面误以为真的一个字节都没收到，触发客户端的 idle timeout 误判。
  if (url.origin !== self.location.origin) return;
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
