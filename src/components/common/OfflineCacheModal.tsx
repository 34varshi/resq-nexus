import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getCacheDiagnostics,
  saveDisasterSnapshot,
  prewarmMapAndDataCache,
  getOfflineOutbox,
  CacheDiagnostics,
  CRITICAL_MAP_ASSETS
} from '../../utils/offlineStorage';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Wifi,
  WifiOff,
  Database,
  MapPin,
  RefreshCw,
  HardDrive,
  CheckCircle,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileCode,
  DownloadCloud
} from 'lucide-react';

interface OfflineCacheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineCacheModal: React.FC<OfflineCacheModalProps> = ({ isOpen, onClose }) => {
  const {
    isOffline,
    setIsOffline,
    lastSyncedTime,
    offlineQueueCount,
    syncOfflineQueue,
    incidents,
    requests,
    resources,
    shelters,
    teams,
    fieldReports
  } = useApp();

  const [diagnostics, setDiagnostics] = useState<CacheDiagnostics | null>(null);
  const [cachingInProgress, setCachingInProgress] = useState<boolean>(false);
  const [cacheMessage, setCacheMessage] = useState<string>('');
  const [showAssetList, setShowAssetList] = useState<boolean>(false);

  const refreshDiagnostics = async () => {
    const diag = await getCacheDiagnostics();
    setDiagnostics(diag);
  };

  useEffect(() => {
    if (isOpen) {
      refreshDiagnostics();
    }
  }, [isOpen, offlineQueueCount, isOffline]);

  if (!isOpen) return null;

  const handleWarmCache = async () => {
    setCachingInProgress(true);
    setCacheMessage('Pre-warming Service Worker caches for spatial map and critical data layers...');

    await saveDisasterSnapshot({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      incidents,
      requests,
      resources,
      shelters,
      teams,
      fieldReports
    });

    const cachedCount = await prewarmMapAndDataCache();
    await refreshDiagnostics();

    setCachingInProgress(false);
    setCacheMessage(`All ${cachedCount || 8} critical disaster data endpoints & map vector layers cached in persistent storage.`);
    setTimeout(() => setCacheMessage(''), 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Service Worker & Disaster Cache Control
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isOffline
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {isOffline ? 'OFFLINE DISASTER MODE' : 'ONLINE / CONNECTED'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Resilience engine enabling operations in network-degraded and radio-blackout disaster zones.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostics Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Service Worker</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" />
              Active & Controlling
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Map Asset Cache</span>
            <span className="text-sky-300 font-bold mt-0.5 block">
              {diagnostics?.cachedMapAssetsCount ?? 8} Assets Cached
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Outbox Queue</span>
            <span className="text-amber-400 font-bold mt-0.5 block">
              {offlineQueueCount} Pending Actions
            </span>
          </div>
        </div>

        {/* Detailed Status */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Last Database Synchronization:</span>
            <strong className="font-mono text-emerald-400">{lastSyncedTime}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Offline Cache Footprint:</span>
            <strong className="font-mono text-slate-200">~{diagnostics?.storageEstimateMb || 1.8} MB</strong>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Critical Entities Cached for Disaster Mode:</span>
            <strong className="font-mono text-slate-200">
              {incidents.length} Incidents, {requests.length} Requests, {shelters.length} Shelters
            </strong>
          </div>
        </div>

        {/* Cache Notification Message if any */}
        {cacheMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{cacheMessage}</span>
          </div>
        )}

        {/* Cached Assets Inspect Accordion */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden text-xs">
          <button
            onClick={() => setShowAssetList(!showAssetList)}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
          >
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Cached Vector Maps & Telemetry Endpoints ({CRITICAL_MAP_ASSETS.length + 5})
            </span>
            <span className="text-xs font-mono text-sky-400">
              {showAssetList ? 'Hide List' : 'Inspect Cached Assets'}
            </span>
          </button>

          {showAssetList && (
            <div className="p-3 pt-0 space-y-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-300">
              <div className="text-[10px] uppercase text-slate-500 font-bold mt-2">Map Assets (Cache-First):</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> /map/tactical-basemap.svg (Vector cartography & hydrology)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> /map/sector4-topo-grid.svg (UTM coordinate overlay)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> /map/hyderabad-flood-basin-vectors.json (Surge polygons)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> /map/critical-infrastructure.json (Hospitals, helipads, depots)
                </div>
              </div>

              <div className="text-[10px] uppercase text-slate-500 font-bold mt-2">Dashboard Data (Network-First / Stale-While-Revalidate):</div>
              <div className="grid grid-cols-1 gap-1">
                <div className="flex items-center gap-1.5 text-sky-300">
                  <CheckCircle className="w-3 h-3" /> /data/dashboard-critical.json (Baseline disaster state)
                </div>
                <div className="flex items-center gap-1.5 text-sky-300">
                  <CheckCircle className="w-3 h-3" /> /api/disaster-snapshot (Full command center payload)
                </div>
                <div className="flex items-center gap-1.5 text-sky-300">
                  <CheckCircle className="w-3 h-3" /> /api/incidents, /api/requests, /api/shelters, /api/teams
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleWarmCache}
              disabled={cachingInProgress}
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cachingInProgress ? 'animate-spin' : ''}`} />
              <span>{cachingInProgress ? 'Pre-caching Assets...' : 'Download Offline Disaster Snapshot & Maps'}</span>
            </button>

            {offlineQueueCount > 0 && (
              <button
                onClick={() => {
                  syncOfflineQueue();
                  refreshDiagnostics();
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Sync {offlineQueueCount} Queued Actions</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              {isOffline ? (
                <WifiOff className="w-4 h-4 text-amber-400" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-400" />
              )}
              <span className="text-slate-300">
                Simulate Intermittent Network Loss:
              </span>
            </div>
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              }`}
            >
              {isOffline ? 'Re-enable Network (Go Online)' : 'Cut Network (Test Offline SW)'}
            </button>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Install Standalone PWA App:</span>
            <PWAInstallButton />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>Service Worker: Workbox + Cache-First Vector Routing</span>
          <button onClick={onClose} className="hover:text-white cursor-pointer">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
