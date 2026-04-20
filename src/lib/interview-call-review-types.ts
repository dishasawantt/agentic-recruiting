export type InterviewCallReviewResult = {
  overallScore: number;
  rankLabel: string;
  rankTier: "top" | "strong" | "solid" | "mixed" | "weak";
  executiveSummary: string;
  dimensionScores: {
    communication: number;
    technicalDepth: number;
    problemSolving: number;
    roleFit: number;
  };
  strengths: string[];
  weaknesses: string[];
  demoMode?: boolean;
};
