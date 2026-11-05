export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type UserRole = 'STUDENT' | 'ADMIN';

export type SubscriptionPlan = 'FREE' | 'WEEKLY_PRO' | 'MONTHLY_PRO';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  currentLevel: CEFRLevel;
  plan: SubscriptionPlan;
  avatar?: string;
  onboardingCompleted: boolean;
}

export interface ExerciseItem {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'MATCH_PAIRS' | 'REORDER' | 'SPEAK_PRACTICE' | 'LISTEN_SELECT';
  prompt: string;
  audioPrompt?: string;
  options: string[] | { left: string; right: string }[];
  correctAnswer: string;
  explanation?: string;
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  translation?: string;
  cefrLevel: CEFRLevel;
  synonyms?: string[];
  antonyms?: string[];
  status?: 'NEW' | 'LEARNING' | 'FAMILIAR' | 'MASTERED';
}

export interface LessonData {
  id: string;
  title: string;
  slug: string;
  description: string;
  levelCode: CEFRLevel;
  order: number;
  durationMinutes: number;
  xpReward: number;
  objectives: string[];
  explanationHtml: string;
  examples: { phrase: string; translation: string; note?: string }[];
  vocabularyItems: VocabWord[];
  grammarNotes?: string;
  exercises: ExerciseItem[];
}

export interface PlacementTestQuestion {
  id: string;
  skill: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'sentence_structure';
  level: CEFRLevel;
  prompt: string;
  audioText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PlacementTestResultData {
  overallLevel: CEFRLevel;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  skillBreakdown: {
    vocabulary: number;
    grammar: number;
    reading: number;
    listening: number;
    sentence_structure: number;
  };
  strengths: string[];
  weakAreas: string[];
  recommendedPath: {
    startingLevel: CEFRLevel;
    recommendedCourse: string;
    focusSkills: string[];
  };
}

export interface AICoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  grammarCorrection?: {
    original: string;
    corrected: string;
    reason: string;
  };
  audioUrl?: string;
  createdAt: string;
}

export interface WritingFeedbackResult {
  estimatedCefr: CEFRLevel;
  grammarScore: number;
  vocabScore: number;
  clarityScore: number;
  overallScore: number;
  corrections: {
    original: string;
    correction: string;
    rule: string;
  }[];
  suggestions: string[];
  improvedVersion: string;
}

export interface PronunciationFeedbackResult {
  accuracyScore: number;
  recognizedText: string;
  missingWords: string[];
  mispronouncedWords: string[];
  fluencyAdvice: string;
  suggestedCorrection: string;
}
