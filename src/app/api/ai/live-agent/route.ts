import { NextRequest, NextResponse } from 'next/server';
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

const ROLEPLAY_SCENARIOS: Record<
  string,
  {
    title: string;
    teacherRole: string;
    studentRole: string;
    openingLine: string;
    openingTargetReply: string;
    followUpQuestions: string[];
    sampleTargetReplies: string[];
    urduContext: string;
    hindiContext: string;
  }
> = {
  job_interview: {
    title: 'Job Interview at a Multinational Company',
    teacherRole: 'Senior HR Hiring Manager in Miami',
    studentRole: 'Job Candidate',
    openingLine:
      'Good morning and welcome to our Miami office! Please have a seat. To kick things off, tell me a little bit about yourself and what kind of work excites you most.',
    openingTargetReply:
      'Thank you so much for having me! I have two years of experience in my field, and I genuinely enjoy solving real problems with a team.',
    followUpQuestions: [
      'That sounds great! What would you say is your biggest strength at work, and can you share a quick example?',
      'Tell me about a tough deadline or challenge you handled recently. What did you do to fix it?',
      'Why do you want to work with our international team here, and what are you hoping to learn next?',
      'Do you prefer leading a group or focusing deeply on independent tasks?',
    ],
    sampleTargetReplies: [
      'My biggest strength is staying calm under pressure and communicating clearly with my teammates.',
      'Last month a client moved our deadline up by three days, so I organized quick morning check-ins and we finished on time.',
      'I admire your global culture, and I want to grow my skills while contributing to meaningful projects.',
      'I enjoy both, though collaborating with a motivated team brings out my best ideas.',
    ],
    urduContext:
      '🎭 جاب انٹرویو رول پلے: میں امریکی کمپنی کی ایچ آر مینیجر (HR Manager) ہوں اور آپ انٹرویو دے رہے ہیں۔ مجھ سے بالکل ویسے ہی بات کریں جیسے اصلی انٹرویو میں کرتے ہیں — میں جواب بھی دوں گی اور نیچے آپ کا جملہ پروفیشنل انگلش میں درست بھی کروں گی!',
    hindiContext:
      '🎭 जॉब इंटरव्यू रोलप्ले: मैं एचआर मैनेजर (HR Manager) हूँ और आप इंटरव्यू दे रहे हैं। असली इंटरव्यू की तरह अंग्रेजी में जवाब दें!',
  },
  cafe_order: {
    title: 'Ordering at a Miami Beach Cafe & Restaurant',
    teacherRole: 'Friendly Miami Beach Barista & Server',
    studentRole: 'Cafe Customer',
    openingLine:
      'Hey there, welcome to Ocean Drive Cafe! It is a gorgeous sunny morning in Miami. What can I get started for you today?',
    openingTargetReply:
      'Hi! Could I please get a medium iced latte with oat milk and a warm chocolate croissant?',
    followUpQuestions: [
      'Awesome choice! Would you like that for here or to go? And are you in the mood for anything sweet or savory to eat?',
      'Got it! Your total comes to eleven dollars and fifty cents. Are you paying by card or cash today?',
      'Here you go, enjoy your coffee! Are you visiting Miami on vacation or do you live nearby?',
    ],
    sampleTargetReplies: [
      'For here, please! Could you also add a toasted avocado sandwich?',
      'I will pay by card, please. Could I also grab a glass of cold water?',
      'Thank you! I am visiting for a few days and exploring the beach.',
    ],
    urduContext:
      '🎭 کیفے اور ریسٹورنٹ رول پلے: میں میامی بیچ کیفے میں ویٹرس ہوں اور آپ کسٹمر ہیں۔ شائستہ انگلش ("Could I please get..." یا "I would like...") استعمال کر کے آرڈر دیں!',
    hindiContext:
      '🎭 कैफे और रेस्तरां रोलप्ले: मैं मियामी बीच कैफे में बरिस्ता हूँ। विनम्र अंग्रेजी में अपना ऑर्डर दें!',
  },
  airport_immigration: {
    title: 'Airport Check-In & US Customs Immigration',
    teacherRole: 'US Customs & Border Protection Officer at Miami Airport',
    studentRole: 'International Traveler',
    openingLine:
      'Welcome to Miami International Airport. May I see your passport please? What is the main purpose of your trip to the United States?',
    openingTargetReply:
      'Here is my passport, Officer. I am visiting Miami for a two-week vacation and sightseeing.',
    followUpQuestions: [
      'Thank you. How many days will you be staying, and which hotel or address will you stay at?',
      'Are you bringing any fresh food, fruit, or more than ten thousand dollars in cash with you today?',
      'Have you already booked your return flight home, and what places do you hope to visit?',
    ],
    sampleTargetReplies: [
      'I will be staying for fourteen days at the Grand Bay Hotel near downtown Miami.',
      'No, Officer, I do not have any food items or large amounts of cash.',
      'Yes, my return ticket is on the twentieth of this month, and I want to see Miami Beach.',
    ],
    urduContext:
      '🎭 ایئرپورٹ اور امیگریشن رول پلے: میں میامی ایئرپورٹ پر امیگریشن آفیسر ہوں۔ اعتماد کے ساتھ اپنے سفر کا مقصد اور ہوٹل کی تفصیلات انگلش میں بتائیں!',
    hindiContext:
      '🎭 एयरपोर्ट और इमिग्रेशन रोलप्ले: मैं मियामी एयरपोर्ट पर इमिग्रेशन ऑफिसर हूँ। आत्मविश्वास से अंग्रेजी में जवाब दें!',
  },
  doctor_visit: {
    title: 'Doctor Appointment & Medical Consultation',
    teacherRole: 'Dr. Sophia at Miami Medical Center',
    studentRole: 'Patient',
    openingLine:
      'Hello, please come in and sit comfortably. I am Doctor Sophia. Tell me, what brings you to the clinic today and how have you been feeling?',
    openingTargetReply:
      'Hello Doctor. I have had a sore throat and a mild fever for the past two days.',
    followUpQuestions: [
      'I understand. Have you noticed any headache, cough, or trouble sleeping at night?',
      'Have you taken any medicine for this yet, and do you have any allergies to medications?',
      'I am going to give you a simple prescription and recommend rest and warm fluids. Do you have any questions about your recovery?',
    ],
    sampleTargetReplies: [
      'Yes, Doctor, I also feel quite tired in the evening and have a slight cough.',
      'I took one painkiller yesterday, and I am not allergic to any medicine.',
      'Thank you, Doctor. Should I take these tablets before or after meals?',
    ],
    urduContext:
      '🎭 ڈاکٹر کلینک رول پلے: میں ڈاکٹر صوفیہ ہوں۔ اپنی علامات مثلاً بخار، کھانسی یا گلا خراب انگلش میں بیان کریں!',
    hindiContext:
      '🎭 डॉक्टर क्लिनिक रोलप्ले: मैं डॉक्टर सोफिया हूँ। अपने लक्षण अंग्रेजी में बताएं!',
  },
  hotel_checkin: {
    title: '5-Star Hotel Check-In & Concierge',
    teacherRole: 'Front Desk Manager at Miami Oceanfront Resort',
    studentRole: 'Hotel Guest',
    openingLine:
      'Good afternoon and welcome to the Miami Oceanfront Resort! How can I make your check-in smooth today?',
    openingTargetReply:
      'Good afternoon! I have a reservation under my name for three nights with an ocean view.',
    followUpQuestions: [
      'Found it right here! Would you prefer a quiet room on a higher floor, and can we help carry your bags?',
      'Breakfast is served from seven to ten on the terrace. Would you like me to recommend some great restaurants nearby?',
    ],
    sampleTargetReplies: [
      'A quiet room on a high floor would be wonderful, thank you! Yes, please help with my suitcase.',
      'That sounds great! What time does the swimming pool close tonight?',
    ],
    urduContext:
      '🎭 ہوٹل چیک اِن رول پلے: آپ میامی کے فائیو اسٹار ہوٹل میں آئے ہیں۔ اپنی بکنگ اور پسند کا کمرہ انگلش میں بتائیں!',
    hindiContext:
      '🎭 होटल चेक-इन रोलप्ले: अपनी बुकिंग और कमरे की पसंद अंग्रेजी में बताएं!',
  },
  business_meeting: {
    title: 'Executive Client Meeting & Project Pitch',
    teacherRole: 'VP of Product at a US Tech Partner',
    studentRole: 'Project Lead / Consultant',
    openingLine:
      'Thanks for hopping on the call today! Walk me through where your team stands on the project and what our top priority should be this week.',
    openingTargetReply:
      'Thank you for having me! Our team completed the first phase ahead of schedule, and now we are running final quality checks.',
    followUpQuestions: [
      'Love to hear that momentum! Are there any technical risks or blockers our Miami team should help clear right now?',
      'If we launch on Monday, how will you measure whether users are loving the new release?',
    ],
    sampleTargetReplies: [
      'Our main priority is finishing payment testing by Thursday, and your API feedback tomorrow will keep us on track.',
      'We will track daily user engagement and customer feedback during the first week.',
    ],
    urduContext:
      '🎭 بزنس میٹنگ رول پلے: ہم امریکی کلائنٹ کے ساتھ کال پر ہیں۔ پراجیکٹ کی پیشرفت اور پلان پروفیشنل بزنس انگلش میں بتائیں!',
    hindiContext:
      '🎭 बिजनेस मीटिंग रोलप्ले: अपने प्रोजेक्ट की प्रगति प्रोफेशनल अंग्रेजी में बताएं!',
  },
};

