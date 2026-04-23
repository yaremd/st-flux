'use client'

import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, X, ArrowRight, SquaresFour } from '@phosphor-icons/react'
import ThemeToggle from '@/components/ThemeToggle'

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemeStatus = 'healthy' | 'warning' | 'critical'
type AlertSeverity = 'critical' | 'warning' | 'info'

interface Theme {
  id: string
  name: string
  score: number
  change: number
  status: ThemeStatus
  sparkline: number[]
  coverage: number
}

interface AlertItem {
  id: number
  time: string
  theme: string
  message: string
  severity: AlertSeverity
  ack: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const THEMES: Theme[] = [
  { id: 'ai-infra',      name: 'AI Infrastructure',      score: 94.1, change:  2.3, status: 'healthy', sparkline: [72,75,71,80,82,79,87,89,91,94], coverage: 97 },
  { id: 'clean-energy',  name: 'Clean Energy Transition', score: 87.2, change: -0.8, status: 'healthy', sparkline: [80,82,85,84,83,86,88,87,86,87], coverage: 93 },
  { id: 'deglobal',      name: 'Deglobalization',         score: 62.4, change: -4.1, status: 'warning', sparkline: [75,73,70,68,65,67,64,63,61,62], coverage: 74 },
  { id: 'space',         name: 'Space Economy',           score: 71.0, change:  1.2, status: 'warning', sparkline: [64,66,68,67,70,69,71,72,70,71], coverage: 88 },
  { id: 'longevity',     name: 'Longevity Tech',          score: 83.5, change:  0.5, status: 'healthy', sparkline: [76,78,79,80,81,82,81,83,83,84], coverage: 96 },
  { id: 'defense',       name: 'Defense & Autonomy',      score: 76.3, change:  1.8, status: 'healthy', sparkline: [68,70,72,73,74,75,74,76,75,76], coverage: 91 },
]

const RECENT_ALERTS: AlertItem[] = [
  { id: 1, time: '04:23', theme: 'AI Infrastructure', message: 'NVDA intraday correlation spike — z-score +2.41σ above 30d rolling threshold', severity: 'critical', ack: false },
  { id: 2, time: '04:11', theme: 'Deglobalization',   message: 'USTR trade feed offline 3h 17m — WTO and customs-CN also impacted',           severity: 'critical', ack: false },
  { id: 3, time: '03:57', theme: 'Clean Energy',      message: 'FERC filing data delayed 47min — pipeline job rescheduled 05:30 UTC',         severity: 'warning',  ack: false },
  { id: 4, time: '03:44', theme: 'Pipeline',          message: 'Coverage dropped from 95.4% to 91.3% following trade-tariff-feed-cn failure',  severity: 'warning',  ack: true  },
]

const BRIEF_ITEMS = [
  { severity: 'critical' as AlertSeverity, text: 'AI Infrastructure: NVDA intraday correlation spiked to +2.41σ during Asian session close. Factor weight review recommended before NY open.' },
  { severity: 'critical' as AlertSeverity, text: 'Deglobalization: 3 upstream feeds (USTR, WTO, customs-CN) offline since 22:14 UTC. Manual validation queued — 47 affected observations.' },
  { severity: 'warning'  as AlertSeverity, text: 'Clean Energy: FERC filing data delayed by 47 minutes. Pipeline job rescheduled for 05:30 UTC. No factor impact yet.' },
  { severity: 'info'     as AlertSeverity, text: 'Defense & Autonomy: 2 new patent filings ingested from USPTO at 03:31 UTC. No threshold breaches. Score stable at 76.3.' },
]

// ─── Design Tokens ────────────────────────────────────────────────────────────

const LINE_COLORS: Record<ThemeStatus, string> = {
  healthy: '#10b981',
  warning: '#f59e0b',
  critical: '#f43f5e',
}

const TEXT_COLORS: Record<ThemeStatus, string> = {
  healthy: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-rose-600 dark:text-rose-500',
}

const DOT_COLORS: Record<ThemeStatus, string> = {
  healthy: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  critical: 'bg-rose-600 dark:bg-rose-500',
}

const BORDER_COLORS: Record<ThemeStatus, string> = {
  healthy: 'border-zinc-200 dark:border-zinc-800',
  warning: 'border-amber-400/30 dark:border-amber-500/20',
  critical: 'border-rose-400/30 dark:border-rose-500/30',
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, status }: { data: number[]; status: ThemeStatus }) {
  const W = 72, H = 28
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * W).toFixed(1)},${(H - ((v - min) / range) * (H - 4) - 2).toFixed(1)}`)
    .join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0 overflow-visible">
      <polyline points={pts} fill="none" stroke={LINE_COLORS[status]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  )
}

// ─── Theme Card ───────────────────────────────────────────────────────────────

const ThemeCard = memo(function ThemeCard({ theme, index }: { theme: Theme; index: number }) {
  const coverageBg =
    theme.coverage >= 90 ? 'bg-emerald-500 dark:bg-emerald-400' :
    theme.coverage >= 80 ? 'bg-amber-500 dark:bg-amber-400' :
                           'bg-rose-600 dark:bg-rose-500'

  return (
    <Link href={`/themes?theme=${theme.id}`} className="block">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 + index * 0.055, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`cursor-pointer rounded-lg border ${BORDER_COLORS[theme.status]} bg-white p-4 transition-colors duration-150 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/70`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start gap-1.5">
            <span className={`mt-[3px] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${DOT_COLORS[theme.status]}`} />
            <p className="line-clamp-2 text-[11px] font-medium leading-tight text-zinc-500 dark:text-zinc-400">
              {theme.name}
            </p>
          </div>
          <p className={`font-mono text-[1.7rem] font-semibold leading-none tracking-tight ${TEXT_COLORS[theme.status]}`}>
            {theme.score.toFixed(1)}
          </p>
          <p className={`mt-1 flex items-center gap-0.5 font-mono text-[11px] ${theme.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {theme.change >= 0 ? <ArrowUpRight size={11} weight="bold" /> : <ArrowDownRight size={11} weight="bold" />}
            {Math.abs(theme.change).toFixed(1)}% today
          </p>
        </div>
        <Sparkline data={theme.sparkline} status={theme.status} />
      </div>

      <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] tracking-wide text-zinc-400 dark:text-zinc-600">Coverage</span>
          <span className={`font-mono text-[10px] font-medium ${TEXT_COLORS[theme.status]}`}>{theme.coverage}%</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <motion.div
            className={`h-full rounded-full ${coverageBg}`}
            initial={{ width: 0 }}
            animate={{ width: `${theme.coverage}%` }}
            transition={{ delay: 0.48 + index * 0.055, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </motion.div>
    </Link>
  )
})

