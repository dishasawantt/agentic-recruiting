import { NextRequest, NextResponse } from "next/server";
import { createGroqOpenAIClient } from "@/lib/ai-clients";
import {
  generateInterviewSimNext,
  mockInterviewSimNext,
} from "@/lib/interview-simulation";
import type { InterviewSimNextRequest } from "@/lib/interview-simulation-types";
import type { ScreenResult } from "@/lib/types";
import { readWorkerEnv } from "@/lib/worker-env";

export const runtime = "nodejs";
export const maxDuration = 120;

function isScreenResult(x: unknown): x is ScreenResult {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.matchScore === "number" &&
    Array.isArray(o.skills) &&
    typeof o.categoryScores === "object"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<InterviewSimNextRequest>;
    const mode = body.mode === "followup" ? "followup" : "main";
    const mainQuestionIndex = Number(body.mainQuestionIndex);
    const jobDescription = String(body.jobDescription ?? "").trim();
    const screenResult = body.screenResult;
    const priorExchanges = Array.isArray(body.priorExchanges)
      ? body.priorExchanges
      : [];

    if (!isScreenResult(screenResult)) {
      return NextResponse.json(
        { error: "screenResult is required and invalid." },
        { status: 400 }
      );
    }
    if (jobDescription.length < 20) {
      return NextResponse.json(
        { error: "jobDescription is required (min ~20 characters)." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(mainQuestionIndex) || mainQuestionIndex < 1) {
      return NextResponse.json(
        { error: "mainQuestionIndex must be >= 1." },
        { status: 400 }
      );
    }
    if (mode === "main" && mainQuestionIndex > 5) {
      return NextResponse.json(
        { error: "Interview is limited to 5 main questions." },
        { status: 400 }
      );
    }

    const groqKey = readWorkerEnv("GROQ_API_KEY");
    if (!groqKey) {
      return NextResponse.json(mockInterviewSimNext(mode, mainQuestionIndex));
    }

    const groq = createGroqOpenAIClient(groqKey);
    const chatModel =
      readWorkerEnv("GROQ_INTERVIEW_MODEL") || "llama-3.1-8b-instant";

    const cleanPrior = priorExchanges.filter(
      (e): e is InterviewSimNextRequest["priorExchanges"][number] =>
        !!e &&
        typeof e === "object" &&
        (e.kind === "main" || e.kind === "followup") &&
        typeof e.question === "string" &&
        typeof e.answer === "string"
    );

    const result = await generateInterviewSimNext(
      groq,
      chatModel,
      mode,
      mainQuestionIndex,
      jobDescription,
      screenResult,
      cleanPrior
    );
    return NextResponse.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Interview simulation step failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
