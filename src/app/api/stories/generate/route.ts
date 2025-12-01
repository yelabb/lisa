import { NextRequest, NextResponse } from 'next/server';
import { generateStory, generateQuestions } from '@/lib/services/groq';
import { createStoryWithQuestions, getCachedStory } from '@/lib/db/stories';
import type { ReadingLevel, GenerateStoryRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateStoryRequest = await request.json();
    
    const {
      readingLevel = 'BEGINNER',
      theme = 'adventure',
      interests = [],
      difficultyMultiplier = 1.0,
      language = 'fr',
    } = body;

    // Validate reading level
    const validLevels: ReadingLevel[] = [
      'BEGINNER',
      'EARLY',
      'DEVELOPING',
      'INTERMEDIATE',
      'ADVANCED',
      'PROFICIENT',
    ];
    
    if (!validLevels.includes(readingLevel)) {
      return NextResponse.json(
        { error: 'Invalid reading level' },
        { status: 400 }
      );
    }

    // Try to get a cached story first
    const cachedStory = await getCachedStory({
      readingLevel,
      theme,
    });

    if (cachedStory) {
      return NextResponse.json({
        story: cachedStory,
        cached: true,
      });
    }

    // Generate new story with Groq
    const generatedStory = await generateStory({
      readingLevel,
      theme,
      interests,
      difficultyMultiplier,
      language,
    });

    // Generate questions for the story
    const questions = await generateQuestions({
      story: generatedStory,
      readingLevel,
      numQuestions: 5,
      difficultyMultiplier,
      language,
    });

    // Save to database
    const story = await createStoryWithQuestions({
      generatedStory,
      questions,
      readingLevel,
    });

    return NextResponse.json({
      story,
      cached: false,
    });
  } catch (error) {
    console.error('Error generating story:', error);
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('rate')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate story. Please try again.' },
      { status: 500 }
    );
  }
}
