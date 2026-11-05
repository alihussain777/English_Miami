import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EnglishMiami Comprehensive Database Seeding...');

  // 1. Create CEFR Levels
  const levelsData = [
    { code: 'A0', title: 'Absolute Beginner', description: 'Alphabet, phonics, numbers, essential greetings, and foundational survival vocabulary.', order: 1 },
    { code: 'A1', title: 'Beginner', description: 'Everyday routines, introductions, family, food, shopping, and present simple tense.', order: 2 },
    { code: 'A2', title: 'Elementary', description: 'Travel, past experiences, future plans, shopping, health, comparatives, and directions.', order: 3 },
    { code: 'B1', title: 'Intermediate', description: 'Workplace fluency, interviews, opinions, storytelling, conditionals, and reported speech.', order: 4 },
    { code: 'B2', title: 'Upper Intermediate', description: 'Business negotiations, presentations, idioms, phrasal verbs, and passive voice.', order: 5 },
    { code: 'C1', title: 'Advanced', description: 'Negative inversion, diplomatic tact, hedging, rhetoric, and academic discourse.', order: 6 },
    { code: 'C2', title: 'Proficiency', description: 'Near-native mastery, litotes, subtle irony, complex contractual registers, and literary stylistics.', order: 7 },
  ];

  for (const lvl of levelsData) {
    await prisma.level.upsert({
      where: { code: lvl.code },
      update: lvl,
      create: lvl,
    });
  }
  console.log('✅ CEFR Levels seeded (A0 to C2)');

  // 2. Passwords
  const passwordHash = await bcrypt.hash('miami123456', 10);

  // 3. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@englishmiami.com' },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email: 'admin@englishmiami.com',
      passwordHash,
      name: 'Dr. Elena Vance (Academic Director)',
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          nativeLanguage: 'English',
          country: 'United States',
          currentLevel: 'C2',
          targetLevel: 'C2',
          learningGoal: 'Curriculum & Certification Governance',
          preferredSkills: '["speaking","vocabulary","grammar","writing"]',
          onboardingCompleted: true,
          xp: 12500,
          speakingMinutes: 320,
        },
      },
      subscription: {
        create: {
          plan: 'MONTHLY_PRO',
          status: 'ACTIVE',
          price: 19.99,
        },
      },
      streak: {
        create: {
          currentStreak: 48,
          longestStreak: 65,
        },
      },
    },
  });

  // 4. Students Directory (International Roster)
  const studentsData = [
    {
      email: 'student@englishmiami.com',
      name: 'Sofia Rodriguez',
      country: 'Spain',
      nativeLanguage: 'Spanish',
      currentLevel: 'B1',
      targetLevel: 'C1',
      goal: 'Job & Interviews',
      xp: 1420,
      speakingMinutes: 75,
      streak: 9,
      plan: 'WEEKLY_PRO',
      status: 'ACTIVE'
    },
    {
      email: 'zhang.wei@englishmiami.com',
      name: 'Zhang Wei',
      country: 'China',
      nativeLanguage: 'Mandarin',
      currentLevel: 'A2',
      targetLevel: 'B2',
      goal: 'Study Abroad',
      xp: 890,
      speakingMinutes: 40,
      streak: 5,
      plan: 'FREE',
      status: 'ACTIVE'
    },
    {
      email: 'muhammad.ali@englishmiami.com',
      name: 'Muhammad Ali',
      country: 'Pakistan',
      nativeLanguage: 'Urdu',
      currentLevel: 'B2',
      targetLevel: 'C1',
      goal: 'Global Software Engineering Career',
      xp: 3200,
      speakingMinutes: 160,
      streak: 22,
      plan: 'MONTHLY_PRO',
      status: 'ACTIVE'
    },
    {
      email: 'priya.sharma@englishmiami.com',
      name: 'Priya Sharma',
      country: 'India',
      nativeLanguage: 'Hindi',
      currentLevel: 'C1',
      targetLevel: 'C2',
      goal: 'Corporate Leadership & Negotiations',
      xp: 5600,
      speakingMinutes: 280,
      streak: 35,
      plan: 'MONTHLY_PRO',
      status: 'ACTIVE'
    },
    {
      email: 'lucas.silva@englishmiami.com',
      name: 'Lucas Silva',
      country: 'Brazil',
      nativeLanguage: 'Portuguese',
      currentLevel: 'A1',
      targetLevel: 'B1',
      goal: 'Travel & Tourism',
      xp: 450,
      speakingMinutes: 25,
      streak: 3,
      plan: 'WEEKLY_PRO',
      status: 'ACTIVE'
    },
    {
      email: 'tariq.mansoor@englishmiami.com',
      name: 'Tariq Al-Mansoor',
      country: 'UAE',
      nativeLanguage: 'Arabic',
      currentLevel: 'B1',
      targetLevel: 'B2',
      goal: 'International Trade & Business',
      xp: 1850,
      speakingMinutes: 95,
      streak: 14,
      plan: 'MONTHLY_PRO',
      status: 'ACTIVE'
    },
    {
      email: 'mateo.garcia@englishmiami.com',
      name: 'Mateo Garcia',
      country: 'Mexico',
      nativeLanguage: 'Spanish',
      currentLevel: 'A0',
      targetLevel: 'A2',
      goal: 'Basic Daily Communication',
      xp: 180,
      speakingMinutes: 10,
      streak: 2,
      plan: 'FREE',
      status: 'ACTIVE'
    },
    {
      email: 'anna.mueller@englishmiami.com',
      name: 'Anna Mueller',
      country: 'Germany',
      nativeLanguage: 'German',
      currentLevel: 'B2',
      targetLevel: 'C1',
      goal: 'Academic Research & Publishing',
      xp: 2400,
      speakingMinutes: 110,
      streak: 11,
      plan: 'WEEKLY_PRO',
      status: 'ACTIVE'
    },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        status: s.status,
        name: s.name,
      },
      create: {
        email: s.email,
        passwordHash,
        name: s.name,
        role: 'STUDENT',
        status: s.status,
        profile: {
          create: {
            country: s.country,
            nativeLanguage: s.nativeLanguage,
            currentLevel: s.currentLevel,
            targetLevel: s.targetLevel,
            learningGoal: s.goal,
            xp: s.xp,
            speakingMinutes: s.speakingMinutes,
            onboardingCompleted: true,
            preferredSkills: '["speaking","vocabulary","grammar"]',
          }
        },
        subscription: {
          create: {
            plan: s.plan,
            status: 'ACTIVE',
            price: s.plan === 'MONTHLY_PRO' ? 19.99 : s.plan === 'WEEKLY_PRO' ? 6.99 : 0.0,
          }
        },
        streak: {
          create: {
            currentStreak: s.streak,
            longestStreak: s.streak + 5,
          }
        }
      }
    });
    createdStudents.push(user);
  }
  console.log(`✅ ${createdStudents.length} international students seeded.`);

  // 5. Payments History (for Financial Telemetry)
  const paymentsData = [
    { userEmail: 'muhammad.ali@englishmiami.com', amount: 19.99, plan: 'MONTHLY_PRO', method: 'Credit Card (Visa)', ref: 'TXN-90218-ALI' },
    { userEmail: 'priya.sharma@englishmiami.com', amount: 19.99, plan: 'MONTHLY_PRO', method: 'MasterCard', ref: 'TXN-88123-PRI' },
    { userEmail: 'student@englishmiami.com', amount: 6.99, plan: 'WEEKLY_PRO', method: 'Apple Pay', ref: 'TXN-77319-SOF' },
    { userEmail: 'lucas.silva@englishmiami.com', amount: 6.99, plan: 'WEEKLY_PRO', method: 'Google Pay', ref: 'TXN-65412-LUC' },
    { userEmail: 'tariq.mansoor@englishmiami.com', amount: 19.99, plan: 'MONTHLY_PRO', method: 'Credit Card (Amex)', ref: 'TXN-54321-TAR' },
    { userEmail: 'anna.mueller@englishmiami.com', amount: 6.99, plan: 'WEEKLY_PRO', method: 'PayPal', ref: 'TXN-43210-ANN' },
    { userEmail: 'muhammad.ali@englishmiami.com', amount: 19.99, plan: 'MONTHLY_PRO', method: 'Credit Card (Visa)', ref: 'TXN-32109-ALI2' },
    { userEmail: 'priya.sharma@englishmiami.com', amount: 19.99, plan: 'MONTHLY_PRO', method: 'MasterCard', ref: 'TXN-21098-PRI2' },
  ];

  for (const p of paymentsData) {
    const studentUser = await prisma.user.findUnique({ where: { email: p.userEmail } });
    if (studentUser) {
      await prisma.payment.upsert({
        where: { transactionRef: p.ref },
        update: {},
        create: {
          userId: studentUser.id,
          amount: p.amount,
          currency: 'USD',
          plan: p.plan,
          status: 'PAID',
          paymentMethod: p.method,
          transactionRef: p.ref,
        }
      });
    }
  }
  console.log('✅ Revenue payments history seeded.');

  // 6. Certificates (Pending & Approved for Admin Review)
  const certsToSeed = [
    {
      email: 'priya.sharma@englishmiami.com',
      levelCode: 'C1',
      title: 'Official CEFR C1 Advanced English Competence Certificate',
      status: 'APPROVED',
      certNum: 'MIA-2026-C1-PRI982',
      grade: 'Distinction',
      score: 96,
      notes: 'Exceptional performance in rhetorical argumentation and complex grammar.',
      issueDaysAgo: 10
    },
    {
      email: 'muhammad.ali@englishmiami.com',
      levelCode: 'B2',
      title: 'Official CEFR B2 Upper Intermediate English Competence Certificate',
      status: 'APPROVED',
      certNum: 'MIA-2026-B2-ALI431',
      grade: 'Merit',
      score: 89,
      notes: 'Demonstrated solid proficiency in corporate negotiations and presentations.',
      issueDaysAgo: 5
    },
    {
      email: 'student@englishmiami.com',
      levelCode: 'B1',
      title: 'Official CEFR B1 Intermediate English Competence Certificate',
      status: 'PENDING',
      certNum: 'MIA-2026-B1-SOF771',
      grade: 'Merit',
      score: 86,
      notes: 'Submitted test scores; waiting for Academic Board review.',
      issueDaysAgo: 1
    },
    {
      email: 'zhang.wei@englishmiami.com',
      levelCode: 'A2',
      title: 'Official CEFR A2 Elementary English Competence Certificate',
      status: 'PENDING',
      certNum: 'MIA-2026-A2-ZHA552',
      grade: 'Pass',
      score: 82,
      notes: 'Completed travel and everyday communication curriculum; awaiting validation.',
      issueDaysAgo: 2
    },
    {
      email: 'lucas.silva@englishmiami.com',
      levelCode: 'A1',
      title: 'Official CEFR A1 Beginner English Competence Certificate',
      status: 'PENDING',
      certNum: 'MIA-2026-A1-LUC319',
      grade: 'Distinction',
      score: 94,
      notes: 'High scores in phonetics, introductions, and everyday routines.',
      issueDaysAgo: 0
    }
  ];

  for (const c of certsToSeed) {
    const student = await prisma.user.findUnique({ where: { email: c.email } });
    if (student) {
      await prisma.certificate.upsert({
        where: { certificateNumber: c.certNum },
        update: {
          status: c.status,
          grade: c.grade,
          score: c.score,
        },
        create: {
          userId: student.id,
          certificateNumber: c.certNum,
          courseLevel: `CEFR Level ${c.levelCode}`,
          title: c.title,
          status: c.status,
          grade: c.grade,
          score: c.score,
          notes: c.notes,
          verificationUrl: `/verify-certificate?id=${c.certNum}`,
          requestedAt: new Date(Date.now() - c.issueDaysAgo * 86400000),
          issueDate: c.status === 'APPROVED' ? new Date(Date.now() - c.issueDaysAgo * 86400000) : null,
          approvedAt: c.status === 'APPROVED' ? new Date(Date.now() - c.issueDaysAgo * 86400000) : null,
        }
      });
    }
  }
  console.log('✅ Certificate requests (Pending & Approved) seeded.');

  // 7. Massively Expanded Courses & Lessons (A0 to C2)
  const curriculum = [
    // ----------------- A0 -----------------
    {
      levelCode: 'A0',
      title: 'A0 Foundation: English from Zero',
      slug: 'a0-foundation',
      description: 'Master the English alphabet, letter combinations, numbers, days of the week, colors, and survival greetings.',
      order: 1,
      lessons: [
        {
          title: 'The English Alphabet, Vowels & Phonics',
          slug: 'a0-alphabet-and-sounds',
          description: 'Learn the 26 letters of the English alphabet, vowels, and phonics.',
          order: 1,
          durationMinutes: 10,
          xpReward: 50,
          objectives: ['Recite all 26 letters', 'Differentiate vowels (A, E, I, O, U) and consonants', 'Pronounce short vs long vowel sounds'],
          explanationHtml: `<h2>The English Alphabet (26 Letters)</h2><p>English uses the Latin alphabet. There are <strong>5 vowels</strong> (A, E, I, O, U) and <strong>21 consonants</strong>.</p><p>Vowels can make short sounds (like <em>cat</em>, <em>bed</em>, <em>sit</em>) or long sounds (like <em>cake</em>, <em>meat</em>, <em>time</em>).</p>`,
          examples: [
            { phrase: 'A is for Apple', translation: 'La A es de Manzana / 苹果', note: 'Short "a" sound' },
            { phrase: 'B is for Book', translation: 'La B es de Libro / 书', note: 'Voiced bilabial stop' },
            { phrase: 'C is for Cat', translation: 'La C es de Gato / 猫', note: 'Hard "k" sound before a, o, u' },
          ],
          vocabulary: [
            { word: 'Apple', phonetic: '/ˈæp.əl/', partOfSpeech: 'noun', definition: 'A round fruit with red or green skin.', example: 'I eat an apple every morning.', translation: 'Manzana / 苹果 / سیب', level: 'A0' },
            { word: 'Book', phonetic: '/bʊk/', partOfSpeech: 'noun', definition: 'A set of printed pages bound together.', example: 'She opens her book to study.', translation: 'Libro / 书 / کتاب', level: 'A0' },
            { word: 'Cat', phonetic: '/kæt/', partOfSpeech: 'noun', definition: 'A small domestic feline animal.', example: 'The cat is sleeping on the chair.', translation: 'Gato / 猫 / بلی', level: 'A0' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which of the following is an English vowel?',
              options: ['B', 'E', 'K', 'T'],
              correctAnswer: 'E',
              explanation: 'The five English vowels are A, E, I, O, and U.',
            },
            {
              type: 'FILL_BLANK',
              prompt: 'A is for ______ (a round red fruit).',
              options: ['Apple', 'Banana', 'Orange', 'Lemon'],
              correctAnswer: 'Apple',
              explanation: 'Apple begins with the letter A.',
            }
          ]
        },
        {
          title: 'Essential Survival Greetings & Goodbyes',
          slug: 'a0-survival-greetings',
          description: 'Polite greetings: Hello, Good morning, How are you?, and Goodbye.',
          order: 2,
          durationMinutes: 12,
          xpReward: 50,
          objectives: ['Greet someone politely based on time of day', 'Ask how someone is doing', 'Say farewell properly'],
          explanationHtml: `<h2>Saying Hello & Goodbye</h2><p>Greetings change based on the time of day:</p><ul><li><strong>Morning</strong> (before 12 PM): <em>Good morning!</em></li><li><strong>Afternoon</strong> (12 PM - 5 PM): <em>Good afternoon!</em></li><li><strong>Evening</strong> (after 5 PM): <em>Good evening!</em></li><li><strong>Anytime casual</strong>: <em>Hi!</em> or <em>Hello!</em></li></ul>`,
          examples: [
            { phrase: 'Good morning, how are you?', translation: 'Buenos días, ¿cómo estás? / 早上好 / صبح بخیر', note: 'Polite daytime greeting' },
            { phrase: 'I am doing well, thank you.', translation: 'Estoy bien, gracias. / 我很好，谢谢。', note: 'Standard polite reply' },
          ],
          vocabulary: [
            { word: 'Hello', phonetic: '/həˈloʊ/', partOfSpeech: 'greeting', definition: 'Used as a friendly greeting.', example: 'Hello! Nice to meet you.', translation: 'Hola / 你好 / ہیلو', level: 'A0' },
            { word: 'Morning', phonetic: '/ˈmɔːr.nɪŋ/', partOfSpeech: 'noun', definition: 'The early part of the day.', example: 'I wake up in the morning.', translation: 'Mañana / 早晨 / صبح', level: 'A0' },
            { word: 'Thanks', phonetic: '/θæŋks/', partOfSpeech: 'exclamation', definition: 'An expression of gratitude.', example: 'Thanks for your help!', translation: 'Gracias / 谢谢 / شکریہ', level: 'A0' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'What do you say to someone at 9:00 AM?',
              options: ['Good morning', 'Good night', 'Good evening', 'See you yesterday'],
              correctAnswer: 'Good morning',
              explanation: 'Before 12:00 PM noon, we say "Good morning".',
            }
          ]
        },
        {
          title: 'Numbers 1-100, Days of the Week & Telling Time',
          slug: 'a0-numbers-days-time',
          description: 'Count from 1 to 100, learn Monday to Sunday, and tell the time accurately.',
          order: 3,
          durationMinutes: 15,
          xpReward: 55,
          objectives: ['Count smoothly from 1 to 100', 'List the seven days of the week', 'Ask and state what time it is'],
          explanationHtml: `<h2>Numbers & Telling Time</h2><p>To ask the time: <em>"What time is it?"</em></p><p>To answer: <em>"It is three o'clock (3:00)"</em> or <em>"It is half past four (4:30)"</em>.</p><p>Days of the week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.</p>`,
          examples: [
            { phrase: 'What time is it? - It is five o\'clock.', translation: '¿Qué hora es? - Son las cinco en punto.', note: 'Telling exact hour' },
            { phrase: 'Today is Monday and tomorrow is Tuesday.', translation: 'Hoy es lunes y mañana es martes.', note: 'Days of the week sequence' },
          ],
          vocabulary: [
            { word: 'Number', phonetic: '/ˈnʌm.bər/', partOfSpeech: 'noun', definition: 'An arithmetical value representing a quantity.', example: 'What is your telephone number?', translation: 'Número / 数字 / نمبر', level: 'A0' },
            { word: 'Time', phonetic: '/taɪm/', partOfSpeech: 'noun', definition: 'The indefinite continued progress of existence and events.', example: 'Do you have the time?', translation: 'Hora / 时间 / وقت', level: 'A0' },
            { word: 'Today', phonetic: '/təˈdeɪ/', partOfSpeech: 'noun', definition: 'On or in the course of this present day.', example: 'Today is a wonderful sunny day.', translation: 'Hoy / 今天 / آج', level: 'A0' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which day comes right after Wednesday?',
              options: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
              correctAnswer: 'Thursday',
              explanation: 'The order is Monday, Tuesday, Wednesday, Thursday, Friday.',
            }
          ]
        },
        {
          title: 'Colors, Shapes & Everyday Common Objects',
          slug: 'a0-colors-shapes-objects',
          description: 'Identify red, blue, green, yellow, shapes, and objects like pen, table, chair, phone.',
          order: 4,
          durationMinutes: 12,
          xpReward: 50,
          objectives: ['Name all standard primary and secondary colors', 'Describe common room objects', 'Form short descriptions (e.g. "a red pen")'],
          explanationHtml: `<h2>Colors & Objects</h2><p>In English, color adjectives come <strong>before</strong> the noun: <em>"A blue chair"</em> (not "a chair blue").</p>`,
          examples: [
            { phrase: 'This is a black laptop on a white desk.', translation: 'Esta es una computadora negra sobre un escritorio blanco.', note: 'Adjective before noun' },
          ],
          vocabulary: [
            { word: 'Chair', phonetic: '/tʃer/', partOfSpeech: 'noun', definition: 'A separate seat for one person.', example: 'Please sit down on that chair.', translation: 'Silla / 椅子 / کرسی', level: 'A0' },
            { word: 'Table', phonetic: '/ˈteɪ.bəl/', partOfSpeech: 'noun', definition: 'A piece of furniture with a flat top and one or more legs.', example: 'Put the book on the table.', translation: 'Mesa / 桌子 / میز', level: 'A0' },
            { word: 'Color', phonetic: '/ˈkʌl.ər/', partOfSpeech: 'noun', definition: 'The visual property of an object (e.g. red, blue).', example: 'What is your favorite color?', translation: 'Color / 颜色 / رنگ', level: 'A0' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Choose the correct word order in English:',
              options: ['car red', 'red car', 'car the red', 'a car red'],
              correctAnswer: 'red car',
              explanation: 'In English, color adjectives precede the noun: "red car".',
            }
          ]
        }
      ]
    },

    // ----------------- A1 -----------------
    {
      levelCode: 'A1',
      title: 'A1 Beginner: Daily Life & Foundations',
      slug: 'a1-daily-life',
      description: 'Introduce yourself, talk about your family, food, shopping, and master the present simple tense.',
      order: 2,
      lessons: [
        {
          title: 'Introducing Yourself & Your Family',
          slug: 'a1-introducing-yourself',
          description: 'Share your name, nationality, age, and describe your family members.',
          order: 1,
          durationMinutes: 15,
          xpReward: 60,
          objectives: ['Introduce yourself with confidence', 'State your country and job', 'Describe basic family ties'],
          explanationHtml: `<h2>Self Introductions</h2><p>Use the verb <strong>to be</strong> (am/is/are) to state identity:</p><p><em>"My name is Maria. I am from Spain. I am a software engineer."</em></p>`,
          examples: [
            { phrase: 'My name is Alex and I am from Mexico.', translation: 'Mi nombre es Alex y soy de México.', note: 'Personal introduction' },
            { phrase: 'I have two brothers and one sister.', translation: 'Tengo dos hermanos y una hermana.', note: 'Family description' },
          ],
          vocabulary: [
            { word: 'Introduce', phonetic: '/ˌɪn.trəˈduːs/', partOfSpeech: 'verb', definition: 'To tell someone another person’s name.', example: 'Allow me to introduce my colleague.', translation: 'Presentar / 介绍', level: 'A1' },
            { word: 'Family', phonetic: '/ˈfæm.əl.i/', partOfSpeech: 'noun', definition: 'A group of one or more parents and their children.', example: 'My family lives in Madrid.', translation: 'Familia / 家庭', level: 'A1' },
            { word: 'Country', phonetic: '/ˈkʌn.tri/', partOfSpeech: 'noun', definition: 'A nation with its own government.', example: 'Which country are you from?', translation: 'País / 国家', level: 'A1' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'I ______ from Brazil and I live in Miami.',
              options: ['am', 'is', 'are', 'be'],
              correctAnswer: 'am',
              explanation: 'With the first-person singular "I", we use "am".',
            }
          ]
        },
        {
          title: 'Present Simple: Daily Routines & Habits',
          slug: 'a1-present-simple-routines',
          description: 'Express habits, daily routines, and master the third-person -s rule.',
          order: 2,
          durationMinutes: 18,
          xpReward: 60,
          objectives: ['Describe your daily schedule', 'Apply third-person -s correctly', 'Form negative sentences with don\'t / doesn\'t'],
          explanationHtml: `<h2>Present Simple Tense</h2><p>Use Present Simple for habits, routines, and permanent facts.</p><p><strong>Rule:</strong> With <em>He, She, It</em>, add <strong>-s</strong> or <strong>-es</strong> to the verb!</p><p>Example: <em>"I drink coffee every morning, but she drinks tea."</em></p>`,
          examples: [
            { phrase: 'He wakes up at 7:00 AM every day.', translation: 'Él se despierta a las 7:00 AM todos los días.', note: 'Notice the -s on wakes' },
            { phrase: 'They do not work on Sundays.', translation: 'Ellos no trabajan los domingos.', note: 'Negative form with do not' },
          ],
          vocabulary: [
            { word: 'Routine', phonetic: '/ruːˈtiːn/', partOfSpeech: 'noun', definition: 'A sequence of actions regularly followed.', example: 'Exercise is part of my morning routine.', translation: 'Rutina / 常规', level: 'A1' },
            { word: 'Wake up', phonetic: '/weɪk ʌp/', partOfSpeech: 'phrasal verb', definition: 'To emerge from sleep.', example: 'I wake up early on weekdays.', translation: 'Despertarse / 醒来', level: 'A1' },
            { word: 'Always', phonetic: '/ˈɔːl.weɪz/', partOfSpeech: 'adverb', definition: 'At all times; on all occasions.', example: 'She always arrives on time.', translation: 'Siempre / 总是', level: 'A1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'She ______ to English class three days a week.',
              options: ['go', 'goes', 'going', 'is go'],
              correctAnswer: 'goes',
              explanation: 'Third-person singular "She" takes "goes" in present simple.',
            }
          ]
        },
        {
          title: 'Ordering Food & Drinks at a Café',
          slug: 'a1-ordering-food-cafe',
          description: 'Polite phrases: "Could I have...", "I would like...", asking for the bill.',
          order: 3,
          durationMinutes: 16,
          xpReward: 65,
          objectives: ['Politely order food and beverages', 'Ask about menu options and prices', 'Request the check or bill'],
          explanationHtml: `<h2>Ordering at a Restaurant</h2><p>Use polite modal structures:</p><ul><li><em>"I would like a cup of coffee, please."</em></li><li><em>"Could I have a sparkling water?"</em></li><li><em>"Can we get the bill, please?"</em></li></ul>`,
          examples: [
            { phrase: 'Could I have an iced coffee with oat milk?', translation: '¿Podría pedir un café helado con leche de avena?', note: 'Polite request' },
            { phrase: 'How much is this sandwich?', translation: '¿Cuánto cuesta este sándwich?', note: 'Price inquiry' },
          ],
          vocabulary: [
            { word: 'Order', phonetic: '/ˈɔːr.dər/', partOfSpeech: 'verb', definition: 'Request something to be made, supplied, or served.', example: 'Are you ready to order?', translation: 'Pedir / 点餐', level: 'A1' },
            { word: 'Bill', phonetic: '/bɪl/', partOfSpeech: 'noun', definition: 'A printed statement of the money owed for goods or services.', example: 'Excuse me, could we have the bill?', translation: 'La cuenta / 账单', level: 'A1' },
            { word: 'Delicious', phonetic: '/dɪˈlɪʃ.əs/', partOfSpeech: 'adjective', definition: 'Highly pleasant to the taste.', example: 'This soup is delicious!', translation: 'Delicioso / 美味的', level: 'A1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which phrase is the most polite way to order coffee?',
              options: ['Give me coffee now.', 'I want coffee.', 'Could I have a coffee, please?', 'Bring coffee.'],
              correctAnswer: 'Could I have a coffee, please?',
              explanation: '"Could I have..., please?" is standard polite English.',
            }
          ]
        },
        {
          title: 'Shopping, Asking Prices & Store Dialogues',
          slug: 'a1-shopping-dialogues',
          description: 'Ask "How much is this?", request different sizes/colors, and complete purchases.',
          order: 4,
          durationMinutes: 15,
          xpReward: 60,
          objectives: ['Ask store clerks for assistance', 'Inquire about item sizes and colors', 'Handle cash and card payments'],
          explanationHtml: `<h2>Shopping English</h2><p>Helpful phrases in a store:</p><ul><li><em>"Do you have this in a medium size?"</em></li><li><em>"Where is the fitting room?"</em></li><li><em>"Can I pay with credit card?"</em></li></ul>`,
          examples: [
            { phrase: 'Excuse me, do you have this shirt in blue?', translation: 'Disculpe, ¿tiene esta camisa en azul?', note: 'Asking for variation' },
          ],
          vocabulary: [
            { word: 'Store', phonetic: '/stɔːr/', partOfSpeech: 'noun', definition: 'A retail establishment selling items to the public.', example: 'The grocery store closes at 9 PM.', translation: 'Tienda / 商店', level: 'A1' },
            { word: 'Price', phonetic: '/praɪs/', partOfSpeech: 'noun', definition: 'The amount of money expected, required, or given in payment.', example: 'The price is ten dollars.', translation: 'Precio / 价格', level: 'A1' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'How ______ does this jacket cost?',
              options: ['much', 'many', 'long', 'often'],
              correctAnswer: 'much',
              explanation: 'With uncountable cost/money, we ask "How much".',
            }
          ]
        }
      ]
    },

    // ----------------- A2 -----------------
    {
      levelCode: 'A2',
      title: 'A2 Elementary: Travel, Past & Future',
      slug: 'a2-elementary-travel',
      description: 'Navigate airports, hotels, restaurants, talk about past vacations, and express future plans.',
      order: 3,
      lessons: [
        {
          title: 'Past Simple: Memories & Vacations',
          slug: 'a2-past-simple-memories',
          description: 'Regular and irregular past tense verbs to describe past trips and events.',
          order: 1,
          durationMinutes: 20,
          xpReward: 70,
          objectives: ['Master key irregular past verbs (went, saw, ate)', 'Ask past questions with Did', 'Describe a past trip'],
          explanationHtml: `<h2>The Past Simple Tense</h2><p>Used for actions finished at a specific point in the past.</p><ul><li>Regular verbs add <strong>-ed</strong>: <em>visit → visited, stay → stayed</em></li><li>Irregular verbs change form: <em>go → went, see → saw, buy → bought</em></li></ul>`,
          examples: [
            { phrase: 'Last summer, we went to Miami Beach.', translation: 'El verano pasado fuimos a Miami Beach.', note: 'Irregular verb: go -> went' },
            { phrase: 'Did you enjoy your vacation?', translation: '¿Disfrutaste de tus vacaciones?', note: 'Question with auxiliary Did' },
          ],
          vocabulary: [
            { word: 'Vacation', phonetic: '/veɪˈkeɪ.ʃən/', partOfSpeech: 'noun', definition: 'An extended period of recreation away from home.', example: 'We took a wonderful vacation.', translation: 'Vacaciones / 假期', level: 'A2' },
            { word: 'Travel', phonetic: '/ˈtræv.əl/', partOfSpeech: 'verb', definition: 'To make a journey.', example: 'I love to travel to new countries.', translation: 'Viajar / 旅行', level: 'A2' },
            { word: 'Arrive', phonetic: '/əˈraɪv/', partOfSpeech: 'verb', definition: 'To reach a destination.', example: 'The flight arrived right on schedule.', translation: 'Llegar / 到达', level: 'A2' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'Yesterday, I ______ (go) to the supermarket to buy groceries.',
              options: ['went', 'gone', 'goed', 'goes'],
              correctAnswer: 'went',
              explanation: 'The past simple of the irregular verb "go" is "went".',
            }
          ]
        },
        {
          title: 'Future Plans: Going To vs. Will',
          slug: 'a2-future-plans-going-to-will',
          description: 'Distinguish between planned intentions (be going to) and spontaneous decisions (will).',
          order: 2,
          durationMinutes: 18,
          xpReward: 70,
          objectives: ['Use "going to" for premeditated plans', 'Use "will" for instant decisions and offers', 'Make predictions based on evidence'],
          explanationHtml: `<h2>Expressing Future Intentions</h2><p><strong>Be Going To:</strong> For plans made before the moment of speaking (<em>"I am going to visit my parents next Saturday."</em>)</p><p><strong>Will:</strong> For decisions made at the moment of speaking (<em>"The phone is ringing. I will answer it!"</em>)</p>`,
          examples: [
            { phrase: 'We are going to buy a new car next month.', translation: 'Vamos a comprar un coche nuevo el mes que viene.', note: 'Planned future intention' },
            { phrase: 'I will help you with those heavy bags.', translation: 'Te ayudaré con esas bolsas pesadas.', note: 'Spontaneous offer' },
          ],
          vocabulary: [
            { word: 'Decision', phonetic: '/dɪˈsɪʒ.ən/', partOfSpeech: 'noun', definition: 'A conclusion or resolution reached after consideration.', example: 'It was a difficult decision to make.', translation: 'Decisión / 决定', level: 'A2' },
            { word: 'Future', phonetic: '/ˈfjuː.tʃər/', partOfSpeech: 'noun', definition: 'The time or a period of time following the moment of speaking.', example: 'What are your future career plans?', translation: 'Futuro / 未来', level: 'A2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Look at those dark clouds! It ______ rain soon.',
              options: ['is going to', 'will', 'is to', 'shall'],
              correctAnswer: 'is going to',
              explanation: 'For predictions based on present evidence (dark clouds), we use "is going to".',
            }
          ]
        },
        {
          title: 'Airport, Hotel & Transit Navigation',
          slug: 'a2-airport-hotel-transit',
          description: 'Check-in counters, boarding gates, passport control, and hotel amenity requests.',
          order: 3,
          durationMinutes: 20,
          xpReward: 75,
          objectives: ['Communicate smoothly at airport check-in and gates', 'Request hotel check-in and room amenities', 'Ask for public transit directions'],
          explanationHtml: `<h2>Airport & Hotel English</h2><p>Key phrases for world travel:</p><ul><li><em>"Here is my passport and boarding pass."</em></li><li><em>"Does this room have complimentary Wi-Fi?"</em></li><li><em>"What time is check-out tomorrow?"</em></li></ul>`,
          examples: [
            { phrase: 'Which gate does the flight to London board from?', translation: '¿Desde qué puerta sale el vuelo a Londres?', note: 'Gate inquiry' },
          ],
          vocabulary: [
            { word: 'Boarding pass', phonetic: '/ˈbɔːr.dɪŋ pæs/', partOfSpeech: 'noun', definition: 'A pass that gives permission to board a flight.', example: 'Have your boarding pass ready.', translation: 'Pase de abordar / 登机牌', level: 'A2' },
            { word: 'Reservation', phonetic: '/ˌrez.ərˈveɪ.ʃən/', partOfSpeech: 'noun', definition: 'An arrangement to secure a seat, room, or service.', example: 'I have a hotel reservation under Rodriguez.', translation: 'Reservación / 预订', level: 'A2' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'Please proceed to ______ 14 for immediate boarding.',
              options: ['Gate', 'Door', 'Port', 'Hall'],
              correctAnswer: 'Gate',
              explanation: 'At an airport, passengers board flights through a "Gate".',
            }
          ]
        },
        {
          title: 'Health, Doctor Visits & Expressing Symptoms',
          slug: 'a2-health-doctor-symptoms',
          description: 'Describe physical symptoms: headache, stomachache, fever, and follow medical instructions.',
          order: 4,
          durationMinutes: 16,
          xpReward: 70,
          objectives: ['Explain symptoms to a doctor or pharmacist', 'Understand prescription instructions', 'Use "have got a headache / fever" correctly'],
          explanationHtml: `<h2>Talking About Illness</h2><p>Use <em>have / have got</em> with aches:</p><p><em>"I have a headache."</em> / <em>"I have got a sore throat and a fever."</em></p>`,
          examples: [
            { phrase: 'I have had a high fever since yesterday evening.', translation: 'He tenido fiebre alta desde ayer por la tarde.', note: 'Describing symptom duration' },
          ],
          vocabulary: [
            { word: 'Headache', phonetic: '/ˈhed.eɪk/', partOfSpeech: 'noun', definition: 'A continuous pain in the head.', example: 'Take this medicine for your headache.', translation: 'Dolor de cabeza / 头痛', level: 'A2' },
            { word: 'Medicine', phonetic: '/ˈmed.ɪ.sən/', partOfSpeech: 'noun', definition: 'A substance used to treat disease or injury.', example: 'Take this medicine twice a day after meals.', translation: 'Medicina / 药物', level: 'A2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which expression correctly describes pain in the stomach?',
              options: ['I have a stomachache.', 'I have stomach hurt.', 'My belly has paining.', 'I feel stomach paining.'],
              correctAnswer: 'I have a stomachache.',
              explanation: '"I have a stomachache" is the standard medical expression.',
            }
          ]
        },
        {
          title: 'Comparative & Superlative Adjectives',
          slug: 'a2-comparatives-superlatives',
          description: 'Compare two or more things: bigger, faster, more expensive, the most important.',
          order: 5,
          durationMinutes: 18,
          xpReward: 70,
          objectives: ['Form regular comparatives (-er, more)', 'Form superlatives (-est, the most)', 'Use irregular forms (good -> better -> best)'],
          explanationHtml: `<h2>Comparative vs. Superlative</h2><p><strong>Short adjectives (1 syllable):</strong> add <em>-er / -est</em>: tall → taller → tallest.</p><p><strong>Long adjectives (2+ syllables):</strong> use <em>more / the most</em>: expensive → more expensive → the most expensive.</p>`,
          examples: [
            { phrase: 'This train is faster and more comfortable than the bus.', translation: 'Este tren es más rápido y más cómodo que el autobús.', note: 'Double comparison' },
          ],
          vocabulary: [
            { word: 'Compare', phonetic: '/kəmˈper/', partOfSpeech: 'verb', definition: 'Estimate, measure, or note the similarity or dissimilarity between.', example: 'Let us compare the two options.', translation: 'Comparar / 比较', level: 'A2' },
            { word: 'Expensive', phonetic: '/ɪkˈspen.sɪv/', partOfSpeech: 'adjective', definition: 'Costing a lot of money.', example: 'Downtown apartments are very expensive.', translation: 'Caro / 昂贵的', level: 'A2' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'Mount Everest is the ______ (high) mountain in the world.',
              options: ['highest', 'higher', 'most high', 'more high'],
              correctAnswer: 'highest',
              explanation: 'Superlative of one-syllable "high" is "highest".',
            }
          ]
        }
      ]
    },

    // ----------------- B1 -----------------
    {
      levelCode: 'B1',
      title: 'B1 Intermediate: Fluency & Workplace',
      slug: 'b1-intermediate-workplace',
      description: 'Express nuanced opinions, handle workplace conversations, master conditionals and reported speech.',
      order: 4,
      lessons: [
        {
          title: 'First & Second Conditionals: Real vs Hypotheses',
          slug: 'b1-conditionals-real-hypothetical',
          description: 'Distinguish between realistic future possibilities (If it rains...) and hypothetical dreams (If I had a million dollars...).',
          order: 1,
          durationMinutes: 22,
          xpReward: 80,
          objectives: ['Construct 1st conditional sentences (If + present, will + verb)', 'Construct 2nd conditional sentences (If + past, would + verb)', 'Express business scenarios and advice'],
          explanationHtml: `<h2>First vs. Second Conditional</h2><p><strong>First Conditional (Realistic):</strong> <em>If you practice speaking daily, you will become fluent.</em></p><p><strong>Second Conditional (Hypothetical / Unreal):</strong> <em>If I had more free time, I would learn three languages.</em></p>`,
          examples: [
            { phrase: 'If we launch the campaign on Monday, our sales will increase.', translation: 'Si lanzamos la campaña el lunes, nuestras ventas aumentarán.', note: 'First conditional (Realistic outcome)' },
            { phrase: 'If I were you, I would accept the job offer.', translation: 'Si yo fuera tú, aceptaría la oferta de trabajo.', note: 'Second conditional (Advice with "were")' },
          ],
          vocabulary: [
            { word: 'Hypothetical', phonetic: '/ˌhaɪ.pəˈθet̬.ɪ.kəl/', partOfSpeech: 'adjective', definition: 'Based on a possible situation rather than reality.', example: 'Let us consider a hypothetical situation.', translation: 'Hipotético / 假设的', level: 'B1' },
            { word: 'Opportunity', phonetic: '/ˌɑː.pɚˈtuː.nə.t̬i/', partOfSpeech: 'noun', definition: 'A set of circumstances that makes it possible to do something.', example: 'This promotion is a tremendous opportunity.', translation: 'Oportunidad / 机会', level: 'B1' },
            { word: 'Consequence', phonetic: '/ˈkɑːn.sə.kwəns/', partOfSpeech: 'noun', definition: 'A result or effect of an action or condition.', example: 'Consider the consequences before deciding.', translation: 'Consecuencia / 后果', level: 'B1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'If I ______ a million dollars, I would build schools worldwide.',
              options: ['have', 'had', 'will have', 'would have'],
              correctAnswer: 'had',
              explanation: 'Second conditional: If + past simple, would + infinitive.',
            }
          ]
        },
        {
          title: 'Job Interview Foundations & Career Questions',
          slug: 'b1-job-interview-foundations',
          description: 'Answer "Tell me about yourself", describe strengths/weaknesses, and use the STAR method.',
          order: 2,
          durationMinutes: 25,
          xpReward: 85,
          objectives: ['Structure professional interview responses', 'Describe career achievements using action verbs', 'Navigate challenging situational questions with confidence'],
          explanationHtml: `<h2>The STAR Method for Interviews</h2><p>Structure your answers clearly:</p><ul><li><strong>S</strong>ituation: Set the context.</li><li><strong>T</strong>ask: What was required?</li><li><strong>A</strong>ction: What specific steps did you take?</li><li><strong>R</strong>esult: What quantifiable outcome was achieved?</li></ul>`,
          examples: [
            { phrase: 'My greatest strength is solving cross-functional technical bottlenecks under tight deadlines.', translation: 'Mi mayor fortaleza es resolver cuellos de botella técnicos bajo plazos estrictos.', note: 'Strong professional response' },
          ],
          vocabulary: [
            { word: 'Accomplishment', phonetic: '/əˈkɑːm.plɪʃ.mənt/', partOfSpeech: 'noun', definition: 'Something that has been achieved successfully.', example: 'Leading this project was my proudest accomplishment.', translation: 'Logro / 成就', level: 'B1' },
            { word: 'Collaborate', phonetic: '/kəˈlæb.ə.reɪt/', partOfSpeech: 'verb', definition: 'Work jointly on an activity or project.', example: 'We collaborate closely with international designers.', translation: 'Colaborar / 合作', level: 'B1' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'In my previous position, I ______ a team of five software engineers.',
              options: ['managed', 'manage', 'was managing', 'managing'],
              correctAnswer: 'managed',
              explanation: 'Past achievements in interviews are stated in past simple: "managed".',
            }
          ]
        },
        {
          title: 'Professional Business Emails & Etiquette',
          slug: 'b1-business-emails-etiquette',
          description: 'Write inquiries, follow-ups, meeting requests, and maintain appropriate professional register.',
          order: 3,
          durationMinutes: 20,
          xpReward: 80,
          objectives: ['Master email greetings and sign-offs', 'Frame polite requests without sounding demanding', 'Write concise follow-up messages'],
          explanationHtml: `<h2>Email Politeness & Register</h2><p>Compare informal vs formal email phrasing:</p><ul><li>Informal: <em>"Send me the file."</em></li><li>Formal: <em>"Could you kindly share the updated report at your earliest convenience?"</em></li></ul>`,
          examples: [
            { phrase: 'I am writing to follow up on our discussion regarding the Q3 roadmap.', translation: 'Le escribo para hacer seguimiento a nuestra conversación sobre la hoja de ruta del Q3.', note: 'Professional follow-up opening' },
          ],
          vocabulary: [
            { word: 'Attachment', phonetic: '/əˈtætʃ.mənt/', partOfSpeech: 'noun', definition: 'An extra document or file added to an email.', example: 'Please review the PDF in the attachment.', translation: 'Archivo adjunto / 附件', level: 'B1' },
            { word: 'Convenience', phonetic: '/kənˈviː.njəns/', partOfSpeech: 'noun', definition: 'A state of being able to proceed with something with little effort or difficulty.', example: 'Please respond at your earliest convenience.', translation: 'Conveniencia / 方便', level: 'B1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which sign-off is best suited for an external business email?',
              options: ['Cheers buddy,', 'Best regards,', 'Later,', 'See ya,'],
              correctAnswer: 'Best regards,',
              explanation: '"Best regards," is universally respected in business correspondence.',
            }
          ]
        },
        {
          title: 'Storytelling: Past Continuous vs. Past Simple',
          slug: 'b1-storytelling-past-continuous',
          description: 'Set background scenes (was walking) interrupted by sudden actions (saw an accident).',
          order: 4,
          durationMinutes: 20,
          xpReward: 75,
          objectives: ['Use Past Continuous for background atmosphere', 'Use Past Simple for main sequence of events', 'Connect events using while, when, and as'],
          explanationHtml: `<h2>Interrupted Actions in the Past</h2><p><em>"While I <strong>was walking</strong> home in the rain, I <strong>dropped</strong> my wallet."</em></p><p>The long, ongoing background action takes Past Continuous; the sudden event takes Past Simple.</p>`,
          examples: [
            { phrase: 'We were discussing the contract when the fire alarm sounded.', translation: 'Estábamos discutiendo el contrato cuando sonó la alarma de incendios.', note: 'Ongoing background interrupted' },
          ],
          vocabulary: [
            { word: 'Interrupt', phonetic: '/ˌɪn.təˈrʌpt/', partOfSpeech: 'verb', definition: 'Stop the continuous progress of an activity or process.', example: 'Sorry to interrupt, but we have an urgent call.', translation: 'Interrumpir / 中断', level: 'B1' },
            { word: 'Coincidence', phonetic: '/koʊˈɪn.sɪ.dəns/', partOfSpeech: 'noun', definition: 'A remarkable concurrence of events or circumstances without apparent causal connection.', example: 'Meeting you here is quite a coincidence!', translation: 'Coincidencia / 巧合', level: 'B1' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'While they were driving to the airport, their tire ______ (burst).',
              options: ['burst', 'was bursting', 'had bursted', 'is bursting'],
              correctAnswer: 'burst',
              explanation: 'Past simple irregular form of "burst" remains "burst".',
            }
          ]
        },
        {
          title: 'Modal Verbs of Deduction & Possibility (Must, Might, Can\'t)',
          slug: 'b1-modals-of-deduction',
          description: 'Express certainty (must be), probability (might be), and impossibility (can\'t be).',
          order: 5,
          durationMinutes: 18,
          xpReward: 80,
          objectives: ['Use "must" for 95%+ logical certainty', 'Use "might/could" for 50% possibility', 'Use "can\'t" for logical impossibility'],
          explanationHtml: `<h2>Degrees of Certainty</h2><ul><li><strong>Must:</strong> <em>"He has three luxury sports cars; he must be wealthy."</em></li><li><strong>Might / Could:</strong> <em>"Take an umbrella; it might rain this afternoon."</em></li><li><strong>Can't:</strong> <em>"That can't be John; he is currently in Tokyo."</em></li></ul>`,
          examples: [
            { phrase: 'She has been working for 14 hours; she must be exhausted.', translation: 'Ha estado trabajando durante 14 horas; debe de estar exhausta.', note: 'Logical deduction' },
          ],
          vocabulary: [
            { word: 'Deduction', phonetic: '/dɪˈdʌk.ʃən/', partOfSpeech: 'noun', definition: 'The drawing of a conclusion from available evidence.', example: 'Her deduction was accurate based on the clues.', translation: 'Deducción / 推论', level: 'B1' },
            { word: 'Certainty', phonetic: '/ˈsɝː.tən.t̬i/', partOfSpeech: 'noun', definition: 'Firm conviction that something is the case.', example: 'There is no absolute certainty in financial markets.', translation: 'Certeza / 确定性', level: 'B1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'The lights are completely off and their car is gone. They ______ be at home.',
              options: ['must', 'can\'t', 'might', 'should'],
              correctAnswer: 'can\'t',
              explanation: 'Given the evidence, it is logically impossible for them to be at home.',
            }
          ]
        }
      ]
    },

    // ----------------- B2 -----------------
    {
      levelCode: 'B2',
      title: 'B2 Upper Intermediate: Professional & Academic Fluency',
      slug: 'b2-upper-intermediate',
      description: 'Business negotiations, presentations, idioms, phrasal verbs, and passive voice in corporate reports.',
      order: 5,
      lessons: [
        {
          title: 'Presentation Signposting & Professional Pitching',
          slug: 'b2-presentation-signposting',
          description: 'Lead conferences and board meetings with signpost phrases: "Moving on to...", "To summarize...".',
          order: 1,
          durationMinutes: 25,
          xpReward: 90,
          objectives: ['Structure keynote speeches logically', 'Utilize signpost phrases between slides', 'Handle audience Q&A with poise'],
          explanationHtml: `<h2>Signposting in Business Presentations</h2><p>Signposts guide the audience through your narrative:</p><ul><li><strong>Starting:</strong> <em>"To begin with, let us examine last quarter's revenue figures."</em></li><li><strong>Transitioning:</strong> <em>"This brings me to my next point..."</em></li><li><strong>Highlighting:</strong> <em>"I’d particularly like to draw your attention to..."</em></li><li><strong>Concluding:</strong> <em>"In conclusion, three immediate actions are required."</em></li></ul>`,
          examples: [
            { phrase: 'Having analyzed the macroeconomic indicators, let us now turn to our customer retention data.', translation: 'Habiendo analizado los indicadores macroeconómicos, pasemos ahora a los datos de retención.', note: 'Sophisticated transition' },
          ],
          vocabulary: [
            { word: 'Signpost', phonetic: '/ˈsaɪn.poʊst/', partOfSpeech: 'verb', definition: 'Provide a sign or indication of the direction of a presentation.', example: 'Always signpost your arguments clearly.', translation: 'Guiar / 指引', level: 'B2' },
            { word: 'Benchmark', phonetic: '/ˈbentʃ.mɑːrk/', partOfSpeech: 'noun', definition: 'A standard against which things may be compared.', example: 'Our product sets the industry benchmark for speed.', translation: 'Punto de referencia / 基准', level: 'B2' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'To ______ our key findings: client satisfaction rose by 24% year-over-year.',
              options: ['summarize', 'summary', 'summing', 'summarization'],
              correctAnswer: 'summarize',
              explanation: 'The standard infinitive signpost is "To summarize...".',
            }
          ]
        },
        {
          title: 'High-Stakes Business Negotiations',
          slug: 'b2-business-negotiations',
          description: 'Tactfully reject proposals, counter-offer, establish trade-offs, and seal commercial deals.',
          order: 2,
          durationMinutes: 24,
          xpReward: 90,
          objectives: ['Use soft language for firm bargaining', 'Propose conditional trade-offs ("Provided that...")', 'Safeguard commercial interests in discussion'],
          explanationHtml: `<h2>Negotiation Strategies</h2><p>Instead of blunt rejection (<em>"We cannot accept this price"</em>), use diplomatic framing:</p><p><em>"We would be willing to reconsider the delivery schedule, provided that you can meet our unit cost threshold."</em></p>`,
          examples: [
            { phrase: 'Provided that payment is settled within 30 days, we can offer a 10% volume discount.', translation: 'Siempre que el pago se liquide en 30 días, podemos ofrecer un 10% de descuento por volumen.', note: 'Conditional concession' },
          ],
          vocabulary: [
            { word: 'Concession', phonetic: '/kənˈseʃ.ən/', partOfSpeech: 'noun', definition: 'A thing that is granted, especially in response to demands.', example: 'Both parties had to make significant concessions.', translation: 'Concesión / 让步', level: 'B2' },
            { word: 'Counterpart', phonetic: '/ˈkaʊn.t̬ɚ.pɑːrt/', partOfSpeech: 'noun', definition: 'A person holding a corresponding position in another organization.', example: 'I spoke with my European counterpart yesterday.', translation: 'Homólogo / 对应方', level: 'B2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which connective means "only if" in commercial agreements?',
              options: ['Provided that', 'Unless', 'Although', 'Despite'],
              correctAnswer: 'Provided that',
              explanation: '"Provided that" sets a mandatory condition.',
            }
          ]
        },
        {
          title: 'Idiomatic Expressions & Natural Phrasal Verbs',
          slug: 'b2-idioms-phrasal-verbs',
          description: 'Master idioms like "cut corners", "hit the nail on the head", and "think outside the box".',
          order: 3,
          durationMinutes: 22,
          xpReward: 85,
          objectives: ['Incorporate common native idioms accurately', 'Avoid overusing cliches', 'Understand figurative meanings in conversations'],
          explanationHtml: `<h2>Everyday Idiomatic English</h2><ul><li><em>"Cut corners"</em>: To do something poorly or cheaply to save time/money.</li><li><em>"Hit the ground running"</em>: Start a new venture with high energy and speed.</li><li><em>"Call it a day"</em>: Stop working on something for the day.</li></ul>`,
          examples: [
            { phrase: 'We have made tremendous progress today; let\'s call it a day.', translation: 'Hemos avanzado muchísimo hoy; dejémoslo por hoy.', note: 'Natural workplace idiom' },
          ],
          vocabulary: [
            { word: 'Idiom', phonetic: '/ˈɪd.i.əm/', partOfSpeech: 'noun', definition: 'A group of words established by usage as having a meaning not deducible from those of the individual words.', example: 'Idioms enrich conversational English.', translation: 'Modismo / 习语', level: 'B2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'If someone "cuts corners" on a building project, what did they do?',
              options: ['They built curved walls.', 'They sacrificed quality or safety to save money.', 'They finished ahead of schedule with perfection.', 'They spent double the budget.'],
              correctAnswer: 'They sacrificed quality or safety to save money.',
              explanation: '"Cutting corners" means taking cheap or unsafe shortcuts.',
            }
          ]
        },
        {
          title: 'Passive Voice in Corporate Reports & Journalism',
          slug: 'b2-passive-voice-reports',
          description: 'Focus on facts and events rather than the actor: "Mistakes were made", "The merger was approved".',
          order: 4,
          durationMinutes: 20,
          xpReward: 85,
          objectives: ['Form passive voice across all tenses', 'Understand when passive register is preferred', 'Maintain objectivity in formal documentation'],
          explanationHtml: `<h2>The Corporate Passive Voice</h2><p>In formal writing, the action or result is often more important than who performed it:</p><p><em>"The financial audit was concluded last night."</em> (instead of "The auditor concluded the audit.")</p>`,
          examples: [
            { phrase: 'A formal investigation has been launched by regulatory authorities.', translation: 'Las autoridades reguladoras han iniciado una investigación formal.', note: 'Journalistic passive' },
          ],
          vocabulary: [
            { word: 'Objective', phonetic: '/əbˈdʒek.tɪv/', partOfSpeech: 'adjective', definition: 'Not influenced by personal feelings or opinions in considering and representing facts.', example: 'Journalists must maintain an objective stance.', translation: 'Objetivo / 客观的', level: 'B2' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'The new data privacy regulations ______ (approve) by parliament yesterday.',
              options: ['were approved', 'are approved', 'approved', 'had approving'],
              correctAnswer: 'were approved',
              explanation: 'Past simple passive: were + past participle (approved).',
            }
          ]
        },
        {
          title: 'Third Conditional & Mixed Conditionals (Expressing Regret)',
          slug: 'b2-third-and-mixed-conditionals',
          description: 'Discuss past events that cannot be changed: "If we had invested earlier, we would be market leaders today."',
          order: 5,
          durationMinutes: 24,
          xpReward: 90,
          objectives: ['Formulate 3rd conditionals for past regrets', 'Construct mixed conditionals linking past events to present results', 'Express nuanced strategic analysis'],
          explanationHtml: `<h2>Past Regret & Mixed Conditionals</h2><p><strong>Third Conditional (Past → Past):</strong><br/><em>"If we had hired more engineers, we would have shipped the product on time."</em></p><p><strong>Mixed Conditional (Past → Present):</strong><br/><em>"If I had studied medicine, I would be a doctor today."</em></p>`,
          examples: [
            { phrase: 'Had we known about the market downturn, we would have restructured our portfolio.', translation: 'Si hubiéramos sabido sobre la caída del mercado, habríamos reestructurado nuestra cartera.', note: 'Inverted formal conditional' },
          ],
          vocabulary: [
            { word: 'Regret', phonetic: '/rɪˈɡret/', partOfSpeech: 'noun', definition: 'A feeling of sadness or disappointment over an occurrence or omission.', example: 'We have no regrets regarding our strategic pivot.', translation: 'Arrepentimiento / 遗憾', level: 'B2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'If she ______ (listen) to her advisor, she would not have lost her investment.',
              options: ['had listened', 'listened', 'would listen', 'listens'],
              correctAnswer: 'had listened',
              explanation: 'Third conditional: If + past perfect (had listened), would have + participle.',
            }
          ]
        }
      ]
    },

    // ----------------- C1 -----------------
    {
      levelCode: 'C1',
      title: 'C1 Advanced: Nuance, Rhetoric & Precision',
      slug: 'c1-advanced-rhetoric',
      description: 'Master negative inversion, diplomatic nuance, hedging, academic discourse, and effortless eloquence.',
      order: 6,
      lessons: [
        {
          title: 'Negative Inversion for Rhetorical Impact',
          slug: 'c1-negative-inversion-rhetoric',
          description: 'Craft commanding sentences: "Seldom have I witnessed...", "Rarely does an innovation...", "Under no circumstances should you...".',
          order: 1,
          durationMinutes: 26,
          xpReward: 100,
          objectives: ['Master restrictive negative adverbials (Seldom, Rarely, Scarcely, Never)', 'Invert auxiliary verbs and subjects with precision', 'Elevate speeches, editorials, and legal arguments'],
          explanationHtml: `<h2>Negative Inversion Mechanics</h2><p>When negative or restrictive adverbs start a sentence for dramatic or formal emphasis, invert the subject and auxiliary:</p><p>Standard: <em>"We rarely see such groundbreaking technology."</em></p><p>Inverted: <em>"<strong>Rarely do we see</strong> such groundbreaking technology."</em></p>`,
          examples: [
            { phrase: 'Seldom has a breakthrough generated such profound ethical debate.', translation: 'Rara vez un avance ha generado un debate ético tan profundo.', note: 'High rhetorical inversion' },
            { phrase: 'Under no circumstances should confidential client files be shared externally.', translation: 'Bajo ninguna circunstancia se deben compartir externamente archivos confidenciales.', note: 'Absolute regulatory prohibition' },
          ],
          vocabulary: [
            { word: 'Seldom', phonetic: '/ˈsel.dəm/', partOfSpeech: 'adverb', definition: 'Not often; rarely.', example: 'Seldom have we witnessed such unyielding dedication.', translation: 'Rara vez / 很少', level: 'C1' },
            { word: 'Eloquent', phonetic: '/ˈel.ə.kwənt/', partOfSpeech: 'adjective', definition: 'Fluent or persuasive in speaking or writing.', example: 'She delivered an eloquent defense of civil liberties.', translation: 'Elocuente / 雄辩的', level: 'C1' },
            { word: 'Inversion', phonetic: '/ɪnˈvɝː.ʒən/', partOfSpeech: 'noun', definition: 'The reversal of the normal order of words.', example: 'Inversion adds gravitas to public speaking.', translation: 'Inversión / 倒装', level: 'C1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Choose the correct inverted sentence:',
              options: [
                'Not only she passed the bar exam, but she also finished first in her class.',
                'Not only did she pass the bar exam, but she also finished first in her class.',
                'Not only passed she the bar exam, but she finished first.',
                'She passed not only did the bar exam, but also first.'
              ],
              correctAnswer: 'Not only did she pass the bar exam, but she also finished first in her class.',
              explanation: '"Not only" requires auxiliary inversion: "did she pass".',
            }
          ]
        },
        {
          title: 'Diplomatic Nuance, Hedging & Subtle Tactfulness',
          slug: 'c1-diplomatic-hedging-tact',
          description: 'Soften absolute statements using modal hedges, epistemic verbs (tend to, seem to), and tactful euphemisms.',
          order: 2,
          durationMinutes: 24,
          xpReward: 95,
          objectives: ['Avoid overly dogmatic assertions in professional communication', 'Deploy hedges (arguably, conceivably, it appears that)', 'Disagree diplomatically without causing offense'],
          explanationHtml: `<h2>The Art of Hedging in English</h2><p>In executive leadership and diplomacy, bald assertions sound aggressive. Hedging introduces nuance and scientific caution:</p><p>Bald: <em>"Your forecast is wrong."</em></p><p>Hedged: <em>"It appears that certain underlying assumptions in the forecast might warrant further scrutiny."</em></p>`,
          examples: [
            { phrase: 'The preliminary data would appear to suggest a modest correlation, though further testing is advisable.', translation: 'Los datos preliminares parecerían sugerir una modesta correlación, aunque es aconsejable realizar más pruebas.', note: 'Diplomatic academic hedging' },
          ],
          vocabulary: [
            { word: 'Hedge', phonetic: '/hedʒ/', partOfSpeech: 'verb', definition: 'Protect oneself against loss or soften a statement to avoid commitment.', example: 'Scholars frequently hedge their claims.', translation: 'Atenuar / 规避', level: 'C1' },
            { word: 'Scrutiny', phonetic: '/ˈskruː.tən.i/', partOfSpeech: 'noun', definition: 'Critical observation or examination.', example: 'Every detail was subjected to intense legislative scrutiny.', translation: 'Escrutinio / 审查', level: 'C1' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: 'The current macroeconomic trajectory ______ to suggest an imminent market correction.',
              options: ['appears', 'is appearing', 'appear', 'appeared'],
              correctAnswer: 'appears',
              explanation: '"It appears to suggest..." is the standard epistemic hedge.',
            }
          ]
        },
        {
          title: 'Advanced Academic Essays & Cohesive Discourse Markers',
          slug: 'c1-academic-discourse-markers',
          description: 'Deploy markers like "Notwithstanding", "Albeit", "Inasmuch as", and "Furthermore" for rigorous synthesis.',
          order: 3,
          durationMinutes: 25,
          xpReward: 100,
          objectives: ['Connect complex multi-clause arguments logically', 'Use concessive discourse markers (Notwithstanding, Despite)', 'Write publication-ready abstracts and essays'],
          explanationHtml: `<h2>Academic Discourse Markers</h2><ul><li><strong>Notwithstanding:</strong> <em>"Notwithstanding the logistical hurdles, the team delivered the project ahead of time."</em></li><li><strong>Albeit:</strong> <em>"We achieved our revenue target, albeit at the cost of narrower profit margins."</em></li></ul>`,
          examples: [
            { phrase: 'Notwithstanding widespread skepticism, the renewable transition is accelerating globally.', translation: 'A pesar del escepticismo generalizado, la transición renovable se está acelerando a nivel mundial.', note: 'Concessive discourse marker' },
          ],
          vocabulary: [
            { word: 'Notwithstanding', phonetic: '/ˌnɑːt.wɪðˈstæn.dɪŋ/', partOfSpeech: 'preposition', definition: 'In spite of; despite.', example: 'Notwithstanding his injuries, he completed the marathon.', translation: 'A pesar de / 尽管', level: 'C1' },
            { word: 'Albeit', phonetic: '/ɔːlˈbiː.ɪt/', partOfSpeech: 'conjunction', definition: 'Although; even though.', example: 'He accepted the job, albeit with some hesitation.', translation: 'Si bien / 尽管', level: 'C1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which word means "in spite of" and can precede a noun phrase?',
              options: ['Notwithstanding', 'Although', 'Whereas', 'Since'],
              correctAnswer: 'Notwithstanding',
              explanation: '"Notwithstanding the challenges..." acts as a formal preposition equivalent to despite.',
            }
          ]
        },
        {
          title: 'Colloquial Nuance, Sarcasm & British vs. American Idioms',
          slug: 'c1-colloquial-nuance-sarcasm',
          description: 'Navigate dry humor, understated irony ("not bad at all"), and distinct UK/US linguistic divergences.',
          order: 4,
          durationMinutes: 22,
          xpReward: 95,
          objectives: ['Detect vocal inflection indicating sarcasm', 'Interpret British understatements accurately', 'Seamlessly adapt between US and UK terminology'],
          explanationHtml: `<h2>Understatement & Cultural Irony</h2><p>In native English culture, especially British and American, intense praise is often disguised as mild understatement:</p><p><em>"That presentation wasn't half bad!"</em> = It was extraordinary and brilliant.</p>`,
          examples: [
            { phrase: 'To say the launch was turbulent would be a profound understatement.', translation: 'Decir que el lanzamiento fue turbulento sería quedarse muy corto.', note: 'Classic cultural understatement' },
          ],
          vocabulary: [
            { word: 'Understatement', phonetic: '/ˌʌn.dɚˈsteɪt.mənt/', partOfSpeech: 'noun', definition: 'The presentation of something as being smaller or less important than it actually is.', example: 'Calling it a storm was an understatement; it was a hurricane.', translation: 'Atenuación / 低估', level: 'C1' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'If a colleague says an award-winning movie was "not bad at all", what do they mean?',
              options: ['It was mediocre.', 'It was truly impressive and enjoyable.', 'They hated it.', 'They fell asleep.'],
              correctAnswer: 'It was truly impressive and enjoyable.',
              explanation: '"Not bad at all" is a high compliment delivered via native litotes/understatement.',
            }
          ]
        }
      ]
    },

    // ----------------- C2 -----------------
    {
      levelCode: 'C2',
      title: 'C2 Proficiency: Mastery, Literature & Native Precision',
      slug: 'c2-proficiency-mastery',
      description: 'Near-native mastery, litotes, subtle irony, complex contractual registers, and literary stylistics.',
      order: 7,
      lessons: [
        {
          title: 'Literary Devices: Litotes, Irony, Hyperbole & Metaphor',
          slug: 'c2-literary-devices-litotes-irony',
          description: 'Appreciate and generate high-level rhetorical figures: litotes (double negatives for affirmative), chiasmus, and extended allegories.',
          order: 1,
          durationMinutes: 30,
          xpReward: 120,
          objectives: ['Generate litotes effortlessly in discourse', 'Identify subtle irony in classic literature and editorial commentary', 'Master rhetorical devices that characterize native fluency'],
          explanationHtml: `<h2>The Power of Litotes & Rhetoric</h2><p><strong>Litotes</strong> is the deliberate use of understatement in which an affirmative is expressed by the negative of its contrary:</p><p><em>"She is not unmindful of your contributions."</em> = She is keenly aware of your contributions.</p>`,
          examples: [
            { phrase: 'His analytical contributions to the treatise were by no means negligible.', translation: 'Sus contribuciones analíticas al tratado no fueron en absoluto desdeñables.', note: 'Classic C2 litotes' },
          ],
          vocabulary: [
            { word: 'Litotes', phonetic: '/ˈlaɪ.tə.tiːz/', partOfSpeech: 'noun', definition: 'Ironic understatement in which an affirmative is expressed by the negative of its contrary.', example: 'Saying "you won\'t be sorry" is an example of litotes.', translation: 'Lítote / 低调陈述', level: 'C2' },
            { word: 'Unmindful', phonetic: '/ʌnˈmaɪnd.fəl/', partOfSpeech: 'adjective', definition: 'Not conscious or mindful; heedless.', example: 'He remained unmindful of the brewing controversy.', translation: 'Despreocupado / 不顾的', level: 'C2' },
            { word: 'Pervasive', phonetic: '/pɚˈveɪ.sɪv/', partOfSpeech: 'adjective', definition: 'Spreading widely throughout an area or a group of people.', example: 'The pervasive influence of classical literature is evident.', translation: 'Generalizado / 无处不在的', level: 'C2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'Which sentence contains a litotes?',
              options: [
                'He ran as fast as lightning.',
                'The discovery was no small achievement.',
                'The sun smiled down on the peaceful valley.',
                'I have told you this a million times.'
              ],
              correctAnswer: 'The discovery was no small achievement.',
              explanation: '"No small achievement" affirms that it was a monumental achievement via double negation.',
            }
          ]
        },
        {
          title: 'Legal, Financial & Complex Contractual Syntax',
          slug: 'c2-legal-contractual-syntax',
          description: 'Navigate archaic prepositions (herein, indemnification, whereas, pursuant to) and multi-clause legal sentences.',
          order: 2,
          durationMinutes: 28,
          xpReward: 110,
          objectives: ['Deconstruct complex legal clauses without ambiguity', 'Understand contractual boilerplate terms', 'Draft airtight covenants and representations'],
          explanationHtml: `<h2>Contractual Register & Legalese</h2><p>In high-level international law and finance, terms carry precise statutory meaning:</p><ul><li><strong>Pursuant to:</strong> In accordance with (<em>"Pursuant to Clause 14..."</em>)</li><li><strong>Indemnification:</strong> Compensation for harm or loss.</li><li><strong>Notwithstanding the foregoing:</strong> Irrespective of what was just stated.</li></ul>`,
          examples: [
            { phrase: 'The licensee agrees to indemnify and hold harmless the licensor from and against any third-party claims.', translation: 'El licenciatario acuerda indemnizar y eximir de responsabilidad al licenciante de cualquier reclamación de terceros.', note: 'Standard commercial indemnification' },
          ],
          vocabulary: [
            { word: 'Indemnify', phonetic: '/ɪnˈdem.nə.faɪ/', partOfSpeech: 'verb', definition: 'Compensate someone for harm or loss.', example: 'The company agreed to indemnify its directors.', translation: 'Indemnizar / 赔偿', level: 'C2' },
            { word: 'Pursuant', phonetic: '/pɚˈsuː.ənt/', partOfSpeech: 'adjective', definition: 'In accordance with.', example: 'Pursuant to our statutory agreement, dividends were disbursed.', translation: 'Conforme a / 依据', level: 'C2' },
          ],
          exercises: [
            {
              type: 'FILL_BLANK',
              prompt: '______ to the terms stipulated in the agreement, the payment is due on Friday.',
              options: ['Pursuant', 'Following', 'Consistent', 'Along'],
              correctAnswer: 'Pursuant',
              explanation: '"Pursuant to" is the formal legal connective.',
            }
          ]
        },
        {
          title: 'Near-Native Idiomatic Dexterity & Archaic Expressions',
          slug: 'c2-near-native-idiomatic-dexterity',
          description: 'Effortlessly wield idioms like "bite the bullet", "steer clear", "gild the lily", and "through the grapevine".',
          order: 3,
          durationMinutes: 25,
          xpReward: 110,
          objectives: ['Recognize subtle stylistic anachronisms and poetic idioms', 'Speak with natural cadence, pauses, and cultural cadence', 'Perform at near-native proficiency across formal and informal spheres'],
          explanationHtml: `<h2>Idiomatic Dexterity</h2><p>Proficiency learners know not only what an idiom means, but when <em>not</em> to use it so it sounds completely organic rather than recited from a textbook.</p>`,
          examples: [
            { phrase: 'To attempt further embellishment upon this thesis would merely be to gild the lily.', translation: 'Intentar embellecer aún más esta tesis sería simplemente rizar el rizo.', note: 'Rare, refined idiom' },
          ],
          vocabulary: [
            { word: 'Dexterity', phonetic: '/dekˈster.ə.t̬i/', partOfSpeech: 'noun', definition: 'Skill in performing tasks, especially with the hands or mind.', example: 'Her verbal dexterity mesmerized the audience.', translation: 'Destreza / 灵巧', level: 'C2' },
          ],
          exercises: [
            {
              type: 'MULTIPLE_CHOICE',
              prompt: 'What does "to gild the lily" mean?',
              options: ['To paint a flower golden.', 'To unnecessarily add ornament to something already beautiful.', 'To ruin an antique vase.', 'To pick flowers at dawn.'],
              correctAnswer: 'To unnecessarily add ornament to something already beautiful.',
              explanation: '"Gilding the lily" means trying to improve something that is already optimal.',
            }
          ]
        }
      ]
    }
  ];

  for (const cData of curriculum) {
    const level = await prisma.level.findUnique({ where: { code: cData.levelCode } });
    if (!level) continue;

    const course = await prisma.course.upsert({
      where: { slug: cData.slug },
      update: {
        levelCode: cData.levelCode,
        title: cData.title,
        description: cData.description,
        order: cData.order,
        isPublished: true,
      },
      create: {
        levelCode: cData.levelCode,
        title: cData.title,
        slug: cData.slug,
        description: cData.description,
        order: cData.order,
        isPublished: true,
      }
    });

    for (const lData of cData.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { slug: lData.slug },
        update: {
          courseId: course.id,
          levelCode: cData.levelCode,
          title: lData.title,
          description: lData.description,
          order: lData.order,
          durationMinutes: lData.durationMinutes,
          xpReward: lData.xpReward,
          objectivesJson: JSON.stringify(lData.objectives),
          explanationHtml: lData.explanationHtml,
          examplesJson: JSON.stringify(lData.examples),
          vocabularyItemsJson: JSON.stringify(lData.vocabulary || []),
          isPublished: true,
        },
        create: {
          courseId: course.id,
          levelCode: cData.levelCode,
          title: lData.title,
          slug: lData.slug,
          description: lData.description,
          order: lData.order,
          durationMinutes: lData.durationMinutes,
          xpReward: lData.xpReward,
          objectivesJson: JSON.stringify(lData.objectives),
          explanationHtml: lData.explanationHtml,
          examplesJson: JSON.stringify(lData.examples),
          vocabularyItemsJson: JSON.stringify(lData.vocabulary || []),
          isPublished: true,
        }
      });

      // Exercises
      if (lData.exercises && lData.exercises.length > 0) {
        let orderIdx = 1;
        for (const ex of lData.exercises) {
          const exExisting = await prisma.exercise.findFirst({
            where: { lessonId: lesson.id, prompt: ex.prompt }
          });
          if (!exExisting) {
            await prisma.exercise.create({
              data: {
                lessonId: lesson.id,
                type: ex.type,
                prompt: ex.prompt,
                optionsJson: JSON.stringify(ex.options),
                correctAnswer: ex.correctAnswer,
                explanation: ex.explanation,
                order: orderIdx++,
              }
            });
          }
        }
      }

      // Vocabulary
      if (lData.vocabulary && lData.vocabulary.length > 0) {
        for (const v of lData.vocabulary) {
          const wordExisting = await prisma.vocabulary.findFirst({
            where: { word: v.word }
          });
          if (!wordExisting) {
            await prisma.vocabulary.create({
              data: {
                word: v.word,
                phonetic: v.phonetic,
                partOfSpeech: v.partOfSpeech,
                definition: v.definition,
                exampleSentence: v.example || v.exampleSentence,
                translation: v.translation,
                cefrLevel: v.level || v.cefrLevel || 'A1',
              }
            });
          }
        }
      }
    }
  }
  console.log('✅ Massively expanded courses & lessons across A0 to C2 seeded successfully!');

  // 8. Grammar Units
  const grammarData = [
    {
      title: 'Present Simple vs. Present Continuous',
      slug: 'present-simple-vs-continuous',
      levelCode: 'A1',
      category: 'Tenses',
      summary: 'Distinguish between permanent habits and actions happening right now.',
      rulesHtml: `<p>Use <strong>Present Simple</strong> for regular habits: <em>"I work in Miami."</em></p><p>Use <strong>Present Continuous</strong> for actions in progress right now: <em>"I am working on this report right now."</em></p>`,
      examplesJson: JSON.stringify([
        { sentence: 'She reads books every day.', note: 'Present Simple habit' },
        { sentence: 'She is reading a novel right now.', note: 'Present Continuous action in progress' },
      ]),
      exercisesJson: JSON.stringify([
        { prompt: 'Right now, they ______ (watch) the tutorial.', options: ['watch', 'are watching', 'watched', 'watches'], answer: 'are watching' }
      ]),
      order: 1,
    },
    {
      title: 'Mastering Past Simple Irregular Verbs',
      slug: 'past-simple-irregular-verbs',
      levelCode: 'A2',
      category: 'Tenses',
      summary: 'Learn the top 50 irregular verbs including went, saw, bought, took, and thought.',
      rulesHtml: `<p>Irregular verbs do not follow the standard -ed pattern. They have unique forms that must be committed to memory.</p>`,
      examplesJson: JSON.stringify([
        { sentence: 'They went to Paris last summer.', note: 'go -> went' },
        { sentence: 'He bought a new car yesterday.', note: 'buy -> bought' },
      ]),
      exercisesJson: JSON.stringify([
        { prompt: 'She ______ (write) a brilliant essay yesterday.', options: ['wrote', 'written', 'writed', 'writes'], answer: 'wrote' }
      ]),
      order: 2,
    },
    {
      title: 'Present Perfect vs. Past Simple',
      slug: 'present-perfect-vs-past-simple',
      levelCode: 'B1',
      category: 'Tenses',
      summary: 'When to connect past experiences to the present vs. when to specify an exact past time.',
      rulesHtml: `<p>Use <strong>Present Perfect</strong> when the time is unspecified or when the experience connects to the present: <em>"I have visited Miami three times."</em></p><p>Use <strong>Past Simple</strong> when a specific finished time is mentioned: <em>"I visited Miami in 2024."</em></p>`,
      examplesJson: JSON.stringify([
        { sentence: 'Have you ever eaten sushi?', note: 'Life experience (Present Perfect)' },
        { sentence: 'I ate sushi yesterday.', note: 'Specific time yesterday (Past Simple)' },
      ]),
      exercisesJson: JSON.stringify([
        { prompt: 'I ______ (live) here since 2020.', options: ['have lived', 'lived', 'am living', 'had lived'], answer: 'have lived' }
      ]),
      order: 3,
    },
    {
      title: 'Relative Clauses: Defining vs. Non-Defining',
      slug: 'relative-clauses-defining-non-defining',
      levelCode: 'B2',
      category: 'Sentence Structure',
      summary: 'Master who, which, that, where, and when commas are grammatically required.',
      rulesHtml: `<p><strong>Defining clauses</strong> provide essential identifying information with no commas: <em>"The engineer who fixed the bug was rewarded."</em></p><p><strong>Non-defining clauses</strong> provide optional extra info and are bracketed by commas: <em>"My car, which is ten years old, still runs smoothly."</em></p>`,
      examplesJson: JSON.stringify([
        { sentence: 'The student that won first place was celebrated.', note: 'Essential defining clause' },
        { sentence: 'Paris, which is the capital of France, attracts millions of tourists.', note: 'Non-defining with commas' },
      ]),
      exercisesJson: JSON.stringify([
        { prompt: 'The woman ______ lives next door is an English professor.', options: ['who', 'which', 'whom', 'where'], answer: 'who' }
      ]),
      order: 4,
    },
    {
      title: 'Inverted Conditionals in Formal Registers',
      slug: 'inverted-conditionals-formal',
      levelCode: 'C1',
      category: 'Advanced Syntax',
      summary: 'Omit "if" using Had, Should, and Were: "Had you informed me, I would have intervened."',
      rulesHtml: `<p>In high-level academic or legal prose, we omit <em>"if"</em> by placing the auxiliary first:</p><p><em>"Had I known..."</em> instead of <em>"If I had known..."</em></p><p><em>"Should you require assistance..."</em> instead of <em>"If you require assistance..."</em></p>`,
      examplesJson: JSON.stringify([
        { sentence: 'Should you have questions, please reach out to our legal department.', note: 'Inverted first conditional' },
        { sentence: 'Were we to lower prices, our margins would collapse.', note: 'Inverted second conditional' },
      ]),
      exercisesJson: JSON.stringify([
        { prompt: '______ you need any further clarifications, do not hesitate to contact us.', options: ['Should', 'Had', 'Were', 'If should'], answer: 'Should' }
      ]),
      order: 5,
    }
  ];

  for (const g of grammarData) {
    const topicData = {
      title: g.title,
      slug: g.slug,
      category: g.category,
      levelCode: g.levelCode,
      explanation: g.summary + '<br/><br/>' + g.rulesHtml,
      rulesJson: JSON.stringify([g.rulesHtml]),
      examplesJson: g.examplesJson,
      order: g.order,
    };
    await prisma.grammarTopic.upsert({
      where: { slug: g.slug },
      update: topicData,
      create: topicData,
    });
  }
  console.log('✅ Advanced Grammar modules seeded successfully!');

  // 9. Vocabulary Words (100+ Vocabulary across all levels)
  const additionalVocab = [
    { word: 'Water', phonetic: '/ˈwɑː.t̬ɚ/', partOfSpeech: 'noun', definition: 'A colorless, transparent liquid essential for life.', example: 'Please drink plenty of water.', translation: 'Agua / 水 / پانی', level: 'A0' },
    { word: 'Friend', phonetic: '/frend/', partOfSpeech: 'noun', definition: 'A person with whom one has a bond of mutual affection.', example: 'Alex is my closest friend.', translation: 'Amigo / 朋友 / دوست', level: 'A0' },
    { word: 'House', phonetic: '/haʊs/', partOfSpeech: 'noun', definition: 'A building for human habitation.', example: 'They live in a beautiful house.', translation: 'Casa / 房子 / گھر', level: 'A0' },
    { word: 'School', phonetic: '/skuːl/', partOfSpeech: 'noun', definition: 'An institution for educating children or adults.', example: 'She walks to school every morning.', translation: 'Escuela / 学校 / اسکول', level: 'A0' },
    { word: 'Airport', phonetic: '/ˈer.pɔːrt/', partOfSpeech: 'noun', definition: 'A complex of runways and buildings for takeoff and landing of aircraft.', example: 'We arrived at the airport two hours early.', translation: 'Aeropuerto / 机场 / ہوائی اڈا', level: 'A2' },
    { word: 'Luggage', phonetic: '/ˈlʌɡ.ɪdʒ/', partOfSpeech: 'noun', definition: 'Suitcases or other bags in which to pack personal belongings for traveling.', example: 'You may check two pieces of luggage.', translation: 'Equipaje / 行李 / سامان', level: 'A2' },
    { word: 'Flight', phonetic: '/flaɪt/', partOfSpeech: 'noun', definition: 'A journey made by flying, especially in an airplane.', example: 'Our flight departs at noon.', translation: 'Vuelo / 航班 / پرواز', level: 'A2' },
    { word: 'Passport', phonetic: '/ˈpæs.pɔːrt/', partOfSpeech: 'noun', definition: 'An official document issued by a government certifying identity and citizenship.', example: 'Keep your passport in a safe pocket.', translation: 'Pasaporte / 护照 / پاسپورٹ', level: 'A2' },
    { word: 'Strategy', phonetic: '/ˈstræt̬.ə.dʒi/', partOfSpeech: 'noun', definition: 'A plan of action designed to achieve a long-term goal.', example: 'Our marketing strategy led to a 40% growth.', translation: 'Estrategia / 战略 / حکمت عملی', level: 'B1' },
    { word: 'Feedback', phonetic: '/ˈfiːd.bæk/', partOfSpeech: 'noun', definition: 'Information about reactions to a product or a person\'s performance.', example: 'Constructive feedback helps you learn faster.', translation: 'Comentarios / 反馈 / رائے', level: 'B1' },
    { word: 'Efficiency', phonetic: '/ɪˈfɪʃ.ən.si/', partOfSpeech: 'noun', definition: 'The state or quality of being efficient; achieving maximum productivity with minimum wasted effort.', example: 'Automation increases team efficiency.', translation: 'Eficiencia / 效率 / کارکردگی', level: 'B2' },
    { word: 'Negotiate', phonetic: '/nəˈɡoʊ.ʃi.eɪt/', partOfSpeech: 'verb', definition: 'Obtain or bring about by discussion.', example: 'We managed to negotiate favorable terms.', translation: 'Negociar / 谈判 / مذاکرات کرنا', level: 'B2' },
    { word: 'Pragmatic', phonetic: '/præɡˈmæt̬.ɪk/', partOfSpeech: 'adjective', definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', example: 'A pragmatic approach yields measurable results.', translation: 'Pragmático / 务实的 / عملی', level: 'B2' },
    { word: 'Articulate', phonetic: '/ɑːrˈtɪk.jə.lət/', partOfSpeech: 'adjective', definition: 'Having or showing the ability to speak fluently and coherently.', example: 'She is an articulate spokesperson.', translation: 'Articulado / 善于表达的 / فصیح', level: 'C1' },
    { word: 'Ambiguity', phonetic: '/ˌæm.bɪˈɡjuː.ə.t̬i/', partOfSpeech: 'noun', definition: 'The quality of being open to more than one interpretation; inexactness.', example: 'Draft contracts carefully to eliminate ambiguity.', translation: 'Ambigüedad / 歧义 / ابہام', level: 'C1' },
    { word: 'Paradigm', phonetic: '/ˈper.ə.daɪm/', partOfSpeech: 'noun', definition: 'A typical example or pattern of something; a model.', example: 'This discovery sparks a paradigm shift in linguistics.', translation: 'Paradigma / 范式 / نمونہ', level: 'C1' },
    { word: 'Ubiquitous', phonetic: '/juːˈbɪk.wə.t̬əs/', partOfSpeech: 'adjective', definition: 'Present, appearing, or found everywhere.', example: 'Smartphones have become ubiquitous across the globe.', translation: 'Ubicuo / 无处不在的 / ہمہ گیر', level: 'C1' },
    { word: 'Epitome', phonetic: '/ɪˈpɪt.ə.mi/', partOfSpeech: 'noun', definition: 'A person or thing that is a perfect example of a particular quality or type.', example: 'His work is the epitome of scholarly rigor.', translation: 'Epítome / 典范 / خلاصہ', level: 'C2' },
    { word: 'Juxtapose', phonetic: '/ˌdʒʌk.stəˈpoʊz/', partOfSpeech: 'verb', definition: 'Place or deal with close together for contrasting effect.', example: 'The author juxtaposes traditional values with modern challenges.', translation: 'Yuxtaponer / 并列 / آمنے سامنے رکھنا', level: 'C2' },
    { word: 'Quintessential', phonetic: '/ˌkwɪn.təˈsen.ʃəl/', partOfSpeech: 'adjective', definition: 'Representing the most perfect or typical example of a quality or class.', example: 'Afternoon tea is the quintessential British tradition.', translation: 'Por excelencia / 最典型的 / مثالی', level: 'C2' },
  ];

  for (const v of additionalVocab) {
    const existing = await prisma.vocabulary.findFirst({ where: { word: v.word } });
    if (!existing) {
      await prisma.vocabulary.create({
        data: {
          word: v.word,
          phonetic: v.phonetic,
          partOfSpeech: v.partOfSpeech,
          definition: v.definition,
          exampleSentence: v.example || v.exampleSentence,
          translation: v.translation,
          cefrLevel: v.level || v.cefrLevel || 'A1',
        }
      });
    }
  }
  console.log('✅ Over 100+ Vocabulary terms seeded across CEFR levels.');

  console.log('🎉 EnglishMiami Database Seeding complete! All CEFR levels, students, payments, certificates, and lessons are active.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
