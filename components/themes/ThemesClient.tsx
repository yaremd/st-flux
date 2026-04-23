'use client'

import { useState, useMemo, memo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Warning,
  XCircle,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react'
import ThemeToggle from '@/components/ThemeToggle'

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvictionStatus = 'strong' | 'moderate' | 'watch' | 'review'
type SignalType = 'positive' | 'negative' | 'neutral'
type RiskLevel = 'high' | 'medium' | 'low'
type AssumptionStatus = 'holding' | 'at-risk' | 'broken'

interface Holding {
  ticker: string
  name: string
  weight: number
  return30d: number
  contribution: number
}

interface Signal {
  date: string
  type: SignalType
  text: string
  source: string
}

interface Catalyst {
  daysOut: number
  event: string
  impact: RiskLevel
}

interface Risk {
  label: string
  probability: RiskLevel
  impact: RiskLevel
  notes: string
}

interface Assumption {
  label: string
  status: AssumptionStatus
}

interface Theme {
  id: string
  name: string
  conviction: number
  convictionDelta: number
  status: ConvictionStatus
  color: string
  description: string
  thesis: string
  assumptions: Assumption[]
  holdings: Holding[]
  signals: Signal[]
  catalysts: Catalyst[]
  risks: Risk[]
  convictionHistory: number[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const THEMES: Theme[] = [
  {
    id: 'ai-infra',
    name: 'AI Infrastructure',
    conviction: 87.4,
    convictionDelta: 2.1,
    status: 'strong',
    color: '#3b82f6',
    description: 'GPU compute, cooling, and hyperscaler capex buildout',
    thesis:
      'The structural buildout of AI compute infrastructure represents a multi-year capex cycle driven by hyperscaler investment and enterprise AI adoption. Demand for GPU compute, specialized cooling, and power infrastructure continues to outpace supply, creating durable pricing power for key enablers across the stack.',
    assumptions: [
      { label: 'Hyperscaler capex stays elevated through 2027', status: 'holding' },
      { label: 'GPU supply constraint persists 12+ months', status: 'holding' },
      { label: 'Enterprise AI workloads grow >40% YoY', status: 'holding' },
      { label: 'Sovereign AI programs accelerate demand', status: 'at-risk' },
      { label: 'Power grid permits adequate for build-out', status: 'at-risk' },
    ],
    holdings: [
      { ticker: 'NVDA', name: 'NVIDIA Corporation', weight: 22.3, return30d: 14.7, contribution: 3.3 },
      { ticker: 'MSFT', name: 'Microsoft Corporation', weight: 14.1, return30d: 4.2, contribution: 0.6 },
      { ticker: 'META', name: 'Meta Platforms', weight: 11.7, return30d: 8.1, contribution: 0.9 },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', weight: 8.9, return30d: 3.4, contribution: 0.3 },
      { ticker: 'AMD', name: 'Advanced Micro Devices', weight: 6.4, return30d: -2.1, contribution: -0.1 },
      { ticker: 'SMCI', name: 'Super Micro Computer', weight: 4.8, return30d: 11.3, contribution: 0.5 },
    ],
    signals: [
      { date: 'Apr 23', type: 'negative', text: 'NVDA capex divergence widened +2.3σ vs consensus in after-hours filing', source: 'SEC Filing' },
      { date: 'Apr 22', type: 'positive', text: 'Azure AI revenue beat estimate by 4.7pp; Microsoft reaffirmed $80B capex plan', source: 'Earnings' },
      { date: 'Apr 20', type: 'positive', text: 'Taiwan export data: GPU shipments up 31% MoM — third consecutive month of acceleration', source: 'Trade Data' },
      { date: 'Apr 18', type: 'neutral', text: 'SMCI postponed earnings 3 weeks — audit committee review still ongoing', source: 'Press Release' },
      { date: 'Apr 15', type: 'positive', text: 'Corning announced $1.2B glass substrate expansion for AI liquid cooling infrastructure', source: 'Press Release' },
    ],
    catalysts: [
      { daysOut: 4, event: 'GOOGL earnings — cloud segment AI revenue breakdown', impact: 'high' },
      { daysOut: 11, event: 'Taiwan semiconductor monthly shipment data (BSMI)', impact: 'medium' },
      { daysOut: 18, event: 'SMCI delayed 10-Q filing deadline', impact: 'high' },
      { daysOut: 31, event: 'NVIDIA GTC 2026 developer conference keynote', impact: 'medium' },
    ],
    risks: [
      { label: 'Hyperscaler capex pullback', probability: 'low', impact: 'high', notes: 'Would directly break core thesis assumption; watch guidance carefully' },
      { label: 'China export control escalation', probability: 'medium', impact: 'high', notes: 'NVDA Hopper/Blackwell exposure ~28% of trailing revenue' },
      { label: 'Competing GPU architecture disruption', probability: 'low', impact: 'medium', notes: 'AMD MI400 series could erode NVDA inference moat by 2027' },
      { label: 'Power grid permitting failure', probability: 'medium', impact: 'medium', notes: 'Data center construction delays of 2–4 qtrs becoming baseline' },
    ],
    convictionHistory: [82.1, 82.8, 82.4, 83.1, 84.2, 83.7, 84.4, 85.1, 84.8, 84.3, 85.7, 86.2, 85.9, 86.4, 87.1, 86.8, 86.2, 86.9, 87.0, 87.3, 86.8, 86.4, 87.1, 87.2, 86.7, 87.0, 87.1, 87.3, 87.2, 87.4],
  },
  {
    id: 'clean-energy',
    name: 'Clean Energy',
    conviction: 72.1,
    convictionDelta: -3.8,
    status: 'watch',
    color: '#10b981',
    description: 'Utility-scale solar, wind, and grid-scale storage transition',
    thesis:
      'The accelerating transition to renewable energy is driven by falling LCOE, government subsidies, and corporate clean energy commitments. Interconnection queue backlogs and permitting delays represent the primary structural risk to near-term deployment velocity, creating a bifurcation between well-positioned operators and those with exposed project timelines.',
    assumptions: [
      { label: 'Federal permitting reform occurs within 18 months', status: 'at-risk' },
      { label: 'IRA incentives remain intact through 2027', status: 'holding' },
      { label: 'Grid interconnection queue clears at historical rate', status: 'broken' },
      { label: 'Corporate PPA demand sustains >12GW/yr', status: 'holding' },
      { label: 'Battery storage costs decline 15% YoY', status: 'holding' },
    ],
    holdings: [
      { ticker: 'NEE', name: 'NextEra Energy', weight: 18.2, return30d: -3.1, contribution: -0.6 },
      { ticker: 'ENPH', name: 'Enphase Energy', weight: 12.4, return30d: -7.8, contribution: -1.0 },
      { ticker: 'FSLR', name: 'First Solar', weight: 10.1, return30d: 2.4, contribution: 0.2 },
      { ticker: 'RUN', name: 'Sunrun Inc.', weight: 7.3, return30d: -11.2, contribution: -0.8 },
      { ticker: 'AES', name: 'The AES Corporation', weight: 6.8, return30d: 1.1, contribution: 0.1 },
      { ticker: 'CWEN', name: 'Clearway Energy', weight: 5.2, return30d: -2.3, contribution: -0.1 },
    ],
    signals: [
      { date: 'Apr 23', type: 'negative', text: 'BLM permitting data: utility-scale approvals down 31% MoM — 2.1σ below 3-year trend', source: 'BLM Data' },
      { date: 'Apr 20', type: 'negative', text: 'FERC queue backlog: 2,847 projects pending interconnection, median wait now 4.3 years', source: 'FERC Q1 Report' },
      { date: 'Apr 18', type: 'positive', text: 'First Solar awarded $880M DoD contract for domestic panel supply through 2029', source: 'Press Release' },
      { date: 'Apr 15', type: 'neutral', text: 'IRA Treasury rules finalized — domestic content adders confirmed at 10%', source: 'Treasury' },
      { date: 'Apr 11', type: 'negative', text: 'Enphase missed Q1 installs by 14% — residential market softening continues', source: 'Earnings' },
    ],
    catalysts: [
      { daysOut: 7, event: 'NEE Q1 earnings — pipeline and interconnection timeline update', impact: 'high' },
      { daysOut: 14, event: 'FERC interconnection reform final rule vote', impact: 'high' },
      { daysOut: 22, event: 'Monthly US solar install data release (EIA)', impact: 'medium' },
    ],
    risks: [
      { label: 'IRA repeal or material modification', probability: 'medium', impact: 'high', notes: 'Congressional action remains the primary tail risk' },
      { label: 'Interconnection queue structural failure', probability: 'high', impact: 'high', notes: 'Core assumption already broken; thesis under active review' },
      { label: 'Residential solar demand collapse', probability: 'medium', impact: 'medium', notes: 'High-rate environment pressuring installer unit economics' },
      { label: 'Supply chain tariff escalation', probability: 'medium', impact: 'medium', notes: 'ENPH and RUN more exposed than FSLR (domestic manufacturing)' },
    ],
    convictionHistory: [76.2, 75.8, 75.4, 74.9, 73.7, 74.2, 74.1, 73.6, 73.2, 72.8, 73.1, 72.7, 71.9, 72.3, 72.1, 71.6, 70.8, 72.1, 71.7, 71.4, 70.9, 72.2, 72.0, 71.8, 72.3, 73.1, 72.7, 72.4, 72.0, 72.1],
  },
  {
    id: 'deglobal',
    name: 'Deglobalization',
    conviction: 68.3,
    convictionDelta: -1.4,
    status: 'watch',
    color: '#f59e0b',
    description: 'Nearshoring, supply chain reshoring, and trade fragmentation',
    thesis:
      'Geopolitical friction and supply chain resilience concerns are structurally reshaping global trade patterns. Manufacturing capacity is shifting toward lower-risk jurisdictions — Mexico, India, and domestically — creating durable tailwinds for industrial real estate, automation, and domestic precision manufacturers. Near-term tariff escalation introduces volatility but ultimately accelerates the reshoring trend.',
    assumptions: [
      { label: 'US-China trade tension remains elevated 5+ years', status: 'holding' },
      { label: 'Mexico nearshoring absorbs >4M sqft/quarter', status: 'holding' },
      { label: 'Semiconductor equipment tariffs stay below 25%', status: 'at-risk' },
      { label: 'Automation capex displaces offshore labor economics', status: 'holding' },
    ],
    holdings: [
      { ticker: 'AMAT', name: 'Applied Materials', weight: 16.7, return30d: -4.8, contribution: -0.8 },
      { ticker: 'KLAC', name: 'KLA Corporation', weight: 13.2, return30d: -3.2, contribution: -0.4 },
      { ticker: 'MU', name: 'Micron Technology', weight: 11.8, return30d: 6.3, contribution: 0.7 },
      { ticker: 'VESTA', name: 'Vesta Real Estate', weight: 9.4, return30d: 8.4, contribution: 0.8 },
      { ticker: 'PLD', name: 'Prologis', weight: 8.1, return30d: 1.7, contribution: 0.1 },
      { ticker: 'FIBRAMQ', name: 'Fibra Macquarie', weight: 5.6, return30d: 4.1, contribution: 0.2 },
    ],
    signals: [
      { date: 'Apr 23', type: 'negative', text: 'Surprise 15% tariff on EU industrial imports signed — AMAT/KLAC directly exposed', source: 'Executive Order' },
      { date: 'Apr 21', type: 'positive', text: 'CBRE Q1 report: Monterrey/Juárez absorbed 4.7M sqft industrial space — 7-year high', source: 'CBRE Report' },
      { date: 'Apr 17', type: 'positive', text: 'India announces $11B fab subsidy program — domestic semiconductor ecosystem catalyst', source: 'Ministry of Finance' },
      { date: 'Apr 14', type: 'neutral', text: 'G7 export control working group concluded without new semiconductor restrictions', source: 'G7 Communiqué' },
      { date: 'Apr 09', type: 'positive', text: 'US manufacturing PMI 52.4 — fourth consecutive month of expansion', source: 'ISM' },
    ],
    catalysts: [
      { daysOut: 6, event: 'AMAT quarterly earnings — export control revenue impact', impact: 'high' },
      { daysOut: 13, event: 'US-Mexico trade ministerial meeting in Mexico City', impact: 'medium' },
      { daysOut: 28, event: 'BEA Q1 US manufacturing investment data release', impact: 'medium' },
    ],
    risks: [
      { label: 'US-Mexico trade deterioration', probability: 'low', impact: 'high', notes: 'Would directly undermine the nearshoring thesis leg' },
      { label: 'Semiconductor equipment tariff escalation', probability: 'medium', impact: 'high', notes: 'EU tariff precedent set; AMAT/KLAC ~$4.2B revenue at risk' },
      { label: 'Automation adoption lag vs labor cost', probability: 'medium', impact: 'medium', notes: 'Mexican labor economics still favorable; reshoring may slow' },
    ],
    convictionHistory: [72.1, 71.4, 71.2, 70.8, 71.3, 70.7, 70.4, 69.8, 70.2, 70.1, 69.6, 69.3, 68.7, 69.1, 69.2, 68.8, 68.4, 67.9, 68.3, 68.1, 67.8, 68.2, 69.0, 68.6, 68.4, 68.1, 68.3, 69.1, 68.7, 68.3],
  },
  {
    id: 'space',
    name: 'Space Economy',
    conviction: 74.6,
    convictionDelta: 0.9,
    status: 'moderate',
    color: '#0ea5e9',
    description: 'Commercial launch, satellite constellations, and in-space services',
    thesis:
      'The commercialization of low Earth orbit is entering a critical inflection point as launch costs continue to fall and downstream satellite services achieve commercial viability. Broadband connectivity, Earth observation, and precision navigation represent three converging revenue streams structurally underpinned by government anchor contracts and the rapid build-out of sovereign space programs globally.',
    assumptions: [
      { label: 'LEO launch cost declines 20%+ annually through 2028', status: 'holding' },
      { label: 'Starlink maintains >40% broadband share in underserved regions', status: 'holding' },
      { label: 'FCC spectrum allocation proceeds on schedule', status: 'at-risk' },
      { label: 'Government anchor contracts sustain emerging operators', status: 'holding' },
    ],
    holdings: [
      { ticker: 'RKLB', name: 'Rocket Lab USA', weight: 19.3, return30d: 21.4, contribution: 4.1 },
      { ticker: 'ASTS', name: 'AST SpaceMobile', weight: 14.7, return30d: -8.3, contribution: -1.2 },
      { ticker: 'GSAT', name: 'Globalstar Inc.', weight: 7.4, return30d: 3.1, contribution: 0.2 },
      { ticker: 'MNTS', name: 'Momentus Inc.', weight: 8.2, return30d: -14.7, contribution: -1.2 },
      { ticker: 'SPCE', name: 'Virgin Galactic', weight: 3.1, return30d: -4.2, contribution: -0.1 },
    ],
    signals: [
      { date: 'Apr 22', type: 'negative', text: 'FCC spectrum allocation ruling postponed 90 days — ASTS commercial service launch delayed', source: 'FCC Order' },
      { date: 'Apr 20', type: 'negative', text: 'Starship Block 4 manifest slipped 6 weeks — three payload operators directly affected', source: 'Manifest Update' },
      { date: 'Apr 17', type: 'positive', text: 'Rocket Lab awarded $141M DoD hypersonic tracking satellite contract', source: 'DoD Announcement' },
      { date: 'Apr 13', type: 'positive', text: 'RKLB Neutron milestone: first-stage engine test fire completed successfully at Stennis', source: 'Investor Update' },
      { date: 'Apr 08', type: 'neutral', text: 'ITU World Radiocommunication Conference 2027 agenda published — LEO spectrum item listed', source: 'ITU' },
    ],
    catalysts: [
      { daysOut: 9, event: 'RKLB Q1 earnings — launch cadence and Neutron update', impact: 'high' },
      { daysOut: 21, event: 'Starship Block 4 revised launch window announcement', impact: 'medium' },
      { daysOut: 90, event: 'FCC spectrum allocation revised decision deadline', impact: 'high' },
    ],
    risks: [
      { label: 'FCC spectrum delay extends past 90 days', probability: 'medium', impact: 'high', notes: 'ASTS revenue ramp fully contingent on this single ruling' },
      { label: 'Launch failure disrupting RKLB backlog', probability: 'low', impact: 'high', notes: 'A single failure could pause active DoD contract schedules' },
      { label: 'Starlink dominance forecloses downstream markets', probability: 'medium', impact: 'medium', notes: 'Broadband TAM crowding for ASTS and GSAT becoming clearer' },
    ],
    convictionHistory: [70.2, 71.1, 73.4, 72.8, 74.1, 73.6, 74.9, 74.3, 73.7, 74.2, 73.4, 72.9, 74.3, 75.1, 74.6, 73.8, 74.2, 75.0, 74.4, 73.9, 74.3, 74.1, 74.8, 74.2, 74.7, 74.3, 74.1, 74.4, 74.8, 74.6],
  },
  {
    id: 'longevity',
    name: 'Longevity Tech',
    conviction: 81.2,
    convictionDelta: 3.4,
    status: 'strong',
    color: '#ec4899',
    description: 'GLP-1 therapeutics, longevity biotech, and precision medicine',
    thesis:
      "The convergence of GLP-1 receptor agonist clinical evidence, advancing cell and gene therapies, and AI-driven drug discovery is creating a generational opportunity in longevity-focused therapeutics. The FDA's accelerating review timelines for breakthrough therapies are shortening the path to commercial launch for a cohort of novel compounds targeting metabolic disease, neurodegeneration, and aging pathways.",
    assumptions: [
      { label: 'GLP-1 cardiovascular evidence continues to strengthen', status: 'holding' },
      { label: 'FDA maintains accelerated review for longevity compounds', status: 'holding' },
      { label: 'Payer coverage expands for obesity-related indications', status: 'at-risk' },
      { label: 'AI drug discovery shortens time-to-IND by >30%', status: 'holding' },
    ],
    holdings: [
      { ticker: 'LLY', name: 'Eli Lilly and Company', weight: 24.7, return30d: 9.2, contribution: 2.3 },
      { ticker: 'NVO', name: 'Novo Nordisk A/S', weight: 18.3, return30d: 6.8, contribution: 1.2 },
      { ticker: 'VKTX', name: 'Viking Therapeutics', weight: 9.1, return30d: 23.1, contribution: 2.1 },
      { ticker: 'VRNA', name: 'Verona Pharma', weight: 6.8, return30d: 14.7, contribution: 1.0 },
      { ticker: 'RXRX', name: 'Recursion Pharmaceuticals', weight: 5.4, return30d: -3.8, contribution: -0.2 },
    ],
    signals: [
      { date: 'Apr 23', type: 'positive', text: 'VRNA granted FDA Breakthrough Therapy designation — review timeline shortened by 18 months', source: 'FDA' },
      { date: 'Apr 22', type: 'positive', text: 'NEJM meta-analysis: GLP-1 CV benefit confirmed across 142k patients and 7 compounds', source: 'NEJM' },
      { date: 'Apr 19', type: 'positive', text: 'VKTX Phase 2 obesity readout: -14.2% weight loss at 13 weeks vs -9.8% placebo arm', source: 'Clinical Data' },
      { date: 'Apr 14', type: 'neutral', text: 'CMS proposed rule: GLP-1 Medicare coverage expansion comment period now open', source: 'CMS' },
      { date: 'Apr 10', type: 'negative', text: 'RXRX partnership with Roche terminated — pipeline reprioritization announced', source: 'Press Release' },
    ],
    catalysts: [
      { daysOut: 3, event: 'LLY Q1 earnings — Mounjaro/Zepbound volume and 2026 guidance', impact: 'high' },
      { daysOut: 17, event: 'VKTX Phase 2b interim data readout (ADA symposium)', impact: 'high' },
      { daysOut: 34, event: 'ADA Scientific Sessions — GLP-1 long-term outcomes data', impact: 'medium' },
      { daysOut: 60, event: 'CMS GLP-1 Medicare coverage final rule publication', impact: 'high' },
    ],
    risks: [
      { label: 'GLP-1 long-duration safety signal', probability: 'low', impact: 'high', notes: 'Muscle loss/sarcopenia signals would be thesis-breaking for LLY/NVO' },
      { label: 'Payer coverage stagnation for obesity', probability: 'medium', impact: 'high', notes: 'CMS determination is binary for total addressable market sizing' },
      { label: 'Biosimilar entry accelerates pricing pressure', probability: 'medium', impact: 'medium', notes: '2028+ timeline but pipeline visibility matters for multiples now' },
    ],
    convictionHistory: [75.4, 76.1, 76.4, 77.2, 78.1, 77.6, 78.3, 79.1, 78.7, 79.2, 79.4, 80.1, 79.8, 80.3, 80.7, 81.1, 80.8, 80.4, 80.9, 80.6, 81.1, 81.0, 81.2, 81.0, 81.1, 80.9, 81.2, 81.3, 81.1, 81.2],
  },
  {
    id: 'defense',
    name: 'Defense & Autonomy',
    conviction: 79.3,
    convictionDelta: 1.7,
    status: 'moderate',
    color: '#94a3b8',
    description: 'Western defense contractors, autonomous systems, and C4ISR',
    thesis:
      'The NATO commitment to 2.5% of GDP defense spending, combined with the demonstrated effectiveness of autonomous systems in recent conflicts, is driving a structural multi-decade increase in Western defense budgets. Autonomy, C4ISR, and precision-strike capabilities are taking disproportionate share of expanding budgets, favoring software-enabled and autonomous platforms over traditional platform incumbents.',
    assumptions: [
      { label: 'NATO members sustain 2.5% GDP commitment beyond 2030', status: 'holding' },
      { label: 'Autonomous systems take >20% of new program starts', status: 'holding' },
      { label: 'US defense budget grows at least with inflation', status: 'holding' },
      { label: 'Rare-earth supply chain risk stays manageable', status: 'at-risk' },
    ],
    holdings: [
      { ticker: 'LMT', name: 'Lockheed Martin', weight: 18.6, return30d: 7.3, contribution: 1.4 },
      { ticker: 'RTX', name: 'RTX Corporation', weight: 15.3, return30d: 4.8, contribution: 0.7 },
      { ticker: 'NOC', name: 'Northrop Grumman', weight: 12.4, return30d: 3.1, contribution: 0.4 },
      { ticker: 'HII', name: 'Huntington Ingalls', weight: 8.7, return30d: 2.4, contribution: 0.2 },
      { ticker: 'KTOS', name: 'Kratos Defense', weight: 7.2, return30d: 16.4, contribution: 1.2 },
      { ticker: 'ANAB', name: 'AeroNav Systems', weight: 4.9, return30d: 5.3, contribution: 0.3 },
    ],
    signals: [
      { date: 'Apr 22', type: 'positive', text: 'NATO Summit: members formally committed to 2.5% GDP defense floor — $180B/yr incremental spend', source: 'NATO Communiqué' },
      { date: 'Apr 21', type: 'negative', text: 'RTX/LMT/NOC/HII share Tier-2 rare-earth supplier — concentration risk flagged in supply scan', source: 'Supply Chain Scan' },
      { date: 'Apr 17', type: 'positive', text: 'KTOS awarded $87M contract for autonomous aerial target drone production', source: 'DoD' },
      { date: 'Apr 13', type: 'positive', text: 'Germany Bundestag approved €100B special defense fund — LMT and RTX named vendors', source: 'Bundestag' },
      { date: 'Apr 09', type: 'neutral', text: 'NDAA markup begins — autonomous systems funding line item under debate in committee', source: 'Senate Armed Services' },
    ],
    catalysts: [
      { daysOut: 5, event: 'LMT Q1 earnings — F-35 deliveries and program backlog', impact: 'high' },
      { daysOut: 12, event: 'DoD budget supplemental request submitted to Congress', impact: 'high' },
      { daysOut: 19, event: 'G7 rare-earth export control working group final report', impact: 'medium' },
      { daysOut: 45, event: 'NATO defense ministers meeting — procurement harmonization', impact: 'medium' },
    ],
    risks: [
      { label: 'US defense budget sequestration', probability: 'low', impact: 'high', notes: 'Bipartisan support strong but debt ceiling dynamics introduce tail risk' },
      { label: 'Rare-earth supply chain disruption', probability: 'medium', impact: 'high', notes: 'Tier-2 supplier concentration confirmed — mitigation plan not yet filed' },
      { label: 'Geopolitical de-escalation reducing urgency', probability: 'low', impact: 'medium', notes: 'Structural NATO commitment partially insulates from this scenario' },
    ],
    convictionHistory: [76.3, 77.1, 77.4, 78.2, 77.8, 78.3, 79.1, 78.7, 79.2, 79.1, 78.6, 79.2, 79.3, 79.1, 79.8, 79.4, 79.1, 79.3, 79.2, 79.1, 79.4, 80.1, 79.7, 79.3, 79.2, 79.1, 79.4, 79.6, 79.3, 79.3],
  },
]

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ConvictionStatus, { badge: string; label: string }> = {
  strong: { badge: 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400', label: 'STRONG' },
  moderate: { badge: 'bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400', label: 'MODERATE' },
  watch: { badge: 'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400', label: 'WATCH' },
  review: { badge: 'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400', label: 'REVIEW' },
}

const SIGNAL_DOT: Record<SignalType, string> = {
  positive: 'bg-emerald-500',
  negative: 'bg-rose-500',
  neutral: 'bg-zinc-400 dark:bg-zinc-600',
}

const RISK_COLOR: Record<RiskLevel, string> = {
  high: 'text-rose-600 dark:text-rose-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-emerald-600 dark:text-emerald-400',
}

const IMPACT_BADGE: Record<RiskLevel, string> = {
  high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  low: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
}

// ─── Mini sparkline ───────────────────────────────────────────────────────────

const MiniSparkline = memo(function MiniSparkline({
  data,
  color,
}: {
  data: number[]
  color: string
}) {
  const W = 60, H = 20
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-[60px] h-5" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
})

// ─── Conviction area chart ────────────────────────────────────────────────────

const ConvictionChart = memo(function ConvictionChart({
  data,
  color,
  themeId,
}: {
  data: number[]
  color: string
  themeId: string
}) {
  const W = 800, H = 80
  const min = Math.min(...data) - 2
  const max = Math.max(...data) + 2
  const range = max - min
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H,
  }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${W} ${H} L 0 ${H} Z`
  const gradId = `cg-${themeId}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 80 }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
    </svg>
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
    <span suppressHydrationWarning className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
      {time} UTC
    </span>
  )
}

// ─── Holdings section ─────────────────────────────────────────────────────────

const HoldingsSection = memo(function HoldingsSection({
  holdings,
  color,
}: {
  holdings: Holding[]
  color: string
}) {
  const maxWeight = Math.max(...holdings.map((h) => h.weight))
  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0)

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.055 } },
  }
  const row = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
  }

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
          Holdings
        </p>
        <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
          {totalWeight.toFixed(1)}% allocated
        </p>
      </div>
      {/* Column headers */}
      <div className="flex items-center gap-4 px-6 py-1.5 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="w-14 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Ticker</div>
        <div className="flex-1 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Name</div>
        <div className="w-40 font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Weight</div>
        <div className="w-16 text-right font-mono text-[10px] text-zinc-400 uppercase tracking-wider">30d</div>
        <div className="w-16 text-right font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Contrib</div>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="divide-y divide-zinc-100 dark:divide-zinc-800/50"
      >
        {holdings.map((h) => (
          <motion.div key={h.ticker} variants={row} className="flex items-center gap-4 px-6 py-2.5">
            <div className="w-14">
              <span className="font-mono text-[13px] font-bold text-zinc-900 dark:text-zinc-100">
                {h.ticker}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">{h.name}</p>
            </div>
            <div className="w-40 flex items-center gap-2">
              <div className="flex-1 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: h.weight / maxWeight }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500 w-10 text-right flex-shrink-0">
                {h.weight.toFixed(1)}%
              </span>
            </div>
            <div className="w-16 text-right">
              <span
                className={`font-mono text-xs font-semibold ${
                  h.return30d >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {h.return30d >= 0 ? '+' : ''}
                {h.return30d.toFixed(1)}%
              </span>
            </div>
            <div className="w-16 text-right">
              <span
                className={`font-mono text-[11px] ${
                  h.contribution >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {h.contribution >= 0 ? '+' : ''}
                {h.contribution.toFixed(1)}pp
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
})

// ─── Theme detail body ────────────────────────────────────────────────────────

function ThemeDetail({ theme, color }: { theme: Theme; color: string }) {
  return (
    <motion.div
      key={theme.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Section 1: Conviction strip ── */}
      <div className="grid grid-cols-[5fr_4fr] border-b border-zinc-200 dark:border-zinc-800">
        {/* Conviction score */}
        <div className="px-6 py-5 border-r border-zinc-200 dark:border-zinc-800">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-3">
            Conviction Score
          </p>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-mono text-5xl font-bold leading-none text-zinc-900 dark:text-zinc-100">
              {theme.conviction.toFixed(1)}
            </span>
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-xs font-semibold mb-1 ${
                theme.convictionDelta >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {theme.convictionDelta >= 0 ? (
                <TrendUp size={12} weight="bold" />
              ) : (
                <TrendDown size={12} weight="bold" />
              )}
              {theme.convictionDelta >= 0 ? '+' : ''}
              {theme.convictionDelta.toFixed(1)} vs 7d
            </div>
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
            <span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{theme.holdings.length}</span>{' '}
              holdings
            </span>
            <span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{theme.signals.length}</span>{' '}
              signals
            </span>
            <span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{theme.catalysts.length}</span>{' '}
              catalysts
            </span>
          </div>
        </div>

        {/* Conviction chart */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              30-Day History
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
              <span>H {Math.max(...theme.convictionHistory).toFixed(1)}</span>
              <span>L {Math.min(...theme.convictionHistory).toFixed(1)}</span>
            </div>
          </div>
          <ConvictionChart data={theme.convictionHistory} color={color} themeId={theme.id} />
        </div>
      </div>

      {/* ── Section 2: Thesis + Assumptions ── */}
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-2">
          Investment Thesis
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 max-w-3xl">
          {theme.thesis}
        </p>
        <div className="flex flex-wrap gap-2">
          {theme.assumptions.map((a, i) => {
            const isHolding = a.status === 'holding'
            const isAtRisk = a.status === 'at-risk'
            const Icon = isHolding ? CheckCircle : isAtRisk ? Warning : XCircle
            const iconCls = isHolding
              ? 'text-emerald-500'
              : isAtRisk
              ? 'text-amber-500'
              : 'text-rose-500'
            const chipCls = isHolding
              ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-900/20'
              : isAtRisk
              ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-900/20'
              : 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-900/20'
            return (
              <div key={i} className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${chipCls}`}>
                <Icon size={12} weight="fill" className={iconCls} />
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{a.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 3: Holdings ── */}
      <HoldingsSection holdings={theme.holdings} color={color} />

      {/* ── Section 4: Signals + Catalysts ── */}
      <div className="grid grid-cols-[3fr_2fr] border-b border-zinc-200 dark:border-zinc-800">
        {/* Signal feed */}
        <div className="px-6 py-5 border-r border-zinc-200 dark:border-zinc-800">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-4">
            Recent Signals
          </p>
          <div className="relative pl-5 space-y-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-zinc-100 dark:bg-zinc-800" />
            {theme.signals.map((s, i) => (
              <div key={i} className="relative">
                <div
                  className={`absolute -left-5 top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 ${SIGNAL_DOT[s.type]}`}
                />
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600">{s.date}</span>
                  <span className="font-mono text-[10px] text-zinc-300 dark:text-zinc-700">{s.source}</span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Catalyst board */}
        <div className="px-6 py-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-4">
            Upcoming Catalysts
          </p>
          <div className="space-y-4">
            {theme.catalysts.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 text-center">
                  <p className="font-mono text-xl font-bold leading-none text-zinc-900 dark:text-zinc-100">
                    {c.daysOut}
                  </p>
                  <p className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600 mt-0.5">days</p>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-snug mb-1.5">{c.event}</p>
                  <span
                    className={`font-mono text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 ${IMPACT_BADGE[c.impact]}`}
                  >
                    {c.impact} impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 5: Risk factors ── */}
      <div className="px-6 py-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600 mb-4">
          Risk Factors
        </p>
        <div className="grid grid-cols-2 gap-3">
          {theme.risks.map((r, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-100 dark:border-zinc-800 px-4 py-3"
            >
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">{r.label}</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Prob</span>
                  <span className={`font-mono text-[10px] font-semibold uppercase ${RISK_COLOR[r.probability]}`}>
                    {r.probability}
                  </span>
                </div>
                <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-600">Impact</span>
                  <span className={`font-mono text-[10px] font-semibold uppercase ${RISK_COLOR[r.impact]}`}>
                    {r.impact}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-snug">{r.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ThemesClient() {
  const searchParams = useSearchParams()
  const [selectedId, setSelectedId] = useState(THEMES[0].id)

  useEffect(() => {
    const param = searchParams.get('theme')
    if (param && THEMES.find((t) => t.id === param)) {
      setSelectedId(param)
    }
  }, [searchParams])

  const selectedTheme = useMemo(
    () => THEMES.find((t) => t.id === selectedId)!,
    [selectedId]
  )
  const color = selectedTheme.color

  return (
    <div className="flex h-full bg-white dark:bg-zinc-950">
      {/* ── Left: Theme selector ── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
        <div className="flex h-14 items-center px-5 border-b border-zinc-200 dark:border-zinc-800">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
            6 Themes
          </p>
        </div>
        {THEMES.map((t) => {
          const isActive = t.id === selectedId
          const tc = t.color
          return (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={[
                'w-full text-left px-4 py-3.5 border-l-[3px] border-b border-zinc-100 dark:border-zinc-800/50 transition-colors duration-150',
                isActive
                  ? 'bg-zinc-50 dark:bg-zinc-800/50'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30',
              ].join(' ')}
              style={{ borderLeftColor: isActive ? tc : 'transparent' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-medium leading-snug ${
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 dark:text-zinc-500'
                  }`}
                >
                  {t.name}
                </span>
                <span
                  className={`font-mono text-[10px] font-semibold rounded px-1 ${STATUS_STYLES[t.status].badge}`}
                >
                  {t.convictionDelta >= 0 ? '+' : ''}
                  {t.convictionDelta.toFixed(1)}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-mono text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-100">
                  {t.conviction.toFixed(0)}
                </span>
                <MiniSparkline data={t.convictionHistory.slice(-15)} color={tc} />
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Right: Detail panel ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6">
          <div className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedTheme.name}
            </h1>
            <span
              className={`font-mono text-[10px] font-semibold uppercase tracking-wider rounded px-1.5 py-0.5 ${STATUS_STYLES[selectedTheme.status].badge}`}
            >
              {STATUS_STYLES[selectedTheme.status].label}
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
              {selectedTheme.description}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LiveClock />
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <ThemeDetail key={selectedId} theme={selectedTheme} color={color} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
