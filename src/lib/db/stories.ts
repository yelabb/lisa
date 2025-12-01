import { prisma } from './prisma';
import type { ReadingLevel, Story, StoryContent, WordHint, GeneratedStory, GeneratedQuestion } from '@/types';
import { ReadingLevel as PrismaReadingLevel, QuestionType as PrismaQuestionType } from '@/generated/prisma';

/**
 * Create a story in the database with its questions
 */
export async function createStoryWithQuestions(params: {
  generatedStory: GeneratedStory;
  questions: GeneratedQuestion[];
  readingLevel: ReadingLevel;
}): Promise<Story> {
  const { generatedStory, questions, readingLevel } = params;

  // Calculate word count
  const wordCount = generatedStory.paragraphs.reduce(
    (count, paragraph) => count + paragraph.split(/\s+/).length,
    0
  );

  // Build the full content with questions interspersed
  const content = buildStoryContent(generatedStory, questions);

  // Create story in database
  const dbStory = await prisma.story.create({
    data: {
      title: generatedStory.title,
      content: JSON.stringify(content),
      summary: generatedStory.paragraphs[0] || null,
      readingLevel: readingLevel as PrismaReadingLevel,
      wordCount,
      theme: generatedStory.theme,
      ageRange: getAgeRangeForLevel(readingLevel),
      isPublished: true,
      questions: {
        create: questions.map((q, index) => ({
          type: q.type as PrismaQuestionType,
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          options: q.options,
          explanation: q.explanation,
          difficulty: q.difficulty,
          orderIndex: index,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  // Return formatted story
  return {
    id: dbStory.id,
    title: dbStory.title,
    content,
    hints: generatedStory.vocabulary,
    readingLevel: dbStory.readingLevel as ReadingLevel,
    theme: dbStory.theme || 'adventure',
    wordCount: dbStory.wordCount,
    createdAt: dbStory.createdAt,
  };
}

/**
 * Get a cached story by reading level and optional theme
 */
export async function getCachedStory(params: {
  readingLevel: ReadingLevel;
  theme?: string;
  excludeIds?: string[];
}): Promise<Story | null> {
  const { readingLevel, theme, excludeIds = [] } = params;

  const dbStory = await prisma.story.findFirst({
    where: {
      readingLevel: readingLevel as PrismaReadingLevel,
      ...(theme && { theme }),
      isPublished: true,
      id: { notIn: excludeIds },
    },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!dbStory) {
    return null;
  }

  // Parse stored content
  let content: StoryContent[];
  try {
    content = JSON.parse(dbStory.content);
  } catch {
    // Fallback: treat content as single paragraph
    content = [{ type: 'text', text: dbStory.content }];
  }

  // Extract hints from content or use empty array
  const hints: WordHint[] = [];

  return {
    id: dbStory.id,
    title: dbStory.title,
    content,
    hints,
    readingLevel: dbStory.readingLevel as ReadingLevel,
    theme: dbStory.theme || 'adventure',
    wordCount: dbStory.wordCount,
    createdAt: dbStory.createdAt,
  };
}

/**
 * Get random stories for a reading level
 */
export async function getRandomStories(params: {
  readingLevel: ReadingLevel;
  limit?: number;
  excludeIds?: string[];
}): Promise<Story[]> {
  const { readingLevel, limit = 5, excludeIds = [] } = params;

  const dbStories = await prisma.story.findMany({
    where: {
      readingLevel: readingLevel as PrismaReadingLevel,
      isPublished: true,
      id: { notIn: excludeIds },
    },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return dbStories.map((dbStory) => {
    let content: StoryContent[];
    try {
      content = JSON.parse(dbStory.content);
    } catch {
      content = [{ type: 'text', text: dbStory.content }];
    }

    return {
      id: dbStory.id,
      title: dbStory.title,
      content,
      hints: [],
      readingLevel: dbStory.readingLevel as ReadingLevel,
      theme: dbStory.theme || 'adventure',
      wordCount: dbStory.wordCount,
      createdAt: dbStory.createdAt,
    };
  });
}

/**
 * Build story content with questions interspersed at appropriate positions
 */
function buildStoryContent(
  story: GeneratedStory,
  questions: GeneratedQuestion[]
): StoryContent[] {
  const content: StoryContent[] = [];
  
  // Sort questions by afterParagraph
  const sortedQuestions = [...questions].sort((a, b) => a.afterParagraph - b.afterParagraph);
  
  // Track which question to insert next
  let questionIndex = 0;

  story.paragraphs.forEach((paragraph, paragraphIndex) => {
    // Add the paragraph
    content.push({
      type: 'text',
      text: paragraph,
    });

    // Check if any questions should be inserted after this paragraph
    while (
      questionIndex < sortedQuestions.length &&
      sortedQuestions[questionIndex].afterParagraph <= paragraphIndex
    ) {
      const q = sortedQuestions[questionIndex];
      content.push({
        type: 'question',
        id: `q-${paragraphIndex}-${questionIndex}`,
        text: q.questionText,
        questionType: q.type,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: q.difficulty,
      });
      questionIndex++;
    }
  });

  // Add any remaining questions at the end
  while (questionIndex < sortedQuestions.length) {
    const q = sortedQuestions[questionIndex];
    content.push({
      type: 'question',
      id: `q-end-${questionIndex}`,
      text: q.questionText,
      questionType: q.type,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
    questionIndex++;
  }

  return content;
}

/**
 * Get age range string for a reading level
 */
function getAgeRangeForLevel(level: ReadingLevel): string {
  const ranges: Record<ReadingLevel, string> = {
    BEGINNER: '5-6',
    EARLY: '6-7',
    DEVELOPING: '7-8',
    INTERMEDIATE: '8-9',
    ADVANCED: '9-10',
    PROFICIENT: '10+',
  };
  return ranges[level] || '6-8';
}
