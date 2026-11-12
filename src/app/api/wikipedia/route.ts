import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

const FEATURED_ESL_TOPICS = [
  { title: 'Artificial intelligence', category: 'Technology', level: 'B2', description: 'How modern computer systems learn to reason, analyze data, and communicate.' },
  { title: 'Solar System', category: 'Science', level: 'A2', description: 'The Sun and the eight planets orbiting around our cosmic neighborhood.' },
  { title: 'Climate change', category: 'Environment', level: 'B1', description: 'Global temperature shifts, atmospheric science, and clean energy solutions.' },
  { title: 'English language', category: 'Language', level: 'B1', description: 'The history, structure, and global spread of the English language.' },
  { title: 'Coffee', category: 'Culture', level: 'A2', description: 'The world’s favorite morning beverage from roasted bean to cup.' },
  { title: 'Ancient Egypt', category: 'History', level: 'B1', description: 'Pyramids, pharaohs, and civilization along the Nile River valley.' },
  { title: 'Renewable energy', category: 'Science', level: 'B2', description: 'Harnessing solar, wind, and hydro power for a sustainable future.' },
  { title: 'Renaissance', category: 'History', level: 'C1', description: 'The European rebirth of classical art, architecture, and science.' },
];

const OFFLINE_ENCYCLOPEDIA: Record<string, {
  title: string;
  description: string;
  extract: string;
  thumbnail?: string;
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1';
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}> = {
  'artificial intelligence': {
    title: 'Artificial intelligence',
    description: 'Intelligence demonstrated by machines and software systems',
    extract: 'Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the natural intelligence of humans and animals. It is a major branch of computer science that designs and studies intelligent software agents capable of perceiving their environment and taking actions to achieve goals. Today, AI technology powers web search engines, recommendation systems on YouTube and Netflix, medical diagnosis tools, and conversational assistants across global industries.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'B2',
    questions: [
      {
        question: 'How does the article define Artificial Intelligence (AI) within computer science?',
        options: [
          'The hardware manufacturing of traditional mechanical factory engines and tools.',
          'The intelligence demonstrated by machines and software systems rather than humans.',
          'The biological study of human brain cells and nervous system reflexes in medicine.',
          'The manual filing of paper records inside nineteenth-century government libraries.',
        ],
        correctAnswer: 'The intelligence demonstrated by machines and software systems rather than humans.',
        explanation: 'The first card states that AI is the intelligence of machines or software, as opposed to human intelligence.',
      },
      {
        question: 'Which real-world applications of AI technology are highlighted in the reading cards?',
        options: [
          'Traditional agricultural hand tools, wooden sailing ships, and steam locomotives.',
          'Search engines, video recommendation platforms, and conversational assistants.',
          'Underground coal mining tunnels, manual typewriters, and analog radio towers.',
          'Classical oil painting restoration, stone sculpture carving, and pottery kilns.',
        ],
        correctAnswer: 'Search engines, video recommendation platforms, and conversational assistants.',
        explanation: 'The final card mentions search engines, recommendation systems (YouTube/Netflix), and conversational assistants.',
      },
    ],
  },
  'solar system': {
    title: 'Solar System',
    description: 'Gravitationally bound system of the Sun and orbiting planets',
    extract: 'The Solar System is the gravitationally bound system of the Sun and the celestial objects that orbit around it. It formed approximately 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. Nearly all of the system\'s mass is concentrated inside the Sun, while Jupiter holds most of the remaining planetary mass. The four inner planets—Mercury, Venus, Earth, and Mars—are rocky terrestrial worlds composed mainly of silicate rock and metal.',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'A2',
    questions: [
      {
        question: 'How was our Solar System originally formed approximately 4.6 billion years ago?',
        options: [
          'From the sudden collision of two artificial satellites launched from planet Earth.',
          'From the gravitational collapse of a giant interstellar molecular cloud in space.',
          'From volcanic eruptions occurring on the surface of the rocky inner planet Mars.',
          'From frozen ocean water evaporating off the rings of the outer planet Saturn.',
        ],
        correctAnswer: 'From the gravitational collapse of a giant interstellar molecular cloud in space.',
        explanation: 'Card 1 explains that the Solar System formed 4.6 billion years ago from the collapse of a giant molecular cloud.',
      },
      {
        question: 'What are the four inner planets (Mercury, Venus, Earth, and Mars) primarily made of?',
        options: [
          'They are rocky terrestrial planets composed primarily of silicate rock and metal.',
          'They are hollow spheres composed entirely of frozen ammonia and liquid methane.',
          'They are glowing stars made of burning plasma that produce their own sunlight.',
          'They are rings of loose cosmic dust that dissolve every winter season in space.',
        ],
        correctAnswer: 'They are rocky terrestrial planets composed primarily of silicate rock and metal.',
        explanation: 'The final card states that Mercury, Venus, Earth, and Mars are terrestrial planets composed of rock and metal.',
      },
    ],
  },
  'climate change': {
    title: 'Climate change',
    description: 'Long-term shifts in global temperatures and weather patterns',
    extract: 'Climate change refers to long-term shifts in global temperatures and regional weather patterns over decades. While some climate variations occur naturally, human industrial activities have been the primary driver since the 1800s due to burning fossil fuels like coal, oil, and natural gas. Burning these fuels releases greenhouse gases that wrap around the Earth like a thermal blanket, trapping solar heat in the atmosphere and raising surface temperatures across oceans and continents.',
    thumbnail: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
    questions: [
      {
        question: 'What has been the main driver of global climate change since the nineteenth century?',
        options: [
          'Changes in the distance between the Moon and the Pacific Ocean during eclipses.',
          'Human industrial activities, especially the burning of coal, oil, and natural gas.',
          'The natural migration of migratory birds and marine mammals across the equator.',
          'The construction of wooden bridges and bicycle lanes in small European villages.',
        ],
        correctAnswer: 'Human industrial activities, especially the burning of coal, oil, and natural gas.',
        explanation: 'Card 2 states that since the 1800s, human activities—primarily burning fossil fuels—have driven climate change.',
      },
      {
        question: 'How do greenhouse gas emissions affect the Earth’s atmosphere according to the cards?',
        options: [
          'They block all sunlight from reaching the ground and freeze tropical rainforests.',
          'They act like a thermal blanket that traps heat and raises surface temperatures.',
          'They turn ocean salt water into fresh drinking water within a few minutes daily.',
          'They remove gravity from mountain peaks and push clouds out into deep space.',
        ],
        correctAnswer: 'They act like a thermal blanket that traps heat and raises surface temperatures.',
        explanation: 'Card 3 explains that greenhouse gases act like a blanket wrapped around Earth, trapping heat.',
      },
    ],
  },
  'english language': {
    title: 'English language',
    description: 'Global West Germanic language originating in medieval England',
    extract: 'English is a West Germanic language belonging to the Indo-European language family, originally spoken by inhabitants of early medieval England. It takes its name from the Angles, an ancient Germanic tribe that migrated to the island of Great Britain. Over the centuries, English absorbed rich vocabulary from Latin, French, and Old Norse. Today, English is the most widely spoken language in the world, serving as the international language of science, aviation, diplomacy, and digital technology.',
    thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
    questions: [
      {
        question: 'Which language family and historical origin does the English language belong to?',
        options: [
          'It is an East Asian tonal language that originated in ancient coastal Korea.',
          'It is a West Germanic language that originated in early medieval Great Britain.',
          'It is a South American indigenous dialect developed in the Andes mountains.',
          'It is an artificial computer code invented by telegraph operators in 1920.',
        ],
        correctAnswer: 'It is a West Germanic language that originated in early medieval Great Britain.',
        explanation: 'Card 1 explains that English is a West Germanic language originating in early medieval England.',
      },
      {
        question: 'What role does the English language play in modern international society today?',
        options: [
          'It is used only by historians who translate medieval manuscripts in museums.',
          'It serves as the global language of science, aviation, trade, and technology.',
          'It is restricted to small farming towns located in northern Scotland and Wales.',
          'It has been replaced by ancient Latin in all modern airports and universities.',
        ],
        correctAnswer: 'It serves as the global language of science, aviation, trade, and technology.',
        explanation: 'Card 3 highlights that English serves as the international lingua franca of science, aviation, and trade.',
      },
    ],
  },
  'coffee': {
    title: 'Coffee',
    description: 'Popular brewed beverage prepared from roasted coffee beans',
    extract: 'Coffee is a brewed drink prepared from roasted coffee beans, which are the seeds of berries from the Coffea plant. Darkly colored, aromatic, and slightly bitter, coffee has a gentle stimulating effect on humans because of its natural caffeine content. First cultivated and brewed in Yemen and East Africa, coffee houses quickly became lively centers of conversation and trade. Today, green coffee beans are harvested, roasted to bring out rich flavor, ground into fine particles, and steeped in hot water.',
    thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'A2',
    questions: [
      {
        question: 'Why does drinking coffee have a stimulating and energizing effect on people?',
        options: [
          'Because coffee beans are frozen in liquid nitrogen before being sold in stores.',
          'Because roasted coffee beans naturally contain caffeine, a mild stimulant.',
          'Because coffee is mixed with sparkling mineral water and citrus fruit peel.',
          'Because the Coffea plant only grows on snowy mountain peaks during winter.',
        ],
        correctAnswer: 'Because roasted coffee beans naturally contain caffeine, a mild stimulant.',
        explanation: 'Card 1 states that coffee has a stimulating effect on humans primarily due to its caffeine content.',
      },
      {
        question: 'How are coffee beans prepared before they are brewed with hot water into a drink?',
        options: [
          'The green seeds are separated from the fruit, roasted, and finely ground.',
          'The leaves of the tree are boiled in cold milk for twelve hours without heat.',
          'The wooden roots of the plant are sliced into cubes and dried in the ocean.',
          'The flowers are pressed into olive oil and stored inside glass jars for years.',
        ],
        correctAnswer: 'The green seeds are separated from the fruit, roasted, and finely ground.',
        explanation: 'Card 3 explains that seeds are separated to produce green beans, which are roasted and ground into fine particles.',
      },
    ],
  },
  'ancient egypt': {
    title: 'Ancient Egypt',
    description: 'Civilization of ancient North Africa along the Nile Valley',
    extract: 'Ancient Egypt was a renowned civilization in northeastern Africa, concentrated along the fertile lower reaches of the Nile River. Egyptian civilization united around 3100 BC when Upper and Lower Egypt were joined under the first pharaoh. Its history spanned three major stable eras—the Old, Middle, and New Kingdoms—famous for advances in engineering, medicine, hieroglyphic writing, and agriculture. Monumental landmarks such as the Great Pyramids of Giza and the Sphinx still stand today.',
    thumbnail: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
    questions: [
      {
        question: 'Where was the civilization of Ancient Egypt geographically located and centered?',
        options: [
          'Along the fertile lower reaches of the Nile River in northeastern Africa.',
          'Across the frozen tundra islands of northern Scandinavia and the Arctic Circle.',
          'Inside the tropical island archipelagos of the central South Pacific Ocean.',
          'High in the rocky mountain plateaus of central Mexico and Guatemala.',
        ],
        correctAnswer: 'Along the fertile lower reaches of the Nile River in northeastern Africa.',
        explanation: 'Card 1 states that Ancient Egypt was situated in northeastern Africa along the Nile Valley.',
      },
      {
        question: 'Which monumental architectural achievements from Ancient Egypt remain standing today?',
        options: [
          'The Great Wall of China and the Forbidden Palace in eastern Beijing.',
          'The Pyramids of Giza and the Great Sphinx along the Nile River valley.',
          'The Roman Colosseum and the stone aqueducts of central Italy and Gaul.',
          'The steel suspension bridges and glass skyscrapers of modern New York.',
        ],
        correctAnswer: 'The Pyramids of Giza and the Great Sphinx along the Nile River valley.',
        explanation: 'Card 3 highlights that the Pyramids of Giza and the Great Sphinx remain standing today.',
      },
    ],
  },
  'renewable energy': {
    title: 'Renewable energy',
    description: 'Clean energy collected from naturally replenishing resources',
    extract: 'Renewable energy is clean power derived from natural resources that replenish themselves continuously within a human lifetime without depleting the planet. Major renewable sources include solar radiation from sunlight, wind turbines, hydroelectric water flow, and geothermal heat from inside the Earth. Unlike fossil fuels, renewable energy systems generate electricity, heating, and clean transportation with minimal carbon emissions, helping nations build sustainable and independent energy grids.',
    thumbnail: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'B2',
    questions: [
      {
        question: 'What is the defining characteristic of a renewable energy resource?',
        options: [
          'It comes from natural sources that replenish themselves within a human lifetime.',
          'It requires burning underground coal reserves that take millions of years to form.',
          'It can only be generated inside laboratory batteries during total solar eclipses.',
          'It produces heavy smoke and carbon soot to warm up cold industrial cities.',
        ],
        correctAnswer: 'It comes from natural sources that replenish themselves within a human lifetime.',
        explanation: 'Card 1 defines renewable energy as energy from natural resources that replenish themselves in less than a human lifetime.',
      },
      {
        question: 'Which natural sources are commonly used to generate renewable electricity today?',
        options: [
          'Diesel fuel generators, refined petroleum oil, and compressed natural gas.',
          'Sunlight, wind power, flowing water (hydroelectric), and geothermal heat.',
          'Plastic waste incineration, charcoal furnaces, and synthetic chemical fuels.',
          'Lead-acid car batteries, kerosene lamps, and underground peat moss fires.',
        ],
        correctAnswer: 'Sunlight, wind power, flowing water (hydroelectric), and geothermal heat.',
        explanation: 'Card 2 lists sunlight, wind, the movement of water, and geothermal heat as primary renewable sources.',
      },
    ],
  },
  'renaissance': {
    title: 'Renaissance',
    description: 'European cultural, artistic, and scientific rebirth after the Middle Ages',
    extract: 'The Renaissance was a transformative period of European cultural, artistic, political, and scientific rebirth that followed the Middle Ages. Spanning roughly from the 14th to the 17th century and beginning in Florence, Italy, it sparked a renewed interest in classical Greek and Roman philosophy, literature, and anatomy. Iconic polymaths, artists, and writers—including Leonardo da Vinci, Michelangelo, Galileo Galilei, and William Shakespeare—created timeless masterpieces during this era.',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=80',
    cefrLevel: 'C1',
    questions: [
      {
        question: 'What major historical and cultural movement did the European Renaissance promote?',
        options: [
          'The abandonment of all printed books in favor of oral storytelling in villages.',
          'The rediscovery and rebirth of classical philosophy, literature, art, and science.',
          'The replacement of painting and sculpture with automated factory mass production.',
          'The isolation of European cities from international trade and maritime navigation.',
        ],
        correctAnswer: 'The rediscovery and rebirth of classical philosophy, literature, art, and science.',
        explanation: 'Card 1 & 2 explain that the Renaissance was a cultural rebirth promoting the rediscovery of classical philosophy, literature, and art.',
      },
      {
        question: 'Which historical figures thrived and created masterpieces during the Renaissance era?',
        options: [
          'Leonardo da Vinci, Michelangelo, Galileo Galilei, and William Shakespeare.',
          'Julius Caesar, Alexander the Great, Cleopatra, and Emperor Augustus of Rome.',
          'Thomas Edison, Nikola Tesla, Albert Einstein, and Marie Curie in the 1900s.',
          'Neil Armstrong, Alan Turing, Tim Berners-Lee, and Steve Jobs in modern times.',
        ],
        correctAnswer: 'Leonardo da Vinci, Michelangelo, Galileo Galilei, and William Shakespeare.',
        explanation: 'Card 3 specifically names Leonardo da Vinci, Michelangelo, and William Shakespeare as key Renaissance figures.',
      },
    ],
  },
};

