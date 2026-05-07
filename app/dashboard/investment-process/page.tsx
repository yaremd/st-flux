"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  MagnifyingGlass,
  FileText,
  CheckCircle,
  ChartLineUp,
  Eye,
  CaretRight,
  TrendUp,
  Clock,
} from "@phosphor-icons/react";
import StellarHeader from "@/components/StellarHeader";
import DashboardPageHeader from "@/components/DashboardPageHeader";

const STAGES = [
  { id: "idea",     label: "Idea",     Icon: Lightbulb,    color: "text-violet-400",  bg: "bg-violet-500/15",     ring: "ring-violet-500/30",  line: "bg-violet-500"  },
  { id: "research", label: "Research", Icon: MagnifyingGlass, color: "text-blue-400", bg: "bg-blue-500/15",       ring: "ring-blue-500/30",    line: "bg-blue-500"    },
  { id: "thesis",   label: "Thesis",   Icon: FileText,     color: "text-cyan-400",    bg: "bg-cyan-500/15",       ring: "ring-cyan-500/30",    line: "bg-cyan-500"    },
  { id: "review",   label: "Review",   Icon: CheckCircle,  color: "text-amber-400",   bg: "bg-amber-500/15",      ring: "ring-amber-500/30",   line: "bg-amber-500"   },
  { id: "position", label: "Position", Icon: ChartLineUp,  color: "text-emerald-400", bg: "bg-emerald-500/15",    ring: "ring-emerald-500/30", line: "bg-emerald-500" },
  { id: "monitor",  label: "Monitor",  Icon: Eye,          color: "text-white/60",    bg: "bg-white/[0.06]",      ring: "ring-white/15",       line: "bg-white/30"    },
] as const;

type StageId = "idea" | "research" | "thesis" | "review" | "position" | "monitor";
type Conviction = "high" | "medium" | "low";

interface Opportunity {
  id: string;
  ticker: string;
  name: string;
  theme: string;
  stage: StageId;
  conviction: Conviction;
  direction: "long" | "short";
  analyst: string;
  catalysts: string[];
  thesisSummary: string;
  targetReturn: number;
  riskScore: number;
  keyRisk: string;
  nextAction: string;
  daysInStage: number;
}

