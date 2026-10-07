import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Flame,
  LifeBuoy,
  Sparkles,
  MapPin,
  Box,
  Share2,
  Sliders,
  Home,
  Users,
  HeartHandshake,
  FileText,
  BellRing,
  Bot,
  TrendingUp,
  Cpu,
  BarChart3,
  Award,
  Download,
  ScrollText,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentView, setCurrentView, requests, alerts, resources, aiRecommendations } = useApp();

  const criticalReqCount = requests.filter(
    (r) => (r.urgency === 'CRITICAL' || r.urgency === 'HIGH') && r.status !== 'RESOLVED' && r.status !== 'CLOSED'
  ).length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length;
  const lowStockCount = resources.filter((r) => r.status === 'LOW_STOCK' || r.available < r.lowStockThreshold).length;
  const pendingRecCount = aiRecommendations.filter((r) => r.status === 'PENDING').length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: Flame, badge: '12' },
    { id: 'requests', label: 'Emergency Requests', icon: LifeBuoy, badge: criticalReqCount > 0 ? `${criticalReqCount}` : undefined, badgeColor: 'rose' },
    { id: 'triage', label: 'AI Triage', icon: Sparkles, badge: 'AI', badgeColor: 'sky' },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'resources', label: 'Resources', icon: Box, badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined, badgeColor: 'amber' },
    { id: 'resource-allocation', label: 'Resource Allocation', icon: Share2 },
    { id: 'optimizer', label: 'Relief Optimizer', icon: Sliders, badge: 'NEW', badgeColor: 'emerald' },
    { id: 'shelters', label: 'Shelters', icon: Home },
    { id: 'teams', label: 'Response Teams', icon: Users },
    { id: 'volunteers', label: 'Volunteers', icon: HeartHandshake },
    { id: 'field-reports', label: 'Field Reports', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: BellRing, badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : undefined, badgeColor: 'rose' },
    { id: 'ai-assistant', label: 'NEXUS AI Assistant', icon: Bot, badge: pendingRecCount > 0 ? `${pendingRecCount} recs` : undefined, badgeColor: 'sky' },
    { id: 'forecasting', label: 'Forecasting', icon: TrendingUp },
    { id: 'simulation', label: 'Simulation & What-If', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'impact', label: 'Impact Metrics', icon: Award },
    { id: 'reports', label: 'Report Generator', icon: Download },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    { id: 'documentation', label: 'Documentation', icon: BookOpen }
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-950/95 border-r border-slate-800/80 transition-all duration-300 z-30 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar toggle button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/60">
        {!collapsed && (
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Command Center
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-rose-950/50 text-white border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <>
                  <span className="truncate text-left flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        item.badgeColor === 'rose'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : item.badgeColor === 'sky'
                          ? 'bg-sky-950/80 text-sky-300 border border-sky-800/80'
                          : item.badgeColor === 'amber'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                          : item.badgeColor === 'emerald'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/60 text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-mono">
            <span>RESQ PROTOCOL</span>
            <span className="text-emerald-400">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Decisions logged in immutable audit
          </div>
        </div>
      )}
    </aside>
  );
};
