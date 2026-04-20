"use client";

type Step = 1 | 2 | 3;

const STEPS_DEFAULT: { n: Step; title: string; desc: string }[] = [
  {
    n: 1,
    title: "Input",
    desc: "Resume + JD",
  },
  {
    n: 2,
    title: "Process",
    desc: "Extract & embed",
  },
  {
    n: 3,
    title: "Output",
    desc: "Scores & export",
  },
];

const STEPS_CANDIDATE: { n: Step; title: string; desc: string }[] = [
  {
    n: 1,
    title: "Apply",
    desc: "Resume",
  },
  {
    n: 2,
    title: "Analyze",
    desc: "AI screen",
  },
  {
    n: 3,
    title: "Interview",
    desc: "Sim + review",
  },
];

export function StepFlow({
  active,
  variant = "default",
}: {
  active: Step;
  variant?: "default" | "candidate";
}) {
  const steps = variant === "candidate" ? STEPS_CANDIDATE : STEPS_DEFAULT;

  return (
    <div className="w-full px-1 sm:px-2">
      <div className="flex w-full flex-nowrap justify-between gap-2 sm:gap-6">
        {steps.map((s) => {
          const isActive = s.n === active;
          const done = s.n < active;
          return (
            <div
              key={s.n}
              className="flex min-w-0 flex-1 basis-0 flex-col items-center text-center"
            >
              <div
                className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold tabular-nums shadow-md transition-colors ${
                  isActive
                    ? "bg-sage-600 text-white ring-4 ring-sage-200/80"
                    : done
                      ? "bg-sage-500 text-white"
                      : "border-2 border-slate-200 bg-white text-slate-400"
                }`}
              >
                {s.n}
              </div>
              <p
                className={`mt-2 text-xs font-semibold ${
                  isActive ? "text-sage-900" : "text-slate-600"
                }`}
              >
                {s.title}
              </p>
              <p className="mt-0.5 hidden text-[10px] text-slate-500 sm:block">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
