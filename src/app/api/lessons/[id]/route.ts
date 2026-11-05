import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getSessionFromRequest(req);

    // Support lookup by UUID or slug
    const lesson = await prisma.lesson.findFirst({
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

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Look up vocabulary items details
    const vocabWordNames: string[] = JSON.parse(lesson.vocabularyItemsJson || '[]');
    const vocabRecords = await prisma.vocabulary.findMany({
      where: { word: { in: vocabWordNames } },
    });

    // Check user progress if logged in
    let userProgress = null;
    if (session) {
      userProgress = await prisma.lessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.id,
            lessonId: lesson.id,
          },
        },
      });
    }

    const formattedLesson = {
      id: lesson.id,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      levelCode: lesson.levelCode,
      order: lesson.order,
      durationMinutes: lesson.durationMinutes,
      xpReward: lesson.xpReward,
      course: lesson.course,
      objectives: JSON.parse(lesson.objectivesJson || '[]'),
      explanationHtml: lesson.explanationHtml,
      examples: JSON.parse(lesson.examplesJson || '[]'),
      vocabulary: vocabRecords.map((v) => ({
        id: v.id,
        word: v.word,
        phonetic: v.phonetic,
        partOfSpeech: v.partOfSpeech,
        definition: v.definition,
        exampleSentence: v.exampleSentence,
        translation: v.translation,
        cefrLevel: v.cefrLevel,
      })),
      exercises: lesson.exercises.map((e) => ({
        id: e.id,
        type: e.type,
        prompt: e.prompt,
        options: JSON.parse(e.optionsJson),
        correctAnswer: e.correctAnswer,
        explanation: e.explanation,
        order: e.order,
      })),
      vocabTestId: lesson.tests[0]?.id || null,
      isCompleted: userProgress?.status === 'COMPLETED',
      userScore: userProgress?.score || 0,
    };

    return NextResponse.json({ lesson: formattedLesson });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}
