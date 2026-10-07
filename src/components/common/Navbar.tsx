import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  Sparkles,
  RefreshCw,
  Play,
  Shield,
  Layers,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';

export const Navbar: React.FC<{ onOpenAuth: () => void; onOpenOfflineModal?: () => void }> = ({
  onOpenAuth,
  onOpenOfflineModal
}) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchUserRole,
    alerts,
    isOffline,
    setIsOffline,
    lastSyncedTime,
    offlineQueueCount,
    syncOfflineQueue,
    runDemoScenario,
    demoRunning,
    setCommandPaletteOpen
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'EMERGENCY_COORDINATOR', label: 'Emergency Coordinator' },
    { role: 'FIELD_RESPONDER', label: 'Field Responder' },
    { role: 'ADMIN', label: 'System Administrator' },
    { role: 'SHELTER_MANAGER', label: 'Shelter Manager' },
    { role: 'VOLUNTEER', label: 'Volunteer Responder' },
    { role: 'DONOR_PROVIDER', label: 'Relief Logistics / Donor' },
    { role: 'VIEWER', label: 'Public / Press Viewer' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-full">
        {/* Zone 1: Single text element wordmark + tactical status indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-rose-950 border border-rose-500/40 flex items-center justify-center text-white shadow-lg shadow-rose-950/40">
              <span className="font-mono font-bold text-sm">RN</span>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
                ResQ Nexus
              </div>
              <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase hidden sm:block">
                Crisis Command Platform
              </div>
            </div>
          </button>

          {/* Active Incident Operational Tag */}
          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-mono text-slate-300 font-medium">INC-104: Urban Inundation</span>
            <span className="text-slate-500">·</span>
            <span className="text-rose-400 font-mono text-[11px] font-semibold">LEVEL 4 CRITICAL</span>
          </div>
        </div>

        {/* Zone 2: Fast Navigation Shortcuts (clean typography) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-400">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`transition-colors hover:text-white ${currentView === 'dashboard' ? 'text-rose-400 font-semibold' : ''}`}
          >
            Command Center
          </button>
          <button
            onClick={() => setCurrentView('map')}
            className={`transition-colors hover:text-white ${currentView === 'map' ? 'text-rose-400 font-semibold' : ''}`}
          >
            Live Map
          </button>
          <button
            onClick={() => setCurrentView('triage')}
            className={`transition-colors hover:text-white ${currentView === 'triage' ? 'text-rose-400 font-semibold' : ''}`}
          >
            AI Triage
          </button>
          <button
            onClick={() => setCurrentView('optimizer')}
            className={`transition-colors hover:text-white ${currentView === 'optimizer' ? 'text-rose-400 font-semibold' : ''}`}
          >
            Relief Optimizer
          </button>
          <button
            onClick={() => setCurrentView('simulation')}
            className={`transition-colors hover:text-white ${currentView === 'simulation' ? 'text-rose-400 font-semibold' : ''}`}
          >
            Simulation
          </button>
        </nav>

        {/* Zone 3: Operational Controls & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search palette affordance */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs"
            title="Search incidents, requests, teams (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* 1-Click Demo Scenario Runner */}
          <button
            onClick={runDemoScenario}
            disabled={demoRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              demoRunning
                ? 'bg-rose-900/40 text-rose-300 border border-rose-700 animate-pulse'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title="Run 1-click end-to-end disaster scenario walkthrough"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">{demoRunning ? 'Simulating...' : 'Demo Scenario'}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Connectivity Status & Offline Cache Trigger */}
          <div className="flex items-center">
            {isOffline ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/60 text-[11px] text-amber-300 font-mono">
                <button
                  onClick={() => onOpenOfflineModal && onOpenOfflineModal()}
                  className="flex items-center gap-1 text-amber-300 hover:text-white"
                  title="View service worker cache & disaster telemetry"
                >
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">OFFLINE ({offlineQueueCount})</span>
                </button>
                <button
                  onClick={syncOfflineQueue}
                  className="hover:underline flex items-center gap-1 text-amber-200 ml-1 border-l border-amber-800/80 pl-1.5"
                  title="Click to sync queued actions"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenOfflineModal ? onOpenOfflineModal() : setIsOffline(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-[11px] text-slate-400 font-mono transition-colors"
                title="Service Worker Active — Click to manage offline disaster cache"
              >
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>ONLINE (SW READY)</span>
              </button>
            )}
          </div>

          {/* Alerts Notification dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className="relative p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-mono font-bold text-white ring-2 ring-slate-950">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-semibold text-slate-200">Emergency Alerts</span>
                  <span className="text-[11px] font-mono text-rose-400">{activeAlerts.length} Active</span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {activeAlerts.slice(0, 4).map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        setCurrentView('alerts');
                        setNotifMenuOpen(false);
                      }}
                      className="p-2 rounded bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-rose-400 font-semibold">{alt.type}</span>
                        <span className="text-slate-500">{alt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alt.description}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setCurrentView('alerts');
                    setNotifMenuOpen(false);
                  }}
                  className="w-full mt-2 py-1.5 text-center text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  View Alert Center →
                </button>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-colors text-xs text-left"
            >
              <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-mono text-[11px] font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-xs">
                  <div className="font-semibold text-slate-200">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.organization}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Badge: {currentUser.badgeNumber || 'N/A'}
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Switch Perspective
                  </div>
                  {rolesList.map(({ role, label }) => (
                    <button
                      key={role}
                      onClick={() => {
                        switchUserRole(role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors ${
                        currentUser.role === role
                          ? 'bg-rose-950/40 text-rose-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{label}</span>
                      {currentUser.role === role && <UserCheck className="w-3.5 h-3.5 text-rose-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-slate-800 rounded-md"
                  >
                    Switch Account / Portal Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
