import { SCREENING_SESSION_KEY } from "./screening-session";
import type { ScreenResult } from "./types";

export const CANDIDATE_SESSION_KEY = "agentic_candidate_flow_v2";
export const LAST_APPLY_PATH_KEY = "agentic_last_apply_path";
export const PENDING_INTERVIEW_REVIEW_KEY = "agentic_pending_interview_review_v1";

export type CandidateSessionPayload = {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  screenResult: ScreenResult;
};

export function loadCandidateSession(): CandidateSessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CANDIDATE_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CandidateSessionPayload;
    if (
      !data?.screenResult ||
      typeof data.jobDescription !== "string" ||
      typeof data.jobId !== "string"
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveCandidateSession(payload: CandidateSessionPayload) {
  sessionStorage.setItem(CANDIDATE_SESSION_KEY, JSON.stringify(payload));
  sessionStorage.setItem(
    SCREENING_SESSION_KEY,
    JSON.stringify({
      screenResult: payload.screenResult,
      jobDescription: payload.jobDescription,
    })
  );
}

export type PendingInterviewReviewPayload = {
  jobDescription: string;
  questions: {
    id: string;
    text: string;
    intent?: string;
    answer: string;
  }[];
};

export function savePendingInterviewReview(payload: PendingInterviewReviewPayload) {
  sessionStorage.setItem(
    PENDING_INTERVIEW_REVIEW_KEY,
    JSON.stringify(payload)
  );
}

export function loadPendingInterviewReview(): PendingInterviewReviewPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_INTERVIEW_REVIEW_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingInterviewReviewPayload;
    if (
      typeof data?.jobDescription !== "string" ||
      !Array.isArray(data.questions)
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearPendingInterviewReview() {
  sessionStorage.removeItem(PENDING_INTERVIEW_REVIEW_KEY);
}
