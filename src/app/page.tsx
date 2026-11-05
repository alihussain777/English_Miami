import React from 'react';
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
  Users,
  Check,
  GraduationCap,
  Award,
} from 'lucide-react';

export default function HomePage() {
  const cefrLevels = [
    { code: 'A0', title: 'Absolute Zero', desc: 'Alphabet, phonics, essential greetings, numbers & foundational words.' },
    { code: 'A1', title: 'Beginner', desc: 'Daily routines, introductions, family, food, shopping & present simple.' },
    { code: 'A2', title: 'Elementary', desc: 'Travel, past experiences, airport/hotel transit, health & future plans.' },
    { code: 'B1', title: 'Intermediate', desc: 'Workplace interviews, business emails, conditionals & storytelling.' },
    { code: 'B2', title: 'Upper Intermediate', desc: 'Negotiations, keynote presentations, idioms, phrasal verbs & passive voice.' },
    { code: 'C1', title: 'Advanced', desc: 'Negative inversion, diplomatic tact, academic essays & subtle rhetoric.' },
    { code: 'C2', title: 'Proficiency', desc: 'Near-native mastery, subtle irony, litotes & complex contractual syntax.' },
  ];

  const skillsList = [
    { title: 'Speaking Lab', desc: 'Voice recognition analysis with pronunciation precision scoring.', icon: Mic },
    { title: 'Wikipedia Real-World Reader', desc: 'Read live encyclopedic articles with audio reader and vocabulary extraction.', icon: Globe },
    { title: 'SRS Vocabulary Bank', desc: 'SuperMemo SM-2 spaced repetition engine for long-term retention.', icon: BookmarkCheck },
    { title: 'Contextual Grammar', desc: 'Rule mechanics, interactive drills, and common pitfall analyses.', icon: CheckCircle2 },
    { title: 'Listening Comprehension', desc: 'Real native conversations, speed control (0.8x-1.2x), and dictation.', icon: Headphones },
    { title: 'Academic Writing Lab', desc: 'IELTS/Cambridge level evaluation, grammar correction, and style suggestions.', icon: PenTool },
    { title: 'Miami AI Coach', desc: 'Patient 24/7 tutor powered by Google Gemini for roleplay & instant answers.', icon: Brain },
    { title: 'Accredited Certificates', desc: 'Official CEFR certificates with unique IDs and online verification.', icon: Award },
  ];

  const testimonials = [
    {
      name: 'Li Wei',
      country: 'China',
      flag: '🇨🇳',
      role: 'Senior Software Engineer',
      native: 'Mandarin',
      quote:
        'EnglishMiami helped me pass my tech job interview in English. The AI Coach corrected my tenses patiently and gave me the confidence to speak fluently during cross-border architecture reviews.',
    },
    {
      name: 'Camila Santos',
      country: 'Brazil',
      flag: '🇧🇷',
      role: 'Product Marketing Lead',
      native: 'Portuguese',
      quote:
        'The Spaced Repetition vocabulary engine and post-lesson assessments are remarkable. For the first time, I remember 95% of the words I study. The calm Oxford layout is a breath of fresh air.',
    },
    {
      name: 'Muhammad Ali',
      country: 'Pakistan',
      flag: '🇵🇰',
      role: 'Full-Stack Developer',
      native: 'Urdu',
      quote:
        'The Wikipedia Reader integration is a game-changer. Being able to read real English articles with instant audio playback and save technical terms directly to my SRS bank accelerated my vocabulary ten-fold.',
    },
    {
      name: 'Priya Sharma',
      country: 'India',
      flag: '🇮🇳',
      role: 'Corporate Strategy Consultant',
      native: 'Hindi',
      quote:
        'The C1 and C2 modules on negative inversion and diplomatic hedging are unparalleled. The academic rigor here matches high-end British and American universities.',
    },
  ];

  const faqs = [
    {
      q: 'Can I start if I know zero English (A0 level)?',
      a: 'Yes, absolutely. EnglishMiami starts right from the 26 alphabet letters, phonics, numbers, and basic survival greetings with clear translations for your native language.',
    },
    {
      q: 'What is the Wikipedia Real-World Reader?',
      a: 'Our reading lab connects directly to Wikipedia. You can search any topic (AI, History, Space, Business, Medicine), read live summaries, listen to audio narration, view CEFR reading levels, and save extracted vocabulary with one click.',
    },
    {
      q: 'How does the certificate approval workflow function?',
      a: 'When you complete a CEFR level and achieve the required test score, you submit an application. Our Academic Board reviews your submissions, assigns an official standing grade (Distinction, Merit, Pass), and issues a verifiable certificate with a unique online registry ID.',
    },
    {
      q: 'How does the Miami AI Coach work?',
      a: 'Miami AI Coach is powered by Google Gemini. It adapts to your CEFR level, remembers your common grammatical mistakes, explains rules clearly, and conducts simulated professional scenarios (job interviews, hotel check-in, business negotiations).',
    },
    {
      q: 'Is there a free tier available?',
      a: 'Yes. You can access the Free Starter plan with complete A0 and A1 courses, basic AI Coach sessions, and daily vocabulary tests without ever entering credit card details.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 text-xs sm:text-sm font-semibold border border-oxford-200 dark:border-oxford-800">
                <GraduationCap className="w-4 h-4 text-oxford-600 dark:text-oxford-400" />
                <span>CEFR Aligned Curriculum • Absolute Beginner (A0) to Proficiency (C2)</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                Master the English Language with{' '}
                <span className="text-oxford-700 dark:text-oxford-400">
                  Academic Precision.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                A serious, full-stack educational platform built for learners across China, India, Pakistan, Brazil, the Middle East, Spain, and Latin America. Learn vocabulary, grammar, pronunciation, live Wikipedia reading, and fluent conversations.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="btn-primary w-full sm:w-auto text-base font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2 group"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/courses"
                  className="btn-secondary w-full sm:w-auto text-base font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-5 h-5 text-oxford-600 dark:text-oxford-400" />
                  <span>Explore Curriculum (A0–C2)</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Placement Test</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Live Wikipedia ESL Reader</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verifiable Academic Certificates</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Coach & Reading Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-lg space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-oxford-800 text-white flex items-center justify-center font-bold text-sm">
                      EM
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">Miami AI English Coach</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Ready to practice</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-oxford-100 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300">
                    Live Demo
                  </span>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-3 text-xs">
                  {/* User message with error */}
                  <div className="flex justify-end">
                    <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl rounded-tr-none px-3.5 py-2.5 max-w-[85%] text-slate-800 dark:text-slate-200 font-medium">
                      "I have went to the hospital yesterday."
                    </div>
                  </div>

                  {/* AI Coach correction response */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-oxford-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      AI
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl rounded-tl-none p-3.5 space-y-2 text-slate-800 dark:text-slate-200 leading-relaxed shadow-sm">
                      <p className="font-bold text-oxford-700 dark:text-oxford-400">
                        Grammar Correction:
                      </p>
                      <p>
                        Instead of <span className="line-through text-slate-400">have went</span>, say:
                        <br />
                        <strong className="text-emerald-700 dark:text-emerald-400 font-bold">"I went to the hospital yesterday."</strong>
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        <strong>Explanation:</strong> The past simple of "go" is "went". When a finished time marker like <em>yesterday</em> is specified, always use Past Simple rather than Present Perfect.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive bottom bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-oxford-600" />
                    <span className="text-xs font-semibold text-slate-500">Voice Recognition Enabled</span>
                  </div>
                  <Link
                    href="/ai-coach"
                    className="text-xs font-bold text-oxford-700 dark:text-oxford-400 hover:underline flex items-center gap-1"
                  >
                    <span>Try Full Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why EnglishMiami? Complete Educational Engine */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              Complete Educational Architecture
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built for Serious Academic & Career Fluency
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Not a gamified toy. EnglishMiami gives you structured linguistics, voice feedback, spaced repetition memory, and authentic English texts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-6 border border-oxford-200 dark:border-oxford-800">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Live Wikipedia ESL Reader</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Read real-world articles on science, history, space, and tech. Includes built-in Text-to-Speech audio reader, CEFR difficulty tags, and one-click vocabulary extraction.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-6 border border-oxford-200 dark:border-oxford-800">
                <Mic className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Speaking Lab & Speech AI</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Browser-based speech recognition analyzes your spoken English against phonetic transcripts, detecting missing syllables and score accuracy.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-6 border border-oxford-200 dark:border-oxford-800">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">SuperMemo SM-2 Vocabulary</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Spaced repetition memory algorithm schedules reviews precisely before you forget. Includes phonetic audio, parts of speech, and multilingual translations.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-6 border border-oxford-200 dark:border-oxford-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Contextual Grammar Units</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Understand the "why" behind tenses, modal verbs of deduction, conditional structures, and negative inversions with interactive rule breakdowns.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-6 border border-oxford-200 dark:border-oxford-800">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Miami AI Conversational Coach</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Simulate job interviews, airport departures, restaurant dining, and business negotiations with instant linguistic feedback and error corrections.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center mb-6 border border-oxford-200 dark:border-oxford-800">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verifiable CEFR Credentials</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Pass end-of-level evaluations to earn official EnglishMiami Certificates reviewed by our Academic Board. Instantly verifiable online for employers and universities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Journey: A0 to C2 */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              Clear Path to Fluency
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              The Seven-Level CEFR Curriculum
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              From absolute zero phonics to near-native literary dexterity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {cefrLevels.map((lvl, idx) => (
              <div
                key={lvl.code}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-oxford-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-oxford-700 dark:text-oxford-400">
                    {lvl.code}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1 mb-2">{lvl.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{lvl.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-bold text-oxford-600 dark:text-oxford-400">
                  Stage {idx + 1} of 7
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/placement-test"
              className="btn-primary text-sm font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Take Free 5-Minute Placement Test</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Skills Showcase */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              Master All 8 Core Competencies
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Holistic Language Mastery
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillsList.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.title}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-oxford-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 border border-oxford-200 dark:border-oxford-800 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{skill.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{skill.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              Transparent Tuition Plans
            </h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Invest in Your Fluency Today
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-400">
              Start 100% free. Upgrade anytime for unlimited AI coaching, speech practice, and official certification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xl text-slate-900 dark:text-white">Free Starter</h4>
                <p className="text-xs text-slate-500 mt-1">Foundational lessons for absolute beginners.</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> A0 & A1 Beginner Courses</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 10 AI Coach chats / day</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 5 min speaking practice / day</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Wikipedia ESL Reader access</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Basic vocabulary tests</li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-2.5 rounded-xl font-semibold text-xs btn-secondary"
              >
                Get Started Free
              </Link>
            </div>

            {/* Weekly Pro */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xl text-slate-900 dark:text-white">Weekly Pro</h4>
                <p className="text-xs text-slate-500 mt-1">Ideal for fast interview or exam preparation.</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$6.99</span>
                  <span className="text-xs text-slate-500 ml-1">/ week</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> All CEFR levels (A0 to C2)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Unlimited AI Coach & Grammar Doctor</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> 60 min speaking practice daily</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Roleplay conversation scenarios</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Cancel anytime with 1 click</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 block text-center py-2.5 rounded-xl font-semibold text-xs btn-secondary text-oxford-700 dark:text-oxford-300 border-oxford-300"
              >
                Choose Weekly Pro
              </Link>
            </div>

            {/* Monthly Pro (Featured) */}
            <div className="relative p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-oxford-600 dark:border-oxford-500 shadow-md flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-oxford-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular • Recommended
              </div>
              <div>
                <h4 className="font-bold text-xl text-slate-900 dark:text-white">Monthly Pro</h4>
                <p className="text-xs text-slate-500 mt-1">Full comprehensive fluency package.</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-oxford-700 dark:text-oxford-400">$19.99</span>
                  <span className="text-xs text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2 font-semibold"><Check className="w-4 h-4 text-oxford-600" /> Unlimited Everything</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Unlimited AI Coach & Speech Labs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Live Wikipedia ESL Reading Studio</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Cambridge/IELTS Writing Lab grading</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Official Verifiable CEFR Certificates</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 btn-primary block text-center py-3 rounded-xl font-bold text-xs"
              >
                Start Monthly Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              International Learner Stories
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Authentic Reviews Worldwide
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{t.flag}</span>
                      <span>{t.name}</span>
                    </h5>
                    <p className="text-xs text-slate-500">{t.role} • Native {t.native}</p>
                  </div>
                  <span className="text-xs font-semibold text-oxford-600 dark:text-oxford-400">{t.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              Got Questions?
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 bg-oxford-900 text-white relative overflow-hidden border-t border-oxford-950">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Speak Fluent English with Confidence?
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Join thousands of ambitious international students and professionals on EnglishMiami.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="bg-white text-oxford-900 hover:bg-slate-100 font-bold text-sm px-8 py-4 rounded-xl shadow-lg inline-flex items-center gap-2"
            >
              <span>Get Started Now (It's Free)</span>
              <ArrowRight className="w-4 h-4 text-oxford-700" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
