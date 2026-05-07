"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/investment-process": "Investment Process",
  "/dashboard/risk-monitor": "Risk Monitor",
  "/dashboard/st-flux": "ST-Flux",
};

export default function DashboardPageHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <div className="relative z-20 flex flex-shrink-0 items-center justify-between px-6 py-5">
      {/* Left: back + title */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/dashboard")}
          aria-label="Back to Dashboards"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-transparent transition-colors hover:bg-white/[0.06]"
        >
          <ArrowLeft size={20} weight="regular" className="text-white/80" />
        </button>
        <span className="font-display text-[36px] font-normal leading-none tracking-[-0.72px] text-[#f7f7f7] whitespace-nowrap">
          {title}
        </span>
      </div>

      {/* Right: download */}
      <button
        aria-label="Download"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-transparent transition-colors hover:bg-white/[0.06]"
      >
        <DownloadSimple size={20} weight="regular" className="text-white/60" />
      </button>
    </div>
  );
}
