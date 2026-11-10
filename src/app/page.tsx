'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ArrowRight,
  Brain,
  Mic,
  BookmarkCheck,
  CheckCircle2,
  Headphones,
  BookOpen,
  PenTool,
  Trophy,
  Globe,
  Zap,
  ShieldCheck,
  Star,
  Check,
  GraduationCap,
  Award,
  Volume2,
  Sparkles,
  Flame,
  Compass,
  Play,
} from 'lucide-react';

export default function HomePage() {
  const [activeDemoTab, setActiveDemoTab] = useState<'A0' | 'B1' | 'C2'>('A0');
  const [speakingSample, setSpeakingSample] = useState(false);

  const playNativeAudio = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeakingSample(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingSample(false);
    utterance.onerror = () => setSpeakingSample(false);
    window.speechSynthesis.speak(utterance);
  };

  const heroDemos = {
    A0: {
      badge: 'A0 • Absolute Beginner Phonics',
      prompt: 'Tap the speaker to hear native pronunciation & Urdu/Spanish meaning:',
      phrase: 'Good morning! Nice to meet you.',
      phonetic: '/ɡʊd ˈmɔːr.nɪŋ! naɪs tuː miːt juː/',
      translation: 'صبح بخیر! آپ سے مل کر خوشی ہوئی۔ • ¡Buenos días! Mucho gusto.',
      tip: 'Notice the long "ee" vowel sound in "meet" (/miːt/).',
      xp: '+15 XP',
    },
    B1: {
      badge: 'B1 • Career & Interview Fluency',
      prompt: 'Workplace Grammar & Tense Precision:',
      phrase: 'I have been managing cross-functional teams for three years.',
      phonetic: '/aɪ hæv bɪn ˈmæn.ɪ.dʒɪŋ krɒs-ˈfʌŋk.ʃən.əl tiːmz/',
      translation: 'میں تین سال سے مختلف ٹیموں کی قیادت کر رہا ہوں۔',
      tip: 'Use Present Perfect Continuous ("have been + -ing") for actions that started in the past and continue now.',
      xp: '+25 XP',
    },
    C2: {
      badge: 'C2 • Executive & Academic Mastery',
      prompt: 'Advanced Negative Inversion & Diplomatic Rhetoric:',
      phrase: 'Seldom have we witnessed such a transformative technological shift.',
      phonetic: '/ˈsel.dəm hæv wiː ˈwɪt.nəst sʌtʃ ə trænsˈfɔː.mə.tɪv ʃɪft/',
      translation: 'ہم نے شاذ و نادر ہی ایسی انقلابی تکنیکی تبدیلی دیکھی ہے۔',
      tip: 'Placing a negative adverbial ("Seldom") at the start triggers subject-auxiliary inversion ("have we").',
      xp: '+50 XP',
    },
  };

  const cefrLevels = [
    {
      code: 'A0',
      title: 'Absolute Zero',
      desc: '26 Alphabet letters, short & long vowels, phonics sounds, survival greetings & numbers 1–100.',
      color: 'from-emerald-500 to-emerald-700',
      shadow: 'shadow-[0_6px_0_0_#047857]',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      code: 'A1',
      title: 'Beginner',
      desc: 'Daily routines, introductions, family, food, shopping & present simple sentence building.',
      color: 'from-teal-500 to-teal-700',
      shadow: 'shadow-[0_6px_0_0_#0f766e]',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    },
    {
      code: 'A2',
      title: 'Elementary',
      desc: 'Airport transit, hotel check-in, past experiences, health appointments & future plans.',
      color: 'from-cyan-600 to-cyan-800',
      shadow: 'shadow-[0_6px_0_0_#155e75]',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    },
    {
      code: 'B1',
      title: 'Intermediate',
      desc: 'Job interviews, professional emails, conditional clauses & persuasive storytelling.',
      color: 'from-blue-600 to-blue-800',
      shadow: 'shadow-[0_6px_0_0_#1e40af]',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      code: 'B2',
      title: 'Upper Inter.',
      desc: 'Business negotiations, keynote presentations, idioms, phrasal verbs & passive voice.',
      color: 'from-indigo-600 to-indigo-800',
      shadow: 'shadow-[0_6px_0_0_#3730a3]',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    {
      code: 'C1',
      title: 'Advanced',
      desc: 'Negative inversion, diplomatic tact, IELTS/Cambridge essays & subtle academic rhetoric.',
      color: 'from-purple-600 to-purple-800',
      shadow: 'shadow-[0_6px_0_0_#6b21a8]',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      code: 'C2',
      title: 'Proficiency',
      desc: 'Near-native mastery, subtle irony, litotes, executive leadership & complex syntax.',
      color: 'from-amber-500 to-amber-700',
      shadow: 'shadow-[0_6px_0_0_#b45309]',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  ];

  const skillsList = [
    {
      title: '3D Gamified Learn Path',
      desc: 'Interactive stepping stones, phonics study sheets, word banks, and instant XP rewards.',
      icon: Compass,
      href: '/learn',
      accent: 'bg-emerald-500 shadow-[0_4px_0_0_#047857]',
    },
    {
      title: 'Speaking Lab & Speech AI',
      desc: 'Real-time voice recognition with syllable-level pronunciation accuracy scoring.',
      icon: Mic,
      href: '/speaking',
      accent: 'bg-blue-600 shadow-[0_4px_0_0_#1e3a8a]',
    },
    {
      title: 'Wikipedia Real-World Reader',
      desc: 'Read live encyclopedic articles with audio narration and 1-click vocabulary extraction.',
      icon: Globe,
      href: '/reading',
      accent: 'bg-indigo-600 shadow-[0_4px_0_0_#3730a3]',
    },
    {
      title: 'SRS Vocabulary Bank',
      desc: 'SuperMemo SM-2 spaced repetition flashcards with native audio and Urdu/Spanish meanings.',
      icon: BookmarkCheck,
      href: '/vocabulary',
      accent: 'bg-amber-500 shadow-[0_4px_0_0_#b45309]',
    },
    {
      title: 'Contextual Grammar Studio',
      desc: 'Visual rule mechanics, interactive tense drills, and common error diagnostics.',
      icon: CheckCircle2,
      href: '/grammar',
      accent: 'bg-teal-600 shadow-[0_4px_0_0_#0f766e]',
    },
    {
      title: 'Listening Comprehension',
      desc: 'Native dialogues with variable speed control (0.65x turtle to 1.2x) and dictation.',
      icon: Headphones,
      href: '/listening',
      accent: 'bg-cyan-600 shadow-[0_4px_0_0_#155e75]',
    },
    {
      title: 'Academic Writing Lab',
      desc: 'IELTS & Cambridge level evaluation, grammar correction, and lexical upgrades.',
      icon: PenTool,
      href: '/writing',
      accent: 'bg-purple-600 shadow-[0_4px_0_0_#6b21a8]',
    },
    {
      title: 'Miami AI 24/7 Coach',
      desc: 'Interactive roleplay tutor powered by Google Gemini for interviews & daily conversation.',
      icon: Brain,
      href: '/ai-coach',
      accent: 'bg-rose-600 shadow-[0_4px_0_0_#9f1239]',
    },
  ];

  const testimonials = [
    {
      name: 'Muhammad Ali',
      country: 'Pakistan',
      flag: '🇵🇰',
      role: 'Full-Stack Software Engineer',
      native: 'Urdu',
      quote:
        'A0 se le kar C1 tak ka safar itna smooth aur interactive hai ke bilkul asli Duolingo aur Oxford Academy ka combination lagta hai. Har lafz ki audio aur Urdu translation ne meri fluency 10x barha di.',
    },
    {
      name: 'Li Wei',
      country: 'China',
      flag: '🇨🇳',
      role: 'Senior Systems Architect',
      native: 'Mandarin',
      quote:
        'EnglishMiami helped me pass my international tech interview. The 3D learning path and AI Coach corrected my tense errors patiently and gave me real confidence.',
    },
    {
      name: 'Camila Santos',
      country: 'Brazil',
      flag: '🇧🇷',
      role: 'Product Marketing Lead',
      native: 'Portuguese',
      quote:
        'The tactile 3D study cards, phonics guidebooks, and Spaced Repetition engine make studying addictive. I remember 95% of every unit I complete.',
    },
    {
      name: 'Priya Sharma',
      country: 'India',
      flag: '🇮🇳',
      role: 'Corporate Strategy Consultant',
      native: 'Hindi',
      quote:
        'The C1 and C2 modules on negative inversion and executive rhetoric are unmatched. The UI feels ultra-responsive, clean, and crafted with real engineering care.',
    },
  ];

  const faqs = [
    {
      q: 'Can I start if I know zero English (A0 level)?',
      a: 'Yes! Our A0 Foundation track starts right from the 26 English alphabet letters, short and long vowel phonics, numbers 1–100, and survival greetings with interactive audio and Urdu, Hindi, Spanish, and Arabic translations.',
    },
    {
      q: 'How does the 3D Duolingo Learning Path work?',
      a: 'Every unit features interactive 3D stepping stones. Tapping any node opens a comprehensive Study Sheet with Theory & Phonics, Vocabulary Flashcards with audio, and Conversational Phrases before you jump into gamified exercises.',
    },
    {
      q: 'What is the Wikipedia Real-World Reader?',
      a: 'Our reading studio connects live to Wikipedia. You can search any topic (Science, AI, History, Business), listen to native text-to-speech narration, inspect CEFR difficulty, and save new words in one click.',
    },
    {
      q: 'Are the CEFR Certificates verifiable online?',
      a: 'Yes. Upon completing a CEFR level and passing the assessment, you receive an official EnglishMiami Certificate with a unique verification code that employers and universities can verify online.',
    },
  ];

  const currentDemo = heroDemos[activeDemoTab];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* =====================================================================
          HERO SECTION: 3D INTERACTIVE SHOWCASE & FLOATING PERSPECTIVE CARDS
         ===================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-24 lg:pt-16 lg:pb-32 border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 bg-grid-pattern hero-mesh">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* LEFT COLUMN: HEADLINE & 3D TACTILE CTAS */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Floating 3D Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-extrabold border-2 border-blue-200 dark:border-blue-800 shadow-[0_4px_0_0_#bfdbfe] dark:shadow-[0_4px_0_0_#1e3a8a]">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>CEFR A0 to C2 • Interactive 3D Learning Path & AI Speech Lab</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.06]">
                Master English from{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Zero Phonics
                </span>{' '}
                to Native Fluency.
              </h1>

              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Experience a tactile 3D learning path engineered for serious learners. Master alphabet phonics, bilingual vocabulary with native audio, live Wikipedia reading, and 24/7 AI speaking practice.
              </p>

              {/* 3D Tactile CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  href="/learn"
                  className="btn-3d-emerald w-full sm:w-auto text-base font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 group uppercase tracking-wide"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start 3D Learn Path</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/courses"
                  className="btn-3d-secondary w-full sm:w-auto text-base font-extrabold px-7 py-4 rounded-2xl flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Explore A0–C2 Curriculum</span>
                </Link>
              </div>

              {/* Tactile 3D Metric Pills */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto lg:mx-0">
                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                    A0–C2
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">7 Levels</div>
                    <div className="text-[10px] font-bold text-slate-500">55+ Interactive Units</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">Native Audio</div>
                    <div className="text-[10px] font-bold text-slate-500">IPA & Phonics</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">3D Quests</div>
                    <div className="text-[10px] font-bold text-slate-500">Streaks & Chests</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">Verified</div>
                    <div className="text-[10px] font-bold text-slate-500">CEFR Certificates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 3D FLOATING INTERACTIVE PHONICS & LESSON STUDIO */}
            <div className="lg:col-span-5 relative perspective-1000">
              {/* Floating 3D Badge Top-Left */}
              <div className="hidden sm:flex absolute -top-6 -left-6 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-400 text-slate-950 font-black text-xs border-2 border-amber-300 shadow-[0_5px_0_0_#b45309] animate-float-slow">
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>14 DAY STREAK ACTIVE!</span>
              </div>

              {/* Floating 3D Badge Bottom-Right */}
              <div className="hidden sm:flex absolute -bottom-5 -right-4 z-20 items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500 text-white font-black text-xs border-2 border-emerald-300 shadow-[0_5px_0_0_#047857] animate-float-delayed">
                <CheckCircle2 className="w-4 h-4" />
                <span>A0 PHONICS READY • 100% FREE</span>
              </div>

              {/* Main 3D Interactive Studio Card */}
              <div className="relative mx-auto max-w-lg card-3d p-6 sm:p-7 space-y-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-[0_10px_0_0_#cbd5e1,0_25px_50px_-12px_rgba(15,23,42,0.2)] dark:shadow-[0_10px_0_0_#1e293b,0_25px_50px_-12px_rgba(0,0,0,0.7)]">
                {/* Studio Top Bar */}
                <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-blue-600 to-blue-800 text-white flex items-center justify-center font-black text-sm shadow-[0_4px_0_0_#1e3a8a]">
                      3D
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm">
                        Interactive Lesson Preview
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Tap a level below to test live audio
                      </p>
                    </div>
                  </div>

                  {/* Level Switcher Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    {(['A0', 'B1', 'C2'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setActiveDemoTab(lvl)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          activeDemoTab === lvl
                            ? 'bg-blue-700 text-white shadow-[0_2px_0_0_#1e3a8a]'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Demo Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {currentDemo.badge}
                    </span>
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                      {currentDemo.xp}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {currentDemo.prompt}
                  </p>

                  {/* 3D Phrase Audio Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          "{currentDemo.phrase}"
                        </p>
                        <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {currentDemo.phonetic}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => playNativeAudio(currentDemo.phrase)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                          speakingSample
                            ? 'bg-emerald-500 text-white translate-y-0.5 shadow-[0_2px_0_0_#047857]'
                            : 'bg-blue-700 hover:bg-blue-600 text-white shadow-[0_4px_0_0_#1e3a8a] hover:-translate-y-0.5 active:translate-y-0.5'
                        }`}
                        title="Listen to native pronunciation"
                      >
                        <Volume2 className={`w-6 h-6 ${speakingSample ? 'animate-bounce' : ''}`} />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      {currentDemo.translation}
                    </div>
                  </div>

                  {/* Phonics / Grammar Note */}
                  <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="font-extrabold text-amber-800 dark:text-amber-300">💡 Study Sheet Tip: </strong>
                    {currentDemo.tip}
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-2 flex items-center justify-between border-t-2 border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500">
                    Includes Theory, Audio & Quizzes
                  </span>
                  <Link
                    href="/learn"
                    className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Full A0 Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEVEN-LEVEL CEFR 3D CURRICULUM EXPLORER (A0 TO C2)
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Structured CEFR Roadmap
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Seven 3D Stages to Complete Mastery
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
              Click any CEFR level below to inspect its units or jump straight into the interactive learning path.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {cefrLevels.map((lvl, idx) => (
              <Link
                href="/learn"
                key={lvl.code}
                className="card-3d card-3d-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-b ${lvl.color} text-white font-black text-lg flex items-center justify-center ${lvl.shadow} group-hover:scale-105 transition-transform`}
                    >
                      {lvl.code}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${lvl.badgeBg}`}>
                      Stage {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {lvl.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-blue-700 dark:text-blue-400">
                  <span>Start {lvl.code}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/placement-test"
              className="btn-3d-primary text-sm font-extrabold px-7 py-3.5 rounded-2xl inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Not sure where to start? Take the 5-Minute Placement Test</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8 CORE COMPETENCIES: 3D BENTO GRID
         ===================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y-2 border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              All-In-One Language Ecosystem
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              8 Interactive Labs Built for Real Fluency
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
              Every tool you need to read, write, listen, and speak English with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillsList.map((skill) => {
              const Icon = skill.icon;
              return (
                <Link
                  href={skill.href}
                  key={skill.title}
                  className="card-3d card-3d-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${skill.accent} text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {skill.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {skill.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-400">
                    <span>Launch Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PRICING SECTION: 3D TACTILE PLANS
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Transparent Tuition Plans
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Start Free. Upgrade Anytime.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
              Complete A0 and A1 foundational tracks are 100% free forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Starter */}
            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Foundational lessons for absolute beginners.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Complete A0 & A1 3D Learn Path</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Full Theory, Phonics & Audio Cards</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 10 AI Coach chats / day</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Wikipedia ESL Reader access</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Daily vocabulary flashcards</li>
                </ul>
              </div>
              <Link
                href="/learn"
                className="mt-8 block text-center py-3.5 rounded-2xl font-extrabold text-xs btn-3d-secondary uppercase tracking-wider"
              >
                Start Learning Free
              </Link>
            </div>

            {/* Weekly Pro */}
            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Weekly Sprint</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Ideal for fast job interview or exam prep.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$6.99</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ week</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> All CEFR levels (A0 to C2)</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Unlimited AI Coach & Grammar Doctor</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> 60 min speaking practice daily</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Roleplay conversation scenarios</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Cancel anytime in 1 click</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 block text-center py-3.5 rounded-2xl font-extrabold text-xs btn-3d-secondary uppercase tracking-wider"
              >
                Choose Weekly Pro
              </Link>
            </div>

            {/* Monthly Pro (Featured 3D Card) */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-[0_8px_0_0_#059669,0_20px_35px_-10px_rgba(5,150,105,0.25)] flex flex-col justify-between -translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                ★ Most Popular • Recommended
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Monthly Pro</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Full comprehensive fluency & certification.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">$19.99</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited Access to All 7 CEFR Levels</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited AI Coach & Speech Labs</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Live Wikipedia ESL Reading Studio</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Cambridge/IELTS Writing Lab grading</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Official Verifiable CEFR Certificates</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 btn-3d-emerald block text-center py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider"
              >
                Start Monthly Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          LEARNER TESTIMONIALS
         ===================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t-2 border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Global Student Community
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Loved by Learners Across 40+ Countries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="card-3d p-7 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-lg">{t.flag}</span>
                      <span>{t.name}</span>
                    </h4>
                    <p className="text-xs font-semibold text-slate-500">{t.role} • Native {t.native}</p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {t.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FAQ SECTION
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card-3d p-6">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FINAL 3D CTA BANNER
         ===================================================================== */}
      <section className="py-20 bg-gradient-to-b from-blue-900 to-slate-950 text-white relative overflow-hidden border-t-2 border-blue-800">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Start Your 3D English Journey?
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto font-medium">
            Jump straight into A0 Phonics & Greetings or test your level in 5 minutes.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/learn"
              className="btn-3d-emerald text-sm font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Open 3D Learn Path Now</span>
            </Link>
            <Link
              href="/signup"
              className="btn-3d-amber text-sm font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
