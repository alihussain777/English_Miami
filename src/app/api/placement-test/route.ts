import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { CEFRLevel } from '@/types';

export async function GET() {
  try {
    const test = await prisma.test.findFirst({
      where: { type: 'PLACEMENT' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: 'Placement test not found' }, { status: 404 });
    }

    // Sanitize questions so correct answers are not exposed to client
    const sanitizedQuestions = test.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      difficulty: q.difficulty,
      options: JSON.parse(q.optionsJson),
      order: q.order,
    }));

    return NextResponse.json({
      testId: test.id,
      title: test.title,
      description: test.description,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('Error fetching placement test:', error);
    return NextResponse.json({ error: 'Failed to load placement test' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { testId, answers } = body; // answers: { [questionId: string]: string }

    if (!testId || !answers) {
      return NextResponse.json({ error: 'Test ID and answers are required.' }, { status: 400 });
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    let correctCount = 0;
    const mistakes: any[] = [];
    const skillScores: Record<string, { correct: number; total: number }> = {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      sentence_structure: { correct: 0, total: 0 },
    };

    // Calculate level points based on difficulty
    let earnedWeight = 0;
    let totalWeight = 0;

    const levelWeights: Record<string, number> = {
      A0: 1,
      A1: 2,
      A2: 3,
      B1: 4,
      B2: 5,
      C1: 6,
      C2: 7,
    };

    test.questions.forEach((q) => {
      const userAnswer = (answers[q.id] || '').trim();
      const isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
      const weight = levelWeights[q.difficulty] || 2;
      totalWeight += weight;

      // Infer skill category from prompt or difficulty
      let skill = 'grammar';
      const promptLower = q.prompt.toLowerCase();
      if (promptLower.includes('fruit') || promptLower.includes('doctor') || promptLower.includes('synonym') || promptLower.includes('mean')) {
        skill = 'vocabulary';
      } else if (promptLower.includes('read') || promptLower.includes('remote work') || promptLower.includes('drawback')) {
        skill = 'reading';
      } else if (promptLower.includes('order') || promptLower.includes('structure') || promptLower.includes('rhetorical')) {
        skill = 'sentence_structure';
      }

      if (!skillScores[skill]) {
        skillScores[skill] = { correct: 0, total: 0 };
      }
      skillScores[skill].total += 1;

      if (isCorrect) {
        correctCount += 1;
        earnedWeight += weight;
        skillScores[skill].correct += 1;
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

    const percentage = Math.round((correctCount / test.questions.length) * 100);
    const weightedRatio = totalWeight > 0 ? earnedWeight / totalWeight : 0;

    let estimatedCefr: CEFRLevel = 'A0';
    if (weightedRatio >= 0.9) estimatedCefr = 'C2';
    else if (weightedRatio >= 0.8) estimatedCefr = 'C1';
    else if (weightedRatio >= 0.65) estimatedCefr = 'B2';
    else if (weightedRatio >= 0.48) estimatedCefr = 'B1';
    else if (weightedRatio >= 0.32) estimatedCefr = 'A2';
    else if (weightedRatio >= 0.15) estimatedCefr = 'A1';
    else estimatedCefr = 'A0';

    // Skill breakdown percentages
    const skillBreakdown: Record<string, number> = {};
    const strengths: string[] = [];
    const weakAreas: string[] = [];

    Object.keys(skillScores).forEach((k) => {
      const s = skillScores[k];
      const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      skillBreakdown[k] = pct;

      const label = k.replace('_', ' ').toUpperCase();
      if (pct >= 66) {
        strengths.push(`${label} (${pct}%)`);
      } else {
        weakAreas.push(`${label} (${pct}%)`);
      }
    });

    if (strengths.length === 0) strengths.push('Determination & Eagerness to Learn');
    if (weakAreas.length === 0) weakAreas.push('High-level stylistic nuance');

    // Recommend course
    const courseMap: Record<CEFRLevel, string> = {
      A0: 'A0 Foundation: English from Zero',
      A1: 'A1 Beginner: Daily Life & Foundations',
      A2: 'A2 Elementary: Travel, Past & Future',
      B1: 'B1 Intermediate: Fluency & Workplace',
      B2: 'B2 Upper Intermediate: Professional Mastery',
      C1: 'C1 Advanced: Nuance & Academic Precision',
      C2: 'C2 Proficiency: Mastery & Idiomatic Command',
    };

    // If logged in, update DB
    if (session) {
      await prisma.testAttempt.create({
        data: {
          userId: session.id,
          testId: test.id,
          score: percentage,
          correctCount,
          totalQuestions: test.questions.length,
          passed: true,
          answersJson: JSON.stringify(answers),
          mistakesJson: JSON.stringify(mistakes),
          cefrEstimated: estimatedCefr,
          xpEarned: 150,
        },
      });

      await prisma.profile.update({
        where: { userId: session.id },
        data: {
          currentLevel: estimatedCefr,
          xp: { increment: 150 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: {
        overallLevel: estimatedCefr,
        percentage,
        correctCount,
        totalQuestions: test.questions.length,
        skillBreakdown,
        strengths,
        weakAreas,
        mistakes,
        recommendedPath: {
          startingLevel: estimatedCefr,
          recommendedCourse: courseMap[estimatedCefr],
          focusSkills: weakAreas.slice(0, 2),
        },
      },
    });
  } catch (error) {
    console.error('Placement test evaluation error:', error);
    return NextResponse.json({ error: 'Failed to grade placement test' }, { status: 500 });
  }
}
