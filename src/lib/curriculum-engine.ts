import { calculateSRS, SRSResult } from './srs';

export function calculateLessonXP(baseXp: number = 20, score: number = 100): number {
  const percentage = Math.max(0, Math.min(100, score));
  return Math.max(5, Math.round((baseXp || 20) * (percentage / 100)));
}

export function getNextReviewInterval(
  repetitions: number = 0,
  interval: number = 1,
  easeFactor: number = 2.5,
  quality: number = 4
): SRSResult {
  return calculateSRS({ repetitions, interval, easeFactor }, quality);
}
