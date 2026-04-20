"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InterviewProgressRail } from "@/components/InterviewProgressRail";
import {
  loadCandidateSession,
  savePendingInterviewReview,
  type CandidateSessionPayload,
} from "@/lib/candidate-session";
import type { SimExchangePayload } from "@/lib/interview-simulation-types";

const SIM_GIF_ASKING = "/media/asking.gif";
const SIM_GIF_NOTES = "/media/listening.gif";
const INTERVIEW_WELCOME_TEXT =
  "Welcome to the interview. I will ask five core questions and a few short follow-ups. Take your time and answer in a clear, structured way.";
const CHAT_INTRO = "Connecting you to the interview room…";

function primeSpeechSynthesis() {
  if (typeof window === "undefined") return;
  const ss = window.speechSynthesis;
  try {
    ss.resume();
  } catch {
    /* ignore */
  }
  void ss.getVoices();
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const vs = window.speechSynthesis.getVoices();
  if (!vs.length) return null;
  const us = vs.filter((v) => v.lang?.toLowerCase().startsWith("en-us"));
  const en = vs.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  return (
    us.find((v) => v.localService) ??
    us[0] ??
    en.find((v) => v.localService) ??
    en[0] ??
    vs.find((v) => v.default) ??
    vs[0] ??
    null
  );
}

function IconPlay() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconSquare() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 1 1-10 0H5a7 7 0 0 0 6 6.92V20H9v2h6v-2h-2v-2.08A7 7 0 0 0 19 11h-2z"
      />
    </svg>
  );
}

function PresenceVisualizer({ active, dark: darkMode }: { active: boolean; dark?: boolean }) {
  const inactive = darkMode ? "bg-zinc-600" : "bg-slate-200";
  const activeCls = darkMode
    ? "h-10 w-[3px] origin-bottom rounded-full bg-gradient-to-t from-[#2D8CFF] to-cyan-300 animate-voice-bar motion-reduce:animate-none"
    : "h-10 w-[3px] origin-bottom rounded-full bg-gradient-to-t from-sage-700 to-sage-400 animate-voice-bar motion-reduce:animate-none";
  return (
    <div className="mt-2 flex h-12 w-full max-w-[min(100%,280px)] items-end justify-center gap-[3px] lg:max-w-none lg:justify-start">
      {Array.from({ length: 26 }, (_, i) => (
        <div
          key={i}
          className={
            active ? activeCls : `h-1.5 w-[3px] rounded-full ${inactive}`
          }
          style={active ? { animationDelay: `${i * 38}ms` } : undefined}
        />
      ))}
    </div>
  );
}

function fitVideoBox(vw: number, vh: number, slotMaxW?: number | null) {
  if (typeof window === "undefined") return { w: 288, h: 512 };
  const pad = 24;
  const maxH = Math.min(window.innerHeight * 0.8, 720);
  let maxW = Math.max(160, window.innerWidth - pad);
  if (slotMaxW != null && Number.isFinite(slotMaxW) && slotMaxW >= 160) {
    maxW = Math.min(maxW, Math.floor(slotMaxW));
  }
  let h = maxH;
  let w = (h * vw) / vh;
  if (w > maxW) {
    w = maxW;
    h = (w * vh) / vw;
  }
  return { w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) };
}

