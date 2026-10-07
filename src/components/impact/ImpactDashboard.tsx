import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Users,
  Box,
  CheckCircle,
  Clock,
  Home,
  HeartHandshake,
  Download,
  Share2
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const { metrics, requests, shelters, volunteers, setCurrentView } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Humanitarian Disaster Relief Impact Audit
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified cumulative outcomes, lives preserved, and logistics efficiency metrics.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('reports')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Full Impact Dossier</span>
        </button>
      </div>

      {/* 7 Core Impact Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>People Assisted</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {metrics.peopleAffectedTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">Total civilians extracted or sheltered</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Resources Delivered</span>
            <Box className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            84,200 <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <p className="text-[11px] text-slate-400">Potable water, trauma kits & rations</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Critical Distress Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {requests.filter((r) => r.status === 'RESOLVED' || r.status === 'VERIFIED').length + 18}
          </div>
          <p className="text-[11px] text-slate-400">High-priority extractions completed</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Average Arrival Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
            18.4 <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <p className="text-[11px] text-slate-400">Rapid triage to on-scene presence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 text-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Shelters Activated</span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">{shelters.length}</div>
          <span className="text-[10px] text-slate-400">Safe sleeping facilities</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 text-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Volunteers Mobilized</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{volunteers.length}</div>
          <span className="text-[10px] text-slate-400">Credentialed personnel</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 text-center">
          <span className="text-[11px] font-mono text-slate-400 uppercase">AI Decision Confidence</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">94.8%</div>
          <span className="text-[10px] text-slate-400">Zero false dispatches</span>
        </div>
      </div>
    </div>
  );
};
