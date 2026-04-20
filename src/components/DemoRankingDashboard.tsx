"use client";

import { CandidateAvatar } from "@/components/CandidateAvatar";
import {
  topCandidatesByOverall,
  type DemoIdealCandidate,
  type DemoRankingBundle,
} from "@/lib/demo-ranking-data";
import { METRIC, metricBarFillFromLabel } from "@/lib/metric-palette";

function DemoScoreBar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const fill = metricBarFillFromLabel(label);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: METRIC.labelMuted }}
        >
          {label}
        </span>
        <span className="tabular-nums text-xs font-bold text-slate-900">
          {v}%
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full ring-1 ring-slate-200/60"
        style={{ backgroundColor: METRIC.track }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${v}%`, backgroundColor: fill }}
        />
      </div>
    </div>
  );
}

function CandidateCompareCard({
  c,
  selected,
  onSelect,
}: {
  c: DemoIdealCandidate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`focus-ring w-full rounded-xl border bg-white p-5 text-left shadow-[0_1px_3px_rgb(0_0_0/0.06),0_10px_28px_-14px_rgb(0_0_0/0.12)] transition hover:border-slate-300 ${
        selected
          ? "border-[#2D5A4C] ring-2 ring-[#2D5A4C]/20"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <CandidateAvatar name={c.name} src={c.avatarUrl} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0">
            <h3 className="text-base font-bold tracking-tight text-slate-900">
              {c.name}
            </h3>
            <span className="shrink-0 text-lg font-bold tabular-nums text-slate-900">
              {c.overall}
              <span className="text-sm font-semibold text-slate-400">/100</span>
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-snug text-slate-500">
            {c.roleTitle}
            <span className="text-slate-300"> · </span>
            {c.location}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {c.rankingBars.map((b) => (
          <DemoScoreBar key={b.label} label={b.label} value={b.value} />
        ))}
      </div>
    </button>
  );
}

function recommendationBadgeForTop(top: DemoIdealCandidate[]): string {
  if (top.length === 0) return "—";
  const tier = (label: string) => {
    const u = label.toUpperCase();
    if (u.includes("STRONG")) return 3;
    if (u.includes("HIRE")) return 2;
    if (u.includes("MAYBE")) return 1;
    return 0;
  };
  const avg = top.reduce((s, c) => s + tier(c.fitAnalysis.recommendationLabel), 0) / top.length;
  if (avg >= 2.33) return "High";
  if (avg >= 1.33) return "Solid";
  return "Mixed";
}

export function DemoRankingDashboard({
  jobTitle,
  bundle,
  selectedId,
  onSelect,
}: {
  jobTitle: string;
  bundle: DemoRankingBundle;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const top3 = topCandidatesByOverall(bundle, 3);
  const recStrengths = top3.map((c) => {
    const line = c.fitAnalysis.strengths[0] ?? "";
    return `${c.name}: ${line}`;
  });
  const recTips = top3
    .map((c) => c.fitAnalysis.interviewProbes[0] ?? "")
    .filter((t) => t.length > 0);
  const badge = recommendationBadgeForTop(top3);

  return (
    <section className="app-card mt-10 overflow-hidden border-slate-200/90 p-0 shadow-[0_2px_8px_rgb(0_0_0/0.06)]">
      <div className="border-b border-slate-100 bg-white px-6 py-4 md:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.32em]">
          <span className="tracking-[0.2em]" style={{ color: METRIC.primary }}>
            Agentic
          </span>{" "}
          <span className="text-slate-800">RECRUITING</span>
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-800 md:text-base">
          {jobTitle}
        </p>
      </div>
      <div className="bg-slate-50/40 px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {top3.map((c) => (
            <CandidateCompareCard
              key={c.id}
              c={c}
              selected={c.id === selectedId}
              onSelect={() => onSelect(c.id)}
            />
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-100/90 px-5 py-5 md:px-7 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recommendation</h3>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Top 3 by overall score
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "#e8f2ec",
                color: METRIC.primary,
              }}
            >
              {badge}
            </span>
          </div>
          <div className="mt-5 grid gap-6 border-t border-slate-200/90 pt-5 md:grid-cols-2">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              {recStrengths.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              {recTips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
