'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  Award,
  BookOpen,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { playSuccessSound, playErrorSound, playFanfareSound } from '@/lib/audio-feedback';
import { CEFRLevel } from '@/types';

export default function PlacementTestPage() {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/placement-test')
      .then((res) => res.json())
      .then((data) => {
        setTestData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentIndex < (testData?.questions.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: testData.testId,
          answers,
        }),
      });
      const data = await res.json();
      setResult(data);
      playFanfareSound();
    } catch (err) {
      console.error(err);
      playErrorSound();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading Diagnostic Assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = testData?.questions[currentIndex];
  const totalQ = testData?.questions.length || 0;
  const answeredCount = Object.keys(answers).length;
  const progressPct = totalQ > 0 ? Math.round(((currentIndex + 1) / totalQ) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {!result ? (
          <div className="space-y-6">
            {/* Header / Progress Bar */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                    Question {currentIndex + 1} of {totalQ}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Official CEFR Placement Diagnostic
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                  Target: {currentQ?.difficulty}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Completed: {answeredCount}/{totalQ}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-900 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Question Card */}
            {currentQ && (
              <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Prompt
                    </span>
                    <TextToSpeechButton text={currentQ.prompt} size="sm" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {currentQ.prompt}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt: string, idx: number) => {
                    const isSelected = answers[currentQ.id] === opt;
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, opt)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-900 font-semibold text-blue-950 dark:text-blue-200'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-blue-900 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm sm:text-base">{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-900 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>

                  {currentIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Award className="w-4 h-4" />
                      <span>{submitting ? 'Grading Test...' : 'Calculate My CEFR Level'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* RESULT DIAGNOSTIC REPORT */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Top Score Banner */}
            <div className="relative overflow-hidden p-8 sm:p-10 rounded-2xl bg-blue-900 text-white shadow-sm space-y-6 border border-blue-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-3 border border-white/20">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Official CEFR Diagnostic Assessment</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold">
                    Assessed Level:{' '}
                    <span className="text-amber-300">
                      {result.overallLevel}
                    </span>
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Score: {result.percentage}% ({result.correctCount} of {result.totalQuestions} correct)
                  </p>
                </div>

                <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-black text-amber-300">{result.overallLevel}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">CEFR</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-blue-200 block">Recommended Starting Course</span>
                  <span className="text-base font-bold text-white">{result.recommendedPath?.recommendedCourse}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-950 hover:bg-slate-100 font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-blue-900" />
                </Link>
              </div>
            </div>

            {/* Skill Breakdown & Strengths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skill Bars */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Skill Competency Breakdown
                  </h3>
                </div>

                <div className="space-y-3">
                  {Object.entries(result.skillBreakdown || {}).map(([skill, pct]: any) => (
                    <div key={skill} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize text-slate-700 dark:text-slate-300">
                          {skill.replace('_', ' ')}
                        </span>
                        <span className="text-blue-900 dark:text-blue-400">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-900 dark:bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weak Areas */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Linguistic Diagnostic
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                      Key Strengths
                    </h5>
                    <ul className="space-y-1">
                      {result.strengths?.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1.5">
                      Recommended Focus Areas
                    </h5>
                    <ul className="space-y-1">
                      {result.weakAreas?.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Mistakes Review */}
            {result.mistakes?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  <span>Item Review ({result.mistakes.length} incorrect)</span>
                </h3>

                <div className="space-y-3">
                  {result.mistakes.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{m.prompt}</p>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="text-rose-600 font-medium">
                          Your Answer: {m.yourAnswer}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          Correct Answer: {m.correctAnswer}
                        </span>
                      </div>
                      <p className="text-slate-500 italic mt-1">{m.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
