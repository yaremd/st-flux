import Link from "next/link";
import StellarHeader from "@/components/StellarHeader";
import DashboardIllustration from "@/components/home/DashboardIllustration";
import BgVideo from "@/components/BgVideo";
import GlareCard from "@/components/GlareCard";

const IMG_STELLAR_EDGE_PERSON  = "/stellar-edge-person.png";
const IMG_STELLAR_EDGE_WIRE    = "/stellar-edge-wire.png";
const IMG_DATA_ANALYSIS_ROCKET = "https://www.figma.com/api/mcp/asset/4b969b67-9b58-4473-8cd0-f81d4ab040e3";
const IMG_CURVES_CHART         = "/curves-chart.svg";
const IMG_DATA_CORPUS_BULBS    = "/data-corpus-bulbs.png";

function GradientText({
  children,
  className = "",
  angle = 156,
}: {
  children: React.ReactNode;
  className?: string;
  angle?: number;
}) {
  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, rgba(255,255,255,0.88) 24%, rgba(255,255,255,0.65) 72%)`,
      }}
    >
      {children}
    </span>
  );
}

function StellarEdgeCard() {
  return (
    <GlareCard
      href="/chat"
      className="group relative overflow-hidden rounded-[56px] bg-white/[0.10] backdrop-blur-xl ring-1 ring-white/[0.15] transition-all duration-300 hover:bg-white/[0.14] hover:ring-white/[0.22] block"
    >
      {/* Text */}
      <p
        className="absolute left-10 top-8 font-display text-[36px] leading-[44px] tracking-[-0.72px] bg-clip-text text-transparent z-10"
        style={{ backgroundImage: "linear-gradient(170deg, rgba(255,255,255,0.88) 24%, rgba(255,255,255,0.65) 67%)" }}
      >
        StellarEdge
      </p>
      <p
        className="absolute left-[42px] top-[84px] w-[294px] text-[20px] leading-8 opacity-75 bg-clip-text text-transparent z-10"
        style={{ backgroundImage: "linear-gradient(140deg, rgba(255,255,255,0.85) 24%, rgba(255,255,255,0.65) 67%)" }}
      >
        Like a wise mentor, I will guide you through the challenges ahead. What do you seek today?
      </p>

      {/* Wireframe face — horizontally mirrored per Figma */}
      <div className="absolute left-16 top-[195px] w-[227px] h-[258px] flex items-center justify-center">
        <div className="-scale-y-100 rotate-180 flex-none w-[227px] h-[258px]">
          <img
            alt=""
            src="/stellar-edge-wire-clean.png"
            className="size-full object-cover"
          />
        </div>
      </div>

      {/* Person photo */}
      <div className="absolute left-[277px] top-[69px] size-[360px]">
        <img
          alt="StellarEdge advisor"
          src={IMG_STELLAR_EDGE_PERSON}
          className="size-full object-cover"
        />
      </div>
    </GlareCard>
  );
}

function DashboardsCard() {
  return (
    <GlareCard
      href="/dashboard"
      className="group relative overflow-hidden rounded-[56px] bg-white/[0.10] backdrop-blur-xl ring-1 ring-white/[0.15] transition-all duration-300 hover:bg-white/[0.14] hover:ring-white/[0.22] block"
    >
      {/* Text block */}
      <div className="absolute left-8 top-8 flex flex-col gap-2 w-[248px] z-10">
        <p
          className="font-display text-[36px] leading-[44px] tracking-[-0.72px] bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(156deg, rgba(255,255,255,0.88) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Dashboards
        </p>
        <p
          className="text-[20px] leading-8 opacity-75 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.85) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Your comprehensive platform for autonomous vehicle data visualization and analysis.
        </p>
      </div>

      {/* 3D Illustration */}
      <DashboardIllustration className="absolute left-[278px] top-[-50px] h-[430px] w-[276px]" />
    </GlareCard>
  );
}

function DataAnalysisCard() {
  return (
    <GlareCard
      href="/themes"
      className="group relative overflow-hidden rounded-[48px] bg-white/[0.10] backdrop-blur-xl ring-1 ring-white/[0.15] transition-all duration-300 hover:bg-white/[0.14] hover:ring-white/[0.22] block"
    >
      <div className="absolute left-6 top-6 flex flex-col gap-2 z-10">
        <p
          className="font-display text-[24px] leading-8 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(158deg, rgba(255,255,255,0.88) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Data Analysis
        </p>
        <p
          className="text-[14px] leading-5 opacity-75 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(153deg, rgba(255,255,255,0.85) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Uncover live trends<br />and patterns instantly.
        </p>
      </div>
      <div className="absolute right-4 top-4 h-[201px] w-[163px]">
        <img alt="" src={IMG_DATA_ANALYSIS_ROCKET} className="size-full object-contain" />
      </div>
    </GlareCard>
  );
}

function CurvesCard() {
  return (
    <GlareCard
      href="/scaling"
      className="group relative overflow-hidden rounded-[48px] bg-white/[0.10] backdrop-blur-xl ring-1 ring-white/[0.15] transition-all duration-300 hover:bg-white/[0.14] hover:ring-white/[0.22] block"
    >
      <div className="absolute left-6 top-6 flex flex-col gap-2 z-10">
        <p
          className="font-display text-[24px] leading-8 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(142deg, rgba(255,255,255,0.88) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Curves
        </p>
        <p
          className="text-[14px] leading-5 opacity-75 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.85) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Explore cost trends and<br />adoption curves across<br />markets.
        </p>
      </div>
      {/* Curves chart illustration */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center">
        <img alt="" src={IMG_CURVES_CHART} className="h-full w-auto" />
      </div>
    </GlareCard>
  );
}

function DataCorpusCard() {
  return (
    <GlareCard
      href="/pipeline"
      className="group relative overflow-hidden rounded-[48px] bg-white/[0.10] backdrop-blur-xl ring-1 ring-white/[0.15] transition-all duration-300 hover:bg-white/[0.14] hover:ring-white/[0.22] block"
    >
      <div className="absolute left-6 top-6 flex flex-col gap-2 z-10">
        <p
          className="font-display text-[24px] leading-8 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(142deg, rgba(255,255,255,0.88) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Data Corpus
        </p>
        <p
          className="text-[14px] leading-5 opacity-75 bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.85) 24%, rgba(255,255,255,0.65) 67%)" }}
        >
          Manage sources and<br />power your insights.
        </p>
      </div>
      {/* Bulbs cluster — transparent PNG, no blend needed */}
      <div className="absolute right-0 top-0 bottom-0 w-[65%]">
        <img
          alt=""
          src={IMG_DATA_CORPUS_BULBS}
          className="size-full object-contain object-right-top"
        />
      </div>
    </GlareCard>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "#07091A" }}>
      {/* Background video */}
      <BgVideo />
      {/* Dark overlay to keep legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[#07091A]/60" />

      {/* Background radial glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 65% at 50% -15%, rgba(47,72,220,0.42) 0%, transparent 62%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 65% 35%, rgba(22,45,160,0.18) 0%, transparent 65%)",
        }}
      />

      {/* ── Header ────────────────────────────────────────────────── */}
      <StellarHeader />

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="relative z-10 pt-[44px] text-center">
        <h1 className="font-display text-[60px] font-normal leading-[72px] tracking-[-1.2px] text-[#f7f7f7]">
          Nice to see you, John
        </h1>
      </div>

      {/* ── Cards grid ─────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto mt-[56px] w-full max-w-[1440px] px-28 pb-10">
        {/* Row 1 — two large cards */}
        <div className="grid grid-cols-2 gap-8 h-[399px]">
          <StellarEdgeCard />
          <DashboardsCard />
        </div>

        {/* Row 2 — three small cards */}
        <div className="grid grid-cols-3 gap-8 h-[217px] mt-[41px]">
          <DataAnalysisCard />
          <CurvesCard />
          <DataCorpusCard />
        </div>
      </div>
    </div>
  );
}
