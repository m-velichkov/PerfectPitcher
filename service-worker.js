// Define the cache name and the list of files to cache
const CACHE_NAME = 'perfect-pitcher-v1';
const urlsToCache = [
    // HTML files
    '/identify-notes.html',
    '/explore-notes.html',
    
    // CSS files
    '/styles.css',
    
    // JavaScript files
    '/identify-notes.js',
    '/explore-notes.js',
    
    // SVG images
    '/assets/images/check.svg',
    '/assets/images/hamburger.svg',
    '/assets/images/logo.svg',
    '/assets/images/play.svg',
    '/assets/images/random.svg',
    '/assets/images/repeat.svg',
    '/assets/images/settings.svg',
    '/assets/images/user.svg',
  
    // Audio files
    '/audio/A2.wav',
    '/audio/A3.wav',
    '/audio/A4.wav',
    '/audio/A5.wav',
    '/audio/A6.wav',
    '/audio/ASharp2.wav',
    '/audio/ASharp3.wav',
    '/audio/ASharp4.wav',
    '/audio/ASharp5.wav',
    '/audio/ASharp6.wav',
    '/audio/B2.wav',
    '/audio/B3.wav',
    '/audio/B4.wav',
    '/audio/B5.wav',
    '/audio/B6.wav',
    '/audio/C2.wav',
    '/audio/C3.wav',
    '/audio/C4.wav',
    '/audio/C5.wav',
    '/audio/C6.wav',
    '/audio/CSharp2.wav',
    '/audio/CSharp3.wav',
    '/audio/CSharp4.wav',
    '/audio/CSharp5.wav',
    '/audio/CSharp6.wav',
    '/audio/D2.wav',
    '/audio/D3.wav',
    '/audio/D4.wav',
    '/audio/D5.wav',
    '/audio/D6.wav',
    '/audio/DSharp2.wav',
    '/audio/DSharp3.wav',
    '/audio/DSharp4.wav',
    '/audio/DSharp5.wav',
    '/audio/DSharp6.wav',
    '/audio/E2.wav',
    '/audio/E3.wav',
    '/audio/E4.wav',
    '/audio/E5.wav',
    '/audio/E6.wav',
    '/audio/F2.wav',
    '/audio/F3.wav',
    '/audio/F4.wav',
    '/audio/F5.wav',
    '/audio/F6.wav',
    '/audio/FSharp2.wav',
    '/audio/FSharp3.wav',
    '/audio/FSharp4.wav',
    '/audio/FSharp5.wav',
    '/audio/FSharp6.wav',
    '/audio/G2.wav',
    '/audio/G3.wav',
    '/audio/G4.wav',
    '/audio/G5.wav',
    '/audio/G6.wav',
    '/audio/GSharp2.wav',
    '/audio/GSharp3.wav',
    '/audio/GSharp4.wav',
    '/audio/GSharp5.wav',
    '/audio/GSharp6.wav'
  ];

// Install event: caching the app shell (HTML, CSS, JS, icons)
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event: clean up old caches if there are any
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve cached files when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return the cached version if available, else fetch from the network
        return response || fetch(event.request);
      })
  );
});
