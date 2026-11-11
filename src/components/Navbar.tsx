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
  Star,
  Flame,
  Compass
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
      <nav className="sticky top-0 z-40 w-full border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-all">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-18 py-2.5">
            {/* Tactile 3D Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-[0_4px_0_0_#1e3a8a] border border-blue-400/40 group-hover:-translate-y-0.5 group-active:translate-y-0.5 transition-all">
                <GraduationCap className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  English<span className="text-blue-700 dark:text-blue-400">Miami</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 -mt-1">
                  CEFR A0–C2 Academy
                </span>
              </div>
            </Link>

            {/* Desktop Pill Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
              <Link
                href="/learn"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  pathname.startsWith('/learn')
                    ? 'bg-emerald-600 text-white shadow-[0_3px_0_0_#047857]'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                }`}
              >
                <Compass className={`w-4 h-4 ${pathname.startsWith('/learn') ? 'text-white' : 'text-emerald-500'}`} />
                <span>3D Learn Path</span>
              </Link>

              <Link
                href="/courses"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/courses')
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                Curriculum (A0–C2)
              </Link>

              <Link
                href="/reading"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/reading')
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Wikipedia Reader</span>
              </Link>

              <Link
                href="/speaking"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/speaking')
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-500" />
                <span>Speaking Lab</span>
              </Link>

              <Link
                href="/ai-coach"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/ai-coach')
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Coach</span>
              </Link>

              <Link
                href="/pricing"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/pricing'
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                Plans
              </Link>

              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-blue-700 text-white shadow-[0_3px_0_0_#1e3a8a]'
                    : 'bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            </div>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-2.5">
              {/* Tactile Search Pill */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b] hover:-translate-y-0.5 active:translate-y-0.5 transition-all text-xs font-bold cursor-pointer"
                title="Search lessons, vocabulary, grammar"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Search...</span>
              </button>

              {/* Theme Toggle 3D Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="Toggle Dark / Light theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* User Session Profile / Auth CTAs */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {session.currentLevel}
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 hidden sm:inline">
                      {session.name.split(' ')[0]}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-b from-blue-600 to-blue-800 text-white flex items-center justify-center text-xs font-black shadow-xs">
                      {session.name.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{session.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                          Plan: {session.plan.replace('_', ' ')}
                        </span>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        My Learning Dashboard
                      </Link>

                      <Link
                        href="/learn"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        <Compass className="w-4 h-4 text-emerald-600" />
                        3D Duolingo Path
                      </Link>

                      <Link
                        href="/certificates"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        My Certificates
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile & Settings
                      </Link>

                      <Link
                        href="/pricing"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Subscription & Billing
                      </Link>

                      {session.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
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
                    className="btn-3d-secondary text-xs font-extrabold px-4 py-2.5 rounded-xl hidden sm:inline-block"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-3d-primary text-xs font-extrabold px-4 py-2.5 rounded-xl"
                  >
                    Start Free
                  </Link>
                </div>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-2">
            <Link
              href="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
            >
              <Compass className="w-4 h-4" />
              3D Learn Path
            </Link>
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Curriculum (A0 to C2)
            </Link>
            <Link
              href="/reading"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Reading & Wikipedia Lab
            </Link>
            <Link
              href="/speaking"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Speaking Lab
            </Link>
            <Link
              href="/ai-coach"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              AI Coach
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tuition Plans
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </Link>
            <Link
              href="/placement-test"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-sm font-extrabold text-blue-600 dark:text-blue-400 hover:bg-blue-50"
            >
              Take Placement Test
            </Link>
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl card-3d overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2.5">
                <Search className="w-5 h-5 text-blue-600" />
                <input
                  type="text"
                  placeholder="Search lessons, vocabulary, grammar topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm font-semibold focus:outline-none"
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
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Lessons</h4>
                      <div className="space-y-1.5">
                        {searchResults.lessons.map((l: any) => (
                          <Link
                            key={l.id}
                            href={`/lessons/${l.slug}`}
                            onClick={() => setSearchModalOpen(false)}
                            className="block p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors"
                          >
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 mr-2">
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
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Vocabulary</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {searchResults.vocabulary.map((v: any) => (
                          <div
                            key={v.id}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{v.word}</span>
                              <span className="text-[10px] font-bold text-slate-400">{v.cefrLevel}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{v.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.grammar?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">Grammar Topics</h4>
                      <div className="space-y-1">
                        {searchResults.grammar.map((g: any) => (
                          <Link
                            key={g.id}
                            href="/grammar"
                            onClick={() => setSearchModalOpen(false)}
                            className="block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-200"
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
                  Type a concept like <span className="text-blue-600 font-bold">"Past Simple"</span>, <span className="text-blue-600 font-bold">"Alphabet"</span>, or <span className="text-blue-600 font-bold">"Greetings"</span> and press Enter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
