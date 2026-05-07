'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import {
  SunHorizon,
  ArrowRight,
  Warning,
  CheckCircle,
  ArrowFatLinesRight,
} from '@phosphor-icons/react'
import StellarHeader from '@/components/StellarHeader'
import DashboardPageHeader from '@/components/DashboardPageHeader'

// ─── Types ────────────────────────────────────────────────────────────────────

type SignalType = 'kill' | 'add' | 'at-risk' | 'clear'
type RunStatus = 'breach' | 'updated' | 'delayed' | 'offline' | 'quiet'

interface PositionSignal {
  ticker: string
  name: string
  theme: string
  from: SignalType
  to: SignalType
  trigger: string
  time: string
}

interface ThemeRun {
  theme: string
  status: RunStatus
  detail: string
  time: string
}

interface BottleneckWarning {
  id: string
  components: string
  divergence: string
  detail: string
  horizon: string
}

interface PendingInsight {
  id: string
  title: string
  analyst: string
  theme: string
  category: 'THESIS UPDATE' | 'OPPORTUNITY' | 'RISK'
  submittedAt: string
}

interface ActionItem {
  text: string
  trend: 'overnight-spike' | 'building' | 'resolved'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const RUN_META = {
  date: 'Thu 23 Apr 2026',
  completedAt: '04:51 UTC',
  dataPoints: 847,
  themesRan: 6,
  positionsAffected: 2,
}

const ACTIONS: ActionItem[] = [
  { text: 'Review NVDA — KILL signal triggered at 06:14 UTC', trend: 'overnight-spike' },
  { text: 'Confirm USTR / WTO feed reconnection (offline 3h 17m)', trend: 'building' },
]

const POSITION_SIGNALS: PositionSignal[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    theme: 'AI Infrastructure',
    from: 'at-risk',
    to: 'kill',
    trigger: 'Capex guidance deviation crossed 2.0σ threshold',
    time: '06:14',
  },
  {
    ticker: 'LMT',
    name: 'Lockheed Martin',
    theme: 'Defense & Autonomy',
    from: 'at-risk',
    to: 'kill',
    trigger: 'Supply chain concentration exceeded 0.85 threshold',
    time: '04:02',
  },
]

const THEME_RUNS: ThemeRun[] = [
  { theme: 'AI Infrastructure',   status: 'breach',  detail: '1 threshold breached · 3 signals updated',          time: '06:14' },
  { theme: 'Defense & Autonomy',  status: 'breach',  detail: '1 threshold breached · 2 signals updated',          time: '04:02' },
  { theme: 'Longevity Tech',      status: 'updated', detail: '2 positive signals updated (FDA filing ingested)',   time: '03:22' },
  { theme: 'Clean Energy',        status: 'delayed', detail: 'FERC data delayed 47m — no factor impact',          time: '03:57' },
  { theme: 'Deglobalization',     status: 'offline', detail: '3 feeds offline since 22:14 UTC · 47 obs. queued',  time: '22:14' },
  { theme: 'Space Economy',       status: 'quiet',   detail: 'No new data overnight — no changes',                time: '01:00' },
]

const BOTTLENECK_WARNINGS: BottleneckWarning[] = [
  {
    id: 'bw1',
    components: 'Memory vs Logic Chips',
    divergence: '25%/yr vs 70%/yr',
    detail: 'Memory bandwidth scaling at 25%/yr while logic compute grows at 70%/yr. Mismatch widening for 3 consecutive quarters.',
    horizon: 'Q3 2026',
  },
]

const PENDING_INSIGHTS: PendingInsight[] = [
  {
    id: 'i1',
    title: 'NVDA HBM3e capacity constraints may compress margin by 180–220bps in H2',
    analyst: 'Marco R.',
    theme: 'AI Infrastructure',
    category: 'THESIS UPDATE',
    submittedAt: '04:38 UTC',
  },
  {
    id: 'i2',
    title: 'FERC Order 1920 implementation delay opens 6–9 month window for NEE grid assets',
    analyst: 'Sara K.',
    theme: 'Clean Energy',
    category: 'OPPORTUNITY',
    submittedAt: '03:51 UTC',
  },
]

// ─── Style constants ──────────────────────────────────────────────────────────

