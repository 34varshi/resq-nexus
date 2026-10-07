import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Incident,
  EmergencyRequest,
  Resource,
  Shelter,
  ResponseTeam,
  TeamStatus,
  Volunteer,
  Alert,
  FieldReport,
  AuditLog,
  AIRecommendation,
  UserProfile,
  UserRole,
  RequestType,
  SeverityLevel
} from '../types';
import {
  INITIAL_USER,
  INITIAL_INCIDENTS,
  INITIAL_REQUESTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_TEAMS,
  INITIAL_VOLUNTEERS,
  INITIAL_ALERTS,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FIELD_REPORTS,
  DEMO_USERS
} from '../data/mockData';

export interface ActiveTeamMission {
  teamId: string;
  requestId?: string;
  incidentId?: string;
  destinationName: string;
  startCoords: { lat: number; lng: number };
  targetCoords: { lat: number; lng: number };
  currentCoords: { lat: number; lng: number };
  progress: number; // 0.0 to 1.0
  etaMinutes: number;
  initialEtaMinutes: number;
}

interface AppContextType {
  // Navigation & View
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedIncidentId: string;
  setSelectedIncidentId: (id: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Auth & Roles
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  loginAs: (user: UserProfile) => void;

  // Domain Data
  incidents: Incident[];
  requests: EmergencyRequest[];
  resources: Resource[];
  shelters: Shelter[];
  teams: ResponseTeam[];
  volunteers: Volunteer[];
  alerts: Alert[];
  fieldReports: FieldReport[];
  auditLogs: AuditLog[];
  aiRecommendations: AIRecommendation[];

  // Active Simulated Team Missions for Live Map Movement
  activeMissions: Record<string, ActiveTeamMission>;

  // Operational Actions
  addIncident: (incidentData: Partial<Incident>) => Promise<Incident>;
  addEmergencyRequest: (req: Omit<EmergencyRequest, 'id' | 'createdAt' | 'priorityScore' | 'aiClassification' | 'aiReasoning' | 'verified' | 'status'>) => Promise<EmergencyRequest>;
  updateRequestStatus: (id: string, status: EmergencyRequest['status'], teamId?: string) => Promise<void>;
  triageRequest: (id: string) => Promise<void>;
  batchTriageAll: () => Promise<void>;

  addResource: (res: Omit<Resource, 'id'>) => Promise<void>;
  allocateResource: (resourceId: string, requestId: string, quantity: number, teamId?: string) => Promise<boolean>;
  replenishResource: (resourceId: string, quantity: number) => Promise<void>;

  updateShelterOccupancy: (shelterId: string, delta: number) => Promise<void>;
  findNearestShelters: (lat: number, lng: number, neededBeds?: number) => Shelter[];

  dispatchTeam: (teamId: string, missionDescription: string, incidentId?: string, targetCoords?: { lat: number; lng: number }, requestId?: string) => void;
  updateTeamStatus: (teamId: string, status: TeamStatus, location?: string, mission?: string) => Promise<void>;
  fastForwardTeamArrival: (teamId: string) => void;
  matchVolunteersForRequest: (requestType: RequestType) => Volunteer[];

  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;

  submitFieldReport: (report: Omit<FieldReport, 'id' | 'timestamp' | 'status' | 'aiClassification' | 'aiOperationalImpact' | 'suggestedAction'>) => Promise<void>;

  approveAIRecommendation: (recId: string) => void;
  rejectAIRecommendation: (recId: string) => void;

  // Demo & Simulation
  runDemoScenario: () => void;
  demoRunning: boolean;
  demoStep: number;
  resetToDefaultData: () => Promise<void>;

  // Offline Architecture
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  lastSyncedTime: string;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;

  // KPI Metrics (Calculated)
  metrics: {
    activeIncidentsCount: number;
    criticalRequestsCount: number;
    peopleAffectedTotal: number;
    availableResourcePercent: number;
    activeTeamsCount: number;
    shelterCapacityPercent: number;
    resourceShortagesCount: number;
  };

  // Toast / System Notification
  notification: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  setNotification: (notif: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-104');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // User & Role State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);

  // Main Datasets
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [requests, setRequests] = useState<EmergencyRequest[]>(INITIAL_REQUESTS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [teams, setTeams] = useState<ResponseTeam[]>(INITIAL_TEAMS);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(INITIAL_VOLUNTEERS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(INITIAL_FIELD_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);

  // Active Simulated Team Missions
  const [activeMissions, setActiveMissions] = useState<Record<string, ActiveTeamMission>>({});

  // Offline state
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('10:42 AM');
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);

  // Demo runner state
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // Feedback notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // 1. Synchronize state from Backend REST API on mount
  useEffect(() => {
    fetch('/api/state')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((payload) => {
        if (payload?.data) {
          const d = payload.data;
          if (Array.isArray(d.incidents) && d.incidents.length > 0) setIncidents(d.incidents);
          if (Array.isArray(d.requests) && d.requests.length > 0) setRequests(d.requests);
          if (Array.isArray(d.resources) && d.resources.length > 0) setResources(d.resources);
          if (Array.isArray(d.shelters) && d.shelters.length > 0) setShelters(d.shelters);
          if (Array.isArray(d.teams) && d.teams.length > 0) setTeams(d.teams);
          if (Array.isArray(d.volunteers) && d.volunteers.length > 0) setVolunteers(d.volunteers);
          if (Array.isArray(d.alerts) && d.alerts.length > 0) setAlerts(d.alerts);
          if (Array.isArray(d.fieldReports) && d.fieldReports.length > 0) setFieldReports(d.fieldReports);
          if (Array.isArray(d.auditLogs) && d.auditLogs.length > 0) setAuditLogs(d.auditLogs);
          setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      })
      .catch((err) => {
        console.info('[ResQ Nexus] Running in local resilient state mode:', err.message);
      });
  }, []);

  // 2. Simulated Real-Time Movement Ticker for En-Route Response Teams
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMissions((prevMissions) => {
        const missionKeys = Object.keys(prevMissions);
        if (missionKeys.length === 0) return prevMissions;

        const updated = { ...prevMissions };
        let hasChanges = false;

        missionKeys.forEach((key) => {
          const mission = updated[key];
          if (mission.progress < 1.0) {
            // Increment progress by 12% per tick (~15 seconds full arrival for demo)
            const nextProgress = Math.min(1.0, mission.progress + 0.12);
            const remainingEta = Math.max(0, Math.round(mission.initialEtaMinutes * (1.0 - nextProgress)));

            const currentLat = mission.startCoords.lat + (mission.targetCoords.lat - mission.startCoords.lat) * nextProgress;
            const currentLng = mission.startCoords.lng + (mission.targetCoords.lng - mission.startCoords.lng) * nextProgress;

            updated[key] = {
              ...mission,
              progress: nextProgress,
              etaMinutes: remainingEta,
              currentCoords: { lat: currentLat, lng: currentLng }
            };
            hasChanges = true;

            // Also update team current position in teams list
            setTeams((currTeams) =>
              currTeams.map((t) => (t.id === mission.teamId ? { ...t, coordinates: { lat: currentLat, lng: currentLng } } : t))
            );

            // On Arrival (progress = 1.0)
            if (nextProgress >= 1.0) {
              setTeams((currTeams) =>
                currTeams.map((t) =>
                  t.id === mission.teamId
                    ? {
                        ...t,
                        status: 'ON_SITE',
                        location: mission.destinationName,
                        currentMission: `Arrived on-site at ${mission.destinationName}`
                      }
                    : t
                )
              );

              // Update linked request to IN_PROGRESS if exists
              if (mission.requestId) {
                setRequests((currReqs) =>
                  currReqs.map((r) =>
                    r.id === mission.requestId
                      ? { ...r, status: 'IN_PROGRESS', assignedTeamId: mission.teamId }
                      : r
                  )
                );

                // Notify backend
                fetch(`/api/requests/${mission.requestId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'IN_PROGRESS', teamId: mission.teamId })
                }).catch(() => {});
              }

              // Notify backend for team status
              fetch(`/api/teams/${mission.teamId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  status: 'ON_SITE',
                  location: mission.destinationName,
                  mission: `On-site at ${mission.destinationName}`
                })
              }).catch(() => {});

              // System Notification & Audit
              setNotification({
                message: `Unit ${mission.teamId} reached destination on-site! Operations now IN_PROGRESS.`,
                type: 'success'
              });

              addAuditLog({
                actorName: 'Tactical AVL Telemetry',
                actorRole: 'SYSTEM_AUTOMATION',
                action: `Unit ${mission.teamId} arrived on-site at ${mission.destinationName}; Request #${mission.requestId || 'N/A'} transitioned to IN_PROGRESS`,
                affectedResource: mission.teamId,
                approvalStatus: 'AUTO_LOGGED'
              });
            }
          }
        });

        return hasChanges ? updated : prevMissions;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null), 4000;
      });
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const switchUserRole = (role: UserRole) => {
    const foundUser = DEMO_USERS.find((u) => u.role === role);
    if (foundUser) {
      setCurrentUser(foundUser);
      setNotification({
        message: `Switched perspective to ${foundUser.name} (${foundUser.role})`,
        type: 'info'
      });
    }
  };

  const loginAs = (user: UserProfile) => {
    setCurrentUser(user);
    setNotification({
      message: `Signed in as ${user.name} (${user.role})`,
      type: 'success'
    });
  };

  // Helper to add audit log
  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 3. CREATE INCIDENT (Cross-module synchronization)
  const addIncident = async (incidentData: Partial<Incident>): Promise<Incident> => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });

