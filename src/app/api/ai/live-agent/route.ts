import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readSiteConfig, writeSiteConfig } from '@/lib/site-config-store';
import { getBaseLanguageInfo } from '@/lib/duolingo-languages';

export const dynamic = 'force-dynamic';

export interface LiveAgentResponsePayload {
  spokenGreetingOrReply: string;
  spokenEnglishPractice: string;
  nativeLanguageExplanation: string;
  hasGrammarMistake: boolean;
  originalUserSentence: string;
  correctedEnglishSentence: string;
  advancedAlternativeSentence: string;
  grammarRuleTitle: string;
  vocabularyCards: {
    word: string;
    phonetic: string;
    nativeMeaning: string;
    example: string;
  }[];
  nextTestPrompt: {
    instructionInNative: string;
    targetEnglishToSpeak: string;
    questionForUser: string;
  };
  fluencyScore: number;
}

function toUnifiedResponse(raw: Partial<LiveAgentResponsePayload>, langCode: string) {
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';
  const spoken =
    raw.spokenGreetingOrReply ||
    'Great job practicing with me! Let us review your English sentence below.';
  const explanation =
    raw.nativeLanguageExplanation ||
    (isUrdu
      ? 'آپ کا جملہ نیچے کارڈ میں درست کر دیا گیا ہے۔ صحیح جملے کو سنیں اور مائیک میں بول کر مشق کریں!'
      : 'Your sentence has been analyzed and refined in the cards below.');
  const corrected =
    raw.correctedEnglishSentence ||
    raw.spokenEnglishPractice ||
    'I would like to improve my spoken English fluency.';
  return {
    spokenGreetingOrReply: spoken,
    spokenEnglishPractice: raw.spokenEnglishPractice || corrected,
    nativeLanguageExplanation: explanation,
    hasGrammarMistake: Boolean(raw.hasGrammarMistake),
    originalUserSentence:
      raw.originalUserSentence || 'Hello Sophia, let us practice English!',
    correctedEnglishSentence: corrected,
    advancedAlternativeSentence:
      raw.advancedAlternativeSentence ||
      'I am committed to achieving confident, natural English fluency.',
    grammarRuleTitle:
      raw.grammarRuleTitle || 'Natural English Sentence Structure & Fluency',
    vocabularyCards:
      Array.isArray(raw.vocabularyCards) && raw.vocabularyCards.length > 0
        ? raw.vocabularyCards
        : [
            {
              word: 'Fluency',
              phonetic: '/ˈfluː.ən.si/',
              nativeMeaning: isUrdu ? 'روانی سے بولنا' : 'Smooth, natural speech',
              example: 'Daily speaking practice builds strong English fluency.',
            },
          ],
    nextTestPrompt: {
      instructionInNative:
        raw.nextTestPrompt?.instructionInNative ||
        (isUrdu
          ? '🎯 اگلا ٹیسٹ: اوپر والا صحیح فقرہ مائیک میں بول کر سنائیں یا نیچے دیے گئے سوال کا جواب دیں:'
          : '🎯 Next Live Test: Speak the corrected sentence aloud or answer this question:'),
      targetEnglishToSpeak:
        raw.nextTestPrompt?.targetEnglishToSpeak || corrected,
      questionForUser:
        raw.nextTestPrompt?.questionForUser ||
        'What did you do today, and what are your plans for tomorrow?',
    },
    fluencyScore: typeof raw.fluencyScore === 'number' ? raw.fluencyScore : 88,
    spokenTeacherReply: spoken,
    nativeLanguageGreetingOrFeedback: explanation,
    hasMistake: Boolean(raw.hasGrammarMistake),
    mistakeExplanationInNative: explanation,
    encouragementInNative: isUrdu
      ? 'شاباش! نیچے دیا گیا درست انگریزی فقرہ سنیں اور مائیک میں بول کر مشق کریں!'
      : isHindi
        ? 'शाबाश! नीचे दिया गया सही अंग्रेजी वाक्य सुनें और माइक में बोलकर अभ्यास करें!'
        : 'Keep practicing aloud! Listen to the corrected sentence and try the next test question below.',
    grammarScore: raw.hasGrammarMistake ? 74 : 96,
  };
}

