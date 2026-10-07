import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FieldReport, SeverityLevel } from '../../types';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import {
  FileText,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  Camera,
  CheckCircle,
  AlertTriangle,
  Upload,
  UserCheck
} from 'lucide-react';

export const FieldReports: React.FC = () => {
  const { fieldReports, submitFieldReport, currentUser } = useApp();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Infrastructure Obstruction');
  const [severity, setSeverity] = useState<SeverityLevel>('HIGH');
  const [peopleAffected, setPeopleAffected] = useState(150);
  const [description, setDescription] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFieldReport({
      author: currentUser.name,
      role: currentUser.role,
      location: location || 'Sector 4, Bridge 2 Access Ramp',
      coordinates: { lat: 17.385, lng: 78.486 },
      category: category || 'Infrastructure Obstruction',
      severity,
      peopleAffected: Number(peopleAffected) || 10,
      description: description || 'Roadway submerged by 1.2m overflow; fallen timber obstructing emergency transport.'
    });
    setShowSubmitModal(false);
    setLocation('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            Field Intelligence & Tactical Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            On-the-ground intelligence filed by deployed responders, automatically parsed by AI for operational impact.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Field Report</span>
        </button>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {fieldReports.map((report) => (
          <div
            key={report.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-3.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-xs text-sky-400">{report.id}</span>
                <h3 className="text-sm font-bold text-white">{report.category}</h3>
                <SeverityBadge severity={report.severity} size="sm" />
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {report.timestamp}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {report.location}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed pl-2 border-l-2 border-slate-700">
              "{report.description}"
            </p>

            {/* AI Operational Classification Breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI OPERATIONAL CLASSIFICATION</span>
                </div>
                <OperationalTag type="AI_RECOMMENDATION" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Operational Impact Assessment:</span>
                  <p className="text-slate-300 font-medium mt-0.5">{report.aiOperationalImpact}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Suggested Command Action:</span>
                  <p className="text-emerald-400 font-medium mt-0.5">{report.suggestedAction}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <div>
                Author: <strong className="text-slate-300">{report.author}</strong> ({report.role})
              </div>
              <div className="text-emerald-400">
                Verified By: {report.verifiedBy || 'HQ Command Duty Officer'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Submit Report */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" />
                Submit Field Reconnaissance Report
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Incident Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    <option value="Infrastructure Obstruction">Infrastructure Obstruction</option>
                    <option value="Medical Supply Depletion">Medical Supply Depletion</option>
                    <option value="Structural Damage / Collapse">Structural Collapse</option>
                    <option value="Water Grid Ingress">Water Grid Contamination</option>
                    <option value="Power Grid Blackout">Power Grid Failure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assessed Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
                  >
                    <option value="CRITICAL">Critical Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Exact Location / Coordinates</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 4 Flyover Culvert 12"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimated Affected</label>
                  <input
                    type="number"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observation Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail visible hazards, water depth, road passability, and acute needs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  required
                />
              </div>

              {/* Photo Upload Simulation */}
              <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>Geotagged Photo: <strong className="text-slate-200">IMG_20261005_0845.jpg</strong> (GPS Attached)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">VERIFIED METADATA</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-lg"
                >
                  Submit & Trigger AI Classification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
