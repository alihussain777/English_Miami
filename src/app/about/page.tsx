import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Globe, Shield, Award, CheckCircle2, Trophy, Building2, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-14 space-y-16">
        {/* Top Clean Logo & Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <img
            src="/images/brand/logo-tici.png"
            alt="TICI Logo"
            className="w-24 h-24 object-contain mx-auto"
          />
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Trinidad International Cultural Institute (TICI)
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            About EnglishMiami Institute
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Delivering structured, CEFR-standardized English education from foundational literacy (A0) to professional mastery (C2) in Miami Beach and worldwide.
          </p>
        </div>

        {/* Clean Link to Meet Founder Page */}
        <div className="card-3d p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Leadership
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Meet Our Founder: Jason Trinidad
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Learn about Jason Trinidad’s educational vision, classroom methodology, and corporate hospitality programs at our dedicated Meet Founder page.
            </p>
          </div>
          <Link
            href="/founder"
            className="btn-3d-primary text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-2xl inline-flex items-center gap-2 shrink-0"
          >
            <span>Open Meet Founder Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Institutional Mission & 3D Campus Photos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card-3d p-8 sm:p-10 space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <h2 className="text-xl font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Institutional Mission & Pedagogical Framework
            </h2>
            <p>
              English serves as the indispensable lingua franca for international commerce, luxury hospitality, scientific research, and global higher education. TICI • EnglishMiami bridges classroom camaraderie with our interactive 3D digital learning platform.
            </p>

            <h3 className="text-base font-black text-slate-900 dark:text-white pt-2">
              The Seven-Tier CEFR Standard (A0 to C2)
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <li className="flex items-start gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">A0 & A1:</strong>
                  <span className="text-xs block text-slate-500">Phonics, alphabet, basic greetings, personal identity.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">A2: Elementary</strong>
                  <span className="text-xs block text-slate-500">Routine travel, shopping, past tenses, everyday needs.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">B1 & B2: Independent</strong>
                  <span className="text-xs block text-slate-500">Workplace presentations, complex conditionals, technical discourse.</span>
                </div>
              </li>
              <li className="flex items-start gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-900 dark:text-white">C1 & C2: Mastery</strong>
                  <span className="text-xs block text-slate-500">Academic nuance, idiomatic subtlety, executive negotiation.</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="card-3d p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white">Corporate & Country Club Programs</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Trusted by premier Miami institutions including La Gorce Country Club for on-site hospitality English and official diploma certification.
              </p>
            </div>

            <div className="card-3d p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white">Verifiable TICI Credentials</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Each certificate issued by Founder Jason Trinidad possesses a unique verification identifier authenticated on our public registry.
              </p>
            </div>

            <div className="card-3d p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white">Interactive Smartboard Culture</h4>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Students build real public-speaking confidence through live smartboard presentations, International Fairs, and social conversation lounges.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
