import type { ScreenResult } from "./types";

export type SimExchangeKind = "main" | "followup";

export type SimExchangePayload = {
  kind: SimExchangeKind;
  question: string;
  answer: string;
};

export type InterviewSimNextRequest = {
  mode: "main" | "followup";
  mainQuestionIndex: number;
  jobDescription: string;
  screenResult: ScreenResult;
  priorExchanges: SimExchangePayload[];
};

export type InterviewSimNextResult = {
  question: string;
  demoMode?: boolean;
};
