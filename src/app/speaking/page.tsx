'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import SpeechRecognitionButton from '@/components/SpeechRecognitionButton';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  Mic,
  Volume2,
  Trophy,
  Zap,
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
} from 'lucide-react';
import { playSuccessSound, playFanfareSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

export default function SpeakingLabPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [evaluating, setEvaluating] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState<any>(null);

  const speakingChallenges = [
    {
      level: 'A1',
      targetPhrase: 'Hello, my name is Alex and I am learning English with EnglishMiami.',
      context: 'Self-introduction at a global conference',
      difficulty: 'Easy',
    },
    {
      level: 'A2',
      targetPhrase: 'Could you please recommend a great seafood restaurant near the beach?',
      context: 'Asking for travel recommendations',
      difficulty: 'Moderate',
    },
    {
      level: 'B1',
      targetPhrase: 'If we implement this new marketing strategy, our international sales will grow.',
      context: 'Expressing business predictions with conditionals',
      difficulty: 'Intermediate',
    },
    {
      level: 'B2',
      targetPhrase: 'I would like to walk you through the key milestones of our expansion roadmap.',
      context: 'Executive presentation signposting',
      difficulty: 'Advanced',
    },
    {
      level: 'C1',
      targetPhrase: 'Rarely have we encountered such a compelling and eloquent proposal.',
      context: 'Negative inversion for diplomatic emphasis',
      difficulty: 'Mastery',
    },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            currentLevel: data.user.profile?.currentLevel || 'A2',
            plan: data.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const currentChallenge = speakingChallenges[activePromptIndex];

  const handleSpeechResult = async (spokenText: string) => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/ai/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedText: currentChallenge.targetPhrase,
          recognizedText: spokenText,
          durationSeconds: 6,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPronunciationResult(data);
        if (data.accuracyScore >= 75) {
          playSuccessSound();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center flex-shrink-0 border border-oxford-200 dark:border-oxford-800">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                  Voice & Pronunciation Lab
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Speaking & Fluency Lab
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Listen to native phrasing, speak into your microphone, and receive real-time accuracy scoring.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {session ? '45 min' : '5 min'}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Speaking Today</span>
              </div>
            </div>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {speakingChallenges.map((sc, idx) => (
              <button
                key={sc.level}
                type="button"
                onClick={() => {
                  setActivePromptIndex(idx);
                  setPronunciationResult(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  activePromptIndex === idx
                    ? 'bg-oxford-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>Level {sc.level}</span>
                <span className="text-[10px] opacity-75">({sc.difficulty})</span>
              </button>
            ))}
          </div>

          {/* Active Speaking Challenge Card */}
          <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
              <span>Context:</span>
              <strong className="text-slate-900 dark:text-white">{currentChallenge.context}</strong>
            </div>

            {/* Target sentence display */}
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Target Sentence:
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white leading-relaxed">
                "{currentChallenge.targetPhrase}"
              </h2>

              <div className="pt-2 flex items-center justify-center gap-3">
                <TextToSpeechButton
                  text={currentChallenge.targetPhrase}
                  size="md"
                  showSpeedControl={true}
                />
              </div>
            </div>

            {/* Microphone Speak Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <SpeechRecognitionButton
                onResult={handleSpeechResult}
                buttonText="Tap to Speak Sentence"
                className="py-3 px-6 text-sm"
              />
              <p className="text-xs text-slate-400">
                Requires standard microphone access in your browser.
              </p>
            </div>

            {evaluating && (
              <div className="text-xs font-semibold text-oxford-600 dark:text-oxford-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating phonetic accuracy...</span>
              </div>
            )}

            {/* Pronunciation Feedback Result */}
            {pronunciationResult && (
              <div className="mt-6 p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pronunciation Accuracy
                    </span>
                    <h4 className="text-3xl font-bold text-oxford-700 dark:text-oxford-300">
                      {pronunciationResult.accuracyScore}%
                    </h4>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    +{pronunciationResult.xpEarned} XP Awarded
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium block mb-1">Recognized Phonetic Transcript:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium italic">
                    "{pronunciationResult.recognizedText}"
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    💡 {pronunciationResult.fluencyAdvice}
                  </p>
                  <p className="text-oxford-700 dark:text-oxford-400 font-bold">
                    {pronunciationResult.suggestedCorrection}
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
