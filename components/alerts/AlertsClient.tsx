'use client'

import { useState, useMemo, memo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  MagnifyingGlass,
  X,
  CheckCircle,
  Lightning,
  ArrowCounterClockwise,
  CaretRight,
  Clock,
  TrendUp,
  TrendDown,
  Minus,
  Warning,
  ChartLineUp,
  ArrowsLeftRight,
} from '@phosphor-icons/react'
import ThemeToggle from '@/components/ThemeToggle'

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'info'
type AckState = 'unread' | 'acknowledged' | 'acted'
type AlertCategory = 'action' | 'monitor' | 'background'
type AlertType = 'standard' | 'position-risk' | 'bottleneck' | 'methodology'
type FilterKey = 'all' | 'action' | 'monitor' | 'background'

interface Factor {
  label: string
  value: string
  direction: 'up' | 'down' | 'flat'
}

interface TimelineEvent {
  time: string
  event: string
}

interface Alert {
  id: string
  severity: Severity
  ack: AckState
  category: AlertCategory
  alertType: AlertType
  title: string
  summary: string
  context: string
  timestamp: string
  dateGroup: 'Today' | 'Yesterday'
  theme: string
  factors: Factor[]
  securities: string[]
  timeline: TimelineEvent[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const NOW = Date.now()

const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    severity: 'critical',
    ack: 'unread',
    category: 'action',
    alertType: 'position-risk',
    title: 'AI Infrastructure capex divergence',
    summary: 'NVDA forward capex guidance widened 2.3σ above consensus in after-hours update.',
    context:
      'Three hyperscaler earnings calls in the past 72h referenced unexpected GPU allocation shortfalls, suggesting supply-demand imbalance is accelerating faster than the theme model anticipated. The divergence has crossed the 2.0σ threshold that historically precedes position review.',
    timestamp: new Date(NOW - 14 * 60000).toISOString(),
    dateGroup: 'Today',
    theme: 'AI Infrastructure',
    factors: [
      { label: 'Sigma vs consensus', value: '+2.31σ', direction: 'up' },
      { label: 'Capex revision', value: '+18.4%', direction: 'up' },
      { label: 'Theme exposure', value: '34.2%', direction: 'flat' },
      { label: 'Signal strength', value: '0.87', direction: 'up' },
    ],
    securities: ['NVDA', 'MSFT', 'META', 'GOOGL'],
    timeline: [
      { time: '06:14', event: 'NVDA guidance filed with SEC' },
      { time: '06:31', event: 'Signal threshold breached (2.0σ)' },
      { time: '06:47', event: 'Alert generated — analyst review required' },
    ],
  },
  {
    id: 'a2',
    severity: 'critical',
    ack: 'unread',
    category: 'action',
    alertType: 'position-risk',
    title: 'Defense supply chain concentration risk',
    summary: 'Single-supplier dependency flagged across 4 theme holdings; geopolitical risk elevated.',
    context:
      'Recent filings reveal RTX, LMT, NOC, and HII share a common Tier-2 supplier for rare-earth magnet inputs. The supplier operates exclusively from facilities in a jurisdiction currently subject to new export-control discussions at the G7 level. Concentration risk score has exceeded portfolio limits.',
    timestamp: new Date(NOW - 38 * 60000).toISOString(),
    dateGroup: 'Today',
    theme: 'Defense & Autonomy',
    factors: [
      { label: 'Concentration score', value: '0.91', direction: 'up' },
      { label: 'Holdings at risk', value: '4 / 11', direction: 'up' },
      { label: 'Geo-risk delta', value: '+0.34', direction: 'up' },
      { label: 'Replacement lead time', value: '14 mo', direction: 'flat' },
    ],
    securities: ['RTX', 'LMT', 'NOC', 'HII'],
    timeline: [
      { time: '04:02', event: 'Supplier cross-reference scan completed' },
      { time: '04:18', event: 'Concentration threshold exceeded (0.85)' },
      { time: '04:55', event: 'G7 draft language flagged by NLP pipeline' },
    ],
  },
  {
    id: 'a3',
    severity: 'warning',
    ack: 'acknowledged',
    category: 'monitor',
    alertType: 'standard',
    title: 'Clean Energy permitting velocity slowdown',
    summary: 'Federal permitting approvals down 31% MoM; utility-scale solar pipeline at risk.',
    context:
      'Administrative data from the Bureau of Land Management shows a 31% month-over-month decline in utility-scale solar and wind permits. Affected theme holdings with near-term project starts may face timeline slippage of 2–4 quarters, impacting revenue recognition.',
    timestamp: new Date(NOW - 2.1 * 3600000).toISOString(),
    dateGroup: 'Today',
    theme: 'Clean Energy',
    factors: [
      { label: 'Permit decline MoM', value: '-31.4%', direction: 'down' },
      { label: 'Projects at risk', value: '7', direction: 'up' },
      { label: 'Revenue slip est.', value: '$2.1B', direction: 'down' },
      { label: 'Model lag (quarters)', value: '2–4', direction: 'flat' },
    ],
    securities: ['NEE', 'ENPH', 'FSLR', 'RUN'],
    timeline: [
      { time: '01:30', event: 'BLM data ingested monthly batch' },
      { time: '01:47', event: 'Anomaly detected — velocity -2.1σ' },
      { time: '02:09', event: 'Alert routed to analyst queue' },
    ],
  },
  {
    id: 'a4',
    severity: 'warning',
    ack: 'unread',
    category: 'monitor',
    alertType: 'standard',
    title: 'Space Economy launch manifest slippage',
    summary: 'Starship Block 4 manifest pushed 6 weeks; downstream payload operators at risk.',
    context:
      'Updated launch manifest data shows Starship Block 4 schedule moved right by 6 weeks, impacting at least three payload operators in the portfolio. This delays satellite constellation deployment and associated revenue recognition for RKLB and ASTS.',
    timestamp: new Date(NOW - 3.4 * 3600000).toISOString(),
    dateGroup: 'Today',
    theme: 'Space Economy',
    factors: [
      { label: 'Schedule slip', value: '+6 weeks', direction: 'up' },
      { label: 'Payloads affected', value: '3', direction: 'up' },
      { label: 'Rev recognition risk', value: '$340M', direction: 'down' },
      { label: 'Alternate manifest', value: 'None', direction: 'flat' },
    ],
    securities: ['RKLB', 'ASTS', 'MNTS'],
    timeline: [
      { time: 'Yesterday 22:10', event: 'Manifest update published' },
      { time: 'Yesterday 22:41', event: 'NLP diff detected 6-week shift' },
      { time: '00:15', event: 'Alert generated after dependency mapping' },
    ],
  },
  {
    id: 'a5',
    severity: 'info',
    ack: 'acted',
    category: 'background',
    alertType: 'standard',
    title: 'Longevity Tech — FDA Breakthrough Therapy granted',
    summary: 'VRNA granted Breakthrough Therapy designation; thesis acceleration signal.',
    context:
      "The FDA granted Breakthrough Therapy Designation to VRNA's lead longevity compound, enabling accelerated review pathways. This is an early-stage positive signal that aligns with the theme thesis and may support a position size increase after the next quarterly review.",
    timestamp: new Date(NOW - 4.7 * 3600000).toISOString(),
    dateGroup: 'Today',
    theme: 'Longevity Tech',
    factors: [
      { label: 'Review timeline', value: '-18 mo', direction: 'down' },
      { label: 'Approval probability', value: '+12%', direction: 'up' },
      { label: 'Peers flagged', value: '2', direction: 'flat' },
      { label: 'Position headroom', value: '+1.8%', direction: 'up' },
    ],
    securities: ['VRNA', 'RXRX'],
    timeline: [
      { time: '08:30', event: 'FDA press release published' },
      { time: '08:44', event: 'NLP classifier: positive catalyst' },
      { time: '09:01', event: 'Analyst marked as Acted — watch list updated' },
    ],
  },
  {
    id: 'a6',
    severity: 'info',
    ack: 'unread',
    category: 'background',
    alertType: 'standard',
    title: 'Deglobalization: nearshoring capex uptick',
    summary: 'Mexican industrial real estate absorption hit 7-year high in Q1 data release.',
    context:
      'CBRE Q1 2026 industrial report shows Monterrey and Juárez absorbed 4.7M sqft of industrial space, highest quarterly figure since 2019. This reinforces the nearshoring leg of the Deglobalization theme and may warrant increasing exposure to industrial REIT names.',
    timestamp: new Date(NOW - 5.9 * 3600000).toISOString(),
    dateGroup: 'Today',
    theme: 'Deglobalization',
    factors: [
      { label: 'Absorption vs prior Q', value: '+41%', direction: 'up' },
      { label: '7yr ranking', value: 'Highest', direction: 'up' },
      { label: 'Theme conviction delta', value: '+0.12', direction: 'up' },
      { label: 'Names to review', value: '3', direction: 'flat' },
    ],
    securities: ['VESTA', 'FIBRAMQ', 'PLD'],
    timeline: [
      { time: '11:00', event: 'CBRE Q1 2026 report published' },
      { time: '11:22', event: 'Ingested — key metrics extracted' },
      { time: '11:38', event: 'Thesis reinforcement signal generated' },
    ],
  },
  {
    id: 'a7',
    severity: 'warning',
    ack: 'acknowledged',
    category: 'monitor',
    alertType: 'standard',
    title: 'AI Infrastructure cooling cost revision',
    summary: 'Data center cooling OpEx revised +23% across 3 hyperscalers; margin compression ahead.',
    context:
      'Updated 10-Q filings show cooling and power infrastructure costs revised materially upward across MSFT, AMZN, and GOOGL. While not a thesis-level break, the margin compression could reduce free cash flow available for further GPU capex and slow cluster build-out.',
    timestamp: new Date(NOW - 7.2 * 3600000).toISOString(),
    dateGroup: 'Today',
    theme: 'AI Infrastructure',
    factors: [
      { label: 'OpEx revision', value: '+23.1%', direction: 'up' },
      { label: 'FCF impact est.', value: '-$8.4B', direction: 'down' },
      { label: 'Margin compression', value: '-1.7pp', direction: 'down' },
      { label: 'Thesis break risk', value: 'Low', direction: 'flat' },
    ],
    securities: ['MSFT', 'AMZN', 'GOOGL'],
    timeline: [
      { time: 'Yesterday 18:00', event: '10-Q filings ingested' },
      { time: 'Yesterday 18:31', event: 'Cost line extraction flagged +2σ' },
      { time: '00:47', event: 'Warning generated — margin review queued' },
    ],
  },
  {
    id: 'a8',
    severity: 'info',
    ack: 'unread',
    category: 'background',
    alertType: 'standard',
    title: 'Defense & Autonomy: NATO budget resolution',
    summary: 'NATO members committed to 2.5% GDP defense floor; policy tailwind confirmed.',
    context:
      'The NATO Summit communiqué formally raised the collective defense spending target to 2.5% of GDP, up from the prior 2% target. This structural policy tailwind strengthens the long-term thesis for Western defense contractors and autonomous systems developers.',
    timestamp: new Date(NOW - 9.1 * 3600000).toISOString(),
    dateGroup: 'Today',
    theme: 'Defense & Autonomy',
    factors: [
      { label: 'Budget floor increase', value: '+0.5% GDP', direction: 'up' },
      { label: 'Incremental spend est.', value: '$180B/yr', direction: 'up' },
      { label: 'Runway (years)', value: '10+', direction: 'flat' },
      { label: 'Thesis conviction', value: '+0.18', direction: 'up' },
    ],
    securities: ['LMT', 'RTX', 'KTOS', 'ANAB'],
    timeline: [
      { time: 'Yesterday 21:15', event: 'NATO communiqué released' },
      { time: 'Yesterday 21:44', event: 'Policy classifier: strong positive' },
      { time: 'Yesterday 22:10', event: 'Thesis reinforcement alert generated' },
    ],
  },
  // ── Yesterday ─────────────────────────────────────────────────────────────
  {
    id: 'a9',
    severity: 'critical',
    ack: 'acted',
    category: 'action',
    alertType: 'position-risk',
    title: 'Clean Energy grid interconnection queue spike',
    summary: 'FERC data: 2,847 projects pending interconnection, up 38% YoY; timeline risk elevated.',
    context:
      'FERC quarterly queue data shows a record 2,847 projects awaiting interconnection studies, with median wait times extending to 4.3 years. This structurally limits near-term capacity addition for Clean Energy theme holdings dependent on new grid access.',
    timestamp: new Date(NOW - 26 * 3600000).toISOString(),
    dateGroup: 'Yesterday',
    theme: 'Clean Energy',
    factors: [
      { label: 'Queue size YoY', value: '+38.4%', direction: 'up' },
      { label: 'Median wait (years)', value: '4.3', direction: 'up' },
      { label: 'Holdings impacted', value: '5 / 9', direction: 'up' },
      { label: 'Model adjustment', value: '-2 qtr', direction: 'down' },
    ],
    securities: ['NEE', 'AES', 'CWEN', 'BEP', 'ENPH'],
    timeline: [
      { time: 'Tue 09:00', event: 'FERC Q1 queue data published' },
      { time: 'Tue 09:34', event: 'Spike detected — 38% YoY flagged' },
      { time: 'Tue 10:01', event: 'Critical alert generated — analyst acted' },
    ],
  },
  {
    id: 'a10',
    severity: 'warning',
    ack: 'acknowledged',
    category: 'monitor',
    alertType: 'standard',
    title: 'Space Economy — FCC spectrum ruling postponed',
    summary: 'FCC spectrum allocation ruling delayed 90 days; ASTS deployment timeline at risk.',
    context:
      "The FCC announced a 90-day postponement of the spectrum allocation ruling critical for AST SpaceMobile's commercial service launch. This creates uncertainty around the Q3 2026 revenue ramp and may require adjusting forward revenue estimates downward.",
    timestamp: new Date(NOW - 29 * 3600000).toISOString(),
    dateGroup: 'Yesterday',
    theme: 'Space Economy',
    factors: [
      { label: 'Ruling delay', value: '+90 days', direction: 'up' },
      { label: 'Rev ramp risk', value: 'Q3 2026', direction: 'flat' },
      { label: 'Estimate revision', value: '-$127M', direction: 'down' },
      { label: 'Regulatory risk score', value: '0.73', direction: 'up' },
    ],
    securities: ['ASTS', 'GSAT'],
    timeline: [
      { time: 'Tue 14:00', event: 'FCC order published' },
      { time: 'Tue 14:22', event: 'Ruling parsed — delay confirmed' },
      { time: 'Tue 14:45', event: 'Warning generated — revenue model flagged' },
    ],
  },
  {
    id: 'a11',
    severity: 'warning',
    ack: 'acknowledged',
    category: 'monitor',
    alertType: 'standard',
    title: 'Longevity Tech: GLP-1 meta-analysis confirms CV benefit',
    summary: 'Landmark NEJM meta-analysis confirms cardiovascular benefit across 7 compounds.',
    context:
      'A landmark meta-analysis published in the New England Journal of Medicine confirms statistically significant cardiovascular benefit for GLP-1 receptor agonists across 7 compounds and 142,000 patients. This strengthens the long-term Longevity thesis and supports current position sizing.',
    timestamp: new Date(NOW - 33 * 3600000).toISOString(),
    dateGroup: 'Yesterday',
    theme: 'Longevity Tech',
    factors: [
      { label: 'Compounds confirmed', value: '7 / 9', direction: 'up' },
      { label: 'Patient base', value: '142k', direction: 'flat' },
      { label: 'CV risk reduction', value: '-14.2%', direction: 'down' },
      { label: 'Thesis conviction', value: '+0.21', direction: 'up' },
    ],
    securities: ['LLY', 'NVO', 'VKTX'],
    timeline: [
      { time: 'Tue 20:00', event: 'NEJM study published online' },
      { time: 'Tue 20:19', event: 'Medical NLP classifier: strong positive' },
      { time: 'Tue 20:44', event: 'Monitor alert generated — thesis support' },
    ],
  },
  {
    id: 'a12',
    severity: 'warning',
    ack: 'unread',
    category: 'monitor',
    alertType: 'standard',
    title: 'Deglobalization: surprise EU tariff escalation',
    summary: 'Unannounced 15% tariff on EU industrial imports; supply chain re-routing risk.',
    context:
      'A surprise executive order introduced a 15% tariff on EU industrial goods effective in 30 days, affecting semiconductor equipment and precision manufacturing imports. This creates short-term cost pressure for several Deglobalization theme holdings reliant on European tooling.',
    timestamp: new Date(NOW - 37 * 3600000).toISOString(),
    dateGroup: 'Yesterday',
    theme: 'Deglobalization',
    factors: [
      { label: 'Tariff rate', value: '15%', direction: 'up' },
      { label: 'Effective in', value: '30 days', direction: 'flat' },
      { label: 'COGS impact est.', value: '+$890M', direction: 'up' },
      { label: 'Holdings exposed', value: '4 / 8', direction: 'up' },
    ],
    securities: ['AMAT', 'KLAC', 'ASML', 'MU'],
    timeline: [
      { time: 'Tue 17:45', event: 'Executive order signed' },
      { time: 'Tue 18:09', event: 'Trade policy NLP alert triggered' },
      { time: 'Tue 18:31', event: 'Warning generated — supply chain review' },
    ],
  },
  {
    id: 'a13',
    severity: 'warning',
    ack: 'unread',
    category: 'monitor',
    alertType: 'bottleneck',
    title: 'Memory/Logic scaling mismatch — AI compute bottleneck emerging',
    summary: 'HBM demand growing at 70%/yr vs HBM supply at 25%/yr; Q3 2026 AI compute constraint projected.',
    context:
      'The StellarFlux bottleneck model detects a diverging scaling rate between HBM3e memory supply (+25% CAGR) and inference-time logic demand (+70% CAGR). At current trajectories, the mismatch creates a supply-constrained AI compute environment by Q3 2026, affecting theme models for AI Infrastructure holdings with memory-dependent workloads. Historical precedent from the 2021 DRAM shortage suggests 2–3 quarter lag before pricing inflects.',
    timestamp: new Date(NOW - 41 * 3600000).toISOString(),
    dateGroup: 'Yesterday',
    theme: 'AI Infrastructure',
    factors: [
      { label: 'HBM supply CAGR', value: '+25%/yr', direction: 'up' },
      { label: 'Logic demand CAGR', value: '+70%/yr', direction: 'up' },
      { label: 'Divergence rate', value: '2.8×', direction: 'up' },
      { label: 'Constraint horizon', value: 'Q3 2026', direction: 'flat' },
    ],
    securities: ['NVDA', 'MU', 'HXCO', 'AMAT'],
    timeline: [
      { time: 'Tue 15:00', event: 'Bottleneck model batch run completed' },
      { time: 'Tue 15:18', event: 'Divergence threshold exceeded (2.5×)' },
      { time: 'Tue 15:41', event: 'Bottleneck warning generated' },
    ],
  },
  {
    id: 'a14',
    severity: 'info',
    ack: 'unread',
    category: 'background',
    alertType: 'methodology',
    title: 'ONS Labour Force Survey methodology revision',
    summary: 'UK unemployment series restated -0.4pp from 2022; Deglobalization macro model inputs affected.',
    context:
      'The Office for National Statistics published a methodological update to the Labour Force Survey, resulting in a 0.4pp downward revision to the UK unemployment series dating back to Q1 2022. This affects the macro input layer of the Deglobalization theme model, which uses UK labor market tightness as a proxy for nearshoring demand pressure. The model will be re-run with restated inputs overnight; expect minor conviction score adjustment.',
    timestamp: new Date(NOW - 44 * 3600000).toISOString(),
    dateGroup: 'Yesterday',
    theme: 'Deglobalization',
    factors: [
      { label: 'Series revision', value: '-0.4pp', direction: 'down' },
      { label: 'History restated from', value: 'Q1 2022', direction: 'flat' },
      { label: 'Model inputs affected', value: '3 signals', direction: 'up' },
      { label: 'Conviction delta est.', value: '< -0.05', direction: 'down' },
    ],
    securities: ['VESTA', 'FIBRAMQ', 'TEF'],
    timeline: [
      { time: 'Tue 16:00', event: 'ONS methodological note published' },
      { time: 'Tue 16:27', event: 'Data pipeline diff detected — 0.4pp revision' },
      { time: 'Tue 16:49', event: 'Methodology change alert generated' },
    ],
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

const SEV: Record<Severity, { dot: string; badge: string; border: string }> = {
  critical: {
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    border: 'border-rose-500/40',
  },
  warning: {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    border: 'border-amber-500/40',
  },
  info: {
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    border: 'border-blue-500/40',
  },
}

const ACK_DOT: Record<AckState, string> = {
  unread: 'bg-zinc-900 dark:bg-zinc-100',
  acknowledged: 'bg-zinc-400 dark:bg-zinc-600',
  acted: 'bg-emerald-500',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SeverityBadge = memo(function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${SEV[severity].badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SEV[severity].dot}`} />
      {severity}
    </span>
  )
})

const TypeBadge = memo(function TypeBadge({ alertType }: { alertType: AlertType }) {
  if (alertType === 'bottleneck') {
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
        <Warning size={9} weight="fill" />
        Bottleneck
      </span>
    )
  }
  if (alertType === 'methodology') {
    return (
      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
        <ChartLineUp size={9} weight="fill" />
        Data Change
      </span>
    )
  }
  return null
})

const DirectionIcon = memo(function DirectionIcon({
  direction,
}: {
  direction: 'up' | 'down' | 'flat'
}) {
  if (direction === 'up') return <TrendUp size={11} className="text-rose-500" />
  if (direction === 'down') return <TrendDown size={11} className="text-emerald-500" />
  return <Minus size={11} className="text-zinc-400" />
})

const AlertRow = memo(function AlertRow({
  alert,
  isSelected,
  onSelect,
}: {
  alert: Alert
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(alert.id)}
      className={[
        'w-full text-left px-4 py-3.5 border-l-2 transition-colors duration-150',
        isSelected
          ? `${SEV[alert.severity].border} bg-zinc-50 dark:bg-zinc-800/60`
          : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5 flex-shrink-0">
          <span className={`block h-2 w-2 rounded-full ${ACK_DOT[alert.ack]}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <SeverityBadge severity={alert.severity} />
            <TypeBadge alertType={alert.alertType} />
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
              {alert.theme}
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug mb-0.5">
            {alert.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-snug line-clamp-2">
            {alert.summary}
          </p>
          <p suppressHydrationWarning className="mt-1.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
            {relativeTime(alert.timestamp)}
          </p>
        </div>
        <CaretRight
          size={14}
          className={`flex-shrink-0 mt-0.5 transition-colors ${
            isSelected ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'
          }`}
        />
      </div>
    </button>
  )
})

const DetailPanel = memo(function DetailPanel({
  alert,
  onAck,
  onClose,
}: {
  alert: Alert | null
  onAck: (id: string, state: AckState) => void
  onClose: () => void
}) {
  if (!alert) return null

  const factorSectionLabel =
    alert.alertType === 'bottleneck'
      ? 'Scaling properties'
      : alert.alertType === 'methodology'
      ? 'Metric impact'
      : 'Key factors'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={alert.id}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-full flex-col min-w-0"
      >
        {/* Panel header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <SeverityBadge severity={alert.severity} />
              <TypeBadge alertType={alert.alertType} />
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                {alert.theme}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
              {alert.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 mb-2">
              Context
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {alert.context}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 mb-2">
              {factorSectionLabel}
            </p>
            <div className="grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {alert.factors.map((f) => (
                <div key={f.label} className="bg-white dark:bg-zinc-900 px-3 py-2.5">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mb-0.5">{f.label}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {f.value}
                    </span>
                    <DirectionIcon direction={f.direction} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 mb-2">
              Securities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {alert.securities.map((s) => (
                <span
                  key={s}
                  className="font-mono text-[11px] font-semibold rounded px-2 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 mb-2">
              Event timeline
            </p>
            <div className="relative pl-5">
              <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-zinc-200 dark:bg-zinc-800" />
              {alert.timeline.map((t, i) => (
                <div key={i} className="relative mb-3 last:mb-0">
                  <div className="absolute -left-5 top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-300 dark:bg-zinc-700" />
                  <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 mb-0.5">
                    {t.time}
                  </p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">{t.event}</p>
                </div>
              ))}
            </div>
          </div>

          {alert.alertType === 'bottleneck' && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-600 mb-2">
                Scaling detail
              </p>
              <a
                href="/scaling"
                className="flex items-center justify-between rounded-lg border border-amber-200/60 bg-amber-50/50 px-4 py-3 hover:bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowsLeftRight size={13} className="text-amber-500" />
                  <div>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">View in Scaling Tracker</p>
                    <p className="font-mono text-[10px] text-zinc-400">Full supply/demand breakdown</p>
                  </div>
                </div>
                <CaretRight size={12} className="text-zinc-400" />
              </a>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-3 flex items-center gap-2">
          {alert.ack === 'unread' && (
            <button
              onClick={() => onAck(alert.id, 'acknowledged')}
              className="flex items-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-xs font-medium text-white dark:text-zinc-900 transition-colors hover:bg-zinc-700 dark:hover:bg-zinc-300 active:scale-[0.98]"
            >
              <CheckCircle size={13} />
              Acknowledge
            </button>
          )}
          {alert.ack === 'acknowledged' && (
            <>
              <button
                onClick={() => onAck(alert.id, 'acted')}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Lightning size={13} />
                Mark Acted
              </button>
              <button
                onClick={() => onAck(alert.id, 'unread')}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors"
              >
                <ArrowCounterClockwise size={13} />
                Undo
              </button>
            </>
          )}
          {alert.ack === 'acted' && (
            <button
              onClick={() => onAck(alert.id, 'acknowledged')}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors"
            >
              <ArrowCounterClockwise size={13} />
              Undo
            </button>
          )}
          <div className="flex-1" />
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide ${
              alert.ack === 'acted'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : alert.ack === 'acknowledged'
                ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                : 'bg-zinc-900/10 text-zinc-700 dark:bg-zinc-100/10 dark:text-zinc-400'
            }`}
          >
            {alert.ack}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(() => new Date().toUTCString().slice(17, 25))
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toUTCString().slice(17, 25)), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span suppressHydrationWarning className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">{time} UTC</span>
  )
}

// ─── Stat filter strip ────────────────────────────────────────────────────────

const STAT_TILES: Array<{
  key: FilterKey
  label: string
  numCls: string
  accentCls: string
}> = [
  { key: 'all',        label: 'All',             numCls: 'text-zinc-900 dark:text-zinc-100',    accentCls: 'bg-zinc-400 dark:bg-zinc-500' },
  { key: 'action',     label: 'Action Required', numCls: 'text-rose-600 dark:text-rose-400',    accentCls: 'bg-rose-500' },
  { key: 'monitor',    label: 'Monitor',         numCls: 'text-amber-600 dark:text-amber-400',  accentCls: 'bg-amber-500' },
  { key: 'background', label: 'Background',      numCls: 'text-blue-600 dark:text-blue-400',    accentCls: 'bg-blue-500' },
]

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
    <div className="flex flex-shrink-0 divide-x divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
      {STAT_TILES.map(({ key, label, numCls, accentCls }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={[
              'relative flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors duration-100',
              isActive
                ? 'bg-white dark:bg-zinc-950'
                : 'hover:bg-zinc-100/60 dark:hover:bg-white/[0.025]',
            ].join(' ')}
          >
            {isActive && (
              <motion.div
                layoutId="stat-filter-indicator"
                className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full ${accentCls}`}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`font-mono text-base font-bold tabular-nums leading-none ${isActive ? numCls : 'text-zinc-500 dark:text-zinc-500'}`}>
              {counts[key]}
            </span>
            <span className={`text-[10px] tracking-wide text-center leading-tight ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AlertsClient() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('action')
  const [search, setSearch] = useState('')

  const panelOpen = selectedId !== null

  const selectedAlert = useMemo(
    () => alerts.find((a) => a.id === selectedId) ?? null,
    [alerts, selectedId]
  )

  const counts = useMemo(
    (): Record<FilterKey, number> => ({
      all:        alerts.length,
      action:     alerts.filter((a) => a.category === 'action').length,
      monitor:    alerts.filter((a) => a.category === 'monitor').length,
      background: alerts.filter((a) => a.category === 'background').length,
    }),
    [alerts]
  )

  const actionUnread = useMemo(
    () => alerts.filter((a) => a.category === 'action' && a.ack === 'unread').length,
    [alerts]
  )

  const filtered = useMemo(() => {
    let list = alerts
    if (filter !== 'all') list = list.filter((a) => a.category === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.theme.toLowerCase().includes(q) ||
          a.securities.some((s) => s.toLowerCase().includes(q))
      )
    }
    return list
  }, [alerts, filter, search])

  const grouped = useMemo(() => {
    const map = new Map<string, Alert[]>()
    for (const a of filtered) {
      if (!map.has(a.dateGroup)) map.set(a.dateGroup, [])
      map.get(a.dateGroup)!.push(a)
    }
    return map
  }, [filtered])

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleAck = useCallback((id: string, state: AckState) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ack: state } : a)))
  }, [])

  const handleClose = useCallback(() => setSelectedId(null), [])

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Bell size={15} weight="fill" className="text-zinc-400 dark:text-zinc-500" />
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Alerts</h1>
          {actionUnread > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded bg-rose-500/15 px-1.5 font-mono text-[10px] font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              {actionUnread} action
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <ThemeToggle />
        </div>
      </div>

      {/* Stat filter strip */}
      <StatFilter active={filter} counts={counts} onChange={setFilter} />

      {/* Search */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative">
          <MagnifyingGlass
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts, themes, tickers…"
            className="w-full rounded-md bg-zinc-100 dark:bg-zinc-800 pl-8 pr-8 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Alert list */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <Bell size={32} className="text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">No alerts match</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600">
                Adjust filters or clear your search
              </p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([group, groupAlerts]) => (
              <div key={group}>
                <div className="sticky top-0 z-10 flex items-center gap-2.5 px-4 py-2 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800">
                  <Clock size={11} className="text-zinc-400 dark:text-zinc-600" />
                  <span className="text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                    {group}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">
                    {groupAlerts.length}
                  </span>
                </div>
                {groupAlerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    isSelected={selectedId === alert.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Detail panel — CSS width transition */}
        <div
          className="flex-shrink-0 overflow-hidden border-l border-zinc-200 dark:border-zinc-800 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: panelOpen ? 420 : 0 }}
        >
          <div style={{ width: 420 }} className="h-full">
            <DetailPanel alert={selectedAlert} onAck={handleAck} onClose={handleClose} />
          </div>
        </div>
      </div>
    </div>
  )
}
