'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DuolingoPracticeModal from '@/components/DuolingoPracticeModal';
import {
  BookOpen,
  CheckCircle2,
  Star,
  Trophy,
  Flame,
  Gem,
  Heart,
  Sparkles,
  Zap,
  Play,
  Gift,
  X,
  Volume2,
  Clock,
  Info,
  Languages,
  LayoutDashboard,
} from 'lucide-react';
import { UserSession } from '@/types';
import confetti from 'canvas-confetti';
import { playFanfareSound } from '@/lib/audio-feedback';
import {
  DUOLINGO_BASE_LANGUAGES,
  getBaseLanguageInfo,
} from '@/lib/duolingo-languages';
import {
  buildDuolingoCurriculum,
  DuolingoGeneratedUnit,
  DuolingoGeneratedLesson,
} from '@/lib/duolingo-curriculum';
import { speakRealisticText } from '@/lib/voice-engine';

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
    bg: 'from-emerald-600 to-teal-800',
    border: 'border-emerald-500',
    shadow: 'shadow-[0_6px_0_0_#065f46,0_15px_25px_-5px_rgba(6,95,70,0.35)]',
    badge: 'bg-emerald-950/60 border-emerald-400/30 text-emerald-200',
  },
  {
    bg: 'from-blue-700 to-blue-900',
    border: 'border-blue-600',
    shadow: 'shadow-[0_6px_0_0_#1e3a8a,0_15px_25px_-5px_rgba(30,58,138,0.35)]',
    badge: 'bg-blue-950/60 border-blue-400/30 text-blue-200',
  },
  {
    bg: 'from-indigo-600 to-purple-900',
    border: 'border-indigo-500',
    shadow: 'shadow-[0_6px_0_0_#312e81,0_15px_25px_-5px_rgba(49,46,129,0.35)]',
    badge: 'bg-indigo-950/60 border-indigo-400/30 text-indigo-200',
  },
  {
    bg: 'from-amber-600 to-orange-800',
    border: 'border-amber-500',
    shadow: 'shadow-[0_6px_0_0_#92400e,0_15px_25px_-5px_rgba(146,64,14,0.35)]',
    badge: 'bg-amber-950/60 border-amber-400/30 text-amber-200',
  },
];