function estimateCefrLevel(text: string): 'A2' | 'B1' | 'B2' | 'C1' {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'B1';
  const avgLen = words.reduce((acc, w) => acc + w.length, 0) / words.length;
  if (avgLen > 6.2) return 'C1';
  if (avgLen > 5.4) return 'B2';
  if (avgLen > 4.6) return 'B1';
  return 'A2';
}

const WORD_DEFINITIONS: Record<string, string> = {
  intelligence: 'The ability to acquire, understand, and apply knowledge and skills.',
  machines: 'Engineered devices that use power to perform specific tasks.',
  gravitationally: 'By the natural force of attraction between physical masses in space.',
  terrestrial: 'Relating to Earth or rocky planetary surfaces composed of stone and metal.',
  temperatures: 'Measured degrees of heat or cold present in an environment or atmosphere.',
  emissions: 'Gases and particles released into the air, especially by human industry.',
  germanic: 'Relating to the northern European branch of the Indo-European language family.',
  international: 'Existing, occurring, or carried on between two or more nations globally.',
  stimulating: 'Increasing alertness, energy, and mental or physical activity.',
  roasted: 'Cooked or browned by prolonged exposure to dry heat in an oven or roaster.',
  civilization: 'An advanced stage of human social, cultural, and political organization.',
  monumental: 'Great in importance, size, or durability, such as historic stone landmarks.',
  renewable: 'Capable of being naturally replenished without being used up or depleted.',
  sustainable: 'Able to be maintained over the long term without harming the environment.',
  renaissance: 'A cultural revival or rebirth of art, literature, and learning.',
  philosophy: 'The study of fundamental questions about knowledge, existence, and values.',
};

