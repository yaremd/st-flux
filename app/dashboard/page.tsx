'use client';

import Link from "next/link";
import { ChartBar, Calendar, DotsThree, MagnifyingGlass, SlidersHorizontal } from "@phosphor-icons/react";
import StellarHeader from "@/components/StellarHeader";

const DASHBOARDS = [
  {
    id: "risk-monitor",
    name: "Risk Monitor",
    description: "Portfolio risk exposure, drawdown tracking, and factor attribution.",
    date: "Apr 16, 2026",
    href: "/dashboard/risk-monitor",
  },
  {
    id: "st-flux",
    name: "ST-Flux",
    description: "Thematic signals, position alerts, and overnight analysis.",
    date: "May 06, 2026",
    href: "/dashboard/st-flux",
  },
  {
    id: "investment-process",
    name: "Investment Process",
    description: "End-to-end pipeline from research to execution.",
    date: "Apr 22, 2026",
    href: "/dashboard/investment-process",
  },
];

function DashboardRow({
  name,
  date,
  href,
}: {
  name: string;
  date: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-6 rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/[0.07] transition-all duration-200 hover:bg-white/[0.07] hover:ring-white/[0.12]"
    >
      {/* Icon */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
        <ChartBar size={28} weight="fill" className="text-white/80" />
      </div>

      {/* Text */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[18px] font-medium leading-7 text-[#f7f7f7]">{name}</p>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#cecfd2] opacity-80 shrink-0" />
          <span className="text-[14px] leading-5 text-[#cecfd2] opacity-80">{date}</span>
        </div>
      </div>

      {/* Menu */}
      <button
        onClick={(e) => e.preventDefault()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/50 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10 hover:text-white/80"
        aria-label={`Options for ${name}`}
      >
        <DotsThree size={24} weight="bold" />
      </button>
    </Link>
  );
}

export default function DashboardsPage() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background: "linear-gradient(157deg, rgb(21, 18, 37) 15%, rgb(5, 5, 30) 82%)",
      }}
    >
      {/* Background glow — lower-center, matches Figma screenshot */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 45% 80%, rgba(30,58,200,0.32) 0%, transparent 68%)",
        }}
      />

      <StellarHeader />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div
        className="relative z-10 pt-8"
        style={{ marginLeft: "calc(16.67% + 80px)", width: "800px" }}
      >
        {/* Page heading row */}
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-display text-[36px] font-normal leading-[44px] tracking-[-0.72px] text-[#f7f7f7] whitespace-nowrap">
            {DASHBOARDS.length}&nbsp; dashboards
          </h1>
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="flex items-center justify-center rounded-xl border border-white/40 p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <MagnifyingGlass size={20} />
            </button>
            {/* Filter */}
            <button className="flex items-center justify-center rounded-xl border border-white/40 p-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mb-8 text-[18px] leading-7 text-[#cecfd2]">
          Review your data extraction projects
        </p>

        {/* Dashboard list */}
        <div className="flex flex-col gap-2.5">
          {DASHBOARDS.map((d) => (
            <DashboardRow key={d.id} name={d.name} date={d.date} href={d.href} />
          ))}
        </div>
      </div>
    </div>
  );
}
