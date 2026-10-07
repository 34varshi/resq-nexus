import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmergencyRequest, RequestType, SeverityLevel, RequestStatus } from '../../types';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Users,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Send,
  Eye,
  UserCheck
} from 'lucide-react';

export const EmergencyRequests: React.FC = () => {
  const {
    requests,
    selectedRequestId,
    setSelectedRequestId,
    addEmergencyRequest,
    updateRequestStatus,
    triageRequest,
    batchTriageAll,
    teams
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form Fields for New Request
  const [formType, setFormType] = useState<RequestType>('Medical');
  const [formRequester, setFormRequester] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPeopleCount, setFormPeopleCount] = useState(4);
  const [formUrgency, setFormUrgency] = useState<SeverityLevel>('HIGH');
  const [formDescription, setFormDescription] = useState('');
  const [formVulnerable, setFormVulnerable] = useState(true);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesUrgency && matchesStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addEmergencyRequest({
      incidentId: 'INC-104',
      type: formType,
      requesterName: formRequester || 'Anonymous Resident',
      contact: formContact || '+1 (555) 000-0000',
      location: formLocation || 'Sector 4, Musi River Basin',
      coordinates: { lat: 17.385 + (Math.random() - 0.5) * 0.02, lng: 78.485 + (Math.random() - 0.5) * 0.02 },
      peopleCount: Number(formPeopleCount) || 1,
      urgency: formUrgency,
      description: formDescription || 'Urgent disaster relief requested.',
      vulnerablePopulation: formVulnerable
    });
    setSelectedRequestId(created.id);
    setShowCreateModal(false);
    // Reset fields
    setFormRequester('');
    setFormContact('');
    setFormLocation('');
    setFormDescription('');
  };

  const statusOptions: RequestStatus[] = [
    'NEW',
    'TRIAGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'VERIFIED',
    'CLOSED'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-amber-500" />
            Emergency Requests & Distress Triage
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming public distress signals, automated neural prioritization, and field team assignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={batchTriageAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-800 bg-sky-950/60 hover:bg-sky-900 text-xs font-semibold text-sky-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Batch AI Triage</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Emergency Request</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-52"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Medical">Medical</option>
            <option value="Rescue">Rescue</option>
            <option value="Water">Water</option>
            <option value="Food">Food</option>
            <option value="Shelter">Shelter</option>
            <option value="Transportation">Transportation</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Electricity">Electricity</option>
            <option value="Communication">Communication</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Showing {filteredRequests.length} of {requests.length} Requests
        </div>
      </div>

      {/* Main Grid: Request Cards (Left) & Request Inspection (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Request List (5 Cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {filteredRequests.map((req) => {
            const isSelected = req.id === selectedRequest?.id;
            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequestId(req.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                  isSelected
                    ? 'border-amber-500/80 bg-amber-950/20 shadow-md ring-1 ring-amber-500/40'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-400">{req.id}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {req.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        req.priorityScore >= 90
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : req.priorityScore >= 75
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {req.priorityScore}/100
                    </span>
                    <SeverityBadge severity={req.urgency} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-snug">
                  {req.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="truncate max-w-[200px]">{req.location}</span>
                  <span className="font-mono text-slate-300 font-medium shrink-0">
                    {req.peopleCount} people
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Status: <strong className="text-sky-400">{req.status}</strong></span>
                  <span>{req.createdAt}</span>
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/40">
              <p className="font-medium text-slate-300">No emergency requests match this filter.</p>
              <p className="text-xs text-slate-400 mt-1">Adjust search terms or category selections.</p>
            </div>
          )}
        </div>

        {/* Selected Request Detail Panel (7 Cols) */}
        {selectedRequest && (
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-amber-400">{selectedRequest.id}</span>
                    <span className="text-xs font-mono text-slate-400">· {selectedRequest.type} Request</span>
                    <OperationalTag type="VERIFIED" />
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Requester: {selectedRequest.requesterName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {selectedRequest.contact}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {selectedRequest.location}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <SeverityBadge severity={selectedRequest.urgency} />
                  <span className="text-xs font-mono text-slate-400">
                    Status: <strong className="text-sky-400">{selectedRequest.status}</strong>
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-1">
                  Situation Description:
                </span>
                {selectedRequest.description}
              </div>

              {/* Priority Meter and AI Factors */}
              <div className="p-4 rounded-xl border border-sky-900/40 bg-sky-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">AI Prioritization Score</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                    {selectedRequest.priorityScore} / 100
                  </div>
                </div>

                {/* Meter Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedRequest.priorityScore >= 90
                        ? 'bg-rose-500'
                        : selectedRequest.priorityScore >= 75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedRequest.priorityScore}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <span className="font-semibold text-sky-300 block">AI Triage Rationale:</span>
                  {selectedRequest.aiReasoning.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-sky-400" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Action Controls */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">Update Operational Status:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      onClick={() => updateRequestStatus(selectedRequest.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        selectedRequest.status === st
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign Team Dropdown */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned Response Unit:</span>
                <select
                  value={selectedRequest.assignedTeamId || ''}
                  onChange={(e) => updateRequestStatus(selectedRequest.id, 'ASSIGNED', e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Emergency Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-rose-500" />
                Submit New Emergency Distress Signal
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Request Category</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as RequestType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    <option value="Medical">Medical Assistance</option>
                    <option value="Rescue">Search & Rescue</option>
                    <option value="Water">Drinking Water</option>
                    <option value="Food">Food / Rations</option>
                    <option value="Shelter">Shelter Extraction</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Electricity">Power / Generator</option>
                    <option value="Communication">Satellite / Radio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity / Urgency</label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    <option value="CRITICAL">Critical (Immediate Danger)</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Requester / Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Teresa"
                    value={formRequester}
                    onChange={(e) => setFormRequester(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Specific Location / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Block 14, Lowland Colony Gate"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">People Count</label>
                  <input
                    type="number"
                    min="1"
                    value={formPeopleCount}
                    onChange={(e) => setFormPeopleCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Description & Needs</label>
                <textarea
                  rows={3}
                  placeholder="Describe condition, trapped state, medical vulnerabilities..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vulnerableCheck"
                  checked={formVulnerable}
                  onChange={(e) => setFormVulnerable(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-rose-500"
                />
                <label htmlFor="vulnerableCheck" className="text-slate-300 cursor-pointer">
                  Includes vulnerable population (infants, non-ambulatory seniors, critical medical patients)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg"
                >
                  Submit & Auto-Triage Signal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