export default function DuolingoLearnPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('A0');
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [baseLang, setBaseLang] = useState<string>('hi');
  const [duolingoUnits, setDuolingoUnits] = useState<DuolingoGeneratedUnit[]>([]);
  const [loadingDuolingo, setLoadingDuolingo] = useState<boolean>(true);
  const [completedDuoSlugs, setCompletedDuoSlugs] = useState<string[]>([]);
  const [showAllLangPicker, setShowAllLangPicker] = useState(false);

  const [activePracticeLesson, setActivePracticeLesson] =
    useState<DuolingoGeneratedLesson | null>(null);

  const [streakDays, setStreakDays] = useState(9);
  const [gems, setGems] = useState(480);
  const [hearts, setHearts] = useState(5);

  const [activeGuidebook, setActiveGuidebook] = useState<any | null>(null);
  const [openedChests, setOpenedChests] = useState<Record<string, boolean>>({});
  const [chestModalReward, setChestModalReward] = useState<number | null>(null);

  // LESSON PREVIEW & STUDY MODAL
  const [selectedLessonModal, setSelectedLessonModal] = useState<any | null>(null);
  const [lessonDetail, setLessonDetail] = useState<any | null>(null);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'theory' | 'vocab' | 'examples'>('theory');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('tici_base_lang');
      if (savedLang) setBaseLang(savedLang);
      const savedDone = localStorage.getItem('tici_completed_duolingo_lessons');
      if (savedDone) setCompletedDuoSlugs(JSON.parse(savedDone));
    } catch {}

    const onLangChange = (e: any) => {
      if (e?.detail?.lang) setBaseLang(e.detail.lang);
    };
    window.addEventListener('tici-lang-change', onLangChange);
    return () => window.removeEventListener('tici-lang-change', onLangChange);
  }, []);

  useEffect(() => {
    setLoadingDuolingo(true);
    fetch(`/data/duolingo/english_from_${baseLang}.json`)
      .then((r) => r.json())
      .then((rawJson) => {
        const units = buildDuolingoCurriculum(baseLang, rawJson, completedDuoSlugs);
        setDuolingoUnits(units);
        setLoadingDuolingo(false);
      })
      .catch((err) => {
        console.error('Failed to load Duolingo dataset:', err);
        setLoadingDuolingo(false);
      });
  }, [baseLang, completedDuoSlugs]);

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
          if (authData.user.profile?.nativeLanguage) {
            const code = authData.user.profile.nativeLanguage.toLowerCase().slice(0, 2);
            const matched = DUOLINGO_BASE_LANGUAGES.find(
              (l) =>
                l.code === code ||
                l.name.toLowerCase() === authData.user.profile.nativeLanguage.toLowerCase()
            );
            if (matched && !localStorage.getItem('tici_base_lang')) {
              setBaseLang(matched.code);
              localStorage.setItem('tici_base_lang', matched.code);
            }
          }
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

  const handleSelectBaseLang = (code: string) => {
    setBaseLang(code);
    setShowAllLangPicker(false);
    try {
      localStorage.setItem('tici_base_lang', code);
      window.dispatchEvent(
        new CustomEvent('tici-lang-change', { detail: { lang: code } })
      );
    } catch {}
  };

  const playAudioUrlOrTts = (url?: string, text?: string, rate: number = 0.95) => {
    speakRealisticText(text || '', {
      rate,
      audioUrl: url,
      preferBrowserTTS: true,
    });
  };

  const handleCompleteDuolingoLesson = (slug: string, xpEarned: number) => {
    setGems((g) => g + xpEarned);
    if (!completedDuoSlugs.includes(slug)) {
      const next = [...completedDuoSlugs, slug];
      setCompletedDuoSlugs(next);
      try {
        localStorage.setItem('tici_completed_duolingo_lessons', JSON.stringify(next));
      } catch {}
    }
  };

  const activeLangInfo = getBaseLanguageInfo(baseLang);
  const currentLevelData = levels.find((l) => l.code === selectedLevel) || levels[0];

  const combinedUnits =
    selectedLevel === 'A0'
      ? [...duolingoUnits, ...(currentLevelData?.courses || [])]
      : currentLevelData?.courses || [];

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

    if (lesson.isDuolingoNativeLesson) {
      setLessonDetail(lesson);
      setLoadingLessonDetail(false);
      return;
    }

    setLoadingLessonDetail(true);
    setLessonDetail(null);

    try {
      const res = await fetch(`/api/lessons/${lesson.slug || lesson.id}`);
      const data = await res.json();
      if (data.lesson) {
        setLessonDetail(data.lesson);
      } else {
        setLessonDetail(lesson);
      }
    } catch (err) {
      console.error('Failed to load lesson detail:', err);
      setLessonDetail(lesson);
    } finally {
      setLoadingLessonDetail(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 bg-grid-pattern">
      <Navbar />

      {/* TOP HUD: NATIVE LANGUAGE SELECTOR + CEFR LEVEL BAR */}
      <div className="sticky top-18 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-3 space-y-2.5">
          {/* Row 1: Native Language Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <Languages className="w-4 h-4" />
                <span>Teach Me From:</span>
              </span>

              {DUOLINGO_BASE_LANGUAGES.slice(0, 8).map((lang) => {
                const isSelected = lang.code === baseLang;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectBaseLang(lang.code)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowAllLangPicker(!showAllLangPicker)}
                className="px-3 py-1 rounded-xl text-xs font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 cursor-pointer shrink-0"
              >
                + All 23 Languages
              </button>
            </div>

            {/* Gamified Stat Pills + Quick Dashboard Link */}
            <div className="flex items-center gap-2 text-xs font-black">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                title="Open My Learning Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400"
                title="Daily Learning Streak"
              >
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{streakDays}</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400"
                title="Gems Earned"
              >
                <Gem className="w-4 h-4 fill-cyan-500 text-cyan-500" />
                <span>{gems}</span>
              </div>

              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
                title="Hearts"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{hearts}</span>
              </div>
            </div>
          </div>

          {/* Expandable 23-Language Grid */}
          {showAllLangPicker && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {DUOLINGO_BASE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectBaseLang(lang.code)}
                  className={`p-2 rounded-xl text-left text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    lang.code === baseLang
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="truncate">{lang.nativeName} ({lang.name})</span>
                </button>
              ))}
            </div>
          )}

          {/* Row 2: CEFR Stage Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto">
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
                        ? 'bg-blue-700 text-white shadow-[0_3px_0_0_#1e3a8a]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{lvl.code}</span>
                    <span className="hidden md:inline font-bold text-[11px] opacity-90">
                      • {lvl.code === 'A0' ? `Basic (${activeLangInfo.nativeName} → EN)` : lvl.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CLEAN CENTERED LEARNING PATH (No Distracting Right Sidebar Mess) */}
      <div className="flex-1 w-full max-w-[920px] mx-auto px-4 sm:px-6 py-8">
        <main className="w-full flex flex-col items-center space-y-12">
          {/* Active Native Language Course Header + Grammar Tip Banner */}
          <div className="w-full card-3d p-5 sm:p-6 bg-gradient-to-r from-emerald-50 via-white to-blue-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-blue-950/40 border-2 border-emerald-400/70 dark:border-emerald-700 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-3xl shadow-xs shrink-0">
                  {activeLangInfo.flag}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-emerald-600 text-white">
                    {selectedLevel === 'A0'
                      ? 'Active Course • 24 Basic Lessons + Phonics'
                      : `Stage ${selectedLevel} • ${currentLevelData?.title || 'English Curriculum'}`}
                  </span>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    {activeLangInfo.courseTitle}
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    {activeLangInfo.courseSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllLangPicker(!showAllLangPicker)}
                className="btn-3d-secondary text-xs font-extrabold px-4 py-2.5 rounded-xl shrink-0 cursor-pointer"
              >
                Change Native Language
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2.5 text-xs">
              <span className="font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                💡 {activeLangInfo.name} → EN Tip:
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {activeLangInfo.grammarTip}
              </span>
            </div>
          </div>

          {loading || (selectedLevel === 'A0' && loadingDuolingo) ? (
            <div className="p-20 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-extrabold text-slate-500">
                Loading {activeLangInfo.name} → English learning path...
              </p>
            </div>
          ) : !combinedUnits.length ? (
            <div className="p-12 text-center card-3d w-full">
              <p className="text-slate-500 font-bold">No units found for this level.</p>
            </div>
          ) : (
            combinedUnits.map((unit: any, uIdx: number) => {
              const lessons = unit.lessons || [];
              const theme = UNIT_THEMES[uIdx % UNIT_THEMES.length];

              return (
                <div key={unit.id} className="w-full flex flex-col items-center space-y-8">
                  {/* UNIT HEADER BANNER */}
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
                        <span className="text-xs font-extrabold text-white/85">
                          • {lessons.length} Interactive Lessons • Study Material & Audio
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                        {unit.title.includes(':') ? unit.title.split(':')[1].trim() : unit.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/85 max-w-xl font-medium leading-relaxed">
                        {unit.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveGuidebook(unit)}
                      className="relative z-10 self-start sm:self-auto flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-50 text-xs font-black py-3 px-5 rounded-2xl border-2 border-slate-200 shadow-[0_4px_0_0_#cbd5e1] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                    >
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>UNIT GUIDEBOOK</span>
                    </button>
                  </div>

                  {/* STEPPING STONES PATH */}
                  <div className="py-6 flex flex-col items-center space-y-6 w-full relative">
                    {lessons.map((lesson: any, lIdx: number) => {
                      const isCompleted =
                        lesson.isCompleted || completedDuoSlugs.includes(lesson.slug);
                      const isFirstIncomplete = !isCompleted && lIdx === 0;
                      const offsetClass = SINE_OFFSETS[lIdx % SINE_OFFSETS.length];

                      const showChest = lIdx === 2;
                      const chestId = `chest-${unit.id}-${lIdx}`;
                      const isChestOpened = openedChests[chestId];

                      return (
                        <React.Fragment key={lesson.id}>
                          {lIdx > 0 && (
                            <div className="w-1 h-6 border-l-4 border-dashed border-slate-300 dark:border-slate-700 -my-3" />
                          )}

                          <div
                            className={`relative flex flex-col items-center transition-transform duration-300 ${offsetClass}`}
                          >
                            {isFirstIncomplete && uIdx === 0 && (
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson)}
                                className="absolute -top-13 z-20 flex flex-col items-center animate-bounce cursor-pointer group"
                              >
                                <div className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-black text-xs px-4 py-2 rounded-2xl shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#1e293b] border-2 border-emerald-500 tracking-wide uppercase flex items-center gap-1.5 whitespace-nowrap">
                                  <Play className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                                  <span>START +{lesson.xpReward || 20} XP</span>
                                </div>
                                <div className="w-3 h-3 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-emerald-500 rotate-45 -mt-1.5" />
                              </button>
                            )}

                            <div className="relative flex items-center justify-center">
                              {isFirstIncomplete && uIdx === 0 && (
                                <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-pulse-ring pointer-events-none" />
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(lesson)}
                                className={`relative stone-shine w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-150 transform hover:-translate-y-1 active:translate-y-1.5 cursor-pointer ${
                                  isCompleted
                                    ? 'bg-gradient-to-b from-amber-300 to-amber-500 border-4 border-amber-200 text-white shadow-[0_8px_0_0_#b45309,0_14px_24px_rgba(217,119,6,0.35)]'
                                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-4 border-emerald-300 text-white shadow-[0_8px_0_0_#047857,0_14px_24px_rgba(5,150,105,0.4)]'
                                }`}
                                title="Tap to open Learning Material or Start Practice"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-10 h-10 fill-white text-amber-500 drop-shadow-xs" />
                                ) : (
                                  <Star className="w-10 h-10 fill-white text-white drop-shadow-xs" />
                                )}
                              </button>
                            </div>

                            {/* Lesson Pill Label & Direct Action Buttons */}
                            <div className="mt-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex flex-col items-center max-w-[240px] text-center space-y-1.5">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                                {lesson.title}
                              </span>
                              {lesson.nativeSubtitle && (
                                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1">
                                  {lesson.nativeSubtitle}
                                </span>
                              )}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenLessonModal(lesson)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-black hover:bg-blue-100 cursor-pointer"
                                >
                                  📖 Study Material
                                </button>
                                {lesson.isDuolingoNativeLesson ? (
                                  <button
                                    type="button"
                                    onClick={() => setActivePracticeLesson(lesson)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-500 cursor-pointer flex items-center gap-1"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-white" />
                                    <span>Practice</span>
                                  </button>
                                ) : (
                                  <Link
                                    href={`/lessons/${lesson.slug}`}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black hover:bg-emerald-500 flex items-center gap-1"
                                  >
                                    <Play className="w-2.5 h-2.5 fill-white" />
                                    <span>Practice</span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>

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

                    {/* UNIT TROPHY STEPPING STONE */}
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
      </div>

      {/* LESSON PREVIEW & FULL STUDY MATERIAL MODAL */}
      {selectedLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="card-3d w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="p-5 sm:p-6 border-b-2 border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                    {activeLangInfo.flag} {activeLangInfo.nativeName} → EN
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedLessonModal.durationMinutes || 10} Mins</span>
                  </span>
                  <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                    <Zap className="w-3.5 h-3.5 fill-amber-500" />
                    <span>+{selectedLessonModal.xpReward || 20} XP</span>
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

            {/* Modal Tabs */}
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
                <span>1. Study Guide ({activeLangInfo.nativeName})</span>
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
                <span>2. Words & Audio ({lessonDetail?.vocabularyWords?.length || 0})</span>
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
                <span>3. Sentences & Slow Audio ({lessonDetail?.examples?.length || 0})</span>
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
                  {activeModalTab === 'theory' && (
                    <div className="space-y-5">
                      {lessonDetail?.objectives?.length > 0 && (
                        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border-2 border-blue-200/80 dark:border-blue-900/60 space-y-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 block">
                            🎯 Lesson Goals:
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

                      <div className="space-y-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                          📖 {activeLangInfo.name} → English Study Sheet:
                        </span>
                        {lessonDetail?.explanationHtml ? (
                          <div
                            className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800"
                            dangerouslySetInnerHTML={{ __html: lessonDetail.explanationHtml }}
                          />
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            Comprehensive foundational English rules for this milestone.
                          </p>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 space-y-1.5 text-xs">
                        <span className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                          💡 {activeLangInfo.flag} Grammar Tip ({activeLangInfo.nativeName}):
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                          {lessonDetail?.grammarNotes || activeLangInfo.grammarTip}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModalTab === 'vocab' && (
                    <div className="space-y-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                        🔊 Vocabulary Word Bank (Tap Speaker for Pronunciation):
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
                                  {(wordObj.allHints?.length > 0 || wordObj.translation) && (
                                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                      {wordObj.allHints
                                        ? wordObj.allHints.join(' • ')
                                        : wordObj.translation}
                                    </p>
                                  )}
                                  {wordObj.definition && (
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                                      {wordObj.definition}
                                    </p>
                                  )}
                                  {wordObj.exampleSentence && (
                                    <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
                                      &ldquo;{wordObj.exampleSentence}&rdquo;
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    playAudioUrlOrTts(wordObj.tts, wordObj.word, 0.92)
                                  }
                                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-[0_3px_0_0_#1e3a8a] cursor-pointer"
                                  title="Play word pronunciation"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Vocabulary items will appear during practice.</p>
                      )}
                    </div>
                  )}

                  {activeModalTab === 'examples' && (
                    <div className="space-y-4">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                        💬 Sentences in this Lesson (Normal 🔊 & Slow 🐢 Audio):
                      </span>

                      {lessonDetail?.examples?.length > 0 ? (
                        <div className="space-y-3">
                          {lessonDetail.examples.map((ex: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b] flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                {ex.characterUrl && (
                                  <img
                                    src={ex.characterUrl}
                                    alt="Character"
                                    className="w-12 h-12 object-contain shrink-0 hidden sm:block"
                                  />
                                )}
                                <div className="space-y-1">
                                  <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                    &ldquo;{ex.phrase}&rdquo;
                                  </p>
                                  <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                    {ex.translation}
                                  </p>
                                  {ex.note && (
                                    <span className="inline-block text-[10px] font-extrabold text-blue-900 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                                      {ex.note}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    playAudioUrlOrTts(ex.tts, ex.phrase, 0.95)
                                  }
                                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-[0_3px_0_0_#1e3a8a] cursor-pointer"
                                  title="Listen Normal Speed"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    playAudioUrlOrTts(ex.tts, ex.phrase, 0.65)
                                  }
                                  className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-sm flex items-center justify-center cursor-pointer"
                                  title="Listen Slow (0.65x Speed)"
                                >
                                  🐢
                                </button>
                              </div>
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
              {selectedLessonModal.isDuolingoNativeLesson ? (
                <button
                  type="button"
                  onClick={() => {
                    const lessonToRun = selectedLessonModal;
                    setSelectedLessonModal(null);
                    setActivePracticeLesson(lessonToRun);
                  }}
                  className="w-full sm:flex-1 py-4 rounded-2xl btn-3d-emerald font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    START {activeLangInfo.name.toUpperCase()} → ENGLISH PRACTICE (+
                    {selectedLessonModal.xpReward || 20} XP)
                  </span>
                </button>
              ) : (
                <Link
                  href={`/lessons/${selectedLessonModal.slug}`}
                  className="w-full sm:flex-1 py-4 rounded-2xl btn-3d-emerald font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START INTERACTIVE PRACTICE (+{selectedLessonModal.xpReward || 15} XP)</span>
                </Link>
              )}
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

      {/* INTERACTIVE DUOLINGO PRACTICE MODAL */}
      {activePracticeLesson && (
        <DuolingoPracticeModal
          lesson={activePracticeLesson}
          onClose={() => setActivePracticeLesson(null)}
          onComplete={handleCompleteDuolingoLesson}
        />
      )}

      {/* UNIT GUIDEBOOK & CHEAT SHEET MODAL */}
      {activeGuidebook && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card-3d w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                  {activeLangInfo.flag} Unit Guidebook ({activeLangInfo.nativeName} → English)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {activeGuidebook.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {activeGuidebook.description}
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
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Key Sentences & Audio in this Unit</span>
                </h4>
                <div className="space-y-2.5">
                  {(activeGuidebook.lessons?.[0]?.examples || []).slice(0, 6).map((ex: any, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">&ldquo;{ex.phrase}&rdquo;</p>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {ex.translation}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playAudioUrlOrTts(ex.tts, ex.phrase, 0.95)}
                        className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>{activeLangInfo.name} → English Grammar Tip</span>
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                  {activeLangInfo.grammarTip}
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
      {chestModalReward !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-150">
          <div className="card-3d max-w-sm w-full p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto shadow-[0_6px_0_0_#b45309]">
              <Gift className="w-11 h-11" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Mystery Chest Unlocked!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold">
              You earned <span className="text-cyan-600 dark:text-cyan-400 font-black">+{chestModalReward} Gems</span> for your learning consistency!
            </p>
            <button
              type="button"
              onClick={() => setChestModalReward(null)}
              className="w-full py-3.5 rounded-2xl btn-3d-emerald font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Claim Reward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
