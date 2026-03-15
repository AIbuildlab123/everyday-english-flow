/** Level for lesson difficulty */
export type Level = "beginner" | "intermediate" | "advanced";

/** Category for scenario context */
export type Category =
  | "workplace"
  | "travel"
  | "shopping"
  | "social"
  | "healthcare"
  | "culture"
  | "job_interview"
  | "sports";

/** Single dialogue line */
export interface DialogueLine {
  speaker: string;
  text: string;
}

/** Quiz question for American culture/history */
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

/** Full lesson response from API */
export interface Lesson {
  dialogue: DialogueLine[];
  keyVocabulary: { word: string; definition: string }[];
  keyPhrases: { phrase: string; explanation: string }[];
  suggestedQuestions: string[];
  conversationQuestions?: string[];
  culturalInsight: string;
  quiz: QuizQuestion[];
  personalNotes?: string;
}

/** Saved lesson row in DB */
export interface SavedLesson {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}
