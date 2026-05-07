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
import StellarHeader from '@/components/StellarHeader'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvictionStatus = 'strong' | 'moderate' | 'watch' | 'review'
type SignalType = 'positive' | 'negative' | 'neutral'
type RiskLevel = 'high' | 'medium' | 'low'
type AssumptionStatus = 'holding' | 'at-risk' | 'broken'
type FrameworkType = 'sa' | 'dalio' | 'godley'
type HorizonType = 'historical' | 'forward'

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

interface FrameworkFactor {
  label: string
  value: string
  favorable: boolean | null
}

interface DalioView {
  debtCyclePhase: string
  creditImpulse: number
  liquidityCondition: 'tight' | 'neutral' | 'loose'
  summary: string
  factors: FrameworkFactor[]
}

interface GodleyView {
  sectorBalance: string
  flowConsistency: 'strong' | 'moderate' | 'fragile'
  keyConstraint: string
  summary: string
  factors: FrameworkFactor[]
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
  forwardConviction12m: number[]
  dalioView: DalioView
  godleyView: GodleyView
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
    forwardConviction12m: [87.8, 88.3, 88.9, 89.2, 88.7, 89.1, 89.6, 90.1, 89.7, 90.2, 90.8, 91.3],
    dalioView: {
      debtCyclePhase: 'Mid-expansion',
      creditImpulse: 0.31,
      liquidityCondition: 'loose',
      summary: "Mid-expansion debt cycle strongly supports hyperscaler capex. Positive credit impulse and loose large-cap liquidity sustain the AI infrastructure build-out. Consistent with Dalio's template for late technology adoption phases.",
      factors: [
        { label: 'Debt cycle phase', value: 'Mid-expansion', favorable: true },
        { label: 'Credit impulse (6m)', value: '+0.31', favorable: true },
        { label: 'Liquidity condition', value: 'Loose (large-cap)', favorable: true },
        { label: 'Productivity shock', value: '+3.1σ vs baseline', favorable: true },
      ],
    },
    godleyView: {
      sectorBalance: 'Corporate deficit / Household surplus',
      flowConsistency: 'strong',
      keyConstraint: 'Power grid physical capacity',
      summary: 'Hyperscaler capex is financed by strong retained earnings and equity markets. Household sector surplus funds corporate investment. Physical grid capacity is the binding stock-flow constraint on total investment velocity.',
      factors: [
        { label: 'Corporate sector', value: 'Investing (deficit)', favorable: true },
        { label: 'Government sector', value: 'Neutral (no direct subsidy)', favorable: null },
        { label: 'Household sector', value: 'Surplus (funding capex)', favorable: true },
        { label: 'Flow constraint', value: 'Grid capacity bottleneck', favorable: false },
      ],
    },
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
    forwardConviction12m: [71.6, 71.2, 71.8, 72.4, 72.9, 73.6, 73.2, 73.8, 74.3, 74.1, 74.7, 75.2],
    dalioView: {
      debtCyclePhase: 'Late-cycle pressure',
      creditImpulse: -0.14,
      liquidityCondition: 'tight',
      summary: 'Elevated project finance rates and tightening credit conditions are compressing solar/wind IRRs. Long-duration yield-sensitive assets face headwinds in the current debt cycle phase. Recovery expected as cycle turns.',
      factors: [
        { label: 'Debt cycle phase', value: 'Late-cycle pressure', favorable: false },
        { label: 'Credit impulse (6m)', value: '-0.14', favorable: false },
        { label: 'Liquidity condition', value: 'Tight (project finance)', favorable: false },
        { label: 'Rate sensitivity', value: 'High (long-duration)', favorable: false },
      ],
    },
    godleyView: {
      sectorBalance: 'Private deficit / Gov surplus injection',
      flowConsistency: 'fragile',
      keyConstraint: 'Permitting bottleneck limits capex velocity',
      summary: 'IRA subsidies create a direct government-to-private-sector flow. The permitting bottleneck limits the ability to convert financial capacity into real investment. Sectoral flow analysis shows fragility to any policy reversal.',
      factors: [
        { label: 'Corporate sector', value: 'Project finance deficit', favorable: null },
        { label: 'Government sector', value: 'Surplus injection (IRA)', favorable: true },
        { label: 'Flow constraint', value: 'Permitting & interconnect queue', favorable: false },
        { label: 'Policy backstop', value: 'IRA intact — fragile if repealed', favorable: null },
      ],
    },
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
    forwardConviction12m: [67.9, 68.4, 69.0, 69.6, 69.2, 69.8, 70.3, 70.8, 70.4, 70.9, 71.3, 71.8],
    dalioView: {
      debtCyclePhase: 'Mid-cycle resilience',
      creditImpulse: -0.07,
      liquidityCondition: 'neutral',
      summary: "Neutral credit impulse and mid-cycle positioning support the Deglobalization thesis. Near-term tariff volatility introduces noise but structurally accelerates reshoring investment. Consistent with Dalio's late-globalization template.",
      factors: [
        { label: 'Debt cycle phase', value: 'Mid-cycle resilience', favorable: true },
        { label: 'Credit impulse (6m)', value: '-0.07', favorable: null },
        { label: 'Liquidity condition', value: 'Neutral', favorable: null },
        { label: 'Trade cycle signal', value: 'Fragmentation accelerating', favorable: true },
      ],
    },
    godleyView: {
      sectorBalance: 'Domestic surplus / Foreign deficit',
      flowConsistency: 'moderate',
      keyConstraint: 'Tariff escalation pace vs reshoring speed',
      summary: 'Nearshoring creates a domestic-sector surplus as manufacturing capex flows into Mexico and domestic facilities. The stock-flow transition is moderate: reshoring is structurally sound but adjustment takes 3–5 years.',
      factors: [
        { label: 'Domestic sector', value: 'Building surplus (reshoring)', favorable: true },
        { label: 'Foreign sector', value: 'Losing investment flows', favorable: null },
        { label: 'Capex stock build', value: 'Monterrey industrial: 4.7M sqft/qtr', favorable: true },
        { label: 'Adjustment lag', value: '3–5 years (flow transition)', favorable: null },
      ],
    },
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
    forwardConviction12m: [74.3, 74.8, 75.4, 75.9, 75.5, 76.1, 76.6, 76.2, 76.8, 77.3, 77.0, 77.6],
    dalioView: {
      debtCyclePhase: 'Early-expansion (sector)',
      creditImpulse: 0.18,
      liquidityCondition: 'neutral',
      summary: 'Space economy is in an early-expansion phase within a structurally new market. Government anchor contracts insulate from credit cycle volatility. Positive credit impulse supports emerging operator balance sheets.',
      factors: [
        { label: 'Debt cycle phase', value: 'Early-expansion (sector)', favorable: true },
        { label: 'Credit impulse (6m)', value: '+0.18', favorable: true },
        { label: 'Liquidity condition', value: 'Neutral', favorable: null },
        { label: 'Government backstop', value: 'DoD contracts $341M active', favorable: true },
      ],
    },
    godleyView: {
      sectorBalance: 'Government deficit funds private',
      flowConsistency: 'moderate',
      keyConstraint: 'Spectrum allocation regulatory decision',
      summary: 'Government anchor contracts create a reliable income flow for emerging space operators. The single-point regulatory constraint (FCC spectrum) represents a fragile stock-flow dependency. Resolution in 90 days would materially improve flow consistency.',
      factors: [
        { label: 'Government sector', value: 'Active deficit (DoD contracts)', favorable: true },
        { label: 'Private sector', value: 'Nascent surplus-builder', favorable: true },
        { label: 'Regulatory flow', value: 'FCC spectrum — 90d dependency', favorable: false },
        { label: 'Launch cost stock', value: 'Declining 20%/yr (structural)', favorable: true },
      ],
    },
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
    forwardConviction12m: [81.7, 82.3, 83.0, 82.6, 83.3, 83.9, 84.5, 84.2, 84.8, 85.3, 85.0, 85.6],
    dalioView: {
      debtCyclePhase: 'Mid-expansion',
      creditImpulse: 0.24,
      liquidityCondition: 'neutral',
      summary: 'Mid-expansion debt cycle and positive credit impulse support biotech investment. FDA acceleration programs and CMS coverage expansion represent regulatory credit easing. GLP-1 structural demand is credit-cycle agnostic.',
      factors: [
        { label: 'Debt cycle phase', value: 'Mid-expansion', favorable: true },
        { label: 'Credit impulse (6m)', value: '+0.24', favorable: true },
        { label: 'Liquidity condition', value: 'Neutral', favorable: null },
        { label: 'Regulatory credit', value: 'FDA BTD pipeline accelerating', favorable: true },
      ],
    },
    godleyView: {
      sectorBalance: 'Corporate R&D deficit / Insurance surplus',
      flowConsistency: 'strong',
      keyConstraint: 'Payer coverage expansion pace',
      summary: 'Pharmaceutical investment is financed by strong corporate cash flows and insurance premium surpluses. The payer (Medicare/insurance) sector holds the key stock-flow constraint: coverage expansion converts clinical evidence into durable revenue streams.',
      factors: [
        { label: 'Corporate sector', value: 'R&D-intensive deficit', favorable: true },
        { label: 'Payer sector', value: 'Surplus — CMS decision pending', favorable: null },
        { label: 'Patient flow', value: 'GLP-1 demand credit-agnostic', favorable: true },
        { label: 'Pipeline stock', value: 'BTD designations accelerating', favorable: true },
      ],
    },
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
    forwardConviction12m: [79.7, 80.3, 80.8, 80.4, 81.0, 81.5, 81.2, 81.8, 82.3, 82.0, 82.6, 83.1],
    dalioView: {
      debtCyclePhase: 'Late-cycle / structural expansion',
      creditImpulse: 0.12,
      liquidityCondition: 'neutral',
      summary: 'NATO structural commitment creates a multi-decade investment thesis that transcends normal debt cycle dynamics. Government spending backstops defense revenues regardless of credit conditions. Mild positive credit impulse supports prime contractor working capital.',
      factors: [
        { label: 'Debt cycle phase', value: 'Late-cycle / structural', favorable: true },
        { label: 'Credit impulse (6m)', value: '+0.12', favorable: true },
        { label: 'Liquidity condition', value: 'Neutral', favorable: null },
        { label: 'Government spending', value: '$180B/yr NATO increment', favorable: true },
      ],
    },
    godleyView: {
      sectorBalance: 'Government deficit → private surplus',
      flowConsistency: 'strong',
      keyConstraint: 'Rare-earth supply chain concentration',
      summary: 'Government defense spending creates a direct, persistent flow to the private defense sector. NATO commitment formalizes a multi-year government deficit that funds private sector surpluses. Stock-flow analysis is strong; rare-earth supply chain is the key stock vulnerability.',
      factors: [
        { label: 'Government sector', value: 'Structural deficit (NATO 2.5%)', favorable: true },
        { label: 'Defense sector', value: 'Surplus-building (backlog $4.2T)', favorable: true },
        { label: 'Supply chain stock', value: 'Rare-earth concentration risk', favorable: false },
        { label: 'Contract flow', value: 'Multi-year FMS agreements', favorable: true },
      ],
    },
  },
]

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ConvictionStatus, { badge: string; label: string }> = {
  strong: { badge: 'bg-emerald-500/20 text-emerald-400', label: 'strong' },
  moderate: { badge: 'bg-blue-500/20 text-blue-400', label: 'moderate' },
  watch: { badge: 'bg-amber-500/20 text-amber-400', label: 'watch' },
  review: { badge: 'bg-rose-500/20 text-rose-400', label: 'review' },
}

