import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResponseTeam, TeamStatus } from '../../types';
import {
  Users,
  Search,
  Filter,
  Truck,
  MapPin,
  Send,
  Phone,
  ShieldAlert,
  CheckCircle,
  Activity,
  Layers
} from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { teams, dispatchTeam, updateTeamStatus, fastForwardTeamArrival, activeMissions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dispatchModalTeam, setDispatchModalTeam] = useState<ResponseTeam | null>(null);
  const [missionInput, setMissionInput] = useState('');

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchModalTeam) {
      dispatchTeam(dispatchModalTeam.id, missionInput || 'High-priority emergency extraction');
      setDispatchModalTeam(null);
      setMissionInput('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Response Teams & Field Squad Dispatch
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status tracking for specialized search & rescue, trauma medical, and hazmat tactical units.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400 font-bold">{teams.filter((t) => t.status === 'AVAILABLE').length} Available</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-bold">{teams.filter((t) => t.status === 'EN_ROUTE' || t.status === 'ON_SITE').length} Deployed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search teams by ID, skill, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ON_SITE">On Site</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {filteredTeams.length} Operational Units
        </span>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team) => {
          const isAvail = team.status === 'AVAILABLE';
          return (
            <div
              key={team.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-purple-300">{team.id}</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      isAvail
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : team.status === 'EN_ROUTE'
                        ? 'bg-sky-950 text-sky-300 border-sky-800'
                        : team.status === 'ON_SITE'
                        ? 'bg-purple-950 text-purple-300 border-purple-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white">{team.name}</h3>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{team.location}</span>
                </div>

                {/* Team Details Strip */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[11px]">Personnel:</span>
                    <span>{team.membersCount} Specialists</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[11px]">Transport:</span>
                    <span className="truncate max-w-[170px]">{team.vehicle}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 text-[11px]">Team Leader:</span>
                    <span>{team.leaderName}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {team.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Active Simulated Mission progress if any */}
                {activeMissions[team.id] ? (
                  <div className="text-[11px] bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/60 space-y-2">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> En-Route Mission
                      </span>
                      <span className="text-amber-400 font-bold">{activeMissions[team.id].etaMinutes}m ETA</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(activeMissions[team.id].progress * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-300 truncate max-w-[150px]">{activeMissions[team.id].destinationName}</span>
                      <button
                        type="button"
                        onClick={() => fastForwardTeamArrival(team.id)}
                        className="px-2 py-0.5 rounded bg-purple-700 hover:bg-purple-600 text-white font-mono text-[9px] font-bold transition-colors cursor-pointer"
                        title="Simulate instant arrival"
                      >
                        Fast-Forward Arrival
                      </button>
                    </div>
                  </div>
                ) : team.currentMission ? (
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/40">
                    <strong>Mission:</strong> {team.currentMission}
                  </div>
                ) : null}
              </div>

              {/* Status and Action */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">Status:</span>
                  <select
                    value={team.status}
                    onChange={(e) => updateTeamStatus(team.id, e.target.value as TeamStatus)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="EN_ROUTE">EN_ROUTE</option>
                    <option value="ON_SITE">ON_SITE</option>
                    <option value="BUSY">BUSY</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {team.contact}
                  </span>

                  <button
                    onClick={() => setDispatchModalTeam(team)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      isAvail
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAvail ? 'Dispatch Squad' : 'Reassign Mission'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Modal */}
      {dispatchModalTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-500" />
                Dispatch Directive: {dispatchModalTeam.name}
              </h3>
              <button onClick={() => setDispatchModalTeam(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1">
                <div>Team ID: <span className="text-purple-300 font-bold">{dispatchModalTeam.id}</span></div>
                <div>Vehicle: <span className="text-slate-200">{dispatchModalTeam.vehicle}</span></div>
                <div>Stationed: <span className="text-slate-400">{dispatchModalTeam.location}</span></div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mission Objective & Target Destination</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Deploy to Sector 4 Community Clinic; perform medical evacuation of 14 dialysis patients."
                  value={missionInput}
                  onChange={(e) => setMissionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchModalTeam(null)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg"
                >
                  Issue Operational Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
