/* OnixGSM service worker — network-first for pages (offline fallback),
   stale-while-revalidate for static assets. Safe: never serves stale HTML. */
/* Bump VER la fiecare deploy care schimba CSS/JS: `activate` sterge cache-urile
   cu alt nume, deci vizitatorii vechi nu raman cu stiluri invechite.
   CSS-ul si JS-ul au si `?v=<hash>` in HTML (vezi .tools/build-versions.js),
   asa ca aici precacheam doar ce e nevoie ca sa mearga offline. */
const VER = 'onix-b974af61';
const CORE = ['offline.html', 'assets/img/logo-onix.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // don't touch maps/whatsapp/etc.

  // Pages: network-first, fall back to cache, then offline.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(req, cp)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match('offline.html')))
    );
    return;
  }
  // Static assets: stale-while-revalidate
  if (/\.(css|js|woff2?|ttf|jpg|jpeg|png|webp|avif|svg|ico)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(cached => {
        const net = fetch(req).then(res => { const cp = res.clone(); caches.open(VER).then(c => c.put(req, cp)); return res; }).catch(() => cached);
        return cached || net;
      })
    );
  }
});
