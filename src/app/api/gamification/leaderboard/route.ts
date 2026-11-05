import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const topProfiles = await prisma.profile.findMany({
      take: 15,
      orderBy: { xp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const leaderboard = topProfiles.map((p, index) => ({
      rank: index + 1,
      userId: p.userId,
      name: p.user?.name || 'Learner',
      avatar: p.user?.avatar,
      level: p.currentLevel,
      xp: p.xp,
      nativeLanguage: p.nativeLanguage,
      country: p.country || 'Global',
    }));

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { xpBonus: 'asc' },
    });

    return NextResponse.json({ leaderboard, achievements: allAchievements });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}
