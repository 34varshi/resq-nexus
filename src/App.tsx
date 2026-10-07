import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { CommandCenterDashboard } from './components/dashboard/CommandCenterDashboard';
import { IncidentManagement } from './components/incidents/IncidentManagement';
import { EmergencyRequests } from './components/requests/EmergencyRequests';
import { AITriageEngine } from './components/triage/AITriageEngine';
import { LiveMap } from './components/map/LiveMap';
import { ResourceManagement } from './components/resources/ResourceManagement';
import { ResourceAllocation } from './components/resources/ResourceAllocation';
import { ReliefOptimizer } from './components/optimizer/ReliefOptimizer';
import { ShelterManagement } from './components/shelters/ShelterManagement';
import { TeamManagement } from './components/teams/TeamManagement';
import { VolunteerManagement } from './components/volunteers/VolunteerManagement';
import { FieldReports } from './components/field/FieldReports';
import { AlertCenter } from './components/alerts/AlertCenter';
import { AIAssistant } from './components/ai/AIAssistant';
import { ResourceForecasting } from './components/forecasting/ResourceForecasting';
import { SimulationEngine } from './components/simulation/SimulationEngine';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ImpactDashboard } from './components/impact/ImpactDashboard';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { AuditLogs } from './components/audit/AuditLogs';
import { TechnicalDocs } from './components/documentation/TechnicalDocs';
import { OfflineCacheModal } from './components/common/OfflineCacheModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentView, setCurrentView, notification, setNotification } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState(false);

  // If on landing page, display the full marketing landing view
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenOfflineModal={() => setOfflineModalOpen(true)}
        />
        <LandingPage
          onLaunchCommandCenter={() => setCurrentView('dashboard')}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <CommandPalette />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        <OfflineCacheModal isOpen={offlineModalOpen} onClose={() => setOfflineModalOpen(false)} />
      </div>
    );
  }

  // Inside Operational Command Center
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Universal Top Bar */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenOfflineModal={() => setOfflineModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 tactical-dots">
          <div className="max-w-[1600px] mx-auto pb-16">
            {currentView === 'dashboard' && <CommandCenterDashboard />}
            {currentView === 'incidents' && <IncidentManagement />}
            {currentView === 'requests' && <EmergencyRequests />}
            {currentView === 'triage' && <AITriageEngine />}
            {currentView === 'map' && <LiveMap />}
            {currentView === 'resources' && <ResourceManagement />}
            {currentView === 'resource-allocation' && <ResourceAllocation />}
            {currentView === 'optimizer' && <ReliefOptimizer />}
            {currentView === 'shelters' && <ShelterManagement />}
            {currentView === 'teams' && <TeamManagement />}
            {currentView === 'volunteers' && <VolunteerManagement />}
            {currentView === 'field-reports' && <FieldReports />}
            {currentView === 'alerts' && <AlertCenter />}
            {currentView === 'ai-assistant' && <AIAssistant />}
            {currentView === 'forecasting' && <ResourceForecasting />}
            {currentView === 'simulation' && <SimulationEngine />}
            {currentView === 'analytics' && <AnalyticsDashboard />}
            {currentView === 'impact' && <ImpactDashboard />}
            {currentView === 'reports' && <ReportGenerator />}
            {currentView === 'audit' && <AuditLogs />}
            {currentView === 'documentation' && <TechnicalDocs />}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <OfflineCacheModal isOpen={offlineModalOpen} onClose={() => setOfflineModalOpen(false)} />
      <OfflineIndicator onOpenCacheModal={() => setOfflineModalOpen(true)} />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium animate-in slide-in-from-bottom-5 bg-slate-900 border-slate-700 text-slate-100">
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          <span className="leading-snug">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
