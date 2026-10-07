import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shelter } from '../../types';
import {
  Home,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export const ShelterManagement: React.FC = () => {
  const { shelters, updateShelterOccupancy, findNearestShelters } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [nearestTargetLocation, setNearestTargetLocation] = useState<'SECTOR_4' | 'HERITAGE_QUARTER' | 'DELTA_COAST'>('SECTOR_4');
  const [showFinder, setShowFinder] = useState(false);

  const filteredShelters = shelters.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate ranked shelters when finder is open
  const targetCoords =
    nearestTargetLocation === 'SECTOR_4'
      ? { lat: 17.385, lng: 78.486 }
      : nearestTargetLocation === 'HERITAGE_QUARTER'
      ? { lat: 17.362, lng: 78.474 }
      : { lat: 16.99, lng: 82.24 };

  const rankedShelters = findNearestShelters(targetCoords.lat, targetCoords.lng, 20);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-sky-400" />
            Shelter & Relief Center Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time occupancy tracking, medical clinic support, utility health, and nearest suitable shelter finder.
          </p>
        </div>

        <button
          onClick={() => setShowFinder(!showFinder)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{showFinder ? 'Hide Shelter Finder' : 'Find Nearest Suitable Shelter'}</span>
        </button>
      </div>

      {/* "Find Nearest Suitable Shelter" AI Ranking Tool */}
      {showFinder && (
        <div className="p-5 rounded-2xl border border-sky-800/80 bg-sky-950/30 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-900/60">
            <div>
              <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider block">
                AI Evacuation & Shelter Suitability Matcher
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Multi-Factor Suitability Ranking
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Disaster Zone:</span>
              <select
                value={nearestTargetLocation}
                onChange={(e) => setNearestTargetLocation(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              >
                <option value="SECTOR_4">Sector 4 Flood Inundation Zone</option>
                <option value="HERITAGE_QUARTER">Heritage Old Town Seismic Zone</option>
                <option value="DELTA_COAST">Coastal Cyclone Delta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rankedShelters.slice(0, 3).map((s, rank) => {
              const freeBeds = s.capacity - s.occupied;
              const dist = (
                Math.hypot(s.coordinates.lat - targetCoords.lat, s.coordinates.lng - targetCoords.lng) * 111
              ).toFixed(1);
              return (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-sky-900/80 text-sky-300 font-mono text-xs font-bold flex items-center justify-center">
                      #{rank + 1}
                    </span>
                    <span className="font-mono text-xs text-emerald-400 font-bold">
                      {dist} km away
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{s.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{s.location}</p>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-900 p-2 rounded-lg">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Free Beds</span>
                      <span className="font-bold text-emerald-400">{freeBeds}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Medical</span>
                      <span className="font-bold text-slate-200">{s.medicalSupport}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>Water: {s.waterStatus}</span>
                    <span>Accessibility: {s.accessibility}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search shelters by name, location..."
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
            <option value="OPERATIONAL">Operational</option>
            <option value="NEAR_CAPACITY">Near Capacity (&gt;90%)</option>
            <option value="FULL">Full (100%)</option>
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {filteredShelters.length} Shelters Activated
        </span>
      </div>

      {/* Shelter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredShelters.map((s) => {
          const occPct = Math.round((s.occupied / s.capacity) * 100);
          const freeBeds = s.capacity - s.occupied;
          const isCritical = occPct >= 95;
          return (
            <div
              key={s.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-400">{s.id}</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : occPct >= 80
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{s.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 line-clamp-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{s.location}</span>
                </p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Capacity Load:</span>
                    <span className="font-bold text-white tabular-nums">
                      {s.occupied} / {s.capacity} beds ({occPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical
                          ? 'bg-rose-500'
                          : occPct >= 80
                          ? 'bg-amber-500'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${occPct}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 text-right">
                    {freeBeds} beds available
                  </div>
                </div>

                {/* Service Status Matrix */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-center">
                  <div>
                    <span className="text-slate-500 block">Water</span>
                    <span className={s.waterStatus === 'AVAILABLE' ? 'text-emerald-400' : 'text-rose-400'}>
                      {s.waterStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Food</span>
                    <span className={s.foodStatus === 'AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'}>
                      {s.foodStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Medical</span>
                    <span className={s.medicalSupport === 'AVAILABLE' ? 'text-emerald-400' : 'text-slate-400'}>
                      {s.medicalSupport}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shelter Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="text-slate-400 truncate max-w-[140px]">
                  Mgr: {s.manager}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateShelterOccupancy(s.id, 10)}
                    disabled={s.occupied >= s.capacity}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono disabled:opacity-50"
                    title="Admit 10 Evacuees"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => updateShelterOccupancy(s.id, -10)}
                    disabled={s.occupied <= 0}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono disabled:opacity-50"
                    title="Transfer 10 Evacuees"
                  >
                    -10
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
