import OpenAI from "openai";
import type { VoiceQAExport } from "./voice-qa-export-types";
import type { InterviewCallReviewResult } from "./interview-call-review-types";

function parseJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid model JSON");
  return JSON.parse(trimmed.slice(start, end + 1));
}

const TIERS: InterviewCallReviewResult["rankTier"][] = [
  "top",
  "strong",
  "solid",
  "mixed",
  "weak",
];

function normalizeTier(v: string): InterviewCallReviewResult["rankTier"] {
  const x = v.toLowerCase().trim() as InterviewCallReviewResult["rankTier"];
  return TIERS.includes(x) ? x : "mixed";
}

function buildQaBlock(data: VoiceQAExport): string {
  return data.questions
    .map((q, i) => {
      const a = (q.answer || "").slice(0, 3500);
      return `---\nQ${i + 1} [${q.intent ?? "general"}] (id:${q.id})\n${q.text}\n\nA:\n${a || "(no answer provided)"}`;
    })
    .join("\n");
}

export async function reviewInterviewCall(
  groq: OpenAI,
  chatModel: string,
  data: VoiceQAExport
): Promise<InterviewCallReviewResult> {
  const jd = data.jobDescription.slice(0, 10000);
  const block = buildQaBlock(data).slice(0, 95000);

  const completion = await groq.chat.completions.create({
    model: chatModel,
    temperature: 0.2,
    max_tokens: 3500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert interview assessor. You receive a job description and a structured Q&A session (questions + candidate answers). Score and rank the interview holistically.

Return JSON only:
{
  "overallScore": number,
  "rankLabel": string,
  "rankTier": "top" | "strong" | "solid" | "mixed" | "weak",
  "executiveSummary": string,
  "dimensionScores": {
    "communication": number,
    "technicalDepth": number,
    "problemSolving": number,
    "roleFit": number
  },
  "strengths": string[],
  "weaknesses": string[]
}

Rules:
- overallScore and all dimension scores are integers 0-100.
- rankLabel: short recruiter-facing label (e.g. "Strong hire signal", "Needs follow-up", "Not recommended") aligned with rankTier.
- executiveSummary: 2-4 sentences.
- strengths: 4-7 specific bullets tied to answers.
- weaknesses: 3-7 constructive bullets (risks, vagueness, gaps vs JD).
- If many answers are empty or very short, lower scores and say so in executiveSummary.`,
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jd}\n\nQ&A SESSION:\n${block}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty model response");
  const parsed = parseJsonFromContent(raw) as Record<string, unknown>;
  const dim = parsed.dimensionScores as
    | InterviewCallReviewResult["dimensionScores"]
    | undefined;

  const clamp = (n: number) => {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  return {
    overallScore: clamp(Number(parsed.overallScore)),
    rankLabel: String(parsed.rankLabel ?? "Review"),
    rankTier: normalizeTier(String(parsed.rankTier ?? "mixed")),
    executiveSummary: String(parsed.executiveSummary ?? ""),
    dimensionScores: {
      communication: clamp(Number(dim?.communication)),
      technicalDepth: clamp(Number(dim?.technicalDepth)),
      problemSolving: clamp(Number(dim?.problemSolving)),
      roleFit: clamp(Number(dim?.roleFit)),
    },
    strengths: Array.isArray(parsed.strengths)
      ? (parsed.strengths as string[]).map(String)
      : [],
    weaknesses: Array.isArray(parsed.weaknesses)
      ? (parsed.weaknesses as string[]).map(String)
      : [],
  };
}

export function mockInterviewCallReview(
  data: VoiceQAExport
): InterviewCallReviewResult {
  const answered = data.questions.filter((q) => q.answer.trim().length > 20)
    .length;
  const base = 55 + Math.min(30, answered * 4);
  return {
    demoMode: true,
    overallScore: base,
    rankLabel: "Demo — add GROQ_API_KEY for live scoring",
    rankTier: "mixed",
    executiveSummary:
      "This is placeholder scoring. Set GROQ_API_KEY in .env.local and submit again for a full assessment from your Voice Q&A JSON export.",
    dimensionScores: {
      communication: base - 2,
      technicalDepth: base - 5,
      problemSolving: base - 3,
      roleFit: base,
    },
    strengths: [
      `Detected ${answered} substantive answers in the export — production mode scores each against the job description.`,
      "Upload the same JSON you download from Voice Q&A (voice-interview-qa.json).",
    ],
    weaknesses: [
      "Demo mode does not analyze answer content in depth.",
      "Empty or very short answers will lower scores in live mode.",
    ],
  };
}
