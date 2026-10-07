import React from 'react';
import { useApp } from '../../context/AppContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Database, RefreshCw, HardDrive, AlertTriangle } from 'lucide-react';

interface OfflineIndicatorProps {
  onOpenCacheModal: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onOpenCacheModal }) => {
  const { isOffline, setIsOffline, offlineQueueCount, syncOfflineQueue, lastSyncedTime } = useApp();
  const browserOnline = useOnlineStatus();

  // Show if either browser is offline or user toggled simulated offline mode
  const activeOffline = isOffline || !browserOnline;

  if (!activeOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 p-3 shadow-2xl backdrop-blur-md text-xs text-slate-100 font-sans">
        <div className="relative shrink-0 p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <WifiOff className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 tracking-tight">
            <span>Intermittent Disaster Mode Active</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-800">
              SERVICE WORKER CACHED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
            Dashboard data & vector maps served locally from offline cache.
            {offlineQueueCount > 0 && ` ${offlineQueueCount} action(s) queued in outbox.`}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
              title="Sync pending offline actions"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync ({offlineQueueCount})</span>
            </button>
          )}

          <button
            onClick={onOpenCacheModal}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Inspect Service Worker & Map Cache"
          >
            <HardDrive className="w-3.5 h-3.5" />
          </button>

          {isOffline && (
            <button
              onClick={() => setIsOffline(false)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition cursor-pointer"
              title="Re-enable online mode"
            >
              Go Online
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
