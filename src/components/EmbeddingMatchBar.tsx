"use client";

import { METRIC } from "@/lib/metric-palette";

export function EmbeddingMatchBar({
  value,
  method,
}: {
  value: number;
  method?: "openai" | "llm_estimate";
}) {
  const v = Math.max(0, Math.min(100, value));
  const tag =
    method === "openai"
      ? "Embeddings"
      : method === "llm_estimate"
        ? "Estimate"
        : null;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-medium uppercase tracking-wider"
          style={{ color: METRIC.labelMuted }}
        >
          Semantic layer
        </span>
        <span className="tabular-nums text-lg font-bold tracking-tight text-slate-900">
          {v}
          <span className="text-sm font-semibold text-slate-400">/100</span>
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full ring-1 ring-slate-200/60"
        style={{ backgroundColor: METRIC.track }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${v}%`, backgroundColor: METRIC.experienceSemantic }}
        />
      </div>
      {tag && (
        <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          {tag}
        </p>
      )}
    </div>
  );
}
