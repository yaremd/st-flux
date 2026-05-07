'use client'

import { useState, useMemo, memo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crosshair,
  MagnifyingGlass,
  X,
  CheckCircle,
  Lightning,
  ArrowCounterClockwise,
  CaretRight,
  TrendUp,
  TrendDown,
  Minus,
  Warning,
  Users,
} from '@phosphor-icons/react'
import StellarHeader from '@/components/StellarHeader'

// ─── Types ────────────────────────────────────────────────────────────────────

type SignalType = 'kill' | 'add' | 'at-risk' | 'clear'
type AckState = 'unread' | 'reviewed' | 'acted'
type FactorStatus = 'breached' | 'near' | 'ok'
type FilterKey = 'all' | 'kill' | 'add' | 'at-risk' | 'clear'

interface Analyst {
  id: string
  name: string
}

interface RiskFactor {
  label: string
  value: string
  threshold: string
  direction: 'up' | 'down' | 'flat'
  status: FactorStatus
}

interface LinkedAlert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  timestamp: string
}

interface Position {
  id: string
  analystId: string
  ticker: string
  name: string
  theme: string
  signal: SignalType
  ack: AckState
  marketValue: number
  weight: number
  pnl30d: number
  factors: RiskFactor[]
  linkedAlerts: LinkedAlert[]
  lastUpdated: string
}

// ─── Analyst roster ───────────────────────────────────────────────────────────

const ANALYSTS: Analyst[] = [
  { id: 'marco', name: 'Marco R.' },
  { id: 'sara', name: 'Sara K.' },
  { id: 'dev', name: 'Dev K.' },
]

// ─── Mock data ────────────────────────────────────────────────────────────────

const NOW = Date.now()

