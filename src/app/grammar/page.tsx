'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  CheckCircle2,
  BookOpen,
  Zap,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Check,
  Loader2,
} from 'lucide-react';
import { playSuccessSound, playFanfareSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

export default function GrammarMasteryPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/grammar').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([gData, authData]) => {
        setTopics(gData.topics || []);
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

  const currentTopic = topics[selectedTopicIdx];

  const handleMarkComplete = async (topicId: string) => {
    try {
      const res = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, score: 100 }),
      });
      const data = await res.json();
      if (data.success) {
        setCompletedTopicIds((prev) => {
          const next = new Set(prev);
          next.add(topicId);
          return next;
        });
        playFanfareSound();
      }
    } catch (err) {
      console.error(err);
    }
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
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                  Comprehensive Grammar Mechanics
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Grammar Units & Structural Logic
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Understand linguistic rules in contextual scenarios, from present simple to inverted formal conditionals.
                </p>
              </div>
            </div>
          </div>

          {/* Topics Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {topics.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopicIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  selectedTopicIdx === idx
                    ? 'bg-oxford-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-bold">
                  {t.levelCode}
                </span>
                <span>{t.title}</span>
              </button>
            ))}
          </div>

          {/* Active Topic Card */}
          {currentTopic && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 mr-2 border border-oxford-200 dark:border-oxford-800">
                    {currentTopic.category} • Level {currentTopic.levelCode}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {currentTopic.title}
                  </h2>
                </div>

                {(currentTopic.isCompleted || completedTopicIds.has(currentTopic.id)) && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" /> Mastered
                  </span>
                )}
              </div>

              {/* Explanation */}
              <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Concept & Structural Rationale:
                </h4>
                <div
                  className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                  dangerouslySetInnerHTML={{ __html: currentTopic.explanation }}
                />
              </div>

              {/* Real Examples */}
              {currentTopic.examples?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Target Sentences:
                  </h4>
                  <div className="space-y-2">
                    {currentTopic.examples.map((ex: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        👉 {typeof ex === 'string' ? ex : ex.sentence}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark Complete CTA */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Master this topic to earn +50 XP.</span>
                <button
                  type="button"
                  onClick={() => handleMarkComplete(currentTopic.id)}
                  className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark as Mastered (+50 XP)</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
