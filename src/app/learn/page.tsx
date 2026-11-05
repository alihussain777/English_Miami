'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Star,
  Trophy,
  Flame,
  Gem,
  Heart,
  ChevronRight,
  Sparkles,
  Zap,
  Award,
  Play,
  RotateCcw,
  Gift,
  HelpCircle,
  X,
  Volume2,
  ChevronDown,
  Target,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { UserSession } from '@/types';
import confetti from 'canvas-confetti';
import { playSuccessSound, playFanfareSound } from '@/lib/audio-feedback';

// Horizontal sine offsets for Duolingo snake path
const SINE_OFFSETS = [
  'translate-x-0',
  'translate-x-12 sm:translate-x-16',
  'translate-x-20 sm:translate-x-28',
  'translate-x-10 sm:translate-x-14',
  'translate-x-0',
  '-translate-x-10 sm:-translate-x-14',
  '-translate-x-20 sm:-translate-x-28',
  '-translate-x-12 sm:-translate-x-16',
];

export default function DuolingoLearnPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('A0');
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Duolingo stats
  const [streakDays, setStreakDays] = useState(9);
  const [gems, setGems] = useState(480);
  const [hearts, setHearts] = useState(5);

  // Guidebook modal state
  const [activeGuidebook, setActiveGuidebook] = useState<any | null>(null);

  // Chest opened state
  const [openedChests, setOpenedChests] = useState<Record<string, boolean>>({});
  const [chestModalReward, setChestModalReward] = useState<number | null>(null);

  // LESSON PREVIEW & STUDY MODAL
  const [selectedLessonModal, setSelectedLessonModal] = useState<any | null>(null);
  const [lessonDetail, setLessonDetail] = useState<any | null>(null);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'theory' | 'vocab' | 'examples'>('theory');

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([courseData, authData]) => {
        const lvls = courseData.levels || [];
        setLevels(lvls);

        if (authData.authenticated && authData.user) {
          const userLvl = authData.user.profile?.currentLevel || 'A0';
          setSelectedLevel(userLvl);
          setSession({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            role: authData.user.role,
            currentLevel: userLvl,
            plan: authData.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
          if (authData.user.streak?.currentStreak) {
            setStreakDays(authData.user.streak.currentStreak);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const currentLevelData = levels.find((l) => l.code === selectedLevel) || levels[0];

  const handleOpenChest = (chestId: string) => {
    if (openedChests[chestId]) return;
    setOpenedChests((prev) => ({ ...prev, [chestId]: true }));
    setGems((prev) => prev + 30);
    setChestModalReward(30);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    playFanfareSound();
  };

  const handleOpenLessonModal = async (lesson: any) => {
    setSelectedLessonModal(lesson);
    setActiveModalTab('theory');
    setLoadingLessonDetail(true);
    setLessonDetail(null);

    try {
      const res = await fetch(`/api/lessons/${lesson.slug}`);
      const data = await res.json();
      if (data.lesson) {
        setLessonDetail(data.lesson);
      }
    } catch (err) {
      console.error('Failed to load lesson detail:', err);
    } finally {
      setLoadingLessonDetail(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Navbar />

      {/* TOP DUOLINGO STATS BAR */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Level / Section Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider hidden sm:inline">
              Section:
            </span>
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Select CEFR Level"
                className="appearance-none bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-900 dark:text-white py-2 pl-3.5 pr-8 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {levels.map((lvl) => (
                  <option key={lvl.code} value={lvl.code}>
                    {lvl.code}: {lvl.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Gamified counters: Streak, Gems, Hearts */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm font-extrabold">
            {/* Streak */}
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400" title="Daily Learning Streak">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streakDays}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400" title="Lingots / Gems Earned">
              <Gem className="w-5 h-5 fill-cyan-500 text-cyan-500" />
              <span>{gems}</span>
            </div>

            {/* Hearts */}
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400" title="Lives / Hearts (5/5)">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              <span>{hearts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT / CENTER: THE DUOLINGO SNAKE PATH */}
        <main className="flex-1 w-full flex flex-col items-center max-w-3xl mx-auto space-y-12">
          {loading ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-500">Loading your Duolingo learning path...</p>
            </div>
          ) : !currentLevelData || !currentLevelData.courses?.length ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500">No units found for this section yet.</p>
            </div>
          ) : (
            currentLevelData.courses.map((unit: any, uIdx: number) => {
              const lessons = unit.lessons || [];

              return (
                <div key={unit.id} className="w-full flex flex-col items-center space-y-6">
                  {/* UNIT HEADER BANNER */}
                  <div className="w-full rounded-2xl bg-blue-900 text-white p-5 sm:p-6 shadow-sm border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                          {unit.title.includes(':') ? unit.title.split(':')[0] : `Unit ${uIdx + 1}`}
                        </span>
                        <span className="text-xs text-blue-200">
                          Level {unit.levelCode || selectedLevel}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {unit.title.includes(':') ? unit.title.split(':')[1].trim() : unit.title}
                      </h2>
                      <p className="text-xs text-blue-100 max-w-lg">
                        {unit.description}
                      </p>
                    </div>

                    {/* GUIDEBOOK BUTTON */}
                    <button
                      type="button"
                      onClick={() => setActiveGuidebook(unit)}
                      className="self-start sm:self-auto flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-blue-200" />
                      <span>UNIT GUIDEBOOK</span>
                    </button>
                  </div>

                  {/* THE STEPPING STONES PATH */}
                  <div className="py-6 flex flex-col items-center space-y-6 sm:space-y-8 w-full">
                    {lessons.map((lesson: any, lIdx: number) => {
                      const isCompleted = lesson.isCompleted;
                      const isFirstIncomplete =
                        !isCompleted &&
                        (lIdx === 0 || lessons[lIdx - 1]?.isCompleted);
                      const isLocked = !isCompleted && !isFirstIncomplete;

                      const offsetClass = SINE_OFFSETS[lIdx % SINE_OFFSETS.length];

                      // Periodic mystery chest after lesson 2
                      const showChest = lIdx === 2;
                      const chestId = `chest-${unit.id}-${lIdx}`;
                      const isChestOpened = openedChests[chestId];

                      return (
                        <React.Fragment key={lesson.id}>
                          <div className={`relative flex flex-col items-center transition-transform ${offsetClass}`}>
                            {/* FLOATING ACTIVE TOOLTIP (START +15 XP) */}
                            {isFirstIncomplete && (
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson)}
                                className="absolute -top-12 z-20 flex flex-col items-center animate-bounce cursor-pointer group"
                              >
                                <div className="bg-emerald-600 group-hover:bg-emerald-500 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-400 tracking-wide uppercase flex items-center gap-1.5 whitespace-nowrap">
                                  <Play className="w-3 h-3 fill-white" />
                                  <span>START +{lesson.xpReward || 15} XP</span>
                                </div>
                                <div className="w-2.5 h-2.5 bg-emerald-600 rotate-45 -mt-1.5" />
                              </button>
                            )}

                            {/* CIRCULAR 3D STEPPING STONE NODE */}
                            {isLocked ? (
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson)}
                                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-slate-300 dark:border-slate-700 shadow-[0_6px_0_0_#94a3b8] dark:shadow-[0_6px_0_0_#334155] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                title="Click to preview lesson study material"
                              >
                                <Lock className="w-7 h-7" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson)}
                                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-150 transform active:translate-y-1 cursor-pointer ${
                                  isCompleted
                                    ? 'bg-amber-400 hover:bg-amber-300 border-4 border-amber-300 text-white shadow-[0_6px_0_0_#d97706]'
                                    : 'bg-emerald-600 hover:bg-emerald-500 border-4 border-emerald-400 text-white shadow-[0_6px_0_0_#047857]'
                                }`}
                                title="Click to view lesson learning material & practice"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-9 h-9 fill-white text-amber-500" />
                                ) : (
                                  <Star className="w-9 h-9 fill-white text-emerald-600" />
                                )}
                              </button>
                            )}

                            {/* Lesson Subtitle / Label */}
                            <button
                              type="button"
                              onClick={() => handleOpenLessonModal(lesson)}
                              className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-300 max-w-[130px] text-center truncate cursor-pointer transition-colors"
                            >
                              {lesson.title}
                            </button>
                          </div>

                          {/* OPTIONAL MYSTERY CHEST MILESTONE */}
                          {showChest && (
                            <div className="relative flex flex-col items-center my-2 translate-x-4">
                              <button
                                type="button"
                                onClick={() => handleOpenChest(chestId)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                                  isChestOpened
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                    : 'bg-amber-500 hover:bg-amber-400 text-white animate-pulse'
                                }`}
                                title={isChestOpened ? 'Chest opened' : 'Tap to open mystery chest!'}
                              >
                                <Gift className="w-7 h-7" />
                              </button>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">
                                {isChestOpened ? 'Opened' : '+30 Gems'}
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* FINAL UNIT TROPHY STEPPING STONE */}
                    <div className="relative flex flex-col items-center pt-2">
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-blue-900 border-4 border-blue-700 text-amber-300 shadow-[0_6px_0_0_#1e3a8a] flex items-center justify-center">
                        <Trophy className="w-10 h-10 fill-amber-300 text-blue-900" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
                        Unit {uIdx + 1} Mastery Trophy
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* RIGHT SIDEBAR: DAILY QUESTS & LEADERBOARD */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0">
          {/* Daily Quests Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Daily Quests</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">Resets in 6h</span>
            </div>

            <div className="space-y-3">
              {/* Quest 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Earn 50 XP today</span>
                  <span className="text-slate-400">30 / 50</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-3/5" />
                </div>
              </div>

              {/* Quest 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Complete 2 lessons</span>
                  <span className="text-slate-400">1 / 2</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-700 rounded-full w-1/2" />
                </div>
              </div>

              {/* Quest 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Practice speaking lines</span>
                  <span className="text-slate-400">3 / 5</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-3/5" />
                </div>
              </div>
            </div>
          </div>

          {/* Emerald League Leaderboard Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Emerald League</span>
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                Top 3 Advance
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span className="text-amber-600">1.</span>
                  <span>Sofia Rodriguez 🇪🇸</span>
                </div>
                <span className="font-extrabold text-amber-700 dark:text-amber-400">1,420 XP</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">2.</span>
                  <span>Muhammad Ali 🇵🇰</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-400">1,150 XP</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">3.</span>
                  <span>Priya Sharma 🇮🇳</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-400">980 XP</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 font-bold">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                  <span>4.</span>
                  <span>You (Learner)</span>
                </div>
                <span className="font-extrabold text-blue-900 dark:text-blue-300">890 XP</span>
              </div>
            </div>
          </div>

          {/* Quick Practice Labs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Dedicated Practice Labs</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/speaking" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-center block">
                🎙️ Speaking Studio
              </Link>
              <Link href="/reading" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-center block">
                📖 Wikipedia Lab
              </Link>
              <Link href="/vocabulary" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-center block">
                🧠 SRS Vocab Bank
              </Link>
              <Link href="/ai-coach" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-center block">
                🤖 AI Coach
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 DUOLINGO LESSON PREVIEW & FULL STUDY MATERIAL MODAL                    */}
      {/* ========================================================================= */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    Level {selectedLevel}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedLessonModal.durationMinutes || 15} Mins</span>
                  </span>
                  <span className="text-xs font-extrabold text-amber-500 flex items-center gap-0.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    <span>+{selectedLessonModal.xpReward || 15} XP</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedLessonModal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedLessonModal.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 text-xs font-bold gap-6">
              <button
                type="button"
                onClick={() => setActiveModalTab('theory')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                  activeModalTab === 'theory'
                    ? 'border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Theory & Phonics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('vocab')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                  activeModalTab === 'vocab'
                    ? 'border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Vocabulary & Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('examples')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                  activeModalTab === 'examples'
                    ? 'border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Conversational Phrases</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {loadingLessonDetail ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">Loading lesson learning material...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: THEORY & PHONICS */}
                  {activeModalTab === 'theory' && (
                    <div className="space-y-5">
                      {/* Learning Objectives */}
                      {lessonDetail?.objectives?.length > 0 && (
                        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 block">
                            🎯 What You Will Master in this Lesson:
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                            {lessonDetail.objectives.map((obj: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Explanation HTML */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Lesson Material & Explanation:
                        </span>
                        {lessonDetail?.explanationHtml ? (
                          <div
                            className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
                            dangerouslySetInnerHTML={{ __html: lessonDetail.explanationHtml }}
                          />
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Comprehensive foundational phonics and English rules for this milestone.
                          </p>
                        )}
                      </div>

                      {/* Grammar Notes */}
                      {lessonDetail?.grammarNotes && (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1.5 text-xs">
                          <span className="font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                            💡 Grammar Tip:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {lessonDetail.grammarNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: VOCABULARY & AUDIO */}
                  {activeModalTab === 'vocab' && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Core Vocabulary Introduced in this Lesson:
                      </span>

                      {lessonDetail?.vocabularyWords?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {lessonDetail.vocabularyWords.map((v: any, idx: number) => {
                            const wordObj = typeof v === 'object' ? v : { word: v };
                            return (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-start justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-base text-slate-900 dark:text-white">
                                      {wordObj.word}
                                    </span>
                                    {wordObj.phonetic && (
                                      <span className="text-xs font-mono text-blue-900 dark:text-blue-300">
                                        {wordObj.phonetic}
                                      </span>
                                    )}
                                  </div>
                                  {wordObj.translation && (
                                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                      {wordObj.translation}
                                    </p>
                                  )}
                                  {wordObj.definition && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                                      {wordObj.definition}
                                    </p>
                                  )}
                                </div>

                                <TextToSpeechButton text={wordObj.word} size="sm" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Vocabulary items will appear during practice.</p>
                      )}
                    </div>
                  )}

                  {/* TAB 3: CONVERSATIONAL EXAMPLES */}
                  {activeModalTab === 'examples' && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Conversational Phrases & Audio Pronunciation:
                      </span>

                      {lessonDetail?.examples?.length > 0 ? (
                        <div className="space-y-3">
                          {lessonDetail.examples.map((ex: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">
                                  "{ex.phrase}"
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {ex.translation}
                                </p>
                                {ex.note && (
                                  <span className="inline-block text-[10px] font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                                    Tip: {ex.note}
                                  </span>
                                )}
                              </div>

                              <TextToSpeechButton text={ex.phrase} size="sm" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Phrases will be practiced in interactive challenges.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/lessons/${selectedLessonModal.slug}`}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_5px_0_0_#047857] hover:shadow-[0_2px_0_0_#047857] hover:translate-y-0.5 transition-all text-center"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START DUOLINGO PRACTICE (+{selectedLessonModal.xpReward || 15} XP)</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📘 REAL UNIT GUIDEBOOK & CHEAT SHEET MODAL                                */}
      {/* ========================================================================= */}
      {activeGuidebook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-blue-900 dark:text-blue-400 tracking-wider">
                  Unit Guidebook & Cheat Sheet
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {activeGuidebook.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Essential phrases, vocabulary, and phonetic rules for this unit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuidebook(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Key Conversational Phrases */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                  <span>Key Conversational Phrases (with Audio)</span>
                </h4>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">"A is for Apple, B is for Book."</p>
                      <p className="text-xs text-slate-500">A de Manzana, B de Libro / اے سے ایپل، بی سے بک</p>
                    </div>
                    <TextToSpeechButton text="A is for Apple, B is for Book." size="sm" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">"Hello! Good morning, how are you?"</p>
                      <p className="text-xs text-slate-500">¡Buenos días! ¿Cómo estás? / صبح بخیر، آپ کیسے ہیں؟</p>
                    </div>
                    <TextToSpeechButton text="Hello! Good morning, how are you?" size="sm" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">"My name is Sofia. Nice to meet you."</p>
                      <p className="text-xs text-slate-500">Mucho gusto / آپ سے مل کر خوشی ہوئی</p>
                    </div>
                    <TextToSpeechButton text="My name is Sofia. Nice to meet you." size="sm" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">"Have a nice day! Goodbye."</p>
                      <p className="text-xs text-slate-500">¡Que tengas un buen día! / آپ کا دن اچھا گزرے، خدا حافظ</p>
                    </div>
                    <TextToSpeechButton text="Have a nice day! Goodbye." size="sm" />
                  </div>
                </div>
              </div>

              {/* Grammar & Phonics Rules */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>Grammar & Phonics Rules</span>
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>1. 5 Vowels vs 21 Consonants:</strong> In English, every word must contain a vowel sound (A, E, I, O, U).
                  </p>
                  <p>
                    <strong>2. Time-Based Greetings:</strong> Use <em>"Good morning"</em> before 12:00 PM, <em>"Good afternoon"</em> between 12:00 PM and 6:00 PM, and <em>"Good evening"</em> after 6:00 PM. Note that <em>"Good night"</em> is only used when parting at night or going to bed!
                  </p>
                  <p>
                    <strong>3. Word Order:</strong> Adjectives always come <em>before</em> the noun (e.g. <em>"a red apple"</em>, not <em>"an apple red"</em>).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveGuidebook(null)}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                Close Guidebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MYSTERY CHEST REWARD MODAL */}
      {chestModalReward && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto">
              <Gift className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Bonus Chest Unlocked!
            </h3>
            <p className="text-xs text-slate-500">
              You unlocked an exploratory milestone on the learning path.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-900">
              <Gem className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span>+{chestModalReward} Gems Awarded!</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setChestModalReward(null)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                CLAIM & CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
