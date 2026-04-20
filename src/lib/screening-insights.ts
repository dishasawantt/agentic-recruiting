import type { ScreenResult } from "./types";

export type RecommendationTier = "strong_hire" | "hire" | "maybe" | "pass";

export function recommendationFromScreen(r: ScreenResult): {
  label: string;
  tier: RecommendationTier;
} {
  const m = r.matchScore;
  const issues = r.issuesCount;
  if (m >= 78 && issues <= 5) {
    return { label: "Strong hire", tier: "strong_hire" };
  }
  if (m >= 64 && issues <= 10) {
    return { label: "Hire", tier: "hire" };
  }
  if (m >= 50) {
    return { label: "Maybe", tier: "maybe" };
  }
  return { label: "Pass", tier: "pass" };
}

export function confidenceFromScreen(
  r: ScreenResult,
  charCount: number
): "high" | "medium" | "low" {
  if (r.demoMode) return "low";
  if (charCount < 350) return "low";
  if (r.embeddingMethod === "openai") return "high";
  return "medium";
}

export function suggestedProbes(r: ScreenResult): string[] {
  const out: string[] = [];
  for (const g of r.skillGaps.slice(0, 2)) {
    const t = g.trim();
    if (!t) continue;
    const short = t.length > 100 ? `${t.slice(0, 97)}…` : t;
    out.push(`Interview: ${short}`);
  }
  for (const s of r.skills.slice(0, 2)) {
    if (out.length >= 3) break;
    out.push(`Verify recent hands-on work with ${s}.`);
  }
  return out.slice(0, 3);
}

export function factorBullets(r: ScreenResult): string[] {
  const bullets: string[] = [];
  const c = r.categoryScores;
  const labels: Record<keyof typeof c, string> = {
    skillAlignment: "Skills",
    experienceRelevance: "Experience",
    impactEvidence: "Impact",
    semanticFit: "JD fit",
  };
  const entries = Object.entries(c) as [keyof typeof c, number][];
  const sortedHigh = [...entries].sort((a, b) => b[1] - a[1]);
  const sortedLow = [...entries].sort((a, b) => a[1] - b[1]);
  for (const [k, v] of sortedHigh.slice(0, 2)) {
    if (v >= 70) {
      bullets.push(`${labels[k]} ${v}% — strong signal.`);
    }
  }
  for (const [k, v] of sortedLow.slice(0, 2)) {
    if (v < 62) {
      bullets.push(`${labels[k]} ${v}% — weighs on match.`);
    }
  }
  if (r.whyShortlisted[0]) {
    bullets.push(r.whyShortlisted[0]);
  }
  return bullets.slice(0, 5);
}

export function gapKind(text: string): "risk" | "develop" | "clarify" {
  const t = text.toLowerCase();
  if (
    /limited|lack|no experience|missing|without|not demonstrat|no direct|insufficient/i.test(
      t
    )
  ) {
    return "risk";
  }
  if (/grow|develop|expand|strengthen|improve|learning|building/i.test(t)) {
    return "develop";
  }
  return "clarify";
}

export function buildAtsSummary(r: ScreenResult, jobTitle: string): string {
  const rec = recommendationFromScreen(r);
  const lines = [
    `Role: ${jobTitle}`,
    `Match: ${r.matchScore}/100 · Recommendation: ${rec.label}`,
    `Semantic: ${r.embeddingSimilarity}/100`,
    "",
    "Highlights:",
    ...r.whyShortlisted.slice(0, 5).map((x) => `• ${x}`),
    "",
    "Gaps:",
    ...r.skillGaps.slice(0, 5).map((x) => `• ${x}`),
  ];
  return lines.join("\n");
}
