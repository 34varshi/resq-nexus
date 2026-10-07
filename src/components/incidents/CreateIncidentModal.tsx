import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IncidentType, SeverityLevel } from '../../types';
import {
  X,
  Flame,
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  ShieldAlert,
  Droplets,
  Zap,
  Navigation,
  Box,
  Radio,
  Paperclip,
  CheckCircle2,
  Save
} from 'lucide-react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({ isOpen, onClose }) => {
  const { addIncident, currentUser } = useApp();

  const [type, setType] = useState<IncidentType>('Flood');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('CRITICAL');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState('17.3850');
  const [lng, setLng] = useState('78.4867');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [peopleAffected, setPeopleAffected] = useState('4500');
  const [waterAvailability, setWaterAvailability] = useState('Strained');
  const [powerAvailability, setPowerAvailability] = useState('Intermittent');
  const [roadAccessibility, setRoadAccessibility] = useState('Partial Flood/Debris');
  const [source, setSource] = useState('National Disaster Response Authority Patrol');
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const [infrastructureImpacts, setInfrastructureImpacts] = useState<string[]>([
    'Bridges / Culverts Inundated',
    'Local Drinking Water Main Ruptured'
  ]);

  const [initialResources, setInitialResources] = useState<string[]>([
    'Potable Water Bulk Tankers',
    'Emergency Trauma Kits',
    'Amphibious Rescue Boats'
  ]);

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleInfra = (item: string) => {
    setInfrastructureImpacts((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleResource = (item: string) => {
    setInitialResources((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    if (!title.trim() || !location.trim()) {
      alert('Please provide Incident Name and Location.');
      return;
    }

    setSubmitting(true);

    const parsedLat = parseFloat(lat) || 17.385;
    const parsedLng = parseFloat(lng) || 78.4867;
    const parsedAffected = parseInt(peopleAffected, 10) || 1200;

    await addIncident({
      title,
      type,
      severity,
      location,
      coordinates: { lat: parsedLat, lng: parsedLng },
      peopleAffected: parsedAffected,
      status: isDraft ? 'MONITORING' : 'ACTIVE',
      startedAt: dateTime,
      primaryRisks: [
        `Infrastructure: ${infrastructureImpacts.join(', ') || 'Monitored'}`,
        `Water: ${waterAvailability} | Power: ${powerAvailability}`,
        `Roads: ${roadAccessibility}`
      ],
      aiAnalysis: {
        severity,
        confidence: 93,
        estimatedAffected: parsedAffected,
        aiReasoning: `${description.slice(0, 120)}... Source: ${source}. Roads reported as ${roadAccessibility.toLowerCase()}.`,
        riskFactors: infrastructureImpacts,
        priorityFactors: [`${parsedAffected.toLocaleString()} people in active threat corridor`],
        resourceGaps: initialResources,
        recommendedActions: ['Dispatch nearest qualified rescue squad', 'Stage potable water tankers']
      }
    });

    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Declare & Register New Emergency Incident
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  NIMS COP
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Synchronizes multi-sector common operational picture, generates initial distress beacons & alerts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Row 1: Type, Severity, Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Incident Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IncidentType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-medium focus:border-rose-500 focus:outline-none"
              >
                <option value="Flood">Flood</option>
                <option value="Cyclone">Cyclone</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Fire">Fire</option>
                <option value="Landslide">Landslide</option>
                <option value="Heatwave">Heatwave</option>
                <option value="Storm">Storm</option>
                <option value="Chemical Emergency">Chemical Emergency</option>
                <option value="Infrastructure Failure">Infrastructure Failure</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Severity Rating *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className={`w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-bold focus:outline-none ${
                  severity === 'CRITICAL'
                    ? 'text-rose-400 border-rose-700'
                    : severity === 'HIGH'
                    ? 'text-amber-400 border-amber-700'
                    : severity === 'MEDIUM'
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                <option value="CRITICAL">CRITICAL (Immediate Life Threat)</option>
                <option value="HIGH">HIGH (Acute Vulnerability)</option>
                <option value="MEDIUM">MEDIUM (Moderate Containment)</option>
                <option value="LOW">LOW (Guarded / Monitoring)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Incident Name / Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Flood Inundation Sector 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Row 2: Location and Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Physical Location / Sector Address *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Musi River Basin Lower Embankment, Sector 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Latitude</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Longitude</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Situation Overview & Ground Observations *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe flood crest height, collapse risk, isolated neighborhoods, trapped civilians..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Row 4: Population, Date, Reporting Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Estimated Population Affected
              </label>
              <input
                type="number"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Timestamp (UTC)
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-teal-400" />
                Reporting Authority / Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200"
              />
            </div>
          </div>

          {/* Row 5: Infrastructure & Lifeline Matrix */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px] block">
              Lifeline Utility Status & Passability
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-400" /> Potable Water
                </label>
                <select
                  value={waterAvailability}
                  onChange={(e) => setWaterAvailability(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Adequate">Adequate Supply</option>
                  <option value="Strained">Strained / Intermittent</option>
                  <option value="Depleted">Completely Depleted</option>
                  <option value="Contaminated">Contaminated / Hazardous</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Power Grid
                </label>
                <select
                  value={powerAvailability}
                  onChange={(e) => setPowerAvailability(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Operational">Grid Fully Operational</option>
                  <option value="Intermittent">Intermittent / Generator Reserve</option>
                  <option value="Total Blackout">Total Blackout</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[10px] block mb-1 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-rose-400" /> Road Accessibility
                </label>
                <select
                  value={roadAccessibility}
                  onChange={(e) => setRoadAccessibility(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Open">Open (All Vehicles)</option>
                  <option value="Partial Flood/Debris">Partial Flood / High Clearance Only</option>
                  <option value="Impassable">Fully Impassable (Boats/Air Only)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes: Infrastructure Impact */}
            <div className="pt-2">
              <span className="text-slate-400 text-[10px] block mb-1.5">Confirmed Infrastructure Impacts:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Bridges / Culverts Inundated',
                  'Local Drinking Water Main Ruptured',
                  'Cellular Telecom Tower Offline',
                  'Hospital Emergency Wing Inundated',
                  'Transformer Substation Submerged'
                ].map((item) => {
                  const active = infrastructureImpacts.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInfra(item)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        active
                          ? 'bg-rose-950/80 border-rose-700 text-rose-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Initial Resource Requirements */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 text-[10px] block mb-1.5 flex items-center gap-1">
                <Box className="w-3 h-3 text-purple-400" /> Initial Requisition Needs:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Potable Water Bulk Tankers',
                  'Emergency Trauma Kits',
                  'Amphibious Rescue Boats',
                  '500kVA Diesel Generators',
                  'High-Clearance Wheelchair Vans',
                  'Dry Ration Rations (MRE)'
                ].map((item) => {
                  const active = initialResources.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleResource(item)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        active
                          ? 'bg-purple-950/80 border-purple-700 text-purple-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Optional Attachment */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach Aerial / Ground Recon File</span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
            <span className="text-[11px] text-slate-400">
              {attachmentName ? `Attached: ${attachmentName}` : 'Optional drone footage, SITREP document, or telemetry log'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-950/70">
          <div className="text-[11px] text-slate-400 font-mono">
            Logging as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Activating...' : 'Create & Activate Incident'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
