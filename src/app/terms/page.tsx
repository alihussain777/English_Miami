import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400">
            Effective Date: October 2026 • EnglishMiami Technologies Inc.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By creating an account or accessing educational services on EnglishMiami, you agree to abide by these Terms of Service. If you disagree with any provision, please discontinue platform use.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Educational Subscriptions & Billing</h2>
          <p>
            Paid subscriptions (Weekly Pro and Monthly Pro) grant expanded access to advanced CEFR modules, speaking labs, and AI coaching. Subscriptions automatically renew at the conclusion of each billing cycle unless cancelled prior to renewal through your account settings.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Acceptable Use of AI Systems</h2>
          <p>
            Learners agree to utilize Miami AI Coach and roleplay features strictly for legitimate language learning and intercultural communication practice. Attempts to probe, inject malicious system instructions, or generate abusive content are strictly prohibited.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Intellectual Property & CEFR Certificates</h2>
          <p>
            All curriculum texts, interactive exercises, sound synthesis configurations, and certificate designs remain the exclusive intellectual property of EnglishMiami Technologies Inc. Official completion certificates may be verified publicly by third parties using designated validation URLs.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