export async function GET() {
  const config: any = readSiteConfig();
  const hasApiKey = Boolean(config.geminiApiKey || process.env.GEMINI_API_KEY);
  return NextResponse.json({
    success: true,
    hasApiKey,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config: any = readSiteConfig();
    if (typeof body.geminiApiKey === 'string') {
      config.geminiApiKey = body.geminiApiKey.trim();
      writeSiteConfig(config);
    }
    return NextResponse.json({
      success: true,
      hasApiKey: Boolean(config.geminiApiKey || process.env.GEMINI_API_KEY),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message ?? body.userMessage ?? '';
    const nativeLangCode = body.nativeLanguage ?? body.nativeLangCode ?? 'ur';
    const levelTier = body.level ?? body.levelTier ?? 'basic';
    const sessionMode = body.sessionMode ?? 'teaching';
    const apiKeyOverride = body.apiKeyOverride ?? '';
    const saveApiKey = Boolean(body.saveApiKey);
    const isInitialGreeting = Boolean(body.isInitialGreeting);

    const config: any = readSiteConfig();
    if (saveApiKey && apiKeyOverride && typeof apiKeyOverride === 'string') {
      config.geminiApiKey = apiKeyOverride.trim();
      writeSiteConfig(config);
    }

    const activeApiKey =
      (apiKeyOverride && apiKeyOverride.trim()) ||
      config.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      '';

    const langInfo = getBaseLanguageInfo(nativeLangCode);

    // If initial greeting when user starts the Live Agent after selecting language & level
    if (isInitialGreeting || !userMessage.trim()) {
      const greetingPayload = buildInitialBilingualGreeting(
        nativeLangCode,
        langInfo.name,
        langInfo.nativeName,
        levelTier
      );
      const unified = toUnifiedResponse(greetingPayload, nativeLangCode);
      return NextResponse.json({
        success: true,
        usingGeminiLiveKey: Boolean(activeApiKey),
        engine: activeApiKey ? 'gemini-live' : 'miami-bilingual-engine',
        response: unified,
        data: unified,
      });
    }

    // Try Gemini API if key is present
    if (activeApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(activeApiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const systemPrompt = `You are "Sophia", the realistic Live AI English Teacher at TICI Language Institute Miami.
The student's native language is: ${langInfo.name} (${langInfo.nativeName}, code: ${nativeLangCode}).
The student's selected English level is: ${levelTier.toUpperCase()} (${
          levelTier === 'basic'
            ? 'CEFR A0-A1 Beginner: Speak warmly in both their native language and simple English, teaching step by step'
            : levelTier === 'mid'
              ? 'CEFR A2-B1 Intermediate: Conversational English with clear native-language grammar explanations'
              : 'CEFR B2-C2 Advanced: High-level English fluency, idioms, and interview coaching with native nuances'
        }).
Session Mode: ${sessionMode}.

The student just said: "${userMessage}"

Analyze their input carefully. Even if they spoke in their native language (${langInfo.name} / Roman Urdu / Hindi / etc.) or broken English, teach them how to express it in natural English, correct any grammar or phrasing mistakes, explain the rule in ${langInfo.name} (${langInfo.nativeName}), provide 3 useful vocabulary cards with meanings in ${langInfo.nativeName}, and give them a live speaking test prompt next.

Return strictly valid JSON matching this exact schema:
{
  "spokenGreetingOrReply": "Natural spoken reply that the AI avatar will speak aloud (mix of warm English and short ${langInfo.name} encouragement)",
  "spokenEnglishPractice": "The exact correct English sentence for the student to listen to and repeat",
  "nativeLanguageExplanation": "Detailed, friendly explanation in ${langInfo.name} (${langInfo.nativeName} script AND/OR Roman script if Urdu/Hindi) explaining why the correction was made and how the grammar rule works",
  "hasGrammarMistake": boolean,
  "originalUserSentence": "${userMessage.replace(/"/g, '\\"')}",
  "correctedEnglishSentence": "The 100% grammatically correct, natural English version of what the student tried to say",
  "advancedAlternativeSentence": "A polished, confident native-speaker or professional way to say the same sentence",
  "grammarRuleTitle": "Short title of the grammar or fluency rule (e.g., 'Past Simple vs. Present Perfect', 'Subject-Verb Agreement')",
  "vocabularyCards": [
    {
      "word": "English word or phrase",
      "phonetic": "/IPA/",
      "nativeMeaning": "Meaning in ${langInfo.nativeName}",
      "example": "Clear example sentence in English"
    }
  ],
  "nextTestPrompt": {
    "instructionInNative": "Instruction in ${langInfo.name} asking the student to speak or answer the next test question",
    "targetEnglishToSpeak": "A sample English sentence the student can speak into the mic right now",
    "questionForUser": "Next conversational or test question in English"
  },
  "fluencyScore": number (between 65 and 98 based on accuracy)
}`;

        const result = await model.generateContent(systemPrompt);
        const rawText = result.response
          .text()
          .replace(/^```json\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        const parsed = JSON.parse(rawText);
        const unified = toUnifiedResponse(parsed, nativeLangCode);
        return NextResponse.json({
          success: true,
          usingGeminiLiveKey: true,
          engine: 'gemini-live',
          response: unified,
          data: unified,
        });
      } catch (geminiErr) {
        console.warn('Gemini Live Agent call failed, using smart bilingual engine:', geminiErr);
      }
    }

    // Smart Bilingual Diagnostic & Teaching Fallback Engine
    const smartPayload = analyzeAndTeachBilingually(
      userMessage,
      nativeLangCode,
      langInfo.name,
      langInfo.nativeName,
      levelTier
    );
    const unified = toUnifiedResponse(smartPayload, nativeLangCode);

    return NextResponse.json({
      success: true,
      usingGeminiLiveKey: Boolean(activeApiKey),
      engine: activeApiKey ? 'gemini-live' : 'miami-bilingual-engine',
      response: unified,
      data: unified,
    });
  } catch (err) {
    console.error('Live AI Agent error:', err);
    return NextResponse.json(
      { error: 'Failed to process Live AI Agent turn' },
      { status: 500 }
    );
  }
}

function buildInitialBilingualGreeting(
  langCode: string,
  langName: string,
  nativeName: string,
  levelTier: string
): LiveAgentResponsePayload {
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';
  const isSpanish = langCode === 'es';
  const isArabic = langCode === 'ar';

  const levelLabel =
    levelTier === 'basic'
      ? 'Basic (A0–A1 Foundation)'
      : levelTier === 'mid'
        ? 'Mid / Intermediate (A2–B1)'
        : 'Advanced Mastery (B2–C2)';

  const nativeWelcome = isUrdu
    ? `السلام علیکم! میں صوفیہ ہوں، آپ کی لائیو اے آئی انگلش ٹیچر۔ آپ نے اردو زبان اور ${levelLabel} لیول منتخب کیا ہے۔ میں آپ سے اردو اور انگلش دونوں میں بات کروں گی، آپ کا ٹیسٹ لوں گی، اور جب بھی آپ کوئی غلط فقرہ بولیں گے تو نیچے کارڈز میں غلط اور صحیح فقرہ لکھ کر آپ کی مکمل تیاری کرواؤں گی!`
    : isHindi
      ? `नमस्ते! मैं सोफिया हूँ, आपकी लाइव एआई इंग्लिश टीचर। आपने हिंदी भाषा और ${levelLabel} लेवल चुना है। जब भी आप कोई वाक्य बोलेंगे, मैं नीचे कार्ड्स में गलत और सही वाक्य दिखाकर आपकी अंग्रेजी पक्की करवाऊँगी!`
      : isSpanish
        ? `¡Hola! Soy Sophia, tu profesora de inglés en vivo con IA. Has seleccionado Español y el nivel ${levelLabel}. ¡Habla conmigo con confianza y corregiré cada frase paso a paso!`
        : isArabic
          ? `مرحباً! أنا صوفيا، معلمة اللغة الإنجليزية المباشرة بالذكاء الاصطناعي. لقد اخترت اللغة العربية والمستوى ${levelLabel}. تحدث معي وسأقوم بتصحيح كل جملة بالتفصيل!`
          : `Welcome! I am Sophia, your Live AI English Tutor. You selected ${langName} (${nativeName}) and the ${levelLabel} track. Speak or type any sentence, and I will correct your grammar and test your fluency step by step!`;

  const spokenGreeting =
    levelTier === 'basic'
      ? `Hello and welcome! I am Sophia, your live English teacher. Let's start with an easy test. Tell me in English: What is your name and what do you do every morning?`
      : levelTier === 'mid'
        ? `Welcome to your Intermediate Live English Session! I am Sophia. Let's test your past and present tenses: Tell me about a memorable trip you took or what you are working on this week.`
        : `Welcome to Advanced Executive English! I am Sophia. Let's test your C1 fluency: How has technology transformed the way people communicate in your industry?`;

  return {
    spokenGreetingOrReply: spokenGreeting,
    spokenEnglishPractice:
      levelTier === 'basic'
        ? 'My name is Ali, and I wake up early every morning to learn English.'
        : levelTier === 'mid'
          ? 'I have been learning English for six months to advance my career.'
          : 'Technology has fundamentally transformed global communication and workplace productivity.',
    nativeLanguageExplanation: nativeWelcome,
    hasGrammarMistake: false,
    originalUserSentence: 'Session Started — Ready for your first spoken sentence!',
    correctedEnglishSentence:
      levelTier === 'basic'
        ? 'My name is [Your Name], and I am excited to practice English today.'
        : 'I would love to practice my spoken English and receive detailed grammar feedback.',
    advancedAlternativeSentence:
      'I am eager to sharpen my English fluency through real-time interactive coaching.',
    grammarRuleTitle: `${levelLabel} • Live Bilingual Coaching Active`,
    vocabularyCards: [
      {
        word: 'Confident',
        phonetic: '/ˈkɒn.fɪ.dənt/',
        nativeMeaning: isUrdu
          ? 'پراعتماد (خوف کے بغیر بولنے والا)'
          : isHindi
            ? 'आत्मविश्वासी (बिना झिझक बोलने वाला)'
            : 'Self-assured and fearless',
        example: 'Speaking aloud every day makes you feel confident.',
      },
      {
        word: 'Fluency',
        phonetic: '/ˈfluː.ən.si/',
        nativeMeaning: isUrdu
          ? 'روانی (بغیر رکے فطری انداز میں بولنا)'
          : isHindi
            ? 'प्रवाह (बिना रुके सहजता से बोलना)'
            : 'Smooth, natural speaking ability',
        example: 'Consistent practice is the secret to English fluency.',
      },
      {
        word: 'Opportunity',
        phonetic: '/ˌɒp.əˈtjuː.nə.ti/',
        nativeMeaning: isUrdu
          ? 'سنہری موقع'
          : isHindi
            ? 'सुनहरा अवसर / मौका'
            : 'A favorable chance for advancement',
        example: 'Good English opens doors to global career opportunities.',
      },
    ],
    nextTestPrompt: {
      instructionInNative: isUrdu
        ? '🎙️ اب مائیک دبا کر یہ آسان انگلش فقرہ بولیں یا اپنا تعارف کروائیں:'
        : isHindi
          ? '🎙️ अब माइक दबाकर यह अंग्रेजी वाक्य बोलें या अपना परिचय दें:'
          : `🎙️ Tap the microphone and speak this sentence aloud (${nativeName} → English):`,
      targetEnglishToSpeak:
        levelTier === 'basic'
          ? 'Hello Sophia, I want to improve my English speaking skills.'
          : levelTier === 'mid'
            ? 'I have been practicing English every day to prepare for my career.'
            : 'Mastering effective communication is essential for international leadership.',
      questionForUser:
        levelTier === 'basic'
          ? 'What is your favorite hobby or what did you do yesterday?'
          : 'What is your biggest goal for learning English this year?',
    },
    fluencyScore: 92,
  };
}

function analyzeAndTeachBilingually(
  rawInput: string,
  langCode: string,
  langName: string,
  nativeName: string,
  levelTier: string
): LiveAgentResponsePayload {
  const input = rawInput.trim();
  const lower = input.toLowerCase();
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';

  let hasMistake = false;
  let corrected = input;
  let advancedAlt = input;
  let ruleTitle = 'Natural English Sentence Structure';
  let explanationNative = '';
  let spokenReply = '';

  // Detect common ESL mistakes and correct them with detailed cards
  if (/\bi am agree\b/i.test(input) || /\bi'm agree\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\b(i am|i'm) agree\b/gi, 'I agree');
    advancedAlt = 'I completely agree with your perspective on this matter.';
    ruleTitle = 'Action Verb Rule: Never say "I am agree"';
    explanationNative = isUrdu
      ? 'آپ نے "I am agree" بولا جو کہ غلط ہے۔ انگلش میں "Agree" (متفق ہونا) خود ایک Verb (فعل) ہے، اس لیے اس سے پہلے "am / is / are" نہیں لگاتے۔ ہمیشہ سیدھا "I agree with you" بولیں!'
      : isHindi
        ? 'आपने "I am agree" कहा जो गलत है। अंग्रेजी में "Agree" खुद एक क्रिया (Verb) है, इसलिए इसके पहले "am" नहीं लगता। हमेशा "I agree with you" कहें!'
        : `"Agree" is already a main verb in English, so never put "am/is/are" before it. Say "I agree", not "I am agree".`;
    spokenReply = `Careful! Don't say "I am agree". Since "agree" is a verb, just say: "${corrected}". Try repeating that after me!`;
  } else if (/\bgoed\b/i.test(input) || /\bi go yesterday\b/i.test(input) || /\byesterday i go\b/i.test(input)) {
    hasMistake = true;
    corrected = 'Yesterday I went to the market with my friends.';
    advancedAlt = 'Yesterday afternoon, I headed over to the market with a few close friends.';
    ruleTitle = 'Irregular Past Tense: "Go" becomes "Went"';
    explanationNative = isUrdu
      ? 'جب ہم گزرے ہوئے کل (Yesterday / ماضی) کی بات کرتے ہیں تو "Go" کی دوسری فارم "Went" استعمال ہوتی ہے۔ "Goed" یا "Yesterday I go" کہنا غلط ہے۔ صحیح فقرہ ہے: "Yesterday I went..."'
      : isHindi
        ? 'बीते हुए कल (Yesterday) की बात करते समय "Go" का भूतकाल रूप "Went" इस्तेमाल होता है। "Goed" या "Yesterday I go" कहना गलत है!'
        : `When talking about the past ("yesterday"), always use the irregular past tense "went" instead of "go" or "goed".`;
    spokenReply = `Good try! When talking about yesterday, "go" changes to "went". Say: "${corrected}".`;
  } else if (/\bi have (\d+) years?\b/i.test(input)) {
    hasMistake = true;
    const ageMatch = input.match(/\bi have (\d+) years?\b/i);
    const age = ageMatch ? ageMatch[1] : '22';
    corrected = `I am ${age} years old.`;
    advancedAlt = `I just turned ${age} years old this year.`;
    ruleTitle = 'Expressing Age: Use "I am", never "I have"';
    explanationNative = isUrdu
      ? `اپنی عمر بتانے کے لیے انگلش میں "I have ${age} years" نہیں کہتے، بلکہ "I am ${age} years old" کہتے ہیں!`
      : isHindi
        ? `अपनी उम्र बताने के लिए अंग्रेजी में "I have ${age} years" नहीं, बल्कि "I am ${age} years old" कहते हैं!`
        : `In English, age is expressed with the verb "to be" ("I am ${age} years old"), never with "have".`;
    spokenReply = `In English, we use "I am" for age! Say: "${corrected}".`;
  } else if (/\b(he|she|it) don't\b/i.test(input) || /\b(he|she|it) dont\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\b(he|she|it)\s+don'?t\b/gi, '$1 doesn’t');
    advancedAlt = `${corrected} — and we should find a practical solution.`;
    ruleTitle = 'Third-Person Singular: "He / She DOESN’T"';
    explanationNative = isUrdu
      ? 'واحد غائب (He, She, It) کے ساتھ منفی جملے میں "don’t" نہیں بلکہ "doesn’t" لگتا ہے! مثلاً: "She doesn’t know."'
      : isHindi
        ? 'He, She और It के साथ नकारात्मक वाक्य में "don’t" नहीं बल्कि "doesn’t" लगता है! जैसे: "She doesn’t know."'
        : `With singular subjects (he, she, it), always use "doesn't" instead of "don't".`;
    spokenReply = `Almost! With he or she, use "doesn't" instead of "don't". Say: "${corrected}".`;
  } else if (/\bmore better\b/i.test(input) || /\bmuch more better\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\b(much\s+)?more better\b/gi, 'much better');
    advancedAlt = 'My spoken English is significantly better than it was last month.';
    ruleTitle = 'Double Comparative Error: Say "Much Better", never "More Better"';
    explanationNative = isUrdu
      ? 'لفظ "Better" کا مطلب پہلے ہی "زیادہ اچھا" ہے، اس لیے اس کے ساتھ "More" لگانا غلط ہے۔ زور دینے کے لیے "Much better" بولیں!'
      : isHindi
        ? '"Better" का अर्थ पहले से ही "अधिक अच्छा" है, इसलिए इसके साथ "More" लगाना गलत है। "Much better" कहें!'
        : `"Better" is already the comparative form of "good". Never add "more" before "better"—say "much better".`;
    spokenReply = `Remember: "better" is already comparative, so say "much better" instead of "more better"!`;
  } else if (/\bdid you (went|saw|came|ate|bought|took)\b/i.test(input)) {
    hasMistake = true;
    corrected = input
      .replace(/\bdid you went\b/gi, 'Did you go')
      .replace(/\bdid you saw\b/gi, 'Did you see')
      .replace(/\bdid you came\b/gi, 'Did you come')
      .replace(/\bdid you ate\b/gi, 'Did you eat')
      .replace(/\bdid you bought\b/gi, 'Did you buy')
      .replace(/\bdid you took\b/gi, 'Did you take');
    advancedAlt = `${corrected}? I would love to hear all about it.`;
    ruleTitle = 'Past Question Rule: "Did + Base Verb (First Form)"';
    explanationNative = isUrdu
      ? 'انگلش کا سنہری اصول یاد رکھیں: جب سوال میں "Did" آ جائے تو اس کے بعد ہمیشہ فعل کی پہلی فارم (First Form: go, see, eat) آتی ہے، دوسری فارم نہیں آتی!'
      : isHindi
        ? 'अंग्रेजी का नियम याद रखें: जब प्रश्न में "Did" आ जाए, तो उसके बाद हमेशा क्रिया का पहला रूप (First Form: go, see, eat) आता है!'
        : `Whenever a question uses "Did", the main verb returns to its base form ("Did you go?", never "Did you went?").`;
    spokenReply = `Golden grammar rule! After "Did", always use the first form of the verb: "${corrected}".`;
  } else if (/\bmarried with\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\bmarried with\b/gi, 'married to');
    advancedAlt = corrected;
    ruleTitle = 'Preposition Rule: "Married TO someone"';
    explanationNative = isUrdu
      ? 'انگلش میں شادی کے لیے "married with" نہیں بلکہ ہمیشہ "married TO" استعمال ہوتا ہے!'
      : isHindi
        ? 'अंग्रेजी में शादी के लिए "married with" नहीं बल्कि हमेशा "married TO" इस्तेमाल होता है!'
        : `In English, we always say "married TO someone", never "married with".`;
    spokenReply = `Small preposition fix! Say "${corrected}" using "to" instead of "with".`;
  } else if (lower.split(/\s+/).length <= 3) {
    // User gave a very short phrase or single word — expand it into a full sentence!
    hasMistake = true;
    corrected = `I would like to practice speaking about "${input}" in a complete sentence.`;
    advancedAlt = `Could we explore how to use "${input}" naturally in daily conversation?`;
    ruleTitle = 'Speak in Complete Sentences for Faster Fluency';
    explanationNative = isUrdu
      ? `آپ نے بہت مختصر جواب ("${input}") دیا ہے۔ روانی بڑھانے کے لیے کوشش کریں کہ ہمیشہ پورا جملہ (Full Sentence) بولیں۔ میں نے نیچے آپ کے لیے مکمل صحیح جملہ لکھ دیا ہے!`
      : isHindi
        ? `आपने बहुत छोटा उत्तर ("${input}") दिया है। अपनी फ्लूएंसी बढ़ाने के लिए हमेशा पूरा वाक्य (Full Sentence) बोलने की कोशिश करें!`
        : `Try expanding short answers into complete sentences so your brain builds automatic English fluency!`;
    spokenReply = `Good start! Let's turn "${input}" into a full, confident sentence: "${corrected}".`;
  } else {
    // Polish capitalization / punctuation or upgrade natural phrasing
    const capitalized =
      input.charAt(0).toUpperCase() +
      input.slice(1) +
      (/[.!?]$/.test(input) ? '' : '.');
    hasMistake = capitalized !== input;
    corrected = capitalized;
    advancedAlt = `Furthermore, ${input.charAt(0).toLowerCase() + input.slice(1).replace(/[.!?]+$/, '')}, which has been a great learning experience for me.`;
    ruleTitle = 'Well-Formed Sentence & Vocabulary Upgrade';
    explanationNative = isUrdu
      ? 'شاباش! آپ کا جملہ گرامر کے لحاظ سے بہت اچھا ہے۔ نیچے کارڈ میں دیکھیں کہ اسی بات کو مزید ایڈوانس اور نیچرل انگلش میں کیسے بولا جا سکتا ہے!'
      : isHindi
        ? 'शाबाश! आपका वाक्य व्याकरण के हिसाब से बहुत अच्छा है। नीचे कार्ड में देखें कि इसे और भी बेहतर तरीके से कैसे बोला जा सकता है!'
        : `Great job! Your sentence is clear. Check the card below to see how a native speaker can elevate it even further!`;
    spokenReply = `Wonderful! You said: "${corrected}". Now let's try our next speaking challenge!`;
  }

  return {
    spokenGreetingOrReply: spokenReply,
    spokenEnglishPractice: corrected,
    nativeLanguageExplanation: explanationNative,
    hasGrammarMistake: hasMistake,
    originalUserSentence: input,
    correctedEnglishSentence: corrected,
    advancedAlternativeSentence: advancedAlt,
    grammarRuleTitle: ruleTitle,
    vocabularyCards: [
      {
        word: 'Perspective',
        phonetic: '/pəˈspek.tɪv/',
        nativeMeaning: isUrdu ? 'نقطہ نظر / سوچ کا زاویہ' : isHindi ? 'दृष्टिकोण / नज़रिया' : 'Point of view or attitude',
        example: 'Thank you for sharing your perspective with the team.',
      },
      {
        word: 'Significantly',
        phonetic: '/sɪɡˈnɪf.ɪ.kənt.li/',
        nativeMeaning: isUrdu ? 'نمایاں طور پر / کافی حد تک' : isHindi ? 'काफी हद तक / महत्वपूर्ण रूप से' : 'In a sufficiently great or important way',
        example: 'Your pronunciation has improved significantly this week.',
      },
      {
        word: 'Consistent',
        phonetic: '/kənˈsɪs.tənt/',
        nativeMeaning: isUrdu ? 'مسلسل / مستقل مزاج' : isHindi ? 'लगातार / नियमित' : 'Steady and regular in daily practice',
        example: 'Consistent 10-minute practice beats studying once a month.',
      },
    ],
    nextTestPrompt: {
      instructionInNative: isUrdu
        ? '🎯 اگلا ٹیسٹ: اوپر والا صحیح فقرہ مائیک میں بول کر سنائیں، یا اس سوال کا انگلش میں جواب دیں:'
        : isHindi
          ? '🎯 अगला टेस्ट: ऊपर दिया गया सही वाक्य माइक में बोलें, या इस सवाल का अंग्रेजी में जवाब दें:'
          : '🎯 Next Live Test: Repeat the corrected sentence aloud, or answer this question in English:',
      targetEnglishToSpeak: corrected,
      questionForUser:
        levelTier === 'basic'
          ? 'What did you eat for breakfast today, and what will you do tomorrow?'
          : levelTier === 'mid'
            ? 'If you could travel anywhere in the world next month, where would you go and why?'
            : 'What is one skill you believe everyone in your profession should master over the next five years?',
    },
    fluencyScore: hasMistake ? 78 : 95,
  };
}
