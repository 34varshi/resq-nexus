export type UserRole =
  | 'ADMIN'
  | 'EMERGENCY_COORDINATOR'
  | 'FIELD_RESPONDER'
  | 'VOLUNTEER'
  | 'RELIEF_ORGANIZATION'
  | 'SHELTER_MANAGER'
  | 'DONOR_PROVIDER'
  | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  phone: string;
  avatar?: string;
  badgeNumber?: string;
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentType =
  | 'Flood'
  | 'Cyclone'
  | 'Earthquake'
  | 'Fire'
  | 'Landslide'
  | 'Heatwave'
  | 'Storm'
  | 'Chemical Emergency'
  | 'Infrastructure Failure';

export type IncidentStatus = 'ACTIVE' | 'CONTAINING' | 'RESOLVED' | 'MONITORING';

export interface IncidentTimelineEvent {
  time: string;
  title: string;
  description: string;
  badge?: string;
  actor?: string;
}

export interface Incident {
  id: string;
  title: string;
  type: IncidentType;
  location: string;
  coordinates: { lat: number; lng: number };
  severity: SeverityLevel;
  status: IncidentStatus;
  peopleAffected: number;
  startedAt: string;
  responseTeams: string[];
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'GUARDED';
  primaryRisks: string[];
  aiAnalysis: {
    severity: SeverityLevel;
    confidence: number;
    estimatedAffected: number;
    aiReasoning: string;
    riskFactors: string[];
    priorityFactors: string[];
    resourceGaps: string[];
    recommendedActions: string[];
  };
  timeline: IncidentTimelineEvent[];
}

export type RequestType =
  | 'Medical'
  | 'Water'
  | 'Food'
  | 'Shelter'
  | 'Rescue'
  | 'Transportation'
  | 'Sanitation'
  | 'Clothing'
  | 'Electricity'
  | 'Communication'
  | 'Other';

export type RequestStatus =
  | 'NEW'
  | 'TRIAGED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED';

export interface EmergencyRequest {
  id: string;
  incidentId: string;
  type: RequestType;
  requesterName: string;
  contact: string;
  location: string;
  coordinates: { lat: number; lng: number };
  peopleCount: number;
  urgency: SeverityLevel;
  description: string;
  status: RequestStatus;
  priorityScore: number; // 0 - 100
  aiClassification: string;
  aiReasoning: string[];
  vulnerablePopulation: boolean;
  assignedTeamId?: string;
  assignedResourceId?: string;
  createdAt: string;
  verified: boolean;
}

export type ResourceCategory =
  | 'Medical Supplies'
  | 'Food'
  | 'Water'
  | 'Blankets & Tents'
  | 'Vehicles'
  | 'Fuel & Energy'
  | 'Rescue Equipment'
  | 'Communication Equipment'
  | 'Sanitation Kits';

export type ResourceStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'IN_TRANSIT'
  | 'DEPLOYED'
  | 'LOW_STOCK'
  | 'EXPIRED';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;
  available: number;
  reserved: number;
  unit: string;
  location: string;
  coordinates: { lat: number; lng: number };
  expiry?: string;
  condition: 'EXCELLENT' | 'OPERATIONAL' | 'NEEDS_MAINTENANCE';
  owner: string;
  status: ResourceStatus;
  lowStockThreshold: number;
}

export interface Shelter {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  capacity: number;
  occupied: number;
  waterStatus: 'AVAILABLE' | 'LIMITED' | 'CRITICAL';
  foodStatus: 'AVAILABLE' | 'LIMITED' | 'CRITICAL';
  medicalSupport: 'AVAILABLE' | 'LIMITED' | 'NONE';
  accessibility: 'HIGH' | 'MODERATE' | 'RESTRICTED';
  status: 'OPERATIONAL' | 'NEAR_CAPACITY' | 'FULL' | 'EVACUATING';
  manager: string;
  contactPhone: string;
  features: string[];
}

export type TeamStatus = 'AVAILABLE' | 'EN_ROUTE' | 'ON_SITE' | 'BUSY' | 'OFFLINE';

export interface ResponseTeam {
  id: string;
  name: string;
  membersCount: number;
  skills: string[];
  location: string;
  coordinates: { lat: number; lng: number };
  status: TeamStatus;
  currentMission?: string;
  vehicle: string;
  leaderName: string;
  contact: string;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  location: string;
  availability: 'AVAILABLE' | 'DEPLOYED' | 'STANDBY';
  experienceYears: number;
  languages: string[];
  currentAssignment?: string;
  emergencyContact: string;
  rating: number;
}

export type AlertType =
  | 'Critical Request'
  | 'Resource Shortage'
  | 'Shelter Overcapacity'
  | 'Response Delay'
  | 'New Incident'
  | 'Escalating Risk'
  | 'Team Safety Alert';

export interface Alert {
  id: string;
  type: AlertType;
  severity: SeverityLevel;
  timestamp: string;
  location: string;
  description: string;
  recommendedAction: string;
  status: 'NEW' | 'OPEN' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'RESOLVED';
  incidentId?: string;
  title?: string;
  category?: string;
  actionRequired?: string;
  relatedIncidentId?: string;
}

export interface FieldReport {
  id: string;
  author: string;
  role: string;
  location: string;
  coordinates: { lat: number; lng: number };
  category: string;
  severity: SeverityLevel;
  peopleAffected: number;
  description: string;
  aiClassification: string;
  aiOperationalImpact: string;
  suggestedAction: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'DISPATCHED';
  timestamp: string;
  verifiedBy?: string;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  incidentId?: string;
  affectedResource?: string;
  previousState?: string;
  newState?: string;
  approvalStatus: 'APPROVED' | 'AUTO_LOGGED' | 'FLAGGED';
  timestamp: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  type: 'DISPATCH_TEAM' | 'REALLOCATE_RESOURCE' | 'OPEN_SHELTER_BEDS' | 'ESCALATE_INCIDENT';
  confidence: number;
  severity: SeverityLevel;
  reason: string;
  bulletPoints: string[];
  expectedImpact: string;
  affectedResources: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  actionPayload?: {
    teamId?: string;
    requestId?: string;
    resourceId?: string;
    shelterId?: string;
    quantity?: number;
  };
}

export interface SimulationScenario {
  id: string;
  name: string;
  affectedPopulation: number;
  rainfall: 'Normal' | 'Moderate' | 'Heavy' | 'Extreme';
  roadAccessibility: number; // percentage
  medicalDemand: 'Low' | 'Moderate' | 'High' | 'Critical';
  waterDemand: 'Low' | 'Moderate' | 'High' | 'Very High';
  shelterCapacity: number; // percentage
  projectedRequests: number;
  expectedShortageLiters: number;
  estimatedDelayMinutes: number;
}
