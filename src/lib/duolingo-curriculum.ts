import { getBaseLanguageInfo, BaseLanguageInfo } from './duolingo-languages';

export interface DuolingoTokenHint {
  word: string;
  tts?: string;
  hints: string[];
}

export interface DuolingoChallenge {
  type: 'translate' | 'speak' | 'listenTap' | 'listen' | 'name' | 'listenIsolation';
  prompt?: string;
  choices?: Array<{ text: string } | string>;
  correctIndices?: number[];
  correctSolutions?: string[];
  correctTokens?: string[];
  wrongTokens?: string[];
  sourceLanguage?: string;
  targetLanguage?: string;
  sentenceId?: string;
  tts?: string;
  character_url?: string;
  tokens?: Array<{
    value: string;
    tts?: string;
    hintTable?: {
      rows?: Array<Array<{ hint?: string }>>;
    };
  }>;
}

export interface DuolingoGeneratedLesson {
  id: string;
  slug: string;
  title: string;
  nativeSubtitle: string;
  description: string;
  levelCode: string;
  lessonNumber: number;
  unitNumber: number;
  xpReward: number;
  durationMinutes: number;
  isCompleted?: boolean;
  isDuolingoNativeLesson: true;
  baseLang: string;
  objectives: string[];
  explanationHtml: string;
  grammarNotes: string;
  vocabularyWords: Array<{
    word: string;
    translation: string;
    allHints: string[];
    tts?: string;
  }>;
  examples: Array<{
    phrase: string;
    translation: string;
    tts?: string;
    characterUrl?: string;
    note?: string;
  }>;
  challenges: DuolingoChallenge[];
}

export interface DuolingoGeneratedUnit {
  id: string;
  title: string;
  description: string;
  levelCode: string;
  unitNumber: number;
  baseLang: string;
  lessons: DuolingoGeneratedLesson[];
}

const UNIT_CATALOG_TITLES: Array<{
  enTitle: string;
  enDesc: string;
  lessonThemes: string[];
}> = [
  {
    enTitle: 'Unit 1: Basic Foundations — Greetings, Drinks & Polite Words',
    enDesc: 'Learn your first essential English words, polite requests, and everyday greetings from your native language.',
    lessonThemes: [
      'Lesson 1: First Words & Polite Requests',
      'Lesson 2: Everyday Greetings & Essentials',
      'Lesson 3: Building Simple Phrases',
      'Lesson 4: Listening & Speaking Drill 1',
    ],
  },
  {
    enTitle: 'Unit 2: Core Sentences — My, Your, His, Her & Descriptions',
    enDesc: 'Build complete sentences describing everyday objects, temperature (hot/cold), and sizes (big/small).',
    lessonThemes: [
      'Lesson 5: Describing Objects (Hot & Cold)',
      'Lesson 6: Possessives (My, Your, His, Her)',
      'Lesson 7: Big & Small — Complete Sentences',
      'Lesson 8: Listening & Speaking Drill 2',
    ],
  },
  {
    enTitle: 'Unit 3: Introductions, Names & Asking Questions',
    enDesc: 'Introduce yourself and others, ask questions in English, and practice real two-way translation.',
    lessonThemes: [
      'Lesson 9: Introducing Names & People',
      'Lesson 10: Asking Questions (What / Or)',
      'Lesson 11: Connecting Ideas with "And" & "With"',
      'Lesson 12: Listening & Speaking Drill 3',
    ],
  },
  {
    enTitle: 'Unit 4: Ear Training & Fast Sentence Construction',
    enDesc: 'Train your ear to understand natural spoken English and build sentences quickly from word banks.',
    lessonThemes: [
      'Lesson 13: Spoken English Recognition',
      'Lesson 14: Native → English Sentence Builder',
      'Lesson 15: English → Native Translation Mastery',
      'Lesson 16: Listening & Speaking Drill 4',
    ],
  },
  {
    enTitle: 'Unit 5: Conversational Fluency & Pronunciation Practice',
    enDesc: 'Combine everything you have learned into confident spoken sentences and real-life dialogues.',
    lessonThemes: [
      'Lesson 17: Everyday Cafe & Home Dialogues',
      'Lesson 18: Pronunciation & Speaking Confidence',
      'Lesson 19: Speed Translation Challenge',
      'Lesson 20: Basic Foundations Mastery Review',
    ],
  },
  {
    enTitle: 'Unit 6: Extended Basic Practice & Spaced Repetition',
    enDesc: 'Reinforce all core vocabulary, listening comprehension, and sentence structures for 100% retention.',
    lessonThemes: [
      'Lesson 21: Mixed Skills Practice I',
      'Lesson 22: Mixed Skills Practice II',
      'Lesson 23: Advanced Basic Listening & Speaking',
      'Lesson 24: Final Basic Graduation Challenge',
    ],
  },
];

