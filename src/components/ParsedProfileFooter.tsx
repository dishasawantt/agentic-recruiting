"use client";

import { CandidateAvatar } from "@/components/CandidateAvatar";
import {
  candidatesSortedByOverall,
  type DemoRankingBundle,
} from "@/lib/demo-ranking-data";

export function ParsedProfileFooter({
  bundle,
  selectedId,
  onSelect,
}: {
  bundle: DemoRankingBundle;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const parsed = candidatesSortedByOverall(bundle);
  return (
    <section className="app-card mt-10 p-6 md:p-8">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
        Parsed profile
      </h2>
      <div className="mt-6 border-t border-slate-100 pt-6">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80">
        {parsed.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={`focus-ring flex min-w-[260px] shrink-0 snap-start items-center gap-3 rounded-xl border p-4 text-left transition hover:border-sage-300 hover:shadow-sm ${
              c.id === selectedId
                ? "border-[#2D5A4C] bg-[#f4faf7] ring-1 ring-[#2D5A4C]/20"
                : "border-slate-200 bg-white"
            }`}
          >
            <CandidateAvatar name={c.name} src={c.avatarUrl} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-bold text-slate-900">
                  {c.name}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                  {c.overall}
                  <span className="text-xs font-semibold text-slate-400">/100</span>
                </span>
              </div>
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                {c.applicationRef}
              </p>
            </div>
          </button>
        ))}
        </div>
      </div>
    </section>
  );
}
