"use client";

const STEPS = ["Extract text", "Structure profile", "Score vs role"] as const;

export function AnalysisProgressSteps({
  completedCount,
}: {
  completedCount: number;
}) {
  return (
    <div
      className="rounded-xl border border-sage-200/60 bg-sage-50/40 p-4"
      aria-live="polite"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-sage-800">
        Progress
      </p>
      <ul className="mt-3 space-y-2.5">
        {STEPS.map((label, i) => {
          const done = i < completedCount;
          const active = i === completedCount && completedCount < STEPS.length;
          return (
            <li key={label} className="flex items-center gap-3 text-xs">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                  done
                    ? "bg-sage-600 text-white"
                    : active
                      ? "bg-sage-200 text-sage-900 ring-2 ring-sage-400/50"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={
                  done || active ? "font-medium text-slate-800" : "text-slate-400"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
