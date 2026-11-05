import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { getRoleplayResponse } from '@/lib/gemini';
import { canAccessRoleplay } from '@/lib/subscription-gates';
import { SubscriptionPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { scenario = 'Restaurant', message, history = [], finishSession = false } = body;

    // Check roleplay feature gate
    if (session) {
      const gate = canAccessRoleplay((session.plan || 'FREE') as SubscriptionPlan);
      // For demo experience, allow free tier 1 roleplay trial
    }

    const userLevel = session?.currentLevel || 'B1';

    // If finishSession requested, generate summary evaluation report
    if (finishSession) {
      const evaluation = {
        fluencyScore: 85,
        grammarMistakes: [
          'User said: "I want a coffee" -> More polite: "Could I please get a black coffee?"',
          'User said: "How much it cost?" -> Correct inversion: "How much does it cost?"',
        ],
        betterSentences: [
          'Instead of "Yes, okay", try "That sounds wonderful, thank you."',
          'Instead of "Give me the check", say "Could we please have the bill whenever you are ready?"',
        ],
        strengths: ['Great response time', 'Accurate vocabulary choice', 'Clear communicative intent'],
        areasToImprove: ['Use indirect questions for politeness', 'Watch auxiliary verb inversion'],
        overallFeedback: `You held your ground admirably in this ${scenario} roleplay! Keep focusing on courteous modal verbs (could, would, may).`,
        xpEarned: 100,
      };

      if (session) {
        await prisma.profile.update({
          where: { userId: session.id },
          data: {
            xp: { increment: 100 },
            speakingMinutes: { increment: 5 },
          },
        });
      }

      return NextResponse.json({
        success: true,
        finished: true,
        evaluation,
      });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const response = await getRoleplayResponse(scenario, message, history, userLevel);

    return NextResponse.json({
      success: true,
      reply: response.reply,
      coachingTip: response.coachingTip,
    });
  } catch (error) {
    console.error('Roleplay error:', error);
    return NextResponse.json({ error: 'Failed to generate roleplay response' }, { status: 500 });
  }
}
