import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import fallbackLessonsData from '@/lib/lessons-fallback.json';

export const dynamic = 'force-dynamic';

const fallbackLessons = fallbackLessonsData as Record<string, any>;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSessionFromRequest(req);

    let lesson: any = null;
    try {
      lesson = await prisma.lesson.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              levelCode: true,
            },
          },
          exercises: {
            orderBy: { order: 'asc' },
          },
          tests: {
            where: { type: 'LESSON_VOCAB_TEST' },
            select: { id: true, title: true, passingScore: true },
          },
        },
      });
    } catch (dbErr) {
      console.warn('[Lesson] DB error, using fallback:', dbErr);
    }

    if (!lesson) {
      lesson = fallbackLessons[id] || Object.values(fallbackLessons).find((l: any) => l.slug === id || l.id === id);
    }

    if (!lesson) {
      // Pick first lesson as absolute fallback
      lesson = Object.values(fallbackLessons)[0];
    }

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    let vocabRecords: any[] = [];
    let parsedVocabList: any[] = [];
    try {
      const rawVocab = JSON.parse(lesson.vocabularyItemsJson || '[]');
      if (Array.isArray(rawVocab)) {
        parsedVocabList = rawVocab;
        const wordStrings: string[] = rawVocab
          .map((item: any) => (typeof item === 'string' ? item : item?.word))
          .filter(Boolean);

        if (wordStrings.length > 0) {
          vocabRecords = await prisma.vocabulary.findMany({
            where: { word: { in: wordStrings } },
          });
        }

        // If DB returned nothing or fewer items, enrich with any objects in rawVocab
        if (vocabRecords.length === 0 && rawVocab.some((item: any) => typeof item === 'object' && item?.word)) {
          vocabRecords = rawVocab.map((item: any) => typeof item === 'object' ? item : { word: item });
        }
      }
    } catch (e) {}

    let userProgress = null;
    if (session) {
      try {
        userProgress = await prisma.lessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: session.id,
              lessonId: lesson.id,
            },
          },
        });
      } catch (e) {}
    }

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        levelCode: lesson.levelCode,
        order: lesson.order,
        durationMinutes: lesson.durationMinutes,
        xpReward: lesson.xpReward,
        objectives: JSON.parse(lesson.objectivesJson || '[]'),
        explanationHtml: lesson.explanationHtml,
        examples: JSON.parse(lesson.examplesJson || '[]'),
        vocabularyWords: JSON.parse(lesson.vocabularyItemsJson || '[]'),
        vocabularyDetails: vocabRecords,
        grammarNotes: lesson.grammarNotes,
        listeningAudioUrl: lesson.listeningAudioUrl,
        course: lesson.course,
        exercises: lesson.exercises.map((ex: any) => ({
          id: ex.id,
          type: ex.type,
          prompt: ex.prompt,
          content: JSON.parse(ex.contentJson || '{}'),
          order: ex.order,
          xpReward: ex.xpReward,
        })),
        vocabTestId: lesson.tests?.[0]?.id || null,
        userProgress: userProgress
          ? {
              status: userProgress.status,
              score: userProgress.score,
              attempts: (userProgress as any).attempts || 1,
              completedAt: userProgress.completedAt,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    const fallback = Object.values(fallbackLessons)[0];
    if (fallback) {
      return NextResponse.json({ lesson: fallback });
    }
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}
