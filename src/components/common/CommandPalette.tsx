import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  Flame,
  LifeBuoy,
  Box,
  Home,
  Users,
  MapPin,
  Bot,
  Sliders,
  FileText
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentView,
    setSelectedIncidentId,
    incidents,
    requests,
    resources,
    shelters,
    teams
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filteredIncidents = incidents.filter(
    (i) => i.id.toLowerCase().includes(query.toLowerCase()) || i.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredRequests = requests.filter(
    (r) =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.type.toLowerCase().includes(query.toLowerCase()) ||
      r.location.toLowerCase().includes(query.toLowerCase())
  );
  const filteredResources = resources.filter(
    (res) => res.id.toLowerCase().includes(query.toLowerCase()) || res.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredShelters = shelters.filter(
    (s) => s.id.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase())
  );
  const filteredTeams = teams.filter(
    (t) => t.id.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase())
  );

  const quickNavs = [
    { label: 'Open Live Tactical Map', view: 'map', icon: MapPin },
    { label: 'Run Relief Optimizer', view: 'optimizer', icon: Sliders },
    { label: 'Launch NEXUS AI Assistant', view: 'ai-assistant', icon: Bot },
    { label: 'Open Simulation Mode', view: 'simulation', icon: LifeBuoy },
    { label: 'Generate Incident & Performance Report', view: 'reports', icon: FileText }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incident ID, request, shelter, resource, or team... (e.g. INC-104, REQ-1048)"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick Actions if query is empty */}
          {!query && (
            <div>
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Command Shortcuts
              </div>
              <div className="space-y-1 mt-1">
                {quickNavs.map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.view}
                      onClick={() => {
                        setCurrentView(nav.view);
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="font-medium">{nav.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incidents */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> Incidents ({filteredIncidents.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredIncidents.slice(0, 4).map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setCurrentView('incidents');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono font-semibold text-rose-400 mr-2">{inc.id}</span>
                      <span className="text-slate-200 font-medium">{inc.title}</span>
                      <span className="text-slate-400 ml-2">· {inc.location}</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {inc.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Requests */}
          {filteredRequests.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5" /> Requests ({filteredRequests.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredRequests.slice(0, 4).map((req) => (
                  <button
                    key={req.id}
                    onClick={() => {
                      setCurrentView('requests');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono font-semibold text-sky-400 mr-2">{req.id}</span>
                      <span className="text-slate-200 font-medium">{req.type}</span>
                      <span className="text-slate-400 ml-2">· {req.location} ({req.peopleCount} people)</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Score: {req.priorityScore}/100
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {filteredResources.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" /> Inventory Resources ({filteredResources.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredResources.slice(0, 3).map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setCurrentView('resources');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono text-amber-400 mr-2">{res.id}</span>
                      <span className="text-slate-200 font-medium">{res.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">
                      {res.available.toLocaleString()} / {res.quantity.toLocaleString()} {res.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shelters */}
          {filteredShelters.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Relief Shelters ({filteredShelters.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredShelters.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentView('shelters');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <span className="font-mono text-emerald-400 mr-2">{s.id}</span>
                      <span className="text-slate-200 font-medium">{s.name}</span>
                    </div>
                    <span className="font-mono text-slate-400">
                      {s.capacity - s.occupied} beds free ({s.occupied}/{s.capacity})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query &&
            filteredIncidents.length === 0 &&
            filteredRequests.length === 0 &&
            filteredResources.length === 0 &&
            filteredShelters.length === 0 &&
            filteredTeams.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                <p className="font-medium text-slate-300">No operational records match "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Verify ID prefix (e.g. INC-, REQ-, RES-, SHL-, TEAM-)</p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigation: <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> Enter</span>
          <button onClick={() => setCommandPaletteOpen(false)} className="hover:text-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
