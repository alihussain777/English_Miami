'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DUOLINGO_BASE_LANGUAGES } from '@/lib/duolingo-languages';
import { speakRealisticText } from '@/lib/voice-engine';
import {
  ArrowRight,
  Brain,
  Mic,
  BookmarkCheck,
  CheckCircle2,
  Headphones,
  BookOpen,
  PenTool,
  Trophy,
  Globe,
  Star,
  Check,
  Award,
  Volume2,
  Sparkles,
  Flame,
  Compass,
  Play,
  X,
  Maximize2,
  Clock,
  Tag,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: 'fun' | 'graduation';
  badge: string;
}

export default function HomePage() {
  const router = useRouter();
  const [heroShowcaseMode, setHeroShowcaseMode] = useState<'group' | 'graduation' | 'audio'>('group');
  const [activeDemoTab, setActiveDemoTab] = useState<'A0' | 'B1' | 'C2'>('A0');
  const [speakingSample, setSpeakingSample] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'fun' | 'graduation'>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Dynamic Regional Pricing & SEO Blogs state
  const [pricingConfig, setPricingConfig] = useState<any>(null);
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>('us-eu');
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => r.json())
      .then((d) => {
        if (d.regionalPricing) setPricingConfig(d);
      })
      .catch(() => {});

    fetch('/api/blogs')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.blogs)) setBlogs(d.blogs.slice(0, 3));
      })
      .catch(() => {});

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Karachi') || tz.includes('Kolkata') || tz.includes('Dhaka')) {
        setSelectedRegionCode('south-asia');
      } else if (tz.includes('America/Sao_Paulo') || tz.includes('America/Mexico') || tz.includes('Bogota')) {
        setSelectedRegionCode('latam');
      } else if (tz.includes('Dubai') || tz.includes('Riyadh')) {
        setSelectedRegionCode('mena-asia');
      }
    } catch {}
  }, []);

  const handleChooseLanguageAndStart = (code: string) => {
    try {
      localStorage.setItem('tici_base_lang', code);
      window.dispatchEvent(
        new CustomEvent('tici-lang-change', { detail: { lang: code } })
      );
    } catch {}
    router.push('/learn');
  };

  const playNativeAudio = (text: string) => {
    speakRealisticText(text, {
      rate: 0.95,
      onStart: () => setSpeakingSample(true),
      onEnd: () => setSpeakingSample(false),
    });
  };

  const heroDemos = {
    A0: {
      badge: 'A0 • Absolute Beginner Phonics',
      prompt: 'Tap the speaker to hear native pronunciation & meaning:',
      phrase: 'Good morning! Nice to meet you.',
      phonetic: '/ɡʊd ˈmɔːr.nɪŋ! naɪs tuː miːt juː/',
      translation: 'صبح بخیر! آپ سے مل کر خوشی ہوئی۔ • ¡Buenos días! Mucho gusto.',
      tip: 'Notice the long "ee" vowel sound in "meet" (/miːt/).',
    },
    B1: {
      badge: 'B1 • Career & Interview Fluency',
      prompt: 'Workplace Grammar & Tense Precision:',
      phrase: 'I have been managing cross-functional teams for three years.',
      phonetic: '/aɪ hæv bɪn ˈmæn.ɪ.dʒɪŋ krɒs-ˈfʌŋk.ʃən.əl tiːmz/',
      translation: 'میں تین سال سے مختلف ٹیموں کی قیادت کر رہا ہوں۔',
      tip: 'Use Present Perfect Continuous ("have been + -ing") for actions that started in the past and continue now.',
    },
    C2: {
      badge: 'C2 • Executive & Academic Mastery',
      prompt: 'Advanced Negative Inversion & Rhetoric:',
      phrase: 'Seldom have we witnessed such a transformative technological shift.',
      phonetic: '/ˈsel.dəm hæv wiː ˈwɪt.nəst sʌtʃ ə trænsˈfɔː.mə.tɪv ʃɪft/',
      translation: 'ہم نے شاذ و نادر ہی ایسی انقلابی تکنیکی تبدیلی دیکھی ہے۔',
      tip: 'Placing a negative adverbial ("Seldom") at the start triggers subject-auxiliary inversion ("have we").',
    },
  };

  const campusGallery: GalleryItem[] = [
    {
      id: 'silicon-valley-fun',
      src: '/images/brand/class-fun-silicon-valley.jpg',
      title: 'Interactive Smartboard & Media Session',
      subtitle: 'Students leading an engaging classroom discussion in front of the smartboard.',
      category: 'fun',
      badge: 'Classroom Activity',
    },
    {
      id: 'nasa-artemis',
      src: '/images/brand/class-fun-nasa.jpg',
      title: 'Science & Space Presentation',
      subtitle: 'Live student presentation analyzing NASA Artemis II launch coverage.',
      category: 'fun',
      badge: 'Smartboard Talk',
    },
    {
      id: 'dolce-gabbana',
      src: '/images/brand/class-fun-fashion.jpg',
      title: 'Art & Culture Presentation',
      subtitle: 'Students practicing descriptive vocabulary and public speaking with study notes.',
      category: 'fun',
      badge: 'Cultural Review',
    },
    {
      id: 'neurotech',
      src: '/images/brand/class-fun-neurotech.jpg',
      title: 'Technology & Innovation Keynote',
      subtitle: 'Advanced learners presenting on neurotechnologies and future science topics.',
      category: 'fun',
      badge: 'STEM English',
    },
    {
      id: 'miami-towers',
      src: '/images/brand/class-fun-miami-towers.jpg',
      title: 'Miami Architecture & Neighborhoods',
      subtitle: 'Interactive class session covering real estate, weather reports, and local culture.',
      category: 'fun',
      badge: 'Real-World Topics',
    },
    {
      id: 'jason-grad-group',
      src: '/images/brand/jason-graduation-group.jpg',
      title: 'La Gorce Country Club Graduation',
      subtitle: 'Graduates proudly holding their official certificates upon completing their course.',
      category: 'graduation',
      badge: 'Graduation Ceremony',
    },
  ];

  const filteredGallery =
    galleryFilter === 'all'
      ? campusGallery
      : campusGallery.filter((item) => item.category === galleryFilter);

  const cefrLevels = [
    {
      code: 'A0',
      title: 'Absolute Zero',
      desc: '26 Alphabet letters, short & long vowels, phonics sounds, survival greetings & numbers 1–100.',
      color: 'from-emerald-500 to-emerald-700',
      shadow: 'shadow-[0_6px_0_0_#047857]',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    {
      code: 'A1',
      title: 'Beginner',
      desc: 'Daily routines, introductions, family, food, shopping & present simple sentence building.',
      color: 'from-teal-500 to-teal-700',
      shadow: 'shadow-[0_6px_0_0_#0f766e]',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    },
    {
      code: 'A2',
      title: 'Elementary',
      desc: 'Airport transit, hotel check-in, past experiences, health appointments & future plans.',
      color: 'from-cyan-600 to-cyan-800',
      shadow: 'shadow-[0_6px_0_0_#155e75]',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    },
    {
      code: 'B1',
      title: 'Intermediate',
      desc: 'Job interviews, professional emails, conditional clauses & persuasive storytelling.',
      color: 'from-blue-600 to-blue-800',
      shadow: 'shadow-[0_6px_0_0_#1e40af]',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    },
    {
      code: 'B2',
      title: 'Upper Inter.',
      desc: 'Business negotiations, keynote presentations, idioms, phrasal verbs & passive voice.',
      color: 'from-indigo-600 to-indigo-800',
      shadow: 'shadow-[0_6px_0_0_#3730a3]',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    },
    {
      code: 'C1',
      title: 'Advanced',
      desc: 'Negative inversion, diplomatic tact, IELTS/Cambridge essays & subtle academic rhetoric.',
      color: 'from-purple-600 to-purple-800',
      shadow: 'shadow-[0_6px_0_0_#6b21a8]',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    },
    {
      code: 'C2',
      title: 'Proficiency',
      desc: 'Near-native mastery, subtle irony, litotes, executive leadership & complex syntax.',
      color: 'from-amber-500 to-amber-700',
      shadow: 'shadow-[0_6px_0_0_#b45309]',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
  ];

  const skillsList = [
    {
      title: 'Gamified Learn Path',
      desc: 'Interactive stepping stones, phonics study sheets, word banks, and instant XP rewards.',
      icon: Compass,
      href: '/learn',
      accent: 'bg-emerald-500 shadow-[0_4px_0_0_#047857]',
    },
    {
      title: 'Speaking Lab & Speech AI',
      desc: 'Real-time voice recognition with word-by-word pronunciation accuracy scoring.',
      icon: Mic,
      href: '/speaking',
      accent: 'bg-blue-600 shadow-[0_4px_0_0_#1e3a8a]',
    },
    {
      title: 'Wikipedia Real-World Reader',
      desc: 'Read live encyclopedic study cards with realistic voice speed control and comprehension tests.',
      icon: Globe,
      href: '/reading',
      accent: 'bg-indigo-600 shadow-[0_4px_0_0_#3730a3]',
    },
    {
      title: 'SRS Vocabulary Bank',
      desc: 'SuperMemo SM-2 spaced repetition flashcards with native audio and bilingual meanings.',
      icon: BookmarkCheck,
      href: '/vocabulary',
      accent: 'bg-amber-500 shadow-[0_4px_0_0_#b45309]',
    },
    {
      title: 'Contextual Grammar Studio',
      desc: 'Visual rule mechanics, interactive tense drills, and common error diagnostics.',
      icon: CheckCircle2,
      href: '/grammar',
      accent: 'bg-teal-600 shadow-[0_4px_0_0_#0f766e]',
    },
    {
      title: 'Listening Comprehension',
      desc: 'Native dialogues with variable speed control (0.65x slow to 1.15x) and dictation.',
      icon: Headphones,
      href: '/listening',
      accent: 'bg-cyan-600 shadow-[0_4px_0_0_#155e75]',
    },
    {
      title: 'Academic Writing Lab',
      desc: 'IELTS & Cambridge level evaluation, grammar correction, and lexical upgrades.',
      icon: PenTool,
      href: '/writing',
      accent: 'bg-purple-600 shadow-[0_4px_0_0_#6b21a8]',
    },
    {
      title: 'Miami AI 24/7 Coach',
      desc: 'Interactive roleplay tutor powered by Google Gemini for interviews & daily conversation.',
      icon: Brain,
      href: '/ai-coach',
      accent: 'bg-rose-600 shadow-[0_4px_0_0_#9f1239]',
    },
  ];

  const testimonials = [
    {
      name: 'Muhammad Ali',
      country: 'Pakistan',
      flag: '🇵🇰',
      role: 'Full-Stack Software Engineer',
      native: 'Urdu',
      quote:
        'A0 se le kar C1 tak ka safar bohot smooth aur user-friendly hai. Har lafz ki audio aur interactive study sheets ne meri fluency 10x barha di.',
    },
    {
      name: 'Carlos M.',
      country: 'Miami Beach',
      flag: '🇺🇸',
      role: 'Hospitality Professional',
      native: 'Spanish',
      quote:
        'Earning our official certificates at La Gorce Country Club was a proud milestone. The classes are practical, welcoming, and build real speaking confidence.',
    },
    {
      name: 'Camila Santos',
      country: 'Brazil',
      flag: '🇧🇷',
      role: 'Product Marketing Lead',
      native: 'Portuguese',
      quote:
        'Combining live classroom presentations with the interactive online learning path makes studying effortless. I remember 95% of every unit I complete.',
    },
    {
      name: 'Priya Sharma',
      country: 'India',
      flag: '🇮🇳',
      role: 'Corporate Strategy Consultant',
      native: 'Hindi',
      quote:
        'The C1 and C2 modules on executive communication and rhetoric are outstanding. Clean interface and well-structured lessons.',
    },
  ];

  const faqs = [
    {
      q: 'Can I start if I know zero English (A0 level)?',
      a: 'Yes! Our A0 Foundation track starts right from the 26 English alphabet letters, short and long vowel phonics, numbers 1–100, and survival greetings with interactive audio and bilingual translations.',
    },
    {
      q: 'How does the Interactive Learning Path work?',
      a: 'Every unit features interactive stepping stones. Tapping any node opens a comprehensive Study Sheet with Theory & Phonics, Vocabulary Flashcards with audio, and Conversational Phrases before you take the quiz.',
    },
    {
      q: 'What is the Wikipedia Real-World Reader?',
      a: 'Our reading studio breaks real-world encyclopedia articles into structured Listen & Read Study Cards with realistic voice speed adjustment, followed by a balanced comprehension test.',
    },
    {
      q: 'Are the CEFR Certificates verifiable online?',
      a: 'Yes. Upon completing a CEFR level and passing the assessment, you receive an official certificate with a unique verification code that employers and institutions can verify online.',
    },
  ];

  const currentDemo = heroDemos[activeDemoTab];

  // Calculate active region pricing
  const regionsList = pricingConfig?.regionalPricing || [
    {
      id: 'us-eu',
      regionName: 'United States, UK & Europe',
      flag: '🇺🇸🇪🇺',
      currencySymbol: '$',
      monthlyProPrice: 19,
      annualProMonthlyPrice: 12,
      discountPercent: 25,
      promoCode: 'MIAMI25',
      promoBannerText: '25% OFF for North American & European Learners',
    },
    {
      id: 'south-asia',
      regionName: 'India, Pakistan & South Asia',
      flag: '🇮🇳🇵🇰',
      currencySymbol: '$',
      monthlyProPrice: 6,
      annualProMonthlyPrice: 4,
      discountPercent: 50,
      promoCode: 'ASIA50',
      promoBannerText: '50% Regional Scholarship Applied for South Asia!',
    },
  ];
  const activeRegion =
    regionsList.find((r: any) => r.id === selectedRegionCode) || regionsList[0];
  const globalDiscount = activeRegion?.discountPercent || 0;

  const originalMonthly = Math.round(
    activeRegion.monthlyProPrice / Math.max(0.2, 1 - globalDiscount / 100)
  );
  const originalAnnualMonthly = Math.round(
    activeRegion.annualProMonthlyPrice / Math.max(0.2, 1 - globalDiscount / 100)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* =====================================================================
          HERO SECTION: CLEAN, PROFESSIONAL & USER-FRIENDLY
         ===================================================================== */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-14 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 bg-grid-pattern hero-mesh">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: CLEAN BRANDING, HEADLINE & CTAS */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-extrabold border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>TICI • CEFR A0 to C2 Accredited Curriculum</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                Master English from{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Zero Phonics
                </span>{' '}
                to Real-World Fluency.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Learn through interactive classroom immersion and our structured learning path. Master alphabet phonics, bilingual vocabulary with realistic native audio, live Wikipedia study cards, and AI speaking practice.
              </p>

              {/* Clean Tactile CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1 justify-center lg:justify-start">
                <Link
                  href="/learn"
                  className="btn-3d-emerald w-full sm:w-auto text-sm sm:text-base font-extrabold px-7 py-3.5 rounded-2xl flex items-center justify-center gap-2 group"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Learn Path</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/courses"
                  className="btn-3d-secondary w-full sm:w-auto text-sm sm:text-base font-extrabold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Explore Curriculum</span>
                </Link>
              </div>

              {/* Clean Metric Pills */}
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                    A0–C2
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">7 Levels</div>
                    <div className="text-[10px] font-semibold text-slate-500">55+ Units</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">Realistic Audio</div>
                    <div className="text-[10px] font-semibold text-slate-500">IPA & Phonics</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">Interactive</div>
                    <div className="text-[10px] font-semibold text-slate-500">Daily Quests</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">Verified</div>
                    <div className="text-[10px] font-semibold text-slate-500">Certificates</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: FRAMED FRONT GROUP PHOTO WITH SINGLE SMALL TOP-RIGHT LOGO */}
            <div className="lg:col-span-6 perspective-1000">
              <div className="frame-3d">
                {/* Clean Top Switcher Bar */}
                <div className="flex items-center justify-between gap-2 mb-3 px-1">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    Miami Campus & Interactive Preview
                  </span>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('group')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        heroShowcaseMode === 'group'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Campus Class
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('graduation')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        heroShowcaseMode === 'graduation'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Graduates
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('audio')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                        heroShowcaseMode === 'audio'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Audio Demo
                    </button>
                  </div>
                </div>

                {/* MODE 1: MAIN FRONT GROUP PHOTO */}
                {heroShowcaseMode === 'group' && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src="/images/brand/hero-group-fair.jpg"
                      alt="International Students & Classroom Celebration in Miami"
                      className="w-full h-[340px] sm:h-[400px] object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                    <img
                      src="/images/brand/logo-tici.png"
                      alt="TICI Logo"
                      className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                        Miami Campus Community
                      </span>
                      <h3 className="text-lg font-extrabold mt-1">
                        Interactive Classroom & International Fair
                      </h3>
                      <p className="text-xs text-slate-200 mt-0.5">
                        Students from around the world learning together through live smartboard presentations and cultural activities.
                      </p>
                    </div>
                  </div>
                )}

                {/* MODE 2: GRADUATION PHOTO */}
                {heroShowcaseMode === 'graduation' && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src="/images/brand/jason-graduation-group.jpg"
                      alt="Graduation Ceremony at La Gorce Country Club"
                      className="w-full h-[340px] sm:h-[400px] object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                    <img
                      src="/images/brand/logo-tici.png"
                      alt="TICI Logo"
                      className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                        La Gorce Country Club • Miami Beach
                      </span>
                      <h3 className="text-lg font-extrabold mt-1">
                        Official Certificate Graduation Ceremony
                      </h3>
                      <p className="text-xs text-slate-200 mt-0.5">
                        Adult learners celebrating their certified English proficiency milestones.
                      </p>
                    </div>
                  </div>
                )}

                {/* MODE 3: INTERACTIVE AUDIO DEMO */}
                {heroShowcaseMode === 'audio' && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          Interactive Lesson Preview
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Select a CEFR level to hear realistic pronunciation
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        {(['A0', 'B1', 'C2'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setActiveDemoTab(lvl)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                              activeDemoTab === lvl
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {currentDemo.badge}
                          </span>
                          <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                            "{currentDemo.phrase}"
                          </p>
                          <p className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 mt-1">
                            {currentDemo.phonetic}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => playNativeAudio(currentDemo.phrase)}
                          className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Volume2 className={`w-5 h-5 ${speakingSample ? 'animate-bounce' : ''}`} />
                        </button>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {currentDemo.translation}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="font-bold text-amber-800 dark:text-amber-300">Study Tip: </strong>
                      {currentDemo.tip}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          23-LANGUAGE NATIVE-TO-ENGLISH SELECTOR STRIP
         ===================================================================== */}
      <section className="py-14 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              23 Native Languages Supported
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              I Speak... (Learn English From Your Language)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              Select your native language below to launch 24+ interactive Basic Duolingo lessons with bilingual translations, word banks, and realistic native audio.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {DUOLINGO_BASE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleChooseLanguageAndStart(lang.code)}
                className="card-3d card-3d-interactive p-3 text-left flex items-center gap-2.5 cursor-pointer"
              >
                <span className="text-2xl shrink-0">{lang.flag}</span>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    {lang.nativeName}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {lang.name} → EN
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEVEN-LEVEL CEFR CURRICULUM EXPLORER (A0 TO C2)
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Structured CEFR Roadmap
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Seven Stages to Complete Mastery
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
              Select any CEFR level below to explore its study materials and interactive exercises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {cefrLevels.map((lvl, idx) => (
              <Link
                href="/learn"
                key={lvl.code}
                className="card-3d card-3d-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-b ${lvl.color} text-white font-black text-lg flex items-center justify-center ${lvl.shadow} group-hover:scale-105 transition-transform`}
                    >
                      {lvl.code}
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${lvl.badgeBg}`}>
                      Stage {idx + 1}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {lvl.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-blue-700 dark:text-blue-400">
                  <span>Start {lvl.code}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/placement-test"
              className="btn-3d-primary text-sm font-extrabold px-7 py-3.5 rounded-2xl inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Not sure where to start? Take the 5-Minute Placement Test</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          CLASSROOM ACTIVITIES & GRADUATIONS GALLERY (SINGLE SMALL LOGO TOP-RIGHT)
         ===================================================================== */}
      <section
        id="campus-fun"
        className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors"
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Campus Life & Presentations
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Interactive Classroom Sessions & Campus Moments
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                Students build real confidence through live smartboard presentations, group discussions, and graduation milestones.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Moments' },
                { id: 'fun', label: 'Classroom Presentations' },
                { id: 'graduation', label: 'Graduations' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    galleryFilter === tab.id ? 'btn-3d-primary' : 'btn-3d-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 perspective-1000">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="frame-3d cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-900">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge on Top-Left */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      {item.badge}
                    </span>
                  </div>
                  {/* Single Small TICI Logo Strictly on Top-Right */}
                  <img
                    src="/images/brand/logo-tici.png"
                    alt="TICI Logo"
                    className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
                  />
                  {/* Zoom Icon on Bottom-Right */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-slate-900/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal (Single Small Top-Right Logo) */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-3xl w-full frame-3d overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={lightboxItem.src}
                alt={lightboxItem.title}
                className="w-full max-h-[70vh] object-contain mx-auto"
              />
              <img
                src="/images/brand/logo-tici.png"
                alt="TICI Logo"
                className="absolute top-3 right-3 w-9 h-9 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 left-3 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {lightboxItem.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {lightboxItem.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SINGLE CLEAN "MEET FOUNDER" SECTION (LINKS TO DEDICATED /founder PAGE)
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="card-3d p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="frame-3d">
                <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 bg-slate-900">
                  <img
                    src="/images/brand/jason-graduation-quartet.jpg"
                    alt="Jason Trinidad with Graduates"
                    className="w-full h-full object-cover object-center"
                  />
                  <img
                    src="/images/brand/logo-tici.png"
                    alt="TICI Logo"
                    className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Meet the Founder
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Jason Trinidad — Founder & President
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Jason Trinidad founded TICI • EnglishMiami to transform how adult learners and hospitality professionals master English. Through interactive smartboard presentations, workplace training at premier institutions like La Gorce Country Club, and personalized mentorship, he has helped hundreds of international students achieve lasting fluency.
              </p>
              <div className="pt-2">
                <Link
                  href="/founder"
                  className="btn-3d-primary text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-2xl inline-flex items-center gap-2"
                >
                  <span>Meet Founder & Read Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8 CORE COMPETENCIES: BENTO GRID
         ===================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              All-In-One Language Ecosystem
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              8 Interactive Labs Built for Real Fluency
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
              Every tool you need to read, write, listen, and speak English with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillsList.map((skill) => {
              const Icon = skill.icon;
              return (
                <Link
                  href={skill.href}
                  key={skill.title}
                  className="card-3d card-3d-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${skill.accent} text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {skill.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {skill.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-400">
                    <span>Launch Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PRICING SECTION: COUNTRY-WISE REGIONAL PRICING & DISCOUNTS
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Regional Tuition & Scholarship Plans
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Start Free. Upgrade Anytime.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
              Complete A0 and A1 foundational tracks are 100% free forever. Select your region for localized tuition & active scholarships:
            </p>

            {/* Region Selector Pills */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
              {regionsList.map((r: any) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegionCode(r.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 border ${
                    selectedRegionCode === r.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <span>{r.flag}</span>
                  <span>{r.regionName}</span>
                </button>
              ))}
            </div>

            {globalDiscount > 0 && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    {activeRegion.promoBannerText || `${globalDiscount}% Regional Scholarship Active`} • Code:{' '}
                    <span className="underline">{activeRegion.promoCode || 'MIAMI'}</span>
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Foundational lessons for absolute beginners.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Complete A0 & A1 Learn Path</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Full Theory, Phonics & Audio Cards</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 10 AI Coach chats / day</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Wikipedia ESL Reader access</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Daily vocabulary flashcards</li>
                </ul>
              </div>
              <Link
                href="/learn"
                className="mt-8 block text-center py-3.5 rounded-2xl font-extrabold text-xs btn-3d-secondary uppercase tracking-wider"
              >
                Start Learning Free
              </Link>
            </div>

            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Monthly Pro</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Flexible month-to-month full curriculum access.</p>
                <div className="my-6">
                  {globalDiscount > 0 && (
                    <div className="text-xs font-bold text-slate-400 line-through">
                      {activeRegion.currencySymbol}{originalMonthly}
                    </div>
                  )}
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {activeRegion.currencySymbol}{activeRegion.monthlyProPrice}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> All CEFR levels (A0 to C2)</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Unlimited AI Coach & Grammar Doctor</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> 60 min speaking practice daily</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Roleplay conversation scenarios</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-blue-600 shrink-0" /> Cancel anytime in 1 click</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 block text-center py-3.5 rounded-2xl font-extrabold text-xs btn-3d-secondary uppercase tracking-wider"
              >
                Choose Monthly Pro
              </Link>
            </div>

            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-[0_8px_0_0_#059669,0_20px_35px_-10px_rgba(5,150,105,0.25)] flex flex-col justify-between -translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                ★ Most Popular • {globalDiscount > 0 ? `Save ${globalDiscount}%` : 'Recommended'}
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Annual Pro Pass</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Full comprehensive fluency & certification.</p>
                <div className="my-6">
                  {globalDiscount > 0 && (
                    <div className="text-xs font-bold text-slate-400 line-through">
                      {activeRegion.currencySymbol}{originalAnnualMonthly}
                    </div>
                  )}
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {activeRegion.currencySymbol}{activeRegion.annualProMonthlyPrice}
                  </span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited Access to All 7 CEFR Levels</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited AI Coach & Speech Labs</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Live Wikipedia ESL Reading Studio</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Cambridge/IELTS Writing Lab grading</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Official Verifiable CEFR Certificates</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 btn-3d-emerald block text-center py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider"
              >
                Start Annual Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEO BLOGS & ENGLISH LEARNING GUIDES SECTION (ORGANIC SEARCH RANKING)
         ===================================================================== */}
      {blogs.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  English Fluency Blog & Study Guides
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Latest English Learning Articles & Tips
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                  In-depth guides on phonics, speaking confidence, workplace vocabulary, and CEFR exam preparation written by TICI faculty.
                </p>
              </div>

              <Link
                href="/blog"
                className="btn-3d-primary text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-2xl inline-flex items-center gap-2 self-start md:self-auto"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore All English Blogs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {blogs.map((post: any) => (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.id}
                  className="card-3d card-3d-interactive overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-52 bg-slate-900 overflow-hidden">
                      <img
                        src={post.coverImage || '/images/brand/hero-group-fair.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/85 text-white text-[10px] font-extrabold uppercase tracking-wider">
                          {post.category}
                        </span>
                      </div>
                      <img
                        src="/images/brand/logo-tici.png"
                        alt="TICI Logo"
                        className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]"
                      />
                    </div>

                    <div className="p-6 space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{post.readTimeMinutes || 5} min read</span>
                        <span>•</span>
                        <span>{post.authorName || 'Jason Trinidad'}</span>
                      </div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-blue-700 dark:text-blue-400">
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          LEARNER TESTIMONIALS
         ===================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Student Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Trusted by Learners Across 40+ Countries
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="card-3d p-7 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    "{t.quote}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-lg">{t.flag}</span>
                      <span>{t.name}</span>
                    </h4>
                    <p className="text-xs font-semibold text-slate-500">{t.role} • Native {t.native}</p>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {t.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FAQ SECTION
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card-3d p-6">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          FINAL CTA BANNER
         ===================================================================== */}
      <section className="py-20 bg-gradient-to-b from-blue-900 to-slate-950 text-white relative overflow-hidden border-t border-blue-800">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6 relative z-10">
          <img
            src="/images/brand/logo-tici.png"
            alt="TICI Logo"
            className="w-20 h-20 object-contain mx-auto"
          />
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Start Your English Journey?
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto font-medium">
            Begin with A0 Phonics & Greetings, explore our English Blog, or take the 5-minute placement test.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/learn"
              className="btn-3d-emerald text-sm font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Open Learn Path</span>
            </Link>
            <Link
              href="/blog"
              className="btn-3d-secondary text-sm font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 uppercase tracking-wider text-slate-900"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Read English Blogs</span>
            </Link>
            <Link
              href="/signup"
              className="btn-3d-amber text-sm font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
