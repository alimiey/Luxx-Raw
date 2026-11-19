// Service worker Luxx IMS: cache rangka app sahaja. Data stok (Supabase) TIDAK pernah di-cache.
const V = 'luxx-ims-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const swr = r => caches.match(r).then(m => {
  const n = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; }).catch(() => m);
  return m || n;
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (r.mode === 'navigate') {
      // Sentiasa cuba versi terbaru dahulu; guna salinan simpanan hanya bila tiada internet
      e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put('./index.html', c)); return res; })
        .catch(() => caches.match('./index.html')));
      return;
    }
    e.respondWith(swr(r));
  } else if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(swr(r));
  }
  // Selain itu (Supabase, fon) terus ke rangkaian, tanpa cache.
});
