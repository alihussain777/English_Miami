'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, ArrowRight, AlertCircle, Languages } from 'lucide-react';
import { DUOLINGO_BASE_LANGUAGES } from '@/lib/duolingo-languages';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('hi');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tici_base_lang');
      if (saved) setNativeLanguage(saved);
    } catch {}
  }, []);

  const handleSelectLanguage = (code: string) => {
    setNativeLanguage(code);
    try {
      localStorage.setItem('tici_base_lang', code);
      window.dispatchEvent(
        new CustomEvent('tici-lang-change', { detail: { lang: code } })
      );
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          nativeLanguage,
          country,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      try {
        localStorage.setItem('tici_base_lang', nativeLanguage);
        window.dispatchEvent(
          new CustomEvent('tici-lang-change', { detail: { lang: nativeLanguage } })
        );
      } catch {}

      router.push('/learn');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 mb-1 border border-blue-100 dark:border-blue-900/50">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Your Student Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select your native language below—we will save it to your account and teach you English step-by-step.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Khan / Maria Gonzalez"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Pakistan, India, USA, Spain"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            {/* Native Language Selection (Saved on Signup) */}
            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <Languages className="w-4 h-4" />
                <span>I Speak (Select Your Native Language to Learn English From):</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                {DUOLINGO_BASE_LANGUAGES.map((lang) => {
                  const isSelected = nativeLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`p-2.5 rounded-xl text-left flex items-center gap-2 transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 font-black shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 font-bold'
                      }`}
                    >
                      <span className="text-lg shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{lang.nativeName}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {lang.name} → EN
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                You can also update your native language anytime in User Settings (/profile).
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-3d-emerald font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account & Start Learning'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-900 dark:text-blue-400 hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
