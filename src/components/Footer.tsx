import React from 'react';
import Link from 'next/link';
import { BookOpen, Globe, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 px-4 sm:px-6 lg:px-10 transition-colors">
      <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl crest-3d-badge flex items-center justify-center p-1.5 overflow-hidden">
              <img
                src="/images/brand/logo-tici.png"
                alt="TICI • EnglishMiami Official Crest Logo"
                className="w-11 h-11 object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.35)]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-900 text-amber-300 border border-blue-700">
                  TICI
                </span>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  English<span className="text-blue-700 dark:text-blue-400">Miami</span>
                </span>
              </div>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-amber-700 dark:text-amber-400 mt-0.5">
                Founded & Owned by Jason Trinidad
              </span>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-sm text-slate-600 dark:text-slate-400">
            Trinidad International Cultural Institute (TICI) • EnglishMiami is a premier Miami university & ESL academy founded by <strong className="text-slate-900 dark:text-white">Jason Trinidad</strong>, empowering students and luxury hospitality professionals from A0 phonics to C2 mastery.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Globe className="w-4 h-4 text-blue-800" />
            <span>Miami Beach Campus & Global Online Academy • Serving 40+ Countries</span>
          </div>
        </div>

        {/* Curriculum Levels */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            CEFR Curriculum
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">A0 Absolute Beginner</Link></li>
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">A1 Beginner Basics</Link></li>
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">A2 Elementary Everyday</Link></li>
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">B1 Intermediate Fluency</Link></li>
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">B2 Professional Proficiency</Link></li>
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">C1 Advanced Mastery</Link></li>
            <li><Link href="/courses" className="hover:text-blue-900 dark:hover:text-blue-400">C2 Native Command</Link></li>
          </ul>
        </div>

        {/* Labs & Features */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            Academic Labs
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/reading" className="hover:text-blue-900 dark:hover:text-blue-400 font-medium text-blue-900 dark:text-blue-400">Wikipedia & Reading Lab</Link></li>
            <li><Link href="/ai-coach" className="hover:text-blue-900 dark:hover:text-blue-400">Miami AI Academic Coach</Link></li>
            <li><Link href="/speaking" className="hover:text-blue-900 dark:hover:text-blue-400">Speaking & Voice Studio</Link></li>
            <li><Link href="/listening" className="hover:text-blue-900 dark:hover:text-blue-400">Listening Comprehension</Link></li>
            <li><Link href="/writing" className="hover:text-blue-900 dark:hover:text-blue-400">Writing Lab & Grader</Link></li>
            <li><Link href="/vocabulary" className="hover:text-blue-900 dark:hover:text-blue-400">Vocabulary Spaced Repetition</Link></li>
            <li><Link href="/certificates" className="hover:text-blue-900 dark:hover:text-blue-400">CEFR Certificates</Link></li>
          </ul>
        </div>

        {/* Company & Verification */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
            Governance & Verify
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/verify-certificate" className="hover:text-blue-900 dark:hover:text-blue-400 font-medium">Verify Certificate</Link></li>
            <li><Link href="/about" className="hover:text-blue-900 dark:hover:text-blue-400">About EnglishMiami</Link></li>
            <li><Link href="/pricing" className="hover:text-blue-900 dark:hover:text-blue-400">Tuition & Plans</Link></li>
            <li><Link href="/admin" className="hover:text-blue-900 dark:hover:text-blue-400">Faculty & Admin Portal</Link></li>
            <li><Link href="/privacy" className="hover:text-blue-900 dark:hover:text-blue-400">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-900 dark:hover:text-blue-400">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} EnglishMiami Institute of Languages. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-800" />
          <span>CEFR European Standard Aligned Academic System</span>
        </div>
      </div>
    </footer>
  );
}
