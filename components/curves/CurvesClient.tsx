"use client";

import { useState } from "react";
import {
  MagnifyingGlass,
  Funnel,
  Plus,
  SquaresFour,
  Table,
  CalendarBlank,
  DotsThree,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import StellarHeader from "@/components/StellarHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

type CurveType = "cost" | "scurve";

interface Curve {
  id: string;
  name: string;
  type: CurveType;
  technology: string;
  lastUpdated: string;
  date: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CURVES: Curve[] = [
  { id: "c1",  name: "Global Battery EV Sales",              type: "scurve", technology: "Battery Technology",  lastUpdated: "10:04 Feb 10, 2024", date: "Oct 20, 2025" },
  { id: "c2",  name: "Global Plug-in Hybrid EV Sales",       type: "cost",   technology: "Hybrid Powertrain",   lastUpdated: "10:04 Feb 10, 2024", date: "Oct 20, 2025" },
  { id: "c3",  name: "Global E2W Sales",                     type: "cost",   technology: "Electric Mobility",   lastUpdated: "10:04 Feb 10, 2024", date: "Oct 20, 2025" },
  { id: "c4",  name: "Solar Adoption",                       type: "scurve", technology: "Solar Energy",        lastUpdated: "10:04 Feb 10, 2024", date: "Oct 20, 2025" },
  { id: "c5",  name: "Global Hydrogen Fuel Cell EV Sales",   type: "scurve", technology: "Hydrogen Fuel Cells", lastUpdated: "10:04 Feb 10, 2024", date: "Nov 3, 2025"  },
  { id: "c6",  name: "Global E3W Sales",                     type: "scurve", technology: "Electric Mobility",   lastUpdated: "10:04 Feb 10, 2024", date: "Nov 3, 2025"  },
  { id: "c7",  name: "Renewable Energy Market Growth",       type: "cost",   technology: "Renewable Energy",    lastUpdated: "10:04 Feb 10, 2024", date: "Nov 3, 2025"  },
  { id: "c8",  name: "Autonomous Vehicle Adoption",          type: "scurve", technology: "Autonomous Driving",  lastUpdated: "10:04 Feb 10, 2024", date: "Nov 3, 2025"  },
  { id: "c9",  name: "Charging Infrastructure Expansion",    type: "cost",   technology: "EV Charging",         lastUpdated: "10:04 Feb 10, 2024", date: "Dec 1, 2025"  },
  { id: "c10", name: "Smart Grid Integration",               type: "cost",   technology: "Smart Grid",          lastUpdated: "10:04 Feb 10, 2024", date: "Dec 1, 2025"  },
  { id: "c11", name: "Global Li-ion Cell Production",        type: "scurve", technology: "Battery Technology",  lastUpdated: "10:04 Feb 10, 2024", date: "Dec 1, 2025"  },
  { id: "c12", name: "Nuclear Power Renaissance",            type: "cost",   technology: "Nuclear Energy",      lastUpdated: "10:04 Feb 10, 2024", date: "Dec 1, 2025"  },
];

const PAGE_SIZE = 10;
const TOTAL_PAGES = 10;

// ─── Mini chart thumbnails ────────────────────────────────────────────────────

function MiniCostCurve() {
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="block size-full">
      <rect width="40" height="40" fill="#0a0e1c" rx="6" />
      <line x1="4" y1="14" x2="36" y2="14" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
      <line x1="4" y1="26" x2="36" y2="26" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
      <path
        d="M 4,8 C 12,9 18,18 24,26 C 28,32 33,35 38,36"
        fill="none" stroke="#47cd89" strokeWidth="1.8" strokeLinecap="round"
      />
      <circle cx="4"  cy="8"  r="2" fill="#47cd89" />
      <circle cx="38" cy="36" r="2" fill="#47cd89" />
    </svg>
  );
}

function MiniSCurve() {
  return (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="block size-full">
      <rect width="40" height="40" fill="#0a0e1c" rx="6" />
      <line x1="4" y1="14" x2="36" y2="14" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
      <line x1="4" y1="26" x2="36" y2="26" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
      <path
        d="M 4,36 C 10,36 14,30 20,20 C 26,10 30,5 36,4"
        fill="none" stroke="#f38744" strokeWidth="1.8" strokeLinecap="round"
      />
      <circle cx="4"  cy="36" r="2" fill="#f38744" />
      <circle cx="36" cy="4"  r="2" fill="#f38744" />
    </svg>
  );
}

// ─── Full-size chart thumbnails (grid view) ───────────────────────────────────

function CostCurveSvg() {
  return (
    <svg viewBox="0 0 264 154" xmlns="http://www.w3.org/2000/svg" className="block size-full">
      <rect width="264" height="154" fill="#0a0e1c" />
      <line x1="8" y1="38"  x2="256" y2="38"  stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
      <line x1="8" y1="77"  x2="256" y2="77"  stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
      <line x1="8" y1="116" x2="256" y2="116" stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
      <line x1="66"  y1="8" x2="66"  y2="146" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
      <line x1="132" y1="8" x2="132" y2="146" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
      <line x1="198" y1="8" x2="198" y2="146" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
      <path d="M 12,22 C 52,24 76,56 108,84 C 138,110 180,130 250,133" fill="none" stroke="#47cd89" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12"  cy="22"  r="4" fill="#47cd89" />
      <circle cx="64"  cy="40"  r="4" fill="#47cd89" />
      <circle cx="120" cy="86"  r="4" fill="#47cd89" />
      <circle cx="186" cy="124" r="4" fill="#47cd89" />
      <circle cx="250" cy="133" r="4" fill="#47cd89" />
    </svg>
  );
}

function SCurveSvg() {
  return (
    <svg viewBox="0 0 264 154" xmlns="http://www.w3.org/2000/svg" className="block size-full">
      <rect width="264" height="154" fill="#0a0e1c" />
      <line x1="8" y1="38"  x2="256" y2="38"  stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
      <line x1="8" y1="77"  x2="256" y2="77"  stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
      <line x1="8" y1="116" x2="256" y2="116" stroke="rgba(255,255,255,0.07)" strokeDasharray="4 4" />
      <line x1="66"  y1="8" x2="66"  y2="146" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
      <line x1="132" y1="8" x2="132" y2="146" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
      <line x1="198" y1="8" x2="198" y2="146" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
      <path d="M 12,138 C 46,138 66,126 96,106 C 126,84 150,44 182,26 C 208,14 234,14 250,14" fill="none" stroke="#f38744" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="12"  cy="138" r="4" fill="#f38744" />
      <circle cx="66"  cy="124" r="4" fill="#f38744" />
      <circle cx="132" cy="70"  r="4" fill="#f38744" />
      <circle cx="192" cy="22"  r="4" fill="#f38744" />
      <circle cx="250" cy="14"  r="4" fill="#f38744" />
    </svg>
  );
}

// ─── Grid card ────────────────────────────────────────────────────────────────

function CurveCard({ curve }: { curve: Curve }) {
  return (
    <div className="group flex flex-col cursor-pointer overflow-hidden rounded-[22px] bg-white/[0.04] transition-all duration-150 hover:bg-white/[0.07] hover:-translate-y-0.5">
      <div className="aspect-[264/154] w-full shrink-0">
        {curve.type === "cost" ? <CostCurveSvg /> : <SCurveSvg />}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <span className={["inline-flex w-max items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", curve.type === "cost" ? "border-[#47cd89] text-[#75e0a7]" : "border-[#f38744] text-[#f7b27a]"].join(" ")}>
          {curve.type === "cost" ? "Cost-Curve" : "S-Curve"}
        </span>
        <p className="truncate text-sm font-medium text-[#f7f7f7]">{curve.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-[#cecfd2]/75">
          <CalendarBlank size={13} weight="regular" className="shrink-0" />
          <span>{curve.date}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Table view ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: CurveType }) {
  return (
    <span className={["inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap", type === "cost" ? "border-[#47cd89] text-[#75e0a7]" : "border-[#f38744] text-[#f7b27a]"].join(" ")}>
      {type === "cost" ? "Cost-Curve" : "S-Curve"}
    </span>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white/60 whitespace-nowrap">
      {label}
    </span>
  );
}

function Pagination({ page, onPage }: { page: number; onPage: (p: number) => void }) {
  const pages = [1, 2, 3, "...", 8, 9, 10];
  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <button
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:border-white/30 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft size={13} />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-white/30">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                page === p
                  ? "bg-white text-zinc-900"
                  : "text-white/50 hover:bg-white/[0.08] hover:text-white/80",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPage(Math.min(TOTAL_PAGES, page + 1))}
        disabled={page === TOTAL_PAGES}
        className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:border-white/30 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
        <ArrowRight size={13} />
      </button>
    </div>
  );
}

function TableView({ curves }: { curves: Curve[] }) {
  const [page, setPage] = useState(1);
  const paged = curves.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col">
      {/* Table container */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.10]">
        {/* Header */}
        <div className="grid grid-cols-[2fr_140px_160px_180px_64px_40px] items-center border-b border-white/[0.08] px-4 py-3">
          {["Name", "Type", "Technology", "Last updated", "User", ""].map((h) => (
            <span key={h} className="text-xs font-medium text-white/35">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {paged.map((curve, i) => (
          <div
            key={curve.id}
            className={[
              "group grid grid-cols-[2fr_140px_160px_180px_64px_40px] items-center px-4 py-3 transition-colors hover:bg-white/[0.04] cursor-pointer",
              i < paged.length - 1 ? "border-b border-white/[0.06]" : "",
            ].join(" ")}
          >
            {/* Name + mini chart */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                {curve.type === "cost" ? <MiniCostCurve /> : <MiniSCurve />}
              </div>
              <span className="truncate text-sm font-medium text-[#f7f7f7]">{curve.name}</span>
            </div>

            {/* Type */}
            <div><TypeBadge type={curve.type} /></div>

            {/* Technology */}
            <div><TechBadge label={curve.technology} /></div>

            {/* Last updated */}
            <span className="text-xs text-white/45">{curve.lastUpdated}</span>

            {/* User */}
            <div className="h-7 w-7 overflow-hidden rounded-full ring-1 ring-white/[0.12]">
              <img src="/user-avatar.png" alt="user" className="size-full object-cover" />
            </div>

            {/* Menu */}
            <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60 opacity-0 group-hover:opacity-100">
              <DotsThree size={18} weight="bold" />
            </button>
          </div>
        ))}
      </div>

      <Pagination page={page} onPage={setPage} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CurvesClient() {
  const [view, setView] = useState<"grid" | "table">("grid");

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: "linear-gradient(157deg, rgb(21,18,37) 15%, rgb(5,5,30) 82%)" }}
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 90%, rgba(21,112,239,0.18) 0%, transparent 65%)" }}
      />

      <StellarHeader />

      {/* Sub-header */}
      <div className="relative z-10 flex shrink-0 items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-[36px] font-normal leading-none tracking-[-0.72px] text-[#f7f7f7]">
            308 curves
          </h1>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={["flex h-8 w-8 items-center justify-center rounded-lg transition-colors", view === "grid" ? "bg-white/10 text-[#f7f7f7]" : "text-white/40 hover:bg-white/[0.06] hover:text-white/70"].join(" ")}
            >
              <SquaresFour size={18} weight={view === "grid" ? "fill" : "regular"} />
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              className={["flex h-8 w-8 items-center justify-center rounded-lg transition-colors", view === "table" ? "bg-white/10 text-[#f7f7f7]" : "text-white/40 hover:bg-white/[0.06] hover:text-white/70"].join(" ")}
            >
              <Table size={18} weight={view === "table" ? "fill" : "regular"} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 text-white/65 transition-colors hover:border-white/40 hover:bg-white/[0.05] hover:text-white">
            <MagnifyingGlass size={18} />
          </button>
          <button aria-label="Filter" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 text-white/65 transition-colors hover:border-white/40 hover:bg-white/[0.05] hover:text-white">
            <Funnel size={18} />
          </button>
          <button className="flex h-10 items-center gap-1.5 rounded-xl bg-[#1570ef] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1864d4]">
            <Plus size={16} weight="bold" />
            New curve
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        {view === "grid" ? (
          <div className="grid grid-cols-4 gap-4">
            {CURVES.map((curve) => (
              <CurveCard key={curve.id} curve={curve} />
            ))}
          </div>
        ) : (
          <TableView curves={CURVES} />
        )}
      </div>
    </div>
  );
}
