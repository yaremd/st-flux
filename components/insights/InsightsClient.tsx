"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  X,
  MagnifyingGlass,
  CaretRight,
  CheckCircle,
  ArrowCounterClockwise,
  PaperPlaneTilt,
  BookBookmark,
  Warning,
  User,
} from "@phosphor-icons/react/dist/ssr";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightStage = "draft" | "pending_review" | "approved" | "shared";
type InsightCategory = "thesis_update" | "risk_flag" | "opportunity" | "methodology";
type FilterKey = "all" | "draft" | "pending_review" | "approved" | "shared";

interface Evidence {
  label: string;
  value: string;
}

interface Insight {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: InsightCategory;
  stage: InsightStage;
  authorId: string;
  authorName: string;
  linkedTheme?: string;
  linkedTicker?: string;
  evidence: Evidence[];
  reviewerNotes?: string;
  submittedAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INSIGHTS: Insight[] = [
  {
    id: "i1",
    title: "NVDA HBM Allocation Shift Accelerating Faster Than Disclosed",
    summary:
      "Channel checks suggest NVDA is prioritizing HBM allocation to three hyperscalers at 85%+ of supply, compressing enterprise access and softening near-term data center ASP.",
    body: "Supply chain contacts at two packaging houses confirm CoWoS allocation decisions made in Q1 are locking out mid-tier enterprise customers through at least Q4. This isn't a demand story — inference demand remains exceptional — it's a supply routing decision that compresses average selling prices for the enterprise segment. The H100/H200 enterprise waitlist is now 9–14 months. This doesn't break the AI Infrastructure thesis, but it means NVDA's data center gross margin expansion will be more back-end loaded than consensus models assume.",
    category: "thesis_update",
    stage: "pending_review",
    authorId: "marco",
    authorName: "Marco R.",
    linkedTheme: "AI Infrastructure",
    linkedTicker: "NVDA",
    evidence: [
      { label: "CoWoS allocation (hyperscaler share)", value: "~85%" },
      { label: "Enterprise waitlist duration", value: "9–14 months" },
      { label: "Consensus margin expansion assumption", value: "Front-loaded Q3/Q4" },
    ],
    submittedAt: "2026-05-04T07:14:00Z",
  },
  {
    id: "i2",
    title: "FERC Order 1920 Creating Structural Opportunity for Transmission Buildout",
    summary:
      "FERC's long-term planning rule mandates utilities to plan for 20-year transmission needs. This is a new sustained capital cycle for transmission-heavy utilities — not priced in.",
    body: "Order 1920 came into effect in November 2025 and requires regional transmission organizations to conduct long-term scenario planning over 20-year horizons. The rule doesn't just require planning — it requires cost allocation frameworks that will unlock projects that previously stalled over cost-sharing disputes. Eversource, AES, and NextEra all have transmission-heavy backlog that benefits directly. The market is treating this as incremental, but the magnitude of the addressable spending increase (DOE estimates $700B over 25 years in T&D) is not reflected in any utility multiple we track.",
    category: "opportunity",
    stage: "pending_review",
    authorId: "sara",
    authorName: "Sara K.",
    linkedTheme: "Clean Energy",
    evidence: [
      { label: "DOE 25-year T&D estimate", value: "$700B" },
      { label: "Order 1920 effective date", value: "Nov 2025" },
      { label: "Cost-allocation disputes resolved", value: "Structural fix" },
    ],
    submittedAt: "2026-05-03T16:42:00Z",
  },
  {
    id: "i3",
    title: "Rare Earth Dependency Risk in LMT F-35 Supply Chain Underappreciated",
    summary:
      "LMT's F-35 program uses 920 lbs of rare earth materials per aircraft. Domestic RE processing capacity covers less than 15% of program requirements — a concentration risk not reflected in defense premia.",
    body: "The F-35 program's rare earth exposure is a known issue but the market treats it as manageable. Recent DoD ITAR analysis we reviewed suggests the 'manageable' assumption rests on continued access to Canadian processing — which itself depends on a single refinery (Vital Metals, Northwest Territories). Any disruption to that facility, combined with the China processing dependency, would create a genuine production stoppage risk. LMT has not disclosed contingency sourcing in recent 10-K filings. We think this warrants a dedicated risk factor in our Defense & Autonomy thesis.",
    category: "risk_flag",
    stage: "approved",
    authorId: "dev",
    authorName: "Dev P.",
    linkedTheme: "Defense & Autonomy",
    linkedTicker: "LMT",
    evidence: [
      { label: "RE materials per F-35 aircraft", value: "920 lbs" },
      { label: "Domestic processing coverage", value: "<15% of need" },
      { label: "Key single-point refinery", value: "Vital Metals, NWT" },
    ],
    reviewerNotes:
      "Strong channel work. Flag for position review — consider reducing LMT weight until DoD sourcing picture clarifies.",
    submittedAt: "2026-04-29T09:30:00Z",
  },
  {
    id: "i4",
    title: "GLP-1 Oral Formulation Timeline Compression Is Underestimated",
    summary:
      "Novo's oral semaglutide Phase 3 data came in stronger than expected. If FDA filing happens in Q4, the oral TAM unlock happens 18 months ahead of consensus models.",
    body: "The OASIS 4 trial readout showed 14.8% body weight reduction at 50mg dose — within range of injectable efficacy and above the 12% consensus threshold that analysts had used as a bar for commercial viability. Novo has indicated they'll file in H2 2026 if manufacturing scale-up proceeds on plan. The key risk is CMO fill-finish, not trial data. But if timeline holds, the TAM for oral GLP-1 (estimated 250M patients globally who won't self-inject) opens significantly earlier than buy-side models assume. This is a positive thesis accelerant for NVO and LLY.",
    category: "thesis_update",
    stage: "approved",
    authorId: "marco",
    authorName: "Marco R.",
    linkedTheme: "Longevity Tech",
    linkedTicker: "NVO",
    evidence: [
      { label: "OASIS 4 weight reduction (50mg)", value: "14.8%" },
      { label: "Consensus viability threshold", value: "12%" },
      { label: "Oral TAM (non-injector patients)", value: "~250M globally" },
    ],
    reviewerNotes: "Approved. Add to Longevity thesis section. Flag NVO as upgrade candidate.",
    submittedAt: "2026-04-25T11:15:00Z",
  },
  {
    id: "i5",
    title: "SpaceX Starship Cadence Slip Creates RKLB Manifest Opportunity Window",
    summary:
      "Starship's 2026 commercial manifest targets assume 12 flights. Two anomaly investigations push this to 7–8 realistically, opening a 4–5 mission gap that RKLB Neutron is positioned to capture.",
    body: "FAA investigations following the IFT-7 anomaly in March and the IFT-8 partial failure in April have each carried 60–90 day resolution timelines. This pushes the first commercial Starship flight to Q4 2026 at earliest. Constellation operators (ASTS, Starlink competition planning) had assumed Starship access for 2H 2026. In the interim, Rocket Lab's Neutron at 13 metric ton LEO capacity captures the medium-lift gap. RKLB backlog conversations with two constellation operators confirmed intent to shift 3 missions to Neutron if Starship delays persist past Q3. This is a near-term catalyst for RKLB that isn't in consensus.",
    category: "opportunity",
    stage: "shared",
    authorId: "sara",
    authorName: "Sara K.",
    linkedTheme: "Space Economy",
    linkedTicker: "RKLB",
    evidence: [
      { label: "2026 Starship commercial target", value: "12 flights" },
      { label: "Realistic estimate post-investigations", value: "7–8 flights" },
      { label: "Neutron capture opportunity", value: "3–5 missions" },
    ],
    submittedAt: "2026-04-20T14:00:00Z",
  },
  {
    id: "i6",
    title: "Mexico Nearshore Industrial REIT Cap Rate Compression Cycle Beginning",
    summary:
      "Monterrey Class A industrial vacancy hit 1.2% in Q1 — lowest since 2018. Cap rates are compressing 40–60bps annually. Nearshoring capital deployment is now outpacing supply despite record deliveries.",
    body: "The Scaling Tracker shows supply > demand in aggregate, but the geographic concentration of demand is creating micro-market dislocations. Monterrey, Saltillo, and Juárez are all at sub-2% vacancy while secondary cities like Guadalajara and Puebla have 8–12% vacancy. This bifurcation means aggregate supply statistics mask what is effectively a premium industrial real estate scarcity in the corridors closest to US border crossings. Prologis (PLD) Monterrey exposure is ~12% of Mexico NAV. FIBRA Macquarie (FIBRAMQ) is a more direct pure-play. Neither is priced for this tightness.",
    category: "opportunity",
    stage: "shared",
    authorId: "dev",
    authorName: "Dev P.",
    linkedTheme: "Deglobalization",
    evidence: [
      { label: "Monterrey Class A vacancy (Q1)", value: "1.2%" },
      { label: "Annual cap rate compression", value: "40–60bps" },
      { label: "PLD Monterrey Mexico NAV exposure", value: "~12%" },
    ],
    submittedAt: "2026-04-15T10:30:00Z",
  },
  {
    id: "i7",
    title: "Power Purchase Agreement Tenor Shortening Is a Hidden Utility Margin Risk",
    summary:
      "Average PPA tenor has compressed from 20 years to 12 years over the past 36 months as corporate buyers demand flexibility. This shortens utility revenue visibility and increases refinancing risk.",
    body: "We reviewed PPA disclosures across NEE, AES, and EXC in the most recent proxy and 10-K filings. Average weighted tenor has declined materially. The rationale is corporate buyer pressure — hyperscalers and Fortune 500 sustainability teams want optionality as renewable prices continue to fall. For utilities, this is margin-negative: shorter tenors mean more frequent repricing at potentially lower rates, and reduced collateral value for project financing. The rating agencies haven't flagged this yet, but it's a slow-moving headwind that affects our Clean Energy position sizing.",
    category: "risk_flag",
    stage: "shared",
    authorId: "marco",
    authorName: "Marco R.",
    linkedTheme: "Clean Energy",
    evidence: [
      { label: "Average PPA tenor (2023)", value: "20 years" },
      { label: "Average PPA tenor (2026)", value: "12 years" },
      { label: "Tenor compression period", value: "36 months" },
    ],
    submittedAt: "2026-04-10T08:45:00Z",
  },
  {
    id: "i8",
    title: "DoD Autonomy Budget Methodology Change May Overstate Near-Term Defense Spend",
    summary:
      "FY2027 defense budget request consolidates several R&D line items under 'autonomy' that were previously classified. Headline numbers look larger than actual new capital — distinction matters for RTX and LMT near-term estimates.",
    body: "The FY2027 NDAA request includes $18.4B labeled 'autonomous systems and AI.' Approximately $6.2B of this is reclassified from existing DARPA, DARPA-I, and SOCOM R&D programs that were previously in separate budget categories. Net new spending is closer to $12.2B. Analyst notes have uniformly cited the $18.4B figure without this adjustment. If consensus defense tech estimates are built on the headline number, RTX and LMT near-term contract wins may disappoint relative to market expectations. This doesn't change the long-term thesis, but 2027 revenue estimates may need haircuts.",
    category: "methodology",
    stage: "draft",
    authorId: "sara",
    authorName: "Sara K.",
    linkedTheme: "Defense & Autonomy",
    evidence: [
      { label: "FY2027 autonomy headline budget", value: "$18.4B" },
      { label: "Reclassified from existing programs", value: "$6.2B" },
      { label: "Net new autonomy spending", value: "~$12.2B" },
    ],
    submittedAt: "2026-05-04T06:00:00Z",
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<
  InsightStage,
  { label: string; bg: string; text: string; dot: string }
> = {
  draft: {
    label: "DRAFT",
    bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
    text: "text-zinc-500 dark:text-zinc-400",
    dot: "bg-zinc-400 dark:bg-zinc-600",
  },
  pending_review: {
    label: "PENDING REVIEW",
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  approved: {
    label: "APPROVED",
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  shared: {
    label: "IN TEAM MEMORY",
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

const CATEGORY_CONFIG: Record<
  InsightCategory,
  { label: string; bg: string; text: string }
> = {
  thesis_update: {
    label: "THESIS UPDATE",
    bg: "bg-violet-500/15 dark:bg-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
  },
  risk_flag: {
    label: "RISK FLAG",
    bg: "bg-rose-500/15 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  opportunity: {
    label: "OPPORTUNITY",
    bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  methodology: {
    label: "METHODOLOGY",
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
};

const GROUP_ORDER: InsightStage[] = ["pending_review", "approved", "draft", "shared"];

const STAT_TILES: {
  key: FilterKey;
  label: string;
  accent: string;
  activeAccent: string;
}[] = [
  { key: "all", label: "All", accent: "text-zinc-500", activeAccent: "text-zinc-900 dark:text-zinc-100" },
  { key: "pending_review", label: "Pending Review", accent: "text-amber-500", activeAccent: "text-amber-600 dark:text-amber-400" },
  { key: "approved", label: "Approved", accent: "text-emerald-500", activeAccent: "text-emerald-600 dark:text-emerald-400" },
  { key: "draft", label: "Draft", accent: "text-zinc-400", activeAccent: "text-zinc-500" },
  { key: "shared", label: "In Memory", accent: "text-blue-500", activeAccent: "text-blue-600 dark:text-blue-400" },
];

// ─── Small Components ─────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: InsightStage }) {
  const cfg = STAGE_CONFIG[stage];
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

function CategoryBadge({ category }: { category: InsightCategory }) {
  const cfg = CATEGORY_CONFIG[category];
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
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, []);
  return (
    <span className="font-mono text-[11px] tabular-nums text-zinc-400 dark:text-zinc-600">
      {time}
    </span>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Stage Action Footer ───────────────────────────────────────────────────────

function StageActions({
  stage,
  onAdvance,
}: {
  stage: InsightStage;
  onAdvance: (s: InsightStage) => void;
}) {
  if (stage === "draft") {
    return (
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-400">Submit when ready for team review.</p>
        <button
          onClick={() => onAdvance("pending_review")}
          className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
        >
          <PaperPlaneTilt size={12} />
          Submit for Review
        </button>
      </div>
    );
  }

  if (stage === "pending_review") {
    return (
      <div className="flex items-center justify-between">
        <button
          onClick={() => onAdvance("draft")}
          className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
        >
          <ArrowCounterClockwise size={12} />
          Request Changes
        </button>
        <button
          onClick={() => onAdvance("approved")}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
        >
          <CheckCircle size={12} />
          Approve
        </button>
      </div>
    );
  }

  if (stage === "approved") {
    return (
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-400">Approved — ready to publish to team.</p>
        <button
          onClick={() => onAdvance("shared")}
          className="flex items-center gap-1.5 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <BookBookmark size={12} />
          Add to Team Memory
        </button>
      </div>
    );
  }

  // shared
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15">
        <BookBookmark size={11} className="text-blue-500" />
      </div>
      <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
        Published to team memory
      </p>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  insight,
  stage,
  onClose,
  onAdvance,
}: {
  insight: Insight;
  stage: InsightStage;
  onClose: () => void;
  onAdvance: (s: InsightStage) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StageBadge stage={stage} />
            <CategoryBadge category={insight.category} />
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
          {insight.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <User size={9} className="text-zinc-500" />
            </div>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              {insight.authorName}
            </span>
          </div>
          {insight.linkedTheme && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              {insight.linkedTheme}
            </span>
          )}
          {insight.linkedTicker && (
            <span className="font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
              {insight.linkedTicker}
            </span>
          )}
          <span className="font-mono text-[10px] text-zinc-400">
            {relativeTime(insight.submittedAt)}
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary */}
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-2">
            Summary
          </p>
          <p className="rounded-md border-l-2 border-blue-400 bg-zinc-50 px-3 py-2.5 text-xs leading-relaxed text-zinc-700 dark:border-blue-500/60 dark:bg-zinc-900 dark:text-zinc-300">
            {insight.summary}
          </p>
        </div>

        {/* Full analysis */}
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Analysis
          </p>
          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{insight.body}</p>
        </div>

        {/* Evidence */}
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Supporting Data
          </p>
          <div className="space-y-1.5">
            {insight.evidence.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{e.label}</span>
                <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviewer notes */}
        {insight.reviewerNotes && (
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Reviewer Notes
            </p>
            <div className="flex gap-2.5 rounded-md border border-emerald-200/60 bg-emerald-50/50 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <CheckCircle size={13} className="mt-0.5 flex-shrink-0 text-emerald-500" />
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                {insight.reviewerNotes}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="flex-shrink-0 border-t border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <StageActions stage={stage} onAdvance={onAdvance} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InsightsClient() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageOverrides, setStageOverrides] = useState<Map<string, InsightStage>>(new Map());

  const getStage = (insight: Insight): InsightStage =>
    stageOverrides.get(insight.id) ?? insight.stage;

  const advanceStage = (id: string, newStage: InsightStage) => {
    setStageOverrides((prev) => new Map(prev).set(id, newStage));
  };

  const counts = useMemo(() => {
    const c = { all: 0, draft: 0, pending_review: 0, approved: 0, shared: 0 };
    for (const ins of INSIGHTS) {
      const s = getStage(ins);
      c.all++;
      c[s]++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageOverrides]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return INSIGHTS.filter((ins) => {
      const s = getStage(ins);
      if (filter !== "all" && s !== filter) return false;
      if (q) {
        return (
          ins.title.toLowerCase().includes(q) ||
          ins.summary.toLowerCase().includes(q) ||
          ins.authorName.toLowerCase().includes(q) ||
          (ins.linkedTheme?.toLowerCase().includes(q) ?? false) ||
          (ins.linkedTicker?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search, stageOverrides]);

  const grouped = useMemo(() => {
    const map = new Map<InsightStage, Insight[]>();
    for (const sev of GROUP_ORDER) {
      const items = filtered.filter((ins) => getStage(ins) === sev);
      if (items.length > 0) map.set(sev, items);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, stageOverrides]);

  const selectedInsight = INSIGHTS.find((ins) => ins.id === selectedId) ?? null;

  const pendingCount = counts.pending_review;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <Lightbulb size={16} className="text-blue-500" weight="fill" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Team Insights
          </span>
          {pendingCount > 0 && (
            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500/15 px-1 font-mono text-[10px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              {pendingCount}
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
                active
                  ? tile.activeAccent
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
              ].join(" ")}
            >
              {active && (
                <motion.span
                  layoutId="insights-filter-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-blue-500"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span
                className={[
                  "font-mono text-sm font-semibold tabular-nums",
                  tile.accent,
                ].join(" ")}
              >
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
            placeholder="Search by title, author, theme, or ticker..."
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
              <Lightbulb size={24} />
              <p className="text-sm">No insights match</p>
            </div>
          ) : (
            <>
              {[...grouped.entries()].map(([stage, items]) => {
                const cfg = STAGE_CONFIG[stage];
                return (
                  <div key={stage}>
                    <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50/60 px-4 py-1.5 dark:border-zinc-800/60 dark:bg-zinc-900/40">
                      <div className={["h-1.5 w-1.5 rounded-full", cfg.dot].join(" ")} />
                      <span
                        className={[
                          "text-[10px] font-semibold uppercase tracking-wider",
                          cfg.text,
                        ].join(" ")}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">{items.length}</span>
                    </div>
                    {items.map((insight) => {
                      const currentStage = getStage(insight);
                      const active = selectedId === insight.id;
                      const stageCfg = STAGE_CONFIG[currentStage];
                      const catCfg = CATEGORY_CONFIG[insight.category];
                      return (
                        <button
                          key={insight.id}
                          onClick={() => setSelectedId(active ? null : insight.id)}
                          className={[
                            "w-full border-b border-zinc-100 px-4 py-3 text-left transition-colors dark:border-zinc-800/60",
                            active
                              ? "bg-zinc-50 dark:bg-zinc-900/60"
                              : "hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={[
                                "mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                                stageCfg.dot,
                              ].join(" ")}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-800 dark:text-zinc-200">
                                {insight.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span
                                  className={[
                                    "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                                    catCfg.bg,
                                    catCfg.text,
                                  ].join(" ")}
                                >
                                  {catCfg.label}
                                </span>
                                {insight.linkedTheme && (
                                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                    {insight.linkedTheme}
                                  </span>
                                )}
                                {insight.linkedTicker && (
                                  <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                    {insight.linkedTicker}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-[10px] text-zinc-400">
                                  {insight.authorName}
                                </span>
                                <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">
                                  ·
                                </span>
                                <span className="font-mono text-[10px] text-zinc-400">
                                  {relativeTime(insight.submittedAt)}
                                </span>
                              </div>
                            </div>
                            <CaretRight
                              size={12}
                              className={[
                                "mt-1 flex-shrink-0 transition-transform",
                                active
                                  ? "rotate-90 text-blue-500"
                                  : "text-zinc-300 dark:text-zinc-700",
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
          {selectedInsight && (
            <motion.div
              key={selectedInsight.id}
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
                <DetailPanel
                  insight={selectedInsight}
                  stage={getStage(selectedInsight)}
                  onClose={() => setSelectedId(null)}
                  onAdvance={(s) => advanceStage(selectedInsight.id, s)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
