'use client'

import { memo, useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Database } from '@phosphor-icons/react'
import ThemeToggle from '@/components/ThemeToggle'

// ─── Health Gauge ─────────────────────────────────────────────────────────────

function HealthGauge({ pct }: { pct: number }) {
  const r = 15
  const circ = 2 * Math.PI * r
  const half = circ / 2
  const fill = (pct / 100) * half
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#f43f5e'

  return (
    <svg width="42" height="24" viewBox="0 0 42 24" aria-label={`System health ${pct}%`}>
      <circle
        cx="21" cy="21" r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={`${half} ${circ}`}
        strokeLinecap="round"
        className="text-zinc-200 dark:text-zinc-800"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '21px 21px' }}
      />
      <motion.circle
        cx="21" cy="21" r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '21px 21px' }}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${fill} ${circ}` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedStatus = 'healthy' | 'degraded' | 'failed' | 'idle'
type JobStatus = 'running' | 'healthy' | 'degraded' | 'failed' | 'idle'
type RunResult = 'success' | 'failed' | 'slow'
type AnyStatus = FeedStatus | JobStatus

interface DataFeed {
  id: string
  name: string
  category: string
  status: FeedStatus
  lastSyncLabel: string
  stalenessPct: number
  slaLabel: string
  recordsLabel: string
  errorCount: number
  errorMsg?: string
}

interface PipelineJob {
  id: string
  name: string
  status: JobStatus
  lastRunLabel: string
  avgMs: number
  nextRunLabel: string
  runHistory: RunResult[]
}

interface Incident {
  id: string
  severity: 'critical' | 'warning'
  title: string
  timeLabel: string
  resolved: boolean
  detail: string
}

interface SysEvent {
  time: string
  level: 'error' | 'warn' | 'info'
  message: string
}

interface ThemeCov {
  name: string
  pct: number
  color: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DATA_FEEDS: DataFeed[] = [
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    category: 'Regulatory Filings',
    status: 'healthy',
    lastSyncLabel: '4 min ago',
    stalenessPct: 27,
    slaLabel: '15 min',
    recordsLabel: '1,247',
    errorCount: 0,
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg Terminal',
    category: 'Market Data',
    status: 'degraded',
    lastSyncLabel: '23 min ago',
    stalenessPct: 100,
    slaLabel: '1 min',
    recordsLabel: '0 new',
    errorCount: 7,
    errorMsg: 'CONNECTION_TIMEOUT',
  },
  {
    id: 'fda-clinical',
    name: 'FDA Clinical Pipeline',
    category: 'Regulatory Data',
    status: 'healthy',
    lastSyncLabel: '47 min ago',
    stalenessPct: 78,
    slaLabel: '60 min',
    recordsLabel: '83',
    errorCount: 0,
  },
  {
    id: 'ferc',
    name: 'FERC Regulatory',
    category: 'Energy Regulatory',
    status: 'healthy',
    lastSyncLabel: '6h 4m ago',
    stalenessPct: 25,
    slaLabel: '24h',
    recordsLabel: '312',
    errorCount: 0,
  },
  {
    id: 'blm',
    name: 'BLM Permits',
    category: 'Govt Permits',
    status: 'healthy',
    lastSyncLabel: '18h 12m ago',
    stalenessPct: 3,
    slaLabel: '30 days',
    recordsLabel: '2,841',
    errorCount: 0,
  },
  {
    id: 'ustr-trade',
    name: 'USTR / WTO Trade Data',
    category: 'Trade Policy',
    status: 'degraded',
    lastSyncLabel: '2h 7m ago',
    stalenessPct: 100,
    slaLabel: '1h',
    recordsLabel: '0 new',
    errorCount: 3,
    errorMsg: 'DNS_RESOLUTION_FAILURE',
  },
  {
    id: 'cbre',
    name: 'CBRE Market Reports',
    category: 'Real Estate Data',
    status: 'idle',
    lastSyncLabel: '4 days ago',
    stalenessPct: 13,
    slaLabel: '30 days',
    recordsLabel: '47',
    errorCount: 0,
  },
  {
    id: 'nato-policy',
    name: 'NATO / G7 Policy NLP',
    category: 'Policy Intelligence',
    status: 'healthy',
    lastSyncLabel: '3 days ago',
    stalenessPct: 10,
    slaLabel: 'event-driven',
    recordsLabel: '12',
    errorCount: 0,
  },
  {
    id: 'ism-pmi',
    name: 'ISM / PMI Macro Data',
    category: 'Economic Indicators',
    status: 'healthy',
    lastSyncLabel: '2 days ago',
    stalenessPct: 7,
    slaLabel: 'monthly',
    recordsLabel: '8',
    errorCount: 0,
  },
  {
    id: 'satellite',
    name: 'Satellite Launch Manifests',
    category: 'Space Data',
    status: 'failed',
    lastSyncLabel: '6h 31m ago',
    stalenessPct: 100,
    slaLabel: 'event-driven',
    recordsLabel: '0 new',
    errorCount: 14,
    errorMsg: 'SSL_CERT_EXPIRED',
  },
]

const PIPELINE_JOBS: PipelineJob[] = [
  {
    id: 'sec-nlp',
    name: 'SEC Filing NLP Classifier',
    status: 'running',
    lastRunLabel: '2 min ago',
    avgMs: 1247,
    nextRunLabel: 'continuous',
    runHistory: ['success','success','success','success','success','success','success','success','success','success','success','success'],
  },
  {
    id: 'signal-gen',
    name: 'Signal Generator',
    status: 'healthy',
    lastRunLabel: '11 min ago',
    avgMs: 847,
    nextRunLabel: 'in 4 min',
    runHistory: ['success','success','success','success','success','success','success','success','success','failed','success','success'],
  },
  {
    id: 'conviction-scorer',
    name: 'Conviction Scorer',
    status: 'healthy',
    lastRunLabel: '1h 2m ago',
    avgMs: 4312,
    nextRunLabel: 'in 58 min',
    runHistory: ['success','success','success','success','success','success','success','success','success','success','success','success'],
  },
  {
    id: 'theme-model',
    name: 'Theme Model Updater',
    status: 'degraded',
    lastRunLabel: '3h 14m ago',
    avgMs: 18921,
    nextRunLabel: 'delayed',
    runHistory: ['success','success','success','success','success','success','success','failed','failed','slow','failed','slow'],
  },
  {
    id: 'alert-gen',
    name: 'Alert Generator',
    status: 'healthy',
    lastRunLabel: '14 min ago',
    avgMs: 234,
    nextRunLabel: 'in 1 min',
    runHistory: ['success','success','success','success','success','success','success','success','success','success','success','success'],
  },
  {
    id: 'coverage-monitor',
    name: 'Coverage Monitor',
    status: 'running',
    lastRunLabel: '2 min ago',
    avgMs: 128,
    nextRunLabel: 'continuous',
    runHistory: ['success','success','success','success','success','success','success','success','success','success','success','success'],
  },
  {
    id: 'factor-optimizer',
    name: 'Factor Weight Optimizer',
    status: 'idle',
    lastRunLabel: '22h 14m ago',
    avgMs: 47832,
    nextRunLabel: 'in 1h 46m',
    runHistory: ['success','success','success','success','success','success','success','success','success','success','success','success'],
  },
]

const INCIDENTS: Incident[] = [
  {
    id: 'inc-1',
    severity: 'warning',
    title: 'Bloomberg Terminal API degraded',
    timeLabel: 'active — 23 min',
    resolved: false,
    detail: '7 consecutive CONNECTION_TIMEOUT errors. Conviction Scorer running on stale 23-min cache. AI Infrastructure signals suppressed.',
  },
  {
    id: 'inc-2',
    severity: 'critical',
    title: 'Satellite Manifest scraper — SSL failure',
    timeLabel: 'active — 6h 31m',
    resolved: false,
    detail: 'SSL_CERT_EXPIRED on manifest provider. 14 retry attempts exhausted. Space Economy theme coverage at 76%. Certificate renewal required.',
  },
  {
    id: 'inc-3',
    severity: 'warning',
    title: 'USTR / WTO trade feed DNS failure',
    timeLabel: 'resolved 37 min ago',
    resolved: true,
    detail: 'DNS_RESOLUTION_FAILURE for api.ustr.gov. Outage duration: 2h 7m. Feed resumed at 09:47 UTC after DNS propagation.',
  },
  {
    id: 'inc-4',
    severity: 'warning',
    title: 'Theme Model Updater latency spike',
    timeLabel: 'resolved 2h ago',
    resolved: true,
    detail: 'Execution time spiked to 47.2s vs 18.9s baseline. Root cause: Bloomberg cache miss forced cold re-computation of factor weights.',
  },
]

const SYS_EVENTS: SysEvent[] = [
  { time: '09:47', level: 'error', message: 'Bloomberg API: TCP connection refused (attempt 7/10)' },
  { time: '09:44', level: 'warn',  message: 'Conviction Scorer: Bloomberg absent — running on 23m stale cache' },
  { time: '09:31', level: 'info',  message: 'Coverage Monitor: system health updated 84% → 83%' },
  { time: '09:28', level: 'error', message: 'Satellite Manifest: TLS handshake failed — cert expired 2026-04-21' },
  { time: '09:19', level: 'info',  message: 'Alert Generator: 3 new alerts queued from Signal Generator batch' },
  { time: '09:11', level: 'info',  message: 'Conviction Scorer: completed 4,312ms — all 6 themes updated' },
  { time: '09:03', level: 'warn',  message: 'Signal Generator: Bloomberg feed absent — 7 AI Infrastructure signals suppressed' },
  { time: '08:47', level: 'info',  message: 'USTR/WTO feed reconnected after 2h 7m outage' },
  { time: '08:32', level: 'info',  message: 'Factor Weight Optimizer scheduled for 11:30 UTC' },
  { time: '08:14', level: 'info',  message: 'SEC EDGAR batch: 1,247 new filings processed in 1,247ms' },
]

const THEME_COV: ThemeCov[] = [
  { name: 'AI Infrastructure',   pct: 84, color: '#3b82f6' },
  { name: 'Clean Energy',        pct: 91, color: '#10b981' },
  { name: 'Deglobalization',     pct: 79, color: '#f59e0b' },
  { name: 'Space Economy',       pct: 76, color: '#0ea5e9' },
  { name: 'Longevity Tech',      pct: 94, color: '#ec4899' },
  { name: 'Defense & Autonomy',  pct: 88, color: '#94a3b8' },
]

// ─── Style maps ───────────────────────────────────────────────────────────────

const FEED_STATUS_STYLE: Record<FeedStatus, { label: string; cls: string }> = {
  healthy:  { label: 'OK',       cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
  degraded: { label: 'DEGRADED', cls: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  failed:   { label: 'FAILED',   cls: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  idle:     { label: 'IDLE',     cls: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800' },
}

const JOB_STATUS_STYLE: Record<JobStatus, { label: string; cls: string }> = {
  running:  { label: 'RUNNING',  cls: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
  healthy:  { label: 'OK',       cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
  degraded: { label: 'SLOW',     cls: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
  failed:   { label: 'FAILED',   cls: 'text-rose-600 dark:text-rose-400 bg-rose-500/10' },
  idle:     { label: 'IDLE',     cls: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800' },
}

const EVENT_DOT: Record<string, string> = {
  error: 'bg-rose-500',
  warn:  'bg-amber-500',
  info:  'bg-zinc-400 dark:bg-zinc-600',
}

const DOT_CFG: Record<AnyStatus, { ring: string; dot: string; ping: boolean }> = {
  healthy:  { ring: 'bg-emerald-400', dot: 'bg-emerald-500', ping: true },
  running:  { ring: 'bg-blue-400',    dot: 'bg-blue-500',    ping: true },
  degraded: { ring: '',               dot: 'bg-amber-500',    ping: false },
  failed:   { ring: '',               dot: 'bg-rose-500',     ping: false },
  idle:     { ring: '',               dot: 'bg-zinc-400 dark:bg-zinc-600', ping: false },
}

const RUN_COLOR: Record<RunResult, string> = {
  success: 'bg-emerald-500',
  slow:    'bg-amber-500',
  failed:  'bg-rose-500',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = memo(function StatusDot({ status }: { status: AnyStatus }) {
  const cfg = DOT_CFG[status] ?? DOT_CFG.idle
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      {cfg.ping && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.ring} opacity-60`} />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
    </span>
  )
})

