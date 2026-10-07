import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Volunteer, RequestType } from '../../types';
import {
  HeartHandshake,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Star,
  CheckCircle,
  Phone,
  Languages,
  Award,
  ArrowRight
} from 'lucide-react';

export const VolunteerManagement: React.FC = () => {
  const { volunteers, requests } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('ALL');
  const [selectedMatchNeed, setSelectedMatchNeed] = useState<RequestType>('Medical');

  const allSkills = [
    'Medical',
    'Driving',
    'Search & Rescue',
    'Logistics',
    'Food Distribution',
    'Translation',
    'Counselling',
    'Technical Support'
  ];

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = skillFilter === 'ALL' || v.skills.includes(skillFilter);
    return matchesSearch && matchesSkill;
  });

  // AI-recommended volunteers for selected need
  const recommendedVolunteers = volunteers
    .filter((v) => {
      if (selectedMatchNeed === 'Medical') return v.skills.includes('Medical');
      if (selectedMatchNeed === 'Rescue') return v.skills.includes('Search & Rescue');
      if (selectedMatchNeed === 'Food') return v.skills.includes('Food Distribution') || v.skills.includes('Logistics');
      if (selectedMatchNeed === 'Water' || selectedMatchNeed === 'Transportation') return v.skills.includes('Driving');
      return true;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-400" />
            Civilian Volunteer Mobilization & Matching
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Credentialed civilian volunteer registry with automated AI skillset matching for relief centers and clinics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-emerald-400 font-bold">{volunteers.filter((v) => v.availability === 'AVAILABLE').length} Available</span>
          <span className="text-slate-500">·</span>
          <span className="text-purple-400 font-bold">{volunteers.filter((v) => v.availability === 'DEPLOYED').length} Mobilized</span>
        </div>
      </div>

      {/* AI-Assisted Volunteer Matching Banner */}
      <div className="p-5 rounded-2xl border border-sky-900/50 bg-sky-950/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-900/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              AI Skillset & Language Matching Engine
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Match Against Distress Need:</span>
            <select
              value={selectedMatchNeed}
              onChange={(e) => setSelectedMatchNeed(e.target.value as RequestType)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-200"
            >
              <option value="Medical">Medical Assistance / Triage</option>
              <option value="Rescue">Search & Rescue Operations</option>
              <option value="Food">Food / Relief Distribution</option>
              <option value="Water">Water Tanker Driving & Logistics</option>
              <option value="Transportation">Emergency Transport Support</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedVolunteers.map((vol, idx) => (
            <div
              key={vol.id}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400">{vol.id}</span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{vol.rating.toFixed(1)}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-white">{vol.name}</h4>
              <p className="text-[11px] text-slate-400">{vol.location} · {vol.experienceYears}y experience</p>

              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300">
                <strong className="text-sky-300">Match Factor:</strong> Verified {selectedMatchNeed} background, speaks {vol.languages.join(', ')}.
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono">
                <span className="text-emerald-400">{vol.availability}</span>
                <span className="text-slate-400">{vol.emergencyContact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search volunteers by name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-56"
            />
          </div>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {filteredVolunteers.length} Active Volunteers
        </span>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredVolunteers.map((vol) => (
          <div
            key={vol.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-purple-300">{vol.id}</span>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    vol.availability === 'AVAILABLE'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {vol.availability}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{vol.name}</h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{vol.location}</span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {vol.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                <div>Languages: <strong className="text-slate-300">{vol.languages.join(', ')}</strong></div>
                {vol.currentAssignment && (
                  <div className="text-sky-300/90 truncate">Assignment: {vol.currentAssignment}</div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">{vol.emergencyContact}</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-current" />
                <span>{vol.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