function InterviewSimAmbientVideos({
  takingNotes,
  meet,
}: {
  takingNotes: boolean;
  meet?: boolean;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const askingRef = useRef<HTMLImageElement>(null);
  const notesRef = useRef<HTMLImageElement>(null);
  const [slotW, setSlotW] = useState<number | null>(null);
  const [dimsAsking, setDimsAsking] = useState<{ vw: number; vh: number } | null>(
    null,
  );
  const [dimsNotes, setDimsNotes] = useState<{ vw: number; vh: number } | null>(null);
  const [box, setBox] = useState({ w: 288, h: 512 });

  const dimsActive =
    takingNotes ? (dimsNotes ?? dimsAsking) : (dimsAsking ?? dimsNotes);

  const readAskingDims = useCallback(() => {
    const el = askingRef.current;
    if (el && el.naturalWidth > 0 && el.naturalHeight > 0) {
      setDimsAsking({ vw: el.naturalWidth, vh: el.naturalHeight });
    }
  }, []);

  const readNotesDims = useCallback(() => {
    const el = notesRef.current;
    if (el && el.naturalWidth > 0 && el.naturalHeight > 0) {
      setDimsNotes({ vw: el.naturalWidth, vh: el.naturalHeight });
    }
  }, []);

  const applyBox = useCallback(() => {
    if (dimsActive) setBox(fitVideoBox(dimsActive.vw, dimsActive.vh, slotW));
    else setBox(fitVideoBox(720, 1280, slotW));
  }, [dimsActive, slotW]);

  useEffect(() => {
    applyBox();
  }, [applyBox]);

  useEffect(() => {
    const onResize = () => applyBox();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyBox]);

  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setSlotW(Math.floor(w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const arW = dimsActive?.vw ?? 9;
  const arH = dimsActive?.vh ?? 16;

  const frameClass = meet
    ? "relative isolate mx-auto max-w-full overflow-hidden rounded-lg bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
    : "relative isolate mx-auto max-w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/[0.04]";

  return (
    <div
      ref={slotRef}
      className={
        meet
          ? "flex h-full min-h-0 w-full min-w-0 shrink-0 flex-col items-center justify-center"
          : "w-full min-w-0 shrink-0"
      }
    >
      <div
        className={frameClass}
        style={{
          aspectRatio: `${arW} / ${arH}`,
          width: `min(100%, ${box.w}px)`,
          height: "auto",
          ...(meet ? { maxHeight: "min(56dvh, 580px)" } : {}),
        }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs, crossfade */}
        <img
          ref={askingRef}
          src={SIM_GIF_ASKING}
          alt=""
          draggable={false}
          onLoad={readAskingDims}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            takingNotes ? "pointer-events-none z-0 opacity-0" : "z-10 opacity-100"
          }`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs, crossfade */}
        <img
          ref={notesRef}
          src={SIM_GIF_NOTES}
          alt=""
          draggable={false}
          onLoad={readNotesDims}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            takingNotes ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
          }`}
        />
      </div>
    </div>
  );
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

async function fetchSimNext(body: Record<string, unknown>) {
  const res = await fetch("/api/interview-sim/next", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { question?: string; error?: string; demoMode?: boolean };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function InterviewSimulationPage() {
  const router = useRouter();
  const [session, setSession] = useState<CandidateSessionPayload | null>(null);
  const [boot, setBoot] = useState(true);
  const [exchanges, setExchanges] = useState<SimExchangePayload[]>([]);
  const [currentMainRound, setCurrentMainRound] = useState(1);
  const [activeKind, setActiveKind] = useState<"main" | "followup">("main");
  const [activeQuestionText, setActiveQuestionText] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [introLine, setIntroLine] = useState<string | null>(null);

  const recRef = useRef<SpeechRecognition | null>(null);
  const draftRef = useRef("");
  const dictationFinalRef = useRef("");
  const answerPrefixRef = useRef("");
  const speakGenRef = useRef(0);
  const beginGenRef = useRef(0);
  const interviewLockRef = useRef(false);
  draftRef.current = draftAnswer;

  const presenceActive = speaking || listening || loading;

  useEffect(() => {
    const s = loadCandidateSession();
    setSession(s);
    setBoot(false);
  }, []);

  const unlockSpeechAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    const ss = window.speechSynthesis;
    if (!ss) return;
    primeSpeechSynthesis();
    if (audioReady) return;
    try {
      ss.cancel();
      const probe = new SpeechSynthesisUtterance(".");
      probe.volume = 0;
      probe.rate = 1;
      probe.pitch = 1;
      probe.lang = "en-US";
      const voice = pickEnglishVoice();
      if (voice) probe.voice = voice;
      probe.onend = () => setAudioReady(true);
      probe.onerror = () => setAudioReady(false);
      ss.speak(probe);
    } catch {
      setAudioReady(false);
    }
  }, [audioReady]);

  useEffect(() => {
    if (!listening) {
      setRecSec(0);
      return;
    }
    const id = window.setInterval(() => setRecSec((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, [listening]);

  useEffect(() => {
    return () => {
      speakGenRef.current += 1;
      window.speechSynthesis.cancel();
      recRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!finished) return;
    speakGenRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [finished]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ss = window.speechSynthesis;
    const kick = () => {
      void ss.getVoices();
      try {
        ss.resume();
      } catch {
        /* ignore */
      }
    };
    kick();
    ss.addEventListener("voiceschanged", kick);
    return () => ss.removeEventListener("voiceschanged", kick);
  }, []);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve();
        return;
      }
      const trimmed = text.trim();
      if (!trimmed) {
        resolve();
        return;
      }
      speakGenRef.current += 1;
      const gen = speakGenRef.current;
      primeSpeechSynthesis();
      const ss = window.speechSynthesis;
      if (!ss) {
        resolve();
        return;
      }
      ss.cancel();
      const u = new SpeechSynthesisUtterance(trimmed);
      u.lang = "en-US";
      u.rate = 0.88;
      u.pitch = 1;
      const voice = pickEnglishVoice();
      if (voice) {
        u.voice = voice;
      } else {
        setVoiceHint("Voice playback unavailable. Continue with on-screen questions.");
      }
      const timeoutIds: number[] = [];
      let settled = false;
      let heardStart = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        for (const id of timeoutIds) window.clearTimeout(id);
        timeoutIds.length = 0;
        if (speakGenRef.current === gen) {
          setSpeaking(false);
        }
        resolve();
      };
      u.onstart = () => {
        if (gen !== speakGenRef.current) return;
        heardStart = true;
        setAudioReady(true);
        setVoiceHint(null);
        setSpeaking(true);
      };
      u.onend = finish;
      u.onerror = finish;
      const words = trimmed.split(/\s+/).filter(Boolean).length;
      const failSafeMs = Math.min(
        180_000,
        Math.max(12_000, Math.round((words * 520) / u.rate + trimmed.length * 40)),
      );
      timeoutIds.push(window.setTimeout(finish, failSafeMs));
      ss.speak(u);
      if (ss.paused) {
        try {
          ss.resume();
        } catch {
          /* ignore */
        }
      }
      timeoutIds.push(
        window.setTimeout(() => {
          if (gen !== speakGenRef.current) return;
          if (heardStart) return;
          if (!ss.speaking && !ss.pending) {
            setVoiceHint(
              "Audio may be blocked. Tap “Enable audio and replay question” or use Chrome.",
            );
            finish();
          }
        }, 2200),
      );
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    speakGenRef.current += 1;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    if (speaking) {
      setVoiceHint("Wait until the question finishes, or tap stop on playback.");
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceHint("Speech-to-text works best in Chrome or Edge.");
      return;
    }
    setVoiceHint(null);
    answerPrefixRef.current = draftRef.current.trim();
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
      setDraftAnswer([prefix, speech].filter(Boolean).join(" "));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }, [speaking]);

  const beginInterview = useCallback(async () => {
    const s = session;
    if (!s || interviewLockRef.current) return;
    interviewLockRef.current = true;
    beginGenRef.current += 1;
    const runId = beginGenRef.current;
    unlockSpeechAudio();
    primeSpeechSynthesis();
    setError(null);
    setInterviewStarted(true);
    setLoading(true);
    setActiveQuestionText("");
    setIntroLine(CHAT_INTRO);
    try {
      const firstPromise = fetchSimNext({
        mode: "main",
        mainQuestionIndex: 1,
        jobDescription: s.jobDescription,
        screenResult: s.screenResult,
        priorExchanges: [],
      });
      await speakText(INTERVIEW_WELCOME_TEXT);
      if (runId !== beginGenRef.current) return;
      const first = await firstPromise;
      if (runId !== beginGenRef.current) return;
      if (first.demoMode) setDemoMode(true);
      const q = String(first.question ?? "").trim();
      if (!q) throw new Error("No question returned");
      setActiveKind("main");
      setCurrentMainRound(1);
      setIntroLine(null);
      setActiveQuestionText(q);
      setLoading(false);
      await speakText(q);
    } catch (e) {
      setLoading(false);
      setIntroLine(null);
      setInterviewStarted(false);
      interviewLockRef.current = false;
      setError(e instanceof Error ? e.message : "Could not start interview");
    }
  }, [session, speakText, unlockSpeechAudio]);

  const submitAnswer = useCallback(async () => {
    const s = session;
    if (!s || finished) return;
    const a = draftAnswer.trim();
    if (!a || !activeQuestionText) return;

    stopListening();
    stopSpeaking();
    const nextEx: SimExchangePayload[] = [
      ...exchanges,
      {
        kind: activeKind,
        question: activeQuestionText,
        answer: a,
      },
    ];
    setExchanges(nextEx);
    setDraftAnswer("");
    setLoading(true);
    setError(null);

    try {
      if (activeKind === "main") {
        const fu = await fetchSimNext({
          mode: "followup",
          mainQuestionIndex: currentMainRound,
          jobDescription: s.jobDescription,
          screenResult: s.screenResult,
          priorExchanges: nextEx,
        });
        if (fu.demoMode) setDemoMode(true);
        const fq = String(fu.question ?? "").trim();
        if (fq.length >= 8) {
          setActiveKind("followup");
          setActiveQuestionText(fq);
          setLoading(false);
          await speakText(fq);
          return;
        }
      }

      const nextMain = currentMainRound + 1;
      if (nextMain > 5) {
        setLoading(false);
        setFinished(true);
        const questions = nextEx.map((e, i) => ({
          id: `turn-${i + 1}`,
          text: e.question,
          intent: e.kind,
          answer: e.answer,
        }));
        savePendingInterviewReview({
          jobDescription: s.jobDescription,
          questions,
        });
        return;
      }

      setCurrentMainRound(nextMain);
      setActiveKind("main");
      const mq = await fetchSimNext({
        mode: "main",
        mainQuestionIndex: nextMain,
        jobDescription: s.jobDescription,
        screenResult: s.screenResult,
        priorExchanges: nextEx,
      });
      if (mq.demoMode) setDemoMode(true);
      const q = String(mq.question ?? "").trim();
      if (!q) throw new Error("No next question returned");
      setActiveQuestionText(q);
      setLoading(false);
      await speakText(q);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, [
    session,
    finished,
    draftAnswer,
    activeQuestionText,
    activeKind,
    exchanges,
    currentMainRound,
    stopListening,
    stopSpeaking,
    speakText,
  ]);

  const goToReview = useCallback(() => {
    router.push("/interview-review?from=sim");
  }, [router]);

  const recTimeLabel = `${Math.floor(recSec / 60)}:${String(recSec % 60).padStart(2, "0")}`;

  if (boot) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sage-200 border-t-sage-600" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-slate-600">No session — apply to a role first.</p>
        <Link
          href="/"
          className="focus-ring mt-6 inline-block text-xs font-semibold uppercase tracking-wider text-sage-700"
        >
          ← Roles
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1100px] px-4 py-8 md:px-8">
      {interviewStarted && !finished ? (
        <p className="mb-3">
          <Link
            href="/"
            className="focus-ring text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-sage-700"
          >
            ← Roles
          </Link>
        </p>
      ) : (
        <>
          <p className="mb-6">
            <Link
              href="/"
              className="focus-ring text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-sage-700"
            >
              ← Roles
            </Link>
          </p>

          <header className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage-600/90">
              Live sim
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Interview
            </h1>
            <p className="mt-2 text-xs text-slate-500 line-clamp-2">{session.jobTitle}</p>
            {demoMode && (
              <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-[11px] text-amber-900">
                Demo — add <code className="rounded bg-amber-100/90 px-1">GROQ_API_KEY</code>
              </p>
            )}
          </header>
        </>
      )}

      {!interviewStarted && (
        <div className="app-card relative overflow-hidden p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#2D5A4C]" />
          <InterviewProgressRail mainRound={1} totalMains={5} isFollowUp={false} />
          <p className="mt-6 text-center text-[11px] font-medium uppercase tracking-wider text-slate-400">
            5 questions · optional follow-ups
          </p>
          <button
            type="button"
            onClick={() => {
              primeSpeechSynthesis();
              void beginInterview();
            }}
            disabled={loading}
            className="focus-ring mx-auto mt-6 flex min-h-[48px] w-full max-w-xs items-center justify-center rounded-xl bg-slate-900 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "…" : "Begin"}
          </button>
        </div>
      )}

      {interviewStarted && !finished && (
        <div className="-mx-4 overflow-hidden rounded-xl border border-zinc-700/90 bg-zinc-950 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] md:-mx-8 lg:mx-0">
          <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                title="Recording simulation"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">
                  Live interview
                </p>
                <p className="truncate text-[11px] text-zinc-400">{session.jobTitle}</p>
              </div>
            </div>
            <span className="hidden rounded-md border border-zinc-700/80 bg-zinc-800/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400 sm:inline">
              Simulated meeting
            </span>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {demoMode && (
                <span className="max-w-[10rem] truncate rounded bg-amber-950/50 px-2 py-0.5 text-[9px] font-medium text-amber-200/90 ring-1 ring-amber-700/40">
                  Demo API
                </span>
              )}
              {activeKind === "main" ? (
                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-200">
                  Q{currentMainRound}/5
                </span>
              ) : (
                <span className="rounded-full bg-sky-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                  Follow-up
                </span>
              )}
              {loading && (
                <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  …
                </span>
              )}
              <Link
                href="/"
                className="focus-ring rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              >
                Leave
              </Link>
            </div>
          </header>

          <div className="grid min-h-[min(76dvh,680px)] grid-cols-1 lg:grid-cols-[minmax(220px,32%)_minmax(0,1fr)] xl:grid-cols-[minmax(240px,28%)_minmax(0,1fr)]">
            <div className="relative flex min-h-[300px] flex-col bg-black lg:min-h-0">
              <div className="pointer-events-none absolute right-3 top-3 z-20 hidden sm:block">
                <div className="flex h-[4.5rem] w-[7.25rem] flex-col items-center justify-center rounded-lg border border-white/10 bg-zinc-900/95 shadow-lg backdrop-blur-sm">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    You
                  </span>
                  <span className="mt-1 text-[9px] text-zinc-600">Camera off</span>
                  <span
                    className={`mt-2 h-2 w-2 rounded-full ${listening ? "bg-red-500" : "bg-emerald-500"}`}
                    aria-hidden
                  />
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-3 py-5 sm:px-5">
                <InterviewSimAmbientVideos meet takingNotes={!speaking} />
                <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 w-[min(100%,20rem)] -translate-x-1/2 sm:left-6 sm:w-auto sm:translate-x-0">
                  <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/75 px-3 py-2 shadow-lg backdrop-blur-md">
                    <span className="text-sm font-medium text-white">Interviewer</span>
                    {speaking && (
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Speaking
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800/90 bg-zinc-950 px-4 py-2.5">
                <PresenceVisualizer dark active={presenceActive} />
                <p className="mt-1 text-center text-[11px] text-zinc-500 sm:text-left">
                  {listening
                    ? "Listening…"
                    : speaking
                      ? "Speaking…"
                      : loading
                        ? "Preparing question…"
                        : "Ready"}
                </p>
              </div>
            </div>

            <aside className="flex min-h-[280px] flex-col border-t border-zinc-800 bg-zinc-900 lg:min-h-0 lg:border-l lg:border-t-0">
              <div className="shrink-0 border-b border-zinc-800 px-4 py-3">
                <InterviewProgressRail
                  mainRound={currentMainRound}
                  totalMains={5}
                  isFollowUp={activeKind === "followup"}
                  variant="dark"
                />
              </div>
              <div className="shrink-0 border-b border-zinc-800 px-4 py-2 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Meeting chat
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <div className="flex justify-start">
                  <div className="max-w-full rounded-2xl rounded-tl-md border border-zinc-700/60 bg-zinc-800/90 px-3.5 py-3 shadow-inner sm:px-4 sm:py-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Interviewer
                    </p>
                    {(introLine ?? activeQuestionText).trim() ? (
                      <p className="mt-2 text-sm leading-relaxed text-zinc-100 sm:text-[15px]">
                        {introLine ?? activeQuestionText}
                      </p>
                    ) : (
                      <p
                        className={`mt-2 text-sm leading-relaxed text-zinc-500 motion-reduce:animate-none ${loading ? "animate-pulse" : ""}`}
                        role="status"
                        aria-live="polite"
                      >
                        {loading ? "Fetching the next question…" : "Waiting for the question…"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Your answer
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-zinc-500">
                  Prefer{" "}
                  <span className="font-medium text-zinc-300">spoken answers</span>: replay
                  the question if needed, then tap the mic to record. Transcript below — edit
                  or type if you prefer.
                </p>
                {!audioReady && (
                  <button
                    type="button"
                    onClick={() => {
                      unlockSpeechAudio();
                      if (activeQuestionText.trim()) {
                        void speakText(activeQuestionText);
                      }
                    }}
                    className="focus-ring mt-3 w-full rounded-lg border border-amber-500/50 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-900/40"
                  >
                    Enable audio and replay question
                  </button>
                )}
                {!listening ? (
                  <div className="mt-4 flex items-center justify-center gap-5">
                    {!speaking ? (
                      <button
                        type="button"
                        disabled={!activeQuestionText.trim() || loading || !!introLine}
                        onClick={() => speakText(activeQuestionText)}
                        title="Replay question"
                        className="focus-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-white shadow-md ring-1 ring-white/10 hover:bg-zinc-600 disabled:opacity-40"
                      >
                        <IconPlay />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        title="Stop playback"
                        className="focus-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-2 ring-red-500/30 hover:bg-zinc-100"
                      >
                        <IconSquare />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={
                        loading || !activeQuestionText.trim() || !!introLine || speaking
                      }
                      onClick={startListening}
                      title="Record answer"
                      className="focus-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#2D8CFF]/70 bg-[#2D8CFF] text-white shadow-lg shadow-[#2D8CFF]/25 hover:bg-[#2680eb] disabled:opacity-40"
                    >
                      <IconMic />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={stopListening}
                      title="Stop recording"
                      className="focus-ring inline-flex min-h-[56px] w-full max-w-[17rem] items-center justify-center gap-2 rounded-full border-2 border-red-500/60 bg-red-950/50 px-6 text-sm font-semibold text-red-100 hover:bg-red-950/80"
                    >
                      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                      </span>
                      Stop recording · {recTimeLabel}
                    </button>
                  </div>
                )}
                {voiceHint && (
                  <p className="mt-2 text-xs text-amber-300/90">{voiceHint}</p>
                )}
                <details className="group mt-4 rounded-lg border border-zinc-800 bg-zinc-900/50 open:border-zinc-700 open:bg-zinc-900">
                  <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-medium text-zinc-400 marker:content-none [&::-webkit-details-marker]:hidden group-open:text-zinc-300">
                    <span className="underline decoration-zinc-600 decoration-dotted underline-offset-2 group-open:no-underline">
                      Type or edit transcript instead
                    </span>
                  </summary>
                  <div className="border-t border-zinc-800 px-3 pb-3 pt-2">
                    <textarea
                      className="focus-ring min-h-[88px] w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-2 text-xs leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#2D8CFF]/50 focus:ring-1 focus:ring-[#2D8CFF]/30"
                      value={draftAnswer}
                      onChange={(e) => setDraftAnswer(e.target.value)}
                      placeholder="Transcript from dictation, or type your answer…"
                      disabled={loading || !activeQuestionText.trim() || !!introLine}
                    />
                  </div>
                </details>
                <button
                  type="button"
                  disabled={
                    loading ||
                    !draftAnswer.trim() ||
                    !activeQuestionText.trim() ||
                    !!introLine ||
                    speaking
                  }
                  onClick={submitAnswer}
                  className="focus-ring mt-3 flex min-h-[42px] w-full items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
                >
                  {loading ? "…" : "Submit answer"}
                </button>
                {error && (
                  <p className="mt-2 text-sm text-red-400" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}

      {finished && (
        <div className="app-card-highlight space-y-5 p-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Complete
          </p>
          <button
            type="button"
            onClick={goToReview}
            className="focus-ring mx-auto min-h-[48px] w-full max-w-xs rounded-xl bg-slate-900 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-slate-800"
          >
            Scorecard
          </button>
        </div>
      )}
    </main>
  );
}
