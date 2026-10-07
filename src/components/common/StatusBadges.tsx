import React from 'react';
import { SeverityLevel } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const isSm = size === 'sm';
  const px = isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (severity) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wide rounded border border-rose-500/40 bg-rose-950/40 text-rose-300 ${px}`}
          title="Critical Priority: Immediate Threat"
        >
          <AlertCircle className={isSm ? 'w-3 h-3 text-rose-400' : 'w-3.5 h-3.5 text-rose-400'} />
          <span>CRITICAL</span>
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wide rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 ${px}`}
          title="High Priority: Substantial Threat"
        >
          <AlertTriangle className={isSm ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />
          <span>HIGH</span>
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wide rounded border border-yellow-500/40 bg-yellow-950/40 text-yellow-300 ${px}`}
          title="Medium Priority: Monitored Threat"
        >
          <Info className={isSm ? 'w-3 h-3 text-yellow-400' : 'w-3.5 h-3.5 text-yellow-400'} />
          <span>MEDIUM</span>
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-wide rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 ${px}`}
          title="Low Priority: Controlled Status"
        >
          <CheckCircle className={isSm ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
          <span>LOW</span>
        </span>
      );
  }
};

export const OperationalTag: React.FC<{
  type: 'VERIFIED' | 'AI_RECOMMENDATION' | 'SIMULATION' | 'PREDICTED' | 'STALE_DATA' | 'OFFLINE';
}> = ({ type }) => {
  switch (type) {
    case 'VERIFIED':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-400 border border-emerald-500/30 bg-emerald-950/30 px-1.5 py-0.5 rounded">
          <CheckCircle className="w-2.5 h-2.5" />
          VERIFIED
        </span>
      );
    case 'AI_RECOMMENDATION':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-sky-400 border border-sky-500/30 bg-sky-950/30 px-1.5 py-0.5 rounded">
          <ShieldAlert className="w-2.5 h-2.5" />
          AI RECOMMENDATION
        </span>
      );
    case 'SIMULATION':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-purple-400 border border-purple-500/30 bg-purple-950/30 px-1.5 py-0.5 rounded">
          SIMULATION RESULT
        </span>
      );
    case 'PREDICTED':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-blue-400 border border-blue-500/30 bg-blue-950/30 px-1.5 py-0.5 rounded">
          PREDICTED
        </span>
      );
    case 'STALE_DATA':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-amber-400 border border-amber-500/30 bg-amber-950/30 px-1.5 py-0.5 rounded">
          STALE DATA
        </span>
      );
    case 'OFFLINE':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400 border border-slate-700 bg-slate-900 px-1.5 py-0.5 rounded">
          OFFLINE CACHED
        </span>
      );
  }
};
