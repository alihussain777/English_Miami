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
  Crosshair,
  Hammer,
  Car,
  Utensils,
  Scissors,
  Swords,
  Anchor,
  Sparkles,
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
  | 'sniper'
  | 'bomb'
  | 'fighter'
  | 'pirate'
  | 'ninja'
  | 'zombie'
  | 'shark'
  | 'racer';

// ============================================================================
// 1. 🎯 SNIPER SCOPE: MOVING TARGET SHOOTER (REAL AIM & RELOAD FIRING GAME)
// ============================================================================
interface SniperWave {
  mission: string;
  targets: { word: string; isCorrect: boolean; row: number; speed: number }[];
  spokenSuccess: string;
  explanation: string;
}

const SNIPER_WAVES: SniperWave[] = [
  {
    mission: '🎯 SNIPE THE CORRECT SPELLING! (Watch out — targets are moving!)',
    targets: [
      { word: 'Definately', isCorrect: false, row: 0, speed: 1.2 },
      { word: 'Definitely', isCorrect: true, row: 1, speed: -1.4 },
      { word: 'Definitly', isCorrect: false, row: 2, speed: 1.1 },
      { word: 'Definetely', isCorrect: false, row: 0, speed: -1.0 },
    ],
    spokenSuccess: 'Bullseye! Definitely! D-E-F-I-N-I-T-E-L-Y.',
    explanation: '"Definitely" has "finite" in the middle — two I’s and zero A’s!',
  },
  {
    mission: '🎯 SNIPE THE IRREGULAR PAST TENSE OF "CATCH"!',
    targets: [
      { word: 'Catched', isCorrect: false, row: 0, speed: 1.3 },
      { word: 'Caught', isCorrect: true, row: 1, speed: -1.5 },
      { word: 'Cotched', isCorrect: false, row: 2, speed: 1.2 },
      { word: 'Catching', isCorrect: false, row: 2, speed: -1.1 },
    ],
    spokenSuccess: 'Sniper Hit! Caught! He caught the ball with one hand.',
    explanation: 'The past tense of "catch" is "caught" (/kɔːt/), never "catched"!',
  },
  {
    mission: '🎯 SNIPE THE WORD THAT MEANS "VERY BRAVE & FEARLESS"!',
    targets: [
      { word: 'Cowardly', isCorrect: false, row: 0, speed: -1.2 },
      { word: 'Courageous', isCorrect: true, row: 1, speed: 1.5 },
      { word: 'Hesitant', isCorrect: false, row: 2, speed: -1.3 },
      { word: 'Clumsy', isCorrect: false, row: 0, speed: 1.0 },
    ],
    spokenSuccess: 'Headshot! Courageous! Firefighters are very courageous.',
    explanation: '"Courageous" means brave and fearless in difficult situations.',
  },
  {
    mission: '🎯 SNIPE THE WORD THAT FITS: "I look forward to ___ you!"',
    targets: [
      { word: 'meet', isCorrect: false, row: 0, speed: 1.4 },
      { word: 'meeting', isCorrect: true, row: 1, speed: -1.3 },
      { word: 'met', isCorrect: false, row: 2, speed: 1.2 },
      { word: 'meets', isCorrect: false, row: 1, speed: 1.0 },
    ],
    spokenSuccess: 'Bullseye! I look forward to meeting you!',
    explanation: 'In "look forward to", "to" is a preposition — so always use the -ING form ("meeting")!',
  },
  {
    mission: '🎯 SNIPE THE OPPOSITE OF "ARTIFICIAL"!',
    targets: [
      { word: 'Plastic', isCorrect: false, row: 0, speed: -1.3 },
      { word: 'Genuine', isCorrect: true, row: 1, speed: 1.4 },
      { word: 'Synthetic', isCorrect: false, row: 2, speed: -1.1 },
      { word: 'Fake', isCorrect: false, row: 2, speed: 1.2 },
    ],
    spokenSuccess: 'Direct Hit! Genuine means real, authentic, and not fake.',
    explanation: '"Genuine" (/ˈdʒen.ju.ɪn/) is the opposite of fake or artificial.',
  },
];

// ============================================================================
// 2. 💣 TICK-TOCK BOMB DEFUSAL SQUAD (CUT THE RIGHT WIRE BEFORE KA-BOOM!)
// ============================================================================
interface BombMission {
  chiefPanicQuote: string;
  sentencePuzzle: string;
  wires: {
    color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
    bgClass: string;
    borderClass: string;
    label: string;
    isCorrect: boolean;
  }[];
  spokenDefused: string;
  boomFunnyMsg: string;
  grammarRule: string;
}

