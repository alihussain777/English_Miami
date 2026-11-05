import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        subscription: true,
        streak: true,
        userAchievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Count statistics
    const completedLessonsCount = await prisma.lessonProgress.count({
      where: { userId: user.id, status: 'COMPLETED' },
    });

    const masteredVocabCount = await prisma.userVocabulary.count({
      where: { userId: user.id, status: 'MASTERED' },
    });

    const totalVocabCount = await prisma.userVocabulary.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: user.profile,
        subscription: user.subscription,
        streak: user.streak,
        achievements: user.userAchievements.map((ua) => ua.achievement),
        stats: {
          completedLessons: completedLessonsCount,
          totalVocab: totalVocabCount,
          masteredVocab: masteredVocabCount,
          speakingMinutes: user.profile?.speakingMinutes || 0,
          xp: user.profile?.xp || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching current session:', error);
    return NextResponse.json({ authenticated: false, error: 'Session fetch failed' }, { status: 500 });
  }
}
