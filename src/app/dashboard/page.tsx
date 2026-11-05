'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Flame,
  Zap,
  BookOpen,
  Mic,
  BookmarkCheck,
  Brain,
  Trophy,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  Globe,
  PenTool,
  Headphones,
  Compass,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            currentLevel: data.user.profile?.currentLevel || 'A0',
            plan: data.user.subscription?.plan || 'FREE',
            onboardingCompleted: data.user.profile?.onboardingCompleted ?? true,
          });
          setUserData(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const streak = userData?.streak?.currentStreak || 1;
  const xp = userData?.profile?.xp || 250;
  const level = userData?.profile?.currentLevel || 'A0';
  const completedLessons = userData?.stats?.completedLessons || 0;
  const speakingMins = userData?.profile?.speakingMinutes || 0;
  const dailyTarget = userData?.profile?.dailyTargetMinutes || 20;

  const dailyProgressPct = Math.min(100, Math.round(((speakingMins * 2 + completedLessons * 10) / dailyTarget) * 50) || 45);

  const weeklyDays = [
    { day: 'Mon', xp: 50, active: true },
    { day: 'Tue', xp: 80, active: true },
    { day: 'Wed', xp: 60, active: true },
    { day: 'Thu', xp: 110, active: true },
    { day: 'Fri', xp: 75, active: true },
    { day: 'Sat', xp: 40, active: false },
    { day: 'Sun', xp: 0, active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {/* Responsive Sidebar */}
        <DashboardSidebar session={session} streakCount={streak} xpPoints={xp} />

        {/* Main Content Area */}
        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-oxford-900 border border-oxford-800 text-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-oxford-300">
                  Welcome back, {session?.name?.split(' ')[0] || 'Learner'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                  Academic Progress Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
                  Current Standing: <strong className="text-white">CEFR Level {level}</strong>. Review your curriculum milestones, voice fluency sessions, and Spaced Repetition vocabulary bank.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-oxford-800/80 border border-oxford-700 text-center min-w-[75px]">
                  <Flame className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" />
                  <span className="text-xs font-bold block mt-0.5">{streak} Days</span>
                  <span className="text-[10px] text-slate-400">Streak</span>
                </div>
                <div className="p-3 rounded-xl bg-oxford-800/80 border border-oxford-700 text-center min-w-[75px]">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto" />
                  <span className="text-xs font-bold block mt-0.5">{xp} XP</span>
                  <span className="text-[10px] text-slate-400">Earned</span>
                </div>
              </div>
            </div>

            {/* Daily Goal Progress Bar & CTA */}
            <div className="pt-2 border-t border-oxford-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-slate-300">
                  <span>Daily Study Goal: {dailyTarget} mins</span>
                  <span className="font-bold text-white">{dailyProgressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-oxford-950 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${dailyProgressPct}%` }}
                  />
                </div>
              </div>
              <Link
                href="/learn"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-oxford-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_0_#b45309] hover:shadow-[0_2px_0_0_#b45309] hover:translate-y-0.5 transition-all self-stretch sm:self-auto shrink-0"
              >
                <span>Continue Path</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duolingo Learning Path */}
            <Link
              href="/learn"
              className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border-2 border-emerald-500/40 shadow-sm hover:border-emerald-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-[0_3px_0_0_#047857]">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Duolingo Path</h3>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-oxford-950">POPULAR</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Stepping stones snake, word bank puzzles, audio & 5 hearts.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-4 group-hover:translate-x-0.5 transition-transform">
                <span>Start Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Wikipedia ESL Reader */}
            <Link
              href="/reading"
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-3 border border-oxford-200 dark:border-oxford-800">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Wikipedia Reader</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Read live encyclopedia articles with audio and vocabulary tools.
                </p>
              </div>
              <span className="text-xs font-semibold text-oxford-600 dark:text-oxford-400 flex items-center gap-1 mt-4">
                <span>Start Reading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Speaking Lab */}
            <Link
              href="/speaking"
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200 dark:border-emerald-800">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Speaking Lab</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Speech recognition with real-time pronunciation scoring.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-4">
                <span>Start Speaking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* AI Coach */}
            <Link
              href="/ai-coach"
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-200 dark:border-indigo-800">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Miami AI Coach</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Grammar feedback, interview prep, and natural dialogue.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-4">
                <span>Talk to Coach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Activity & Weekly Progress Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Weekly Study Consistency
                  </h3>
                  <p className="text-xs text-slate-500">XP and speaking practice logged over the last 7 days.</p>
                </div>
                <span className="text-xs font-semibold text-oxford-600 dark:text-oxford-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18% this week</span>
                </span>
              </div>

              {/* Bar visualization */}
              <div className="grid grid-cols-7 gap-3 pt-4">
                {weeklyDays.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-32 flex items-end p-1">
                      <div
                        className={`w-full rounded-md transition-all duration-500 ${
                          d.active ? 'bg-oxford-600 dark:bg-oxford-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ height: `${Math.min(100, Math.max(10, (d.xp / 120) * 100))}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{d.day}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.xp}xp</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Card: Verifiable Credentials */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 border border-amber-200 dark:border-amber-800">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Academic Certificates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Earn official accredited CEFR credentials as you master courses. Reviewed and verified by our Academic Board.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Current Target:</span>
                  <span className="font-bold text-oxford-700 dark:text-oxford-300">Level B2</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Requirement:</span>
                  <span>Score &ge; 80%</span>
                </div>
              </div>

              <Link
                href="/certificates"
                className="btn-primary text-center py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>View My Certificates</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
