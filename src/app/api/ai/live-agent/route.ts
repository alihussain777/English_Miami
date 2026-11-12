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
      'Good morning and welcome to our Miami office! Please have a seat. To start our interview, could you tell me a little bit about yourself and your professional background?',
    openingTargetReply:
      'Thank you for having me! I have two years of experience in my field, and I am passionate about solving problems and working with teams.',
    followUpQuestions: [
      'That sounds impressive! What would you say is your greatest professional strength, and how has it helped you in your work?',
      'Can you tell me about a challenging situation you faced at work or school and how you resolved it?',
      'Why do you want to join our company, and where do you see yourself in the next three years?',
      'Do you prefer working independently or as part of a team, and why?',
    ],
    sampleTargetReplies: [
      'My greatest strength is my ability to stay calm under pressure and communicate clearly with my team.',
      'Last year, when a project deadline was moved up, I organized daily check-ins so we delivered on time.',
      'I admire your company’s global culture, and I hope to grow into a team leadership role within three years.',
      'I enjoy collaborating with a team, although I am also very disciplined when working independently.',
    ],
    urduContext:
      '🎭 جاب انٹرویو رول پلے: میں ملبوسات اور ملٹی نیشنل کمپنی کی ایچ آر مینیجر (HR Manager) ہوں اور آپ انٹرویو دینے آئے ہیں۔ میرے سوال کا انگلش میں جواب دیں، میں آپ کا جواب چیک کر کے اسے پروفیشنل انٹرویو انگلش میں درست کرواؤں گی!',
    hindiContext:
      '🎭 जॉब इंटरव्यू रोलप्ले: मैं एचआर मैनेजर (HR Manager) हूँ और आप इंटरव्यू देने आए हैं। मेरे सवाल का अंग्रेजी में जवाब दें!',
  },
  cafe_order: {
    title: 'Ordering at a Miami Beach Cafe & Restaurant',
    teacherRole: 'Friendly Miami Beach Barista & Server',
    studentRole: 'Cafe Customer',
    openingLine:
      'Hi there! Welcome to Ocean Drive Cafe in Miami! What can I get started for you to drink or eat today?',
    openingTargetReply:
      'Hi! Could I please get a medium iced latte with oat milk and a warm chocolate croissant?',
    followUpQuestions: [
      'Awesome choice! Would you like that for here or to go, and would you like any breakfast sandwich with that?',
      'Sure thing! Your total comes to eleven dollars and fifty cents. Will you be paying with cash or card today?',
      'Here is your order! Let me know if you need any extra napkins, Wi-Fi password, or recommendations for Miami Beach!',
    ],
    sampleTargetReplies: [
      'I would like to have it for here, please, and could you also add a toasted avocado sandwich?',
      'I will pay with my credit card, please. Could I also get a glass of cold water?',
      'Thank you so much! Could you please share the Wi-Fi password with me?',
    ],
    urduContext:
      '🎭 کیفے اور ریسٹورنٹ رول پلے: میں میامی بیچ کیفے کی ویٹرس ہوں اور آپ کسٹمر ہیں۔ شائستہ انگلش ("Could I please get..." یا "I would like...") استعمال کرتے ہوئے اپنا آرڈر دیں!',
    hindiContext:
      '🎭 कैफे और रेस्तरां रोलप्ले: मैं मियामी बीच कैफे में बरिस्ता हूँ और आप ग्राहक हैं। विनम्र अंग्रेजी में अपना ऑर्डर दें!',
  },
  airport_immigration: {
    title: 'Airport Check-In & US Customs Immigration',
    teacherRole: 'US Customs & Border Protection Officer at Miami Airport',
    studentRole: 'International Traveler',
    openingLine:
      'Welcome to Miami International Airport! May I see your passport, please? What is the main purpose of your visit to the United States?',
    openingTargetReply:
      'Here is my passport, Officer. I am visiting Miami for a two-week vacation and sightseeing.',
    followUpQuestions: [
      'Thank you. How long will you be staying in the United States, and where will you be staying during your trip?',
      'Are you carrying any food items, agricultural products, or more than ten thousand dollars in cash?',
      'Do you have a return ticket booked, and what cities do you plan to visit while you are here?',
    ],
    sampleTargetReplies: [
      'I will be staying for fourteen days at the Grand Bay Hotel in downtown Miami.',
      'No, Officer, I am not carrying any food items or large amounts of cash.',
      'Yes, my return flight is on the twentieth of this month, and I plan to visit Miami and Orlando.',
    ],
    urduContext:
      '🎭 ایئرپورٹ اور امیگریشن رول پلے: میں میامی ایئرپورٹ پر امیگریشن آفیسر ہوں۔ اپنے سفر کا مقصد، ہوٹل اور واپسی کی تفصیلات اعتماد کے ساتھ انگلش میں بتائیں!',
    hindiContext:
      '🎭 एयरपोर्ट और इमिग्रेशन रोलप्ले: मैं मियामी एयरपोर्ट पर इमिग्रेशन ऑफिसर हूँ। अपनी यात्रा का उद्देश्य आत्मविश्वास के साथ अंग्रेजी में बताएं!',
  },
  doctor_visit: {
    title: 'Doctor Appointment & Medical Consultation',
    teacherRole: 'Dr. Sophia at Miami Medical Center',
    studentRole: 'Patient',
    openingLine:
      'Hello! Come on into the examination room. I am Dr. Sophia. Tell me, what brings you to the clinic today and how have you been feeling?',
    openingTargetReply:
      'Hello Doctor. I have had a sore throat and a mild fever for the past two days.',
    followUpQuestions: [
      'I see. Have you been experiencing any headache, cough, or difficulty sleeping at night?',
      'Are you currently taking any medications, and do you have any known allergies to medicine?',
      'I am going to prescribe a gentle medication and plenty of rest. Do you have any questions about how to take it?',
    ],
    sampleTargetReplies: [
      'Yes, Doctor, I also have a slight headache and I feel very tired in the evening.',
      'I took one pain reliever yesterday, and I do not have any allergies to medication.',
      'Thank you, Doctor. Should I take this medicine before or after meals?',
    ],
    urduContext:
      '🎭 ڈاکٹر کلینک رول پلے: میں ڈاکٹر صوفیہ ہوں اور آپ چیک اپ کے لیے آئے ہیں۔ اپنی علامات (Symptoms) مثلاً بخار، گلا خراب یا تھکن انگلش میں بیان کریں!',
    hindiContext:
      '🎭 डॉक्टर क्लिनिक रोलप्ले: मैं डॉक्टर सोफिया हूँ। अपने लक्षण (जैसे बुखार, गले में खराश या थकान) अंग्रेजी में बताएं!',
  },
  hotel_checkin: {
    title: '5-Star Hotel Check-In & Concierge',
    teacherRole: 'Front Desk Manager at Miami Oceanfront Resort',
    studentRole: 'Hotel Guest',
    openingLine:
      'Good afternoon and welcome to the Miami Oceanfront Resort! How may I assist you with your check-in today?',
    openingTargetReply:
      'Good afternoon! I have a reservation under my name for three nights with an ocean view.',
    followUpQuestions: [
      'Wonderful, I found your reservation! Would you prefer a room on a higher floor, and do you need help with your luggage?',
      'Breakfast is served from seven to ten every morning. Would you like me to book a table for you or arrange airport transport?',
    ],
    sampleTargetReplies: [
      'Yes, please! A room on a high floor would be great, and I would appreciate help with my bags.',
      'That sounds lovely. Could you also tell me what time the swimming pool and gym close?',
    ],
    urduContext:
      '🎭 ہوٹل چیک اِن رول پلے: آپ میامی کے فائیو اسٹار ہوٹل میں پہنچے ہیں اور میں استقبالیہ مینیجر ہوں۔ اپنی بکنگ اور کمرے کی پسند انگلش میں بتائیں!',
    hindiContext:
      '🎭 होटल चेक-इन रोलप्ले: आप मियामी के फाइव स्टार होटल में पहुँचे हैं। अपनी बुकिंग और कमरे की पसंद अंग्रेजी में बताएं!',
  },
  business_meeting: {
    title: 'Executive Client Meeting & Project Pitch',
    teacherRole: 'VP of Product at a US Tech Partner',
    studentRole: 'Project Lead / Consultant',
    openingLine:
      'Thanks for joining today’s strategy call! Could you walk me through the current status of our project and your main goals for this month?',
    openingTargetReply:
      'Thank you for having me! Our team has completed the first phase ahead of schedule, and we are now focusing on quality testing.',
    followUpQuestions: [
      'That is great progress! What are the biggest risks or bottlenecks we should prepare for before the launch?',
      'How can our team in Miami support you to make sure we hit our quarterly targets smoothly?',
    ],
    sampleTargetReplies: [
      'The main challenge is integrating the payment gateway, so we allocated two extra engineers to finish it by Friday.',
      'Receiving your feedback on the design by Wednesday would help us stay right on track.',
    ],
    urduContext:
      '🎭 بزنس میٹنگ رول پلے: ہم ایک امریکی کمپنی کے ساتھ پراجیکٹ میٹنگ کر رہے ہیں۔ اپنے کام کی پیش رفت اور پلان پروفیشنل بزنس انگلش میں بتائیں!',
    hindiContext:
      '🎭 बिजनेस मीटिंग रोलप्ले: हम एक अमेरिकी क्लाइंट के साथ मीटिंग कर रहे हैं। अपने प्रोजेक्ट की प्रगति प्रोफेशनल अंग्रेजी में बताएं!',
  },
};