// ─── Alert Row ────────────────────────────────────────────────────────────────

function AlertRow({ alert, index, onSelect, isSelected }: { alert: AlertItem; index: number; onSelect: () => void; isSelected: boolean }) {
  const s = {
    critical: { bar: 'bg-rose-500',  badge: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',   label: 'CRITICAL' },
    warning:  { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', label: 'WARNING'  },
    info:     { bar: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',    label: 'INFO'     },
  }[alert.severity]

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.55 + index * 0.065, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      className={`flex cursor-pointer items-stretch gap-4 rounded-lg border bg-white px-4 py-3 transition-colors duration-150 dark:bg-zinc-900 ${isSelected ? 'border-zinc-400 dark:border-zinc-600' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'} ${alert.ack ? 'opacity-40' : ''}`}
    >
      <div className={`w-0.5 flex-shrink-0 rounded-full ${s.bar}`} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${s.badge}`}>
            {s.label}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{alert.theme}</span>
          {alert.ack && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
              ACK
            </span>
          )}
        </div>
        <p className="text-sm leading-snug text-zinc-700 dark:text-zinc-300">{alert.message}</p>
      </div>
      <span className="flex-shrink-0 self-start pt-0.5 font-mono text-xs text-zinc-400 dark:text-zinc-600">{alert.time}</span>
    </motion.div>
  )
}

// ─── System Status Pill ───────────────────────────────────────────────────────

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

// ─── Live Clock ───────────────────────────────────────────────────────────────

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
    <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">
      {time ?? '——:——:—— UTC'}
    </span>
  )
}

// ─── Morning Brief ────────────────────────────────────────────────────────────

function MorningBrief() {
  const dotColor: Record<AlertSeverity, string> = {
    critical: 'bg-rose-500',
    warning:  'bg-amber-500 dark:bg-amber-400',
    info:     'bg-zinc-400 dark:bg-zinc-600',
  }
  const textColor: Record<AlertSeverity, string> = {
    critical: 'text-zinc-700 dark:text-zinc-300',
    warning:  'text-zinc-500 dark:text-zinc-400',
    info:     'text-zinc-400 dark:text-zinc-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">Morning brief</p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-400 dark:text-zinc-600">Thu 23 Apr 2026 · 04:51 UTC</p>
        </div>
        <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
          AI-generated
        </span>
      </div>

      <div className="flex-shrink-0 border-b border-zinc-200 bg-blue-50 px-5 py-3.5 dark:border-zinc-800 dark:bg-blue-500/5">
        <p className="mb-2 text-[10px] font-semibold tracking-wide text-blue-600 dark:text-blue-500">
          Action required before 09:00 ET
        </p>
        <ul className="space-y-1.5">
          {[
            'Review AI Infrastructure factor weights',
            'Confirm USTR / WTO feed reconnection',
            'Acknowledge 2 critical signal alerts',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-[5px] h-1 w-1 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-500" />
              <span className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
        {BRIEF_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
            className="flex items-start gap-2.5"
          >
            <span className={`mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColor[item.severity]}`} />
            <p className={`text-xs leading-relaxed ${textColor[item.severity]}`}>{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid flex-shrink-0 grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {[
          { label: 'Critical', value: '3',   color: 'text-rose-600 dark:text-rose-400'   },
          { label: 'Warnings', value: '7',   color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Jobs Run', value: '6/7', color: 'text-zinc-700 dark:text-zinc-300'   },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 py-3">
            <span className={`font-mono text-base font-semibold leading-none ${color}`}>{value}</span>
            <span className="text-[10px] tracking-wide text-zinc-400 dark:text-zinc-600">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── KPI Data ─────────────────────────────────────────────────────────────────

const KPI_ITEMS = [
  { label: 'Critical Alerts',    value: '3',      sub: '+2 overnight',       borderLeft: 'border-l-rose-500',    valueColor: 'text-rose-600 dark:text-rose-400'   },
  { label: 'Active Warnings',    value: '7',      sub: '−1 since 06:00',     borderLeft: 'border-l-amber-400',   valueColor: 'text-amber-600 dark:text-amber-400' },
  { label: 'Pipeline Coverage',  value: '91.3%',  sub: '40 / 44 feeds active', borderLeft: 'border-l-emerald-500', valueColor: 'text-zinc-900 dark:text-zinc-100'   },
  { label: 'Last Sync',          value: '04:47',  sub: 'UTC · 31m ago',      borderLeft: 'border-l-zinc-400 dark:border-l-zinc-700',   valueColor: 'text-zinc-700 dark:text-zinc-300'   },
]

// ─── Main Export ──────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<AlertSeverity, { bar: string; badge: string; label: string; bg: string }> = {
  critical: { bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400', label: 'CRITICAL', bg: 'bg-rose-50 dark:bg-rose-500/5' },
  warning:  { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400', label: 'WARNING', bg: 'bg-amber-50 dark:bg-amber-500/5' },
  info:     { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', label: 'INFO', bg: 'bg-blue-50 dark:bg-blue-500/5' },
}

export default function OverviewClient() {
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <SquaresFour size={15} weight="fill" className="text-zinc-400 dark:text-zinc-500" />
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Overview</h1>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">Thu 23 Apr 2026</span>
          <SystemStatusPill />
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <ThemeToggle />
        </div>
      </div>

      {/* Body: main scroll + alert detail panel */}
      <div className="flex min-h-0 flex-1">
        {/* Scrollable main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-6">
            {/* KPI strip */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {KPI_ITEMS.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.065, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={`rounded-lg border border-zinc-200 border-l-2 ${kpi.borderLeft} bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900`}
                >
                  <p className="text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
                  <p className={`mt-2 font-mono text-[2rem] font-semibold leading-none tracking-tight ${kpi.valueColor}`}>{kpi.value}</p>
                  <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-600">{kpi.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Content: Morning Brief + Theme Health */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_3fr]" style={{ minHeight: '440px' }}>
              <MorningBrief />

              <div className="flex flex-col gap-2.5">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.18, duration: 0.3 }}
                  className="flex items-center justify-between"
                >
                  <p className="text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                    Theme health
                  </p>
                  <p className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">
                    4 healthy · 2 warning · 0 critical
                  </p>
                </motion.div>

                <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {THEMES.map((theme, i) => (
                    <ThemeCard key={theme.id} theme={theme} index={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* Alert feed */}
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.25 }}
                className="flex items-center justify-between"
              >
                <p className="text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                  Recent alerts
                </p>
                <Link href="/alerts" className="font-mono text-[10px] text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400">
                  View all →
                </Link>
              </motion.div>

              <div className="space-y-2">
                {RECENT_ALERTS.map((alert, i) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    index={i}
                    isSelected={selectedAlert?.id === alert.id}
                    onSelect={() => setSelectedAlert(prev => prev?.id === alert.id ? null : alert)}
                  />
                ))}
              </div>
            </div>

            <div className="h-4" />
          </div>
        </div>

        {/* ── Alert detail side panel ── */}
        <div
          style={{ width: selectedAlert ? 360 : 0 }}
          className="flex-shrink-0 overflow-hidden border-l border-zinc-200 bg-white transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div style={{ width: 360 }}>
            <AnimatePresence mode="wait">
              {selectedAlert && (
                <motion.div
                  key={selectedAlert.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex h-full flex-col"
                >
                  {/* Panel header */}
                  <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                      Alert Detail
                    </span>
                    <button
                      onClick={() => setSelectedAlert(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>

                  {/* Severity strip */}
                  <div className={`flex-shrink-0 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 ${SEVERITY_COLORS[selectedAlert.severity].bg}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${SEVERITY_COLORS[selectedAlert.severity].badge}`}>
                        {SEVERITY_COLORS[selectedAlert.severity].label}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{selectedAlert.theme}</span>
                    </div>
                    <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600">{selectedAlert.time} UTC</p>
                  </div>

                  {/* Message body */}
                  <div className="flex-1 overflow-y-auto px-5 py-5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-2">
                      Message
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {selectedAlert.message}
                    </p>

                    {selectedAlert.ack && (
                      <div className="mt-4 flex items-center gap-1.5">
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600">
                          Acknowledged
                        </span>
                      </div>
                    )}

                    <div className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-3">
                        Related Theme
                      </p>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {selectedAlert.theme}
                      </p>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex flex-shrink-0 items-center justify-between border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
                    <Link
                      href="/alerts"
                      className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
                    >
                      View all alerts
                      <ArrowRight size={11} weight="bold" />
                    </Link>
                    {!selectedAlert.ack && (
                      <button className="rounded-md bg-zinc-900 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                        Acknowledge
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
