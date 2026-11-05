import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      nativeLanguage,
      currentLevel,
      learningGoal,
      dailyTargetMinutes,
      preferredSkills,
      ageRange,
      country,
    } = body;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.id },
      update: {
        nativeLanguage: nativeLanguage || 'Spanish',
        currentLevel: currentLevel || 'A0',
        learningGoal: learningGoal || 'Speaking English',
        dailyTargetMinutes: Number(dailyTargetMinutes) || 20,
        preferredSkills: JSON.stringify(preferredSkills || ['speaking', 'vocabulary']),
        ageRange: ageRange || null,
        country: country || null,
        onboardingCompleted: true,
      },
      create: {
        userId: session.id,
        nativeLanguage: nativeLanguage || 'Spanish',
        currentLevel: currentLevel || 'A0',
        learningGoal: learningGoal || 'Speaking English',
        dailyTargetMinutes: Number(dailyTargetMinutes) || 20,
        preferredSkills: JSON.stringify(preferredSkills || ['speaking', 'vocabulary']),
        ageRange: ageRange || null,
        country: country || null,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Onboarding completed! Your personalized curriculum is ready.',
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    return NextResponse.json({ error: 'Failed to update onboarding data' }, { status: 500 });
  }
}
