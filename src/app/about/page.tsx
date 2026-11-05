import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, Globe, Shield, Award, Users, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            About EnglishMiami Institute
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Delivering rigorous, CEFR-standardized English education from foundational literacy (A0) to Cambridge and IELTS professional mastery (C2).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Institutional Mission & Pedagogical Framework
            </h2>
            <p>
              English serves as the indispensable lingua franca for international commerce, scientific research, and global higher education. Yet millions of motivated learners worldwide remain hindered by unstructured materials or superficial gamified apps that do not systematically build functional communicative competence.
            </p>
            <p>
              EnglishMiami was established to bridge this divide. Designed specifically for native speakers of Spanish, Mandarin Chinese, Hindi, Urdu, Arabic, Portuguese, and French, our curriculum integrates authentic communicative tasks, structured grammatical blueprints, real-world Wikipedia reading comprehension, and automated acoustic pronunciation analysis.
            </p>

            <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">
              The Seven-Tier CEFR Standard
            </h3>
            <p>
              Every lesson, reading passage, and assessment in EnglishMiami conforms strictly to the Common European Framework of Reference for Languages (CEFR):
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-900 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">A0 & A1:</strong>
                  <span className="text-xs block text-slate-500">Phonics, alphabet, basic greetings, personal identity.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-900 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">A2: Elementary</strong>
                  <span className="text-xs block text-slate-500">Routine travel, shopping, past tenses, everyday needs.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-900 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">B1 & B2: Independent</strong>
                  <span className="text-xs block text-slate-500">Workplace presentations, complex conditionals, technical discourse.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-900 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">C1 & C2: Mastery</strong>
                  <span className="text-xs block text-slate-500">Academic nuance, idiomatic subtlety, executive negotiation.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Global Student Body</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Active students across Latin America, Asia, Europe, and the Middle East advancing in career, academia, and international relocation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Verifiable Credentials</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Each certificate issued possesses a unique cryptographic verification identifier authenticated instantly on our public registry.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">Academic Integrity</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Our faculty review panel audits diagnostic assessments, writing submissions, and level-exit examinations to guarantee rigor.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
