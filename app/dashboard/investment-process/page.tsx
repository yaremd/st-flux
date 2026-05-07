"use client";

import { useState, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretRight,
  X,
  ArrowClockwise,
  Bell,
  Warning,
  DownloadSimple,
} from "@phosphor-icons/react";
import StellarHeader from "@/components/StellarHeader";
import DashboardPageHeader from "@/components/DashboardPageHeader";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Tab = "portfolio" | "riskfactors" | "recommendations";
type Status = "clear" | "adv" | "breach" | "monitor" | "ack";
type VC = "g" | "a" | "r" | "m"; // green amber red muted

interface Cell {
  v: string;
  c?: VC;
  metric?: string; // opens chart panel on click
}

/* ── Color maps ─────────────────────────────────────────────────────────────── */

const TEXT: Record<VC, string> = {
  g: "text-emerald-400",
  a: "text-amber-400",
  r: "text-rose-400",
  m: "text-white/40",
};

/* ── Primitives ─────────────────────────────────────────────────────────────── */

const em: Cell = { v: "—" };
const emM: Cell = { v: "—", c: "m" };

function c(v: string, col?: VC, metric?: string): Cell {
  return { v, c: col, metric };
}

/* ── StatusPill ─────────────────────────────────────────────────────────────── */

const PILL_STYLES: Record<Status, string> = {
  clear:   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  adv:     "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  breach:  "bg-rose-500/15 text-rose-400 border border-rose-500/25",
  monitor: "bg-white/[0.07] text-white/40 border border-white/[0.09]",
  ack:     "bg-amber-500/10 text-amber-300/80 border border-amber-500/20",
};

const PILL_LABELS: Record<Status, string> = {
  clear: "CLEAR", adv: "ADVISORY", breach: "BREACH", monitor: "MONITOR", ack: "ACK",
};

