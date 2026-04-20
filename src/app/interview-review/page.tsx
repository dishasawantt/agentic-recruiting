"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DimensionScoreViz } from "@/components/DimensionScoreViz";
import { InterviewReviewScoreHero } from "@/components/InterviewReviewScoreHero";
import type { InterviewCallReviewResult } from "@/lib/interview-call-review-types";
import {
  clearPendingInterviewReview,
  loadPendingInterviewReview,
} from "@/lib/candidate-session";
import { parseVoiceQAExport } from "@/lib/voice-qa-export-types";

const TIER_STYLE: Record<
  InterviewCallReviewResult["rankTier"],
  string
> = {
  top: "border-emerald-500 bg-emerald-50 text-emerald-950",
  strong: "border-teal-400 bg-teal-50 text-teal-950",
  solid: "border-sky-400 bg-sky-50 text-sky-950",
  mixed: "border-amber-400 bg-amber-50 text-amber-950",
  weak: "border-rose-500 bg-rose-50 text-rose-950",
};

const DIM_LABELS: {
  key: keyof InterviewCallReviewResult["dimensionScores"];
  label: string;
}[] = [
  { key: "communication", label: "Communication" },
  { key: "technicalDepth", label: "Technical" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "roleFit", label: "Role fit" },
];

export default function InterviewReviewPage() {
  const searchParams = useSearchParams();
  const simImportDone = useRef(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewCallReviewResult | null>(null);

  const parsePreview = useMemo(() => {
    try {
      return parseVoiceQAExport(JSON.parse(jsonText) as unknown);
    } catch {
      return null;
    }
  }, [jsonText]);

  useEffect(() => {
    if (simImportDone.current) return;
    if (searchParams.get("from") !== "sim") return;
    const pending = loadPendingInterviewReview();
    if (!pending) return;
    simImportDone.current = true;
    const text = JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        jobDescription: pending.jobDescription,
        questions: pending.questions,
      },
      null,
      2
    );
    setJsonText(text);
    clearPendingInterviewReview();
    const data = parseVoiceQAExport(JSON.parse(text) as unknown);
    if (!data) return;
    setError(null);
    setResult(null);
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/interview-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || "Request failed");
        setResult(out as InterviewCallReviewResult);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const runReview = useCallback(async () => {
    setError(null);
    setResult(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText) as unknown;
    } catch {
      setError("Invalid JSON. Paste the file contents or fix syntax.");
      return;
    }
    const data = parseVoiceQAExport(parsed);
    if (!data) {
      setError(
        "Could not parse Voice Q&A export. Need jobDescription and questions[] with text and answers."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interview-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || "Request failed");
      setResult(out as InterviewCallReviewResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [jsonText]);

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      setJsonText(String(r.result ?? ""));
      setError(null);
      setResult(null);
    };
    r.readAsText(file);
  };

  const downloadReview = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-call-review.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 py-8 md:px-8">
      <header className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-600/90">
          Scorecard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Interview review
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          JSON export ·{" "}
          <Link
            href="/voice-interview"
            className="font-medium text-sage-700 hover:text-sage-900"
          >
            legacy Q&amp;A
          </Link>
        </p>
      </header>

      <section className="app-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="focus-ring inline-flex min-h-[44px] cursor-pointer items-center rounded-xl border border-sage-300/80 bg-sage-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sage-800 hover:bg-sage-100">
            Upload
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            disabled={loading || !jsonText.trim()}
            onClick={runReview}
            className="focus-ring min-h-[44px] rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "…" : "Run"}
          </button>
        </div>
        {parsePreview && (
          <div className="mt-4 rounded-xl border border-[#2D5A4C]/25 bg-[#f4faf7] p-4">
            <div className="flex flex-wrap gap-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>
                Q<span className="text-slate-900">{parsePreview.questions.length}</span>
              </span>
              <span>
                Answered{" "}
                <span className="text-slate-900">
                  {
                    parsePreview.questions.filter((q) => q.answer.trim().length > 0)
                      .length
                  }
                </span>
              </span>
            </div>
            <p className="mt-3 max-h-20 overflow-hidden text-[11px] leading-relaxed text-slate-500 line-clamp-3">
              {parsePreview.jobDescription}
            </p>
          </div>
        )}
        <textarea
          className="app-code-input mt-4 h-48 w-full resize-y"
          placeholder="Paste interview JSON…"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setResult(null);
            setError(null);
          }}
        />
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </section>

      {result && (
        <div className="mt-8 space-y-6">
          {result.demoMode && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-[11px] text-amber-900">
              Demo — <code className="rounded bg-amber-100/90 px-1">GROQ_API_KEY</code>
            </div>
          )}

          <div
            className={`relative overflow-hidden rounded-2xl border-2 p-6 shadow-lift md:p-8 ${TIER_STYLE[result.rankTier]}`}
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                  {result.rankTier}
                </p>
                <p className="mt-2 text-lg font-semibold leading-snug opacity-95">
                  {result.rankLabel}
                </p>
                <p className="mt-4 text-sm leading-relaxed opacity-90">
                  {result.executiveSummary}
                </p>
                <button
                  type="button"
                  onClick={downloadReview}
                  className="focus-ring mt-6 rounded-xl border border-slate-400/30 bg-white/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-800 backdrop-blur-sm hover:bg-white/80"
                >
                  Export JSON
                </button>
              </div>
              <InterviewReviewScoreHero
                score={result.overallScore}
                tier={result.rankTier}
                label="Overall"
              />
            </div>
          </div>

          <div className="app-card p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Dimensions
            </h2>
            <div className="mt-5">
              <DimensionScoreViz
                scores={result.dimensionScores}
                labels={DIM_LABELS}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="app-card border-emerald-200/40 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                Strengths
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="app-card border-rose-200/40 p-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-800">
                Gaps
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                {result.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
