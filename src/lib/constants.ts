import { ReadingLevel } from '@/generated/prisma';

// Reading level metadata
export const READING_LEVEL_INFO: Record<
  ReadingLevel,
  {
    label: string;
    ageRange: string;
    description: string;
    wordCountRange: [number, number];
  }
> = {
  BEGINNER: {
    label: 'Beginner',
    ageRange: '5-6',
    description: 'Kindergarten - 1st grade',
    wordCountRange: [50, 150],
  },
  EARLY: {
    label: 'Early Reader',
    ageRange: '6-7',
    description: '1st - 2nd grade',
    wordCountRange: [150, 300],
  },
  DEVELOPING: {
    label: 'Developing',
    ageRange: '7-8',
    description: '2nd - 3rd grade',
    wordCountRange: [300, 500],
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    ageRange: '8-9',
    description: '3rd - 4th grade',
    wordCountRange: [500, 800],
  },
  ADVANCED: {
    label: 'Advanced',
    ageRange: '9-10',
    description: '4th - 5th grade',
    wordCountRange: [800, 1200],
  },
  PROFICIENT: {
    label: 'Proficient',
    ageRange: '10+',
    description: '5th grade and up',
    wordCountRange: [1200, 2000],
  },
};

// Story themes
export const STORY_THEMES = [
  { value: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { value: 'animals', label: 'Animals', emoji: '🦁' },
  { value: 'science', label: 'Science', emoji: '🔬' },
  { value: 'friendship', label: 'Friendship', emoji: '🤝' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍' },
  { value: 'space', label: 'Space', emoji: '🚀' },
  { value: 'nature', label: 'Nature', emoji: '🌳' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
] as const;

// Question difficulty levels
export const QUESTION_DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  VERY_HARD: 4,
  EXPERT: 5,
} as const;

// Skill score thresholds
export const SKILL_THRESHOLDS = {
  NEEDS_PRACTICE: 0,
  DEVELOPING: 40,
  PROFICIENT: 70,
  ADVANCED: 85,
  MASTERED: 95,
} as const;

// Default values
export const DEFAULT_READING_LEVEL: ReadingLevel = 'BEGINNER';
export const DEFAULT_QUESTIONS_PER_STORY = 5;
export const MIN_CORRECT_TO_LEVEL_UP = 0.8; // 80% accuracy
export const STREAK_DAYS_FOR_BONUS = 7;