function toUnifiedResponse(
  raw: Partial<LiveAgentResponsePayload>,
  langCode: string,
  userMessageFallback = ''
) {
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';
  const spoken = (
    raw.spokenGreetingOrReply ||
    'That is great to hear! Keep going and tell me a little more about it.'
  )
    .replace(/[*#_~`]/g, '')
    .trim();
  const explanation =
    raw.nativeLanguageExplanation ||
    (isUrdu
      ? 'آپ کا جملہ نیچے کارڈ میں چیک کر دیا گیا ہے۔ درست جملے کو سنیں اور فطری انداز میں بول کر مشق کریں!'
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
      raw.originalUserSentence ||
      userMessageFallback ||
      'Live session started — speak naturally!',
    correctedEnglishSentence: corrected,
    advancedAlternativeSentence:
      raw.advancedAlternativeSentence ||
      'I am committed to expressing my ideas with confidence and natural fluency.',
    grammarRuleTitle:
      raw.grammarRuleTitle || 'Natural Spoken English Coaching',
    vocabularyCards:
      Array.isArray(raw.vocabularyCards) && raw.vocabularyCards.length > 0
        ? raw.vocabularyCards.slice(0, 3)
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
          ? '🎯 اب آپ کی باری ہے — مائیک خود آن ہو جائے گا، بس فطری انداز میں جواب دیں:'
          : '🎯 Your Turn — speak naturally when the mic lights up:'),
      targetEnglishToSpeak:
        raw.nextTestPrompt?.targetEnglishToSpeak || corrected,
      questionForUser:
        raw.nextTestPrompt?.questionForUser ||
        'What is something interesting that happened in your week?',
    },
    fluencyScore: typeof raw.fluencyScore === 'number' ? raw.fluencyScore : 88,
    spokenTeacherReply: spoken,
    nativeLanguageGreetingOrFeedback: explanation,
    hasMistake: Boolean(raw.hasGrammarMistake),
    mistakeExplanationInNative: explanation,
    encouragementInNative: isUrdu
      ? 'شاباش! بالکل حقیقی کال کی طرح آرام اور اعتماد سے بات کریں!'
      : isHindi
        ? 'शाबाश! बिल्कुल असली कॉल की तरह आराम और आत्मविश्वास से बात करें!'
        : 'Awesome! Speak just like you are on a real voice call with a friendly coach!',
    grammarScore: raw.hasGrammarMistake ? 76 : 96,
  };
}

