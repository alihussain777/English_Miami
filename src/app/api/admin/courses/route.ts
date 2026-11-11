import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fallbackCourses from '@/lib/courses-fallback.json';

export const dynamic = 'force-dynamic';

const LEVEL_META: Record<string, { title: string; description: string; order: number }> = {
  A0: { title: 'Absolute Beginner', description: 'Alphabet, phonics, essential greetings & survival words.', order: 1 },
  A1: { title: 'Beginner', description: 'Daily routines, family, shopping & present simple.', order: 2 },
  A2: { title: 'Elementary', description: 'Travel, past experiences, health & future plans.', order: 3 },
  B1: { title: 'Intermediate', description: 'Job interviews, workplace emails & conditionals.', order: 4 },
  B2: { title: 'Upper Intermediate', description: 'Negotiations, presentations, idioms & passive voice.', order: 5 },
  C1: { title: 'Advanced', description: 'Negative inversion, diplomatic tact & academic writing.', order: 6 },
  C2: { title: 'Proficiency', description: 'Near-native mastery, rhetoric & executive syntax.', order: 7 },
};

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 6)
  );
}

// GET: List all courses & lessons for Admin Management
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const levelFilter = searchParams.get('level');

    const whereCourse: any = {};
    if (levelFilter && levelFilter !== 'ALL') {
      whereCourse.levelCode = levelFilter;
    }

    const courses = await prisma.course.findMany({
      where: whereCourse,
      orderBy: [{ levelCode: 'asc' }, { order: 'asc' }],
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { exercises: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.warn('[Admin Courses GET] DB fallback:', error);
    const flatCourses: any[] = [];
    (fallbackCourses as any[]).forEach((lvl: any) => {
      (lvl.courses || []).forEach((c: any) => {
        flatCourses.push({
          ...c,
          levelCode: lvl.code,
          isPublished: true,
          lessons: (c.lessons || []).map((l: any) => ({
            ...l,
            levelCode: lvl.code,
            isPublished: true,
            _count: { exercises: 3 },
          })),
        });
      });
    });
    return NextResponse.json({ courses: flatCourses });
  }
}

// POST: Create a new Course OR a new Lesson (with exercises)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType } = body; // 'COURSE' | 'LESSON'

    if (entityType === 'COURSE') {
      const {
        title,
        levelCode = 'A0',
        description = 'Structured interactive English unit.',
        order = 1,
        createStarterLesson = true,
      } = body;

      if (!title?.trim()) {
        return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
      }

      // Ensure Level record exists
      const meta = LEVEL_META[levelCode] || LEVEL_META.A0;
      await prisma.level.upsert({
        where: { code: levelCode },
        update: {},
        create: {
          code: levelCode,
          title: meta.title,
          description: meta.description,
          order: meta.order,
        },
      });

      const slug = slugify(`${levelCode}-${title}`);
      const existingCount = await prisma.course.count({ where: { levelCode } });

      const newCourse = await prisma.course.create({
        data: {
          title: title.trim(),
          slug,
          levelCode,
          description: description.trim(),
          order: Number(order) || existingCount + 1,
          isPublished: true,
        },
      });

      // Optionally create a starter lesson so the course immediately has a stepping stone on /learn
      if (createStarterLesson) {
        const lessonSlug = slugify(`${levelCode}-${title}-lesson-1`);
        const starterLesson = await prisma.lesson.create({
          data: {
            courseId: newCourse.id,
            title: `${title.trim()} - Essentials`,
            slug: lessonSlug,
            description: `Core concepts, phonics, and vocabulary for ${title.trim()}.`,
            levelCode,
            order: 1,
            durationMinutes: 15,
            xpReward: 25,
            objectivesJson: JSON.stringify([
              `Master foundational vocabulary for ${title.trim()}`,
              'Practice accurate native pronunciation and listening',
              'Build complete conversational sentences with confidence',
            ]),
            explanationHtml: `<p>Welcome to <strong>${title.trim()}</strong> (${levelCode}). Study the key rules, listen to the vocabulary audio cards, and practice the real-world examples below before starting the interactive quiz.</p>`,
            vocabularyItemsJson: JSON.stringify([
              {
                word: 'Confidence',
                phonetic: '/ˈkɒn.fɪ.dəns/',
                partOfSpeech: 'noun',
                definition: 'A feeling of self-assurance arising from appreciation of one’s abilities.',
                translation: 'اعتماد / Confianza',
              },
              {
                word: 'Fluency',
                phonetic: '/ˈfluː.ən.si/',
                partOfSpeech: 'noun',
                definition: 'The ability to speak or write a language easily and accurately.',
                translation: 'روانی / Fluidez',
              },
            ]),
            examplesJson: JSON.stringify([
              {
                phrase: 'I am practicing English every day.',
                translation: 'میں ہر روز انگریزی کی مشق کر رہا ہوں۔ / Practico inglés todos los días.',
                note: 'Present Continuous for active habits',
              },
              {
                phrase: 'Could you please repeat that slowly?',
                translation: 'کیا آپ براہ کرم اسے آہستہ سے دہرا سکتے ہیں؟ / ¿Podrías repetir eso despacio?',
                note: 'Polite request in conversation',
              },
            ]),
            grammarNotes: 'Focus on clear word order (Subject + Verb + Object) and natural intonation.',
            isPublished: true,
          },
        });

        await prisma.exercise.createMany({
          data: [
            {
              lessonId: starterLesson.id,
              type: 'REORDER',
              prompt: 'Arrange the words to form a natural English sentence:',
              audioPrompt: 'I am practicing English every day',
              optionsJson: JSON.stringify(['I', 'am', 'practicing', 'English', 'every', 'day', 'is']),
              correctAnswer: 'I am practicing English every day',
              explanation: 'Use "I am + verb-ing" for Present Continuous actions.',
              order: 1,
            },
            {
              lessonId: starterLesson.id,
              type: 'MULTIPLE_CHOICE',
              prompt: `Which word means "the ability to speak a language easily and accurately"?`,
              optionsJson: JSON.stringify(['Fluency', 'Hesitation', 'Silence', 'Translation']),
              correctAnswer: 'Fluency',
              explanation: '"Fluency" refers to smooth, accurate expression in a language.',
              order: 2,
            },
          ],
        });
      }

      return NextResponse.json({
        success: true,
        course: newCourse,
        message: `Course "${newCourse.title}" created under Level ${levelCode}!`,
      });
    }

    if (entityType === 'LESSON') {
      const {
        courseId,
        title,
        description = 'Interactive English lesson with theory, audio & quiz.',
        durationMinutes = 15,
        xpReward = 25,
        explanationHtml,
        grammarNotes,
        objectivesText = '',
        vocabText = '',
        examplesText = '',
        quizQuestion = '',
        quizAnswer = '',
        quizOptions = '',
      } = body;

      if (!courseId || !title?.trim()) {
        return NextResponse.json({ error: 'Course and Lesson Title are required' }, { status: 400 });
      }

      const parentCourse = await prisma.course.findUnique({
        where: { id: courseId },
        include: { lessons: true },
      });

      if (!parentCourse) {
        return NextResponse.json({ error: 'Selected course not found' }, { status: 404 });
      }

      const lessonSlug = slugify(`${parentCourse.levelCode}-${title}`);
      const nextOrder = (parentCourse.lessons?.length || 0) + 1;

      // Parse objectives (one per line)
      const parsedObjectives = objectivesText
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const finalObjectives =
        parsedObjectives.length > 0
          ? parsedObjectives
          : [
              `Understand core rules of ${title.trim()}`,
              'Master key vocabulary with accurate pronunciation',
              'Complete interactive sentence & listening drills',
            ];

      // Parse vocabulary lines: "Word | Translation | Definition"
      const parsedVocab = vocabText
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string) => {
          const parts = line.split('|').map((p) => p.trim());
          return {
            word: parts[0] || 'Hello',
            translation: parts[1] || 'سلام / Hola',
            definition: parts[2] || `Key term in ${title.trim()}`,
            phonetic: parts[3] || '',
          };
        });

      const finalVocab =
        parsedVocab.length > 0
          ? parsedVocab
          : [
              {
                word: 'Welcome',
                phonetic: '/ˈwel.kəm/',
                translation: 'خوش آمدید / Bienvenido',
                definition: 'A polite greeting to someone arriving.',
              },
              {
                word: 'Practice',
                phonetic: '/ˈpræk.tɪs/',
                translation: 'مشق کرنا / Práctica',
                definition: 'Repeated exercise to improve a skill.',
              },
            ];

      // Parse example phrases: "English phrase | Translation"
      const parsedExamples = examplesText
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean)
        .map((line: string) => {
          const parts = line.split('|').map((p) => p.trim());
          return {
            phrase: parts[0] || 'Good morning, how are you?',
            translation: parts[1] || 'صبح بخیر، آپ کیسے ہیں؟',
            note: parts[2] || 'Key conversational phrase',
          };
        });

      const finalExamples =
        parsedExamples.length > 0
          ? parsedExamples
          : [
              {
                phrase: `Let us begin studying ${title.trim()}.`,
                translation: `آئیے ${title.trim()} کا مطالعہ شروع کریں۔`,
                note: 'Polite invitation phrase',
              },
            ];

      const formattedExplanation =
        explanationHtml?.trim()
          ? explanationHtml.trim().startsWith('<')
            ? explanationHtml.trim()
            : `<p>${explanationHtml.trim().replace(/\n+/g, '</p><p>')}</p>`
          : `<p>In this lesson, you will master <strong>${title.trim()}</strong>. Review the objectives, tap the speaker buttons on the vocabulary and phrase cards to hear native pronunciation, and then complete the practice quiz.</p>`;

      const newLesson = await prisma.lesson.create({
        data: {
          courseId: parentCourse.id,
          title: title.trim(),
          slug: lessonSlug,
          description: description.trim(),
          levelCode: parentCourse.levelCode,
          order: nextOrder,
          durationMinutes: Number(durationMinutes) || 15,
          xpReward: Number(xpReward) || 25,
          objectivesJson: JSON.stringify(finalObjectives),
          explanationHtml: formattedExplanation,
          vocabularyItemsJson: JSON.stringify(finalVocab),
          examplesJson: JSON.stringify(finalExamples),
          grammarNotes: grammarNotes?.trim() || 'Pay attention to word order and pronunciation.',
          isPublished: true,
        },
      });

      // Create interactive exercises for this lesson
      const exercisesToCreate: any[] = [];

      if (quizQuestion?.trim() && quizAnswer?.trim()) {
        const opts = quizOptions
          ? quizOptions.split(',').map((o: string) => o.trim()).filter(Boolean)
          : [quizAnswer.trim(), 'Incorrect Option A', 'Incorrect Option B'];
        if (!opts.includes(quizAnswer.trim())) opts.unshift(quizAnswer.trim());

        exercisesToCreate.push({
          lessonId: newLesson.id,
          type: 'MULTIPLE_CHOICE',
          prompt: quizQuestion.trim(),
          optionsJson: JSON.stringify(opts),
          correctAnswer: quizAnswer.trim(),
          explanation: `Correct answer: ${quizAnswer.trim()}`,
          order: 1,
        });
      }

      // Also auto-generate a sentence builder exercise from the first example
      const firstPhrase = (finalExamples[0]?.phrase || 'Hello how are you today').replace(/[.!?,]/g, '').trim();
      const words = firstPhrase.split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        exercisesToCreate.push({
          lessonId: newLesson.id,
          type: 'REORDER',
          prompt: `Translate & assemble: "${finalExamples[0]?.translation || firstPhrase}"`,
          audioPrompt: firstPhrase,
          optionsJson: JSON.stringify([...words, 'the', 'is']),
          correctAnswer: firstPhrase,
          explanation: `Correct sentence: "${firstPhrase}".`,
          order: exercisesToCreate.length + 1,
        });
      }

      if (exercisesToCreate.length > 0) {
        await prisma.exercise.createMany({ data: exercisesToCreate });
      }

      return NextResponse.json({
        success: true,
        lesson: newLesson,
        message: `Lesson "${newLesson.title}" added to "${parentCourse.title}"!`,
      });
    }

    return NextResponse.json({ error: 'Invalid entityType' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Courses POST] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create curriculum item' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a Course or a Lesson
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');

    if (lessonId) {
      await prisma.lesson.delete({ where: { id: lessonId } });
      return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
    }

    if (courseId) {
      await prisma.course.delete({ where: { id: courseId } });
      return NextResponse.json({ success: true, message: 'Course deleted successfully' });
    }

    return NextResponse.json({ error: 'courseId or lessonId is required' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Courses DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
