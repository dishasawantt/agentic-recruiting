"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisProgressSteps } from "@/components/AnalysisProgressSteps";
import { ApplyDashboardLeftColumn } from "@/components/ApplyDashboardLeftColumn";
import { CategoryScoreViz } from "@/components/CategoryScoreViz";
import { DemoRankingDashboard } from "@/components/DemoRankingDashboard";
import { ParsedProfileFooter } from "@/components/ParsedProfileFooter";
import { EmbeddingMatchBar } from "@/components/EmbeddingMatchBar";
import { RecommendationBand } from "@/components/RecommendationBand";
import { ResumeSourcePanel } from "@/components/ResumeSourcePanel";
import { ScoreExplainPanel } from "@/components/ScoreExplainPanel";
import { ScoreGauge } from "@/components/ScoreGauge";
import { StepFlow } from "@/components/StepFlow";
import {
  LAST_APPLY_PATH_KEY,
  saveCandidateSession,
} from "@/lib/candidate-session";
import {
  getDemoRankingForJob,
  topCandidatesByOverall,
} from "@/lib/demo-ranking-data";
import {
  buildAtsSummary,
  confidenceFromScreen,
  factorBullets,
  gapKind,
  recommendationFromScreen,
  suggestedProbes,
} from "@/lib/screening-insights";
import type { ScreenResult } from "@/lib/types";

const DEMO_BANNER_KEY = "agentic_dismiss_demo_banner";

const ACCEPT =
  ".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,application/octet-stream";

function scoreColor(pct: number) {
  if (pct >= 75) return "bg-emerald-100 text-emerald-800";
  if (pct >= 55) return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-800";
}

