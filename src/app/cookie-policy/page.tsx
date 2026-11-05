import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Cookie & Session Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: October 2026 • EnglishMiami Technologies Inc.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. How We Use Cookies</h2>
          <p>
            EnglishMiami uses secure, HTTP-only cookies strictly for authentication session tokens, theme preferences (light/dark mode), and maintaining your daily learning streak.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Essential Authentication Cookies</h2>
          <p>
            The <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">englishmiami_session</code> cookie verifies your identity across authenticated learning sessions without transmitting raw passwords.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. No Intrusive Third-Party Ad Trackers</h2>
          <p>
            We do not sell advertising space or deploy invasive behavioral ad tracking cookies. Your educational progress belongs strictly to you.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
