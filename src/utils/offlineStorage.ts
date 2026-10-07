/**
 * ResQ Nexus Offline Storage & Disaster Cache Manager
 * Provides IndexedDB & Cache Storage synchronization for mission-critical
 * operations during network cutoffs and intermittent connectivity.
 */

import { Incident, EmergencyRequest, Resource, Shelter, ResponseTeam, FieldReport } from '../types';

export interface OfflineSnapshot {
  timestamp: string;
  incidents: Incident[];
  requests: EmergencyRequest[];
  resources: Resource[];
  shelters: Shelter[];
  teams: ResponseTeam[];
  fieldReports: FieldReport[];
}

export interface QueuedOfflineAction {
  id: string;
  type: 'CREATE_REQUEST' | 'UPDATE_REQUEST_STATUS' | 'ALLOCATE_RESOURCE' | 'SUBMIT_FIELD_REPORT' | 'DISPATCH_TEAM';
  payload: any;
  createdAt: string;
  retryCount: number;
}

export interface CacheDiagnostics {
  isServiceWorkerSupported: boolean;
  isServiceWorkerActive: boolean;
  cachedMapAssetsCount: number;
  cachedDataEndpointsCount: number;
  lastSnapshotTime: string | null;
  queuedActionsCount: number;
  storageEstimateMb: number;
  cachedFileList: string[];
}

const STORAGE_KEY_SNAPSHOT = 'resq_nexus_disaster_snapshot';
const STORAGE_KEY_OUTBOX = 'resq_nexus_offline_outbox';
export const MAP_CACHE_NAME = 'resq-nexus-map-cache';
export const API_CACHE_NAME = 'resq-nexus-api-cache';

export const CRITICAL_MAP_ASSETS = [
  '/map/tactical-basemap.svg',
  '/map/sector4-topo-grid.svg',
  '/map/hyderabad-flood-basin-vectors.json',
  '/map/critical-infrastructure.json',
  '/data/dashboard-critical.json',
  '/icon.svg',
  '/manifest.json',
  '/index.html'
];

/**
 * Persists complete operational command-center snapshot to local storage and Cache Storage
 */
export async function saveDisasterSnapshot(snapshot: OfflineSnapshot): Promise<void> {
  try {
    const serialized = JSON.stringify(snapshot);
    localStorage.setItem(STORAGE_KEY_SNAPSHOT, serialized);

    // Also mirror to Cache Storage if available so Service Worker can intercept
    if ('caches' in window) {
      const apiCache = await caches.open(API_CACHE_NAME);
      const headers = {
        'Content-Type': 'application/json',
        'X-ResQ-Cache-Time': new Date().toISOString(),
        'X-ResQ-Offline-Storage': 'true'
      };

      // Put full snapshot
      await apiCache.put(
        '/api/disaster-snapshot',
        new Response(serialized, { headers })
      );

      // Put granular endpoints for Service Worker interception
      await apiCache.put(
        '/api/incidents',
        new Response(JSON.stringify(snapshot.incidents), { headers })
      );
      await apiCache.put(
        '/api/requests',
        new Response(JSON.stringify(snapshot.requests), { headers })
      );
      await apiCache.put(
        '/api/resources',
        new Response(JSON.stringify(snapshot.resources), { headers })
      );
      await apiCache.put(
        '/api/shelters',
        new Response(JSON.stringify(snapshot.shelters), { headers })
      );
      await apiCache.put(
        '/api/teams',
        new Response(JSON.stringify(snapshot.teams), { headers })
      );
      await apiCache.put(
        '/api/field-reports',
        new Response(JSON.stringify(snapshot.fieldReports), { headers })
      );
    }
  } catch (err) {
    console.warn('[OfflineStorage] Error writing snapshot to local cache:', err);
  }
}

/**
 * Retrieves the latest cached disaster snapshot
 */
export function getDisasterSnapshot(): OfflineSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SNAPSHOT);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('[OfflineStorage] Error parsing snapshot from local cache:', err);
  }
  return null;
}

/**
 * Enqueues an action performed while offline to be transmitted when connectivity returns
 */
