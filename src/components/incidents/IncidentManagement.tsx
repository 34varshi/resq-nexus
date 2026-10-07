import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentType, SeverityLevel } from '../../types';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import { CreateIncidentModal } from './CreateIncidentModal';
import {
  Flame,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  LifeBuoy,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

export const IncidentManagement: React.FC = () => {
  const { incidents, selectedIncidentId, setSelectedIncidentId, requests, teams, resources, shelters } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || inc.type === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const incidentRequests = requests.filter((r) => r.incidentId === selectedIncident?.id);
  const incidentTeams = teams.filter((t) => selectedIncident?.responseTeams.includes(t.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            Active Crisis Incidents
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident monitoring, spatial impact telemetry, and AI situational reasoning.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 w-44"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Flood">Flood</option>
            <option value="Cyclone">Cyclone</option>
            <option value="Earthquake">Earthquake</option>
            <option value="Fire">Fire</option>
            <option value="Landslide">Landslide</option>
            <option value="Chemical Emergency">Chemical</option>
            <option value="Infrastructure Failure">Infrastructure</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition-all cursor-pointer active:scale-95"
            title="Declare and register new emergency incident"
          >
            <Plus className="w-4 h-4" />
            <span>Create Incident</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Incident List (Left) & Deep Dive Inspection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
            Registered Incidents ({filteredIncidents.length})
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === selectedIncident?.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                    isSelected
                      ? 'border-rose-500/80 bg-rose-950/20 shadow-lg ring-1 ring-rose-500/40'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rose-400">{inc.id}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {inc.type}
                      </span>
                    </div>
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </div>

                  <h4 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">
                    {inc.title}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{inc.location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] shrink-0 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inc.peopleAffected.toLocaleString()} affected</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                    <span>Started: {inc.startedAt}</span>
                    <span className="text-emerald-400">{inc.responseTeams.length} Teams Active</span>
                  </div>
                </div>
              );
            })}

            {filteredIncidents.length === 0 && (
              <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
                <p className="font-medium text-slate-300">No active incidents matching filters</p>
                <p className="text-xs text-slate-400 mt-1">Adjust search parameters or clear filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Incident Detailed Inspection Panel (7 cols) */}
        {selectedIncident && (
          <div className="lg:col-span-7 space-y-5">
            {/* Incident Header Card */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-rose-400">{selectedIncident.id}</span>
                    <span className="text-xs font-mono text-slate-400">· {selectedIncident.type}</span>
                    <OperationalTag type="VERIFIED" />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedIncident.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{selectedIncident.location}</span>
                    <span>· Coordinates: {selectedIncident.coordinates.lat}°N, {selectedIncident.coordinates.lng}°E</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <SeverityBadge severity={selectedIncident.severity} />
                  <span className="text-[11px] font-mono text-slate-400">
                    Status: <strong className="text-rose-400">{selectedIncident.status}</strong>
                  </span>
                </div>
              </div>

              {/* KPI Strip for Incident */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">People Affected</span>
                  <span className="text-base font-bold text-white tabular-nums">
                    {selectedIncident.peopleAffected.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Associated Requests</span>
                  <span className="text-base font-bold text-amber-400 tabular-nums">
                    {incidentRequests.length} Active
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Response Teams</span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">
                    {selectedIncident.responseTeams.length} Deployed
                  </span>
                </div>
              </div>
            </div>

            {/* AI Incident Analysis Section */}
            <div className="p-5 rounded-2xl border border-sky-900/50 bg-sky-950/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sky-900/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    AI Situational Analysis & Explainable Reasoning
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-emerald-400 font-bold">{selectedIncident.aiAnalysis.confidence}%</span>
                </div>
              </div>

              {/* AI Reasoning Block */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 space-y-1.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-semibold">
                  AI Synthesis & Operational Projection:
                </div>
                <p className="leading-relaxed text-slate-300">
                  "{selectedIncident.aiAnalysis.aiReasoning}"
                </p>
              </div>

              {/* Multi-factor breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Risk Factors */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="font-semibold text-rose-300 font-mono text-[11px] uppercase block">
                    Critical Risk Factors
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedIncident.aiAnalysis.riskFactors.map((rf, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{rf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resource Gaps */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="font-semibold text-amber-300 font-mono text-[11px] uppercase block">
                    Identified Resource Gaps
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {selectedIncident.aiAnalysis.resourceGaps.map((rg, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{rg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Recommended Directives */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-2">
                <span className="font-semibold text-emerald-300 font-mono text-[11px] uppercase block">
                  Recommended Immediate Directives
                </span>
                <div className="space-y-1.5">
                  {selectedIncident.aiAnalysis.recommendedActions.map((act, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-200 text-[11px]">
                      <span className="w-4 h-4 rounded bg-emerald-900/60 text-emerald-400 font-mono flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Disaster Timeline (08:15 to 09:10) */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-bold text-white tracking-tight">Incident Progression Timeline</h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Chronological Event Stream</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {selectedIncident.timeline.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-rose-500 shadow-sm" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400">{evt.time}</span>
                        <h5 className="font-semibold text-white">{evt.title}</h5>
                      </div>
                      {evt.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {evt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{evt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Incident Creation Modal */}
      <CreateIncidentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