function extractVocabulary(text: string) {
  const words = text.match(/\b[A-Za-z]{6,}\b/g) || [];
  const uniqueWords = Array.from(new Set(words.map((w) => w.toLowerCase())));
  const commonStopWords = new Set([
    'people', 'different', 'between', 'through', 'because', 'another', 'around',
    'without', 'however', 'against', 'already', 'several', 'general', 'example',
    'including', 'information', 'system', 'number', 'called', 'became', 'during',
  ]);

  return uniqueWords
    .filter((w) => !commonStopWords.has(w))
    .slice(0, 8)
    .map((word) => {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
      return {
        word: capitalized,
        note: WORD_DEFINITIONS[word] || `Key academic term used in this article (${capitalized}).`,
      };
    });
}

function buildStudyCards(title: string, extract: string, vocab: Array<{ word: string; note: string }>) {
  const rawSentences = extract
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const cardTitles = [
    `Card 1: Core Definition & Introduction to ${title}`,
    `Card 2: Key Principles & How ${title} Works`,
    `Card 3: Global Impact & Real-World Context`,
  ];

  if (rawSentences.length <= 2) {
    return [
      {
        id: 'card-1',
        stepNumber: 1,
        heading: cardTitles[0],
        text: extract,
        keyTerm: vocab[0]?.word || title,
        keyDefinition: vocab[0]?.note || `Core concept of ${title}.`,
      },
    ];
  }

  const cards = [];
  const chunkSize = Math.max(1, Math.ceil(rawSentences.length / 3));

  for (let i = 0; i < 3; i++) {
    const slice = rawSentences.slice(i * chunkSize, (i + 1) * chunkSize);
    if (slice.length === 0) continue;
    const vItem = vocab[i] || vocab[0] || { word: title, note: `Essential term in ${title}` };
    cards.push({
      id: `card-${i + 1}`,
      stepNumber: i + 1,
      heading: cardTitles[i] || `Card ${i + 1}: Key Insights`,
      text: slice.join(' '),
      keyTerm: vItem.word,
      keyDefinition: vItem.note,
    });
  }

  return cards;
}