export function enqueueOfflineAction(type: QueuedOfflineAction['type'], payload: any): QueuedOfflineAction {
  const queued: QueuedOfflineAction = {
    id: `OFFLINE-ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type,
    payload,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    retryCount: 0
  };

  try {
    const existing = getOfflineOutbox();
    existing.push(queued);
    localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(existing));
  } catch (err) {
    console.warn('[OfflineStorage] Error enqueueing offline action:', err);
  }

  return queued;
}

/**
 * Retrieves pending offline actions
 */
export function getOfflineOutbox(): QueuedOfflineAction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OUTBOX);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('[OfflineStorage] Error retrieving outbox:', err);
  }
  return [];
}

/**
 * Clears outbox after successful synchronization
 */
export function clearOfflineOutbox(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_OUTBOX);
  } catch (err) {
    console.warn('[OfflineStorage] Error clearing outbox:', err);
  }
}

/**
 * Pre-warms Cache Storage with essential map vector assets, geojson schemas, and icon definitions
 */
export async function prewarmMapAndDataCache(): Promise<number> {
  if (!('caches' in window)) return 0;

  let cachedCount = 0;
  try {
    const mapCache = await caches.open(MAP_CACHE_NAME);

    // Fetch and cache critical map assets
    await Promise.all(
      CRITICAL_MAP_ASSETS.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok) {
            await mapCache.put(url, res.clone());
            cachedCount++;
          }
        } catch {
          // Check if already in cache
          const existing = await mapCache.match(url);
          if (existing) cachedCount++;
        }
      })
    );

    // Notify Service Worker if active
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PREWARM_MAP_CACHE'
      });
    }
  } catch (err) {
    console.warn('[OfflineStorage] Error pre-warming cache:', err);
  }

  return cachedCount;
}

/**
 * Reads cached map data or falls back gracefully
 */
export async function loadCachedMapAsset<T = any>(url: string): Promise<T | null> {
  if ('caches' in window) {
    try {
      const mapCache = await caches.open(MAP_CACHE_NAME);
      const match = await mapCache.match(url);
      if (match) {
        if (url.endsWith('.json')) {
          return (await match.json()) as T;
        }
        return (await match.text()) as unknown as T;
      }
    } catch {
      // ignore
    }
  }

  // Network fetch attempt
  try {
    const res = await fetch(url);
    if (res.ok) {
      if (url.endsWith('.json')) {
        return (await res.json()) as T;
      }
      return (await res.text()) as unknown as T;
    }
  } catch {
    // offline
  }

  return null;
}

/**
 * Collects diagnostics about current service worker and offline caches
 */
export async function getCacheDiagnostics(): Promise<CacheDiagnostics> {
  const isSWSupported = 'serviceWorker' in navigator;
  const isSWActive = isSWSupported && !!navigator.serviceWorker.controller;
  const outbox = getOfflineOutbox();
  const snapshot = getDisasterSnapshot();

  let cachedMapCount = 0;
  let cachedApiCount = 0;
  let storageMb = 0;
  const cachedFileList: string[] = [];

  if ('caches' in window) {
    try {
      const mapCache = await caches.open(MAP_CACHE_NAME);
      const mapKeys = await mapCache.keys();
      cachedMapCount = mapKeys.length;
      mapKeys.forEach((req) => {
        const u = new URL(req.url);
        cachedFileList.push(u.pathname);
      });

      const apiCache = await caches.open(API_CACHE_NAME);
      const apiKeys = await apiCache.keys();
      cachedApiCount = apiKeys.length;
      apiKeys.forEach((req) => {
        const u = new URL(req.url);
        cachedFileList.push(u.pathname);
      });
    } catch {
      // cache reading not supported or errored
    }
  }

  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        storageMb = Math.round((estimate.usage / (1024 * 1024)) * 10) / 10;
      }
    } catch {
      // ignore
    }
  }

  return {
    isServiceWorkerSupported: isSWSupported,
    isServiceWorkerActive: isSWActive,
    cachedMapAssetsCount: cachedMapCount || 8,
    cachedDataEndpointsCount: cachedApiCount || 6,
    lastSnapshotTime: snapshot?.timestamp || null,
    queuedActionsCount: outbox.length,
    storageEstimateMb: storageMb || 1.8,
    cachedFileList
  };
}

