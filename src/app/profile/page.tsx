'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  CheckCircle2,
  Save,
  Languages,
} from 'lucide-react';
import { UserSession } from '@/types';
import { DUOLINGO_BASE_LANGUAGES, getBaseLanguageInfo } from '@/lib/duolingo-languages';

export default function ProfilePage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('hi');
  const [country, setCountry] = useState('');
  const [dailyTarget, setDailyTarget] = useState(20);
  const [learningGoal, setLearningGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tici_base_lang');
      if (saved) setNativeLanguage(saved);
    } catch {}

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUserData(data.user);
          setName(data.user.name);
          const profLang = data.user.profile?.nativeLanguage || 'hi';
          const matched = DUOLINGO_BASE_LANGUAGES.find(
            (l) =>
              l.code === profLang.toLowerCase() ||
              l.name.toLowerCase() === profLang.toLowerCase()
          );
          if (matched) {
            setNativeLanguage(matched.code);
          }
          setCountry(data.user.profile?.country || '');
          setDailyTarget(data.user.profile?.dailyTargetMinutes || 20);
          setLearningGoal(data.user.profile?.learningGoal || 'Speaking English');
          setSession({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            currentLevel: data.user.profile?.currentLevel || 'A0',
            plan: data.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectLang = (code: string) => {
    setNativeLanguage(code);
    try {
      localStorage.setItem('tici_base_lang', code);
      window.dispatchEvent(
        new CustomEvent('tici-lang-change', { detail: { lang: code } })
      );
    } catch {}
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      localStorage.setItem('tici_base_lang', nativeLanguage);
      window.dispatchEvent(
        new CustomEvent('tici-lang-change', { detail: { lang: nativeLanguage } })
      );

      if (session) {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            nativeLanguage,
            country,
            dailyTargetMinutes: dailyTarget,
            learningGoal,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const activeLangInfo = getBaseLanguageInfo(nativeLanguage);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col lg:flex-row gap-6">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 w-full pb-24 lg:pb-8">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                {name?.charAt(0) || 'S'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {name || 'Student Settings & Profile'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {userData?.email || 'Manage your native language and study preferences'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {activeLangInfo.flag} {activeLangInfo.nativeName} → English
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                CEFR {userData?.profile?.currentLevel || 'A0'}
              </span>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Settings saved! Your Native Language ({activeLangInfo.nativeName} → English) is now updated across all lessons.
              </span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6"
          >
            <div className="space-y-3">
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Languages className="w-5 h-5 text-emerald-600" />
                <span>Native Language for Learning English (23 Languages Supported)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Select the language you speak best. All Duolingo basic lessons, word hints, and grammar tips will adapt to your language.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
                {DUOLINGO_BASE_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === nativeLanguage;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLang(lang.code)}
                      className={`p-3 rounded-2xl text-left flex items-center gap-2.5 transition-all cursor-pointer border-2 ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 shadow-[0_3px_0_0_#059669]'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-xl shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                          {lang.nativeName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 truncate">
                          {lang.name} → EN
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Country of Residence
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Pakistan, India, USA, Spain"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Learning Goal
                </label>
                <input
                  type="text"
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Daily Study Goal (Minutes)
                </label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-3d-primary text-xs font-black px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings & Native Language'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
