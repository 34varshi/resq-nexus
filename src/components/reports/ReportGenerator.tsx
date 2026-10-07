import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExportReportFAB } from '../common/ExportReportFAB';
import { generateReportsPDF, generateReportsCSV } from '../../utils/exportUtils';
import {
  Download,
  FileText,
  CheckCircle,
  Table,
  Printer,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ReportGenerator: React.FC = () => {
  const { incidents, requests, resources, shelters, teams, aiRecommendations, metrics } = useApp();

  const [reportType, setReportType] = useState<
    'INCIDENT' | 'RESOURCE' | 'SHELTER' | 'PERFORMANCE' | 'AI_DECISION'
  >('INCIDENT');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'JSON'>('PDF');
  const [generated, setGenerated] = useState<boolean>(false);

  const reportMetadata = {
    generatedAt: '2026-10-05 09:45:00 UTC',
    incidentScope: 'INC-104 (Urban Flood Emergency)',
    classification: 'OFFICIAL OPERATIONAL DISASTER BRIEFING',
    author: 'Commander Sarah Jenkins (NDRA Director)',
    system: 'ResQ Nexus Decision Support Core'
  };

  const appData = {
    incidents,
    resources,
    shelters,
    teams,
    aiRecommendations,
    metrics
  };

  const handleDownload = () => {
    if (format === 'PDF') {
      generateReportsPDF(reportType, appData);
    } else if (format === 'CSV') {
      generateReportsCSV(reportType, appData);
    } else {
      const blob = new Blob([JSON.stringify({ metadata: reportMetadata, data: appData }, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resq_nexus_${reportType.toLowerCase()}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            Operational Report & Compliance Dossier Generator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export structured incident reviews, resource audit balance sheets, and explainable AI decision transcripts.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download {reportType} Dossier ({format})</span>
        </button>
      </div>

      {/* Control Selector Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
          <label className="text-slate-400 uppercase text-[10px] font-bold block">
            Select Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200"
          >
            <option value="INCIDENT">Incident Summary & Timeline Dossier</option>
            <option value="RESOURCE">Resource Logistics & Allocation Audit</option>
            <option value="SHELTER">Shelter Occupancy & Capacity Status</option>
            <option value="PERFORMANCE">Response Fleet Velocity & Performance</option>
            <option value="AI_DECISION">Explainable AI Decision & Triage Log</option>
          </select>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
          <label className="text-slate-400 uppercase text-[10px] font-bold block">
            Export Format Encoding
          </label>
          <div className="flex gap-2">
            {['PDF', 'CSV', 'JSON'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt as any)}
                className={`flex-1 py-2 text-center rounded-lg border font-bold transition-colors ${
                  format === fmt
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Report Preview Canvas */}
      <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 shadow-2xl font-mono text-xs space-y-6 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-rose-500 font-extrabold text-base tracking-wider">RESQ NEXUS COMMAND CORE</div>
            <div className="text-[11px] text-slate-400">{reportMetadata.classification}</div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>Date: {reportMetadata.generatedAt}</div>
            <div>Author: {reportMetadata.author}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2 font-sans">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            1. Executive Operational Overview
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            This official operational briefing compiles multi-source spatial telemetry, neural triage prioritization, and field resource dispatches for Incident #INC-104 (Metropolitan River Basin).
          </p>
        </div>

        {/* Telemetry Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <span className="text-slate-400 text-[10px] block">People Affected</span>
            <span className="text-white font-bold text-sm">{metrics.peopleAffectedTotal.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Critical Signals</span>
            <span className="text-amber-400 font-bold text-sm">{metrics.criticalRequestsCount}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Active Squads</span>
            <span className="text-emerald-400 font-bold text-sm">{metrics.activeTeamsCount}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">Shelter Occupancy</span>
            <span className="text-sky-400 font-bold text-sm">{metrics.shelterCapacityPercent}%</span>
          </div>
        </div>

        {/* Sample Content Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Verified Action Log & Directives Executed
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-800">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-2 border border-slate-800">Time</th>
                  <th className="p-2 border border-slate-800">Directive Code</th>
                  <th className="p-2 border border-slate-800">Assigned Unit</th>
                  <th className="p-2 border border-slate-800">Outcome Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-2 border border-slate-800">08:31 UTC</td>
                  <td className="p-2 border border-slate-800">DISPATCH-TEAM-R07</td>
                  <td className="p-2 border border-slate-800">Strike Force R-07</td>
                  <td className="p-2 border border-slate-800 text-emerald-400">VERIFIED COMPLETE</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800">08:52 UTC</td>
                  <td className="p-2 border border-slate-800">REALLOCATE-WATER-V12</td>
                  <td className="p-2 border border-slate-800">Tanker V-12 (8,000L)</td>
                  <td className="p-2 border border-slate-800 text-emerald-400">ON SCENE (DELIVERED)</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-800">09:15 UTC</td>
                  <td className="p-2 border border-slate-800">DIVERT-SHELTER-SHL204</td>
                  <td className="p-2 border border-slate-800">St. Teresa Transit</td>
                  <td className="p-2 border border-slate-800 text-sky-400">ACTIVE INTAKE</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sign-Off Footer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Digital Cryptographic Hash: <strong className="text-slate-300">SHA-256: d48f...90a1</strong></span>
          <span className="text-emerald-400">VALIDATED FOR NIMS COMPLIANCE</span>
        </div>
      </div>

      {generated && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center text-xs text-emerald-300 font-mono">
          ✓ Export file generated successfully. Check your browser downloads folder.
        </div>
      )}

      {/* Floating Action Button for PDF / CSV Export */}
      <ExportReportFAB
        title={`${reportType.replace('_', ' ')} Operational Dossier`}
        subtitle={`Format: PDF & CSV · Incident #INC-104 Scope`}
        onExportPDF={() => generateReportsPDF(reportType, appData)}
        onExportCSV={() => generateReportsCSV(reportType, appData)}
      />
    </div>
  );
};
