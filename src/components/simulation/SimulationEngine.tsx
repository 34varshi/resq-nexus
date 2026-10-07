import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OperationalTag } from '../common/StatusBadges';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import {
  Cpu,
  Play,
  RotateCcw,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const SimulationEngine: React.FC = () => {
  // Simulation Scenario Parameters
  const [affectedPopulation, setAffectedPopulation] = useState<number>(25000);
  const [rainfallIntensity, setRainfallIntensity] = useState<'Normal' | 'Moderate' | 'Heavy' | 'Extreme'>('Heavy');
  const [roadAccessibility, setRoadAccessibility] = useState<number>(40); // 40%
  const [waterDemandMultiplier, setWaterDemandMultiplier] = useState<number>(1.4); // +40%
  const [unavailableTeams, setUnavailableTeams] = useState<number>(2);
  const [shelterDropPercent, setShelterDropPercent] = useState<number>(20); // 20% drop

  // Timeline Scrubber State
  const [timelineStep, setTimelineStep] = useState<'T+0' | 'T+6h' | 'T+12h' | 'T+24h' | 'T+48h'>('T+12h');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Computed consequences based on parameters & timeline
  const getSimulatedMetrics = () => {
    const timeMultiplier =
      timelineStep === 'T+0'
        ? 0.4
        : timelineStep === 'T+6h'
        ? 0.7
        : timelineStep === 'T+12h'
        ? 1.0
        : timelineStep === 'T+24h'
        ? 1.5
        : 1.8;

    const projectedRequests = Math.round((affectedPopulation * 0.003 + (100 - roadAccessibility) * 1.5) * timeMultiplier);
    const criticalMedical = Math.round(projectedRequests * 0.35);
    const waterShortageLiters = Math.round(projectedRequests * 380 * waterDemandMultiplier);
    const avgResponseDelayMin = Math.round(((100 - roadAccessibility) * 0.4 + unavailableTeams * 8) * (timeMultiplier * 0.8));
    const shelterOverflow = Math.max(0, Math.round(projectedRequests * 8 * (1 + shelterDropPercent / 100) - 1200));

    return {
      projectedRequests,
      criticalMedical,
      waterShortageLiters,
      avgResponseDelayMin,
      shelterOverflow
    };
  };

  const sim = getSimulatedMetrics();

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 600);
  };

  const timelineSteps = [
    { key: 'T+0', label: 'T+0: Event Inception', desc: 'Levee breach occurs; first 12 distress signals received' },
    { key: 'T+6h', label: 'T+6h: Surge Peak', desc: 'Lowland Sector 4 inundates 1.2m; access roads compromised' },
    { key: 'T+12h', label: 'T+12h: Resource Crunch', desc: 'Local drinkable water exhausts; generator fuel depleted' },
    { key: 'T+24h', label: 'T+24h: Secondary Crisis', desc: 'Shelters exceed 95% capacity; medical lacerations surge' },
    { key: 'T+48h', label: 'T+48h: Stabilization', desc: 'Regional mutual-aid convoys arrive; pontoon bridges deployed' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <AIDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Disaster Scenario Simulation & What-If Stress Testing
            </h2>
            <OperationalTag type="SIMULATION" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Predictive contingency modeling evaluating infrastructure failure cascading into relief bottlenecks.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Computing Dynamics...' : 'Run Simulation'}</span>
        </button>
      </div>

      {/* Scenario Overview Banner */}
      <div className="p-4 rounded-xl border border-purple-900/50 bg-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
            Baseline Scenario Environment:
          </span>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Severe Urban Inundation & Embankment Breach — Hyderabad Musi Basin
          </h3>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Modeled on a 1-in-100-year monsoon surge with heavy sediment loading and electrical grid trips.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Baseline Population</span>
            <span className="text-white font-bold">{affectedPopulation.toLocaleString()} Residents</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Scrubber (T+0 to T+48h) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
          <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" />
            Temporal Simulation Timeline Scrubber
          </span>
          <span className="text-purple-300 font-semibold">Active Snapshot: {timelineStep}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {timelineSteps.map((step) => {
            const isActive = timelineStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => setTimelineStep(step.key as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-purple-500/80 bg-purple-950/30 shadow-md ring-1 ring-purple-500/40'
                    : 'border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-xs font-bold text-purple-400">{step.key}</div>
                <div className="text-xs font-semibold text-white mt-0.5 truncate">{step.label}</div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {step.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* What-If Stress Testing Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Column (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono font-bold text-slate-200 uppercase">
            <span>What-If Stress Sliders</span>
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-4 text-xs">
            {/* Road Accessibility Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">What if road accessibility drops?</span>
                <strong className="text-rose-400">{roadAccessibility}% Passable</strong>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={roadAccessibility}
                onChange={(e) => setRoadAccessibility(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Severe Blockage (10%)</span>
                <span>Normal (90%)</span>
              </div>
            </div>

            {/* Water Demand Increase */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">What if potable demand surges?</span>
                <strong className="text-amber-400">+{Math.round((waterDemandMultiplier - 1) * 100)}% Surge</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.1"
                value={waterDemandMultiplier}
                onChange={(e) => setWaterDemandMultiplier(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Baseline (0%)</span>
                <span>Double Demand (+100%)</span>
              </div>
            </div>

            {/* Response Teams Unavailable */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">What if squads become incapacitated?</span>
                <strong className="text-purple-400">{unavailableTeams} Squads Offline</strong>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={unavailableTeams}
                onChange={(e) => setUnavailableTeams(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 Offline</span>
                <span>5 Offline</span>
              </div>
            </div>

            {/* Shelter Capacity Drop */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">What if shelter structural capacity drops?</span>
                <strong className="text-sky-400">-{shelterDropPercent}% Bed Loss</strong>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={shelterDropPercent}
                onChange={(e) => setShelterDropPercent(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% Loss</span>
                <span>50% Loss</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulated Consequence Projections (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono font-bold text-slate-200 uppercase">
            <span>Projected Crisis Consequences ({timelineStep})</span>
            <OperationalTag type="SIMULATION" />
          </div>

          {/* 4 Consequence Metrics */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block">Projected Distress Requests</span>
              <div className="text-2xl font-bold text-white tabular-nums">
                {sim.projectedRequests} <span className="text-xs font-normal text-slate-400">Signals</span>
              </div>
              <div className="text-[10px] text-rose-400">{sim.criticalMedical} Critical Medical</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block">Potable Water Deficit</span>
              <div className="text-2xl font-bold text-rose-400 tabular-nums">
                {sim.waterShortageLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">Liters</span>
              </div>
              <div className="text-[10px] text-amber-400">Within {timelineStep} horizon</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block">Estimated Response Delay</span>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">
                +{sim.avgResponseDelayMin} <span className="text-xs font-normal text-slate-400">Minutes</span>
              </div>
              <div className="text-[10px] text-slate-400">Due to road obstructions & routing</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase text-slate-400 block">Shelter Overflow Risk</span>
              <div className="text-2xl font-bold text-sky-400 tabular-nums">
                {sim.shelterOverflow > 0 ? `+${sim.shelterOverflow}` : '0'} <span className="text-xs font-normal text-slate-400">Persons</span>
              </div>
              <div className="text-[10px] text-emerald-400">
                {sim.shelterOverflow > 0 ? 'Secondary expansion required' : 'Capacity adequate'}
              </div>
            </div>
          </div>

          {/* AI Recommended Mitigation Protocol */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/40 text-xs space-y-2">
            <span className="font-semibold text-purple-300 font-mono text-[11px] uppercase block">
              AI Recommended Mitigation Strategy:
            </span>
            <div className="space-y-1.5 text-slate-300 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Pre-position amphibious crafts at elevated Sector 4 overpass to bypass road blockages.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Divert emergency water convoys to Northern Expressway corridor before T+12h.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Activate auxiliary high school overflow shelters (+350 beds) to prevent crowd crushing.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
