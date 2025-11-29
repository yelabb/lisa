import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const readingLevel = searchParams.get('readingLevel');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const where = readingLevel ? { readingLevel } : {};

    const stories = await prisma.story.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 50), // Max 50 stories
      select: {
        id: true,
        title: true,
        theme: true,
        readingLevel: true,
        wordCount: true,
        estimatedTime: true,
        vocabulary: true,
        metadata: true,
        createdAt: true,
      },
    });

    // Format response
    const formattedStories = stories.map(story => ({
      id: story.id,
      title: story.title,
      theme: story.theme,
      readingLevel: story.readingLevel,
      wordCount: story.wordCount,
      estimatedTime: story.estimatedTime,
      vocabulary: story.vocabulary,
      emoji: (story.metadata as any)?.emoji || '📖',
      createdAt: story.createdAt,
    }));

    return NextResponse.json({
      success: true,
      stories: formattedStories,
      count: formattedStories.length,
    });
  } catch (error) {
    console.error('API Error - Recent stories:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
