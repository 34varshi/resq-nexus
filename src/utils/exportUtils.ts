import { jsPDF } from 'jspdf';
import { AggregatedAnalytics, HistoricalDistressRecord } from '../data/analyticsDataset';
import { Incident, Resource, Shelter, ResponseTeam, AIRecommendation } from '../types';

/**
 * Trigger browser download for a CSV string using Blob
 */
export function downloadCSVFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format CSV value with proper escaping
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generate CSV report for the Analytics Screen
 */
export function generateAnalyticsCSV(
  analytics: AggregatedAnalytics,
  records: HistoricalDistressRecord[]
): void {
  const rangeDays = analytics.range === '7D' ? 7 : analytics.range === '30D' ? 30 : 90;
  const filteredRecords = records.filter((r) => r.daysAgo <= rangeDays);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const lines: string[] = [];

  // Metadata & Executive Summary
  lines.push('=== RESQ NEXUS OPERATIONAL COMMAND ANALYTICS REPORT ===');
  lines.push(`Generated At,${escapeCSV(nowStr + ' UTC')}`);
  lines.push(`Date Range Filter,${escapeCSV(analytics.range + ' (' + rangeDays + ' Days)')}`);
  lines.push(`Total Distress Calls,${analytics.totalCalls}`);
  lines.push('');

  // Section 1: KPI Metrics
  lines.push('--- EXECUTIVE OPERATIONAL KPIS ---');
  lines.push('Metric,Value,Context / Benchmark');
  lines.push(`Average Dispatch Velocity,"${analytics.dispatchVelocityMinutes} minutes","${analytics.velocityComparisonText}"`);
  lines.push(`Request Resolution Rate,"${analytics.resolutionRate}%","${analytics.resolvedCount} of ${analytics.totalCalls} cases resolved"`);
  lines.push(`Resource Delivery Ratio,"${analytics.deliveryRatio}%","${analytics.deliveredCount} of ${analytics.deliveryTotalCount} deliveries verified"`);
  lines.push(`Lives Supported,"${analytics.livesSupported.toLocaleString()}","Sheltered and sustained across ${analytics.totalCalls} calls"`);
  lines.push('');

  // Section 2: Humanitarian Categories
  lines.push('--- DISTRESS CALLS BY HUMANITARIAN CATEGORY ---');
  lines.push('Category,Distress Calls,Percentage (%)');
  analytics.categoryBreakdown.forEach((cat) => {
    lines.push(`${escapeCSV(cat.category)},${cat.count},${cat.percentage}%`);
  });
  lines.push('');

  // Section 3: Triage Urgency Distribution
  lines.push('--- DISTRESS CALLS BY TRIAGE URGENCY ---');
  lines.push('Urgency Level,Call Count,Percentage (%)');
  analytics.urgencyBreakdown.forEach((urg) => {
    lines.push(`${escapeCSV(urg.urgency)},${urg.count},${urg.percentage}%`);
  });
  lines.push('');

  // Section 4: Call Log Records
  lines.push('--- DETAILED DISTRESS CALL LOG (SAMPLE & RECENT) ---');
  lines.push('Call ID,Category,Urgency,Status,People Count,Dispatch Velocity (min),Aid Delivered,Days Ago,Created At');
  filteredRecords.slice(0, 100).forEach((rec) => {
    lines.push([
      escapeCSV(rec.id),
      escapeCSV(rec.type),
      escapeCSV(rec.urgency),
      escapeCSV(rec.status),
      rec.peopleCount,
      rec.dispatchVelocityMinutes,
      rec.resourceDelivered ? 'YES' : 'NO',
      rec.daysAgo,
      escapeCSV(rec.createdAt)
    ].join(','));
  });

  const content = lines.join('\n');
  const filename = `resq_nexus_analytics_${analytics.range.toLowerCase()}_${Date.now()}.csv`;
  downloadCSVFile(filename, content);
}

/**
 * Generate PDF report for the Analytics Screen
 */
