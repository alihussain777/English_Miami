// Realistic Neural Voice Engine & Honest Pronunciation Evaluator for TICI Miami

export interface VoicePlayOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  audioUrl?: string;
  preferBrowserTTS?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Priority order for realistic natural English voices across Chrome, Edge, Safari
  const priorityPatterns = [
    /Microsoft Aria Online \(Natural\)/i,
    /Microsoft Guy Online \(Natural\)/i,
    /Microsoft Jenny Online \(Natural\)/i,
    /Google US English/i,
    /Google UK English Female/i,
    /Samantha/i,
    /Alex/i,
    /Natural/i,
    /Neural/i,
  ];

  for (const pattern of priorityPatterns) {
    const match = voices.find((v) => pattern.test(v.name) && v.lang.startsWith('en'));
    if (match) return match;
  }

  return voices.find((v) => v.lang === 'en-US') || voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function stopRealisticSpeech() {
  stopSpeaking();
}

export function speakRealisticText(text: string, options: VoicePlayOptions = {}) {
  if (typeof window === 'undefined') return;
  const cleanText = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/_{2,}/g, ' blank ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  const rate = options.rate ?? 0.92;
  const pitch = options.pitch ?? 1.0;

  const playViaBrowserTTS = () => {
    if (!('speechSynthesis' in window)) {
      options.onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (!options.lang || options.lang.startsWith('en')) {
      const bestVoice = getBestEnglishVoice();
      if (bestVoice) utterance.voice = bestVoice;
    }

    utterance.onstart = () => options.onStart?.();
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = () => options.onEnd?.();

    window.speechSynthesis.speak(utterance);
  };

  // If custom rate is requested (e.g. 0.65x slow or 1.15x fast) or preferBrowserTTS is set, use Neural Browser TTS directly
  if (options.preferBrowserTTS || !options.audioUrl || Math.abs(rate - 0.92) > 0.08) {
    playViaBrowserTTS();
    return;
  }

  // Try audioUrl with a tight 1.2s timeout fallback to Browser TTS so it never silently fails
  try {
    const audio = new Audio(options.audioUrl);
    audio.playbackRate = Math.max(0.5, Math.min(1.5, rate));
    let started = false;
    const fallbackTimer = setTimeout(() => {
      if (!started) {
        audio.pause();
        playViaBrowserTTS();
      }
    }, 1200);

    audio.onplaying = () => {
      started = true;
      clearTimeout(fallbackTimer);
      options.onStart?.();
    };
    audio.onended = () => {
      clearTimeout(fallbackTimer);
      options.onEnd?.();
    };
    audio.onerror = () => {
      clearTimeout(fallbackTimer);
      playViaBrowserTTS();
    };
    audio.play().catch(() => {
      clearTimeout(fallbackTimer);
      playViaBrowserTTS();
    });
  } catch {
    playViaBrowserTTS();
  }
}

export interface WordEvaluation {
  word: string;
  cleanWord: string;
  status: 'correct' | 'close' | 'missed';
  spokenMatch?: string;
  similarity: number;
}

export interface SpokenEvaluationResult {
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  passed: boolean;
  wordBreakdown: WordEvaluation[];
  feedbackTitle: string;
  feedbackDetail: string;
  tips: string[];
}

function normalizeToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function expandContractions(text: string): string {
  return text
    .toLowerCase()
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bdoesn't\b/g, 'does not')
    .replace(/\bdidn't\b/g, 'did not')
    .replace(/\bcan't\b/g, 'cannot')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bthat's\b/g, 'that is')
    .replace(/\bwhat's\b/g, 'what is')
    .replace(/\bthere's\b/g, 'there is')
    .replace(/\bwe're\b/g, 'we are')
    .replace(/\bthey're\b/g, 'they are')
    .replace(/\byou're\b/g, 'you are')
    .replace(/\bi've\b/g, 'i have')
    .replace(/\bi'll\b/g, 'i will')
    .replace(/\blet's\b/g, 'let us');
}

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function tokenSimilarity(a: string, b: string): number {
  const na = normalizeToken(a);
  const nb = normalizeToken(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  const dist = levenshteinDistance(na, nb);
  return Math.max(0, (maxLen - dist) / maxLen);
}

export function evaluateSpokenAccuracy(
  targetPhrase: string,
  spokenTranscript: string,
  durationSeconds = 3.0
): SpokenEvaluationResult {
  const rawTargetWords = (targetPhrase || '')
    .trim()
    .split(/\s+/)
    .filter((w) => normalizeToken(w).length > 0);

  const spokenExpanded = expandContractions(spokenTranscript || '');
  const spokenTokens = spokenExpanded
    .split(/\s+/)
    .map((w) => normalizeToken(w))
    .filter(Boolean);

  if (!spokenTokens.length) {
    return {
      overallScore: 0,
      accuracyScore: 0,
      fluencyScore: 0,
      pronunciationScore: 0,
      passed: false,
      wordBreakdown: rawTargetWords.map((w) => ({
        word: w,
        cleanWord: normalizeToken(w),
        status: 'missed',
        similarity: 0,
      })),
      feedbackTitle: 'No speech detected',
      feedbackDetail: 'We could not hear your voice clearly. Check your microphone and speak clearly into it.',
      tips: ['Keep your microphone close and speak at a steady volume.'],
    };
  }

  const usedIndices = new Set<number>();
  const breakdown: WordEvaluation[] = [];

  for (let idx = 0; idx < rawTargetWords.length; idx++) {
    const rawWord = rawTargetWords[idx];
    const cleanTarget = normalizeToken(expandContractions(rawWord).split(/\s+/)[0] || rawWord);

    let bestSim = 0;
    let bestSpokenIdx = -1;

    // Search nearby window first, then full spoken tokens
    for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
      if (usedIndices.has(sIdx)) continue;
      const sim = tokenSimilarity(cleanTarget, spokenTokens[sIdx]);
      // Slight bonus if position is close
      const posBonus = Math.abs(sIdx - idx) <= 2 ? 0.04 : 0;
      if (sim + posBonus > bestSim) {
        bestSim = sim;
        bestSpokenIdx = sIdx;
      }
    }

    if (bestSim >= 0.84 && bestSpokenIdx !== -1) {
      usedIndices.add(bestSpokenIdx);
      breakdown.push({
        word: rawWord,
        cleanWord: cleanTarget,
        status: 'correct',
        spokenMatch: spokenTokens[bestSpokenIdx],
        similarity: Math.round(bestSim * 100),
      });
    } else if (bestSim >= 0.55 && bestSpokenIdx !== -1) {
      usedIndices.add(bestSpokenIdx);
      breakdown.push({
        word: rawWord,
        cleanWord: cleanTarget,
        status: 'close',
        spokenMatch: spokenTokens[bestSpokenIdx],
        similarity: Math.round(bestSim * 100),
      });
    } else {
      breakdown.push({
        word: rawWord,
        cleanWord: cleanTarget,
        status: 'missed',
        similarity: Math.round(bestSim * 100),
      });
    }
  }

  const totalWords = Math.max(1, breakdown.length);
  const correctCount = breakdown.filter((b) => b.status === 'correct').length;
  const closeCount = breakdown.filter((b) => b.status === 'close').length;

  // Realistic accuracy score based on exact & partial word matches
  const rawAccuracy = ((correctCount * 1.0 + closeCount * 0.62) / totalWords) * 100;
  // Penalize extra random words if the speaker said way too many unrelated words
  const extraWordsRatio = Math.max(0, spokenTokens.length - totalWords * 1.4) / totalWords;
  const accuracyScore = Math.max(8, Math.min(100, Math.round(rawAccuracy - extraWordsRatio * 12)));

  // Realistic pronunciation score from character-level phonetic similarity
  const avgWordSim =
    breakdown.reduce((sum, item) => sum + item.similarity, 0) / totalWords;
  const pronunciationScore = Math.max(
    10,
    Math.min(100, Math.round(avgWordSim * 0.65 + accuracyScore * 0.35))
  );

  // Realistic fluency score based on pace (ideal ~2.0 to 3.3 words/sec) and completion ratio
  const expectedDuration = Math.max(1.2, totalWords / 2.4);
  const actualDuration = Math.max(0.8, durationSeconds || expectedDuration);
  const paceRatio = Math.min(actualDuration / expectedDuration, expectedDuration / actualDuration);
  const completionRatio = (correctCount + closeCount) / totalWords;
  const fluencyScore = Math.max(
    12,
    Math.min(100, Math.round((completionRatio * 0.72 + paceRatio * 0.28) * 100))
  );

  const overallScore = Math.round(
    accuracyScore * 0.45 + pronunciationScore * 0.35 + fluencyScore * 0.20
  );

  const passed = overallScore >= 60 || correctCount + closeCount >= Math.ceil(totalWords * 0.6);

  const missedWords = breakdown.filter((b) => b.status === 'missed').map((b) => b.word);
  const closeWords = breakdown.filter((b) => b.status === 'close').map((b) => b.word);

  let feedbackTitle = 'Excellent Pronunciation!';
  let feedbackDetail = 'Your clarity, word accuracy, and rhythm sounded natural and confident.';
  const tips: string[] = [];

  if (overallScore >= 88) {
    feedbackTitle = 'Native-Level Clarity! 🌟';
    feedbackDetail = `You pronounced ${correctCount} of ${totalWords} words accurately with smooth pacing.`;
    tips.push('Try practicing at 1.15x speed next to build fast conversational fluency.');
  } else if (overallScore >= 70) {
    feedbackTitle = 'Good Job — Clear & Understandable! 👍';
    feedbackDetail = `You matched most of the sentence accurately (${correctCount}/${totalWords} exact words).`;
    if (closeWords.length > 0) {
      tips.push(`Focus on clearer vowel & ending consonant sounds in: "${closeWords.slice(0, 3).join(', ')}".`);
    }
    if (missedWords.length > 0) {
      tips.push(`Make sure not to skip: "${missedWords.slice(0, 3).join(', ')}".`);
    }
  } else if (overallScore >= 45) {
    feedbackTitle = 'Almost There — Keep Practicing! 🎯';
    feedbackDetail = `We caught part of the sentence, but ${missedWords.length} word(s) were unclear or missed.`;
    if (missedWords.length > 0) {
      tips.push(`Listen to the 0.65x slow audio and repeat these words carefully: "${missedWords.slice(0, 4).join(', ')}".`);
    }
  } else {
    feedbackTitle = 'Needs Another Try 🔄';
    feedbackDetail = `What we heard didn't closely match the target sentence. Listen to the slow model voice first.`;
    tips.push('Click the 0.65x Slow button to hear each syllable clearly before recording again.');
  }

  return {
    overallScore,
    accuracyScore,
    fluencyScore,
    pronunciationScore,
    passed,
    wordBreakdown: breakdown,
    feedbackTitle,
    feedbackDetail,
    tips,
  };
}
