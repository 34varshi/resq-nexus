import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import {
  Sparkles,
  LifeBuoy,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle,
  Cpu,
  BarChart2,
  Users
} from 'lucide-react';

export const AITriageEngine: React.FC = () => {
  const { requests, triageRequest, batchTriageAll, setCurrentView, setSelectedRequestId } = useApp();

  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL_ONLY' | 'PENDING_TRIAGE'>('ALL');

  const triagedRequests = requests.filter((r) => {
    if (filterMode === 'CRITICAL_ONLY') return r.priorityScore >= 85;
    if (filterMode === 'PENDING_TRIAGE') return r.status === 'NEW';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <AIDisclaimerBanner />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            AI Emergency Triage Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent multi-parameter priority scoring for crisis signals based on urgency, vulnerability, and spatial isolation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Signals ({requests.length})
            </button>
            <button
              onClick={() => setFilterMode('CRITICAL_ONLY')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'CRITICAL_ONLY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical Only (Score ≥ 85)
            </button>
            <button
              onClick={() => setFilterMode('PENDING_TRIAGE')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterMode === 'PENDING_TRIAGE' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Untriaged
            </button>
          </div>

          <button
            onClick={batchTriageAll}
            className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Re-run Full Batch Triage</span>
          </button>
        </div>
      </div>

      {/* Triage Criteria Explanation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Clinical Urgency & Life Support
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Immediate prioritization for dialysis, oxygen power failure, and acute trauma.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Demographic Vulnerability
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Multipliers for pediatric patients, non-ambulatory seniors, and postpartum care.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Spatial Isolation & Water Cutoff
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Accounts for waterlogged roads & distance from available supply depots.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            Temporal Deprivation Curve
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Hours elapsed without food/potable water accelerates priority weightings.
          </p>
        </div>
      </div>

      {/* Ranked Triage Cards Grid */}
      <div className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
          Triaged Queue by AI Priority Rank (Highest First)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {triagedRequests
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .map((req, rank) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header with Priority Meter */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 font-mono text-xs font-bold text-slate-300 flex items-center justify-center">
                        #{rank + 1}
                      </span>
                      <span className="font-mono font-bold text-sm text-amber-400">{req.id}</span>
                      <span className="text-xs font-mono text-slate-400">· {req.type}</span>
                      <OperationalTag type="VERIFIED" />
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1">{req.requesterName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{req.location} ({req.peopleCount} people)</span>
                    </p>
                  </div>

                  {/* Priority Gauge */}
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                      {req.priorityScore}<span className="text-xs text-slate-400">/100</span>
                    </div>
                    <SeverityBadge severity={req.urgency} size="sm" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      req.priorityScore >= 90
                        ? 'bg-rose-500'
                        : req.priorityScore >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${req.priorityScore}%` }}
                  />
                </div>

                {/* Classification & Explainable Reasons */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">AI Classification:</span>
                    <span className="text-sky-300 font-semibold">{req.aiClassification}</span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="font-semibold text-slate-300 block">Neural Prioritization Factor Equation:</span>
                    {req.aiReasoning.map((reason, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-sky-400 font-bold">+</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    onClick={() => triageRequest(req.id)}
                    className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>Recalculate Score</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setCurrentView('resource-allocation');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow"
                  >
                    <span>Match Resources</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