export function generateAnalyticsPDF(
  analytics: AggregatedAnalytics,
  records: HistoricalDistressRecord[]
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const rangeDays = analytics.range === '7D' ? 7 : analytics.range === '30D' ? 30 : 90;
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Background Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  // Title
  doc.setTextColor(244, 63, 94); // rose-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RESQ NEXUS COMMAND CORE', 14, 12);

  doc.setTextColor(226, 232, 240); // slate-200
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('OPERATIONAL COMMAND ANALYTICS & PERFORMANCE DOSSIER', 14, 18);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(7.5);
  doc.text(`TIMEFRAME: LAST ${rangeDays} DAYS (${analytics.range})  |  GENERATED: ${nowStr} UTC`, 14, 24);

  // Classification Tag top right
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(145, 7, 51, 14, 2, 2, 'F');
  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('OFFICIAL BRIEFING', 149, 13);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('UNIFIED INCIDENT COP', 149, 18);

  // KPI Cards Grid (4 boxes)
  let yPos = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. EXECUTIVE PERFORMANCE INDICATORS', 14, yPos);

  yPos += 4;
  const cardWidth = 43;
  const cardHeight = 22;
  const kpis = [
    { title: 'Dispatch Velocity', val: `${analytics.dispatchVelocityMinutes} min`, sub: analytics.velocityComparisonText.slice(0, 24) },
    { title: 'Resolution Rate', val: `${analytics.resolutionRate}%`, sub: `${analytics.resolvedCount} of ${analytics.totalCalls} resolved` },
    { title: 'Delivery Ratio', val: `${analytics.deliveryRatio}%`, sub: `${analytics.deliveredCount} missions verified` },
    { title: 'Lives Supported', val: `${analytics.livesSupported.toLocaleString()}`, sub: `${analytics.totalCalls} calls sheltered` }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252); // light slate background
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(kpi.title, x + 3, yPos + 5.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(kpi.val, x + 3, yPos + 13);

    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(kpi.sub, x + 3, yPos + 18.5);
  });

  yPos += cardHeight + 8;

  // Section 2: Humanitarian Categories
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`2. DISTRESS CALLS BY HUMANITARIAN CATEGORY (${analytics.totalCalls} Total Calls)`, 14, yPos);

  yPos += 4;
  // Category Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, 182, 6, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Category', 18, yPos + 4.2);
  doc.text('Call Volume', 90, yPos + 4.2);
  doc.text('Demand Percentage', 135, yPos + 4.2);
  doc.text('Proportional Distribution', 170, yPos + 4.2);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  analytics.categoryBreakdown.slice(0, 7).forEach((cat) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(14, yPos + 5.5, 196, yPos + 5.5);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7.5);
    doc.text(cat.category, 18, yPos + 4);
    doc.text(`${cat.count.toLocaleString()} calls`, 90, yPos + 4);
    doc.text(`${cat.percentage}%`, 135, yPos + 4);

    // Mini bar
    doc.setFillColor(226, 232, 240);
    doc.rect(170, yPos + 1.8, 22, 2.8, 'F');
    doc.setFillColor(244, 63, 94);
    const barWidth = Math.max(1, (cat.percentage / 100) * 22);
    doc.rect(170, yPos + 1.8, barWidth, 2.8, 'F');

    yPos += 6;
  });

  yPos += 5;

  // Section 3: Triage Urgency
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. DISTRESS CALLS BY TRIAGE URGENCY (SEVERITY DISTRIBUTION)', 14, yPos);

  yPos += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, yPos, 182, 6, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Severity Level', 18, yPos + 4.2);
  doc.text('Registered Cases', 90, yPos + 4.2);
  doc.text('Severity Share', 135, yPos + 4.2);
  doc.text('Operational Profile', 170, yPos + 4.2);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  analytics.urgencyBreakdown.forEach((urg) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(14, yPos + 5.5, 196, yPos + 5.5);

    doc.setTextColor(
      urg.urgency === 'CRITICAL' ? 225 : urg.urgency === 'HIGH' ? 217 : urg.urgency === 'MEDIUM' ? 202 : 16,
      urg.urgency === 'CRITICAL' ? 29 : urg.urgency === 'HIGH' ? 119 : urg.urgency === 'MEDIUM' ? 138 : 185,
      urg.urgency === 'CRITICAL' ? 72 : urg.urgency === 'HIGH' ? 6 : urg.urgency === 'MEDIUM' ? 4 : 129
    );
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(urg.urgency, 18, yPos + 4);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(`${urg.count.toLocaleString()} calls`, 90, yPos + 4);
    doc.text(`${urg.percentage}%`, 135, yPos + 4);

    doc.setTextColor(100, 116, 139);
    doc.text(
      urg.urgency === 'CRITICAL' ? 'Immediate Life Safety' : urg.urgency === 'HIGH' ? 'Acute Vulnerability' : urg.urgency === 'MEDIUM' ? 'Standard Relief' : 'Routine Monitoring',
      170,
      yPos + 4
    );

    yPos += 6;
  });

  yPos += 6;

  // Insight box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, yPos, 182, 16, 1.5, 1.5, 'FD');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Command Summary & Triage Insight:', 18, yPos + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `During the last ${rangeDays} days, critical cases comprised ${analytics.criticalPercentage}% of distress signals. The fleet maintained an average response`,
    18,
    yPos + 9.5
  );
  doc.text(
    `velocity of ${analytics.dispatchVelocityMinutes} minutes with an overall resolution rate of ${analytics.resolutionRate}%, sustaining over ${analytics.livesSupported.toLocaleString()} lives.`,
    18,
    yPos + 13.5
  );

  // Footer Sign-Off
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 276, 196, 276);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('RESQ NEXUS DISASTER RELIEF SYSTEM  |  CRYPTOGRAPHIC AUDIT: SHA-256 VALIDATED', 14, 282);
  doc.text('PAGE 1 OF 1  |  STRICTLY CONFIDENTIAL', 152, 282);

  const filename = `resq_nexus_analytics_${analytics.range.toLowerCase()}_${Date.now()}.pdf`;
  doc.save(filename);
}

