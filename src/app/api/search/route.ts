import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({ lessons: [], vocabulary: [], grammar: [] });
    }

    const [lessons, vocabulary, grammar] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, description: true, levelCode: true },
      }),
      prisma.vocabulary.findMany({
        where: {
          OR: [
            { word: { contains: q } },
            { definition: { contains: q } },
          ],
        },
        take: 8,
        select: { id: true, word: true, phonetic: true, definition: true, cefrLevel: true },
      }),
      prisma.grammarTopic.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { explanation: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, title: true, slug: true, category: true, levelCode: true },
      }),
    ]);

    return NextResponse.json({ lessons, vocabulary, grammar });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
