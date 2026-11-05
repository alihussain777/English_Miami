import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import fallbackCourses from '@/lib/courses-fallback.json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    let levels: any[] = [];
    try {
      levels = await prisma.level.findMany({
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
    } catch (dbErr) {
      console.warn('[Courses] DB error, using cached curriculum:', dbErr);
    }

    if (!levels || levels.length === 0) {
      return NextResponse.json({ levels: fallbackCourses });
    }

    let completedLessonIds = new Set<string>();
    if (session) {
      try {
        const userProgress = await prisma.lessonProgress.findMany({
          where: { userId: session.id, status: 'COMPLETED' },
          select: { lessonId: true },
        });
        completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
      } catch (e) {}
    }

    const levelsWithProgress = levels.map((lvl) => ({
      code: lvl.code,
      title: lvl.title,
      description: lvl.description,
      courses: lvl.courses.map((c: any) => {
        const totalLessons = c.lessons.length;
        const completedCount = c.lessons.filter((l: any) => completedLessonIds.has(l.id)).length;
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
          lessons: c.lessons.map((l: any) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            description: l.description,
            durationMinutes: l.durationMinutes,
            xpReward: l.xpReward,
            order: l.order,
            isCompleted: completedLessonIds.has(l.id),
          })),
        };
      }),
    }));

    return NextResponse.json({ levels: levelsWithProgress });
  } catch (error: any) {
    console.warn('Courses error, returning fallback:', error);
    return NextResponse.json({ levels: fallbackCourses });
  }
}
