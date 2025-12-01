import { useMutation } from '@tanstack/react-query';
import { useUserProgressStore } from '@/stores/user-progress';

interface AnswerQuestionParams {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  questionType: string;
  difficulty: number;
  sessionId?: string;
  timeSpent?: number;
}

interface CompleteStoryParams {
  storyId: string;
  sessionId?: string;
  questionsAttempted: number;
  questionsCorrect: number;
  readingTimeSeconds: number;
}

// Update progress after answering a question
export function useAnswerQuestion() {
  const { userId, recordAnswer, updateSkills, progress } = useUserProgressStore();

  return useMutation({
    mutationFn: async (params: AnswerQuestionParams) => {
      // Update local store immediately
      recordAnswer(params.isCorrect);

      // Update skills based on question type
      if (progress) {
        const skillKey = getSkillKeyFromType(params.questionType);
        const change = params.isCorrect ? 2 : -1;
        updateSkills({
          [skillKey]: Math.max(0, Math.min(100, progress.skills[skillKey] + change)),
        });
      }

      // Sync with server in background
      const response = await fetch('/api/progress/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'answer-question',
          ...params,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync answer with server');
      }

      return { success: true };
    },
  });
}

// Update progress after completing a story
export function useCompleteStory() {
  const { userId, incrementStoriesRead, adjustDifficulty } = useUserProgressStore();

  return useMutation({
    mutationFn: async (params: CompleteStoryParams) => {
      const accuracy = params.questionsAttempted > 0
        ? params.questionsCorrect / params.questionsAttempted
        : 0;

      // Update local store
      incrementStoriesRead();
      adjustDifficulty(accuracy);

      // Sync with server
      const response = await fetch('/api/progress/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'complete-story',
          ...params,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync story completion with server');
      }

      return { success: true, accuracy };
    },
  });
}

// Start a new reading session
export function useStartSession() {
  const { userId } = useUserProgressStore();

  return useMutation({
    mutationFn: async (storyId: string) => {
      const response = await fetch('/api/progress/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'start-session',
          storyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      return data.session;
    },
  });
}

// Skill keys type
type SkillKey = 'comprehension' | 'vocabulary' | 'inference' | 'summarization';

// Helper to map question type to skill key
function getSkillKeyFromType(type: string): SkillKey {
  const typeMap: Record<string, SkillKey> = {
    VOCABULARY: 'vocabulary',
    INFERENCE: 'inference',
    SUMMARIZATION: 'summarization',
    MULTIPLE_CHOICE: 'comprehension',
    TRUE_FALSE: 'comprehension',
    SHORT_ANSWER: 'comprehension',
  };

  return typeMap[type.toUpperCase()] || 'comprehension';
}
