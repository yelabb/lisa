import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Story, GenerateStoryResponse } from '@/types';

interface GenerateStoryParams {
  difficultyMultiplier: number; // 0.5 to 2.0 - single source of truth
  theme?: string;
  themes?: string[]; // Plusieurs thèmes à combiner
  interests?: string[];
  language?: string;
  excludeIds?: string[];
  useCacheOnly?: boolean; // Utiliser uniquement le cache (mode hors-ligne)
}

// Generate a new story
export function useGenerateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GenerateStoryParams): Promise<GenerateStoryResponse> => {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate story');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Cache the story
      queryClient.setQueryData(['story', data.story.id], data.story);
    },
  });
}

// Get a specific story by ID
export function useStory(storyId: string | null) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: async (): Promise<Story | null> => {
      if (!storyId) return null;
      
      const response = await fetch(`/api/stories/${storyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch story');
      }
      
      const data = await response.json();
      return data.story;
    },
    enabled: !!storyId,
  });
}