// Balanced-length comprehension questions generator for any live Wikipedia article
function generateBalancedQuestions(title: string, extract: string) {
  const lower = title.toLowerCase();
  const preset =
    OFFLINE_ENCYCLOPEDIA[lower] ||
    Object.values(OFFLINE_ENCYCLOPEDIA).find((e) => e.title.toLowerCase() === lower);

  if (preset && preset.questions) {
    return preset.questions;
  }

  // For arbitrary searched Wikipedia articles, ensure all 4 options have balanced length (~70-85 chars)
  const firstSentence = (extract.split(/(?<=[.!?])\s+/)[0] || '').replace(/\.$/, '');
  const trimmedFact =
    firstSentence.length > 82
      ? firstSentence.slice(0, 79).trim() + '...'
      : firstSentence.padEnd(72, ' ');

  const q1Correct =
    trimmedFact.length >= 45
      ? trimmedFact
      : `${title} is a documented subject examined across modern science, history, and culture.`;

  return [
    {
      question: `Based on the reading cards, which statement accurately describes ${title}?`,
      options: [
        `It is a fictional myth invented by nineteenth-century novelists for stage drama.`,
        q1Correct,
        `It refers exclusively to an ancient maritime treaty signed in northern Europe.`,
        `It describes a seasonal weather pattern that occurs only in polar ice regions.`,
      ],
      correctAnswer: q1Correct,
      explanation: `Card 1 directly introduces ${title} with this factual description.`,
    },
    {
      question: `Why do researchers and students study ${title} in an academic or global context?`,
      options: [
        `To understand its core principles, historical development, and real-world impact.`,
        `To replace all spoken human languages with binary mathematical symbols by 2030.`,
        `To prove that historical events have zero influence on modern technology today.`,
        `To eliminate the need for reading comprehension and vocabulary study in schools.`,
      ],
      correctAnswer: `To understand its core principles, historical development, and real-world impact.`,
      explanation: `The study cards explain the real-world development, structure, and significance of ${title}.`,
    },
  ];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const title = searchParams.get('title');

    if (title) {
      let articleData: any = null;
      const lower = title.toLowerCase();
      const offlinePreset =
        OFFLINE_ENCYCLOPEDIA[lower] ||
        Object.values(OFFLINE_ENCYCLOPEDIA).find((e) =>
          e.title.toLowerCase().includes(lower)
        );

      try {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const res = await fetch(summaryUrl, {
          headers: {
            'User-Agent': 'EnglishMiami-ESL-App/1.0 (https://englishmiami.com; support@englishmiami.com)',
          },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          articleData = await res.json();
        }
      } catch {
        // use offline preset below
      }

      if (!articleData) {
        if (offlinePreset) {
          articleData = {
            title: offlinePreset.title,
            description: offlinePreset.description,
            extract: offlinePreset.extract,
            thumbnail: { source: offlinePreset.thumbnail },
            content_urls: {
              desktop: {
                page: `https://en.wikipedia.org/wiki/${encodeURIComponent(offlinePreset.title)}`,
              },
            },
          };
        } else {
          articleData = {
            title,
            description: `Encyclopedia study topic on ${title}`,
            extract: `${title} is an important subject of study within global arts, science, and history. Scholars, researchers, and students examine ${title} to gain a deeper comprehension of how cultural, scientific, and societal developments have influenced modern civilization. Understanding the key terminology and practical applications of ${title} helps English learners discuss complex real-world topics with confidence.`,
            thumbnail: null,
            content_urls: {
              desktop: {
                page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
              },
            },
          };
        }
      }

      const extractText = offlinePreset?.extract || articleData.extract || '';
      const cefrLevel = offlinePreset?.cefrLevel || estimateCefrLevel(extractText);
      const vocabulary = extractVocabulary(extractText);
      const studyCards = buildStudyCards(articleData.title, extractText, vocabulary);
      const questions = generateBalancedQuestions(articleData.title, extractText);
      const readingMinutes = Math.max(2, Math.ceil(extractText.split(/\s+/).length / 110));

      return NextResponse.json({
        article: {
          title: articleData.title,
          description: articleData.description || 'Wikipedia Knowledge Article',
          extract: extractText,
          thumbnail: articleData.thumbnail?.source || offlinePreset?.thumbnail || null,
          originalImage: articleData.originalimage?.source || null,
          pageUrl:
            articleData.content_urls?.desktop?.page ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          readingMinutes,
          cefrLevel,
          vocabulary,
          studyCards,
          questions,
        },
      });
    }

    if (query) {
      let results: any[] = [];

      try {
        const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&utf8=1&srlimit=8`;
        const res = await fetch(searchApiUrl, {
          headers: {
            'User-Agent': 'EnglishMiami-ESL-App/1.0 (https://englishmiami.com; support@englishmiami.com)',
          },
          next: { revalidate: 3600 },
        });

        if (res.ok) {
          const data = await res.json();
          const rawResults = (data.query?.search || []) as WikiSearchResult[];
          results = rawResults.map((item) => ({
            title: item.title,
            snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
            pageid: item.pageid,
          }));
        }
      } catch {
        // fallback below
      }

      if (results.length === 0) {
        const qLower = query.toLowerCase();
        results = Object.values(OFFLINE_ENCYCLOPEDIA)
          .filter(
            (e) =>
              e.title.toLowerCase().includes(qLower) ||
              e.extract.toLowerCase().includes(qLower)
          )
          .map((e, idx) => ({
            title: e.title,
            snippet: e.extract.slice(0, 150) + '...',
            pageid: 1000 + idx,
          }));

        if (results.length === 0) {
          results = [
            {
              title: query.charAt(0).toUpperCase() + query.slice(1),
              snippet: `Study interactive reading cards and comprehension questions on ${query}.`,
              pageid: 9999,
            },
          ];
        }
      }

      return NextResponse.json({ results });
    }

    return NextResponse.json({
      featuredTopics: FEATURED_ESL_TOPICS,
    });
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Wikipedia service' },
      { status: 500 }
    );
  }
}
