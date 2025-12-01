import { prisma } from './prisma';
import type { ReadingLevel, UserProgress } from '@/types';
import { ReadingLevel as PrismaReadingLevel } from '@/generated/prisma';
import {
  SCORE_ADJUSTMENTS,
  DIFFICULTY_ADJUSTMENT,
  READING_LEVEL_INFO,
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
  const { userId, isCorrect, questionType, difficulty } = params;

  const dbProgress = await prisma.userProgress.findUnique({
    where: { userId },
  });

  if (!dbProgress) {
    throw new Error('User progress not found');
  }

  // Calculate score change based on difficulty
  const baseChange = isCorrect
    ? SCORE_ADJUSTMENTS.CORRECT_ANSWER
    : SCORE_ADJUSTMENTS.INCORRECT_ANSWER;
  
  const difficultyBonus = isCorrect ? Math.floor(difficulty / 2) : 0;
  const scoreChange = baseChange + difficultyBonus;

  // Calculate new level score
  let newLevelScore = Math.max(
    SCORE_ADJUSTMENTS.MIN_SCORE,
    Math.min(SCORE_ADJUSTMENTS.MAX_SCORE, dbProgress.levelScore + scoreChange)
  );

  // Check for level up/down
  let newLevel = dbProgress.currentLevel as ReadingLevel;
  const levelInfo = READING_LEVEL_INFO[newLevel];

  if (newLevelScore >= levelInfo.scoreToAdvance) {
    const nextLevel = getNextLevel(newLevel);
    if (nextLevel) {
      newLevel = nextLevel;
      newLevelScore = 50; // Start in middle of new level
    }
  } else if (newLevelScore <= 10 && newLevel !== 'BEGINNER') {
    const prevLevel = getPreviousLevel(newLevel);
    if (prevLevel) {
      newLevel = prevLevel;
      newLevelScore = 70; // Start higher in previous level
    }
  }

  // Update skill scores based on question type
  const skillUpdates = getSkillUpdates(questionType, isCorrect, dbProgress);

  // Update in database
  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      currentLevel: newLevel as PrismaReadingLevel,
      levelScore: newLevelScore,
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

  // Calculate difficulty adjustment
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

  // Bonus for perfect session
  let bonusScore = 0;
  if (accuracy === 1.0 && questionsAttempted >= 3) {
    bonusScore = SCORE_ADJUSTMENTS.PERFECT_SESSION;
  }

  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      totalStoriesRead: { increment: 1 },
      difficultyMultiplier: Math.round(newDifficultyMultiplier),
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: today,
      levelScore: Math.min(100, dbProgress.levelScore + bonusScore),
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
  initialLevel: ReadingLevel;
  assessmentScore: number;
  preferredThemes: string[];
  interests: string[];
}): Promise<UserProgress> {
  const { userId, initialLevel, assessmentScore, preferredThemes, interests } = params;

  const updatedProgress = await prisma.userProgress.update({
    where: { userId },
    data: {
      currentLevel: initialLevel as PrismaReadingLevel,
      levelScore: assessmentScore,
      preferredThemes,
      interests,
      hasCompletedOnboarding: true,
      initialAssessmentScore: assessmentScore,
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
    currentLevel: dbProgress.currentLevel as ReadingLevel,
    levelScore: dbProgress.levelScore,
    totalStoriesRead: dbProgress.totalStoriesRead,
    totalQuestionsAnswered: dbProgress.totalQuestionsAnswered,
    correctAnswers: dbProgress.correctAnswers,
    skills: {
      comprehension: dbProgress.comprehensionScore,
      vocabulary: dbProgress.vocabularyScore,
      inference: dbProgress.inferenceScore,
      summarization: dbProgress.summarizationScore,
    },
    difficultyMultiplier: dbProgress.difficultyMultiplier / 100,
    preferredThemes: dbProgress.preferredThemes,
    customThemes: (dbProgress.customThemes as Array<{ name: string; emoji: string; description: string }>) || [],
    interests: dbProgress.interests,
    currentStreak: dbProgress.currentStreak,
    longestStreak: dbProgress.longestStreak,
    lastActiveDate: dbProgress.lastActiveDate?.toISOString() || null,
    hasCompletedOnboarding: dbProgress.hasCompletedOnboarding,
    initialAssessmentScore: dbProgress.initialAssessmentScore,
    createdAt: dbProgress.createdAt.toISOString(),
    updatedAt: dbProgress.updatedAt.toISOString(),
  };
}

function getNextLevel(current: ReadingLevel): ReadingLevel | null {
  const levels: ReadingLevel[] = [
    'BEGINNER',
    'EARLY',
    'DEVELOPING',
    'INTERMEDIATE',
    'ADVANCED',
    'PROFICIENT',
  ];
  const currentIndex = levels.indexOf(current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

function getPreviousLevel(current: ReadingLevel): ReadingLevel | null {
  const levels: ReadingLevel[] = [
    'BEGINNER',
    'EARLY',
    'DEVELOPING',
    'INTERMEDIATE',
    'ADVANCED',
    'PROFICIENT',
  ];
  const currentIndex = levels.indexOf(current);
  return currentIndex > 0 ? levels[currentIndex - 1] : null;
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