function getFreshnessColor(pct: number, status: FeedStatus): string {
  if (status === 'failed') return '#f43f5e'
  if (status === 'idle')   return '#a1a1aa'
  if (pct >= 90) return '#f43f5e'
  if (pct >= 65) return '#f59e0b'
  return '#10b981'
}

const FreshnessBar = memo(function FreshnessBar({ pct, status }: { pct: number; status: FeedStatus }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: getFreshnessColor(pct, status), originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.min(pct, 100) / 100 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
})

function RunSparkline({ history }: { history: RunResult[] }) {
  return (
    <div className="flex items-center gap-px">
      {history.map((r, i) => (
        <div key={i} className={`h-3 w-[7px] rounded-[2px] ${RUN_COLOR[r]}`} />
      ))}
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date().toUTCString().slice(17, 25))
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toUTCString().slice(17, 25)), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span suppressHydrationWarning className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
      {time} UTC
    </span>
  )
}

function SectionHeader({ label, count, extra }: { label: string; count?: number; extra?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-2 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-2.5">
        <span className="block h-3 w-px rounded-full bg-zinc-400 dark:bg-zinc-500" />
        <span className="text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        {count !== undefined && (
          <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">{count}</span>
        )}
      </div>
      {extra}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PipelineClient() {
  const healthyFeeds  = DATA_FEEDS.filter(f => f.status === 'healthy').length
  const degradedFeeds = DATA_FEEDS.filter(f => f.status === 'degraded').length
  const failedFeeds   = DATA_FEEDS.filter(f => f.status === 'failed').length
  const activeJobs    = PIPELINE_JOBS.filter(j => j.status === 'running' || j.status === 'healthy').length
  const degradedJobs  = PIPELINE_JOBS.filter(j => j.status === 'degraded').length
  const activeInc     = INCIDENTS.filter(i => !i.resolved).length

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">

      {/* ── Header ── */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-5">
        <div className="flex items-center gap-3">
          <Database size={15} weight="fill" className="text-zinc-400 dark:text-zinc-500" />
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Pipeline health</h1>
          <span className="flex items-center gap-1 rounded px-1.5 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">LIVE</span>
          </span>
          {activeInc > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-rose-500/15 px-1.5 font-mono text-[10px] font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              {activeInc} incident{activeInc > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <ThemeToggle />
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="flex flex-shrink-0 divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {/* System health */}
        <div className="flex items-center gap-3 px-5 py-3">
          <HealthGauge pct={83} />
          <div>
            <span className="block font-mono text-xl font-bold leading-none text-zinc-900 dark:text-zinc-100">83%</span>
            <span className="mt-1 block text-[10px] text-zinc-500">system health</span>
          </div>
        </div>
        {/* Feed status */}
        <div className="flex flex-col justify-center gap-1 px-5 py-3">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 mb-0.5">Feeds</span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{healthyFeeds} ok
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{degradedFeeds} deg
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{failedFeeds} fail
            </span>
          </div>
        </div>
        {/* Jobs status */}
        <div className="flex flex-col justify-center gap-1 px-5 py-3">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 mb-0.5">Jobs</span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{activeJobs} active
            </span>
            {degradedJobs > 0 && (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{degradedJobs} slow
              </span>
            )}
          </div>
        </div>
        {/* Throughput */}
        <div className="flex flex-col justify-center px-5 py-3">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 mb-1">Throughput</span>
          <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">4,550<span className="ml-1 text-[10px] font-normal text-zinc-400 dark:text-zinc-600">rec/h</span></span>
        </div>
        {/* Last sync */}
        <div className="flex flex-col justify-center px-5 py-3">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 mb-1">Last sync</span>
          <span className="font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">4 min<span className="ml-1 text-[10px] font-normal text-zinc-400 dark:text-zinc-600">ago</span></span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="grid min-h-0 flex-1 grid-cols-[3fr_2fr]">

        {/* ── Left: feeds + jobs ── */}
        <div className="overflow-y-auto border-r border-zinc-200 dark:border-zinc-800">

          {/* DATA FEEDS */}
          <SectionHeader
            label="Data feeds"
            count={DATA_FEEDS.length}
            extra={
              <div className="flex items-center gap-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                <span className="w-14 text-center">SLA</span>
                <span className="w-36 pl-2">Freshness</span>
                <span className="w-20 text-right">Last sync</span>
                <span className="w-14 text-right">Records</span>
                <span className="w-6 text-right">Err</span>
              </div>
            }
          />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {DATA_FEEDS.map((feed) => (
              <div key={feed.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/80 dark:hover:bg-white/[0.025] transition-colors duration-100 cursor-default">
                <StatusDot status={feed.status} />
                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {feed.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600 truncate">
                      {feed.category}
                    </span>
                    {feed.errorMsg && (
                      <span className="font-mono text-[9px] text-rose-500 dark:text-rose-400 truncate">
                        {feed.errorMsg}
                      </span>
                    )}
                  </div>
                </div>
                {/* SLA */}
                <div className="w-14 flex-shrink-0 text-center">
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{feed.slaLabel}</span>
                </div>
                {/* Freshness bar */}
                <div className="w-36 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600">
                      {Math.min(feed.stalenessPct, 100)}%
                    </span>
                    <span className={`font-mono text-[9px] font-semibold rounded px-1 ${FEED_STATUS_STYLE[feed.status].cls}`}>
                      {FEED_STATUS_STYLE[feed.status].label}
                    </span>
                  </div>
                  <FreshnessBar pct={feed.stalenessPct} status={feed.status} />
                </div>
                {/* Last sync */}
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                    {feed.lastSyncLabel}
                  </span>
                </div>
                {/* Records */}
                <div className="w-14 flex-shrink-0 text-right">
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                    {feed.recordsLabel}
                  </span>
                </div>
                {/* Error count */}
                <div className="w-6 flex-shrink-0 text-right">
                  {feed.errorCount > 0 ? (
                    <span className="font-mono text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      {feed.errorCount}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-300 dark:text-zinc-700">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PIPELINE JOBS */}
          <SectionHeader
            label="Pipeline jobs"
            count={PIPELINE_JOBS.length}
            extra={
              <div className="flex items-center gap-0 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                <span className="w-24 text-right">Last run</span>
                <span className="w-14 text-right">Avg</span>
                <span className="w-24 text-right pr-2">Next</span>
                <span className="w-24">Last 12 runs</span>
              </div>
            }
          />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {PIPELINE_JOBS.map((job) => (
              <div key={job.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/80 dark:hover:bg-white/[0.025] transition-colors duration-100 cursor-default">
                <StatusDot status={job.status} />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {job.name}
                  </p>
                  <span className={`flex-shrink-0 font-mono text-[9px] font-semibold rounded px-1 ${JOB_STATUS_STYLE[job.status].cls}`}>
                    {JOB_STATUS_STYLE[job.status].label}
                  </span>
                </div>
                <div className="w-24 flex-shrink-0 text-right">
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                    {job.lastRunLabel}
                  </span>
                </div>
                <div className="w-14 flex-shrink-0 text-right">
                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                    {job.avgMs >= 10000
                      ? `${(job.avgMs / 1000).toFixed(0)}s`
                      : job.avgMs >= 1000
                      ? `${(job.avgMs / 1000).toFixed(1)}s`
                      : `${job.avgMs}ms`}
                  </span>
                </div>
                <div className="w-24 flex-shrink-0 text-right pr-2">
                  <span className={`font-mono text-[11px] ${
                    job.nextRunLabel === 'delayed'
                      ? 'text-amber-600 dark:text-amber-400 font-semibold'
                      : job.nextRunLabel === 'continuous'
                      ? 'text-zinc-400 dark:text-zinc-600'
                      : 'text-zinc-500 dark:text-zinc-500'
                  }`}>
                    {job.nextRunLabel}
                  </span>
                </div>
                <div className="w-24 flex-shrink-0">
                  <RunSparkline history={job.runHistory} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: incidents + events + coverage ── */}
        <div className="overflow-y-auto">

          {/* INCIDENTS */}
          <SectionHeader label="Active incidents" count={INCIDENTS.length} />
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {INCIDENTS.map((inc) => (
              <div
                key={inc.id}
                className={[
                  'relative px-4 py-3 pl-5 transition-opacity',
                  inc.resolved ? 'opacity-45' : '',
                ].join(' ')}
              >
                {/* Left accent bar */}
                <span className={[
                  'absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full',
                  inc.resolved
                    ? 'bg-zinc-300 dark:bg-zinc-700'
                    : inc.severity === 'critical'
                    ? 'bg-rose-500'
                    : 'bg-amber-500',
                  !inc.resolved && inc.severity === 'critical' ? 'animate-pulse' : '',
                ].join(' ')} />

                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`text-xs font-medium leading-snug ${
                    inc.resolved ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'
                  }`}>
                    {inc.title}
                  </p>
                  <span className={`flex-shrink-0 font-mono text-[9px] font-semibold tracking-wide rounded px-1.5 py-0.5 ${
                    inc.resolved
                      ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                      : inc.severity === 'critical'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {inc.resolved ? 'resolved' : inc.severity}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-snug mb-1.5">
                  {inc.detail}
                </p>
                <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{inc.timeLabel}</p>
              </div>
            ))}
          </div>

          {/* SYSTEM EVENTS */}
          <SectionHeader label="System events" />
          <div className="px-4 py-2">
            {SYS_EVENTS.map((ev, i) => (
              <div key={i} className="relative flex items-start gap-3 py-[7px]">
                {/* Timeline rail */}
                {i < SYS_EVENTS.length - 1 && (
                  <span className="absolute left-[13px] top-[18px] bottom-0 w-px bg-zinc-100 dark:bg-zinc-800/80" />
                )}
                {/* Dot */}
                <span className={`relative flex-shrink-0 mt-[3px] h-[7px] w-[7px] rounded-full ring-2 ring-white dark:ring-zinc-950 ${EVENT_DOT[ev.level]}`} />
                {/* Content */}
                <div className="flex-1 min-w-0 flex items-start gap-2">
                  <span className="flex-shrink-0 w-9 font-mono text-[10px] text-zinc-400 dark:text-zinc-600 pt-px">
                    {ev.time}
                  </span>
                  <p className={`text-[11px] leading-snug ${
                    ev.level === 'error'
                      ? 'text-rose-600 dark:text-rose-400'
                      : ev.level === 'warn'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {ev.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* THEME COVERAGE IMPACT */}
          <SectionHeader label="Theme coverage" />
          <div className="px-4 py-4 space-y-3">
            {THEME_COV.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{t.name}</span>
                  <span className={`font-mono text-xs font-bold tabular-nums ${
                    t.pct >= 90
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : t.pct >= 80
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {t.pct}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: t.color, originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: t.pct / 100 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
            <p className="pt-1.5 text-[10px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
              Coverage = % of theme feeds healthy or idle. Degraded and failed feeds reduce signal fidelity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
