import { NextRequest, NextResponse } from 'next/server';
import { generateStory, GenerateStoryParams } from '@/lib/services/story-generator';
import { prisma } from '@/lib/prisma';
import { ReadingLevel } from '@/types';
import { 
  storyGenerationLimiter, 
  getClientIp, 
  RateLimitError,
  ValidationError,
  AIGenerationError
} from '@/lib/utils/error-handling';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const isAllowed = await storyGenerationLimiter.checkLimit(clientIp);
    
    if (!isAllowed) {
      const remaining = await storyGenerationLimiter.getRemaining(clientIp);
      return NextResponse.json(
        { 
          error: 'Too many requests. Please wait a moment before generating another story.',
          retryAfter: 60,
          remaining,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { theme, interests, readingLevel, age } = body as GenerateStoryParams;
    
    if (!theme || !interests || !readingLevel || !age) {
      throw new ValidationError('Missing required fields: theme, interests, readingLevel, age');
    }

    // Validate reading level
    if (!['EARLY', 'DEVELOPING', 'INTERMEDIATE', 'ADVANCED', 'FLUENT'].includes(readingLevel)) {
      throw new ValidationError('Invalid reading level');
    }

    // Validate age range
    if (age < 5 || age > 12) {
      throw new ValidationError('Age must be between 5 and 12');
    }

    // Generate the story
    const generatedStory = await generateStory({
      theme,
      interests,
      readingLevel: readingLevel as ReadingLevel,
      age,
      targetWordCount: body.targetWordCount,
      difficultyMultiplier: body.difficultyMultiplier,
    });

    // Save to database for caching
    const story = await prisma.story.create({
      data: {
        title: generatedStory.title,
        content: generatedStory.content,
        theme: generatedStory.theme,
        readingLevel: generatedStory.readingLevel,
        wordCount: generatedStory.wordCount,
        estimatedTime: generatedStory.estimatedTime,
        vocabulary: generatedStory.vocabulary,
        metadata: {
          emoji: generatedStory.emoji,
          generatedAt: new Date().toISOString(),
          userAge: age,
          interests,
        },
      },
    });

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        content: story.content,
        emoji: generatedStory.emoji,
        theme: story.theme,
        readingLevel: story.readingLevel,
        wordCount: story.wordCount,
        estimatedTime: story.estimatedTime,
        vocabulary: story.vocabulary,
      },
    });
  } catch (error) {
    console.error('API Error - Story generation:', error);
    
    // Handle specific error types
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    if (error instanceof AIGenerationError) {
      return NextResponse.json(
        { 
          error: error.message,
          retryable: error.retryable,
        },
        { status: 500 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { 
        error: 'Failed to generate story. Please try again.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve a cached story by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        content: story.content,
        emoji: (story.metadata as any)?.emoji || '📖',
        theme: story.theme,
        readingLevel: story.readingLevel,
        wordCount: story.wordCount,
        estimatedTime: story.estimatedTime,
        vocabulary: story.vocabulary,
        questions: story.questions,
      },
    });
  } catch (error) {
    console.error('API Error - Get story:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve story' },
      { status: 500 }
    );
  }
}
