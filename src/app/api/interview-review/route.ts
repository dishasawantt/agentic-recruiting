import { NextRequest, NextResponse } from "next/server";
import { createGroqOpenAIClient } from "@/lib/ai-clients";
import {
  mockInterviewCallReview,
  reviewInterviewCall,
} from "@/lib/interview-call-review";
import { parseVoiceQAExport } from "@/lib/voice-qa-export-types";
import { readWorkerEnv } from "@/lib/worker-env";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    const ct = (req.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      return NextResponse.json(
        { error: "Content-Type must be application/json." },
        { status: 400 }
      );
    }

    const data = parseVoiceQAExport(body);
    if (!data) {
      return NextResponse.json(
        {
          error:
            "Invalid payload. Expected { jobDescription, questions: [{ id, text, answer, intent? }] } like the Voice Q&A export.",
        },
        { status: 400 }
      );
    }

    const answered = data.questions.filter((q) => q.answer.trim().length > 15)
      .length;
    if (answered < 1) {
      return NextResponse.json(
        {
          error:
            "At least one answer with meaningful text is required to score the interview.",
        },
        { status: 400 }
      );
    }

    const groqKey = readWorkerEnv("GROQ_API_KEY");
    if (!groqKey) {
      return NextResponse.json(mockInterviewCallReview(data));
    }

    const groq = createGroqOpenAIClient(groqKey, 60_000);
    const chatModel =
      readWorkerEnv("GROQ_REVIEW_MODEL") ||
      readWorkerEnv("GROQ_INTERVIEW_MODEL") ||
      "llama-3.1-8b-instant";

    const result = await reviewInterviewCall(groq, chatModel, data);
    return NextResponse.json(result);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Interview review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