export function buildDuolingoCurriculum(
  langCode: string,
  rawJson: { challenges?: DuolingoChallenge[] },
  completedLessonSlugs: string[] = []
): DuolingoGeneratedUnit[] {
  const langInfo: BaseLanguageInfo = getBaseLanguageInfo(langCode);
  const allChallenges: DuolingoChallenge[] = (rawJson.challenges || []).filter(
    (c) => c && (c.prompt || (c.tokens && c.tokens.length > 0))
  );

  if (allChallenges.length === 0) return [];

  // Build global English <-> Native translation lookup across the entire file
  // so even `speak` / `listenTap` challenges know their native translation!
  const enToNativeMap = new Map<string, string>();
  const globalWordMap = new Map<
    string,
    { word: string; translation: string; allHints: string[]; tts?: string }
  >();

  for (const ch of allChallenges) {
    if (ch.type === 'translate') {
      if (ch.sourceLanguage === 'en' && ch.prompt && ch.correctSolutions?.[0]) {
        enToNativeMap.set(ch.prompt.trim().toLowerCase(), ch.correctSolutions[0]);
      } else if (ch.targetLanguage === 'en' && ch.prompt && ch.correctSolutions?.[0]) {
        enToNativeMap.set(
          ch.correctSolutions[0].trim().toLowerCase(),
          ch.prompt
        );
      }
    }
    if (ch.tokens) {
      for (const tok of ch.tokens) {
        const val = (tok.value || '').trim();
        if (!val || /^[^\w]+$/.test(val)) continue;
        const hints: string[] = [];
        const rows = tok.hintTable?.rows || [];
        for (const r of rows) {
          for (const cell of r) {
            if (cell?.hint && !hints.includes(cell.hint)) {
              hints.push(cell.hint);
            }
          }
        }
        if (hints.length > 0) {
          const key = val.toLowerCase();
          if (!globalWordMap.has(key)) {
            globalWordMap.set(key, {
              word: val,
              translation: hints[0],
              allHints: hints.slice(0, 3),
              tts: tok.tts,
            });
          }
        }
      }
    }
  }

  // Group into lessons of 9 challenges each (gives ~14 to 24 lessons per language)
  const CHALLENGES_PER_LESSON = 9;
  const totalLessons = Math.min(
    24,
    Math.max(12, Math.ceil(allChallenges.length / CHALLENGES_PER_LESSON))
  );

  const generatedLessons: DuolingoGeneratedLesson[] = [];

  for (let lIdx = 0; lIdx < totalLessons; lIdx++) {
    const start = (lIdx * CHALLENGES_PER_LESSON) % allChallenges.length;
    const lessonChallenges: DuolingoChallenge[] = [];
    for (let k = 0; k < CHALLENGES_PER_LESSON; k++) {
      lessonChallenges.push(allChallenges[(start + k) % allChallenges.length]);
    }

    const unitIdx = Math.floor(lIdx / 4);
    const catalogUnit =
      UNIT_CATALOG_TITLES[unitIdx % UNIT_CATALOG_TITLES.length];
    const lessonThemeTitle =
      catalogUnit.lessonThemes[lIdx % 4] || `Lesson ${lIdx + 1}: Core Practice`;

    // Extract vocabulary words for this lesson
    const lessonVocabMap = new Map<
      string,
      { word: string; translation: string; allHints: string[]; tts?: string }
    >();

    // Extract bilingual sentence examples for this lesson
    const lessonExamples: Array<{
      phrase: string;
      translation: string;
      tts?: string;
      characterUrl?: string;
      note?: string;
    }> = [];
    const seenPhrases = new Set<string>();

    for (const ch of lessonChallenges) {
      // Extract tokens -> vocabulary
      if (ch.tokens) {
        for (const tok of ch.tokens) {
          const val = (tok.value || '').trim();
          if (!val || /^[^\w]+$/.test(val)) continue;
          const key = val.toLowerCase();
          const globalEntry = globalWordMap.get(key);
          if (globalEntry && !lessonVocabMap.has(key)) {
            lessonVocabMap.set(key, globalEntry);
          }
        }
      }

      // Extract bilingual sentence pair
      let enPhrase = '';
      let nativeTrans = '';

      if (ch.type === 'translate') {
        if (ch.sourceLanguage === 'en') {
          enPhrase = ch.prompt || '';
          nativeTrans = ch.correctSolutions?.[0] || '';
        } else {
          enPhrase = ch.correctSolutions?.[0] || '';
          nativeTrans = ch.prompt || '';
        }
      } else {
        const tokenSentence = (ch.tokens || []).map((t) => t.value).join('').trim();
        enPhrase = ch.prompt || tokenSentence;
        if (enPhrase) {
          nativeTrans =
            enToNativeMap.get(enPhrase.toLowerCase()) ||
            (ch.tokens || [])
              .map((t) => t.hintTable?.rows?.[0]?.[0]?.hint || '')
              .filter(Boolean)
              .join(' ');
        }
      }

      if (enPhrase && !seenPhrases.has(enPhrase.toLowerCase())) {
        seenPhrases.add(enPhrase.toLowerCase());
        lessonExamples.push({
          phrase: enPhrase,
          translation: nativeTrans || langInfo.nativeName,
          tts: ch.tts,
          characterUrl: ch.character_url,
          note:
            ch.type === 'speak'
              ? 'Speaking & Pronunciation Drill'
              : ch.type === 'listenTap' || ch.type === 'listen'
              ? 'Listening Comprehension'
              : `${langInfo.nativeName} ↔ English Translation`,
        });
      }
    }

    // Ensure at least 6 vocabulary words per lesson by topping up from globalWordMap if needed
    if (lessonVocabMap.size < 6) {
      for (const [k, v] of globalWordMap.entries()) {
        if (!lessonVocabMap.has(k)) {
          lessonVocabMap.set(k, v);
          if (lessonVocabMap.size >= 8) break;
        }
      }
    }

    const vocabArray = Array.from(lessonVocabMap.values());
    const slug = `duolingo-${langCode}-lesson-${lIdx + 1}`;

    const vocabRowsHtml = vocabArray
      .slice(0, 8)
      .map(
        (v) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid rgba(148,163,184,0.2);font-weight:800;">${v.word}</td>
            <td style="padding:8px 12px;border-bottom:1px solid rgba(148,163,184,0.2);color:#059669;font-weight:700;">${v.allHints.join(' / ')}</td>
          </tr>`
      )
      .join('');

    const explanationHtml = `
      <div style="space-y:12px;">
        <p><strong>${langInfo.flag} ${langInfo.courseTitle}</strong> — ${langInfo.courseSubtitle}</p>
        <p>In <strong>${lessonThemeTitle}</strong>, you will practice <strong>${lessonChallenges.length} interactive Duolingo exercises</strong> (Translation, Listening Word-Bank, Speaking & Picture Naming) designed specifically for <strong>${langInfo.name} (${langInfo.nativeName})</strong> speakers.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;">
          <thead>
            <tr style="background:rgba(59,130,246,0.1);text-align:left;">
              <th style="padding:8px 12px;">English Word</th>
              <th style="padding:8px 12px;">${langInfo.nativeName} (${langInfo.name}) Meaning</th>
            </tr>
          </thead>
          <tbody>
            ${vocabRowsHtml}
          </tbody>
        </table>
      </div>
    `;

    const previewWords = vocabArray
      .slice(0, 3)
      .map((v) => `${v.word} (${v.translation})`)
      .join(', ');

    generatedLessons.push({
      id: slug,
      slug,
      title: lessonThemeTitle,
      nativeSubtitle: previewWords || `${langInfo.nativeName} → English`,
      description: `Learn and practice ${previewWords} with native ${langInfo.name} translations, real Duolingo audio, and word-bank exercises.`,
      levelCode: 'A0',
      lessonNumber: lIdx + 1,
      unitNumber: unitIdx + 1,
      xpReward: 20,
      durationMinutes: 10,
      isCompleted: completedLessonSlugs.includes(slug),
      isDuolingoNativeLesson: true,
      baseLang: langCode,
      objectives: [
        `Translate sentences between ${langInfo.name} (${langInfo.nativeName}) and English`,
        `Master key words: ${vocabArray.slice(0, 5).map((v) => v.word).join(', ')}`,
        `Train listening comprehension and spoken English pronunciation`,
      ],
      explanationHtml,
      grammarNotes: langInfo.grammarTip,
      vocabularyWords: vocabArray,
      examples: lessonExamples,
      challenges: lessonChallenges,
    });
  }

  // Group into units of 4 lessons each
  const units: DuolingoGeneratedUnit[] = [];
  const totalUnits = Math.ceil(generatedLessons.length / 4);

  for (let u = 0; u < totalUnits; u++) {
    const unitLessons = generatedLessons.slice(u * 4, (u + 1) * 4);
    const cat = UNIT_CATALOG_TITLES[u % UNIT_CATALOG_TITLES.length];
    units.push({
      id: `duolingo-unit-${langCode}-${u + 1}`,
      title: `${cat.enTitle} (${langInfo.flag} ${langInfo.nativeName})`,
      description: `${langInfo.courseTitle} • ${cat.enDesc}`,
      levelCode: 'A0',
      unitNumber: u + 1,
      baseLang: langCode,
      lessons: unitLessons,
    });
  }

  return units;
}
