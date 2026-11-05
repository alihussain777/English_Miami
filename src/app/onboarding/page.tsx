'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Globe,
  Compass,
  Target,
  Clock,
  Award,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [nativeLanguage, setNativeLanguage] = useState('Spanish');
  const [currentLevel, setCurrentLevel] = useState('A0');
  const [learningGoal, setLearningGoal] = useState('Speaking English');
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState(20);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    'speaking',
    'vocabulary',
    'grammar',
  ]);

  const nativeLanguages = [
    { name: 'Spanish', flag: '🇪🇸', region: 'Spain & Latin America' },
    { name: 'Chinese (Mandarin)', flag: '🇨🇳', region: 'China & East Asia' },
    { name: 'Hindi', flag: '🇮🇳', region: 'India & South Asia' },
    { name: 'Urdu', flag: '🇵🇰', region: 'Pakistan & South Asia' },
    { name: 'Bengali', flag: '🇧🇩', region: 'Bangladesh & India' },
    { name: 'Arabic', flag: '🇦🇪', region: 'Middle East & North Africa' },
    { name: 'Portuguese', flag: '🇧🇷', region: 'Brazil & Portugal' },
    { name: 'French', flag: '🇫🇷', region: 'France & West Africa' },
    { name: 'Russian', flag: '🇷🇺', region: 'Eastern Europe & Central Asia' },
    { name: 'Turkish', flag: '🇹🇷', region: 'Turkey' },
    { name: 'Vietnamese', flag: '🇻🇳', region: 'Vietnam' },
    { name: 'Indonesian', flag: '🇮🇩', region: 'Indonesia' },
  ];

  const levels = [
    { code: 'A0', label: 'Complete Beginner', desc: 'I know zero or very few English words' },
    { code: 'A1', label: 'Beginner', desc: 'I can introduce myself and order simple food' },
    { code: 'A2', label: 'Elementary', desc: 'I understand basic travel and daily routines' },
    { code: 'B1', label: 'Intermediate', desc: 'I can converse comfortably in familiar topics' },
    { code: 'B2', label: 'Upper Intermediate', desc: 'I speak fluently but want professional polish' },
    { code: 'C1', label: 'Advanced / Proficiency', desc: 'I seek native nuance, idioms, and eloquence' },
  ];

  const goals = [
    'Speaking English with Confidence',
    'Job & Workplace Interviews',
    'Travel & Moving Abroad',
    'IELTS / TOEFL Academic Exam',
    'Everyday Social Conversation',
    'University & Academic Studies',
    'Business English & Negotiations',
    'General Long-term Fluency',
  ];

  const times = [
    { min: 10, label: '10 min / day', desc: 'Casual pacing' },
    { min: 20, label: '20 min / day', desc: 'Recommended balance' },
    { min: 30, label: '30 min / day', desc: 'Fast-track progress' },
    { min: 45, label: '45 min / day', desc: 'Intensive immersion' },
    { min: 60, label: '60+ min / day', desc: 'Fluency speedrun' },
  ];

  const skills = [
    { id: 'speaking', label: 'Speaking & Pronunciation' },
    { id: 'vocabulary', label: 'Vocabulary & Idioms' },
    { id: 'grammar', label: 'Grammar & Accuracy' },
    { id: 'listening', label: 'Listening Comprehension' },
    { id: 'reading', label: 'Reading & Articles' },
    { id: 'writing', label: 'Writing & Formal Emails' },
  ];

  const toggleSkill = (id: string) => {
    if (preferredSkills.includes(id)) {
      setPreferredSkills(preferredSkills.filter((s) => s !== id));
    } else {
      setPreferredSkills([...preferredSkills, id]);
    }
  };

  const handleFinish = async (takePlacement: boolean) => {
    setLoading(true);
    try {
      await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nativeLanguage,
          currentLevel,
          learningGoal,
          dailyTargetMinutes,
          preferredSkills,
        }),
      });

      if (takePlacement) {
        router.push('/placement-test');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col justify-center">
        {/* Progress header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Step {step} of 5</span>
            <span className="text-blue-900 dark:text-blue-400 font-bold">{step * 20}% Completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-900 transition-all duration-300 rounded-full"
              style={{ width: `${step * 20}%` }}
            />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 sm:p-10 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* STEP 1: Native Language */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-2">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  What is your native language?
                </h2>
                <p className="text-sm text-slate-500">
                  Miami AI Coach adapts its explanations and translates vocabulary tailored to your mother tongue.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nativeLanguages.map((lang) => (
                  <button
                    key={lang.name}
                    type="button"
                    onClick={() => setNativeLanguage(lang.name)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      nativeLanguage === lang.name
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-2xl mb-1">{lang.flag}</span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{lang.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{lang.region}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Current English Level */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex p-2.5 rounded-2xl bg-coral-50 dark:bg-coral-950 text-coral-600 dark:text-coral-400 mb-2">
                  <Compass className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Estimate your current English level
                </h2>
                <p className="text-sm text-slate-500">
                  Don't worry if you're not sure—you can take our free diagnostic placement test at the end!
                </p>
              </div>

              <div className="space-y-2.5">
                {levels.map((lvl) => (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => setCurrentLevel(lvl.code)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      currentLevel === lvl.code
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-teal-500 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                        {lvl.code}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{lvl.label}</h4>
                        <p className="text-xs text-slate-500">{lvl.desc}</p>
                      </div>
                    </div>
                    {currentLevel === lvl.code && <Check className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Learning Goal */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex p-2.5 rounded-2xl bg-ocean-50 dark:bg-ocean-950 text-ocean-600 dark:text-ocean-400 mb-2">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  What is your main English goal?
                </h2>
                <p className="text-sm text-slate-500">
                  We customize roleplays, dialogue topics, and vocabulary packs around this target.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setLearningGoal(g)}
                    className={`p-4 rounded-2xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                      learningGoal === g
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500 text-teal-900 dark:text-teal-200'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{g}</span>
                    {learningGoal === g && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Daily Study Time & Preferred Skills */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="inline-flex p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Daily Target & Skills Focus
                </h2>
                <p className="text-sm text-slate-500">
                  Consistency beats intensity. Even 15–20 minutes daily yields remarkable fluency in 90 days.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Daily Study Commitment
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {times.map((t) => (
                    <button
                      key={t.min}
                      type="button"
                      onClick={() => setDailyTargetMinutes(t.min)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        dailyTargetMinutes === t.min
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 ring-2 ring-teal-500 text-teal-700 dark:text-teal-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-sm block font-black">{t.min} min</span>
                      <span className="text-[10px] text-slate-400">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Skills you care about most
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {skills.map((s) => {
                    const isSelected = preferredSkills.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkill(s.id)}
                        className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-coral-500 bg-coral-50 dark:bg-coral-950/40 text-coral-700 dark:text-coral-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{s.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-coral-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Launch Plan or Take Diagnostic Placement Test */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-in fade-in duration-200 py-4">
              <div className="inline-flex p-4 rounded-2xl bg-blue-900 text-white shadow-sm">
                <Award className="w-8 h-8 text-blue-200" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Your Curriculum is Tailored!
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  We've configured your path for <strong>{learningGoal}</strong> with native explanations in <strong>{nativeLanguage}</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Selected Starting Level:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-400">Level {currentLevel}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Daily Study Target:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{dailyTargetMinutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Spaced Repetition:</span>
                  <span className="font-bold text-emerald-600">Enabled (SM-2)</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 max-w-md mx-auto">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleFinish(true)}
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  <span>Take Free Diagnostic Test (5 min)</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleFinish(false)}
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Skip test & start Level {currentLevel} directly
                </button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          {step < 5 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
