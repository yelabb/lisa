import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUserProgress, saveUserPreferences, completeOnboarding } from '@/lib/db/progress';

// GET - Retrieve user progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const progress = await getOrCreateUserProgress(userId);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// PUT - Update user preferences or complete onboarding
export async function PUT(request: NextRequest) {
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

    if (action === 'complete-onboarding') {
      // Complete onboarding
      const { preferredThemes, interests } = data;
      
      progress = await completeOnboarding({
        userId,
        preferredThemes: preferredThemes || [],
        interests: interests || [],
      });
    } else {
      // Update preferences
      progress = await saveUserPreferences({
        userId,
        preferredThemes: data.preferredThemes,
        interests: data.interests,
        customThemes: data.customThemes,
      });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
