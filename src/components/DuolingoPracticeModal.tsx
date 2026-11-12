'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  X,
  Heart,
  Trophy,
  BookOpen,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DuolingoGeneratedLesson,
  DuolingoChallenge,
} from '@/lib/duolingo-curriculum';
import { getBaseLanguageInfo } from '@/lib/duolingo-languages';
import {
  playCorrectSound,
  playWrongSound,
  playFanfareSound,
} from '@/lib/audio-feedback';
import {
  speakRealisticText,
  stopSpeaking,
  evaluateSpokenAccuracy,
  SpokenEvaluationResult,
} from '@/lib/voice-engine';

interface Props {
  lesson: DuolingoGeneratedLesson;
  onClose: () => void;
  onComplete: (slug: string, xpEarned: number) => void;
}

export default function DuolingoPracticeModal({
  lesson,
  onClose,
  onComplete,
}: Props) {
  const langInfo = getBaseLanguageInfo(lesson.baseLang);
  const challenges = lesson.challenges || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [selectedChoiceIndices, setSelectedChoiceIndices] = useState<number[]>([]);
  const [textInput, setTextInput] = useState('');
  const [activeTokenHintIndex, setActiveTokenHintIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [expectedAnswerDisplay, setExpectedAnswerDisplay] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [speechEval, setSpeechEval] = useState<SpokenEvaluationResult | null>(null);
  const [completedSession, setCompletedSession] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Study material drawer toggle inside Practice Modal + Safe Exit confirmation
  const [showStudyDrawer, setShowStudyDrawer] = useState(false);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  const recRef = useRef<any>(null);
  const recStartRef = useRef<number>(Date.now());

  const currentChallenge: DuolingoChallenge | undefined = challenges[currentIdx];

  const getNormalizedChoices = (ch: DuolingoChallenge): string[] => {
    if (ch.choices && ch.choices.length > 0) {
      return ch.choices.map((c) => (typeof c === 'string' ? c : c.text));
    }
    const tokenWords = (ch.tokens || [])
      .map((t) => (t.value || '').trim())
      .filter((w) => w && !/^[^\w]+$/.test(w));

    if (ch.type === 'name' && ch.correctSolutions?.[0]) {
      const target = ch.correctSolutions[0];
      const distractors = lesson.vocabularyWords
        .map((v) => v.word)
        .filter((w) => w.toLowerCase() !== target.toLowerCase())
        .slice(0, 3);
      return [target, ...distractors];
    }

    if (tokenWords.length > 0) {
      const distractors = lesson.vocabularyWords
        .map((v) => v.word)
        .filter((w) => !tokenWords.includes(w))
        .slice(0, 3);
      return [...tokenWords, ...distractors];
    }

    return [];
  };

  const [displayChoices, setDisplayChoices] = useState<string[]>([]);

  useEffect(() => {
    if (!currentChallenge) return;
    setSelectedChoiceIndices([]);
    setTextInput('');
    setActiveTokenHintIndex(null);
    setStatus('idle');
    setExpectedAnswerDisplay('');
    setSpokenTranscript('');
    setSpeechEval(null);
    setIsRecording(false);

    const rawChoices = getNormalizedChoices(currentChallenge);
    setDisplayChoices(rawChoices);

    const englishTextToSpeak =
      currentChallenge.sourceLanguage === 'en' || currentChallenge.type !== 'translate'
        ? currentChallenge.prompt ||
          (currentChallenge.tokens || []).map((t) => t.value).join('')
        : '';

    if (englishTextToSpeak || currentChallenge.tts) {
      speakRealisticText(englishTextToSpeak || currentChallenge.prompt || '', {
        rate: 0.95,
        audioUrl: currentChallenge.tts,
        preferBrowserTTS: true,
      });
    }

    return () => {
      stopSpeaking();
    };
  }, [currentIdx, currentChallenge]);

  const playAudio = (url?: string, rate: number = 0.95, fallbackText?: string) => {
    const textToUse =
      fallbackText ||
      currentChallenge?.prompt ||
      (currentChallenge?.tokens || []).map((t) => t.value).join('');

    speakRealisticText(textToUse, {
      rate,
      audioUrl: url,
      preferBrowserTTS: true,
    });
  };

  const handleToggleChoice = (idx: number) => {
    if (status !== 'idle') return;
    const wordText = displayChoices[idx];
    if (wordText && /^[A-Za-z]/.test(wordText)) {
      speakRealisticText(wordText, { rate: 0.95, preferBrowserTTS: true });
    }
    if (selectedChoiceIndices.includes(idx)) {
      setSelectedChoiceIndices(selectedChoiceIndices.filter((i) => i !== idx));
    } else {
      setSelectedChoiceIndices([...selectedChoiceIndices, idx]);
    }
  };

  const getExpectedSolutionText = (ch: DuolingoChallenge): string => {
    if (ch.correctSolutions && ch.correctSolutions.length > 0) {
      return ch.correctSolutions[0];
    }
    if (ch.correctIndices && ch.choices && ch.choices.length > 0) {
      return ch.correctIndices
        .map((i) => {
          const item = ch.choices![i];
          return typeof item === 'string' ? item : item?.text || '';
        })
        .join(' ');
    }
    if (ch.prompt) return ch.prompt;
    if (ch.tokens) {
      return ch.tokens.map((t) => t.value).join('');
    }
    return '';
  };

  const normalizeForCompare = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,!?।؟"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const handleCheckAnswer = () => {
    if (!currentChallenge) return;

    const expected = getExpectedSolutionText(currentChallenge);
    setExpectedAnswerDisplay(expected);

    if (currentChallenge.type === 'speak') {
      const targetSentence =
        currentChallenge.prompt ||
        (currentChallenge.tokens || []).map((t) => t.value).join('') ||
        expected;
      const evalResult =
        speechEval ||
        evaluateSpokenAccuracy(
          targetSentence,
          spokenTranscript || targetSentence,
          2.5
        );
      setSpeechEval(evalResult);
      if (evalResult.overallScore >= 50) {
        playCorrectSound();
        setStatus('correct');
        setCorrectCount((c) => c + 1);
      } else {
        playWrongSound();
        setStatus('wrong');
      }
      return;
    }

    if (currentChallenge.type === 'name' && textInput.trim()) {
      const userClean = normalizeForCompare(textInput);
      const solutions = (currentChallenge.correctSolutions || [expected]).map(
        normalizeForCompare
      );
      if (solutions.includes(userClean)) {
        playCorrectSound();
        setStatus('correct');
        setCorrectCount((c) => c + 1);
      } else {
        playWrongSound();
        setStatus('wrong');
        setHearts((h) => Math.max(1, h - 1));
      }
      return;
    }

    const userBuilt = selectedChoiceIndices
      .map((i) => displayChoices[i])
      .join(' ');
    const userClean = normalizeForCompare(userBuilt);

    let isMatch = false;
    if (
      currentChallenge.correctIndices &&
      currentChallenge.choices &&
      currentChallenge.choices.length > 0
    ) {
      const exactIndicesMatch =
        selectedChoiceIndices.length === currentChallenge.correctIndices.length &&
        selectedChoiceIndices.every(
          (val, idx) => val === currentChallenge.correctIndices![idx]
        );
      if (exactIndicesMatch) isMatch = true;
    }

    const acceptedSolutions = [
      ...(currentChallenge.correctSolutions || []),
      expected,
    ]
      .filter(Boolean)
      .map(normalizeForCompare);

    if (isMatch || (userClean && acceptedSolutions.includes(userClean))) {
      playCorrectSound();
      setStatus('correct');
      setCorrectCount((c) => c + 1);
    } else {
      playWrongSound();
      setStatus('wrong');
      setHearts((h) => Math.max(1, h - 1));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < challenges.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCompletedSession(true);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      playFanfareSound();
      onComplete(lesson.slug, lesson.xpReward || 20);
    }
  };

  const gradeSpokenInput = (transcriptText: string) => {
    if (!currentChallenge) return;
    const targetSentence =
      currentChallenge.prompt ||
      (currentChallenge.tokens || []).map((t) => t.value).join('') ||
      getExpectedSolutionText(currentChallenge);
    const dur = Math.max(1.2, (Date.now() - recStartRef.current) / 1000);
    const result = evaluateSpokenAccuracy(targetSentence, transcriptText, dur);
    setSpokenTranscript(transcriptText);
    setSpeechEval(result);
    setExpectedAnswerDisplay(targetSentence);

    if (result.overallScore >= 55) {
      playCorrectSound();
      setStatus('correct');
      setCorrectCount((c) => c + 1);
    } else {
      playWrongSound();
      setStatus('wrong');
    }
  };

  const handleStartSpeechRecognition = () => {
    if (typeof window === 'undefined' || !currentChallenge) return;

    if (isRecording && recRef.current) {
      try {
        recRef.current.stop();
      } catch {}
      setIsRecording(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const targetSentence =
      currentChallenge.prompt ||
      (currentChallenge.tokens || []).map((t) => t.value).join('') ||
      getExpectedSolutionText(currentChallenge);

    if (!SpeechRec) {
      gradeSpokenInput(targetSentence);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      recRef.current = rec;
      recStartRef.current = Date.now();
      setIsRecording(true);
      let latestHeard = '';

      rec.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finalStr += r[0].transcript + ' ';
          else interim += r[0].transcript;
        }
        const combined = (finalStr + interim).trim();
        if (combined) {
          latestHeard = combined;
          setSpokenTranscript(combined);
        }
        if (finalStr.trim()) {
          setIsRecording(false);
          gradeSpokenInput(finalStr.trim());
        }
      };

      rec.onerror = () => {
        setIsRecording(false);
        if (latestHeard) {
          gradeSpokenInput(latestHeard);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
        if (latestHeard && !speechEval) {
          gradeSpokenInput(latestHeard);
        }
      };

      rec.start();
    } catch {
      setIsRecording(false);
    }
  };

  if (completedSession) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="card-3d max-w-md w-full p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto shadow-[0_6px_0_0_#b45309]">
            <Trophy className="w-11 h-11 fill-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {langInfo.flag} Lesson Complete!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              You completed all {challenges.length} interactive {langInfo.name} → English exercises!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-200 dark:border-amber-800">
              <div className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                Total XP Earned
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                +{lesson.xpReward || 20} XP
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-200 dark:border-emerald-800">
              <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                Accuracy Score
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {Math.round((correctCount / Math.max(1, challenges.length)) * 100)}%
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl btn-3d-emerald font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Back to Learning Path
            </button>
            <Link
              href="/dashboard"
              className="px-5 py-3.5 rounded-2xl btn-3d-secondary font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentChallenge) return null;

  const progressPercent = Math.round(((currentIdx + 1) / challenges.length) * 100);
  const promptText =
    currentChallenge.prompt ||
    (currentChallenge.tokens || []).map((t) => t.value).join('');

  const isNativeToEn =
    currentChallenge.type === 'translate' &&
    currentChallenge.targetLanguage === 'en';

  const getInstructionHeader = () => {
    switch (currentChallenge.type) {
      case 'translate':
        return isNativeToEn
          ? `Translate into English (${langInfo.nativeName} → English)`
          : `Translate into ${langInfo.name} (English → ${langInfo.nativeName})`;
      case 'listenTap':
        return 'Tap what you hear in English';
      case 'listen':
      case 'listenIsolation':
        return 'Listen carefully and select the words you hear';
      case 'speak':
        return 'Speak this sentence out loud in English';
      case 'name':
        return `Name this in English (${langInfo.nativeName} → English)`;
      default:
        return 'Complete the challenge';
    }
  };

  const canCheck =
    currentChallenge.type === 'speak' ||
    selectedChoiceIndices.length > 0 ||
    textInput.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="card-3d w-full max-w-2xl flex flex-col max-h-[95vh] overflow-hidden border-2 border-slate-200 dark:border-slate-700">
        {/* Top Progress Bar, Study Sheet Button & Safe Exit */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setConfirmExitOpen(!confirmExitOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Pause or Exit Practice"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Pause</span>
          </button>

          <div className="flex-1 h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowStudyDrawer(!showStudyDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 border ${
              showStudyDrawer
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Material</span>
          </button>

          <div className="flex items-center gap-1 text-rose-500 font-black text-sm shrink-0">
            <Heart className="w-5 h-5 fill-rose-500" />
            <span>{hearts}</span>
          </div>
        </div>

        {/* Safe Exit / Pause Bar (prevents accidental click sending user away) */}
        {confirmExitOpen && (
          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-extrabold text-amber-900 dark:text-amber-200">
              Where would you like to go?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmExitOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-black cursor-pointer"
              >
                Resume Test
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Learning Path
              </button>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* Expandable Study Material Drawer inside Practice */}
        {showStudyDrawer && (
          <div className="p-4 sm:p-5 bg-blue-50/70 dark:bg-slate-800/90 border-b-2 border-blue-200 dark:border-slate-700 max-h-64 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                📖 Lesson Learning Material ({langInfo.nativeName} → English)
              </h4>
              <button
                type="button"
                onClick={() => setShowStudyDrawer(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Hide ▲
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(lesson.vocabularyWords || []).map((v, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                      {v.word}
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {v.allHints?.join(' • ') || v.translation}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => playAudio(v.tts, 0.9, v.word)}
                    className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Exercise Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
          {/* Exercise Type Badge & Header */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span>{langInfo.flag}</span>
                <span>
                  Exercise {currentIdx + 1} of {challenges.length}
                </span>
              </span>
              <span className="text-xs font-bold text-slate-400">
                {lesson.title}
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {getInstructionHeader()}
            </h3>
          </div>

          {/* Character + Audio + Interactive Prompt Box */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-5">
            {currentChallenge.character_url && (
              <img
                src={currentChallenge.character_url}
                alt="Character"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0"
              />
            )}

            <div className="flex-1 space-y-3 w-full">
              {/* Normal & Slow Turtle Audio Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    playAudio(currentChallenge.tts, 0.95, promptText)
                  }
                  className="btn-3d-primary px-4 py-2.5 rounded-2xl inline-flex items-center gap-2 text-xs font-black cursor-pointer"
                  title="Listen at normal speed"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Listen</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    playAudio(currentChallenge.tts, 0.65, promptText)
                  }
                  className="btn-3d-secondary px-3.5 py-2.5 rounded-2xl inline-flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
                  title="Play slow audio (0.65x)"
                >
                  <span className="text-base">🐢</span>
                  <span>Slow (0.65x)</span>
                </button>
              </div>

              {/* Prompt with Interactive Word Hints */}
              {currentChallenge.type !== 'listenTap' || status !== 'idle' ? (
                <div className="pt-1">
                  {currentChallenge.tokens && currentChallenge.tokens.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {currentChallenge.tokens.map((tok, tIdx) => {
                        const val = tok.value || '';
                        if (!val.trim()) return <span key={tIdx}> </span>;
                        const hints: string[] = [];
                        for (const r of tok.hintTable?.rows || []) {
                          for (const c of r) {
                            if (c?.hint && !hints.includes(c.hint)) {
                              hints.push(c.hint);
                            }
                          }
                        }
                        const hasHints = hints.length > 0;
                        const isOpen = activeTokenHintIndex === tIdx;

                        return (
                          <div key={tIdx} className="relative inline-block">
                            <button
                              type="button"
                              onClick={() => {
                                if (tok.tts || /^[A-Za-z]/.test(val)) {
                                  playAudio(tok.tts, 0.9, val);
                                }
                                setActiveTokenHintIndex(isOpen ? null : tIdx);
                              }}
                              className={`px-1 py-0.5 rounded-lg transition-colors cursor-pointer ${
                                hasHints
                                  ? 'border-b-2 border-dotted border-blue-500 hover:bg-blue-100/60 dark:hover:bg-blue-950/60'
                                  : ''
                              }`}
                            >
                              {val}
                            </button>

                            {isOpen && hasHints && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 min-w-[120px] p-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 text-center">
                                <div className="text-amber-300 font-black mb-0.5">
                                  {val}
                                </div>
                                {hints.slice(0, 3).map((h, hIdx) => (
                                  <div
                                    key={hIdx}
                                    className="py-0.5 border-t border-slate-800 first:border-0"
                                  >
                                    {h}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {promptText}
                    </p>
                  )}
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">
                    💡 Tap any underlined word to hear its pronunciation & see its {langInfo.name} meaning!
                  </p>
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  🔊 Listen to the audio above and tap the words you hear in order!
                </p>
              )}
            </div>
          </div>

          {/* EXERCISE TYPE: SPEAK */}
          {currentChallenge.type === 'speak' ? (
            <div className="space-y-4 text-center py-3">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartSpeechRecognition}
                  className={`px-8 py-4 rounded-3xl font-black text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-[0_6px_0_0_#881337]'
                      : 'btn-3d-primary'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-6 h-6 animate-bounce" />
                      <span>Listening... Speak Now (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6" />
                      <span>Tap to Speak in English</span>
                    </>
                  )}
                </button>

                {status === 'idle' && (
                  <button
                    type="button"
                    onClick={() => gradeSpokenInput(promptText)}
                    className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-extrabold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Mark Spoken Aloud
                  </button>
                )}
              </div>

              {spokenTranscript && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      🎙️ You said: &ldquo;{spokenTranscript}&rdquo;
                    </span>
                    {speechEval && (
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          speechEval.overallScore >= 75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        Score: {speechEval.overallScore}%
                      </span>
                    )}
                  </div>

                  {speechEval && (
                    <div className="flex flex-wrap gap-1.5">
                      {speechEval.wordBreakdown.map((wb, i) => (
                        <span
                          key={i}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                            wb.status === 'correct'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : wb.status === 'close'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {wb.word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* EXERCISE TYPES: TRANSLATE / LISTENTAP / LISTEN / NAME */
            <div className="space-y-5">
              {/* Selected Answer Strip */}
              <div className="min-h-[68px] p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap items-center gap-2">
                {selectedChoiceIndices.length === 0 ? (
                  <span className="text-xs font-bold text-slate-400 px-2">
                    Tap the word tiles below in order to build your answer...
                  </span>
                ) : (
                  selectedChoiceIndices.map((choiceIdx) => (
                    <button
                      key={`sel-${choiceIdx}`}
                      type="button"
                      onClick={() => handleToggleChoice(choiceIdx)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-[0_3px_0_0_#1e3a8a] hover:-translate-y-0.5 transition-all cursor-pointer"
                    >
                      {displayChoices[choiceIdx]}
                    </button>
                  ))
                )}
              </div>

              {/* Available Word Bank Tiles */}
              {displayChoices.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  {displayChoices.map((choiceText, idx) => {
                    const isUsed = selectedChoiceIndices.includes(idx);
                    return (
                      <button
                        key={`bank-${idx}`}
                        type="button"
                        disabled={isUsed || status !== 'idle'}
                        onClick={() => handleToggleChoice(idx)}
                        className={`px-4 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                          isUsed
                            ? 'bg-slate-200 dark:bg-slate-800 text-transparent border-2 border-slate-200 dark:border-slate-800 select-none cursor-default'
                            : 'btn-3d-secondary cursor-pointer'
                        }`}
                      >
                        {choiceText}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer in English..."
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-bold text-base focus:outline-none focus:border-blue-500"
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom Check / Feedback Banner */}
        <div
          className={`p-5 border-t-2 transition-colors ${
            status === 'correct'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800'
              : status === 'wrong'
              ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          {status === 'idle' ? (
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedChoiceIndices([]);
                  setTextInput('');
                }}
                className="px-4 py-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                disabled={!canCheck}
                onClick={handleCheckAnswer}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all ${
                  canCheck
                    ? 'btn-3d-emerald cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {status === 'correct' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4
                    className={`font-black text-base ${
                      status === 'correct'
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {status === 'correct'
                      ? 'Excellent! Spot on!'
                      : 'Correct solution:'}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                    {expectedAnswerDisplay}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className={`px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                  status === 'correct' ? 'btn-3d-emerald' : 'btn-3d-primary'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
