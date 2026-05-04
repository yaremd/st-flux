"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowsLeftRight,
  X,
  MagnifyingGlass,
  Warning,
  ArrowUp,
  ArrowDown,
  CaretRight,
  Bell,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

type BottleneckSeverity = "breached" | "approaching" | "monitor" | "clear";
type FilterKey = "all" | "breached" | "approaching" | "monitor" | "clear";

interface ScalingComponent {
  label: string;
  currentRate: number;
  projectedRate: number;
  unit: string;
}

interface BottleneckPair {
  id: string;
  theme: string;
  title: string;
  description: string;
  supply: ScalingComponent;
  demand: ScalingComponent;
  divergenceRatio: number;
  divergenceThreshold: number;
  mismatchScore: number;
  severity: BottleneckSeverity;
  bottleneckHorizon: string;
  thesisImpact: string;
  historicalDivergence: number[];
  linkedAlertId?: string;
  linkedAlertTitle?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PAIRS: BottleneckPair[] = [
  {
    id: "s1",
    theme: "AI Infrastructure",
    title: "HBM Memory vs AI Inference",
    description:
      "High-bandwidth memory production scaling cannot keep pace with accelerating AI inference workloads. SK Hynix and Micron output constrained by CoWoS packaging capacity.",
    supply: { label: "HBM Production", currentRate: 1.4, projectedRate: 1.6, unit: "x YoY" },
    demand: { label: "AI Inference Demand", currentRate: 3.9, projectedRate: 4.8, unit: "x YoY" },
    divergenceRatio: 2.8,
    divergenceThreshold: 2.5,
    mismatchScore: 87,
    severity: "breached",
    bottleneckHorizon: "Q3 2026",
    thesisImpact:
      "NVDA data center margins at risk. Memory allocation shifting to hyperscalers, crowding out enterprise. Thesis holds but concentration risk elevated.",
    historicalDivergence: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.65, 2.68, 2.70, 2.72, 2.74, 2.75, 2.76, 2.77, 2.78, 2.79, 2.80, 2.80, 2.81, 2.80, 2.80, 2.80],
    linkedAlertId: "a13",
    linkedAlertTitle: "Bottleneck Warning: Memory/Logic Scaling Mismatch",
  },
  {
    id: "s2",
    theme: "Clean Energy",
    title: "Grid Interconnection vs Renewable Pipeline",
    description:
      "FERC interconnection queue delays now average 5.4 years. Over 2 TW of solar and wind projects are stuck waiting while clean energy capacity commitments accelerate.",
    supply: { label: "Grid Interconnect Capacity", currentRate: 0.7, projectedRate: 0.8, unit: "x YoY" },
    demand: { label: "Renewable Project Pipeline", currentRate: 2.2, projectedRate: 2.5, unit: "x YoY" },
    divergenceRatio: 3.11,
    divergenceThreshold: 2.0,
    mismatchScore: 94,
    severity: "breached",
    bottleneckHorizon: "Now (structural)",
    thesisImpact:
      "NEE and CEG project completion delays likely. Capex guidance at risk for multi-year period. Revenue recognition pushed 18–24 months.",
    historicalDivergence: [1.2, 1.4, 1.5, 1.6, 1.8, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.85, 2.9, 2.95, 3.0, 3.02, 3.04, 3.06, 3.07, 3.08, 3.09, 3.10, 3.10, 3.11, 3.11, 3.11, 3.11],
    linkedAlertId: "a9",
    linkedAlertTitle: "NEE Capex Guidance Revision — Clean Energy Delay Risk",
  },
  {
    id: "s3",
    theme: "AI Infrastructure",
    title: "Power Grid vs Data Center Power",
    description:
      "Utility grid buildout running at 1.4x while hyperscaler data center power demand contracts growing at 2.6x. Permitting delays and transformer lead times are primary constraints.",
    supply: { label: "Utility Grid Expansion", currentRate: 1.4, projectedRate: 1.5, unit: "x YoY" },
    demand: { label: "Data Center Power Demand", currentRate: 2.6, projectedRate: 3.1, unit: "x YoY" },
    divergenceRatio: 1.91,
    divergenceThreshold: 2.0,
    mismatchScore: 72,
    severity: "approaching",
    bottleneckHorizon: "Q4 2026",
    thesisImpact:
      "Transformer and switchgear suppliers (ETN, HUBB) may see demand pull-forward. Hyperscaler CapEx plans contingent on grid access — monitor MSFT, GOOGL data center announcements.",
    historicalDivergence: [0.9, 1.0, 1.1, 1.2, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.68, 1.70, 1.72, 1.74, 1.76, 1.78, 1.80, 1.82, 1.84, 1.86, 1.87, 1.88, 1.89, 1.90, 1.91, 1.91, 1.91, 1.91],
  },
  {
    id: "s4",
    theme: "Defense & Autonomy",
    title: "Rare Earth Processing vs Autonomous Systems",
    description:
      "China controls 87% of rare earth processing. DoD autonomous systems programs require NdFeB magnets and dysprosium. Domestic REEN development 3–5 years from sufficient scale.",
    supply: { label: "Domestic RE Processing", currentRate: 1.2, projectedRate: 1.4, unit: "x YoY" },
    demand: { label: "Autonomous Systems Demand", currentRate: 2.1, projectedRate: 2.5, unit: "x YoY" },
    divergenceRatio: 1.75,
    divergenceThreshold: 2.0,
    mismatchScore: 65,
    severity: "approaching",
    bottleneckHorizon: "Q1 2027",
    thesisImpact:
      "LMT and RTX program timelines at risk if RE supply chains not diversified. MP Materials and Energy Fuels potential beneficiaries of DoD ITAR sourcing shift.",
    historicalDivergence: [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.35, 1.40, 1.45, 1.50, 1.55, 1.58, 1.60, 1.62, 1.64, 1.66, 1.68, 1.70, 1.71, 1.72, 1.73, 1.74, 1.74, 1.75, 1.75, 1.75, 1.75, 1.75, 1.75, 1.75],
  },
  {
    id: "s5",
    theme: "Deglobalization",
    title: "Semiconductor Equipment vs Fab Construction",
    description:
      "ASML and AMAT lead times extended to 18–24 months while greenfield fab construction completions accelerate. Equipment delivery bottleneck delays revenue ramp.",
    supply: { label: "Semicon Equipment Delivery", currentRate: 1.1, projectedRate: 1.3, unit: "x YoY" },
    demand: { label: "Fab Construction Rate", currentRate: 2.0, projectedRate: 2.2, unit: "x YoY" },
    divergenceRatio: 1.8,
    divergenceThreshold: 2.0,
    mismatchScore: 68,
    severity: "approaching",
    bottleneckHorizon: "Q2 2027",
    thesisImpact:
      "TSMC Arizona and Intel Ohio ramp schedules pushed. ASML backlog provides revenue visibility but margin pressure from large order discounting. Monitor INTC ramp guidance.",
    historicalDivergence: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.55, 1.60, 1.63, 1.65, 1.68, 1.70, 1.72, 1.73, 1.74, 1.75, 1.76, 1.77, 1.78, 1.79, 1.79, 1.80, 1.80, 1.80, 1.80, 1.80, 1.80],
  },
  {
    id: "s6",
    theme: "Longevity Tech",
    title: "GLP-1 Manufacturing vs Patient Demand",
    description:
      "Novo Nordisk and Eli Lilly active API capacity expanding but still tracking below addressable patient demand. Fill-finish bottleneck at third-party CMOs.",
    supply: { label: "GLP-1 API Capacity", currentRate: 2.1, projectedRate: 2.8, unit: "x YoY" },
    demand: { label: "Prescription Volume Growth", currentRate: 2.8, projectedRate: 3.2, unit: "x YoY" },
    divergenceRatio: 1.34,
    divergenceThreshold: 1.75,
    mismatchScore: 44,
    severity: "monitor",
    bottleneckHorizon: "Q3 2027",
    thesisImpact:
      "LLY and NVO near-term upside capped by supply constraints. Catalyst: CMO capacity announcements expected Q3. If supply closes gap, re-rate upside significant.",
    historicalDivergence: [0.8, 0.9, 0.95, 1.0, 1.05, 1.08, 1.10, 1.12, 1.15, 1.18, 1.20, 1.22, 1.24, 1.26, 1.27, 1.28, 1.29, 1.30, 1.31, 1.32, 1.32, 1.33, 1.33, 1.34, 1.34, 1.34, 1.34, 1.34, 1.34, 1.34],
  },
  {
    id: "s7",
    theme: "Space Economy",
    title: "Launch Vehicle vs Payload Manifest",
    description:
      "SpaceX Starship cadence build-out progressing. Competitive LEO launch providers not yet at scale. Net: launch capacity tracking demand with modest lag.",
    supply: { label: "Launch Slots (Annualized)", currentRate: 1.8, projectedRate: 2.4, unit: "x YoY" },
    demand: { label: "Commercial Payload Manifest", currentRate: 2.2, projectedRate: 2.8, unit: "x YoY" },
    divergenceRatio: 1.21,
    divergenceThreshold: 1.75,
    mismatchScore: 36,
    severity: "monitor",
    bottleneckHorizon: "Q4 2027",
    thesisImpact:
      "RKLB near-term manifesting advantage if Starship cadence slips. Constellation operators (AST, ASTS) most sensitive — latency in deployment delays revenue.",
    historicalDivergence: [0.7, 0.8, 0.85, 0.9, 0.95, 1.0, 1.02, 1.05, 1.08, 1.10, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.19, 1.20, 1.20, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21, 1.21],
  },
  {
    id: "s8",
    theme: "Deglobalization",
    title: "Nearshore Industrial Space vs Reshoring Capital",
    description:
      "Mexico and Texas industrial real estate supply has caught up with reshoring demand. Vacancy rates stabilizing. No structural constraint on continued onshoring momentum.",
    supply: { label: "Industrial Space Completion", currentRate: 2.4, projectedRate: 2.6, unit: "x YoY" },
    demand: { label: "Reshoring Capital Deployment", currentRate: 1.8, projectedRate: 1.9, unit: "x YoY" },
    divergenceRatio: 0.77,
    divergenceThreshold: 1.5,
    mismatchScore: 12,
    severity: "clear",
    bottleneckHorizon: "No constraint",
    thesisImpact:
      "Prologis and industrial REITs near-term headwind as supply normalizes. Reshoring thesis intact from capex perspective — manufacturing investment continues without space constraints.",
    historicalDivergence: [1.4, 1.3, 1.2, 1.1, 1.05, 1.0, 0.98, 0.95, 0.92, 0.90, 0.88, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81, 0.80, 0.80, 0.79, 0.79, 0.78, 0.78, 0.78, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const SEV_CONFIG: Record<
  BottleneckSeverity,
  { label: string; bg: string; text: string; dot: string }
> = {
  breached: {
    label: "BREACHED",
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  approaching: {
    label: "APPROACHING",
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  monitor: {
    label: "MONITOR",
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  clear: {
    label: "CLEAR",
    bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
    text: "text-zinc-500 dark:text-zinc-400",
    dot: "bg-zinc-400 dark:bg-zinc-600",
  },
};

const GROUP_ORDER: BottleneckSeverity[] = ["breached", "approaching", "monitor", "clear"];

const STAT_TILES: { key: FilterKey; label: string; accent: string; activeAccent: string }[] = [
  { key: "all", label: "All", accent: "text-zinc-500", activeAccent: "text-zinc-900 dark:text-zinc-100" },
  { key: "breached", label: "Breached", accent: "text-rose-500", activeAccent: "text-rose-600 dark:text-rose-400" },
  { key: "approaching", label: "Approaching", accent: "text-amber-500", activeAccent: "text-amber-600 dark:text-amber-400" },
  { key: "monitor", label: "Monitor", accent: "text-blue-500", activeAccent: "text-blue-600 dark:text-blue-400" },
  { key: "clear", label: "Clear", accent: "text-zinc-400", activeAccent: "text-zinc-500" },
];

// ─── Small Components ─────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: BottleneckSeverity }) {
  const cfg = SEV_CONFIG[severity];
  return (
    <span
      className={[
        "inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
        cfg.bg,
        cfg.text,
      ].join(" ")}
    >
      {cfg.label}
    </span>
  );
}

function MismatchBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-rose-500"
      : score >= 60
      ? "bg-amber-500"
      : score >= 40
      ? "bg-blue-500"
      : "bg-zinc-400 dark:bg-zinc-600";
  return (
    <div className="h-1 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={["h-full rounded-full transition-all", color].join(" ")}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function DivergenceBar({
  ratio,
  threshold,
  severity,
}: {
  ratio: number;
  threshold: number;
  severity: BottleneckSeverity;
}) {
  const maxDisplay = Math.max(ratio, threshold) * 1.25;
  const ratioW = Math.min((ratio / maxDisplay) * 100, 100);
  const thresholdL = Math.min((threshold / maxDisplay) * 100, 100);
  const barColor =
    severity === "breached"
      ? "bg-rose-500"
      : severity === "approaching"
      ? "bg-amber-500"
      : severity === "monitor"
      ? "bg-blue-500"
      : "bg-zinc-400";

  return (
    <div className="relative h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={["absolute left-0 top-0 h-full rounded-full transition-all", barColor].join(" ")}
        style={{ width: `${ratioW}%` }}
      />
      <div
        className="absolute top-[-3px] h-[calc(100%+6px)] w-0.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
        style={{ left: `${thresholdL}%` }}
        title={`Threshold: ${threshold}x`}
      />
    </div>
  );
}

function Sparkline({
  data,
  threshold,
  severity,
}: {
  data: number[];
  threshold: number;
  severity: BottleneckSeverity;
}) {
  const pad = 6;
  const w = 300;
  const h = 72;
  const allVals = [...data, threshold];
  const min = Math.min(...allVals) * 0.92;
  const max = Math.max(...allVals) * 1.05;
  const range = max - min || 1;

  const toY = (v: number) => pad + (1 - (v - min) / range) * (h - pad * 2);
  const toX = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);

  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const thY = toY(threshold);

  const lineColor =
    severity === "breached"
      ? "#f43f5e"
      : severity === "approaching"
      ? "#f59e0b"
      : severity === "monitor"
      ? "#3b82f6"
      : "#a1a1aa";

  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
      <line
        x1={pad}
        y1={thY}
        x2={w - pad}
        y2={thY}
        stroke="#71717a"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.5"
      />
      <polyline
        points={pts}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={lineColor} />
    </svg>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
          hour12: false,
        }) + " UTC"
      );
    tick();
    ref.current = setInterval(tick, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);
  return (
    <span className="font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-600">
      {time}
    </span>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  pair,
  onClose,
}: {
  pair: BottleneckPair;
  onClose: () => void;
}) {
  const cfg = SEV_CONFIG[pair.severity];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <SeverityBadge severity={pair.severity} />
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {pair.theme}
            </span>
          </div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{pair.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {pair.description}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 mt-0.5 flex-shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <X size={14} />
        </button>
      </div>

      {/* Supply vs Demand cards */}
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Scaling Rates
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { side: "Supply", comp: pair.supply, color: "text-blue-600 dark:text-blue-400" },
              { side: "Demand", comp: pair.demand, color: "text-violet-600 dark:text-violet-400" },
            ] as const
          ).map(({ side, comp, color }) => (
            <div
              key={side}
              className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                {side}
              </p>
              <p className="mb-1 text-[11px] text-zinc-600 dark:text-zinc-400">{comp.label}</p>
              <p className={["font-mono text-xl font-semibold tabular-nums", color].join(" ")}>
                {comp.currentRate.toFixed(1)}
                <span className="ml-0.5 text-xs font-normal text-zinc-400">{comp.unit}</span>
              </p>
              <div className="mt-1 flex items-center gap-1">
                <ArrowRight size={10} className="text-zinc-400" />
                <span className="font-mono text-[10px] text-zinc-400">{comp.projectedRate.toFixed(1)} projected</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divergence ratio */}
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Divergence Ratio
          </p>
          <div className="flex items-center gap-2">
            <span className={["font-mono text-sm font-semibold tabular-nums", cfg.text].join(" ")}>
              {pair.divergenceRatio.toFixed(2)}x
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              / {pair.divergenceThreshold.toFixed(1)}x threshold
            </span>
          </div>
        </div>
        <DivergenceBar
          ratio={pair.divergenceRatio}
          threshold={pair.divergenceThreshold}
          severity={pair.severity}
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={["h-1.5 w-1.5 rounded-full", SEV_CONFIG[pair.severity].dot].join(" ")} />
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Mismatch score: <span className="font-mono font-semibold">{pair.mismatchScore}</span>/100
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
            Horizon: <span className="font-medium text-zinc-600 dark:text-zinc-300">{pair.bottleneckHorizon}</span>
          </span>
        </div>
      </div>

      {/* Divergence history sparkline */}
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            30-Day Divergence History
          </p>
          <span className="font-mono text-[10px] text-zinc-400">--- threshold</span>
        </div>
        <div className="h-[72px] w-full">
          <Sparkline
            data={pair.historicalDivergence}
            threshold={pair.divergenceThreshold}
            severity={pair.severity}
          />
        </div>
      </div>

      {/* Thesis impact */}
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Thesis Impact
        </p>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{pair.thesisImpact}</p>
      </div>

      {/* Linked alert */}
      {pair.linkedAlertId && (
        <div className="px-5 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Linked Alert
          </p>
          <div className="flex items-center gap-2.5 rounded-md border border-amber-200/60 bg-amber-50/60 px-3 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
            <Bell size={13} className="flex-shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {pair.linkedAlertTitle}
              </p>
              <p className="font-mono text-[10px] text-zinc-400">{pair.linkedAlertId.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScalingClient() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: PAIRS.length,
      breached: PAIRS.filter((p) => p.severity === "breached").length,
      approaching: PAIRS.filter((p) => p.severity === "approaching").length,
      monitor: PAIRS.filter((p) => p.severity === "monitor").length,
      clear: PAIRS.filter((p) => p.severity === "clear").length,
    }),
    []
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PAIRS.filter((p) => {
      if (filter !== "all" && p.severity !== filter) return false;
      if (q) {
        return (
          p.title.toLowerCase().includes(q) ||
          p.theme.toLowerCase().includes(q) ||
          p.supply.label.toLowerCase().includes(q) ||
          p.demand.label.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filter, search]);

  const grouped = useMemo(() => {
    const map = new Map<BottleneckSeverity, BottleneckPair[]>();
    for (const sev of GROUP_ORDER) {
      const items = filtered.filter((p) => p.severity === sev);
      if (items.length > 0) map.set(sev, items);
    }
    return map;
  }, [filtered]);

  const selectedPair = PAIRS.find((p) => p.id === selectedId) ?? null;

  const breachedUnread = counts.breached;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <ArrowsLeftRight size={16} className="text-blue-500" weight="fill" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Scaling Tracker
          </span>
          {breachedUnread > 0 && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500/15 px-1 font-mono text-[10px] font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              {breachedUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <ThemeToggle />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="flex flex-shrink-0 items-center gap-1 border-b border-zinc-200 px-4 dark:border-zinc-800">
        {STAT_TILES.map((tile) => {
          const active = filter === tile.key;
          return (
            <button
              key={tile.key}
              onClick={() => {
                setFilter(tile.key);
                setSelectedId(null);
              }}
              className={[
                "relative flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors",
                active ? tile.activeAccent : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
              ].join(" ")}
            >
              {active && (
                <motion.span
                  layoutId="scaling-filter-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-blue-500"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className={["font-mono text-sm font-semibold tabular-nums", tile.accent].join(" ")}>
                {counts[tile.key]}
              </span>
              {tile.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex-shrink-0 border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
          <MagnifyingGlass size={13} className="flex-shrink-0 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by title, theme, or component..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-xs text-zinc-700 placeholder-zinc-400 outline-none dark:text-zinc-300 dark:placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* List */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
              <ArrowsLeftRight size={24} />
              <p className="text-sm">No bottleneck pairs match</p>
            </div>
          ) : (
            <>
              {[...grouped.entries()].map(([sev, items]) => {
                const cfg = SEV_CONFIG[sev];
                return (
                  <div key={sev}>
                    <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/60 px-4 py-1.5 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                      <div className={["h-1.5 w-1.5 rounded-full", cfg.dot].join(" ")} />
                      <span className={["text-[10px] font-semibold uppercase tracking-wider", cfg.text].join(" ")}>
                        {cfg.label}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">{items.length}</span>
                    </div>
                    {items.map((pair) => {
                      const active = selectedId === pair.id;
                      return (
                        <button
                          key={pair.id}
                          onClick={() => setSelectedId(active ? null : pair.id)}
                          className={[
                            "w-full border-b border-zinc-100 px-4 py-3 text-left transition-colors dark:border-zinc-800/60",
                            active
                              ? "bg-zinc-50 dark:bg-zinc-900/60"
                              : "hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-3">
                            {/* Severity dot */}
                            <div className={["mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full", cfg.dot].join(" ")} />

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                  {pair.title}
                                </p>
                                {pair.linkedAlertId && (
                                  <Warning size={12} className="flex-shrink-0 text-amber-500" weight="fill" />
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  {pair.theme}
                                </span>
                                <span className="text-[10px] text-zinc-400">
                                  {pair.supply.label}
                                  <ArrowRight
                                    size={9}
                                    className="mx-0.5 inline-block text-zinc-300 dark:text-zinc-600"
                                  />
                                  {pair.demand.label}
                                </span>
                              </div>
                            </div>

                            {/* Right */}
                            <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                              <span className={["font-mono text-sm font-semibold tabular-nums", cfg.text].join(" ")}>
                                {pair.divergenceRatio.toFixed(2)}x
                              </span>
                              <MismatchBar score={pair.mismatchScore} />
                            </div>

                            <CaretRight
                              size={12}
                              className={[
                                "mt-1 flex-shrink-0 transition-transform",
                                active ? "rotate-90 text-blue-500" : "text-zinc-300 dark:text-zinc-700",
                              ].join(" ")}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedPair && (
            <motion.div
              key={selectedPair.id}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="flex-shrink-0 overflow-hidden border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <motion.div
                initial={{ x: 12, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 12, opacity: 0 }}
                transition={{ delay: 0.04, duration: 0.18 }}
                className="h-full w-[420px]"
              >
                <DetailPanel pair={selectedPair} onClose={() => setSelectedId(null)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
