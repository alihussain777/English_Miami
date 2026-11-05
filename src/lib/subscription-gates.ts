import { SubscriptionPlan, CEFRLevel } from '@/types';

export interface PlanLimits {
  name: string;
  priceFormatted: string;
  billingCycle: 'free' | 'weekly' | 'monthly';
  maxDailyAiMessages: number;
  maxDailySpeakingMinutes: number;
  accessibleLevels: CEFRLevel[];
  hasFullAnalytics: boolean;
  hasRoleplayScenarios: boolean;
  hasUnlimitedWritingEvaluations: boolean;
  hasVerifiedCertificates: boolean;
  features: string[];
}

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    name: 'Free Starter',
    priceFormatted: '$0',
    billingCycle: 'free',
    maxDailyAiMessages: 10,
    maxDailySpeakingMinutes: 5,
    accessibleLevels: ['A0', 'A1'],
    hasFullAnalytics: false,
    hasRoleplayScenarios: false,
    hasUnlimitedWritingEvaluations: false,
    hasVerifiedCertificates: false,
    features: [
      'Access to A0 & A1 Beginner Courses',
      '10 AI Coach interactions per day',
      '5 minutes speaking practice daily',
      'Basic vocabulary tests',
      'Standard progress tracking',
      'Community support',
    ],
  },
  WEEKLY_PRO: {
    name: 'Weekly Pro',
    priceFormatted: '$6.99 / week',
    billingCycle: 'weekly',
    maxDailyAiMessages: 200,
    maxDailySpeakingMinutes: 60,
    accessibleLevels: ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    hasFullAnalytics: true,
    hasRoleplayScenarios: true,
    hasUnlimitedWritingEvaluations: true,
    hasVerifiedCertificates: true,
    features: [
      'Full Access to All CEFR Levels (A0 to C2)',
      'Unlimited Miami AI Coach Q&A & Grammar Doctor',
      'Comprehensive Speaking & Pronunciation Lab',
      'Interactive Roleplay Scenarios',
      'Writing Lab with In-depth AI Grading',
      'Spaced Repetition Vocabulary Engine',
      'Weekly CEFR Progress Reports',
      'Milestone Verifiable Certificates',
    ],
  },
  MONTHLY_PRO: {
    name: 'Monthly Pro (Best Value - Save 35%)',
    priceFormatted: '$19.99 / month',
    billingCycle: 'monthly',
    maxDailyAiMessages: 9999,
    maxDailySpeakingMinutes: 9999,
    accessibleLevels: ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    hasFullAnalytics: true,
    hasRoleplayScenarios: true,
    hasUnlimitedWritingEvaluations: true,
    hasVerifiedCertificates: true,
    features: [
      'Everything in Weekly Pro',
      'Unlimited AI Voice & Text Coaching',
      'Unlimited Speaking & Pronunciation Lab',
      'Priority Gemini 1.5/Flash AI Responses',
      'IELTS & TOEFL Academic Simulation Modules',
      'Official CEFR Graduation Certificates',
      'Personalized AI Study Path Refreshing',
      'Offline Audio Download Support (Coming soon)',
    ],
  },
};

export function canUseAICoach(plan: SubscriptionPlan = 'FREE', currentCountToday: number = 0): { allowed: boolean; reason?: string } {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;
  if (currentCountToday >= config.maxDailyAiMessages) {
    return {
      allowed: false,
      reason: `You have reached your daily limit of ${config.maxDailyAiMessages} AI messages on the ${config.name} plan. Upgrade to Pro for unlimited coaching!`,
    };
  }
  return { allowed: true };
}

export function canUseSpeakingPractice(plan: SubscriptionPlan = 'FREE', minutesUsedToday: number = 0): { allowed: boolean; reason?: string } {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;
  if (minutesUsedToday >= config.maxDailySpeakingMinutes) {
    return {
      allowed: false,
      reason: `You have reached your ${config.maxDailySpeakingMinutes}-minute daily speaking limit. Upgrade to Pro for unlimited speaking practice!`,
    };
  }
  return { allowed: true };
}

export function canAccessLevel(plan: SubscriptionPlan = 'FREE', level: CEFRLevel): { allowed: boolean; reason?: string } {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;
  if (!config.accessibleLevels.includes(level)) {
    return {
      allowed: false,
      reason: `Level ${level} requires an active Pro subscription. The Free plan includes levels A0 & A1.`,
    };
  }
  return { allowed: true };
}

export function canAccessRoleplay(plan: SubscriptionPlan = 'FREE'): { allowed: boolean; reason?: string } {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;
  if (!config.hasRoleplayScenarios) {
    return {
      allowed: false,
      reason: 'AI Conversation Roleplay is a Pro feature. Upgrade to practice real-world situations like job interviews and airport conversations.',
    };
  }
  return { allowed: true };
}

export function canGenerateWritingFeedback(plan: SubscriptionPlan = 'FREE'): { allowed: boolean; reason?: string } {
  const config = PLAN_CONFIGS[plan] || PLAN_CONFIGS.FREE;
  if (!config.hasUnlimitedWritingEvaluations) {
    return {
      allowed: false,
      reason: 'Detailed Writing Lab evaluations are available on Pro plans.',
    };
  }
  return { allowed: true };
}
