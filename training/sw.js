// Offline-Speicher für Schritt für Schritt: legt die App-Datei beim ersten Öffnen im Handy ab,
// damit sie ohne Netz startet. Aufgaben und Daten kommen vom Server, nicht aus diesem Speicher.
// Bei jeder neuen Fassung die Nummer erhöhen, sonst behalten Handys die alte.
const FASSUNG = 'training-v3';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(FASSUNG).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

// Nur eigene Speicher mit dem Präfix 'training-' aufräumen, nie fremde.
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => n.startsWith('training-') && n !== FASSUNG).map((n) => caches.delete(n))))
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