const BOMB_MISSIONS: BombMission[] = [
  {
    chiefPanicQuote: '😰 CHIEF: "AGENT! THE TIMER IS TICKING! Cut the wire that fixes this unreal wish!"',
    sentencePuzzle: '"If I _____ a billionaire, I would buy an island in Miami!"',
    wires: [
      { color: 'RED', bgClass: 'bg-rose-600', borderClass: 'border-rose-300', label: '🔴 RED WIRE: "am"', isCorrect: false },
      { color: 'BLUE', bgClass: 'bg-blue-600', borderClass: 'border-blue-300', label: '🔵 BLUE WIRE: "were"', isCorrect: true },
      { color: 'GREEN', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-300', label: '🟢 GREEN WIRE: "will be"', isCorrect: false },
      { color: 'YELLOW', bgClass: 'bg-amber-500', borderClass: 'border-amber-200', label: '🟡 YELLOW WIRE: "been"', isCorrect: false },
    ],
    spokenDefused: 'Phew! Bomb defused! If I were a billionaire, I would buy an island.',
    boomFunnyMsg: '💥 KA-BOOOOM!! Your eyebrows are covered in soot! 😂 For imaginary wishes, cut the "If I WERE" wire!',
    grammarRule: 'In Second Conditional (imaginary present), use "If I WERE" for all subjects!',
  },
  {
    chiefPanicQuote: '😰 CHIEF: "DON’T SWEAT ON THE DYNAMITE! Which wire is the correct question tag?"',
    sentencePuzzle: '"You speak English fluently, _________?"',
    wires: [
      { color: 'RED', bgClass: 'bg-rose-600', borderClass: 'border-rose-300', label: '🔴 RED WIRE: "isn’t it?"', isCorrect: false },
      { color: 'BLUE', bgClass: 'bg-blue-600', borderClass: 'border-blue-300', label: '🔵 BLUE WIRE: "aren’t you?"', isCorrect: false },
      { color: 'GREEN', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-300', label: '🟢 GREEN WIRE: "don’t you?"', isCorrect: true },
      { color: 'YELLOW', bgClass: 'bg-amber-500', borderClass: 'border-amber-200', label: '🟡 YELLOW WIRE: "no?"', isCorrect: false },
    ],
    spokenDefused: 'Bomb defused with 1 second left! You speak English fluently, don’t you?',
    boomFunnyMsg: '💥 BOOM!! Never say "isn’t it?" for everything! 😂 Since the verb is "speak", the tag is "don’t you?"!',
    grammarRule: 'Present simple positive verbs ("You speak...") take the negative auxiliary tag ("...don’t you?").',
  },
  {
    chiefPanicQuote: '😰 CHIEF: "MY HANDS ARE SHAKING! Cut the wire with the right preposition!"',
    sentencePuzzle: '"This luxury car belongs _____ the founder of the company."',
    wires: [
      { color: 'RED', bgClass: 'bg-rose-600', borderClass: 'border-rose-300', label: '🔴 RED WIRE: "to"', isCorrect: true },
      { color: 'BLUE', bgClass: 'bg-blue-600', borderClass: 'border-blue-300', label: '🔵 BLUE WIRE: "for"', isCorrect: false },
      { color: 'GREEN', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-300', label: '🟢 GREEN WIRE: "with"', isCorrect: false },
      { color: 'YELLOW', bgClass: 'bg-amber-500', borderClass: 'border-amber-200', label: '🟡 YELLOW WIRE: "at"', isCorrect: false },
    ],
    spokenDefused: 'Snip! Bomb deactivated! This luxury car belongs to the founder.',
    boomFunnyMsg: '💥 KABOOM!! Now our hair is standing up like Einstein! ⚡ Always say "belongs TO"!',
    grammarRule: 'The verb "belong" always pairs with the preposition "to" (belongs to someone).',
  },
  {
    chiefPanicQuote: '😰 CHIEF: "FINAL BOMB! Cut the wire that means \'Postpone / Delay a meeting\'!"',
    sentencePuzzle: '"Let’s _____ the meeting until tomorrow morning."',
    wires: [
      { color: 'RED', bgClass: 'bg-rose-600', borderClass: 'border-rose-300', label: '🔴 RED WIRE: "put out"', isCorrect: false },
      { color: 'BLUE', bgClass: 'bg-blue-600', borderClass: 'border-blue-300', label: '🔵 BLUE WIRE: "put off"', isCorrect: true },
      { color: 'GREEN', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-300', label: '🟢 GREEN WIRE: "put on"', isCorrect: false },
      { color: 'YELLOW', bgClass: 'bg-amber-500', borderClass: 'border-amber-200', label: '🟡 YELLOW WIRE: "put up"', isCorrect: false },
    ],
    spokenDefused: 'Defused! Let us put off the meeting until tomorrow morning.',
    boomFunnyMsg: '💥 BOOM!! "Put out" means extinguish a fire! 🔥 "Put OFF" means postpone!',
    grammarRule: '"Put off" = postpone/delay. "Put out" = extinguish a fire. "Put on" = wear clothes.',
  },
];

// ============================================================================
// 3. 🥊 STREET FIGHTER: BOSS KNOCKOUT! (1v1 BOXING FIGHT WITH HP BARS)
// ============================================================================
interface FighterRound {
  bossName: string;
  bossEmoji: string;
  bossTaunt: string;
  brokenAttack: string;
  moves: {
    moveName: string;
    correction: string;
    isCorrect: boolean;
    hitReaction: string;
  }[];
  spokenCorrection: string;
}

const FIGHTER_ROUNDS: FighterRound[] = [
  {
    bossName: 'Count Broken-Grammar',
    bossEmoji: '🧛‍♂️',
    bossTaunt: '"Bleh! I will drain your XP with my terrible preposition attack!"',
    brokenAttack: '⚡ BOSS ATTACK: "She is married WITH a famous doctor!"',
    moves: [
      {
        moveName: '🥊 Dragon Uppercut',
        correction: '"She is married TO a famous doctor!"',
        isCorrect: true,
        hitReaction: '🦷 POW! Knocked out Count Dracula’s plastic fang! Always say "married TO"!',
      },
      {
        moveName: '🦶 Spinning Kick',
        correction: '"She is married BY a famous doctor!"',
        isCorrect: false,
        hitReaction: '🛡️ Blocked! Never say "married by" — try "married TO"!',
      },
      {
        moveName: '💥 Slap Chop',
        correction: '"She is married FOR a famous doctor!"',
        isCorrect: false,
        hitReaction: '🛡️ Missed! The Boss laughed at you! Use "married TO"!',
      },
    ],
    spokenCorrection: 'She is married to a famous doctor.',
  },
  {
    bossName: 'Robo-Typo 3000',
    bossEmoji: '🤖',
    bossTaunt: '"BEEP BOOP! MY CIRCUITS LOVE DOUBLE NEGATIVES! DODGE THIS!"',
    brokenAttack: '⚡ BOSS ATTACK: "I don’t know NOTHING about this phone!"',
    moves: [
      {
        moveName: '🥊 Lightning Hook',
        correction: '"I don’t know ANYTHING about this phone!"',
        isCorrect: true,
        hitReaction: '🔩 SMASH! Robo-Typo’s antenna flew off! Standard English avoids double negatives!',
      },
      {
        moveName: '🦶 Low Sweep',
        correction: '"I not know nothing about this phone!"',
        isCorrect: false,
        hitReaction: '⚡ ZAPPED! That’s still broken grammar!',
      },
      {
        moveName: '💥 Headbutt',
        correction: '"I doesn’t know anything about this phone!"',
        isCorrect: false,
        hitReaction: '⚡ CLANG! With "I", use "don’t", never "doesn’t"!',
      },
    ],
    spokenCorrection: 'I don’t know anything about this phone.',
  },
  {
    bossName: 'Rex the Slang-o-Saurus',
    bossEmoji: '🦖',
    bossTaunt: '"ROOOAR! I eat irregular verbs for breakfast!"',
    brokenAttack: '⚡ BOSS ATTACK: "Yesterday I BUYED a big juicy steak!"',
    moves: [
      {
        moveName: '🥊 Meteor Punch',
        correction: '"Yesterday I BOUGHT a big juicy steak!"',
        isCorrect: true,
        hitReaction: '🦖 K.O. COMBO! Rex spun around 3 times! Past of "buy" is "BOUGHT"!',
      },
      {
        moveName: '🦶 Tail Grab',
        correction: '"Yesterday I BROUGHT a big juicy steak!"',
        isCorrect: false,
        hitReaction: '🦖 Careful! "Brought" is past of "bring" — past of "buy" is "BOUGHT"!',
      },
      {
        moveName: '💥 Dino Poke',
        correction: '"Yesterday I BUYING a big juicy steak!"',
        isCorrect: false,
        hitReaction: '🦖 ROAR! "Yesterday" needs Past Simple ("bought")!',
      },
    ],
    spokenCorrection: 'Yesterday I bought a big juicy steak.',
  },
];

// ============================================================================
// 4. 🏴‍☠️ PIRATE CANNON BATTLE! (AIM & SINK THE RIGHT PIRATE SHIP!)
// ============================================================================
interface PirateBattle {
  captainOrder: string;
  ships: { name: string; word: string; isCorrect: boolean; distance: string }[];
  spokenVictory: string;
  explanation: string;
}

const PIRATE_BATTLES: PirateBattle[] = [
  {
    captainOrder: '🏴‍☠️ CAPTAIN: "AHOY MATEY! Fire the cannon at the ship carrying a SILENT \'K\' WORD!"',
    ships: [
      { name: 'Ship #1 (Near)', word: 'Kitchen', isCorrect: false, distance: '100m' },
      { name: 'Ship #2 (Mid)', word: 'Knowledge', isCorrect: true, distance: '220m' },
      { name: 'Ship #3 (Far)', word: 'Kangaroo', isCorrect: false, distance: '350m' },
    ],
    spokenVictory: 'Direct cannon hit! Knowledge starts with a silent K!',
    explanation: 'In "Knowledge", "Knife", "Knock", and "Knee", the letter K is 100% silent!',
  },
  {
    captainOrder: '🏴‍☠️ CAPTAIN: "FIRE AT THE SHIP THAT MEANS \'EXTREMELY ANGRY\'!"',
    ships: [
      { name: 'Ship #1 (Near)', word: 'Delighted', isCorrect: false, distance: '100m' },
      { name: 'Ship #2 (Mid)', word: 'Furious', isCorrect: true, distance: '220m' },
      { name: 'Ship #3 (Far)', word: 'Peaceful', isCorrect: false, distance: '350m' },
    ],
    spokenVictory: 'Boom! Sunk their galleon! Furious means extremely angry!',
    explanation: '"Furious" (/ˈfjʊə.ri.əs/) is a strong adjective meaning very angry.',
  },
  {
    captainOrder: '🏴‍☠️ CAPTAIN: "BLAST THE SHIP WITH THE PLURAL OF \'CHILD\'!"',
    ships: [
      { name: 'Ship #1 (Near)', word: 'Childs', isCorrect: false, distance: '100m' },
      { name: 'Ship #2 (Mid)', word: 'Childrens', isCorrect: false, distance: '220m' },
      { name: 'Ship #3 (Far)', word: 'Children', isCorrect: true, distance: '350m' },
    ],
    spokenVictory: 'Arrr! Direct hit! The plural of child is children, never childrens!',
    explanation: '"Children" is already plural — never add an "s" to make "childrens"!',
  },
];

// ============================================================================
// 5. 🥷 WORD NINJA SLASH! (FRUIT-NINJA STYLE FLYING WORD SLICER)
// ============================================================================
interface NinjaItem {
  id: string;
  word: string;
  emoji: string;
  isRealCorrectEnglish: boolean;
  meaningOrFix: string;
}

const NINJA_POOL: NinjaItem[] = [
  { id: 'n1', word: ' magnificent ', emoji: '🍉', isRealCorrectEnglish: true, meaningOrFix: 'Magnificent = Extremely beautiful and impressive!' },
  { id: 'n2', word: 'opportunity', emoji: '🍍', isRealCorrectEnglish: true, meaningOrFix: 'Opportunity = A great chance to do something!' },
  { id: 'n3', word: 'enthusiasm', emoji: '🥭', isRealCorrectEnglish: true, meaningOrFix: 'Enthusiasm = Intense excitement and interest!' },
  { id: 'n4', word: 'comfortable', emoji: '🍓', isRealCorrectEnglish: true, meaningOrFix: 'Comfortable = Relaxed and free from stress!' },
  { id: 'b1', word: '💣 UNPOSSIBLE', emoji: '🧨', isRealCorrectEnglish: false, meaningOrFix: '💥 BOOM! "Unpossible" is fake — the real word is IMPOSSIBLE!' },
  { id: 'b2', word: '💣 WRITED', emoji: '🧨', isRealCorrectEnglish: false, meaningOrFix: '💥 BOOM! Don’t slash "Writed" — the real word is WROTE!' },
  { id: 'b3', word: '💣 EXPENSIVER', emoji: '🧨', isRealCorrectEnglish: false, meaningOrFix: '💥 BOOM! Never say "Expensiver" — say MORE EXPENSIVE!' },
];

// ============================================================================
// 6. 🧟 ZOMBIE GRAMMAR WHACK, 7. 🦈 HUNGRY SHARK, 8. 🏎️ TURBO RACER
// ============================================================================
const ZOMBIE_POP_BANK = [
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
    id: 'p1',
    isZombieBadGrammar: false,
    displayText: '🧑‍🏫 "She has lived here for 3 years."',
    fixedSentence: 'She has lived here for 3 years.',
    funnyReaction: '👓 OUCH! Don’t punch the Professor! That sentence was 100% CORRECT!',
  },
];

const SHARK_ROUNDS = [
  {
    orderTitle: '🦈 Feed Chef Shark ONLY "POSITIVE ADJECTIVES"! (Dodge the stinky boots!)',
    goodItems: [
      { emoji: '🍔', word: 'Brilliant', spoken: 'Yum! Brilliant means very clever or wonderful!' },
      { emoji: '🍕', word: 'Generous', spoken: 'Delicious! Generous means happy to share!' },
      { emoji: '🌮', word: 'Confident', spoken: 'Tasty! Confident means sure of yourself!' },
    ],
    badItems: [
      { emoji: '🥾', word: 'He Goed (Boot!)', funnyFail: '🤢 YUCK! You fed the shark an old boot with bad grammar!' },
      { emoji: '🧦', word: 'More Better (Sock!)', funnyFail: '🤢 BLEGH! Wet sock! Say "Much better"!' },
    ],
  },
];

const RACER_CHALLENGES = [
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
        funnyOutcome: '🏎️💨 SUPER NITRO! "Break a leg" means "Good luck!"',
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
];

interface Props {
  onXpEarned?: (xp: number) => void;
}

export default function EnglishLearningGameArena({ onXpEarned }: Props) {
  const [mode, setMode] = useState<GameMode>('sniper');

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
  // GAME 1: 🎯 SNIPER SCOPE (MOVING TARGETS + AMMO + RECOIL + CROSSHAIR)
  // ==========================================================================
  const [sniperWaveIdx, setSniperWaveIdx] = useState(0);
  const [scopePos, setScopePos] = useState({ x: 50, y: 50 });
  const [targetOffsets, setTargetOffsets] = useState<number[]>([15, 70, 35, 60]);
  const [ammo, setAmmo] = useState(6);
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [shatteredIdx, setShatteredIdx] = useState<number | null>(null);
  const sniperBoxRef = useRef<HTMLDivElement | null>(null);

  const currentSniperWave = SNIPER_WAVES[sniperWaveIdx % SNIPER_WAVES.length];

  // Move sniper targets horizontally across the shooting gallery
  useEffect(() => {
    if (mode !== 'sniper') return;
    const interval = setInterval(() => {
      setTargetOffsets((prev) =>
        prev.map((x, idx) => {
          const spd = currentSniperWave.targets[idx]?.speed || 1.2;
          let next = x + spd * 1.8;
          if (next > 86) next = 14;
          if (next < 14) next = 86;
          return next;
        })
      );
    }, 85);
    return () => clearInterval(interval);
  }, [mode, currentSniperWave]);

  const handleSniperShot = (idx: number) => {
    if (ammo <= 0) {
      playErrorSound();
      setBannerMsg({
        ok: false,
        text: '🔫 CLICK! Out of ammo! Hit the "RELOAD (6/6)" button!',
      });
      return;
    }

    setAmmo((a) => a - 1);
    setMuzzleFlash(true);
    playLaserSound();
    setTimeout(() => setMuzzleFlash(false), 150);

    const tgt = currentSniperWave.targets[idx];
    if (tgt?.isCorrect) {
      playExplosionSound();
      setShatteredIdx(idx);
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.55 } });
      awardPoints(
        50,
        true,
        `🎯 BULLSEYE! ${currentSniperWave.explanation}`,
        currentSniperWave.spokenSuccess
      );
      setTimeout(() => {
        setShatteredIdx(null);
        setAmmo(6);
        setSniperWaveIdx((w) => w + 1);
      }, 1100);
    } else {
      playErrorSound();
      awardPoints(
        0,
        false,
        `🦆 Missed! "${tgt?.word}" was a decoy! Read the mission carefully!`
      );
    }
  };

  // ==========================================================================
  // GAME 2: 💣 TICK-TOCK BOMB DEFUSAL SQUAD
  // ==========================================================================
  const [bombIdx, setBombIdx] = useState(0);
  const [bombTimer, setBombTimer] = useState(15);
  const [bombState, setBombState] = useState<'ticking' | 'defused' | 'exploded'>('ticking');
  const currentBomb = BOMB_MISSIONS[bombIdx % BOMB_MISSIONS.length];

  useEffect(() => {
    if (mode !== 'bomb' || bombState !== 'ticking') return;
    if (bombTimer <= 0) {
      setBombState('exploded');
      playExplosionSound();
      awardPoints(0, false, currentBomb.boomFunnyMsg);
      return;
    }
    const t = setInterval(() => {
      setBombTimer((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [mode, bombState, bombTimer, currentBomb, awardPoints]);

  const handleCutWire = (wire: BombMission['wires'][0]) => {
    if (bombState !== 'ticking') return;
    if (wire.isCorrect) {
      playFanfareSound();
      setBombState('defused');
      confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });
      awardPoints(
        60,
        true,
        `😮‍💨 WIRE SNIPPED! BOMB DEFUSED! ${currentBomb.grammarRule}`,
        currentBomb.spokenDefused
      );
    } else {
      playExplosionSound();
      setBombState('exploded');
      awardPoints(0, false, currentBomb.boomFunnyMsg);
    }
  };

  const nextBombMission = () => {
    setBombState('ticking');
    setBombTimer(15);
    setBombIdx((i) => i + 1);
    setBannerMsg(null);
  };

  // ==========================================================================
  // GAME 3: 🥊 STREET FIGHTER: BOSS KNOCKOUT!
  // ==========================================================================
  const [fighterIdx, setFighterIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHitAnim, setBossHitAnim] = useState(false);
  const currentFighter = FIGHTER_ROUNDS[fighterIdx % FIGHTER_ROUNDS.length];

  const handleThrowPunch = (move: FighterRound['moves'][0]) => {
    if (move.isCorrect) {
      playBonkSound();
      setBossHitAnim(true);
      const nextBossHp = Math.max(0, bossHp - 35);
      setBossHp(nextBossHp);
      awardPoints(50, true, move.hitReaction, currentFighter.spokenCorrection);

      if (nextBossHp === 0) {
        playFanfareSound();
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.55 } });
        setTimeout(() => {
          setBossHp(100);
          setPlayerHp(100);
        }, 1600);
      }

      setTimeout(() => {
        setBossHitAnim(false);
        setFighterIdx((i) => i + 1);
      }, 1200);
    } else {
      playErrorSound();
      setPlayerHp((hp) => Math.max(20, hp - 20));
      awardPoints(0, false, move.hitReaction);
    }
  };

  // ==========================================================================
  // GAME 4: 🏴‍☠️ PIRATE CANNON SHIP BATTLE
  // ==========================================================================
  const [pirateIdx, setPirateIdx] = useState(0);
  const [sunkShipIdx, setSunkShipIdx] = useState<number | null>(null);
  const [octopusSplash, setOctopusSplash] = useState(false);
  const currentPirate = PIRATE_BATTLES[pirateIdx % PIRATE_BATTLES.length];

  const handleFireCannon = (shipIdx: number) => {
    playExplosionSound();
    const ship = currentPirate.ships[shipIdx];
    if (ship?.isCorrect) {
      setSunkShipIdx(shipIdx);
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      awardPoints(
        50,
        true,
        `🏴‍☠️ DIRECT CANNON HIT! ${currentPirate.explanation}`,
        currentPirate.spokenVictory
      );
      setTimeout(() => {
        setSunkShipIdx(null);
        setPirateIdx((i) => i + 1);
      }, 1200);
    } else {
      setOctopusSplash(true);
      awardPoints(
        0,
        false,
        `🐙 SPLASH! Giant Octopus threw the cannonball back at your pirate hat! Try another ship!`
      );
      setTimeout(() => setOctopusSplash(false), 1000);
    }
  };

  // ==========================================================================
  // GAME 5: 🥷 WORD NINJA SLASH!
  // ==========================================================================
  const [flyingFruits, setFlyingFruits] = useState<
    (NinjaItem & { uid: string; x: number; y: number; slashed: boolean })[]
  >([]);

  useEffect(() => {
    if (mode !== 'ninja') return;
    const spawner = setInterval(() => {
      const picked = NINJA_POOL[Math.floor(Math.random() * NINJA_POOL.length)];
      const lanes = [18, 40, 62, 82];
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      setFlyingFruits((prev) => [
        ...prev.slice(-3),
        {
          ...picked,
          uid: `${Date.now()}-${Math.random()}`,
          x: lane,
          y: 25 + Math.floor(Math.random() * 40),
          slashed: false,
        },
      ]);
    }, 1100);
    return () => clearInterval(spawner);
  }, [mode]);

  const handleNinjaSlash = (uid: string) => {
    const item = flyingFruits.find((f) => f.uid === uid);
    if (!item || item.slashed) return;
    setFlyingFruits((prev) =>
      prev.map((f) => (f.uid === uid ? { ...f, slashed: true } : f))
    );

    if (item.isRealCorrectEnglish) {
      playLaserSound();
      awardPoints(35, true, `⚔️ SLASHED! ${item.meaningOrFix}`, item.word);
    } else {
      playExplosionSound();
      awardPoints(0, false, item.meaningOrFix);
    }
  };

  // ==========================================================================
  // GAME 6: 🧟 ZOMBIE WHACK, 7: 🦈 SHARK, 8: 🏎️ RACER
  // ==========================================================================
  const [activeHoles, setActiveHoles] = useState<(typeof ZOMBIE_POP_BANK[0] | null)[]>([
    ZOMBIE_POP_BANK[0],
    null,
    ZOMBIE_POP_BANK[1],
    null,
    ZOMBIE_POP_BANK[4],
    null,
  ]);
  const [whackedHoleIdx, setWhackedHoleIdx] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== 'zombie') return;
    const interval = setInterval(() => {
      const next: (typeof ZOMBIE_POP_BANK[0] | null)[] = [null, null, null, null, null, null];
      [0, 1, 2, 3, 4, 5]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .forEach((hIdx) => {
          next[hIdx] =
            ZOMBIE_POP_BANK[Math.floor(Math.random() * ZOMBIE_POP_BANK.length)];
        });
      setActiveHoles(next);
    }, 2300);
    return () => clearInterval(interval);
  }, [mode]);

  const handleWhackHole = (holeIdx: number) => {
    const item = activeHoles[holeIdx];
    if (!item) return;
    setWhackedHoleIdx(holeIdx);
    playBonkSound();
    if (item.isZombieBadGrammar) {
      awardPoints(35, true, item.funnyReaction, item.fixedSentence);
    } else {
      playErrorSound();
      awardPoints(0, false, item.funnyReaction);
    }
    setTimeout(() => {
      setWhackedHoleIdx(null);
      setActiveHoles((prev) => prev.map((e, i) => (i === holeIdx ? null : e)));
    }, 600);
  };

  // Shark state
  const [sharkX, setSharkX] = useState(50);
  const [fallingItems, setFallingItems] = useState<any[]>([]);
  const [sharkMouthMsg, setSharkMouthMsg] = useState('🦈 Tap falling food to CHOMP!');
  const currentSharkRound = SHARK_ROUNDS[0];

  useEffect(() => {
    if (mode !== 'shark') return;
    const spawner = setInterval(() => {
      setFallingItems((prev) => {
        if (prev.length >= 4) return prev;
        const isGood = Math.random() > 0.35;
        const pool = isGood ? currentSharkRound.goodItems : currentSharkRound.badItems;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        const lanes = [18, 40, 62, 82];
        return [
          ...prev,
          {
            uid: `${Date.now()}-${Math.random()}`,
            x: lanes[Math.floor(Math.random() * lanes.length)],
            y: 10,
            emoji: picked.emoji,
            word: picked.word,
            isGood,
            feedback: isGood ? (picked as any).spoken : (picked as any).funnyFail,
          },
        ];
      });
    }, 1200);
    const mover = setInterval(() => {
      setFallingItems((prev) =>
        prev.map((i) => ({ ...i, y: i.y + 4.5 })).filter((i) => i.y < 90)
      );
    }, 120);
    return () => {
      clearInterval(spawner);
      clearInterval(mover);
    };
  }, [mode, currentSharkRound]);

  // Racer state
  const [racerIdx, setRacerIdx] = useState(0);
  const [playerCarProgress, setPlayerCarProgress] = useState(20);
  const [rivalCarProgress, setRivalCarProgress] = useState(24);
  const [nitroActive, setNitroActive] = useState(false);
  const [bananaSpin, setBananaSpin] = useState(false);
  const currentRacer = RACER_CHALLENGES[racerIdx % RACER_CHALLENGES.length];

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
                  ★ 8 Action & Funny Playable Games
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  Snipe Moving Targets, Defuse Bombs, Fight Bosses & Sink Pirate Ships!
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight mt-1">
                Miami English Action & Comedy Arcade
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

        {/* 8 Playable Game Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-5">
          {[
            { id: 'sniper', label: '🎯 Sniper Scope', sub: 'Moving Firing', icon: Crosshair },
            { id: 'bomb', label: '💣 Bomb Squad', sub: 'Cut the Wire!', icon: Scissors },
            { id: 'fighter', label: '🥊 Boss Knockout', sub: '1v1 Boxing', icon: Swords },
            { id: 'pirate', label: '🏴‍☠️ Pirate Cannon', sub: 'Sink Ships!', icon: Anchor },
            { id: 'ninja', label: '🥷 Word Ninja', sub: 'Slash Words!', icon: Sparkles },
            { id: 'zombie', label: '🧟 Zombie Whack', sub: 'Bonk Zombies', icon: Hammer },
            { id: 'shark', label: '🦈 Hungry Shark', sub: 'Chomp Words', icon: Utensils },
            { id: 'racer', label: '🏎️ Turbo Racer', sub: 'Nitro Race', icon: Car },
          ].map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id as GameMode);
                  setBannerMsg(null);
                }}
                className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border-2 ${
                  active
                    ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_4px_0_0_#b45309] -translate-y-0.5'
                    : 'bg-slate-900/80 text-white border-white/15 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-black truncate">{tab.label}</div>
                <div
                  className={`text-[10px] font-bold truncate mt-0.5 ${
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
                : 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 dark:border-rose-700 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold">
              {bannerMsg.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
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
            GAME 1: 🎯 SNIPER SCOPE: MOVING TARGET SHOOTER (FIRING GAME!)
           =============================================================== */}
        {mode === 'sniper' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-rose-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Crosshair className="w-6 h-6 text-rose-400 animate-pulse" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                    🎯 Tactical Sniper Gallery • Wave #{sniperWaveIdx + 1}
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-amber-300">
                    {currentSniperWave.mission}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-black text-amber-300">
                  🔫 Ammo: {ammo}/6
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playLaserSound();
                    setAmmo(6);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
                >
                  🔄 Reload (6/6)
                </button>
                <button
                  type="button"
                  onClick={() => setSniperWaveIdx((w) => w + 1)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  Next Wave →
                </button>
              </div>
            </div>

            {/* Moving Targets Sniper Field */}
            <div
              ref={sniperBoxRef}
              onMouseMove={(e) => {
                if (!sniperBoxRef.current) return;
                const r = sniperBoxRef.current.getBoundingClientRect();
                setScopePos({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                });
              }}
              className={`relative h-[350px] sm:h-[390px] w-full rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 border-2 border-rose-500/70 overflow-hidden cursor-crosshair select-none ${
                muzzleFlash ? 'ring-4 ring-amber-400 bg-slate-800' : ''
              }`}
            >
              {/* Shooting Range Horizontal Rails */}
              <div className="absolute top-[22%] inset-x-0 h-1 bg-slate-800 border-b border-slate-700" />
              <div className="absolute top-[50%] inset-x-0 h-1 bg-slate-800 border-b border-slate-700" />
              <div className="absolute top-[78%] inset-x-0 h-1 bg-slate-800 border-b border-slate-700" />

              {/* Moving Targets */}
              {currentSniperWave.targets.map((tgt, idx) => {
                const topPct = tgt.row === 0 ? 15 : tgt.row === 1 ? 43 : 71;
                const leftPct = targetOffsets[idx] ?? 30;
                const isShattered = shatteredIdx === idx;
                return (
                  <button
                    key={`${sniperWaveIdx}-${idx}`}
                    type="button"
                    onClick={() => handleSniperShot(idx)}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                    }}
                    className={`absolute -translate-x-1/2 transition-transform duration-75 cursor-crosshair group ${
                      isShattered ? 'scale-150 opacity-0' : 'hover:scale-110'
                    }`}
                  >
                    {isShattered ? (
                      <span className="text-4xl">💥🎯</span>
                    ) : (
                      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 border-2 border-white shadow-[0_6px_0_0_#92400e] flex items-center gap-2">
                        <span className="text-lg">🦆</span>
                        <span className="font-black text-sm sm:text-base">
                          {tgt.word}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                          🎯
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Tactical Sniper Scope Overlay */}
              <div
                style={{ left: `${scopePos.x}%`, top: `${scopePos.y}%` }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center"
              >
                <div className="w-full h-0.5 bg-rose-500/60 absolute" />
                <div className="h-full w-0.5 bg-rose-500/60 absolute" />
                <div className="w-3 h-3 rounded-full border-2 border-amber-400" />
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 2: 💣 TICK-TOCK BOMB DEFUSAL SQUAD (CUT THE RIGHT WIRE!)
           =============================================================== */}
        {mode === 'bomb' && (
          <div className="space-y-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 text-white border-2 border-rose-600 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-rose-400">
                    💣 High-Stakes Grammar Bomb Squad
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-amber-300 mt-1">
                    {currentBomb.chiefPanicQuote}
                  </p>
                </div>

                {/* Digital Red LED Bomb Countdown */}
                <div
                  className={`px-5 py-3 rounded-2xl border-2 font-mono text-2xl sm:text-3xl font-black tracking-widest shrink-0 text-center ${
                    bombState === 'exploded'
                      ? 'bg-rose-600 text-white border-white animate-bounce'
                      : bombState === 'defused'
                        ? 'bg-emerald-600 text-white border-emerald-300'
                        : 'bg-slate-900 text-rose-500 border-rose-500 animate-pulse'
                  }`}
                >
                  {bombState === 'exploded'
                    ? '💥 BOOM!'
                    : bombState === 'defused'
                      ? '😮‍💨 SAFE!'
                      : `00:${String(bombTimer).padStart(2, '0')}`}
                </div>
              </div>

              {/* Sentence Puzzle on the Dynamite Casing */}
              <div className="p-5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Sentence Engraved on the Bomb:
                </span>
                <p className="text-lg sm:text-2xl font-black text-white">
                  {currentBomb.sentencePuzzle}
                </p>
              </div>

              {/* 4 Colored Wires to Cut */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentBomb.wires.map((w) => (
                  <button
                    key={w.color}
                    type="button"
                    disabled={bombState !== 'ticking'}
                    onClick={() => handleCutWire(w)}
                    className={`p-4 rounded-2xl ${w.bgClass} border-2 ${w.borderClass} text-white font-black text-sm sm:text-base flex items-center justify-between gap-3 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg`}
                  >
                    <span>{w.label}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/40 text-xs flex items-center gap-1">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Cut Wire</span>
                    </span>
                  </button>
                ))}
              </div>

              {bombState !== 'ticking' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={nextBombMission}
                    className="btn-3d-emerald px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    💣 Bring Next Bomb! →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 3: 🥊 STREET FIGHTER: BOSS KNOCKOUT! (1v1 BOXING)
           =============================================================== */}
        {mode === 'fighter' && (
          <div className="space-y-5">
            {/* Boxing Ring Arena */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-rose-950 text-white border-2 border-amber-400/80 space-y-6">
              {/* Top Health Bars (You vs. Boss) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Player HP */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-emerald-300">🥊 YOU (Miami Champ)</span>
                    <span>{playerHp} HP</span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-slate-800 p-0.5 border border-slate-600">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${playerHp}%` }}
                    />
                  </div>
                </div>

                {/* Boss HP */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-rose-300">
                      {currentFighter.bossEmoji} BOSS: {currentFighter.bossName}
                    </span>
                    <span>{bossHp} HP</span>
                  </div>
                  <div className="w-full h-4 rounded-full bg-slate-800 p-0.5 border border-slate-600">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
                      style={{ width: `${bossHp}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Boss Character & Broken-Grammar Fireball Attack */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-rose-500/60 flex flex-col sm:flex-row items-center gap-5">
                <div
                  className={`text-6xl sm:text-7xl transition-transform duration-300 ${
                    bossHitAnim ? 'scale-125 rotate-45' : ''
                  }`}
                >
                  {bossHitAnim ? '😵💥' : currentFighter.bossEmoji}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-xs font-bold text-rose-300 italic">
                    {currentFighter.bossTaunt}
                  </p>
                  <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-500 text-sm sm:text-lg font-black text-amber-300">
                    {currentFighter.brokenAttack}
                  </div>
                </div>
              </div>

              {/* Choose Your Counter-Punch Combo */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  🥊 Choose the CORRECT Counter-Punch to Knockout the Boss:
                </span>
                <div className="grid grid-cols-1 gap-3">
                  {currentFighter.moves.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleThrowPunch(m)}
                      className="p-4 rounded-2xl bg-slate-800 hover:bg-indigo-900 border-2 border-amber-400/60 hover:border-amber-300 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <span className="font-black text-sm sm:text-base text-white">
                        {m.correction}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 text-xs font-black shrink-0">
                        {m.moveName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 4: 🏴‍☠️ PIRATE CANNON SHIP BATTLE!
           =============================================================== */}
        {mode === 'pirate' && (
          <div className="space-y-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-sky-900 via-blue-950 to-slate-950 text-white border-2 border-amber-500/80 space-y-6">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-400/50">
                <h3 className="text-base sm:text-xl font-black text-amber-300">
                  {currentPirate.captainOrder}
                </h3>
              </div>

              {/* 3 Sailing Pirate Ships on the Ocean */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                {currentPirate.ships.map((ship, idx) => {
                  const isSunk = sunkShipIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleFireCannon(idx)}
                      className={`p-5 rounded-3xl bg-gradient-to-b from-slate-800 to-blue-900 border-2 border-cyan-400/70 hover:border-amber-400 flex flex-col items-center gap-2 transition-all cursor-crosshair ${
                        isSunk ? 'scale-75 rotate-12 opacity-30' : 'hover:-translate-y-2'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase text-cyan-300">
                        {ship.name} • {ship.distance}
                      </span>
                      <span className="text-5xl">
                        {isSunk ? '💥🌊' : '⛵🏴‍☠️'}
                      </span>
                      <span className="text-lg font-black text-amber-300">
                        &ldquo;{ship.word}&rdquo;
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-black mt-1">
                        💣 Fire Cannon!
                      </span>
                    </button>
                  );
                })}
              </div>

              {octopusSplash && (
                <div className="text-center text-sm font-black text-amber-300 animate-bounce">
                  🐙 SPLASH!! The Giant Octopus threw your cannonball back! Aim again!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 5: 🥷 WORD NINJA SLASH!
           =============================================================== */}
        {mode === 'ninja' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white border-2 border-emerald-500/60">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                🥷 Dojo Word Slicer
              </span>
              <h3 className="text-base sm:text-xl font-black text-amber-300">
                ⚔️ SLASH ONLY REAL ENGLISH WORDS! (Do NOT slash Fake Words / Bombs 🧨!)
              </h3>
            </div>

            <div className="relative h-[330px] w-full rounded-3xl bg-gradient-to-b from-slate-950 via-stone-900 to-slate-950 border-2 border-amber-500/70 overflow-hidden select-none">
              {flyingFruits.map((item) => (
                <button
                  key={item.uid}
                  type="button"
                  onClick={() => handleNinjaSlash(item.uid)}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className={`absolute -translate-x-1/2 px-4 py-3 rounded-2xl border-2 font-black text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer ${
                    item.slashed
                      ? 'scale-125 rotate-12 opacity-0'
                      : 'bg-white text-slate-950 border-amber-400 hover:scale-110 shadow-xl'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span>{item.word}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 6: 🧟 ZOMBIE GRAMMAR WHACK!
           =============================================================== */}
        {mode === 'zombie' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-purple-950 text-white border-2 border-emerald-500/60">
              <h3 className="text-base sm:text-xl font-black">
                🥊 WHACK the Zombies holding BAD Grammar! (Don&apos;t punch the Professor! 🧑‍🏫)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeHoles.map((item, holeIdx) => {
                const isWhacked = whackedHoleIdx === holeIdx;
                return (
                  <div
                    key={holeIdx}
                    className="h-44 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-700 p-4 flex flex-col items-center justify-end relative overflow-hidden"
                  >
                    {item ? (
                      <button
                        type="button"
                        onClick={() => handleWhackHole(holeIdx)}
                        className={`w-full p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          isWhacked
                            ? 'scale-75 rotate-12 bg-rose-600 text-white border-white'
                            : item.isZombieBadGrammar
                              ? 'bg-gradient-to-b from-emerald-600 to-teal-900 border-emerald-300 text-white hover:-translate-y-1'
                              : 'bg-gradient-to-b from-blue-600 to-indigo-900 border-blue-300 text-white hover:-translate-y-1'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-black">
                          {isWhacked ? '💥 BONK!!' : item.displayText}
                        </div>
                      </button>
                    ) : (
                      <div className="w-full py-6 text-center text-xs font-bold text-slate-600">
                        🕳️ Waiting...
                      </div>
                    )}
                    <div className="w-4/5 h-3 rounded-full bg-slate-950 border border-slate-700 mt-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 7: 🦈 HUNGRY MIAMI SHARK
           =============================================================== */}
        {mode === 'shark' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-cyan-950 text-white border-2 border-cyan-500/60">
              <h3 className="text-sm sm:text-lg font-black text-amber-300">
                {currentSharkRound.orderTitle}
              </h3>
            </div>

            <div className="relative h-[340px] w-full rounded-3xl bg-gradient-to-b from-sky-900 via-blue-950 to-slate-950 border-2 border-cyan-600 overflow-hidden select-none">
              {fallingItems.map((item) => (
                <button
                  key={item.uid}
                  type="button"
                  onClick={() => {
                    setSharkX(item.x);
                    setFallingItems((prev) =>
                      prev.filter((i) => i.uid !== item.uid)
                    );
                    if (item.isGood) {
                      playChompSound();
                      setSharkMouthMsg(`😋 YUM! "${item.word}"!`);
                      awardPoints(35, true, item.feedback, item.feedback);
                    } else {
                      playErrorSound();
                      setSharkMouthMsg('🤢 YUCK! Old Boot!');
                      awardPoints(0, false, item.feedback);
                    }
                  }}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className="absolute -translate-x-1/2 px-3.5 py-2 rounded-2xl bg-white text-slate-900 border-2 border-amber-400 shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-black text-xs sm:text-sm">
                    {item.word}
                  </span>
                </button>
              ))}

              <div
                style={{ left: `${sharkX}%` }}
                className="absolute bottom-3 -translate-x-1/2 transition-all duration-150 flex flex-col items-center pointer-events-none"
              >
                <div className="px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs mb-1">
                  {sharkMouthMsg}
                </div>
                <div className="text-5xl">🦈</div>
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            GAME 8: 🏎️ MIAMI TURBO RACER
           =============================================================== */}
        {mode === 'racer' && (
          <div className="space-y-5">
            <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-700 space-y-4">
              <div className="relative h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center px-3">
                <div
                  style={{ left: `${playerCarProgress}%` }}
                  className={`absolute transition-all duration-500 flex items-center gap-1 ${
                    bananaSpin ? 'animate-spin' : ''
                  }`}
                >
                  {nitroActive && <span className="text-xl">🔥🔥</span>}
                  <span className="text-3xl">🏎️</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
                    YOU
                  </span>
                </div>
                <div className="ml-auto text-xl">🏁</div>
              </div>

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

            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border-2 border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentRacer.situation}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {currentRacer.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (opt.isCorrect) {
                        playSuccessSound();
                        setNitroActive(true);
                        setPlayerCarProgress((p) => (p >= 80 ? 20 : p + 25));
                        awardPoints(
                          45,
                          true,
                          opt.funnyOutcome,
                          currentRacer.spokenAnswer
                        );
                        setTimeout(() => {
                          setNitroActive(false);
                          setRacerIdx((i) => i + 1);
                        }, 1100);
                      } else {
                        playErrorSound();
                        setBananaSpin(true);
                        awardPoints(0, false, opt.funnyOutcome);
                        setTimeout(() => setBananaSpin(false), 900);
                      }
                    }}
                    className="p-4 rounded-2xl text-left font-extrabold text-xs sm:text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