const MOCK_POSITIONS: Position[] = [
  // ── Marco R. ────────────────────────────────────────────────────────────────
  {
    id: 'p1',
    analystId: 'marco',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    theme: 'AI Infrastructure',
    signal: 'kill',
    ack: 'unread',
    marketValue: 4_280_000,
    weight: 22.3,
    pnl30d: -3.2,
    factors: [
      { label: 'Capex guidance deviation', value: '+2.31σ', threshold: '±2.0σ', direction: 'up', status: 'breached' },
      { label: 'Revenue guidance revision', value: '-8.2%', threshold: '<-5%', direction: 'down', status: 'breached' },
      { label: 'Hyperscaler demand delta', value: '-0.18', threshold: '<-0.10', direction: 'down', status: 'breached' },
    ],
    linkedAlerts: [
      { id: 'a1', severity: 'critical', title: 'AI Infrastructure capex divergence', timestamp: new Date(NOW - 14 * 60000).toISOString() },
    ],
    lastUpdated: new Date(NOW - 14 * 60000).toISOString(),
  },
  {
    id: 'p2',
    analystId: 'marco',
    ticker: 'LMT',
    name: 'Lockheed Martin',
    theme: 'Defense & Autonomy',
    signal: 'kill',
    ack: 'unread',
    marketValue: 1_890_000,
    weight: 9.8,
    pnl30d: -5.7,
    factors: [
      { label: 'Supply chain concentration', value: '0.91', threshold: '<0.85', direction: 'up', status: 'breached' },
      { label: 'Geo-risk delta', value: '+0.34', threshold: '<+0.25', direction: 'up', status: 'breached' },
      { label: 'Replacement lead time', value: '14 mo', threshold: '<12 mo', direction: 'flat', status: 'breached' },
    ],
    linkedAlerts: [
      { id: 'a2', severity: 'critical', title: 'Defense supply chain concentration risk', timestamp: new Date(NOW - 38 * 60000).toISOString() },
    ],
    lastUpdated: new Date(NOW - 38 * 60000).toISOString(),
  },
  {
    id: 'p5',
    analystId: 'marco',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    theme: 'AI Infrastructure',
    signal: 'at-risk',
    ack: 'unread',
    marketValue: 2_710_000,
    weight: 14.1,
    pnl30d: 1.8,
    factors: [
      { label: 'Valuation premium vs sector', value: '+1.8σ', threshold: '±2.0σ', direction: 'up', status: 'near' },
      { label: 'Azure rev growth decel.', value: '-2.1pp', threshold: '<-3.0pp', direction: 'down', status: 'near' },
    ],
    linkedAlerts: [
      { id: 'a1', severity: 'critical', title: 'AI Infrastructure capex divergence', timestamp: new Date(NOW - 14 * 60000).toISOString() },
    ],
    lastUpdated: new Date(NOW - 25 * 60000).toISOString(),
  },
  {
    id: 'p6',
    analystId: 'marco',
    ticker: 'RTX',
    name: 'RTX Corporation',
    theme: 'Defense & Autonomy',
    signal: 'at-risk',
    ack: 'unread',
    marketValue: 1_240_000,
    weight: 6.4,
    pnl30d: -1.2,
    factors: [
      { label: 'Supply disruption index', value: '0.79', threshold: '<0.85', direction: 'up', status: 'near' },
      { label: 'Backlog conversion ratio', value: '0.68', threshold: '>0.65', direction: 'down', status: 'ok' },
    ],
    linkedAlerts: [
      { id: 'a2', severity: 'critical', title: 'Defense supply chain concentration risk', timestamp: new Date(NOW - 38 * 60000).toISOString() },
    ],
    lastUpdated: new Date(NOW - 45 * 60000).toISOString(),
  },
  {
    id: 'p9',
    analystId: 'marco',
    ticker: 'META',
    name: 'Meta Platforms',
    theme: 'AI Infrastructure',
    signal: 'clear',
    ack: 'acted',
    marketValue: 2_250_000,
    weight: 11.7,
    pnl30d: 8.1,
    factors: [
      { label: 'Ad revenue growth', value: '+22%', threshold: '>+15%', direction: 'up', status: 'ok' },
      { label: 'AI monetization delta', value: '+1.2σ', threshold: 'n/a', direction: 'up', status: 'ok' },
    ],
    linkedAlerts: [],
    lastUpdated: new Date(NOW - 8 * 3600000).toISOString(),
  },
  {
    id: 'p10',
    analystId: 'marco',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    theme: 'AI Infrastructure',
    signal: 'clear',
    ack: 'reviewed',
    marketValue: 1_710_000,
    weight: 8.9,
    pnl30d: 3.4,
    factors: [
      { label: 'Search market share', value: '90.2%', threshold: '>85%', direction: 'flat', status: 'ok' },
      { label: 'Cloud revenue growth', value: '+28%', threshold: '>+20%', direction: 'up', status: 'ok' },
    ],
    linkedAlerts: [],
    lastUpdated: new Date(NOW - 12 * 3600000).toISOString(),
  },
  // ── Sara K. ─────────────────────────────────────────────────────────────────
  {
    id: 'p3',
    analystId: 'sara',
    ticker: 'LLY',
    name: 'Eli Lilly & Co.',
    theme: 'Longevity Tech',
    signal: 'add',
    ack: 'unread',
    marketValue: 2_150_000,
    weight: 11.2,
    pnl30d: 8.4,
    factors: [
      { label: 'FDA approval velocity', value: '+3.1σ', threshold: '>+2.5σ', direction: 'up', status: 'breached' },
      { label: 'GLP-1 market share gain', value: '+4.2pp', threshold: '>+3.0pp', direction: 'up', status: 'breached' },
      { label: 'Pipeline depth score', value: '0.92', threshold: 'n/a', direction: 'up', status: 'ok' },
    ],
    linkedAlerts: [
      { id: 'a5', severity: 'info', title: 'Longevity Tech FDA Breakthrough', timestamp: new Date(NOW - 4 * 3600000).toISOString() },
    ],
    lastUpdated: new Date(NOW - 55 * 60000).toISOString(),
  },
  {
    id: 'p4',
    analystId: 'sara',
    ticker: 'NEE',
    name: 'NextEra Energy',
    theme: 'Clean Energy',
    signal: 'add',
    ack: 'reviewed',
    marketValue: 980_000,
    weight: 5.1,
    pnl30d: 6.1,
    factors: [
      { label: 'Permitting acceleration', value: '+41% MoM', threshold: '>+30% MoM', direction: 'up', status: 'breached' },
      { label: 'Grid interconnect queue', value: '-18%', threshold: '>-15%', direction: 'down', status: 'near' },
      { label: 'ITC utilization rate', value: '94%', threshold: '>90%', direction: 'flat', status: 'ok' },
    ],
    linkedAlerts: [],
    lastUpdated: new Date(NOW - 1.5 * 3600000).toISOString(),
  },
  {
    id: 'p7',
    analystId: 'sara',
    ticker: 'SPCE',
    name: 'Virgin Galactic Holdings',
    theme: 'Space Economy',
    signal: 'at-risk',
    ack: 'reviewed',
    marketValue: 620_000,
    weight: 3.2,
    pnl30d: -4.1,
    factors: [
      { label: 'Launch manifest slippage', value: '+2 wks', threshold: '>+4 wks', direction: 'flat', status: 'near' },
      { label: 'Funding runway', value: '9 mo', threshold: '<12 mo', direction: 'down', status: 'near' },
    ],
    linkedAlerts: [
      { id: 'a4', severity: 'warning', title: 'Space Economy launch manifest slippage', timestamp: new Date(NOW - 3 * 3600000).toISOString() },
    ],
    lastUpdated: new Date(NOW - 3 * 3600000).toISOString(),
  },
  {
    id: 'p11',
    analystId: 'sara',
    ticker: 'NOC',
    name: 'Northrop Grumman',
    theme: 'Defense & Autonomy',
    signal: 'clear',
    ack: 'reviewed',
    marketValue: 1_050_000,
    weight: 5.5,
    pnl30d: 4.2,
    factors: [
      { label: 'Backlog growth', value: '+12%', threshold: '>+8%', direction: 'up', status: 'ok' },
      { label: 'EBIT margin', value: '15.1%', threshold: '>13%', direction: 'flat', status: 'ok' },
    ],
    linkedAlerts: [],
    lastUpdated: new Date(NOW - 18 * 3600000).toISOString(),
  },
  // ── Dev K. ──────────────────────────────────────────────────────────────────
  {
    id: 'p8',
    analystId: 'dev',
    ticker: 'MRNA',
    name: 'Moderna Inc.',
    theme: 'Longevity Tech',
    signal: 'at-risk',
    ack: 'unread',
    marketValue: 890_000,
    weight: 4.6,
    pnl30d: 2.3,
    factors: [
      { label: 'Pipeline attrition rate', value: '0.31', threshold: '<0.35', direction: 'up', status: 'near' },
      { label: 'Competitive pressure score', value: '0.62', threshold: '<0.70', direction: 'up', status: 'near' },
    ],
    linkedAlerts: [],
    lastUpdated: new Date(NOW - 5 * 3600000).toISOString(),
  },
  {
    id: 'p12',
    analystId: 'dev',
    ticker: 'CAT',
    name: 'Caterpillar Inc.',
    theme: 'Deglobalization',
    signal: 'clear',
    ack: 'acted',
    marketValue: 1_320_000,
    weight: 6.9,
    pnl30d: 5.6,
    factors: [
      { label: 'Nearshoring capex index', value: '+0.18', threshold: '>+0.10', direction: 'up', status: 'ok' },
      { label: 'Order backlog growth', value: '+9%', threshold: '>+5%', direction: 'up', status: 'ok' },
    ],
    linkedAlerts: [],
    lastUpdated: new Date(NOW - 24 * 3600000).toISOString(),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000
  if (diff < 1) return 'just now'
  if (diff < 60) return `${Math.floor(diff)}m ago`
  const h = Math.floor(diff / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatValue(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

// ─── Style constants ──────────────────────────────────────────────────────────

const SIG: Record<SignalType, { label: string; badge: string; dot: string; bar: string; border: string; groupBg: string; groupText: string }> = {
  kill: {
    label: 'KILL',
    badge: 'bg-rose-500/20 text-rose-400',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    border: 'border-rose-500/40',
    groupBg: 'bg-rose-500/10',
    groupText: 'text-rose-400',
  },
  add: {
    label: 'ADD',
    badge: 'bg-emerald-500/20 text-emerald-400',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    border: 'border-emerald-500/40',
    groupBg: 'bg-emerald-500/10',
    groupText: 'text-emerald-400',
  },
  'at-risk': {
    label: 'AT RISK',
    badge: 'bg-amber-500/20 text-amber-400',
    dot: 'bg-amber-500',
    bar: 'bg-amber-400',
    border: 'border-amber-500/40',
    groupBg: 'bg-amber-500/10',
    groupText: 'text-amber-400',
  },
  clear: {
    label: 'CLEAR',
    badge: 'bg-zinc-500/15 text-white/40',
    dot: 'bg-white/30',
    bar: 'bg-white/20',
    border: 'border-transparent',
    groupBg: 'bg-white/[0.03]',
    groupText: 'text-white/40',
  },
}

const ACK_DOT: Record<AckState, string> = {
  unread: 'bg-white/80',
  reviewed: 'bg-white/30',
  acted: 'bg-emerald-500',
}

const SEV_DOT: Record<'critical' | 'warning' | 'info', string> = {
  critical: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const SIGNAL_ORDER: SignalType[] = ['kill', 'add', 'at-risk', 'clear']

const STAT_TILES: Array<{ key: FilterKey; label: string; numCls: string; accentCls: string }> = [
  { key: 'all',     label: 'All',     numCls: 'text-[#f7f7f7]',    accentCls: 'bg-white/40' },
  { key: 'kill',    label: 'Kill',    numCls: 'text-rose-400',      accentCls: 'bg-rose-500' },
  { key: 'add',     label: 'Add',     numCls: 'text-emerald-400',   accentCls: 'bg-emerald-500' },
  { key: 'at-risk', label: 'At Risk', numCls: 'text-amber-400',     accentCls: 'bg-amber-500' },
  { key: 'clear',   label: 'Clear',   numCls: 'text-white/40',      accentCls: 'bg-white/30' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

const SignalBadge = memo(function SignalBadge({ signal }: { signal: SignalType }) {
  const s = SIG[signal]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
})

const FactorStatusBadge = memo(function FactorStatusBadge({ status }: { status: FactorStatus }) {
  const cls = {
    breached: 'bg-rose-500/10 text-rose-400',
    near: 'bg-amber-500/10 text-amber-400',
    ok: 'bg-white/[0.06] text-white/40',
  }[status]
  return (
    <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase ${cls}`}>
      {status}
    </span>
  )
})

const FactorBar = memo(function FactorBar({ status, signal }: { status: FactorStatus; signal: SignalType }) {
  const width = status === 'breached' ? '100%' : status === 'near' ? '65%' : '25%'
  const color =
    status === 'breached'
      ? SIG[signal].bar
      : status === 'near'
      ? 'bg-amber-400'
      : 'bg-white/20'
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width }} />
    </div>
  )
})

const DirectionIcon = memo(function DirectionIcon({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'up') return <TrendUp size={11} className="text-rose-500" />
  if (direction === 'down') return <TrendDown size={11} className="text-emerald-500" />
  return <Minus size={11} className="text-white/40" />
})

function SignalGroupHeader({ signal, count }: { signal: SignalType; count: number }) {
  const s = SIG[signal]
  return (
    <div className={`sticky top-0 z-10 flex items-center gap-2 border-b border-white/[0.07] px-4 py-1.5 ${s.groupBg}`}>
      <span className={`font-mono text-[10px] font-semibold uppercase tracking-widest ${s.groupText}`}>
        {s.label}
      </span>
      <span className={`font-mono text-[10px] opacity-60 ${s.groupText}`}>{count}</span>
    </div>
  )
}

interface CrossPositionWarning {
  alertId: string
  alertTitle: string
  tickers: string[]
}

function CrossPositionWarnings({ warnings }: { warnings: CrossPositionWarning[] }) {
  if (warnings.length === 0) return null
  return (
    <div className="flex-shrink-0 divide-y divide-amber-500/10 border-b border-amber-500/20 bg-amber-500/[0.06]">
      {warnings.map((w) => (
        <div key={w.alertId} className="flex items-center gap-2.5 px-4 py-2">
          <Warning size={11} weight="fill" className="flex-shrink-0 text-amber-500" />
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex gap-1">
              {w.tickers.map((t) => (
                <span key={t} className="font-mono text-[10px] font-semibold text-amber-400">
                  {t}
                </span>
              ))}
            </span>
            <span className="text-[10px] text-amber-400/60 truncate">
              share {w.alertTitle.toLowerCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const PositionRow = memo(function PositionRow({
  position,
  isSelected,
  onSelect,
}: {
  position: Position
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  const topFactors = position.factors.filter((f) => f.status !== 'ok').slice(0, 2)
  const pnlPositive = position.pnl30d >= 0

  return (
    <button
      onClick={() => onSelect(position.id)}
      className={[
        'w-full text-left border-l-2 px-4 py-3.5 transition-colors duration-150 border-b border-white/[0.05]',
        isSelected
          ? `${SIG[position.signal].border} bg-white/[0.05]`
          : 'border-transparent hover:bg-white/[0.03]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5 flex-shrink-0">
          <span className={`block h-2 w-2 rounded-full ${ACK_DOT[position.ack]}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <SignalBadge signal={position.signal} />
            <span className="font-mono text-[10px] text-white/40">
              {position.theme}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-bold text-[#f7f7f7]">
              {position.ticker}
            </span>
            <span className="text-xs text-white/50 truncate">
              {position.name}
            </span>
          </div>
          {topFactors.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {topFactors.map((f) => (
                <span
                  key={f.label}
                  className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[9px] font-medium ${
                    f.status === 'breached'
                      ? position.signal === 'add'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {f.label}
                </span>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-mono text-[11px] font-semibold text-[#cecfd2]">
              {formatValue(position.marketValue)}
            </span>
            <span className={`font-mono text-[11px] font-semibold ${pnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pnlPositive ? '+' : ''}{position.pnl30d.toFixed(1)}%
            </span>
            <span suppressHydrationWarning className="font-mono text-[10px] text-white/40">
              {relativeTime(position.lastUpdated)}
            </span>
          </div>
        </div>
        <CaretRight
          size={14}
          className={`mt-0.5 flex-shrink-0 transition-colors ${isSelected ? 'text-[#cecfd2]' : 'text-white/20'}`}
        />
      </div>
    </button>
  )
})

const DetailPanel = memo(function DetailPanel({
  position,
  onAck,
  onClose,
}: {
  position: Position | null
  onAck: (id: string, state: AckState) => void
  onClose: () => void
}) {
  if (!position) return null

  const pnlPositive = position.pnl30d >= 0

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={position.id}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-full min-w-0 flex-col"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <SignalBadge signal={position.signal} />
              <span className="font-mono text-[10px] text-white/40">
                {position.theme}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="font-mono text-base font-bold text-[#f7f7f7]">
                {position.ticker}
              </h2>
              <span className="text-sm text-white/50 truncate">
                {position.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/60"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Position metrics */}
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.07]">
            <div className="bg-[rgb(21,18,37)] px-3 py-2.5">
              <p className="text-[10px] text-white/40 mb-0.5">Market value</p>
              <p className="font-mono text-sm font-semibold text-[#f7f7f7]">
                {formatValue(position.marketValue)}
              </p>
            </div>
            <div className="bg-[rgb(21,18,37)] px-3 py-2.5">
              <p className="text-[10px] text-white/40 mb-0.5">Weight</p>
              <p className="font-mono text-sm font-semibold text-[#f7f7f7]">
                {position.weight.toFixed(1)}%
              </p>
            </div>
            <div className="bg-[rgb(21,18,37)] px-3 py-2.5">
              <p className="text-[10px] text-white/40 mb-0.5">30d P&L</p>
              <p className={`font-mono text-sm font-semibold ${pnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pnlPositive ? '+' : ''}{position.pnl30d.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Risk factors */}
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-white/40">
              Risk factors
            </p>
            <div className="space-y-4">
              {position.factors.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 mb-0.5">{f.label}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-semibold text-[#f7f7f7]">
                          {f.value}
                        </span>
                        <DirectionIcon direction={f.direction} />
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <FactorStatusBadge status={f.status} />
                      <p className="font-mono text-[9px] text-white/30">
                        threshold {f.threshold}
                      </p>
                    </div>
                  </div>
                  <FactorBar status={f.status} signal={position.signal} />
                </div>
              ))}
            </div>
          </div>

          {/* Linked alerts */}
          {position.linkedAlerts.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40">
                Linked alerts
              </p>
              <div className="space-y-1.5">
                {position.linkedAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-2 rounded-md border border-white/[0.07] bg-white/[0.04] px-3 py-2.5"
                  >
                    <span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${SEV_DOT[a.severity]}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug text-[#cecfd2]">
                        {a.title}
                      </p>
                      <p suppressHydrationWarning className="mt-0.5 font-mono text-[10px] text-white/40">
                        {relativeTime(a.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-white/[0.07] px-5 py-3">
          {position.ack === 'unread' && (
            <button
              onClick={() => onAck(position.id, 'reviewed')}
              className="flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-2 text-xs font-medium text-[#f7f7f7] transition-colors hover:bg-white/20 active:scale-[0.98]"
            >
              <CheckCircle size={13} />
              Mark Reviewed
            </button>
          )}
          {position.ack === 'reviewed' && (
            <>
              <button
                onClick={() => onAck(position.id, 'acted')}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Lightning size={13} />
                Mark Acted
              </button>
              <button
                onClick={() => onAck(position.id, 'unread')}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.06]"
              >
                <ArrowCounterClockwise size={13} />
                Undo
              </button>
            </>
          )}
          {position.ack === 'acted' && (
            <button
              onClick={() => onAck(position.id, 'reviewed')}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white/40 transition-colors hover:bg-white/[0.06]"
            >
              <ArrowCounterClockwise size={13} />
              Undo
            </button>
          )}
          <div className="flex-1" />
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide ${
              position.ack === 'acted'
                ? 'bg-emerald-500/10 text-emerald-400'
                : position.ack === 'reviewed'
                ? 'bg-white/[0.06] text-white/40'
                : 'bg-white/[0.06] text-white/50'
            }`}
          >
            {position.ack}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

// ─── Stat filter strip ────────────────────────────────────────────────────────

function StatFilter({
  active,
  counts,
  onChange,
}: {
  active: FilterKey
  counts: Record<FilterKey, number>
  onChange: (k: FilterKey) => void
}) {
  return (
    <div className="flex flex-shrink-0 divide-x divide-white/[0.07] border-b border-white/[0.07]">
      {STAT_TILES.map(({ key, label, numCls, accentCls }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={[
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-100',
              isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]',
            ].join(' ')}
          >
            {isActive && (
              <motion.div
                layoutId="pos-stat-indicator"
                className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full ${accentCls}`}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`font-mono text-base font-bold tabular-nums leading-none ${isActive ? numCls : 'text-white/40'}`}>
              {counts[key]}
            </span>
            <span className={`text-[10px] tracking-wide ${isActive ? 'text-white/50' : 'text-white/30'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PositionsClient() {
  const [positions, setPositions] = useState<Position[]>(MOCK_POSITIONS)
  const [analystId, setAnalystId] = useState<string>('marco')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const panelOpen = selectedId !== null

  useEffect(() => {
    setSelectedId(null)
    setFilter('all')
  }, [analystId])

  const analystPositions = useMemo(
    () => positions.filter((p) => p.analystId === analystId),
    [positions, analystId]
  )

  const selectedPosition = useMemo(
    () => analystPositions.find((p) => p.id === selectedId) ?? null,
    [analystPositions, selectedId]
  )

  const counts = useMemo(
    (): Record<FilterKey, number> => ({
      all: analystPositions.length,
      kill: analystPositions.filter((p) => p.signal === 'kill').length,
      add: analystPositions.filter((p) => p.signal === 'add').length,
      'at-risk': analystPositions.filter((p) => p.signal === 'at-risk').length,
      clear: analystPositions.filter((p) => p.signal === 'clear').length,
    }),
    [analystPositions]
  )

  const crossPositionWarnings = useMemo((): CrossPositionWarning[] => {
    const map = new Map<string, { alertTitle: string; tickers: string[] }>()
    for (const p of analystPositions) {
      for (const a of p.linkedAlerts) {
        if (!map.has(a.id)) map.set(a.id, { alertTitle: a.title, tickers: [] })
        map.get(a.id)!.tickers.push(p.ticker)
      }
    }
    return [...map.entries()]
      .filter(([, v]) => v.tickers.length >= 2)
      .map(([id, v]) => ({ alertId: id, alertTitle: v.alertTitle, tickers: v.tickers }))
  }, [analystPositions])

  const filtered = useMemo(() => {
    let list = analystPositions
    if (filter !== 'all') list = list.filter((p) => p.signal === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.ticker.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.theme.toLowerCase().includes(q) ||
          p.factors.some((f) => f.label.toLowerCase().includes(q))
      )
    }
    return list
  }, [analystPositions, filter, search])

  const grouped = useMemo(() => {
    const map = new Map<SignalType, Position[]>()
    for (const sig of SIGNAL_ORDER) map.set(sig, [])
    for (const p of filtered) map.get(p.signal)!.push(p)
    return map
  }, [filtered])

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleAck = useCallback((id: string, state: AckState) => {
    setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, ack: state } : p)))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{
        background: "linear-gradient(144deg, rgb(21,18,37) 15%, rgb(5,5,30) 82%)",
      }}
    >
      {/* Radial glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 45% 80%, rgba(30,58,200,0.32) 0%, transparent 68%)",
        }}
      />

      <StellarHeader />

      {/* Stat filter */}
      <div className="relative z-10">
        <StatFilter active={filter} counts={counts} onChange={setFilter} />
      </div>

      {/* Cross-position warnings */}
      <div className="relative z-10">
        <CrossPositionWarnings warnings={crossPositionWarnings} />
      </div>

      {/* Search */}
      <div className="relative z-10 flex-shrink-0 border-b border-white/[0.07] px-4 py-2.5">
        <div className="relative">
          <MagnifyingGlass
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticker, theme, or factor…"
            className="w-full rounded-md border border-white/[0.07] bg-white/[0.06] py-2 pl-8 pr-8 text-xs text-[#f7f7f7] placeholder:text-white/30 outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {/* Position list */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {SIGNAL_ORDER.map((sig) => {
              const group = grouped.get(sig) ?? []
              if (group.length === 0) return null
              return (
                <div key={sig}>
                  <SignalGroupHeader signal={sig} count={group.length} />
                  {group.map((p) => (
                    <PositionRow
                      key={p.id}
                      position={p}
                      isSelected={selectedId === p.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-white/40">
                <Warning size={24} />
                <p className="text-sm">No positions match</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div
          className="flex-shrink-0 overflow-hidden border-l border-white/[0.07] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: panelOpen ? 420 : 0 }}
        >
          <div className="flex h-full w-[420px] flex-col">
            <DetailPanel position={selectedPosition} onAck={handleAck} onClose={handleClose} />
          </div>
        </div>
      </div>
    </div>
  )
}
