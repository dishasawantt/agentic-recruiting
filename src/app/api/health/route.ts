import { NextResponse } from "next/server";
import { readWorkerEnv } from "@/lib/worker-env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasGroqKey: Boolean(readWorkerEnv("GROQ_API_KEY")),
    hasOpenAiKey: Boolean(readWorkerEnv("OPENAI_API_KEY")),
  });
}
