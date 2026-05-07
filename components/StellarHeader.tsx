"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "@phosphor-icons/react";
import Link from "next/link";

const IMG_AVATAR = "/user-avatar.png";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Stellar",
  "/dashboard": "Dashboards",
  "/dashboard/investment-process": "Dashboards",
  "/dashboard/risk-monitor": "Dashboards",
  "/dashboard/st-flux": "Dashboards",
  "/alerts": "Alerts",
  "/insights": "Insights",
  "/pipeline": "Pipeline",
  "/positions": "Positions",
  "/scaling": "Scaling",
  "/themes": "Themes",
};

function LogoDefault() {
  return <img src="/logo-default.svg" alt="Stellar" className="h-12 w-12 shrink-0" />;
}

function LogoActive() {
  return (
    <img
      src="/logo-active.svg"
      alt="Stellar"
      className="h-12 w-12 shrink-0 rounded-2xl ring-1 ring-white/[0.12]"
    />
  );
}

function ThemeIcon() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sf-theme");
    const dark = stored !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("sf-theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-white/50 transition-colors hover:text-white/80"
    >
      {isDark ? <Sun size={24} weight="regular" /> : <Moon size={24} weight="regular" />}
    </button>
  );
}

export default function StellarHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const title = ROUTE_TITLES[pathname] ?? "Stellar";

  return (
    <header className="relative z-20 flex h-[72px] flex-shrink-0 items-center justify-between px-6">
      {/* Leading */}
      <div className="flex flex-1 items-center gap-6">
        <Link href="/" className="shrink-0">
          {isHome ? <LogoActive /> : <LogoDefault />}
        </Link>
        <span
          className="font-display font-normal leading-none text-[#f7f7f7] whitespace-nowrap"
          style={isHome
            ? { fontSize: 40, letterSpacing: "0.8px" }
            : { fontSize: 24, letterSpacing: "0.48px" }
          }
        >
          {title}
        </span>
      </div>

      {/* Trailing */}
      <div className="flex flex-1 items-center justify-end gap-10">
        <ThemeIcon />
        <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/[0.12]">
          <img src={IMG_AVATAR} alt="avatar" className="size-full object-cover" />
        </div>
      </div>
    </header>
  );
}
