import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    const levels = await prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: {
        courses: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                durationMinutes: true,
                xpReward: true,
                order: true,
              },
            },
          },
        },
      },
    });

    let completedLessonIds = new Set<string>();
    if (session) {
      const userProgress = await prisma.lessonProgress.findMany({
        where: { userId: session.id, status: 'COMPLETED' },
        select: { lessonId: true },
      });
      completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
    }

    const levelsWithProgress = levels.map((lvl) => ({
      code: lvl.code,
      title: lvl.title,
      description: lvl.description,
      courses: lvl.courses.map((c) => {
        const totalLessons = c.lessons.length;
        const completedCount = c.lessons.filter((l) => completedLessonIds.has(l.id)).length;
        return {
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          levelCode: c.levelCode,
          totalLessons,
          completedCount,
          isCompleted: totalLessons > 0 && completedCount === totalLessons,
          lessons: c.lessons.map((l) => ({
            ...l,
            isCompleted: completedLessonIds.has(l.id),
          })),
        };
      }),
    }));

    return NextResponse.json({ levels: levelsWithProgress });
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch courses',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
