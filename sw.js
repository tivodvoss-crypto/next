// Offline-Speicher für NEXT: legt die App beim ersten Öffnen im Handy ab,
// damit sie danach auch ohne Netz startet. Persönliche Einträge liegen
// davon getrennt im localStorage und werden hier nie angefasst.
// Bei jeder neuen Fassung die Nummer erhöhen, sonst behalten Handys die alte.
const FASSUNG = 'next-v6';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(FASSUNG).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== FASSUNG).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Netz zuerst, damit Änderungen sofort ankommen; ohne Netz aus dem Speicher.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(FASSUNG).then((c) => c.put(e.request, kopie));
        return antwort;
      })
      .catch(() => caches.match(e.request).then((t) => t || caches.match('./index.html')))
  );
});