function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide ${PILL_STYLES[status]}`}>
      {PILL_LABELS[status]}
    </span>
  );
}

/* ── Cv — colored value cell content ───────────────────────────────────────── */

function Cv({ cell, onClick }: { cell: Cell; onClick?: () => void }) {
  const cls = cell.c ? TEXT[cell.c] : "text-white/70";
  if (onClick) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`font-mono text-[11px] font-medium tabular-nums underline-offset-2 hover:underline ${cls}`}
      >
        {cell.v}
      </button>
    );
  }
  return <span className={`font-mono text-[11px] font-medium tabular-nums ${cls}`}>{cell.v}</span>;
}

/* ── ExpandBtn ──────────────────────────────────────────────────────────────── */

function ExpandBtn({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-white/[0.12] bg-white/[0.04] transition-colors hover:bg-white/[0.08]"
    >
      <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.15 }}>
        <CaretRight size={8} className="text-white/50" />
      </motion.span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════════════════════ */

interface StratRow {
  id: string;
  bookId: string;
  code: string;
  name: string;
  hasSubs: boolean;
  indent: "strat" | "stratDeep"; // deep = no expand btn
  var95: Cell; cvar99: Cell;
  dv01Agg: Cell; dv01USD: Cell; dv01EUR: Cell; dv01GBP: Cell; dv01JPY: Cell; dv01ARS: Cell; dv01BRL: Cell;
  vega: Cell; betaNDX: Cell; div: Cell;
  concAgg: Cell; concSName: Cell; concSC: Cell; concVol: Cell;
  grossExp: Cell; netExp: Cell;
  plMTD: Cell; drawdown: Cell; revTime: Cell;
  status: Status;
}

interface SubRow {
  id: string;
  parentId: string;
  name: string;
  var95: string; cvar99: string;
  dv01Agg: string; dv01USD: string; dv01EUR: string; dv01GBP: string; dv01JPY: string; dv01ARS: string; dv01BRL: string;
  vega: string; betaNDX: string;
  plMTD: Cell;
}

interface BookData {
  id: string;
  code: string;
  name: string;
  bookStatus: Status;
  bookStatusLabel: string;
  var95: Cell; cvar99: Cell;
  betaNDX: Cell; div: Cell;
  concAgg: Cell; concSName: Cell; concSC: Cell; concVol: Cell;
  grossExp: Cell; netExp: Cell;
  plMTD: Cell; drawdown: Cell; revTime: Cell;
  status: Status;
}

/* ── Books ── */
const BOOKS: BookData[] = [
  {
    id: "rgaut", code: "RGAUT", name: "Tony's Book · 8 strategies · Cap: $280m",
    bookStatus: "breach", bookStatusLabel: "BREACH",
    var95: c("1.42","a"), cvar99: c("3.21","a"),
    betaNDX: c("0.31","g"), div: c("0.72","g"),
    concAgg: c("3.8%","a"), concSName: c("3.8%","a"), concSC: c("11.2%","a"), concVol: c("2.1%","g"),
    grossExp: c("1.41×","a"), netExp: c("0.28×","g"),
    plMTD: c("+$19.8m","g"), drawdown: c("−$23.5m","r"), revTime: c("Weekly","r"),
    status: "breach",
  },
  {
    id: "pcc", code: "PCC", name: "Global Core · 9 strategies · Cap: $510m",
    bookStatus: "clear", bookStatusLabel: "ALL CLEAR",
    var95: c("1.18","g"), cvar99: c("2.74","g"),
    betaNDX: c("0.41","g"), div: c("0.81","g"),
    concAgg: c("3.2%","g"), concSName: c("3.2%","g"), concSC: c("7.8%","g"), concVol: c("1.4%","g"),
    grossExp: c("0.62×","g"), netExp: c("0.19×","g"),
    plMTD: c("+$14.9m","g"), drawdown: c("−$2.4m","g"), revTime: c("Monthly","g"),
    status: "clear",
  },
  {
    id: "fbaut", code: "FBAUT", name: "Frontier & EM · 5 strategies · Cap: $220m",
    bookStatus: "adv", bookStatusLabel: "1 ADVISORY",
    var95: c("1.19","g"), cvar99: c("2.88","g"),
    betaNDX: c("0.72","a"), div: c("0.58","a"),
    concAgg: c("4.4%","a"), concSName: c("4.4%","a"), concSC: c("12.8%","a"), concVol: c("1.9%","g"),
    grossExp: c("0.86×","g"), netExp: c("0.32×","g"),
    plMTD: c("+$10.8m","g"), drawdown: c("−$1.8m","g"), revTime: c("Weekly","a"),
    status: "adv",
  },
];

/* ── Strategies ── */
const STRATEGIES: StratRow[] = [
  // ── RGAUT ──
  {
    id: "RGAUT:ST_RATES", bookId: "rgaut", code: "ST_RATES", name: "Short-term Rates",
    hasSubs: true, indent: "strat",
    var95: c("~1.13","m"), cvar99: c("~2.59","m"),
    dv01Agg: c("−$900k","r","DV01"), dv01USD: c("−$310k"), dv01EUR: c("−$240k"), dv01GBP: c("−$200k"), dv01JPY: c("−$90k"), dv01ARS: c("−$35k"), dv01BRL: c("−$60k"),
    vega: c("−$300k","r","Vega"), betaNDX: c("0.18"), div: emM,
    concAgg: emM, concSName: emM, concSC: emM, concVol: emM,
    grossExp: c("1.62×","m"), netExp: c("0.44×","m"),
    plMTD: c("+$10.3m","g","P&L MTD"), drawdown: c("−$23.5m","r","Drawdown"), revTime: c("Daily","r"),
    status: "breach",
  },
  {
    id: "RGAUT:EU_AUTO", bookId: "rgaut", code: "EU_AUTO", name: "EU Autos",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.21","m"), cvar99: c("~1.48","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: c("−$42k"), dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.61","g"), div: emM,
    concAgg: c("4.2%","g"), concSName: c("4.2%","g"), concSC: c("12.4%","g"), concVol: c("3.1%","g"),
    grossExp: c("0.94×","m"), netExp: c("0.22×","m"),
    plMTD: c("+$3.8m","g","P&L MTD"), drawdown: c("−$1.2m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "RGAUT:ENERGY", bookId: "rgaut", code: "ENERGY", name: "Energy Transition",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.36","m"), cvar99: c("~1.16","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.74"), div: emM,
    concAgg: c("3.8%","g"), concSName: c("3.8%","g"), concSC: c("8.3%","g"), concVol: c("4.2%","g"),
    grossExp: c("0.72×","m"), netExp: c("0.18×","m"),
    plMTD: c("+$5.1m","g","P&L MTD"), drawdown: c("−$0.8m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "RGAUT:CMPT_CH", bookId: "rgaut", code: "CMPT_CH", name: "CMPT China",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.35","m"), cvar99: c("~0.90","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.52"), div: emM,
    concAgg: c("3.2%","g"), concSName: c("3.2%","g"), concSC: c("7.1%","g"), concVol: c("2.8%","g"),
    grossExp: c("0.68×","m"), netExp: c("0.21×","m"),
    plMTD: c("−$0.6m","a","P&L MTD"), drawdown: c("−$4.2m","a","Drawdown"), revTime: c("Weekly","a"),
    status: "adv",
  },
  {
    id: "RGAUT:EQFIC_L", bookId: "rgaut", code: "EQFIC_L", name: "Equity Financials",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.38","m"), cvar99: c("~0.75","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.88"), div: emM,
    concAgg: c("3.8%","g"), concSName: c("3.8%","g"), concSC: c("6.2%","g"), concVol: c("2.1%","g"),
    grossExp: c("1.12×","m"), netExp: c("0.35×","m"),
    plMTD: c("+$2.4m","g","P&L MTD"), drawdown: c("−$0.5m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "RGAUT:EQ_CHINA", bookId: "rgaut", code: "EQ_CHINA", name: "Equity China",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.23","m"), cvar99: c("~0.69","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.41"), div: emM,
    concAgg: c("4.1%","g"), concSName: c("4.1%","g"), concSC: c("5.8%","g"), concVol: c("2.9%","g"),
    grossExp: c("0.54×","m"), netExp: c("0.19×","m"),
    plMTD: c("+$1.9m","g","P&L MTD"), drawdown: c("−$0.4m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  // ── PCC ──
  {
    id: "PCC:ST_RATES", bookId: "pcc", code: "ST_RATES", name: "Short-term Rates",
    hasSubs: true, indent: "strat",
    var95: c("~0.57","m"), cvar99: c("~1.29","m"),
    dv01Agg: c("−$180k","g"), dv01USD: c("−$80k"), dv01EUR: c("−$60k"), dv01GBP: c("−$40k"), dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.12"), div: emM,
    concAgg: emM, concSName: emM, concSC: emM, concVol: emM,
    grossExp: c("0.88×","m"), netExp: c("0.26×","m"),
    plMTD: c("+$6.2m","g","P&L MTD"), drawdown: c("−$0.9m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "PCC:AUT_GER_OEM", bookId: "pcc", code: "AUT_GER_OEM", name: "German Auto OEM",
    hasSubs: true, indent: "strat",
    var95: c("~0.13","m"), cvar99: c("~0.76","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.79"), div: emM,
    concAgg: c("3.8%","g"), concSName: c("3.8%","g"), concSC: c("11.2%","g"), concVol: c("4.1%","g"),
    grossExp: c("0.52×","m"), netExp: c("0.14×","m"),
    plMTD: c("+$1.4m","g","P&L MTD"), drawdown: c("−$0.3m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "PCC:CMPT_CH", bookId: "pcc", code: "CMPT_CH", name: "CMPT China",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.25","m"), cvar99: c("~0.57","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.44"), div: emM,
    concAgg: c("3.2%","g"), concSName: c("3.2%","g"), concSC: c("7.4%","g"), concVol: c("2.1%","g"),
    grossExp: c("0.66×","m"), netExp: c("0.20×","m"),
    plMTD: c("+$2.8m","g","P&L MTD"), drawdown: c("−$0.6m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "PCC:CMPT_GLB", bookId: "pcc", code: "CMPT_GLB", name: "CMPT Global",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.25","m"), cvar99: c("~0.55","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.61"), div: emM,
    concAgg: c("2.9%","g"), concSName: c("2.9%","g"), concSC: c("5.8%","g"), concVol: c("1.7%","g"),
    grossExp: c("0.71×","m"), netExp: c("0.22×","m"),
    plMTD: c("+$3.2m","g","P&L MTD"), drawdown: c("−$0.7m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "PCC:FX_CNH", bookId: "pcc", code: "FX_CNH", name: "FX CNH",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.26","m"), cvar99: c("~0.56","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.29"), div: emM,
    concAgg: emM, concSName: emM, concSC: emM, concVol: emM,
    grossExp: c("0.48×","m"), netExp: c("0.11×","m"),
    plMTD: c("+$2.1m","g","P&L MTD"), drawdown: c("−$0.5m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "PCC:ENRG_CH", bookId: "pcc", code: "ENRG_CH", name: "Energy China",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.15","m"), cvar99: c("~0.44","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.38"), div: emM,
    concAgg: c("2.1%","g"), concSName: c("2.1%","g"), concSC: c("4.8%","g"), concVol: c("1.4%","g"),
    grossExp: c("0.52×","m"), netExp: c("0.16×","m"),
    plMTD: c("+$1.6m","g","P&L MTD"), drawdown: c("−$0.4m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  // ── FBAUT ──
  {
    id: "FBAUT:EQ_TECH", bookId: "fbaut", code: "EQ_TECH", name: "Equity Tech",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.21","m"), cvar99: c("~0.41","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("1.14","a"), div: emM,
    concAgg: c("4.9%","a"), concSName: c("4.9%","a"), concSC: c("9.8%","g"), concVol: c("3.2%","g"),
    grossExp: c("1.38×","m"), netExp: c("0.42×","m"),
    plMTD: c("+$4.8m","g","P&L MTD"), drawdown: c("−$1.1m","g","Drawdown"), revTime: c("Weekly","a"),
    status: "adv",
  },
  {
    id: "FBAUT:EQ_INDEX", bookId: "fbaut", code: "EQ_INDEX", name: "Equity Index",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.14","m"), cvar99: c("~0.37","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.98"), div: emM,
    concAgg: c("1.8%","g"), concSName: c("1.2%","g"), concSC: c("1.8%","g"), concVol: c("0.9%","g"),
    grossExp: c("0.82×","m"), netExp: c("0.28×","m"),
    plMTD: c("+$3.1m","g","P&L MTD"), drawdown: c("−$0.6m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "FBAUT:INV_ARG", bookId: "fbaut", code: "INV_ARG", name: "EM Argentina",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.16","m"), cvar99: c("~0.37","m"),
    dv01Agg: c("−$28k","g"), dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: c("−$28k"), dv01BRL: emM,
    vega: emM, betaNDX: c("0.22"), div: emM,
    concAgg: c("4.8%","a"), concSName: c("4.8%","a"), concSC: c("8.1%","g"), concVol: c("5.2%","a"),
    grossExp: c("0.44×","m"), netExp: c("0.18×","m"),
    plMTD: c("+$1.8m","g","P&L MTD"), drawdown: c("−$0.3m","g","Drawdown"), revTime: c("Weekly","a"),
    status: "adv",
  },
  {
    id: "FBAUT:GLB_CMPT", bookId: "fbaut", code: "GLB_CMPT", name: "Global CMPT",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.21","m"), cvar99: c("~0.45","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.55"), div: emM,
    concAgg: c("3.1%","g"), concSName: c("2.8%","g"), concSC: c("3.1%","g"), concVol: c("1.6%","g"),
    grossExp: c("0.64×","m"), netExp: c("0.19×","m"),
    plMTD: c("+$2.6m","g","P&L MTD"), drawdown: c("−$0.5m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
  {
    id: "FBAUT:LEAD", bookId: "fbaut", code: "LEAD", name: "Lead Macro",
    hasSubs: false, indent: "stratDeep",
    var95: c("~0.24","m"), cvar99: c("~0.43","m"),
    dv01Agg: emM, dv01USD: emM, dv01EUR: emM, dv01GBP: emM, dv01JPY: emM, dv01ARS: emM, dv01BRL: emM,
    vega: emM, betaNDX: c("0.34"), div: emM,
    concAgg: c("2.4%","g"), concSName: c("1.9%","g"), concSC: c("2.4%","g"), concVol: c("1.1%","g"),
    grossExp: c("0.56×","m"), netExp: c("0.21×","m"),
    plMTD: c("+$3.4m","g","P&L MTD"), drawdown: c("−$0.8m","g","Drawdown"), revTime: c("Monthly","m"),
    status: "clear",
  },
];

/* ── Sub-positions ── */
const SUBS: SubRow[] = [
  { id: "rgaut-st-rates-1", parentId: "RGAUT:ST_RATES", name: "USD 2Y Swap",
    var95: "0.41", cvar99: "0.98",
    dv01Agg: "−$340k", dv01USD: "−$340k", dv01EUR: "—", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—",
    vega: "—", betaNDX: "0.04",
    plMTD: c("+$4.1m","g") },
  { id: "rgaut-st-rates-2", parentId: "RGAUT:ST_RATES", name: "EUR 5Y Swaption",
    var95: "0.52", cvar99: "1.21",
    dv01Agg: "−$380k", dv01USD: "—", dv01EUR: "−$380k", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—",
    vega: "−$300k", betaNDX: "0.09",
    plMTD: c("+$6.2m","g") },
  { id: "rgaut-st-rates-3", parentId: "RGAUT:ST_RATES", name: "GBP Duration Hedge",
    var95: "0.20", cvar99: "0.40",
    dv01Agg: "−$180k", dv01USD: "—", dv01EUR: "—", dv01GBP: "−$180k", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—",
    vega: "—", betaNDX: "0.05",
    plMTD: em },
  { id: "pcc-aut-ger-oem-1", parentId: "PCC:AUT_GER_OEM", name: "BMW AG",
    var95: "0.04", cvar99: "0.26",
    dv01Agg: "—", dv01USD: "—", dv01EUR: "—", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—",
    vega: "—", betaNDX: "0.86",
    plMTD: c("+$0.6m","g") },
  { id: "pcc-aut-ger-oem-2", parentId: "PCC:AUT_GER_OEM", name: "Mercedes-Benz",
    var95: "0.05", cvar99: "0.28",
    dv01Agg: "—", dv01USD: "—", dv01EUR: "—", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—",
    vega: "—", betaNDX: "0.71",
    plMTD: c("+$0.5m","g") },
  { id: "pcc-aut-ger-oem-3", parentId: "PCC:AUT_GER_OEM", name: "Porsche AG",
    var95: "0.04", cvar99: "0.22",
    dv01Agg: "—", dv01USD: "—", dv01EUR: "—", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—",
    vega: "—", betaNDX: "0.68",
    plMTD: c("+$0.3m","g") },
];

/* ── Risk Factors ── */
interface RFCard {
  id: string;
  title: string;
  strategy: string;
  status: Status;
  rows: { label: string; value: string; color?: VC }[];
  barPct: number;
  note?: string;
}

const RISK_FACTORS: RFCard[] = [
  { id: "rf1", title: "DV01 Limit", strategy: "RGAUT:ST_RATES · Market Risk", status: "breach",
    rows: [
      { label: "Current value", value: "−$900k", color: "r" },
      { label: "Limit", value: "−$600k" },
      { label: "% of limit used", value: "150%", color: "r" },
    ], barPct: 100, note: "Breached 3 days ago · No action logged" },
  { id: "rf2", title: "Vega Limit", strategy: "RGAUT:ST_RATES · Market Risk", status: "breach",
    rows: [
      { label: "Current value", value: "−$300k", color: "r" },
      { label: "Limit", value: "−$200k" },
      { label: "% of limit used", value: "150%", color: "r" },
    ], barPct: 100, note: "Breached 3 days ago · No action logged" },
  { id: "rf3", title: "P&L Drawdown", strategy: "AMF Fund · P&L Review", status: "adv",
    rows: [
      { label: "Current drawdown", value: "−$23.5m", color: "a" },
      { label: "Advisory level (50%)", value: "−$20.0m" },
      { label: "Hard limit", value: "−$40.0m" },
    ], barPct: 59, note: "59% of hard limit used" },
  { id: "rf4", title: "VaR 95% — Fund", strategy: "AMF Fund · Market Risk", status: "clear",
    rows: [
      { label: "Current", value: "1.83", color: "g" },
      { label: "Limit", value: "3.00" },
      { label: "% of limit used", value: "61%", color: "g" },
    ], barPct: 61 },
  { id: "rf5", title: "Gross Exposure", strategy: "AMF Fund · Leverage", status: "clear",
    rows: [
      { label: "Current", value: "1.84×", color: "g" },
      { label: "Limit", value: "2.50×" },
      { label: "% of limit used", value: "74%", color: "g" },
    ], barPct: 74 },
  { id: "rf6", title: "Single Name Concentration", strategy: "RGAUT:EU_AUTO · Concentration", status: "monitor",
    rows: [
      { label: "Largest single name", value: "4.2%" },
      { label: "Threshold", value: "5.0%" },
      { label: "Status", value: "Monitor only", color: "m" },
    ], barPct: 84 },
  { id: "rf7", title: "Beta vs NDX", strategy: "RGAUT:EQ_TECH · Market Risk", status: "monitor",
    rows: [
      { label: "Current beta", value: "1.14" },
      { label: "Threshold (advisory)", value: "1.20" },
      { label: "Status", value: "Monitor only", color: "m" },
    ], barPct: 95 },
  { id: "rf8", title: "Net Exposure", strategy: "PCC:AUT_GER_OEM · Leverage", status: "clear",
    rows: [
      { label: "Current", value: "0.14×", color: "g" },
      { label: "Limit", value: "0.40×" },
      { label: "% of limit used", value: "35%", color: "g" },
    ], barPct: 35 },
];

/* ── Bar fill color by status ── */
const BAR_COLOR: Record<Status, string> = {
  clear: "bg-emerald-500", adv: "bg-amber-500", breach: "bg-rose-500",
  monitor: "bg-emerald-500", ack: "bg-amber-400",
};

/* ══════════════════════════════════════════════════════════════════════════════
   COMPONENTS
══════════════════════════════════════════════════════════════════════════════ */

/* ── TH styles ── */
const TH = "h-8 px-3 text-right font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 whitespace-nowrap border-b border-white/[0.07] bg-[#0d0b1a]";
const TH_L = "h-8 px-3 text-left font-mono text-[10px] font-semibold uppercase tracking-widest text-white/30 whitespace-nowrap border-b border-white/[0.07] bg-[#0d0b1a]";
const TH_CUR = "bg-blue-500/[0.06] border-l border-white/[0.07]";
const TH_CONC = "bg-violet-500/[0.06] border-l border-white/[0.07]";
const TD_CUR = "bg-blue-500/[0.03] border-l border-white/[0.05]";
const TD_CONC = "bg-violet-500/[0.03] border-l border-white/[0.05]";
const TD_R = "px-3 text-right";
const TD_L = "px-3 text-left";

/* ── RiskGrid ── */
function RiskGrid({
  dv01On, concOn, breachFilter,
  bookOpen, subOpen, ackedStrategies,
  onToggleBook, onToggleSub, onOpenChart,
  onExportCSV,
}: {
  dv01On: boolean; concOn: boolean; breachFilter: boolean;
  bookOpen: Record<string, boolean>; subOpen: Record<string, boolean>;
  ackedStrategies: Set<string>;
  onToggleBook: (id: string) => void;
  onToggleSub: (id: string) => void;
  onOpenChart: (stratId: string, metric: string) => void;
  onExportCSV: () => void;
}) {
  const mktCols = 3 + (dv01On ? 6 : 1) + 3;
  const concCols = concOn ? 3 : 1;

  const visibleStrategies = breachFilter
    ? STRATEGIES.filter(s => s.status === "breach" || s.status === "adv")
    : STRATEGIES;

  function stratStatus(s: StratRow): Status {
    return ackedStrategies.has(s.id) ? "ack" : s.status;
  }

  interface DV01Row { dv01Agg: Cell; dv01USD: string; dv01EUR: string; dv01GBP: string; dv01JPY: string; dv01ARS: string; dv01BRL: string; }

  function renderDV01Cells(row: DV01Row, tdClass = "") {
    const base = `${TD_R} h-8 px-3 align-middle`;
    if (!dv01On) {
      return <td className={`${base} ${tdClass}`}><Cv cell={row.dv01Agg} /></td>;
    }
    return (
      <>
        <td className={`${base} ${TD_CUR}`}><span className="font-mono text-[11px] text-white/40">{row.dv01USD}</span></td>
        <td className={`${base} ${TD_CUR}`}><span className="font-mono text-[11px] text-white/40">{row.dv01EUR}</span></td>
        <td className={`${base} ${TD_CUR}`}><span className="font-mono text-[11px] text-white/40">{row.dv01GBP}</span></td>
        <td className={`${base} ${TD_CUR}`}><span className="font-mono text-[11px] text-white/40">{row.dv01JPY}</span></td>
        <td className={`${base} ${TD_CUR}`}><span className="font-mono text-[11px] text-white/40">{row.dv01ARS}</span></td>
        <td className={`${base} ${TD_CUR}`}><span className="font-mono text-[11px] text-white/40">{row.dv01BRL}</span></td>
      </>
    );
  }

  function renderConcCells(row: StratRow, tdClass = "") {
    const base = `${TD_R} h-8 px-3 align-middle`;
    if (!concOn) {
      return <td className={`${base} ${tdClass}`}><Cv cell={row.concAgg} /></td>;
    }
    return (
      <>
        <td className={`${base} ${TD_CONC}`}><Cv cell={row.concSName} /></td>
        <td className={`${base} ${TD_CONC}`}><Cv cell={row.concSC} /></td>
        <td className={`${base} ${TD_CONC}`}><Cv cell={row.concVol} /></td>
      </>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full border-collapse" style={{ fontSize: "12px" }}>
        <thead>
          {/* Group header row */}
          <tr>
            <th className={`${TH_L} sticky top-0 z-20`} />
            <th className={`${TH} sticky top-0 z-20 border-l border-white/[0.07] text-center`} colSpan={mktCols}>
              Market Risk
            </th>
            <th className={`${TH} sticky top-0 z-20 border-l border-white/[0.07] text-center ${concOn ? "bg-violet-500/[0.06]" : ""}`} colSpan={concCols}>
              Concentration
            </th>
            <th className={`${TH} sticky top-0 z-20 border-l border-white/[0.07] text-center`} colSpan={2}>
              Leverage
            </th>
            <th className={`${TH} sticky top-0 z-20 border-l border-white/[0.07] text-center`} colSpan={3}>
              P&amp;L Review
            </th>
            <th className={`${TH} sticky top-0 z-20`} />
          </tr>
          {/* Metric header row */}
          <tr>
            <th className={`${TH_L} sticky top-8 z-20 min-w-[220px]`}>Strategy</th>
            <th className={`${TH} sticky top-8 z-20`}>VaR 95%</th>
            <th className={`${TH} sticky top-8 z-20`}>CVaR 99%</th>
            {!dv01On ? (
              <th className={`${TH} sticky top-8 z-20`}>
                <button
                  onClick={() => {/* handled in toolbar */}}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50"
                >
                  DV01 <CaretRight size={8} />
                </button>
              </th>
            ) : (
              <>
                <th className={`${TH} ${TH_CUR} sticky top-8 z-20`}>USD</th>
                <th className={`${TH} ${TH_CUR} sticky top-8 z-20`}>EUR</th>
                <th className={`${TH} ${TH_CUR} sticky top-8 z-20`}>GBP</th>
                <th className={`${TH} ${TH_CUR} sticky top-8 z-20`}>JPY</th>
                <th className={`${TH} ${TH_CUR} sticky top-8 z-20`}>ARS</th>
                <th className={`${TH} ${TH_CUR} sticky top-8 z-20`}>BRL</th>
              </>
            )}
            <th className={`${TH} sticky top-8 z-20`}>Vega $</th>
            <th className={`${TH} sticky top-8 z-20`}>Beta NDX</th>
            <th className={`${TH} sticky top-8 z-20`}>Div</th>
            {!concOn ? (
              <th className={`${TH} sticky top-8 z-20`}>
                <button className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-white/30 hover:text-white/50">
                  CONC <CaretRight size={8} />
                </button>
              </th>
            ) : (
              <>
                <th className={`${TH} ${TH_CONC} sticky top-8 z-20`}>S.Name</th>
                <th className={`${TH} ${TH_CONC} sticky top-8 z-20`}>S/C</th>
                <th className={`${TH} ${TH_CONC} sticky top-8 z-20`}>Vol</th>
              </>
            )}
            <th className={`${TH} sticky top-8 z-20`}>Gross Exp</th>
            <th className={`${TH} sticky top-8 z-20`}>Net Exp</th>
            <th className={`${TH} sticky top-8 z-20 cursor-pointer hover:text-white/50`} onClick={() => onOpenChart("AMF","P&L MTD")}>P&amp;L MTD</th>
            <th className={`${TH} sticky top-8 z-20 cursor-pointer hover:text-white/50`} onClick={() => onOpenChart("AMF","Drawdown")}>Drawdown</th>
            <th className={`${TH} sticky top-8 z-20`}>Rev Time</th>
            <th className={`${TH} sticky top-8 z-20 text-center`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* ── FUND ROW ── */}
          <tr className="group">
            <td className="h-10 px-3 bg-white/[0.07] border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white/90">AMF</span>
                <span className="text-xs text-white/50">Autonomy Macro Fund</span>
              </div>
            </td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("1.83","a")} onClick={() => onOpenChart("AMF","VaR 95%")} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("3.94","a")} onClick={() => onOpenChart("AMF","CVaR 99%")} /></td>
            {renderDV01Cells({ dv01Agg: em, dv01USD: "—", dv01EUR: "—", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—" }, "bg-white/[0.07] border-b border-white/[0.08]")}
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={em} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("0.42")} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("0.68","g")} /></td>
            {concOn ? (
              <>
                <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08] ${TD_CONC}`}><Cv cell={c("4.2%","g")} /></td>
                <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08] ${TD_CONC}`}><Cv cell={c("8.1%","g")} /></td>
                <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08] ${TD_CONC}`}><Cv cell={c("2.3%","g")} /></td>
              </>
            ) : (
              <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("4.2%","g")} /></td>
            )}
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("1.84×","a")} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("0.31×")} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("+$38.2m","g")} onClick={() => onOpenChart("AMF","P&L MTD")} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("−$23.5m","r")} onClick={() => onOpenChart("AMF","Drawdown")} /></td>
            <td className={`h-10 ${TD_R} bg-white/[0.07] border-b border-white/[0.08]`}><Cv cell={c("Monthly","m")} /></td>
            <td className={`h-10 text-center bg-white/[0.07] border-b border-white/[0.08]`}><StatusPill status="adv" /></td>
          </tr>

          {/* ── BOOKS + STRATEGIES ── */}
          {BOOKS.map(book => {
            const bookStrats = visibleStrategies.filter(s => s.bookId === book.id);
            if (breachFilter && bookStrats.length === 0) return null;
            return (
              <Fragment key={book.id}>
                {/* Book row */}
                <tr>
                  <td className="h-9 px-3 bg-white/[0.04] border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <ExpandBtn open={bookOpen[book.id]} onClick={() => onToggleBook(book.id)} />
                      <span className="font-mono text-[11px] font-bold text-white/80">{book.code}</span>
                      <span className="text-[11px] text-white/40">{book.name}</span>
                      <StatusPill status={book.bookStatus} />
                    </div>
                  </td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.var95} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.cvar99} /></td>
                  {renderDV01Cells({ dv01Agg: em, dv01USD: "—", dv01EUR: "—", dv01GBP: "—", dv01JPY: "—", dv01ARS: "—", dv01BRL: "—" }, "bg-white/[0.04] border-b border-white/[0.06]")}
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={em} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.betaNDX} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.div} /></td>
                  {concOn ? (
                    <>
                      <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06] ${TD_CONC}`}><Cv cell={book.concSName} /></td>
                      <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06] ${TD_CONC}`}><Cv cell={book.concSC} /></td>
                      <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06] ${TD_CONC}`}><Cv cell={book.concVol} /></td>
                    </>
                  ) : (
                    <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.concAgg} /></td>
                  )}
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.grossExp} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.netExp} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.plMTD} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.drawdown} /></td>
                  <td className={`h-9 ${TD_R} bg-white/[0.04] border-b border-white/[0.06]`}><Cv cell={book.revTime} /></td>
                  <td className={`h-9 text-center bg-white/[0.04] border-b border-white/[0.06]`}><StatusPill status={book.status} /></td>
                </tr>

                {/* Strategy rows */}
                {bookOpen[book.id] && bookStrats.map(strat => {
                  const sts = stratStatus(strat);
                  const isAcked = ackedStrategies.has(strat.id);
                  const rowBg = isAcked ? "bg-amber-500/[0.04]" : "hover:bg-white/[0.02]";
                  const subRows = SUBS.filter(s => s.parentId === strat.id);

                  return (
                    <Fragment key={strat.id}>
                      <tr
                        className={`group cursor-pointer transition-colors ${rowBg}`}
                        onClick={() => strat.plMTD.metric && onOpenChart(strat.id, strat.plMTD.metric)}
                      >
                        <td className="h-9 px-3 border-b border-white/[0.04]">
                          <div className={`flex items-center gap-2 ${strat.indent === "strat" ? "pl-5" : "pl-10"}`}>
                            {strat.hasSubs && (
                              <ExpandBtn open={subOpen[strat.id] ?? false} onClick={() => onToggleSub(strat.id)} />
                            )}
                            <span className="font-mono text-[11px] font-semibold text-white/80">{strat.code}</span>
                            <span className="text-[11px] text-white/40">{strat.name}</span>
                          </div>
                        </td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.var95} /></td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.cvar99} /></td>
                        {!dv01On ? (
                          <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}>
                            <Cv cell={strat.dv01Agg} onClick={strat.dv01Agg.metric ? () => onOpenChart(strat.id, strat.dv01Agg.metric!) : undefined} />
                          </td>
                        ) : (
                          <>
                            <td className={`h-9 ${TD_R} border-b border-white/[0.04] ${TD_CUR}`}><Cv cell={strat.dv01USD} /></td>
                            <td className={`h-9 ${TD_R} border-b border-white/[0.04] ${TD_CUR}`}><Cv cell={strat.dv01EUR} /></td>
                            <td className={`h-9 ${TD_R} border-b border-white/[0.04] ${TD_CUR}`}><Cv cell={strat.dv01GBP} /></td>
                            <td className={`h-9 ${TD_R} border-b border-white/[0.04] ${TD_CUR}`}><Cv cell={strat.dv01JPY} /></td>
                            <td className={`h-9 ${TD_R} border-b border-white/[0.04] ${TD_CUR}`}><Cv cell={strat.dv01ARS} /></td>
                            <td className={`h-9 ${TD_R} border-b border-white/[0.04] ${TD_CUR}`}><Cv cell={strat.dv01BRL} /></td>
                          </>
                        )}
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}>
                          <Cv cell={strat.vega} onClick={strat.vega.metric ? () => onOpenChart(strat.id, strat.vega.metric!) : undefined} />
                        </td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.betaNDX} /></td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.div} /></td>
                        {renderConcCells(strat, "border-b border-white/[0.04]")}
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.grossExp} /></td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.netExp} /></td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}>
                          <Cv cell={strat.plMTD} onClick={strat.plMTD.metric ? () => onOpenChart(strat.id, strat.plMTD.metric!) : undefined} />
                        </td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}>
                          <Cv cell={strat.drawdown} onClick={strat.drawdown.metric ? () => onOpenChart(strat.id, strat.drawdown.metric!) : undefined} />
                        </td>
                        <td className={`h-9 ${TD_R} border-b border-white/[0.04]`}><Cv cell={strat.revTime} /></td>
                        <td className="h-9 text-center border-b border-white/[0.04]"><StatusPill status={sts} /></td>
                      </tr>

                      {/* Sub-position rows */}
                      {subOpen[strat.id] && subRows.map(sub => (
                        <tr key={sub.id} className="hover:bg-white/[0.015] transition-colors">
                          <td className="h-8 px-3 pl-[52px] border-b border-white/[0.03]">
                            <span className="text-[11px] text-white/35">{sub.name}</span>
                          </td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">{sub.var95}</span></td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">{sub.cvar99}</span></td>
                          {!dv01On ? (
                            <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">{sub.dv01Agg}</span></td>
                          ) : (
                            <>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CUR}`}><span className="font-mono text-[11px] text-white/35">{sub.dv01USD}</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CUR}`}><span className="font-mono text-[11px] text-white/35">{sub.dv01EUR}</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CUR}`}><span className="font-mono text-[11px] text-white/35">{sub.dv01GBP}</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CUR}`}><span className="font-mono text-[11px] text-white/35">{sub.dv01JPY}</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CUR}`}><span className="font-mono text-[11px] text-white/35">{sub.dv01ARS}</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CUR}`}><span className="font-mono text-[11px] text-white/35">{sub.dv01BRL}</span></td>
                            </>
                          )}
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">{sub.vega}</span></td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">{sub.betaNDX}</span></td>
                          {/* div + conc cols */}
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                          {concOn ? (
                            <>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CONC}`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CONC}`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                              <td className={`h-8 ${TD_R} border-b border-white/[0.03] ${TD_CONC}`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                            </>
                          ) : (
                            <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                          )}
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><Cv cell={sub.plMTD} /></td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                          <td className={`h-8 ${TD_R} border-b border-white/[0.03]`}><span className="font-mono text-[11px] text-white/35">—</span></td>
                          <td className="h-8 border-b border-white/[0.03]" />
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Risk Factors Pane ── */
function RiskFactorsPane() {
  return (
    <div className="h-full overflow-auto p-5">
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {RISK_FACTORS.map(card => (
          <div
            key={card.id}
            className={`rounded-xl border bg-white/[0.03] overflow-hidden transition-colors ${
              card.status === "breach" ? "border-rose-500/25" :
              card.status === "adv" ? "border-amber-500/25" : "border-white/[0.07]"
            }`}
          >
            <div className="flex items-start justify-between p-3 border-b border-white/[0.06]">
              <div>
                <p className="text-xs font-semibold text-white/80">{card.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/30">{card.strategy}</p>
              </div>
              <StatusPill status={card.status} />
            </div>
            <div className="space-y-2 p-3">
              {card.rows.map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-[11px] text-white/40">{row.label}</span>
                  <span className={`font-mono text-[11px] font-medium ${row.color ? TEXT[row.color] : "text-white/70"}`}>{row.value}</span>
                </div>
              ))}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLOR[card.status]}`}
                  style={{ width: `${Math.min(card.barPct, 100)}%` }}
                />
              </div>
              {card.note && <p className="text-[10px] text-white/30">{card.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Recommendations Pane ── */
function RecommendationsPane() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-white/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.07]">
        <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
          <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
        </svg>
      </div>
      <p className="text-sm font-semibold text-white/40">Trade Recommendations</p>
      <p className="max-w-[280px] text-center text-xs leading-relaxed text-white/25">
        Analyst requirements are being gathered. This screen will centralise all trade ideas, target levels, timescales, and recommendation status.
      </p>
    </div>
  );
}

