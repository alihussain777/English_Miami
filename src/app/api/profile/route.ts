import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      nativeLanguage,
      country,
      dailyTargetMinutes,
      learningGoal,
      currentLevel,
    } = body;

    if (name && name.trim()) {
      await prisma.user.update({
        where: { id: session.id },
        data: { name: name.trim() },
      });
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.id },
      update: {
        ...(nativeLanguage ? { nativeLanguage } : {}),
        ...(country !== undefined ? { country } : {}),
        ...(dailyTargetMinutes ? { dailyTargetMinutes: Number(dailyTargetMinutes) } : {}),
        ...(learningGoal ? { learningGoal } : {}),
        ...(currentLevel ? { currentLevel } : {}),
      },
      create: {
        userId: session.id,
        nativeLanguage: nativeLanguage || 'hi',
        country: country || null,
        dailyTargetMinutes: Number(dailyTargetMinutes) || 20,
        learningGoal: learningGoal || 'Speaking English',
        currentLevel: currentLevel || 'A0',
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
