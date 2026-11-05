'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  PenTool,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap,
  ArrowRight,
  BookOpen,
  Loader2,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFanfareSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

export default function WritingLabPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [topic, setTopic] = useState('Professional Email to a Client');
  const [text, setText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const prompts = [
    { title: 'Professional Email to a Client', targetLevel: 'B1', hint: 'Write an email updating a client on a project delay and proposing solutions.' },
    { title: 'Job Application Cover Letter', targetLevel: 'B2', hint: 'Explain why you are qualified for a remote software or marketing role.' },
    { title: 'Opinion Essay: Remote Work', targetLevel: 'B2', hint: 'Discuss whether remote work improves productivity and quality of life.' },
    { title: 'Travel Experience Narrative', targetLevel: 'A2', hint: 'Describe an unforgettable trip you took, using past tense verbs.' },
    { title: 'Academic Argument: AI in Education', targetLevel: 'C1', hint: 'Analyze the ethical and cognitive implications of generative AI for language students.' },
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

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || wordCount < 5) return;

    setEvaluating(true);
    setResult(null);

    try {
      const res = await fetch('/api/ai/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          topic,
          level: session?.currentLevel || 'B1',
        }),
      });

      const data = await res.json();
      if (data.success && data.evaluation) {
        setResult(data.evaluation);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        playFanfareSound();
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
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center flex-shrink-0 border border-oxford-200 dark:border-oxford-800">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                  Cambridge & IELTS Rubric
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Writing Studio & AI Evaluator
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Submit emails, essays, or paragraphs for in-depth CEFR band scoring, grammatical corrections, and native rewrites.
                </p>
              </div>
            </div>
          </div>

          {/* Topic Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {prompts.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => {
                  setTopic(p.title);
                  setResult(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  topic === p.title
                    ? 'bg-oxford-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{p.title}</span>
                <span className="text-[10px] opacity-75">({p.targetLevel})</span>
              </button>
            ))}
          </div>

          {/* Writing Input Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{topic}</h3>
                <p className="text-xs text-slate-500">{prompts.find((p) => p.title === topic)?.hint}</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {wordCount} Words
              </span>
            </div>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Draft your paragraph or essay in English here. Our evaluator will analyze grammatical range, accuracy, and register."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-oxford-500 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Aim for at least 30–50 words for thorough feedback.</span>
              <button
                type="button"
                disabled={evaluating || wordCount < 3}
                onClick={handleSubmitEvaluation}
                className="btn-primary text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-40"
              >
                {evaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                <span>{evaluating ? 'Evaluating Essay...' : 'Evaluate My Writing'}</span>
              </button>
            </div>
          </div>

          {/* Writing Assessment Result */}
          {result && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-xl bg-oxford-900 text-white">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-oxford-300">
                    Writing Assessment Summary
                  </span>
                  <h3 className="text-2xl font-bold mt-1">
                    Estimated Band: CEFR {result.estimatedCefr}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Overall Quality Score: {result.overallScore} / 100
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="p-2.5 rounded-xl bg-oxford-800 border border-oxford-700 text-center min-w-[65px]">
                    <span className="text-lg font-bold block">{result.grammarScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Grammar</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-oxford-800 border border-oxford-700 text-center min-w-[65px]">
                    <span className="text-lg font-bold block">{result.vocabScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Vocab</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-oxford-800 border border-oxford-700 text-center min-w-[65px]">
                    <span className="text-lg font-bold block">{result.clarityScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Clarity</span>
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions */}
              {result.suggestions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Academic Feedback & Grammar Guidance:
                  </h4>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Polished Rewrite */}
              {result.improvedVersion && (
                <div className="p-5 rounded-xl bg-oxford-50 dark:bg-oxford-950/40 border border-oxford-200 dark:border-oxford-800 space-y-2 text-xs">
                  <span className="font-bold text-oxford-900 dark:text-oxford-200 uppercase tracking-wider block">
                    Native Stylistic Polish (Recommended Version):
                  </span>
                  <p className="text-oxford-800 dark:text-oxford-300 leading-relaxed font-serif text-sm">
                    "{result.improvedVersion}"
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
