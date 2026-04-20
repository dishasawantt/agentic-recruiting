import OpenAI from "openai";
import type { ScreenResult } from "./types";
import type {
  InterviewSimNextResult,
  SimExchangePayload,
} from "./interview-simulation-types";

function parseJsonFromContent(content: string): unknown {
  const trimmed = content.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid model JSON");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function slimScreen(screenResult: ScreenResult) {
  return {
    skills: screenResult.skills.slice(0, 30),
    employment: screenResult.employment.slice(0, 4).map((e) => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      highlights: (e.highlights ?? []).slice(0, 3),
    })),
    impact: screenResult.impact.slice(0, 8),
    skillGaps: screenResult.skillGaps.slice(0, 8),
    categoryScores: screenResult.categoryScores,
  };
}

function transcriptBlock(prior: SimExchangePayload[]) {
  if (prior.length === 0) return "(Interview just started.)";
  return prior
    .map((e, i) => {
      const tag = e.kind === "main" ? "Main" : "Follow-up";
      return `${i + 1}. [${tag}] Interviewer: ${e.question}\n   Candidate: ${e.answer}`;
    })
    .join("\n\n");
}

export async function generateInterviewSimNext(
  groq: OpenAI,
  chatModel: string,
  mode: "main" | "followup",
  mainQuestionIndex: number,
  jobDescription: string,
  screenResult: ScreenResult,
  priorExchanges: SimExchangePayload[]
): Promise<InterviewSimNextResult> {
  const jd = jobDescription.slice(0, 6000);
  const screen = JSON.stringify(slimScreen(screenResult)).slice(0, 10000);
  const transcript = transcriptBlock(priorExchanges);

  const mainPrompt =
    mode === "main"
      ? `You are a senior hiring manager conducting a live interview. This is main question number ${mainQuestionIndex} of 5 total main questions.

Speak naturally — one clear spoken question, as if you are on a video call. No bullet points, no numbering in the question text.

Use the job description and structured resume screening summary to stay relevant. Vary style: behavioral, technical depth, clarifying claims, light probing on gaps — but stay professional and fair.

Return JSON only: { "question": "<single spoken question>" }`
      : `You are the same interviewer. The candidate just answered your previous main question.

Read the transcript. If a short clarifying follow-up would genuinely help (specific example, metric, or scope), ask ONE concise follow-up question spoken naturally.

If their answer is already clear enough, return an empty question.

Return JSON only: { "question": "<follow-up question or empty string>" }`;

  const userContent =
    mode === "main"
      ? `JOB DESCRIPTION:\n${jd}\n\nSCREENING SUMMARY (JSON):\n${screen}\n\nTRANSCRIPT SO FAR:\n${transcript}\n\nGenerate main question ${mainQuestionIndex} of 5.`
      : `JOB DESCRIPTION:\n${jd}\n\nSCREENING SUMMARY (JSON):\n${screen}\n\nTRANSCRIPT SO FAR:\n${transcript}\n\nDecide: one follow-up or empty string.`;

  const completion = await groq.chat.completions.create({
    model: chatModel,
    temperature: mode === "followup" ? 0.25 : 0.4,
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: mainPrompt },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty model response");
  const parsed = parseJsonFromContent(raw) as { question?: unknown };
  const question =
    typeof parsed.question === "string" ? parsed.question.trim() : "";
  if (mode === "main" && question.length < 8) {
    throw new Error("Model returned an invalid main question");
  }
  return { question };
}

const MOCK_MAIN = [
  "Thanks for being here today. To start, walk me through the most relevant experience on your resume for this role and what you owned end to end.",
  "Digging a bit deeper — which tools or frameworks from your background do you feel strongest in, and how did you build that depth?",
  "Tell me about a time you had to trade off quality versus speed. What did you decide and what happened?",
  "Looking at the role requirements, what's one area you're still growing in, and what are you doing about it?",
  "Last question — what draws you to this job and team right now, and what do you hope to learn in the first six months?",
];

const MOCK_FOLLOW = [
  "Can you give one concrete metric or outcome from that work?",
  "",
  "What was your personal role versus the team's?",
  "",
  "How would you measure success in that first six months?",
];

export function mockInterviewSimNext(
  mode: "main" | "followup",
  mainQuestionIndex: number
): InterviewSimNextResult {
  if (mode === "main") {
    const i = Math.min(Math.max(mainQuestionIndex, 1), 5) - 1;
    return { question: MOCK_MAIN[i] ?? MOCK_MAIN[0], demoMode: true };
  }
  const i = Math.min(Math.max(mainQuestionIndex, 1), 5) - 1;
  const q = MOCK_FOLLOW[i] ?? "";
  return { question: q, demoMode: true };
}
