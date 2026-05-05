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
import ThemeToggle from '@/components/ThemeToggle'

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
  kill:     { label: 'KILL',    badge: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',        dot: 'bg-rose-500' },
  add:      { label: 'ADD',     badge: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'at-risk':{ label: 'AT RISK', badge: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',    dot: 'bg-amber-500' },
  clear:    { label: 'CLEAR',   badge: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',               dot: 'bg-zinc-400' },
}

const RUN: Record<RunStatus, { dot: string; label: string; labelCls: string }> = {
  breach:  { dot: 'bg-rose-500',   label: 'BREACH',  labelCls: 'text-rose-600 dark:text-rose-400'   },
  updated: { dot: 'bg-emerald-500',label: 'UPDATED', labelCls: 'text-emerald-600 dark:text-emerald-400' },
  delayed: { dot: 'bg-amber-500',  label: 'DELAYED', labelCls: 'text-amber-600 dark:text-amber-400'  },
  offline: { dot: 'bg-rose-500',   label: 'OFFLINE', labelCls: 'text-rose-600 dark:text-rose-400'   },
  quiet:   { dot: 'bg-zinc-400',   label: 'QUIET',   labelCls: 'text-zinc-400 dark:text-zinc-600'   },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' }) + ' UTC'
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span suppressHydrationWarning className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
      {time ?? '——:——:—— UTC'}
    </span>
  )
}

const SystemStatusPill = memo(function SystemStatusPill() {
  return (
    <span className="flex items-center gap-1.5 rounded px-1.5 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/15">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">nominal</span>
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
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">{count}</span>
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
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
      className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {/* Signal transition */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${SIG[item.from].badge}`}>
          {SIG[item.from].label}
        </span>
        <ArrowFatLinesRight size={11} className="text-zinc-400" />
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${SIG[item.to].badge}`}>
          {SIG[item.to].label}
        </span>
      </div>

      {/* Position info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.ticker}</span>
          <span className="truncate text-xs text-zinc-500 dark:text-zinc-500">{item.trigger}</span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{item.theme}</span>
      </div>

      {/* Time */}
      <span className="flex-shrink-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{item.time} UTC</span>
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
      className="flex items-center gap-4 border-b border-zinc-100 py-2.5 last:border-0 dark:border-zinc-800/60"
    >
      <span className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${r.dot}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{item.theme}</span>
          <span className={`font-mono text-[9px] font-semibold uppercase tracking-wide ${r.labelCls}`}>
            {r.label}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-500">{item.detail}</p>
      </div>
      <span className="flex-shrink-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{item.time}</span>
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
      className="flex items-start gap-3 rounded-lg border border-amber-200/60 bg-amber-50/50 px-4 py-3 dark:border-amber-500/15 dark:bg-amber-500/5"
    >
      <Warning size={14} weight="fill" className="mt-0.5 flex-shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.components}</span>
          <span className="font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400">{item.divergence}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">{item.detail}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-[9px] uppercase tracking-wide text-zinc-400 dark:text-zinc-600">Horizon</p>
        <p className="font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">{item.horizon}</p>
      </div>
    </motion.div>
  )
})

const INSIGHT_CATEGORY: Record<PendingInsight['category'], string> = {
  'THESIS UPDATE': 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  'OPPORTUNITY':   'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  'RISK':          'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
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
      className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${INSIGHT_CATEGORY[item.category]}`}>
            {item.category}
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{item.theme}</span>
        </div>
        <p className="text-xs leading-snug text-zinc-700 dark:text-zinc-300">{item.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{item.analyst}</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{item.submittedAt}</span>
        </div>
      </div>
      <ArrowRight size={11} className="mt-1 flex-shrink-0 text-zinc-300 dark:text-zinc-700" />
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
  const hasIssues = THEME_RUNS.some((r) => r.status === 'breach' || r.status === 'offline' || r.status === 'delayed')
  return (
    <div
      data-testid="pipeline-status-bar"
      className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${hasIssues ? 'border-amber-200/60 bg-amber-50/50 dark:border-amber-500/15 dark:bg-amber-500/5' : 'border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-500/15 dark:bg-emerald-500/5'}`}
    >
      <span className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${hasIssues ? 'bg-amber-400' : 'bg-emerald-500'}`} />
      <span className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
        {ranCount}/{total} THEMES RAN
      </span>
      <span className="text-zinc-300 dark:text-zinc-700">·</span>
      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
        Last run {RUN_META.completedAt}
      </span>
      {hasIssues && (
        <>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
            {THEME_RUNS.filter((r) => r.status === 'breach' || r.status === 'offline' || r.status === 'delayed').length} issues
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
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <SunHorizon size={15} weight="fill" className="text-zinc-400 dark:text-zinc-500" />
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Morning Brief</h1>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{RUN_META.date}</span>
          <SystemStatusPill />
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <ThemeToggle />
        </div>
      </div>

      {/* Digest body */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-3 py-24 text-center"
          >
            <CheckCircle size={28} weight="fill" className="text-emerald-500" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">All clear overnight</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              No material changes — {RUN_META.themesRan} themes ran · {RUN_META.dataPoints.toLocaleString()} data points ingested
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6 p-6">

            <PipelineStatusBar />

            {/* ── Action required ── */}
            {ACTIONS.length > 0 && (
              <motion.div
                data-testid="action-required"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-lg border border-blue-200/60 bg-blue-50/60 px-5 py-4 dark:border-blue-500/15 dark:bg-blue-500/5"
              >
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-500">
                  Action required before 09:00 ET
                </p>
                <ul className="space-y-2">
                  {ACTIONS.map((action) => (
                    <li key={action.text} className="flex items-start gap-2">
                      <ArrowRight size={11} weight="bold" className="mt-[3px] flex-shrink-0 text-blue-500" />
                      <span className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{action.text}</span>
                      <span data-testid="trend-tag" className="ml-auto flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
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
              <div className="rounded-lg border border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
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
              className="grid grid-cols-3 divide-x divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800"
            >
              {[
                { label: 'Positions affected', value: RUN_META.positionsAffected, color: 'text-rose-600 dark:text-rose-400' },
                { label: 'Themes ran',          value: RUN_META.themesRan,          color: 'text-zinc-900 dark:text-zinc-100' },
                { label: 'Data points',         value: RUN_META.dataPoints.toLocaleString(), color: 'text-zinc-900 dark:text-zinc-100' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-white py-4 dark:bg-zinc-900">
                  <span className={`font-mono text-xl font-bold tabular-nums leading-none ${color}`}>{value}</span>
                  <span className="text-[10px] tracking-wide text-zinc-400 dark:text-zinc-600">{label}</span>
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
