"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Warning,
  ArrowDown,
  ArrowUp,
} from "@phosphor-icons/react";
import StellarHeader from "@/components/StellarHeader";
import DashboardPageHeader from "@/components/DashboardPageHeader";

// Top metrics
const METRICS = [
  { label: "Portfolio VaR (95%)", value: "−4.2%", sub: "1-day", delta: -0.3, warn: false },
  { label: "Max Drawdown (YTD)", value: "−11.8%", sub: "vs −18% bench", delta: 0.4, warn: false },
  { label: "Sharpe Ratio", value: "1.41", sub: "12-month", delta: -0.12, warn: false },
  { label: "Portfolio Beta", value: "0.87", sub: "vs S&P 500", delta: 0.05, warn: false },
  { label: "Correlation", value: "0.71", sub: "avg cross-asset", delta: 0.08, warn: true },
  { label: "Liquidity Score", value: "82/100", sub: "93% next-day liquid", delta: 0, warn: false },
];

// Heatmap: themes (rows) × factors (cols)
const THEMES = [
  "AI Infrastructure",
  "Nuclear Renaissance",
  "GLP-1 Revolution",
  "LatAm Digital",
  "Clean Energy",
  "Energy Transition",
];

const FACTORS = ["Macro", "Rates", "FX", "Regulatory", "Competitive", "Liquidity", "Geopolitical"];

// Score 0-100; 0 = no risk (green), 100 = max risk (red)
const HEATMAP: number[][] = [
  [55, 62, 30, 45, 78, 20, 35], // AI Infrastructure
  [40, 55, 15, 85, 30, 25, 90], // Nuclear Renaissance
  [35, 48, 20, 72, 82, 18, 12], // GLP-1 Revolution
  [65, 45, 88, 55, 48, 42, 22], // LatAm Digital
  [48, 58, 28, 78, 45, 30, 18], // Clean Energy
  [72, 42, 35, 50, 38, 35, 20], // Energy Transition
];

// Factor attribution: factor name + contribution to portfolio risk (%)
const ATTRIBUTION = [
  { factor: "AI Infrastructure concentration", value: 28, dir: "up" as const },
  { factor: "Nuclear / geopolitical overlay", value: 18, dir: "up" as const },
  { factor: "GLP-1 regulatory uncertainty", value: 14, dir: "up" as const },
  { factor: "LatAm FX exposure", value: 11, dir: "up" as const },
  { factor: "Clean Energy policy risk", value: 9, dir: "up" as const },
  { factor: "Cash drag", value: -6, dir: "down" as const },
  { factor: "Short duration overlay", value: -8, dir: "down" as const },
  { factor: "Diversification benefit", value: -14, dir: "down" as const },
];

// Drawdown series (weekly, ~18 months)
const DRAWDOWN_SERIES = [
  0, -1.2, -0.8, -2.1, -1.5, -0.6, -1.8, -3.2, -4.1, -5.6, -7.2, -8.9,
  -11.8, -10.4, -9.1, -8.3, -7.6, -6.8, -7.9, -8.2, -7.1, -6.3, -5.8,
  -6.4, -5.2, -4.8, -5.5, -4.9, -4.2, -3.8, -4.1, -5.0, -5.7, -4.8,
  -4.1, -3.5, -4.3, -5.1, -6.2, -7.0, -6.5, -5.9, -5.4, -5.1, -4.7,
  -5.3, -6.1, -5.5, -4.9, -4.4, -4.2, -3.9, -4.5, -5.8, -6.9, -8.1,
  -9.4, -8.7, -7.8, -7.0, -6.4, -5.9, -5.3, -4.8, -4.2,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(score: number): string {
  if (score >= 75) return "bg-rose-500";
  if (score >= 55) return "bg-amber-500";
  if (score >= 35) return "bg-blue-500";
  return "bg-emerald-600";
}

function riskOpacity(score: number): number {
  return 0.15 + (score / 100) * 0.65;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ m }: { m: typeof METRICS[number] }) {
  const positive = m.delta > 0;
  const neutral = m.delta === 0;
  return (
    <div className={["flex flex-col gap-1.5 rounded-xl border p-4", m.warn ? "border-amber-500/25 bg-amber-500/[0.06]" : "border-white/[0.07] bg-white/[0.04]"].join(" ")}>
      <div className="flex items-start justify-between gap-1">
        <span className="text-[10px] leading-tight text-white/40">{m.label}</span>
        {m.warn && <Warning size={12} className="mt-0.5 flex-shrink-0 text-amber-400" />}
      </div>
      <span className={["font-mono text-xl font-bold leading-none", m.warn ? "text-amber-400" : "text-[#f7f7f7]"].join(" ")}>
        {m.value}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/30">{m.sub}</span>
        {!neutral && (
          <span className={["flex items-center gap-0.5 text-[10px] font-medium", positive ? "text-emerald-400" : "text-rose-400"].join(" ")}>
            {positive ? <ArrowUp size={8} weight="bold" /> : <ArrowDown size={8} weight="bold" />}
            {Math.abs(m.delta)}
          </span>
        )}
      </div>
    </div>
  );
}

