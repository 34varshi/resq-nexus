import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Incident,
  EmergencyRequest,
  Resource,
  Shelter,
  ResponseTeam,
  Volunteer,
  Alert,
  FieldReport,
  AuditLog,
  AIRecommendation,
  UserProfile
} from '../src/types';
import {
  INITIAL_USER,
  INITIAL_INCIDENTS,
  INITIAL_REQUESTS,
  INITIAL_RESOURCES,
  INITIAL_SHELTERS,
  INITIAL_TEAMS,
  INITIAL_VOLUNTEERS,
  INITIAL_ALERTS,
  INITIAL_FIELD_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_AI_RECOMMENDATIONS
} from '../src/data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../data/store.json');

export interface AppDatabase {
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
  currentUser: UserProfile;
}

class Store {
  private data: AppDatabase;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.incidents && parsed.requests) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[ResQ Nexus DB] Failed to read store.json, re-seeding default database:', err);
    }

    const initial: AppDatabase = {
      incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
      requests: JSON.parse(JSON.stringify(INITIAL_REQUESTS)),
      resources: JSON.parse(JSON.stringify(INITIAL_RESOURCES)),
      shelters: JSON.parse(JSON.stringify(INITIAL_SHELTERS)),
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
      volunteers: JSON.parse(JSON.stringify(INITIAL_VOLUNTEERS)),
      alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
      fieldReports: JSON.parse(JSON.stringify(INITIAL_FIELD_REPORTS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      aiRecommendations: JSON.parse(JSON.stringify(INITIAL_AI_RECOMMENDATIONS)),
      currentUser: JSON.parse(JSON.stringify(INITIAL_USER))
    };

    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: AppDatabase) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ResQ Nexus DB] Failed to persist store.json:', err);
    }
  }

  public resetToDefault() {
    this.data = {
      incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
      requests: JSON.parse(JSON.stringify(INITIAL_REQUESTS)),
      resources: JSON.parse(JSON.stringify(INITIAL_RESOURCES)),
      shelters: JSON.parse(JSON.stringify(INITIAL_SHELTERS)),
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
      volunteers: JSON.parse(JSON.stringify(INITIAL_VOLUNTEERS)),
      alerts: JSON.parse(JSON.stringify(INITIAL_ALERTS)),
      fieldReports: JSON.parse(JSON.stringify(INITIAL_FIELD_REPORTS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      aiRecommendations: JSON.parse(JSON.stringify(INITIAL_AI_RECOMMENDATIONS)),
      currentUser: JSON.parse(JSON.stringify(INITIAL_USER))
    };
    this.persist();
    return this.data;
  }

  public getAll(): AppDatabase {
    return this.data;
  }

  // --- Audit Logging ---
  public addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr
    };
    this.data.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  // --- Incidents ---
  public getIncidents(): Incident[] {
    return this.data.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.data.incidents.find((i) => i.id === id);
  }

  public createIncident(incidentData: Partial<Incident>): Incident {
    const nextNum = 100 + this.data.incidents.length + 1;
    const id = incidentData.id || `INC-${nextNum}`;

    const newIncident: Incident = {
      id,
      title: incidentData.title || 'Untitled Emergency Incident',
      type: incidentData.type || 'Flood',
      location: incidentData.location || 'Metropolitan Disaster Zone',
      coordinates: incidentData.coordinates || { lat: 17.385, lng: 78.4867 },
      severity: incidentData.severity || 'CRITICAL',
      status: incidentData.status || 'ACTIVE',
      peopleAffected: Number(incidentData.peopleAffected) || 1200,
      startedAt: incidentData.startedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      responseTeams: incidentData.responseTeams || [],
      riskLevel: (incidentData.severity as any) || 'CRITICAL',
      primaryRisks: incidentData.primaryRisks || [
        'Urban flash inundation and road impassability',
        'Contamination of potable water reservoirs',
        'Vulnerable elderly and infant population trapped'
      ],
      aiAnalysis: incidentData.aiAnalysis || {
        severity: incidentData.severity || 'CRITICAL',
        confidence: 94,
        estimatedAffected: Number(incidentData.peopleAffected) || 1200,
        aiReasoning: (incidentData.aiAnalysis as any)?.aiReasoning || `Rapid disaster escalation observed at ${incidentData.location || 'site'}; prioritized for immediate emergency asset mobilization.`,
        riskFactors: ['Rapid flood stage escalation', 'Overland transport impassability'],
        priorityFactors: ['Concentrated civilian density without high-ground egress'],
        resourceGaps: ['Potable Water Bulk Tankers', 'Amphibious Rescue Watercraft'],
        recommendedActions: ['Pre-position rescue teams', 'Activate emergency transit shelters']
      },
      timeline: incidentData.timeline || [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Incident Declared & Activated',
          description: `Emergency declared at ${incidentData.location}. Automated COP telemetry activated across ResQ Nexus platform.`,
          badge: 'ACTIVATION',
          actor: 'Emergency Coordinator'
        }
      ]
    };

    this.data.incidents.unshift(newIncident);

    // Cross-module synchronization:
    // 1. Generate linked emergency requests for this new incident
    const req1: EmergencyRequest = {
      id: `REQ-${Math.floor(1085 + Math.random() * 800)}`,
      incidentId: id,
      type: 'Medical',
      requesterName: `Sector Triage Station (${newIncident.location.split(',')[0]})`,
      contact: '+1 (555) 720-0911',
      location: newIncident.location,
      coordinates: {
        lat: newIncident.coordinates.lat + (Math.random() - 0.5) * 0.01,
        lng: newIncident.coordinates.lng + (Math.random() - 0.5) * 0.01
      },
      peopleCount: Math.max(12, Math.floor(newIncident.peopleAffected * 0.05)),
      urgency: newIncident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      description: `Acute distress call generated from ${newIncident.title}. Immediate medical trauma stabilization and triage supplies required.`,
      status: 'TRIAGED',
      priorityScore: newIncident.severity === 'CRITICAL' ? 95 : 84,
      aiClassification: 'INCIDENT_ACUTE_CASUALTY_STABILIZATION',
      aiReasoning: [
        `Directly linked to newly activated Incident #${id}`,
        'High headcount exposure in active hazard zone',
        'Immediate golden-hour extraction window active'
      ],
      vulnerablePopulation: true,
      createdAt: 'Just now',
      verified: true
    };

    const req2: EmergencyRequest = {
      id: `REQ-${Math.floor(1085 + Math.random() * 800)}`,
      incidentId: id,
      type: newIncident.type === 'Flood' ? 'Rescue' : 'Water',
      requesterName: 'Civil Protection Warden',
      contact: '+1 (555) 830-4411',
      location: `Evacuation Zone near ${newIncident.location.split(',')[0]}`,
      coordinates: {
        lat: newIncident.coordinates.lat + (Math.random() - 0.5) * 0.008,
        lng: newIncident.coordinates.lng + (Math.random() - 0.5) * 0.008
      },
      peopleCount: Math.max(25, Math.floor(newIncident.peopleAffected * 0.08)),
      urgency: newIncident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      description: `Civilian group stranded without safe overland egress. Water level rising; emergency transport and potable rations needed.`,
      status: 'TRIAGED',
      priorityScore: newIncident.severity === 'CRITICAL' ? 92 : 81,
      aiClassification: 'STRANDED_CIVILIAN_EXTRACTION',
      aiReasoning: [
        `Overland egress cutoff reported for Incident #${id}`,
        'Sustained flood / structural hazard'
      ],
      vulnerablePopulation: true,
      createdAt: 'Just now',
      verified: true
    };

    this.data.requests.unshift(req1, req2);

    // 2. Generate Critical Alert if severity is CRITICAL or HIGH
    if (newIncident.severity === 'CRITICAL' || newIncident.severity === 'HIGH') {
      const alert: Alert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        type: 'New Incident',
        title: `MAJOR INCIDENT ACTIVATED: ${newIncident.title}`,
        severity: newIncident.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        category: 'INCIDENT_ESCALATION',
        location: newIncident.location,
        timestamp: 'Just now',
        description: `Level 4 Regional Disaster declared at ${newIncident.location}. ${newIncident.peopleAffected.toLocaleString()} individuals in immediate hazard corridor.`,
        actionRequired: 'Pre-position nearest Strike Force teams and authorize bulk water/medical diversion.',
        recommendedAction: 'Pre-position nearest Strike Force teams and authorize bulk water/medical diversion.',
        status: 'OPEN',
        relatedIncidentId: id,
        incidentId: id
      };
      this.data.alerts.unshift(alert);
    }

    // 3. Log to Audit
    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Created and activated Incident #${id}: "${newIncident.title}" (${newIncident.peopleAffected.toLocaleString()} people affected)`,
      incidentId: id,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return newIncident;
  }

  // --- Emergency Requests ---
  public getRequests(): EmergencyRequest[] {
    return this.data.requests;
  }

  public getRequestById(id: string): EmergencyRequest | undefined {
    return this.data.requests.find((r) => r.id === id);
  }

  public createRequest(data: Partial<EmergencyRequest>): EmergencyRequest {
    const id = data.id || `REQ-${Math.floor(1085 + Math.random() * 900)}`;
    const newReq: EmergencyRequest = {
      id,
      incidentId: data.incidentId || 'INC-104',
      type: data.type || 'Medical',
      requesterName: data.requesterName || 'Emergency Citizen Signal',
      contact: data.contact || '+1 (555) 000-0000',
      location: data.location || 'Sector 4 Relief Zone',
      coordinates: data.coordinates || { lat: 17.385, lng: 78.486 },
      peopleCount: Number(data.peopleCount) || 4,
      urgency: data.urgency || 'HIGH',
      description: data.description || 'Assistance requested.',
      status: data.status || 'TRIAGED',
      priorityScore: data.priorityScore || 85,
      aiClassification: data.aiClassification || `AI_${(data.type || 'EMERGENCY').toUpperCase()}_TRIAGED`,
      aiReasoning: data.aiReasoning || ['Automated distress signal processed by ResQ Nexus AI Engine'],
      vulnerablePopulation: data.vulnerablePopulation !== false,
      createdAt: data.createdAt || 'Just now',
      verified: data.verified || true
    };

    this.data.requests.unshift(newReq);

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Lodged and triaged Emergency Request ${newReq.id} (${newReq.type}, ${newReq.peopleCount} people)`,
      incidentId: newReq.incidentId,
      approvalStatus: 'AUTO_LOGGED'
    });

    this.persist();
    return newReq;
  }

  public updateRequestStatus(id: string, status: EmergencyRequest['status'], teamId?: string): EmergencyRequest | null {
    const req = this.data.requests.find((r) => r.id === id);
    if (!req) return null;

    const oldStatus = req.status;
    req.status = status;
    if (teamId) {
      req.assignedTeamId = teamId;
    }

    // Cross-module update: Response Team status transitions
    if (teamId) {
      const team = this.data.teams.find((t) => t.id === teamId);
      if (team) {
        if (status === 'ASSIGNED') {
          team.status = 'EN_ROUTE';
          team.currentMission = `Assigned to ${req.id} (${req.type} for ${req.peopleCount} people)`;
        } else if (status === 'IN_PROGRESS') {
          team.status = 'ON_SITE';
          team.currentMission = `On site at ${req.id} (${req.location})`;
        } else if (status === 'RESOLVED' || status === 'CLOSED') {
          team.status = 'AVAILABLE';
          team.currentMission = undefined;
        }
      }
    }

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Transitioned Request ${id} from ${oldStatus} to ${status}${teamId ? ` (Assigned: Team ${teamId})` : ''}`,
      incidentId: req.incidentId,
      previousState: oldStatus,
      newState: status,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return req;
  }

  // --- Resources & Allocation ---
  public getResources(): Resource[] {
    return this.data.resources;
  }

  public allocateResource(resourceId: string, requestId: string, quantity: number, teamId?: string): { success: boolean; resource?: Resource; request?: EmergencyRequest } {
    const res = this.data.resources.find((r) => r.id === resourceId);
    const req = this.data.requests.find((r) => r.id === requestId);

    if (!res || !req) {
      return { success: false };
    }

    const allocQty = Math.min(res.available, quantity);
    res.available = Math.max(0, res.available - allocQty);
    res.reserved = (res.reserved || 0) + allocQty;

    // Check low stock threshold & trigger alert if crossed
    if (res.available < res.lowStockThreshold && res.status !== 'LOW_STOCK') {
      res.status = 'LOW_STOCK';
      const alert: Alert = {
        id: `ALT-STOCK-${Date.now().toString().slice(-4)}`,
        type: 'Resource Shortage',
        title: `CRITICAL RESOURCE SHORTAGE: ${res.name}`,
        severity: 'HIGH',
        category: 'RESOURCE_DEFICIT',
        location: res.location,
        timestamp: 'Just now',
        description: `${res.name} stock fallen to ${res.available.toLocaleString()} ${res.unit} (configured threshold: ${res.lowStockThreshold.toLocaleString()} ${res.unit}).`,
        actionRequired: 'Initiate regional mutual aid replenishment from Logistics Depot A immediately.',
        recommendedAction: 'Initiate regional mutual aid replenishment from Logistics Depot A immediately.',
        status: 'OPEN'
      };
      this.data.alerts.unshift(alert);
    }

    req.assignedResourceId = resourceId;
    if (req.status === 'NEW' || req.status === 'TRIAGED') {
      req.status = 'ASSIGNED';
    }

    if (teamId) {
      req.assignedTeamId = teamId;
      const team = this.data.teams.find((t) => t.id === teamId);
      if (team) {
        team.status = 'EN_ROUTE';
        team.currentMission = `Transporting ${allocQty} ${res.unit} ${res.name} to ${req.id}`;
      }
    }

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Approved allocation of ${allocQty} ${res.unit} of ${res.name} to Request ${requestId}${teamId ? ` via Team ${teamId}` : ''}`,
      affectedResource: resourceId,
      incidentId: req.incidentId,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return { success: true, resource: res, request: req };
  }

  public replenishResource(resourceId: string, quantity: number): Resource | null {
    const res = this.data.resources.find((r) => r.id === resourceId);
    if (!res) return null;

    res.available += quantity;
    res.quantity += quantity;
    if (res.available >= res.lowStockThreshold) {
      res.status = 'AVAILABLE';
    }

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Replenished inventory for ${res.name} with +${quantity} ${res.unit} at ${res.location}`,
      affectedResource: resourceId,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return res;
  }

  // --- Teams ---
  public getTeams(): ResponseTeam[] {
    return this.data.teams;
  }

  public updateTeamStatus(teamId: string, status: ResponseTeam['status'], location?: string, mission?: string): ResponseTeam | null {
    const team = this.data.teams.find((t) => t.id === teamId);
    if (!team) return null;

    const oldStatus = team.status;
    team.status = status;
    if (location) team.location = location;
    if (mission !== undefined) team.currentMission = mission;

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Updated Response Squad ${teamId} status from ${oldStatus} to ${status}${mission ? ` (Mission: ${mission})` : ''}`,
      affectedResource: teamId,
      previousState: oldStatus,
      newState: status,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return team;
  }

  // --- Shelters ---
  public getShelters(): Shelter[] {
    return this.data.shelters;
  }

  public updateShelterOccupancy(shelterId: string, delta: number): Shelter | null {
    const s = this.data.shelters.find((item) => item.id === shelterId);
    if (!s) return null;

    const oldOcc = s.occupied;
    s.occupied = Math.max(0, Math.min(s.capacity, s.occupied + delta));
    s.status = s.occupied >= s.capacity ? 'FULL' : s.occupied >= s.capacity * 0.9 ? 'NEAR_CAPACITY' : 'OPERATIONAL';

    // Trigger shelter overcapacity alert
    if (s.status === 'FULL' || s.status === 'NEAR_CAPACITY') {
      const alert: Alert = {
        id: `ALT-SHL-${Date.now().toString().slice(-4)}`,
        type: 'Shelter Overcapacity',
        title: `SHELTER CAPACITY SATURATION: ${s.name}`,
        severity: s.status === 'FULL' ? 'CRITICAL' : 'HIGH',
        category: 'SHELTER_OVERCROWDING',
        location: s.location,
        timestamp: 'Just now',
        description: `${s.name} is at ${Math.round((s.occupied / s.capacity) * 100)}% capacity (${s.occupied}/${s.capacity} beds).`,
        actionRequired: 'Divert subsequent incoming evacuee transport convoys to adjacent secondary facilities.',
        recommendedAction: 'Divert subsequent incoming evacuee transport convoys to adjacent secondary facilities.',
        status: 'OPEN'
      };
      this.data.alerts.unshift(alert);
    }

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Updated shelter intake for ${s.name}: ${oldOcc} -> ${s.occupied} beds (${delta > 0 ? '+' : ''}${delta} evacuees)`,
      affectedResource: shelterId,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return s;
  }

  // --- Field Reports ---
  public getFieldReports(): FieldReport[] {
    return this.data.fieldReports;
  }

  public submitFieldReport(reportData: Partial<FieldReport>): FieldReport {
    const id = `FR-${Math.floor(520 + Math.random() * 400)}`;
    const newReport: FieldReport = {
      id,
      author: reportData.author || this.data.currentUser.name,
      role: reportData.role || 'USAR Field Lead',
      location: reportData.location || 'Sector 4 Hazard Zone',
      coordinates: reportData.coordinates || { lat: 17.385, lng: 78.486 },
      category: reportData.category || 'Infrastructure Obstruction',
      severity: reportData.severity || 'HIGH',
      peopleAffected: Number(reportData.peopleAffected) || 120,
      description: reportData.description || 'Field reconnaissance update submitted.',
      aiClassification: reportData.aiClassification || 'FIELD_TELEMETRY_ASSESSMENT',
      aiOperationalImpact: reportData.aiOperationalImpact || 'Operational impact logged to tactical map common operating picture.',
      suggestedAction: reportData.suggestedAction || 'Stage secondary reinforcement units.',
      status: 'VERIFIED',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedBy: this.data.currentUser.name
    };

    this.data.fieldReports.unshift(newReport);

    // Cross-module synchronization: If report severity is CRITICAL or HIGH, generate alert
    if (newReport.severity === 'CRITICAL' || newReport.severity === 'HIGH') {
      const alert: Alert = {
        id: `ALT-FR-${Date.now().toString().slice(-4)}`,
        type: 'Escalating Risk',
        title: `FIELD REPORT ALERT: ${newReport.category}`,
        severity: newReport.severity,
        category: 'FIELD_HAZARD',
        location: newReport.location,
        timestamp: 'Just now',
        description: `${newReport.description.slice(0, 140)}... (Reported by ${newReport.author})`,
        actionRequired: newReport.suggestedAction,
        recommendedAction: newReport.suggestedAction,
        status: 'OPEN'
      };
      this.data.alerts.unshift(alert);
    }

    this.addAuditLog({
      actorName: newReport.author,
      actorRole: newReport.role,
      action: `Submitted Field Reconnaissance Report #${id}: "${newReport.category}" at ${newReport.location}`,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return newReport;
  }

  // --- Alerts ---
  public getAlerts(): Alert[] {
    return this.data.alerts;
  }

  public updateAlertStatus(alertId: string, status: Alert['status']): Alert | null {
    const alert = this.data.alerts.find((a) => a.id === alertId);
    if (!alert) return null;

    const oldStatus = alert.status;
    alert.status = status;

    this.addAuditLog({
      actorName: this.data.currentUser.name,
      actorRole: this.data.currentUser.role,
      action: `Updated Alert #${alertId} status: ${oldStatus} -> ${status}`,
      approvalStatus: 'APPROVED'
    });

    this.persist();
    return alert;
  }

  // --- Volunteers ---
  public getVolunteers(): Volunteer[] {
    return this.data.volunteers;
  }

  // --- Summary Metrics ---
  public getMetrics() {
    const activeIncidents = this.data.incidents.filter((i) => i.status !== 'RESOLVED');
    const activeRequests = this.data.requests.filter((r) => r.status !== 'RESOLVED' && r.status !== 'CLOSED');
    const criticalRequests = activeRequests.filter((r) => r.urgency === 'CRITICAL');
    const totalPeopleAffected = activeIncidents.reduce((sum, inc) => sum + inc.peopleAffected, 0);

    const totalRes = this.data.resources.reduce((sum, r) => sum + r.quantity, 0);
    const availRes = this.data.resources.reduce((sum, r) => sum + r.available, 0);
    const availResPct = totalRes > 0 ? Math.round((availRes / totalRes) * 100) : 0;

    const totalCap = this.data.shelters.reduce((sum, s) => sum + s.capacity, 0);
    const totalOcc = this.data.shelters.reduce((sum, s) => sum + s.occupied, 0);
    const shelterPct = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;

    const deployedTeams = this.data.teams.filter((t) => t.status === 'EN_ROUTE' || t.status === 'ON_SITE' || t.status === 'BUSY');
    const shortagesCount = this.data.resources.filter((r) => r.status === 'LOW_STOCK' || r.available < r.lowStockThreshold).length;

    return {
      activeIncidentsCount: activeIncidents.length,
      criticalRequestsCount: criticalRequests.length,
      peopleAffectedTotal: totalPeopleAffected,
      availableResourcePercent: availResPct,
      activeTeamsCount: deployedTeams.length,
      shelterCapacityPercent: shelterPct,
      resourceShortagesCount: shortagesCount
    };
  }
}

export const dbStore = new Store();
