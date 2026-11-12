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
  ChevronRight,
  Sliders,
  PhoneCall,
  PhoneOff,
  Briefcase,
  Users,
} from 'lucide-react';
import {
  DUOLINGO_BASE_LANGUAGES,
  getBaseLanguageInfo,
} from '@/lib/duolingo-languages';
import { speakRealisticText, stopRealisticSpeech } from '@/lib/voice-engine';
import { playSuccessSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

type LearnerLevel = 'basic' | 'mid' | 'advanced';
type SessionMode = 'teaching' | 'roleplay' | 'guided_lesson';
type RoleplayScenarioId =
  | 'job_interview'
  | 'cafe_order'
  | 'airport_immigration'
  | 'doctor_visit'
  | 'hotel_checkin'
  | 'business_meeting';
type GeminiVoiceName = 'Aoede' | 'Kore' | 'Puck' | 'Charon';
type MouthViseme =
  | 'closed'
  | 'slightly_open'
  | 'wide_ah'
  | 'round_oh'
  | 'teeth_fv'
  | 'smile';

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
  'pa', // Punjabi
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
}[] = [
  {
    id: 'basic',
    badge: '🌱 Basic Level',
    title: 'Basic Beginner',
    cefr: 'CEFR A0 – A1',
    desc: 'Learn daily sentences, simple grammar rules, and step-by-step speaking with full native language guidance.',
    urduHint: 'ابتدائی لیول: آسان جملے اور آپ کی زبان میں مکمل رہنمائی',
  },
  {
    id: 'mid',
    badge: '🚀 Mid Level',
    title: 'Intermediate Speaker',
    cefr: 'CEFR A2 – B1',
    desc: 'Master past/present/future tenses, fix common speaking mistakes, and build confident real-life fluency.',
    urduHint: 'درمیانہ لیول: گرامر کی غلطیاں درست کریں اور روانی سے بولیں',
  },
  {
    id: 'advanced',
    badge: '👑 Advanced Level',
    title: 'Advanced & Professional',
    cefr: 'CEFR B2 – C2',
    desc: 'Executive communication, job interview mastery, native idioms, and high-level sentence refinement.',
    urduHint: 'ایڈوانسڈ لیول: پروفیشنل انگلش، انٹرویو اور اعلیٰ الفاظ',
  },
];

const SESSION_MODES: {
  id: SessionMode;
  badge: string;
  title: string;
  desc: string;
  urduTitle: string;
}[] = [
  {
    id: 'teaching',
    badge: '👩‍🏫 Live Teacher Mode',
    title: 'Bilingual Teacher & Mistake Fixer',
    desc: 'Sophia talks with you like a real teacher, tests your English, and corrects every mistake in detailed cards.',
    urduTitle: 'لائیو ٹیچر: غلط اور صحیح فقرات کی تفصیلی اصلاح',
  },
  {
    id: 'roleplay',
    badge: '🎭 Live Roleplay Mode',
    title: 'Real-Life Roleplay Scenarios',
    desc: 'Practice Job Interviews, Airport Immigration, Cafe Ordering, Doctor Visits & Business Meetings live!',
    urduTitle: 'لائیو رول پلے: جاب انٹرویو، ایئرپورٹ، کیفے اور ڈاکٹر کلینک',
  },
  {
    id: 'guided_lesson',
    badge: '🎓 Guided Speaking Class',
    title: 'Step-by-Step English Speaking Drill',
    desc: 'Follow a structured speaking lesson where Sophia teaches a daily sentence pattern and drills your pronunciation.',
    urduTitle: 'گائیڈڈ کلاس: قدم بہ قدم انگلش بولنے کی مشق',
  },
];

const ROLEPLAY_OPTIONS: {
  id: RoleplayScenarioId;
  emoji: string;
  title: string;
  roleDesc: string;
  urduLabel: string;
}[] = [
  {
    id: 'job_interview',
    emoji: '💼',
    title: 'Job Interview',
    roleDesc: 'Sophia = HR Hiring Manager',
    urduLabel: 'جاب انٹرویو کی تیاری',
  },
  {
    id: 'cafe_order',
    emoji: '☕',
    title: 'Miami Cafe & Restaurant',
    roleDesc: 'Sophia = Friendly Barista',
    urduLabel: 'کیفے اور ریسٹورنٹ آرڈر',
  },
  {
    id: 'airport_immigration',
    emoji: '✈️',
    title: 'Airport & Immigration',
    roleDesc: 'Sophia = US Customs Officer',
    urduLabel: 'ایئرپورٹ اور امیگریشن',
  },
  {
    id: 'doctor_visit',
    emoji: '🏥',
    title: 'Doctor Appointment',
    roleDesc: 'Sophia = Clinic Doctor',
    urduLabel: 'ڈاکٹر کلینک چیک اپ',
  },
  {
    id: 'hotel_checkin',
    emoji: '🏨',
    title: '5-Star Hotel Check-In',
    roleDesc: 'Sophia = Front Desk Manager',
    urduLabel: 'ہوٹل ریسیپشن اور بکنگ',
  },
  {
    id: 'business_meeting',
    emoji: '🤝',
    title: 'Executive Client Meeting',
    roleDesc: 'Sophia = US Tech Partner VP',
    urduLabel: 'بزنس اور کلائنٹ میٹنگ',
  },
];

const GEMINI_VOICE_OPTIONS: {
  id: GeminiVoiceName;
  label: string;
  desc: string;
}[] = [
  { id: 'Aoede', label: 'Aoede (Warm Teacher)', desc: 'Natural & Encouraging' },
  { id: 'Kore', label: 'Kore (Clear Coach)', desc: 'Crisp & Articulate' },
  { id: 'Puck', label: 'Puck (Friendly Partner)', desc: 'Energetic Roleplay' },
  { id: 'Charon', label: 'Charon (Executive)', desc: 'Deep & Professional' },
];

