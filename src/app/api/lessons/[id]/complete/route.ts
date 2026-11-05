import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to save your lesson progress.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { score = 100 } = body;

    const lesson = await prisma.lesson.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        tests: { where: { type: 'LESSON_VOCAB_TEST' } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // 1. Upsert LessonProgress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lesson.id,
        },
      },
      update: {
        status: 'COMPLETED',
        score: Math.max(score, 80),
        completedAt: new Date(),
      },
      create: {
        userId: session.id,
        lessonId: lesson.id,
        status: 'COMPLETED',
        score: Math.max(score, 80),
        completedAt: new Date(),
      },
    });

    // 2. Increment XP
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.id },
      data: {
        xp: { increment: lesson.xpReward },
      },
    });

    // 3. Update Streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userStreak = await prisma.streak.findUnique({
      where: { userId: session.id },
    });

    let currentStreak = 1;
    if (userStreak) {
      const lastActive = new Date(userStreak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffDays = Math.round((today.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentStreak = userStreak.currentStreak + 1;
      } else if (diffDays === 0) {
        currentStreak = userStreak.currentStreak;
      } else {
        currentStreak = 1;
      }

      await prisma.streak.update({
        where: { userId: session.id },
        data: {
          currentStreak,
          longestStreak: Math.max(currentStreak, userStreak.longestStreak),
          lastActiveDate: new Date(),
        },
      });
    } else {
      await prisma.streak.create({
        data: {
          userId: session.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: new Date(),
        },
      });
    }

    const vocabTestId = lesson.tests[0]?.id || null;

    return NextResponse.json({
      success: true,
      message: 'Lesson completed successfully! Fantastic work!',
      xpEarned: lesson.xpReward,
      newTotalXp: updatedProfile.xp,
      currentStreak,
      triggerVocabTest: !!vocabTestId,
      vocabTestId,
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
  }
}
