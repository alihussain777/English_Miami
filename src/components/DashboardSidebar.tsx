'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  Brain,
  Mic,
  Headphones,
  BookOpen,
  PenTool,
  BookmarkCheck,
  CheckCircle2,
  Trophy,
  Award,
  CreditCard,
  User,
  ShieldAlert,
  Flame,
  Zap,
  Star,
  Gamepad2,
} from 'lucide-react';
import { UserSession } from '@/types';

interface Props {
  session?: UserSession | null;
  streakCount?: number;
  xpPoints?: number;
}

export default function DashboardSidebar({
  session,
  streakCount = 1,
  xpPoints = 0,
}: Props) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Duolingo Learn Path', href: '/learn', icon: Star },
    { label: 'English Games Arcade', href: '/games', icon: Gamepad2 },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Curriculum (A0–C2)', href: '/courses', icon: GraduationCap },
    { label: 'Miami AI Coach', href: '/ai-coach', icon: Brain },
    { label: 'Speaking Lab', href: '/speaking', icon: Mic },
    { label: 'Listening Lab', href: '/listening', icon: Headphones },
    { label: 'Reading & Wikipedia', href: '/reading', icon: BookOpen },
    { label: 'Writing Lab', href: '/writing', icon: PenTool },
    { label: 'Vocabulary (SRS)', href: '/vocabulary', icon: BookmarkCheck },
    { label: 'Grammar Units', href: '/grammar', icon: CheckCircle2 },
    { label: 'Placement Test', href: '/placement-test', icon: Trophy },
    { label: 'Certificates', href: '/certificates', icon: Award },
    { label: 'Tuition & Plans', href: '/pricing', icon: CreditCard },
    { label: 'Profile & Settings', href: '/profile', icon: User },
  ];

  if (session?.role === 'ADMIN') {
    navLinks.push({ label: 'Admin Console', href: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 min-h-[calc(100vh-4rem)] sticky top-16 transition-colors rounded-2xl shadow-sm self-start">
        {/* User Level & XP Badges */}
        <div className="mb-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-oxford-700 dark:text-oxford-300">
              Level {session?.currentLevel || 'A0'}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streakCount}d Streak</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{xpPoints} XP</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-oxford-600 dark:text-oxford-400 tracking-wider">
              {session?.plan?.replace('_', ' ') || 'FREE'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-oxford-700 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-4 flex items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname === '/dashboard' ? 'text-oxford-600 dark:text-oxford-400 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/courses"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/courses') ? 'text-oxford-600 dark:text-oxford-400 font-bold' : 'text-slate-500'
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Courses</span>
        </Link>
        <Link
          href="/reading"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/reading') ? 'text-oxford-600 dark:text-oxford-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Reading</span>
        </Link>
        <Link
          href="/speaking"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/speaking') ? 'text-oxford-600 dark:text-oxford-400 font-bold' : 'text-slate-500'
          }`}
        >
          <Mic className="w-5 h-5" />
          <span>Speaking</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            pathname.startsWith('/profile') ? 'text-oxford-600 dark:text-oxford-400 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
}
