'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  Headphones,
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowRight,
  Clock,
  Loader2,
} from 'lucide-react';
import { playSuccessSound, playErrorSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

export default function ListeningLabPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/labs/listening').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([listenData, authData]) => {
        setModules(listenData.modules || []);
        if (authData.authenticated && authData.user) {
          setSession({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            role: authData.user.role,
            currentLevel: authData.user.profile?.currentLevel || 'A2',
            plan: authData.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentMod = modules[selectedModuleIndex];

  const handleSelectOption = (qId: string, opt: string, correct: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
    const isCorrect = opt.trim().toLowerCase() === correct.trim().toLowerCase();
    setFeedback((prev) => ({ ...prev, [qId]: isCorrect }));

    if (isCorrect) playSuccessSound();
    else playErrorSound();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center flex-shrink-0 border border-oxford-200 dark:border-oxford-800">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                  Audio Comprehension Studio
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Listening & Accent Lab
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Train your ear with authentic international conversations, dictation, and speed-adjusted playback.
                </p>
              </div>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {modules.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedModuleIndex(idx);
                  setAnswers({});
                  setFeedback({});
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 flex-shrink-0 ${
                  selectedModuleIndex === idx
                    ? 'bg-oxford-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold">{m.level}</span>
                <span>{m.title}</span>
              </button>
            ))}
          </div>

          {/* Active Audio Module Card */}
          {currentMod && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="p-6 rounded-xl bg-oxford-900 border border-oxford-800 text-white space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold px-2.5 py-0.5 rounded-full bg-oxford-800 text-oxford-200">
                    Speaker: {currentMod.speaker}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{currentMod.durationSeconds}s audio</span>
                  </div>
                </div>

                <div className="text-center py-4 space-y-3">
                  <h3 className="text-xl font-bold">{currentMod.title}</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Listen to the recording carefully at normal or reduced speed, then answer the questions below.
                  </p>

                  <div className="pt-2 flex justify-center">
                    <TextToSpeechButton
                      text={currentMod.audioSpeakerText}
                      size="lg"
                      showSpeedControl={true}
                    />
                  </div>
                </div>
              </div>

              {/* Comprehension Questions */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Comprehension Assessment:
                </h4>

                {currentMod.questions?.map((q: any, i: number) => {
                  const currentAnswer = answers[q.id];
                  const isCorrect = feedback[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Question {i + 1}</span>
                        {isCorrect === true && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        )}
                        {isCorrect === false && (
                          <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </div>

                      <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{q.prompt}</h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt: string) => {
                          const isSelected = currentAnswer === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOption(q.id, opt, q.correct)}
                              className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                                isSelected
                                  ? isCorrect
                                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                                    : 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isCorrect !== undefined && (
                        <p className="text-xs text-slate-500 italic pt-1">💡 {q.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
