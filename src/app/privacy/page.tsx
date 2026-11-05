import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
        <div className="space-y-2">
          <div className="inline-flex p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last Updated: October 2026 • EnglishMiami Technologies Inc.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs">
            <strong>Legal Notice:</strong> This privacy document constitutes our international data handling framework. Review by qualified legal counsel is recommended prior to specific regional enterprise rollouts.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
          <p>
            When you register on EnglishMiami, we collect your name, email address, password hash, native language, learning preferences, and progress telemetry (lessons completed, test scores, vocabulary retention intervals, and optional speech recognition audio transcripts).
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Speech & Voice Data Processing</h2>
          <p>
            Spoken responses submitted in the Speaking Lab or during Miami AI Coach voice conversations are converted to text using client-side or server-side speech synthesis engines. Audio is processed solely for pronunciation scoring and pedagogical coaching. Raw audio streams are never sold or used for third-party commercial surveillance.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Artificial Intelligence Integration</h2>
          <p>
            Pedagogical prompts and essay evaluations are processed securely via Google Gemini API servers. Student queries sent to the AI Coach are governed under strict enterprise data encryption and isolation boundaries.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Payment Processing Security</h2>
          <p>
            We partner with certified Level 1 PCI-DSS payment gateways. EnglishMiami servers never receive or store raw payment card numbers or CVV codes.
          </p>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Your Data Rights</h2>
          <p>
            In compliance with GDPR and international data privacy statutes, you may request full export or permanent erasure of your account, learning analytics, and vocabulary bank at any time by contacting privacy@englishmiami.com.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
