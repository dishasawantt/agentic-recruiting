"use client";

export function ScoreExplainPanel({ factors }: { factors: string[] }) {
  return (
    <details className="group mt-6 rounded-xl border border-slate-200/80 bg-slate-50/50">
      <summary className="focus-ring cursor-pointer list-none px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100/80 [&::-webkit-details-marker]:hidden">
        How this score is built
        <span className="ml-1 inline-block text-slate-400 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-200/60 px-4 py-4 text-sm text-slate-700">
        <p className="text-xs leading-relaxed text-slate-600">
          Overall match blends{" "}
          <strong>semantic similarity</strong> to the job description with four
          structured signals: skills, experience, impact, and JD fit. Category
          bars show where the model sees strength or gap vs the role text.
        </p>
        {factors.length > 0 && (
          <ul className="space-y-2 border-t border-slate-200/50 pt-3 text-xs leading-relaxed">
            {factors.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sage-600" aria-hidden>
                  •
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
