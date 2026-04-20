"use client";

import type { RecommendationTier } from "@/lib/screening-insights";
import { METRIC } from "@/lib/metric-palette";

const TIER_STYLE: Record<RecommendationTier, string> = {
  strong_hire:
    "border-[#2D5A4C]/30 bg-[#f4faf7] text-[#142921]",
  hire: "border-[#5D9B91]/35 bg-[#f6faf9] text-[#1e3d34]",
  maybe: "border-amber-200/90 bg-amber-50/90 text-amber-950",
  pass: "border-rose-200/90 bg-rose-50/90 text-rose-950",
};

export function RecommendationBand({
  recommendationLabel,
  tier,
  confidence,
  probes,
}: {
  recommendationLabel: string;
  tier: RecommendationTier;
  confidence: "high" | "medium" | "low";
  probes: string[];
}) {
  const confClass =
    confidence === "medium"
      ? "bg-amber-100 text-amber-900"
      : confidence === "low"
        ? "bg-slate-200 text-slate-700"
        : "";
  const confStyle =
    confidence === "high"
      ? { backgroundColor: "#e8f2ec", color: METRIC.primary }
      : undefined;

  return (
    <div
      className={`rounded-2xl border-2 p-5 shadow-sm ${TIER_STYLE[tier]}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
            Recommendation
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight">
            {recommendationLabel}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${confClass}`}
          style={confStyle}
        >
          Confidence ·{" "}
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
        </span>
      </div>
      {probes.length > 0 && (
        <div className="mt-4 border-t border-black/5 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            Suggested probes
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-snug opacity-95">
            {probes.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  →
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
