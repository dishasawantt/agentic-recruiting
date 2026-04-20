"use client";

import type { CategoryScores } from "@/lib/types";
import { METRIC, metricBarFillFromCategoryKey } from "@/lib/metric-palette";

const ROWS: {
  key: keyof CategoryScores;
  label: string;
}[] = [
  { key: "skillAlignment", label: "Skills" },
  { key: "experienceRelevance", label: "Experience" },
  { key: "impactEvidence", label: "Impact" },
  { key: "semanticFit", label: "JD fit" },
];

export function CategoryScoreViz({ scores }: { scores: CategoryScores }) {
  return (
    <div className="space-y-4">
      {ROWS.map(({ key, label }) => {
        const v = scores[key];
        const fill = metricBarFillFromCategoryKey(key);
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-2">
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: METRIC.labelMuted }}
              >
                {label}
              </span>
              <span className="tabular-nums text-sm font-bold text-slate-900">
                {v}
                <span className="text-xs font-semibold text-slate-400">%</span>
              </span>
            </div>
            <div
              className="mt-1.5 h-2.5 overflow-hidden rounded-full ring-1 ring-slate-200/60"
              style={{ backgroundColor: METRIC.track }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${v}%`, backgroundColor: fill }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
