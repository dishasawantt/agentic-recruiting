export type GeneratedInterviewQuestion = {
  id: string;
  text: string;
  intent?: string;
};

export type GeneratedQuestionsResult = {
  questions: GeneratedInterviewQuestion[];
  demoMode?: boolean;
};
