import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { getNextReviewInterval, calculateLessonXP } from '@/lib/curriculum-engine';
import { buildDuolingoCurriculum } from '@/lib/duolingo-curriculum';
import fs from 'fs';
import path from 'path';

function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Check if this is a Duolingo Native-to-English Basic Lesson slug (e.g. duolingo-hi-lesson-1)
    const duoMatch = id.match(/^duolingo-([a-z]+)-lesson-(\d+)$/i);
    if (duoMatch) {
      const langCode = duoMatch[1].toLowerCase();
      const filePath = path.join(
        process.cwd(),
        'public',
        'data',
        'duolingo',
        `english_from_${langCode}.json`
      );
      if (fs.existsSync(filePath)) {
        const rawJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const units = buildDuolingoCurriculum(langCode, rawJson, []);
        for (const u of units) {
          const found = u.lessons.find((l) => l.slug === id);
          if (found) {
            const convertedExercises = found.challenges.map((ch, idx) => {
              const choices = (ch.choices || []).map((c) =>
                typeof c === 'string' ? c : c.text
              );
              const expected =
                ch.correctSolutions?.[0] ||
                (ch.correctIndices && ch.choices
                  ? ch.correctIndices
                      .map((i) => {
                        const item = ch.choices![i];
                        return typeof item === 'string' ? item : item?.text || '';
                      })
                      .join(' ')
                  : ch.prompt || '');

              return {
                id: `${found.slug}-ex-${idx + 1}`,
                type:
                  ch.type === 'speak'
                    ? 'SPEAK_PRACTICE'
                    : choices.length > 0
                    ? 'MULTIPLE_CHOICE'
                    : 'TRANSLATION',
                prompt:
                  ch.prompt ||
                  (ch.tokens || []).map((t) => t.value).join('') ||
                  'Translate or complete this phrase:',
                audioText: ch.prompt || expected,
                options:
                  choices.length >= 2
                    ? [
                        expected,
                        ...choices.filter((c) => c !== expected).slice(0, 3),
                      ]
                    : [expected, 'Good morning', 'Thank you very much', 'See you tomorrow'],
                correctAnswer: expected,
                explanation: `Correct English expression: "${expected}"`,
              };
            });

            return NextResponse.json({
              lesson: {
                ...found,
                courseTitle: u.title,
                vocabularyDetails: found.vocabularyWords,
                exercises: convertedExercises,
              },
            });
          }
        }
      }
    }

    // 2. Look up DB Lesson by slug or ID
    let lesson = await prisma.lesson.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        course: {
          include: {
            level: true,
          },
        },
        exercises: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!lesson) {
      lesson = await prisma.lesson.findFirst({
        include: {
          course: { include: { level: true } },
          exercises: { orderBy: { order: 'asc' } },
        },
      });
    }

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const rawVocabItems = safeJsonParse<any[]>(lesson.vocabularyItemsJson, []);
    const wordStrings = rawVocabItems
      .map((item) => (typeof item === 'string' ? item : item?.word))
      .filter(Boolean);

    const vocabDetails =
      wordStrings.length > 0
        ? await prisma.vocabularyItem.findMany({
            where: {
              word: { in: wordStrings },
            },
          })
        : [];

    const vocabDetailMap = new Map(
      vocabDetails.map((v) => [v.word.toLowerCase(), v])
    );

    // Build rich unified vocabulary objects so both vocabularyWords and vocabularyDetails have full info
    let unifiedVocab = rawVocabItems.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const dbMatch = vocabDetailMap.get((item.word || '').toLowerCase());
        return {
          word: item.word || 'Word',
          phonetic: item.phonetic || dbMatch?.phonetic || '',
          definition:
            item.definition ||
            dbMatch?.definition ||
            `Core ${lesson.course.level.code} English vocabulary term`,
          translation: item.translation || item.meaning || '',
          exampleSentence:
            item.exampleSentence ||
            dbMatch?.exampleSentence ||
            `Practice using "${item.word}" in daily conversation.`,
        };
      }
      const strWord = String(item);
      const dbMatch = vocabDetailMap.get(strWord.toLowerCase());
      return {
        word: strWord,
        phonetic: dbMatch?.phonetic || '',
        definition:
          dbMatch?.definition ||
          `Essential ${lesson.course.level.code} vocabulary word used in "${lesson.title}".`,
        translation: '',
        exampleSentence:
          dbMatch?.exampleSentence ||
          `Can you use "${strWord}" in a complete English sentence?`,
      };
    });

    if (unifiedVocab.length === 0) {
      unifiedVocab = [
        {
          word: 'Communicate',
          phonetic: '/kəˈmjuːnɪkeɪt/',
          definition: 'To share or exchange information, news, or ideas clearly.',
          translation: 'بات چیت کرنا / संवाद करना / Comunicar',
          exampleSentence: 'We communicate in English every day at work.',
        },
        {
          word: 'Confidence',
          phonetic: '/ˈkɒnfɪdəns/',
          definition: 'A feeling of self-assurance arising from appreciation of one’s abilities.',
          translation: 'اعتماد / आत्मविश्वास / Confianza',
          exampleSentence: 'Speaking aloud builds your English confidence.',
        },
        {
          word: 'Fluency',
          phonetic: '/ˈfluːənsi/',
          definition: 'The ability to speak or write a language easily and accurately.',
          translation: 'روانی / प्रवाह / Fluidez',
          exampleSentence: 'Daily practice is the fastest path to fluency.',
        },
        {
          word: 'Expression',
          phonetic: '/ɪkˈspreʃn/',
          definition: 'A word or phrase used to convey a specific idea or feeling.',
          translation: 'اظہار / अभिव्यक्ति / Expresión',
          exampleSentence: 'This is a very common polite expression in Miami.',
        },
      ];
    }

    let objectives = safeJsonParse<string[]>(lesson.objectivesJson, []);
    if (objectives.length === 0) {
      objectives = [
        `Master the core concepts and sentence patterns of ${lesson.title}`,
        `Pronounce key ${lesson.course.level.code} vocabulary clearly with natural rhythm`,
        `Apply these expressions accurately in real-world English conversations`,
      ];
    }

    let examples = safeJsonParse<any[]>(lesson.examplesJson, []);
    if (examples.length === 0) {
      examples = unifiedVocab.slice(0, 4).map((v) => ({
        phrase: v.exampleSentence || `Let's practice ${v.word} together.`,
        translation: v.definition,
        note: `${lesson.course.level.code} Core Pattern`,
      }));
    }

    const explanationHtml =
      lesson.explanationHtml && lesson.explanationHtml.trim().length > 10
        ? lesson.explanationHtml
        : `<div class="space-y-3">
            <p>Welcome to <strong>${lesson.title}</strong> (${lesson.course.level.code} — ${lesson.course.title}).</p>
            <p>${lesson.description || 'In this lesson, you will study key English structures, listen to realistic pronunciation, and complete interactive exercises.'}</p>
            <p>Review the vocabulary cards and spoken sentence examples carefully before starting the interactive practice quiz.</p>
          </div>`;

    const formattedExercises =
      lesson.exercises.length > 0
        ? lesson.exercises.map((ex) => ({
            id: ex.id,
            type: ex.type,
            prompt: ex.prompt,
            audioText: ex.audioText || ex.prompt,
            options: safeJsonParse<string[]>(ex.optionsJson, []),
            correctAnswer: ex.correctAnswer,
            explanation: ex.explanation,
          }))
        : [
            {
              id: `${lesson.id}-fallback-1`,
              type: 'MULTIPLE_CHOICE',
              prompt: `Which word from "${lesson.title}" means: "${unifiedVocab[0].definition}"?`,
              audioText: unifiedVocab[0].word,
              options: [
                unifiedVocab[0].word,
                unifiedVocab[1]?.word || 'Yesterday',
                unifiedVocab[2]?.word || ' Quickly',
                'None of these',
              ],
              correctAnswer: unifiedVocab[0].word,
              explanation: `"${unifiedVocab[0].word}" means: ${unifiedVocab[0].definition}`,
            },
            {
              id: `${lesson.id}-fallback-2`,
              type: 'SPEAK_PRACTICE',
              prompt: `Speak this sentence clearly out loud: "${examples[0]?.phrase || 'Hello, it is great to meet you today.'}"`,
              audioText: examples[0]?.phrase || 'Hello, it is great to meet you today.',
              options: [],
              correctAnswer: examples[0]?.phrase || 'Hello, it is great to meet you today.',
              explanation: 'Speaking full sentences out loud trains your mouth muscles and builds automatic fluency.',
            },
          ];

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        levelCode: lesson.course.level.code,
        courseTitle: lesson.course.title,
        durationMinutes: lesson.durationMinutes || 10,
        xpReward: lesson.xpReward || 20,
        objectives,
        explanationHtml,
        grammarNotes:
          lesson.grammarNotes ||
          `Pay close attention to word order and natural stress when practicing ${lesson.title}.`,
        vocabularyWords: unifiedVocab,
        vocabularyDetails: unifiedVocab,
        examples,
        exercises: formattedExercises,
      },
    });
  } catch (error) {
    console.error('Fetch lesson error:', error);
    return NextResponse.json({ error: 'Failed to load lesson' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { score, mistakes = [] } = body;

    const lesson = await prisma.lesson.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!lesson) {
      return NextResponse.json({
        success: true,
        score: score || 100,
        xpEarned: 20,
      });
    }

    const xpEarned = calculateLessonXP(lesson.xpReward, score);

    if (session) {
      await prisma.userLessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: session.id,
            lessonId: lesson.id,
          },
        },
        update: {
          status: 'COMPLETED',
          score: Math.max(score, 0),
          completedAt: new Date(),
        },
        create: {
          userId: session.id,
          lessonId: lesson.id,
          status: 'COMPLETED',
          score: Math.max(score, 0),
          completedAt: new Date(),
        },
      });

      await prisma.profile.update({
        where: { userId: session.id },
        data: {
          xp: { increment: xpEarned },
        },
      });

      const streak = await prisma.streak.findUnique({ where: { userId: session.id } });
      if (streak) {
        await prisma.streak.update({
          where: { userId: session.id },
          data: {
            currentStreak: { increment: 0 },
            lastActivityAt: new Date(),
          },
        });
      }

      for (const m of mistakes) {
        await prisma.mistakeLog.create({
          data: {
            userId: session.id,
            lessonSlug: lesson.slug,
            questionPrompt: m.prompt,
            userAnswer: m.userAnswer,
            correctAnswer: m.correctAnswer,
            skillCategory: 'LESSON_PRACTICE',
          },
        });
      }

      const vocabWords: any[] = safeJsonParse(lesson.vocabularyItemsJson, []);
      for (const wordEntry of vocabWords) {
        const wordStr = typeof wordEntry === 'string' ? wordEntry : wordEntry?.word;
        if (!wordStr) continue;
        const vocabItem = await prisma.vocabularyItem.findFirst({ where: { word: wordStr } });
        if (vocabItem) {
          const srsCalc = getNextReviewInterval(0, 1, 2.5, 4);
          await prisma.userVocabularyProgress.upsert({
            where: {
              userId_vocabId: {
                userId: session.id,
                vocabId: vocabItem.id,
              },
            },
            update: {
              lastReviewedAt: new Date(),
            },
            create: {
              userId: session.id,
              vocabId: vocabItem.id,
              status: srsCalc.status,
              intervalDays: srsCalc.intervalDays,
              easeFactor: srsCalc.easeFactor,
              repetitions: srsCalc.repetitions,
              nextReviewAt: srsCalc.nextReviewDate,
              lastReviewedAt: new Date(),
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      score,
      xpEarned,
    });
  } catch (error) {
    console.error('Lesson completion error:', error);
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}
