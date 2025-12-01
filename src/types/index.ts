// Lisa Companion Types
export type LisaState =
  | 'idle'
  | 'thinking'
  | 'success'
  | 'celebration'
  | 'struggle'
  | 'encouraging'
  | 'reading'
  | 'surprised';

export interface LisaMessage {
  text: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Reading Level (mirrors Prisma enum)
export type ReadingLevel =
  | 'BEGINNER'
  | 'EARLY'
  | 'DEVELOPING'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'PROFICIENT';

// Question Types (mirrors Prisma enum)
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'VOCABULARY'
  | 'INFERENCE'
  | 'SUMMARIZATION';

// Story Types
export interface StoryParagraph {
  type: 'text';
  text: string;
}

export interface StoryQuestion {
  type: 'question';
  id: string;
  text: string;
  questionType: QuestionType;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number;
}

export type StoryContent = StoryParagraph | StoryQuestion;

export interface WordHint {
  word: string;
  definition: string;
  example: string;
}

export interface Story {
  id: string;
  title: string;
  content: StoryContent[];
  hints: WordHint[];
  readingLevel: ReadingLevel;
  theme: string;
  wordCount: number;
  createdAt?: Date;
}

// Generated Story from AI (before processing)
export interface GeneratedStory {
  title: string;
  paragraphs: string[];
  vocabulary: WordHint[];
  theme: string;
}

export interface GeneratedQuestion {
  questionText: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
  difficulty: number;
  afterParagraph: number; // Insert after this paragraph index
}

// User Progress Types
export interface SkillScores {
  comprehension: number;
  vocabulary: number;
  inference: number;
  summarization: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  currentLevel: ReadingLevel;
  levelScore: number; // 0-100 within current level
  totalStoriesRead: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  skills: SkillScores;
  difficultyMultiplier: number; // 0.5 - 2.0
  preferredThemes: string[];
  customThemes: Array<{ name: string; emoji: string; description: string }>;
  interests: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  hasCompletedOnboarding: boolean;
  initialAssessmentScore: number | null;
  createdAt: string;
  updatedAt: string;
}

// Session Types
export interface ReadingSession {
  id: string;
  storyId: string;
  startedAt: Date;
  completedAt?: Date;
  readingTimeSeconds: number;
  questionsAttempted: number;
  questionsCorrect: number;
  score?: number;
  answers: SessionAnswer[];
}

export interface SessionAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

// API Request/Response Types
export interface GenerateStoryRequest {
  readingLevel: ReadingLevel;
  theme?: string;
  themes?: string[]; // Plusieurs thèmes à combiner
  interests?: string[];
  difficultyMultiplier?: number;
  language?: string;
  excludeIds?: string[];
  useCacheOnly?: boolean; // Utiliser uniquement le cache (mode hors-ligne)
}

export interface GenerateStoryResponse {
  story: Story;
  cached: boolean;
  fallback?: boolean; // Indique que le cache a été utilisé car la génération a échoué
}

// Onboarding Types
export type OnboardingStep =
  | 'welcome'
  | 'age'
  | 'interests'
  | 'themes'
  | 'assessment'
  | 'profile';

export interface OnboardingState {
  currentStep: OnboardingStep;
  selectedAge: string | null;
  selectedInterests: string[];
  selectedThemes: string[];
  assessmentScore: number | null;
  profileName: string;
}
