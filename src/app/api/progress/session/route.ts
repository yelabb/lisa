import { NextRequest, NextResponse } from 'next/server';
import {
  updateProgressAfterQuestion,
  updateProgressAfterStory,
} from '@/lib/db/progress';
import { prisma } from '@/lib/db/prisma';

// POST - Update progress after answering a question or completing a story
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, ...data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let progress;

    switch (action) {
      case 'answer-question': {
        const { isCorrect, questionType, difficulty, sessionId, questionId, userAnswer, timeSpent } = data;
        
        // Update user progress
        progress = await updateProgressAfterQuestion({
          userId,
          isCorrect,
          questionType: questionType || 'MULTIPLE_CHOICE',
          difficulty: difficulty || 1,
        });

        // Record the answer if sessionId is provided
        if (sessionId && questionId) {
          await prisma.answer.create({
            data: {
              sessionId,
              questionId,
              userAnswer: userAnswer || '',
              isCorrect,
              timeSpentSeconds: timeSpent,
            },
          });
        }
        break;
      }

      case 'complete-story': {
        const { questionsAttempted, questionsCorrect, readingTimeSeconds, sessionId } = data;
        
        // Update user progress
        progress = await updateProgressAfterStory({
          userId,
          questionsAttempted: questionsAttempted || 0,
          questionsCorrect: questionsCorrect || 0,
          readingTimeSeconds: readingTimeSeconds || 0,
        });

        // Update the reading session
        if (sessionId) {
          const score = questionsAttempted > 0
            ? (questionsCorrect / questionsAttempted) * 100
            : 0;

          await prisma.readingSession.update({
            where: { id: sessionId },
            data: {
              completedAt: new Date(),
              readingTimeSeconds,
              questionsAttempted,
              questionsCorrect,
              score,
            },
          });
        }
        break;
      }

      case 'start-session': {
        const { storyId } = data;
        
        if (!storyId) {
          return NextResponse.json(
            { error: 'storyId is required for starting a session' },
            { status: 400 }
          );
        }

        // Create a new reading session
        const session = await prisma.readingSession.create({
          data: {
            userId,
            storyId,
          },
        });

        return NextResponse.json({ session });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: answer-question, complete-story, or start-session' },
          { status: 400 }
        );
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
