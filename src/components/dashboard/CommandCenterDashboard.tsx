import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { prewarmMapAndDataCache, saveDisasterSnapshot } from '../../utils/offlineStorage';
import {
  Flame,
  LifeBuoy,
  Users,
  Box,
  Home,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  TrendingDown,
  Layers,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { AIRecommendation } from '../../types';

export const CommandCenterDashboard: React.FC = () => {
  const {
    metrics,
    incidents,
    requests,
    resources,
    shelters,
    teams,
    fieldReports,
    aiRecommendations,
    approveAIRecommendation,
    rejectAIRecommendation,
    setCurrentView,
    setSelectedIncidentId,
    setSelectedRequestId,
    batchTriageAll,
    isOffline,
    setIsOffline,
    lastSyncedTime,
    offlineQueueCount,
    syncOfflineQueue
  } = useApp();

  const [selectedRecForReview, setSelectedRecForReview] = useState<AIRecommendation | null>(null);
  const [snapshotDownloading, setSnapshotDownloading] = useState<boolean>(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState<boolean>(false);

  const handleDownloadSnapshot = async () => {
    setSnapshotDownloading(true);
    await saveDisasterSnapshot({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      incidents,
      requests,
      resources,
      shelters,
      teams,
      fieldReports
    });
    await prewarmMapAndDataCache();
    setSnapshotDownloading(false);
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 4000);
  };

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const criticalRequests = requests.filter(
    (r) => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'RESOLVED' && r.status !== 'CLOSED'
  );
  const pendingRecommendations = aiRecommendations.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner: Responsible AI Governance */}
      <AIDisclaimerBanner />

      {/* Disaster Resilience & Service Worker Cache Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">Disaster Continuity & Service Worker Cache</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                ACTIVE • 100% OFFLINE CAPABLE
              </span>
              {isOffline && (
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold animate-pulse">
                  INTERMITTENT/OFFLINE ACTIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dashboard telemetry, triage states, and vector map layers are stored locally. Intermittent connectivity will not interrupt mission coordination.
              {snapshotSuccess && <span className="text-emerald-400 font-semibold ml-1">✓ Disaster snapshot updated in cache.</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={handleDownloadSnapshot}
            disabled={snapshotDownloading}
            className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Pre-cache latest dashboard and map snapshot to Service Worker"
          >
            <RefreshCw className={`w-3 h-3 ${snapshotDownloading ? 'animate-spin' : ''}`} />
            <span>{snapshotDownloading ? 'Caching...' : 'Cache Snapshot'}</span>
          </button>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              isOffline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Simulate losing connectivity to verify Service Worker offline caching"
          >
            {isOffline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOffline ? 'Go Online' : 'Simulate Offline'}</span>
          </button>

          {offlineQueueCount > 0 && (
            <button
              onClick={syncOfflineQueue}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Sync Outbox ({offlineQueueCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 7 Operational KPI Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Active Incidents */}
        <div
          onClick={() => setCurrentView('incidents')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Active Incidents
            </span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums group-hover:scale-105 transition-transform">
            {metrics.activeIncidentsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {incidents.filter((i) => i.severity === 'CRITICAL').length} Critical Priority
          </div>
        </div>

        {/* Critical Requests */}
        <div
          onClick={() => setCurrentView('requests')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Critical Requests
            </span>
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums group-hover:scale-105 transition-transform">
            {metrics.criticalRequestsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Need Rapid Response
          </div>
        </div>

        {/* People Affected */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              People Affected
            </span>
            <Users className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">
            {metrics.peopleAffectedTotal.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Across 4 Active Sectors
          </div>
        </div>

        {/* Available Resources */}
        <div
          onClick={() => setCurrentView('resources')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Avail Resources
            </span>
            <Box className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums group-hover:scale-105 transition-transform">
            {metrics.availableResourcePercent}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Overall Stock Readiness
          </div>
        </div>

        {/* Response Teams */}
        <div
          onClick={() => setCurrentView('teams')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Response Teams
            </span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1 tabular-nums group-hover:scale-105 transition-transform">
            {metrics.activeTeamsCount} <span className="text-xs font-normal text-slate-400">active</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {teams.filter((t) => t.status === 'AVAILABLE').length} Units Ready
          </div>
        </div>

        {/* Shelter Capacity */}
        <div
          onClick={() => setCurrentView('shelters')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Shelter Occupancy
            </span>
            <Home className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-sky-300 mt-1 tabular-nums group-hover:scale-105 transition-transform">
            {metrics.shelterCapacityPercent}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {shelters.filter((s) => s.status === 'FULL' || s.status === 'NEAR_CAPACITY').length} Sites Near Limit
          </div>
        </div>

        {/* Resource Shortages */}
        <div
          onClick={() => setCurrentView('resources')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Shortages
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums group-hover:scale-105 transition-transform">
            {metrics.resourceShortagesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Below Safety Buffer
          </div>
        </div>
      </div>

      {/* Main Grid: AI Copilot Recommendations (Right/Top) & Tactical Picture (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Recommended Actions Copilot */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-600/40 flex items-center justify-center text-sky-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    AI Recommended Actions Copilot
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      HUMAN APPROVAL REQUIRED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Neural triage and multi-objective optimization suggestions pending coordinator sign-off.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={batchTriageAll}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  Re-evaluate Triage
                </button>
              </div>
            </div>

            {/* AI Priority Alert Banner */}
            <div className="p-3.5 rounded-xl border border-rose-900/50 bg-rose-950/30 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-rose-300 mr-2">AI PRIORITY ALERT:</span>
                  <span className="text-slate-200">
                    3 critical medical requests are currently underserved in Sector 4 Lowland Basin. Potable supply depleting in 4 hours.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-rose-400 shrink-0 uppercase font-semibold">
                SEVERITY 94/100
              </span>
            </div>

            {/* Pending Recommendations List */}
            <div className="space-y-3">
              {pendingRecommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] font-bold text-slate-300">
                        {index + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                      <SeverityBadge severity={rec.severity} size="sm" />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>Confidence: <strong className="text-emerald-400">{rec.confidence}%</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-7">
                    {rec.reason}
                  </p>

                  <div className="pl-7 space-y-1">
                    {rec.bulletPoints.slice(0, 2).map((bp, i) => (
                      <div key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-sky-400 shrink-0" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Human-in-the-Loop Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 pl-7">
                    <span className="text-[11px] text-emerald-400 font-mono">
                      Impact: {rec.expectedImpact}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRecForReview(rec)}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Review</span>
                      </button>

                      <button
                        onClick={() => rejectAIRecommendation(rec.id)}
                        className="px-2.5 py-1 rounded-lg border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 text-xs font-medium text-rose-300 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => approveAIRecommendation(rec.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center gap-1 shadow"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Approve & Dispatch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingRecommendations.length === 0 && (
                <div className="py-6 text-center text-slate-400">
                  <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-300">All high-priority AI actions approved or resolved.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Monitoring incoming signals...</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Incidents Overview Table */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Active Disaster Incidents</h3>
              </div>
              <button
                onClick={() => setCurrentView('incidents')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                <span>View All ({incidents.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <th className="pb-2 font-semibold">Incident ID</th>
                    <th className="pb-2 font-semibold">Classification</th>
                    <th className="pb-2 font-semibold">Location</th>
                    <th className="pb-2 font-semibold">Severity</th>
                    <th className="pb-2 font-semibold text-right">Affected</th>
                    <th className="pb-2 font-semibold text-center">Teams</th>
                    <th className="pb-2 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {activeIncidents.slice(0, 4).map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-mono font-semibold text-rose-400">
                        {inc.id}
                      </td>
                      <td className="py-2.5 text-slate-200 font-medium">{inc.title}</td>
                      <td className="py-2.5 text-slate-400">{inc.location}</td>
                      <td className="py-2.5">
                        <SeverityBadge severity={inc.severity} size="sm" />
                      </td>
                      <td className="py-2.5 font-mono text-right tabular-nums text-slate-200">
                        {inc.peopleAffected.toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-center text-slate-300">
                        {inc.responseTeams.length}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedIncidentId(inc.id);
                            setCurrentView('incidents');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Mini Live Map & Triage Queue */}
        <div className="space-y-4">
          {/* Tactical Spatial Mini-Map Card */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white tracking-tight">Tactical Operations Radar</h3>
              </div>
              <button
                onClick={() => setCurrentView('map')}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                <span>Full Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Tactical Grid Widget */}
            <div className="relative h-56 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden tactical-grid">
              <div className="absolute inset-0 tactical-dots opacity-20" />

              {/* Crosshair telemetry lines */}
              <div className="absolute inset-x-0 top-1/2 border-t border-slate-800/80" />
              <div className="absolute inset-y-0 left-1/2 border-l border-slate-800/80" />

              {/* Radar sweep */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-rose-500/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-sky-500/20" />

              {/* Pinned incidents */}
              <div className="absolute top-[42%] left-[48%] flex flex-col items-center">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                <span className="w-3 h-3 rounded-full bg-rose-600 border border-white" />
                <span className="text-[9px] font-mono text-rose-300 mt-1 bg-slate-900 px-1 rounded">INC-104</span>
              </div>

              <div className="absolute top-[30%] left-[32%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-emerald-300 mt-0.5 bg-slate-900 px-1 rounded">TEAM-R07</span>
              </div>

              <div className="absolute top-[65%] left-[62%] flex flex-col items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-[9px] font-mono text-sky-300 mt-0.5 bg-slate-900 px-1 rounded">SHL-201</span>
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400">
                17.385°N, 78.486°E · Sector 4
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400">Flood Inundation</div>
                <div className="text-rose-400 font-semibold mt-0.5">+0.4m/hr Rise</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400">Road Open Rate</div>
                <div className="text-amber-400 font-semibold mt-0.5">40% Passable</div>
              </div>
            </div>
          </div>

          {/* Live Distress Signal Queue */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white tracking-tight">Incoming Distress Queue</h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400">
                {criticalRequests.length} Pending
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {criticalRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setCurrentView('requests');
                  }}
                  className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-950/70 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-semibold text-amber-400">{req.id}</span>
                      <span className="text-slate-400">· {req.type}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      Score {req.priorityScore}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">{req.description}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span>{req.location}</span>
                    <span className="text-slate-400">{req.peopleCount} people</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('requests')}
              className="w-full py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors text-center"
            >
              Open Full Request Queue →
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal for AI Recommendation */}
      {selectedRecForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <OperationalTag type="AI_RECOMMENDATION" />
                <h3 className="text-base font-bold text-white mt-1.5">{selectedRecForReview.title}</h3>
                <p className="text-xs text-slate-400 font-mono">Recommendation ID: {selectedRecForReview.id}</p>
              </div>
              <SeverityBadge severity={selectedRecForReview.severity} />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-slate-200">Explainable AI Reasoning:</div>
              <p className="leading-relaxed text-slate-300">{selectedRecForReview.reason}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-300">Telemetry Factors Analyzed:</span>
              {selectedRecForReview.bulletPoints.map((bp, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>{bp}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-300">
              <strong>Anticipated Operational Impact:</strong> {selectedRecForReview.expectedImpact}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedRecForReview(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  rejectAIRecommendation(selectedRecForReview.id);
                  setSelectedRecForReview(null);
                }}
                className="px-4 py-2 rounded-lg border border-rose-800 bg-rose-950/60 hover:bg-rose-900 text-xs font-semibold text-rose-300"
              >
                Reject Action
              </button>
              <button
                onClick={() => {
                  approveAIRecommendation(selectedRecForReview.id);
                  setSelectedRecForReview(null);
                }}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
              >
                Approve & Execute Operation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
