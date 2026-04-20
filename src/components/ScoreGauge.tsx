"use client";

import { useId } from "react";

type Props = { score: number; issuesCount: number };

export function ScoreGauge({ score, issuesCount }: Props) {
  const uid = useId();
  const gradId = `gg-${uid.replace(/:/g, "")}`;
  const glowId = `gl-${uid.replace(/:/g, "")}`;
  const clamped = Math.max(0, Math.min(100, score));
  const angle = (clamped / 100) * 180 - 90;

  return (
    <div className="relative flex w-full max-w-[240px] flex-col items-center">
      <svg
        viewBox="0 0 200 128"
        className="w-full drop-shadow-sm"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="28%" stopColor="#fb923c" />
            <stop offset="52%" stopColor="#facc15" />
            <stop offset="72%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 24 102 A 76 76 0 0 1 176 102"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M 24 102 A 76 76 0 0 1 176 102"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="16"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = (tick / 100) * 180 - 90;
          const rad = (a * Math.PI) / 180;
          const x1 = 100 + 58 * Math.cos(rad);
          const y1 = 102 + 58 * Math.sin(rad);
          const x2 = 100 + 68 * Math.cos(rad);
          const y2 = 102 + 68 * Math.sin(rad);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.5"
            />
          );
        })}
        <g transform="translate(100,102)">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-54"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${angle})`}
            filter={`url(#${glowId})`}
          />
          <circle
            r="6"
            fill="#f97316"
            stroke="#fff"
            strokeWidth="2"
            transform={`rotate(${angle}) translate(0,-54)`}
          />
          <circle r="5" fill="#fff" stroke="#334155" strokeWidth="1.5" />
        </g>
      </svg>
      <div className="-mt-1 text-center">
        <p
          className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums"
          aria-label={`Match score ${clamped} out of 100`}
        >
          {clamped}
          <span className="text-xl font-semibold text-slate-400">/100</span>
        </p>
        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          {issuesCount} gaps flagged
        </p>
      </div>
    </div>
  );
}
