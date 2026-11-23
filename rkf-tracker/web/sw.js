// Service Worker for CoursingStats • RKF Tracker PWA
const CACHE_NAME = 'cs-rkf-tracker-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './shell.css',
  './dashboard.css',
  './cards.css',
  './timeline.css',
  './modal.css',
  './approvals.css',
  './app.js',
  './render.js',
  './formatters.js',
  './mockData.js',
  './rkf-competitions-2026.json',
  './approvals.js',
  './pwa.js',
  './brand/logo.svg',
  './brand/logo-badge.svg',
  './brand/logo.webp',
  './brand/logo-mobile.webp',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass cache for RKF API calls and live data requests
  if (url.pathname.startsWith('/api/rkf/')) {
    return;
  }

  // Network first for HTML navigation, cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Cache first for static resources
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
