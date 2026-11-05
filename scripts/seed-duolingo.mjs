import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DUO_UNITS = [
  // SECTION 1: ROOKIE (A0)
  {
    levelCode: 'A0',
    title: 'Unit 1: Letters, Sounds & First Words',
    slug: 'unit-1-alphabet-and-sounds',
    description: 'Learn the 26 letters of the English alphabet, master vowels, and pronounce your first survival words.',
    order: 1,
    lessons: [
      {
        title: 'Alphabet & Phonics Essentials',
        slug: 'u1-l1-alphabet-phonics',
        description: 'Vowels vs consonants, letter sounds, and spelling fundamentals.',
        order: 1,
        durationMinutes: 6,
        xpReward: 15,
        objectives: ['Recite vowels A, E, I, O, U', 'Identify consonant letter sounds', 'Spell basic three-letter words'],
        explanationHtml: '<h3>Alphabet Essentials</h3><p>English has <strong>5 vowels</strong> (A, E, I, O, U) and <strong>21 consonants</strong>. Every English word contains at least one vowel sound.</p>',
        examples: [
          { phrase: 'A is for Apple', translation: 'A de Manzana / سیب', note: 'Short "a" sound' },
          { phrase: 'C is for Cat', translation: 'C de Gato / بلی', note: 'Hard "k" sound' },
        ],
        vocabulary: [
          { word: 'Apple', phonetic: '/ˈæp.əl/', partOfSpeech: 'noun', definition: 'A round fruit with red or green skin.', exampleSentence: 'She eats an apple.', translation: 'Manzana / سیب', cefrLevel: 'A0' },
          { word: 'Cat', phonetic: '/kæt/', partOfSpeech: 'noun', definition: 'A small domestic animal.', exampleSentence: 'The cat is on the mat.', translation: 'Gato / بلی', cefrLevel: 'A0' },
          { word: 'Sun', phonetic: '/sʌn/', partOfSpeech: 'noun', definition: 'The star at the center of the solar system.', exampleSentence: 'The sun is shining.', translation: 'Sol / سورج', cefrLevel: 'A0' },
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Arrange the words to form the phrase: "A red apple"',
            options: ['apple', 'red', 'A', 'blue', 'cat'],
            correctAnswer: 'A red apple',
            explanation: 'In English, the adjective "red" comes before the noun "apple".'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match the English words with their translations:',
            options: [
              { left: 'Apple', right: 'Manzana / سیب' },
              { left: 'Cat', right: 'Gato / بلی' },
              { left: 'Sun', right: 'Sol / سورج' },
              { left: 'Book', right: 'Libro / کتاب' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Match each vocabulary term correctly.'
          },
          {
            type: 'LISTEN_SELECT',
            prompt: 'Listen and tap the words you hear:',
            audioPrompt: 'The cat and the sun',
            options: ['The', 'cat', 'and', 'the', 'sun', 'dog', 'moon'],
            correctAnswer: 'The cat and the sun',
            explanation: 'You heard "The cat and the sun".'
          },
          {
            type: 'SPEAK_PRACTICE',
            prompt: 'Speak this sentence aloud:',
            audioPrompt: 'A red apple',
            options: ['A red apple'],
            correctAnswer: 'A red apple',
            explanation: 'Speak clearly into the microphone.'
          }
        ]
      },
      {
        title: 'Spelling Your Name & Everyday Words',
        slug: 'u1-l2-spelling-names',
        description: 'Spell names, identify uppercase vs lowercase, and pronounce basic blends.',
        order: 2,
        durationMinutes: 6,
        xpReward: 15,
        objectives: ['Spell your name aloud letter-by-letter', 'Read basic names and signs'],
        explanationHtml: '<h3>How to Spell in English</h3><p>When asked <em>"How do you spell your name?"</em>, say each letter individually: M-A-R-I-A.</p>',
        examples: [
          { phrase: 'How do you spell your name?', translation: '¿Cómo se deletrea tu nombre?', note: 'Polite inquiry' },
          { phrase: 'My name is Alex.', translation: 'Mi nombre es Alex.', note: 'Introducing self' }
        ],
        vocabulary: [
          { word: 'Name', phonetic: '/neɪm/', partOfSpeech: 'noun', definition: 'A word by which a person is known.', exampleSentence: 'What is your name?', translation: 'Nombre / نام', cefrLevel: 'A0' },
          { word: 'Letter', phonetic: '/ˈlet.ər/', partOfSpeech: 'noun', definition: 'A character representing one or more sounds.', exampleSentence: 'The letter A.', translation: 'Letra / حرف', cefrLevel: 'A0' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Arrange in order: "My name is Alex"',
            options: ['is', 'name', 'My', 'Alex', 'her', 'book'],
            correctAnswer: 'My name is Alex',
            explanation: 'Subject pronoun possessive (My) + noun (name) + verb (is) + name (Alex).'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'What ______ your name?',
            options: ['is', 'are', 'am', 'be'],
            correctAnswer: 'is',
            explanation: '"Your name" is singular, so we use the verb "is".'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match the words:',
            options: [
              { left: 'Name', right: 'Nombre / نام' },
              { left: 'Letter', right: 'Letra / حرف' },
              { left: 'Spell', right: 'Deletrear / ہجے کرنا' },
              { left: 'Word', right: 'Palabra / لفظ' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Pair up each word correctly.'
          }
        ]
      },
      {
        title: 'Colors & Basic Descriptors',
        slug: 'u1-l3-colors-descriptors',
        description: 'Red, blue, green, yellow, black, white, big, small.',
        order: 3,
        durationMinutes: 7,
        xpReward: 15,
        objectives: ['Identify 8 basic colors', 'Use big and small to describe things'],
        explanationHtml: '<h3>Colors & Sizes</h3><p>In English, colors come before nouns: <em>"A blue car"</em> (NOT "A car blue").</p>',
        examples: [
          { phrase: 'The blue sky', translation: 'El cielo azul', note: 'Color before noun' },
          { phrase: 'A big house', translation: 'Una casa grande', note: 'Size adjective' }
        ],
        vocabulary: [
          { word: 'Blue', phonetic: '/bluː/', partOfSpeech: 'adjective', definition: 'The color of the clear sky.', exampleSentence: 'The sea is blue.', translation: 'Azul / نیلا', cefrLevel: 'A0' },
          { word: 'Green', phonetic: '/ɡriːn/', partOfSpeech: 'adjective', definition: 'The color of grass.', exampleSentence: 'The grass is green.', translation: 'Verde / سبز', cefrLevel: 'A0' },
          { word: 'Big', phonetic: '/bɪɡ/', partOfSpeech: 'adjective', definition: 'Of considerable size.', exampleSentence: 'An elephant is big.', translation: 'Grande / بڑا', cefrLevel: 'A0' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "A big green book"',
            options: ['green', 'A', 'book', 'big', 'car', 'blue'],
            correctAnswer: 'A big green book',
            explanation: 'Size comes before color: A big green book.'
          },
          {
            type: 'LISTEN_SELECT',
            prompt: 'Listen and build the phrase:',
            audioPrompt: 'A blue car',
            options: ['A', 'blue', 'car', 'green', 'bus'],
            correctAnswer: 'A blue car',
            explanation: 'You heard "A blue car".'
          }
        ]
      }
    ]
  },
  {
    levelCode: 'A0',
    title: 'Unit 2: Essential Greetings & Saying Goodbye',
    slug: 'unit-2-greetings-goodbyes',
    description: 'Learn Hello, Good morning, How are you?, Nice to meet you, and polite farewells.',
    order: 2,
    lessons: [
      {
        title: 'Saying Hello & Good Morning',
        slug: 'u2-l1-saying-hello',
        description: 'Morning, afternoon, evening greetings and casual versus polite hellos.',
        order: 1,
        durationMinutes: 6,
        xpReward: 15,
        objectives: ['Greet someone based on time of day', 'Answer "How are you?"'],
        explanationHtml: '<h3>Daytime Greetings</h3><p>Before 12:00 PM: <em>Good morning</em><br/>12:00 PM - 5:00 PM: <em>Good afternoon</em><br/>After 5:00 PM: <em>Good evening</em></p>',
        examples: [
          { phrase: 'Good morning! How are you?', translation: '¡Buenos días! ¿Cómo estás?', note: 'Formal greeting' },
          { phrase: 'I am fine, thank you.', translation: 'Estoy bien, gracias.', note: 'Polite answer' }
        ],
        vocabulary: [
          { word: 'Hello', phonetic: '/həˈloʊ/', partOfSpeech: 'greeting', definition: 'A standard friendly greeting.', exampleSentence: 'Hello, world!', translation: 'Hola / ہیلو', cefrLevel: 'A0' },
          { word: 'Morning', phonetic: '/ˈmɔːr.nɪŋ/', partOfSpeech: 'noun', definition: 'Early part of the day.', exampleSentence: 'Good morning everyone.', translation: 'Mañana / صبح', cefrLevel: 'A0' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Arrange: "Good morning, how are you?"',
            options: ['are', 'Good', 'you?', 'morning,', 'how', 'night'],
            correctAnswer: 'Good morning, how are you?',
            explanation: 'Standard polite daytime greeting.'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'I ______ fine, thank you.',
            options: ['am', 'is', 'are', 'be'],
            correctAnswer: 'am',
            explanation: 'With "I", we always use "am".'
          },
          {
            type: 'SPEAK_PRACTICE',
            prompt: 'Speak this sentence aloud:',
            audioPrompt: 'Good morning, how are you?',
            options: ['Good morning, how are you?'],
            correctAnswer: 'Good morning, how are you?',
            explanation: 'Practice natural greeting intonation.'
          }
        ]
      },
      {
        title: 'Nice to Meet You & Introductions',
        slug: 'u2-l2-nice-to-meet-you',
        description: 'Introduce yourself and introduce a friend.',
        order: 2,
        durationMinutes: 7,
        xpReward: 15,
        objectives: ['Say "Nice to meet you"', 'Introduce yourself with your name and country'],
        explanationHtml: '<h3>Meeting Someone New</h3><p>When meeting someone for the first time, smile and say: <em>"Nice to meet you!"</em></p>',
        examples: [
          { phrase: 'My name is Sofia. Nice to meet you.', translation: 'Mi nombre es Sofía. Mucho gusto.', note: 'Friendly intro' },
          { phrase: 'Nice to meet you too!', translation: '¡Mucho gusto también!', note: 'Polite response' }
        ],
        vocabulary: [
          { word: 'Meet', phonetic: '/miːt/', partOfSpeech: 'verb', definition: 'To come into the presence of someone.', exampleSentence: 'Nice to meet you.', translation: 'Conocer / ملنا', cefrLevel: 'A0' },
          { word: 'Friend', phonetic: '/frend/', partOfSpeech: 'noun', definition: 'A person with whom one has a bond of mutual affection.', exampleSentence: 'This is my friend John.', translation: 'Amigo / دوست', cefrLevel: 'A0' }
        ],
        exercises: [
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match the greeting phrases:',
            options: [
              { left: 'Nice to meet you', right: 'Mucho gusto / آپ سے مل کر خوشی ہوئی' },
              { left: 'Good morning', right: 'Buenos días / صبح بخیر' },
              { left: 'Goodbye', right: 'Adiós / خدا حافظ' },
              { left: 'Thank you', right: 'Gracias / شکریہ' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Match conversational greetings.'
          },
          {
            type: 'REORDER',
            prompt: 'Translate: "Nice to meet you too"',
            options: ['meet', 'Nice', 'you', 'too', 'to', 'see'],
            correctAnswer: 'Nice to meet you too',
            explanation: '"Too" comes at the end to mean "also".'
          }
        ]
      },
      {
        title: 'Polite Goodbyes & See You Soon',
        slug: 'u2-l3-saying-goodbye',
        description: 'Bye, goodbye, see you tomorrow, have a nice day.',
        order: 3,
        durationMinutes: 6,
        xpReward: 15,
        objectives: ['Say goodbye politely in various situations', 'Wish someone a nice day'],
        explanationHtml: '<h3>Saying Farewell</h3><p>Casual: <em>"Bye!"</em> or <em>"See you soon!"</em><br/>Polite: <em>"Have a nice day!"</em></p>',
        examples: [
          { phrase: 'Have a nice day!', translation: '¡Que tengas un buen día!', note: 'Polite daytime wish' },
          { phrase: 'See you tomorrow!', translation: '¡Hasta mañana!', note: 'Friendly goodbye' }
        ],
        vocabulary: [
          { word: 'Goodbye', phonetic: '/ɡʊdˈbaɪ/', partOfSpeech: 'exclamation', definition: 'Used to express good wishes on parting.', exampleSentence: 'Goodbye, see you later!', translation: 'Adiós / الوداع', cefrLevel: 'A0' },
          { word: 'Tomorrow', phonetic: '/təˈmɔːr.oʊ/', partOfSpeech: 'noun', definition: 'On the day after today.', exampleSentence: 'See you tomorrow.', translation: 'Mañana / کل', cefrLevel: 'A0' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "Have a nice day"',
            options: ['nice', 'Have', 'day', 'a', 'good', 'time'],
            correctAnswer: 'Have a nice day',
            explanation: 'Polite farewell formula.'
          },
          {
            type: 'LISTEN_SELECT',
            prompt: 'Listen and construct the phrase:',
            audioPrompt: 'See you tomorrow',
            options: ['See', 'you', 'tomorrow', 'today', 'yesterday'],
            correctAnswer: 'See you tomorrow',
            explanation: 'You heard "See you tomorrow".'
          }
        ]
      }
    ]
  },

  // SECTION 2: EXPLORER (A1)
  {
    levelCode: 'A1',
    title: 'Unit 3: Food, Cafe & Ordering Drinks',
    slug: 'unit-3-food-cafe-ordering',
    description: 'Order coffee, tea, water, food, ask for the bill, and use polite requests with "please" and "can I have".',
    order: 3,
    lessons: [
      {
        title: 'At the Cafe: Coffee, Tea & Water',
        slug: 'u3-l1-cafe-drinks',
        description: 'Order hot and cold drinks politely.',
        order: 1,
        durationMinutes: 7,
        xpReward: 20,
        objectives: ['Order drinks with "Can I have..."', 'State preferences with "please" and "with milk"'],
        explanationHtml: '<h3>Ordering Drinks Politely</h3><p>Use the golden pattern: <strong>Can I have a [drink], please?</strong></p>',
        examples: [
          { phrase: 'Can I have a coffee, please?', translation: '¿Me da un café, por favor?', note: 'Standard polite order' },
          { phrase: 'Tea with milk and sugar.', translation: 'Té con leche y azúcar.', note: 'Specifying ingredients' }
        ],
        vocabulary: [
          { word: 'Coffee', phonetic: '/ˈkɔː.fi/', partOfSpeech: 'noun', definition: 'A hot beverage made from roasted coffee beans.', exampleSentence: 'I drink coffee every morning.', translation: 'Café / کافی', cefrLevel: 'A1' },
          { word: 'Water', phonetic: '/ˈwɔː.tər/', partOfSpeech: 'noun', definition: 'A colorless, transparent liquid.', exampleSentence: 'A glass of cold water.', translation: 'Agua / پانی', cefrLevel: 'A1' },
          { word: 'Please', phonetic: '/pliːz/', partOfSpeech: 'adverb', definition: 'Used in polite requests.', exampleSentence: 'Help me, please.', translation: 'Por favor / براہ کرم', cefrLevel: 'A1' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "Can I have a coffee, please?"',
            options: ['have', 'coffee,', 'Can', 'I', 'a', 'please?', 'tea', 'want'],
            correctAnswer: 'Can I have a coffee, please?',
            explanation: '"Can I have..." is the most polite, native way to order.'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match drinks and foods:',
            options: [
              { left: 'Coffee', right: 'Café / کافی' },
              { left: 'Water', right: 'Agua / پانی' },
              { left: 'Tea', right: 'Té / چائے' },
              { left: 'Milk', right: 'Leche / دودھ' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Pair up the cafe drinks.'
          },
          {
            type: 'LISTEN_SELECT',
            prompt: 'Listen and tap the words you hear:',
            audioPrompt: 'A glass of water, please',
            options: ['A', 'glass', 'of', 'water,', 'please', 'cup', 'tea'],
            correctAnswer: 'A glass of water, please',
            explanation: 'You heard "A glass of water, please".'
          },
          {
            type: 'SPEAK_PRACTICE',
            prompt: 'Order your drink out loud:',
            audioPrompt: 'Can I have a coffee, please?',
            options: ['Can I have a coffee, please?'],
            correctAnswer: 'Can I have a coffee, please?',
            explanation: 'Speak clearly to practice ordering.'
          }
        ]
      },
      {
        title: 'Ordering Food & Asking for the Bill',
        slug: 'u3-l2-ordering-food-bill',
        description: 'Order breakfast, lunch, and ask "How much is it?" or "Check, please".',
        order: 2,
        durationMinutes: 7,
        xpReward: 20,
        objectives: ['Ask for the check/bill', 'Ask how much something costs'],
        explanationHtml: '<h3>Asking for the Bill</h3><p>In British English: <em>"The bill, please."</em><br/>In American English: <em>"The check, please."</em></p>',
        examples: [
          { phrase: 'Could we have the bill, please?', translation: '¿Nos trae la cuenta, por favor?', note: 'Ending a meal' },
          { phrase: 'How much does this cost?', translation: '¿Cuánto cuesta esto?', note: 'Inquiring price' }
        ],
        vocabulary: [
          { word: 'Bill', phonetic: '/bɪl/', partOfSpeech: 'noun', definition: 'A printed statement of the money owed.', exampleSentence: 'Can I have the bill, please?', translation: 'Cuenta / بل', cefrLevel: 'A1' },
          { word: 'Bread', phonetic: '/bred/', partOfSpeech: 'noun', definition: 'Food made of flour, water, and yeast.', exampleSentence: 'Fresh warm bread.', translation: 'Pan / روٹی', cefrLevel: 'A1' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "The bill, please"',
            options: ['bill,', 'The', 'please', 'water', 'card'],
            correctAnswer: 'The bill, please',
            explanation: 'Standard request to pay in a restaurant.'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'How ______ does this sandwich cost?',
            options: ['much', 'many', 'more', 'cost'],
            correctAnswer: 'much',
            explanation: 'With money/prices, we always use "How much".'
          }
        ]
      }
    ]
  },
  {
    levelCode: 'A1',
    title: 'Unit 4: Daily Routines & Present Simple',
    slug: 'unit-4-daily-routines-present-simple',
    description: 'Talk about morning habits, work schedules, free time, and use the Present Simple tense with I, you, he, she.',
    order: 4,
    lessons: [
      {
        title: 'My Morning Routine: Wake Up & Eat Breakfast',
        slug: 'u4-l1-morning-routine',
        description: 'Wake up, brush teeth, shower, have breakfast, leave for work.',
        order: 1,
        durationMinutes: 8,
        xpReward: 20,
        objectives: ['Describe your morning step by step', 'Use the 3rd person singular -s rule (He wakes up)'],
        explanationHtml: '<h3>Present Simple with He/She</h3><p>Remember to add <strong>-s</strong> or <strong>-es</strong> for he/she/it:<br/><em>I wake up</em> → <em>He wakes up</em></p>',
        examples: [
          { phrase: 'I wake up at seven o\'clock every day.', translation: 'Me despierto a las siete todos los días.', note: 'Daily routine' },
          { phrase: 'She drinks coffee before work.', translation: 'Ella toma café antes de trabajar.', note: 'Notice the -s on drinks' }
        ],
        vocabulary: [
          { word: 'Wake', phonetic: '/weɪk/', partOfSpeech: 'verb', definition: 'To emerge from sleep.', exampleSentence: 'I wake up early.', translation: 'Despertar / جاگنا', cefrLevel: 'A1' },
          { word: 'Breakfast', phonetic: '/ˈbrek.fəst/', partOfSpeech: 'noun', definition: 'The first meal of the day.', exampleSentence: 'He eats breakfast at 8.', translation: 'Desayuno / ناشتہ', cefrLevel: 'A1' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Arrange: "I wake up at seven"',
            options: ['wake', 'I', 'seven', 'at', 'up', 'night', 'sleep'],
            correctAnswer: 'I wake up at seven',
            explanation: 'Subject (I) + verb phrase (wake up) + preposition (at) + time (seven).'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'She ______ coffee every morning.',
            options: ['drinks', 'drink', 'drinking', 'drank'],
            correctAnswer: 'drinks',
            explanation: 'With "She" in present simple, add -s to the verb: "drinks".'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match the routine verbs:',
            options: [
              { left: 'Wake up', right: 'Despertarse / جاگنا' },
              { left: 'Eat breakfast', right: 'Desayunar / ناشتہ کرنا' },
              { left: 'Go to work', right: 'Ir al trabajo / کام پر جانا' },
              { left: 'Sleep', right: 'Dormir / سونا' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Match daily routine actions.'
          }
        ]
      }
    ]
  },

  // SECTION 3: TRAVELER (A2)
  {
    levelCode: 'A2',
    title: 'Unit 5: Airport, Flights & Hotel Check-in',
    slug: 'unit-5-travel-airport-hotels',
    description: 'Navigate passport control, boarding gates, flight luggage, and checking into your hotel room.',
    order: 5,
    lessons: [
      {
        title: 'Airport Security & Boarding Pass',
        slug: 'u5-l1-airport-boarding',
        description: 'Gate, terminal, boarding pass, carry-on luggage, passport control.',
        order: 1,
        durationMinutes: 8,
        xpReward: 25,
        objectives: ['Understand airport announcements', 'Ask for your flight departure gate'],
        explanationHtml: '<h3>Airport Vocabulary</h3><p>Key questions:<br/><em>"Where is gate 14?"</em><br/><em>"Here is my passport and boarding pass."</em></p>',
        examples: [
          { phrase: 'Where is the departure gate for flight 204?', translation: '¿Dónde está la puerta de embarque para el vuelo 204?', note: 'Inquiring gate' },
          { phrase: 'Please place your carry-on luggage on the tray.', translation: 'Por favor coloque su equipaje de mano en la bandeja.', note: 'Security instruction' }
        ],
        vocabulary: [
          { word: 'Flight', phonetic: '/flaɪt/', partOfSpeech: 'noun', definition: 'A journey made by flying in aircraft.', exampleSentence: 'My flight is on time.', translation: 'Vuelo / پرواز', cefrLevel: 'A2' },
          { word: 'Passport', phonetic: '/ˈpæs.pɔːrt/', partOfSpeech: 'noun', definition: 'An official travel identity document.', exampleSentence: 'Show your passport at security.', translation: 'Pasaporte / پاسپورٹ', cefrLevel: 'A2' },
          { word: 'Gate', phonetic: '/ɡeɪt/', partOfSpeech: 'noun', definition: 'The terminal exit where passengers board.', exampleSentence: 'Proceed to gate 12.', translation: 'Puerta de embarque / گیٹ', cefrLevel: 'A2' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Arrange: "Where is the boarding gate?"',
            options: ['is', 'Where', 'boarding', 'the', 'gate?', 'passport', 'car'],
            correctAnswer: 'Where is the boarding gate?',
            explanation: 'Standard question at the airport terminal.'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match airport terms:',
            options: [
              { left: 'Boarding pass', right: 'Tarjeta de embarque / بورڈنگ پاس' },
              { left: 'Passport', right: 'Pasaporte / پاسپورٹ' },
              { left: 'Luggage', right: 'Equipaje / سامان' },
              { left: 'Flight', right: 'Vuelo / پرواز' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Match travel terms.'
          },
          {
            type: 'LISTEN_SELECT',
            prompt: 'Listen and construct the announcement:',
            audioPrompt: 'Please have your passport ready',
            options: ['Please', 'have', 'your', 'passport', 'ready', 'ticket', 'bag'],
            correctAnswer: 'Please have your passport ready',
            explanation: 'You heard "Please have your passport ready".'
          }
        ]
      },
      {
        title: 'Checking In at the Hotel',
        slug: 'u5-l2-hotel-checkin',
        description: 'Room keys, Wi-Fi password, breakfast hours, and checking out.',
        order: 2,
        durationMinutes: 8,
        xpReward: 25,
        objectives: ['Check in with a reservation', 'Ask for the Wi-Fi password and room key'],
        explanationHtml: '<h3>Hotel Reception Phrases</h3><p><em>"I have a reservation under the name Maria."</em><br/><em>"What time is breakfast served?"</em></p>',
        examples: [
          { phrase: 'I have a reservation for two nights.', translation: 'Tengo una reserva por dos noches.', note: 'Arriving at desk' },
          { phrase: 'What is the Wi-Fi password, please?', translation: '¿Cuál es la contraseña del Wi-Fi, por favor?', note: 'Common inquiry' }
        ],
        vocabulary: [
          { word: 'Reservation', phonetic: '/ˌrez.ɚˈveɪ.ʃən/', partOfSpeech: 'noun', definition: 'An arrangement to secure a room.', exampleSentence: 'We have a reservation.', translation: 'Reserva / بکنگ', cefrLevel: 'A2' },
          { word: 'Key', phonetic: '/kiː/', partOfSpeech: 'noun', definition: 'A small tool or card used to open a door.', exampleSentence: 'Here is your room key.', translation: 'Llave / چابی', cefrLevel: 'A2' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "I have a reservation for two nights"',
            options: ['have', 'I', 'reservation', 'a', 'for', 'two', 'nights', 'room', 'is'],
            correctAnswer: 'I have a reservation for two nights',
            explanation: 'Standard hotel check-in phrase.'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'Here is your room ______ (card to open door).',
            options: ['key', 'door', 'bed', 'desk'],
            correctAnswer: 'key',
            explanation: 'A hotel provides a "room key" or keycard.'
          }
        ]
      }
    ]
  },
  {
    levelCode: 'A2',
    title: 'Unit 6: Past Memories & Yesterday (Past Simple)',
    slug: 'unit-6-past-simple-memories',
    description: 'Talk about what you did yesterday, last weekend, and holidays using regular and irregular past verbs.',
    order: 6,
    lessons: [
      {
        title: 'What Did You Do Yesterday? (Regular -ed)',
        slug: 'u6-l1-past-regular-verbs',
        description: 'Worked, walked, cooked, played, watched, talked.',
        order: 1,
        durationMinutes: 8,
        xpReward: 25,
        objectives: ['Form regular past tense with -ed', 'Ask "What did you do yesterday?"'],
        explanationHtml: '<h3>Regular Past Tense (-ed)</h3><p>Add <strong>-ed</strong> to the base verb:<br/><em>play → played</em>, <em>work → worked</em>, <em>watch → watched</em>.</p>',
        examples: [
          { phrase: 'Yesterday I worked for eight hours.', translation: 'Ayer trabajé durante ocho horas.', note: 'Regular verb worked' },
          { phrase: 'She cooked dinner for her family.', translation: 'Ella cocinó la cena para su familia.', note: 'Regular verb cooked' }
        ],
        vocabulary: [
          { word: 'Yesterday', phonetic: '/ˈjes.tɚ.deɪ/', partOfSpeech: 'adverb', definition: 'On the day before today.', exampleSentence: 'Yesterday was Sunday.', translation: 'Ayer / کل (گزشتہ)', cefrLevel: 'A2' },
          { word: 'Worked', phonetic: '/wɜːrkt/', partOfSpeech: 'verb', definition: 'Past of work.', exampleSentence: 'I worked all morning.', translation: 'Trabajó / کام کیا', cefrLevel: 'A2' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "Yesterday I worked all day"',
            options: ['worked', 'Yesterday', 'I', 'all', 'day', 'tomorrow', 'work'],
            correctAnswer: 'Yesterday I worked all day',
            explanation: 'Time expression (Yesterday) + Subject (I) + Past verb (worked) + duration (all day).'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match present to past verbs:',
            options: [
              { left: 'Work', right: 'Worked' },
              { left: 'Cook', right: 'Cooked' },
              { left: 'Play', right: 'Played' },
              { left: 'Watch', right: 'Watched' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Pair regular verbs with their -ed past forms.'
          }
        ]
      }
    ]
  },

  // SECTION 4: CONVERSATIONALIST (B1)
  {
    levelCode: 'B1',
    title: 'Unit 7: Workplace English & Professional Fluency',
    slug: 'unit-7-workplace-professional',
    description: 'Express opinions in meetings, write clear work emails, and communicate effectively with colleagues.',
    order: 7,
    lessons: [
      {
        title: 'Writing Clear Professional Emails',
        slug: 'u7-l1-professional-emails',
        description: 'Subject lines, formal openings, requesting updates, and polite sign-offs.',
        order: 1,
        durationMinutes: 9,
        xpReward: 30,
        objectives: ['Write a formal email inquiry', 'Use phrases like "I hope this email finds you well"'],
        explanationHtml: '<h3>Email Conventions</h3><p>Begin with <em>"Dear [Name],"</em> or <em>"Hello [Name],"</em>.<br/>Close with <em>"Best regards,"</em> or <em>"Sincerely,"</em>.</p>',
        examples: [
          { phrase: 'I am writing to follow up on our previous conversation.', translation: 'Le escribo para dar seguimiento a nuestra conversación anterior.', note: 'Formal business follow-up' },
          { phrase: 'Please let me know if you need any additional details.', translation: 'Por favor avíseme si necesita detalles adicionales.', note: 'Polite closing' }
        ],
        vocabulary: [
          { word: 'Colleague', phonetic: '/ˈkɑː.liːɡ/', partOfSpeech: 'noun', definition: 'A person with whom one works.', exampleSentence: 'She is my respected colleague.', translation: 'Colega / ساتھی', cefrLevel: 'B1' },
          { word: 'Attach', phonetic: '/əˈtætʃ/', partOfSpeech: 'verb', definition: 'To join or fasten something to an email.', exampleSentence: 'I have attached the report.', translation: 'Adjuntar / منسلک کرنا', cefrLevel: 'B1' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Arrange: "I have attached the report for your review"',
            options: ['attached', 'I', 'the', 'report', 'have', 'for', 'your', 'review', 'email'],
            correctAnswer: 'I have attached the report for your review',
            explanation: 'Professional standard sentence for sending documents.'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'Please ______ me know if you have any questions.',
            options: ['let', 'make', 'give', 'say'],
            correctAnswer: 'let',
            explanation: 'The common business idiom is "Please let me know".'
          }
        ]
      },
      {
        title: 'Meetings & Expressing Opinions Diplomatically',
        slug: 'u7-l2-meetings-opinions',
        description: 'Agreeing, politely disagreeing, interrupting tactfully, and summarizing.',
        order: 2,
        durationMinutes: 9,
        xpReward: 30,
        objectives: ['Disagree politely without sounding rude', 'Introduce your perspective with "In my view"'],
        explanationHtml: '<h3>Diplomatic Disagreement</h3><p>Instead of saying <em>"You are wrong"</em>, native speakers say:<br/><em>"I see your point, but from my perspective..."</em></p>',
        examples: [
          { phrase: 'I see what you mean, but we need to consider the timeline.', translation: 'Entiendo tu punto, pero debemos considerar el cronograma.', note: 'Tactful counterpoint' },
          { phrase: 'In my opinion, this approach will deliver better results.', translation: 'En mi opinión, este enfoque dará mejores resultados.', note: 'Expressing viewpoint' }
        ],
        vocabulary: [
          { word: 'Opinion', phonetic: '/əˈpɪn.jən/', partOfSpeech: 'noun', definition: 'A view or judgment formed about something.', exampleSentence: 'In my opinion, we should proceed.', translation: 'Opinión / رائے', cefrLevel: 'B1' },
          { word: 'Consider', phonetic: '/kənˈsɪd.ɚ/', partOfSpeech: 'verb', definition: 'To think carefully about something.', exampleSentence: 'We must consider all options.', translation: 'Considerar / غور کرنا', cefrLevel: 'B1' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "I see your point, but I disagree"',
            options: ['your', 'I', 'point,', 'see', 'but', 'I', 'disagree', 'no', 'wrong'],
            correctAnswer: 'I see your point, but I disagree',
            explanation: 'Diplomatic acknowledgment before disagreeing.'
          },
          {
            type: 'MATCH_PAIRS',
            prompt: 'Match meeting phrases with functions:',
            options: [
              { left: 'In my view', right: 'Expressing an opinion' },
              { left: 'Could I add something?', right: 'Interrupting politely' },
              { left: 'To sum up', right: 'Summarizing a discussion' },
              { left: 'I agree completely', right: 'Expressing strong agreement' }
            ],
            correctAnswer: 'ALL_MATCHED',
            explanation: 'Match conversational workplace functions.'
          }
        ]
      }
    ]
  },

  // SECTION 5: PROFESSIONAL (B2)
  {
    levelCode: 'B2',
    title: 'Unit 8: Business Negotiations & High-Stakes Pitching',
    slug: 'unit-8-business-negotiations',
    description: 'Master contract negotiations, concessions, persuasion, and formal presentations.',
    order: 8,
    lessons: [
      {
        title: 'Pitching Proposals & Value Propositions',
        slug: 'u8-l1-pitching-proposals',
        description: 'Hooking investors, articulating ROI, and demonstrating competitive advantage.',
        order: 1,
        durationMinutes: 10,
        xpReward: 35,
        objectives: ['Structure an executive elevator pitch', 'Articulate return on investment (ROI)'],
        explanationHtml: '<h3>The Executive Pitch</h3><p>An executive presentation starts with the problem, presents the solution, and demonstrates quantifiable impact.</p>',
        examples: [
          { phrase: 'Our solution reduces operating expenditures by thirty percent.', translation: 'Nuestra solución reduce los gastos operativos en un treinta por ciento.', note: 'Quantifiable value prop' },
          { phrase: 'We have identified a significant gap in the international market.', translation: 'Hemos identificado una brecha significativa en el mercado internacional.', note: 'Market opportunity' }
        ],
        vocabulary: [
          { word: 'Negotiate', phonetic: '/nəˈɡoʊ.ʃi.eɪt/', partOfSpeech: 'verb', definition: 'To obtain or bring about by discussion.', exampleSentence: 'They negotiated a favorable contract.', translation: 'Negociar / مذاکرات کرنا', cefrLevel: 'B2' },
          { word: 'Proposal', phonetic: '/prəˈpoʊ.zəl/', partOfSpeech: 'noun', definition: 'A plan or suggestion put forward for consideration.', exampleSentence: 'The board approved our proposal.', translation: 'Propuesta / تجویز', cefrLevel: 'B2' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Translate: "We are prepared to offer a flexible payment schedule"',
            options: ['prepared', 'We', 'are', 'to', 'offer', 'a', 'flexible', 'payment', 'schedule', 'money'],
            correctAnswer: 'We are prepared to offer a flexible payment schedule',
            explanation: 'Strategic negotiation phrasing.'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'Our primary objective is to maximize return on ______ (ROI).',
            options: ['investment', 'investing', 'investor', 'invested'],
            correctAnswer: 'investment',
            explanation: 'The acronym ROI stands for Return On Investment.'
          }
        ]
      }
    ]
  },

  // SECTION 6: MASTER (C1 - C2)
  {
    levelCode: 'C1',
    title: 'Unit 9: Advanced Idiomatic English & Rhetorical Mastery',
    slug: 'unit-9-advanced-idioms-rhetoric',
    description: 'Learn native metaphors, negative inversion, litotes, and executive diplomatic nuance.',
    order: 9,
    lessons: [
      {
        title: 'Negative Inversion for Rhetorical Impact',
        slug: 'u9-l1-negative-inversion',
        description: 'Hardly had, Seldom do, Not only... but also, Under no circumstances.',
        order: 1,
        durationMinutes: 10,
        xpReward: 40,
        objectives: ['Master inverted syntax for emphatic emphasis', 'Analyze formal literary and oratorical prose'],
        explanationHtml: '<h3>Negative Inversion</h3><p>When negative or limiting adverbs start a sentence, invert the subject and auxiliary verb:<br/><em>"Never have I seen such dedication."</em> (Instead of "I have never seen...")</p>',
        examples: [
          { phrase: 'Seldom do we encounter such remarkable eloquence.', translation: 'Raras veces nos encontramos con una elocuencia tan notable.', note: 'Inversion with seldom' },
          { phrase: 'Not only did they meet the target, but they surpassed it.', translation: 'No solo cumplieron la meta, sino que la superaron.', note: 'Emphatic correlation' }
        ],
        vocabulary: [
          { word: 'Eloquence', phonetic: '/ˈel.ə.kwəns/', partOfSpeech: 'noun', definition: 'Fluent or persuasive speaking or writing.', exampleSentence: 'Her eloquence captivated the assembly.', translation: 'Elocuencia / فصاحت', cefrLevel: 'C1' },
          { word: 'Seldom', phonetic: '/ˈsel.dəm/', partOfSpeech: 'adverb', definition: 'Not often; rarely.', exampleSentence: 'Seldom has a leader inspired such loyalty.', translation: 'Rara vez / شاذ و نادر', cefrLevel: 'C1' }
        ],
        exercises: [
          {
            type: 'REORDER',
            prompt: 'Construct the inverted sentence: "Rarely have I witnessed such profound talent"',
            options: ['witnessed', 'Rarely', 'have', 'I', 'such', 'profound', 'talent', 'has', 'seen'],
            correctAnswer: 'Rarely have I witnessed such profound talent',
            explanation: 'Negative adverb (Rarely) + Auxiliary (have) + Subject (I) + Main verb (witnessed).'
          },
          {
            type: 'FILL_BLANK',
            prompt: 'Under no circumstances ______ you share confidential credentials.',
            options: ['should', 'you should', 'must you to', 'you ought'],
            correctAnswer: 'should',
            explanation: 'Under no circumstances triggers inverted syntax: "should you share".'
          }
        ]
      }
    ]
  }
];

async function main() {
  console.log('🌱 Starting Duolingo-style Comprehensive Curriculum Expansion...');

  let totalUnits = 0;
  let totalLessons = 0;
  let totalExercises = 0;

  for (const unit of DUO_UNITS) {
    // 1. Ensure Level exists
    const level = await prisma.level.findUnique({ where: { code: unit.levelCode } });
    if (!level) {
      console.warn(`Level ${unit.levelCode} not found, skipping.`);
      continue;
    }

    // 2. Create/Update Course (Unit)
    const course = await prisma.course.upsert({
      where: { slug: unit.slug },
      update: {
        title: unit.title,
        description: unit.description,
        order: unit.order,
        levelCode: unit.levelCode,
        isPublished: true,
      },
      create: {
        title: unit.title,
        slug: unit.slug,
        description: unit.description,
        order: unit.order,
        levelCode: unit.levelCode,
        isPublished: true,
      },
    });
    totalUnits++;

    // 3. Create/Update Lessons within Unit
    for (const lData of unit.lessons) {
      const lesson = await prisma.lesson.upsert({
        where: { slug: lData.slug },
        update: {
          courseId: course.id,
          title: lData.title,
          description: lData.description,
          levelCode: unit.levelCode,
          order: lData.order,
          durationMinutes: lData.durationMinutes,
          xpReward: lData.xpReward,
          objectivesJson: JSON.stringify(lData.objectives),
          explanationHtml: lData.explanationHtml,
          examplesJson: JSON.stringify(lData.examples),
          vocabularyItemsJson: JSON.stringify(lData.vocabulary?.map((v) => v.word) || []),
          isPublished: true,
        },
        create: {
          courseId: course.id,
          title: lData.title,
          slug: lData.slug,
          description: lData.description,
          levelCode: unit.levelCode,
          order: lData.order,
          durationMinutes: lData.durationMinutes,
          xpReward: lData.xpReward,
          objectivesJson: JSON.stringify(lData.objectives),
          explanationHtml: lData.explanationHtml,
          examplesJson: JSON.stringify(lData.examples),
          vocabularyItemsJson: JSON.stringify(lData.vocabulary?.map((v) => v.word) || []),
          isPublished: true,
        },
      });
      totalLessons++;

      // 4. Exercises
      if (lData.exercises && lData.exercises.length > 0) {
        let orderIdx = 1;
        for (const ex of lData.exercises) {
          const exExisting = await prisma.exercise.findFirst({
            where: { lessonId: lesson.id, prompt: ex.prompt },
          });

          const exPayload = {
            lessonId: lesson.id,
            type: ex.type,
            prompt: ex.prompt,
            audioPrompt: ex.audioPrompt || null,
            optionsJson: JSON.stringify(ex.options),
            correctAnswer: ex.correctAnswer,
            explanation: ex.explanation,
            order: orderIdx++,
          };

          if (exExisting) {
            await prisma.exercise.update({
              where: { id: exExisting.id },
              data: exPayload,
            });
          } else {
            await prisma.exercise.create({
              data: exPayload,
            });
          }
          totalExercises++;
        }
      }

      // 5. Vocabulary
      if (lData.vocabulary && lData.vocabulary.length > 0) {
        for (const v of lData.vocabulary) {
          await prisma.vocabulary.upsert({
            where: { word: v.word },
            update: {
              phonetic: v.phonetic,
              partOfSpeech: v.partOfSpeech,
              definition: v.definition,
              exampleSentence: v.exampleSentence,
              translation: v.translation,
              cefrLevel: v.cefrLevel,
            },
            create: {
              word: v.word,
              phonetic: v.phonetic,
              partOfSpeech: v.partOfSpeech,
              definition: v.definition,
              exampleSentence: v.exampleSentence,
              translation: v.translation,
              cefrLevel: v.cefrLevel,
              category: 'Daily Curriculum',
            },
          });
        }
      }
    }
  }

  console.log(`✅ Duolingo-style curriculum seeded successfully!`);
  console.log(`📊 Statistics: ${totalUnits} Units, ${totalLessons} Lessons, ${totalExercises} Exercises.`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
