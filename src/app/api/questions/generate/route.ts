import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/services/question-generator';
import { prisma } from '@/lib/prisma';
import {
  questionGenerationLimiter,
  getClientIp,
  ValidationError,
  AIGenerationError,
} from '@/lib/utils/error-handling';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const isAllowed = await questionGenerationLimiter.checkLimit(clientIp);

    if (!isAllowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please wait before generating more questions.',
          retryAfter: 60,
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
    const { storyId, storyTitle, storyContent, readingLevel, age, questionCount } = body;

    // Validate required fields
    if (!storyTitle || !storyContent || !readingLevel || !age) {
      throw new ValidationError(
        'Missing required fields: storyTitle, storyContent, readingLevel, age'
      );
    }

    // Generate questions
    const questions = await generateQuestions({
      storyTitle,
      storyContent,
      readingLevel,
      age,
      questionCount: questionCount || 4,
    });

    // Save questions to database if storyId provided
    if (storyId) {
      await Promise.all(
        questions.map((q, index) =>
          prisma.question.create({
            data: {
              storyId,
              type: q.type,
              question: q.question,
              options: q.options ? JSON.stringify(q.options) : null,
              correctAnswer: q.correctAnswer || null,
              sequence: q.sequence || null,
              explanation: q.explanation || '',
              difficulty: q.difficulty,
              skillFocus: q.skillFocus,
              order: index,
            },
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('API Error - Question generation:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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

    return NextResponse.json(
      {
        error: 'Failed to generate questions. Please try again.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve questions for a story
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: { storyId },
      orderBy: { order: 'asc' },
    });

    // Parse JSON fields
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options ? JSON.parse(q.options as string) : undefined,
      correctAnswer: q.correctAnswer,
      sequence: q.sequence,
      explanation: q.explanation,
      difficulty: q.difficulty,
      skillFocus: q.skillFocus,
    }));

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error('API Error - Get questions:', error);

    return NextResponse.json({ error: 'Failed to retrieve questions' }, { status: 500 });
  }
}