const SIG: Record<SignalType, { label: string; badge: string; dot: string }> = {
  kill:     { label: 'KILL',    badge: 'bg-rose-500/20 text-rose-400',      dot: 'bg-rose-500' },
  add:      { label: 'ADD',     badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-500' },
  'at-risk':{ label: 'AT RISK', badge: 'bg-amber-500/20 text-amber-400',    dot: 'bg-amber-500' },
  clear:    { label: 'CLEAR',   badge: 'bg-white/10 text-white/50',         dot: 'bg-white/30' },
}

const RUN: Record<RunStatus, { dot: string; label: string; labelCls: string }> = {
  breach:  { dot: 'bg-rose-500',    label: 'BREACH',  labelCls: 'text-rose-400'    },
  updated: { dot: 'bg-emerald-500', label: 'UPDATED', labelCls: 'text-emerald-400' },
  delayed: { dot: 'bg-amber-500',   label: 'DELAYED', labelCls: 'text-amber-400'   },
  offline: { dot: 'bg-rose-500',    label: 'OFFLINE', labelCls: 'text-rose-400'    },
  quiet:   { dot: 'bg-white/30',    label: 'QUIET',   labelCls: 'text-white/40'    },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SystemStatusPill = memo(function SystemStatusPill() {
  return (
    <span className="flex items-center gap-1.5 rounded px-1.5 py-0.5 bg-emerald-500/10">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono text-[10px] font-semibold text-emerald-400">nominal</span>
    </span>
  )
})

function DigestSection({ label, count, delay = 0 }: { label: string; count: number; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.25 }}
      className="flex items-center gap-2 pb-2 pt-1"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
        {label}
      </span>
      <span className="font-mono text-[10px] text-white/25">{count}</span>
      <div className="flex-1 border-t border-white/[0.07]" />
    </motion.div>
  )
}

const PositionSignalRow = memo(function PositionSignalRow({
  item,
  index,
}: {
  item: PositionSignal
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 rounded-xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.07]"
    >
      {/* Signal transition */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${SIG[item.from].badge}`}>
          {SIG[item.from].label}
        </span>
        <ArrowFatLinesRight size={11} className="text-white/30" />
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${SIG[item.to].badge}`}>
          {SIG[item.to].label}
        </span>
      </div>

      {/* Position info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold text-[#f7f7f7]">{item.ticker}</span>
          <span className="truncate text-xs text-white/50">{item.trigger}</span>
        </div>
        <span className="font-mono text-[10px] text-white/40">{item.theme}</span>
      </div>

      {/* Time */}
      <span className="flex-shrink-0 font-mono text-[10px] text-white/40">{item.time} UTC</span>
    </motion.div>
  )
})

