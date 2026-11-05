import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { getAICoachReply, getGrammarCorrection, getVocabularyExploration, CoachContext } from '@/lib/gemini';
import { canUseAICoach } from '@/lib/subscription-gates';
import { SubscriptionPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { mode = 'tutor', prompt, history = [], sentence, word } = body;

    // Check subscription limit if logged in
    if (session) {
      const plan = (session.plan || 'FREE') as SubscriptionPlan;

      // Count today's messages
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCount = await prisma.aIMessage.count({
        where: {
          conversation: { userId: session.id },
          role: 'user',
          createdAt: { gte: today },
        },
      });

      const gate = canUseAICoach(plan, todayCount);
      if (!gate.allowed) {
        return NextResponse.json({ error: gate.reason, limitReached: true }, { status: 403 });
      }
    }

    // Load learner context from profile
    let learnerContext: CoachContext = {
      userLevel: session?.currentLevel || 'A2',
      nativeLanguage: 'Spanish',
      learningGoal: 'Speaking English',
      name: session?.name || 'Friend',
    };

    if (session) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.id },
      });
      if (profile) {
        learnerContext.userLevel = profile.currentLevel;
        learnerContext.nativeLanguage = profile.nativeLanguage;
        learnerContext.learningGoal = profile.learningGoal;
      }
    }

    // 1. Grammar Doctor Mode
    if (mode === 'grammar') {
      const targetSentence = sentence || prompt;
      if (!targetSentence) {
        return NextResponse.json({ error: 'Sentence is required for grammar analysis.' }, { status: 400 });
      }
      const correction = await getGrammarCorrection(targetSentence, learnerContext);
      return NextResponse.json({ success: true, mode: 'grammar', result: correction });
    }

    // 2. Vocabulary Coach Mode
    if (mode === 'vocab') {
      const targetWord = word || prompt;
      if (!targetWord) {
        return NextResponse.json({ error: 'Word or topic is required for vocabulary coach.' }, { status: 400 });
      }
      const vocabResult = await getVocabularyExploration(targetWord, learnerContext.userLevel);
      return NextResponse.json({ success: true, mode: 'vocab', result: vocabResult });
    }

    // 3. General Tutor Chat Mode
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const aiResponse = await getAICoachReply(prompt, history, learnerContext);

    // Save message to conversation if logged in
    if (session) {
      let conversation = await prisma.conversation.findFirst({
        where: { userId: session.id, scenario: 'GENERAL_TUTOR' },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId: session.id,
            scenario: 'GENERAL_TUTOR',
            title: 'Chat with Miami AI Coach',
          },
        });
      }

      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: prompt,
        },
      });

      await prisma.aIMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse.text,
        },
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'tutor',
      reply: aiResponse.text,
      grammarCorrection: aiResponse.grammarCorrection,
    });
  } catch (error) {
    console.error('AI Coach error:', error);
    return NextResponse.json({ error: 'Failed to communicate with AI Coach' }, { status: 500 });
  }
}
