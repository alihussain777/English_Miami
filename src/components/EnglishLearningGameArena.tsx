'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Zap,
  Flame,
  Trophy,
  Heart,
  Volume2,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Timer,
  Puzzle,
  Crosshair,
  Rocket,
  Hammer,
  Car,
  Utensils,
} from 'lucide-react';
import {
  playSuccessSound,
  playErrorSound,
  playFanfareSound,
  playLaserSound,
  playExplosionSound,
  playChompSound,
  playBonkSound,
} from '@/lib/audio-feedback';
import { speakRealisticText } from '@/lib/voice-engine';

type GameMode =
  | 'laser'
  | 'zombie'
  | 'shark'
  | 'racer'
  | 'blitz'
  | 'scramble';

// ============================================================================
// 1. SPACE LASER WORD SHOOTER MISSIONS (REAL PLAYABLE FIRING GAME)
// ============================================================================
interface LaserMission {
  prompt: string;
  targets: { word: string; isCorrect: boolean }[];
  spokenSuccess: string;
  explanation: string;
}

const LASER_MISSIONS: LaserMission[] = [
  {
    prompt: '🔥 SHOOT THE SYNONYM OF "BRAVE"!',
    targets: [
      { word: 'Timid', isCorrect: false },
      { word: 'Courageous', isCorrect: true },
      { word: 'Sleepy', isCorrect: false },
      { word: 'Careless', isCorrect: false },
    ],
    spokenSuccess: 'Courageous! Brave and courageous mean having no fear.',
    explanation: '"Courageous" (/kəˈreɪ.dʒəs/) is a powerful synonym for "Brave".',
  },
  {
    prompt: '🔥 SHOOT THE CORRECT PAST TENSE OF "TEACH"!',
    targets: [
      { word: 'Teached', isCorrect: false },
      { word: 'Taught', isCorrect: true },
      { word: 'Touchen', isCorrect: false },
      { word: 'Teaching', isCorrect: false },
    ],
    spokenSuccess: 'Taught! Jason taught the English class yesterday.',
    explanation: 'The irregular past tense of "teach" is "taught" (never "teached"!).',
  },
  {
    prompt: '🔥 SHOOT THE CORRECT SPELLING!',
    targets: [
      { word: 'Definitly', isCorrect: false },
      { word: 'Definately', isCorrect: false },
      { word: 'Definitely', isCorrect: true },
      { word: 'Definetely', isCorrect: false },
    ],
    spokenSuccess: 'Definitely! D-E-F-I-N-I-T-E-L-Y. I will definitely pass the exam.',
    explanation: 'Remember: "Definitely" has "finite" in the middle (two I’s, no A!).',
  },
  {
    prompt: '🔥 SHOOT THE OPPOSITE (ANTONYM) OF "GENEROUS"!',
    targets: [
      { word: 'Kind', isCorrect: false },
      { word: 'Selfish', isCorrect: true },
      { word: 'Polite', isCorrect: false },
      { word: 'Wealthy', isCorrect: false },
    ],
    spokenSuccess: 'Selfish! Generous people share; selfish people keep everything.',
    explanation: '"Selfish" is the exact opposite of "Generous".',
  },
  {
    prompt: '🔥 SHOOT THE WORD THAT FITS: "She is good ___ speaking English."',
    targets: [
      { word: 'in', isCorrect: false },
      { word: 'at', isCorrect: true },
      { word: 'on', isCorrect: false },
      { word: 'with', isCorrect: false },
    ],
    spokenSuccess: 'Good at! She is very good at speaking English.',
    explanation: 'In English we say "good AT + activity" (good at speaking, good at math).',
  },
  {
    prompt: '🔥 SHOOT THE PAST TENSE OF "BUY"!',
    targets: [
      { word: 'Buyed', isCorrect: false },
      { word: 'Brought', isCorrect: false },
      { word: 'Bought', isCorrect: true },
      { word: 'Baught', isCorrect: false },
    ],
    spokenSuccess: 'Bought! I bought a new notebook this morning.',
    explanation: '"Bought" is the past of "buy" ("Brought" is the past of "bring"!).',
  },
  {
    prompt: '🔥 SHOOT THE WORD MEANING "EXTREMELY BIG"!',
    targets: [
      { word: 'Tiny', isCorrect: false },
      { word: 'Enormous', isCorrect: true },
      { word: 'Narrow', isCorrect: false },
      { word: 'Silent', isCorrect: false },
    ],
    spokenSuccess: 'Enormous! The cruise ship in Miami port is enormous.',
    explanation: '"Enormous" means huge or gigantic.',
  },
];

// ============================================================================
// 2. ZOMBIE GRAMMAR WHACK! (FUNNY WHACK-A-ZOMBIE GAME)
// ============================================================================
interface ZombiePopItem {
  id: string;
  isZombieBadGrammar: boolean;
  displayText: string;
  fixedSentence: string;
  funnyReaction: string;
}

