export type VoiceQAQuestionRow = {
  id: string;
  text: string;
  intent?: string;
  answer: string;
};

export type VoiceQAExport = {
  generatedAt?: string;
  jobDescription: string;
  questions: VoiceQAQuestionRow[];
};

export function parseVoiceQAExport(raw: unknown): VoiceQAExport | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const jd = String(o.jobDescription ?? "").trim();
  const qs = o.questions;
  if (!jd || !Array.isArray(qs) || qs.length === 0) return null;
  const questions: VoiceQAQuestionRow[] = [];
  for (const item of qs) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const text = String(q.text ?? "").trim();
    const id = String(q.id ?? "").trim() || `q${questions.length + 1}`;
    if (!text) continue;
    questions.push({
      id,
      text,
      intent: typeof q.intent === "string" ? q.intent : undefined,
      answer: String(q.answer ?? "").trim(),
    });
  }
  if (questions.length === 0) return null;
  return {
    generatedAt:
      typeof o.generatedAt === "string" ? o.generatedAt : undefined,
    jobDescription: jd,
    questions,
  };
}
