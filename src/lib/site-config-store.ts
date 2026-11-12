import fs from 'fs';
import path from 'path';

export interface RegionalPricingTier {
  id: string;
  regionName: string;
  countriesLabel: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  monthlyProPrice: number;
  annualProMonthlyPrice: number;
  annualProTotal: number;
  discountPercent: number;
  promoCode: string;
  promoBannerText: string;
  active: boolean;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'promo' | 'achievement' | 'update';
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTimeMinutes: number;
  coverImage: string;
  accentColor: 'blue' | 'emerald' | 'indigo' | 'amber';
  authorName: string;
  authorRole: string;
  seoKeywords: string[];
  contentHtml: string;
  publishedAt: string;
  featured: boolean;
}

export interface SiteConfigData {
  globalDiscountActive: boolean;
  globalDiscountBanner: string;
  regionalPricing: RegionalPricingTier[];
  notifications: BroadcastNotification[];
  blogs: BlogPostItem[];
}

const DEFAULT_SITE_CONFIG: SiteConfigData = {
  globalDiscountActive: true,
  globalDiscountBanner: '🔥 Special Scholarship Offer: Save up to 40% on Pro English Fluency Plans!',
  regionalPricing: [
    {
      id: 'us-eu',
      regionName: 'United States, UK & Europe',
      countriesLabel: 'USA, Canada, UK, Germany, France, Spain, Italy, EU',
      flag: '🇺🇸🇪🇺',
      currencySymbol: '$',
      currencyCode: 'USD',
      monthlyProPrice: 19,
      annualProMonthlyPrice: 12,
      annualProTotal: 144,
      discountPercent: 25,
      promoCode: 'MIAMI25',
      promoBannerText: '25% OFF for North American & European Learners',
      active: true,
    },
    {
      id: 'pk',
      regionName: 'Pakistan',
      countriesLabel: 'Pakistan (Karachi, Lahore, Islamabad, Rawalpindi, All PK)',
      flag: '🇵🇰',
      currencySymbol: '$',
      currencyCode: 'USD',
      monthlyProPrice: 5,
      annualProMonthlyPrice: 3,
      annualProTotal: 36,
      discountPercent: 60,
      promoCode: 'PAKISTAN60',
      promoBannerText: '🇵🇰 60% Special Pakistan Scholarship Rate Applied Automatically via IP!',
      active: true,
    },
    {
      id: 'south-asia',
      regionName: 'India, Bangladesh & South Asia',
      countriesLabel: 'India, Bangladesh, Nepal, Sri Lanka',
      flag: '🇮🇳🇧🇩',
      currencySymbol: '$',
      currencyCode: 'USD',
      monthlyProPrice: 6,
      annualProMonthlyPrice: 4,
      annualProTotal: 48,
      discountPercent: 50,
      promoCode: 'ASIA50',
      promoBannerText: '50% Regional Scholarship Applied for South Asia!',
      active: true,
    },
    {
      id: 'latam',
      regionName: 'Latin America & Brazil',
      countriesLabel: 'Mexico, Colombia, Brazil, Argentina, Chile, Peru',
      flag: '🇲🇽🇧🇷',
      currencySymbol: '$',
      currencyCode: 'USD',
      monthlyProPrice: 9,
      annualProMonthlyPrice: 6,
      annualProTotal: 72,
      discountPercent: 40,
      promoCode: 'LATAM40',
      promoBannerText: '40% Regional Scholarship for Latin America',
      active: true,
    },
    {
      id: 'mena-asia',
      regionName: 'Middle East & East Asia',
      countriesLabel: 'UAE, Saudi Arabia, Turkey, Japan, South Korea, Vietnam',
      flag: '🇦🇪🇯🇵',
      currencySymbol: '$',
      currencyCode: 'USD',
      monthlyProPrice: 14,
      annualProMonthlyPrice: 9,
      annualProTotal: 108,
      discountPercent: 30,
      promoCode: 'GLOBAL30',
      promoBannerText: '30% Welcome Discount Available Today',
      active: true,
    },
  ],
  notifications: [
    {
      id: 'notif-1',
      title: '🎉 23 Native Languages Added to Learn Path!',
      message: 'You can now learn English directly from Hindi, Urdu, Spanish, Arabic, French, and 18 more languages with interactive exercises.',
      type: 'update',
      actionUrl: '/learn',
      actionLabel: 'Open Learn Path',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      title: '🎙️ Upgraded Speaking Lab & Wikipedia Study Cards',
      message: 'Practice pronunciation with word-by-word accuracy scoring and adjustable voice speed (0.65x to 1.15x).',
      type: 'info',
      actionUrl: '/speaking',
      actionLabel: 'Try Speaking Lab',
      createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    },
    {
      id: 'notif-3',
      title: '💎 Regional Tuition Scholarships Active',
      message: 'Check out our localized pricing tiers for Europe/US, South Asia (India/Pakistan), and Latin America.',
      type: 'promo',
      actionUrl: '/pricing',
      actionLabel: 'View Plans',
      createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    },
  ],
  blogs: [
    {
      id: 'blog-1',
      slug: 'how-to-think-in-english-without-translating-in-your-head',
      title: 'How to Think in English Without Translating in Your Head (Step-by-Step Guide)',
      excerpt: 'Stop freezing in conversations! Discover the proven 4-step Miami immersion method used by TICI students to build automatic English fluency.',
      category: 'Spoken Fluency',
      readTimeMinutes: 6,
      coverImage: '/images/brand/hero-group-fair.jpg',
      accentColor: 'blue',
      authorName: 'Jason Trinidad',
      authorRole: 'Founder, TICI Language Institute Miami',
      seoKeywords: ['think in english', 'speak english fluently', 'esl miami', 'english fluency tips'],
      publishedAt: '2025-02-18',
      featured: true,
      contentHtml: `
        <h2>Why Mental Translation Slows Down Your Speaking</h2>
        <p>When you learn English through traditional grammar textbooks, your brain builds a habit of translating every word from your native language (Hindi, Urdu, Spanish, Arabic, or Portuguese) into English before you speak. In real-life conversations, this creates a 3-second delay that makes you feel nervous and hesitant.</p>
        <h3>Step 1: Label Your Immediate Environment in English</h3>
        <p>Start with single concrete nouns and verbs around you. Instead of thinking in your native language first, connect the visual object directly to its English sound. Use our <strong>Learn Path</strong> audio buttons at 0.95x and 0.65x speed so your ear memorizes the exact rhythm.</p>
        <h3>Step 2: Practice Sentence Chunks, Not Isolated Words</h3>
        <p>Native speakers do not build sentences word-by-word from grammar rules—they use ready-made conversational chunks like <em>"I was wondering if..."</em>, <em>"Would you mind..."</em>, and <em>"As far as I know..."</em>.</p>
        <h3>Step 3: Daily 5-Minute Aloud Shadowing</h3>
        <p>Spend 5 minutes every morning in our <strong>Speaking Lab</strong> listening to a native sentence and repeating it immediately with matching intonation. Within 21 days, your mouth muscles will form English sounds automatically!</p>
      `,
    },
    {
      id: 'blog-2',
      slug: 'mastering-cefr-levels-a0-to-c2-complete-roadmap',
      title: 'Mastering CEFR English Levels (A0 to C2): How Long Does Each Stage Take?',
      excerpt: 'Understand what A0, A1, A2, B1, B2, C1, and C2 actually mean for your career, university admissions, and international relocation.',
      category: 'CEFR Curriculum',
      readTimeMinutes: 7,
      coverImage: '/images/brand/jason-graduation-group.jpg',
      accentColor: 'emerald',
      authorName: 'Jason Trinidad',
      authorRole: 'Founder, TICI Language Institute Miami',
      seoKeywords: ['cefr levels explained', 'a1 to c2 english', 'english placement test', 'learn english online'],
      publishedAt: '2025-02-14',
      featured: true,
      contentHtml: `
        <h2>What is the CEFR Standard?</h2>
        <p>The Common European Framework of Reference for Languages (CEFR) is the global benchmark used by universities, multinational employers, and immigration departments to measure English proficiency accurately.</p>
        <h3>A0 & A1: Absolute Beginner to Elementary</h3>
        <p>At Stage A0 and A1, your goal is survival English: introducing yourself, ordering food, asking directions, and understanding slow, clear speech from your native language into English.</p>
        <h3>B1 & B2: Independent Professional Fluency</h3>
        <p>Stage B2 is the target level for most remote software engineers, healthcare workers, and international students. At B2, you can participate actively in business meetings and read encyclopedia articles effortlessly.</p>
        <h3>C1 & C2: Executive & Academic Mastery</h3>
        <p>At C1 and C2, you command nuanced idioms, persuasive rhetoric, and executive-level negotiation skills.</p>
      `,
    },
    {
      id: 'blog-3',
      slug: 'top-10-pronunciation-mistakes-and-how-to-fix-them-fast',
      title: '10 Common English Pronunciation Mistakes & How to Sound Natural in 30 Days',
      excerpt: 'Learn how syllable stress, linking sounds, and mouth positioning transform your clarity when speaking with American and British colleagues.',
      category: 'Pronunciation & Accent',
      readTimeMinutes: 5,
      coverImage: '/images/brand/class-fun-silicon-valley.jpg',
      accentColor: 'indigo',
      authorName: 'Dr. Elena Rostova',
      authorRole: 'Head of Phonetics & Curriculum',
      seoKeywords: ['english pronunciation tips', 'american english accent', 'speaking lab practice', 'phonetics'],
      publishedAt: '2025-02-10',
      featured: true,
      contentHtml: `
        <h2>Clarity Beats Speed Every Time</h2>
        <p>Many English learners believe that speaking fast makes them sound fluent. In reality, rushing causes you to swallow ending consonants (like <strong>-ed</strong>, <strong>-s</strong>, and <strong>-t</strong>) and flatten stressed vowels.</p>
        <h3>1. Master Word Stress First</h3>
        <p>In English, every multi-syllable word has one primary stressed syllable that is louder, longer, and higher in pitch—for example, <em>pho-<strong>TOG</strong>-ra-phy</em> vs. <em><strong>PHO</strong>-to-graph</em>.</p>
        <h3>2. Practice With Visual Word-by-Word Feedback</h3>
        <p>Use our interactive <strong>Speaking Lab</strong> to record yourself and inspect which words turn green (accurate) and which words need slower syllable practice at 0.65x speed.</p>
      `,
    },
  ],
};