const ZOMBIE_POP_BANK: ZombiePopItem[] = [
  {
    id: 'z1',
    isZombieBadGrammar: true,
    displayText: '🧟 "He GOED to Miami!"',
    fixedSentence: 'He went to Miami!',
    funnyReaction: '🥊 BONK! Zombie cured! Never say "goed" — say "He WENT to Miami!"',
  },
  {
    id: 'z2',
    isZombieBadGrammar: true,
    displayText: '🧟 "I HAVE 22 years old!"',
    fixedSentence: 'I am 22 years old!',
    funnyReaction: '🥊 POW! In English we use "I AM 22 years old", never "I have"!',
  },
  {
    id: 'z3',
    isZombieBadGrammar: true,
    displayText: '🧟 "She DON’T know!"',
    fixedSentence: 'She doesn’t know!',
    funnyReaction: '🥊 SMASH! With He/She/It, always say "She DOESN’T know!"',
  },
  {
    id: 'z4',
    isZombieBadGrammar: true,
    displayText: '🧟 "This is MORE BETTER!"',
    fixedSentence: 'This is much better!',
    funnyReaction: '🥊 WHACK! "Better" is already comparative — say "MUCH better"!',
  },
  {
    id: 'z5',
    isZombieBadGrammar: true,
    displayText: '🧟 "Did you WENT home?"',
    fixedSentence: 'Did you go home?',
    funnyReaction: '🥊 KABOOM! After "Did", always use the base verb: "Did you GO home?"',
  },
  {
    id: 'z6',
    isZombieBadGrammar: true,
    displayText: '🧟 "I am AGREE with you!"',
    fixedSentence: 'I agree with you!',
    funnyReaction: '🥊 BONK! "Agree" is a verb, not an adjective — just say "I agree!"',
  },
  {
    id: 'p1',
    isZombieBadGrammar: false,
    displayText: '🧑‍🏫 "She has lived here for 3 years."',
    fixedSentence: 'She has lived here for 3 years.',
    funnyReaction: '👓 OUCH! Don’t punch the Professor! That sentence was 100% CORRECT!',
  },
  {
    id: 'p2',
    isZombieBadGrammar: false,
    displayText: '🧑‍🏫 "I look forward to meeting you."',
    fixedSentence: 'I look forward to meeting you.',
    funnyReaction: '👓 HEY! My grammar was perfect ("look forward to + -ing")!',
  },
];

// ============================================================================
// 3. HUNGRY MIAMI SHARK (FUNNY FOOD & WORD CATCHER)
// ============================================================================
interface SharkRound {
  orderTitle: string;
  goodItems: { emoji: string; word: string; spoken: string }[];
  badItems: { emoji: string; word: string; funnyFail: string }[];
}

const SHARK_ROUNDS: SharkRound[] = [
  {
    orderTitle: '🦈 Order #1: Feed Chef Shark ONLY "POSITIVE ADJECTIVES"! (Dodge the stinky boots!)',
    goodItems: [
      { emoji: '🍔', word: 'Brilliant', spoken: 'Yum! Brilliant means very clever or wonderful!' },
      { emoji: '🍕', word: 'Generous', spoken: 'Delicious! Generous means happy to share!' },
      { emoji: '🌮', word: 'Confident', spoken: 'Tasty! Confident means sure of yourself!' },
      { emoji: '🍩', word: 'Enthusiastic', spoken: 'Sweet! Enthusiastic means full of excitement!' },
    ],
    badItems: [
      { emoji: '🥾', word: 'He Goed (Boot!)', funnyFail: '🤢 YUCK! You fed the shark an old boot with bad grammar!' },
      { emoji: '🧦', word: 'Rude & Mean', funnyFail: '🤢 BLEGH! That’s negative, not a positive adjective!' },
      { emoji: '💣', word: 'More Better', funnyFail: '💥 OOPS! Grammar bomb gave the shark indigestion!' },
    ],
  },
  {
    orderTitle: '🦈 Order #2: Feed Chef Shark ONLY "CORRECT IRREGULAR PAST VERBS"!',
    goodItems: [
      { emoji: '🍣', word: 'Spoke (Speak)', spoken: 'Chomp! Spoke is the past tense of speak!' },
      { emoji: '🍤', word: 'Wrote (Write)', spoken: 'Yum! Wrote is the past tense of write!' },
      { emoji: '🥩', word: 'Caught (Catch)', spoken: 'Nom nom! Caught is the past tense of catch!' },
      { emoji: '🍗', word: 'Flew (Fly)', spoken: 'Crunchy! Flew is the past tense of fly!' },
    ],
    badItems: [
      { emoji: '🥾', word: 'Speaked (Wrong!)', funnyFail: '🤢 YUCK! "Speaked" is not a word — it’s "Spoke"!' },
      { emoji: '🧦', word: 'Catched (Wrong!)', funnyFail: '🤢 BLEGH! Never say "Catched" — say "Caught"!' },
      { emoji: '🦴', word: 'Writed (Wrong!)', funnyFail: '🤢 OUCH! "Writed" is a sharp fishbone — say "Wrote"!' },
    ],
  },
];

// ============================================================================
// 4. MIAMI TURBO RACER (FUNNY NITRO CAR RACE)
// ============================================================================
interface RacerChallenge {
  situation: string;
  options: { text: string; isCorrect: boolean; funnyOutcome: string }[];
  spokenAnswer: string;
}

