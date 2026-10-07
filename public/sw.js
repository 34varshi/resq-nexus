/**
 * ResQ Nexus - Disaster Resilience Service Worker
 * Provides offline endurance for tactical dashboard data, map vector layers,
 * and emergency field outbox syncing in degraded & radio-blackout disaster zones.
 */

const CACHE_SHELL = 'resq-nexus-shell-v2';
const CACHE_MAP = 'resq-nexus-map-cache';
const CACHE_API = 'resq-nexus-api-cache';

// Critical Core Precache Assets for Disaster Continuity
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/map/tactical-basemap.svg',
  '/map/sector4-topo-grid.svg',
  '/map/hyderabad-flood-basin-vectors.json',
  '/map/critical-infrastructure.json',
  '/data/dashboard-critical.json'
];

// Install Event: Precaches core disaster operations shell & map assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => {
      console.info('[ResQ Nexus SW] Pre-caching critical disaster shell & map vectors');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[ResQ Nexus SW] Non-fatal precache warning:', err);
      });
    })
  );
});

// Activate Event: Purge legacy caches and immediately take control of open clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('resq-nexus-') && ![CACHE_SHELL, CACHE_MAP, CACHE_API].includes(name))
          .map((name) => {
            console.info('[ResQ Nexus SW] Purging obsolete cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor: Specialized routing for Maps, Dashboard Data, and Static Shell
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST to external analytics or APIs)
  if (request.method !== 'GET') {
    return;
  }

  // 1. MAP ASSETS ROUTING (Cache-First: Vector basemaps, topo grids, flood GeoJSON)
  if (
    url.pathname.startsWith('/map/') ||
    url.pathname.includes('tactical-basemap') ||
    url.pathname.includes('flood-basin') ||
    url.pathname.includes('critical-infrastructure') ||
    url.pathname.includes('sector4-topo')
  ) {
    event.respondWith(
      caches.open(CACHE_MAP).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Stale-while-revalidate in background if online
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse);
            }
          }).catch(() => {});
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // If offline and not in CACHE_MAP, check CACHE_SHELL
          const fallback = await caches.match(request);
          if (fallback) return fallback;
          return new Response(JSON.stringify({ error: 'Map asset offline fallback unavailable' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }

  // 2. CRITICAL DASHBOARD DATA & APIS (Network-First with Cache Storage Fallback)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/data/') ||
    url.pathname.includes('disaster-snapshot') ||
    url.pathname.includes('dashboard-critical')
  ) {
    event.respondWith(
      caches.open(CACHE_API).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (networkError) {
          // Network failed or offline: serve cached telemetry/snapshot
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Check if shell precache has the critical data snapshot
          const fallbackSnapshot = await caches.match('/data/dashboard-critical.json');
          if (fallbackSnapshot) {
            return fallbackSnapshot;
          }

          // Generate synthetic emergency fallback response
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Operating in disconnected disaster mode. Live server currently unreachable.',
              timestamp: new Date().toISOString()
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'X-ResQ-Offline-Fallback': 'true' }
            }
          );
        }
      })
    );
    return;
  }

  // 3. NAVIGATION REQUESTS (SPA App Shell Navigation Fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedShell = await caches.match('/index.html');
        return cachedShell || caches.match('/');
      })
    );
    return;
  }

  // 4. STATIC ASSETS & VENDOR FONTS (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((networkRes) => {
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          caches.open(CACHE_SHELL).then((cache) => cache.put(request, networkRes.clone()));
        }
        return networkRes;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Communication Channel: Listen for commands from React App
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'PREWARM_MAP_CACHE') {
    console.info('[ResQ Nexus SW] Explicit map pre-warm requested by user');
    caches.open(CACHE_MAP).then(async (cache) => {
      const mapFiles = [
        '/map/tactical-basemap.svg',
        '/map/sector4-topo-grid.svg',
        '/map/hyderabad-flood-basin-vectors.json',
        '/map/critical-infrastructure.json',
        '/data/dashboard-critical.json'
      ];
      await Promise.all(
        mapFiles.map(async (file) => {
          try {
            const res = await fetch(file);
            if (res.ok) await cache.put(file, res);
          } catch (e) {
            console.warn('[ResQ Nexus SW] Prewarm item failed:', file, e);
          }
        })
      );
      if (event.source) {
        event.source.postMessage({ type: 'PREWARM_COMPLETE', timestamp: Date.now() });
      }
    });
  }

  if (event.data.type === 'CHECK_CACHE_DIAGNOSTICS') {
    Promise.all([
      caches.open(CACHE_MAP).then((c) => c.keys()),
      caches.open(CACHE_API).then((c) => c.keys()),
      caches.open(CACHE_SHELL).then((c) => c.keys())
    ]).then(([mapKeys, apiKeys, shellKeys]) => {
      if (event.source) {
        event.source.postMessage({
          type: 'CACHE_DIAGNOSTICS_RESULT',
          mapCount: mapKeys.length,
          apiCount: apiKeys.length,
          shellCount: shellKeys.length
        });
      }
    });
  }
});