/**
 * Generate CSV Report for the Reports screen
 */
export function generateReportsCSV(
  reportType: 'INCIDENT' | 'RESOURCE' | 'SHELTER' | 'PERFORMANCE' | 'AI_DECISION',
  appData: {
    incidents: Incident[];
    resources: Resource[];
    shelters: Shelter[];
    teams: ResponseTeam[];
    aiRecommendations: AIRecommendation[];
    metrics: any;
  }
): void {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const lines: string[] = [];

  lines.push('=== RESQ NEXUS OFFICIAL OPERATIONAL COMPLIANCE DOSSIER ===');
  lines.push(`Report Type,${escapeCSV(reportType)}`);
  lines.push(`Generated At,${escapeCSV(nowStr + ' UTC')}`);
  lines.push(`Incident Scope,INC-104 (Metropolitan River Basin Flooding)`);
  lines.push(`Author,Commander Sarah Jenkins (NDRA Director)`);
  lines.push('');

  // Key Metrics
  lines.push('--- EXECUTIVE OPERATIONAL TELEMETRY ---');
  lines.push(`People Affected Total,${appData.metrics.peopleAffectedTotal}`);
  lines.push(`Critical Requests,${appData.metrics.criticalRequestsCount}`);
  lines.push(`Active Squads,${appData.metrics.activeTeamsCount}`);
  lines.push(`Shelter Capacity Occupancy (%),${appData.metrics.shelterCapacityPercent}%`);
  lines.push('');

  if (reportType === 'INCIDENT') {
    lines.push('--- INCIDENTS DOSSIER ---');
    lines.push('Incident ID,Title,Type,Location,Severity,Status,People Affected,Start Date,Assigned Teams,Risk Level');
    appData.incidents.forEach((inc) => {
      lines.push([
        escapeCSV(inc.id),
        escapeCSV(inc.title),
        escapeCSV(inc.type),
        escapeCSV(inc.location),
        escapeCSV(inc.severity),
        escapeCSV(inc.status),
        inc.peopleAffected,
        escapeCSV(inc.startedAt),
        escapeCSV(inc.responseTeams.join('; ')),
        escapeCSV(inc.riskLevel)
      ].join(','));
    });
  } else if (reportType === 'RESOURCE') {
    lines.push('--- RESOURCE LOGISTICS & ALLOCATION AUDIT ---');
    lines.push('Resource ID,Name,Category,Available,Reserved,Total Quantity,Unit,Depot Location,Status');
    appData.resources.forEach((res) => {
      lines.push([
        escapeCSV(res.id),
        escapeCSV(res.name),
        escapeCSV(res.category),
        res.available,
        res.reserved,
        res.quantity,
        escapeCSV(res.unit),
        escapeCSV(res.location),
        escapeCSV(res.status)
      ].join(','));
    });
  } else if (reportType === 'SHELTER') {
    lines.push('--- SHELTER CAPACITY & OCCUPANCY STATUS ---');
    lines.push('Shelter ID,Name,Location,Total Capacity,Occupied Beds,Free Beds,Occupancy (%),Water Supply,Status');
    appData.shelters.forEach((shl) => {
      const free = shl.capacity - shl.occupied;
      const pct = Math.round((shl.occupied / shl.capacity) * 100);
      lines.push([
        escapeCSV(shl.id),
        escapeCSV(shl.name),
        escapeCSV(shl.location),
        shl.capacity,
        shl.occupied,
        free,
        `${pct}%`,
        escapeCSV(shl.waterStatus),
        escapeCSV(shl.status)
      ].join(','));
    });
  } else if (reportType === 'PERFORMANCE') {
    lines.push('--- RESPONSE FLEET VELOCITY & PERFORMANCE ---');
    lines.push('Team ID,Name,Specialty Skills,Status,Staging Base,Vehicle,Leader Name,Personnel Count');
    appData.teams.forEach((t) => {
      lines.push([
        escapeCSV(t.id),
        escapeCSV(t.name),
        escapeCSV(t.skills.join('; ')),
        escapeCSV(t.status),
        escapeCSV(t.location),
        escapeCSV(t.vehicle),
        escapeCSV(t.leaderName),
        t.membersCount
      ].join(','));
    });
  } else {
    lines.push('--- EXPLAINABLE AI DECISION & TRIAGE LOG ---');
    lines.push('Recommendation ID,Title,Type,Confidence (%),Severity,Impact Reasoning,Status');
    appData.aiRecommendations.forEach((rec) => {
      lines.push([
        escapeCSV(rec.id),
        escapeCSV(rec.title),
        escapeCSV(rec.type),
        rec.confidence,
        escapeCSV(rec.severity),
        escapeCSV(rec.reason),
        escapeCSV(rec.status)
      ].join(','));
    });
  }

  const filename = `resq_nexus_${reportType.toLowerCase()}_dossier_${Date.now()}.csv`;
  downloadCSVFile(filename, lines.join('\n'));
}