/* ── Chart Panel ── */
interface ChartPanelProps {
  stratId: string;
  metric: string;
  status: Status;
  ackNote: string;
  onAckNoteChange: (v: string) => void;
  onLogAction: () => void;
  onClose: () => void;
}

function ChartPanel({ stratId, metric, status, ackNote, onAckNoteChange, onLogAction, onClose }: ChartPanelProps) {
  const isBreaching = status === "breach";
  const isAcked = status === "ack";

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 32 }}
      className="fixed right-0 top-0 bottom-0 z-50 flex w-[380px] flex-col border-l border-white/[0.07]"
      style={{ background: "rgb(12,10,22)" }}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-start justify-between border-b border-white/[0.07] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white/90">{metric} · History</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/30">{stratId} · 90 days</p>
        </div>
        <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.10] text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Stats strip */}
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-white/[0.07]">
          {[
            { label: "Current", value: isBreaching || isAcked ? "2.59" : "1.83", color: isBreaching ? "text-rose-400" : "text-white/80" },
            { label: "30d Avg", value: "2.14", color: "text-white/70" },
            { label: "Limit", value: "2.00", color: "text-white/70" },
          ].map((s, i) => (
            <div key={i} className={`flex flex-col gap-1.5 p-3 bg-white/[0.03] ${i > 0 ? "border-l border-white/[0.07]" : ""}`}>
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">{s.label}</span>
              <span className={`font-mono text-base font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* SVG chart */}
        <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <svg viewBox="0 0 340 120" width="100%" height="120" preserveAspectRatio="none">
            <line x1="0" y1="90" x2="340" y2="90" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"/>
            <line x1="0" y1="60" x2="340" y2="60" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"/>
            <line x1="0" y1="30" x2="340" y2="30" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1"/>
            {/* Limit line */}
            <line x1="0" y1="52" x2="340" y2="52" stroke="rgb(251,113,133)" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="5,4"/>
            {/* Area */}
            <path d="M0,100 L28,94 L56,88 L85,82 L113,85 L142,77 L170,72 L198,67 L227,64 L255,57 L284,50 L312,43 L340,37 L340,115 L0,115 Z"
              fill="rgb(251,113,133)" fillOpacity="0.07"/>
            {/* Line */}
            <path d="M0,100 L28,94 L56,88 L85,82 L113,85 L142,77 L170,72 L198,67 L227,64 L255,57 L284,50 L312,43 L340,37"
              fill="none" stroke="rgb(251,113,133)" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="340" cy="37" r="3" fill="rgb(251,113,133)"/>
            <text x="6" y="113" fontFamily="monospace" fontSize="8" fill="currentColor" fillOpacity="0.3">90d ago</text>
            <text x="302" y="113" fontFamily="monospace" fontSize="8" fill="currentColor" fillOpacity="0.3">today</text>
            <text x="4" y="55" fontFamily="monospace" fontSize="8" fill="rgb(251,113,133)" fillOpacity="0.6">limit</text>
          </svg>
        </div>

        {/* Breach ack box */}
        {(isBreaching || isAcked) && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">
                {isAcked ? "Action logged" : "Limit breach — action required"}
              </span>
              <StatusPill status={isAcked ? "ack" : "breach"} />
            </div>
            <textarea
              value={ackNote}
              onChange={e => onAckNoteChange(e.target.value)}
              disabled={isAcked}
              placeholder="Describe action taken (e.g. reduced position by 30%)…"
              className="w-full resize-none rounded-lg border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-xs text-white/70 placeholder:text-white/25 outline-none transition-colors focus:border-white/25 disabled:opacity-50"
              rows={3}
            />
            <div className="flex items-center gap-2">
              {!isAcked && (
                <button
                  onClick={onLogAction}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-xs font-semibold text-black transition-colors hover:bg-white"
                >
                  Log action
                </button>
              )}
              {isAcked && (
                <span className="text-xs text-white/30">Logged</span>
              )}
              <button className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.10] px-3 text-xs text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/70">
                Escalate to risk
              </button>
            </div>
          </div>
        )}

        {/* Drawdown analysis */}
        <div className="overflow-hidden rounded-xl border border-white/[0.07]">
          <div className="border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Drawdown Analysis</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06]">
            {[
              { label: "Max Drawdown", value: "−$23.5m", color: "text-rose-400" },
              { label: "Started", value: "12 Mar 2026", color: "text-white/70" },
              { label: "Days in DD", value: "55 days", color: "text-white/70" },
              { label: "Recovery", value: "Not yet", color: "text-white/30" },
            ].map((row, i) => (
              <div key={i} className="bg-white/[0.02] px-4 py-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-white/30">{row.label}</p>
                <p className={`mt-1 font-mono text-sm font-bold ${row.color}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════════════ */

export default function PortfolioMonitorPage() {
  const [tab, setTab] = useState<Tab>("portfolio");
  const [dv01On, setDv01On] = useState(false);
  const [concOn, setConcOn] = useState(false);
  const [breachFilter, setBreachFilter] = useState(false);
  const [bookOpen, setBookOpen] = useState<Record<string, boolean>>({ rgaut: true, pcc: true, fbaut: true });
  const [subOpen, setSubOpen] = useState<Record<string, boolean>>({});
  const [chartStratId, setChartStratId] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<string | null>(null);
  const [ackedStrategies, setAckedStrategies] = useState<Set<string>>(new Set());
  const [ackNotes, setAckNotes] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const toggleBook = useCallback((id: string) => {
    setBookOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSub = useCallback((id: string) => {
    setSubOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const openChart = useCallback((stratId: string, metric: string) => {
    setChartStratId(stratId);
    setChartMetric(metric);
  }, []);

  const closeChart = useCallback(() => {
    setChartStratId(null);
    setChartMetric(null);
  }, []);

  const logAction = useCallback(() => {
    if (!chartStratId) return;
    const note = ackNotes[chartStratId] ?? "";
    if (!note.trim()) return;
    setAckedStrategies(prev => new Set([...prev, chartStratId]));
  }, [chartStratId, ackNotes]);

  const doRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1400);
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ["Strategy","VaR 95%","CVaR 99%","DV01","Vega $","Beta NDX","Div","CONC","Gross Exp","Net Exp","P&L MTD","Drawdown","Rev Time","Status"];
    const rows = STRATEGIES.map(s => [
      `${s.code} ${s.name}`, s.var95.v, s.cvar99.v, s.dv01Agg.v, s.vega.v,
      s.betaNDX.v, s.div.v, s.concAgg.v, s.grossExp.v, s.netExp.v,
      s.plMTD.v, s.drawdown.v, s.revTime.v, s.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `stellar-edge-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, []);

  const chartStatus = (): Status => {
    if (!chartStratId) return "clear";
    if (ackedStrategies.has(chartStratId)) return "ack";
    const strat = STRATEGIES.find(s => s.id === chartStratId);
    return strat?.status ?? "clear";
  };

  const breachCount = RISK_FACTORS.filter(f => f.status === "breach" || f.status === "adv").length;

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "portfolio", label: "Portfolio Monitor" },
    { id: "riskfactors", label: "Risk Factors", badge: breachCount },
    { id: "recommendations", label: "Recommendations" },
  ];

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "linear-gradient(144deg, rgb(21,18,37) 15%, rgb(5,5,30) 82%)" }}
    >
      {/* Bg glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 75% 55% at 45% 80%, rgba(30,58,200,0.28) 0%, transparent 68%)" }}
      />

      <StellarHeader />
      <DashboardPageHeader />

      {/* Tab bar */}
      <div className="relative z-10 flex flex-shrink-0 items-center gap-0 border-b border-white/[0.07] px-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex h-11 items-center gap-2 border-b-2 px-0.5 text-[13px] font-medium transition-colors mr-6 ${
              tab === t.id
                ? "border-blue-500 text-white/90"
                : "border-transparent text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500/20 px-1 font-mono text-[10px] font-bold text-rose-400">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar (portfolio tab only) */}
      {tab === "portfolio" && (
        <div className="relative z-10 flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.07] px-6 py-2">
          {/* Book selector */}
          <select className="h-7 rounded-lg border border-white/[0.10] bg-white/[0.04] px-2.5 text-xs text-white/70 outline-none focus:border-white/25">
            <option>All books — Risk view</option>
            <option>RGAUT · Tony&apos;s Book</option>
            <option>PCC · Global Core</option>
            <option>FBAUT · Frontier &amp; EM</option>
          </select>

          <div className="h-4 w-px bg-white/[0.10]" />

          {/* Breach filter */}
          <button
            onClick={() => setBreachFilter(v => !v)}
            className={`flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
              breachFilter
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-white/[0.10] text-white/50 hover:bg-white/[0.04] hover:text-white/70"
            }`}
          >
            <Warning size={12} />
            Breaches only
          </button>

          {/* Expand DV01 */}
          <button
            onClick={() => setDv01On(v => !v)}
            className={`flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
              dv01On
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                : "border-white/[0.10] text-white/50 hover:bg-white/[0.04] hover:text-white/70"
            }`}
          >
            <CaretRight size={12} className={`transition-transform ${dv01On ? "rotate-90" : ""}`} />
            {dv01On ? "Collapse DV01" : "Expand DV01"}
          </button>

          {/* Expand CONC */}
          <button
            onClick={() => setConcOn(v => !v)}
            className={`flex h-7 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
              concOn
                ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                : "border-white/[0.10] text-white/50 hover:bg-white/[0.04] hover:text-white/70"
            }`}
          >
            <CaretRight size={12} className={`transition-transform ${concOn ? "rotate-90" : ""}`} />
            {concOn ? "Collapse CONC" : "Expand CONC"}
          </button>

          <div className="h-4 w-px bg-white/[0.10]" />

          {/* CSV export */}
          <button
            onClick={exportCSV}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.10] px-3 text-xs font-medium text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70"
          >
            <DownloadSimple size={12} />
            CSV
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Refresh */}
          <button onClick={doRefresh} className="flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.10] px-2.5 text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/60">
            <ArrowClockwise size={12} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${refreshing ? "bg-amber-400" : "bg-emerald-400"}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${refreshing ? "bg-amber-400" : "bg-emerald-400"}`} />
            </span>
          </div>

          {/* Alerts */}
          <button className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.10] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/60">
            <Bell size={14} />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>

          <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">
            AMF · 1 fund · 3 books · 22 strategies
          </span>
        </div>
      )}

      {/* Pane content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {tab === "portfolio" && (
          <RiskGrid
            dv01On={dv01On}
            concOn={concOn}
            breachFilter={breachFilter}
            bookOpen={bookOpen}
            subOpen={subOpen}
            ackedStrategies={ackedStrategies}
            onToggleBook={toggleBook}
            onToggleSub={toggleSub}
            onOpenChart={openChart}
            onExportCSV={exportCSV}
          />
        )}
        {tab === "riskfactors" && <RiskFactorsPane />}
        {tab === "recommendations" && <RecommendationsPane />}
      </div>

      {/* Chart slide panel */}
      <AnimatePresence>
        {chartStratId && chartMetric && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChart}
              className="fixed inset-0 z-40 bg-black/20"
            />
            <ChartPanel
              stratId={chartStratId}
              metric={chartMetric}
              status={chartStatus()}
              ackNote={ackNotes[chartStratId] ?? ""}
              onAckNoteChange={v => setAckNotes(prev => ({ ...prev, [chartStratId]: v }))}
              onLogAction={logAction}
              onClose={closeChart}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
