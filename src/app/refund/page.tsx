import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RotateCcw } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-2">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: October 2026 • EnglishMiami Technologies Inc.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. 14-Day Satisfaction Guarantee</h2>
          <p>
            We stand behind our educational quality. If you are unsatisfied with your Monthly Pro subscription within 14 days of your initial purchase, contact billing@englishmiami.com for a full refund.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Immediate One-Click Cancellation</h2>
          <p>
            You can cancel auto-renewal at any time with a single click inside your Subscription & Billing settings. You retain full access to all Pro features until the conclusion of the paid billing period.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Exceptional Circumstances</h2>
          <p>
            For learners experiencing technical interruptions or accidental duplicate charges, our billing team issues prompt fee adjustments.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
