import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import {
  Share2,
  Sparkles,
  CheckCircle,
  Truck,
  Box,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const ResourceAllocation: React.FC = () => {
  const { requests, resources, teams, selectedRequestId, setSelectedRequestId, allocateResource } = useApp();

  const unassignedRequests = requests.filter(
    (r) => (r.status === 'NEW' || r.status === 'TRIAGED') && r.urgency !== 'LOW'
  );

  const activeRequest = requests.find((r) => r.id === selectedRequestId) || unassignedRequests[0] || requests[0];

  const [selectedRecIndex, setSelectedRecIndex] = useState<number>(0);
  const [allocationDone, setAllocationDone] = useState(false);

  // Dynamic recommendations for active request
  const recommendations = [
    {
      id: 'REC-OPT-1',
      title: 'Optimal Proximity & Ready Buffer (Recommended)',
      resourceId: activeRequest?.type === 'Water' ? 'RES-301' : activeRequest?.type === 'Medical' ? 'RES-302' : 'RES-303',
      resourceName: activeRequest?.type === 'Water' ? 'Potable Water Bulk Tankers' : activeRequest?.type === 'Medical' ? 'Emergency Trauma Kits' : 'Emergency Rations MRE',
      allocatedQuantity: activeRequest?.type === 'Water' ? 2500 : activeRequest?.type === 'Medical' ? 25 : 300,
      unit: activeRequest?.type === 'Water' ? 'Liters' : activeRequest?.type === 'Medical' ? 'Kits' : 'Meals',
      depot: 'Regional Reserve Depot B (North)',
      distanceKm: 2.8,
      etaMinutes: 14,
      teamId: 'TEAM-R07',
      teamName: 'Rapid Flood Rescue Strike Force R-07',
      vehicle: 'Amphibious ARV-04',
      compatibilityScore: 98,
      reason: 'Shortest transit corridor avoiding flooded Musi underpass. Amphibious chassis clears 1.1m road water.'
    },
    {
      id: 'REC-OPT-2',
      title: 'Secondary Surplus Depot (Higher Reserve Buffer)',
      resourceId: activeRequest?.type === 'Water' ? 'RES-301' : activeRequest?.type === 'Medical' ? 'RES-311' : 'RES-303',
      resourceName: activeRequest?.type === 'Water' ? 'Purification Bladders' : activeRequest?.type === 'Medical' ? 'IV Normal Saline Bags' : 'Dry Food Packs',
      allocatedQuantity: activeRequest?.type === 'Water' ? 3000 : activeRequest?.type === 'Medical' ? 40 : 400,
      unit: activeRequest?.type === 'Water' ? 'Liters' : activeRequest?.type === 'Medical' ? 'Bags' : 'Meals',
      depot: 'Humanitarian Central Logistics Yard',
      distanceKm: 5.4,
      etaMinutes: 24,
      teamId: 'LOG-L02',
      teamName: 'Emergency Water Convoy L-02',
      vehicle: 'Water Tanker V-12',
      compatibilityScore: 91,
      reason: 'Larger payload capacity, but detour required via North Ring Flyover adding 10 minutes.'
    },
    {
      id: 'REC-OPT-3',
      title: 'Emergency Mobile Reserve Dispatch',
      resourceId: 'RES-312',
      resourceName: 'Portable Water Purification Units',
      allocatedQuantity: 1,
      unit: 'Unit',
      depot: 'Civil Defense Technical Base',
      distanceKm: 4.1,
      etaMinutes: 19,
      teamId: 'LOG-L03',
      teamName: 'Utility Support Division L-03',
      vehicle: 'Utility Support Rig U-03',
      compatibilityScore: 86,
      reason: 'On-site continuous purification capability (1,000 L/hr) for sustained shelter operations.'
    }
  ];

  const handleApproveSelected = () => {
    const chosen = recommendations[selectedRecIndex];
    if (activeRequest && chosen) {
      allocateResource(chosen.resourceId, activeRequest.id, chosen.allocatedQuantity, chosen.teamId);
      setAllocationDone(true);
      setTimeout(() => setAllocationDone(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <AIDisclaimerBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-400" />
            Smart Resource Matching & Dispatch Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic chain matching: REQUEST → RESOURCE → TEAM → VEHICLE → DESTINATION.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <OperationalTag type="AI_RECOMMENDATION" />
        </div>
      </div>

      {/* Main Matching Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Request (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
            Unassigned Distress Requests ({unassignedRequests.length})
          </div>

          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {unassignedRequests.map((req) => {
              const isSelected = req.id === activeRequest?.id;
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequestId(req.id);
                    setSelectedRecIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                    isSelected
                      ? 'border-sky-500/80 bg-sky-950/20 shadow-md ring-1 ring-sky-500/40'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-400">{req.id}</span>
                    <SeverityBadge severity={req.urgency} size="sm" />
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{req.requesterName}</h4>
                  <p className="text-xs text-slate-300 line-clamp-1">{req.description}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{req.type}</span>
                    <span className="text-emerald-400">{req.peopleCount} people</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Multi-Step Allocation Matcher (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeRequest ? (
            <>
              {/* Request Target Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                    Target Distress Destination
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    Score: {activeRequest.priorityScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {activeRequest.id}: {activeRequest.requesterName} ({activeRequest.type})
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{activeRequest.location}</span>
                    </p>
                  </div>
                  <SeverityBadge severity={activeRequest.urgency} />
                </div>
                <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {activeRequest.description}
                </p>
              </div>

              {/* Step Chain Visualizer */}
              <div className="p-4 rounded-xl border border-sky-900/40 bg-sky-950/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center font-bold">1</span>
                  <span>{activeRequest.type} Request</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold">2</span>
                  <span>{recommendations[selectedRecIndex].resourceName.slice(0, 16)}...</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

                <div className="flex items-center gap-2 text-purple-400">
                  <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-800 flex items-center justify-center font-bold">3</span>
                  <span>{recommendations[selectedRecIndex].vehicle}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

                <div className="flex items-center gap-2 text-sky-400">
                  <span className="w-6 h-6 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center font-bold">4</span>
                  <span>{recommendations[selectedRecIndex].teamId}</span>
                </div>
              </div>

              {/* 3 AI Recommendations Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 font-semibold px-1">
                  <span>AI Recommended Allocation Strategies</span>
                  <span>Select One to Authorize</span>
                </div>

                {recommendations.map((rec, idx) => {
                  const isSelected = selectedRecIndex === idx;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRecIndex(idx)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-emerald-500/80 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/40'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="recSelect"
                            checked={isSelected}
                            onChange={() => setSelectedRecIndex(idx)}
                            className="text-emerald-500 focus:ring-0"
                          />
                          <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                        </div>
                        <span className="font-mono text-xs text-emerald-400 font-bold">
                          Fit: {rec.compatibilityScore}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Resource</span>
                          <span className="font-bold text-slate-200">{rec.allocatedQuantity} {rec.unit}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Transit ETA</span>
                          <span className="font-bold text-emerald-400">{rec.etaMinutes} min ({rec.distanceKm} km)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Squad</span>
                          <span className="font-bold text-purple-300">{rec.teamId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Transport</span>
                          <span className="font-bold text-sky-300">{rec.vehicle}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                        <strong className="text-slate-200">AI Rationale:</strong> {rec.reason}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Approval Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg">
                <div className="text-xs text-slate-400 font-mono">
                  Selected Strategy: <strong className="text-white">Option {selectedRecIndex + 1}</strong>
                </div>

                <div className="flex items-center gap-3">
                  {allocationDone && (
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Dispatched!
                    </span>
                  )}
                  <button
                    onClick={handleApproveSelected}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Authorize Allocation</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-white">All Active Requests Allocated</h4>
              <p className="text-xs text-slate-400 mt-1">Select an existing request or monitor for incoming distress signals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
