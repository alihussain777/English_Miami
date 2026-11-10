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
  Sparkles,
  Zap,
  Award,
  Play,
  Gift,
  X,
  Volume2,
  ChevronDown,
  Target,
  Clock,
  Info,
  Mic,
  Globe,
  Brain,
  BookmarkCheck
} from 'lucide-react';
import { UserSession } from '@/types';
import confetti from 'canvas-confetti';
import { playFanfareSound } from '@/lib/audio-feedback';

// Horizontal sine offsets for Duolingo 3D snake path
const SINE_OFFSETS = [
  'translate-x-0',
  'translate-x-10 sm:translate-x-16',
  'translate-x-16 sm:translate-x-26',
  'translate-x-8 sm:translate-x-14',
  'translate-x-0',
  '-translate-x-8 sm:-translate-x-14',
  '-translate-x-16 sm:-translate-x-26',
  '-translate-x-10 sm:-translate-x-16',
];

const UNIT_THEMES = [
  {
    bg: 'from-blue-700 to-blue-900',
    border: 'border-blue-600',
    shadow: 'shadow-[0_6px_0_0_#1e3a8a,0_15px_25px_-5px_rgba(30,58,138,0.35)]',
    badge: 'bg-blue-950/60 border-blue-400/30 text-blue-200',
  },
  {
    bg: 'from-emerald-600 to-teal-800',
    border: 'border-emerald-500',
    shadow: 'shadow-[0_6px_0_0_#065f46,0_15px_25px_-5px_rgba(6,95,70,0.35)]',
    badge: 'bg-emerald-950/60 border-emerald-400/30 text-emerald-200',
  },
  {
    bg: 'from-indigo-600 to-purple-900',
    border: 'border-indigo-500',
    shadow: 'shadow-[0_6px_0_0_#312e81,0_15px_25px_-5px_rgba(49,46,129,0.35)]',
    badge: 'bg-indigo-950/60 border-indigo-400/30 text-indigo-200',
  },
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 bg-grid-pattern">
      <Navbar />

      {/* =====================================================================
          TOP 3D DUOLINGO HUD & LEVEL SWITCHER BAR
         ===================================================================== */}
      <div className="sticky top-18 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Interactive 3D Level Pills + Dropdown */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] uppercase font-black text-slate-400 tracking-wider hidden xl:inline mr-1">
              CEFR Stage:
            </span>
            <div className="flex items-center gap-1.5">
              {levels.map((lvl) => {
                const isActive = selectedLevel === lvl.code;
                return (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => setSelectedLevel(lvl.code)}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-700 text-white shadow-[0_3px_0_0_#1e3a8a] -translate-y-0.5'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{lvl.code}</span>
                    <span className="hidden md:inline font-bold text-[11px] opacity-90">
                      • {lvl.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Gamified Stat Pills: Streak, Gems, Hearts */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-black">
            {/* Streak Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-200 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 shadow-[0_3px_0_0_#fde68a] dark:shadow-[0_3px_0_0_#78350f]"
              title="Daily Learning Streak"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{streakDays}</span>
            </div>

            {/* Gems Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border-2 border-cyan-200 dark:border-cyan-800/80 text-cyan-600 dark:text-cyan-400 shadow-[0_3px_0_0_#a5f3fc] dark:shadow-[0_3px_0_0_#164e63]"
              title="Gems Earned"
            >
              <Gem className="w-4 h-4 fill-cyan-500 text-cyan-500" />
              <span>{gems}</span>
            </div>

            {/* Hearts Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 shadow-[0_3px_0_0_#fecdd3] dark:shadow-[0_3px_0_0_#881337]"
              title="Lives / Hearts (5/5)"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{hearts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          MAIN WORKSPACE: 3D STEPPING STONES PATH + GAMIFIED SIDEBAR
         ===================================================================== */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-10 items-start">
        {/* LEFT / CENTER: THE 3D DUOLINGO SNAKE PATH */}
        <main className="flex-1 w-full flex flex-col items-center max-w-3xl mx-auto space-y-14">
          {loading ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-extrabold text-slate-500">
                Building your 3D learning path...
              </p>
            </div>
          ) : !currentLevelData || !currentLevelData.courses?.length ? (
            <div className="p-12 text-center card-3d w-full">
              <p className="text-slate-500 font-bold">No units found for this level.</p>
            </div>
          ) : (
            currentLevelData.courses.map((unit: any, uIdx: number) => {
              const lessons = unit.lessons || [];
              const theme = UNIT_THEMES[uIdx % UNIT_THEMES.length];

              return (
                <div key={unit.id} className="w-full flex flex-col items-center space-y-8">
                  {/* 3D UNIT HEADER BANNER */}
                  <div
                    className={`w-full rounded-3xl bg-gradient-to-r ${theme.bg} text-white p-6 sm:p-7 border-2 ${theme.border} ${theme.shadow} flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden`}
                  >
                    <div className="space-y-1.5 relative z-10">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border ${theme.badge}`}
                        >
                          {unit.title.includes(':') ? unit.title.split(':')[0] : `Unit ${uIdx + 1}`}
                        </span>
                        <span className="text-xs font-extrabold text-white/80">
                          • Level {unit.levelCode || selectedLevel} • {lessons.length} Interactive Lessons
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        {unit.title.includes(':') ? unit.title.split(':')[1].trim() : unit.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/85 max-w-xl font-medium leading-relaxed">
                        {unit.description}
                      </p>
                    </div>

                    {/* 3D TACTILE GUIDEBOOK BUTTON */}
                    <button
                      type="button"
                      onClick={() => setActiveGuidebook(unit)}
                      className="relative z-10 self-start sm:self-auto flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50 text-xs font-black py-3 px-5 rounded-2xl border-2 border-slate-200 shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                    >
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>UNIT GUIDEBOOK</span>
                    </button>
                  </div>

                  {/* THE 3D STEPPING STONES PATH */}
                  <div className="py-6 flex flex-col items-center space-y-6 w-full relative">
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
                          {/* Connector Trail Line Above Node */}
                          {lIdx > 0 && (
                            <div className="w-1 h-6 border-l-4 border-dashed border-slate-300 dark:border-slate-700 -my-3" />
                          )}

                          <div
                            className={`relative flex flex-col items-center transition-transform duration-300 ${offsetClass}`}
                          >
                            {/* FLOATING 3D ACTIVE TOOLTIP (START +15 XP) */}
                            {isFirstIncomplete && (
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson)}
                                className="absolute -top-13 z-20 flex flex-col items-center animate-bounce cursor-pointer group"
                              >
                                <div className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-black text-xs px-4 py-2 rounded-2xl shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#1e293b] border-2 border-emerald-500 tracking-wide uppercase flex items-center gap-1.5 whitespace-nowrap">
                                  <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                                  <span>STUDY & START +{lesson.xpReward || 15} XP</span>
                                </div>
                                <div className="w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-emerald-500 rotate-45 -mt-1.5" />
                              </button>
                            )}

                            {/* PULSING RING AROUND ACTIVE NODE */}
                            <div className="relative flex items-center justify-center">
                              {isFirstIncomplete && (
                                <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-pulse-ring pointer-events-none" />
                              )}

                              {/* CIRCULAR 3D STEPPING STONE NODE */}
                              {isLocked ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLessonModal(lesson)}
                                  className="relative stone-shine w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 border-4 border-slate-300 dark:border-slate-700 shadow-[0_8px_0_0_#94a3b8,0_12px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_0_0_#1e293b,0_12px_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:-translate-y-1 active:translate-y-1 transition-all cursor-pointer"
                                  title="Tap to preview lesson study material & audio"
                                >
                                  <Lock className="w-7 h-7" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenLessonModal(lesson)}
                                  className={`relative stone-shine w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-150 transform hover:-translate-y-1 active:translate-y-1.5 cursor-pointer ${
                                    isCompleted
                                      ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-200 text-white shadow-[0_8px_0_0_#b45309,0_14px_24px_rgba(217,119,6,0.35)]'
                                      : 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-emerald-300 text-white shadow-[0_8px_0_0_#047857,0_14px_24px_rgba(5,150,105,0.4)]'
                                  }`}
                                  title="Tap to open lesson study material, audio & practice"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-10 h-10 fill-white text-amber-500 drop-shadow-xs" />
                                  ) : (
                                    <Star className="w-10 h-10 fill-white text-white drop-shadow-xs" />
                                  )}
                                </button>
                              )}
                            </div>

                            {/* 3D Lesson Pill Label & Study Indicator */}
                            <button
                              type="button"
                              onClick={() => handleOpenLessonModal(lesson)}
                              className="mt-3 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b] hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col items-center max-w-[190px]"
                            >
                              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate w-full text-center">
                                {lesson.title}
                              </span>
                              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                                <BookOpen className="w-3 h-3" />
                                <span>Theory • Audio • Quiz</span>
                              </span>
                            </button>
                          </div>

                          {/* OPTIONAL 3D MYSTERY CHEST MILESTONE */}
                          {showChest && (
                            <div className="relative flex flex-col items-center my-2 translate-x-6">
                              <button
                                type="button"
                                onClick={() => handleOpenChest(chestId)}
                                className={`stone-shine w-16 h-16 rounded-2xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                                  isChestOpened
                                    ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 shadow-[0_4px_0_0_#94a3b8]'
                                    : 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-300 text-slate-950 shadow-[0_6px_0_0_#b45309] hover:-translate-y-1 active:translate-y-1 animate-float-slow'
                                }`}
                                title={isChestOpened ? 'Chest opened' : 'Tap to open mystery chest!'}
                              >
                                <Gift className="w-8 h-8" />
                              </button>
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1.5">
                                {isChestOpened ? 'Opened' : '🎁 +30 Gems'}
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {/* FINAL 3D UNIT TROPHY STEPPING STONE */}
                    <div className="w-1 h-6 border-l-4 border-dashed border-slate-300 dark:border-slate-700 -my-2" />
                    <div className="relative flex flex-col items-center pt-2">
                      <div className="stone-shine w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-blue-700 to-blue-950 border-4 border-blue-500 text-amber-300 shadow-[0_8px_0_0_#172554,0_15px_25px_rgba(30,58,138,0.4)] flex items-center justify-center">
                        <Trophy className="w-11 h-11 fill-amber-300 text-amber-400 drop-shadow-sm" />
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-3 px-3 py-1 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300">
                        🏆 Unit {uIdx + 1} Mastery Trophy
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* RIGHT SIDEBAR: 3D DAILY QUESTS & LEADERBOARD */}
        <aside className="w-full lg:w-84 space-y-6 shrink-0 lg:sticky lg:top-36">
          {/* 3D Tip Card: How to view A0 Learning Material */}
          <div className="card-3d p-5 bg-gradient-to-br from-emerald-50 to-teal-50/70 dark:from-emerald-950/40 dark:to-slate-900 border-2 border-emerald-300 dark:border-emerald-800/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-emerald-500 text-emerald-600" />
              <span>Interactive Study Tip</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              Tap <strong>any 3D circle stone</strong> on the path to open its full <strong>Phonics Theory, Audio Flashcards & Urdu/Spanish Translations</strong> before starting the quiz!
            </p>
          </div>

          {/* 3D Daily Quests Card */}
          <div className="card-3d p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Daily Quests</span>
              </h3>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                Resets in 6h
              </span>
            </div>

            <div className="space-y-4">
              {/* Quest 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700 dark:text-slate-200">⚡ Earn 50 XP today</span>
                  <span className="text-amber-600 dark:text-amber-400">30 / 50</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full w-3/5" />
                </div>
              </div>

              {/* Quest 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700 dark:text-slate-200">🎯 Complete 2 lessons</span>
                  <span className="text-blue-600 dark:text-blue-400">1 / 2</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-1/2" />
                </div>
              </div>

              {/* Quest 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700 dark:text-slate-200">🔊 Listen to 5 audio cards</span>
                  <span className="text-emerald-600 dark:text-emerald-400">3 / 5</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full w-3/5" />
                </div>
              </div>
            </div>
          </div>

          {/* 3D Emerald League Leaderboard Card */}
          <div className="card-3d p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Emerald League</span>
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Top 3 Advance
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900/50">
                <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Sofia Rodriguez 🇪🇸</span>
                </div>
                <span className="font-black text-amber-700 dark:text-amber-400">1,420 XP</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-[10px] font-black">
                    2
                  </span>
                  <span>Muhammad Ali 🇵🇰</span>
                </div>
                <span className="font-extrabold text-slate-600 dark:text-slate-400">1,150 XP</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-300 flex items-center justify-center text-[10px] font-black">
                    3
                  </span>
                  <span>Priya Sharma 🇮🇳</span>
                </div>
                <span className="font-extrabold text-slate-600 dark:text-slate-400">980 XP</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 font-black">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>You ({session?.name?.split(' ')[0] || 'Learner'})</span>
                </div>
                <span className="font-black text-blue-900 dark:text-blue-300">890 XP</span>
              </div>
            </div>
          </div>

          {/* 3D Practice Studios Grid */}
          <div className="card-3d p-6 space-y-3 text-xs">
            <h4 className="font-black text-sm text-slate-900 dark:text-white">
              3D Practice Studios
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/speaking"
                className="btn-3d-secondary p-3 rounded-xl font-extrabold text-center flex flex-col items-center gap-1.5"
              >
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Speaking Lab</span>
              </Link>
              <Link
                href="/reading"
                className="btn-3d-secondary p-3 rounded-xl font-extrabold text-center flex flex-col items-center gap-1.5"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Wikipedia Lab</span>
              </Link>
              <Link
                href="/vocabulary"
                className="btn-3d-secondary p-3 rounded-xl font-extrabold text-center flex flex-col items-center gap-1.5"
              >
                <BookmarkCheck className="w-4 h-4 text-amber-500" />
                <span>SRS Vocab</span>
              </Link>
              <Link
                href="/ai-coach"
                className="btn-3d-secondary p-3 rounded-xl font-extrabold text-center flex flex-col items-center gap-1.5"
              >
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>AI Coach</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 3D DUOLINGO LESSON PREVIEW & FULL STUDY MATERIAL MODAL                 */}
      {/* ========================================================================= */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="card-3d w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b-2 border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-blue-700 text-white shadow-[0_2px_0_0_#1e3a8a]">
                    Level {selectedLevel}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedLessonModal.durationMinutes || 15} Mins</span>
                  </span>
                  <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    <span>+{selectedLessonModal.xpReward || 15} XP</span>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedLessonModal.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {selectedLessonModal.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal 3D Tabs */}
            <div className="flex items-center border-b-2 border-slate-100 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 text-xs font-extrabold gap-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab('theory')}
                className={`py-3.5 border-b-3 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'theory'
                    ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>1. Theory & Phonics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('vocab')}
                className={`py-3.5 border-b-3 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'vocab'
                    ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>2. Vocabulary & Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('examples')}
                className={`py-3.5 border-b-3 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalTab === 'examples'
                    ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>3. Conversational Phrases</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {loadingLessonDetail ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-9 h-9 border-3 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold">Loading lesson learning material...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: THEORY & PHONICS */}
                  {activeModalTab === 'theory' && (
                    <div className="space-y-5">
                      {/* Learning Objectives */}
                      {lessonDetail?.objectives?.length > 0 && (
                        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border-2 border-blue-200/80 dark:border-blue-900/60 space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 block">
                            🎯 What You Will Master in this Lesson:
                          </span>
                          <ul className="space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {lessonDetail.objectives.map((obj: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Explanation HTML */}
                      <div className="space-y-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                          📖 Lesson Material & Phonics Explanation:
                        </span>
                        {lessonDetail?.explanationHtml ? (
                          <div
                            className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800"
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
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 space-y-1.5 text-xs">
                          <span className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                            💡 Grammar Tip:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {lessonDetail.grammarNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: VOCABULARY & AUDIO */}
                  {activeModalTab === 'vocab' && (
                    <div className="space-y-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                        🔊 Core Vocabulary (Tap Speaker for Native Audio):
                      </span>

                      {lessonDetail?.vocabularyWords?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {lessonDetail.vocabularyWords.map((v: any, idx: number) => {
                            const wordObj = typeof v === 'object' ? v : { word: v };
                            return (
                              <div
                                key={idx}
                                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-start justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-base text-slate-900 dark:text-white">
                                      {wordObj.word}
                                    </span>
                                    {wordObj.phonetic && (
                                      <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                                        {wordObj.phonetic}
                                      </span>
                                    )}
                                  </div>
                                  {wordObj.translation && (
                                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                      {wordObj.translation}
                                    </p>
                                  )}
                                  {wordObj.definition && (
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
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
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                        💬 Conversational Phrases & Audio Pronunciation:
                      </span>

                      {lessonDetail?.examples?.length > 0 ? (
                        <div className="space-y-3">
                          {lessonDetail.examples.map((ex: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b] flex items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <p className="font-black text-sm text-slate-900 dark:text-white">
                                  "{ex.phrase}"
                                </p>
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                  {ex.translation}
                                </p>
                                {ex.note && (
                                  <span className="inline-block text-[10px] font-extrabold text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
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
            <div className="p-5 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/lessons/${selectedLessonModal.slug}`}
                className="w-full sm:flex-1 py-4 rounded-2xl btn-3d-emerald font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START DUOLINGO PRACTICE (+{selectedLessonModal.xpReward || 15} XP)</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedLessonModal(null)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl btn-3d-secondary text-xs font-extrabold cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card-3d w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-blue-700 dark:text-blue-400 tracking-wider">
                  Unit Guidebook & Cheat Sheet
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {activeGuidebook.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Essential phrases, vocabulary, and phonetic rules for this unit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuidebook(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Key Conversational Phrases */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Key Conversational Phrases (with Audio)</span>
                </h4>
                <div className="space-y-2.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">"A is for Apple, B is for Book."</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">A de Manzana, B de Libro / اے سے ایپل، بی سے بک</p>
                    </div>
                    <TextToSpeechButton text="A is for Apple, B is for Book." size="sm" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">"Hello! Good morning, how are you?"</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">¡Buenos días! ¿Cómo estás? / صبح بخیر، آپ کیسے ہیں؟</p>
                    </div>
                    <TextToSpeechButton text="Hello! Good morning, how are you?" size="sm" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">"My name is Sofia. Nice to meet you."</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Mucho gusto / آپ سے مل کر خوشی ہوئی</p>
                    </div>
                    <TextToSpeechButton text="My name is Sofia. Nice to meet you." size="sm" />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">"Have a nice day! Goodbye."</p>
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">¡Que tengas un buen día! / آپ کا دن اچھا گزرے، خدا حافظ</p>
                    </div>
                    <TextToSpeechButton text="Have a nice day! Goodbye." size="sm" />
                  </div>
                </div>
              </div>

              {/* Grammar & Phonics Rules */}
              <div className="space-y-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>Grammar & Phonics Rules</span>
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed font-medium">
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

            <div className="pt-4 border-t-2 border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveGuidebook(null)}
                className="btn-3d-primary text-xs py-3 px-6 rounded-xl cursor-pointer"
              >
                Close Guidebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MYSTERY CHEST REWARD MODAL */}
      {chestModalReward && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-3d w-full max-w-sm p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto shadow-[0_4px_0_0_#fde68a]">
              <Gift className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Bonus Chest Unlocked!
            </h3>
            <p className="text-xs font-medium text-slate-500">
              You unlocked an exploratory milestone on the 3D learning path.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-black px-4 py-2 rounded-xl border-2 border-amber-200 dark:border-amber-900">
              <Gem className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span>+{chestModalReward} Gems Awarded!</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setChestModalReward(null)}
                className="w-full btn-3d-primary text-xs py-3.5 rounded-xl cursor-pointer"
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
