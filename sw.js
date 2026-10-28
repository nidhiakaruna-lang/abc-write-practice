/* ABC Write & Practice - offline cache. Everything the app needs is in these files. */
const CACHE = 'abc-write-v3';
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/maskable-512.png", "./css/style1.css", "./css/style2.css", "./css/style3.css", "./js/app1.js", "./js/app2.js", "./js/app3.js", "./js/app4.js", "./js/app5.js", "./js/app6.js", "./js/app7.js", "./js/app8.js", "./js/app9.js"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res;
    }).catch(() => caches.match('./index.html')))
  );
});
