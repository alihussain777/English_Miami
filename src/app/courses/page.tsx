'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Loader2,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function CoursesPage() {
  const [levels, setLevels] = useState<any[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([courseData, authData]) => {
        setLevels(courseData.levels || []);
        if (authData.authenticated && authData.user) {
          setSession({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            role: authData.user.role,
            currentLevel: authData.user.profile?.currentLevel || 'A0',
            plan: authData.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredLevels =
    selectedLevel === 'ALL'
      ? levels
      : levels.filter((lvl) => lvl.code === selectedLevel);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 text-xs font-semibold mb-2 border border-oxford-200 dark:border-oxford-800">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>CEFR Complete Academic Curriculum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Curriculum & Structured Units
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Progress systematically through all 7 CEFR levels from absolute zero (A0) to fluent native mastery (C2).
              </p>
            </div>

            {/* Level Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-oxford-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Duolingo Stepping Stones Hero Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-800">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-blue-200">
                Duolingo-Style Mode
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                Stepping-Stones Learning Path
              </h2>
              <p className="text-xs text-blue-100 max-w-lg">
                Interactive word-tile sentence builders, pair-matching games, speech practice, daily quests, and streak rewards.
              </p>
            </div>
            <Link
              href="/learn"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-[0_4px_0_0_#047857] active:translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <span>OPEN DUOLINGO PATH</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-900" />
              <p className="text-xs font-semibold text-slate-400 mt-3">Loading curriculum units...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredLevels.map((lvl) => (
                <div key={lvl.code} id={lvl.code.toLowerCase()} className="space-y-4">
                  {/* Level Header Banner */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-oxford-800 text-white font-bold text-base flex items-center justify-center shadow-sm">
                        {lvl.code}
                      </span>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                          Level {lvl.code}: {lvl.title}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lvl.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Courses in this level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lvl.courses?.map((course: any) => (
                      <div
                        key={course.id}
                        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-oxford-300 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {course.lessons?.length || 0} Lessons
                            </span>
                            {course.isCompleted && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {course.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        {/* Lessons List in Course */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {course.lessons?.map((l: any, i: number) => (
                            <Link
                              key={l.id}
                              href={`/lessons/${l.slug}`}
                              className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-oxford-400 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center">
                                  {i + 1}
                                </span>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-oxford-600 dark:group-hover:text-oxford-400 transition-colors">
                                    {l.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{l.durationMinutes} min</span>
                                    <span>•</span>
                                    <span>+{l.xpReward} XP</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {l.isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-oxford-600 group-hover:translate-x-0.5 transition-all" />
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
