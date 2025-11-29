// Export Prisma types for use throughout the application
export type {
  Story,
  Question,
  UserProgress,
  ReadingSession,
  Answer,
} from '@/generated/prisma';

export { ReadingLevel, QuestionType } from '@/generated/prisma';

// Utility type for Prisma includes
export type StoryWithQuestions = Story & {
  questions: Question[];
};

export type ReadingSessionWithDetails = ReadingSession & {
  story: Story;
  answers: (Answer & {
    question: Question;
  })[];
};

// Form data types
export interface CreateStoryInput {
  title: string;
  content: string;
  summary?: string;
  readingLevel: ReadingLevel;
  wordCount: number;
  theme?: string;
  ageRange?: string;
}

export interface CreateQuestionInput {
  storyId: string;
  type: QuestionType;
  questionText: string;
  correctAnswer: string;
  options?: string[];
  explanation?: string;
  difficulty?: number;
  orderIndex: number;
}

export interface SubmitAnswerInput {
  sessionId: string;
  questionId: string;
  userAnswer: string;
  timeSpentSeconds?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

import type { Story, Question, ReadingSession, Answer } from '@/generated/prisma';
import type { ReadingLevel } from '@/generated/prisma';
