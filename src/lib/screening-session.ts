import type { ScreenResult } from "./types";

export const SCREENING_SESSION_KEY = "agentic_recruiting_screening_v1";

export type ScreeningSessionPayload = {
  screenResult: ScreenResult;
  jobDescription: string;
};

export function loadScreeningSession():
  | ScreeningSessionPayload
  | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SCREENING_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ScreeningSessionPayload;
    if (!data?.screenResult || typeof data.jobDescription !== "string") {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
