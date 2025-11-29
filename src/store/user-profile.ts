'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, CustomTheme, OnboardingData } from '@/types/profile';
import {
  DEFAULT_READING_LEVEL,
  DEFAULT_LEVEL_SCORE,
  DEFAULT_DIFFICULTY_MULTIPLIER,
} from '@/lib/constants';
import { calculateProgressAdjustment, suggestReadingLevelFromAge } from '@/lib/progression';

interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;

  // Actions
  createProfile: (data: OnboardingData) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  removeCustomTheme: (themeName: string) => void;
  updatePreferredThemes: (themes: string[]) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  recordSessionResult: (
    correctCount: number,
    totalQuestions: number,
    questionTypes: Record<string, boolean>
  ) => void;
  updateStreak: () => void;
  resetProfile: () => void;
  loadProfile: () => void;
}

const createDefaultProfile = (data: Partial<OnboardingData> = {}): UserProfile => {
  const now = new Date().toISOString();
  const suggestedLevel = data.age
    ? suggestReadingLevelFromAge(data.age)
    : DEFAULT_READING_LEVEL;

  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: data.name || 'Reader',
    age: data.age,
    avatarEmoji: data.avatarEmoji || '😊',
    currentLevel: data.initialReadingLevel || suggestedLevel,
    levelScore: DEFAULT_LEVEL_SCORE,
    difficultyMultiplier: DEFAULT_DIFFICULTY_MULTIPLIER / 100,
    preferredThemes: data.preferredThemes || [],
    customThemes: data.customThemes || [],
    interests: data.interests || [],
    totalStoriesRead: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    comprehensionScore: 50,
    vocabularyScore: 50,
    inferenceScore: 50,
    summarizationScore: 50,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    hasCompletedOnboarding: false,
    initialAssessmentScore: data.initialAssessmentScore,
    createdAt: now,
    updatedAt: now,
  };
};

export const useUserProfile = create<UserProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,

      createProfile: (data: OnboardingData) => {
        const newProfile = createDefaultProfile(data);
        newProfile.hasCompletedOnboarding = true;
        newProfile.lastActiveDate = new Date().toISOString();
        set({ profile: newProfile });
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const { profile } = get();
        if (!profile) return;

        set({
          profile: {
            ...profile,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      addCustomTheme: (theme: CustomTheme) => {
        const { profile } = get();
        if (!profile) return;

        const customThemes = [...profile.customThemes, theme];
        get().updateProfile({ customThemes });
      },

      removeCustomTheme: (themeName: string) => {
        const { profile } = get();
        if (!profile) return;

        const customThemes = profile.customThemes.filter((t) => t.name !== themeName);
        get().updateProfile({ customThemes });
      },

      updatePreferredThemes: (themes: string[]) => {
        get().updateProfile({ preferredThemes: themes });
      },

      addInterest: (interest: string) => {
        const { profile } = get();
        if (!profile) return;

        if (!profile.interests.includes(interest)) {
          const interests = [...profile.interests, interest];
          get().updateProfile({ interests });
        }
      },

      removeInterest: (interest: string) => {
        const { profile } = get();
        if (!profile) return;

        const interests = profile.interests.filter((i) => i !== interest);
        get().updateProfile({ interests });
      },

      recordSessionResult: (
        correctCount: number,
        totalQuestions: number,
        questionTypes: Record<string, boolean>
      ) => {
        const { profile } = get();
        if (!profile) return;

        // Calculate adjustments
        const adjustment = calculateProgressAdjustment(
          profile,
          correctCount,
          totalQuestions,
          questionTypes
        );

        // Apply updates
        const updates: Partial<UserProfile> = {
          totalStoriesRead: profile.totalStoriesRead + 1,
          totalQuestionsAnswered: profile.totalQuestionsAnswered + totalQuestions,
          correctAnswers: profile.correctAnswers + correctCount,
          levelScore: adjustment.levelChange
            ? adjustment.scoreChange
            : profile.levelScore + adjustment.scoreChange,
        };

        // Level change
        if (adjustment.levelChange) {
          updates.currentLevel = adjustment.levelChange;
        }

        // Difficulty adjustment
        if (adjustment.difficultyChange !== undefined) {
          updates.difficultyMultiplier = adjustment.difficultyChange;
        }

        // Skill updates
        if (adjustment.skillUpdates) {
          updates.comprehensionScore = Math.max(
            0,
            Math.min(100, profile.comprehensionScore + adjustment.skillUpdates.comprehension!)
          );
          updates.vocabularyScore = Math.max(
            0,
            Math.min(100, profile.vocabularyScore + adjustment.skillUpdates.vocabulary!)
          );
          updates.inferenceScore = Math.max(
            0,
            Math.min(100, profile.inferenceScore + adjustment.skillUpdates.inference!)
          );
          updates.summarizationScore = Math.max(
            0,
            Math.min(100, profile.summarizationScore + adjustment.skillUpdates.summarization!)
          );
        }

        get().updateProfile(updates);
        get().updateStreak();
      },

      updateStreak: () => {
        const { profile } = get();
        if (!profile) return;

        const now = new Date();
        const lastActive = profile.lastActiveDate ? new Date(profile.lastActiveDate) : null;

        let newStreak = profile.currentStreak;

        if (lastActive) {
          const daysDiff = Math.floor(
            (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 0) {
            // Same day, keep streak
            newStreak = profile.currentStreak;
          } else if (daysDiff === 1) {
            // Next day, increment streak
            newStreak = profile.currentStreak + 1;
          } else {
            // Streak broken
            newStreak = 1;
          }
        } else {
          // First activity
          newStreak = 1;
        }

        get().updateProfile({
          currentStreak: newStreak,
          longestStreak: Math.max(profile.longestStreak, newStreak),
          lastActiveDate: now.toISOString(),
        });
      },

      resetProfile: () => {
        set({ profile: null });
      },

      loadProfile: () => {
        // Profile is automatically loaded from localStorage by persist middleware
        const { profile } = get();
        if (profile) {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'lisa-user-profile',
      version: 1,
    }
  )
);
