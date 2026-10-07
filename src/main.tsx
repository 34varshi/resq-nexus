import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { prewarmMapAndDataCache } from './utils/offlineStorage.ts';

// Register PWA Service Worker for offline disaster response
try {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.info('[ResQ Nexus ServiceWorker] Update available for command center.');
    },
    onOfflineReady() {
      console.info('[ResQ Nexus ServiceWorker] Command center assets cached for offline operation.');
    },
  });
} catch (swErr) {
  // Direct fallback to standalone service worker script if virtual module is unavailable
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.info('[ResQ Nexus ServiceWorker] Direct /sw.js registration active:', reg.scope);
    }).catch((err) => {
      console.warn('[ResQ Nexus ServiceWorker] Registration fallback warning:', err);
    });
  }
}

// Warm spatial map and disaster cache on startup
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    prewarmMapAndDataCache().then((cachedCount) => {
      console.info(`[ResQ Nexus] Prewarmed ${cachedCount} critical map vector and data assets.`);
    }).catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(<App />);
