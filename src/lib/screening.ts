import OpenAI from "openai";
import type { ScreenResult } from "./types";
import { cosineSimilarity, similarityToScore } from "./similarity";

const EMBED_MODEL = "text-embedding-3-small";

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function parseJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid model JSON");
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function embed(openai: OpenAI, text: string): Promise<number[]> {
  const t = text.slice(0, 30000);
  const res = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: t,
  });
  const v = res.data[0]?.embedding;
  if (!v) throw new Error("No embedding returned");
  return v;
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
}

export async function runScreening(params: {
  groq: OpenAI;
  embeddingOpenAI: OpenAI | null;
  chatModel: string;
  resumeText: string;
  jobDescription: string;
}): Promise<ScreenResult> {
  const {
    groq,
    embeddingOpenAI,
    chatModel,
    resumeText,
    jobDescription,
  } = params;
  const resumeChunk = resumeText.slice(0, 24000);
  const jobChunk = jobDescription.slice(0, 12000);

  let embeddingSimilarity = 0;
  let embeddingMethod: ScreenResult["embeddingMethod"] = "llm_estimate";
  let similarityContext = `No embedding API configured. You MUST output "semanticDocumentSimilarity" (integer 0–100): a calibrated estimate of document-level semantic overlap between resume and job (synonyms, paraphrases, transferable skills should lift the score; do not mirror keyword overlap alone).`;

  if (embeddingOpenAI) {
    try {
      const [resumeEmb, jobEmb] = await Promise.all([
        embed(embeddingOpenAI, resumeChunk),
        embed(embeddingOpenAI, jobChunk),
      ]);
      const cosine = cosineSimilarity(resumeEmb, jobEmb);
      embeddingSimilarity = similarityToScore(cosine);
      embeddingMethod = "openai";
      similarityContext = `True embedding cosine similarity of full resume vs job text ≈ ${cosine.toFixed(
        4
      )} (on a 0–1 scale). Align categoryScores with this signal where appropriate.`;
    } catch {
      embeddingMethod = "llm_estimate";
      embeddingSimilarity = 0;
      similarityContext = `Embedding API failed or key is invalid; treat embeddings as unavailable. You MUST output "semanticDocumentSimilarity" (integer 0–100): a calibrated estimate of document-level semantic overlap between resume and job (synonyms, paraphrases, transferable skills should lift the score; do not mirror keyword overlap alone).`;
    }
  }

  const useOpenAiJsonShape = embeddingMethod === "openai";

  const jsonShapeOpenAI = `Return a single JSON object with this exact shape:
{
  "skills": string[],
  "education": { "institution": string, "degree": string, "dates": string }[],
  "employment": { "company": string, "role": string, "dates": string, "highlights": string[] }[],
  "impact": string[],
  "categoryScores": {
    "skillAlignment": number,
    "experienceRelevance": number,
    "impactEvidence": number,
    "semanticFit": number
  },
  "skillGaps": string[],
  "whyShortlisted": string[],
  "issuesCount": number
}`;

  const jsonShapeGroqOnly = `Return a single JSON object with this exact shape:
{
  "semanticDocumentSimilarity": number,
  "skills": string[],
  "education": { "institution": string, "degree": string, "dates": string }[],
  "employment": { "company": string, "role": string, "dates": string, "highlights": string[] }[],
  "impact": string[],
  "categoryScores": {
    "skillAlignment": number,
    "experienceRelevance": number,
    "impactEvidence": number,
    "semanticFit": number
  },
  "skillGaps": string[],
  "whyShortlisted": string[],
  "issuesCount": number
}`;

  const completion = await groq.chat.completions.create({
    model: chatModel,
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert recruiting analyst. Compare the resume to the job description using meaning and transferable skills, not keyword stuffing.

${useOpenAiJsonShape ? jsonShapeOpenAI : jsonShapeGroqOnly}

Rules:
- All scores are integers 0-100.
- semanticFit should reflect how well the candidate's narrative fits the role (beyond keywords).
- skillGaps: concrete missing or weak areas vs the job, as recruiter-facing bullets.
- whyShortlisted: 3-6 bullets explaining why this profile merits human review (LLM reasoning for recruiters).
- issuesCount: approximate count of gaps, risks, or ambiguities (like ATS issue counts).
- Extract only what is supported by the resume text; do not invent employers or degrees.`,
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jobChunk}\n\nRESUME:\n${resumeChunk}\n\n${similarityContext}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty model response");
  const parsed = parseJsonFromContent(raw) as Record<string, unknown>;

  if (!useOpenAiJsonShape) {
    embeddingSimilarity = clampScore(
      Number(parsed.semanticDocumentSimilarity)
    );
  }

  const rawCs = parsed.categoryScores;
  if (!rawCs || typeof rawCs !== "object") {
    throw new Error("Model response missing categoryScores.");
  }
  const cs = rawCs as Record<string, unknown>;
  const categoryScores: ScreenResult["categoryScores"] = {
    skillAlignment: clampScore(Number(cs.skillAlignment)),
    experienceRelevance: clampScore(Number(cs.experienceRelevance)),
    impactEvidence: clampScore(Number(cs.impactEvidence)),
    semanticFit: clampScore(Number(cs.semanticFit)),
  };
  const llmAvg = avg([
    categoryScores.skillAlignment,
    categoryScores.experienceRelevance,
    categoryScores.impactEvidence,
    categoryScores.semanticFit,
  ]);
  const matchScore = Math.round(embeddingSimilarity * 0.45 + llmAvg * 0.55);
  const clampedMatch = Math.max(0, Math.min(100, matchScore));

  return {
    matchScore: clampedMatch,
    embeddingSimilarity,
    embeddingMethod,
    issuesCount: Number(parsed.issuesCount) || 0,
    categoryScores,
    skills: (parsed.skills as string[]) ?? [],
    education: (parsed.education as ScreenResult["education"]) ?? [],
    employment: (parsed.employment as ScreenResult["employment"]) ?? [],
    impact: (parsed.impact as string[]) ?? [],
    skillGaps: (parsed.skillGaps as string[]) ?? [],
    whyShortlisted: (parsed.whyShortlisted as string[]) ?? [],
  };
}

export function mockScreenResult(
  resumeText: string,
  jobDescription: string
): ScreenResult {
  const seed =
    (resumeText.length + jobDescription.length) % 37 || 7;
  const base = 58 + (seed % 28);
  const embeddingSimilarity = Math.min(100, base + (jobDescription.length % 12));
  const categoryScores = {
    skillAlignment: Math.min(100, base + 5),
    experienceRelevance: Math.min(100, base - 3 + (seed % 8)),
    impactEvidence: Math.min(100, base - 5 + (seed % 10)),
    semanticFit: Math.min(100, embeddingSimilarity - 2 + (seed % 6)),
  };
  const matchScore = Math.round(
    embeddingSimilarity * 0.45 + avg(Object.values(categoryScores)) * 0.55
  );
  return {
    matchScore: Math.max(0, Math.min(100, matchScore)),
    embeddingSimilarity,
    issuesCount: 3 + (seed % 8),
    categoryScores,
    skills: ["Communication", "Problem solving", "Stakeholder management"],
    education: [
      {
        institution: "—",
        degree: "Add education from resume in live mode",
        dates: "—",
      },
    ],
    employment: [
      {
        company: "—",
        role: "Paste resume or upload a file with GROQ_API_KEY set",
        dates: "—",
        highlights: ["Demo mode: add your Groq key for live screening."],
      },
    ],
    impact: [
      "Demo mode uses length heuristics only — no live LLM extraction.",
    ],
    skillGaps: [
      "Set GROQ_API_KEY for Groq LLM extraction and match reasoning.",
      "Optionally set OPENAI_API_KEY for true embedding similarity (Groq has no embeddings API).",
    ],
    whyShortlisted: [
      "Demo placeholder: in production, this section surfaces LLM reasoning recruiters rely on instead of brittle ATS keyword gates.",
      "Semantic similarity can combine Groq analysis with optional OpenAI embeddings when configured.",
    ],
    demoMode: true,
  };
}