function Heatmap({ highlight }: { highlight: { row: number; col: number } | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="w-36 pb-1 pr-2 text-left text-[9px] font-medium uppercase tracking-wider text-white/30">
              Theme
            </th>
            {FACTORS.map((f) => (
              <th key={f} className="min-w-[72px] pb-1 text-center text-[9px] font-medium text-white/30">
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {THEMES.map((theme, ri) => (
            <tr key={theme}>
              <td className="pr-2 text-[11px] font-medium text-white/50 whitespace-nowrap">{theme}</td>
              {FACTORS.map((_, ci) => {
                const score = HEATMAP[ri][ci];
                const isHighlighted = highlight?.row === ri && highlight?.col === ci;
                return (
                  <td key={ci} className="text-center">
                    <motion.div
                      animate={{ scale: isHighlighted ? 1.15 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={["relative mx-auto flex h-7 w-[68px] items-center justify-center rounded text-[10px] font-mono font-bold transition-all", riskColor(score)].join(" ")}
                      style={{ opacity: riskOpacity(score) }}
                    >
                      <span className="relative z-10 text-white">{score}</span>
                    </motion.div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DrawdownChart() {
  const W = 640;
  const H = 120;
  const pad = { t: 10, r: 16, b: 24, l: 40 };
  const w = W - pad.l - pad.r;
  const h = H - pad.t - pad.b;

  const min = Math.min(...DRAWDOWN_SERIES);
  const scaleY = (v: number) => pad.t + ((v - 0) / (min - 0)) * h;
  const scaleX = (i: number) => pad.l + (i / (DRAWDOWN_SERIES.length - 1)) * w;

  const pts = DRAWDOWN_SERIES.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");
  const areaPath = `M ${scaleX(0)},${scaleY(0)} L ${DRAWDOWN_SERIES.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" L ")} L ${scaleX(DRAWDOWN_SERIES.length - 1)},${scaleY(0)} Z`;

  const yticks = [0, -3, -6, -9, -12];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <defs>
        <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {yticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={scaleY(t)} y2={scaleY(t)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <text x={pad.l - 4} y={scaleY(t) + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">
            {t}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#ddGrad)" />

      {/* Line */}
      <polyline points={pts} fill="none" stroke="rgb(99,179,237)" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Current dot */}
      <circle
        cx={scaleX(DRAWDOWN_SERIES.length - 1)}
        cy={scaleY(DRAWDOWN_SERIES[DRAWDOWN_SERIES.length - 1])}
        r="3"
        fill="rgb(99,179,237)"
      />

      {/* Max drawdown marker */}
      {(() => {
        const idx = DRAWDOWN_SERIES.indexOf(min);
        return (
          <>
            <line
              x1={scaleX(idx)} x2={scaleX(idx)}
              y1={scaleY(0)} y2={scaleY(min)}
              stroke="rgba(251,191,36,0.4)" strokeWidth="1" strokeDasharray="3 2"
            />
            <circle cx={scaleX(idx)} cy={scaleY(min)} r="3" fill="rgb(251,191,36)" />
            <text x={scaleX(idx) + 4} y={scaleY(min) - 4} fill="rgba(251,191,36,0.8)" fontSize="8" fontFamily="monospace">
              {min}%
            </text>
          </>
        );
      })()}
    </svg>
  );
}

function AttributionBar({ item }: { item: typeof ATTRIBUTION[number] }) {
  const abs = Math.abs(item.value);
  const max = 28;
  const pct = (abs / max) * 100;
  const isRisk = item.dir === "up";

  return (
    <div className="flex items-center gap-3">
      <span className="w-52 flex-shrink-0 truncate text-[11px] text-white/50">{item.factor}</span>
      <div className="flex flex-1 items-center gap-2">
        {isRisk ? (
          <div className="flex flex-1 items-center gap-1.5">
            <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
                className="h-1.5 rounded-full bg-rose-500/70"
              />
            </div>
            <span className="w-10 text-right font-mono text-[10px] font-semibold text-rose-400">
              +{item.value}%
            </span>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-1.5">
            <div className="flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
                className="h-1.5 rounded-full bg-emerald-500/70"
              />
            </div>
            <span className="w-10 text-right font-mono text-[10px] font-semibold text-emerald-400">
              {item.value}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RiskMonitorPage() {
  const [highlight, setHighlight] = useState<{ row: number; col: number } | null>(null);
  const [tab, setTab] = useState<"heatmap" | "attribution">("heatmap");

  const topRisks = HEATMAP.flatMap((row, ri) =>
    row.map((score, ci) => ({ score, theme: THEMES[ri], factor: FACTORS[ci], ri, ci })),
  )
    .filter((x) => x.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

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

      {/* Body — scrollable */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {/* Metrics strip */}
        <div className="grid grid-cols-6 gap-3 border-b border-white/[0.07] p-4">
          {METRICS.map((m) => (
            <MetricCard key={m.label} m={m} />
          ))}
        </div>

        {/* Main content: left panel + right rail */}
        <div className="flex gap-0">
          {/* Left: heatmap + drawdown */}
          <div className="flex-1 min-w-0 space-y-0 divide-y divide-white/[0.07]">
            {/* Heatmap / Attribution tabs */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1 rounded-lg border border-white/[0.10] bg-white/[0.04] p-0.5">
                  {(["heatmap", "attribution"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={[
                        "relative rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                        tab === t ? "bg-white/15 text-[#f7f7f7]" : "text-white/40 hover:text-white/60",
                      ].join(" ")}
                    >
                      {tab === t && (
                        <motion.span
                          layoutId="risk-tab"
                          className="absolute inset-0 rounded-md bg-white/10"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}
                      <span className="relative z-10">
                        {t === "heatmap" ? "Risk Heatmap" : "Factor Attribution"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-rose-500/80" /> High (≥75)</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-amber-500/80" /> Elevated (≥55)</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-blue-500/80" /> Moderate (≥35)</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-sm bg-emerald-600/80" /> Low</span>
                </div>
              </div>

              {tab === "heatmap" ? (
                <Heatmap highlight={highlight} />
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 pb-1 text-[10px] text-white/30">
                    <span className="w-52 flex-shrink-0">Factor</span>
                    <span className="flex-1">Contribution to portfolio risk</span>
                    <span className="w-10 text-right">%</span>
                  </div>
                  {ATTRIBUTION.map((item) => (
                    <AttributionBar key={item.factor} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Drawdown chart */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#f7f7f7]">Portfolio Drawdown</h2>
                  <p className="mt-0.5 text-[10px] text-white/30">Rolling 18-month drawdown from peak (weekly)</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-amber-400">−11.8%</span>
                  <p className="text-[10px] text-white/30">max drawdown YTD</p>
                </div>
              </div>
              <DrawdownChart />
              <div className="mt-3 flex items-center gap-6 text-[10px] text-white/30">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-4 rounded-full bg-blue-300/60" />
                  Portfolio
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-amber-400" />
                  Max drawdown
                </span>
              </div>
            </div>
          </div>

          {/* Right rail: elevated risks */}
          <div className="w-[280px] flex-shrink-0 border-l border-white/[0.07] p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#f7f7f7]">Elevated Risks</h2>
            <div className="space-y-2">
              {topRisks.map((r) => (
                <button
                  key={`${r.ri}-${r.ci}`}
                  onClick={() => {
                    setTab("heatmap");
                    setHighlight((prev) =>
                      prev?.row === r.ri && prev?.col === r.ci ? null : { row: r.ri, col: r.ci },
                    );
                  }}
                  className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] p-3 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={["font-mono text-sm font-bold", r.score >= 80 ? "text-rose-400" : "text-amber-400"].join(" ")}>
                      {r.score}
                    </span>
                    <Warning size={12} className={r.score >= 80 ? "text-rose-400" : "text-amber-400"} />
                  </div>
                  <p className="mt-0.5 text-[10px] font-medium text-white/60">{r.theme}</p>
                  <p className="text-[10px] text-white/30">{r.factor} risk</p>
                </button>
              ))}
            </div>

            {/* Correlation alert */}
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Warning size={12} className="text-amber-400 flex-shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">Correlation Warning</span>
              </div>
              <p className="text-[11px] leading-relaxed text-white/50">
                Cross-asset correlation at 0.71 is trending above threshold. AI + Nuclear positions showing co-movement in risk-off scenarios.
              </p>
            </div>

            {/* Concentration */}
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-white/[0.04] p-3.5">
              <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">Theme Concentration</h3>
              {[
                { name: "AI Infrastructure", pct: 38, warn: true },
                { name: "Nuclear Renaissance", pct: 22, warn: false },
                { name: "GLP-1 / Healthcare", pct: 14, warn: false },
                { name: "LatAm Digital", pct: 12, warn: false },
                { name: "Other", pct: 14, warn: false },
              ].map((t) => (
                <div key={t.name} className="mb-2 last:mb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className={["text-[10px]", t.warn ? "text-amber-400" : "text-white/50"].join(" ")}>{t.name}</span>
                    <span className={["font-mono text-[10px] font-bold", t.warn ? "text-amber-400" : "text-white/40"].join(" ")}>
                      {t.pct}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.pct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={["h-full rounded-full", t.warn ? "bg-amber-500/70" : "bg-blue-500/50"].join(" ")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
