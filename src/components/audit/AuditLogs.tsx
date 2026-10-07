import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.incidentId && log.incidentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.affectedResource && log.affectedResource.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-emerald-400" />
            Immutable Operational Audit & Accountability Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped log of all coordinator authorizations, AI triage executions, and resource transfers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>FEMA NIMS & Audit Invariant Compliant</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by actor, incident, or resource ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {filteredLogs.length} Records Verified
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                <th className="pb-3 font-semibold">Timestamp</th>
                <th className="pb-3 font-semibold">Actor / Duty Officer</th>
                <th className="pb-3 font-semibold">Operational Directive Executed</th>
                <th className="pb-3 font-semibold">Incident / Resource Scope</th>
                <th className="pb-3 font-semibold">State Transition</th>
                <th className="pb-3 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono text-slate-400 text-xs whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-white">{log.actorName}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{log.actorRole}</div>
                  </td>
                  <td className="py-3 text-slate-200 max-w-sm">
                    {log.action}
                  </td>
                  <td className="py-3 font-mono text-xs">
                    {log.incidentId && (
                      <span className="text-rose-400 mr-2">{log.incidentId}</span>
                    )}
                    {log.affectedResource && (
                      <span className="text-amber-400">{log.affectedResource}</span>
                    )}
                    {!log.incidentId && !log.affectedResource && (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[11px]">
                    {log.previousState && log.newState ? (
                      <div className="flex items-center gap-1 text-slate-400">
                        <span className="text-slate-400">{log.previousState}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-emerald-400 font-bold">{log.newState}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">SYSTEM_RECORD</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border font-semibold ${
                        log.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                      {log.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