const RACER_CHALLENGES: RacerChallenge[] = [
  {
    situation: '🚦 Boss asks: "Can you finish this report by 5 PM?" — Pick the most natural professional reply for NITRO!',
    options: [
      {
        text: '🔥 "Sure thing! I’m on it and will send it before 5."',
        isCorrect: true,
        funnyOutcome: '🏎️💨 NITRO ENGAGED! "I’m on it" is natural workplace English!',
      },
      {
        text: '🍌 "Yes I am make report five clock maybe."',
        isCorrect: false,
        funnyOutcome: '🍌 WHOOPS! You slipped on a grammar banana peel!',
      },
      {
        text: '🍌 "Report is go to be finish by me."',
        isCorrect: false,
        funnyOutcome: '🍌 SPIN-OUT! Officer Bob’s police car just passed you!',
      },
    ],
    spokenAnswer: 'Sure thing! I am on it and will send it before five.',
  },
  {
    situation: '🚦 It’s raining super hard in Miami! Which funny English idiom means "raining very heavily"?',
    options: [
      {
        text: '🔥 "It’s raining cats and dogs!"',
        isCorrect: true,
        funnyOutcome: '🏎️💨 TURBO BOOST! "Raining cats and dogs" = pouring rain!',
      },
      {
        text: '🍌 "It’s raining sharks and crocodiles!"',
        isCorrect: false,
        funnyOutcome: '🍌 SPLASH! Funny, but the real idiom is "cats and dogs"!',
      },
      {
        text: '🍌 "The sky is crying big water!"',
        isCorrect: false,
        funnyOutcome: '🍌 SLOW DOWN! Poetic, but not the idiom!',
      },
    ],
    spokenAnswer: 'It is raining cats and dogs outside today!',
  },
  {
    situation: '🚦 Your friend is nervous before an English speech. What idiom means "Good luck on stage!"?',
    options: [
      {
        text: '🔥 "Break a leg! You’re going to do great!"',
        isCorrect: true,
        funnyOutcome: '🏎️💨 SUPER NITRO! "Break a leg" means "Good luck!" in theater & speeches!',
      },
      {
        text: '🍌 "Break your nose on the microphone!"',
        isCorrect: false,
        funnyOutcome: '🍌 CRASH! Don’t tell your friend to break their nose! 😂',
      },
      {
        text: '🍌 "Fall down the stairs please!"',
        isCorrect: false,
        funnyOutcome: '🍌 HONK HONK! It’s "Break a leg!", not fall down stairs!',
      },
    ],
    spokenAnswer: 'Break a leg! You are going to do great!',
  },
  {
    situation: '🚦 Someone tells you a secret. Which idiom means "I will keep the secret and not tell anyone"?',
    options: [
      {
        text: '🔥 "My lips are sealed!"',
        isCorrect: true,
        funnyOutcome: '🏎️💨 FINISH LINE NITRO! "My lips are sealed" = I won’t tell a soul!',
      },
      {
        text: '🍌 "My ears are glued with cheese!"',
        isCorrect: false,
        funnyOutcome: '🍌 HAHA! Funny, but say "My lips are sealed!"',
      },
      {
        text: '🍌 "I spilled the beans everywhere!"',
        isCorrect: false,
        funnyOutcome: '🍌 OOPS! "Spill the beans" means you TOLD the secret!',
      },
    ],
    spokenAnswer: 'Don’t worry, my lips are sealed!',
  },
];

// ============================================================================
// 5. WORD BLITZ & 6. SENTENCE BUILDER BANKS
// ============================================================================
const BLITZ_BANK = [
  {
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.i.ənt/',
    sentence: 'Resilient learners never quit when they make a mistake.',
    options: [
      { text: 'Able to recover quickly from difficulties', isCorrect: true },
      { text: 'Preferring to sleep all afternoon', isCorrect: false },
      { text: 'Forgetting important phone numbers', isCorrect: false },
      { text: 'Walking very slowly in the rain', isCorrect: false },
    ],
    explanation: '"Resilient" means bouncing back stronger after challenges.',
  },
  {
    word: 'Punctual',
    phonetic: '/ˈpʌŋk.tʃu.əl/',
    sentence: 'Our teacher loves punctual students who arrive right on time.',
    options: [
      { text: 'Arriving on time, never late', isCorrect: true },
      { text: 'Writing with a red pencil', isCorrect: false },
      { text: 'Eating breakfast at midnight', isCorrect: false },
      { text: 'Speaking in a very loud voice', isCorrect: false },
    ],
    explanation: '"Punctual" means always arriving on time.',
  },
  {
    word: 'Exhausted',
    phonetic: '/ɪɡˈzɔː.stɪd/',
    sentence: 'After working ten hours, Carlos felt completely exhausted.',
    options: [
      { text: 'Extremely tired with zero energy left', isCorrect: true },
      { text: 'Excited to run a marathon race', isCorrect: false },
      { text: 'Hungry for a spicy chicken taco', isCorrect: false },
      { text: 'Curious about space rockets', isCorrect: false },
    ],
    explanation: '"Exhausted" means 100% tired.',
  },
];

const SCRAMBLE_BANK = [
  {
    clue: 'Polite coffee shop order in the morning',
    topic: 'Polite Requests',
    targetSentence: 'I would like a cup of hot coffee please',
    words: ['please', 'coffee', 'would', 'I', 'cup', 'like', 'a', 'hot', 'of'],
    hint: 'Start with "I would like a..." and end with "please".',
  },
  {
    clue: 'Asking how long someone has lived in Miami',
    topic: 'Present Perfect Question',
    targetSentence: 'How long have you lived in Miami',
    words: ['lived', 'Miami', 'have', 'How', 'in', 'you', 'long'],
    hint: 'Start with "How long have you...".',
  },
];

interface Props {
  onXpEarned?: (xp: number) => void;
}

