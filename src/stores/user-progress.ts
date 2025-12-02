import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProgress, SkillScores } from '@/types';

// Generate a unique user ID
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Default progress values
const DEFAULT_SKILLS: SkillScores = {
  comprehension: 50,
  vocabulary: 50,
  inference: 50,
  summarization: 50,
};

const DEFAULT_PROGRESS: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
  userId: '',
  totalStoriesRead: 0,
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  totalWordsRead: 0,
  totalReadingTime: 0,
  skills: DEFAULT_SKILLS,
  difficultyMultiplier: 1.0,
  preferredThemes: [],
  customThemes: [],
  interests: [],
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  hasCompletedOnboarding: false,
  completedStories: [],
};

interface UserProgressState {
  // State
  userId: string;
  progress: UserProgress | null;
  language: string;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;

  // Actions
  initializeUser: () => void;
  setProgress: (progress: UserProgress) => void;
  setLanguage: (language: string) => void;
  updateSkills: (skills: Partial<SkillScores>) => void;
  setDifficulty: (difficulty: number) => void;
  incrementStoriesRead: () => void;
  recordAnswer: (isCorrect: boolean) => void;
  setPreferences: (themes: string[], interests: string[]) => void;
  addCustomTheme: (theme: { name: string; emoji: string; description: string }) => void;
  completeOnboarding: () => void;
  updateStreak: () => void;
  adjustDifficulty: (accuracy: number) => void;
  addCompletedStory: (story: { id: string; title: string; readingTime: number; questionsAttempted: number; questionsCorrect: number; themes: string[]; wordCount: number }) => void;
  syncWithServer: () => Promise<void>;
  reset: () => void;
}

