
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type AppLanguage = 'uz' | 'en' | 'ru';

export interface SyllabusTopic {
  id: string;
  title: string;
  description: string;
  week: number;
}

export interface SyllabusSource {
  university: string;
  url: string;
  title: string;
}

export interface SyllabusResult {
  subject: string;
  difficulty: DifficultyLevel;
  topics: SyllabusTopic[];
  sources: SyllabusSource[];
}

export interface GeneratedContent {
  lectureNote: string;
  educationalCase: string;
  kazus: string;
  questions: string[];
  tests: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export type ViewState = 'dashboard' | 'create-syllabus' | 'view-syllabus' | 'generating-content' | 'content-viewer';