function resultToXml(r: ScreenResult): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<screening>`,
    `  <matchScore>${r.matchScore}</matchScore>`,
    `  <embeddingSimilarity>${r.embeddingSimilarity}</embeddingSimilarity>`,
    ...(r.embeddingMethod
      ? [`  <embeddingMethod>${r.embeddingMethod}</embeddingMethod>`]
      : []),
    `  <issuesCount>${r.issuesCount}</issuesCount>`,
    `  <skills>${r.skills.map((s) => `<skill>${esc(s)}</skill>`).join("")}</skills>`,
    `  <skillGaps>${r.skillGaps.map((s) => `<item>${esc(s)}</item>`).join("")}</skillGaps>`,
    `  <whyShortlisted>${r.whyShortlisted.map((s) => `<item>${esc(s)}</item>`).join("")}</whyShortlisted>`,
    `</screening>`,
  ];
  return lines.join("\n");
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function CandidateScreeningFlow({
  jobId,
  jobTitle,
  initialJobDescription,
  jobMeta,
}: {
  jobId: string;
  jobTitle: string;
  initialJobDescription: string;
  jobMeta?: {
    company: string;
    location: string;
    employmentType: string;
    summary: string;
  };
}) {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScreenResult | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(
    "whyShortlisted"
  );
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const [highlightSkill, setHighlightSkill] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState(0);
  const [copiedAts, setCopiedAts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const demoBundle = useMemo(() => getDemoRankingForJob(jobId), [jobId]);
  const [selectedDemoId, setSelectedDemoId] = useState(() => {
    const b = getDemoRankingForJob(jobId);
    return topCandidatesByOverall(b, 3)[0]?.id ?? b.candidates[0]?.id ?? "";
  });

  useEffect(() => {
    const b = getDemoRankingForJob(jobId);
    const validIds = new Set(b.candidates.map((c) => c.id));
    setSelectedDemoId((cur) => {
      if (validIds.has(cur)) return cur;
      return topCandidatesByOverall(b, 3)[0]?.id ?? b.candidates[0]?.id ?? "";
    });
  }, [jobId]);

  const selectedDemo = useMemo(
    () =>
      demoBundle.candidates.find((c) => c.id === selectedDemoId) ??
      demoBundle.candidates[0],
    [demoBundle.candidates, selectedDemoId]
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_APPLY_PATH_KEY, `/apply/${jobId}`);
    } catch {
      /* ignore */
    }
  }, [jobId]);

  useEffect(() => {
    try {
      if (localStorage.getItem(DEMO_BANNER_KEY) === "1") {
        setDemoBannerDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!loading) return;
    setLoadStep(0);
    const t1 = setTimeout(() => setLoadStep(1), 320);
    const t2 = setTimeout(() => setLoadStep(2), 780);
    const t3 = setTimeout(() => setLoadStep(3), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHighlightSkill(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const step = useMemo<1 | 2 | 3>(() => {
    if (loading) return 2;
    if (result) return 3;
    return 1;
  }, [loading, result]);

  const onFiles = useCallback((files: FileList | null) => {
    const f = files?.[0];
    if (f) setFile(f);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const runScreen = async () => {
    setError(null);
    setHighlightSkill(null);
    setLoading(true);
    const ac = new AbortController();
    const t = window.setTimeout(() => ac.abort(), 90_000);
    try {
      const fd = new FormData();
      fd.append("jobDescription", initialJobDescription);
      if (file) fd.append("file", file, file.name);
      else fd.append("resumeText", resumeText);
      const res = await fetch("/api/screen", {
        method: "POST",
        body: fd,
        signal: ac.signal,
      });
      const raw = await res.text();
      let data: { error?: string } & Partial<ScreenResult>;
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        throw new Error(
          raw.trimStart().startsWith("<")
            ? `Server returned ${res.status} (HTML, not JSON). Open DevTools → Network → /api/screen for details.`
            : (raw.slice(0, 200) || `Bad response (${res.status})`)
        );
      }
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if (typeof data.matchScore !== "number") {
        throw new Error("Unexpected response from server (missing scores).");
      }
      setResult(data as ScreenResult);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError(
          "Timed out after 90s. On Cloudflare, PDF parsing can fail or run slowly — paste plain resume text and try again."
        );
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    } finally {
      window.clearTimeout(t);
      setLoading(false);
      setLoadStep(0);
    }
  };

  const copyAtsSummary = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(
        buildAtsSummary(result, jobTitle)
      );
      setCopiedAts(true);
      window.setTimeout(() => setCopiedAts(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [result, jobTitle]);

  const toggle = (id: string) =>
    setOpenSection((o) => (o === id ? null : id));

  const startSimulatedInterview = useCallback(() => {
    if (!result) return;
    try {
      saveCandidateSession({
        jobId,
        jobTitle,
        jobDescription: initialJobDescription,
        screenResult: result,
      });
      router.push("/interview");
    } catch {
      setError("Could not save session for the interview. Check browser storage.");
    }
  }, [result, initialJobDescription, router, jobId, jobTitle]);

  const insights = useMemo(() => {
    if (!result) return null;
    const rec = recommendationFromScreen(result);
    return {
      tier: rec.tier,
      label: rec.label,
      confidence: confidenceFromScreen(
        result,
        result.sourceMeta?.charCount ?? 0
      ),
      probes: suggestedProbes(result),
      factors: factorBullets(result),
    };
  }, [result]);

  return (
    <main
      className={`mx-auto min-h-screen px-4 py-10 md:px-8 ${
        result ? "max-w-6xl" : "max-w-[1200px]"
      }`}
    >
      <p className="mb-6">
        <Link
          href="/"
          className="focus-ring text-xs font-medium uppercase tracking-wider text-slate-500 hover:text-sage-700"
        >
          ← Roles
        </Link>
      </p>

      {!result ? (
        <>
          <header className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              {jobTitle}
            </h1>
          </header>

          {jobMeta && (
            <details className="app-card mb-8 overflow-hidden rounded-2xl">
              <summary className="focus-ring cursor-pointer p-4 text-xs font-semibold text-sage-800 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                Role overview · {jobMeta.company} · {jobMeta.location}
                <span className="ml-1 text-slate-400">▾</span>
              </summary>
              <div className="border-t border-slate-100 p-4 text-sm text-slate-700">
                <p className="leading-relaxed">{jobMeta.summary}</p>
                <div className="mt-3 max-h-[min(40vh,24rem)] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3 whitespace-pre-wrap leading-relaxed">
                  {initialJobDescription}
                </div>
              </div>
            </details>
          )}

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {selectedDemo && (
              <ApplyDashboardLeftColumn
                loading={loading}
                file={file}
                resumeText={resumeText}
                dragOver={dragOver}
                fileInputRef={fileInputRef}
                onFiles={onFiles}
                setDragOver={setDragOver}
                clearFile={clearFile}
                onBrowse={() => fileInputRef.current?.click()}
                setResumeText={setResumeText}
                onAnalyze={runScreen}
                canAnalyze={Boolean(file || resumeText.trim().length >= 30)}
              />
            )}
            <div className="min-h-[120px]">
              {loading ? (
                <div className="app-card space-y-5 p-8 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#2D5A4C]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-3/4 max-w-xs animate-pulse rounded-full bg-slate-200" />
                      <div className="h-2 w-1/2 max-w-[200px] animate-pulse rounded-full bg-slate-100" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-300/80" />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-full w-2/3 animate-pulse rounded-full bg-slate-300/60" />
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-300/70" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="app-card flex min-h-[280px] flex-col items-center justify-center border-dashed border-slate-200/90 p-8 text-center shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Fit analysis
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
                    Upload or paste a resume, then run analysis. Your fit scores and
                    recommendations will appear here.
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    Benchmark candidates below are for comparison only.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-6 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <DemoRankingDashboard
            jobTitle={jobTitle}
            bundle={demoBundle}
            selectedId={selectedDemoId}
            onSelect={setSelectedDemoId}
          />

          <ParsedProfileFooter
            bundle={demoBundle}
            selectedId={selectedDemoId}
            onSelect={setSelectedDemoId}
          />
        </>
      ) : (
        <>
          <div className="mx-auto w-full max-w-3xl">
            <header className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-600/90">
                Apply
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {jobTitle}
              </h1>
            </header>

            {jobMeta && (
              <section className="app-card mb-10 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </h2>
                  <p className="text-[11px] text-slate-400 sm:text-right">
                    {jobMeta.company} · {jobMeta.location} · {jobMeta.employmentType}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {jobMeta.summary}
                </p>
                <details className="mt-4 group">
                  <summary className="focus-ring cursor-pointer list-none text-xs font-semibold text-sage-800 hover:text-sage-900 [&::-webkit-details-marker]:hidden">
                    Full description
                    <span className="ml-1 inline-block text-slate-400 transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>
                  <div className="mt-3 max-h-[min(50vh,28rem)] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {initialJobDescription}
                  </div>
                </details>
              </section>
            )}

            <StepFlow active={step} variant="candidate" />
          </div>

          <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6 lg:min-h-[min(90vh,920px)]">
          <section
            className={`app-card p-6 ${loading ? "pointer-events-none opacity-60" : ""}`}
          >
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Resume
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">PDF · DOCX · TXT · paste</p>
          <div
            className={`relative mt-3 min-h-[152px] rounded-xl border-2 border-dashed text-center transition-colors ${
              dragOver
                ? "border-sage-500 bg-sage-50"
                : "border-slate-200 bg-slate-50/30 hover:border-sage-300"
            }`}
          >
            <input
              ref={fileInputRef}
              id="resume-file-input"
              name="resumeFile"
              type="file"
              accept={ACCEPT}
              className="absolute inset-0 z-20 block h-full min-h-[152px] w-full cursor-pointer opacity-[0.01]"
              style={{ fontSize: "100px" }}
              aria-label="Choose resume file"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget === e.target) setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                onFiles(e.dataTransfer.files);
              }}
            />
            <div className="pointer-events-none relative z-10 flex min-h-[120px] flex-col items-center justify-center px-4 py-8">
              {file ? (
                <>
                  <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-800">
                    {file.name}
                  </span>
                  <span className="mt-2 text-xs text-slate-500">
                    Click or drop to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-slate-700">
                    Drop file or click this area to upload
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    PDF · DOCX · TXT
                  </span>
                </>
              )}
            </div>
            <div className="relative z-30 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 px-4 py-2">
              <button
                type="button"
                className="pointer-events-auto text-xs font-semibold text-sage-700 underline decoration-sage-400 hover:text-sage-900"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files…
              </button>
              {file && (
                <button
                  type="button"
                  className="pointer-events-auto text-xs font-medium text-slate-600 underline hover:text-slate-900"
                  onClick={(e) => {
                    e.preventDefault();
                    clearFile();
                  }}
                >
                  Remove file
                </button>
              )}
            </div>
          </div>
          <textarea
            className="app-input mt-3 h-32 w-full resize-y bg-white disabled:opacity-60"
            placeholder="Paste text…"
            value={resumeText}
            disabled={loading}
            onChange={(e) => setResumeText(e.target.value)}
          />
          </section>

          <section className="app-card flex min-h-[260px] flex-1 flex-col overflow-hidden p-0 shadow-card">
            <ResumeSourcePanel
              file={file}
              resumeText={resumeText}
              sourceMeta={result?.sourceMeta ?? null}
              highlightSkill={highlightSkill}
              onClearHighlight={() => setHighlightSkill(null)}
            />
          </section>

          {loading && <AnalysisProgressSteps completedCount={loadStep} />}

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-auto lg:sticky lg:bottom-4 lg:z-10 lg:rounded-xl lg:border lg:border-slate-200/60 lg:bg-[var(--card)]/95 lg:p-4 lg:shadow-card lg:backdrop-blur-sm">
            <button
              type="button"
              disabled={
                loading ||
                (!file && resumeText.trim().length < 30)
              }
              onClick={runScreen}
              className="focus-ring relative min-h-[52px] w-full overflow-hidden rounded-xl bg-[#2D5A4C] py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-[#244a3f] hover:shadow-xl disabled:opacity-45 disabled:hover:bg-[#2D5A4C]"
            >
              {loading && (
                <span
                  className="absolute inset-0 animate-pulse bg-white/10"
                  aria-hidden
                />
              )}
              <span className="relative">
                {loading ? "Analyzing Resume…" : "Analyze Candidate Fit"}
              </span>
            </button>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Role description + resume text · on-device preview updates after run
            </p>
          </div>
        </div>

        <section className="space-y-6">
          {loading ? (
            <div className="app-card space-y-5 p-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-sage-200 border-t-sage-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-3/4 max-w-xs animate-pulse rounded-full bg-slate-200" />
                  <div className="h-2 w-1/2 max-w-[200px] animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-sage-200/80" />
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-sage-200/60" />
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-sage-200/70" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {result.demoMode && !demoBannerDismissed && (
                <div className="relative rounded-xl border border-amber-200 bg-amber-50 pr-10 pl-4 py-3 text-xs text-amber-900">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem(DEMO_BANNER_KEY, "1");
                      } catch {
                        /* ignore */
                      }
                      setDemoBannerDismissed(true);
                    }}
                    className="focus-ring absolute right-2 top-2 rounded-md px-2 py-1 text-lg leading-none text-amber-800 hover:bg-amber-100/80"
                    aria-label="Dismiss demo notice"
                  >
                    ×
                  </button>
                  <p>
                    Demo — add keys to{" "}
                    <code className="rounded bg-amber-100/90 px-1">.env.local</code>{" "}
                    (<code className="rounded bg-amber-100/90 px-1">GROQ_API_KEY</code>
                    , optional{" "}
                    <code className="rounded bg-amber-100/90 px-1">OPENAI_API_KEY</code>
                    ).
                  </p>
                </div>
              )}

              {insights && (
                <RecommendationBand
                  recommendationLabel={insights.label}
                  tier={insights.tier}
                  confidence={insights.confidence}
                  probes={insights.probes}
                />
              )}

              <div className="app-card relative overflow-hidden border-[#2D5A4C]/25 bg-[#f4faf7] p-5 shadow-lift">
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: "#2D5A4C" }}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sage-800">
                    Interview
                  </p>
                  <button
                    type="button"
                    onClick={startSimulatedInterview}
                    className="focus-ring min-h-[44px] rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-800"
                  >
                    Start
                  </button>
                </div>
              </div>

              <div className="app-card-highlight p-6 pt-7">
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Fit analysis
                  </h2>
                  <details className="relative text-left">
                    <summary className="focus-ring cursor-pointer list-none rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      Export ▾
                    </summary>
                    <div className="absolute right-0 z-10 mt-1 flex min-w-[10rem] flex-col gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-lift">
                      <button
                        type="button"
                        className="focus-ring rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={copyAtsSummary}
                      >
                        {copiedAts ? "Copied" : "Copy ATS summary"}
                      </button>
                      <button
                        type="button"
                        className="focus-ring rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          downloadBlob(
                            "screening.json",
                            JSON.stringify(result, null, 2),
                            "application/json"
                          )
                        }
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        className="focus-ring rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          downloadBlob(
                            "screening.xml",
                            resultToXml(result),
                            "application/xml"
                          )
                        }
                      >
                        XML
                      </button>
                    </div>
                  </details>
                </div>

                <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-start">
                  <div className="flex flex-col items-center lg:items-start">
                    <ScoreGauge
                      score={result.matchScore}
                      issuesCount={result.issuesCount}
                    />
                  </div>
                  <div className="space-y-6">
                    <EmbeddingMatchBar
                      value={result.embeddingSimilarity}
                      method={result.embeddingMethod}
                    />
                    <CategoryScoreViz scores={result.categoryScores} />
                  </div>
                </div>
                {insights && (
                  <ScoreExplainPanel factors={insights.factors} />
                )}
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: "skillGaps",
                    title: "Gaps",
                    items: result.skillGaps,
                  },
                  {
                    id: "whyShortlisted",
                    title: "Highlights",
                    items: result.whyShortlisted,
                  },
                ].map(({ id, title, items }) => (
                  <div
                    key={id}
                    className="app-card overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="focus-ring flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <span className="font-semibold text-slate-900">
                        {title}
                      </span>
                      <span className="flex items-center gap-2 text-slate-500">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreColor(
                            id === "whyShortlisted"
                              ? result.matchScore
                              : 100 - Math.min(100, result.issuesCount * 8)
                          )}`}
                        >
                          {id === "whyShortlisted"
                            ? `${result.matchScore}%`
                            : "Review"}
                        </span>
                        <span className="text-lg leading-none">
                          {openSection === id ? "▴" : "▾"}
                        </span>
                      </span>
                    </button>
                    {openSection === id && (
                      <div className="border-t border-slate-100 px-4 py-3">
                        <ul className="space-y-3 text-sm text-slate-700">
                          {items.map((t, i) => {
                            const kind =
                              id === "skillGaps" ? gapKind(t) : null;
                            const kindCls =
                              kind === "risk"
                                ? "bg-rose-100 text-rose-800"
                                : kind === "develop"
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-sky-100 text-sky-900";
                            return (
                              <li key={i} className="flex gap-2 leading-snug">
                                {kind && (
                                  <span
                                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${kindCls}`}
                                  >
                                    {kind}
                                  </span>
                                )}
                                <span className={kind ? "" : "pl-0"}>
                                  {t}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="app-card p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Parsed profile
                </h3>
                <div className="mt-5 grid gap-8 border-t border-slate-100 pt-6 md:grid-cols-3">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Skills
                    </h4>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {result.skills.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            onClick={() =>
                              setHighlightSkill((h) =>
                                h === s ? null : s
                              )
                            }
                            className={`focus-ring rounded-md border px-2 py-1 text-xs font-medium transition ${
                              highlightSkill === s
                                ? "border-sage-500 bg-sage-100 text-sage-900 ring-2 ring-sage-400/50"
                                : "border-[rgba(45,90,76,0.35)] bg-[#f4faf7] text-[#2D5A4C] hover:border-[#2D5A4C]/50"
                            }`}
                          >
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                      Education
                    </h4>
                    <ul className="mt-2 space-y-2 text-xs text-slate-700">
                      {result.education.map((e, i) => (
                        <li key={i} className="rounded-lg bg-slate-50 p-2">
                          <div className="font-medium">{e.degree}</div>
                          <div className="text-slate-500">
                            {e.institution} · {e.dates}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Employment
                    </h4>
                    <ul className="mt-2 space-y-2 text-xs text-slate-700">
                      {result.employment.map((e, i) => (
                        <li key={i} className="rounded-lg bg-slate-50 p-2">
                          <div className="font-medium">{e.role}</div>
                          <div className="text-slate-500">
                            {e.company} · {e.dates}
                          </div>
                          {e.highlights?.length > 0 && (
                            <ul className="mt-1 list-disc pl-4 text-slate-600">
                              {e.highlights.slice(0, 3).map((h, j) => (
                                <li key={j}>{h}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {result.impact.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                      Impact
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {result.impact.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
        </>
      )}
    </main>
  );
}