      if (res.ok) {
        const payload = await res.json();
        const createdIncident = payload.incident;

        setIncidents((prev) => [createdIncident, ...prev]);
        setSelectedIncidentId(createdIncident.id);

        // Fetch refreshed state to synchronize generated linked requests & alerts
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          if (stateData?.data) {
            setRequests(stateData.data.requests);
            setAlerts(stateData.data.alerts);
            setAuditLogs(stateData.data.auditLogs);
          }
        }

        setNotification({
          message: `Incident ${createdIncident.id} ("${createdIncident.title}") created & activated across COP platform.`,
          type: 'success'
        });

        return createdIncident;
      }
    } catch (err) {
      console.warn('[ResQ Nexus] Falling back to client-side incident creation:', err);
    }

    // Local resilient fallback if server is unreachable
    const nextNum = 100 + incidents.length + 1;
    const id = incidentData.id || `INC-${nextNum}`;
    const newInc: Incident = {
      id,
      title: incidentData.title || 'New Crisis Incident',
      type: incidentData.type || 'Flood',
      location: incidentData.location || 'Metropolitan Disaster Sector',
      coordinates: incidentData.coordinates || { lat: 17.385, lng: 78.4867 },
      severity: incidentData.severity || 'CRITICAL',
      status: incidentData.status || 'ACTIVE',
      peopleAffected: Number(incidentData.peopleAffected) || 1200,
      startedAt: incidentData.startedAt || 'Just now',
      responseTeams: incidentData.responseTeams || [],
      riskLevel: incidentData.severity as any || 'CRITICAL',
      primaryRisks: incidentData.primaryRisks || ['Flash inundation', 'Power outage'],
      aiAnalysis: incidentData.aiAnalysis || {
        severity: incidentData.severity || 'CRITICAL',
        confidence: 94,
        estimatedAffected: Number(incidentData.peopleAffected) || 1200,
        aiReasoning: `Rapid disaster escalation observed at ${incidentData.location}. Automated COP telemetry activated.`,
        riskFactors: ['Rapid flood stage escalation'],
        priorityFactors: ['Civilians in direct hazard path'],
        resourceGaps: ['Potable Water Bulk Tankers', 'Medical Kits'],
        recommendedActions: ['Pre-position emergency squads']
      },
      timeline: [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Incident Declared & Activated',
          description: `Emergency declared at ${incidentData.location}.`,
          badge: 'ACTIVATION',
          actor: currentUser.name
        }
      ]
    };

    setIncidents((prev) => [newInc, ...prev]);
    setSelectedIncidentId(id);

    // Generate linked request locally
    const linkedReq: EmergencyRequest = {
      id: `REQ-${Math.floor(1085 + Math.random() * 800)}`,
      incidentId: id,
      type: 'Medical',
      requesterName: `Sector Medical Unit (${newInc.location.split(',')[0]})`,
      contact: '+1 (555) 720-0911',
      location: newInc.location,
      coordinates: newInc.coordinates,
      peopleCount: Math.max(15, Math.floor(newInc.peopleAffected * 0.05)),
      urgency: newInc.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      description: `Acute distress generated from ${newInc.title}. Medical trauma packs required.`,
      status: 'TRIAGED',
      priorityScore: 92,
      aiClassification: 'INCIDENT_ACUTE_CASUALTY_STABILIZATION',
      aiReasoning: [`Directly linked to Incident #${id}`, 'High headcount exposure'],
      vulnerablePopulation: true,
      createdAt: 'Just now',
      verified: true
    };
    setRequests((prev) => [linkedReq, ...prev]);

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Created and activated Incident #${id}: "${newInc.title}"`,
      incidentId: id,
      approvalStatus: 'APPROVED'
    });

    setNotification({
      message: `Incident ${id} activated across command platform.`,
      type: 'success'
    });

    return newInc;
  };

  // 4. ADD EMERGENCY REQUEST
  const addEmergencyRequest = async (
    data: Omit<EmergencyRequest, 'id' | 'createdAt' | 'priorityScore' | 'aiClassification' | 'aiReasoning' | 'verified' | 'status'>
  ): Promise<EmergencyRequest> => {
    // Attempt real Python ML Triage calculation
    let mlPrediction: any = null;
    try {
      const triageRes = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (triageRes.ok) {
        const tJson = await triageRes.json();
        mlPrediction = tJson.prediction;
      }
    } catch {}

    const score = mlPrediction?.priorityScore || calculatePriorityScore(data.type, data.urgency, data.peopleCount, data.vulnerablePopulation);
    const reasoning = mlPrediction?.aiReasoning || generateAIReasoning(data.type, data.urgency, data.peopleCount, data.vulnerablePopulation);
    const classification = mlPrediction?.classification || `AI_${data.type.toUpperCase()}_SUPERVISED_TRIAGED`;

    const newReq: EmergencyRequest = {
      ...data,
      id: `REQ-${Math.floor(1080 + Math.random() * 900)}`,
      status: 'TRIAGED',
      priorityScore: score,
      aiClassification: classification,
      aiReasoning: reasoning,
      createdAt: 'Just now',
      verified: true
    };

    // Send to backend
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq)
    }).catch(() => {});

    setRequests((prev) => [newReq, ...prev]);

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Lodged and triaged Emergency Request ${newReq.id} (${newReq.type}, ${newReq.peopleCount} people; ML Score ${score}/100)`,
      incidentId: newReq.incidentId,
      approvalStatus: 'AUTO_LOGGED'
    });

    setNotification({
      message: `Emergency Request ${newReq.id} received & triaged with Priority Score ${score}/100`,
      type: 'success'
    });

    return newReq;
  };

  // 5. UPDATE REQUEST STATUS (Full Lifecycle: NEW -> TRIAGED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> VERIFIED -> CLOSED)
  const updateRequestStatus = async (id: string, status: EmergencyRequest['status'], teamId?: string): Promise<void> => {
    // Backend API call
    fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, teamId })
    }).catch(() => {});

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const oldStatus = r.status;
          const updated = { ...r, status, ...(teamId ? { assignedTeamId: teamId } : {}) };

          addAuditLog({
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: `Lifecycle update for Request ${id}: ${oldStatus} -> ${status}${teamId ? ` (Assigned: Team ${teamId})` : ''}`,
            incidentId: r.incidentId,
            previousState: oldStatus,
            newState: status,
            approvalStatus: 'APPROVED'
          });

          return updated;
        }
        return r;
      })
    );

    // Cross-module update: Response Team status
    if (teamId) {
      setTeams((prevTeams) =>
        prevTeams.map((t) => {
          if (t.id === teamId) {
            let nextStatus = t.status;
            let mission = t.currentMission;
            if (status === 'ASSIGNED') {
              nextStatus = 'EN_ROUTE';
              mission = `Assigned to ${id}`;
            } else if (status === 'IN_PROGRESS') {
              nextStatus = 'ON_SITE';
              mission = `On-site at ${id}`;
            } else if (status === 'RESOLVED' || status === 'CLOSED') {
              nextStatus = 'AVAILABLE';
              mission = undefined;
            }
            return { ...t, status: nextStatus, currentMission: mission };
          }
          return t;
        })
      );

      // Trigger animated mission on Live Map if transitioning to ASSIGNED
      if (status === 'ASSIGNED') {
        const targetReq = requests.find((r) => r.id === id);
        dispatchTeam(
          teamId,
          `Assigned to ${id} (${targetReq?.type || 'Emergency'} - ${targetReq?.location || 'Sector 4'})`,
          targetReq?.incidentId,
          targetReq?.coordinates,
          id
        );
      }
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      setActiveMissions((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (next[k].requestId === id) {
            delete next[k];
          }
        });
        return next;
      });
    }

    setNotification({
      message: `Request ${id} status updated to ${status}`,
      type: status === 'CLOSED' ? 'success' : 'info'
    });
  };

  // 6. REAL ML TRIAGE REQUEST
  const triageRequest = async (id: string): Promise<void> => {
    const target = requests.find((r) => r.id === id);
    if (!target) return;

    let mlPrediction: any = null;
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      if (res.ok) {
        const payload = await res.json();
        mlPrediction = payload.prediction;
      }
    } catch {}

    const score = mlPrediction?.priorityScore || calculatePriorityScore(target.type, target.urgency, target.peopleCount, target.vulnerablePopulation);
    const reasoning = mlPrediction?.aiReasoning || generateAIReasoning(target.type, target.urgency, target.peopleCount, target.vulnerablePopulation);
    const classification = mlPrediction?.classification || target.aiClassification;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'TRIAGED',
              priorityScore: score,
              aiReasoning: reasoning,
              aiClassification: classification
            }
          : r
      )
    );

    setNotification({
      message: `Request ${id} evaluated by Supervised ML Model: Priority ${score}/100`,
      type: 'info'
    });
  };

  const batchTriageAll = async (): Promise<void> => {
    const pending = requests.filter((r) => r.status === 'NEW');
    setRequests((prev) =>
      prev.map((r) => {
        if (r.status === 'NEW') {
          return {
            ...r,
            status: 'TRIAGED',
            priorityScore: calculatePriorityScore(r.type, r.urgency, r.peopleCount, r.vulnerablePopulation),
            aiReasoning: generateAIReasoning(r.type, r.urgency, r.peopleCount, r.vulnerablePopulation)
          };
        }
        return r;
      })
    );

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Batch Supervised ML Triage executed across ${pending.length} incoming distress beacons`,
      approvalStatus: 'AUTO_LOGGED'
    });

    setNotification({
      message: `Batch AI Triage successfully processed ${pending.length} pending distress requests.`,
      type: 'success'
    });
  };

  // 7. RESOURCE ALLOCATION & TEAM DISPATCH SYNCHRONIZATION
  const allocateResource = async (resourceId: string, requestId: string, quantity: number, teamId?: string): Promise<boolean> => {
    // Backend API sync
    fetch('/api/allocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId, requestId, quantity, teamId })
    }).catch(() => {});

    let resourceObj = resources.find((r) => r.id === resourceId);
    const targetRequest = requests.find((r) => r.id === requestId);

    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          const newAvail = Math.max(0, res.available - quantity);
          const newRes = (res.reserved || 0) + quantity;
          const nextStatus = newAvail < res.lowStockThreshold ? 'LOW_STOCK' : res.status;

          // If crossed threshold, create alert
          if (newAvail < res.lowStockThreshold && res.status !== 'LOW_STOCK') {
            const newAlert: Alert = {
              id: `ALT-RES-${Date.now().toString().slice(-4)}`,
              type: 'Resource Shortage',
              title: `LOW INVENTORY ALERT: ${res.name}`,
              severity: 'HIGH',
              timestamp: 'Just now',
              location: res.location,
              description: `${res.name} stock fallen to ${newAvail.toLocaleString()} ${res.unit} (threshold: ${res.lowStockThreshold.toLocaleString()} ${res.unit})`,
              recommendedAction: 'Order immediate mutual-aid replenishment.',
              status: 'OPEN'
            };
            setAlerts((curr) => [newAlert, ...curr]);
          }

          return { ...res, available: newAvail, reserved: newRes, status: nextStatus };
        }
        return res;
      })
    );

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            assignedResourceId: resourceId,
            assignedTeamId: teamId || req.assignedTeamId,
            status: req.status === 'NEW' || req.status === 'TRIAGED' ? 'ASSIGNED' : req.status
          };
        }
        return req;
      })
    );

    if (teamId && targetRequest) {
      dispatchTeam(
        teamId,
        `Transporting ${quantity} ${resourceObj?.unit || 'units'} to ${targetRequest.id} (${targetRequest.location})`,
        targetRequest.incidentId,
        targetRequest.coordinates,
        targetRequest.id
      );
    }

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Approved allocation of ${quantity} ${resourceObj?.unit || 'units'} of ${resourceObj?.name || resourceId} to Request ${requestId}${teamId ? ` via Team ${teamId}` : ''}`,
      affectedResource: resourceId,
      incidentId: targetRequest?.incidentId,
      approvalStatus: 'APPROVED'
    });

    setNotification({
      message: `Allocated ${quantity} ${resourceObj?.unit || 'units'} to Request ${requestId}${teamId ? ` (Dispatched ${teamId})` : ''}`,
      type: 'success'
    });

    return true;
  };

  const addResource = async (res: Omit<Resource, 'id'>): Promise<void> => {
    const newRes: Resource = {
      ...res,
      id: `RES-${Math.floor(350 + Math.random() * 500)}`
    };
    setResources((prev) => [newRes, ...prev]);

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Registered new inventory asset ${newRes.name} (${newRes.quantity} ${newRes.unit})`,
      affectedResource: newRes.id,
      newState: 'AVAILABLE',
      approvalStatus: 'APPROVED'
    });

    setNotification({
      message: `Asset ${newRes.name} logged into inventory`,
      type: 'success'
    });
  };

  const replenishResource = async (resourceId: string, quantity: number): Promise<void> => {
    fetch('/api/resources/replenish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceId, quantity })
    }).catch(() => {});

    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resourceId) {
          const nextAvail = r.available + quantity;
          return {
            ...r,
            available: nextAvail,
            quantity: r.quantity + quantity,
            status: nextAvail >= r.lowStockThreshold ? 'AVAILABLE' : r.status
          };
        }
        return r;
      })
    );

    setNotification({
      message: `Replenished +${quantity} units to inventory stock`,
      type: 'success'
    });
  };

  // 8. DISPATCH TEAM WITH LIVE SIMULATED TRANSIT
  const dispatchTeam = (
    teamId: string,
    missionDescription: string,
    incidentId?: string,
    targetCoords?: { lat: number; lng: number },
    requestId?: string
  ) => {
    const team = teams.find((t) => t.id === teamId);
    const startLat = team?.coordinates?.lat || 17.385;
    const startLng = team?.coordinates?.lng || 78.486;

    const destCoords = targetCoords || { lat: 17.388, lng: 78.489 };
    const distKm = Math.hypot(destCoords.lat - startLat, destCoords.lng - startLng) * 111;
    const initialEta = Math.max(8, Math.round(distKm * 4.5));

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            status: 'EN_ROUTE',
            currentMission: missionDescription
          };
        }
        return t;
      })
    );

    // Register active mission for Live Map animated movement
    setActiveMissions((prev) => ({
      ...prev,
      [teamId]: {
        teamId,
        requestId,
        incidentId: incidentId || 'INC-104',
        destinationName: requestId ? `Request #${requestId}` : (incidentId ? `Incident #${incidentId}` : 'Sector 4 Zone'),
        startCoords: { lat: startLat, lng: startLng },
        targetCoords: destCoords,
        currentCoords: { lat: startLat, lng: startLng },
        progress: 0.0,
        etaMinutes: initialEta,
        initialEtaMinutes: initialEta
      }
    }));

    // Update backend
    fetch(`/api/teams/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'EN_ROUTE', mission: missionDescription })
    }).catch(() => {});

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Dispatched Unit ${teamId}: "${missionDescription}" (ETA: ${initialEta} min)`,
      incidentId: incidentId || 'INC-104',
      affectedResource: teamId,
      previousState: 'AVAILABLE',
      newState: 'EN_ROUTE',
      approvalStatus: 'APPROVED'
    });

    setNotification({
      message: `Unit ${teamId} dispatched! Simulated transit moving on Live Map.`,
      type: 'success'
    });
  };

  const fastForwardTeamArrival = (teamId: string) => {
    setActiveMissions((prev) => {
      if (!prev[teamId]) return prev;
      return {
        ...prev,
        [teamId]: {
          ...prev[teamId],
          progress: 1.0,
          etaMinutes: 0
        }
      };
    });
  };

  const updateTeamStatus = async (
    teamId: string,
    status: TeamStatus,
    location?: string,
    mission?: string
  ): Promise<void> => {
    fetch(`/api/teams/${teamId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, location, mission })
    }).catch(() => {});

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const oldStatus = t.status;
          const updated = {
            ...t,
            status,
            ...(location ? { location } : {}),
            ...(mission !== undefined ? { currentMission: mission } : {})
          };

          addAuditLog({
            actorName: currentUser.name,
            actorRole: currentUser.role,
            action: `Coordinator updated Team ${teamId} status: ${oldStatus} -> ${status}${mission ? ` (${mission})` : ''}`,
            affectedResource: teamId,
            previousState: oldStatus,
            newState: status,
            approvalStatus: 'APPROVED'
          });

          return updated;
        }
        return t;
      })
    );

    setNotification({
      message: `Team ${teamId} status transitioned to ${status}`,
      type: 'info'
    });
  };

  // 9. SHELTER INTAKE & OVERCAPACITY SYNCHRONIZATION
  const updateShelterOccupancy = async (shelterId: string, delta: number): Promise<void> => {
    fetch(`/api/shelters/${shelterId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    }).catch(() => {});

    setShelters((prev) =>
      prev.map((s) => {
        if (s.id === shelterId) {
          const newOcc = Math.max(0, Math.min(s.capacity, s.occupied + delta));
          const newStatus = newOcc >= s.capacity ? 'FULL' : newOcc >= s.capacity * 0.9 ? 'NEAR_CAPACITY' : 'OPERATIONAL';

          // Trigger overcapacity alert if saturated
          if ((newStatus === 'FULL' || newStatus === 'NEAR_CAPACITY') && s.status !== 'FULL') {
            const newAlert: Alert = {
              id: `ALT-SHL-${Date.now().toString().slice(-4)}`,
              type: 'Shelter Overcapacity',
              title: `SHELTER SATURATION: ${s.name}`,
              severity: newStatus === 'FULL' ? 'CRITICAL' : 'HIGH',
              timestamp: 'Just now',
              location: s.location,
              description: `${s.name} capacity reached ${Math.round((newOcc / s.capacity) * 100)}% (${newOcc}/${s.capacity} beds)`,
              recommendedAction: 'Divert subsequent incoming bus convoys.',
              status: 'OPEN'
            };
            setAlerts((curr) => [newAlert, ...curr]);
          }

          return { ...s, occupied: newOcc, status: newStatus };
        }
        return s;
      })
    );

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Adjusted shelter occupancy for ${shelterId} by ${delta > 0 ? '+' : ''}${delta} individuals`,
      affectedResource: shelterId,
      approvalStatus: 'APPROVED'
    });
  };

  const findNearestShelters = (lat: number, lng: number, neededBeds: number = 10): Shelter[] => {
    return [...shelters]
      .map((s) => {
        const dist = Math.hypot(s.coordinates.lat - lat, s.coordinates.lng - lng) * 111;
        const freeBeds = s.capacity - s.occupied;
        let suitabilityScore = 100 - dist * 3;
        if (freeBeds >= neededBeds) suitabilityScore += 20;
        else suitabilityScore -= 30;
        if (s.medicalSupport === 'AVAILABLE') suitabilityScore += 10;
        if (s.waterStatus === 'AVAILABLE') suitabilityScore += 10;
        return { shelter: s, dist, suitabilityScore };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
      .map((item) => item.shelter);
  };

  const matchVolunteersForRequest = (requestType: RequestType): Volunteer[] => {
    return volunteers.filter((v) => {
      if (requestType === 'Medical') return v.skills.includes('Medical') || v.skills.includes('Triage');
      if (requestType === 'Rescue') return v.skills.includes('Boating') || v.skills.includes('Search');
      if (requestType === 'Water' || requestType === 'Food') return v.skills.includes('Logistics') || v.skills.includes('Distribution');
      return true;
    });
  };

  // 10. ALERTS
  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    fetch(`/api/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACKNOWLEDGED' })
    }).catch(() => {});

    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a)));
  };

  const resolveAlert = async (alertId: string): Promise<void> => {
    fetch(`/api/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED' })
    }).catch(() => {});

    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a)));
  };

  // 11. FIELD REPORTS
  const submitFieldReport = async (
    report: Omit<FieldReport, 'id' | 'timestamp' | 'status' | 'aiClassification' | 'aiOperationalImpact' | 'suggestedAction'>
  ): Promise<void> => {
    const id = `FR-${Math.floor(520 + Math.random() * 400)}`;
    const newReport: FieldReport = {
      ...report,
      id,
      status: 'VERIFIED',
      aiClassification: 'FIELD_RECON_ASSESSMENT',
      aiOperationalImpact: 'Recorded in platform common operational picture.',
      suggestedAction: 'Reinforce sector units.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedBy: currentUser.name
    };

    fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport)
    }).catch(() => {});

    setFieldReports((prev) => [newReport, ...prev]);

    // Cross-module update: If report category is severe, trigger alert
    if (newReport.severity === 'CRITICAL' || newReport.severity === 'HIGH') {
      const alert: Alert = {
        id: `ALT-FR-${Date.now().toString().slice(-4)}`,
        type: 'Escalating Risk',
        title: `FIELD INCIDENT: ${newReport.category}`,
        severity: newReport.severity,
        location: newReport.location,
        timestamp: 'Just now',
        description: newReport.description,
        recommendedAction: newReport.suggestedAction,
        status: 'OPEN'
      };
      setAlerts((prev) => [alert, ...prev]);
    }

    addAuditLog({
      actorName: newReport.author,
      actorRole: newReport.role,
      action: `Submitted Field Reconnaissance Report #${id}: "${newReport.category}" at ${newReport.location}`,
      approvalStatus: 'APPROVED'
    });

    setNotification({
      message: `Field Report #${id} logged & synchronized to Live Map`,
      type: 'success'
    });
  };

  // 12. AI RECOMMENDATIONS APPROVAL
  const approveAIRecommendation = (recId: string) => {
    const rec = aiRecommendations.find((r) => r.id === recId);
    if (!rec) return;

    if ((rec.type === 'DISPATCH_TEAM' || (rec.type as any) === 'DEPLOY_TEAM') && rec.actionPayload?.teamId) {
      dispatchTeam(rec.actionPayload.teamId, rec.title, 'INC-104');
    } else if (rec.type === 'REALLOCATE_RESOURCE' && rec.actionPayload?.resourceId) {
      allocateResource(rec.actionPayload.resourceId, rec.actionPayload.requestId || 'REQ-1050', rec.actionPayload.quantity || 4000);
    } else if (rec.type === 'OPEN_SHELTER_BEDS' && rec.actionPayload?.shelterId) {
      updateShelterOccupancy(rec.actionPayload.shelterId, rec.actionPayload.quantity || 50);
    }

    setAiRecommendations((prev) => prev.map((r) => (r.id === recId ? { ...r, status: 'APPROVED' } : r)));

    addAuditLog({
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `Authorized Explainable AI Directive [${rec.id}]: "${rec.title}"`,
      approvalStatus: 'APPROVED'
    });

    setNotification({
      message: `AI Directive "${rec.title}" executed & synchronized across system`,
      type: 'success'
    });
  };

  const rejectAIRecommendation = (recId: string) => {
    setAiRecommendations((prev) => prev.map((r) => (r.id === recId ? { ...r, status: 'REJECTED' } : r)));
  };

  // 13. RESTORE / RESET TO DEFAULT DATA
  const resetToDefaultData = async (): Promise<void> => {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {}

    setIncidents(INITIAL_INCIDENTS);
    setRequests(INITIAL_REQUESTS);
    setResources(INITIAL_RESOURCES);
    setShelters(INITIAL_SHELTERS);
    setTeams(INITIAL_TEAMS);
    setVolunteers(INITIAL_VOLUNTEERS);
    setAlerts(INITIAL_ALERTS);
    setFieldReports(INITIAL_FIELD_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAiRecommendations(INITIAL_AI_RECOMMENDATIONS);
    setActiveMissions({});

    setNotification({
      message: 'Restored default disaster scenario database state.',
      type: 'info'
    });
  };

  const runDemoScenario = () => {
    setDemoRunning(true);
    setDemoStep(1);
    setNotification({
      message: 'End-to-End Operational Demo Scenario started.',
      type: 'info'
    });
  };

  const syncOfflineQueue = () => {
    setOfflineQueueCount(0);
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setNotification({
      message: 'Synchronized queued offline packets with command server.',
      type: 'success'
    });
  };

  // 14. Priority Score calculation helpers
  const calculatePriorityScore = (type: RequestType, urgency: SeverityLevel, peopleCount: number, vulnerable: boolean): number => {
    let score = 50;
    if (urgency === 'CRITICAL') score += 25;
    else if (urgency === 'HIGH') score += 15;
    else if (urgency === 'MEDIUM') score += 5;

    if (type === 'Medical' || type === 'Rescue') score += 12;
    else if (type === 'Water') score += 8;
    else if (type === 'Food' || type === 'Shelter') score += 6;

    if (vulnerable) score += 10;
    if (peopleCount > 100) score += 8;
    else if (peopleCount > 20) score += 5;

    return Math.min(99, Math.max(35, score));
  };

  const generateAIReasoning = (type: RequestType, urgency: SeverityLevel, peopleCount: number, vulnerable: boolean): string[] => {
    const reasons: string[] = [];
    if (urgency === 'CRITICAL') reasons.push('Immediate life-safety threat flagged by triage algorithm');
    if (type === 'Medical') reasons.push('Acute clinical intervention or cold-chain pharmaceutical urgency');
    if (type === 'Rescue') reasons.push('Inaccessible egress; trapped population requiring specialized watercraft or extraction');
    if (vulnerable) reasons.push('Elevated risk multiplier: children, non-ambulatory seniors, or post-partum patients present');
    if (peopleCount > 50) reasons.push(`High headcount impact factor (${peopleCount} individuals affected)`);
    reasons.push('Estimated response time sensitive to flood crest timeline');
    return reasons;
  };

  // 15. DYNAMIC PLATFORM METRICS
  const metrics = useMemo(() => {
    const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
    const activeRequests = requests.filter((r) => r.status !== 'RESOLVED' && r.status !== 'CLOSED');
    const criticalRequests = activeRequests.filter((r) => r.urgency === 'CRITICAL');
    const peopleAffectedTotal = activeIncidents.reduce((sum, inc) => sum + (inc.peopleAffected || 0), 0);

    const totalRes = resources.reduce((sum, r) => sum + r.quantity, 0);
    const availRes = resources.reduce((sum, r) => sum + r.available, 0);
    const availableResourcePercent = totalRes > 0 ? Math.round((availRes / totalRes) * 100) : 0;

    const totalCap = shelters.reduce((sum, s) => sum + s.capacity, 0);
    const totalOcc = shelters.reduce((sum, s) => sum + s.occupied, 0);
    const shelterCapacityPercent = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;

    const activeTeams = teams.filter((t) => t.status === 'EN_ROUTE' || t.status === 'ON_SITE' || t.status === 'BUSY');
    const resourceShortagesCount = resources.filter((r) => r.status === 'LOW_STOCK' || r.available < r.lowStockThreshold).length;

    return {
      activeIncidentsCount: activeIncidents.length,
      criticalRequestsCount: criticalRequests.length,
      peopleAffectedTotal,
      availableResourcePercent,
      activeTeamsCount: activeTeams.length,
      shelterCapacityPercent,
      resourceShortagesCount
    };
  }, [incidents, requests, resources, shelters, teams]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedIncidentId,
        setSelectedIncidentId,
        selectedRequestId,
        setSelectedRequestId,
        commandPaletteOpen,
        setCommandPaletteOpen,

        currentUser,
        switchUserRole,
        loginAs,

        incidents,
        requests,
        resources,
        shelters,
        teams,
        volunteers,
        alerts,
        fieldReports,
        auditLogs,
        aiRecommendations,

        activeMissions,

        addIncident,
        addEmergencyRequest,
        updateRequestStatus,
        triageRequest,
        batchTriageAll,

        addResource,
        allocateResource,
        replenishResource,

        updateShelterOccupancy,
        findNearestShelters,

        dispatchTeam,
        updateTeamStatus,
        fastForwardTeamArrival,
        matchVolunteersForRequest,

        acknowledgeAlert,
        resolveAlert,

        submitFieldReport,

        approveAIRecommendation,
        rejectAIRecommendation,

        runDemoScenario,
        demoRunning,
        demoStep,
        resetToDefaultData,

        isOffline,
        setIsOffline,
        lastSyncedTime,
        offlineQueueCount,
        syncOfflineQueue,

        metrics,

        notification,
        setNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
