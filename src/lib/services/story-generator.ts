import { groq } from '@/lib/groq';
import { ReadingLevel } from '@/types';
import { retryWithBackoff, AIGenerationError } from '@/lib/utils/error-handling';

export interface GenerateStoryParams {
  theme: string;
  interests: string[];
  readingLevel: ReadingLevel;
  age: number;
  targetWordCount?: number;
  difficultyMultiplier?: number;
}

export interface GeneratedStory {
  title: string;
  content: string;
  emoji: string;
  theme: string;
  wordCount: number;
  estimatedTime: number;
  vocabulary: string[];
  readingLevel: ReadingLevel;
}

const READING_LEVEL_GUIDANCE = {
  EARLY: {
    wordCount: [150, 250],
    sentenceLength: 'very short (5-8 words)',
    vocabulary: 'simple, common words',
    complexity: 'basic sentences with clear subject-verb structure',
  },
  DEVELOPING: {
    wordCount: [250, 400],
    sentenceLength: 'short to medium (8-12 words)',
    vocabulary: 'age-appropriate with some new words',
    complexity: 'mostly simple sentences with occasional compound sentences',
  },
  INTERMEDIATE: {
    wordCount: [400, 600],
    sentenceLength: 'medium (10-15 words)',
    vocabulary: 'varied vocabulary with context clues for new words',
    complexity: 'mix of simple and compound sentences with some complex structures',
  },
  ADVANCED: {
    wordCount: [600, 800],
    sentenceLength: 'medium to long (12-18 words)',
    vocabulary: 'rich and diverse vocabulary',
    complexity: 'complex sentences with varied structures and literary devices',
  },
  FLUENT: {
    wordCount: [800, 1000],
    sentenceLength: 'varied length for natural flow',
    vocabulary: 'sophisticated vocabulary with figurative language',
    complexity: 'advanced sentence structures with nuanced storytelling',
  },
};

/**
 * Generate an age-appropriate story using Groq AI
 */
export async function generateStory(params: GenerateStoryParams): Promise<GeneratedStory> {
  const {
    theme,
    interests,
    readingLevel,
    age,
    targetWordCount,
    difficultyMultiplier = 1.0,
  } = params;

  const guidance = READING_LEVEL_GUIDANCE[readingLevel];
  const [minWords, maxWords] = guidance.wordCount;
  const adjustedTargetWords = targetWordCount || Math.round((minWords + maxWords) / 2 * difficultyMultiplier);

  // Build the prompt with careful attention to age-appropriateness
  const prompt = `You are a children's story writer creating educational content for a ${age}-year-old child.

STORY REQUIREMENTS:
- Theme: ${theme}
- Incorporate these interests: ${interests.join(', ')}
- Reading Level: ${readingLevel}
- Target Word Count: ${adjustedTargetWords} words
- Sentence Length: ${guidance.sentenceLength}
- Vocabulary: ${guidance.vocabulary}
- Sentence Complexity: ${guidance.complexity}

CONTENT GUIDELINES:
- Create an engaging, age-appropriate story
- Include a clear beginning, middle, and end
- Use descriptive language appropriate for the reading level
- Ensure positive messages and values
- Make it fun and educational
- Include 3-5 key vocabulary words that are slightly challenging but learnable from context

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "An engaging title",
  "content": "The complete story text with proper paragraphs",
  "emoji": "A single emoji that represents the story",
  "vocabulary": ["word1", "word2", "word3"]
}

Write the story now:`;

  try {
    // Use retry logic for transient failures
    const result = await retryWithBackoff(async () => {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert children\'s story writer and educator. You create age-appropriate, engaging stories that help children improve their reading skills. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new AIGenerationError('No response from AI', true);
      }

      return response;
    }, 3, 1000);

    const parsed = JSON.parse(result);
    
    // Validate the response
    if (!parsed.title || !parsed.content || !parsed.emoji) {
      throw new AIGenerationError('Invalid story format from AI', false);
    }

    // Calculate actual metrics
    const wordCount = parsed.content.split(/\s+/).length;
    const estimatedTime = Math.ceil(wordCount / 50); // Average reading speed for children

    return {
      title: parsed.title,
      content: parsed.content,
      emoji: parsed.emoji,
      theme,
      wordCount,
      estimatedTime,
      vocabulary: parsed.vocabulary || [],
      readingLevel,
    };
  } catch (error) {
    console.error('Story generation error:', error);
    
    if (error instanceof AIGenerationError) {
      throw error;
    }
    
    throw new AIGenerationError('Failed to generate story. Please try again.', true);
  }
}

/**
 * Generate a story based on user profile
 */
export async function generateStoryForProfile(profile: {
  readingLevel: ReadingLevel;
  age: number;
  interests: string[];
  favoriteThemes: string[];
  difficultyMultiplier?: number;
}): Promise<GeneratedStory> {
  // Pick a random theme from favorites or a default
  const theme = profile.favoriteThemes.length > 0
    ? profile.favoriteThemes[Math.floor(Math.random() * profile.favoriteThemes.length)]
    : profile.interests[0] || 'Adventure';

  return generateStory({
    theme,
    interests: profile.interests,
    readingLevel: profile.readingLevel,
    age: profile.age,
    difficultyMultiplier: profile.difficultyMultiplier || 1.0,
  });
}
