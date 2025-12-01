import { prisma } from './prisma';
import type { UserProgress } from '@/types';
import { ReadingLevel as PrismaReadingLevel } from '@/generated/prisma';
import {
  SCORE_ADJUSTMENTS,
  DIFFICULTY_ADJUSTMENT,
} from '@/lib/constants';

/**
 * Get or create user progress
 */
export async function getOrCreateUserProgress(userId: string): Promise<UserProgress> {
  let dbProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (!dbProgress) {
    dbProgress = await prisma.userProgress.create({
      data: {
        userId,
        currentLevel: 'BEGINNER',
        levelScore: 50,
        difficultyMultiplier: 100,
      },
    });
  }

  return mapDbProgressToUserProgress(dbProgress);
}

/**
 * Update user progress after completing a question
 */
export async function updateProgressAfterQuestion(params: {
  userId: string;
  isCorrect: boolean;
  questionType: string;
  difficulty: number;
}): Promise<UserProgress> {
  const { userId, isCorrect, questionType } = params;

  const dbProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (!dbProgress) {
    throw new Error('User progress not found');
  }

  // Update skill scores based on question type
  const skillUpdates = getSkillUpdates(questionType, isCorrect, dbProgress);

  // Update in database
  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      totalQuestionsAnswered: { increment: 1 },
      correctAnswers: isCorrect ? { increment: 1 } : undefined,
      ...skillUpdates,
    },
  });

  return mapDbProgressToUserProgress(updatedProgress);
}

/**
 * Update progress after completing a story
 */
export async function updateProgressAfterStory(params: {
  userId: string;
  questionsAttempted: number;
  questionsCorrect: number;
  readingTimeSeconds: number;
}): Promise<UserProgress> {
  const { userId, questionsAttempted, questionsCorrect } = params;

  const dbProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (!dbProgress) {
    throw new Error('User progress not found');
  }

  const accuracy = questionsAttempted > 0 ? questionsCorrect / questionsAttempted : 0;

  // Calculate difficulty adjustment - single source of truth
  let newDifficultyMultiplier = dbProgress.difficultyMultiplier;
  if (accuracy >= DIFFICULTY_ADJUSTMENT.INCREASE_THRESHOLD / 100) {
    newDifficultyMultiplier = Math.min(
      DIFFICULTY_ADJUSTMENT.MAX_MULTIPLIER * 100,
      newDifficultyMultiplier + DIFFICULTY_ADJUSTMENT.ADJUSTMENT_RATE * 100
    );
  } else if (accuracy <= DIFFICULTY_ADJUSTMENT.DECREASE_THRESHOLD / 100) {
    newDifficultyMultiplier = Math.max(
      DIFFICULTY_ADJUSTMENT.MIN_MULTIPLIER * 100,
      newDifficultyMultiplier - DIFFICULTY_ADJUSTMENT.ADJUSTMENT_RATE * 100
    );
  }

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = dbProgress.lastActiveDate
    ? new Date(dbProgress.lastActiveDate)
    : null;
  
  let newStreak = dbProgress.currentStreak;
  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      newStreak += 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(dbProgress.longestStreak, newStreak);

  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      totalStoriesRead: { increment: 1 },
      difficultyMultiplier: Math.round(newDifficultyMultiplier),
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: today,
    },
  });

  return mapDbProgressToUserProgress(updatedProgress);
}

/**
 * Save user preferences (themes, interests)
 */
export async function saveUserPreferences(params: {
  userId: string;
  preferredThemes?: string[];
  interests?: string[];
  customThemes?: Array<{ name: string; emoji: string; description: string }>;
}): Promise<UserProgress> {
  const { userId, preferredThemes, interests, customThemes } = params;

  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      ...(preferredThemes && { preferredThemes }),
      ...(interests && { interests }),
      ...(customThemes && { customThemes }),
    },
  });

  return mapDbProgressToUserProgress(updatedProgress);
}

/**
 * Complete onboarding for a user
 */
export async function completeOnboarding(params: {
  userId: string;
  preferredThemes: string[];
  interests: string[];
}): Promise<UserProgress> {
  const { userId, preferredThemes, interests } = params;

  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      preferredThemes,
      interests,
      hasCompletedOnboarding: true,
    },
  });

  return mapDbProgressToUserProgress(updatedProgress);
}

// Helper functions

function mapDbProgressToUserProgress(dbProgress: {
  id: string;
  userId: string;
  currentLevel: string;
  levelScore: number;
  totalStoriesRead: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  comprehensionScore: number;
  vocabularyScore: number;
  inferenceScore: number;
  summarizationScore: number;
  difficultyMultiplier: number;
  preferredThemes: string[];
  customThemes: unknown;
  interests: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  hasCompletedOnboarding: boolean;
  initialAssessmentScore: number | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProgress {
  return {
    id: dbProgress.id,
    userId: dbProgress.userId,
    totalStoriesRead: dbProgress.totalStoriesRead,
    totalQuestionsAnswered: dbProgress.totalQuestionsAnswered,
    correctAnswers: dbProgress.correctAnswers,
    skills: {
      comprehension: dbProgress.comprehensionScore,
      vocabulary: dbProgress.vocabularyScore,
      inference: dbProgress.inferenceScore,
      summarization: dbProgress.summarizationScore,
    },
    difficultyMultiplier: dbProgress.difficultyMultiplier / 100, // DB stores as int 50-200, convert to 0.5-2.0
    preferredThemes: dbProgress.preferredThemes,
    customThemes: (dbProgress.customThemes as Array<{ name: string; emoji: string; description: string }>) || [],
    interests: dbProgress.interests,
    currentStreak: dbProgress.currentStreak,
    longestStreak: dbProgress.longestStreak,
    lastActiveDate: dbProgress.lastActiveDate?.toISOString() || null,
    hasCompletedOnboarding: dbProgress.hasCompletedOnboarding,
    createdAt: dbProgress.createdAt.toISOString(),
    updatedAt: dbProgress.updatedAt.toISOString(),
  };
}

function getSkillUpdates(
  questionType: string,
  isCorrect: boolean,
  dbProgress: { comprehensionScore: number; vocabularyScore: number; inferenceScore: number; summarizationScore: number }
) {
  const change = isCorrect ? 2 : -1;
  
  switch (questionType.toUpperCase()) {
    case 'VOCABULARY':
      return {
        vocabularyScore: Math.max(0, Math.min(100, dbProgress.vocabularyScore + change)),
      };
    case 'INFERENCE':
      return {
        inferenceScore: Math.max(0, Math.min(100, dbProgress.inferenceScore + change)),
      };
    case 'SUMMARIZATION':
      return {
        summarizationScore: Math.max(0, Math.min(100, dbProgress.summarizationScore + change)),
      };
    default:
      return {
        comprehensionScore: Math.max(0, Math.min(100, dbProgress.comprehensionScore + change)),
      };
  }
}
