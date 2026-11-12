'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import SpeechRecognitionButton from '@/components/SpeechRecognitionButton';
import {
  Mic,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Gauge,
  RotateCcw,
  Award,
} from 'lucide-react';
import { UserSession } from '@/types';
import { playSuccessSound, playErrorSound } from '@/lib/audio-feedback';
import {
  speakRealisticText,
  stopSpeaking,
  evaluateSpokenAccuracy,
  SpokenEvaluationResult,
} from '@/lib/voice-engine';

interface SpeakingModule {
  id: string;
  level: string;
  category: string;
  title: string;
  prompt: string;
  stressGuide: string;
  phoneticGuide: string;
  intonationTip: string;
  mouthPositionTip: string;
  keyWords: Array<{
    word: string;
    ipa: string;
    tip: string;
  }>;
}

const SPEAKING_MODULES: SpeakingModule[] = [
  {
    id: 'spk-a0-1',
    level: 'A0',
    category: 'First Words & Polite Greetings',
    title: 'Introducing Yourself Politely',
    prompt: 'Hello, my name is Alex and it is very nice to meet you today.',
    stressGuide: 'Hel-LO, my NAME is AL-ex and it is VER-y NICE to MEET you to-DAY.',
    phoneticGuide: '/həˈloʊ maɪ neɪm ɪz ˈælɛks ænd ɪt ɪz ˈvɛri naɪs tuː miːt juː təˈdeɪ/',
    intonationTip: 'Pause briefly after "Alex", stress "VERY NICE", and let your voice fall gently at the end of "today".',
    mouthPositionTip: 'For "meet" (/miːt/), smile slightly to stretch the long /iː/ vowel and tap your tongue behind your upper teeth for the final /t/.',
    keyWords: [
      { word: 'Hello', ipa: '/həˈloʊ/', tip: 'Round your lips at the end of the long O sound.' },
      { word: 'Name', ipa: '/neɪm/', tip: 'Close your lips completely for the final M sound.' },
      { word: 'Meet', ipa: '/miːt/', tip: 'Long E vowel followed by a crisp T sound.' },
    ],
  },
  {
    id: 'spk-a1-1',
    level: 'A1',
    category: 'Cafe & Everyday Orders',
    title: 'Ordering Coffee & Breakfast in Miami',
    prompt: 'Good morning, I would like a hot cup of coffee with milk, please.',
    stressGuide: 'Good MOR-ning, I would LIKE a HOT CUP of COF-fee with MILK, PLEASE.',
    phoneticGuide: '/ɡʊd ˈmɔːrnɪŋ aɪ wʊd laɪk ə hɑːt kʌp əv ˈkɔːfi wɪð mɪlk pliːz/',
    intonationTip: 'Link "cup of" smoothly so it sounds like "cup-uh". Use a warm, rising tone on "please" at the end.',
    mouthPositionTip: 'In "would" (/wʊd/), the L is silent! Round your lips like "wood". For "with", place the tip of your tongue lightly between your teeth.',
    keyWords: [
      { word: 'Morning', ipa: '/ˈmɔːrnɪŋ/', tip: 'Stress the first syllable MOR-' },
      { word: 'Would', ipa: '/wʊd/', tip: 'Silent L — rhymes with "good".' },
      { word: 'Coffee', ipa: '/ˈkɔːfi/', tip: 'Open your jaw on COF- and end with a clear -EE.' },
    ],
  },
  {
    id: 'spk-a2-1',
    level: 'A2',
    category: 'Travel & Directions',
    title: 'Asking for Directions at the Airport',
    prompt: 'Excuse me, could you tell me how to get to the international terminal?',
    stressGuide: 'Ex-CUSE me, COULD you TELL me HOW to GET to the in-ter-NA-tion-al TER-mi-nal?',
    phoneticGuide: '/ɪkˈskjuːz miː kʊd juː tɛl miː haʊ tə ɡɛt tə ðə ˌɪntərˈnæʃnəl ˈtɜːrmɪnl/',
    intonationTip: 'Start with a polite rising pitch on "Excuse me", then stress "TELL", "GET", and "-NA-" in international.',
    mouthPositionTip: 'In "international", the "-tion-" is pronounced /ʃən/ ("shun"). Do not pronounce the T as a hard T.',
    keyWords: [
      { word: 'Excuse', ipa: '/ɪkˈskjuːz/', tip: 'Ends with a vibrating Z sound (/z/), not S.' },
      { word: 'International', ipa: '/ˌɪntərˈnæʃnəl/', tip: 'Primary stress is on the third syllable: -NA-.' },
      { word: 'Terminal', ipa: '/ˈtɜːrmɪnl/', tip: 'Curl your tongue slightly for the American R in TER-.' },
    ],
  },
  {
    id: 'spk-b1-1',
    level: 'B1',
    category: 'Workplace & Interviews',
    title: 'Sharing Project Updates in a Team Meeting',
    prompt: 'I have been practicing English every morning to improve my professional communication skills.',
    stressGuide: 'I have been PRAC-ti-cing ENG-lish EV-ery MOR-ning to im-PROVE my pro-FES-sion-al com-mu-ni-CA-tion SKILLS.',
    phoneticGuide: '/aɪ hæv bɪn ˈpræktɪsɪŋ ˈɪŋɡlɪʃ ˈɛvri ˈmɔːrnɪŋ tuː ɪmˈpruːv maɪ prəˈfɛʃənl kəˌmjuːnɪˈkeɪʃn skɪlz/',
    intonationTip: 'Reduce "have been" to a quick, natural rhythm (/həv bɪn/), and place strong emphasis on "IM-PROVE" and "SKILLS".',
    mouthPositionTip: 'In "every" (/ˈɛvri/), native speakers use 2 syllables ("EV-ree"), not 3. For "skills", make sure the final Z sound (/z/) is audible.',
    keyWords: [
      { word: 'Practicing', ipa: '/ˈpræktɪsɪŋ/', tip: 'Stress PRAC- and keep the middle vowel short.' },
      { word: 'Professional', ipa: '/prəˈfɛʃənl/', tip: 'First syllable is a relaxed schwa: "pruh-FESH-nul".' },
      { word: 'Communication', ipa: '/kəˌmjuːnɪˈkeɪʃn/', tip: 'Main stress falls on -CA- (/keɪ/).' },
    ],
  },
  {
    id: 'spk-b2-1',
    level: 'B2',
    category: 'Business & Technology',
    title: 'Discussing Remote Work & Global Collaboration',
    prompt: 'Remote collaboration allows international teams to solve complex engineering problems together.',
    stressGuide: 'Re-MOTE col-la-bo-RA-tion al-LOWS in-ter-NA-tion-al TEAMS to SOLVE COM-plex en-gi-NEER-ing PROB-lems to-GETH-er.',
    phoneticGuide: '/rɪˈmoʊt kəˌlæbəˈreɪʃn əˈlaʊz ˌɪntərˈnæʃnəl tiːmz tə sɑːlv ˈkɑːmplɛks ˌɛndʒɪˈnɪrɪŋ ˈprɑːbləmz təˈɡɛðər/',
    intonationTip: 'Group the sentence into three thought chunks: "Remote collaboration allows / international teams / to solve complex engineering problems together."',
    mouthPositionTip: 'For "together" (/təˈɡɛðər/), voice the soft TH (/ð/) by vibrating your vocal cords with your tongue touching your upper teeth.',
    keyWords: [
      { word: 'Collaboration', ipa: '/kəˌlæbəˈreɪʃn/', tip: 'Stress -RA- right before the -tion ending.' },
      { word: 'Complex', ipa: '/ˈkɑːmplɛks/', tip: 'Clear K and X (/ks/) consonant clusters.' },
      { word: 'Engineering', ipa: '/ˌɛndʒɪˈnɪrɪŋ/', tip: 'Stress the third syllable: -NEER-.' },
    ],
  },
  {
    id: 'spk-c1-1',
    level: 'C1',
    category: 'Executive Leadership',
    title: 'Presenting Strategic Recommendations',
    prompt: 'Consistent deliberate practice is the most reliable catalyst for achieving native-like fluency.',
    stressGuide: 'Con-SIS-tent de-LIB-er-ate PRAC-tice is the MOST re-LI-a-ble CAT-a-lyst for a-CHIEV-ing NA-tive-like FLU-en-cy.',
    phoneticGuide: '/kənˈsɪstənt dɪˈlɪbərət ˈpræktɪs ɪz ðə moʊst rɪˈlaɪəbl ˈkætəlɪst fɔːr əˈtʃiːvɪŋ ˈneɪtɪv laɪk ˈfluːənsi/',
    intonationTip: 'Deliver with measured executive authority: pause slightly after "practice" and emphasize "MOST RELIABLE CATALYST".',
    mouthPositionTip: 'Note that "deliberate" as an adjective ends with a short schwa /ət/ ("dih-LIB-er-it"), not a long /eɪt/.',
    keyWords: [
      { word: 'Deliberate', ipa: '/dɪˈlɪbərət/', tip: '4 syllables with a soft "-it" ending.' },
      { word: 'Catalyst', ipa: '/ˈkætəlɪst/', tip: 'Stress the first syllable CAT-.' },
      { word: 'Fluency', ipa: '/ˈfluːənsi/', tip: 'Smooth transition from /uː/ to /ə/.' },
    ],
  },
];

