import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Flame,
  LifeBuoy,
  Users,
  Home,
  Box,
  Layers,
  ArrowRight,
  Play,
  Cpu,
  Lock,
  WifiOff,
  CheckCircle2,
  FileCheck2,
  BarChart2,
  Compass,
  AlertTriangle,
  Zap,
  MapPin,
  Bot
} from 'lucide-react';

export const LandingPage: React.FC<{ onLaunchCommandCenter: () => void; onOpenAuth: () => void }> = ({
  onLaunchCommandCenter,
  onOpenAuth
}) => {
  const { runDemoScenario, setCurrentView, metrics } = useApp();
  const [activeTab, setActiveTab] = useState<'map' | 'signals' | 'triage'>('map');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 overflow-hidden">
        {/* Subtle tactical grid background */}
        <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Header kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>MISSION-CRITICAL EMERGENCY OPERATIONS PLATFORM</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Disaster Response.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-500">
                Coordinated When Every Second Matters.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed">
              ResQ Nexus unifies emergency requests, resources, shelters, volunteers and field intelligence
              into one intelligent disaster-response command platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <button
                onClick={onLaunchCommandCenter}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl shadow-rose-950/50 hover:shadow-rose-900/60 transition-all cursor-pointer"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  runDemoScenario();
                }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Run Demo Scenario</span>
              </button>

              <button
                onClick={() => setCurrentView('documentation')}
                className="px-5 py-3.5 rounded-xl text-slate-400 hover:text-white font-medium text-sm transition-colors cursor-pointer"
              >
                Explore Platform Architecture
              </button>
            </div>
          </div>

          {/* Live Status Command Bar */}
          <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Active Incidents
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
                {metrics.activeIncidentsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">3 Major Breaches</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Critical Requests
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
                {metrics.criticalRequestsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Triaged & Prioritized</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Available Teams
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {metrics.activeTeamsCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Rescue & Med Units</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Shelter Capacity
              </div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
                {metrics.shelterCapacityPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">1,240 Beds Free</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center col-span-2 sm:col-span-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Resources At Risk
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
                {metrics.resourceShortagesCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Potable Water / Meds</div>
            </div>
          </div>

          {/* Hero Interactive Command Map Visualizer */}
          <div className="mt-8 max-w-6xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
            {/* Visualizer header */}
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs font-mono font-semibold text-slate-200">
                  REAL-TIME OPERATIONAL PICTURE // SECTOR 4 FLOOD INUNDATION
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      activeTab === 'map' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Spatial Map
                  </button>
                  <button
                    onClick={() => setActiveTab('signals')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      activeTab === 'signals' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Distress Stream
                  </button>
                  <button
                    onClick={() => setActiveTab('triage')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      activeTab === 'triage' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AI Triage Feed
                  </button>
                </div>
                <button
                  onClick={onLaunchCommandCenter}
                  className="px-3 py-1 rounded-md bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                >
                  Open Full Screen
                </button>
              </div>
            </div>

            {/* Visualizer Screen */}
            <div className="relative h-[420px] bg-slate-950 overflow-hidden">
              {/* Tactical Radar Grid */}
              <div className="absolute inset-0 tactical-grid opacity-30" />
              <div className="absolute inset-0 tactical-dots opacity-20" />

              {/* River Vector & Hazard Zones */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* River path */}
                <path
                  d="M-50,260 C200,240 350,310 550,270 C750,230 900,320 1200,280"
                  fill="none"
                  stroke="#1E3A8A"
                  strokeWidth="60"
                  strokeOpacity="0.4"
                />
                <path
                  d="M-50,260 C200,240 350,310 550,270 C750,230 900,320 1200,280"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="8"
                  strokeDasharray="6 4"
                  strokeOpacity="0.8"
                />

                {/* Flood Risk Poly */}
                <polygon
                  points="280,180 520,200 680,340 440,380 260,300"
                  fill="#991B1B"
                  fillOpacity="0.18"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Tactical Dispatch Vector */}
                <line
                  x1="320"
                  y1="140"
                  x2="480"
                  y2="250"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Marker: Incident Epicenter */}
              <div className="absolute top-[220px] left-[460px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="relative">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-60 -top-1 -left-1"></span>
                  <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-xl shadow-rose-950">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-rose-500/50 text-[10px] font-mono text-rose-300 shadow">
                  INC-104: Flood Epicenter
                </div>
              </div>

              {/* Marker: Critical Request REQ-1048 */}
              <div className="absolute top-[280px] left-[380px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer">
                <div className="w-5 h-5 rounded-full bg-amber-500 border border-white flex items-center justify-center text-slate-950 shadow-lg">
                  <LifeBuoy className="w-3 h-3" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-amber-500/50 text-[10px] font-mono text-amber-300">
                  REQ-1048 (Dialysis Clinic)
                </div>
              </div>

              {/* Marker: Response Team R-07 */}
              <div className="absolute top-[130px] left-[320px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-slate-950 shadow-lg">
                  <Users className="w-3 h-3" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-500/50 text-[10px] font-mono text-emerald-300">
                  TEAM-R07 (En Route · ETA 12m)
                </div>
              </div>

              {/* Marker: Relief Shelter Central */}
              <div className="absolute top-[120px] left-[720px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-sky-500 border border-white flex items-center justify-center text-slate-950 shadow-lg">
                  <Home className="w-3 h-3" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-sky-500/50 text-[10px] font-mono text-sky-300">
                  Central Shelter (340 Beds Free)
                </div>
              </div>

              {/* Marker: Water Logistics Hub */}
              <div className="absolute top-[320px] left-[780px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-purple-500 border border-white flex items-center justify-center text-slate-950 shadow-lg">
                  <Box className="w-3 h-3" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-purple-500/50 text-[10px] font-mono text-purple-300">
                  Depot B (Tanker V-12)
                </div>
              </div>

              {/* Floating Tactical Overlay HUD */}
              <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md max-w-xs text-xs space-y-1.5 shadow-xl hidden sm:block">
                <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  AI RECOMMENDATION ACTIVE
                </div>
                <div className="font-semibold text-slate-200">
                  Dispatch Amphibious Team R-07 → St. Jude Clinic
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  42 patients isolated by 1.1m floodwaters. Power failing. High-clearance vehicle required.
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800">
                  <span>Confidence: 94%</span>
                  <span className="text-emerald-400">ETA: 12 min</span>
                </div>
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex items-center gap-4 text-[11px] font-mono text-slate-300 shadow-xl">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Crisis Epicenter
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Distress Signal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Response Unit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> Shelter Hub
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why ResQ Nexus? Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
              The Operational Problem
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Why ResQ Nexus?
            </h3>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              During major disasters, the bottleneck is rarely a total absence of supplies.
              It is <strong className="text-white">fragmented information and delayed coordination</strong>.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-white">Crisis Signal Overload</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Emergency call centers receive hundreds of unranked distress calls simultaneously.
                Without automated triage, critical life-support calls get buried under routine requests.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-white">Resource Mismatch & Gridlock</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Supplies sit in dry warehouses 15 miles away while field teams lack boats and fuel to deliver them.
                ResQ Nexus computes optimal multi-variable pairings across inventory, transit, and urgency.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/80 flex items-center justify-center text-sky-400">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-white">Accountability & Verification</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Ad-hoc messaging groups lose critical history. ResQ Nexus records immutable audit trails,
                enforces human sign-off on dispatch, and ensures post-incident learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: The 9-Stage Command Pipeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase">
              Operational Pipeline
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              From Crisis Signals to Coordinated Action
            </h3>
            <p className="text-base text-slate-300">
              A continuous, auditable operational loop connecting victims, coordinators, and field squads.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-mono">
            {[
              { num: '01', title: 'Crisis Signals', desc: 'Distress beacons, 911 calls, SMS reports, and IoT river sensors' },
              { num: '02', title: 'AI Triage', desc: '0-100 priority scoring based on clinical urgency, headcounts & isolation' },
              { num: '03', title: 'Resource Match', desc: 'Optimal matching: Request → Stock → Vehicle → Team → Transit route' },
              { num: '04', title: 'Human Approval', desc: 'Coordinators review explainable rationale before executing action' },
              { num: '05', title: 'Field Operations', desc: 'Real-time telemetry, mission tracking, and offline report sync' }
            ].map((step) => (
              <div key={step.num} className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
                <div className="text-rose-400 font-bold text-sm">{step.num}.</div>
                <div className="font-bold text-slate-200 text-sm font-sans">{step.title}</div>
                <p className="text-slate-400 font-sans text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security: Built for Coordinated Response */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              Enterprise Governance
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built for Coordinated Response
            </h3>
            <p className="text-base text-slate-300">
              Designed according to international humanitarian principles, FEMA NIMS, and strict data privacy standards.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldAlert,
                title: 'Human-in-the-Loop AI',
                desc: 'AI recommends, humans authorize. The system never autonomously dispatches troops or relocates supplies without verified command approval.'
              },
              {
                icon: FileCheck2,
                title: 'Explainable Recommendations',
                desc: 'Every priority score details explicit reasoning: distance, medical urgency, vulnerable populations, and available inventory buffers.'
              },
              {
                icon: Lock,
                title: 'Role-Based Access Control',
                desc: 'Fine-grained permissions for Coordinators, Field Responders, Shelter Staff, Donors, and Public Observers.'
              },
              {
                icon: WifiOff,
                title: 'Offline / Low-Bandwidth Mode',
                desc: 'PWA architecture caches dashboard state locally and queues submitted field intelligence for automatic upload upon reconnection.'
              },
              {
                icon: BarChart2,
                title: 'Relief Optimizer Engine',
                desc: 'Multi-objective integer linear matching balancing life-safety criticality against transport travel times.'
              },
              {
                icon: CheckCircle2,
                title: 'Immutable Auditability',
                desc: 'Every recommendation approval, status transition, and resource deduction is timestamped with actor ID and prior state.'
              }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-semibold text-white">{feature.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-mono font-medium">
            <span>RESQ NEXUS COMMAND CORE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Coordinate Action When It Matters Most?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Explore the live command center with simulated incidents, test the AI triage engine, or trigger the Relief Optimizer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchCommandCenter}
              className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-xl shadow-rose-950/50 transition-all cursor-pointer"
            >
              Launch Command Center
            </button>
            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              Sign In with Role Credentials
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-bold text-slate-200">ResQ Nexus</span>
              <span className="font-mono text-slate-600">v2.4-ENTERPRISE</span>
            </div>
            <p className="text-slate-400">
              AI-powered disaster response coordination. From Crisis Signals to Coordinated Action.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <button onClick={() => setCurrentView('documentation')} className="hover:text-white transition-colors">
              Documentation
            </button>
            <button onClick={() => setCurrentView('simulation')} className="hover:text-white transition-colors">
              Simulation Mode
            </button>
            <button onClick={() => setCurrentView('audit')} className="hover:text-white transition-colors">
              Audit Logs
            </button>
            <button onClick={() => setCurrentView('reports')} className="hover:text-white transition-colors">
              Export Reports
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
