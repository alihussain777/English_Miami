'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Zap,
  Flame,
  Trophy,
  Heart,
  Volume2,
  Sparkles,
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Timer,
  Headphones,
  Puzzle,
  Target,
  Award,
} from 'lucide-react';
import {
  playSuccessSound,
  playErrorSound,
  playFanfareSound,
} from '@/lib/audio-feedback';
import { speakRealisticText } from '@/lib/voice-engine';

type GameMode = 'blitz' | 'scramble' | 'pop' | 'detective';
type DifficultyTier = 'beginner' | 'intermediate' | 'advanced';

interface BlitzQuestion {
  id: string;
  tier: DifficultyTier;
  word: string;
  phonetic: string;
  contextSentence: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ScrambleChallenge {
  id: string;
  tier: DifficultyTier;
  clue: string;
  grammarTopic: string;
  targetSentence: string;
  words: string[];
  hint: string;
}

interface PopMission {
  id: string;
  tier: DifficultyTier;
  missionPrompt: string;
  sentenceWithBlank: string;
  fullSpokenSentence: string;
  bubbles: string[];
  correctBubble: string;
  ruleTip: string;
}

interface DetectiveChallenge {
  id: string;
  tier: DifficultyTier;
  spokenWord: string;
  spokenSentence: string;
  sentenceWithBlank: string;
  meaningClue: string;
  options: { word: string; note: string }[];
  correctWord: string;
  explanation: string;
}

const BLITZ_BANK: BlitzQuestion[] = [
  // Beginner
  {
    id: 'b1',
    tier: 'beginner',
    word: 'Generous',
    phonetic: '/ˈdʒen.ər.əs/',
    contextSentence: 'Maria is very generous; she always shares her lunch with friends.',
    prompt: 'What does "Generous" mean?',
    options: [
      'Happy to give and share with others',
      'Always arriving late to morning class',
      'Feeling very tired after a long walk',
      'Speaking in a very quiet whisper',
    ],
    correctIndex: 0,
    explanation: '"Generous" describes someone who gladly gives time, money, or kindness to others.',
  },
  {
    id: 'b2',
    tier: 'beginner',
    word: 'Exhausted',
    phonetic: '/ɪɡˈzɔː.stɪd/',
    contextSentence: 'After working a ten-hour shift, Carlos felt completely exhausted.',
    prompt: 'Choose the closest meaning for "Exhausted":',
    options: [
      'Extremely tired and out of energy',
      'Ready to start a new sports game',
      'Curious about a new foreign city',
      'Hungry for a sweet chocolate cake',
    ],
    correctIndex: 0,
    explanation: '"Exhausted" means 100% tired—much stronger than just "sleepy".',
  },
  {
    id: 'b3',
    tier: 'beginner',
    word: ' Delicious',
    phonetic: '/dɪˈlɪʃ.əs/',
    contextSentence: 'The fresh mango smoothie at the Miami café tasted delicious.',
    prompt: 'What does "Delicious" describe?',
    options: [
      'Food or drink with a wonderful taste',
      'Music played at a very loud volume',
      'Weather that is cold and rainy outside',
      'A book with many difficult pages',
    ],
    correctIndex: 0,
    explanation: 'Use "delicious" instead of "very good" when complimenting food or drinks.',
  },
  {
    id: 'b4',
    tier: 'beginner',
    word: 'Punctual',
    phonetic: '/ˈpʌŋk.tʃu.əl/',
    contextSentence: 'Our teacher appreciates punctual students who arrive right at 9:00 AM.',
    prompt: 'What does "Punctual" mean?',
    options: [
      'Arriving on time, never late',
      'Writing with a blue fountain pen',
      'Asking many questions in class',
      'Walking slowly in the afternoon',
    ],
    correctIndex: 0,
    explanation: '"Punctual" means always being on time for appointments, work, or class.',
  },
  // Intermediate
  {
    id: 'i1',
    tier: 'intermediate',
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.i.ənt/',
    contextSentence: 'Resilient learners never quit when they make a pronunciation mistake.',
    prompt: 'What is the meaning of "Resilient"?',
    options: [
      'Able to recover quickly from difficulties',
      'Preferring to work alone in silence',
      'Agreeing with every opinion in a meeting',
      'Forgetting important dates and schedules',
    ],
    correctIndex: 0,
    explanation: '"Resilient" means bouncing back stronger after setbacks or challenges.',
  },
  {
    id: 'i2',
    tier: 'intermediate',
    word: 'Inevitable',
    phonetic: '/ɪˈnev.ɪ.tə.bəl/',
    contextSentence: 'With daily speaking practice, improvement in your fluency is inevitable.',
    prompt: 'What does "Inevitable" mean?',
    options: [
      'Certain to happen and impossible to avoid',
      'Very difficult to explain in simple words',
      'Optional and not required for graduation',
      'Hidden inside a secret locked drawer',
    ],
    correctIndex: 0,
    explanation: 'If something is "inevitable", it is guaranteed to happen.',
  },
  {
    id: 'i3',
    tier: 'intermediate',
    word: 'Thorough',
    phonetic: '/ˈθʌr.oʊ/',
    contextSentence: 'The engineer conducted a thorough inspection of the software code.',
    prompt: 'Select the definition of "Thorough":',
    options: [
      'Careful, complete, and paying attention to detail',
      'Done in a hurry without checking mistakes',
      'Expensive and difficult for students to buy',
      'Loud enough for the whole room to hear',
    ],
    correctIndex: 0,
    explanation: '"Thorough" (/ˈθʌr.oʊ/) means complete and careful, leaving nothing out.',
  },
  {
    id: 'i4',
    tier: 'intermediate',
    word: 'Reluctant',
    phonetic: '/rɪˈlʌk.tənt/',
    contextSentence: 'At first he was reluctant to speak on stage, but soon he gained confidence.',
    prompt: 'What does "Reluctant" mean?',
    options: [
      'Hesitant and unwilling to do something',
      'Excited to volunteer first in a group',
      'Fluent in more than three languages',
      'Certain that the answer is 100% right',
    ],
    correctIndex: 0,
    explanation: '"Reluctant" means feeling hesitant or unwilling to take an action.',
  },
  // Advanced
  {
    id: 'a1',
    tier: 'advanced',
    word: 'Meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    contextSentence: 'Her meticulous preparation helped the company win the international contract.',
    prompt: 'What does "Meticulous" mean?',
    options: [
      'Showing extreme care and precision with details',
      'Using informal slang in academic writing',
      'Postponing decisions until the final minute',
      'Speaking rapidly without pausing for breath',
    ],
    correctIndex: 0,
    explanation: '"Meticulous" is C1/C2 vocabulary for being ultra-careful and precise.',
  },
  {
    id: 'a2',
    tier: 'advanced',
    word: 'Ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    contextSentence: 'Smartphones have become ubiquitous in modern classrooms and offices.',
    prompt: 'Choose the best meaning for "Ubiquitous":',
    options: [
      'Present, appearing, or found everywhere',
      'Rare and only seen in ancient museums',
      'Forbidden by official university policy',
      'Temporary and lasting only a few seconds',
    ],
    correctIndex: 0,
    explanation: '"Ubiquitous" means seeming to be everywhere at the same time.',
  },
  {
    id: 'a3',
    tier: 'advanced',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    contextSentence: 'Instead of arguing over theory, the team took a pragmatic approach.',
    prompt: 'What does "Pragmatic" mean?',
    options: [
      'Dealing with problems in a practical, realistic way',
      'Focusing only on emotional and poetic ideas',
      'Refusing to listen to feedback from colleagues',
      'Creating complicated rules that slow down work',
    ],
    correctIndex: 0,
    explanation: 'A "pragmatic" person focuses on practical results rather than abstract theories.',
  },
];

const SCRAMBLE_BANK: ScrambleChallenge[] = [
  {
    id: 's1',
    tier: 'beginner',
    clue: 'Polite coffee shop order in the morning',
    grammarTopic: 'Polite Requests ("Would like")',
    targetSentence: 'I would like a cup of hot coffee please',
    words: ['please', 'coffee', 'would', 'I', 'cup', 'like', 'a', 'hot', 'of'],
    hint: 'Start with "I would like a..." and end with "please".',
  },
  {
    id: 's2',
    tier: 'beginner',
    clue: 'Asking someone how long they have lived in a city',
    grammarTopic: 'Present Perfect Question',
    targetSentence: 'How long have you lived in Miami',
    words: ['lived', 'Miami', 'have', 'How', 'in', 'you', 'long'],
    hint: 'Question order: "How long" + "have you" + past participle.',
  },
  {
    id: 's3',
    tier: 'intermediate',
    clue: 'Talking about an action that started in the past and continues now',
    grammarTopic: 'Present Perfect Continuous',
    targetSentence: 'She has been studying English for six months',
    words: ['months', 'studying', 'She', 'for', 'has', 'English', 'six', 'been'],
    hint: 'Use "She has been + verb-ing" + "for six months".',
  },
  {
    id: 's4',
    tier: 'intermediate',
    clue: 'Imagining a different present situation (Second Conditional)',
    grammarTopic: 'Second Conditional ("If I had...")',
    targetSentence: 'If I had more free time I would travel the world',
    words: ['travel', 'If', 'time', 'would', 'I', 'had', 'world', 'more', 'free', 'I', 'the'],
    hint: 'Start with "If I had more free time" followed by "I would...".',
  },
  {
    id: 's5',
    tier: 'advanced',
    clue: 'Formal C1/C2 emphasis using Negative Inversion',
    grammarTopic: 'Negative Inversion ("Never before...")',
    targetSentence: 'Never before have we seen such rapid progress',
    words: ['seen', 'have', 'Never', 'rapid', 'before', 'we', 'progress', 'such'],
    hint: 'After "Never before", invert the auxiliary verb and subject: "have we seen...".',
  },
];

const POP_BANK: PopMission[] = [
  {
    id: 'p1',
    tier: 'beginner',
    missionPrompt: 'Pop the correct Past Simple verb!',
    sentenceWithBlank: 'Yesterday we ___ to the beach and watched the sunset.',
    fullSpokenSentence: 'Yesterday we went to the beach and watched the sunset.',
    bubbles: ['goed', 'went', 'gone', 'going'],
    correctBubble: 'went',
    ruleTip: 'The irregular Past Simple of "go" is "went" (never "goed"!).',
  },
  {
    id: 'p2',
    tier: 'beginner',
    missionPrompt: 'Pop the correct preposition of time!',
    sentenceWithBlank: 'Our English presentation starts ___ Monday morning.',
    fullSpokenSentence: 'Our English presentation starts on Monday morning.',
    bubbles: ['on', 'in', 'at', 'by'],
    correctBubble: 'on',
    ruleTip: 'Use "on" for specific days of the week (on Monday, on Friday morning).',
  },
  {
    id: 'p3',
    tier: 'intermediate',
    missionPrompt: 'Pop the natural collocation with "Interested"!',
    sentenceWithBlank: 'Many international students are interested ___ learning business English.',
    fullSpokenSentence: 'Many international students are interested in learning business English.',
    bubbles: ['in', 'on', 'for', 'to'],
    correctBubble: 'in',
    ruleTip: 'Always say "interested IN + verb-ing" (e.g., interested in learning).',
  },
  {
    id: 'p4',
    tier: 'intermediate',
    missionPrompt: 'Pop the right verb for making an error!',
    sentenceWithBlank: 'Do not worry if you ___ a mistake while speaking aloud.',
    fullSpokenSentence: 'Do not worry if you make a mistake while speaking aloud.',
    bubbles: ['make', 'do', 'take', 'have'],
    correctBubble: 'make',
    ruleTip: 'In English we "MAKE a mistake", whereas we "DO homework".',
  },
  {
    id: 'p5',
    tier: 'advanced',
    missionPrompt: 'Pop the correct C1 subjunctive / third conditional form!',
    sentenceWithBlank: 'Had I known about the traffic, I would have ___ earlier.',
    fullSpokenSentence: 'Had I known about the traffic, I would have left earlier.',
    bubbles: ['left', 'leave', 'leaving', 'leaves'],
    correctBubble: 'left',
    ruleTip: 'After "would have", always use the Past Participle ("left").',
  },
];

const DETECTIVE_BANK: DetectiveChallenge[] = [
  {
    id: 'd1',
    tier: 'beginner',
    spokenWord: 'their',
    spokenSentence: 'The students opened their notebooks and started writing.',
    sentenceWithBlank: 'The students opened _____ notebooks and started writing.',
    meaningClue: 'Possessive pronoun meaning "belonging to them"',
    options: [
      { word: 'their', note: 'Belonging to them (possessive)' },
      { word: 'there', note: 'Refers to a place or location' },
      { word: 'they’re', note: 'Contraction of "they are"' },
      { word: 'dare', note: 'To have the courage to do something' },
    ],
    correctWord: 'their',
    explanation: '"Their" shows ownership (their notebooks). "There" is a place, and "They’re" = They are.',
  },
  {
    id: 'd2',
    tier: 'intermediate',
    spokenWord: 'accept',
    spokenSentence: 'She was thrilled to accept the job offer in Miami.',
    sentenceWithBlank: 'She was thrilled to _____ the job offer in Miami.',
    meaningClue: 'Verb meaning "to say yes and receive gladly"',
    options: [
      { word: 'accept', note: 'Verb: to receive or say yes' },
      { word: 'except', note: 'Preposition: not including' },
      { word: 'expect', note: 'Verb: to believe something will happen' },
      { word: 'aspect', note: 'Noun: a particular part or feature' },
    ],
    correctWord: 'accept',
    explanation: '"Accept" (/əkˈsept/) means to say yes. "Except" means excluding.',
  },
  {
    id: 'd3',
    tier: 'intermediate',
    spokenWord: 'advice',
    spokenSentence: 'My mentor gave me valuable career advice before the interview.',
    sentenceWithBlank: 'My mentor gave me valuable career _____ before the interview.',
    meaningClue: 'Noun meaning "helpful suggestions or guidance"',
    options: [
      { word: 'advice', note: 'Noun (/ədˈvaɪs/ with an S sound)' },
      { word: 'advise', note: 'Verb (/ədˈvaɪz/ with a Z sound)' },
      { word: 'device', note: 'Noun: a machine or electronic tool' },
      { word: 'revise', note: 'Verb: to review and update work' },
    ],
    correctWord: 'advice',
    explanation: '"Advice" (with a C) is the noun. "Advise" (with an S) is the verb!',
  },
  {
    id: 'd4',
    tier: 'advanced',
    spokenWord: 'compliment',
    spokenSentence: 'The director gave the team a sincere compliment on their presentation.',
    sentenceWithBlank: 'The director gave the team a sincere _____ on their presentation.',
    meaningClue: 'Noun meaning "polite praise or admiration"',
    options: [
      { word: 'compliment', note: 'Spelled with I: praise or admiration' },
      { word: 'complement', note: 'Spelled with E: something that completes well' },
      { word: 'implement', note: 'Verb: to put a plan into action' },
      { word: 'supplement', note: 'Noun: something added to improve' },
    ],
    correctWord: 'compliment',
    explanation: 'Remember: "ComplIment" with an "I" means "I like what you did!" (praise).',
  },
];

interface Props {
  onXpEarned?: (xp: number) => void;
}

export default function EnglishLearningGameArena({ onXpEarned }: Props) {
  const [mode, setMode] = useState<GameMode>('blitz');
  const [tier, setTier] = useState<DifficultyTier>('beginner');

  // Global Game Score / Streak / Hearts
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [lastFeedback, setLastFeedback] = useState<{
    correct: boolean;
    message: string;
    spokenText?: string;
  } | null>(null);

  // Blitz Mode State
  const [blitzIndex, setBlitzIndex] = useState(0);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(60);
  const [blitzActive, setBlitzActive] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<
    { text: string; isCorrect: boolean }[]
  >([]);

  // Scramble Mode State
  const [scrambleIndex, setScrambleIndex] = useState(0);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [showScrambleHint, setShowScrambleHint] = useState(false);

  // Pop Mode State
  const [popIndex, setPopIndex] = useState(0);
  const [poppedBubble, setPoppedBubble] = useState<string | null>(null);

  // Detective Mode State
  const [detectiveIndex, setDetectiveIndex] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    try {
      const savedHigh = Number(localStorage.getItem('tici_game_high_score') || '0');
      const savedCombo = Number(localStorage.getItem('tici_game_best_combo') || '0');
      if (savedHigh) setHighScore(savedHigh);
      if (savedCombo) setBestCombo(savedCombo);
    } catch {}
  }, []);

  const updateScoreAndCombo = useCallback(
    (pointsBase: number, isCorrect: boolean, explanation: string, spokenText?: string) => {
      if (isCorrect) {
        playSuccessSound();
        const nextCombo = combo + 1;
        const multiplier = nextCombo >= 5 ? 3 : nextCombo >= 3 ? 2 : 1;
        const earned = pointsBase * multiplier;
        const nextScore = score + earned;

        setCombo(nextCombo);
        setScore(nextScore);

        if (nextScore > highScore) {
          setHighScore(nextScore);
          try {
            localStorage.setItem('tici_game_high_score', String(nextScore));
          } catch {}
        }
        if (nextCombo > bestCombo) {
          setBestCombo(nextCombo);
          try {
            localStorage.setItem('tici_game_best_combo', String(nextCombo));
          } catch {}
        }

        if (nextCombo % 3 === 0) {
          confetti({ particleCount: 45, spread: 65, origin: { y: 0.7 } });
        }

        if (onXpEarned) onXpEarned(earned);

        setLastFeedback({
          correct: true,
          message: `+${earned} XP (${multiplier}x Combo!) — ${explanation}`,
          spokenText,
        });

        if (spokenText) {
          speakRealisticText(spokenText, { rate: 0.96 });
        }
      } else {
        playErrorSound();
        setCombo(0);
        setHearts((h) => Math.max(1, h - 1));
        setLastFeedback({
          correct: false,
          message: `Keep going! ${explanation}`,
          spokenText,
        });
      }
    },
    [combo, score, highScore, bestCombo, onXpEarned]
  );

  // Filter questions by difficulty (or fallback to all if needed)
  const currentBlitzItem = BLITZ_BANK[blitzIndex % BLITZ_BANK.length];
  const currentScrambleItem = SCRAMBLE_BANK[scrambleIndex % SCRAMBLE_BANK.length];
  const currentPopItem = POP_BANK[popIndex % POP_BANK.length];
  const currentDetectiveItem = DETECTIVE_BANK[detectiveIndex % DETECTIVE_BANK.length];

  // Shuffle Blitz options whenever blitzIndex changes
  useEffect(() => {
    const items = currentBlitzItem.options.map((text, idx) => ({
      text,
      isCorrect: idx === currentBlitzItem.correctIndex,
    }));
    // Deterministic or random shuffle
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setShuffledOptions(copy);
  }, [blitzIndex, currentBlitzItem]);

  // Blitz timer
  useEffect(() => {
    if (mode !== 'blitz' || !blitzActive) return;
    if (blitzTimeLeft <= 0) {
      setBlitzActive(false);
      playFanfareSound();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      return;
    }
    const timer = setInterval(() => {
      setBlitzTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, blitzActive, blitzTimeLeft]);

  const handleBlitzAnswer = (isCorrect: boolean) => {
    if (!blitzActive) setBlitzActive(true);
    updateScoreAndCombo(
      15,
      isCorrect,
      currentBlitzItem.explanation,
      `${currentBlitzItem.word}. ${currentBlitzItem.contextSentence}`
    );
    setTimeout(() => {
      setBlitzIndex((i) => i + 1);
    }, 900);
  };

  // Scramble handlers
  const handleToggleScrambleWord = (wordIdx: number) => {
    if (selectedWordIndices.includes(wordIdx)) {
      setSelectedWordIndices(selectedWordIndices.filter((i) => i !== wordIdx));
    } else {
      const next = [...selectedWordIndices, wordIdx];
      setSelectedWordIndices(next);
      const wordText = currentScrambleItem.words[wordIdx];
      speakRealisticText(wordText, { rate: 1.0 });

      // Auto-check when all words are placed
      if (next.length === currentScrambleItem.words.length) {
        const built = next.map((idx) => currentScrambleItem.words[idx]).join(' ');
        const isCorrect =
          built.toLowerCase().trim() ===
          currentScrambleItem.targetSentence.toLowerCase().trim();

        updateScoreAndCombo(
          25,
          isCorrect,
          isCorrect
            ? `Perfect ${currentScrambleItem.grammarTopic}! "${currentScrambleItem.targetSentence}."`
            : `Correct order: "${currentScrambleItem.targetSentence}"`,
          currentScrambleItem.targetSentence
        );

        if (isCorrect) {
          setTimeout(() => {
            setSelectedWordIndices([]);
            setShowScrambleHint(false);
            setScrambleIndex((i) => i + 1);
          }, 1400);
        }
      }
    }
  };

  // Pop handlers
  const handlePopBubble = (bubbleWord: string) => {
    setPoppedBubble(bubbleWord);
    const isCorrect = bubbleWord === currentPopItem.correctBubble;
    updateScoreAndCombo(
      20,
      isCorrect,
      currentPopItem.ruleTip,
      currentPopItem.fullSpokenSentence
    );
    setTimeout(() => {
      setPoppedBubble(null);
      if (isCorrect) {
        setPopIndex((i) => i + 1);
      }
    }, 1200);
  };

  // Detective handlers
  const handleDetectivePick = (word: string) => {
    const isCorrect = word === currentDetectiveItem.correctWord;
    updateScoreAndCombo(
      20,
      isCorrect,
      currentDetectiveItem.explanation,
      currentDetectiveItem.spokenSentence
    );
    if (isCorrect) {
      setTimeout(() => {
        setDetectiveIndex((i) => i + 1);
      }, 1400);
    }
  };

  const resetAllGames = () => {
    setScore(0);
    setCombo(0);
    setHearts(3);
    setBlitzTimeLeft(60);
    setBlitzActive(false);
    setSelectedWordIndices([]);
    setLastFeedback(null);
  };

  const bubbleColors = [
    'from-emerald-500 to-teal-700 border-emerald-300 shadow-[0_6px_0_0_#065f46]',
    'from-blue-500 to-indigo-700 border-blue-300 shadow-[0_6px_0_0_#1e3a8a]',
    'from-amber-500 to-orange-600 border-amber-300 shadow-[0_6px_0_0_#92400e]',
    'from-purple-500 to-rose-600 border-purple-300 shadow-[0_6px_0_0_#581c87]',
  ];

  return (
    <section className="card-3d overflow-hidden border-2 border-indigo-500/80 dark:border-indigo-700 bg-white dark:bg-slate-900">
      {/* Top Arcade Header Bar */}
      <div className="p-5 sm:p-7 bg-gradient-to-r from-indigo-900 via-blue-900 to-emerald-900 text-white border-b border-indigo-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 p-3 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_4px_0_0_#b45309] shrink-0">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  ★ Interactive English Arcade
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  Play & Earn Live XP + Native Audio Pronunciation
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                English Fluency Game Arena (4-in-1)
              </h2>
            </div>
          </div>

          {/* Live Arcade Scoreboard HUD */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-200 leading-none">
                  Score
                </div>
                <div className="text-sm font-black">{score} XP</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-2">
              <Flame
                className={`w-4 h-4 ${
                  combo >= 3
                    ? 'text-orange-400 fill-orange-400 animate-bounce'
                    : 'text-amber-300'
                }`}
              />
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-200 leading-none">
                  Combo
                </div>
                <div className="text-sm font-black">{combo}x Streak</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-200 leading-none">
                  Best
                </div>
                <div className="text-sm font-black">{highScore} XP</div>
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-1">
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  className={`w-4 h-4 ${
                    h <= hearts
                      ? 'text-rose-400 fill-rose-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={resetAllGames}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer"
              title="Reset Score"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Game Mode Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {[
            {
              id: 'blitz',
              label: '1. Word Blitz',
              sub: '60s Meaning Match',
              icon: Timer,
            },
            {
              id: 'scramble',
              label: '2. Sentence Builder',
              sub: 'Word Order Puzzle',
              icon: Puzzle,
            },
            {
              id: 'pop',
              label: '3. Grammar Pop',
              sub: 'Target Bubble Shooter',
              icon: Target,
            },
            {
              id: 'detective',
              label: '4. Ear Detective',
              sub: 'Listen & Spell',
              icon: Headphones,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id as GameMode);
                  setLastFeedback(null);
                }}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border-2 ${
                  active
                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_4px_0_0_#b45309] -translate-y-0.5'
                    : 'bg-slate-950/45 text-white border-white/15 hover:bg-slate-950/70'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black truncate">
                    {tab.label}
                  </div>
                  <div
                    className={`text-[10px] font-bold truncate ${
                      active ? 'text-slate-800' : 'text-blue-200'
                    }`}
                  >
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Live Feedback Banner */}
        {lastFeedback && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 animate-in fade-in duration-150 ${
              lastFeedback.correct
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm font-extrabold">
              {lastFeedback.correct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>{lastFeedback.message}</span>
            </div>
            {lastFeedback.spokenText && (
              <button
                type="button"
                onClick={() =>
                  speakRealisticText(lastFeedback.spokenText || '', { rate: 0.9 })
                }
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Replay Audio</span>
              </button>
            )}
          </div>
        )}

        {/* ===============================================================
            GAME MODE 1: WORD BLITZ (60s SPEED MEANING MATCH)
           =============================================================== */}
        {mode === 'blitz' && (
          <div className="space-y-6">
            {/* Timer Progress Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
                <Timer className="w-4 h-4 text-blue-600" />
                <span>60-Second Word Blitz: {blitzTimeLeft}s remaining</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBlitzTimeLeft(60);
                  setBlitzActive(true);
                  setBlitzIndex((i) => i + 1);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{blitzActive ? 'Next Word' : 'Start 60s Timer'}</span>
              </button>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${(blitzTimeLeft / 60) * 100}%` }}
              />
            </div>

            {/* Word Showcase Card */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {currentBlitzItem.word}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {currentBlitzItem.phonetic}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic font-medium">
                  &ldquo;{currentBlitzItem.contextSentence}&rdquo;
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  speakRealisticText(
                    `${currentBlitzItem.word}. ${currentBlitzItem.contextSentence}`,
                    { rate: 0.92 }
                  )
                }
                className="btn-3d-primary px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-center"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Word</span>
              </button>
            </div>

            {/* 4 Balanced Answer Options */}
            <div className="space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                {currentBlitzItem.prompt}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {shuffledOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleBlitzAnswer(opt.isCorrect)}
                    className="p-4 rounded-2xl text-left font-extrabold text-xs sm:text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-800 dark:text-slate-100">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME MODE 2: SENTENCE BUILDER RACE (SCRAMBLE PUZZLE)
           =============================================================== */}
        {mode === 'scramble' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {currentScrambleItem.grammarTopic}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  Mission: {currentScrambleItem.clue}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Tap the words below in the correct order to build a natural English sentence.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    speakRealisticText(currentScrambleItem.targetSentence, {
                      rate: 0.85,
                    })
                  }
                  className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Sentence</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowScrambleHint(!showScrambleHint)}
                  className="btn-3d-secondary px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Hint</span>
                </button>
              </div>
            </div>

            {showScrambleHint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-900 dark:text-amber-200">
                💡 Grammar Hint: {currentScrambleItem.hint}
              </div>
            )}

            {/* Answer Construction Tray */}
            <div className="min-h-[76px] p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-blue-400 dark:border-blue-700 flex flex-wrap items-center gap-2">
              {selectedWordIndices.length === 0 ? (
                <span className="text-xs font-bold text-slate-400">
                  Tap words below to assemble the sentence here...
                </span>
              ) : (
                selectedWordIndices.map((wordIdx, pos) => (
                  <button
                    key={`${wordIdx}-${pos}`}
                    type="button"
                    onClick={() => handleToggleScrambleWord(wordIdx)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm shadow-[0_3px_0_0_#1e3a8a] hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    {currentScrambleItem.words[wordIdx]}
                  </button>
                ))
              )}
            </div>

            {/* Available Word Bank */}
            <div className="flex flex-wrap items-center gap-2.5">
              {currentScrambleItem.words.map((word, idx) => {
                const isUsed = selectedWordIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleToggleScrambleWord(idx)}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 transition-all ${
                      isUsed
                        ? 'opacity-30 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-900 dark:text-white shadow-[0_4px_0_0_#cbd5e1] dark:shadow-[0_4px_0_0_#1e293b] hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSelectedWordIndices([])}
                className="text-xs font-extrabold text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Clear Tray
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedWordIndices([]);
                  setShowScrambleHint(false);
                  setScrambleIndex((i) => i + 1);
                }}
                className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Skip to Next Sentence →
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME MODE 3: GRAMMAR POP (FLOATING BUBBLE TARGET SHOOTER)
           =============================================================== */}
        {mode === 'pop' && (
          <div className="space-y-6">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 space-y-2 text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                🎯 {currentPopItem.missionPrompt}
              </span>
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                &ldquo;{currentPopItem.sentenceWithBlank}&rdquo;
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Tap the correct floating bubble below to pop it and hear the sentence!
              </p>
            </div>

            {/* Floating Bubbles Arena */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              {currentPopItem.bubbles.map((bubble, idx) => {
                const isPopped = poppedBubble === bubble;
                const colorClass = bubbleColors[idx % bubbleColors.length];
                return (
                  <button
                    key={bubble}
                    type="button"
                    onClick={() => handlePopBubble(bubble)}
                    className={`h-28 sm:h-32 rounded-3xl bg-gradient-to-br ${colorClass} border-2 text-white font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer ${
                      isPopped
                        ? 'scale-125 opacity-0'
                        : 'hover:-translate-y-2 hover:scale-105 active:translate-y-1'
                    }`}
                  >
                    <span>🎈 {bubble}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Tap to Pop
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME MODE 4: EAR DETECTIVE (LISTEN & SPELL HOMOPHONES)
           =============================================================== */}
        {mode === 'detective' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  🎧 Sound & Spelling Detective
                </span>
                <p className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  &ldquo;{currentDetectiveItem.sentenceWithBlank}&rdquo;
                </p>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Clue: {currentDetectiveItem.meaningClue}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    speakRealisticText(currentDetectiveItem.spokenSentence, {
                      rate: 0.96,
                    })
                  }
                  className="btn-3d-primary px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play Normal (1.0x)</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    speakRealisticText(currentDetectiveItem.spokenSentence, {
                      rate: 0.65,
                    })
                  }
                  className="btn-3d-secondary px-3.5 py-3 rounded-2xl text-xs font-black cursor-pointer"
                >
                  🐢 Slow (0.65x)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentDetectiveItem.options.map((opt) => (
                <button
                  key={opt.word}
                  type="button"
                  onClick={() => handleDetectivePick(opt.word)}
                  className="p-4 rounded-2xl text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-black text-base text-slate-900 dark:text-white">
                      {opt.word}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.note}
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