export default function SpeakingLabPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<SpeakingModule>(SPEAKING_MODULES[0]);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(0.95);
  const [evaluation, setEvaluation] = useState<SpokenEvaluationResult | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [savingScore, setSavingScore] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            currentLevel: data.user.profile?.currentLevel || 'A0',
            plan: data.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
      })
      .catch(() => {});

    return () => {
      stopSpeaking();
    };
  }, []);

  const filteredModules =
    selectedLevelFilter === 'ALL'
      ? SPEAKING_MODULES
      : SPEAKING_MODULES.filter((m) => m.level === selectedLevelFilter);

  const handleSelectModule = (mod: SpeakingModule) => {
    stopSpeaking();
    setSelectedModule(mod);
    setEvaluation(null);
    setRecognizedText('');
  };

  const handlePlayModelVoice = (text: string, customRate?: number) => {
    speakRealisticText(text, {
      rate: customRate ?? voiceSpeed,
      preferBrowserTTS: true,
    });
  };

  const handleSpeechResult = async (
    spokenText: string,
    _score?: number,
    fullEval?: SpokenEvaluationResult
  ) => {
    const computedEval =
      fullEval || evaluateSpokenAccuracy(selectedModule.prompt, spokenText, 3.2);

    setRecognizedText(spokenText);
    setEvaluation(computedEval);

    if (computedEval.overallScore >= 65) {
      playSuccessSound();
    } else {
      playErrorSound();
    }

    setSavingScore(true);
    try {
      await fetch('/api/ai/pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectedText: selectedModule.prompt,
          recognizedText: spokenText,
          durationSeconds: 4,
        }),
      });
    } catch {
      // ignore network error
    } finally {
      setSavingScore(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col lg:flex-row gap-6">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 w-full pb-24 lg:pb-8">
          {/* Header & Voice Speed Control */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                  <Mic className="w-4 h-4" />
                  <span>Interactive Phonetics Study + Realistic Pronunciation Scoring</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Speaking & Pronunciation Lab
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Study the mouth position, syllable stress, and key vocabulary first—then speak into your microphone for honest, word-by-word accuracy numbers.
                </p>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
                <Gauge className="w-4 h-4 text-blue-600 ml-2 mr-1" />
                {[
                  { r: 0.65, label: '🐢 0.65x' },
                  { r: 0.85, label: '0.85x' },
                  { r: 0.95, label: '🔊 1.0x' },
                  { r: 1.15, label: '⚡ 1.15x' },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setVoiceSpeed(item.r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      voiceSpeed === item.r
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CEFR Level Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase text-slate-400 mr-1">
                Filter Level:
              </span>
              {['ALL', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    selectedLevelFilter === lvl
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Levels (A0–C1)' : `Stage ${lvl}`}
                </button>
              ))}
            </div>
          </div>

          {/* Speaking Modules Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredModules.map((mod) => {
              const isSelected = selectedModule.id === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-900 text-white font-black text-[10px]">
                      CEFR {mod.level}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {mod.category}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                    &ldquo;{mod.prompt}&rdquo;
                  </p>
                </button>
              );
            })}
          </div>

          {/* MAIN WORKSPACE: LEFT = SPEAKING LEARNING MATERIAL, RIGHT = MICROPHONE & REALISTIC SCORING */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* STEP 1: SPEAKING LEARNING MATERIAL (6 COLS) */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    1. Speaking Learning Material
                  </h2>
                </div>
                <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Study Before Recording
                </span>
              </div>

              {/* Syllable Stress & Phonetic Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                    🎯 Syllable Stress Guide (CAPS = Stressed):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePlayModelVoice(selectedModule.prompt, 0.95)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Normal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePlayModelVoice(selectedModule.prompt, 0.65)}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white text-[11px] font-black cursor-pointer"
                    >
                      🐢 Slow
                    </button>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                  {selectedModule.stressGuide}
                </p>
                <p className="text-xs font-mono text-blue-700 dark:text-blue-400">
                  {selectedModule.phoneticGuide}
                </p>
              </div>

              {/* Mouth Position & Intonation Coaching */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    👄 Mouth & Tongue Position:
                  </span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedModule.mouthPositionTip}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                    🎵 Rhythm & Intonation:
                  </span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedModule.intonationTip}
                  </p>
                </div>
              </div>

              {/* Key Pronunciation Words with Audio */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  🔊 Practice Key Words Individually (Tap to Listen):
                </span>
                <div className="space-y-2">
                  {selectedModule.keyWords.map((kw, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {kw.word}
                          </span>
                          <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                            {kw.ipa}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {kw.tip}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePlayModelVoice(kw.word, 0.9)}
                          className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer"
                          title="Listen Normal"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlayModelVoice(kw.word, 0.6)}
                          className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs flex items-center justify-center cursor-pointer"
                          title="Listen Very Slow"
                        >
                          🐢
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 2: RECORD & REALISTIC SCORING (6 COLS) */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                      2. Speak Aloud & Get Realistic Scores
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayModelVoice(selectedModule.prompt)}
                    className="btn-3d-secondary px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Hear Model ({voiceSpeed}x)</span>
                  </button>
                </div>

                {/* Target Sentence Display (Interactive Words) */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 text-center space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Read This Sentence Out Loud Clearly:
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    &ldquo;{selectedModule.prompt}&rdquo;
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    💡 Tap any word in your score breakdown below to hear its exact pronunciation.
                  </p>
                </div>

                {/* Microphone Recorder Component */}
                <div className="py-2 flex flex-col items-center">
                  <SpeechRecognitionButton
                    expectedText={selectedModule.prompt}
                    onResult={handleSpeechResult}
                    buttonText="Tap Microphone & Speak Sentence"
                  />
                </div>

                {/* REALISTIC EVALUATION NUMBERS & WORD-BY-WORD BREAKDOWN */}
                {evaluation && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in duration-200">
                    {/* 4 Realistic Numeric Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                        <div
                          className={`text-2xl font-black ${
                            evaluation.overallScore >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : evaluation.overallScore >= 55
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {evaluation.overallScore}%
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-400 mt-0.5">
                          Overall Score
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
                          {evaluation.accuracyScore}%
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-400 mt-0.5">
                          Word Accuracy
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                          {evaluation.pronunciationScore}%
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-400 mt-0.5">
                          Clarity
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                        <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
                          {evaluation.fluencyScore}%
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-400 mt-0.5">
                          Fluency & Pace
                        </div>
                      </div>
                    </div>

                    {/* Word-by-Word Color Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black uppercase text-slate-500">
                          Word-by-Word Pronunciation Map (Tap any word to hear it):
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                          <span className="text-emerald-600">● Accurate</span>
                          <span className="text-amber-600">● Close</span>
                          <span className="text-rose-600">● Missed</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        {evaluation.wordBreakdown.map((wb, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePlayModelVoice(wb.word, 0.75)}
                            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-transform hover:scale-105 cursor-pointer border ${
                              wb.status === 'correct'
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                : wb.status === 'close'
                                ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 line-through decoration-rose-500'
                            }`}
                            title={`Similarity: ${wb.similarity}% — Tap to hear "${wb.word}"`}
                          >
                            {wb.word}{' '}
                            <span className="text-[10px] opacity-75">({wb.similarity}%)</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Coaching Feedback */}
                    <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1.5 text-xs">
                      <div className="font-black text-sm text-blue-950 dark:text-blue-200">
                        {evaluation.feedbackTitle}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {evaluation.feedbackDetail}
                      </p>
                      {evaluation.tips.map((t, i) => (
                        <p key={i} className="font-bold text-emerald-700 dark:text-emerald-400">
                          💡 {t}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {savingScore
                    ? 'Saving speaking session to your profile...'
                    : 'Every practice session awards +25 Speaking XP'}
                </span>
                {evaluation && (
                  <button
                    type="button"
                    onClick={() => {
                      setEvaluation(null);
                      setRecognizedText('');
                    }}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear & Speak Again</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