export async function GET() {
  const config: any = readSiteConfig();
  const hasApiKey = Boolean(
    (config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim()
  );
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
      hasApiKey: Boolean(
        (config.geminiApiKey || process.env.GEMINI_API_KEY || '').trim()
      ),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to save API key' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = String(body.message ?? body.userMessage ?? '').trim();
    const nativeLangCode = String(
      body.nativeLanguage ?? body.nativeLangCode ?? 'ur'
    );
    const levelTier = String(body.level ?? body.levelTier ?? 'basic');
    const sessionMode = String(body.sessionMode ?? 'teaching');
    const roleplayScenario = String(body.roleplayScenario ?? 'job_interview');
    const conversationHistory: { user?: string; agent?: string }[] =
      Array.isArray(body.conversationHistory) ? body.conversationHistory : [];
    const turnCount = Number(body.turnCount || conversationHistory.length || 0);
    const apiKeyOverride = String(body.apiKeyOverride ?? '').trim();
    const saveApiKey = Boolean(body.saveApiKey);
    const isInitialGreeting = Boolean(body.isInitialGreeting);

    const config: any = readSiteConfig();
    if (saveApiKey && apiKeyOverride) {
      config.geminiApiKey = apiKeyOverride;
      writeSiteConfig(config);
    }

    const activeApiKey = (
      apiKeyOverride ||
      config.geminiApiKey ||
      process.env.GEMINI_API_KEY ||
      ''
    ).trim();

    const langInfo = getBaseLanguageInfo(nativeLangCode);

    // 1. Initial Greeting when user launches call or switches Mode / Roleplay
    if (isInitialGreeting || !userMessage) {
      const greetingPayload = buildInitialBilingualGreeting(
        nativeLangCode,
        langInfo.name,
        langInfo.nativeName,
        levelTier,
        sessionMode,
        roleplayScenario
      );
      const unified = toUnifiedResponse(greetingPayload, nativeLangCode);
      return NextResponse.json({
        success: true,
        usingGeminiLiveKey: Boolean(activeApiKey),
        engine: activeApiKey ? 'gemini-3-flash' : 'miami-bilingual-engine',
        response: unified,
        data: unified,
      });
    }

    // 2. Call Active Gemini Models with full multi-turn conversation history!
    if (activeApiKey) {
      const scenarioInfo =
        ROLEPLAY_SCENARIOS[roleplayScenario] ||
        ROLEPLAY_SCENARIOS.job_interview;

      const modeDirective =
        sessionMode === 'roleplay'
          ? `ACTIVE MODE: LIVE ROLEPLAY SCENARIO -> "${scenarioInfo.title}". You are playing "${scenarioInfo.teacherRole}" and the student is "${scenarioInfo.studentRole}".
- Stay genuinely IN CHARACTER in spokenGreetingOrReply! Respond naturally to what the student actually said, keep the conversation alive with a realistic follow-up question, and if they made a noticeable mistake, slip in a super brief, friendly 1-second coaching tip OR explain it thoroughly in nativeLanguageExplanation while keeping the roleplay flowing smoothly!`
          : sessionMode === 'guided_lesson'
            ? `ACTIVE MODE: STEP-BY-STEP GUIDED SPEAKING CLASS (Turn ${turnCount + 1}).
- Warmly react to the student's sentence like a caring human tutor on a video call, teach/fix any grammar mistake gently, explain why, give a 1-sentence mini lesson on a practical English structure, and invite them to try the next guided speaking challenge.`
            : `ACTIVE MODE: VIRAL REELS-STYLE LIVE 1-ON-1 ENGLISH TEACHER CALL.
- Talk EXACTLY like a warm, charismatic, realistic human English teacher on a real video call (like Praktika / Speak / famous Instagram Reels AI coaches).
- React personally to what the student meant or talked about FIRST!
- NEVER robotically echo/parrot their whole sentence back at them like "Well said, <sentence> is correct." Instead, respond naturally to their idea, gently point out any wrong phrase (only if there is a mistake) with the natural fix, and ask an interesting conversational question to keep them talking!`;

      const levelDirective =
        levelTier === 'basic'
          ? 'Student Level: BASIC (CEFR A0-A1). Use warm, simple, clear English in spokenGreetingOrReply, and give very clear, supportive step-by-step explanations in their native language.'
          : levelTier === 'mid'
            ? 'Student Level: INTERMEDIATE (CEFR A2-B1). Hold an engaging natural conversation, catch tense/preposition/article slips, and upgrade their phrasing to confident B2 English.'
            : 'Student Level: ADVANCED (CEFR B2-C2). Speak at a natural native pace, polish subtle nuances/idioms/word choices, and challenge them with thoughtful executive or real-world questions.';

      const historyText = conversationHistory
        .slice(-6)
        .filter((h) => h.user || h.agent)
        .map(
          (h, i) =>
            `Turn ${i + 1}:\n- Student said: "${h.user || ''}"\n- Sophia replied: "${h.agent || ''}"`
        )
        .join('\n');

      const systemPrompt = `You are "Sophia", a realistic, warm, charismatic human-like Live AI English Teacher at TICI Language Institute Miami.
The student's native language is: ${langInfo.name} (${langInfo.nativeName}, code: ${nativeLangCode}).
${levelDirective}
${modeDirective}

${historyText ? `Recent Call History:\n${historyText}\n` : ''}
The student JUST said on the live call:
"${userMessage}"

Note: The student may have spoken imperfect English, mixed in some ${langInfo.name}/Roman Urdu/Hindi words, or had speech-to-text typos. Understand their REAL meaning!
- In "spokenGreetingOrReply": Write 2 to 4 natural, warm, conversational sentences in pure spoken English (NO emojis, NO markdown asterisks, NO bullet points, because this exact string is sent to Gemini Studio Voice TTS!). Sound 100% like a friendly real human teacher reacting to them on a call and asking the next natural question. Never start with "Well said!" and never parrot their sentence verbatim if it wasn't broken.
- In "hasGrammarMistake": Set true ONLY if their English actually has a grammar, tense, article, preposition, word-order, or unnatural phrasing mistake (or if they used non-English words they need help translating). Set false if their sentence was already good English!
- In "correctedEnglishSentence": If hasGrammarMistake is true, write the 100% accurate, natural fix of what they meant. If hasGrammarMistake is false, polish it slightly or return the clean capitalized sentence.
- In "advancedAlternativeSentence": Give a natural native-speaker / C1-level upgrade of the same idea.
- In "nativeLanguageExplanation": Explain clearly in ${langInfo.name} (${langInfo.nativeName} script; if Urdu, write natural, easy-to-read Urdu clearly highlighting what was wrong vs. why the corrected sentence is right!). Make this genuinely educational and encouraging.
- Provide 3 useful, level-appropriate "vocabularyCards" related to THIS conversation topic with ${langInfo.nativeName} meanings.
- In "nextTestPrompt": Give the exact conversational question you asked at the end of spokenGreetingOrReply in "questionForUser", a sample natural answer they could say in "targetEnglishToSpeak", and short guidance in ${langInfo.nativeName} in "instructionInNative".

Return STRICTLY valid JSON matching this schema:
{
  "spokenGreetingOrReply": "string",
  "spokenEnglishPractice": "string",
  "nativeLanguageExplanation": "string",
  "hasGrammarMistake": boolean,
  "originalUserSentence": "string",
  "correctedEnglishSentence": "string",
  "advancedAlternativeSentence": "string",
  "grammarRuleTitle": "string",
  "vocabularyCards": [
    { "word": "string", "phonetic": "/IPA/", "nativeMeaning": "string", "example": "string" }
  ],
  "nextTestPrompt": {
    "instructionInNative": "string",
    "targetEnglishToSpeak": "string",
    "questionForUser": "string"
  },
  "fluencyScore": number
}`;

      const candidateModels = [
        'gemini-3-flash-preview',
        'gemini-flash-lite-latest',
        'gemini-3.8-flash',
      ];

      for (const modelName of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
            activeApiKey
          )}`;

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.75,
              },
            }),
            signal: AbortSignal.timeout(12000),
          });

          if (res.ok) {
            const json = await res.json();
            const rawText = String(
              json?.candidates?.[0]?.content?.parts?.[0]?.text || ''
            )
              .replace(/^```json\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();

            if (rawText) {
              const parsed = JSON.parse(rawText);
              const unified = toUnifiedResponse(
                parsed,
                nativeLangCode,
                userMessage
              );
              return NextResponse.json({
                success: true,
                usingGeminiLiveKey: true,
                engine: modelName,
                response: unified,
                data: unified,
              });
            }
          } else {
            const errTxt = await res.text().catch(() => '');
            console.warn(
              `Gemini chat (${modelName}) HTTP ${res.status}:`,
              errTxt.slice(0, 200)
            );
          }
        } catch (geminiErr) {
          console.warn(`Gemini chat (${modelName}) failed:`, geminiErr);
        }
      }
    }

    // 3. Smart Bilingual Diagnostic & Teaching Fallback Engine (only if offline / no key)
    const smartPayload = analyzeAndTeachBilingually(
      userMessage,
      nativeLangCode,
      langInfo.name,
      langInfo.nativeName,
      levelTier,
      sessionMode,
      roleplayScenario,
      turnCount
    );
    const unified = toUnifiedResponse(smartPayload, nativeLangCode, userMessage);

    return NextResponse.json({
      success: true,
      usingGeminiLiveKey: Boolean(activeApiKey),
      engine: 'miami-bilingual-engine',
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
  levelTier: string,
  sessionMode = 'teaching',
  roleplayScenario = 'job_interview'
): LiveAgentResponsePayload {
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';

  const levelLabel =
    levelTier === 'basic'
      ? 'Basic (A0–A1 Foundation)'
      : levelTier === 'mid'
        ? 'Mid / Intermediate (A2–B1)'
        : 'Advanced Mastery (B2–C2)';

  if (sessionMode === 'roleplay') {
    const sc =
      ROLEPLAY_SCENARIOS[roleplayScenario] || ROLEPLAY_SCENARIOS.job_interview;
    return {
      spokenGreetingOrReply: sc.openingLine,
      spokenEnglishPractice: sc.openingTargetReply,
      nativeLanguageExplanation: isUrdu
        ? sc.urduContext
        : isHindi
          ? sc.hindiContext
          : `Roleplay Active: ${sc.title}. I am playing "${sc.teacherRole}". Answer naturally as if we are on a real call!`,
      hasGrammarMistake: false,
      originalUserSentence: `🎭 Roleplay Call Started: ${sc.title}`,
      correctedEnglishSentence: sc.openingTargetReply,
      advancedAlternativeSentence:
        'It is a pleasure speaking with you today, and I am glad to be here.',
      grammarRuleTitle: `🎭 Live Roleplay: ${sc.title}`,
      vocabularyCards: [
        {
          word: 'Appreciate',
          phonetic: '/əˈpriː.ʃi.eɪt/',
          nativeMeaning: isUrdu ? 'قدر کرنا / شکر گزار ہونا' : 'To be grateful for',
          example: 'I really appreciate you taking the time to speak with me.',
        },
        {
          word: 'Certainly',
          phonetic: '/ˈsɜː.tən.li/',
          nativeMeaning: isUrdu ? 'یقیناً / بالکل' : 'Definitely / Of course',
          example: 'Certainly! I would be happy to explain more details.',
        },
        {
          word: 'Recommend',
          phonetic: '/ˌrek.əˈmend/',
          nativeMeaning: isUrdu ? 'تجویز کرنا / مشورہ دینا' : 'To suggest a good option',
          example: 'Could you recommend your favorite item on the menu?',
        },
      ],
      nextTestPrompt: {
        instructionInNative: isUrdu
          ? '🎙️ اب آپ کی باری ہے — بول کر یا ٹائپ کر کے اس سیناریو میں جواب دیں:'
          : '🎙️ Your Turn — reply in character right now:',
        targetEnglishToSpeak: sc.openingTargetReply,
        questionForUser: sc.openingLine,
      },
      fluencyScore: 94,
    };
  }

  if (sessionMode === 'guided_lesson') {
    const drillSentence =
      levelTier === 'basic'
        ? 'Every morning I wake up early, drink water, and practice speaking English for twenty minutes.'
        : levelTier === 'mid'
          ? 'Over the past few months, I have been working hard to speak English with more confidence.'
          : 'Mastering natural communication has allowed me to connect effortlessly with global teams.';

    return {
      spokenGreetingOrReply:
        levelTier === 'basic'
          ? 'Hey there! Welcome to your live guided English class. Today we are going to build confidence talking about your daily routine. Tell me naturally: what is the first thing you usually do after you wake up in the morning?'
          : 'Hey! Ready for today’s guided speaking lesson? Let us practice talking about habits and recent progress. What have you been focusing on learning or working on this week?',
      spokenEnglishPractice: drillSentence,
      nativeLanguageExplanation: isUrdu
        ? `🎓 گائیڈڈ اسپیکنگ کلاس (${levelLabel}): آج ہم روزمرہ کے معمولات اور ماضی/حال کے جملے فطری انداز میں بولنا سیکھیں گے۔ بس مجھ سے کال پر بات کریں — میں آپ کے ہر جملے کو بہتر اور خوبصورت بناتی جاؤں گی!`
        : `🎓 Guided Speaking Class (${levelLabel}): Speak with me naturally like a real tutor call, and I will guide your phrasing step by step!`,
      hasGrammarMistake: false,
      originalUserSentence: '🎓 Guided Speaking Class Ready',
      correctedEnglishSentence: drillSentence,
      advancedAlternativeSentence:
        'Consistently dedicating twenty minutes every morning to speaking aloud builds lasting fluency.',
      grammarRuleTitle: '🎓 Guided Speaking Lesson • Daily Routine & Fluency',
      vocabularyCards: [
        {
          word: 'Routine',
          phonetic: '/ruːˈtiːn/',
          nativeMeaning: isUrdu ? 'روزمرہ کا معمول' : 'Daily regular habit',
          example: 'Speaking English is part of my morning routine.',
        },
        {
          word: 'Confidence',
          phonetic: '/ˈkɒn.fɪ.dəns/',
          nativeMeaning: isUrdu ? 'اعتماد / خود اعتمادی' : 'Self-assurance',
          example: 'Real conversations quickly build your speaking confidence.',
        },
        {
          word: 'Dedicate',
          phonetic: '/ˈded.ɪ.keɪt/',
          nativeMeaning: isUrdu ? 'وقت وقف کرنا' : 'Devote time and focus',
          example: 'I dedicate twenty minutes every day to speaking.',
        },
      ],
      nextTestPrompt: {
        instructionInNative: isUrdu
          ? '🎙️ صوفیہ کے سوال کا جواب دیں، یا یہ نمونہ جملہ بول کر مشق شروع کریں:'
          : '🎙️ Answer Sophia naturally or try speaking this sample sentence:',
        targetEnglishToSpeak: drillSentence,
        questionForUser:
          'What is the first thing you usually do after waking up in the morning?',
      },
      fluencyScore: 93,
    };
  }

  const nativeWelcome = isUrdu
    ? `السلام علیکم! میں صوفیہ ہوں، آپ کی لائیو AI انگلش ٹیچر۔ آپ نے اردو زبان اور ${levelLabel} منتخب کیا ہے۔ اب بالکل ایسے بات کریں جیسے کسی حقیقی دوست یا ٹیچر سے کال پر بات کر رہے ہوں — میں آپ کا جواب سمجھ کر آگے بات بڑھاؤں گی اور نیچے کارڈز میں آپ کے غلط و صحیح فقرات کی تفصیل لکھوں گی!`
    : isHindi
      ? `नमस्ते! मैं सोफिया हूँ, आपकी लाइव AI इंग्लिश टीचर। बिल्कुल किसी असली कॉल की तरह मुझसे बात करें — मैं आपकी बात सुनकर जवाब दूँगी और नीचे कार्ड्स में गलतियाँ समझाऊँगी!`
      : `Welcome! I am Sophia, your Live AI English Coach. Talk with me just like a real 1-on-1 call — I will keep the conversation flowing naturally and show detailed grammar cards below!`;

  const spokenGreeting =
    levelTier === 'basic'
      ? `Hey! Good to see you on our live call. I am Sophia, your English coach. Let us start off super relaxed — how is your day going so far, and what is your name?`
      : levelTier === 'mid'
        ? `Hey there! Welcome back to our live speaking session. Tell me, how has your week been going so far, and what is something interesting you have been working on lately?`
        : `Hi! Great to connect with you live today. I am Sophia. To warm up our executive coaching call, tell me about a recent project or goal you are really excited about right now.`;

  return {
    spokenGreetingOrReply: spokenGreeting,
    spokenEnglishPractice:
      levelTier === 'basic'
        ? 'Hi Sophia! My name is Ali, and my day is going really well so far.'
        : 'My week has been pretty busy, and I have been focusing on improving my English communication.',
    nativeLanguageExplanation: nativeWelcome,
    hasGrammarMistake: false,
    originalUserSentence: 'Live Gemini AI Call Connected!',
    correctedEnglishSentence:
      levelTier === 'basic'
        ? 'Hi Sophia, my name is Ali and my day is going well.'
        : 'My week has been going really well, and I am excited to practice with you.',
    advancedAlternativeSentence:
      'I am having a productive week and look forward to sharpening my spoken fluency with you today.',
    grammarRuleTitle: `${levelLabel} • Live Human-Style AI Teacher Call`,
    vocabularyCards: [
      {
        word: 'So far',
        phonetic: '/səʊ fɑːr/',
        nativeMeaning: isUrdu ? 'اب تک (آج یا اس وقت تک)' : 'Up until this moment',
        example: 'My day has been going really well so far!',
      },
      {
        word: 'Relaxed',
        phonetic: '/rɪˈlækst/',
        nativeMeaning: isUrdu ? 'پُرسکون / بغیر گھبراہٹ کے' : 'Calm and comfortable',
        example: 'Feel relaxed when speaking — mistakes are how we grow.',
      },
      {
        word: 'Productive',
        phonetic: '/prəˈdʌk.tɪv/',
        nativeMeaning: isUrdu ? 'مفید / کامیاب (کام سے بھرپور)' : 'Getting good work done',
        example: 'I had a very productive morning practicing my English.',
      },
    ],
    nextTestPrompt: {
      instructionInNative: isUrdu
        ? '🎙️ صوفیہ کو اپنا نام بتائیں اور بتائیں کہ آج آپ کا دن کیسا گزر رہا ہے:'
        : '🎙️ Reply naturally to Sophia — introduce yourself or share how your day is going:',
      targetEnglishToSpeak:
        levelTier === 'basic'
          ? 'Hi Sophia! My name is Ali and my day is going really well so far.'
          : 'Hi Sophia! My week has been great, and I want to practice speaking more naturally.',
      questionForUser:
        'How is your day going so far, and what is your name?',
    },
    fluencyScore: 93,
  };
}

function analyzeAndTeachBilingually(
  rawInput: string,
  langCode: string,
  _langName: string,
  _nativeName: string,
  levelTier: string,
  sessionMode = 'teaching',
  roleplayScenario = 'job_interview',
  turnCount = 0
): LiveAgentResponsePayload {
  const input = rawInput.trim();
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';

  let hasMistake = false;
  let corrected = input;
  let advancedAlt = input;
  let ruleTitle = 'Natural English Conversation';
  let explanationNative = '';
  let spokenReply = '';

  if (/\bi am agree\b/i.test(input) || /\bi'm agree\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\b(i am|i'm) agree\b/gi, 'I agree');
    advancedAlt = 'I completely agree with your point on this.';
    ruleTitle = 'Action Verb Rule: Say "I agree", never "I am agree"';
    explanationNative = isUrdu
      ? 'آپ نے "I am agree" بولا جو کہ غلط ہے۔ انگلش میں "Agree" خود ایک Verb (فعل) ہے، اس لیے اس سے پہلے "am" نہیں لگاتے۔ ہمیشہ "I agree with you" بولیں!'
      : `"Agree" is already a verb, so never put "am" before it — say "I agree".`;
    spokenReply = `I love that! Just one quick tip: don't say I am agree—since agree is already an action verb, simply say I agree. Tell me more, why do you feel that way?`;
  } else if (/\bgoed\b/i.test(input) || /\byesterday i go\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\bgoed\b/gi, 'went').replace(/\byesterday i go\b/gi, 'Yesterday I went');
    advancedAlt = 'Yesterday I headed over there and had a great time.';
    ruleTitle = 'Irregular Past Tense: "Go" becomes "Went"';
    explanationNative = isUrdu
      ? 'ماضی (Yesterday) کی بات کرتے وقت "Go" کی دوسری فارم "Went" استعمال ہوتی ہے، "Goed" کہنا غلط ہے۔'
      : `For past actions, "go" changes to the irregular past form "went".`;
    spokenReply = `Oh nice! Quick tense fix there: for yesterday, use went instead of goed. So tell me, what did you enjoy most while you were there?`;
  } else {
    const capitalized =
      input.charAt(0).toUpperCase() +
      input.slice(1) +
      (/[.!?]$/.test(input) ? '' : '.');
    hasMistake = false;
    corrected = capitalized;
    advancedAlt = `To be honest, ${input.charAt(0).toLowerCase() + input.slice(1).replace(/[.!?]+$/, '')}, which keeps me pretty motivated.`;
    ruleTitle = 'Conversational Fluency Practice';
    explanationNative = isUrdu
      ? 'بہت خوب! آپ کی بات واضح ہے۔ نیچے کارڈ میں دیکھیں کہ اسی خیال کو اور بھی نیچرل اور پروفیشنل انداز میں کیسے کہا جا سکتا ہے!'
      : isHindi
        ? 'बहुत अच्छा! नीचे कार्ड में देखें कि इसी बात को और स्वाभाविक अंग्रेजी में कैसे बोल सकते हैं!'
        : `Nice job expressing yourself clearly! Check the native speaker upgrade card below to sound even more natural.`;
    spokenReply =
      sessionMode === 'roleplay'
        ? ROLEPLAY_SCENARIOS[roleplayScenario]?.followUpQuestions[
            turnCount %
              (ROLEPLAY_SCENARIOS[roleplayScenario]?.followUpQuestions.length || 1)
          ] || 'Thanks for sharing that! Could you tell me a bit more about it?'
        : levelTier === 'basic'
          ? 'Oh, that sounds really nice! Tell me a little bit more—what do you usually enjoy doing on the weekend?'
          : 'That is really interesting to hear! What motivated you to focus on that, and what are your next steps?';
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
        word: 'Motivated',
        phonetic: '/ˈməʊ.tɪ.veɪ.tɪd/',
        nativeMeaning: isUrdu ? 'پُرجوش / حوصلہ مند' : 'Driven and enthusiastic',
        example: 'Practicing every day keeps me motivated to succeed.',
      },
      {
        word: 'To be honest',
        phonetic: '/tuː biː ˈɒn.ɪst/',
        nativeMeaning: isUrdu ? 'سچ پوچھیں تو / حقیقت یہ ہے' : 'Speaking frankly',
        example: 'To be honest, speaking on a live call feels much easier now.',
      },
      {
        word: 'Look forward to',
        phonetic: '/lʊk ˈfɔː.wəd tuː/',
        nativeMeaning: isUrdu ? 'بے صبری سے انتظار کرنا' : 'Excited for something ahead',
        example: 'I look forward to improving my fluency this month.',
      },
    ],
    nextTestPrompt: {
      instructionInNative: isUrdu
        ? '🎙️ صوفیہ کی بات کا فطری انداز میں جواب دیں:'
        : '🎙️ Reply naturally to continue the conversation:',
      targetEnglishToSpeak:
        'To be honest, I usually spend my weekends relaxing with family and practicing English.',
      questionForUser: spokenReply,
    },
    fluencyScore: hasMistake ? 80 : 94,
  };
}
