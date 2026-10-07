import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Alert, AlertType } from '../../types';
import { SeverityBadge } from '../common/StatusBadges';
import {
  BellRing,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  Check,
  Send,
  LifeBuoy
} from 'lucide-react';

export const AlertCenter: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, setCurrentView } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesStat = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSev && matchesStat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-rose-500" />
            Emergency Crisis Alert Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active operational alerts for life-safety distress, supply stockouts, and escalating risk anomalies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-rose-400 font-bold">
            {alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length} Critical Unresolved
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Alert States</option>
            <option value="NEW">New (Unacknowledged)</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {filteredAlerts.length} Alerts Logged
        </span>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alt) => {
          const isCritical = alt.severity === 'CRITICAL';
          const isResolved = alt.status === 'RESOLVED';
          return (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                isResolved
                  ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                  : isCritical
                  ? 'border-rose-900/60 bg-rose-950/20 shadow-lg'
                  : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs text-slate-400">{alt.id}</span>
                  <span className="text-xs font-mono font-bold text-white">{alt.type}</span>
                  <SeverityBadge severity={alt.severity} size="sm" />
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {alt.timestamp}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {alt.location}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed pl-2 border-l-2 border-slate-700">
                {alt.description}
              </p>

              {/* Recommended Action & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="text-[11px] text-amber-300">
                  <strong>Recommended Directive:</strong> {alt.recommendedAction}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alt.status === 'NEW' && (
                    <button
                      onClick={() => acknowledgeAlert(alt.id)}
                      className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center gap-1 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve & Log</span>
                    </button>
                  )}

                  {isResolved && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolved & Logged
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
