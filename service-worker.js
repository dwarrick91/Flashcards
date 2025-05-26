// service-worker.js

const CACHE_NAME = 'arithmetic-fun-cache-v1.2'; // Increment version if you make changes to cached files
const urlsToCache = [
  './', 
  './index.html', 
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700&display=swap',
  // Be cautious about caching external font files themselves directly if they are opaque responses.
  // Caching the CSS request that imports them is generally safer and simpler.
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[ServiceWorker] Failed to cache app shell during install:', error);
      })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('./index.html'); 
            });
        })
    );
  } else if (urlsToCache.includes(event.request.url) || (event.request.destination === 'font' && event.request.url.startsWith('https://fonts.gstatic.com'))) {
    // Cache-first for known assets and Google Font files
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response; 
          }
          return fetch(event.request).then(
            networkResponse => {
              if (networkResponse && networkResponse.ok) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
            }
          ).catch(error => {
            console.error('[ServiceWorker] Fetch failed for asset:', event.request.url, error);
          });
        })
    );
  } else {
    // For other requests, try network first, then cache (if appropriate, or just network)
    // For simplicity, just try network for any other requests not explicitly cached.
    event.respondWith(fetch(event.request).catch(() => { /* Optionally return a generic offline asset */ }));
  }
});