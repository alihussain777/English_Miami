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
        {/* Top TICI Crest & Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="mx-auto w-24 h-24 rounded-3xl crest-3d-badge p-2.5 flex items-center justify-center">
            <img
              src="/images/brand/logo-tici.png"
              alt="TICI Official Crest"
              className="w-20 h-20 object-contain"
            />
          </div>
          <span className="inline-block text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Trinidad International Cultural Institute (TICI)
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            About TICI • EnglishMiami & Founder Jason Trinidad
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Delivering joyful, high-impact CEFR-standardized English education from foundational literacy (A0) to executive and hospitality mastery (C2) in Miami Beach and worldwide.
          </p>
        </div>

        {/* Founder Jason Trinidad Highlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="frame-3d-gold">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src="/images/brand/jason-graduation-group.jpg"
                  alt="Founder Jason Trinidad with Graduates at La Gorce Country Club"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    ★ Founder & University Owner
                  </span>
                  <h3 className="text-xl font-black text-white mt-1.5">
                    Jason Trinidad with Certified Graduates at La Gorce Country Club
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 card-3d p-8 sm:p-10 space-y-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leadership & Life Story</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Jason Trinidad — Visionary Educator & President of TICI
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Jason Trinidad</strong> is the founder, owner, and driving force behind the <strong>Trinidad International Cultural Institute (TICI) • EnglishMiami</strong>. Throughout his career in Miami, Jason has dedicated his life to helping international students, executives, and hospitality professionals overcome language barriers with warmth, humor, and academic excellence.
            </p>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Whether leading lively classroom presentations on smartboards—covering topics from NASA space launches and neurotechnology to Miami architecture—or conducting on-site diploma programs at prestigious institutions like <strong>La Gorce Country Club</strong> in Miami Beach, Jason treats every learner like family.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/#founder"
                className="btn-3d-amber text-xs font-black px-5 py-3 rounded-xl inline-flex items-center gap-2"
              >
                <span>Explore Full Founder Showcase & 3D Frames</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/learn"
                className="btn-3d-emerald text-xs font-black px-5 py-3 rounded-xl inline-flex items-center gap-2"
              >
                <span>Start 3D Learn Path</span>
              </Link>
            </div>
          </div>
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