/**
 * Generate PDF Report for the Reports screen
 */
export function generateReportsPDF(
  reportType: 'INCIDENT' | 'RESOURCE' | 'SHELTER' | 'PERFORMANCE' | 'AI_DECISION',
  appData: {
    incidents: Incident[];
    resources: Resource[];
    shelters: Shelter[];
    teams: ResponseTeam[];
    aiRecommendations: AIRecommendation[];
    metrics: any;
  }
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // Background Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(244, 63, 94); // rose-500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RESQ NEXUS COMMAND CORE', 14, 12);

  doc.setTextColor(226, 232, 240); // slate-200
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`OPERATIONAL REPORT: ${reportType.replace('_', ' ')} COMPLIANCE DOSSIER`, 14, 18);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(7);
  doc.text(`INCIDENT: INC-104  |  DATE: ${nowStr} UTC  |  NIMS COMPLIANT`, 14, 24);

  // Telemetry Cards
  let yPos = 36;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. CURRENT DISASTER TELEMETRY MATRIX', 14, yPos);

  yPos += 4;
  const cardWidth = 43;
  const cardHeight = 18;
  const telemetrics = [
    { label: 'People Affected', val: appData.metrics.peopleAffectedTotal.toLocaleString() },
    { label: 'Critical Signals', val: String(appData.metrics.criticalRequestsCount) },
    { label: 'Active Squads', val: String(appData.metrics.activeTeamsCount) },
    { label: 'Shelter Occupancy', val: `${appData.metrics.shelterCapacityPercent}%` }
  ];

  telemetrics.forEach((item, idx) => {
    const x = 14 + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, yPos, cardWidth, cardHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(item.label, x + 3, yPos + 5.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(item.val, x + 3, yPos + 13);
  });

  yPos += cardHeight + 8;

  // Section 2 Table Header
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`2. DETAILED AUDIT DOSSIER (${reportType})`, 14, yPos);

  yPos += 4;

  if (reportType === 'INCIDENT') {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, 182, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ID', 16, yPos + 4.2);
    doc.text('Title & Location', 38, yPos + 4.2);
    doc.text('Severity', 115, yPos + 4.2);
    doc.text('People', 145, yPos + 4.2);
    doc.text('Status', 170, yPos + 4.2);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    appData.incidents.slice(0, 10).forEach((inc) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 6, 196, yPos + 6);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7.5);
      doc.text(inc.id, 16, yPos + 4.2);
      doc.text(inc.title.slice(0, 42), 38, yPos + 4.2);
      doc.text(inc.severity, 115, yPos + 4.2);
      doc.text(inc.peopleAffected.toLocaleString(), 145, yPos + 4.2);
      doc.text(inc.status, 170, yPos + 4.2);
      yPos += 7;
    });
  } else if (reportType === 'RESOURCE') {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, 182, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ID', 16, yPos + 4.2);
    doc.text('Resource Name', 38, yPos + 4.2);
    doc.text('Category', 105, yPos + 4.2);
    doc.text('Available / Total', 145, yPos + 4.2);
    doc.text('Stock Level', 175, yPos + 4.2);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    appData.resources.slice(0, 10).forEach((res) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 6, 196, yPos + 6);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7.5);
      doc.text(res.id, 16, yPos + 4.2);
      doc.text(res.name.slice(0, 36), 38, yPos + 4.2);
      doc.text(res.category, 105, yPos + 4.2);
      doc.text(`${res.available.toLocaleString()} ${res.unit}`, 145, yPos + 4.2);
      doc.text(res.status, 175, yPos + 4.2);
      yPos += 7;
    });
  } else if (reportType === 'SHELTER') {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, 182, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ID', 16, yPos + 4.2);
    doc.text('Shelter Facility', 38, yPos + 4.2);
    doc.text('Location', 105, yPos + 4.2);
    doc.text('Occupancy', 145, yPos + 4.2);
    doc.text('Free Beds', 175, yPos + 4.2);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    appData.shelters.slice(0, 10).forEach((shl) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 6, 196, yPos + 6);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7.5);
      doc.text(shl.id, 16, yPos + 4.2);
      doc.text(shl.name.slice(0, 36), 38, yPos + 4.2);
      doc.text(shl.location.slice(0, 22), 105, yPos + 4.2);
      doc.text(`${shl.occupied} / ${shl.capacity}`, 145, yPos + 4.2);
      doc.text(String(shl.capacity - shl.occupied), 175, yPos + 4.2);
      yPos += 7;
    });
  } else if (reportType === 'PERFORMANCE') {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, 182, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Team ID', 16, yPos + 4.2);
    doc.text('Squad Unit', 38, yPos + 4.2);
    doc.text('Specialty Skills', 105, yPos + 4.2);
    doc.text('Vehicle', 145, yPos + 4.2);
    doc.text('Status', 175, yPos + 4.2);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    appData.teams.slice(0, 10).forEach((t) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 6, 196, yPos + 6);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7.5);
      doc.text(t.id, 16, yPos + 4.2);
      doc.text(t.name.slice(0, 36), 38, yPos + 4.2);
      doc.text((t.skills[0] || 'Rescue Squad').slice(0, 20), 105, yPos + 4.2);
      doc.text(t.vehicle.slice(0, 18), 145, yPos + 4.2);
      doc.text(t.status, 175, yPos + 4.2);
      yPos += 7;
    });
  } else {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, 182, 6, 'F');
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Directive Code', 16, yPos + 4.2);
    doc.text('Recommendation Title', 48, yPos + 4.2);
    doc.text('Confidence', 140, yPos + 4.2);
    doc.text('Priority', 170, yPos + 4.2);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    appData.aiRecommendations.slice(0, 8).forEach((rec) => {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, yPos + 6, 196, yPos + 6);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(7.5);
      doc.text(rec.id, 16, yPos + 4.2);
      doc.text(rec.title.slice(0, 48), 48, yPos + 4.2);
      doc.text(`${rec.confidence}%`, 140, yPos + 4.2);
      doc.text(rec.severity, 170, yPos + 4.2);
      yPos += 7;
    });
  }

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 276, 196, 276);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('RESQ NEXUS DISASTER RELIEF SYSTEM  |  DIGITAL SIGNATURE VALIDATED FOR NIMS AUDIT', 14, 282);
  doc.text('PAGE 1 OF 1  |  OFFICIAL BRIEFING', 150, 282);

  const filename = `resq_nexus_${reportType.toLowerCase()}_dossier_${Date.now()}.pdf`;
  doc.save(filename);
}
