import { NextRequest, NextResponse } from 'next/server';
import { generateFunWordExplanation } from '@/lib/services/groq';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, context, language = 'fr' } = body;

    if (!word) {
      return NextResponse.json(
        { error: 'Word is required' },
        { status: 400 }
      );
    }

    const explanation = await generateFunWordExplanation({
      word,
      context: context || '',
      language,
    });

    return NextResponse.json(explanation);
  } catch (error) {
    console.error('Error generating word explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
