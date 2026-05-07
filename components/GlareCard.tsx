"use client";

import Link from "next/link";
import { useState } from "react";

const MAX_TILT = 8; // degrees

interface Props {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function GlareCard({ href, className, children }: Props) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPos({ x, y });
    setTilt({
      x: -((y - 50) / 50) * MAX_TILT,
      y:  ((x - 50) / 50) * MAX_TILT,
    });
    setActive(true);
  };

  const onMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setActive(false);
  };

  return (
    <Link
      href={href}
      className={className}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        transform: active
          ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
          : `perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transition: active
          ? "transform 0.1s ease-out"
          : "transform 0.5s ease-out",
        willChange: "transform",
      }}
    >
      {children}

      {/* Moving glare highlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 35%, transparent 65%)`,
        }}
      />
    </Link>
  );
}