const SIGNAL_DOT: Record<SignalType, string> = {
  positive: 'bg-emerald-500',
  negative: 'bg-rose-500',
  neutral: 'bg-white/30',
}

const RISK_COLOR: Record<RiskLevel, string> = {
  high: 'text-rose-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
}

const IMPACT_BADGE: Record<RiskLevel, string> = {
  high: 'bg-rose-500/10 text-rose-400',
  medium: 'bg-amber-500/10 text-amber-400',
  low: 'bg-white/[0.06] text-white/40',
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Mini sparkline ───────────────────────────────────────────────────────────

const MiniSparkline = memo(function MiniSparkline({ data, color }: { data: number[]; color: string }) {
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
  data, color, themeId, dashed,
}: {
  data: number[]; color: string; themeId: string; dashed?: boolean
}) {
  const W = 800, H = 80
  const min = Math.min(...data) - 2
  const max = Math.max(...data) + 2
  const range = max - min
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - ((v - min) / range) * H }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${W} ${H} L 0 ${H} Z`
  const gradId = `cg-${themeId}${dashed ? '-fwd' : ''}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={dashed ? '0.12' : '0.22'} />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? '6 3' : undefined} />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
    </svg>
  )
})

// ─── Holdings section ─────────────────────────────────────────────────────────

