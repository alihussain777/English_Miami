'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  KeyRound,
  Globe,
  GraduationCap,
  RefreshCw,
  Play,
  Award,
  MessageSquare,
  Zap,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import {
  DUOLINGO_BASE_LANGUAGES,
  getBaseLanguageInfo,
} from '@/lib/duolingo-languages';
import { speakRealisticText, stopRealisticSpeech } from '@/lib/voice-engine';
import { playSuccessSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

type LearnerLevel = 'basic' | 'mid' | 'advanced';
type MouthViseme = 'closed' | 'slightly_open' | 'wide_ah' | 'round_oh' | 'teeth_fv' | 'smile';

interface VocabularyCard {
  word: string;
  phonetic: string;
  nativeMeaning: string;
  example: string;
}

interface NextTestPrompt {
  instructionInNative: string;
  targetEnglishToSpeak: string;
  questionForUser: string;
}

interface LiveAgentTurn {
  id: string;
  timestamp: string;
  userSpokenText?: string;
  spokenTeacherReply: string;
  nativeLanguageGreetingOrFeedback: string;
  hasMistake: boolean;
  originalUserSentence: string;
  correctedEnglishSentence: string;
  advancedAlternativeSentence: string;
  mistakeExplanationInNative: string;
  grammarRuleTitle: string;
  encouragementInNative: string;
  nextTestPrompt: NextTestPrompt;
  vocabularyCards: VocabularyCard[];
  fluencyScore: number;
  grammarScore: number;
  engine?: string;
}

const FEATURED_NATIVE_LANGUAGES = [
  'ur', // Urdu 🇵🇰
  'hi', // Hindi 🇮🇳
  'ar', // Arabic 🇸🇦
  'es', // Spanish 🇪🇸
  'bn', // Bengali 🇧🇩
  'tr', // Turkish 🇹🇷
  'pa', // Punjabi / Pashto fallback
  'pt', // Portuguese 🇧🇷
  'fr', // French 🇫🇷
  'de', // German 🇩🇪
  'zh', // Chinese 🇨🇳
  'ru', // Russian 🇷🇺
];

const LEVEL_OPTIONS: {
  id: LearnerLevel;
  badge: string;
  title: string;
  cefr: string;
  desc: string;
  urduHint: string;
  color: string;
}[] = [
  {
    id: 'basic',
    badge: '🌱 Basic Level',
    title: 'Basic Beginner',
    cefr: 'CEFR A0 – A1',
    desc: 'Learn daily sentences, simple grammar rules, and step-by-step speaking with full native language guidance.',
    urduHint: 'ابتدائی لیول: آسان جملے اور آپ کی زبان میں مکمل رہنمائی',
    color: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'mid',
    badge: '🚀 Mid Level',
    title: 'Intermediate Speaker',
    cefr: 'CEFR A2 – B1',
    desc: 'Master past/present/future tenses, fix common speaking mistakes, and build confident real-life fluency.',
    urduHint: 'درمیانہ لیول: گرامر کی غلطیاں درست کریں اور روانی سے بولیں',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'advanced',
    badge: '👑 Advanced Level',
    title: 'Advanced & Professional',
    cefr: 'CEFR B2 – C2',
    desc: 'Executive communication, job interview mastery, native idioms, and high-level sentence refinement.',
    urduHint: 'ایڈوانسڈ لیول: پروفیشنل انگلش، انٹرویو اور اعلیٰ الفاظ',
    color: 'from-purple-600 to-indigo-800',
  },
];

const QUICK_TEST_SENTENCES: { label: string; text: string; tag: string }[] = [
  {
    label: '❌ "I am agree with your point."',
    text: 'I am agree with your point.',
    tag: 'Test Mistake #1',
  },
  {
    label: '❌ "Yesterday I goed to market with my brother."',
    text: 'Yesterday I goed to market with my brother.',
    tag: 'Test Mistake #2',
  },
  {
    label: '❌ "I have 22 years old and I am student."',
    text: 'I have 22 years old and I am student.',
    tag: 'Test Mistake #3',
  },
  {
    label: '❌ "She don\'t know nothing about this problem."',
    text: "She don't know nothing about this problem.",
    tag: 'Test Mistake #4',
  },
  {
    label: '❌ "I am learning English since two years."',
    text: 'I am learning English since two years.',
    tag: 'Test Mistake #5',
  },
  {
    label: '✅ "I would like to improve my spoken English fluency."',
    text: 'I would like to improve my spoken English fluency.',
    tag: 'Correct Sentence',
  },
];

export default function LiveAITalkingAgentPage() {
  const [session, setSession] = useState<UserSession | null>(null);

  // Onboarding / Session Setup
  const [setupCompleted, setSetupCompleted] = useState<boolean>(false);
  const [nativeLanguage, setNativeLanguage] = useState<string>('ur');
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('basic');
  const [showAllLanguages, setShowAllLanguages] = useState<boolean>(false);

  // Gemini Live API Key Management
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState<string>('');
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);
  const [apiKeySavedMsg, setApiKeySavedMsg] = useState<string | null>(null);

  // Live Agent State
  const [turns, setTurns] = useState<LiveAgentTurn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');

  // Realistic Avatar Lip-Sync & Voice State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [viseme, setViseme] = useState<MouthViseme>('smile');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(0.95);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [currentlySpokenText, setCurrentlySpokenText] = useState<string>('');
  const [audioBars, setAudioBars] = useState<number[]>([
    18, 32, 24, 45, 30, 52, 28, 38, 22, 48, 34, 26, 42, 20, 36, 24,
  ]);

  // Speech Recognition (Mic) State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const visemeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user session & API key status
  useEffect(() => {
    const savedKey =
      typeof window !== 'undefined'
        ? localStorage.getItem('miami_gemini_live_api_key') || ''
        : '';
    if (savedKey) setGeminiApiKeyInput(savedKey);

    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()).catch(() => ({})),
      fetch('/api/ai/live-agent').then((r) => r.json()).catch(() => ({})),
    ]).then(([authData, agentInfo]) => {
      if (agentInfo?.hasApiKey) {
        setHasServerKey(true);
      }
      if (authData?.authenticated && authData?.user) {
        const userLang = authData.user.profile?.nativeLanguage || 'ur';
        setNativeLanguage(userLang);
        const lvl = authData.user.profile?.currentLevel || 'A1';
        if (lvl === 'A0' || lvl === 'A1') setLearnerLevel('basic');
        else if (lvl === 'A2' || lvl === 'B1') setLearnerLevel('mid');
        else setLearnerLevel('advanced');

        setSession({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.name,
          role: authData.user.role,
          currentLevel: lvl,
          nativeLanguage: userLang,
          plan: authData.user.subscription?.plan || 'FREE',
          onboardingCompleted: true,
        });
      }
    });
  }, []);

  // Natural Eye Blinking Loop for Realistic Avatar
  useEffect(() => {
    const blinkLoop = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3600);
    return () => clearInterval(blinkLoop);
  }, []);

  // Realistic 60fps Lip-Sync Viseme Engine while speaking
  const startLipSyncAnimation = useCallback((textToAnalyze: string) => {
    if (visemeTimerRef.current) clearInterval(visemeTimerRef.current);
    setIsSpeaking(true);
    setCurrentlySpokenText(textToAnalyze);

    const sequence: MouthViseme[] = [
      'wide_ah',
      'slightly_open',
      'round_oh',
      'teeth_fv',
      'wide_ah',
      'closed',
      'slightly_open',
      'round_oh',
      'wide_ah',
      'smile',
    ];
    let step = 0;

    visemeTimerRef.current = setInterval(() => {
      step = (step + 1) % sequence.length;
      setViseme(sequence[step]);
      setAudioBars((prev) =>
        prev.map(() => Math.floor(20 + Math.random() * 75))
      );
    }, 95);
  }, []);

  const stopLipSyncAnimation = useCallback(() => {
    if (visemeTimerRef.current) {
      clearInterval(visemeTimerRef.current);
      visemeTimerRef.current = null;
    }
    setIsSpeaking(false);
    setViseme('smile');
    setAudioBars([14, 18, 12, 22, 16, 14, 20, 15, 12, 18, 14, 16, 20, 14, 16, 12]);
  }, []);

  useEffect(() => {
    return () => {
      if (visemeTimerRef.current) clearInterval(visemeTimerRef.current);
      stopRealisticSpeech();
    };
  }, []);

  // Speak text with synchronized avatar lip movement
  const speakWithAvatarLipSync = useCallback(
    (text: string, customRate?: number) => {
      if (!text || voiceMuted) return;
      const rateToUse = customRate || voiceSpeed;

      // Estimate speaking duration from word count for accurate fallback timer
      const wordCount = text.trim().split(/\s+/).length;
      const estimatedMs = Math.max(
        1800,
        Math.min(18000, Math.round((wordCount / (2.4 * rateToUse)) * 1000))
      );

      startLipSyncAnimation(text);
      const fallbackTimeout = setTimeout(() => {
        stopLipSyncAnimation();
      }, estimatedMs);

      speakRealisticText(text, {
        rate: rateToUse,
        pitch: 1.04,
        onStart: () => {
          startLipSyncAnimation(text);
        },
        onEnd: () => {
          clearTimeout(fallbackTimeout);
          stopLipSyncAnimation();
        },
      });
    },
    [voiceMuted, voiceSpeed, startLipSyncAnimation, stopLipSyncAnimation]
  );

  // Start or restart session with selected Native Language & English Level
  const startLiveAgentSession = async (
    chosenLang = nativeLanguage,
    chosenLevel = learnerLevel
  ) => {
    setSetupCompleted(true);
    setLoading(true);

    const buildFallbackInitialTurn = (): LiveAgentTurn => {
      const isUr = chosenLang === 'ur';
      const isHi = chosenLang === 'hi';
      return {
        id: `turn-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        spokenTeacherReply:
          chosenLevel === 'basic'
            ? 'Hello and welcome! I am Sophia, your live English teacher. Tell me in English: What is your name and what do you do every morning?'
            : chosenLevel === 'mid'
              ? 'Welcome to your Intermediate Live English Session! Tell me about a memorable trip you took or what you are working on this week.'
              : 'Welcome to Advanced Executive English! How has technology transformed communication in your industry?',
        nativeLanguageGreetingOrFeedback: isUr
          ? `السلام علیکم! میں صوفیہ ہوں، آپ کی لائیو اے آئی انگلش ٹیچر۔ آپ نے اردو زبان اور ${chosenLevel.toUpperCase()} لیول منتخب کیا ہے۔ نیچے مائیک دبا کر یا لکھ کر کوئی بھی انگلش جملہ بولیں، میں آپ کی غلطیاں درست کر کے تفصیلی کارڈز میں سمجھاؤں گی!`
          : isHi
            ? `नमस्ते! मैं सोफिया हूँ, आपकी लाइव एआई इंग्लिश टीचर। नीचे माइक दबाकर या लिखकर कोई भी अंग्रेजी वाक्य बोलें, मैं आपकी गलतियाँ सुधार कर कार्ड्स में समझाऊँगी!`
            : `Welcome! Speak or type any English sentence below, and I will correct your mistakes and explain every grammar rule in your native language.`,
        hasMistake: false,
        originalUserSentence: 'Session Started — Speak or click a sample sentence above!',
        correctedEnglishSentence:
          'Hello Sophia, I am excited to practice my spoken English today.',
        advancedAlternativeSentence:
          'I am eager to sharpen my English fluency through interactive coaching.',
        mistakeExplanationInNative: isUr
          ? 'آپ نیچے مائیک کے بٹن پر کلک کر کے بول سکتے ہیں، یا اوپر دیے گئے کسی بھی ٹیسٹ جملے پر کلک کر کے دیکھ سکتے ہیں کہ میں غلط فقرات کو کیسے درست کرتی ہوں۔'
          : 'Tap the microphone button to speak aloud, or click any sample sentence above to test grammar corrections.',
        grammarRuleTitle: `${chosenLevel.toUpperCase()} Level • Live Bilingual Coaching Ready`,
        encouragementInNative: isUr
          ? 'شاباش! بلا جھجھک انگلش بولنے کی کوشش کریں!'
          : 'Speak with confidence — every mistake helps you learn faster!',
        nextTestPrompt: {
          instructionInNative: isUr
            ? '🎙️ اب مائیک دبا کر یہ آسان انگلش فقرہ بولیں یا اپنا تعارف کروائیں:'
            : '🎙️ Tap the microphone and speak this sentence aloud:',
          targetEnglishToSpeak:
            'Hello Sophia, I want to improve my English speaking skills.',
          questionForUser:
            'What is your favorite hobby or what did you do yesterday?',
        },
        vocabularyCards: [
          {
            word: 'Confident',
            phonetic: '/ˈkɒn.fɪ.dənt/',
            nativeMeaning: isUr ? 'پراعتماد' : 'Self-assured and fearless',
            example: 'Speaking aloud every day makes you feel confident.',
          },
          {
            word: 'Fluency',
            phonetic: '/ˈfluː.ən.si/',
            nativeMeaning: isUr ? 'روانی سے بولنا' : 'Smooth speaking ability',
            example: 'Consistent practice is the secret to English fluency.',
          },
          {
            word: 'Opportunity',
            phonetic: '/ˌɒp.əˈtjuː.nə.ti/',
            nativeMeaning: isUr ? 'سنہری موقع' : 'A favorable career chance',
            example: 'Good English opens doors to global career opportunities.',
          },
        ],
        fluencyScore: 92,
        grammarScore: 95,
        engine: 'miami-bilingual-engine',
      };
    };

    try {
      const res = await fetch('/api/ai/live-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isInitialGreeting: true,
          nativeLanguage: chosenLang,
          level: chosenLevel,
          apiKeyOverride: geminiApiKeyInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      const payload = data?.response || data?.data;
      if (payload) {
        const firstTurn: LiveAgentTurn = {
          id: `turn-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          ...payload,
          engine: data.engine,
        };
        setTurns([firstTurn]);
        playSuccessSound();
        setTimeout(() => {
          speakWithAvatarLipSync(
            `${payload.spokenTeacherReply || payload.spokenGreetingOrReply || ''} ${
              payload.nextTestPrompt?.questionForUser || ''
            }`
          );
        }, 250);
      } else {
        const fb = buildFallbackInitialTurn();
        setTurns([fb]);
        setTimeout(() => speakWithAvatarLipSync(fb.spokenTeacherReply), 250);
      }
    } catch (err) {
      console.error('Failed to start Live Agent, using local fallback:', err);
      const fb = buildFallbackInitialTurn();
      setTurns([fb]);
      setTimeout(() => speakWithAvatarLipSync(fb.spokenTeacherReply), 250);
    } finally {
      setLoading(false);
    }
  };

  // Send user spoken or typed sentence to the Live Agent
  const sendSentenceToLiveAgent = async (textToSubmit?: string) => {
    const cleanText = (textToSubmit ?? userInput).trim();
    if (!cleanText || loading) return;

    setUserInput('');
    setInterimTranscript('');
    setLoading(true);

    try {
      const historyPayload = turns.slice(-4).map((t) => ({
        user: t.userSpokenText || '',
        agent: t.spokenTeacherReply || '',
      }));

      const res = await fetch('/api/ai/live-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          nativeLanguage,
          level: learnerLevel,
          conversationHistory: historyPayload,
          apiKeyOverride: geminiApiKeyInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      const payload = data?.response || data?.data;
      if (payload) {
        const newTurn: LiveAgentTurn = {
          id: `turn-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          userSpokenText: cleanText,
          ...payload,
          engine: data.engine,
        };
        setTurns((prev) => [...prev, newTurn]);
        playSuccessSound();

        // Speak the teacher's feedback + corrected sentence + next question
        const speechScript = payload.hasMistake
          ? `${payload.spokenTeacherReply} The correct sentence is: ${payload.correctedEnglishSentence}. ${payload.nextTestPrompt?.questionForUser || ''}`
          : `${payload.spokenTeacherReply} ${payload.nextTestPrompt?.questionForUser || ''}`;

        setTimeout(() => {
          speakWithAvatarLipSync(speechScript);
        }, 200);
      }
    } catch (err) {
      console.error('Live Agent error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save Gemini API Key
  const handleSaveApiKey = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('miami_gemini_live_api_key', geminiApiKeyInput.trim());
    }
    try {
      const res = await fetch('/api/ai/live-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: geminiApiKeyInput.trim() }),
      });
      const data = await res.json();
      if (data.hasApiKey) setHasServerKey(true);
      setApiKeySavedMsg('✅ Gemini Live API Key saved & activated!');
      setTimeout(() => {
        setApiKeySavedMsg(null);
        setShowApiKeyModal(false);
      }, 1400);
    } catch {
      setApiKeySavedMsg('Saved in browser storage!');
    }
  };

  // Toggle Live Microphone (Web Speech API)
  const toggleMicrophone = () => {
    setMicError(null);
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setMicError(
        'Voice microphone requires Chrome, Edge, or Safari. You can also type or click any test sentence below!'
      );
      return;
    }

    try {
      stopRealisticSpeech();
      stopLipSyncAnimation();

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalCaptured = '';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalCaptured += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        setInterimTranscript(finalCaptured || interim);
        setUserInput((finalCaptured || interim).trim());
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        const spoken = finalCaptured.trim();
        if (spoken.length > 1) {
          sendSentenceToLiveAgent(spoken);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setMicError('Could not start microphone. Check browser permissions.');
    }
  };

  const selectedLangObj = getBaseLanguageInfo(nativeLanguage);
  const selectedLevelObj =
    LEVEL_OPTIONS.find((l) => l.id === learnerLevel) || LEVEL_OPTIONS[0];
  const latestTurn = turns.length > 0 ? turns[turns.length - 1] : null;
  const isRtlLang = ['ur', 'ar', 'fa'].includes(nativeLanguage);

  const displayedLanguages = showAllLanguages
    ? DUOLINGO_BASE_LANGUAGES.filter((l) => l.code !== 'en')
    : DUOLINGO_BASE_LANGUAGES.filter((l) =>
        FEATURED_NATIVE_LANGUAGES.includes(l.code)
      );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 min-w-0 space-y-6 pb-24 lg:pb-12">
          {/* =====================================================================
              TOP STUDIO HEADER BAR
             ===================================================================== */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white border-2 border-blue-700/60 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                <Sparkles className="w-7 h-7 text-amber-300" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                    ● Gemini Live Talking AI Teacher
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-black uppercase tracking-widest">
                    {selectedLangObj.flag} {selectedLangObj.nativeName} → 🇺🇸 English
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    {selectedLevelObj.badge} ({selectedLevelObj.cefr})
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight mt-1">
                  Sophia — Miami Live AI Talking Coach
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 font-medium">
                  Real-time lip-synced English teacher that speaks in your language, tests you, and fixes every sentence mistake in detailed cards.
                </p>
              </div>
            </div>

            {/* Right Quick Controls: Change Language/Level & Gemini API Key */}
            <div className="flex flex-wrap items-center gap-2.5">
              {setupCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    stopRealisticSpeech();
                    stopLipSyncAnimation();
                    setSetupCompleted(false);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-extrabold text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <span>Change Language / Level</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowApiKeyModal((v) => !v)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all ${
                  hasServerKey || geminiApiKeyInput.trim().length > 10
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                    : 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {hasServerKey || geminiApiKeyInput.trim().length > 10
                    ? 'Gemini Live Key Active'
                    : 'Set Gemini Live API Key'}
                </span>
              </button>
            </div>
          </div>

          {/* =====================================================================
              GEMINI LIVE API KEY DRAWER / MODAL
             ===================================================================== */}
          {showApiKeyModal && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    Configure Gemini Live API Key (Google AI Studio)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Paste your <strong>Gemini API Key</strong> (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">AIzaSy...</code>) below to power live bilingual diagnostics with Gemini 1.5 Flash / Live. Even without an external key, our built-in Miami Bilingual Diagnostic Engine works 100% automatically!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="password"
                  value={geminiApiKeyInput}
                  onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                  placeholder="AIzaSy... (Paste your Gemini Live API Key here)"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="btn-3d-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Save & Activate Key
                </button>
              </div>
              {apiKeySavedMsg && (
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {apiKeySavedMsg}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              STEP 1 & STEP 2 ONBOARDING SCREEN (SELECT LANGUAGE + SELECT LEVEL)
             ===================================================================== */}
          {!setupCompleted ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-8">
              {/* Step 1: Select Native Language */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5" /> Step 1 of 2 • Apni Zuban Select Karein
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                      Choose Your Native Language (کس زبان میں سمجھنا چاہتے ہیں؟)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Sophia will explain your English mistakes, grammar rules, and vocabulary meanings in your selected language.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAllLanguages((v) => !v)}
                    className="text-xs font-black text-blue-700 dark:text-blue-400 hover:underline cursor-pointer self-start sm:self-center"
                  >
                    {showAllLanguages
                      ? 'Show Top Languages'
                      : `View All 22 Languages →`}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {displayedLanguages.map((lang) => {
                    const active = nativeLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setNativeLanguage(lang.code);
                          playSuccessSound();
                        }}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-blue-700 text-white border-blue-900 shadow-[0_4px_0_0_#1e3a8a] -translate-y-0.5'
                            : 'bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{lang.flag}</span>
                          {active && (
                            <CheckCircle2 className="w-4 h-4 text-amber-300" />
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="font-black text-sm truncate">
                            {lang.nativeName}
                          </div>
                          <div
                            className={`text-[11px] font-bold truncate ${
                              active
                                ? 'text-blue-200'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {lang.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select English Level (Basic, Mid, Advanced) */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" /> Step 2 of 2 • Select Your English Level
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                    What is Your Current English Level? (اپنا لیول منتخب کریں)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Choose Basic, Mid, or Advanced so the Live AI Teacher adjusts her speaking test and sentence corrections to your level.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {LEVEL_OPTIONS.map((lvl) => {
                    const active = learnerLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          setLearnerLevel(lvl.id);
                          playSuccessSound();
                        }}
                        className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white border-amber-400 shadow-xl -translate-y-1'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black ${
                                active
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              }`}
                            >
                              {lvl.badge}
                            </span>
                            <span
                              className={`text-xs font-extrabold ${
                                active ? 'text-emerald-300' : 'text-slate-500'
                              }`}
                            >
                              {lvl.cefr}
                            </span>
                          </div>
                          <h3 className="text-lg font-black pt-1">{lvl.title}</h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              active
                                ? 'text-blue-100'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {lvl.desc}
                          </p>
                        </div>

                        <div
                          dir="rtl"
                          className={`mt-4 pt-3 border-t text-xs font-bold ${
                            active
                              ? 'border-white/15 text-amber-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {lvl.urduHint}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Live Session CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/90 dark:to-indigo-950/60 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedLangObj.flag}</span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      Ready to Launch Live AI Session
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Language: {selectedLangObj.nativeName} ({selectedLangObj.name}) • Level: {selectedLevelObj.title} ({selectedLevelObj.cefr})
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => startLiveAgentSession(nativeLanguage, learnerLevel)}
                  className="w-full sm:w-auto btn-3d-primary px-8 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live AI Talking Teacher Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* =====================================================================
               LIVE AI TALKING AGENT STUDIO + DETAILED CORRECTION CARDS
               ===================================================================== */
            <div className="space-y-6">
              {/* TOP GRID: LEFT = REALISTIC LIP-SYNCED AVATAR, RIGHT = MIC & LIVE TEST */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LEFT 5 COLS: REALISTIC TALKING AI TEACHER AVATAR WITH LIP MOVEMENTS */}
                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-blue-500/60 shadow-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                  {/* Top Studio Status Pills */}
                  <div className="flex items-center justify-between gap-2 z-10">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/15">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isSpeaking
                            ? 'bg-emerald-400 animate-ping'
                            : isListening
                              ? 'bg-rose-500 animate-ping'
                              : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                        {isSpeaking
                          ? '🗣️ Speaking (Lip-Sync Active)'
                          : isListening
                            ? '🎙️ Listening to You...'
                            : '🟢 Live Teacher Ready'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0.75, 0.95, 1.1].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setVoiceSpeed(spd)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                            voiceSpeed === spd
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white/10 text-blue-200 hover:bg-white/20'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          if (!voiceMuted) {
                            stopRealisticSpeech();
                            stopLipSyncAnimation();
                          }
                          setVoiceMuted((m) => !m);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        title={voiceMuted ? 'Unmute Voice' : 'Mute Voice'}
                      >
                        {voiceMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-emerald-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ==========================================================
                      REALISTIC HUMAN TEACHER SVG PORTRAIT WITH DYNAMIC VISEMES
                     ========================================================== */}
                  <div className="my-4 flex flex-col items-center justify-center relative">
                    {/* Glowing Halo Behind Teacher when Speaking */}
                    <div
                      className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSpeaking
                          ? 'ring-8 ring-emerald-400/30 shadow-[0_0_60px_rgba(16,185,129,0.45)]'
                          : isListening
                            ? 'ring-8 ring-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.4)]'
                            : 'ring-4 ring-blue-400/20'
                      }`}
                    >
                      <svg
                        viewBox="0 0 320 340"
                        className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-indigo-900 via-slate-900 to-blue-950 border-4 border-white/20 shadow-2xl transition-transform duration-300 ${
                          isSpeaking
                            ? 'scale-[1.02]'
                            : isListening
                              ? 'scale-[1.01]'
                              : ''
                        }`}
                      >
                        <defs>
                          <radialGradient id="skinGrad" cx="50%" cy="42%" r="58%">
                            <stop offset="0%" stopColor="#ffe4d6" />
                            <stop offset="65%" stopColor="#f5c6aa" />
                            <stop offset="100%" stopColor="#e2a889" />
                          </radialGradient>
                          <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#2a1810" />
                            <stop offset="50%" stopColor="#3d2314" />
                            <stop offset="100%" stopColor="#1b0f0a" />
                          </linearGradient>
                          <linearGradient id="blazerGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e3a8a" />
                            <stop offset="100%" stopColor="#0f172a" />
                          </linearGradient>
                          <linearGradient id="lipGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#e11d48" />
                            <stop offset="100%" stopColor="#be123c" />
                          </linearGradient>
                        </defs>

                        {/* Studio Backdrop Glow */}
                        <circle cx="160" cy="155" r="135" fill="#1e293b" opacity="0.55" />

                        {/* Back Hair Volume */}
                        <path
                          d="M72 135 C62 215, 68 275, 86 310 L234 310 C252 275, 258 215, 248 135 C242 70, 208 42, 160 42 C112 42, 78 70, 72 135 Z"
                          fill="url(#hairGrad)"
                        />

                        {/* Neck & Shoulders / Professional Navy Blazer */}
                        <rect x="135" y="222" width="50" height="48" rx="18" fill="url(#skinGrad)" />
                        <path
                          d="M55 340 C62 274, 102 254, 160 254 C218 254, 258 274, 265 340 Z"
                          fill="url(#blazerGrad)"
                        />
                        {/* White Blouse & Gold Necklace */}
                        <polygon points="134,254 160,308 186,254" fill="#f8fafc" />
                        <path
                          d="M140 256 Q160 272 180 256"
                          stroke="#fbbf24"
                          strokeWidth="2.5"
                          fill="none"
                        />

                        {/* Ears & Pearl Earrings */}
                        <ellipse cx="92" cy="158" rx="10" ry="18" fill="#eab699" />
                        <ellipse cx="228" cy="158" rx="10" ry="18" fill="#eab699" />
                        <circle cx="91" cy="176" r="4.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                        <circle cx="229" cy="176" r="4.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />

                        {/* Head / Face Contour (moves slightly with jaw when speaking wide) */}
                        <path
                          d={
                            viseme === 'wide_ah' || viseme === 'round_oh'
                              ? 'M96 132 C96 82, 122 58, 160 58 C198 58, 224 82, 224 132 C224 186, 198 238, 160 241 C122 238, 96 186, 96 132 Z'
                              : 'M96 132 C96 82, 122 58, 160 58 C198 58, 224 82, 224 132 C224 184, 198 233, 160 236 C122 233, 96 184, 96 132 Z'
                          }
                          fill="url(#skinGrad)"
                        />

                        {/* Soft Cheek Blush */}
                        <ellipse cx="118" cy="172" rx="15" ry="9" fill="#f43f5e" opacity="0.16" />
                        <ellipse cx="202" cy="172" rx="15" ry="9" fill="#f43f5e" opacity="0.16" />

                        {/* Eyebrows (raise slightly when speaking for natural expression) */}
                        <g
                          transform={
                            isSpeaking ? 'translate(0, -2.5)' : 'translate(0, 0)'
                          }
                        >
                          <path
                            d="M112 124 Q129 116 145 122"
                            stroke="#3b2215"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <path
                            d="M175 122 Q191 116 208 124"
                            stroke="#3b2215"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                          />
                        </g>

                        {/* Eyes (with natural blinking) */}
                        {isBlinking ? (
                          <g>
                            <path
                              d="M114 142 Q129 147 144 142"
                              stroke="#2a1810"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              fill="none"
                            />
                            <path
                              d="M176 142 Q191 147 206 142"
                              stroke="#2a1810"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              fill="none"
                            />
                          </g>
                        ) : (
                          <g>
                            {/* Left Eye */}
                            <ellipse cx="129" cy="141" rx="14" ry="9.5" fill="#ffffff" />
                            <circle cx="130" cy="141" r="6.8" fill="#4b2e1e" />
                            <circle cx="130" cy="141" r="3.4" fill="#0f172a" />
                            <circle cx="132.5" cy="138.5" r="2.1" fill="#ffffff" />
                            <path
                              d="M113 139 Q129 129 145 139"
                              stroke="#1e110a"
                              strokeWidth="3"
                              strokeLinecap="round"
                              fill="none"
                            />

                            {/* Right Eye */}
                            <ellipse cx="191" cy="141" rx="14" ry="9.5" fill="#ffffff" />
                            <circle cx="190" cy="141" r="6.8" fill="#4b2e1e" />
                            <circle cx="190" cy="141" r="3.4" fill="#0f172a" />
                            <circle cx="192.5" cy="138.5" r="2.1" fill="#ffffff" />
                            <path
                              d="M175 139 Q191 129 207 139"
                              stroke="#1e110a"
                              strokeWidth="3"
                              strokeLinecap="round"
                              fill="none"
                            />
                          </g>
                        )}

                        {/* Refined Nose */}
                        <path
                          d="M160 144 L156 171 Q160 175 166 171"
                          stroke="#c88a6b"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* =====================================================
                            MULTI-VISEME REALISTIC LIP & MOUTH SYNCHRONIZATION
                           ===================================================== */}
                        {viseme === 'closed' && (
                          <g>
                            <path
                              d="M138 197 Q150 193 160 196 Q170 193 182 197 Q160 202 138 197 Z"
                              fill="url(#lipGrad)"
                            />
                            <path
                              d="M138 197 Q160 205 182 197"
                              stroke="#9f1239"
                              strokeWidth="2"
                              fill="none"
                            />
                          </g>
                        )}

                        {viseme === 'smile' && (
                          <g>
                            <path
                              d="M135 195 Q160 209 185 195 Q160 202 135 195 Z"
                              fill="url(#lipGrad)"
                            />
                            <path
                              d="M134 194 Q160 206 186 194"
                              stroke="#be123c"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              fill="none"
                            />
                          </g>
                        )}

                        {viseme === 'slightly_open' && (
                          <g>
                            {/* Mouth Cavity */}
                            <ellipse cx="160" cy="198" rx="19" ry="7.5" fill="#4c0519" />
                            {/* Upper Teeth */}
                            <rect x="145" y="191.5" width="30" height="4.5" rx="2" fill="#ffffff" />
                            {/* Tongue */}
                            <ellipse cx="160" cy="202.5" rx="11" ry="3.5" fill="#fb7185" />
                            {/* Upper & Lower Lips */}
                            <ellipse
                              cx="160"
                              cy="198"
                              rx="20"
                              ry="8"
                              stroke="url(#lipGrad)"
                              strokeWidth="4"
                              fill="none"
                            />
                          </g>
                        )}

                        {viseme === 'wide_ah' && (
                          <g>
                            {/* Open Mouth Cavity */}
                            <ellipse cx="160" cy="201" rx="22" ry="13.5" fill="#4c0519" />
                            {/* Upper Teeth Row */}
                            <path
                              d="M142 191 L178 191 L176 197 L144 197 Z"
                              fill="#ffffff"
                            />
                            {/* Realistic Tongue */}
                            <ellipse cx="160" cy="208" rx="14" ry="6" fill="#f43f5e" />
                            {/* Sculpted Lips */}
                            <ellipse
                              cx="160"
                              cy="201"
                              rx="22.5"
                              ry="14"
                              stroke="url(#lipGrad)"
                              strokeWidth="4.5"
                              fill="none"
                            />
                          </g>
                        )}

                        {viseme === 'round_oh' && (
                          <g>
                            {/* Rounded O Vowel Lip Shape */}
                            <ellipse cx="160" cy="200" rx="13.5" ry="13" fill="#4c0519" />
                            <rect x="150" y="190" width="20" height="4" rx="1.5" fill="#ffffff" />
                            <ellipse cx="160" cy="207" rx="8.5" ry="4.5" fill="#f43f5e" />
                            <ellipse
                              cx="160"
                              cy="200"
                              rx="14.5"
                              ry="13.5"
                              stroke="url(#lipGrad)"
                              strokeWidth="5"
                              fill="none"
                            />
                          </g>
                        )}

                        {viseme === 'teeth_fv' && (
                          <g>
                            {/* F / V / S Dental Consonant Lip Shape */}
                            <ellipse cx="160" cy="197" rx="18" ry="5.5" fill="#4c0519" />
                            <rect x="144" y="193" width="32" height="5" rx="1.5" fill="#ffffff" />
                            <ellipse
                              cx="160"
                              cy="197.5"
                              rx="19"
                              ry="6"
                              stroke="url(#lipGrad)"
                              strokeWidth="3.8"
                              fill="none"
                            />
                          </g>
                        )}

                        {/* Front Styled Hair Bangs */}
                        <path
                          d="M92 128 C98 76, 134 56, 174 60 C205 63, 224 88, 228 126 C214 96, 188 82, 154 84 C122 86, 104 102, 92 128 Z"
                          fill="url(#hairGrad)"
                        />

                        {/* Headset Microphone Boom */}
                        <path
                          d="M226 164 Q215 202 186 205"
                          stroke="#38bdf8"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <circle cx="184" cy="205" r="4.5" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* Live Voice Waveform Equalizer Bars */}
                    <div className="mt-4 flex items-end justify-center gap-1 h-8 px-4 py-1.5 rounded-2xl bg-slate-900/90 border border-white/10">
                      {audioBars.map((barHeight, idx) => (
                        <div
                          key={idx}
                          style={{
                            height: isSpeaking ? `${Math.max(18, barHeight)}%` : '22%',
                          }}
                          className={`w-1.5 rounded-full transition-all duration-75 ${
                            isSpeaking
                              ? 'bg-gradient-to-t from-blue-500 via-emerald-400 to-amber-300'
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Subtitle & Replay Voice Button */}
                  <div className="space-y-3 z-10">
                    <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-white/15 text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed">
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
                        🗣️ Sophia (Live Spoken Reply):
                      </div>
                      <p>
                        {latestTurn?.spokenTeacherReply ||
                          currentlySpokenText ||
                          'Hello! Select a sentence or tap the microphone to speak with me live!'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (latestTurn) {
                            speakWithAvatarLipSync(
                              `${latestTurn.spokenTeacherReply} ${
                                latestTurn.hasMistake
                                  ? `The correct sentence is: ${latestTurn.correctedEnglishSentence}.`
                                  : ''
                              } ${latestTurn.nextTestPrompt?.questionForUser || ''}`
                            );
                          }
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Replay Teacher Voice</span>
                      </button>

                      {latestTurn?.correctedEnglishSentence && (
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.correctedEnglishSentence,
                              0.72
                            )
                          }
                          className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span>🐢 Slow (0.7x)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT 7 COLS: LIVE SPEAKING TEST PROMPT + MICROPHONE + TEXT INPUT */}
                <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7 flex flex-col justify-between space-y-5">
                  {/* Top Fluency & Grammar Score Meters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                        🎯 Interactive English Speaking & Grammar Test
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                        Speak or Type Your Answer Below
                      </h2>
                    </div>

                    {latestTurn && (
                      <div className="flex items-center gap-2.5">
                        <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                          <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                            Fluency
                          </div>
                          <div className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300">
                            {latestTurn.fluencyScore}%
                          </div>
                        </div>
                        <div className="px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                          <div className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-300">
                            Grammar
                          </div>
                          <div className="text-sm sm:text-base font-black text-blue-700 dark:text-blue-300">
                            {latestTurn.grammarScore}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current Live Speaking Test Card from AI Teacher */}
                  {latestTurn?.nextTestPrompt && (
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-emerald-50/50 dark:from-slate-800 dark:via-indigo-950/50 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-800 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider">
                          🎤 Live Speaking Challenge ({selectedLevelObj.badge})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.nextTestPrompt.targetEnglishToSpeak,
                              0.85
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-xs font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Hear Target Sentence</span>
                        </button>
                      </div>

                      {/* Instruction in User's Native Language */}
                      <p
                        dir={isRtlLang ? 'rtl' : 'ltr'}
                        className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed"
                      >
                        {latestTurn.nextTestPrompt.instructionInNative}
                      </p>

                      {/* Target English Sentence Box */}
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Practice Speaking This Out Loud or Answer Sophia&apos;s Question:
                        </div>
                        <p className="text-base sm:text-lg font-black text-blue-800 dark:text-blue-300 mt-0.5">
                          &ldquo;{latestTurn.nextTestPrompt.targetEnglishToSpeak}&rdquo;
                        </p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
                          💬 Question: {latestTurn.nextTestPrompt.questionForUser}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Big Live Microphone Button + Text Input Bar */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={toggleMicrophone}
                        disabled={loading}
                        className={`px-6 py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all shrink-0 ${
                          isListening
                            ? 'bg-rose-600 text-white shadow-[0_0_25px_rgba(225,29,72,0.6)] animate-pulse'
                            : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5" />
                            <span>Stop & Check My English</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            <span>🎙️ Tap to Speak Live</span>
                          </>
                        )}
                      </button>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          sendSentenceToLiveAgent();
                        }}
                        className="flex-1 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder="Or type any English sentence here to check mistakes..."
                          className="flex-1 px-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="submit"
                          disabled={loading || !userInput.trim()}
                          className="px-5 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {loading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          <span>Check</span>
                        </button>
                      </form>
                    </div>

                    {interimTranscript && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200">
                        🎙️ Live Voice Captured: &ldquo;{interimTranscript}&rdquo;
                      </div>
                    )}

                    {micError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-bold text-rose-700 dark:text-rose-300">
                        {micError}
                      </div>
                    )}
                  </div>

                  {/* Quick One-Click Sample Sentences to Test Ghlt Fikra -> Sahi Fikra */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      ⚡ Try Speaking or Clicking a Sample Sentence (See How Sophia Fixes Mistakes):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_TEST_SENTENCES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={loading}
                          onClick={() => sendSentenceToLiveAgent(sample.text)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer transition-all"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* =====================================================================
                  DETAILED ATTRACTIVE TEACHING & CORRECTION CARDS BELOW THE AGENT
                  (GHLT FIKRA vs SAHI FIKRA + NATIVE LANGUAGE WAZAHAT + VOCABULARY)
                 ===================================================================== */}
              {latestTurn && (
                <div className="space-y-6">
                  {/* SECTION HEADER */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Detailed Sentence Correction & Bilingual Teaching Cards
                      </h2>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500">
                      Explicating in {selectedLangObj.flag} {selectedLangObj.nativeName} ({selectedLangObj.name})
                    </span>
                  </div>

                  {/* CARD ROW 1: GHLT FIKRA (WRONG) VS SAHI FIKRA (CORRECT) + NATIVE UPGRADE */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1A: ❌ Ghlt Fikra / What You Said */}
                    <div
                      className={`p-6 rounded-3xl border-2 shadow-md flex flex-col justify-between ${
                        latestTurn.hasMistake
                          ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              latestTurn.hasMistake
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>
                              {latestTurn.hasMistake
                                ? '❌ Ghlt Fikra (Mistake Found)'
                                : '🗣️ Your Spoken Sentence'}
                            </span>
                          </span>
                          <span className="text-xs font-black text-rose-700 dark:text-rose-400">
                            غلط فقرہ / آپ کا جملہ
                          </span>
                        </div>

                        <p
                          className={`text-lg sm:text-xl font-black leading-snug pt-2 ${
                            latestTurn.hasMistake
                              ? 'text-rose-900 dark:text-rose-200 line-through decoration-rose-500/80 decoration-2'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          &ldquo;{latestTurn.originalUserSentence}&rdquo;
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/50 text-xs font-bold text-rose-700 dark:text-rose-300">
                        {latestTurn.hasMistake
                          ? '⚠️ Needs grammar refinement — see the corrected English sentence on the right!'
                          : '✅ Clean sentence structure! Compare with the advanced native upgrade.'}
                      </div>
                    </div>

                    {/* Card 1B: ✅ Sahi Fikra / Corrected Natural English */}
                    <div className="p-6 rounded-3xl bg-emerald-50/90 dark:bg-emerald-950/35 border-2 border-emerald-400 dark:border-emerald-700 shadow-lg flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>✅ Sahi Fikra (Correct English)</span>
                          </span>
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                            درست انگریزی فقرہ
                          </span>
                        </div>

                        <p className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 leading-snug pt-2">
                          &ldquo;{latestTurn.correctedEnglishSentence}&rdquo;
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.correctedEnglishSentence,
                              0.95
                            )
                          }
                          className="flex-1 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Listen Normal (1.0x)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.correctedEnglishSentence,
                              0.68
                            )
                          }
                          className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black cursor-pointer"
                        >
                          🐢 Slow (0.68x)
                        </button>
                      </div>
                    </div>

                    {/* Card 1C: 💎 Advanced Native Speaker Upgrade */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border-2 border-indigo-300 dark:border-indigo-800 shadow-md flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-indigo-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>💎 Native C1 Upgrade</span>
                          </span>
                          <span className="text-xs font-black text-indigo-800 dark:text-indigo-300">
                            اعلیٰ معیاری جملہ
                          </span>
                        </div>

                        <p className="text-lg sm:text-xl font-black text-indigo-950 dark:text-indigo-100 leading-snug pt-2">
                          &ldquo;{latestTurn.advancedAlternativeSentence}&rdquo;
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-indigo-200 dark:border-indigo-800/60">
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.advancedAlternativeSentence,
                              0.92
                            )
                          }
                          className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Hear Advanced Expression</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CARD ROW 2: DETAILED NATIVE LANGUAGE EXPLANATION (AAPKI ZUBAN ME WAZAHAT) */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-300 dark:border-blue-800 shadow-lg space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{selectedLangObj.flag}</span>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                            Grammar Rule & Explanation in {selectedLangObj.nativeName}
                          </span>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                            📌 {latestTurn.grammarRuleTitle}
                          </h3>
                        </div>
                      </div>

                      <span className="px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black">
                        آپ کی زبان میں تفصیلی وضاحت
                      </span>
                    </div>

                    {/* Native Language Explanation with Crisp, High-Readability Font */}
                    <div
                      dir={isRtlLang ? 'rtl' : 'ltr'}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-loose">
                        {latestTurn.nativeLanguageGreetingOrFeedback}
                      </p>
                      <p className="text-sm sm:text-lg font-semibold text-blue-900 dark:text-blue-200 leading-relaxed">
                        💡 {latestTurn.mistakeExplanationInNative}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-400 pt-1">
                        🌟 {latestTurn.encouragementInNative}
                      </p>
                    </div>
                  </div>

                  {/* CARD ROW 3: VOCABULARY & PRONUNCIATION CARDS */}
                  {latestTurn.vocabularyCards &&
                    latestTurn.vocabularyCards.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            Key Vocabulary & Pronunciation Cards ({selectedLevelObj.badge})
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {latestTurn.vocabularyCards.map((vc, idx) => (
                            <div
                              key={idx}
                              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm flex flex-col justify-between space-y-3 transition-all"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-black text-slate-900 dark:text-white">
                                    {vc.word}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-blue-700 dark:text-blue-300 font-bold">
                                    {vc.phonetic}
                                  </span>
                                </div>

                                <div
                                  dir={isRtlLang ? 'rtl' : 'ltr'}
                                  className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400"
                                >
                                  {selectedLangObj.flag} {vc.nativeMeaning}
                                </div>

                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic pt-1">
                                  &ldquo;{vc.example}&rdquo;
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  speakWithAvatarLipSync(
                                    `${vc.word}. ${vc.example}`,
                                    0.88
                                  )
                                }
                                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-xs font-black text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Pronounce Word & Sentence</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* PREVIOUS SESSION CORRECTIONS TIMELINE */}
                  {turns.length > 1 && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>Session Correction History ({turns.length} Turns)</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => startLiveAgentSession(nativeLanguage, learnerLevel)}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Reset Session
                        </button>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {turns
                          .slice(0, -1)
                          .reverse()
                          .map((t) => (
                            <div
                              key={t.id}
                              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                  ❌ Spoken: &ldquo;{t.originalUserSentence}&rdquo;
                                </div>
                                <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                                  ✅ Corrected: &ldquo;{t.correctedEnglishSentence}&rdquo;
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  speakWithAvatarLipSync(t.correctedEnglishSentence, 0.9)
                                }
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Listen</span>
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
