import type { ScreenResult } from "./types";

export type SourceMeta = {
  charCount: number;
  preview: string;
  fromFile: boolean;
};

const PREVIEW_MAX = 12000;

export function withSourceMeta(
  result: ScreenResult,
  resumeText: string,
  fromFile: boolean
): ScreenResult {
  return {
    ...result,
    sourceMeta: {
      charCount: resumeText.length,
      preview: resumeText.slice(0, PREVIEW_MAX),
      fromFile,
    },
  };
}
