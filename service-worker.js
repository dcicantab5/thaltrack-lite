// Service worker for ThalTrack Lite
const CACHE_NAME = 'thaltrack-lite-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/search.html',
  '/detail.html',
  '/qrcode.html',
  '/css/style.css',
  '/css/bootstrap.min.css',
  '/js/app.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/search.js',
  '/js/detail.js',
  '/js/qrcode.js',
  '/js/bootstrap.bundle.min.js',
  '/img/logo.png',
  '/img/icon-72x72.png',
  '/img/icon-96x96.png',
  '/img/icon-128x128.png',
  '/img/icon-144x144.png',
  '/img/icon-152x152.png',
  '/img/icon-192x192.png',
  '/img/icon-384x384.png',
  '/img/icon-512x512.png',
  '/manifest.json',
  'https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js'
];

// Fix: Adjust paths for GitHub Pages hosting
function adjustGitHubPagesPath(item) {
  const repoName = 'thaltrack-lite'; // replace with your actual repo name
  if (location.hostname.includes('github.io') && item.startsWith('/')) {
    return `/${repoName}${item}`;
  }
  return item;
}

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell');
        // Fix: Adjust paths for GitHub Pages
        const adjustedAssets = ASSETS.map(item => adjustGitHubPagesPath(item));
        return cache.addAll(adjustedAssets);
      })
      .catch(error => {
        console.error('Caching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, then network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests like Google API
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.startsWith('https://unpkg.com')) {
    
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(response => {
          // Don't cache API responses or dynamic content
          if (!response || response.status !== 200 || response.type !== 'basic' ||
              event.request.url.includes('script.google.com')) {
            return response;
          }
          
          // Clone the response so we can return one and cache the other
          let responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        }).catch(error => {
          console.log('Fetch failed:', error);
          // Can return a custom offline page here
        });
      })
    );
  } else {
    // Pass through for non-cached resources
    event.respondWith(fetch(event.request));
  }
});
