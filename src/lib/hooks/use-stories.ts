import { useMutation, useQuery } from '@tanstack/react-query';
import { GeneratedStory } from '@/lib/services/story-generator';

interface GenerateStoryRequest {
  theme: string;
  interests: string[];
  readingLevel: string;
  age: number;
  targetWordCount?: number;
  difficultyMultiplier?: number;
}

interface StoryResponse {
  success: boolean;
  story: GeneratedStory & { id: string };
}

interface StoryByIdResponse {
  success: boolean;
  story: GeneratedStory & { id: string; questions?: any[] };
}

/**
 * Hook to generate a new story
 */
export function useGenerateStory() {
  return useMutation({
    mutationFn: async (params: GenerateStoryRequest): Promise<StoryResponse> => {
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate story');
      }

      return response.json();
    },
  });
}

/**
 * Hook to fetch a story by ID
 */
export function useStory(storyId: string | null) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: async (): Promise<StoryByIdResponse> => {
      if (!storyId) throw new Error('Story ID is required');
      
      const response = await fetch(`/api/stories/generate?id=${storyId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch story');
      }

      return response.json();
    },
    enabled: !!storyId,
  });
}

/**
 * Hook to list recent stories (for story library)
 */
export function useRecentStories(readingLevel?: string) {
  return useQuery({
    queryKey: ['stories', 'recent', readingLevel],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (readingLevel) params.append('readingLevel', readingLevel);
      
      const response = await fetch(`/api/stories/recent?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      
      return response.json();
    },
  });
}
