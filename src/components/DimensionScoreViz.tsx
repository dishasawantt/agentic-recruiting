"use client";

import type { InterviewCallReviewResult } from "@/lib/interview-call-review-types";
import { METRIC } from "@/lib/metric-palette";

type DimKey = keyof InterviewCallReviewResult["dimensionScores"];

const FILL: Record<DimKey, string> = {
  communication: METRIC.impact,
  technicalDepth: METRIC.experienceSemantic,
  problemSolving: METRIC.skills,
  roleFit: METRIC.jdFit,
};

export function DimensionScoreViz({
  scores,
  labels,
}: {
  scores: InterviewCallReviewResult["dimensionScores"];
  labels: { key: DimKey; label: string }[];
}) {
  return (
    <ul className="space-y-5">
      {labels.map(({ key, label }) => {
        const v = scores[key];
        const fill = FILL[key];
        return (
          <li key={key}>
            <div className="mb-2 flex items-baseline justify-between">
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: METRIC.labelMuted }}
              >
                {label}
              </span>
              <span className="tabular-nums text-sm font-bold text-slate-900">
                {v}
                <span className="text-xs font-semibold text-slate-400">/100</span>
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full ring-1 ring-slate-200/60"
              style={{ backgroundColor: METRIC.track }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${v}%`, backgroundColor: fill }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
