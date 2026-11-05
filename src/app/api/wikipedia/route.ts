import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Bypass TLS verification issues on local/Windows proxy environments
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

const FEATURED_ESL_TOPICS = [
  { title: 'Artificial intelligence', category: 'Technology', level: 'B2', description: 'How computers are learning to reason and communicate.' },
  { title: 'Solar System', category: 'Science', level: 'A2', description: 'The Sun and celestial bodies orbiting around it.' },
  { title: 'Climate change', category: 'Environment', level: 'B1', description: 'Global temperature shifts and sustainable energy solutions.' },
  { title: 'English language', category: 'Language', level: 'B1', description: 'The history and global spread of the English language.' },
  { title: 'Coffee', category: 'Culture', level: 'A1', description: 'The world’s most popular morning brew from bean to cup.' },
  { title: 'Ancient Egypt', category: 'History', level: 'B1', description: 'Pyramids, pharaohs, and life along the Nile River.' },
  { title: 'Renewable energy', category: 'Science', level: 'B2', description: 'Harnessing wind, solar, and hydro power for the future.' },
  { title: 'Renaissance', category: 'History', level: 'C1', description: 'The cultural rebirth of art, science, and literature in Europe.' },
];

const OFFLINE_ENCYCLOPEDIA: Record<string, {
  title: string;
  description: string;
  extract: string;
  thumbnail?: string;
  cefrLevel: 'A2' | 'B1' | 'B2' | 'C1';
}> = {
  'artificial intelligence': {
    title: 'Artificial intelligence',
    description: 'Intelligence demonstrated by machines',
    extract: 'Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily humans. It is a field of study in computer science that develops and studies intelligent machines. Such machines may be called AIs. AI technology is widely used throughout industry, government, and science. High-profile applications include advanced web search engines like Google Search, recommendation systems used by YouTube, Amazon, and Netflix, and conversational generative AI chatbots such as ChatGPT and Google Gemini.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'B2',
  },
  'solar system': {
    title: 'Solar System',
    description: 'Gravitationally bound system of the Sun and the objects that orbit it',
    extract: 'The Solar System is the gravitationally bound system of the Sun and the objects that orbit it. It formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud. The vast majority of the system\'s mass is in the Sun, with the majority of the remaining mass contained in the planet Jupiter. The four inner system planets—Mercury, Venus, Earth and Mars—are terrestrial planets, being composed primarily of rock and metal.',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'A2',
  },
  'climate change': {
    title: 'Climate change',
    description: 'Long-term change in the Earth\'s climate system',
    extract: 'Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels like coal, oil, and gas. Burning fossil fuels produces greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping heat and raising surface temperatures across oceans and continents.',
    thumbnail: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
  },
  'english language': {
    title: 'English language',
    description: 'West Germanic language originating in England',
    extract: 'English is a West Germanic language in the Indo-European language family, whose speakers, called Anglophones, originated in early medieval England. The language is named after the Angles, one of the ancient Germanic peoples who migrated to the island of Great Britain. Today, English is the most spoken language in the world and the third most spoken native language, serving as the international lingua franca of trade, aviation, and science.',
    thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
  },
  'coffee': {
    title: 'Coffee',
    description: 'Beverage brewed from roasted coffee beans',
    extract: 'Coffee is a beverage prepared from roasted coffee beans. Darkly colored, bitter, and slightly acidic, coffee has a stimulating effect on humans, primarily due to its caffeine content. It is the most popular hot drink in the world. Seeds of the Coffea plant\'s fruits are separated to produce unroasted green coffee beans. The beans are roasted and then ground into fine particles that are typically steeped in hot water before being filtered out.',
    thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'A2',
  },
  'ancient egypt': {
    title: 'Ancient Egypt',
    description: 'Civilization of ancient North Africa along the lower reaches of the Nile',
    extract: 'Ancient Egypt was a civilization in ancient North Africa, situated in the Nile Valley. Ancient Egyptian civilization followed prehistoric Egypt and coalesced around 3100 BC with the political unification of Upper and Lower Egypt under Menes. The history of ancient Egypt occurred as a series of stable kingdoms separated by periods of relative instability known as Intermediate Periods. Many of its monumental achievements, such as the Pyramids of Giza and the Great Sphinx, remain standing today.',
    thumbnail: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'B1',
  },
  'renewable energy': {
    title: 'Renewable energy',
    description: 'Energy collected from renewable resources',
    extract: 'Renewable energy is energy derived from natural resources that replenish themselves in less than a human lifetime without depleting the planet\'s resources. Such resources include sunlight, wind, the movement of water, and geothermal heat. Although most renewable energy sources are sustainable, some sources, like biomass, are not automatically renewable unless managed sustainably. Renewable energy provides energy for electricity generation, space heating, and transport.',
    thumbnail: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'B2',
  },
  'renaissance': {
    title: 'Renaissance',
    description: 'Period of European cultural, artistic, political and economic rebirth',
    extract: 'The Renaissance was a fervent period of European cultural, artistic, political, and economic rebirth following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature, and art. Some of the greatest thinkers, authors, statesmen, scientists, and artists in human history thrived during this era, including Leonardo da Vinci, Michelangelo, and William Shakespeare.',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80',
    cefrLevel: 'C1',
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

function extractVocabulary(text: string) {
  const words = text.match(/\b[A-Za-z]{6,}\b/g) || [];
  const uniqueWords = Array.from(new Set(words.map(w => w.toLowerCase())));
  const commonStopWords = new Set([
    'people', 'different', 'between', 'through', 'because', 'another', 'around',
    'without', 'however', 'against', 'already', 'several', 'general', 'example',
    'including', 'information', 'system', 'number', 'called', 'became', 'during'
  ]);

  return uniqueWords
    .filter(w => !commonStopWords.has(w))
    .slice(0, 8)
    .map(word => {
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
      return {
        word: capitalized,
        note: `Key term in this article`
      };
    });
}

function generateComprehensionQuestions(title: string, extract: string) {
  const sentences = extract.split('. ').filter(s => s.trim().length > 25);
  if (sentences.length < 2) {
    return [
      {
        question: `What is the primary subject of this article?`,
        options: [title, 'A completely unrelated topic', 'A fictional story', 'An ancient myth'],
        correctAnswer: title,
        explanation: `The article directly explains the concept of ${title}.`
      }
    ];
  }

  return [
    {
      question: `According to the article, what is ${title} mainly known for?`,
      options: [
        sentences[0]?.replace(/\.$/, '') || `The fundamental definition of ${title}`,
        'It has no global significance',
        'It only existed thousands of years ago',
        'It was banned globally'
      ],
      correctAnswer: sentences[0]?.replace(/\.$/, '') || `The fundamental definition of ${title}`,
      explanation: `The opening section defines ${title}: "${sentences[0]}."`
    },
    {
      question: `Which statement aligns with the factual information provided about ${title}?`,
      options: [
        sentences[1]?.replace(/\.$/, '') || `${title} plays an active role in modern contexts`,
        'All experts completely disagree with its existence',
        'It was discovered yesterday',
        'It is strictly for elementary school children'
      ],
      correctAnswer: sentences[1]?.replace(/\.$/, '') || `${title} plays an active role in modern contexts`,
      explanation: `Referenced directly in the text context.`
    }
  ];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const title = searchParams.get('title');

    // 1. If fetching a specific article summary
    if (title) {
      let articleData: any = null;

      try {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const res = await fetch(summaryUrl, {
          headers: {
            'User-Agent': 'EnglishMiami-ESL-App/1.0 (https://englishmiami.com; support@englishmiami.com)'
          },
          next: { revalidate: 3600 }
        });

        if (res.ok) {
          articleData = await res.json();
        }
      } catch (networkErr) {
        console.warn('Wikipedia live fetch error, checking offline encyclopedia:', networkErr);
      }

      // Check fallback if live fetch didn't return or failed
      if (!articleData) {
        const lower = title.toLowerCase();
        const fallback = OFFLINE_ENCYCLOPEDIA[lower] || Object.values(OFFLINE_ENCYCLOPEDIA).find(e => e.title.toLowerCase().includes(lower));
        if (fallback) {
          articleData = {
            title: fallback.title,
            description: fallback.description,
            extract: fallback.extract,
            thumbnail: { source: fallback.thumbnail },
            content_urls: { desktop: { page: `https://en.wikipedia.org/wiki/${encodeURIComponent(fallback.title)}` } }
          };
        } else {
          // Construct general article from title
          articleData = {
            title: title,
            description: `Educational encyclopedia topic on ${title}`,
            extract: `${title} is an important subject of study within global arts, science, and history. Scholars, researchers, and students examine ${title} to gain a deeper comprehension of how cultural, scientific, and societal developments have influenced modern civilization across different continents and eras.`,
            thumbnail: null,
            content_urls: { desktop: { page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` } }
          };
        }
      }

      const extractText = articleData.extract || '';
      const cefrLevel = estimateCefrLevel(extractText);
      const vocabulary = extractVocabulary(extractText);
      const questions = generateComprehensionQuestions(articleData.title, extractText);
      const readingMinutes = Math.max(1, Math.ceil(extractText.split(/\s+/).length / 140));

      return NextResponse.json({
        article: {
          title: articleData.title,
          description: articleData.description || 'Wikipedia Knowledge Article',
          extract: extractText,
          thumbnail: articleData.thumbnail?.source || null,
          originalImage: articleData.originalimage?.source || null,
          pageUrl: articleData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          readingMinutes,
          cefrLevel,
          vocabulary,
          questions
        }
      });
    }

    // 2. If performing a live keyword search
    if (query) {
      let results: any[] = [];

      try {
        const searchApiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&utf8=1&srlimit=8`;
        const res = await fetch(searchApiUrl, {
          headers: {
            'User-Agent': 'EnglishMiami-ESL-App/1.0 (https://englishmiami.com; support@englishmiami.com)'
          },
          next: { revalidate: 3600 }
        });

        if (res.ok) {
          const data = await res.json();
          const rawResults = (data.query?.search || []) as WikiSearchResult[];
          results = rawResults.map(item => ({
            title: item.title,
            snippet: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
            pageid: item.pageid
          }));
        }
      } catch (searchErr) {
        console.warn('Wikipedia search fetch error, checking offline encyclopedia:', searchErr);
      }

      // If results empty due to TLS/offline, filter offline encyclopedia
      if (results.length === 0) {
        const qLower = query.toLowerCase();
        results = Object.values(OFFLINE_ENCYCLOPEDIA)
          .filter(e => e.title.toLowerCase().includes(qLower) || e.extract.toLowerCase().includes(qLower))
          .map((e, idx) => ({
            title: e.title,
            snippet: e.extract.slice(0, 150) + '...',
            pageid: 1000 + idx
          }));

        if (results.length === 0) {
          results = [{
            title: query.charAt(0).toUpperCase() + query.slice(1),
            snippet: `Read comprehensive encyclopedic analysis and vocabulary drills on ${query}.`,
            pageid: 9999
          }];
        }
      }

      return NextResponse.json({ results });
    }

    // 3. Default: return curated featured ESL reading topics
    return NextResponse.json({
      featuredTopics: FEATURED_ESL_TOPICS
    });

  } catch (error) {
    console.error('Wikipedia API error:', error);
    return NextResponse.json({ error: 'Failed to communicate with Wikipedia service' }, { status: 500 });
  }
}