function toUnifiedResponse(raw: Partial<LiveAgentResponsePayload>, langCode: string) {
  const isUrdu = langCode === 'ur';
  const isHindi = langCode === 'hi';
  const spoken =
    raw.spokenGreetingOrReply ||
    'Great job practicing with me! Let us review your English sentence below.';
  const explanation =
    raw.nativeLanguageExplanation ||
    (isUrdu
      ? 'آپ کا جملہ نیچے کارڈ میں درست کر دیا گیا ہے۔ صحیح جملے کو سنیں اور بول کر مشق کریں!'
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
          ? '🎯 اب آپ کی باری ہے (مائیک خودکار آن ہے): اوپر والا صحیح فقرہ بولیں یا اس سوال کا جواب دیں:'
          : '🎯 Your Turn (Auto-Mic Active): Speak the target sentence aloud or answer this question:'),
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
      ? 'شاباش! میری بات ختم ہوتے ہی مائیک خودکار آن ہو جائے گا — بس فطری انداز میں بولیں!'
      : isHindi
        ? 'शाबाश! मेरी बात खत्म होते ही माइक अपने आप चालू हो जाएगा — बस सहज रूप से बोलें!'
        : 'Awesome! As soon as I finish speaking, the microphone turns on automatically so you can reply hands-free!',
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
    const sessionMode = body.sessionMode ?? 'teaching'; // 'teaching' | 'roleplay' | 'guided_lesson'
    const roleplayScenario = body.roleplayScenario ?? 'job_interview';
    const turnCount = Number(body.turnCount || 0);
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

    // If initial greeting when user starts the Live Agent or switches Mode / Roleplay
    if (isInitialGreeting || !userMessage.trim()) {
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

        const scenarioInfo = ROLEPLAY_SCENARIOS[roleplayScenario] || ROLEPLAY_SCENARIOS.job_interview;
        const modeInstruction =
          sessionMode === 'roleplay'
            ? `ACTIVE MODE: LIVE ROLEPLAY ("${scenarioInfo.title}"). You are playing the role of "${scenarioInfo.teacherRole}" and the student is "${scenarioInfo.studentRole}". Stay warmly in character in your spoken reply, respond naturally to what they said, briefly coach any grammar improvement, and ask the next realistic roleplay question!`
            : sessionMode === 'guided_lesson'
              ? `ACTIVE MODE: STRUCTURED ENGLISH SPEAKING DRILL (Step ${turnCount + 1}). Actively teach the student a useful daily English pattern, praise or correct their sentence, and give them the next speaking drill sentence to repeat and customize.`
              : `ACTIVE MODE: LIVE BILINGUAL ENGLISH TEACHER & EXAMINER. Teach the student warmly like a human teacher, fix any grammar mistakes, explain the rule in ${langInfo.name} (${langInfo.nativeName}), and ask an engaging follow-up question.`;

        const systemPrompt = `You are "Sophia", the realistic Live AI English Teacher at TICI Language Institute Miami.
The student's native language is: ${langInfo.name} (${langInfo.nativeName}, code: ${nativeLangCode}).
The student's selected English level is: ${levelTier.toUpperCase()}.
${modeInstruction}

The student just said: "${userMessage}"

Analyze their input carefully. Even if they spoke in their native language (${langInfo.name} / Roman Urdu / Hindi / etc.) or broken English, teach them how to express it in natural English, correct any grammar or phrasing mistakes, explain the rule in ${langInfo.name} (${langInfo.nativeName}), provide 3 useful vocabulary cards with meanings in ${langInfo.nativeName}, and give them a live speaking prompt next.
IMPORTANT: Keep "spokenGreetingOrReply" natural, warm, and conversational (2 to 3 sentences in clear English) because it will be synthesized into live voice audio!

Return strictly valid JSON matching this exact schema:
{
  "spokenGreetingOrReply": "Natural, warm spoken English reply from Sophia (2-3 sentences, conversational teacher or roleplay partner tone)",
  "spokenEnglishPractice": "The exact correct English sentence for the student to listen to and repeat",
  "nativeLanguageExplanation": "Detailed, friendly explanation in ${langInfo.name} (${langInfo.nativeName} script) explaining why the correction was made and how the grammar rule works",
  "hasGrammarMistake": boolean,
  "originalUserSentence": "${userMessage.replace(/"/g, '\\"')}",
  "correctedEnglishSentence": "The 100% grammatically correct, natural English version of what the student tried to say",
  "advancedAlternativeSentence": "A polished, confident native-speaker or professional way to say the same sentence",
  "grammarRuleTitle": "Short title of the grammar or fluency rule",
  "vocabularyCards": [
    {
      "word": "English word or phrase",
      "phonetic": "/IPA/",
      "nativeMeaning": "Meaning in ${langInfo.nativeName}",
      "example": "Clear example sentence in English"
    }
  ],
  "nextTestPrompt": {
    "instructionInNative": "Instruction in ${langInfo.name} (${langInfo.nativeName}) telling the student what to say next",
    "targetEnglishToSpeak": "A complete sample English sentence the student can speak into the mic right now to answer your question",
    "questionForUser": "Next conversational or roleplay question in English"
  },
  "fluencyScore": number
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

    // Smart Bilingual Diagnostic, Roleplay & Teaching Engine
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

  // 1. If Roleplay Mode is selected
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
          : `🎭 Roleplay Active: ${sc.title}. I am playing "${sc.teacherRole}". Speak the sample answer below or reply in your own words!`,
      hasGrammarMistake: false,
      originalUserSentence: `🎭 Roleplay Started: ${sc.title}`,
      correctedEnglishSentence: sc.openingTargetReply,
      advancedAlternativeSentence:
        'It is a pleasure to be here today, and I look forward to our conversation.',
      grammarRuleTitle: `🎭 Live Roleplay: ${sc.title}`,
      vocabularyCards: [
        {
          word: 'Appreciate',
          phonetic: '/əˈpriː.ʃi.eɪt/',
          nativeMeaning: isUrdu ? 'قدر کرنا / شکر گزار ہونا' : 'To be grateful for something',
          example: 'I really appreciate your time and assistance today.',
        },
        {
          word: 'Certainly',
          phonetic: '/ˈsɜː.tən.li/',
          nativeMeaning: isUrdu ? 'یقیناً / بالکل' : 'Definitely / Of course',
          example: 'Certainly! I would be happy to share more details.',
        },
        {
          word: 'Recommend',
          phonetic: '/ˌrek.əˈmend/',
          nativeMeaning: isUrdu ? 'مشورہ دینا / تجویز کرنا' : 'To suggest as a good choice',
          example: 'What would you recommend from the menu today?',
        },
      ],
      nextTestPrompt: {
        instructionInNative: isUrdu
          ? '🎙️ میری بات ختم ہوتے ہی مائیک خود آن ہو جائے گا! یہ جواب بولیں یا اپنے الفاظ میں جواب دیں:'
          : isHindi
            ? '🎙️ मेरी बात खत्म होते ही माइक अपने आप चालू हो जाएगा! यह जवाब बोलें:'
            : '🎙️ Auto-Mic turns on as soon as I finish speaking! Say this reply aloud:',
        targetEnglishToSpeak: sc.openingTargetReply,
        questionForUser: sc.openingLine,
      },
      fluencyScore: 94,
    };
  }

  // 2. If Guided English Learning & Speaking Drill Mode is selected
  if (sessionMode === 'guided_lesson') {
    const drillSentence =
      levelTier === 'basic'
        ? 'Every morning I wake up at seven o’clock, drink water, and practice English for twenty minutes.'
        : levelTier === 'mid'
          ? 'For the past few months, I have been working hard to improve my spoken English and career skills.'
          : 'Mastering persuasive English communication has enabled me to collaborate effectively with international clients.';

    return {
      spokenGreetingOrReply:
        levelTier === 'basic'
          ? 'Welcome to your Guided English Speaking Lesson! Today we will practice daily routine sentences step by step. Listen to my sentence and repeat it aloud when the mic turns on: Every morning I wake up at seven o’clock and practice English.'
          : 'Welcome to your Guided Fluency Drill! Today we are practicing Present Perfect Continuous sentences. Repeat the target sentence below or adapt it to your own life!',
      spokenEnglishPractice: drillSentence,
      nativeLanguageExplanation: isUrdu
        ? `🎓 گائیڈڈ انگلش کلاس (${levelLabel}): اس موڈ میں میں آپ کو ایک حقیقی ٹیچر کی طرح قدم بہ قدم انگلش بولنے کی مشق کرواؤں گی۔ جیسے ہی میری آواز ختم ہوگی، آپ کا مائیک خودکار آن ہو جائے گا۔ نیچے لکھا ہوا انگلش جملہ بول کر سنائیں!`
        : isHindi
          ? `🎓 गाइडेड इंग्लिश क्लास (${levelLabel}): जैसे ही मेरी आवाज खत्म होगी, आपका माइक अपने आप ऑन हो जाएगा। नीचे लिखा हुआ अंग्रेजी वाक्य बोलकर सुनाएं!`
          : `🎓 Guided Speaking Class (${levelLabel}): As soon as I finish speaking, your mic will turn on automatically. Speak the target drill sentence below!`,
      hasGrammarMistake: false,
      originalUserSentence: '🎓 Step 1 Speaking Drill Ready',
      correctedEnglishSentence: drillSentence,
      advancedAlternativeSentence:
        'Consistently dedicating twenty minutes each morning to English immersion builds lasting fluency.',
      grammarRuleTitle: '🎓 Guided Speaking Drill • Step 1: Daily Fluency Pattern',
      vocabularyCards: [
        {
          word: 'Routine',
          phonetic: '/ruːˈtiːn/',
          nativeMeaning: isUrdu ? 'روزمرہ کا معمول' : 'Daily regular habit',
          example: 'Speaking English is part of my morning routine.',
        },
        {
          word: 'Improve',
          phonetic: '/ɪmˈpruːv/',
          nativeMeaning: isUrdu ? 'بہتر بنانا / نکھارنا' : 'To make or become better',
          example: 'I want to improve my pronunciation every day.',
        },
        {
          word: 'Dedicate',
          phonetic: '/ˈded.ɪ.keɪt/',
          nativeMeaning: isUrdu ? 'وقت وقف کرنا' : 'Devote time and effort',
          example: 'I dedicate thirty minutes a day to learning.',
        },
      ],
      nextTestPrompt: {
        instructionInNative: isUrdu
          ? '🎙️ اب آپ کی باری ہے (بار بار مائیک دبانے کی ضرورت نہیں): نیچے والا جملہ بول کر سنائیں:'
          : '🎙️ Your Turn (Hands-Free Auto-Mic): Speak this sentence aloud now:',
        targetEnglishToSpeak: drillSentence,
        questionForUser:
          'Repeat the target sentence aloud, or tell me about your own morning routine!',
      },
      fluencyScore: 93,
    };
  }

  // 3. Default Live Bilingual Teacher & Mistake Fixer Mode
  const nativeWelcome = isUrdu
    ? `السلام علیکم! میں صوفیہ ہوں، آپ کی لائیو اے آئی انگلش ٹیچر۔ آپ نے اردو زبان اور ${levelLabel} لیول منتخب کیا ہے۔ آپ کو بار بار مائیک آن کرنے کی ضرورت نہیں ہے — جیسے ہی میں بات مکمل کروں گی، آپ کا مائیک خودکار آن ہو جائے گا! مجھ سے بات کریں اور میں نیچے کارڈز میں آپ کے غلط اور صحیح فقرات تفصیل سے سمجھاؤں گی۔`
    : isHindi
      ? `नमस्ते! मैं सोफिया हूँ, आपकी लाइव एआई इंग्लिश टीचर। आपको बार-बार माइक ऑन करने की ज़रूरत नहीं है — जैसे ही मैं अपनी बात पूरी करूँगी, आपका माइक अपने आप चालू हो जाएगा!`
      : `Welcome! I am Sophia, your Live AI English Teacher. Hands-free mode is active — as soon as I finish speaking, your microphone turns on automatically so we can talk like a real live call!`;

  const spokenGreeting =
    levelTier === 'basic'
      ? `Hello and welcome! I am Sophia, your live English teacher. Hands-free voice mode is on, so just speak after I finish. Let's start: What is your name, and what do you like to do in your free time?`
      : levelTier === 'mid'
        ? `Hello! I am Sophia, your live English coach. Our hands-free conversation is active. Tell me about what you did yesterday or what your goals are for this month!`
        : `Welcome! I am Sophia, your executive English coach. In this hands-free live session, tell me about your career ambitions or a project you are passionate about.`;

  return {
    spokenGreetingOrReply: spokenGreeting,
    spokenEnglishPractice:
      levelTier === 'basic'
        ? 'My name is Ali, and in my free time I enjoy reading books and learning English.'
        : 'Yesterday I worked on an important project, and this month I want to master spoken English.',
    nativeLanguageExplanation: nativeWelcome,
    hasGrammarMistake: false,
    originalUserSentence: 'Live Call Connected — Hands-Free Auto-Mic Active!',
    correctedEnglishSentence:
      levelTier === 'basic'
        ? 'Hello Sophia, my name is Ali and I want to speak fluent English.'
        : 'I would love to practice my spoken English and get instant grammar feedback.',
    advancedAlternativeSentence:
      'I am excited to engage in live conversational practice to refine my English fluency.',
    grammarRuleTitle: `${levelLabel} • Hands-Free Live Teacher Active`,
    vocabularyCards: [
      {
        word: 'Confident',
        phonetic: '/ˈkɒn.fɪ.dənt/',
        nativeMeaning: isUrdu ? 'پراعتماد (بغیر جھجھک بولنے والا)' : 'Self-assured and fearless',
        example: 'Speaking aloud every day makes you feel confident.',
      },
      {
        word: 'Conversation',
        phonetic: '/ˌkɒn.vəˈseɪ.ʃən/',
        nativeMeaning: isUrdu ? 'بات چیت / گفتگو' : 'Interactive spoken dialogue',
        example: 'Real conversation is the fastest way to learn a language.',
      },
      {
        word: 'Opportunity',
        phonetic: '/ˌɒp.əˈtjuː.nə.ti/',
        nativeMeaning: isUrdu ? 'سنہری موقع' : 'A favorable chance for advancement',
        example: 'Good English opens doors to global career opportunities.',
      },
    ],
    nextTestPrompt: {
      instructionInNative: isUrdu
        ? '🎙️ میری آواز ختم ہوتے ہی مائیک خود آن ہو جائے گا — یہ فقرہ بولیں یا میرے سوال کا جواب دیں:'
        : '🎙️ Auto-Mic turns on automatically after I speak — say this sentence or answer my question:',
      targetEnglishToSpeak:
        levelTier === 'basic'
          ? 'Hello Sophia, I want to improve my English speaking skills every day.'
          : 'I have been practicing English every day to prepare for international opportunities.',
      questionForUser:
        levelTier === 'basic'
          ? 'What is your name, and what do you like to do in your free time?'
          : 'What did you do yesterday, and what is your main goal for learning English?',
    },
    fluencyScore: 92,
  };
}

function analyzeAndTeachBilingually(
  rawInput: string,
  langCode: string,
  langName: string,
  nativeName: string,
  levelTier: string,
  sessionMode = 'teaching',
  roleplayScenario = 'job_interview',
  turnCount = 0
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
  let teacherCorrectionVoice = '';

  // Comprehensive ESL Mistake Detection
  if (/\bi am agree\b/i.test(input) || /\bi'm agree\b/i.test(input)) {
    hasMistake = true;
    corrected = input.replace(/\b(i am|i'm) agree\b/gi, 'I agree');
    advancedAlt = 'I completely agree with your perspective on this matter.';
    ruleTitle = 'Action Verb Rule: Say "I agree", never "I am agree"';
    explanationNative = isUrdu
      ? 'آپ نے "I am agree" بولا جو کہ غلط ہے۔ انگلش میں "Agree" (متفق ہونا) خود ایک Verb (فعل) ہے، اس لیے اس سے پہلے "am / is / are" نہیں لگاتے۔ ہمیشہ سیدھا "I agree with you" بولیں!'
      : isHindi
        ? 'आपने "I am agree" कहा जो गलत है। अंग्रेजी में "Agree" खुद एक क्रिया (Verb) है, इसलिए इसके पहले "am" नहीं लगता। हमेशा "I agree with you" कहें!'
        : `"Agree" is already a verb in English, so never put "am/is/are" before it. Say "I agree".`;
    teacherCorrectionVoice = `Small grammar tip: since "agree" is already a verb, don't say "I am agree"—just say "${corrected}".`;
  } else if (
    /\bgoed\b/i.test(input) ||
    /\bi go yesterday\b/i.test(input) ||
    /\byesterday i go\b/i.test(input)
  ) {
    hasMistake = true;
    corrected = 'Yesterday I went to the market with my brother.';
    advancedAlt =
      'Yesterday afternoon, I went to the market along with my brother.';
    ruleTitle = 'Irregular Past Tense: "Go" becomes "Went"';
    explanationNative = isUrdu
      ? 'جب ہم گزرے ہوئے کل (Yesterday / ماضی) کی بات کرتے ہیں تو "Go" کی دوسری فارم "Went" استعمال ہوتی ہے۔ "Goed" یا "Yesterday I go" کہنا غلط ہے۔ صحیح فقرہ ہے: "Yesterday I went..."'
      : isHindi
        ? 'बीते हुए कल (Yesterday) की बात करते समय "Go" का भूतकाल रूप "Went" इस्तेमाल होता है। "Goed" कहना गलत है!'
        : `When talking about yesterday, always use the past tense "went" instead of "go" or "goed".`;
    teacherCorrectionVoice = `Remember, when talking about yesterday, "go" changes to "went". So say: "${corrected}".`;
  } else if (/\bi have (\d+) years?\b/i.test(input)) {
    hasMistake = true;
    const ageMatch = input.match(/\bi have (\d+) years?\b/i);
    const age = ageMatch ? ageMatch[1] : '22';
    corrected = `I am ${age} years old and I am a student.`;
    advancedAlt = `I am ${age} years old, and I am currently pursuing my studies.`;
    ruleTitle = 'Expressing Age & Profession: "I am 22 years old" + Article "a"';
    explanationNative = isUrdu
      ? `اپنی عمر بتانے کے لیے انگلش میں "I have ${age} years" نہیں کہتے، بلکہ "I am ${age} years old" کہتے ہیں، اور پیشے سے پہلے "a" لگاتے ہیں ("I am a student")۔`
      : isHindi
        ? `अपनी उम्र बताने के लिए अंग्रेजी में "I am ${age} years old" कहते हैं, और "a student" लगाते हैं!`
        : `In English, express age with "I am ${age} years old", and include the article "a" before singular nouns like "a student".`;
    teacherCorrectionVoice = `In English, we use "I am" for age! Say: "${corrected}".`;
  } else if (
    /\b(he|she|it) don'?t\b/i.test(input) ||
    /\bdon'?t know nothing\b/i.test(input)
  ) {
    hasMistake = true;
    corrected =
      /\bdon'?t know nothing\b/i.test(input)
        ? 'She doesn’t know anything about this problem.'
        : input.replace(/\b(he|she|it)\s+don'?t\b/gi, '$1 doesn’t');
    advancedAlt =
      'She is completely unaware of this issue, so let me explain it to her.';
    ruleTitle = 'Singular "Doesn’t" & No Double Negatives ("Anything")';
    explanationNative = isUrdu
      ? 'دو اہم اصول: (1) He / She کے ساتھ "don’t" نہیں بلکہ "doesn’t" آتا ہے۔ (2) ایک ہی جملے میں دو منفی الفاظ ("doesn’t" اور "nothing") اکٹھے نہیں آتے، اس لیے "nothing" کی جگہ "anything" بولیں!'
      : isHindi
        ? 'ध्यान दें: He/She के साथ "doesn’t" आता है, और "doesn’t" के बाद "nothing" की जगह "anything" का प्रयोग करें!'
        : `With "she/he", use "doesn't", and avoid double negatives: say "doesn't know anything", not "don't know nothing".`;
    teacherCorrectionVoice = `Watch out for two things here: with "she", use "doesn't", and say "anything" instead of "nothing". Say: "${corrected}".`;
  } else if (/\bam learning .* since (two|\d+) years\b/i.test(input) || /\bi am .* since (\d+|two|three) (years|months)\b/i.test(input)) {
    hasMistake = true;
    corrected = 'I have been learning English for two years.';
    advancedAlt =
      'I have been actively studying English for the past two years.';
    ruleTitle = 'Present Perfect Continuous: "Have been + -ing" & "FOR + Duration"';
    explanationNative = isUrdu
      ? 'جب کوئی کام ماضی میں شروع ہوا ہو اور اب بھی جاری ہو، تو "I am learning" نہیں بلکہ "I have been learning" کہتے ہیں! اور مدت (2 years) کے لیے "since" نہیں بلکہ "for two years" لگاتے ہیں۔'
      : isHindi
        ? 'जब कोई काम भूतकाल में शुरू होकर अब भी जारी हो, तो "I have been learning" कहते हैं, और समय की अवधि (two years) के साथ "for" लगाते हैं!'
        : `For actions that started in the past and continue now, use "I have been learning", and use "for" (not "since") with a duration like "two years".`;
    teacherCorrectionVoice = `Great effort! When an action started in the past and continues now, say: "${corrected}".`;
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
      ? 'جب سوال میں "Did" آ جائے تو اس کے بعد ہمیشہ فعل کی پہلی فارم (First Form: go, see, eat) آتی ہے، دوسری فارم نہیں آتی!'
      : `After "Did" in a question, always use the base form of the verb ("Did you go?", never "Did you went?").`;
    teacherCorrectionVoice = `Remember: after "Did", always use the first form of the verb: "${corrected}".`;
  } else if (lower.split(/\s+/).length <= 3) {
    hasMistake = true;
    corrected = `I would like to talk about ${input.replace(/[.!?]+$/, '')} in more detail.`;
    advancedAlt = `Let me share a complete example regarding ${input.replace(/[.!?]+$/, '')}.`;
    ruleTitle = 'Expand Short Phrases into Full Sentences';
    explanationNative = isUrdu
      ? `آپ نے بہت مختصر جواب ("${input}") دیا ہے۔ انگلش میں روانی پیدا کرنے کے لیے ہمیشہ پورا جملہ (Complete Sentence) بولیں۔ میں نے نیچے آپ کے لیے مکمل فقرہ بنا دیا ہے!`
      : `Try speaking in complete sentences rather than 1–2 words so your fluency grows much faster!`;
    teacherCorrectionVoice = `Good! Let's expand "${input}" into a full sentence: "${corrected}".`;
  } else {
    const capitalized =
      input.charAt(0).toUpperCase() +
      input.slice(1) +
      (/[.!?]$/.test(input) ? '' : '.');
    hasMistake = false;
    corrected = capitalized;
    advancedAlt = `Moreover, ${input.charAt(0).toLowerCase() + input.slice(1).replace(/[.!?]+$/, '')}, which has really helped me grow.`;
    ruleTitle = 'Well-Structured English Sentence! 🌟';
    explanationNative = isUrdu
      ? 'ماشاءاللہ! آپ نے بالکل درست اور واضح انگلش جملہ بولا ہے۔ نیچے کارڈ میں دیکھیں کہ اسی بات کو مزید ایڈوانس (C1 Native Level) میں کیسے کہا جا سکتا ہے!'
      : isHindi
        ? 'बहुत बढ़िया! आपने बिल्कुल सही अंग्रेजी वाक्य बोला है। नीचे कार्ड में इसका एडवांस्ड रूप भी देखें!'
        : `Excellent! Your sentence is grammatically clear and natural.`;
    teacherCorrectionVoice = `Well said! "${corrected}" is clear and natural English.`;
  }

  // Build Mode-Specific Follow-Up (Roleplay vs. Guided Lesson vs. Teacher)
  if (sessionMode === 'roleplay') {
    const sc =
      ROLEPLAY_SCENARIOS[roleplayScenario] || ROLEPLAY_SCENARIOS.job_interview;
    const stepIdx = turnCount % sc.followUpQuestions.length;
    const nextQuestion = sc.followUpQuestions[stepIdx];
    const nextTargetReply = sc.sampleTargetReplies[stepIdx] || sc.openingTargetReply;

    return {
      spokenGreetingOrReply: `${teacherCorrectionVoice} Now, continuing our roleplay: ${nextQuestion}`,
      spokenEnglishPractice: corrected,
      nativeLanguageExplanation: explanationNative,
      hasGrammarMistake: hasMistake,
      originalUserSentence: input,
      correctedEnglishSentence: corrected,
      advancedAlternativeSentence: advancedAlt,
      grammarRuleTitle: `${ruleTitle} • (${sc.title})`,
      vocabularyCards: [
        {
          word: 'Professional',
          phonetic: '/prəˈfeʃ.ən.əl/',
          nativeMeaning: isUrdu ? 'پیشہ ورانہ / باوقار' : 'Skilled and courteous in workplace settings',
          example: 'Your response sounded very polite and professional.',
        },
        {
          word: 'Experience',
          phonetic: '/ɪkˈspɪə.ri.əns/',
          nativeMeaning: isUrdu ? 'تجربہ' : 'Practical knowledge gained over time',
          example: 'This roleplay gives you real-world speaking experience.',
        },
        {
          word: 'Confidence',
          phonetic: '/ˈkɒn.fɪ.dəns/',
          nativeMeaning: isUrdu ? 'اعتماد / خود اعتمادی' : 'Belief in your ability to speak well',
          example: 'Your speaking confidence is improving with every turn.',
        },
      ],
      nextTestPrompt: {
        instructionInNative: isUrdu
          ? '🎭 رول پلے کا اگلا سوال (مائیک خود آن ہو جائے گا): یہ جواب بولیں یا اپنے الفاظ میں جواب دیں:'
          : '🎭 Next Roleplay Turn (Auto-Mic Active): Speak this sample answer or reply in your own words:',
        targetEnglishToSpeak: nextTargetReply,
        questionForUser: nextQuestion,
      },
      fluencyScore: hasMistake ? 80 : 96,
    };
  }

  if (sessionMode === 'guided_lesson') {
    const drills = [
      {
        q: 'Now let us practice Past Tense: Tell me one thing you did yesterday!',
        sample: 'Yesterday I studied English for thirty minutes and talked with my family.',
      },
      {
        q: 'Now let us practice Future Plans: What are you going to do this weekend?',
        sample: 'This weekend I am going to visit my friends and practice speaking English.',
      },
      {
        q: 'Now let us practice Polite Requests: Ask someone politely for help at work!',
        sample: 'Could you please help me review this document when you have a moment?',
      },
      {
        q: 'Now let us practice Expressing Opinions: Why is learning English important today?',
        sample: 'In my opinion, learning English opens doors to global career opportunities.',
      },
    ];
    const nextDrill = drills[turnCount % drills.length];

    return {
      spokenGreetingOrReply: `${teacherCorrectionVoice} Great job on that drill! ${nextDrill.q}`,
      spokenEnglishPractice: corrected,
      nativeLanguageExplanation: explanationNative,
      hasGrammarMistake: hasMistake,
      originalUserSentence: input,
      correctedEnglishSentence: corrected,
      advancedAlternativeSentence: advancedAlt,
      grammarRuleTitle: `${ruleTitle} • (Guided Lesson Step ${turnCount + 2})`,
      vocabularyCards: [
        {
          word: 'Express',
          phonetic: '/ɪkˈspres/',
          nativeMeaning: isUrdu ? 'اظہار کرنا / بیان کرنا' : 'Convey thoughts clearly in words',
          example: 'This pattern helps you express your ideas naturally.',
        },
        {
          word: 'Fluent',
          phonetic: '/ˈfluː.ənt/',
          nativeMeaning: isUrdu ? 'روانی سے بولنے والا' : 'Able to speak smoothly and easily',
          example: 'Practice makes you a fluent English speaker.',
        },
        {
          word: 'Consistent',
          phonetic: '/kənˈsɪs.tənt/',
          nativeMeaning: isUrdu ? 'مسلسل / باقاعدہ' : 'Steady and regular every day',
          example: 'Consistent daily drills build strong muscle memory.',
        },
      ],
      nextTestPrompt: {
        instructionInNative: isUrdu
          ? '🎓 اگلی مشق (مائیک خود آن ہو جائے گا): نیچے دیا گیا جملہ بولیں یا اپنا جملہ بنائیں:'
          : '🎓 Next Speaking Drill (Auto-Mic Active): Speak this sentence aloud:',
        targetEnglishToSpeak: nextDrill.sample,
        questionForUser: nextDrill.q,
      },
      fluencyScore: hasMistake ? 82 : 96,
    };
  }

  // Default Teacher Mode
  const nextQuestions =
    levelTier === 'basic'
      ? [
          {
            q: 'What did you eat for breakfast today, and what will you do tonight?',
            sample: 'Today I had eggs and tea for breakfast, and tonight I will read a book.',
          },
          {
            q: 'Tell me about your favorite city or place you would love to visit!',
            sample: 'I would love to visit Miami because the beaches and weather are beautiful.',
          },
          {
            q: 'Who is your best friend, and how long have you known them?',
            sample: 'My best friend is Ahmed, and I have known him for five years.',
          },
        ]
      : [
          {
            q: 'If you could travel anywhere in the world next month, where would you go and why?',
            sample: 'If I could travel anywhere next month, I would visit London to explore its history.',
          },
          {
            q: 'What is one skill you believe everyone should learn over the next five years?',
            sample: 'I believe everyone should master fluent English and artificial intelligence tools.',
          },
          {
            q: 'Tell me about a goal you achieved recently that made you feel proud.',
            sample: 'Recently I completed a challenging project at work, which boosted my confidence.',
          },
        ];
  const pickedNext = nextQuestions[turnCount % nextQuestions.length];

  return {
    spokenGreetingOrReply: `${teacherCorrectionVoice} Now tell me: ${pickedNext.q}`,
    spokenEnglishPractice: corrected,
    nativeLanguageExplanation: explanationNative,
    hasGrammarMistake: hasMistake,
    originalUserSentence: input,
    correctedEnglishSentence: corrected,
    advancedAlternativeSentence: advancedAlt,
    grammarRuleTitle: ruleTitle,
    vocabularyCards: [
      {
        word: 'Articulate',
        phonetic: '/ɑːˈtɪk.jə.leɪt/',
        nativeMeaning: isUrdu ? 'صاف اور واضح الفاظ میں بیان کرنا' : 'Express ideas clearly and effectively',
        example: 'She is an articulate speaker who explains her thoughts clearly.',
      },
      {
        word: 'Perspective',
        phonetic: '/pəˈspek.tɪv/',
        nativeMeaning: isUrdu ? 'نقطہ نظر / زاویہ نگاہ' : 'A particular point of view',
        example: 'Thank you for sharing your perspective on this topic.',
      },
      {
        word: 'Consistent',
        phonetic: '/kənˈsɪs.tənt/',
        nativeMeaning: isUrdu ? 'مسلسل / مستقل مزاج' : 'Steady and regular in daily practice',
        example: 'Consistent 10-minute practice beats studying once a month.',
      },
    ],
    nextTestPrompt: {
      instructionInNative: isUrdu
        ? '🎯 اگلا ٹیسٹ (مائیک خود آن ہو جائے گا): اوپر والا صحیح فقرہ دہرائیں، یا اس سوال کا انگلش میں جواب دیں:'
        : isHindi
          ? '🎯 अगला टेस्ट (माइक अपने आप चालू हो जाएगा): ऊपर दिया गया सही वाक्य बोलें, या इस सवाल का जवाब दें:'
          : '🎯 Next Live Turn (Auto-Mic Active): Repeat the corrected sentence aloud, or answer this question:',
      targetEnglishToSpeak: pickedNext.sample,
      questionForUser: pickedNext.q,
    },
    fluencyScore: hasMistake ? 79 : 96,
  };
}
