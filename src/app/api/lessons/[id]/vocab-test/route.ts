import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { calculateSRS, gradeAnswerToQuality } from '@/lib/srs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const lesson = await prisma.lesson.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        tests: {
          where: { type: 'LESSON_VOCAB_TEST' },
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    let test = lesson.tests[0];

    // If test doesn't exist, create it dynamically from lesson vocabulary
    if (!test || test.questions.length === 0) {
      const vocabNames: string[] = JSON.parse(lesson.vocabularyItemsJson || '[]');
      const words = await prisma.vocabulary.findMany({
        where: { word: { in: vocabNames } },
      });

      if (!test) {
        test = await prisma.test.create({
          data: {
            lessonId: lesson.id,
            type: 'LESSON_VOCAB_TEST',
            title: `Vocabulary Review: ${lesson.title}`,
            passingScore: 70,
          },
          include: { questions: true },
        });
      }

      // Generate questions
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        const distractor1 = words[(i + 1) % words.length]?.definition || 'To move swiftly';
        const distractor2 = words[(i + 2) % words.length]?.definition || 'A common household object';

        await prisma.question.create({
          data: {
            testId: test.id,
            prompt: `Select the correct meaning of "${w.word}":`,
            type: 'MULTIPLE_CHOICE',
            optionsJson: JSON.stringify([w.definition, distractor1, distractor2]),
            correctAnswer: w.definition,
            explanation: `"${w.word}" (${w.partOfSpeech}) means: ${w.definition}`,
            order: i + 1,
          },
        });
      }

      test = (await prisma.test.findUnique({
        where: { id: test.id },
        include: { questions: { orderBy: { order: 'asc' } } },
      }))!;
    }

    // Sanitize questions for student
    const sanitized = test.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      options: JSON.parse(q.optionsJson),
      order: q.order,
    }));

    return NextResponse.json({
      testId: test.id,
      title: test.title,
      totalQuestions: sanitized.length,
      questions: sanitized,
    });
  } catch (error) {
    console.error('Error loading vocab test:', error);
    return NextResponse.json({ error: 'Failed to load vocabulary test' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(req);
    const { id } = params;
    const body = await req.json();
    const { testId, answers } = body; // answers: { [questionId: string]: string }

    if (!testId || !answers) {
      return NextResponse.json({ error: 'Test ID and answers are required.' }, { status: 400 });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: true,
        lesson: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    let correctCount = 0;
    const mistakes: any[] = [];
    const wordsToUpdateSRS: { word: string; isCorrect: boolean }[] = [];

    test.questions.forEach((q) => {
      const userAnswer = (answers[q.id] || '').trim();
      const isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();

      // Extract target word from prompt if format matches: Select the correct meaning of "word":
      const wordMatch = q.prompt.match(/"([^"]+)"/);
      if (wordMatch) {
        wordsToUpdateSRS.push({ word: wordMatch[1], isCorrect });
      }

      if (isCorrect) {
        correctCount += 1;
      } else {
        mistakes.push({
          questionId: q.id,
          prompt: q.prompt,
          yourAnswer: userAnswer || '(No answer)',
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        });
      }
    });

    const totalQuestions = test.questions.length;
    const incorrectCount = totalQuestions - correctCount;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentage >= test.passingScore;
    const xpEarned = correctCount * 10;

    // If student is logged in, update DB: Spaced Repetition, TestAttempt, XP
    if (session) {
      // 1. Spaced Repetition Updates
      for (const item of wordsToUpdateSRS) {
        const vocabRecord = await prisma.vocabulary.findUnique({
          where: { word: item.word },
        });

        if (vocabRecord) {
          const existingUserVocab = await prisma.userVocabulary.findUnique({
            where: {
              userId_vocabularyId: {
                userId: session.id,
                vocabularyId: vocabRecord.id,
              },
            },
          });

          const currentState = {
            repetitions: existingUserVocab?.repetitions || 0,
            interval: existingUserVocab?.srsInterval || 1,
            easeFactor: existingUserVocab?.easeFactor || 2.5,
          };

          const quality = gradeAnswerToQuality(item.isCorrect);
          const srs = calculateSRS(currentState, quality);

          await prisma.userVocabulary.upsert({
            where: {
              userId_vocabularyId: {
                userId: session.id,
                vocabularyId: vocabRecord.id,
              },
            },
            update: {
              status: srs.status,
              srsInterval: srs.interval,
              easeFactor: srs.easeFactor,
              repetitions: srs.repetitions,
              nextReviewDate: srs.nextReviewDate,
              lastReviewedDate: new Date(),
              reviewCount: { increment: 1 },
              mistakesCount: item.isCorrect ? undefined : { increment: 1 },
            },
            create: {
              userId: session.id,
              vocabularyId: vocabRecord.id,
              status: srs.status,
              srsInterval: srs.interval,
              easeFactor: srs.easeFactor,
              repetitions: srs.repetitions,
              nextReviewDate: srs.nextReviewDate,
              lastReviewedDate: new Date(),
              reviewCount: 1,
              mistakesCount: item.isCorrect ? 0 : 1,
            },
          });
        }
      }

      // 2. Save Test Attempt
      await prisma.testAttempt.create({
        data: {
          userId: session.id,
          testId: test.id,
          lessonId: test.lessonId,
          score: percentage,
          correctCount,
          totalQuestions,
          passed,
          answersJson: JSON.stringify(answers),
          mistakesJson: JSON.stringify(mistakes),
          xpEarned,
        },
      });

      // 3. Award XP
      await prisma.profile.update({
        where: { userId: session.id },
        data: {
          xp: { increment: xpEarned },
        },
      });
    }

    return NextResponse.json({
      success: true,
      scoreFormatted: `${correctCount} / ${totalQuestions}`,
      correctCount,
      incorrectCount,
      totalQuestions,
      percentage,
      passed,
      xpEarned,
      mistakes,
      spacedRepetitionUpdated: true,
      message: passed
        ? 'Outstanding! You passed the vocabulary assessment and refreshed your memory bank!'
        : 'Good effort! Review your mistakes below to lock these words into long-term memory.',
    });
  } catch (error) {
    console.error('Error grading vocabulary test:', error);
    return NextResponse.json({ error: 'Failed to submit vocabulary test' }, { status: 500 });
  }
}
