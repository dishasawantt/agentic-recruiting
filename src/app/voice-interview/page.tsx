"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  loadScreeningSession,
  type ScreeningSessionPayload,
} from "@/lib/screening-session";
import type {
  GeneratedInterviewQuestion,
  GeneratedQuestionsResult,
} from "@/lib/interview-questions-types";

const FETCH_TIMEOUT_MS = 70_000;

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type PagePhase =
  | "boot"
  | "nosession"
  | "loading"
  | "ready"
  | "error";

export default function VoiceInterviewPage() {
  const [phase, setPhase] = useState<PagePhase>("boot");
  const [session, setSession] = useState<ScreeningSessionPayload | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GeneratedInterviewQuestion[]>(
    []
  );
  const [demoMode, setDemoMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const recRef = useRef<SpeechRecognition | null>(null);
  const listenIdxRef = useRef(0);
  const answersRef = useRef<string[]>(answers);
  const dictationFinalRef = useRef("");
  const answerPrefixRef = useRef("");
  answersRef.current = answers;

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const timeoutId = window.setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);

    (async () => {
      const s = loadScreeningSession();
      if (!s) {
        if (!cancelled) {
          setSessionError(
            "No screening session found. Open a job listing, run resume analysis, then start the flow from there."
          );
          setPhase("nosession");
        }
        window.clearTimeout(timeoutId);
        return;
      }
      if (!cancelled) {
        setSession(s);
        setPhase("loading");
        setQuestionsError(null);
      }

      try {
        const res = await fetch("/api/interview-questions", {
          method: "POST",
          signal: ac.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenResult: s.screenResult,
            jobDescription: s.jobDescription,
          }),
        });
        const data = (await res.json()) as GeneratedQuestionsResult & {
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }
        const list = data.questions ?? [];
        setQuestions(list);
        setAnswers(list.map(() => ""));
        setDemoMode(!!data.demoMode);
        setPhase("ready");
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof Error ? e.name : "";
        const msg =
          name === "AbortError"
            ? "Request timed out after 70s. Check GROQ_API_KEY, network, or try again."
            : e instanceof Error
              ? e.message
              : "Failed to generate questions";
        setQuestionsError(msg);
        setPhase("error");
      } finally {
        window.clearTimeout(timeoutId);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    setRecSec(0);
  }, [currentIdx]);

  useEffect(() => {
    if (!listening) {
      setRecSec(0);
      return;
    }
    const id = window.setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [listening]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      recRef.current?.stop();
    };
  }, []);

  const speakCurrent = useCallback(() => {
    const q = questions[currentIdx];
    if (!q || typeof window === "undefined") return;
    setVoiceHint(null);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(q.text);
    u.rate = 0.92;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [questions, currentIdx]);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceHint("Speech-to-text needs Chrome or Edge (Web Speech API).");
      return;
    }
    setVoiceHint(null);
    listenIdxRef.current = currentIdx;
    const idx = currentIdx;
    answerPrefixRef.current = (answersRef.current[idx] ?? "").trim();
    dictationFinalRef.current = "";
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        if (!row?.[0]) continue;
        const piece = row[0].transcript;
        if (row.isFinal) {
          dictationFinalRef.current += piece;
        } else {
          interim += piece;
        }
      }
      const speech = (dictationFinalRef.current + interim)
        .replace(/\s+/g, " ")
        .trim();
      const prefix = answerPrefixRef.current;
      const combined = [prefix, speech].filter(Boolean).join(" ");
      setAnswers((prev) => {
        const next = [...prev];
        const j = listenIdxRef.current;
        next[j] = combined;
        return next;
      });
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [currentIdx]);

  const setAnswerText = (v: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = v;
      return next;
    });
  };

  const downloadQA = () => {
    if (!session) return;
    const payload = {
      generatedAt: new Date().toISOString(),
      jobDescription: session.jobDescription,
      questions: questions.map((q, i) => ({
        id: q.id,
        text: q.text,
        intent: q.intent,
        answer: answers[i] ?? "",
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voice-interview-qa.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const retryLoad = () => {
    window.location.reload();
  };

  const recTimeLabel =
    `${Math.floor(recSec / 60)}:${String(recSec % 60).padStart(2, "0")}`;

  const q = questions[currentIdx];
  const total = questions.length;

  if (phase === "boot") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sage-200 border-t-sage-600" />
        <p className="mt-4 text-sm text-slate-600">Starting Voice Q&amp;A…</p>
      </main>
    );
  }

  if (phase === "nosession") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-700">{sessionError}</p>
        <Link
          href="/"
          className="mt-6 inline-block font-semibold text-sage-700 underline"
        >
          Browse open roles
        </Link>
      </main>
    );
  }

  if (phase === "loading") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sage-200 border-t-sage-600" />
        <p className="mt-4 text-sm font-medium text-slate-800">
          Generating questions…
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Usually a few seconds. Times out after 70s if the API does not
          respond.
        </p>
      </main>
    );
  }

  if (phase === "error") {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600" role="alert">
          {questionsError}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retryLoad}
            className="rounded-lg bg-sage-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700"
          >
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (phase === "ready" && questions.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-700">No questions were returned.</p>
        <Link href="/" className="mt-6 inline-block text-sage-700 underline">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-8">
      <header className="mx-auto mb-8 max-w-prose md:max-w-none">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Voice Q&amp;A (from screening)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Questions are generated from parsed skills, roles, gaps, and the job
          description. Use speaker to ask; dictate or type the candidate
          response.
        </p>
        {demoMode && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Demo questions — add{" "}
            <code className="rounded bg-amber-100 px-1">GROQ_API_KEY</code> for
            tailored questions from your screening output.
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
        <aside className="app-card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Questions ({total})
          </p>
          <ol className="mt-3 max-h-[min(60vh,480px)] space-y-1 overflow-y-auto">
            {questions.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  className={`focus-ring w-full min-h-[44px] rounded-lg px-2 py-2 text-left text-xs leading-snug transition ${
                    i === currentIdx
                      ? "bg-sage-100 font-semibold text-sage-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-slate-400">{i + 1}. </span>
                  {item.text.length > 72
                    ? `${item.text.slice(0, 72)}…`
                    : item.text}
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={downloadQA}
            className="focus-ring mt-4 min-h-[44px] w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Download Q&amp;A JSON
          </button>
          <p className="mt-2 text-center text-[10px] leading-snug text-slate-500">
            Score this file on the{" "}
            <Link
              href="/interview-review"
              className="font-medium text-sage-700 underline"
            >
              Interview review
            </Link>{" "}
            page.
          </p>
        </aside>

        <section className="app-card space-y-4 p-6">
          {q && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Question {currentIdx + 1} of {total}
                </span>
                {q.intent && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                    {q.intent}
                  </span>
                )}
              </div>
              <p className="text-lg font-medium leading-relaxed text-slate-900">
                {q.text}
              </p>

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {!speaking ? (
                  <button
                    type="button"
                    onClick={speakCurrent}
                    className="focus-ring min-h-[44px] rounded-xl bg-sage-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sage-700"
                  >
                    Speak question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="focus-ring min-h-[44px] rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
                  >
                    Stop speaking
                  </button>
                )}
                {!listening ? (
                  <button
                    type="button"
                    onClick={startListening}
                    className="focus-ring min-h-[44px] rounded-xl border border-sage-300 bg-sage-50 px-4 py-2 text-sm font-semibold text-sage-800 hover:bg-sage-100"
                  >
                    Record answer (mic)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
                  >
                    <span
                      className="relative flex h-2.5 w-2.5"
                      aria-hidden
                    >
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
                    </span>
                    Listening · {recTimeLabel}
                  </button>
                )}
              </div>
              {voiceHint && (
                <p className="text-xs text-amber-800">{voiceHint}</p>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Candidate response (edit or dictate above)
                </label>
                <textarea
                  className="app-input mt-2 min-h-[180px] w-full resize-y bg-slate-50"
                  value={answers[currentIdx] ?? ""}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Answer appears here when you use the mic, or type directly…"
                />
              </div>

              <div className="flex flex-wrap justify-between gap-2 pt-2">
                <button
                  type="button"
                  disabled={currentIdx <= 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="focus-ring min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentIdx >= total - 1}
                  onClick={() =>
                    setCurrentIdx((i) => Math.min(total - 1, i + 1))
                  }
                  className="focus-ring min-h-[44px] rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
