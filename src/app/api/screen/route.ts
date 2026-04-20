import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { extractTextFromBuffer } from "@/lib/text-extract";
import { withSourceMeta } from "@/lib/screen-source";
import { mockScreenResult, runScreening } from "@/lib/screening";
import { readWorkerEnv } from "@/lib/worker-env";

export const runtime = "nodejs";
export const maxDuration = 120;

const GROQ_BASE = "https://api.groq.com/openai/v1";

async function parseFormData(form: FormData): Promise<{
  resumeText: string;
  jobDescription: string;
  hadFileUpload: boolean;
}> {
  const jobDescription = String(form.get("jobDescription") ?? "").trim();
  const pasted = String(form.get("resumeText") ?? "").trim();
  const file = form.get("file");
  let resumeText = pasted;
  let hadFileUpload = false;

  if (file instanceof Blob && file.size > 0) {
    hadFileUpload = true;
    const buf = Buffer.from(await file.arrayBuffer());
    const name = file instanceof File ? file.name : "resume.upload";
    const extracted = await extractTextFromBuffer(
      buf,
      file.type || "application/octet-stream",
      name
    );
    resumeText = extracted || pasted;
  }

  return { resumeText, jobDescription, hadFileUpload };
}

async function bufferFromRequest(req: NextRequest): Promise<{
  resumeText: string;
  jobDescription: string;
  hadFileUpload: boolean;
}> {
  const ct = (req.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) {
    const body = (await req.json()) as {
      resumeText?: string;
      jobDescription?: string;
    };
    return {
      resumeText: String(body.resumeText ?? "").trim(),
      jobDescription: String(body.jobDescription ?? "").trim(),
      hadFileUpload: false,
    };
  }

  const form = await req.formData();
  return parseFormData(form);
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, hadFileUpload } =
      await bufferFromRequest(req);
    if (!jobDescription || jobDescription.length < 40) {
      return NextResponse.json(
        { error: "Job description is required (at least 40 characters)." },
        { status: 400 }
      );
    }
    if (!resumeText || resumeText.length < 30) {
      const msg = hadFileUpload
        ? "Could not read enough text from this file. Try DOCX or TXT, paste the resume below, or use a text-based PDF (scanned/image PDFs often extract as empty)."
        : "Resume text is required (paste text or upload PDF/DOCX/TXT, min ~30 characters).";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const groqKey = readWorkerEnv("GROQ_API_KEY");
    if (!groqKey) {
      const result = mockScreenResult(resumeText, jobDescription);
      return NextResponse.json(
        withSourceMeta(result, resumeText, hadFileUpload)
      );
    }

    const groq = new OpenAI({
      apiKey: groqKey,
      baseURL: GROQ_BASE,
    });
    const openaiKey = readWorkerEnv("OPENAI_API_KEY");
    const embeddingOpenAI = openaiKey
      ? new OpenAI({ apiKey: openaiKey })
      : null;
    const chatModel =
      readWorkerEnv("GROQ_MODEL") || "llama-3.3-70b-versatile";

    const result = await runScreening({
      groq,
      embeddingOpenAI,
      chatModel,
      resumeText,
      jobDescription,
    });
    return NextResponse.json(
      withSourceMeta(result, resumeText, hadFileUpload)
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Screening failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
