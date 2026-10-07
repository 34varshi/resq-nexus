import { EmergencyRequest, RequestType, SeverityLevel, RequestStatus } from '../types';

export interface HistoricalDistressRecord {
  id: string;
  type: RequestType;
  urgency: SeverityLevel;
  status: RequestStatus;
  peopleCount: number;
  dispatchVelocityMinutes: number;
  resourceDelivered: boolean;
  resourceRequired: boolean;
  daysAgo: number;
  createdAt: string;
}

// Generate a deterministic, realistic date-aware dataset of humanitarian calls across 90 days
function generateHistoricalRecords(): HistoricalDistressRecord[] {
  const records: HistoricalDistressRecord[] = [];
  const baseTimestamp = Date.now();

  // Pseudo-random deterministic generator to ensure identical stable results across renders
  let seed = 42;
  const pseudoRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // 1. Last 7 Days (Acute Flooding & Cyclone Surge Phase: days 0 to 7)
  // Target: ~180 historical calls + current live context calls = ~208 calls
  const categories7D: RequestType[] = [
    'Medical', 'Medical', 'Medical',
    'Rescue', 'Rescue',
    'Water', 'Water',
    'Food',
    'Shelter',
    'Sanitation',
    'Transportation'
  ];

  for (let i = 0; i < 180; i++) {
    const daysAgo = +(pseudoRand() * 6.8).toFixed(2);
    const cat = categories7D[Math.floor(pseudoRand() * categories7D.length)];
    const randUrgency = pseudoRand();
    const urgency: SeverityLevel =
      randUrgency < 0.42 ? 'CRITICAL' : randUrgency < 0.78 ? 'HIGH' : randUrgency < 0.93 ? 'MEDIUM' : 'LOW';

    // In acute flood surge, some recent cases are in progress or assigned
    const randStatus = pseudoRand();
    const status: RequestStatus =
      randStatus < 0.65 ? 'RESOLVED' : randStatus < 0.88 ? 'VERIFIED' : randStatus < 0.94 ? 'IN_PROGRESS' : 'ASSIGNED';

    const peopleCount = Math.floor(10 + pseudoRand() * 85);
    // Flood transit delay gives avg ~18.4 min
    const dispatchVelocityMinutes = Math.floor(12 + pseudoRand() * 14);
    const resourceDelivered = pseudoRand() < 0.94;

    const createdAt = new Date(baseTimestamp - daysAgo * 86400000).toISOString();

    records.push({
      id: `HIST-7D-${1000 + i}`,
      type: cat,
      urgency,
      status,
      peopleCount,
      dispatchVelocityMinutes,
      resourceDelivered,
      resourceRequired: true,
      daysAgo,
      createdAt
    });
  }

  // 2. Days 8 to 30 (Sustained Monsoon Inundation & Industrial Containment Phase)
  // Target: ~472 records
  const categories30D: RequestType[] = [
    'Medical', 'Medical',
    'Food', 'Food',
    'Water', 'Water',
    'Rescue',
    'Shelter',
    'Sanitation',
    'Transportation',
    'Electricity',
    'Communication'
  ];

  for (let i = 0; i < 472; i++) {
    const daysAgo = +(7.1 + pseudoRand() * 22.8).toFixed(2);
    const cat = categories30D[Math.floor(pseudoRand() * categories30D.length)];
    const randUrgency = pseudoRand();
    const urgency: SeverityLevel =
      randUrgency < 0.28 ? 'CRITICAL' : randUrgency < 0.68 ? 'HIGH' : randUrgency < 0.89 ? 'MEDIUM' : 'LOW';

    const randStatus = pseudoRand();
    const status: RequestStatus = randStatus < 0.94 ? 'RESOLVED' : 'VERIFIED';

    const peopleCount = Math.floor(15 + pseudoRand() * 95);
    // Faster road conditions in standard response gives avg ~14.6 min
    const dispatchVelocityMinutes = Math.floor(9 + pseudoRand() * 12);
    const resourceDelivered = pseudoRand() < 0.97;

    const createdAt = new Date(baseTimestamp - daysAgo * 86400000).toISOString();

    records.push({
      id: `HIST-30D-${2000 + i}`,
      type: cat,
      urgency,
      status,
      peopleCount,
      dispatchVelocityMinutes,
      resourceDelivered,
      resourceRequired: true,
      daysAgo,
      createdAt
    });
  }

  // 3. Days 31 to 90 (Summer Heatwaves, Seasonal Cloudbursts & Multi-Zone Relief)
  // Target: ~1170 records
  const categories90D: RequestType[] = [
    'Food', 'Food', 'Food',
    'Medical', 'Medical',
    'Water', 'Water',
    'Shelter',
    'Rescue',
    'Sanitation',
    'Electricity',
    'Transportation',
    'Clothing'
  ];

  for (let i = 0; i < 1170; i++) {
    const daysAgo = +(30.1 + pseudoRand() * 59.8).toFixed(2);
    const cat = categories90D[Math.floor(pseudoRand() * categories90D.length)];
    const randUrgency = pseudoRand();
    const urgency: SeverityLevel =
      randUrgency < 0.17 ? 'CRITICAL' : randUrgency < 0.49 ? 'HIGH' : randUrgency < 0.88 ? 'MEDIUM' : 'LOW';

    const status: RequestStatus = pseudoRand() < 0.98 ? 'RESOLVED' : 'CLOSED';

    const peopleCount = Math.floor(20 + pseudoRand() * 110);
    // Routine quarterly response gives avg ~11.8 min
    const dispatchVelocityMinutes = Math.floor(8 + pseudoRand() * 9);
    const resourceDelivered = pseudoRand() < 0.99;

    const createdAt = new Date(baseTimestamp - daysAgo * 86400000).toISOString();

    records.push({
      id: `HIST-90D-${4000 + i}`,
      type: cat,
      urgency,
      status,
      peopleCount,
      dispatchVelocityMinutes,
      resourceDelivered,
      resourceRequired: true,
      daysAgo,
      createdAt
    });
  }

  return records;
}

