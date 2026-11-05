'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Flame,
  Award,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react';
import { playSuccessSound, playErrorSound, playFanfareSound } from '@/lib/audio-feedback';

export default function DuolingoLessonRunnerPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Duolingo Session Stats
  const [hearts, setHearts] = useState(5);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(15);
  const [quitModalOpen, setQuitModalOpen] = useState(false);

  // Current Exercise State
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // REORDER / LISTEN_SELECT word bank state
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // MATCH_PAIRS state
  const [selectedCard, setSelectedCard] = useState<{ id: string; side: 'left' | 'right'; text: string } | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [mismatchPair, setMismatchPair] = useState<boolean>(false);

  // FILL_BLANK state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // SPEAK_PRACTICE state
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/lessons/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lesson) {
          setLesson(data.lesson);
          const rawExercises = data.lesson.exercises || [];

          // If lesson has fewer than 3 exercises, supplement with standard Duolingo exercises derived from lesson vocabulary
          let finalExercises = [...rawExercises];
          if (finalExercises.length < 3 && data.lesson.vocabulary?.length > 0) {
            const v = data.lesson.vocabulary;
            // Add match pairs
            finalExercises.push({
              id: 'synth-match-1',
              type: 'MATCH_PAIRS',
              prompt: 'Tap the matching pairs',
              options: v.slice(0, 4).map((w: any) => ({
                left: w.word,
                right: w.translation || w.definition.slice(0, 30)
              })),
              correctAnswer: 'ALL_MATCHED',
              explanation: 'Match the English terms with their definitions.'
            });

            // Add word bank builder
            if (v[0]?.exampleSentence) {
              const sentence = v[0].exampleSentence.replace(/[.!?]/g, '');
              const words = sentence.split(/\s+/);
              finalExercises.push({
                id: 'synth-reorder-1',
                type: 'REORDER',
                prompt: `Translate: "${v[0].translation || v[0].definition}"`,
                options: [...words, 'is', 'not', 'have'].sort(() => Math.random() - 0.5),
                correctAnswer: sentence,
                explanation: `Correct English sentence: "${sentence}".`
              });
            }
          }

          setExercises(finalExercises);
          initExerciseState(finalExercises[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const initExerciseState = (ex: any) => {
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setSelectedWords([]);
    setSelectedOption(null);
    setSelectedCard(null);
    setMatchedPairs(new Set());
    setMismatchPair(false);
    setSpokenText('');

    if (!ex) return;

    if (ex.type === 'REORDER' || ex.type === 'LISTEN_SELECT') {
      const opts = Array.isArray(ex.options) ? ex.options : [];
      // Shuffle available words
      setAvailableWords([...opts].sort(() => Math.random() - 0.5));
    }
  };

  // TTS audio player helper
  const playAudio = (text: string, rate: number = 1.0) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  // REORDER word chip clicks
  const handleSelectWord = (word: string, index: number) => {
    if (isAnswerChecked) return;
    setSelectedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeselectWord = (word: string, index: number) => {
    if (isAnswerChecked) return;
    setAvailableWords((prev) => [...prev, word]);
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };

  // MATCH_PAIRS clicks
  const handleCardClick = (id: string, side: 'left' | 'right', text: string, pairId: string) => {
    if (isAnswerChecked || matchedPairs.has(pairId)) return;

    if (!selectedCard) {
      setSelectedCard({ id: pairId, side, text });
      return;
    }

    // Clicked same side again -> switch selection
    if (selectedCard.side === side) {
      setSelectedCard({ id: pairId, side, text });
      return;
    }

    // Clicked opposite side -> check match
    if (selectedCard.id === pairId) {
      // Correct match!
      playSuccessSound();
      const updated = new Set(matchedPairs);
      updated.add(pairId);
      setMatchedPairs(updated);
      setSelectedCard(null);

      // Check if all matched
      const currentEx = exercises[currentIndex];
      const totalPairs = (currentEx.options || []).length;
      if (updated.size === totalPairs) {
        setIsCorrect(true);
        setIsAnswerChecked(true);
      }
    } else {
      // Mismatch
      playErrorSound();
      setMismatchPair(true);
      setTimeout(() => {
        setMismatchPair(false);
        setSelectedCard(null);
      }, 700);
    }
  };

  // SPEAK_PRACTICE microphone toggle
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setIsListening(false);

      // Automatic check against correct answer
      const currentEx = exercises[currentIndex];
      const target = (currentEx.correctAnswer || '').toLowerCase().trim();
      const spoken = transcript.toLowerCase().trim();

      const isMatch = spoken.includes(target) || target.includes(spoken);
      setIsCorrect(isMatch);
      setIsAnswerChecked(true);

      if (isMatch) {
        playSuccessSound();
      } else {
        playErrorSound();
        handleLossOfHeart();
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleLossOfHeart = () => {
    setMistakesCount((prev) => prev + 1);
    setHearts((prev) => Math.max(0, prev - 1));
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    const currentEx = exercises[currentIndex];
    if (!currentEx) return;

    let correct = false;

    if (currentEx.type === 'REORDER' || currentEx.type === 'LISTEN_SELECT') {
      const assembledSentence = selectedWords.join(' ').trim().toLowerCase();
      const expected = (currentEx.correctAnswer || '').trim().toLowerCase();
      // Relax punctuation check
      const normalize = (str: string) => str.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').replace(/\s+/g, ' ');
      correct = normalize(assembledSentence) === normalize(expected);
    } else if (currentEx.type === 'FILL_BLANK' || currentEx.type === 'MULTIPLE_CHOICE') {
      correct = selectedOption?.trim().toLowerCase() === currentEx.correctAnswer?.trim().toLowerCase();
    } else if (currentEx.type === 'MATCH_PAIRS') {
      correct = true; // handled in click
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      playSuccessSound();
    } else {
      playErrorSound();
      handleLossOfHeart();
    }
  };

  // Continue to next question or complete
  const handleContinue = async () => {
    if (currentIndex < exercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      initExerciseState(exercises[nextIdx]);
    } else {
      // Completed all exercises!
      try {
        const res = await fetch(`/api/lessons/${slug}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: Math.round(((exercises.length - mistakesCount) / exercises.length) * 100) }),
        });
        const data = await res.json();
        setXpEarned(data.xpEarned || 15);
      } catch (err) {
        console.error(err);
      }

      setIsFinished(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      playFanfareSound();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Preparing Duolingo exercise...</p>
        </div>
      </div>
    );
  }

  const currentEx = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex) / (exercises.length || 1)) * 100);

  // Check button disabled condition
  const isCheckDisabled = () => {
    if (isAnswerChecked) return false;
    if (!currentEx) return true;
    if (currentEx.type === 'REORDER' || currentEx.type === 'LISTEN_SELECT') {
      return selectedWords.length === 0;
    }
    if (currentEx.type === 'FILL_BLANK' || currentEx.type === 'MULTIPLE_CHOICE') {
      return !selectedOption;
    }
    if (currentEx.type === 'MATCH_PAIRS') {
      return matchedPairs.size < (currentEx.options || []).length;
    }
    if (currentEx.type === 'SPEAK_PRACTICE') {
      return !spokenText;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      {/* TOP HEADER: CLOSE BUTTON, PROGRESS BAR, HEARTS */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-5 flex items-center gap-4 sm:gap-6">
        {/* Quit button */}
        <button
          type="button"
          onClick={() => setQuitModalOpen(true)}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
          title="Exit lesson"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Smooth animated progress bar */}
        <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts counter */}
        <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-sm" title="Lives remaining">
          <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
          <span>{hearts}</span>
        </div>
      </header>

      {/* MAIN EXERCISE BODY */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center pb-32">
        {!isFinished && currentEx && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* PROMPT TITLE */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {currentEx.prompt}
              </h2>

              {/* Speaker Audio button if available */}
              {(currentEx.audioPrompt || currentEx.correctAnswer) && currentEx.type !== 'LISTEN_SELECT' && (
                <button
                  type="button"
                  onClick={() => playAudio(currentEx.audioPrompt || currentEx.correctAnswer)}
                  className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-300 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 text-xs font-bold transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-blue-800" />
                  <span>Listen to English phrase</span>
                </button>
              )}
            </div>

            {/* EXERCISE TYPE 1: SENTENCE BUILDER (REORDER) */}
            {currentEx.type === 'REORDER' && (
              <div className="space-y-6">
                {/* Assembled sentence tray */}
                <div className="min-h-16 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-wrap gap-2 items-center">
                  {selectedWords.length === 0 ? (
                    <span className="text-xs text-slate-400 pl-2">Tap words from below to construct your answer...</span>
                  ) : (
                    selectedWords.map((word, idx) => (
                      <button
                        key={`${word}-${idx}`}
                        type="button"
                        onClick={() => handleDeselectWord(word, idx)}
                        disabled={isAnswerChecked}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl font-bold text-sm shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#334155] active:translate-y-0.5 transition-all text-slate-900 dark:text-white"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Available word bank */}
                <div className="flex flex-wrap gap-2.5 pt-2 justify-center">
                  {availableWords.map((word, idx) => (
                    <button
                      key={`${word}-${idx}`}
                      type="button"
                      onClick={() => handleSelectWord(word, idx)}
                      disabled={isAnswerChecked}
                      className="px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 active:translate-y-1 transition-all text-slate-900 dark:text-white"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EXERCISE TYPE 2: LISTEN & SELECT */}
            {currentEx.type === 'LISTEN_SELECT' && (
              <div className="space-y-6">
                {/* Audio controls (Normal & Turtle speed) */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => playAudio(currentEx.audioPrompt || currentEx.correctAnswer, 1.0)}
                    className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-[0_4px_0_0_#1e3a8a] active:translate-y-1 transition-all"
                    title="Normal Speed"
                  >
                    <Volume2 className="w-7 h-7 text-blue-200" />
                  </button>

                  <button
                    type="button"
                    onClick={() => playAudio(currentEx.audioPrompt || currentEx.correctAnswer, 0.65)}
                    className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs active:translate-y-1 transition-all"
                    title="Slow Speed (Turtle)"
                  >
                    <span className="text-xl">🐢</span>
                  </button>
                  <span className="text-xs text-slate-500 font-semibold">Tap to listen</span>
                </div>

                {/* Assembled sentence tray */}
                <div className="min-h-16 p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-wrap gap-2 items-center">
                  {selectedWords.length === 0 ? (
                    <span className="text-xs text-slate-400 pl-2">Tap words you heard...</span>
                  ) : (
                    selectedWords.map((word, idx) => (
                      <button
                        key={`${word}-${idx}`}
                        type="button"
                        onClick={() => handleDeselectWord(word, idx)}
                        disabled={isAnswerChecked}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl font-bold text-sm shadow-[0_3px_0_0_#cbd5e1] dark:shadow-[0_3px_0_0_#334155] active:translate-y-0.5 transition-all text-slate-900 dark:text-white"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Available word bank */}
                <div className="flex flex-wrap gap-2.5 pt-2 justify-center">
                  {availableWords.map((word, idx) => (
                    <button
                      key={`${word}-${idx}`}
                      type="button"
                      onClick={() => handleSelectWord(word, idx)}
                      disabled={isAnswerChecked}
                      className="px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] hover:bg-slate-50 dark:hover:bg-slate-800 active:translate-y-1 transition-all text-slate-900 dark:text-white"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EXERCISE TYPE 3: MATCH THE PAIRS */}
            {currentEx.type === 'MATCH_PAIRS' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-semibold">Tap two cards that mean the same thing:</p>

                <div className="grid grid-cols-2 gap-3">
                  {(currentEx.options || []).map((pair: any, pIdx: number) => {
                    const isMatched = matchedPairs.has(`pair-${pIdx}`);

                    return (
                      <React.Fragment key={pIdx}>
                        {/* Left Card */}
                        <button
                          type="button"
                          disabled={isMatched}
                          onClick={() => handleCardClick(`pair-${pIdx}-left`, 'left', pair.left, `pair-${pIdx}`)}
                          className={`p-4 rounded-xl border-2 font-bold text-sm transition-all duration-150 text-left ${
                            isMatched
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-60'
                              : selectedCard?.text === pair.left
                              ? 'border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-900 text-blue-950 dark:text-white shadow-sm'
                              : mismatchPair && selectedCard?.text === pair.left
                              ? 'border-rose-500 bg-rose-50 text-rose-700 animate-shake'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]'
                          }`}
                        >
                          {pair.left}
                        </button>

                        {/* Right Card */}
                        <button
                          type="button"
                          disabled={isMatched}
                          onClick={() => handleCardClick(`pair-${pIdx}-right`, 'right', pair.right, `pair-${pIdx}`)}
                          className={`p-4 rounded-xl border-2 font-bold text-sm transition-all duration-150 text-left ${
                            isMatched
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-60'
                              : selectedCard?.text === pair.right
                              ? 'border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-900 text-blue-950 dark:text-white shadow-sm'
                              : mismatchPair && selectedCard?.text === pair.right
                              ? 'border-rose-500 bg-rose-50 text-rose-700 animate-shake'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]'
                          }`}
                        >
                          {pair.right}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXERCISE TYPE 4: FILL IN THE BLANK / MULTIPLE CHOICE */}
            {(currentEx.type === 'FILL_BLANK' || currentEx.type === 'MULTIPLE_CHOICE') && (
              <div className="space-y-3">
                {(currentEx.options || []).map((opt: string, idx: number) => {
                  const isSelected = selectedOption === opt;
                  const letter = String.fromCharCode(65 + idx);

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-900 font-bold text-blue-950 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-[0_3px_0_0_#e2e8f0] dark:shadow-[0_3px_0_0_#1e293b]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-sm font-semibold">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* EXERCISE TYPE 5: SPEAK PRACTICE */}
            {currentEx.type === 'SPEAK_PRACTICE' && (
              <div className="text-center space-y-6 py-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs uppercase font-extrabold text-slate-400">Target phrase</span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    "{currentEx.correctAnswer || currentEx.options?.[0]}"
                  </h3>
                  <button
                    type="button"
                    onClick={() => playAudio(currentEx.correctAnswer || currentEx.options?.[0])}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-900 dark:text-blue-400 font-bold hover:underline pt-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Play Reference Audio</span>
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200 dark:ring-rose-950'
                        : 'bg-blue-900 hover:bg-blue-800 text-white'
                    }`}
                  >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                  <p className="text-xs font-semibold text-slate-500">
                    {isListening ? 'Listening... Speak now!' : 'Tap the microphone to speak'}
                  </p>
                  {spokenText && (
                    <p className="text-xs bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                      Heard: <strong>"{spokenText}"</strong>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LESSON FINISHED CELEBRATION SCREEN */}
        {isFinished && (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-200 py-6">
            <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-14 h-14" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                Lesson Complete!
              </h2>
              <p className="text-sm text-slate-500">
                You've mastered this stepping stone in the curriculum.
              </p>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">Total XP</span>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400">+{xpEarned}</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {Math.round(((exercises.length - mistakesCount) / (exercises.length || 1)) * 100)}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">Streak</span>
                <span className="text-2xl font-black text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 fill-rose-500 text-rose-500" />
                  <span>10d</span>
                </span>
              </div>
            </div>

            <div className="pt-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => router.push('/learn')}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>CONTINUE ON PATH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM DUOLINGO ACTION SHEET / DRAWER */}
      {!isFinished && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-all duration-200 ${
            !isAnswerChecked
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-5 px-4 sm:px-8'
              : isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-900 py-6 px-4 sm:px-8 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-900 py-6 px-4 sm:px-8 text-rose-900 dark:text-rose-100'
          }`}
        >
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {!isAnswerChecked ? (
              <div className="hidden sm:block text-xs font-semibold text-slate-400">
                Tap or arrange your answer above to verify.
              </div>
            ) : isCorrect ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 fill-white text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-black text-base">Nicely done!</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Your solution is accurate.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-6 h-6 fill-white text-rose-600" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-black text-base text-rose-700 dark:text-rose-300">Correct solution:</h4>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentEx?.correctAnswer}
                  </p>
                  {currentEx?.explanation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      {currentEx.explanation}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ACTION BUTTON */}
            {!isAnswerChecked ? (
              <button
                type="button"
                disabled={isCheckDisabled()}
                onClick={handleCheckAnswer}
                className="w-full sm:w-auto min-w-[140px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 px-8 rounded-xl shadow-[0_4px_0_0_#047857] disabled:opacity-40 disabled:pointer-events-none active:translate-y-1 transition-all"
              >
                CHECK
              </button>
            ) : isCorrect ? (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full sm:w-auto min-w-[140px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 px-8 rounded-xl shadow-[0_4px_0_0_#047857] active:translate-y-1 transition-all"
              >
                CONTINUE
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full sm:w-auto min-w-[140px] bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm py-3.5 px-8 rounded-xl shadow-[0_4px_0_0_#be123c] active:translate-y-1 transition-all"
              >
                GOT IT
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUIT SESSION CONFIRMATION MODAL */}
      {quitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Wait, don't leave!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you exit now, your progress on this lesson will not be saved and you will lose your streak multiplier.
            </p>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setQuitModalOpen(false)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm"
              >
                KEEP PRACTICING
              </button>
              <button
                type="button"
                onClick={() => router.push('/learn')}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-600 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
