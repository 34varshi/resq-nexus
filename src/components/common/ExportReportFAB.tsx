import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  X,
  FileCheck,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface ExportReportFABProps {
  title: string;
  subtitle?: string;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export const ExportReportFAB: React.FC<ExportReportFABProps> = ({
  title,
  subtitle,
  onExportPDF,
  onExportCSV
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDownload = (format: 'PDF' | 'CSV' | 'PRINT') => {
    if (format === 'PDF') {
      onExportPDF();
      setDownloadSuccess('PDF Report downloaded successfully');
    } else if (format === 'CSV') {
      onExportCSV();
      setDownloadSuccess('CSV Spreadsheet downloaded successfully');
    } else {
      window.print();
      setDownloadSuccess('Opened system print dialog');
    }

    setTimeout(() => {
      setDownloadSuccess(null);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popover Menu Panel */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-2xl p-4 text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                Export Operational Report
              </span>
              <h4 className="text-xs font-bold text-white mt-0.5 line-clamp-1">{title}</h4>
              {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close export menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Export Options */}
          <div className="mt-3 space-y-2">
            {/* Export as PDF */}
            <button
              type="button"
              onClick={() => handleDownload('PDF')}
              className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Export as PDF
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                      .pdf
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Vector dossier, executive KPIs & official NIMS briefing
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors shrink-0" />
            </button>

            {/* Export as CSV */}
            <button
              type="button"
              onClick={() => handleDownload('CSV')}
              className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Export as CSV
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                      .csv
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Raw tabular dataset compatible with Excel & Sheets
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
            </button>

            {/* Print Preview / System Print */}
            <button
              type="button"
              onClick={() => handleDownload('PRINT')}
              className="w-full p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 transition-all flex items-center justify-between group cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-300">
                    Print / System PDF Preview
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Open browser print interface
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">Print</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-2xl shadow-emerald-950/60 border border-emerald-400/40 hover:border-emerald-300 transition-all cursor-pointer active:scale-95"
        title="Export Current View Data as PDF or CSV"
        aria-label="Export Data Report"
        aria-expanded={isOpen}
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <Download className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'group-hover:-translate-y-0.5'}`} />
        <span className="tracking-wide">Export Report</span>
        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/80 border border-emerald-400/50 text-emerald-200">
          PDF / CSV
        </span>
      </button>
    </div>
  );
};
