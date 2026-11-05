import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    const topics = await prisma.grammarTopic.findMany({
      orderBy: { order: 'asc' },
    });

    let completedIds = new Set<string>();
    if (session) {
      const progress = await prisma.grammarProgress.findMany({
        where: { userId: session.id, isCompleted: true },
      });
      completedIds = new Set(progress.map((p) => p.grammarTopicId));
    }

    const formatted = topics.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      category: t.category,
      levelCode: t.levelCode,
      explanation: t.explanation,
      examples: JSON.parse(t.examplesJson || '[]'),
      rules: JSON.parse(t.rulesJson || '[]'),
      isCompleted: completedIds.has(t.id),
    }));

    return NextResponse.json({ topics: formatted });
  } catch (error) {
    console.error('Grammar fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch grammar topics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to save grammar progress.' }, { status: 401 });
    }

    const { topicId, score = 100 } = await req.json();
    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID is required' }, { status: 400 });
    }

    await prisma.grammarProgress.upsert({
      where: {
        userId_grammarTopicId: {
          userId: session.id,
          grammarTopicId: topicId,
        },
      },
      update: {
        isCompleted: true,
        score,
        completedAt: new Date(),
      },
      create: {
        userId: session.id,
        grammarTopicId: topicId,
        isCompleted: true,
        score,
        completedAt: new Date(),
      },
    });

    await prisma.profile.update({
      where: { userId: session.id },
      data: { xp: { increment: 50 } },
    });

    return NextResponse.json({ success: true, xpEarned: 50, message: 'Grammar mastery recorded!' });
  } catch (error) {
    console.error('Grammar submit error:', error);
    return NextResponse.json({ error: 'Failed to update grammar progress' }, { status: 500 });
  }
}