const HoldingsSection = memo(function HoldingsSection({ holdings, color }: { holdings: Holding[]; color: string }) {
  const maxWeight = Math.max(...holdings.map((h) => h.weight))
  const totalWeight = holdings.reduce((s, h) => s + h.weight, 0)

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.055 } } }
  const row = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const } },
  }

  return (
    <div className="border-b border-white/[0.07]">
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/[0.05]">
        <p className="text-[10px] font-semibold tracking-wide text-white/40">Holdings</p>
        <p className="font-mono text-[10px] text-white/30">{totalWeight.toFixed(1)}% allocated</p>
      </div>
      <div className="flex items-center gap-4 px-6 py-1.5 border-b border-white/[0.04]">
        <div className="w-14 font-mono text-[10px] text-white/30 tracking-wide">Ticker</div>
        <div className="flex-1 font-mono text-[10px] text-white/30 tracking-wide">Name</div>
        <div className="w-40 font-mono text-[10px] text-white/30 tracking-wide">Weight</div>
        <div className="w-16 text-right font-mono text-[10px] text-white/30 tracking-wide">30d</div>
        <div className="w-16 text-right font-mono text-[10px] text-white/30 tracking-wide">Contrib</div>
      </div>
      <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-white/[0.04]">
        {holdings.map((h) => (
          <motion.div key={h.ticker} variants={row} className="flex items-center gap-4 px-6 py-2.5">
            <div className="w-14">
              <span className="font-mono text-[13px] font-bold text-[#f7f7f7]">{h.ticker}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 truncate">{h.name}</p>
            </div>
            <div className="w-40 flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color, originX: 0 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: h.weight / maxWeight }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as const }}
                />
              </div>
              <span className="font-mono text-[11px] text-white/40 w-10 text-right flex-shrink-0">
                {h.weight.toFixed(1)}%
              </span>
            </div>
            <div className="w-16 text-right">
              <span className={`font-mono text-xs font-semibold ${h.return30d >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {h.return30d >= 0 ? '+' : ''}{h.return30d.toFixed(1)}%
              </span>
            </div>
            <div className="w-16 text-right">
              <span className={`font-mono text-[11px] ${h.contribution >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {h.contribution >= 0 ? '+' : ''}{h.contribution.toFixed(1)}pp
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
})

// ─── Framework tabs ───────────────────────────────────────────────────────────

function FrameworkTabs({ active, onChange }: { active: FrameworkType; onChange: (f: FrameworkType) => void }) {
  return (
    <div className="flex items-center rounded-md overflow-hidden border border-white/[0.10] bg-white/[0.06]">
      {(['sa', 'dalio', 'godley'] as FrameworkType[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wide transition-colors ${
            active === f
              ? 'bg-white/15 text-[#f7f7f7]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {f === 'sa' ? 'SA' : f === 'dalio' ? 'Dalio' : 'Godley'}
        </button>
      ))}
    </div>
  )
}

// ─── Horizon toggle ───────────────────────────────────────────────────────────

function HorizonToggle({ active, onChange }: { active: HorizonType; onChange: (h: HorizonType) => void }) {
  return (
    <div className="flex items-center rounded overflow-hidden border border-white/[0.10]">
      {(['historical', 'forward'] as HorizonType[]).map((h) => (
        <button
          key={h}
          onClick={() => onChange(h)}
          className={`px-2 py-0.5 font-mono text-[10px] transition-colors ${
            active === h
              ? 'bg-white/15 text-[#f7f7f7]'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {h === 'historical' ? '30d' : '12M'}
        </button>
      ))}
    </div>
  )
}

// ─── Framework factor grid ────────────────────────────────────────────────────

function FactorGrid({ factors }: { factors: FrameworkFactor[] }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-px bg-white/[0.06] rounded-lg overflow-hidden border border-white/[0.07]">
        {factors.map((f) => (
          <div key={f.label} className="bg-[rgb(16,14,28)] px-3 py-2.5">
            <p className="text-[10px] text-white/40 mb-0.5">{f.label}</p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sm font-semibold text-[#f7f7f7]">{f.value}</span>
              {f.favorable === true && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
              {f.favorable === false && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />}
              {f.favorable === null && <span className="h-1.5 w-1.5 rounded-full bg-white/30 flex-shrink-0" />}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 font-mono text-[10px] text-white/30">
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Favorable</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Unfavorable</span>
        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-white/30" />Neutral</span>
      </div>
    </>
  )
}

// ─── Dalio section ────────────────────────────────────────────────────────────

function DalioSection({ view }: { view: DalioView }) {
  return (
    <div className="px-6 py-5 border-b border-white/[0.07]">
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-semibold tracking-wide text-white/40">Dalio Framework — Debt Cycle Analysis</p>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{view.debtCyclePhase}</span>
      </div>
      <p className="text-sm text-[#cecfd2] leading-relaxed mb-4 max-w-3xl">{view.summary}</p>
      <FactorGrid factors={view.factors} />
    </div>
  )
}

// ─── Godley section ───────────────────────────────────────────────────────────

const FLOW_CONSISTENCY_BADGE: Record<GodleyView['flowConsistency'], string> = {
  strong: 'bg-emerald-500/10 text-emerald-400',
  moderate: 'bg-amber-500/10 text-amber-400',
  fragile: 'bg-rose-500/10 text-rose-400',
}

function GodleySection({ view }: { view: GodleyView }) {
  return (
    <div className="px-6 py-5 border-b border-white/[0.07]">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <p className="text-[10px] font-semibold tracking-wide text-white/40">Godley Framework — Sectoral Balances</p>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">{view.sectorBalance}</span>
        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${FLOW_CONSISTENCY_BADGE[view.flowConsistency]}`}>
          {view.flowConsistency} flow
        </span>
      </div>
      <div className="flex items-start gap-2 mb-3">
        <span className="font-mono text-[10px] text-white/30 flex-shrink-0">Constraint:</span>
        <span className="font-mono text-[10px] text-white/50">{view.keyConstraint}</span>
      </div>
      <p className="text-sm text-[#cecfd2] leading-relaxed mb-4 max-w-3xl">{view.summary}</p>
      <FactorGrid factors={view.factors} />
    </div>
  )
}

// ─── Theme detail body ────────────────────────────────────────────────────────

function ThemeDetail({
  theme, color, framework, horizon, onHorizonChange,
}: {
  theme: Theme; color: string; framework: FrameworkType; horizon: HorizonType; onHorizonChange: (h: HorizonType) => void
}) {
  const chartData = horizon === 'historical' ? theme.convictionHistory : theme.forwardConviction12m
  const chartLabel = horizon === 'historical' ? '30-Day History' : '12M Forward'
  const chartHigh = Math.max(...chartData).toFixed(1)
  const chartLow = Math.min(...chartData).toFixed(1)

  return (
    <motion.div
      key={theme.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {/* Section 1: Conviction strip */}
      <div className="grid grid-cols-[5fr_4fr] border-b border-white/[0.07]">
        <div className="px-6 py-5 border-r border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-wide text-white/40 mb-3">Conviction Score</p>
          <div className="flex items-end gap-3 mb-4">
            <span className="font-mono text-5xl font-bold leading-none text-[#f7f7f7]">
              {theme.conviction.toFixed(1)}
            </span>
            <div className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-xs font-semibold mb-1 ${
              theme.convictionDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {theme.convictionDelta >= 0 ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
              {theme.convictionDelta >= 0 ? '+' : ''}{theme.convictionDelta.toFixed(1)} vs 7d
            </div>
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px] text-white/40">
            <span><span className="font-semibold text-[#cecfd2]">{theme.holdings.length}</span> holdings</span>
            <span><span className="font-semibold text-[#cecfd2]">{theme.signals.length}</span> signals</span>
            <span><span className="font-semibold text-[#cecfd2]">{theme.catalysts.length}</span> catalysts</span>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold tracking-wide text-white/40">{chartLabel}</p>
              <HorizonToggle active={horizon} onChange={onHorizonChange} />
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-white/30">
              <span>H {chartHigh}</span>
              <span>L {chartLow}</span>
            </div>
          </div>
          <ConvictionChart data={chartData} color={color} themeId={theme.id} dashed={horizon === 'forward'} />
          {horizon === 'forward' && (
            <div className="flex justify-between mt-1 px-0.5">
              {MONTH_LABELS.map((m) => (
                <span key={m} className="font-mono text-[9px] text-white/20">{m}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Thesis / Framework view */}
      {framework === 'sa' && (
        <div className="px-6 py-5 border-b border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-wide text-white/40 mb-2">Investment Thesis</p>
          <p className="text-sm text-[#cecfd2] leading-relaxed mb-4 max-w-3xl">{theme.thesis}</p>
          <div className="flex flex-wrap gap-2">
            {theme.assumptions.map((a, i) => {
              const isHolding = a.status === 'holding'
              const isAtRisk = a.status === 'at-risk'
              const Icon = isHolding ? CheckCircle : isAtRisk ? Warning : XCircle
              const iconCls = isHolding ? 'text-emerald-500' : isAtRisk ? 'text-amber-500' : 'text-rose-500'
              const chipCls = isHolding
                ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
                : isAtRisk
                ? 'border-amber-500/20 bg-amber-500/[0.08]'
                : 'border-rose-500/20 bg-rose-500/[0.08]'
              return (
                <div key={i} className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 ${chipCls}`}>
                  <Icon size={12} weight="fill" className={iconCls} />
                  <span className="text-xs text-[#cecfd2]">{a.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {framework === 'dalio' && <DalioSection view={theme.dalioView} />}
      {framework === 'godley' && <GodleySection view={theme.godleyView} />}

      {/* Section 3: Holdings */}
      <HoldingsSection holdings={theme.holdings} color={color} />

      {/* Section 4: Signals + Catalysts */}
      <div className="grid grid-cols-[3fr_2fr] border-b border-white/[0.07]">
        <div className="px-6 py-5 border-r border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-wide text-white/40 mb-4">Recent Signals</p>
          <div className="relative pl-5 space-y-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/[0.08]" />
            {theme.signals.map((s, i) => (
              <div key={i} className="relative">
                <div className={`absolute -left-5 top-0.5 h-3 w-3 rounded-full border-2 border-[rgb(16,14,28)] ${SIGNAL_DOT[s.type]}`} />
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] text-white/30">{s.date}</span>
                  <span className="font-mono text-[10px] text-white/20">{s.source}</span>
                </div>
                <p className="text-xs text-[#cecfd2] leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-[10px] font-semibold tracking-wide text-white/40 mb-4">Upcoming Catalysts</p>
          <div className="space-y-4">
            {theme.catalysts.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 text-center">
                  <p className="font-mono text-xl font-bold leading-none text-[#f7f7f7]">{c.daysOut}</p>
                  <p className="font-mono text-[9px] text-white/30 mt-0.5">days</p>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs text-[#cecfd2] leading-snug mb-1.5">{c.event}</p>
                  <span className={`font-mono text-[10px] font-semibold tracking-wide rounded px-1.5 py-0.5 ${IMPACT_BADGE[c.impact]}`}>
                    {c.impact} impact
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Risk factors */}
      <div className="px-6 py-5">
        <p className="text-[10px] font-semibold tracking-wide text-white/40 mb-4">Risk Factors</p>
        <div className="grid grid-cols-2 gap-3">
          {theme.risks.map((r, i) => (
            <div key={i} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-4 py-3">
              <p className="text-xs font-semibold text-[#f7f7f7] mb-2">{r.label}</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-white/30">Prob</span>
                  <span className={`font-mono text-[10px] font-semibold uppercase ${RISK_COLOR[r.probability]}`}>{r.probability}</span>
                </div>
                <div className="h-3 w-px bg-white/[0.08]" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-white/30">Impact</span>
                  <span className={`font-mono text-[10px] font-semibold uppercase ${RISK_COLOR[r.impact]}`}>{r.impact}</span>
                </div>
              </div>
              <p className="text-[11px] text-white/40 leading-snug">{r.notes}</p>
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
  const [framework, setFramework] = useState<FrameworkType>('sa')
  const [horizon, setHorizon] = useState<HorizonType>('historical')

  useEffect(() => {
    const param = searchParams.get('theme')
    if (param && THEMES.find((t) => t.id === param)) {
      setSelectedId(param)
    }
  }, [searchParams])

  const selectedTheme = useMemo(() => THEMES.find((t) => t.id === selectedId)!, [selectedId])
  const color = selectedTheme.color

  return (
    <div
      className="relative flex h-full overflow-hidden"
      style={{ background: "linear-gradient(144deg, rgb(21,18,37) 15%, rgb(5,5,30) 82%)" }}
    >
      {/* Radial glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 75% 55% at 45% 80%, rgba(30,58,200,0.32) 0%, transparent 68%)" }}
      />

      {/* Left: Theme selector sidebar */}
      <div className="relative z-10 w-52 flex-shrink-0 flex flex-col border-r border-white/[0.07] overflow-y-auto">
        {/* Sidebar header */}
        <div className="flex h-[72px] items-center px-5 border-b border-white/[0.07]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.5 4.5C11.5 3.12 10.38 2 9 2H5.5C4.12 2 3 3.12 3 4.5C3 5.88 4.12 7 5.5 7H10.5C11.88 7 13 8.12 13 9.5C13 10.88 11.88 12 10.5 12H7C5.62 12 4.5 10.88 4.5 9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-sm font-normal tracking-[0.28px] text-[#f7f7f7]">Stellar</span>
          </Link>
        </div>
        <div className="flex items-center px-5 py-2.5 border-b border-white/[0.05]">
          <p className="text-[10px] font-semibold tracking-wide text-white/40">6 themes</p>
        </div>
        {THEMES.map((t) => {
          const isActive = t.id === selectedId
          return (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={[
                'w-full text-left px-4 py-3.5 border-l-[3px] border-b border-white/[0.05] transition-colors duration-150',
                isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]',
              ].join(' ')}
              style={{ borderLeftColor: isActive ? t.color : 'transparent' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium leading-snug ${isActive ? 'text-[#f7f7f7]' : 'text-white/40'}`}>
                  {t.name}
                </span>
                <span className={`font-mono text-[10px] font-semibold rounded px-1 ${STATUS_STYLES[t.status].badge}`}>
                  {t.convictionDelta >= 0 ? '+' : ''}{t.convictionDelta.toFixed(1)}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className={`font-mono text-2xl font-bold leading-none ${isActive ? 'text-[#f7f7f7]' : 'text-white/50'}`}>
                  {t.conviction.toFixed(0)}
                </span>
                <MiniSparkline data={t.convictionHistory.slice(-15)} color={t.color} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Right: Detail panel */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        {/* Header */}
        <StellarHeader />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <ThemeDetail
              key={selectedId}
              theme={selectedTheme}
              color={color}
              framework={framework}
              horizon={horizon}
              onHorizonChange={setHorizon}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
