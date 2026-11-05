'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  Mic,
  Brain,
  CreditCard,
  User,
  LogOut,
  ChevronDown,
  Search,
  GraduationCap,
  ShieldCheck,
  Globe,
  Award,
  Star
} from 'lucide-react';
import { UserSession } from '@/types';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

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
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    setUserDropdownOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-oxford-800 dark:bg-oxford-700 flex items-center justify-center text-white shadow-sm border border-oxford-900 group-hover:bg-oxford-900 transition-colors">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  English<span className="text-oxford-600 dark:text-oxford-400">Miami</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 -mt-1">
                  CEFR A0 to C2 Academy
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/learn"
                className={`flex items-center gap-1.5 transition-colors font-bold ${
                  pathname.startsWith('/learn')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-200 hover:text-emerald-600'
                }`}
              >
                <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                Learn Path
              </Link>
              <Link
                href="/courses"
                className={`transition-colors hover:text-oxford-600 dark:hover:text-oxford-400 ${
                  pathname.startsWith('/courses') ? 'text-oxford-600 dark:text-oxford-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Curriculum (A0–C2)
              </Link>
              <Link
                href="/reading"
                className={`flex items-center gap-1.5 transition-colors hover:text-oxford-600 dark:hover:text-oxford-400 ${
                  pathname.startsWith('/reading') ? 'text-oxford-600 dark:text-oxford-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4 text-oxford-500" />
                Reading & Wikipedia
              </Link>
              <Link
                href="/speaking"
                className={`flex items-center gap-1.5 transition-colors hover:text-oxford-600 dark:hover:text-oxford-400 ${
                  pathname.startsWith('/speaking') ? 'text-oxford-600 dark:text-oxford-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Speaking Lab
              </Link>
              <Link
                href="/ai-coach"
                className={`flex items-center gap-1.5 transition-colors hover:text-oxford-600 dark:hover:text-oxford-400 ${
                  pathname.startsWith('/ai-coach') ? 'text-oxford-600 dark:text-oxford-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Brain className="w-4 h-4 text-indigo-500" />
                AI Coach
              </Link>
              <Link
                href="/pricing"
                className={`transition-colors hover:text-oxford-600 dark:hover:text-oxford-400 ${
                  pathname === '/pricing' ? 'text-oxford-600 dark:text-oxford-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Tuition & Plans
              </Link>
              {session?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors bg-oxford-100 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 border border-oxford-200 dark:border-oxford-800 ${
                    pathname.startsWith('/admin') ? 'ring-2 ring-oxford-500' : ''
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
              )}
            </div>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-3">
              {/* Search Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Search lessons, vocabulary, grammar"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Dark / Light theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* User Session Profile / Auth CTAs */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 dark:border-slate-800 hover:border-oxford-500 bg-slate-50 dark:bg-slate-900 transition-colors"
                  >
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-oxford-100 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300">
                      {session.currentLevel}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
                      {session.name.split(' ')[0]}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-oxford-800 text-white flex items-center justify-center text-xs font-bold">
                      {session.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.email}</p>
                        <span className="inline-block mt-1 text-[11px] font-semibold text-oxford-600 dark:text-oxford-400 uppercase tracking-wider">
                          Plan: {session.plan.replace('_', ' ')}
                        </span>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <BookOpen className="w-4 h-4 text-oxford-600" />
                        My Learning Dashboard
                      </Link>

                      <Link
                        href="/certificates"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        My Certificates
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile & Settings
                      </Link>

                      <Link
                        href="/pricing"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Subscription & Billing
                      </Link>

                      {session.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-oxford-600 dark:text-oxford-400 hover:bg-oxford-50 dark:hover:bg-oxford-950/30"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-oxford-600 dark:hover:text-oxford-400 px-3 py-2 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl"
                  >
                    Start Free
                  </Link>
                </div>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-2">
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Curriculum (A0 to C2)
            </Link>
            <Link
              href="/reading"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reading & Wikipedia Lab
            </Link>
            <Link
              href="/speaking"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Speaking Lab
            </Link>
            <Link
              href="/ai-coach"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              AI Coach
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tuition Plans
            </Link>
            <Link
              href="/placement-test"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-medium text-oxford-600 dark:text-oxford-400 hover:bg-oxford-50"
            >
              Take Placement Test
            </Link>
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lessons, vocabulary, grammar topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
                />
              </form>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {searchResults ? (
                <>
                  {searchResults.lessons?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Lessons</h4>
                      <div className="space-y-1">
                        {searchResults.lessons.map((l: any) => (
                          <Link
                            key={l.id}
                            href={`/lessons/${l.slug}`}
                            onClick={() => setSearchModalOpen(false)}
                            className="block p-2 rounded-xl hover:bg-oxford-50 dark:hover:bg-oxford-950/40 text-sm font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-oxford-100 dark:bg-oxford-900 text-oxford-800 dark:text-oxford-200 mr-2">
                              {l.levelCode}
                            </span>
                            {l.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.vocabulary?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Vocabulary</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {searchResults.vocabulary.map((v: any) => (
                          <div
                            key={v.id}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-oxford-600 dark:text-oxford-400">{v.word}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{v.cefrLevel}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{v.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.grammar?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Grammar Topics</h4>
                      <div className="space-y-1">
                        {searchResults.grammar.map((g: any) => (
                          <Link
                            key={g.id}
                            href="/grammar"
                            onClick={() => setSearchModalOpen(false)}
                            className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200"
                          >
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 mr-2">
                              {g.category}
                            </span>
                            {g.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.lessons?.length === 0 &&
                    searchResults.vocabulary?.length === 0 &&
                    searchResults.grammar?.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-6">No results found for "{searchQuery}".</p>
                    )}
                </>
              ) : (
                <div className="text-center py-6 text-sm text-slate-400">
                  Type a concept like <span className="text-oxford-600 font-medium">"Past Simple"</span>, <span className="text-oxford-600 font-medium">"Airport"</span>, or <span className="text-oxford-600 font-medium">"Opportunity"</span> and press Enter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
