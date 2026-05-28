const CACHE_NAME = 'physlab-cache-v3';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/icons.svg'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and core assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Cache First, falling back to Network)
self.addEventListener('fetch', (e) => {
  // Only handle HTTP/HTTPS protocols (avoid chrome-extension issues)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response instantly
        return cachedResponse;
      }

      // Fallback to network, and dynamically cache successfully fetched scripts/assets
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache newly fetched lazy JavaScript chunks & styles
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          const url = e.request.url;
          // Cache js chunks, css, and images
          if (url.includes('.js') || url.includes('.css') || url.includes('/assets/')) {
            cache.put(e.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (e.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
