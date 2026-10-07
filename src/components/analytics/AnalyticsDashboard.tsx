import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getAggregatedAnalytics, HISTORICAL_DISTRESS_DATA } from '../../data/analyticsDataset';
import { ExportReportFAB } from '../common/ExportReportFAB';
import { generateAnalyticsPDF, generateAnalyticsCSV } from '../../utils/exportUtils';
import {
  BarChart3,
  Clock,
  CheckCircle,
  Users,
  Box,
  Calendar,
  Layers,
  Sparkles,
  TrendingDown,
  Activity,
  ShieldAlert
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { requests } = useApp();
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D'>('7D');

  // Dynamically compute all KPIs and charts based on dateRange and live requests
  const analytics = useMemo(() => {
    return getAggregatedAnalytics(dateRange, requests);
  }, [dateRange, requests]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medical':
        return 'bg-rose-500';
      case 'Rescue':
        return 'bg-amber-500';
      case 'Water':
        return 'bg-sky-500';
      case 'Food':
        return 'bg-emerald-500';
      case 'Shelter':
        return 'bg-indigo-500';
      case 'Sanitation':
        return 'bg-teal-500';
      case 'Transportation':
        return 'bg-cyan-500';
      case 'Electricity':
        return 'bg-yellow-500';
      case 'Communication':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-rose-500';
      case 'HIGH':
        return 'bg-amber-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            Operational Command Analytics & Performance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key operational metrics, response velocity tracking, and multi-sector demand distribution.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono shadow-inner">
          <button
            type="button"
            onClick={() => setDateRange('7D')}
            aria-pressed={dateRange === '7D'}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
              dateRange === '7D'
                ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7 Days</span>
          </button>
          <button
            type="button"
            onClick={() => setDateRange('30D')}
            aria-pressed={dateRange === '30D'}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
              dateRange === '30D'
                ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30 Days</span>
          </button>
          <button
            type="button"
            onClick={() => setDateRange('90D')}
            aria-pressed={dateRange === '90D'}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
              dateRange === '90D'
                ? 'bg-rose-600 text-white shadow-md ring-1 ring-rose-400/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>90 Days</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Average Dispatch Velocity */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow space-y-1 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Average Dispatch Velocity</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {analytics.dispatchVelocityMinutes}{' '}
            <span className="text-xs font-normal text-slate-400">minutes</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingDown className="w-3 h-3 inline shrink-0" />
            <span>{analytics.velocityComparisonText}</span>
          </p>
        </div>

        {/* 2. Request Resolution Rate */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow space-y-1 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Request Resolution Rate</span>
            <CheckCircle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {analytics.resolutionRate}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {analytics.resolvedCount.toLocaleString()} of {analytics.totalCalls.toLocaleString()} cases completed
          </p>
        </div>

        {/* 3. Resource Delivery Ratio */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow space-y-1 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Resource Delivery Ratio</span>
            <Box className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {analytics.deliveryRatio}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {analytics.deliveredCount.toLocaleString()} of {analytics.deliveryTotalCount.toLocaleString()} missions verified
          </p>
        </div>

        {/* 4. Lives Supported */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 shadow space-y-1 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Lives Supported</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
            {analytics.livesSupported.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Sheltered & sustained across {analytics.totalCalls.toLocaleString()} calls
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distress Calls by Humanitarian Category Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Distress Calls by Humanitarian Category
            </span>
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              {analytics.totalCalls.toLocaleString()} Total ({dateRange})
            </span>
          </h3>

          <div className="space-y-3">
            {analytics.categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-300 font-medium">{item.category}</span>
                  <span className="text-slate-400 tabular-nums">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getCategoryColor(item.category)}`}
                    style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Top Sector Demand:</span>
            <strong className="text-white">
              {analytics.categoryBreakdown[0]?.category} ({analytics.categoryBreakdown[0]?.percentage}% of volume)
            </strong>
          </div>
        </div>

        {/* Chart 2: Distress Calls by Triage Urgency Breakdown */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Distress Calls by Triage Urgency
            </span>
            <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              Severity Distribution ({dateRange})
            </span>
          </h3>

          <div className="space-y-3">
            {analytics.urgencyBreakdown.map((item) => (
              <div key={item.urgency} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-300 font-bold">{item.urgency}</span>
                  <span className="text-slate-400 tabular-nums">
                    {item.count.toLocaleString()} calls ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getUrgencyColor(item.urgency)}`}
                    style={{ width: `${Math.max(item.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            <strong>Triage Insight:</strong> Critical cases accounted for{' '}
            <span className="text-rose-400 font-bold">{analytics.criticalPercentage}%</span> of incoming distress beacons during the {dateRange === '7D' ? 'last 7 days' : dateRange === '30D' ? 'last 30 days' : 'last 90 days'} (
            {analytics.urgencyBreakdown.find((u) => u.urgency === 'CRITICAL')?.count.toLocaleString()} critical calls).
          </div>
        </div>
      </div>

      {/* Floating Action Button for PDF / CSV Export */}
      <ExportReportFAB
        title={`Operational Analytics Dossier (${dateRange === '7D' ? '7 Days' : dateRange === '30D' ? '30 Days' : '90 Days'})`}
        subtitle={`${analytics.totalCalls.toLocaleString()} calls · ${analytics.livesSupported.toLocaleString()} lives supported`}
        onExportPDF={() => generateAnalyticsPDF(analytics, HISTORICAL_DISTRESS_DATA)}
        onExportCSV={() => generateAnalyticsCSV(analytics, HISTORICAL_DISTRESS_DATA)}
      />
    </div>
  );
};
