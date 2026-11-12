// Guarda en el celular solo los archivos de la app (no los datos), para que abra rápido.
// Los datos siempre se piden a internet. Al publicar una versión nueva, cambia VERSION.
const VERSION = 'v2';
const CACHE = 'obra-misional-' + VERSION;
const ARCHIVOS = ['./', 'index.html', 'app.css', 'app.js', 'config.js', 'vendor/supabase.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // datos y fuentes: directo a internet
  // Primero internet (para recibir versiones nuevas); si no hay conexión, la copia guardada.
  e.respondWith(
    fetch(e.request).then(r => {
      const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
