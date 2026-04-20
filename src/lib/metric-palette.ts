import type { CategoryScores } from "@/lib/types";

export const METRIC = {
  experienceSemantic: "#2D5A4C",
  skills: "#E67E22",
  impact: "#5D9B91",
  jdFit: "#D98880",
  track: "#F0F2F5",
  primary: "#2D5A4C",
  primaryHover: "#244a3f",
  labelMuted: "#708090",
} as const;

export function metricBarFillFromLabel(label: string): string {
  const n = label.trim().toLowerCase();
  if (n.includes("semantic") || n.includes("experience")) {
    return METRIC.experienceSemantic;
  }
  if (n.includes("skill")) return METRIC.skills;
  if (n.includes("impact")) return METRIC.impact;
  if (n.includes("jd")) return METRIC.jdFit;
  return METRIC.experienceSemantic;
}

export function metricBarFillFromCategoryKey(
  key: keyof CategoryScores
): string {
  switch (key) {
    case "experienceRelevance":
      return METRIC.experienceSemantic;
    case "skillAlignment":
      return METRIC.skills;
    case "impactEvidence":
      return METRIC.impact;
    case "semanticFit":
      return METRIC.jdFit;
    default:
      return METRIC.experienceSemantic;
  }
}

export function metricBarFillFromFitKey(
  key:
    | "semanticLayerPct"
    | "skillsPct"
    | "experiencePct"
    | "impactPct"
    | "jdFitPct"
): string {
  switch (key) {
    case "semanticLayerPct":
    case "experiencePct":
      return METRIC.experienceSemantic;
    case "skillsPct":
      return METRIC.skills;
    case "impactPct":
      return METRIC.impact;
    case "jdFitPct":
      return METRIC.jdFit;
    default:
      return METRIC.experienceSemantic;
  }
}