function getConfigFilePath(): string {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'site-config.json');
}

export function readSiteConfig(): SiteConfigData {
  try {
    const filePath = getConfigFilePath();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), 'utf-8');
      return DEFAULT_SITE_CONFIG;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    let mergedRegionalPricing: RegionalPricingTier[] = parsed.regionalPricing?.length
      ? parsed.regionalPricing
      : DEFAULT_SITE_CONFIG.regionalPricing;

    // Ensure dedicated 'pk' (Pakistan) tier exists even if site-config.json was created earlier
    if (!mergedRegionalPricing.some((t) => t.id === 'pk')) {
      const pkDefault = DEFAULT_SITE_CONFIG.regionalPricing.find((t) => t.id === 'pk');
      if (pkDefault) {
        mergedRegionalPricing = [pkDefault, ...mergedRegionalPricing];
      }
    }

    return {
      ...DEFAULT_SITE_CONFIG,
      ...parsed,
      regionalPricing: mergedRegionalPricing,
      notifications: parsed.notifications || DEFAULT_SITE_CONFIG.notifications,
      blogs: parsed.blogs?.length ? parsed.blogs : DEFAULT_SITE_CONFIG.blogs,
    };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function writeSiteConfig(nextConfig: SiteConfigData): SiteConfigData {
  try {
    const filePath = getConfigFilePath();
    fs.writeFileSync(filePath, JSON.stringify(nextConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save site-config.json:', err);
  }
  return nextConfig;
}