export const HISTORICAL_DISTRESS_DATA: HistoricalDistressRecord[] = generateHistoricalRecords();

export interface AggregatedAnalytics {
  range: '7D' | '30D' | '90D';
  totalCalls: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  urgencyBreakdown: { urgency: SeverityLevel; count: number; percentage: number }[];
  resolutionRate: number; // e.g. 87.2
  resolvedCount: number;
  deliveryRatio: number; // e.g. 94.1
  deliveredCount: number;
  deliveryTotalCount: number;
  dispatchVelocityMinutes: number; // e.g. 18.4
  velocityComparisonText: string;
  livesSupported: number; // e.g. 18420
  criticalPercentage: number;
}

/**
 * Filter and compute exact analytics metrics from the unified date-aware dataset,
 * incorporating both historical records and active live emergency requests.
 */
export function getAggregatedAnalytics(
  range: '7D' | '30D' | '90D',
  liveRequests: EmergencyRequest[] = []
): AggregatedAnalytics {
  const maxDays = range === '7D' ? 7 : range === '30D' ? 30 : 90;

  // Filter historical records for this window
  const filteredHist = HISTORICAL_DISTRESS_DATA.filter((r) => r.daysAgo <= maxDays);

  // Convert live requests into consistent records
  const liveConverted: HistoricalDistressRecord[] = liveRequests.map((r, idx) => {
    // Parse createdAt or assign recent time
    let daysAgo = 0.5;
    try {
      const parsed = Date.parse(r.createdAt.replace(' ', 'T'));
      if (!isNaN(parsed)) {
        daysAgo = Math.max(0, (Date.now() - parsed) / 86400000);
      }
    } catch {
      daysAgo = 0.5;
    }

    const isResolved = r.status === 'RESOLVED' || r.status === 'VERIFIED' || r.status === 'CLOSED';
    return {
      id: r.id,
      type: r.type,
      urgency: r.urgency,
      status: r.status,
      peopleCount: r.peopleCount,
      dispatchVelocityMinutes: r.urgency === 'CRITICAL' ? 14 : r.urgency === 'HIGH' ? 19 : 25,
      resourceDelivered: isResolved || r.status === 'ASSIGNED',
      resourceRequired: true,
      daysAgo,
      createdAt: r.createdAt
    };
  }).filter((r) => r.daysAgo <= maxDays);

  // Unified dataset for the chosen time range
  const allRecords = [...liveConverted, ...filteredHist];
  const totalCalls = allRecords.length;

  // 1. Distress Calls by Humanitarian Category
  const catMap: Record<string, number> = {};
  allRecords.forEach((r) => {
    catMap[r.type] = (catMap[r.type] || 0) + 1;
  });

  const categoryBreakdown = Object.entries(catMap)
    .map(([cat, count]) => ({
      category: cat,
      count,
      percentage: totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // 2. Distress Calls by Triage Urgency
  const urgencyOrder: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const urgencyMap: Record<SeverityLevel, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };
  allRecords.forEach((r) => {
    if (urgencyMap[r.urgency] !== undefined) {
      urgencyMap[r.urgency]++;
    }
  });

  const urgencyBreakdown = urgencyOrder.map((urg) => ({
    urgency: urg,
    count: urgencyMap[urg],
    percentage: totalCalls > 0 ? Math.round((urgencyMap[urg] / totalCalls) * 100) : 0
  }));

  const criticalPercentage = urgencyBreakdown.find((u) => u.urgency === 'CRITICAL')?.percentage || 0;

  // 3. Request Resolution Rate
  const resolvedCount = allRecords.filter(
    (r) => r.status === 'RESOLVED' || r.status === 'VERIFIED' || r.status === 'CLOSED'
  ).length;
  const resolutionRate = totalCalls > 0 ? Number(((resolvedCount / totalCalls) * 100).toFixed(1)) : 0;

  // 4. Resource Delivery Ratio
  const deliveredCount = allRecords.filter((r) => r.resourceDelivered).length;
  const deliveryTotalCount = allRecords.length;
  const deliveryRatio = totalCalls > 0 ? Number(((deliveredCount / deliveryTotalCount) * 100).toFixed(1)) : 0;

  // 5. Average Dispatch Velocity
  const totalVelocity = allRecords.reduce((acc, r) => acc + r.dispatchVelocityMinutes, 0);
  const dispatchVelocityMinutes = totalCalls > 0 ? Number((totalVelocity / totalCalls).toFixed(1)) : 0;

  const velocityComparisonText =
    range === '7D'
      ? '-14% vs conventional NIMS baseline (Acute Surge)'
      : range === '30D'
      ? '-26% vs regional emergency target (Sustained Deployment)'
      : '-34% quarterly response efficiency (Stabilized Sector COP)';

  // 6. Lives Supported
  // Calculate total lives impacted/sheltered/sustained
  const rawPeople = allRecords.reduce((acc, r) => acc + r.peopleCount, 0);
  // Add proportional shelter occupant multiplier for the time period
  const shelterMultiplier = range === '7D' ? 1.45 : range === '30D' ? 1.6 : 1.75;
  const livesSupported = Math.round(rawPeople * shelterMultiplier);

  return {
    range,
    totalCalls,
    categoryBreakdown,
    urgencyBreakdown,
    resolutionRate,
    resolvedCount,
    deliveryRatio,
    deliveredCount,
    deliveryTotalCount,
    dispatchVelocityMinutes,
    velocityComparisonText,
    livesSupported,
    criticalPercentage
  };
}
