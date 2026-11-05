import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const fallbackLeaderboard = [
  { rank: 1, userId: 'u1', name: 'Zhang Wei', level: 'B2', xp: 1450, country: 'China' },
  { rank: 2, userId: 'u2', name: 'Muhammad Ali', level: 'B1', xp: 1320, country: 'Pakistan' },
  { rank: 3, userId: 'u3', name: 'Sofia Rodriguez', level: 'A2', xp: 1180, country: 'Spain' },
  { rank: 4, userId: 'u4', name: 'Priya Sharma', level: 'B2', xp: 1040, country: 'India' },
  { rank: 5, userId: 'u5', name: 'Lucas Silva', level: 'A2', xp: 950, country: 'Brazil' },
  { rank: 6, userId: 'u6', name: 'Tariq Al-Mansoor', level: 'B1', xp: 870, country: 'UAE' },
  { rank: 7, userId: 'u7', name: 'Anna Mueller', level: 'C1', xp: 820, country: 'Germany' },
  { rank: 8, userId: 'u8', name: 'Mateo Garcia', level: 'A1', xp: 760, country: 'Mexico' },
];

export async function GET() {
  try {
    let topProfiles: any[] = [];
    let allAchievements: any[] = [];

    try {
      topProfiles = await prisma.profile.findMany({
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
      allAchievements = await prisma.achievement.findMany({
        orderBy: { xpBonus: 'asc' },
      });
    } catch (dbErr) {
      console.warn('[Leaderboard] DB error, using fallback:', dbErr);
    }

    if (!topProfiles || topProfiles.length === 0) {
      return NextResponse.json({ leaderboard: fallbackLeaderboard, achievements: [] });
    }

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

    return NextResponse.json({ leaderboard, achievements: allAchievements });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ leaderboard: fallbackLeaderboard, achievements: [] });
  }
}