const QUICK_TEST_SENTENCES: { label: string; text: string }[] = [
  {
    label: '❌ "I am agree with your point."',
    text: 'I am agree with your point.',
  },
  {
    label: '❌ "Yesterday I goed to market with my brother."',
    text: 'Yesterday I goed to market with my brother.',
  },
  {
    label: '❌ "I have 22 years old and I am student."',
    text: 'I have 22 years old and I am student.',
  },
  {
    label: '❌ "She don\'t know nothing about this problem."',
    text: "She don't know nothing about this problem.",
  },
  {
    label: '❌ "I am learning English since two years."',
    text: 'I am learning English since two years.',
  },
  {
    label: '✅ "I have two years of experience and I love working with teams."',
    text: 'I have two years of experience and I love working with teams.',
  },
];

export default function LiveAITalkingAgentPage() {
  const [session, setSession] = useState<UserSession | null>(null);

  // Onboarding / Session Setup
  const [setupCompleted, setSetupCompleted] = useState<boolean>(false);
  const [nativeLanguage, setNativeLanguage] = useState<string>('ur');
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('basic');
  const [sessionMode, setSessionMode] = useState<SessionMode>('teaching');
  const [roleplayScenario, setRoleplayScenario] =
    useState<RoleplayScenarioId>('job_interview');
  const [geminiVoice, setGeminiVoice] = useState<GeminiVoiceName>('Aoede');
  const [showAllLanguages, setShowAllLanguages] = useState<boolean>(false);

  // Hands-Free Continuous Auto-Mic (So user NEVER has to click mic repeatedly!)
  const [handsFreeAutoMic, setHandsFreeAutoMic] = useState<boolean>(true);
  const handsFreeRef = useRef<boolean>(true);
  useEffect(() => {
    handsFreeRef.current = handsFreeAutoMic;
  }, [handsFreeAutoMic]);

  // Gemini Live API Key Management
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState<string>('');
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);
  const [apiKeySavedMsg, setApiKeySavedMsg] = useState<string | null>(null);
  const [activeVoiceEngineLabel, setActiveVoiceEngineLabel] = useState<string>(
    'Gemini Aoede Neural Voice'
  );

  // Live Agent State
  const [turns, setTurns] = useState<LiveAgentTurn[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');

  // Realistic Avatar Lip-Sync & Voice State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const [viseme, setViseme] = useState<MouthViseme>('smile');
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voiceMuted, setVoiceMuted] = useState<boolean>(false);
  const [currentlySpokenText, setCurrentlySpokenText] = useState<string>('');
  const [audioBars, setAudioBars] = useState<number[]>([
    18, 32, 24, 45, 30, 52, 28, 38, 22, 48, 34, 26, 42, 20, 36, 24,
  ]);

  // Speech Recognition (Hands-Free Mic) & Audio Element Refs
  const [isListening, setIsListening] = useState<boolean>(false);
  const [callEnded, setCallEnded] = useState<boolean>(false);
  const [synthesizingVoice, setSynthesizingVoice] = useState<boolean>(false);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const visemeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastAgentSpokenRef = useRef<string>('');
  const audioCooldownUntilRef = useRef<number>(0);
  const isSendingRef = useRef<boolean>(false);
  const setupCompletedRef = useRef<boolean>(false);
  const lastSentSignatureRef = useRef<{ text: string; at: number }>({
    text: '',
    at: 0,
  });
  const sendSentenceRef = useRef<(text?: string) => Promise<void>>(async () => {});
  const startAutoMicRef = useRef<() => void>(() => {});

  useEffect(() => {
    setupCompletedRef.current = setupCompleted;
  }, [setupCompleted]);

  // Load user session & API key status
  useEffect(() => {
    const savedKey =
      typeof window !== 'undefined'
        ? localStorage.getItem('miami_gemini_live_api_key') || ''
        : '';
    if (savedKey) setGeminiApiKeyInput(savedKey);

    Promise.all([
      fetch('/api/auth/me')
        .then((r) => r.json())
        .catch(() => ({})),
      fetch('/api/ai/live-agent')
        .then((r) => r.json())
        .catch(() => ({})),
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

  // Live Call Timer when inside studio and call not ended
  useEffect(() => {
    if (!setupCompleted || callEnded) {
      if (!setupCompleted) setCallSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [setupCompleted, callEnded]);

  // Stop all audio & lip-sync cleanly
  const stopAllVoiceAndLipSync = useCallback(() => {
    if (visemeTimerRef.current) {
      clearInterval(visemeTimerRef.current);
      visemeTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.pause();
        htmlAudioRef.current.src = '';
      } catch {}
      htmlAudioRef.current = null;
    }
    stopRealisticSpeech();
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setViseme('smile');
    setAudioBars([14, 18, 12, 22, 16, 14, 20, 15, 12, 18, 14, 16, 20, 14, 16, 12]);
  }, []);

  // Start fallback cadence lip-sync
  const startCadenceLipSync = useCallback((textToAnalyze: string) => {
    if (visemeTimerRef.current) clearInterval(visemeTimerRef.current);
    isSpeakingRef.current = true;
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
        prev.map(() => Math.floor(22 + Math.random() * 74))
      );
    }, 90);
  }, []);

  useEffect(() => {
    return () => {
      stopAllVoiceAndLipSync();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [stopAllVoiceAndLipSync]);

  // =========================================================================
  // REAL GEMINI NEURAL VOICE + CLOUD NEURAL TTS WITH REAL AUDIO LIP-SYNC
  // Automatically triggers Hands-Free Mic as soon as Sophia finishes speaking!
  // =========================================================================
  const speakWithAvatarLipSync = useCallback(
    async (text: string, customRate?: number, triggerMicAfter = true) => {
      if (!text || voiceMuted) {
        if (triggerMicAfter && handsFreeRef.current) {
          setTimeout(() => startAutoMicRef.current(), 300);
        }
        return;
      }

      // Pause microphone while Sophia speaks so she never hears her own echo
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
        setIsListening(false);
      }

      stopAllVoiceAndLipSync();
      const rateToUse = customRate || voiceSpeed;
      setCurrentlySpokenText(text);
      lastAgentSpokenRef.current = text.toLowerCase();
      setSynthesizingVoice(true);

      const onSpeechComplete = () => {
        setSynthesizingVoice(false);
        stopAllVoiceAndLipSync();
        audioCooldownUntilRef.current = Date.now() + 850;
        // Hands-free magic: wait 900ms for speaker echo to clear before opening user's mic!
        if (triggerMicAfter && handsFreeRef.current) {
          setTimeout(() => {
            if (!isSpeakingRef.current && handsFreeRef.current) {
              startAutoMicRef.current();
            }
          }, 900);
        }
      };

      try {
        // Call our Server-Side Gemini Studio Voice TTS endpoint (/api/ai/tts)
        const res = await fetch('/api/ai/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName: geminiVoice,
            apiKeyOverride: geminiApiKeyInput.trim() || undefined,
          }),
        });

        setSynthesizingVoice(false);

        if (res.ok) {
          const engineHeader = res.headers.get('X-Voice-Engine') || '';
          if (engineHeader.startsWith('gemini-')) {
            setActiveVoiceEngineLabel(`Gemini Live Voice (${geminiVoice})`);
          } else {
            setActiveVoiceEngineLabel(`Google Neural HD Voice (${geminiVoice})`);
          }

          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audio.playbackRate = Math.max(0.65, Math.min(1.35, rateToUse));
          htmlAudioRef.current = audio;

          // Start cadence lip-sync immediately; upgrade to real AudioContext spectrum if unlocked
          startCadenceLipSync(text);
          try {
            if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
              const source = audioCtxRef.current.createMediaElementSource(audio);
              const analyser = audioCtxRef.current.createAnalyser();
              analyser.fftSize = 64;
              source.connect(analyser);
              analyser.connect(audioCtxRef.current.destination);

              const freqData = new Uint8Array(analyser.frequencyBinCount);
              const updateRealVisemeFromAudio = () => {
                if (!isSpeakingRef.current) return;
                analyser.getByteFrequencyData(freqData);
                let sum = 0;
                for (let i = 1; i < 16; i++) {
                  sum += freqData[i];
                }
                const avg = sum / 15;

                if (avg < 18) setViseme('closed');
                else if (avg < 55) setViseme('teeth_fv');
                else if (avg < 95) setViseme('slightly_open');
                else if (avg < 145) setViseme('round_oh');
                else setViseme('wide_ah');

                const bars: number[] = [];
                for (let i = 0; i < 16; i++) {
                  bars.push(Math.max(15, Math.min(98, Math.round((freqData[i] / 255) * 100))));
                }
                setAudioBars(bars);

                animFrameRef.current = requestAnimationFrame(updateRealVisemeFromAudio);
              };

              if (visemeTimerRef.current) {
                clearInterval(visemeTimerRef.current);
                visemeTimerRef.current = null;
              }
              animFrameRef.current = requestAnimationFrame(updateRealVisemeFromAudio);
            }
          } catch {
            // Cadence lip-sync timer remains active
          }

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            onSpeechComplete();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            onSpeechComplete();
          };

          await audio.play();
          return;
        }
      } catch (err) {
        setSynthesizingVoice(false);
        console.warn('Server TTS unavailable, trying direct browser neural voice:', err);
      }

      // Direct browser playback of Google neural voice (browser trusts system certs)
      try {
        const cleaned = text.replace(/[*#_~`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 700);
        const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned];
        const chunks: string[] = [];
        let cur = '';
        for (const s of sentences) {
          const t = s.trim();
          if (!t) continue;
          if ((cur + ' ' + t).trim().length <= 180) cur = (cur + ' ' + t).trim();
          else {
            if (cur) chunks.push(cur);
            cur = t.slice(0, 180);
          }
        }
        if (cur) chunks.push(cur);

        if (chunks.length > 0) {
          setActiveVoiceEngineLabel('Google Neural HD Voice');
          startCadenceLipSync(text);
          let idx = 0;
          const playNext = () => {
            if (!isSpeakingRef.current || idx >= chunks.length) {
              onSpeechComplete();
              return;
            }
            const a = new Audio(
              `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-US&q=${encodeURIComponent(chunks[idx])}`
            );
            a.playbackRate = Math.max(0.65, Math.min(1.35, rateToUse));
            htmlAudioRef.current = a;
            a.onended = () => {
              idx += 1;
              playNext();
            };
            a.onerror = () => {
              if (idx === 0) {
                // Nothing played: fall back to local voice
                htmlAudioRef.current = null;
                speakRealisticText(text, {
                  rate: rateToUse,
                  pitch: 1.05,
                  preferBrowserTTS: true,
                  onEnd: onSpeechComplete,
                });
              } else {
                onSpeechComplete();
              }
            };
            a.play().catch(() => a.onerror && (a.onerror as any)(new Event('error')));
          };
          playNext();
          return;
        }
      } catch (err) {
        console.warn('Direct neural voice failed:', err);
      }

      // Fallback to local neural browser TTS if offline
      const wordCount = text.trim().split(/\s+/).length;
      const estimatedMs = Math.max(
        1800,
        Math.min(18000, Math.round((wordCount / (2.4 * rateToUse)) * 1000))
      );
      startCadenceLipSync(text);
      const fallbackTimeout = setTimeout(() => {
        onSpeechComplete();
      }, estimatedMs);

      speakRealisticText(text, {
        rate: rateToUse,
        pitch: 1.05,
        preferBrowserTTS: true,
        onStart: () => startCadenceLipSync(text),
        onEnd: () => {
          clearTimeout(fallbackTimeout);
          onSpeechComplete();
        },
      });
    },
    [
      voiceMuted,
      voiceSpeed,
      geminiVoice,
      geminiApiKeyInput,
      stopAllVoiceAndLipSync,
      startCadenceLipSync,
    ]
  );

  // =========================================================================
  // HANDS-FREE CONTINUOUS SPEECH RECOGNITION (SINGLE CLEAN TURN PER UTTERANCE)
  // =========================================================================
  const startHandsFreeListening = useCallback(() => {
    if (
      !setupCompletedRef.current ||
      isSpeakingRef.current ||
      isSendingRef.current ||
      loading
    ) {
      return;
    }

    if (Date.now() < audioCooldownUntilRef.current) {
      const waitMs = Math.max(200, audioCooldownUntilRef.current - Date.now() + 80);
      setTimeout(() => startAutoMicRef.current(), waitMs);
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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      setMicError(null);
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;

      let accumulatedTranscript = '';
      let submitted = false;

      const submitCapturedSpeech = (textToSend: string) => {
        if (submitted || isSendingRef.current || isSpeakingRef.current) return;
        const cleaned = textToSend.trim();
        if (cleaned.length < 2) return;

        // Echo-shield: if SpeechRecognition accidentally picked up Sophia's own speaker audio, ignore and keep listening
        const spokenWords = cleaned
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(Boolean);
        const agentText = (lastAgentSpokenRef.current || '').replace(
          /[^a-z0-9\s]/g,
          ''
        );
        if (spokenWords.length >= 3 && agentText) {
          const matchedWords = spokenWords.filter(
            (w) => w.length > 2 && agentText.includes(w)
          );
          if (
            matchedWords.length / spokenWords.length >= 0.65 &&
            agentText.includes(spokenWords.slice(0, 3).join(' '))
          ) {
            accumulatedTranscript = '';
            setInterimTranscript('');
            setUserInput('');
            return;
          }
        }

        // Duplicate-turn shield: never re-send the same utterance within 8 seconds
        const norm = cleaned.toLowerCase();
        if (
          lastSentSignatureRef.current.text === norm &&
          Date.now() - lastSentSignatureRef.current.at < 8000
        ) {
          return;
        }

        submitted = true;
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        try {
          recognition.onresult = null;
          recognition.onend = null;
          recognition.onerror = null;
          recognition.abort();
        } catch {}
        recognitionRef.current = null;
        setIsListening(false);
        sendSentenceRef.current(cleaned);
      };

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        if (submitted || isSpeakingRef.current || isSendingRef.current) return;

        let interim = '';
        let finalPart = '';
        let hasNewFinal = false;

        for (let i = 0; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPart += t + ' ';
            hasNewFinal = true;
          } else {
            interim += t;
          }
        }
        accumulatedTranscript = (finalPart + interim).trim();
        setInterimTranscript(accumulatedTranscript);
        setUserInput(accumulatedTranscript);

        // Clear any pending auto-send timer whenever user is still speaking!
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        // Only auto-send after a finalized phrase + natural 2.2s pause (so mid-thought pauses don't split messages!)
        const wordCount = accumulatedTranscript.split(/\s+/).filter(Boolean).length;
        if (hasNewFinal && !interim.trim() && wordCount >= 2) {
          silenceTimerRef.current = setTimeout(() => {
            submitCapturedSpeech(accumulatedTranscript);
          }, 2200);
        } else if (wordCount >= 3) {
          // Backup 3.2s pause timer if browser delays marking isFinal
          silenceTimerRef.current = setTimeout(() => {
            submitCapturedSpeech(accumulatedTranscript);
          }, 3200);
        }
      };

      recognition.onerror = (e: any) => {
        if (e?.error === 'not-allowed') {
          setMicError(
            'Microphone access blocked by browser. Click the lock icon in the address bar to allow Microphone.'
          );
          setHandsFreeAutoMic(false);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (
          !submitted &&
          !isSendingRef.current &&
          !isSpeakingRef.current &&
          accumulatedTranscript.trim().split(/\s+/).length >= 2
        ) {
          submitCapturedSpeech(accumulatedTranscript);
        } else if (
          !submitted &&
          setupCompletedRef.current &&
          handsFreeRef.current &&
          !isSpeakingRef.current &&
          !isSendingRef.current
        ) {
          // Keep live call open silently without sending anything
          setTimeout(() => {
            if (
              setupCompletedRef.current &&
              handsFreeRef.current &&
              !isSpeakingRef.current &&
              !isSendingRef.current
            ) {
              startAutoMicRef.current();
            }
          }, 600);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [loading]);

  useEffect(() => {
    startAutoMicRef.current = startHandsFreeListening;
  }, [startHandsFreeListening]);

  // Start or restart session with selected Language, Level, Mode & Roleplay Scenario
  const startLiveAgentSession = async (
    chosenLang = nativeLanguage,
    chosenLevel = learnerLevel,
    chosenMode = sessionMode,
    chosenScenario = roleplayScenario
  ) => {
    // Unlock Web AudioContext cleanly inside user gesture
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
      }
    } catch {}

    setCallEnded(false);
    setHandsFreeAutoMic(true);
    handsFreeRef.current = true;
    setSetupCompleted(true);
    setLoading(true);
    stopAllVoiceAndLipSync();

    try {
      const res = await fetch('/api/ai/live-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isInitialGreeting: true,
          nativeLanguage: chosenLang,
          level: chosenLevel,
          sessionMode: chosenMode,
          roleplayScenario: chosenScenario,
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
            payload.spokenTeacherReply || payload.spokenGreetingOrReply || '',
            voiceSpeed,
            true
          );
        }, 200);
      }
    } catch (err) {
      console.error('Failed to start Live Agent:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send user spoken or typed sentence to the Live Agent
  const sendSentenceToLiveAgent = useCallback(
    async (textToSubmit?: string) => {
      const cleanText = (textToSubmit ?? userInput).trim();
      if (!cleanText || loading || isSendingRef.current) return;

      isSendingRef.current = true;
      lastSentSignatureRef.current = {
        text: cleanText.toLowerCase(),
        at: Date.now(),
      };

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
        setIsListening(false);
      }

      setUserInput('');
      setInterimTranscript('');
      setLoading(true);

      try {
        const historyPayload = turns.slice(-6).map((t) => ({
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
            sessionMode,
            roleplayScenario,
            conversationHistory: historyPayload,
            turnCount: turns.length,
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

          setTimeout(() => {
            speakWithAvatarLipSync(
              payload.spokenTeacherReply || payload.spokenGreetingOrReply || '',
              voiceSpeed,
              true
            );
          }, 150);
        }
      } catch (err) {
        console.error('Live Agent error:', err);
      } finally {
        isSendingRef.current = false;
        setLoading(false);
      }
    },
    [
      userInput,
      loading,
      nativeLanguage,
      learnerLevel,
      sessionMode,
      roleplayScenario,
      turns.length,
      geminiApiKeyInput,
      voiceSpeed,
      speakWithAvatarLipSync,
    ]
  );

  useEffect(() => {
    sendSentenceRef.current = sendSentenceToLiveAgent;
  }, [sendSentenceToLiveAgent]);

  // Save Gemini API Key
  const handleSaveApiKey = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'miami_gemini_live_api_key',
        geminiApiKeyInput.trim()
      );
    }
    try {
      const res = await fetch('/api/ai/live-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: geminiApiKeyInput.trim() }),
      });
      const data = await res.json();
      if (data.hasApiKey) setHasServerKey(true);
      setApiKeySavedMsg(
        '✅ Gemini Live API Key saved! Native Gemini Voice (Aoede/Kore) is now active!'
      );
      setTimeout(() => {
        setApiKeySavedMsg(null);
        setShowApiKeyModal(false);
      }, 1500);
    } catch {
      setApiKeySavedMsg('Saved in browser storage!');
    }
  };

  // Manual toggle for microphone / hands-free call
  const toggleMicrophoneOrHandsFree = () => {
    setMicError(null);
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      if (interimTranscript.trim().length > 1) {
        sendSentenceToLiveAgent(interimTranscript.trim());
      }
      return;
    }

    setCallEnded(false);
    stopAllVoiceAndLipSync();
    setHandsFreeAutoMic(true);
    handsFreeRef.current = true;
    startHandsFreeListening();
  };

  // End Live Call cleanly without erasing correction cards
  const endLiveCall = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setHandsFreeAutoMic(false);
    handsFreeRef.current = false;
    setSynthesizingVoice(false);
    stopAllVoiceAndLipSync();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCallEnded(true);
  };

  const selectedLangObj = getBaseLanguageInfo(nativeLanguage);
  const selectedLevelObj =
    LEVEL_OPTIONS.find((l) => l.id === learnerLevel) || LEVEL_OPTIONS[0];
  const selectedModeObj =
    SESSION_MODES.find((m) => m.id === sessionMode) || SESSION_MODES[0];
  const selectedRoleplayObj =
    ROLEPLAY_OPTIONS.find((r) => r.id === roleplayScenario) ||
    ROLEPLAY_OPTIONS[0];
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
                    ● {activeVoiceEngineLabel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[10px] font-black uppercase tracking-widest">
                    {selectedLangObj.flag} {selectedLangObj.nativeName} → 🇺🇸 English
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    {selectedLevelObj.badge} • {selectedModeObj.badge}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight mt-1">
                  Sophia — Gemini Live AI Teacher & Roleplay Partner
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 font-medium">
                  Realistic Gemini neural voice, hands-free continuous auto-mic (no need to click mic repeatedly!), live roleplay, and detailed sentence correction cards.
                </p>
              </div>
            </div>

            {/* Right Quick Controls: Voice Persona, Setup & Gemini API Key */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Gemini Prebuilt Voice Selector (Aoede, Kore, Puck, Charon) */}
              <select
                value={geminiVoice}
                onChange={(e) => setGeminiVoice(e.target.value as GeminiVoiceName)}
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-blue-400/40 text-xs font-extrabold text-amber-300 cursor-pointer focus:outline-none"
                title="Select Gemini Voice Persona"
              >
                {GEMINI_VOICE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-white">
                    🔊 Voice: {v.label}
                  </option>
                ))}
              </select>

              {setupCompleted && (
                <button
                  type="button"
                  onClick={() => {
                    stopAllVoiceAndLipSync();
                    if (recognitionRef.current) {
                      try {
                        recognitionRef.current.onend = null;
                        recognitionRef.current.stop();
                      } catch {}
                    }
                    setIsListening(false);
                    setSetupCompleted(false);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-extrabold text-white flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <span>Language / Level</span>
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
                    Configure Gemini Live API Key (For Native Aoede / Kore Audio & Gemini 2.0)
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
                Paste your <strong>Gemini API Key</strong> (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">AIzaSy...</code>) to unlock direct 24kHz Gemini Native Audio (<code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Aoede</code>, <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Kore</code>, <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Puck</code>) + live roleplay intelligence. Even without a key, our server streams natural Google Neural HD female audio automatically!
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
              STEP 1, STEP 2 & STEP 3 ONBOARDING SCREEN
              (SELECT LANGUAGE + SELECT LEVEL + SELECT TEACHER / ROLEPLAY MODE)
             ===================================================================== */}
          {!setupCompleted ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-8">
              {/* Step 1: Select Native Language */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5" /> Step 1 of 3 • Apni Zuban Select Karein
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                      Choose Your Native Language (کس زبان میں سمجھنا چاہتے ہیں؟)
                    </h2>
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
                    <GraduationCap className="w-3.5 h-3.5" /> Step 2 of 3 • Select Your English Level
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                    What is Your Current English Level? (اپنا لیول منتخب کریں)
                  </h2>
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

              {/* Step 3: Select Practice Mode (Live Teacher vs. Roleplay vs. Guided Lesson) */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-xs font-black uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" /> Step 3 of 3 • Choose Teaching, Roleplay or Guided Lesson
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                    How Would You Like Sophia to Practice With You Today?
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SESSION_MODES.map((m) => {
                    const active = sessionMode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSessionMode(m.id);
                          playSuccessSound();
                        }}
                        className={`p-5 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-gradient-to-br from-indigo-900 to-blue-950 text-white border-emerald-400 shadow-lg -translate-y-0.5'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <div className="space-y-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                              active
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                            }`}
                          >
                            {m.badge}
                          </span>
                          <h3 className="text-base sm:text-lg font-black pt-1">
                            {m.title}
                          </h3>
                          <p
                            className={`text-xs leading-relaxed ${
                              active
                                ? 'text-blue-100'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {m.desc}
                          </p>
                        </div>
                        <div
                          dir="rtl"
                          className={`mt-3 pt-2 border-t text-xs font-bold ${
                            active
                              ? 'border-white/15 text-amber-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          {m.urduTitle}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Roleplay Scenario Picker (Shown when Roleplay Mode is selected) */}
                {sessionMode === 'roleplay' && (
                  <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                      🎭 Select Your Live Roleplay Scenario:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ROLEPLAY_OPTIONS.map((rp) => {
                        const active = roleplayScenario === rp.id;
                        return (
                          <button
                            key={rp.id}
                            type="button"
                            onClick={() => setRoleplayScenario(rp.id)}
                            className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                              active
                                ? 'bg-indigo-700 text-white border-amber-300 shadow-md'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xl">{rp.emoji}</span>
                              <span
                                dir="rtl"
                                className={`text-[11px] font-bold ${
                                  active ? 'text-amber-300' : 'text-slate-500'
                                }`}
                              >
                                {rp.urduLabel}
                              </span>
                            </div>
                            <div className="font-black text-sm mt-1">
                              {rp.title}
                            </div>
                            <div
                              className={`text-[11px] font-semibold ${
                                active ? 'text-indigo-200' : 'text-slate-500'
                              }`}
                            >
                              {rp.roleDesc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Start Live Session CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/90 dark:to-indigo-950/60 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedLangObj.flag}</span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                      🟢 Hands-Free Auto-Mic & Gemini Neural Voice Ready
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {selectedLangObj.nativeName} • {selectedLevelObj.title} • {selectedModeObj.title}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    startLiveAgentSession(
                      nativeLanguage,
                      learnerLevel,
                      sessionMode,
                      roleplayScenario
                    )
                  }
                  className="w-full sm:w-auto btn-3d-primary px-8 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Start Hands-Free Live AI Call Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* =====================================================================
               LIVE AI TALKING AGENT STUDIO + ROLEPLAY BAR + DETAILED CARDS
               ===================================================================== */
            <div className="space-y-6">
              {/* INSTANT MODE & ROLEPLAY SWITCHER BAR INSIDE STUDIO */}
              <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {SESSION_MODES.map((m) => {
                      const active = sessionMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSessionMode(m.id);
                            startLiveAgentSession(
                              nativeLanguage,
                              learnerLevel,
                              m.id,
                              roleplayScenario
                            );
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all border ${
                            active
                              ? 'bg-blue-700 text-white border-blue-900 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                          }`}
                        >
                          {m.badge}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hands-Free Auto-Mic Call Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        if (callEnded) {
                          setCallEnded(false);
                          setHandsFreeAutoMic(true);
                          handsFreeRef.current = true;
                          startHandsFreeListening();
                          return;
                        }
                        const next = !handsFreeAutoMic;
                        setHandsFreeAutoMic(next);
                        handsFreeRef.current = next;
                        if (!next && recognitionRef.current) {
                          try {
                            recognitionRef.current.onresult = null;
                            recognitionRef.current.onend = null;
                            recognitionRef.current.abort();
                          } catch {}
                          setIsListening(false);
                        } else if (next && !isSpeakingRef.current) {
                          startHandsFreeListening();
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer border transition-all ${
                        handsFreeAutoMic && !callEnded
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {handsFreeAutoMic && !callEnded ? (
                        <>
                          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                          <span>🟢 Auto-Mic: ON</span>
                        </>
                      ) : (
                        <>
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{callEnded ? 'Resume Call' : 'Auto-Mic: Paused'}</span>
                        </>
                      )}
                    </button>

                    {/* Red End Call Button */}
                    {!callEnded && (
                      <button
                        type="button"
                        onClick={endLiveCall}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>End Call</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Roleplay Scenario Pills if in Roleplay Mode */}
                {sessionMode === 'roleplay' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mr-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Active Roleplay:</span>
                    </span>
                    {ROLEPLAY_OPTIONS.map((rp) => {
                      const active = roleplayScenario === rp.id;
                      return (
                        <button
                          key={rp.id}
                          type="button"
                          onClick={() => {
                            setRoleplayScenario(rp.id);
                            startLiveAgentSession(
                              nativeLanguage,
                              learnerLevel,
                              'roleplay',
                              rp.id
                            );
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 border ${
                            active
                              ? 'bg-indigo-700 text-white border-indigo-900'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                          }`}
                        >
                          <span>{rp.emoji}</span>
                          <span>{rp.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TOP GRID: LEFT = REALISTIC LIP-SYNCED AVATAR, RIGHT = HANDS-FREE MIC & LIVE TEST */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LEFT 5 COLS: REALISTIC TALKING AI TEACHER AVATAR WITH REAL AUDIO LIP MOVEMENTS */}
                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white border-2 border-blue-500/60 shadow-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
                  {/* Top Studio Status Pills */}
                  <div className="flex items-center justify-between gap-2 z-10">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/15">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          callEnded
                            ? 'bg-slate-400'
                            : synthesizingVoice || loading
                              ? 'bg-amber-400 animate-pulse'
                              : isSpeaking
                                ? 'bg-emerald-400 animate-ping'
                                : isListening
                                  ? 'bg-rose-500 animate-ping'
                                  : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                        {callEnded
                          ? `📞 Call Ended (${String(Math.floor(callSeconds / 60)).padStart(2, '0')}:${String(callSeconds % 60).padStart(2, '0')})`
                          : loading
                            ? '🧠 Thinking...'
                            : synthesizingVoice
                              ? `🎙️ Loading Gemini Voice (${geminiVoice})...`
                              : isSpeaking
                                ? `🗣️ Speaking (${geminiVoice})`
                                : isListening
                                  ? '🎙️ Listening — Speak Now!'
                                  : `🟢 Call Live • ${String(Math.floor(callSeconds / 60)).padStart(2, '0')}:${String(callSeconds % 60).padStart(2, '0')}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0.85, 1.0, 1.15].map((spd) => (
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
                            stopAllVoiceAndLipSync();
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
                    <div
                      className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSpeaking
                          ? 'ring-8 ring-emerald-400/30 shadow-[0_0_60px_rgba(16,185,129,0.45)]'
                          : isListening
                            ? 'ring-8 ring-rose-500/35 shadow-[0_0_50px_rgba(244,63,94,0.45)]'
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

                        {/* Head / Face Contour */}
                        <path
                          d={
                            viseme === 'wide_ah' || viseme === 'round_oh'
                              ? 'M96 132 C96 82, 122 58, 160 58 C198 58, 224 82, 224 132 C224 186, 198 238, 160 241 C122 238, 96 186, 96 132 Z'
                              : 'M96 132 C96 82, 122 58, 160 58 C198 58, 224 82, 224 132 C224 184, 198 233, 160 236 C122 233, 96 184, 96 132 Z'
                          }
                          fill="url(#skinGrad)"
                        />

                        <ellipse cx="118" cy="172" rx="15" ry="9" fill="#f43f5e" opacity="0.16" />
                        <ellipse cx="202" cy="172" rx="15" ry="9" fill="#f43f5e" opacity="0.16" />

                        {/* Eyebrows */}
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

                        {/* Eyes */}
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

                        {/* Nose */}
                        <path
                          d="M160 144 L156 171 Q160 175 166 171"
                          stroke="#c88a6b"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Multi-Viseme Realistic Lip & Mouth Synchronization */}
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
                            <ellipse cx="160" cy="198" rx="19" ry="7.5" fill="#4c0519" />
                            <rect x="145" y="191.5" width="30" height="4.5" rx="2" fill="#ffffff" />
                            <ellipse cx="160" cy="202.5" rx="11" ry="3.5" fill="#fb7185" />
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
                            <ellipse cx="160" cy="201" rx="22" ry="13.5" fill="#4c0519" />
                            <path
                              d="M142 191 L178 191 L176 197 L144 197 Z"
                              fill="#ffffff"
                            />
                            <ellipse cx="160" cy="208" rx="14" ry="6" fill="#f43f5e" />
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
                              : isListening
                                ? 'bg-rose-400 animate-pulse'
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
                        🗣️ Sophia ({sessionMode === 'roleplay' ? selectedRoleplayObj.roleDesc : 'Live Spoken Reply'}):
                      </div>
                      <p>
                        {latestTurn?.spokenTeacherReply ||
                          currentlySpokenText ||
                          'Hello! Speak naturally whenever my voice finishes!'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (latestTurn) {
                            speakWithAvatarLipSync(
                              latestTurn.spokenTeacherReply,
                              voiceSpeed,
                              true
                            );
                          }
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Replay Gemini Voice ({geminiVoice})</span>
                      </button>

                      {latestTurn?.correctedEnglishSentence && (
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.correctedEnglishSentence,
                              0.75,
                              false
                            )
                          }
                          className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span>🐢 Slow</span>
                        </button>
                      )}

                      {!callEnded ? (
                        <button
                          type="button"
                          onClick={endLiveCall}
                          className="py-2.5 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                          title="End Live Voice Call"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span>End Call</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={toggleMicrophoneOrHandsFree}
                          className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>Resume Call</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT 7 COLS: HANDS-FREE CALL STATUS + SPEAKING PROMPT + INPUT */}
                <div className="lg:col-span-7 min-w-0 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-7 flex flex-col justify-between space-y-5">
                  {/* Top Fluency & Grammar Score Meters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
                        {sessionMode === 'roleplay'
                          ? `🎭 Live Roleplay: ${selectedRoleplayObj.emoji} ${selectedRoleplayObj.title}`
                          : sessionMode === 'guided_lesson'
                            ? '🎓 Guided Step-by-Step English Speaking Drill'
                            : '👩‍🏫 Live English Teacher & Mistake Fixer'}
                      </span>
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                        {callEnded
                          ? '📞 Call Ended — Review Corrections Below'
                          : isListening
                            ? '🎙️ Listening Automatically — Speak in English Now!'
                            : isSpeaking
                              ? '🔊 Sophia is Speaking — Mic Will Auto-Open Next...'
                              : 'Speak Hands-Free or Type Below'}
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

                  {/* Current Live Speaking Prompt / Roleplay Prompt Card */}
                  {latestTurn?.nextTestPrompt && (
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-emerald-50/50 dark:from-slate-800 dark:via-indigo-950/50 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider">
                          {sessionMode === 'roleplay'
                            ? `🎭 Roleplay Turn #${turns.length}`
                            : `🎤 Live Speaking Prompt (${selectedLevelObj.badge})`}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            speakWithAvatarLipSync(
                              latestTurn.nextTestPrompt.targetEnglishToSpeak,
                              0.88,
                              false
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-xs font-black text-blue-700 dark:text-blue-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Hear Sample Reply</span>
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
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 space-y-1.5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          🗣️ Speak This Sample Answer (Or Reply in Your Own Words):
                        </div>
                        <p className="text-base sm:text-lg font-black text-blue-800 dark:text-blue-300">
                          &ldquo;{latestTurn.nextTestPrompt.targetEnglishToSpeak}&rdquo;
                        </p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 pt-1">
                          💬 Sophia Asked: &ldquo;{latestTurn.nextTestPrompt.questionForUser}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hands-Free Live Mic + End Call + Contained Text Input Bar */}
                  <div className="space-y-3 min-w-0 w-full">
                    {/* Row 1: Mic Toggle + Red End Call Button */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={toggleMicrophoneOrHandsFree}
                        disabled={loading}
                        className={`flex-1 min-w-[200px] px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          isListening
                            ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <Mic className="w-4 h-4 animate-bounce shrink-0" />
                            <span>🎙️ Live Mic ON (Tap to Send Now)</span>
                          </>
                        ) : (
                          <>
                            <PhoneCall className="w-4 h-4 shrink-0" />
                            <span>
                              {callEnded ? '📞 Start Call Again' : '🎙️ Resume Live Mic'}
                            </span>
                          </>
                        )}
                      </button>

                      {!callEnded && (
                        <button
                          type="button"
                          onClick={endLiveCall}
                          className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 transition-all"
                        >
                          <PhoneOff className="w-4 h-4" />
                          <span>End Call</span>
                        </button>
                      )}
                    </div>

                    {/* Row 2: Full-Width Contained Text Input + Send Button (Never Overflows Box!) */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendSentenceToLiveAgent();
                      }}
                      className="w-full min-w-0 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Speak on live call OR type your English sentence here..."
                        className="flex-1 min-w-0 w-full px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="submit"
                        disabled={loading || !userInput.trim()}
                        className="px-5 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Send</span>
                      </button>
                    </form>

                    {interimTranscript && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-400 dark:border-emerald-700 text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                        <span>🎙️ Hearing You Live: &ldquo;{interimTranscript}&rdquo;</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => sendSentenceToLiveAgent(interimTranscript)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black cursor-pointer"
                          >
                            Send Now ⚡
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                              setInterimTranscript('');
                              setUserInput('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-black cursor-pointer"
                          >
                            Clear ✕
                          </button>
                        </div>
                      </div>
                    )}

                    {micError && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs font-bold text-rose-700 dark:text-rose-300">
                        {micError}
                      </div>
                    )}
                  </div>

                  {/* Quick One-Click Sample Sentences */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      ⚡ Or Click Any Sample Sentence Below to Test Sophia&apos;s Live Voice & Correction Cards:
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
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Detailed Sentence Correction & Bilingual Teaching Cards
                      </h2>
                    </div>
                    <span className="text-xs font-extrabold text-slate-500">
                      Explained in {selectedLangObj.flag} {selectedLangObj.nativeName} ({selectedLangObj.name})
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
                              1.0,
                              false
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
                              0.75,
                              false
                            )
                          }
                          className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black cursor-pointer"
                        >
                          🐢 Slow (0.75x)
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
                              0.95,
                              false
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

                  {/* CARD ROW 2: DETAILED NATIVE LANGUAGE EXPLANATION */}
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

                    <div
                      dir={isRtlLang ? 'rtl' : 'ltr'}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-loose">
                        {latestTurn.nativeLanguageGreetingOrFeedback}
                      </p>
                      <p className="text-sm sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-400 pt-1">
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
                                    0.92,
                                    false
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
                          onClick={() =>
                            startLiveAgentSession(
                              nativeLanguage,
                              learnerLevel,
                              sessionMode,
                              roleplayScenario
                            )
                          }
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
                                  speakWithAvatarLipSync(
                                    t.correctedEnglishSentence,
                                    0.95,
                                    false
                                  )
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
