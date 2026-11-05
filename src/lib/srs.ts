/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm Implementation
 * Quality response scale: 0-5
 * 5: Perfect response, no hesitation
 * 4: Correct response after a hesitation
 * 3: Correct response recalled with serious difficulty
 * 2: Incorrect response; where the correct one seemed easy to recall
 * 1: Incorrect response; the correct one remembered
 * 0: Complete blackout
 */

export interface SRSItemState {
  repetitions: number;
  interval: number; // in days
  easeFactor: number;
}

export interface SRSResult {
  repetitions: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
  status: 'NEW' | 'LEARNING' | 'FAMILIAR' | 'MASTERED';
}

export function calculateSRS(
  currentState: SRSItemState,
  quality: number // 0 to 5
): SRSResult {
  let { repetitions, interval, easeFactor } = currentState;

  // Constrain quality between 0 and 5
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  if (quality >= 3) {
    // Correct recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 4;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect recall -> reset repetitions, interval to 1 day
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate status
  let status: 'NEW' | 'LEARNING' | 'FAMILIAR' | 'MASTERED' = 'LEARNING';
  if (repetitions === 0) {
    status = 'LEARNING';
  } else if (repetitions < 3) {
    status = 'LEARNING';
  } else if (repetitions < 5) {
    status = 'FAMILIAR';
  } else {
    status = 'MASTERED';
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate,
    status,
  };
}

export function gradeAnswerToQuality(isCorrect: boolean, timeTakenSeconds?: number): number {
  if (!isCorrect) return 1;
  if (timeTakenSeconds && timeTakenSeconds < 5) return 5;
  if (timeTakenSeconds && timeTakenSeconds < 12) return 4;
  return 3;
}