export default function EnglishLearningGameArena({ onXpEarned }: Props) {
  const [mode, setMode] = useState<GameMode>('laser');

  // Shared Arcade HUD State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [bannerMsg, setBannerMsg] = useState<{
    ok: boolean;
    text: string;
    spoken?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem('tici_game_high_score') || '0');
      if (saved) setHighScore(saved);
    } catch {}
  }, []);

  const awardPoints = useCallback(
    (basePts: number, ok: boolean, message: string, spoken?: string) => {
      if (ok) {
        const nextCombo = combo + 1;
        const mult = nextCombo >= 5 ? 3 : nextCombo >= 3 ? 2 : 1;
        const pts = basePts * mult;
        const nextScore = score + pts;
        setCombo(nextCombo);
        setScore(nextScore);
        if (nextScore > highScore) {
          setHighScore(nextScore);
          try {
            localStorage.setItem('tici_game_high_score', String(nextScore));
          } catch {}
        }
        if (onXpEarned) onXpEarned(pts);
        setBannerMsg({
          ok: true,
          text: `+${pts} XP (${mult}x Combo!) — ${message}`,
          spoken,
        });
        if (spoken) {
          speakRealisticText(spoken, { rate: 0.98 });
        }
      } else {
        setCombo(0);
        setHearts((h) => (h > 1 ? h - 1 : 3));
        setBannerMsg({
          ok: false,
          text: message,
          spoken,
        });
      }
    },
    [combo, score, highScore, onXpEarned]
  );

  // ==========================================================================
  // MODE 1: SPACE LASER SHOOTER STATE & REAL-TIME LOOP
  // ==========================================================================
  const [laserMissionIdx, setLaserMissionIdx] = useState(0);
  const [shipX, setShipX] = useState(50); // 10% to 90%
  const [ufoY, setUfoY] = useState(14); // 10% to 75%
  const [laserBeam, setLaserBeam] = useState<{
    x: number;
    targetIdx: number;
    hitOk: boolean;
  } | null>(null);
  const [explodedIdx, setExplodedIdx] = useState<number | null>(null);
  const [laserPaused, setLaserPaused] = useState(false);
  const laserArenaRef = useRef<HTMLDivElement | null>(null);

  const currentLaserMission = LASER_MISSIONS[laserMissionIdx % LASER_MISSIONS.length];
  const ufoPositions = [15, 38, 62, 85];

  // Move UFOs slowly downward in Laser Shooter
  useEffect(() => {
    if (mode !== 'laser' || laserPaused) return;
    const interval = setInterval(() => {
      setUfoY((y) => (y >= 68 ? 14 : y + 1.1));
    }, 120);
    return () => clearInterval(interval);
  }, [mode, laserPaused]);

  const fireLaserAtTarget = useCallback(
    (targetIdx: number) => {
      const targetX = ufoPositions[targetIdx];
      setShipX(targetX);
      playLaserSound();

      const targetObj = currentLaserMission.targets[targetIdx];
      const isHitOk = Boolean(targetObj?.isCorrect);

      setLaserBeam({ x: targetX, targetIdx, hitOk: isHitOk });

      setTimeout(() => {
        if (isHitOk) {
          playExplosionSound();
          setExplodedIdx(targetIdx);
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.55 } });
          awardPoints(
            40,
            true,
            currentLaserMission.explanation,
            currentLaserMission.spokenSuccess
          );
          setTimeout(() => {
            setExplodedIdx(null);
            setLaserBeam(null);
            setUfoY(14);
            setLaserMissionIdx((i) => i + 1);
          }, 950);
        } else {
          playErrorSound();
          awardPoints(
            0,
            false,
            `🛸 Wrong UFO! Look closely: ${currentLaserMission.prompt}`
          );
          setTimeout(() => {
            setLaserBeam(null);
          }, 450);
        }
      }, 180);
    },
    [currentLaserMission, awardPoints]
  );

  // Keyboard controls for Laser Shooter (Left/Right + Spacebar)
  useEffect(() => {
    if (mode !== 'laser') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setShipX((x) => Math.max(12, x - 12));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setShipX((x) => Math.min(88, x + 12));
      } else if (e.key === ' ') {
        e.preventDefault();
        // Find closest UFO to current shipX
        let closestIdx = 0;
        let minDist = 999;
        ufoPositions.forEach((ux, idx) => {
          const d = Math.abs(ux - shipX);
          if (d < minDist) {
            minDist = d;
            closestIdx = idx;
          }
        });
        fireLaserAtTarget(closestIdx);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, shipX, fireLaserAtTarget]);

  // ==========================================================================
  // MODE 2: ZOMBIE GRAMMAR WHACK STATE & REAL-TIME POP-UP LOOP
  // ==========================================================================
  const [activeHoles, setActiveHoles] = useState<(ZombiePopItem | null)[]>([
    ZOMBIE_POP_BANK[0],
    null,
    ZOMBIE_POP_BANK[1],
    null,
    ZOMBIE_POP_BANK[6],
    null,
  ]);
  const [whackedHoleIdx, setWhackedHoleIdx] = useState<number | null>(null);
  const [zombieScoreCount, setZombieScoreCount] = useState(0);

  useEffect(() => {
    if (mode !== 'zombie') return;
    const interval = setInterval(() => {
      setActiveHoles(() => {
        const next: (ZombiePopItem | null)[] = [null, null, null, null, null, null];
        // Pick 2 or 3 random holes to pop up
        const holeIndices = [0, 1, 2, 3, 4, 5]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        holeIndices.forEach((hIdx) => {
          const randomItem =
            ZOMBIE_POP_BANK[Math.floor(Math.random() * ZOMBIE_POP_BANK.length)];
          next[hIdx] = randomItem;
        });
        return next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [mode]);

  const handleWhackHole = (holeIdx: number) => {
    const item = activeHoles[holeIdx];
    if (!item) return;
    setWhackedHoleIdx(holeIdx);
    playBonkSound();

    if (item.isZombieBadGrammar) {
      setZombieScoreCount((c) => c + 1);
      awardPoints(35, true, item.funnyReaction, item.fixedSentence);
    } else {
      playErrorSound();
      awardPoints(0, false, item.funnyReaction, item.fixedSentence);
    }

    setTimeout(() => {
      setWhackedHoleIdx(null);
      setActiveHoles((prev) =>
        prev.map((entry, idx) => (idx === holeIdx ? null : entry))
      );
    }, 650);
  };

  // ==========================================================================
  // MODE 3: HUNGRY MIAMI SHARK CATCHER STATE & FALLING ITEMS LOOP
  // ==========================================================================
  const [sharkRoundIdx, setSharkRoundIdx] = useState(0);
  const [sharkX, setSharkX] = useState(50);
  const [fallingItems, setFallingItems] = useState<
    {
      uid: string;
      x: number;
      y: number;
      emoji: string;
      word: string;
      isGood: boolean;
      feedback: string;
    }[]
  >([]);
  const [sharkMouthMsg, setSharkMouthMsg] = useState<string>('🦈 Move me to eat!');

  const currentSharkRound = SHARK_ROUNDS[sharkRoundIdx % SHARK_ROUNDS.length];

  // Spawn & drop items in Hungry Shark mode
  useEffect(() => {
    if (mode !== 'shark') return;
    const spawner = setInterval(() => {
      setFallingItems((prev) => {
        if (prev.length >= 4) return prev;
        const isGood = Math.random() > 0.38;
        const pool = isGood
          ? currentSharkRound.goodItems
          : currentSharkRound.badItems;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const lanes = [16, 38, 62, 84];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        return [
          ...prev,
          {
            uid: `${Date.now()}-${Math.random()}`,
            x: randomLane,
            y: 8,
            emoji: picked.emoji,
            word: picked.word,
            isGood,
            feedback: isGood
              ? (picked as any).spoken
              : (picked as any).funnyFail,
          },
        ];
      });
    }, 1300);

    const mover = setInterval(() => {
      setFallingItems((prev) =>
        prev
          .map((item) => ({ ...item, y: item.y + 4.5 }))
          .filter((item) => item.y < 92)
      );
    }, 120);

    return () => {
      clearInterval(spawner);
      clearInterval(mover);
    };
  }, [mode, currentSharkRound]);

  const handleEatFallingItem = (uid: string) => {
    const target = fallingItems.find((i) => i.uid === uid);
    if (!target) return;
    setSharkX(target.x);
    setFallingItems((prev) => prev.filter((i) => i.uid !== uid));

    if (target.isGood) {
      playChompSound();
      setSharkMouthMsg(`😋 YUM! "${target.word}"!`);
      awardPoints(30, true, target.feedback, target.feedback);
    } else {
      playErrorSound();
      setSharkMouthMsg(`🤢 YUCK! Spit it out!`);
      awardPoints(0, false, target.feedback);
    }
  };

  // ==========================================================================
  // MODE 4: MIAMI TURBO RACER STATE
  // ==========================================================================
  const [racerIdx, setRacerIdx] = useState(0);
  const [playerCarProgress, setPlayerCarProgress] = useState(18);
  const [rivalCarProgress, setRivalCarProgress] = useState(22);
  const [nitroActive, setNitroActive] = useState(false);
  const [bananaSpin, setBananaSpin] = useState(false);

  const currentRacer = RACER_CHALLENGES[racerIdx % RACER_CHALLENGES.length];

  const handleRacerPick = (opt: {
    text: string;
    isCorrect: boolean;
    funnyOutcome: string;
  }) => {
    if (opt.isCorrect) {
      playSuccessSound();
      setNitroActive(true);
      const nextProgress = Math.min(92, playerCarProgress + 24);
      setPlayerCarProgress(nextProgress);
      setRivalCarProgress((r) => Math.min(82, r + 8));
      awardPoints(45, true, opt.funnyOutcome, currentRacer.spokenAnswer);

      if (nextProgress >= 88) {
        playFanfareSound();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => {
          setPlayerCarProgress(18);
          setRivalCarProgress(20);
        }, 1800);
      }

      setTimeout(() => {
        setNitroActive(false);
        setRacerIdx((i) => i + 1);
      }, 1200);
    } else {
      playErrorSound();
      setBananaSpin(true);
      setRivalCarProgress((r) => Math.min(85, r + 14));
      awardPoints(0, false, opt.funnyOutcome);
      setTimeout(() => {
        setBananaSpin(false);
      }, 900);
    }
  };

  // ==========================================================================
  // MODE 5 & 6: WORD BLITZ & SENTENCE BUILDER
  // ==========================================================================
  const [blitzIdx, setBlitzIdx] = useState(0);
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  const currentBlitz = BLITZ_BANK[blitzIdx % BLITZ_BANK.length];
  const currentScramble = SCRAMBLE_BANK[scrambleIdx % SCRAMBLE_BANK.length];

  const handleScrambleTap = (idx: number) => {
    if (selectedWordIndices.includes(idx)) {
      setSelectedWordIndices(selectedWordIndices.filter((i) => i !== idx));
    } else {
      const next = [...selectedWordIndices, idx];
      setSelectedWordIndices(next);
      speakRealisticText(currentScramble.words[idx], { rate: 1.0 });

      if (next.length === currentScramble.words.length) {
        const built = next.map((i) => currentScramble.words[i]).join(' ');
        const ok =
          built.toLowerCase().trim() ===
          currentScramble.targetSentence.toLowerCase().trim();
        if (ok) {
          playSuccessSound();
          awardPoints(
            40,
            true,
            `Perfect sentence: "${currentScramble.targetSentence}"`,
            currentScramble.targetSentence
          );
          setTimeout(() => {
            setSelectedWordIndices([]);
            setShowHint(false);
            setScrambleIdx((i) => i + 1);
          }, 1300);
        } else {
          playErrorSound();
          awardPoints(
            0,
            false,
            `Almost! Try starting with: "${currentScramble.hint}"`
          );
        }
      }
    }
  };

  return (
    <section className="card-3d overflow-hidden border-2 border-indigo-500/80 dark:border-indigo-700 bg-white dark:bg-slate-900">
      {/* Top Arcade Header & Live Scoreboard */}
      <div className="p-5 sm:p-7 bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white border-b border-indigo-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_4px_0_0_#b45309] shrink-0">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  ★ 6 Playable English Action Games
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  Shoot UFOs, Whack Grammar Zombies, Feed the Shark & Race!
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight mt-1">
                Miami English Arcade & Firing Arena
              </h2>
            </div>
          </div>

          {/* Scoreboard Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-200 leading-none">
                  Score
                </div>
                <div className="text-sm font-black">{score} XP</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
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

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-200 leading-none">
                  High Score
                </div>
                <div className="text-sm font-black">{highScore} XP</div>
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-1">
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
              onClick={() => {
                setScore(0);
                setCombo(0);
                setHearts(3);
                setBannerMsg(null);
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white cursor-pointer"
              title="Reset Score"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 6 Game Mode Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5">
          {[
            {
              id: 'laser',
              label: '🚀 Laser Shooter',
              sub: 'Firing Action Game',
              icon: Rocket,
            },
            {
              id: 'zombie',
              label: '🧟 Zombie Whack!',
              sub: 'Bonk Bad Grammar',
              icon: Hammer,
            },
            {
              id: 'shark',
              label: '🦈 Hungry Shark',
              sub: 'Funny Word Catcher',
              icon: Utensils,
            },
            {
              id: 'racer',
              label: '🏎️ Turbo Racer',
              sub: 'Nitro Idiom Race',
              icon: Car,
            },
            {
              id: 'blitz',
              label: '⚡ Word Blitz',
              sub: 'Speed Meanings',
              icon: Timer,
            },
            {
              id: 'scramble',
              label: '🧩 Sentence Pro',
              sub: 'Word Order Puzzle',
              icon: Puzzle,
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
                  setBannerMsg(null);
                }}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 border-2 ${
                  active
                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_4px_0_0_#b45309] -translate-y-0.5'
                    : 'bg-slate-900/80 text-white border-white/15 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black truncate">
                    {tab.label}
                  </span>
                  <Icon className="w-4 h-4 shrink-0 opacity-80" />
                </div>
                <div
                  className={`text-[10px] font-bold truncate ${
                    active ? 'text-slate-800' : 'text-blue-200'
                  }`}
                >
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Playable Stage */}
      <div className="p-5 sm:p-8 space-y-5">
        {/* Live Feedback Banner */}
        {bannerMsg && (
          <div
            className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
              bannerMsg.ok
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/70 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold">
              {bannerMsg.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>{bannerMsg.text}</span>
            </div>
            {bannerMsg.spoken && (
              <button
                type="button"
                onClick={() =>
                  speakRealisticText(bannerMsg.spoken || '', { rate: 0.92 })
                }
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Hear Audio</span>
              </button>
            )}
          </div>
        )}

        {/* ===============================================================
            GAME 1: 🚀 SPACE LASER WORD SHOOTER (PLAYABLE FIRING GAME)
           =============================================================== */}
        {mode === 'laser' && (
          <div className="space-y-4">
            {/* Mission Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-cyan-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Crosshair className="w-6 h-6 text-cyan-400 animate-spin" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                    Space Laser Firing Mission #{laserMissionIdx + 1} • Click any UFO or press SPACEBAR to FIRE!
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-amber-300">
                    {currentLaserMission.prompt}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLaserPaused(!laserPaused)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {laserPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{laserPaused ? 'Resume UFOs' : 'Pause UFOs'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUfoY(14);
                    setLaserMissionIdx((i) => i + 1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-black cursor-pointer"
                >
                  Next Wave →
                </button>
              </div>
            </div>

            {/* Interactive Starfield Firing Canvas */}
            <div
              ref={laserArenaRef}
              onMouseMove={(e) => {
                if (!laserArenaRef.current) return;
                const rect = laserArenaRef.current.getBoundingClientRect();
                const relX = ((e.clientX - rect.left) / rect.width) * 100;
                setShipX(Math.min(88, Math.max(12, relX)));
              }}
              className="relative h-[360px] sm:h-[400px] w-full rounded-3xl bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 border-2 border-indigo-700 overflow-hidden select-none shadow-inner"
            >
              {/* Decorative Stars */}
              <div className="absolute inset-0 opacity-35 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

              {/* 4 Descending Enemy Word UFOs */}
              {currentLaserMission.targets.map((target, idx) => {
                const leftPct = ufoPositions[idx];
                const isExploded = explodedIdx === idx;
                return (
                  <button
                    key={`${laserMissionIdx}-${idx}`}
                    type="button"
                    onClick={() => fireLaserAtTarget(idx)}
                    style={{
                      left: `${leftPct}%`,
                      top: `${ufoY}%`,
                    }}
                    className={`absolute -translate-x-1/2 transition-all duration-150 cursor-crosshair group ${
                      isExploded ? 'scale-150 opacity-0' : 'hover:scale-110'
                    }`}
                  >
                    {isExploded ? (
                      <div className="text-4xl animate-ping">💥</div>
                    ) : (
                      <div className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-purple-600 to-indigo-900 border-2 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.45)] flex flex-col items-center gap-0.5 min-w-[110px] sm:min-w-[140px]">
                        <span className="text-lg leading-none">🛸</span>
                        <span className="font-black text-xs sm:text-base tracking-tight">
                          {target.word}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan-300 group-hover:text-amber-300">
                          🎯 Click to Shoot!
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Active Laser Beam Bolt */}
              {laserBeam && (
                <div
                  style={{
                    left: `${laserBeam.x}%`,
                    top: `${ufoY + 6}%`,
                    bottom: '64px',
                  }}
                  className={`absolute -translate-x-1/2 w-2 rounded-full animate-pulse ${
                    laserBeam.hitOk
                      ? 'bg-gradient-to-t from-amber-300 via-emerald-400 to-cyan-300 shadow-[0_0_25px_#34d399]'
                      : 'bg-gradient-to-t from-rose-500 to-amber-500 shadow-[0_0_20px_#f43f5e]'
                  }`}
                />
              )}

              {/* Player Spaceship Cannon at Bottom */}
              <div
                style={{ left: `${shipX}%` }}
                className="absolute bottom-3 -translate-x-1/2 transition-all duration-75 flex flex-col items-center pointer-events-none"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-t from-blue-700 via-cyan-500 to-emerald-400 border-2 border-white flex items-center justify-center text-2xl shadow-[0_0_25px_rgba(56,189,248,0.8)]">
                  🚀
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 mt-1">
                  TICI Laser Ship
                </span>
              </div>
            </div>

            {/* Quick Fire Buttons for Mobile / Instant Shooting */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {currentLaserMission.targets.map((target, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fireLaserAtTarget(idx)}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-indigo-950 text-white border-2 border-cyan-500/50 hover:border-amber-400 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm active:translate-y-0.5 transition-all"
                >
                  <span>⚡ FIRE:</span>
                  <span className="text-amber-300">{target.word}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 2: 🧟 ZOMBIE GRAMMAR WHACK! (FUNNY WHACK-A-ZOMBIE GAME)
           =============================================================== */}
        {mode === 'zombie' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 text-white border-2 border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  🥊 Funny Reflex Game • Zombies Whacked: {zombieScoreCount}
                </span>
                <h3 className="text-base sm:text-xl font-black mt-0.5">
                  WHACK the Zombies holding BAD Grammar! (Don&apos;t punch the Professor! 🧑‍🏫)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const shuffled = [...ZOMBIE_POP_BANK].sort(
                    () => Math.random() - 0.5
                  );
                  setActiveHoles([
                    shuffled[0],
                    shuffled[1],
                    null,
                    shuffled[2],
                    null,
                    shuffled[3],
                  ]);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black cursor-pointer shrink-0"
              >
                🧟 Spawn New Zombies!
              </button>
            </div>

            {/* 6 Whack-a-Zombie Graveyard Holes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeHoles.map((item, holeIdx) => {
                const isWhacked = whackedHoleIdx === holeIdx;
                return (
                  <div
                    key={holeIdx}
                    className="h-44 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-700 p-4 flex flex-col items-center justify-end relative overflow-hidden shadow-inner"
                  >
                    <span className="absolute top-3 left-3.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Hole #{holeIdx + 1}
                    </span>

                    {item ? (
                      <button
                        type="button"
                        onClick={() => handleWhackHole(holeIdx)}
                        className={`w-full p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isWhacked
                            ? 'scale-75 rotate-12 bg-rose-600 text-white border-white'
                            : item.isZombieBadGrammar
                              ? 'bg-gradient-to-b from-emerald-600 to-teal-900 border-emerald-300 text-white hover:-translate-y-1 shadow-[0_6px_0_0_#064e3b]'
                              : 'bg-gradient-to-b from-blue-600 to-indigo-900 border-blue-300 text-white hover:-translate-y-1 shadow-[0_6px_0_0_#1e3a8a]'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-black leading-snug">
                          {isWhacked ? '💥 BONK!!' : item.displayText}
                        </div>
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 mt-1.5">
                          {item.isZombieBadGrammar
                            ? '🥊 Tap to WHACK Bad Grammar!'
                            : '🧑‍🏫 Careful! Check Grammar!'}
                        </div>
                      </button>
                    ) : (
                      <div className="w-full py-6 text-center text-xs font-bold text-slate-600">
                        🕳️ Waiting for Zombie...
                      </div>
                    )}

                    {/* Hole Rim */}
                    <div className="w-4/5 h-3 rounded-full bg-slate-950 border border-slate-700 mt-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 3: 🦈 HUNGRY MIAMI SHARK (FUNNY WORD & FOOD CATCHER)
           =============================================================== */}
        {mode === 'shark' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-900 text-white border-2 border-cyan-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                  🍔 Chef Shark&apos;s Funny Beach Restaurant • Tap falling food to CHOMP!
                </span>
                <h3 className="text-sm sm:text-lg font-black text-amber-300 mt-0.5">
                  {currentSharkRound.orderTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFallingItems([]);
                  setSharkRoundIdx((i) => i + 1);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shrink-0"
              >
                Next Chef Order →
              </button>
            </div>

            {/* Ocean Catcher Stage */}
            <div className="relative h-[340px] sm:h-[380px] w-full rounded-3xl bg-gradient-to-b from-sky-900 via-blue-950 to-slate-950 border-2 border-cyan-600 overflow-hidden select-none">
              {/* Falling Food & Boots */}
              {fallingItems.map((item) => (
                <button
                  key={item.uid}
                  type="button"
                  onClick={() => handleEatFallingItem(item.uid)}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  className="absolute -translate-x-1/2 px-3.5 py-2 rounded-2xl bg-white/95 text-slate-900 border-2 border-amber-400 shadow-lg hover:scale-110 transition-transform cursor-pointer flex items-center gap-2"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-black text-xs sm:text-sm">
                    {item.word}
                  </span>
                </button>
              ))}

              {/* Hungry Shark at Bottom */}
              <div
                style={{ left: `${sharkX}%` }}
                className="absolute bottom-3 -translate-x-1/2 transition-all duration-150 flex flex-col items-center pointer-events-none"
              >
                <div className="px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md mb-1 whitespace-nowrap">
                  {sharkMouthMsg}
                </div>
                <div className="text-5xl drop-shadow-lg">🦈</div>
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 4: 🏎️ MIAMI TURBO RACER (FUNNY NITRO CAR RACE)
           =============================================================== */}
        {mode === 'racer' && (
          <div className="space-y-5">
            {/* Animated 2-Lane Miami Highway */}
            <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-700 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-black text-amber-300">
                <span>🏎️ MIAMI BEACH TURBO DRAGWAY</span>
                <span>🏁 FINISH LINE (100m)</span>
              </div>

              {/* Lane 1: Player Supercar */}
              <div className="relative h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center px-3">
                <div
                  style={{ left: `${playerCarProgress}%` }}
                  className={`absolute transition-all duration-500 flex items-center gap-1 ${
                    bananaSpin ? 'animate-spin' : ''
                  }`}
                >
                  {nitroActive && <span className="text-xl animate-pulse">🔥🔥</span>}
                  <span className="text-3xl">🏎️</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                    YOU
                  </span>
                </div>
                <div className="ml-auto text-xl">🏁</div>
              </div>

              {/* Lane 2: Officer Bob Rival Car */}
              <div className="relative h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center px-3">
                <div
                  style={{ left: `${rivalCarProgress}%` }}
                  className="absolute transition-all duration-500 flex items-center gap-1"
                >
                  <span className="text-3xl">🚓</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-black text-[10px]">
                    RIVAL
                  </span>
                </div>
                <div className="ml-auto text-xl">🏁</div>
              </div>
            </div>

            {/* Dialogue / Idiom Prompt for Nitro */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentRacer.situation}
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {currentRacer.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRacerPick(opt)}
                    className="p-4 rounded-2xl text-left font-extrabold text-xs sm:text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 5: ⚡ WORD BLITZ (SPEED MEANING MATCH)
           =============================================================== */}
        {mode === 'blitz' && (
          <div className="space-y-5">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {currentBlitz.word}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {currentBlitz.phonetic}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic mt-1">
                  &ldquo;{currentBlitz.sentence}&rdquo;
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  speakRealisticText(
                    `${currentBlitz.word}. ${currentBlitz.sentence}`,
                    { rate: 0.92 }
                  )
                }
                className="btn-3d-primary px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Word</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentBlitz.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (opt.isCorrect) {
                      playSuccessSound();
                      awardPoints(
                        25,
                        true,
                        currentBlitz.explanation,
                        `${currentBlitz.word}. ${currentBlitz.sentence}`
                      );
                      setTimeout(() => setBlitzIdx((i) => i + 1), 900);
                    } else {
                      playErrorSound();
                      awardPoints(0, false, currentBlitz.explanation);
                    }
                  }}
                  className="p-4 rounded-2xl text-left font-extrabold text-xs sm:text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] cursor-pointer"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 6: 🧩 SENTENCE BUILDER PRO
           =============================================================== */}
        {mode === 'scramble' && (
          <div className="space-y-5">
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {currentScramble.topic}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                  Build: {currentScramble.clue}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    speakRealisticText(currentScramble.targetSentence, {
                      rate: 0.85,
                    })
                  }
                  className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="btn-3d-secondary px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Hint</span>
                </button>
              </div>
            </div>

            {showHint && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 text-xs font-bold text-amber-900 dark:text-amber-200">
                💡 {currentScramble.hint}
              </div>
            )}

            <div className="min-h-[70px] p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-blue-400 flex flex-wrap items-center gap-2">
              {selectedWordIndices.length === 0 ? (
                <span className="text-xs font-bold text-slate-400">
                  Tap words below in order...
                </span>
              ) : (
                selectedWordIndices.map((wIdx, pos) => (
                  <button
                    key={`${wIdx}-${pos}`}
                    type="button"
                    onClick={() => handleScrambleTap(wIdx)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-black text-xs sm:text-sm cursor-pointer"
                  >
                    {currentScramble.words[wIdx]}
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {currentScramble.words.map((w, idx) => {
                const used = selectedWordIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={used}
                    onClick={() => handleScrambleTap(idx)}
                    className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm border-2 ${
                      used
                        ? 'opacity-30 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
