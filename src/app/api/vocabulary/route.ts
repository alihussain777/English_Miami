import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { calculateSRS, gradeAnswerToQuality } from '@/lib/srs';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, review, mastered, learning
    const cefr = searchParams.get('cefr');

    if (!session) {
      // Return public vocabulary sample if guest
      const sampleVocab = await prisma.vocabulary.findMany({
        take: 30,
        orderBy: { word: 'asc' },
      });
      return NextResponse.json({ vocabulary: sampleVocab, stats: { total: sampleVocab.length, mastered: 0, dueToday: 0 } });
    }

    const today = new Date();

    const userVocabList = await prisma.userVocabulary.findMany({
      where: { userId: session.id },
      include: { vocabulary: true },
      orderBy: { nextReviewDate: 'asc' },
    });

    let filtered = userVocabList;
    if (filter === 'review') {
      filtered = userVocabList.filter((uv) => new Date(uv.nextReviewDate) <= today);
    } else if (filter === 'mastered') {
      filtered = userVocabList.filter((uv) => uv.status === 'MASTERED');
    } else if (filter === 'learning') {
      filtered = userVocabList.filter((uv) => uv.status === 'LEARNING');
    }

    if (cefr) {
      filtered = filtered.filter((uv) => uv.vocabulary.cefrLevel === cefr);
    }

    const stats = {
      total: userVocabList.length,
      mastered: userVocabList.filter((uv) => uv.status === 'MASTERED').length,
      learning: userVocabList.filter((uv) => uv.status === 'LEARNING').length,
      dueToday: userVocabList.filter((uv) => new Date(uv.nextReviewDate) <= today).length,
    };

    const items = filtered.map((uv) => ({
      id: uv.vocabulary.id,
      userVocabId: uv.id,
      word: uv.vocabulary.word,
      phonetic: uv.vocabulary.phonetic,
      partOfSpeech: uv.vocabulary.partOfSpeech,
      definition: uv.vocabulary.definition,
      exampleSentence: uv.vocabulary.exampleSentence,
      translation: uv.vocabulary.translation,
      cefrLevel: uv.vocabulary.cefrLevel,
      status: uv.status,
      nextReviewDate: uv.nextReviewDate,
      reviewCount: uv.reviewCount,
    }));

    return NextResponse.json({ vocabulary: items, stats });
  } catch (error) {
    console.error('Vocabulary fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to save vocabulary' }, { status: 401 });
    }

    const body = await req.json();
    const { word, meaning, example, phonetic, cefrLevel = 'B1' } = body;

    if (!word || !meaning) {
      return NextResponse.json({ error: 'Word and meaning are required.' }, { status: 400 });
    }

    // Upsert vocabulary in master catalog
    const vocab = await prisma.vocabulary.upsert({
      where: { word: word.trim() },
      update: {},
      create: {
        word: word.trim(),
        definition: meaning.trim(),
        exampleSentence: example || `Using "${word}" in daily communication.`,
        phonetic: phonetic || null,
        partOfSpeech: 'custom',
        cefrLevel,
      },
    });

    // Link to user vocabulary
    const userVocab = await prisma.userVocabulary.upsert({
      where: {
        userId_vocabularyId: {
          userId: session.id,
          vocabularyId: vocab.id,
        },
      },
      update: {},
      create: {
        userId: session.id,
        vocabularyId: vocab.id,
        status: 'NEW',
        srsInterval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    });

    return NextResponse.json({ success: true, userVocab, message: `Added "${word}" to your vocabulary bank!` });
  } catch (error) {
    console.error('Save vocabulary error:', error);
    return NextResponse.json({ error: 'Failed to save word' }, { status: 500 });
  }
}
