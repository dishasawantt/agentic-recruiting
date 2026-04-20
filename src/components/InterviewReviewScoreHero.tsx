"use client";

import { useId } from "react";

type Tier = "top" | "strong" | "solid" | "mixed" | "weak";

const TIER_STROKE: Record<Tier, { from: string; to: string }> = {
  top: { from: "#10b981", to: "#059669" },
  strong: { from: "#2dd4bf", to: "#0d9488" },
  solid: { from: "#38bdf8", to: "#0284c7" },
  mixed: { from: "#fbbf24", to: "#d97706" },
  weak: { from: "#fb7185", to: "#e11d48" },
};

export function InterviewReviewScoreHero({
  score,
  tier,
  label,
}: {
  score: number;
  tier: Tier;
  label: string;
}) {
  const uid = useId();
  const gid = `rv-${uid.replace(/:/g, "")}`;
  const s = Math.max(0, Math.min(100, score));
  const c = 2 * Math.PI * 52;
  const offset = c - (s / 100) * c;
  const colors = TIER_STROKE[tier] ?? TIER_STROKE.solid;

  return (
    <div className="flex flex-col items-center sm:items-end">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tabular-nums text-slate-900">
            {score}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            /100
          </span>
        </div>
      </div>
      <p className="mt-2 max-w-[10rem] text-center text-xs font-semibold leading-tight text-slate-700 sm:text-right">
        {label}
      </p>
    </div>
  );
}
