import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  generateInterviewQuestions,
  mockInterviewQuestions,
} from "@/lib/interview-questions";
import type { ScreenResult } from "@/lib/types";
import { readWorkerEnv } from "@/lib/worker-env";

export const runtime = "nodejs";
export const maxDuration = 120;

const GROQ_BASE = "https://api.groq.com/openai/v1";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      screenResult?: ScreenResult;
      jobDescription?: string;
    };
    const screenResult = body.screenResult;
    const jobDescription = String(body.jobDescription ?? "").trim();

    if (!screenResult || typeof screenResult !== "object") {
      return NextResponse.json(
        { error: "screenResult is required." },
        { status: 400 }
      );
    }
    if (!Array.isArray(screenResult.skills)) {
      return NextResponse.json(
        { error: "Invalid screenResult payload." },
        { status: 400 }
      );
    }
    if (jobDescription.length < 20) {
      return NextResponse.json(
        { error: "jobDescription is required (min ~20 characters)." },
        { status: 400 }
      );
    }

    const groqKey = readWorkerEnv("GROQ_API_KEY");
    if (!groqKey) {
      return NextResponse.json(mockInterviewQuestions());
    }

    const groq = new OpenAI({
      apiKey: groqKey,
      baseURL: GROQ_BASE,
      timeout: 55_000,
      maxRetries: 0,
    });
    const chatModel =
      readWorkerEnv("GROQ_INTERVIEW_MODEL") || "llama-3.1-8b-instant";

    const result = await generateInterviewQuestions(
      groq,
      chatModel,
      screenResult,
      jobDescription
    );
    return NextResponse.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Question generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
