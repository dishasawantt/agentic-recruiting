import OpenAI from "openai";
import type { ScreenResult } from "./types";
import type { GeneratedQuestionsResult } from "./interview-questions-types";

function parseJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid model JSON");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function slimScreeningPayload(screenResult: ScreenResult) {
  return {
    skills: screenResult.skills.slice(0, 35),
    education: screenResult.education.slice(0, 4),
    employment: screenResult.employment.slice(0, 5).map((e) => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      highlights: (e.highlights ?? []).slice(0, 4),
    })),
    impact: screenResult.impact.slice(0, 12),
    skillGaps: screenResult.skillGaps.slice(0, 10),
    categoryScores: screenResult.categoryScores,
  };
}

export async function generateInterviewQuestions(
  groq: OpenAI,
  chatModel: string,
  screenResult: ScreenResult,
  jobDescription: string
): Promise<GeneratedQuestionsResult> {
  const payload = slimScreeningPayload(screenResult);
  const jd = jobDescription.slice(0, 8000);
  const payloadStr = JSON.stringify(payload).slice(0, 12000);

  const completion = await groq.chat.completions.create({
    model: chatModel,
    temperature: 0.35,
    max_tokens: 2500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You generate tailored interview questions for ONE candidate based on structured resume screening output and the job description.

Return JSON only:
{ "questions": [ { "id": string, "text": string, "intent": string } ] }

Rules:
- Exactly 8 questions unless the profile is extremely thin (then minimum 5).
- ids: "q1","q2",... in order.
- Mix: technical depth on claimed skills, behavioral tied to employment/impact, and probing skillGaps constructively (not hostile).
- Questions must be spoken aloud naturally — short, clear sentences; no bullet symbols in text.
- intent: one of clarify_claim | technical_depth | gap_probe | behavioral | culture_fit`,
      },
      {
        role: "user",
        content: `JOB DESCRIPTION:\n${jd}\n\nSTRUCTURED SCREENING OUTPUT (JSON):\n${payloadStr}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty model response");
  const parsed = parseJsonFromContent(raw) as { questions?: unknown[] };
  const list = (parsed.questions ?? []) as GeneratedQuestionsResult["questions"];
  const questions = list
    .filter((q) => q && typeof q.text === "string" && q.text.trim())
    .map((q, i) => ({
      id: typeof q.id === "string" ? q.id : `q${i + 1}`,
      text: String(q.text).trim(),
      intent: typeof q.intent === "string" ? q.intent : undefined,
    }));

  if (questions.length < 2) {
    throw new Error("Model returned too few questions");
  }

  return { questions };
}

export function mockInterviewQuestions(): GeneratedQuestionsResult {
  return {
    demoMode: true,
    questions: [
      {
        id: "q1",
        text: "Walk me through the most complex project you listed on your resume and the role you played end to end.",
        intent: "technical_depth",
      },
      {
        id: "q2",
        text: "You mention several tools and frameworks; which one are you strongest in and how did you build that depth?",
        intent: "clarify_claim",
      },
      {
        id: "q3",
        text: "Tell me about a time you disagreed with a stakeholder or teammate and how you resolved it.",
        intent: "behavioral",
      },
      {
        id: "q4",
        text: "What is one area you are still developing professionally, and what are you doing to improve?",
        intent: "gap_probe",
      },
      {
        id: "q5",
        text: "Why does this role and our job description appeal to you right now?",
        intent: "culture_fit",
      },
    ],
  };
}
