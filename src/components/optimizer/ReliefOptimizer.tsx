import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OperationalTag } from '../common/StatusBadges';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import {
  Sliders,
  Sparkles,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Box,
  LifeBuoy,
  Users,
  Home,
  ArrowRight,
  ShieldAlert,
  Play
} from 'lucide-react';

export const ReliefOptimizer: React.FC = () => {
  const { resources, requests, teams, shelters, addEmergencyRequest } = useApp();

  const [availableWater, setAvailableWater] = useState<number>(10000);
  const [selectedResourceType, setSelectedResourceType] = useState<'Water' | 'Trauma Kits' | 'Emergency Rations'>('Water');
  const [optimizerRan, setOptimizerRan] = useState<boolean>(true);

  // Sample multi-request scenario for optimization
  const requestScenario = [
    { id: 'REQ-1050', label: 'Old High School Relief Point', needed: 3500, people: 350, severity: 'CRITICAL', distanceKm: 2.1, status: 'Active' },
    { id: 'REQ-1059', label: 'Mosque Relief Center', needed: 2500, people: 280, severity: 'CRITICAL', distanceKm: 3.4, status: 'Active' },
    { id: 'REQ-1070', label: 'Gurudwara Community Feeding Kitchen', needed: 4000, people: 1200, severity: 'HIGH', distanceKm: 5.2, status: 'Active' },
    { id: 'REQ-1062', label: 'South District Hospital Auxiliary', needed: 3000, people: 500, severity: 'HIGH', distanceKm: 4.8, status: 'Active' }
  ];

  const totalDemand = requestScenario.reduce((acc, r) => acc + r.needed, 0); // 13,000 L
  const shortage = Math.max(0, totalDemand - availableWater); // 3,000 L deficit

  // Algorithmic optimization distribution
  const optimizedAllocations = [
    { ...requestScenario[0], allocatedCurrent: 2500, allocatedAI: 3500, satisfactionPct: 100, rationale: 'Immediate infant hydration urgency (100% satisfied)' },
    { ...requestScenario[1], allocatedCurrent: 1500, allocatedAI: 2500, satisfactionPct: 100, rationale: 'High vulnerable density in low-lying area (100% satisfied)' },
    { ...requestScenario[2], allocatedCurrent: 4000, allocatedAI: 2500, satisfactionPct: 62.5, rationale: 'Cooking water buffered with municipal reserve (62.5% satisfied)' },
    { ...requestScenario[3], allocatedCurrent: 2000, allocatedAI: 1500, satisfactionPct: 50, rationale: 'Augmented with on-site hospital cistern (50% satisfied)' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <AIDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Relief Optimizer
            </h2>
            <OperationalTag type="SIMULATION" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-objective integer linear programming balancing clinical triage severity, transit times, and scarce supply buffers.
          </p>
        </div>

        <button
          onClick={() => setOptimizerRan(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Multi-Constraint Optimization</span>
        </button>
      </div>

      {/* Input Parameters Control Panel */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Optimization Parameters & Constraints
          </span>
          <span className="text-emerald-400 font-semibold">Simulated Solver Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Scarce Resource Category</label>
            <select
              value={selectedResourceType}
              onChange={(e) => setSelectedResourceType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono"
            >
              <option value="Water">Potable Drinking Water (Liters)</option>
              <option value="Trauma Kits">Emergency Trauma Kits (Units)</option>
              <option value="Emergency Rations">Emergency Food Rations (Meals)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              Available Supply Pool: <strong className="text-emerald-400 font-mono">{availableWater.toLocaleString()} Liters</strong>
            </label>
            <input
              type="range"
              min="5000"
              max="20000"
              step="500"
              value={availableWater}
              onChange={(e) => setAvailableWater(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>5,000 L</span>
              <span>10,000 L</span>
              <span>20,000 L</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <span className="text-slate-400 text-[10px] uppercase block">Demand vs Pool Balance</span>
            <div className="text-xs text-slate-300 mt-1">
              Total Request Demand: <strong className="text-white">{totalDemand.toLocaleString()} L</strong>
            </div>
            <div className="text-xs text-rose-400 font-bold mt-0.5">
              Net Deficit / Shortage: {shortage.toLocaleString()} L
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Impact Improvement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>Estimated Response Time</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            -18%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Average field arrival reduced from 34m to 28m via road obstruction routing.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl border border-sky-900/40 bg-sky-950/20 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-sky-400">
            <span>Unserved Critical Requests</span>
            <TrendingDown className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            -42%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Critical pediatric and dialysis calls prioritized over bulk non-acute requests.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl border border-purple-900/40 bg-purple-950/20 shadow space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400">
            <span>Resource Utilization Rate</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            +21%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Depot staging proximity alignment eliminates deadhead backhaul travel.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison: Current Allocation vs AI Optimized Allocation */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Allocation Matrix: Current Ad-Hoc vs. AI Optimized Distribution
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Solver: Multi-Param Simplex Formulation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <th className="pb-3 font-semibold">Distress Center</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold text-right">Requested</th>
                <th className="pb-3 font-semibold text-right text-slate-400">Current Allocation</th>
                <th className="pb-3 font-semibold text-right text-emerald-400 font-bold">AI Optimized Allocation</th>
                <th className="pb-3 font-semibold text-center">Satisfaction</th>
                <th className="pb-3 font-semibold">Optimization Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {optimizedAllocations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3">
                    <div className="font-semibold text-white">{item.label}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {item.id} · {item.people} people affected ({item.distanceKm} km away)
                    </div>
                  </td>
                  <td className="py-3 font-mono font-bold">
                    <span className={item.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-right tabular-nums text-slate-300">
                    {item.needed.toLocaleString()} L
                  </td>
                  <td className="py-3 font-mono text-right tabular-nums text-slate-400">
                    {item.allocatedCurrent.toLocaleString()} L
                  </td>
                  <td className="py-3 font-mono text-right tabular-nums text-emerald-400 font-bold text-sm">
                    {item.allocatedAI.toLocaleString()} L
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                        item.satisfactionPct === 100
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {item.satisfactionPct}%
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 text-xs max-w-xs">
                    {item.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              The AI optimizer prevents catastrophic supply exhaustion at St. Jude Clinic and Mosque Center while rationing resilient secondary sites.
            </span>
          </div>
          <OperationalTag type="SIMULATION" />
        </div>
      </div>
    </div>
  );
};
