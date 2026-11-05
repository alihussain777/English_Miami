import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const body = await req.json();
    const { expectedText, recognizedText, durationSeconds = 5 } = body;

    if (!expectedText || !recognizedText) {
      return NextResponse.json(
        { error: 'Both expected text and recognized speech text are required.' },
        { status: 400 }
      );
    }

    const cleanExpected = expectedText.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const cleanRecognized = recognizedText.toLowerCase().replace(/[^\w\s]/g, '').trim();

    const expectedTokens = cleanExpected.split(/\s+/);
    const recognizedTokens = cleanRecognized.split(/\s+/);

    // Compute token match
    let matchedCount = 0;
    const missingWords: string[] = [];

    expectedTokens.forEach((token: string) => {
      if (recognizedTokens.includes(token)) {
        matchedCount++;
      } else {
        missingWords.push(token);
      }
    });

    const accuracyScore = Math.max(
      10,
      Math.min(100, Math.round((matchedCount / expectedTokens.length) * 100))
    );

    let fluencyAdvice = 'Clear pronunciation! You sounded confident and articulate.';
    if (accuracyScore < 50) {
      fluencyAdvice = 'Take your time and enunciate each syllable clearly. Pay close attention to ending consonant sounds.';
    } else if (accuracyScore < 80) {
      fluencyAdvice = 'Very understandable! Focus on smoothing transitions between words and emphasizing key stressed words.';
    }

    if (session) {
      await prisma.speakingSession.create({
        data: {
          userId: session.id,
          prompt: expectedText,
          expectedText,
          recognizedText,
          accuracyScore,
          missingWordsJson: JSON.stringify(missingWords),
          feedbackNotes: fluencyAdvice,
          durationSeconds: Number(durationSeconds) || 5,
        },
      });

      // Update speaking minutes and XP
      await prisma.profile.update({
        where: { userId: session.id },
        data: {
          xp: { increment: 25 },
          speakingMinutes: { increment: Math.max(1, Math.round(durationSeconds / 60)) },
        },
      });
    }

    return NextResponse.json({
      success: true,
      accuracyScore,
      recognizedText,
      missingWords,
      fluencyAdvice,
      suggestedCorrection: missingWords.length > 0 ? `Focus especially on: "${missingWords.join(', ')}"` : 'Spot-on pronunciation!',
      xpEarned: session ? 25 : 0,
    });
  } catch (error) {
    console.error('Pronunciation error:', error);
    return NextResponse.json({ error: 'Failed to analyze pronunciation' }, { status: 500 });
  }
}
