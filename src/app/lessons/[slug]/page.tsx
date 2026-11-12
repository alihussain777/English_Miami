'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import SpeechRecognitionButton from '@/components/SpeechRecognitionButton';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Volume2,
  Sparkles,
  Trophy,
  RotateCcw,
  Compass,
  LayoutDashboard,
} from 'lucide-react';
import { playSuccessSound, playErrorSound, playFanfareSound } from '@/lib/audio-feedback';
import { SpokenEvaluationResult } from '@/lib/voice-engine';

export default function LessonRunnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<'study' | 'practice' | 'summary'>('study');

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [scrambledWordsUsed, setScrambledWordsUsed] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{
    checked: boolean;
    isCorrect: boolean;
    explanation: string;
  } | null>(null);
  const [speechEval, setSpeechEval] = useState<SpokenEvaluationResult | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setLesson(data.lesson);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lesson Not Found</h1>
          <div className="flex items-center gap-3">
            <Link href="/learn" className="text-blue-700 font-bold hover:underline">
              Back to Learning Path
            </Link>
            <Link href="/dashboard" className="text-emerald-700 font-bold hover:underline">
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const exercises = lesson.exercises || [];
  const currentExercise = exercises[currentExIndex];

  const handleCheckAnswer = () => {
    if (!currentExercise) return;

    const normalizedUser = selectedAnswer.trim().toLowerCase().replace(/[.,!?]/g, '');
    const normalizedCorrect = currentExercise.correctAnswer
      .trim()
      .toLowerCase()
      .replace(/[.,!?]/g, '');

    let isCorrect = normalizedUser === normalizedCorrect;

    if (currentExercise.type === 'SPEAK_PRACTICE') {
      if (speechEval && speechEval.overallScore >= 55) {
        isCorrect = true;
      } else {
        const expectedWords = normalizedCorrect.split(/\s+/);
        const userWords = normalizedUser.split(/\s+/);
        const matchCount = expectedWords.filter((w: string) => userWords.includes(w)).length;
        isCorrect = matchCount >= Math.ceil(expectedWords.length * 0.55);
      }
    }

    if (isCorrect) {
      playSuccessSound();
      setCorrectCount((prev) => prev + 1);
    } else {
      playErrorSound();
      setMistakes((prev) => [
        ...prev,
        {
          prompt: currentExercise.prompt,
          userAnswer: selectedAnswer || '(No response)',
          correctAnswer: currentExercise.correctAnswer,
        },
      ]);
    }

    setFeedback({
      checked: true,
      isCorrect,
      explanation: currentExercise.explanation,
    });
  };

  const handleNextExercise = async () => {
    setFeedback(null);
    setSelectedAnswer('');
    setScrambledWordsUsed([]);
    setSpeechEval(null);

    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex((prev) => prev + 1);
    } else {
      setSubmitting(true);
      const finalScore =
        exercises.length > 0 ? Math.round((correctCount / exercises.length) * 100) : 100;

      try {
        const res = await fetch(`/api/lessons/${lesson.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScore,
            mistakes,
          }),
        });
        const data = await res.json();
        setXpAwarded(data.xpEarned || lesson.xpReward);
        playFanfareSound();
      } catch (e) {
        console.error(e);
      } finally {
        setSubmitting(false);
        setActivePhase('summary');
      }
    }
  };

  const handleWordClick = (word: string, idx: number) => {
    if (feedback?.checked) return;
    if (scrambledWordsUsed.includes(idx)) {
      const nextUsed = scrambledWordsUsed.filter((i) => i !== idx);
      setScrambledWordsUsed(nextUsed);
      const nextSentence = nextUsed.map((i) => currentExercise.options[i]).join(' ');
      setSelectedAnswer(nextSentence);
    } else {
      const nextUsed = [...scrambledWordsUsed, idx];
      setScrambledWordsUsed(nextUsed);
      const nextSentence = nextUsed.map((i) => currentExercise.options[i]).join(' ');
      setSelectedAnswer(nextSentence);
    }
  };

  const vocabList =
    lesson.vocabularyWords?.length > 0
      ? lesson.vocabularyWords
      : lesson.vocabularyDetails || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* Top Lesson Navigation Bar — Safe Links to Learn Path & Dashboard */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-18 z-30">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/learn"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shrink-0 hover:bg-emerald-100"
              title="Return to Learning Path"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <Compass className="w-3.5 h-3.5 hidden sm:inline" />
              <span>Learn Path</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-extrabold flex items-center gap-1.5 shrink-0 hover:bg-blue-100"
              title="Open My Learning Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-bold text-xs shrink-0">
              {lesson.levelCode}
            </span>
            <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {lesson.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActivePhase('study')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activePhase === 'study'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              1. Study Guide
            </button>
            <button
              type="button"
              onClick={() => setActivePhase('practice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activePhase === 'practice'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              2. Practice ({exercises.length})
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* PHASE 1: STUDY GUIDE */}
        {activePhase === 'study' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400">
                  {lesson.courseTitle}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />+{lesson.xpReward} XP Reward
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {lesson.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{lesson.description}</p>

              {lesson.objectives?.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Learning Objectives
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {lesson.objectives.map((obj: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Core Concept & Grammar Notes */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <span>Core Concept & Explanation</span>
                </h3>
                <TextToSpeechButton
                  text={lesson.explanationHtml || lesson.description}
                  size="sm"
                  showSpeedControl
                />
              </div>

              <div
                className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3"
                dangerouslySetInnerHTML={{ __html: lesson.explanationHtml }}
              />

              {lesson.grammarNotes && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <span className="font-bold uppercase tracking-wider block">Grammar Focus:</span>
                  <p>{lesson.grammarNotes}</p>
                </div>
              )}
            </div>

            {/* Key Vocabulary Cards */}
            {vocabList.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Key Vocabulary ({vocabList.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vocabList.map((v: any, idx: number) => {
                    const item = typeof v === 'object' ? v : { word: v };
                    return (
                      <div
                        key={item.id || idx}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-base text-slate-900 dark:text-white">
                                {item.word}
                              </span>
                              {item.phonetic && (
                                <span className="ml-2 text-xs text-slate-400 font-mono">
                                  {item.phonetic}
                                </span>
                              )}
                            </div>
                            <TextToSpeechButton text={item.word} size="sm" showSpeedControl />
                          </div>
                          {(item.allHints?.length > 0 || item.translation) && (
                            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                              {item.allHints ? item.allHints.join(' • ') : item.translation}
                            </p>
                          )}
                          {item.definition && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                              {item.definition}
                            </p>
                          )}
                        </div>
                        {item.exampleSentence && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <p className="text-xs italic text-slate-500 dark:text-slate-400">
                              &ldquo;{item.exampleSentence}&rdquo;
                            </p>
                            <TextToSpeechButton text={item.exampleSentence} size="sm" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Conversational Examples */}
            {lesson.examples?.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                  <span>Real-World Examples & Audio</span>
                </h3>
                <div className="space-y-3">
                  {lesson.examples.map((ex: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          &ldquo;{ex.phrase}&rdquo;
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {ex.translation}
                        </p>
                        {ex.note && (
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300">
                            Tip: {ex.note}
                          </span>
                        )}
                      </div>
                      <TextToSpeechButton text={ex.phrase} size="sm" showSpeedControl />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActivePhase('practice')}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Interactive Practice ({exercises.length} Exercises)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: INTERACTIVE EXERCISES */}
        {activePhase === 'practice' && currentExercise && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>
                Exercise {currentExIndex + 1} of {exercises.length}
              </span>
              <button
                type="button"
                onClick={() => setActivePhase('study')}
                className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
              >
                📖 Review Study Material
              </button>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-900 transition-all duration-300"
                style={{ width: `${Math.round(((currentExIndex + 1) / exercises.length) * 100)}%` }}
              />
            </div>

            <div className="p-6 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300">
                  {currentExercise.type.replace('_', ' ')}
                </span>
                <TextToSpeechButton
                  text={currentExercise.audioText || currentExercise.prompt}
                  size="sm"
                  showSpeedControl
                />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {currentExercise.prompt}
              </h2>

              {/* MULTIPLE CHOICE / FILL BLANK */}
              {(currentExercise.type === 'MULTIPLE_CHOICE' ||
                currentExercise.type === 'FILL_BLANK') && (
                <div className="space-y-2.5">
                  {currentExercise.options.map((opt: string) => {
                    const isSelected = selectedAnswer === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={feedback?.checked}
                        onClick={() => setSelectedAnswer(opt)}
                        className={`w-full p-4 rounded-xl border text-left font-medium text-sm transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-blue-900 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 ring-2 ring-blue-900'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SENTENCE ORDER */}
              {currentExercise.type === 'SENTENCE_ORDER' && (
                <div className="space-y-4">
                  <div className="min-h-[60px] p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap items-center gap-2">
                    {scrambledWordsUsed.length === 0 ? (
                      <span className="text-xs text-slate-400">
                        Click words below in the correct order...
                      </span>
                    ) : (
                      scrambledWordsUsed.map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleWordClick(currentExercise.options[idx], idx)}
                          className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold shadow-2xs cursor-pointer"
                        >
                          {currentExercise.options[idx]}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentExercise.options.map((word: string, idx: number) => {
                      const used = scrambledWordsUsed.includes(idx);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={used || feedback?.checked}
                          onClick={() => handleWordClick(word, idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            used
                              ? 'opacity-30 border-slate-200 bg-slate-100'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-900 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LISTEN TYPE / TRANSLATION */}
              {(currentExercise.type === 'LISTEN_TYPE' ||
                currentExercise.type === 'TRANSLATION') && (
                <div className="space-y-3">
                  <input
                    type="text"
                    disabled={feedback?.checked}
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Type your English response here..."
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              )}

              {/* SPEAK PRACTICE */}
              {currentExercise.type === 'SPEAK_PRACTICE' && (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                  <p className="text-xs text-slate-500">
                    Click the microphone and speak clearly:
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    &ldquo;{currentExercise.correctAnswer}&rdquo;
                  </p>
                  <div className="flex justify-center">
                    <SpeechRecognitionButton
                      expectedText={currentExercise.correctAnswer}
                      onResult={(text, _score, evalObj) => {
                        setSelectedAnswer(text);
                        if (evalObj) setSpeechEval(evalObj);
                      }}
                    />
                  </div>
                  {speechEval && (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-left">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>Pronunciation Score:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                          {speechEval.overallScore}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {speechEval.wordBreakdown.map((wb, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              wb.status === 'correct'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : wb.status === 'close'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {wb.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Banner */}
              {feedback && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-sm">
                      {feedback.isCorrect ? 'Spot On! Correct Answer.' : 'Not Quite Right'}
                    </p>
                    {!feedback.isCorrect && (
                      <p className="font-semibold">
                        Correct Answer:{' '}
                        <span className="underline">{currentExercise.correctAnswer}</span>
                      </p>
                    )}
                    <p className="opacity-90">{feedback.explanation}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                {!feedback?.checked ? (
                  <button
                    type="button"
                    disabled={!selectedAnswer.trim()}
                    onClick={handleCheckAnswer}
                    className="bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleNextExercise}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>
                      {currentExIndex < exercises.length - 1
                        ? 'Next Exercise'
                        : submitting
                        ? 'Saving Progress...'
                        : 'Complete Lesson'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 3: SUMMARY & XP REWARD */}
        {activePhase === 'summary' && (
          <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Lesson Completed!
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {lesson.title}
              </h2>
              <p className="text-slate-500 text-sm">
                You answered {correctCount} out of {exercises.length} exercises accurately.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-black text-blue-900 dark:text-blue-400">
                  {exercises.length > 0
                    ? Math.round((correctCount / exercises.length) * 100)
                    : 100}
                  %
                </div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Accuracy</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  +{xpAwarded}
                </div>
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase">
                  XP Earned
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentExIndex(0);
                  setCorrectCount(0);
                  setMistakes([]);
                  setActivePhase('practice');
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Practice</span>
              </button>
              <Link
                href="/learn"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Return to Learn Path</span>
              </Link>
              <Link
                href="/dashboard"
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
