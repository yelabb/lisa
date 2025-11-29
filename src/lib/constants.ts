import { ReadingLevel } from '@/generated/prisma';

// Reading level metadata (base categories for broad classification)
// Users will have a granular score (0-100) within each level for smooth progression
export const READING_LEVEL_INFO: Record<
  ReadingLevel,
  {
    label: string;
    ageRange: string;
    description: string;
    wordCountRange: [number, number];
    scoreToAdvance: number; // Score needed to move to next level
  }
> = {
  BEGINNER: {
    label: 'Beginner',
    ageRange: '5-6',
    description: 'Kindergarten - 1st grade',
    wordCountRange: [50, 150],
    scoreToAdvance: 80, // Need 80/100 to advance
  },
  EARLY: {
    label: 'Early Reader',
    ageRange: '6-7',
    description: '1st - 2nd grade',
    wordCountRange: [150, 300],
    scoreToAdvance: 80,
  },
  DEVELOPING: {
    label: 'Developing',
    ageRange: '7-8',
    description: '2nd - 3rd grade',
    wordCountRange: [300, 500],
    scoreToAdvance: 80,
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    ageRange: '8-9',
    description: '3rd - 4th grade',
    wordCountRange: [500, 800],
    scoreToAdvance: 80,
  },
  ADVANCED: {
    label: 'Advanced',
    ageRange: '9-10',
    description: '4th - 5th grade',
    wordCountRange: [800, 1200],
    scoreToAdvance: 80,
  },
  PROFICIENT: {
    label: 'Proficient',
    ageRange: '10+',
    description: '5th grade and up',
    wordCountRange: [1200, 2000],
    scoreToAdvance: 100, // Max level
  },
};

// Default story themes (users can add their own)
export const DEFAULT_STORY_THEMES = [
  { value: 'adventure', label: 'Adventure', emoji: '🗺️', isDefault: true },
  { value: 'animals', label: 'Animals', emoji: '🦁', isDefault: true },
  { value: 'science', label: 'Science', emoji: '🔬', isDefault: true },
  { value: 'friendship', label: 'Friendship', emoji: '🤝', isDefault: true },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙', isDefault: true },
  { value: 'mystery', label: 'Mystery', emoji: '🔍', isDefault: true },
  { value: 'space', label: 'Space', emoji: '🚀', isDefault: true },
  { value: 'nature', label: 'Nature', emoji: '🌳', isDefault: true },
  { value: 'sports', label: 'Sports', emoji: '⚽', isDefault: true },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦', isDefault: true },
] as const;

// Trending/Pop culture themes (can be updated periodically)
export const TRENDING_THEMES = [
  { value: 'superheroes', label: 'Superheroes', emoji: '🦸', isDefault: false },
  { value: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕', isDefault: false },
  { value: 'robots', label: 'Robots', emoji: '🤖', isDefault: false },
  { value: 'magic', label: 'Magic', emoji: '✨', isDefault: false },
  { value: 'underwater', label: 'Underwater', emoji: '🌊', isDefault: false },
  { value: 'pirates', label: 'Pirates', emoji: '🏴‍☠️', isDefault: false },
  { value: 'dragons', label: 'Dragons', emoji: '🐉', isDefault: false },
  { value: 'princesses', label: 'Princesses', emoji: '👸', isDefault: false },
  { value: 'racing', label: 'Racing', emoji: '🏎️', isDefault: false },
  { value: 'cooking', label: 'Cooking', emoji: '👨‍🍳', isDefault: false },
] as const;

// Personalized difficulty system
export const DIFFICULTY_MULTIPLIER = {
  VERY_EASY: 0.5,
  EASY: 0.75,
  NORMAL: 1.0,
  CHALLENGING: 1.25,
  HARD: 1.5,
  VERY_HARD: 2.0,
} as const;

// Question difficulty levels (now relative to user's personal difficulty multiplier)
export const QUESTION_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  VERY_HARD: 4,
  EXPERT: 5,
} as const;

// Skill score thresholds (personalized per user)
export const SKILL_THRESHOLDS = {
  NEEDS_PRACTICE: 0,
  DEVELOPING: 40,
  PROFICIENT: 70,
  ADVANCED: 85,
  MASTERED: 95,
} as const;

// Granular scoring adjustments
export const SCORE_ADJUSTMENTS = {
  CORRECT_ANSWER: 5, // +5 points to level score
  INCORRECT_ANSWER: -2, // -2 points to level score
  PERFECT_SESSION: 10, // Bonus for 100% correct
  STREAK_BONUS: 3, // Bonus per streak day
  MIN_SCORE: 0,
  MAX_SCORE: 100,
} as const;

// Adaptive difficulty adjustment rates
export const DIFFICULTY_ADJUSTMENT = {
  INCREASE_THRESHOLD: 85, // If user consistently scores above 85%, increase difficulty
  DECREASE_THRESHOLD: 40, // If user consistently scores below 40%, decrease difficulty
  ADJUSTMENT_RATE: 0.05, // Adjust by 5% (0.05) each time
  MIN_MULTIPLIER: 0.5,
  MAX_MULTIPLIER: 2.0,
} as const;

// Default values
export const DEFAULT_READING_LEVEL: ReadingLevel = 'BEGINNER';
export const DEFAULT_LEVEL_SCORE = 50; // Start in middle of level
export const DEFAULT_DIFFICULTY_MULTIPLIER = 100; // 1.0x stored as integer
export const DEFAULT_QUESTIONS_PER_STORY = 5;
export const MIN_CORRECT_TO_LEVEL_UP = 0.8; // 80% accuracy
export const STREAK_DAYS_FOR_BONUS = 7;

// Onboarding questions for initial assessment
export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  AGE_SELECTION: 'age',
  INTERESTS: 'interests',
  THEME_PREFERENCES: 'themes',
  READING_ASSESSMENT: 'assessment',
  PROFILE_CREATION: 'profile',
} as const;

export type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];
