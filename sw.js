const CACHE_NAME = 'hassad-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.svg',
  './css/style.css',
  './css/app.css',
  './css/modern.css',
  './js/core.js',
  './js/firebase.js',
  './js/partners.js',
  './js/lands.js',
  './js/seasons.js',
  './js/crops.js',
  './js/cattle.js',
  './js/milk.js',
  './js/repro.js',
  './js/calves.js',
  './js/health.js',
  './js/expenses.js',
  './js/harvest.js',
  './js/inventory.js',
  './js/accounting.js',
  './js/finance.js',
  './js/charts.js',
  './js/app.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Try network first, then cache, for data freshness
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // If successful, clone and update cache
        if(res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return res;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
