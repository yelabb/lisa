import { ReadingLevel } from '@/generated/prisma';

// Custom theme created by user
export interface CustomTheme {
  name: string;
  emoji: string;
  description?: string;
  createdAt: string;
}

// User profile stored in localStorage
export interface UserProfile {
  id: string; // Unique user ID
  name: string;
  age?: number;
  avatarEmoji?: string;
  
  // Dynamic reading progression
  currentLevel: ReadingLevel;
  levelScore: number; // 0-100 score within current level
  
  // Personalized difficulty
  difficultyMultiplier: number; // 0.5 - 2.0
  
  // Theme preferences
  preferredThemes: string[]; // Theme IDs they like
  customThemes: CustomTheme[]; // User-created themes
  
  // Interests and keywords for story generation
  interests: string[]; // e.g., ["soccer", "minecraft", "space"]
  favoriteCharacters?: string[]; // e.g., ["Spider-Man", "Elsa"]
  
  // Progress tracking
  totalStoriesRead: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  
  // Skill metrics (0-100)
  comprehensionScore: number;
  vocabularyScore: number;
  inferenceScore: number;
  summarizationScore: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  
  // Onboarding
  hasCompletedOnboarding: boolean;
  initialAssessmentScore?: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Onboarding data collection
export interface OnboardingData {
  name: string;
  age?: number;
  avatarEmoji?: string;
  interests: string[];
  preferredThemes: string[];
  customThemes?: CustomTheme[];
  initialReadingLevel?: ReadingLevel;
  initialAssessmentScore?: number;
}

// Assessment question for onboarding
export interface AssessmentQuestion {
  id: string;
  text: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
  level: ReadingLevel;
}

// Progress adjustment parameters
export interface ProgressAdjustment {
  scoreChange: number; // Change to levelScore
  levelChange?: ReadingLevel; // If level up/down
  difficultyChange?: number; // Change to difficulty multiplier
  skillUpdates?: {
    comprehension?: number;
    vocabulary?: number;
    inference?: number;
    summarization?: number;
  };
}

// Helper type for theme with source
export interface ThemeOption {
  value: string;
  label: string;
  emoji: string;
  isDefault: boolean;
  isCustom?: boolean;
  isTrending?: boolean;
}

// User stats for display
export interface UserStats {
  totalStories: number;
  accuracy: number; // Percentage
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  storiesThisWeek: number;
  favoriteTheme?: string;
  readingLevel: {
    level: ReadingLevel;
    score: number;
    progress: number; // Percentage to next level
  };
  skills: {
    comprehension: number;
    vocabulary: number;
    inference: number;
    summarization: number;
  };
}
