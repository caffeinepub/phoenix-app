const CACHE_NAME = 'phonex-v3';
const OFFLINE_URL = '/';
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Pre-cache core assets one by one so a single failure doesn't break all
      for (const url of STATIC_ASSETS) {
        try {
          await cache.add(url);
        } catch (e) {
          // Ignore individual fetch failures during install
        }
      }
    })()
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http(s) requests (chrome-extension, data:, etc.)
  if (!url.protocol.startsWith('http')) return;

  // For API/ICP calls: network-first, no cache fallback needed
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('icp') ||
    url.hostname.includes('ic0.app')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For navigation requests: network-first, fall back to cached '/'
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (e) {
          const cached = await caches.match(OFFLINE_URL);
          if (cached) return cached;
          return new Response('Phonex is offline. Please check your connection.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
    return;
  }

  // For all other requests: cache-first, then network
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.ok && networkResponse.status !== 206) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (e) {
        // Return a fallback for images
        if (event.request.destination === 'image') {
          return new Response('', { status: 404, statusText: 'Not Found' });
        }
        // Return offline page for documents
        const offlinePage = await caches.match(OFFLINE_URL);
        if (offlinePage) return offlinePage;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'phonex-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'BACKGROUND_SYNC', tag: event.tag })
        );
      })
    );
  }
});

// ── Periodic Background Sync ──────────────────────────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'phonex-periodic') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'PERIODIC_SYNC', tag: event.tag })
        );
      })
    );
  }
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Phonex';
    const options = {
      body: data.body || 'You have a new notification.',
      icon: '/assets/generated/phonex-icon-192.dim_192x192.png',
      badge: '/assets/generated/phonex-icon-192.dim_192x192.png',
      data: data.url || '/'
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // Silently handle malformed push payloads
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
