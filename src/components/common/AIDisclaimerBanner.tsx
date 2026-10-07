import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export const AIDisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-800 bg-slate-900/60 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="truncate">
          <strong className="text-slate-300 font-medium">Human-in-the-Loop Protocol:</strong> AI triage & resource matches provide decision-support only. Final operational execution requires authorized human sign-off.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-sky-900/40 bg-sky-950/20 text-xs text-slate-300">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-sky-300 mr-2">Responsible AI & Decision-Support Mandate:</span>
          <span className="text-slate-400">
            AI recommendations are probabilistic advisory calculations based on available platform telemetry. Emergency coordinators retain final operational authority.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-slate-500 shrink-0 font-mono text-[11px]">
        <Info className="w-3.5 h-3.5" />
        <span>ISO-22320 & FEMA NIMS Compliant</span>
      </div>
    </div>
  );
};
