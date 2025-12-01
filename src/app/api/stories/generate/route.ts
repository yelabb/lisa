import { NextRequest, NextResponse } from 'next/server';
import { generateStory, generateQuestions } from '@/lib/services/groq';
import { createStoryWithQuestions, getCachedStory } from '@/lib/db/stories';
import type { ReadingLevel, GenerateStoryRequest } from '@/types';

export async function POST(request: NextRequest) {
  const body: GenerateStoryRequest = await request.json();
  
  const {
    readingLevel = 'BEGINNER',
    theme = 'adventure',
    themes = [],
    interests = [],
    difficultyMultiplier = 1.0,
    language = 'fr',
    excludeIds = [],
    useCacheOnly = false, // Nouveau: utiliser uniquement le cache (pour mode hors-ligne)
  } = body;

  // Utiliser themes[] si fourni, sinon fallback sur theme
  const allThemes = themes.length > 0 ? themes : [theme];

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

  // ============================================
  // STRATÉGIE: ONLINE FIRST, CACHE EN FALLBACK
  // ============================================

  // Si mode cache uniquement (hors-ligne), aller directement au cache
  if (useCacheOnly) {
    const cachedStory = await getCachedStory({
      readingLevel,
      theme,
      excludeIds,
    });

    if (cachedStory) {
      return NextResponse.json({
        story: cachedStory,
        cached: true,
      });
    }

    return NextResponse.json(
      { error: 'No cached stories available offline.' },
      { status: 404 }
    );
  }

  // TOUJOURS essayer de générer une NOUVELLE histoire en ligne d'abord
  try {
    console.log('[STORY] Generating NEW story online...');
    
    // Generate new story with Groq
    const generatedStory = await generateStory({
      readingLevel,
      themes: allThemes,
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

    // Save to database (pour le cache futur en cas de besoin)
    const story = await createStoryWithQuestions({
      generatedStory,
      questions,
      readingLevel,
    });

    console.log('[STORY] New story generated successfully:', story.id);

    return NextResponse.json({
      story,
      cached: false,
    });
  } catch (error) {
    console.error('[STORY] Online generation failed:', error);
    
    // FALLBACK: Utiliser le cache uniquement si la génération en ligne échoue
    console.log('[STORY] Falling back to cache...');
    
    try {
      const cachedStory = await getCachedStory({
        readingLevel,
        theme,
        excludeIds,
      });

      if (cachedStory) {
        console.log('[STORY] Using cached story:', cachedStory.id);
        return NextResponse.json({
          story: cachedStory,
          cached: true,
          fallback: true, // Indique que c'est un fallback
        });
      }
    } catch (cacheError) {
      console.error('[STORY] Cache lookup also failed:', cacheError);
    }

    // Aucune option disponible
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('rate')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate story and no cached stories available.' },
      { status: 500 }
    );
  }
}
