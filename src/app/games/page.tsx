'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import EnglishLearningGameArena from '@/components/EnglishLearningGameArena';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { UserSession } from '@/types';

export default function GamesPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [bonusXp, setBonusXp] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            currentLevel: data.user.profile?.currentLevel || 'A0',
            plan: data.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
          setUserData(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const streak = userData?.streak?.currentStreak || 9;
  const xp = (userData?.profile?.xp || 890) + bonusXp;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors bg-grid-pattern">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-8 gap-8">
        <DashboardSidebar session={session} streakCount={streak} xpPoints={xp} />

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:border-blue-500"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <EnglishLearningGameArena
            onXpEarned={(pts) => setBonusXp((prev) => prev + pts)}
          />
        </main>
      </div>
    </div>
  );
}
