'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Flame,
  Zap,
  Mic,
  Brain,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  Compass,
  Gamepad2,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bonusGameXp, setBonusGameXp] = useState<number>(0);

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

  const streak = userData?.streak?.currentStreak || 9;
  const xp = (userData?.profile?.xp || 890) + bonusGameXp;
  const level = userData?.profile?.currentLevel || 'A0';
  const completedLessons = userData?.stats?.completedLessons || 4;
  const speakingMins = userData?.profile?.speakingMinutes || 12;
  const dailyTarget = userData?.profile?.dailyTargetMinutes || 20;

  const dailyProgressPct = Math.min(100, Math.round(((speakingMins * 2 + completedLessons * 10) / dailyTarget) * 50) || 65);

  const weeklyDays = [
    { day: 'Mon', xp: 50, active: true },
    { day: 'Tue', xp: 80, active: true },
    { day: 'Wed', xp: 60, active: true },
    { day: 'Thu', xp: 110, active: true },
    { day: 'Fri', xp: 75, active: true },
    { day: 'Sat', xp: 95, active: true },
    { day: 'Sun', xp: 40, active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors bg-grid-pattern">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-8 gap-8">
        {/* Responsive Sidebar */}
        <DashboardSidebar session={session} streakCount={streak} xpPoints={xp} />

        {/* Main Content Area */}
        <main className="flex-1 space-y-8 pb-24 lg:pb-8">
          {/* 3D Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-950 border-2 border-blue-600 text-white shadow-[0_8px_0_0_#172554,0_20px_30px_-8px_rgba(23,37,84,0.45)] space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl bg-blue-950/70 border border-blue-400/30 text-blue-200 inline-block">
                  Welcome back, {session?.name?.split(' ')[0] || 'Learner'} 👋
                </span>
                <h1 className="text-2xl sm:text-4xl font-black mt-2.5 tracking-tight">
                  Academic Progress Hub
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl font-medium">
                  Current Standing: <strong className="text-amber-300 font-black">CEFR Level {level}</strong>. Continue your interactive stepping stones, speaking labs, and vocabulary flashcards.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border-2 border-white/20 text-center min-w-[85px] shadow-[0_4px_0_0_rgba(0,0,0,0.25)]">
                  <Flame className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto" />
                  <span className="text-sm font-black block mt-0.5">{streak} Days</span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase">Streak</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border-2 border-white/20 text-center min-w-[85px] shadow-[0_4px_0_0_rgba(0,0,0,0.25)]">
                  <Zap className="w-6 h-6 text-amber-400 fill-amber-400 mx-auto" />
                  <span className="text-sm font-black block mt-0.5">{xp} XP</span>
                  <span className="text-[10px] font-bold text-blue-200 uppercase">Earned</span>
                </div>
              </div>
            </div>

            {/* Daily Goal Progress Bar & 3D CTA */}
            <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-extrabold mb-2 text-blue-100">
                  <span>Daily Study Target: {dailyTarget} mins</span>
                  <span className="font-black text-emerald-300">{dailyProgressPct}% Completed</span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-blue-950/90 p-0.5 border border-blue-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${dailyProgressPct}%` }}
                  />
                </div>
              </div>
              <Link
                href="/learn"
                className="btn-3d-amber px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-stretch sm:self-auto shrink-0"
              >
                <span>Continue Learn Path</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Action Grid (5 Studio Boxes Including Playable Games Arcade) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Duolingo Learning Path */}
            <Link
              href="/learn"
              className="card-3d card-3d-interactive p-6 bg-gradient-to-br from-emerald-50/90 to-white dark:from-emerald-950/40 dark:to-slate-900 border-2 border-emerald-400 dark:border-emerald-700 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-[0_4px_0_0_#047857] group-hover:scale-105 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Learn Path</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                    POPULAR
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Interactive stepping stones, A0–C2 phonics study sheets, audio flashcards & quizzes.
                </p>
              </div>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-5 group-hover:translate-x-1 transition-transform">
                <span>Open Learn Path</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* English Games Arcade Box (Firing, Zombie Whack, Hungry Shark & Racing) */}
            <Link
              href="/games"
              className="card-3d card-3d-interactive p-6 bg-gradient-to-br from-amber-50/90 to-white dark:from-amber-950/35 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-700 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4 shadow-[0_4px_0_0_#b45309] group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">English Games</h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white">
                    6 GAMES
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Play Space Laser Shooter, Zombie Grammar Whack, Hungry Shark & Turbo Racer!
                </p>
              </div>
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-5 group-hover:translate-x-1 transition-transform">
                <span>Play Games Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Wikipedia ESL Reader */}
            <Link
              href="/reading"
              className="card-3d card-3d-interactive p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-[0_4px_0_0_#1e3a8a] group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white mb-1.5">Wikipedia Reader</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  Read live encyclopedia articles with native audio narration and 1-click vocabulary saving.
                </p>
              </div>
              <span className="text-xs font-black text-blue-700 dark:text-blue-400 flex items-center gap-1 mt-5 group-hover:translate-x-1 transition-transform">
                <span>Start Reading</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* Speaking Lab */}
            <Link
              href="/speaking"
              className="card-3d card-3d-interactive p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-[0_4px_0_0_#0f766e] group-hover:scale-105 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white mb-1.5">Speaking Lab</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  Browser speech recognition with real-time phonetic pronunciation accuracy scoring.
                </p>
              </div>
              <span className="text-xs font-black text-teal-700 dark:text-teal-400 flex items-center gap-1 mt-5 group-hover:translate-x-1 transition-transform">
                <span>Start Speaking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* AI Coach */}
            <Link
              href="/ai-coach"
              className="card-3d card-3d-interactive p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-[0_4px_0_0_#3730a3] group-hover:scale-105 transition-transform">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-white mb-1.5">Miami AI Coach</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  24/7 grammar feedback, job interview simulations, and natural roleplay dialogue.
                </p>
              </div>
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mt-5 group-hover:translate-x-1 transition-transform">
                <span>Talk to Coach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Activity & Weekly Progress Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Activity Chart */}
            <div className="lg:col-span-2 card-3d p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Weekly Study Consistency
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    XP and speaking practice logged over the last 7 days.
                  </p>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+18% this week</span>
                </span>
              </div>

              {/* 3D Bar visualization */}
              <div className="grid grid-cols-7 gap-3 pt-4">
                {weeklyDays.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl h-36 flex items-end p-1.5 border border-slate-200 dark:border-slate-700">
                      <div
                        className={`w-full rounded-xl transition-all duration-500 ${
                          d.active
                            ? 'bg-gradient-to-t from-blue-700 to-blue-500 shadow-[0_3px_0_0_#1e3a8a]'
                            : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        style={{ height: `${Math.min(100, Math.max(12, (d.xp / 120) * 100))}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{d.day}</span>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{d.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Card: Verifiable Credentials */}
            <div className="card-3d p-6 sm:p-7 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mb-4 shadow-[0_4px_0_0_#b45309]">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                  Verifiable CEFR Certificates
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Earn official accredited CEFR credentials as you master units. Instantly verifiable online for employers and universities.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-2 text-xs font-bold">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Next Milestone:</span>
                  <span className="font-black text-blue-700 dark:text-blue-400">Level {level} Diploma</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Requirement:</span>
                  <span className="font-black text-emerald-600">Score &ge; 80%</span>
                </div>
              </div>

              <Link
                href="/certificates"
                className="btn-3d-primary text-center py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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