const CONVICTION: Record<Conviction, { badge: string }> = {
  high:   { badge: "bg-emerald-500/20 text-emerald-400" },
  medium: { badge: "bg-amber-500/20 text-amber-400" },
  low:    { badge: "bg-white/[0.07] text-white/40" },
};

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "o1", ticker: "NVDA", name: "NVIDIA Corp", theme: "AI Infrastructure",
    stage: "monitor", conviction: "high", direction: "long", analyst: "YD",
    catalysts: ["Blackwell ramp", "CoWoS supply unlock", "Sovereign AI wave"],
    thesisSummary: "Data center GPU monopoly sustained through CUDA moat and interconnect leadership. Supply constraints lifting into 2H26.",
    targetReturn: 38, riskScore: 62,
    keyRisk: "Custom ASIC displacement from hyperscalers",
    nextAction: "Review quarterly on GB300 ramp metrics", daysInStage: 180,
  },
  {
    id: "o2", ticker: "CEG", name: "Constellation Energy", theme: "Nuclear Renaissance",
    stage: "position", conviction: "high", direction: "long", analyst: "YD",
    catalysts: ["Crane restart", "Data center PPAs", "IRA extension"],
    thesisSummary: "Only large-scale carbon-free baseload provider with clean nuclear fleet. AI data center demand creating power shortage that uniquely benefits nuclear.",
    targetReturn: 52, riskScore: 44,
    keyRisk: "Regulatory delay on Crane Clean Energy Center",
    nextAction: "Confirm Crane unit 1 restart timeline with IR", daysInStage: 47,
  },
  {
    id: "o3", ticker: "MELI", name: "MercadoLibre", theme: "LatAm Digital",
    stage: "position", conviction: "medium", direction: "long", analyst: "YD",
    catalysts: ["Mercado Pago TPV expansion", "Brazil fintech regulation", "Credit portfolio seasoning"],
    thesisSummary: "Dominant e-commerce + fintech flywheel in underpenetrated LatAm markets. Mercado Pago approaching critical mass in lending.",
    targetReturn: 41, riskScore: 58,
    keyRisk: "FX headwinds from BRL depreciation",
    nextAction: "Review Q2 take-rate and credit loss trends", daysInStage: 68,
  },
  {
    id: "o4", ticker: "NVO", name: "Novo Nordisk", theme: "GLP-1 Revolution",
    stage: "review", conviction: "high", direction: "long", analyst: "YD",
    catalysts: ["CagriSema Phase 3 data", "Obesity market expansion", "Supply normalization"],
    thesisSummary: "Market leader in obesity and diabetes with superior peptide IP. CagriSema could extend runway beyond 2030.",
    targetReturn: 44, riskScore: 51,
    keyRisk: "Competitive response from LLY + pipeline failures",
    nextAction: "Model CagriSema scenario tree, decide sizing", daysInStage: 12,
  },
  {
    id: "o5", ticker: "TSMC", name: "Taiwan Semiconductor", theme: "AI Infrastructure",
    stage: "review", conviction: "medium", direction: "long", analyst: "YD",
    catalysts: ["N2 ramp", "Arizona Fab 21", "AI chip demand"],
    thesisSummary: "Irreplaceable foundry with 2nm process lead. Geopolitical risk partially hedged by AZ diversification.",
    targetReturn: 35, riskScore: 72,
    keyRisk: "Taiwan Strait escalation scenario",
    nextAction: "Geopolitical risk sizing — cap at 4% given Taiwan exposure", daysInStage: 8,
  },
  {
    id: "o6", ticker: "CTRA", name: "Coterra Energy", theme: "Energy Transition",
    stage: "thesis", conviction: "medium", direction: "long", analyst: "YD",
    catalysts: ["Natural gas price recovery", "LNG export expansion", "AI power demand"],
    thesisSummary: "Low-cost Permian + Marcellus operator for LNG-driven nat gas super-cycle. AI data center demand pulling forward gas structurally.",
    targetReturn: 29, riskScore: 48,
    keyRisk: "Prolonged gas oversupply if LNG exports delayed",
    nextAction: "Complete supply/demand model, write formal thesis", daysInStage: 31,
  },
  {
    id: "o7", ticker: "ARM", name: "Arm Holdings", theme: "AI Infrastructure",
    stage: "thesis", conviction: "low", direction: "long", analyst: "YD",
    catalysts: ["Custom silicon wave", "CSS adoption", "Royalty escalation"],
    thesisSummary: "IP licensing model benefits from shift to custom silicon. CSS pre-designed chips accelerating adoption into new markets.",
    targetReturn: 33, riskScore: 68,
    keyRisk: "Valuation leaves no margin of safety at current multiple",
    nextAction: "Build comps and DCF, assess entry point", daysInStage: 19,
  },
  {
    id: "o8", ticker: "FSLR", name: "First Solar", theme: "Clean Energy",
    stage: "research", conviction: "medium", direction: "long", analyst: "YD",
    catalysts: ["US manufacturing advantage", "IRA section 45X credits", "CdTe technology"],
    thesisSummary: "Only US-headquartered utility-scale solar manufacturer. Section 45X credits create durable cost advantage vs Chinese competition.",
    targetReturn: 47, riskScore: 55,
    keyRisk: "IRA rollback risk under political transition",
    nextAction: "Deep dive on 45X credit mechanics and political durability", daysInStage: 6,
  },
  {
    id: "o9", ticker: "VST", name: "Vistra Energy", theme: "Nuclear Renaissance",
    stage: "research", conviction: "medium", direction: "long", analyst: "YD",
    catalysts: ["Comanche Peak restart", "ERCOT scarcity pricing", "Nuclear PTC"],
    thesisSummary: "Texas-focused IPP with nuclear + gas fleet for AI-driven ERCOT power demand surge. Nuclear PTC provides earnings floor.",
    targetReturn: 38, riskScore: 53,
    keyRisk: "ERCOT market design changes capping scarcity pricing",
    nextAction: "Model ERCOT capacity factor scenarios and PTC value", daysInStage: 22,
  },
  {
    id: "o10", ticker: "SMCI", name: "Super Micro Computer", theme: "AI Infrastructure",
    stage: "idea", conviction: "low", direction: "long", analyst: "YD",
    catalysts: ["Direct liquid cooling leadership", "Nvidia ODM relationship", "Server rack AI buildout"],
    thesisSummary: "DLC cooling market leader at inflection. Accounting restatement overhang clearing. Need to assess business quality.",
    targetReturn: 60, riskScore: 85,
    keyRisk: "Audit findings, accounting quality concerns",
    nextAction: "Initial screen — review financials and audit findings", daysInStage: 3,
  },
  {
    id: "o11", ticker: "OKLO", name: "Oklo Inc", theme: "Nuclear Renaissance",
    stage: "idea", conviction: "low", direction: "long", analyst: "YD",
    catalysts: ["NRC licensing track", "Data center microreactor deals", "DOE support"],
    thesisSummary: "Advanced fission microreactor targeting data center co-location. Pre-revenue but NRC engagement and OpenAI partnership noteworthy.",
    targetReturn: 120, riskScore: 92,
    keyRisk: "Regulatory timeline, pre-revenue, execution risk",
    nextAction: "Understand NRC process timeline, assess regulatory risk", daysInStage: 2,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PipelineFlow({
  selected,
  onSelect,
  counts,
}: {
  selected: StageId | null;
  onSelect: (s: StageId | null) => void;
  counts: Record<StageId, number>;
}) {
  return (
    <div className="relative z-10 flex flex-shrink-0 items-center border-b border-white/[0.07] px-6 py-3">
      <div className="flex w-full items-center gap-0">
        {STAGES.map((stage, i) => {
          const active = selected === stage.id;
          const { Icon } = stage;
          const count = counts[stage.id];
          return (
            <div key={stage.id} className="flex flex-1 items-center">
              <button
                onClick={() => onSelect(active ? null : stage.id)}
                className={[
                  "group relative flex flex-1 flex-col items-center gap-1.5 rounded-lg px-2 py-2 transition-all",
                  active ? `${stage.bg} ring-1 ${stage.ring}` : "hover:bg-white/[0.03]",
                ].join(" ")}
              >
                <div className={["flex h-8 w-8 items-center justify-center rounded-lg transition-colors", active ? stage.bg : "bg-white/[0.05]"].join(" ")}>
                  <Icon weight={active ? "fill" : "regular"} size={16} className={active ? stage.color : "text-white/40"} />
                </div>
                <span className={["text-[11px] font-medium leading-none transition-colors", active ? stage.color : "text-white/40"].join(" ")}>
                  {stage.label}
                </span>
                {count > 0 && (
                  <span className={["flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold tabular-nums", active ? `${stage.bg} ${stage.color}` : "bg-white/[0.07] text-white/30"].join(" ")}>
                    {count}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="stage-indicator"
                    className={["absolute inset-x-0 bottom-0 h-0.5 rounded-t-full", stage.line].join(" ")}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
              {i < STAGES.length - 1 && (
                <CaretRight size={12} className="mx-0.5 flex-shrink-0 text-white/20" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpportunityCard({
  op,
  selected,
  onClick,
}: {
  op: Opportunity;
  selected: boolean;
  onClick: () => void;
}) {
  const stage = STAGES.find((s) => s.id === op.stage)!;
  const conv = CONVICTION[op.conviction];
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-lg border px-4 py-3 text-left transition-all",
        selected
          ? "border-white/[0.12] bg-white/[0.05]"
          : "border-transparent hover:border-white/[0.07] hover:bg-white/[0.03]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-bold text-[#f7f7f7] shrink-0">{op.ticker}</span>
          <span className="truncate text-xs text-white/40">{op.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-medium", conv.badge].join(" ")}>
            {op.conviction}
          </span>
          <span className={["rounded-full px-1.5 py-0.5 text-[10px] font-medium", op.direction === "long" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"].join(" ")}>
            {op.direction}
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className={["rounded px-1.5 py-0.5 text-[10px] font-medium", stage.bg, stage.color].join(" ")}>
          {stage.label}
        </span>
        <span className="text-[10px] text-white/30">{op.theme}</span>
        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-white/30">
          <Clock size={9} />
          {op.daysInStage}d
        </span>
      </div>
    </button>
  );
}

function DetailPanel({ op }: { op: Opportunity }) {
  const stage = STAGES.find((s) => s.id === op.stage)!;
  const conv = CONVICTION[op.conviction];
  const stageIdx = STAGES.findIndex((s) => s.id === op.stage);

  return (
    <motion.div
      key={op.id}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/[0.07] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-2xl font-bold text-[#f7f7f7]">{op.ticker}</span>
              <span className={["rounded-full px-2 py-0.5 text-xs font-medium", conv.badge].join(" ")}>
                {op.conviction} conviction
              </span>
              <span className={["rounded-full px-2 py-0.5 text-xs font-medium", op.direction === "long" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"].join(" ")}>
                {op.direction}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-white/50">{op.name}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <TrendUp size={14} className="text-emerald-400" />
              <span className="font-mono text-lg font-bold text-emerald-400">+{op.targetReturn}%</span>
            </div>
            <span className="text-[10px] text-white/30">target return</span>
          </div>
        </div>

        {/* Stage progress */}
        <div className="mt-4 flex items-center gap-1">
          {STAGES.map((s, i) => (
            <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
              <div className={["h-0.5 w-full rounded-full transition-colors", i <= stageIdx ? s.line : "bg-white/[0.08]"].join(" ")} />
              <span className={["text-[9px] font-medium", i === stageIdx ? s.color : i < stageIdx ? "text-white/30" : "text-white/20"].join(" ")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex-shrink-0 grid grid-cols-3 divide-x divide-white/[0.07] border-b border-white/[0.07]">
        {[
          { label: "Theme", value: op.theme },
          { label: "Analyst", value: op.analyst },
          { label: "In Stage", value: `${op.daysInStage} days` },
        ].map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5 px-4 py-3">
            <span className="text-[10px] text-white/30">{m.label}</span>
            <span className="text-xs font-medium text-[#f7f7f7]">{m.value}</span>
          </div>
        ))}
      </div>

      {/* Risk score */}
      <div className="flex-shrink-0 border-b border-white/[0.07] px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-white/30">Risk Score</span>
          <span className={["font-mono text-sm font-bold", op.riskScore >= 70 ? "text-rose-400" : op.riskScore >= 50 ? "text-amber-400" : "text-emerald-400"].join(" ")}>
            {op.riskScore}/100
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${op.riskScore}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={["h-full rounded-full", op.riskScore >= 70 ? "bg-rose-500" : op.riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"].join(" ")}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-6">
        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Thesis Summary</h3>
          <p className="text-sm leading-relaxed text-white/60">{op.thesisSummary}</p>
        </div>

        <div>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Key Catalysts</h3>
          <div className="space-y-1.5">
            {op.catalysts.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={["h-1.5 w-1.5 flex-shrink-0 rounded-full", stage.line].join(" ")} />
                <span className="text-sm text-[#cecfd2]">{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] p-3.5">
          <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-400/70">Key Risk</h3>
          <p className="text-sm text-white/60">{op.keyRisk}</p>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3.5">
          <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/70">Next Action</h3>
          <p className="text-sm text-white/60">{op.nextAction}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvestmentProcessPage() {
  const [selectedStage, setSelectedStage] = useState<StageId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>("o1");
  const [search, setSearch] = useState("");

  const counts = STAGES.reduce(
    (acc, s) => {
      acc[s.id] = OPPORTUNITIES.filter((o) => o.stage === s.id).length;
      return acc;
    },
    {} as Record<StageId, number>,
  );

  const visible = OPPORTUNITIES.filter((o) => {
    if (selectedStage && o.stage !== selectedStage) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.ticker.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.theme.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selected = OPPORTUNITIES.find((o) => o.id === selectedId) ?? null;

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "linear-gradient(144deg, rgb(21,18,37) 15%, rgb(5,5,30) 82%)" }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 45% 80%, rgba(30,58,200,0.32) 0%, transparent 68%)",
        }}
      />

      <StellarHeader />
      <DashboardPageHeader />

      {/* Pipeline flow */}
      <PipelineFlow selected={selectedStage} onSelect={setSelectedStage} counts={counts} />

      {/* Body */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left: list */}
        <div className="flex w-[340px] flex-shrink-0 flex-col border-r border-white/[0.07]">
          {/* Search */}
          <div className="flex-shrink-0 border-b border-white/[0.07] px-4 py-2.5">
            <div className="flex items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.06] px-3 py-1.5">
              <MagnifyingGlass size={14} className="flex-shrink-0 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticker, name, theme…"
                className="flex-1 bg-transparent text-xs text-[#f7f7f7] placeholder:text-white/30 outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {visible.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-white/30">
                No opportunities
              </div>
            ) : (
              visible.map((op) => (
                <OpportunityCard
                  key={op.id}
                  op={op}
                  selected={selectedId === op.id}
                  onClick={() => setSelectedId(op.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: detail */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel key={selected.id} op={selected} />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.07]">
                  <ChartLineUp size={20} className="text-white/30" />
                </div>
                <p className="text-sm text-white/30">Select an opportunity to review</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
