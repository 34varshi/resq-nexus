import React from 'react';
import {
  BookOpen,
  Layers,
  Database,
  Lock,
  Cpu,
  Server,
  Code,
  ShieldCheck,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const TechnicalDocs: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-5xl mx-auto text-xs">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          ResQ Nexus — System Architecture & Technical Specifications
        </h2>
        <p className="text-slate-400">
          Comprehensive specification covering multi-tier architecture, database schema, role-based access control, and RESTful API endpoints.
        </p>
      </div>

      {/* 1. System Architecture Flow */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          1. Enterprise Multi-Tier Architecture Pipeline
        </h3>

        {/* ASCII Flowchart Diagram */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
          <pre>{`
  [Affected Community / Field Sensors / IoT Gauges]
                       │
                       ▼
          [Frontend Client (React + TS + Tailwind)]
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
 [PWA Service Worker / Cache]  [JWT / RBAC Authentication Gate]
                                      │
                                      ▼
                        [RESTful Express API Gateway]
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
   [PostgreSQL Database]    [AI Services (Gemini)]     [Notification Hub]
  (Relational Persistence) (Neural Triage & Reasoning) (In-App / Radio PTT)
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
                        [Relief Optimizer Engine]
                      (Simplex Constraint Matching)
                                      │
                                      ▼
                      [Human-in-the-Loop Approval]
                                      │
                                      ▼
                       [Immutable Audit Logging]
          `}</pre>
        </div>
        <p className="text-slate-400 leading-relaxed font-sans">
          The platform follows strict separation of concerns: field-distress ingestion is decoupled from dispatch processing. The AI engine operates strictly as a decision-support copilot and is architecturally barred from direct state execution without human coordinator verification.
        </p>
      </div>

      {/* 2. Database Relational Schema */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          2. Relational Database Schema (PostgreSQL Core)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold">TABLE: incidents</span>
            <ul className="text-slate-400 space-y-0.5 list-disc pl-4">
              <li>id: VARCHAR(32) PRIMARY KEY</li>
              <li>title: VARCHAR(255) NOT NULL</li>
              <li>type: incident_type_enum</li>
              <li>location: VARCHAR(255)</li>
              <li>coordinates: POINT NOT NULL</li>
              <li>severity: severity_enum</li>
              <li>status: incident_status_enum</li>
              <li>people_affected: INTEGER</li>
              <li>created_at: TIMESTAMP WITH TIME ZONE</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-sky-400 font-bold">TABLE: emergency_requests</span>
            <ul className="text-slate-400 space-y-0.5 list-disc pl-4">
              <li>id: VARCHAR(32) PRIMARY KEY</li>
              <li>incident_id: VARCHAR(32) REFERENCES incidents</li>
              <li>type: request_type_enum NOT NULL</li>
              <li>priority_score: INTEGER CHECK (0-100)</li>
              <li>requester_name: VARCHAR(120)</li>
              <li>contact_phone: VARCHAR(30)</li>
              <li>people_count: INTEGER NOT NULL</li>
              <li>vulnerable_cohort: BOOLEAN</li>
              <li>status: request_status_enum</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-amber-400 font-bold">TABLE: resources & transactions</span>
            <ul className="text-slate-400 space-y-0.5 list-disc pl-4">
              <li>id: VARCHAR(32) PRIMARY KEY</li>
              <li>name: VARCHAR(150) NOT NULL</li>
              <li>category: resource_category_enum</li>
              <li>quantity_total: NUMERIC NOT NULL</li>
              <li>quantity_available: NUMERIC NOT NULL</li>
              <li>low_stock_threshold: NUMERIC NOT NULL</li>
              <li>depot_location: VARCHAR(255)</li>
              <li>owner_agency: VARCHAR(150)</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-rose-400 font-bold">TABLE: audit_logs (Immutable)</span>
            <ul className="text-slate-400 space-y-0.5 list-disc pl-4">
              <li>id: UUID PRIMARY KEY DEFAULT gen_random_uuid()</li>
              <li>actor_id: VARCHAR(64) NOT NULL</li>
              <li>actor_role: role_enum NOT NULL</li>
              <li>action_code: VARCHAR(100) NOT NULL</li>
              <li>affected_entity_id: VARCHAR(64)</li>
              <li>previous_state: JSONB</li>
              <li>new_state: JSONB</li>
              <li>cryptographic_hash: VARCHAR(128)</li>
              <li>created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Role-Based Access Control Matrix */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          3. Role-Based Access Control (RBAC) Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 font-mono">
            <thead className="bg-slate-950 text-slate-400 text-[11px]">
              <tr>
                <th className="p-2.5 border border-slate-800">Operational Role</th>
                <th className="p-2.5 border border-slate-800">View Map & Incidents</th>
                <th className="p-2.5 border border-slate-800">Approve AI Directives</th>
                <th className="p-2.5 border border-slate-800">Dispatch Response Squads</th>
                <th className="p-2.5 border border-slate-800">Reallocate Depot Stock</th>
                <th className="p-2.5 border border-slate-800">Audit Trail Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-white">ADMIN</td>
                <td className="p-2 border border-slate-800 text-emerald-400">FULL</td>
                <td className="p-2 border border-slate-800 text-emerald-400">FULL</td>
                <td className="p-2 border border-slate-800 text-emerald-400">FULL</td>
                <td className="p-2 border border-slate-800 text-emerald-400">FULL</td>
                <td className="p-2 border border-slate-800 text-emerald-400">FULL (UNRESTRICTED)</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-rose-400">EMERGENCY_COORDINATOR</td>
                <td className="p-2 border border-slate-800 text-emerald-400">FULL</td>
                <td className="p-2 border border-slate-800 text-emerald-400">AUTHORIZE</td>
                <td className="p-2 border border-slate-800 text-emerald-400">DISPATCH</td>
                <td className="p-2 border border-slate-800 text-emerald-400">REQUISITION</td>
                <td className="p-2 border border-slate-800 text-emerald-400">VIEW (IMMUTABLE)</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-purple-400">FIELD_RESPONDER</td>
                <td className="p-2 border border-slate-800 text-emerald-400">SECTOR ONLY</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-slate-500">ACCEPT MISSION</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-slate-500">OWN ACTIONS</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-sky-400">SHELTER_MANAGER</td>
                <td className="p-2 border border-slate-800 text-emerald-400">REGIONAL</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-amber-400">REQUEST ONLY</td>
                <td className="p-2 border border-slate-800 text-slate-500">SHELTER LOG</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-800 font-bold text-slate-400">VIEWER / PRESS</td>
                <td className="p-2 border border-slate-800 text-slate-300">READ-ONLY</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
                <td className="p-2 border border-slate-800 text-slate-500">NO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. API Specification */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Code className="w-4 h-4 text-amber-400" />
          4. RESTful API Specification Endpoints
        </h3>

        <div className="space-y-2 font-mono text-[11px]">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sky-400 font-bold mr-3">GET</span>
              <span className="text-slate-200">/api/incidents</span>
            </div>
            <span className="text-slate-500">Returns list of active disaster epicenters with telemetry</span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold mr-3">POST</span>
              <span className="text-slate-200">/api/requests/triage</span>
            </div>
            <span className="text-slate-500">Calculates 0-100 priority score with explainable reasoning</span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold mr-3">POST</span>
              <span className="text-slate-200">/api/resources/match</span>
            </div>
            <span className="text-slate-500">Executes multi-parameter optimization across inventory & teams</span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold mr-3">POST</span>
              <span className="text-slate-200">/api/simulation/run</span>
            </div>
            <span className="text-slate-500">Runs What-If stress test across T+0 to T+48h timeline</span>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sky-400 font-bold mr-3">GET</span>
              <span className="text-slate-200">/api/audit</span>
            </div>
            <span className="text-slate-500">Retrieves tamper-evident operational action audit trail</span>
          </div>
        </div>
      </div>
    </div>
  );
};
