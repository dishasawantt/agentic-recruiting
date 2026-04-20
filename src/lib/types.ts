export type EducationEntry = {
  institution: string;
  degree: string;
  dates: string;
};

export type EmploymentEntry = {
  company: string;
  role: string;
  dates: string;
  highlights: string[];
};

export type CategoryScores = {
  skillAlignment: number;
  experienceRelevance: number;
  impactEvidence: number;
  semanticFit: number;
};

export type ScreenSourceMeta = {
  charCount: number;
  preview: string;
  fromFile: boolean;
};

export type ScreenResult = {
  matchScore: number;
  embeddingSimilarity: number;
  embeddingMethod?: "openai" | "llm_estimate";
  issuesCount: number;
  categoryScores: CategoryScores;
  skills: string[];
  education: EducationEntry[];
  employment: EmploymentEntry[];
  impact: string[];
  skillGaps: string[];
  whyShortlisted: string[];
  demoMode?: boolean;
  sourceMeta?: ScreenSourceMeta;
};