const ThemeRunRow = memo(function ThemeRunRow({
  item,
  index,
}: {
  item: ThemeRun
  index: number
}) {
  const r = RUN[item.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 + index * 0.05, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-4 border-b border-white/[0.07] py-2.5 last:border-0"
    >
      <span className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${r.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#f7f7f7]">{item.theme}</span>
          <span className={`font-mono text-[9px] font-semibold uppercase tracking-wide ${r.labelCls}`}>
            {r.label}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-white/50">{item.detail}</p>
      </div>
      <span className="flex-shrink-0 font-mono text-[10px] text-white/40">{item.time}</span>
    </motion.div>
  )
})

const BottleneckRow = memo(function BottleneckRow({
  item,
  index,
}: {
  item: BottleneckWarning
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 rounded-xl bg-amber-500/5 px-4 py-3 ring-1 ring-amber-500/20"
    >
      <Warning size={14} weight="fill" className="mt-0.5 flex-shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#f7f7f7]">{item.components}</span>
          <span className="font-mono text-[10px] font-semibold text-amber-400">{item.divergence}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/50">{item.detail}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-[9px] uppercase tracking-wide text-white/40">Horizon</p>
        <p className="font-mono text-[11px] font-semibold text-amber-400">{item.horizon}</p>
      </div>
    </motion.div>
  )
})

const INSIGHT_CATEGORY: Record<PendingInsight['category'], string> = {
  'THESIS UPDATE': 'bg-blue-500/15 text-blue-400',
  'OPPORTUNITY':   'bg-emerald-500/15 text-emerald-400',
  'RISK':          'bg-rose-500/15 text-rose-400',
}

const InsightRow = memo(function InsightRow({
  item,
  index,
}: {
  item: PendingInsight
  index: number
}) {
  return (
    <motion.a
      href="/insights"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 + index * 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3 rounded-xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.07]"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${INSIGHT_CATEGORY[item.category]}`}>
            {item.category}
          </span>
          <span className="text-[10px] text-white/40">{item.theme}</span>
        </div>
        <p className="text-xs leading-snug text-[#cecfd2]">{item.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-mono text-[10px] text-white/40">{item.analyst}</span>
          <span className="text-white/20">·</span>
          <span className="font-mono text-[10px] text-white/40">{item.submittedAt}</span>
        </div>
      </div>
      <ArrowRight size={11} className="mt-1 flex-shrink-0 text-white/30" />
    </motion.a>
  )
})

const TREND_LABELS: Record<ActionItem['trend'], string> = {
  'overnight-spike': 'Overnight spike',
  'building':        'Building',
  'resolved':        'Resolved',
}

function PipelineStatusBar() {
  const ranCount = THEME_RUNS.filter((r) => r.status !== 'offline').length
  const total = THEME_RUNS.length
  const issues = THEME_RUNS.filter((r) => r.status === 'breach' || r.status === 'offline' || r.status === 'delayed')
  const hasIssues = issues.length > 0
  return (
    <div
      data-testid="pipeline-status-bar"
      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 ring-1 ${hasIssues ? 'bg-amber-500/5 ring-amber-500/20' : 'bg-emerald-500/5 ring-emerald-500/20'}`}
    >
      <span className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${hasIssues ? 'bg-amber-400' : 'bg-emerald-500'}`} />
      <span className="font-mono text-[11px] font-semibold text-[#f7f7f7]">
        {ranCount}/{total} THEMES RAN
      </span>
      <span className="text-white/20">·</span>
      <span className="font-mono text-[11px] text-white/50">
        Last run {RUN_META.completedAt}
      </span>
      {hasIssues && (
        <>
          <span className="text-white/20">·</span>
          <span className="font-mono text-[11px] text-amber-400">
            {issues.length} issues
          </span>
        </>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OverviewClient() {
  const isEmpty =
    ACTIONS.length === 0 &&
    POSITION_SIGNALS.length === 0 &&
    BOTTLENECK_WARNINGS.length === 0 &&
    THEME_RUNS.every((r) => r.status === 'quiet')

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "linear-gradient(144deg, rgb(21, 18, 37) 15%, rgb(5, 5, 30) 82%)" }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 45% 80%, rgba(30,58,200,0.28) 0%, transparent 68%)",
        }}
      />

      <StellarHeader />
      <DashboardPageHeader />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-3 py-24 text-center"
          >
            <CheckCircle size={28} weight="fill" className="text-emerald-400" />
            <p className="text-sm font-medium text-[#f7f7f7]">All clear overnight</p>
            <p className="text-xs text-white/50">
              No material changes — {RUN_META.themesRan} themes ran · {RUN_META.dataPoints.toLocaleString()} data points ingested
            </p>
          </motion.div>
        ) : (
          <div className="mx-auto w-[1120px] space-y-5 py-8">

            <PipelineStatusBar />

            {/* ── Action required ── */}
            {ACTIONS.length > 0 && (
              <motion.div
                data-testid="action-required"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-xl bg-blue-500/5 px-5 py-4 ring-1 ring-blue-500/20"
              >
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                  Action required before 09:00 ET
                </p>
                <ul className="space-y-2">
                  {ACTIONS.map((action) => (
                    <li key={action.text} className="flex items-start gap-2">
                      <ArrowRight size={11} weight="bold" className="mt-[3px] flex-shrink-0 text-blue-400" />
                      <span className="text-xs leading-relaxed text-[#cecfd2]">{action.text}</span>
                      <span data-testid="trend-tag" className="ml-auto flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide bg-white/10 text-white/50">
                        {TREND_LABELS[action.trend]}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* ── Position signals ── */}
            {POSITION_SIGNALS.length > 0 && (
              <div className="space-y-2">
                <DigestSection label="Position signals" count={POSITION_SIGNALS.length} delay={0.08} />
                {POSITION_SIGNALS.map((item, i) => (
                  <PositionSignalRow key={item.ticker} item={item} index={i} />
                ))}
              </div>
            )}

            {/* ── Overnight analysis ── */}
            <div>
              <DigestSection label="Overnight analysis" count={THEME_RUNS.length} delay={0.22} />
              <div className="rounded-xl bg-white/[0.04] px-4 ring-1 ring-white/[0.07]">
                {THEME_RUNS.map((item, i) => (
                  <ThemeRunRow key={item.theme} item={item} index={i} />
                ))}
              </div>
            </div>

            {/* ── Bottleneck watch ── */}
            {BOTTLENECK_WARNINGS.length > 0 && (
              <div className="space-y-2">
                <DigestSection label="Bottleneck watch" count={BOTTLENECK_WARNINGS.length} delay={0.45} />
                {BOTTLENECK_WARNINGS.map((item, i) => (
                  <BottleneckRow key={item.id} item={item} index={i} />
                ))}
              </div>
            )}

            {/* ── Insights pending review ── */}
            {PENDING_INSIGHTS.length > 0 && (
              <div className="space-y-2">
                <DigestSection label="Insights pending review" count={PENDING_INSIGHTS.length} delay={0.52} />
                {PENDING_INSIGHTS.map((item, i) => (
                  <InsightRow key={item.id} item={item} index={i} />
                ))}
              </div>
            )}

            {/* ── Run summary footer ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="grid grid-cols-3 divide-x divide-white/[0.07] overflow-hidden rounded-xl ring-1 ring-white/[0.07]"
            >
              {[
                { label: 'Positions affected', value: RUN_META.positionsAffected, color: 'text-rose-400' },
                { label: 'Themes ran',          value: RUN_META.themesRan,          color: 'text-[#f7f7f7]' },
                { label: 'Data points',         value: RUN_META.dataPoints.toLocaleString(), color: 'text-[#f7f7f7]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-white/[0.04] py-4">
                  <span className={`font-mono text-xl font-bold tabular-nums leading-none ${color}`}>{value}</span>
                  <span className="text-[10px] tracking-wide text-white/40">{label}</span>
                </div>
              ))}
            </motion.div>

            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  )
}
