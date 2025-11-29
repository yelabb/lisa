import { useMutation, useQuery } from '@tanstack/react-query';
import { GeneratedQuestion } from '@/lib/services/question-generator';

interface GenerateQuestionsRequest {
  storyId?: string;
  storyTitle: string;
  storyContent: string;
  readingLevel: string;
  age: number;
  questionCount?: number;
}

interface QuestionsResponse {
  success: boolean;
  questions: GeneratedQuestion[];
}

/**
 * Hook to generate questions for a story
 */
export function useGenerateQuestions() {
  return useMutation({
    mutationFn: async (params: GenerateQuestionsRequest): Promise<QuestionsResponse> => {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate questions');
      }

      return response.json();
    },
  });
}

/**
 * Hook to fetch questions for a story
 */
export function useStoryQuestions(storyId: string | null) {
  return useQuery({
    queryKey: ['questions', storyId],
    queryFn: async (): Promise<QuestionsResponse> => {
      if (!storyId) throw new Error('Story ID is required');

      const response = await fetch(`/api/questions/generate?storyId=${storyId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch questions');
      }

      return response.json();
    },
    enabled: !!storyId,
  });
}