export const useUserProgressStore = create<UserProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: '',
      progress: null,
      language: '',
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,

      // Initialize user (called on app mount)
      initializeUser: () => {
        const { userId, progress } = get();
        
        // Generate new userId if not exists
        const newUserId = userId || generateUserId();
        
        // Create default progress if not exists
        const now = new Date().toISOString();
        let newProgress: UserProgress;
        
        if (progress) {
          // Migrate existing progress to add new fields
          newProgress = {
            ...DEFAULT_PROGRESS,
            ...progress,
            // Ensure new fields exist with defaults if not present
            totalWordsRead: progress.totalWordsRead ?? 0,
            totalReadingTime: progress.totalReadingTime ?? 0,
            completedStories: progress.completedStories ?? [],
            updatedAt: now,
          };
        } else {
          // Create new progress
          newProgress = {
            ...DEFAULT_PROGRESS,
            id: `progress_${newUserId}`,
            userId: newUserId,
            createdAt: now,
            updatedAt: now,
          };
        }

        set({
          userId: newUserId,
          progress: newProgress,
        });
      },

      // Set full progress object (from server sync)
      setProgress: (progress) => {
        set({ progress, error: null });
      },

      // Set preferred language
      setLanguage: (language) => {
        set({ language });
      },

      // Set difficulty multiplier manually (0.5 to 2.0)
      setDifficulty: (difficulty) => {
        const { progress } = get();
        if (!progress) return;

        set({
          progress: {
            ...progress,
            difficultyMultiplier: Math.max(0.5, Math.min(2.0, Math.round(difficulty * 100) / 100)),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Update skill scores
      updateSkills: (skills) => {
        const { progress } = get();
        if (!progress) return;

        set({
          progress: {
            ...progress,
            skills: {
              ...progress.skills,
              ...Object.fromEntries(
                Object.entries(skills).map(([key, value]) => [
                  key,
                  Math.max(0, Math.min(100, value || 0)),
                ])
              ),
            },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Increment stories read
      incrementStoriesRead: () => {
        const { progress } = get();
        if (!progress) return;

        set({
          progress: {
            ...progress,
            totalStoriesRead: progress.totalStoriesRead + 1,
            updatedAt: new Date().toISOString(),
          },
        });

        // Update streak when completing a story
        get().updateStreak();
      },

      // Record an answer
      recordAnswer: (isCorrect) => {
        const { progress } = get();
        if (!progress) return;

        set({
          progress: {
            ...progress,
            totalQuestionsAnswered: progress.totalQuestionsAnswered + 1,
            correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Set theme and interest preferences
      setPreferences: (themes, interests) => {
        const { progress } = get();
        if (!progress) return;

        set({
          progress: {
            ...progress,
            preferredThemes: themes,
            interests,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Add a custom theme
      addCustomTheme: (theme) => {
        const { progress } = get();
        if (!progress) return;

        // Avoid duplicates
        const exists = progress.customThemes.some(
          (t) => t.name.toLowerCase() === theme.name.toLowerCase()
        );
        if (exists) return;

        set({
          progress: {
            ...progress,
            customThemes: [...progress.customThemes, theme],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Complete onboarding
      completeOnboarding: () => {
        const { progress } = get();
        if (!progress) return;

        set({
          progress: {
            ...progress,
            hasCompletedOnboarding: true,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Update streak
      updateStreak: () => {
        const { progress } = get();
        if (!progress) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        let newStreak = progress.currentStreak;
        
        if (progress.lastActiveDate) {
          const lastActive = new Date(progress.lastActiveDate);
          lastActive.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor(
            (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 0) {
            // Same day, no change
            return;
          } else if (daysDiff === 1) {
            // Consecutive day
            newStreak += 1;
          } else {
            // Streak broken
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        set({
          progress: {
            ...progress,
            currentStreak: newStreak,
            longestStreak: Math.max(progress.longestStreak, newStreak),
            lastActiveDate: todayStr,
            updatedAt: new Date().toISOString(),
          },
        });
      },
      // Adjust difficulty based on recent performance
      adjustDifficulty: (accuracy) => {
        const { progress } = get();
        if (!progress) return;

        let newMultiplier = progress.difficultyMultiplier;

        if (accuracy >= 0.85) {
          // Increase difficulty
          newMultiplier = Math.min(2.0, newMultiplier + 0.05);
        } else if (accuracy <= 0.40) {
          // Decrease difficulty
          newMultiplier = Math.max(0.5, newMultiplier - 0.05);
        }

        if (newMultiplier !== progress.difficultyMultiplier) {
          set({
            progress: {
              ...progress,
              difficultyMultiplier: Math.round(newMultiplier * 100) / 100,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // Add a completed story to the bookshelf
      addCompletedStory: (story) => {
        const { progress } = get();
        if (!progress) return;

        const accuracy = story.questionsAttempted > 0 
          ? story.questionsCorrect / story.questionsAttempted 
          : 0;

        const completedStory = {
          id: story.id,
          title: story.title,
          completedAt: new Date().toISOString(),
          readingTime: story.readingTime,
          questionsAttempted: story.questionsAttempted,
          questionsCorrect: story.questionsCorrect,
          accuracy,
          themes: story.themes,
        };

        // Add to beginning of array (most recent first)
        const updatedStories = [completedStory, ...progress.completedStories];

        // Keep only last 100 stories to avoid excessive storage
        if (updatedStories.length > 100) {
          updatedStories.pop();
        }

        set({
          progress: {
            ...progress,
            completedStories: updatedStories,
            totalWordsRead: progress.totalWordsRead + story.wordCount,
            totalReadingTime: progress.totalReadingTime + story.readingTime,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // Sync with server (for backup and cross-device)
      // Sync with server (for backup and cross-device)
      syncWithServer: async () => {
        const { userId, progress, isSyncing } = get();
        
        if (!userId || !progress || isSyncing) return;

        set({ isSyncing: true, error: null });

        try {
          // Get server progress
          const response = await fetch(`/api/progress?userId=${userId}`);
          
          if (!response.ok) {
            throw new Error('Failed to sync with server');
          }

          const { progress: serverProgress } = await response.json();

          // Merge: use server progress if it's newer
          if (serverProgress) {
            const serverDate = new Date(serverProgress.updatedAt);
            const localDate = new Date(progress.updatedAt);

            if (serverDate > localDate) {
              set({ progress: serverProgress });
            } else {
              // Push local to server
              await fetch('/api/progress', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...progress,
                }),
              });
            }
          }

          set({
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Sync error:', error);
          set({
            isSyncing: false,
            error: 'Failed to sync progress',
          });
        }
      },

      // Reset all progress
      reset: () => {
        const userId = generateUserId();
        const now = new Date().toISOString();

        set({
          userId,
          progress: {
            ...DEFAULT_PROGRESS,
            id: `progress_${userId}`,
            userId,
            createdAt: now,
            updatedAt: now,
          },
          lastSyncedAt: null,
          error: null,
        });
      },
    }),
    {
      name: 'lisa-user-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        progress: state.progress,
        language: state.language,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
