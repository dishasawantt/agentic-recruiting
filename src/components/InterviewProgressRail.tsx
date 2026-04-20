"use client";

export function InterviewProgressRail({
  mainRound,
  totalMains,
  isFollowUp,
  variant = "default",
}: {
  mainRound: number;
  totalMains: number;
  isFollowUp: boolean;
  variant?: "default" | "dark";
}) {
  const inactive = variant === "dark" ? "bg-stone-700/90" : "bg-slate-200";
  const doneClass =
    variant === "dark"
      ? "bg-amber-500 shadow-[0_0_10px_-2px_rgba(245,158,11,0.45)]"
      : "bg-sage-500 shadow-[0_0_8px_-1px_rgba(53,138,94,0.6)]";
  const activeMain =
    variant === "dark"
      ? "bg-amber-400 shadow-[0_0_12px_-2px_rgba(251,191,36,0.5)]"
      : "bg-sage-400";
  const activeFollow = variant === "dark" ? "bg-sky-400" : "bg-sky-400";

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: totalMains }, (_, i) => {
        const n = i + 1;
        const done = n < mainRound;
        const active = n === mainRound;
        return (
          <div key={n} className="flex flex-1 flex-col gap-1">
            <div
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                done
                  ? doneClass
                  : active
                    ? isFollowUp
                      ? activeFollow
                      : activeMain
                    : inactive
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
