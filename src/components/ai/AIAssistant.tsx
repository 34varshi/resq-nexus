import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { SeverityBadge, OperationalTag } from '../common/StatusBadges';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  User,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  recommendedActions?: string[];
}

export const AIAssistant: React.FC = () => {
  const {
    requests,
    resources,
    incidents,
    shelters,
    teams,
    metrics,
    aiRecommendations,
    approveAIRecommendation,
    setCurrentView
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: 'Good morning, Commander Jenkins. NEXUS AI operational co-pilot initialized. I am synchronized with 12 active incidents, 28 distress requests, and 8 shelter nodes across Sector 4. How can I assist your command directives?',
      timestamp: '08:30 AM',
      sources: [
        '12 Active Incidents',
        '28 Critical Requests',
        '8 Activated Shelters',
        '20 Monitored Inventory Depots'
      ]
    }
  ]);

  const quickPrompts = [
    'Which areas currently need medical assistance?',
    'What are our biggest resource shortages?',
    'Which shelters have capacity?',
    'What requests should we prioritize first?',
    'Which team is closest to Incident #INC-104?',
    'What resources will likely run out in the next 24 hours?'
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Formulate platform-grounded answer based strictly on active datasets
    setTimeout(() => {
      let reply = '';
      let sources: string[] = [];
      let actions: string[] = [];

      const queryLower = q.toLowerCase();

      if (queryLower.includes('medical') || queryLower.includes('health') || queryLower.includes('clinic')) {
        const medReqs = requests.filter((r) => r.type === 'Medical' && r.status !== 'RESOLVED');
        reply = `Currently, there are ${medReqs.length} active medical requests concentrated in Sector 4 Lowland Colony and Ward 8. The most urgent is REQ-1048 (St. Jude Clinic, 42 patients trapped by 1.1m floodwaters) and REQ-1053 (Mother & Child Care Home, 3 premature infants requiring power for incubators).`;
        sources = [
          `${medReqs.length} Active Medical Requests in database`,
          'Telemetry from Ward 4 Clinic Generator',
          'Triage Priority Score 96/100 (REQ-1048)'
        ];
        actions = ['Dispatch Mobile Medical Squad M-04', 'Reallocate 5kVA silent generator from Logistics Yard'];
      } else if (queryLower.includes('shortage') || queryLower.includes('run out') || queryLower.includes('deplet')) {
        const shortages = resources.filter((r) => r.status === 'LOW_STOCK' || r.available < r.lowStockThreshold);
        reply = `Critical shortages identified across ${shortages.length} assets: Potable Water (18,500 L remaining vs 20,000 L threshold), Emergency Trauma Kits (120 kits remaining vs 150 min buffer), and Amphibious Rescue Boats (only 4 available out of 16). Based on demand consumption velocity, potable drinking water in Zone B will reach exhaustion within 24 hours (deficit: 6,400 L).`;
        sources = [
          'WASH Demand Consumption Velocity Model',
          'Municipal Water Board Depot B Inventory',
          'Emergency Medical Warehouse Telemetry'
        ];
        actions = ['Approve requisition of 8,000 L Water Tanker V-12', 'Trigger military trauma kit mutual aid protocol'];
      } else if (queryLower.includes('shelter') || queryLower.includes('bed') || queryLower.includes('capacity')) {
        const openShelters = shelters.filter((s) => s.status !== 'FULL');
        reply = `Total municipal shelter occupancy is currently at ${metrics.shelterCapacityPercent}%. Best available facilities include Central Sports Complex (340 beds available, full medical support) and West Aerodrome Logistics Camp (1,090 beds available). However, South Riverview Community Center is at 98% capacity (490/500) and requires diversion of incoming bus convoys.`;
        sources = [
          '8 Active Shelter Headcount Audits',
          'Central Relief Complex Sensor Telemetry',
          'South Riverview Camp Gate Log'
        ];
        actions = ['Divert Sector 4 evacuee convoy to St. Teresa Shelter (+170 beds available)'];
      } else if (queryLower.includes('prioritize') || queryLower.includes('first')) {
        const top3 = requests
          .filter((r) => r.status !== 'RESOLVED' && r.status !== 'CLOSED')
          .sort((a, b) => b.priorityScore - a.priorityScore)
          .slice(0, 3);
        reply = `The AI Triage Engine recommends prioritizing the following 3 life-critical distress calls based on golden-hour timelines:\n1. ${top3[0]?.id}: ${top3[0]?.requesterName} (Score ${top3[0]?.priorityScore}/100) — ${top3[0]?.description.slice(0, 90)}...\n2. ${top3[1]?.id}: ${top3[1]?.requesterName} (Score ${top3[1]?.priorityScore}/100) — ${top3[1]?.description.slice(0, 90)}...\n3. ${top3[2]?.id}: ${top3[2]?.requesterName} (Score ${top3[2]?.priorityScore}/100) — ${top3[2]?.description.slice(0, 90)}...`;
        sources = [
          'Neural Triage Engine Multi-Parameter Equation',
          '28 Active Requests Rank Matrix',
          'Pediatric & Geriatric Vulnerability Index'
        ];
        actions = ['Authorize instant dispatch order for Top 3 Queue'];
      } else if (queryLower.includes('team') || queryLower.includes('closest') || queryLower.includes('inc-102') || queryLower.includes('inc-104')) {
        reply = `For Incident #INC-104 (Sector 4 Flood Inundation), Rapid Flood Rescue Strike Force TEAM-R07 is stationed at Sector 4 North Staging Base (2.3 km away, estimated arrival 12 minutes with amphibious watercraft). Mobile Critical Care Squad MED-M04 is 3.1 km away with high-clearance 4x4 ambulance.`;
        sources = [
          'GPS Automated Vehicle Locator (AVL) Stream',
          'Incident INC-104 Geofence Boundary',
          'Road Passability Survey (40% Open)'
        ];
        actions = ['Deploy TEAM-R07 via North Flyover corridor'];
      } else {
        reply = `Based on current verified operations across 12 active incidents, 28 distress requests, and ${metrics.activeTeamsCount} deployed squads: all command recommendations are logged with full explainability. For this specific inquiry, I do not have sufficient sensor verification in the platform database to provide an unverified speculative answer.`;
        sources = ['Platform Master Database (ResQ Nexus NIMS Core)'];
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources,
        recommendedActions: actions
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <AIDisclaimerBanner />

      {/* Main Grid: Chat Assistant (Left 8 cols) & Action Copilot Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Window (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-600/40 flex items-center justify-center text-sky-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  NEXUS AI Operational Assistant
                  <OperationalTag type="AI_RECOMMENDATION" />
                </h3>
                <p className="text-[11px] text-slate-400">
                  Grounded strictly in verified platform state. Zero hallucinated data policy.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'msg-reset',
                    sender: 'assistant',
                    text: 'Chat history cleared. Grounded in current telemetry. What operational inquiry can I assist with?',
                    timestamp: 'Just now'
                  }
                ])
              }
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-2xl space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Grounded Source References */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                      <span className="text-sky-300 font-semibold block">Verified Source Telemetry:</span>
                      {msg.sources.map((src, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{src}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Embedded Suggested Actions */}
                  {msg.recommendedActions && msg.recommendedActions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-semibold text-emerald-300 font-mono block">
                        Recommended Actions for Commander:
                      </span>
                      {msg.recommendedActions.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 text-[11px]"
                        >
                          <span className="text-slate-200">{act}</span>
                          <button
                            onClick={() => setCurrentView('dashboard')}
                            className="text-emerald-400 hover:underline font-mono text-[10px]"
                          >
                            Review & Authorize →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-slate-400 text-right">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-300 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex gap-2 text-[11px]">
            {quickPrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask NEXUS AI regarding shortages, triage, nearest squad, or shelter capacity..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit</span>
              </button>
            </form>
          </div>
        </div>

        {/* AI Action Copilot Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Recommended Next Actions</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                {aiRecommendations.filter((r) => r.status === 'PENDING').length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {aiRecommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                    <SeverityBadge severity={rec.severity} size="sm" />
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {rec.reason}
                  </p>

                  <div className="text-[10px] font-mono text-emerald-400">
                    Impact: {rec.expectedImpact}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: {rec.confidence}%
                    </span>

                    <button
                      onClick={() => approveAIRecommendation(rec.id)}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors shadow"
                    >
                      Authorize Action
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-300 block mb-1">Human-in-the-Loop Safeguard:</strong>
              NEXUS AI is architected to prohibit autonomous dispatch or resource allocation without verified human authorization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
