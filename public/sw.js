/**
 * Project Atlas Service Worker
 * Implements strict caching policies per Document 12_PWA_PERFORMANCE.md
 * - Caches versioned static assets & app shell only
 * - NEVER caches wallet balances, transactions, payment intents, admin data, or authoritative game states
 * - Fails safely to offline shell without allowing financial operations offline
 */

const CACHE_NAME = 'atlas-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico'
];

// Explicitly forbidden routes from service worker caching
const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/admin/,
  /\/player\/wallet/,
  /\/player\/deposit/,
  /\/player\/withdrawals/,
  /\/me\/wallets/,
  /\/me\/transactions/,
  /\/game-sessions\//
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Immediately bypass cache for financial, session, admin, or API requests
  const isNeverCache = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
  if (isNeverCache || event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Static shell assets: Cache-first with network fallback
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Navigation requests: Network first, fallback to cached shell / offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/offline.html');
        });
      })
    );
    return;
  }

  // Default network pass-through
  event.respondWith(fetch(event.request));
});
