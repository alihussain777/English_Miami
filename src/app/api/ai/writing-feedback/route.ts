import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { evaluateWriting } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { text, topic = 'General Essay', level = 'B1' } = body;

    if (!text || text.trim().length < 15) {
      return NextResponse.json(
        { error: 'Please write at least a couple of sentences (15+ characters) for evaluation.' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateWriting(text, topic, level);

    if (session) {
      await prisma.writingSubmission.create({
        data: {
          userId: session.id,
          prompt: topic,
          topic,
          userText: text,
          estimatedCefr: evaluation.estimatedCefr,
          grammarScore: evaluation.grammarScore,
          vocabScore: evaluation.vocabScore,
          clarityScore: evaluation.clarityScore,
          feedbackJson: JSON.stringify({
            corrections: evaluation.corrections,
            suggestions: evaluation.suggestions,
            improvedVersion: evaluation.improvedVersion,
          }),
        },
      });

      // Award XP for writing practice
      await prisma.profile.update({
        where: { userId: session.id },
        data: {
          xp: { increment: 40 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      evaluation,
      xpEarned: session ? 40 : 0,
    });
  } catch (error) {
    console.error('Writing evaluation error:', error);
    return NextResponse.json({ error: 'Failed to evaluate writing' }, { status: 500 });
  }
}
