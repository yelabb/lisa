import { ReadingLevel } from '@/generated/prisma';
import {
  READING_LEVEL_INFO,
  SCORE_ADJUSTMENTS,
  DIFFICULTY_ADJUSTMENT,
  DEFAULT_LEVEL_SCORE,
} from './constants';
import type { UserProfile, ProgressAdjustment } from '@/types/profile';

// Get the next reading level
export function getNextLevel(currentLevel: ReadingLevel): ReadingLevel | null {
  const levels: ReadingLevel[] = [
    'BEGINNER',
    'EARLY',
    'DEVELOPING',
    'INTERMEDIATE',
    'ADVANCED',
    'PROFICIENT',
  ];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

// Get the previous reading level
export function getPreviousLevel(currentLevel: ReadingLevel): ReadingLevel | null {
  const levels: ReadingLevel[] = [
    'BEGINNER',
    'EARLY',
    'DEVELOPING',
    'INTERMEDIATE',
    'ADVANCED',
    'PROFICIENT',
  ];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex > 0 ? levels[currentIndex - 1] : null;
}

// Calculate progress adjustment based on session performance
export function calculateProgressAdjustment(
  profile: UserProfile,
  correctCount: number,
  totalQuestions: number,
  questionTypes: Record<string, boolean> // Which question types were correct
): ProgressAdjustment {
  const accuracy = correctCount / totalQuestions;
  let scoreChange = 0;
  let levelChange: ReadingLevel | undefined;
  let difficultyChange: number | undefined;

  // Base score adjustment
  scoreChange += correctCount * SCORE_ADJUSTMENTS.CORRECT_ANSWER;
  scoreChange -= (totalQuestions - correctCount) * Math.abs(SCORE_ADJUSTMENTS.INCORRECT_ANSWER);

  // Perfect session bonus
  if (accuracy === 1.0) {
    scoreChange += SCORE_ADJUSTMENTS.PERFECT_SESSION;
  }

  // Streak bonus
  if (profile.currentStreak > 0) {
    scoreChange += Math.min(profile.currentStreak, 10) * SCORE_ADJUSTMENTS.STREAK_BONUS;
  }

  // Calculate new level score
  const newLevelScore = Math.max(
    SCORE_ADJUSTMENTS.MIN_SCORE,
    Math.min(SCORE_ADJUSTMENTS.MAX_SCORE, profile.levelScore + scoreChange)
  );

  // Check for level advancement
  const levelInfo = READING_LEVEL_INFO[profile.currentLevel];
  if (newLevelScore >= levelInfo.scoreToAdvance) {
    const nextLevel = getNextLevel(profile.currentLevel);
    if (nextLevel) {
      levelChange = nextLevel;
      scoreChange = DEFAULT_LEVEL_SCORE; // Reset to middle of new level
    }
  } else if (newLevelScore <= 20 && profile.levelScore > 20) {
    // Consider level down if struggling
    const prevLevel = getPreviousLevel(profile.currentLevel);
    if (prevLevel && accuracy < 0.5) {
      levelChange = prevLevel;
      scoreChange = 70; // Start near top of previous level
    }
  }

  // Adaptive difficulty adjustment
  if (accuracy >= DIFFICULTY_ADJUSTMENT.INCREASE_THRESHOLD / 100) {
    const newMultiplier = Math.min(
      DIFFICULTY_ADJUSTMENT.MAX_MULTIPLIER,
      profile.difficultyMultiplier + DIFFICULTY_ADJUSTMENT.ADJUSTMENT_RATE
    );
    difficultyChange = newMultiplier;
  } else if (accuracy <= DIFFICULTY_ADJUSTMENT.DECREASE_THRESHOLD / 100) {
    const newMultiplier = Math.max(
      DIFFICULTY_ADJUSTMENT.MIN_MULTIPLIER,
      profile.difficultyMultiplier - DIFFICULTY_ADJUSTMENT.ADJUSTMENT_RATE
    );
    difficultyChange = newMultiplier;
  }

  // Calculate skill updates based on question types
  const skillUpdates = {
    comprehension: questionTypes.comprehension ? 2 : -1,
    vocabulary: questionTypes.vocabulary ? 2 : -1,
    inference: questionTypes.inference ? 2 : -1,
    summarization: questionTypes.summarization ? 2 : -1,
  };

  return {
    scoreChange,
    levelChange,
    difficultyChange,
    skillUpdates,
  };
}

// Get progress percentage to next level
export function getProgressToNextLevel(profile: UserProfile): number {
  const levelInfo = READING_LEVEL_INFO[profile.currentLevel];
  return (profile.levelScore / levelInfo.scoreToAdvance) * 100;
}

// Determine appropriate reading level from age
export function suggestReadingLevelFromAge(age: number): ReadingLevel {
  if (age <= 6) return 'BEGINNER';
  if (age <= 7) return 'EARLY';
  if (age <= 8) return 'DEVELOPING';
  if (age <= 9) return 'INTERMEDIATE';
  if (age <= 10) return 'ADVANCED';
  return 'PROFICIENT';
}

// Calculate overall reading score (0-100)
export function calculateOverallScore(profile: UserProfile): number {
  const levels: ReadingLevel[] = [
    'BEGINNER',
    'EARLY',
    'DEVELOPING',
    'INTERMEDIATE',
    'ADVANCED',
    'PROFICIENT',
  ];
  
  const levelIndex = levels.indexOf(profile.currentLevel);
  const levelWeight = (levelIndex / (levels.length - 1)) * 80; // Up to 80 points for level
  const scoreWeight = (profile.levelScore / 100) * 20; // Up to 20 points for score within level
  
  return Math.round(levelWeight + scoreWeight);
}

// Check if user should be assessed for level adjustment
export function shouldReassessLevel(profile: UserProfile): boolean {
  const storiesSinceLastCheck = profile.totalStoriesRead % 10;
  return storiesSinceLastCheck === 0 && profile.totalStoriesRead > 0;
}

// Get word count range for user based on level and difficulty
export function getWordCountForUser(profile: UserProfile): [number, number] {
  const baseRange = READING_LEVEL_INFO[profile.currentLevel].wordCountRange;
  const [min, max] = baseRange;
  
  // Adjust by difficulty multiplier
  const adjustedMin = Math.round(min * profile.difficultyMultiplier);
  const adjustedMax = Math.round(max * profile.difficultyMultiplier);
  
  return [adjustedMin, adjustedMax];
}
