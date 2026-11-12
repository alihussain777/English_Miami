'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  ShieldCheck,
  Star,
  Check,
  GraduationCap,
  Award,
  Volume2,
  Sparkles,
  Flame,
  Compass,
  Play,
  Camera,
  Users,
  Heart,
  Building2,
  Upload,
  X,
  Maximize2,
  Quote,
} from 'lucide-react';

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  category: 'fun' | 'jason' | 'graduation' | 'social';
  badge: string;
  goldFrame?: boolean;
}

interface OwnerPortraitSlot {
  id: string;
  title: string;
  roleTag: string;
  caption: string;
  defaultImage: string;
}

export default function HomePage() {
  const [heroShowcaseMode, setHeroShowcaseMode] = useState<'group' | 'graduation' | 'selfie' | 'audio'>('group');
  const [activeDemoTab, setActiveDemoTab] = useState<'A0' | 'B1' | 'C2'>('A0');
  const [speakingSample, setSpeakingSample] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'fun' | 'jason' | 'graduation'>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Ready-made 3D Owner Portrait Frames (supports instant custom photo upload/swap + persistence)
  const defaultOwnerSlots: OwnerPortraitSlot[] = [
    {
      id: 'owner-slot-1',
      title: 'Jason Trinidad • Founder & President',
      roleTag: 'Executive Owner Portrait #1',
      caption: 'Leading graduates at the La Gorce Country Club Diploma Ceremony in Miami Beach.',
      defaultImage: '/images/brand/jason-graduation-quartet.jpg',
    },
    {
      id: 'owner-slot-2',
      title: 'Jason Trinidad • In the Classroom',
      roleTag: 'Founder Mentorship Frame #2',
      caption: 'High-energy multicultural classroom immersion with international students at TICI.',
      defaultImage: '/images/brand/jason-classroom-selfie.jpg',
    },
    {
      id: 'owner-slot-3',
      title: 'Jason Trinidad • Solo Portrait Slot',
      roleTag: 'Ready 3D Owner Frame #3 (Add Solo Photo)',
      caption: 'Dedicated 3D Royal Gold Frame ready for Jason Trinidad’s solo executive portrait — click "Add / Change Owner Photo" below anytime!',
      defaultImage: '/images/brand/jason-graduation-group.jpg',
    },
  ];

  const [customOwnerPhotos, setCustomOwnerPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tici_owner_custom_photos');
      if (saved) {
        setCustomOwnerPhotos(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOwnerPhotoUpload = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...customOwnerPhotos, [slotId]: result };
      setCustomOwnerPhotos(updated);
      try {
        localStorage.setItem('tici_owner_custom_photos', JSON.stringify(updated));
      } catch (err) {
        console.error('Could not save photo to localStorage:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetOwnerPhoto = (slotId: string) => {
    const updated = { ...customOwnerPhotos };
    delete updated[slotId];
    setCustomOwnerPhotos(updated);
    try {
      localStorage.setItem('tici_owner_custom_photos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const playNativeAudio = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeakingSample(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingSample(false);
    utterance.onerror = () => setSpeakingSample(false);
    window.speechSynthesis.speak(utterance);
  };

  const heroDemos = {
    A0: {
      badge: 'A0 • Absolute Beginner Phonics',
      prompt: 'Tap the speaker to hear native pronunciation & Urdu/Spanish meaning:',
      phrase: 'Good morning! Nice to meet you.',
      phonetic: '/ɡʊd ˈmɔːr.nɪŋ! naɪs tuː miːt juː/',
      translation: 'صبح بخیر! آپ سے مل کر خوشی ہوئی۔ • ¡Buenos días! Mucho gusto.',
      tip: 'Notice the long "ee" vowel sound in "meet" (/miːt/).',
      xp: '+15 XP',
    },
    B1: {
      badge: 'B1 • Career & Interview Fluency',
      prompt: 'Workplace Grammar & Tense Precision:',
      phrase: 'I have been managing cross-functional teams for three years.',
      phonetic: '/aɪ hæv bɪn ˈmæn.ɪ.dʒɪŋ krɒs-ˈfʌŋk.ʃən.əl tiːmz/',
      translation: 'میں تین سال سے مختلف ٹیموں کی قیادت کر رہا ہوں۔',
      tip: 'Use Present Perfect Continuous ("have been + -ing") for actions that started in the past and continue now.',
      xp: '+25 XP',
    },
    C2: {
      badge: 'C2 • Executive & Academic Mastery',
      prompt: 'Advanced Negative Inversion & Diplomatic Rhetoric:',
      phrase: 'Seldom have we witnessed such a transformative technological shift.',
      phonetic: '/ˈsel.dəm hæv wiː ˈwɪt.nəst sʌtʃ ə trænsˈfɔː.mə.tɪv ʃɪft/',
      translation: 'ہم نے شاذ و نادر ہی ایسی انقلابی تکنیکی تبدیلی دیکھی ہے۔',
      tip: 'Placing a negative adverbial ("Seldom") at the start triggers subject-auxiliary inversion ("have we").',
      xp: '+50 XP',
    },
  };

  const campusGallery: GalleryItem[] = [
    {
      id: 'hero-fair',
      src: '/images/brand/hero-group-fair.jpg',
      title: 'International Fair & Birthday Celebration',
      subtitle: 'Founder Jason Trinidad celebrating with 15+ international students in front of the interactive smartboard.',
      category: 'jason',
      badge: '★ Front Group Highlight',
      goldFrame: true,
    },
    {
      id: 'silicon-valley-fun',
      src: '/images/brand/class-fun-silicon-valley.jpg',
      title: 'Interactive Smartboard Fun & Media Critique',
      subtitle: 'Students laughing and taking charge of the remote during a live Silicon Valley Girl video session.',
      category: 'fun',
      badge: 'Classroom Fun',
    },
    {
      id: 'jason-grad-group',
      src: '/images/brand/jason-graduation-group.jpg',
      title: 'La Gorce Country Club Diploma Ceremony',
      subtitle: 'University Owner Jason Trinidad standing proudly with 7 certified graduates holding their official framed diplomas.',
      category: 'graduation',
      badge: 'Jason Trinidad • Graduation',
      goldFrame: true,
    },
    {
      id: 'nasa-artemis',
      src: '/images/brand/class-fun-nasa.jpg',
      title: 'CNN Science: NASA Artemis II Launch Presentation',
      subtitle: 'Students delivering live scientific commentary and vocabulary analysis on the classroom smartboard.',
      category: 'fun',
      badge: 'Smartboard Live',
    },
    {
      id: 'dolce-gabbana',
      src: '/images/brand/class-fun-fashion.jpg',
      title: 'ICA Miami: Dolce & Gabbana Cultural Review',
      subtitle: 'Two students presenting art, fashion, and cultural vocabulary with prepared speaking notes.',
      category: 'fun',
      badge: 'Culture & Art',
    },
    {
      id: 'jason-selfie',
      src: '/images/brand/jason-classroom-selfie.jpg',
      title: 'Warm Classroom Bond with Jason Trinidad',
      subtitle: 'Jason Trinidad (left, in orange tropical shirt) sharing a joyful moment with his multi-generational learners.',
      category: 'jason',
      badge: 'Founder & Students',
      goldFrame: true,
    },
    {
      id: 'neurotech',
      src: '/images/brand/class-fun-neurotech.jpg',
      title: 'IEEE Brain: Neurotechnologies Keynote',
      subtitle: 'Advanced students debating future technology frontiers and scientific terminology in English.',
      category: 'fun',
      badge: 'STEM & Tech English',
    },
    {
      id: 'miami-towers',
      src: '/images/brand/class-fun-miami-towers.jpg',
      title: 'Miami Real Estate & Muse Sunny Isles Review',
      subtitle: 'Interactive presentation covering Neighborhoods, Highrises, Weather Reports, and Food Reviews.',
      category: 'fun',
      badge: 'Miami Real World',
    },
    {
      id: 'jason-quartet',
      src: '/images/brand/jason-graduation-quartet.jpg',
      title: 'Executive Hospitality Certification at La Gorce',
      subtitle: 'Jason Trinidad honoring four outstanding graduates with official TICI / EnglishMiami certificates.',
      category: 'graduation',
      badge: 'La Gorce Country Club',
      goldFrame: true,
    },
    {
      id: 'golden-beach',
      src: '/images/brand/class-fun-golden-beach.jpg',
      title: 'Golden Beach Coastal Architecture Tour',
      subtitle: 'Students co-presenting South Florida coastal landmarks and descriptive adjectives.',
      category: 'fun',
      badge: 'Speaking Confidence',
    },
    {
      id: 'lounge-social',
      src: '/images/brand/group-lounge.jpg',
      title: 'Evening Student Lounge & Conversation Club',
      subtitle: 'Jason Trinidad and 11 students practicing relaxed, natural English conversation in the campus lounge.',
      category: 'jason',
      badge: 'Community Night',
      goldFrame: true,
    },
    {
      id: 'oxford-table',
      src: '/images/brand/study-table-oxford.jpg',
      title: 'Oxford Intro Listening & Hospitality Seminar',
      subtitle: 'Focused small-group seminar surrounded by Miami palm trees and structured Oxford textbooks.',
      category: 'graduation',
      badge: 'Small-Group Seminar',
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
      title: '3D Gamified Learn Path',
      desc: 'Interactive stepping stones, phonics study sheets, word banks, and instant XP rewards.',
      icon: Compass,
      href: '/learn',
      accent: 'bg-emerald-500 shadow-[0_4px_0_0_#047857]',
    },
    {
      title: 'Speaking Lab & Speech AI',
      desc: 'Real-time voice recognition with syllable-level pronunciation accuracy scoring.',
      icon: Mic,
      href: '/speaking',
      accent: 'bg-blue-600 shadow-[0_4px_0_0_#1e3a8a]',
    },
    {
      title: 'Wikipedia Real-World Reader',
      desc: 'Read live encyclopedic articles with audio narration and 1-click vocabulary extraction.',
      icon: Globe,
      href: '/reading',
      accent: 'bg-indigo-600 shadow-[0_4px_0_0_#3730a3]',
    },
    {
      title: 'SRS Vocabulary Bank',
      desc: 'SuperMemo SM-2 spaced repetition flashcards with native audio and Urdu/Spanish meanings.',
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
      desc: 'Native dialogues with variable speed control (0.65x turtle to 1.2x) and dictation.',
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
        'Jason Trinidad sir ka teaching style aur TICI EnglishMiami ka 3D learning path kamal hai! A0 se le kar C1 tak har lafz ki audio aur classroom energy ne meri fluency 10x barha di.',
    },
    {
      name: 'Carlos & Hospitality Team',
      country: 'Miami Beach',
      flag: '🇺🇸',
      role: 'La Gorce Country Club Graduates',
      native: 'Spanish',
      quote:
        'Graduating with our official certificates from Jason Trinidad at La Gorce Country Club was one of the proudest moments of our careers. He makes every class fun, respectful, and deeply practical.',
    },
    {
      name: 'Camila Santos',
      country: 'Brazil',
      flag: '🇧🇷',
      role: 'Product Marketing Lead',
      native: 'Portuguese',
      quote:
        'From smartboard presentations on Miami architecture and NASA to the 3D online study cards, Jason Trinidad has built a university where you actually live the English language.',
    },
    {
      name: 'Priya Sharma',
      country: 'India',
      flag: '🇮🇳',
      role: 'Corporate Strategy Consultant',
      native: 'Hindi',
      quote:
        'The C1 and C2 modules on executive rhetoric combined with TICI’s real-world presentation method are unmatched. You feel part of a real Miami academic family.',
    },
  ];

  const faqs = [
    {
      q: 'Who is the founder and owner of TICI • EnglishMiami?',
      a: 'TICI (Trinidad International Cultural Institute) • EnglishMiami was founded and is owned by Jason Trinidad, a renowned Miami educator and university leader who has mentored hundreds of international students and hospitality professionals at premier institutions like La Gorce Country Club.',
    },
    {
      q: 'Can I start if I know zero English (A0 level)?',
      a: 'Yes! Our A0 Foundation track starts right from the 26 English alphabet letters, short and long vowel phonics, numbers 1–100, and survival greetings with interactive audio and Urdu, Hindi, Spanish, and Arabic translations.',
    },
    {
      q: 'How does the classroom methodology combine with the 3D Learning Path?',
      a: 'Inspired by Jason Trinidad’s vibrant Miami classrooms—where students give live smartboard presentations on science, architecture, and culture—our 3D online path lets you study Theory, Phonics, and Audio Flashcards before completing interactive exercises.',
    },
    {
      q: 'Are the TICI • EnglishMiami CEFR Certificates verifiable?',
      a: 'Yes. Upon completing a CEFR level, you receive an official certificate endorsed by Founder Jason Trinidad with a unique verification code that employers, country clubs, and universities can verify online.',
    },
  ];

  const currentDemo = heroDemos[activeDemoTab];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      {/* =====================================================================
          HERO SECTION: OFFICIAL TICI CREST BRANDING + 3D FRONT GROUP PHOTO
         ===================================================================== */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28 border-b-2 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 bg-grid-pattern hero-mesh">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* LEFT COLUMN: TICI CREST IDENTITY, HEADLINE & 3D CTAS */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Official Brand Identity Crest Card */}
              <div className="inline-flex flex-wrap items-center gap-3.5 p-2.5 pr-5 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border-2 border-blue-500/60 shadow-[0_6px_0_0_#1e3a8a,0_15px_30px_-5px_rgba(30,58,138,0.35)]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-blue-900 to-slate-950 border border-blue-400/50 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                  <img
                    src="/images/brand/logo-tici.png"
                    alt="TICI Official 3D Crest"
                    className="w-12 h-12 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.45)]"
                  />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                      OFFICIAL TICI BRAND
                    </span>
                    <span className="text-xs font-extrabold text-blue-300">
                      Miami Beach, Florida
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-black tracking-tight text-white mt-0.5">
                    Trinidad International Cultural Institute • Founded by Jason Trinidad
                  </p>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                Where Real Classroom{' '}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-600 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Joy & Culture
                </span>{' '}
                Meet 3D English Mastery.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Welcome to <strong className="text-slate-900 dark:text-white font-extrabold">TICI • EnglishMiami</strong>, founded and led by university owner <strong className="text-blue-700 dark:text-blue-400 font-extrabold">Jason Trinidad</strong>. Experience our joyful Miami classroom community, live smartboard presentations, La Gorce Country Club certification programs, and our complete CEFR A0–C2 3D learning path.
              </p>

              {/* 3D Tactile CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1 justify-center lg:justify-start">
                <Link
                  href="/learn"
                  className="btn-3d-emerald w-full sm:w-auto text-sm sm:text-base font-black px-7 py-4 rounded-2xl flex items-center justify-center gap-2.5 group uppercase tracking-wide"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start 3D Learn Path</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#founder"
                  className="btn-3d-amber w-full sm:w-auto text-sm sm:text-base font-black px-7 py-4 rounded-2xl flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Award className="w-5 h-5 text-slate-950" />
                  <span>Meet Owner Jason Trinidad</span>
                </a>
              </div>

              {/* Tactile 3D Metric Pills */}
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto lg:mx-0">
                <div className="p-3 rounded-2xl bg-white/95 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                    TICI
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">Jason Trinidad</div>
                    <div className="text-[10px] font-bold text-slate-500">Founder & Owner</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/95 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                    A0–C2
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">7 Levels</div>
                    <div className="text-[10px] font-bold text-slate-500">55+ 3D Units</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/95 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">Live Campus</div>
                    <div className="text-[10px] font-bold text-slate-500">Miami & Online</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/95 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b] flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-slate-900 dark:text-white">La Gorce</div>
                    <div className="text-[10px] font-bold text-slate-500">Certified Partner</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GRAND 3D FRAMED FRONT GROUP PHOTO & INTERACTIVE SWITCHER */}
            <div className="lg:col-span-6 relative perspective-1000">
              {/* Floating 3D TICI Metallic Crest Top-Left */}
              <div className="hidden sm:flex absolute -top-6 -left-5 z-30 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/95 text-white font-black text-xs border-2 border-amber-400 shadow-[0_6px_0_0_#b45309] animate-float-slow">
                <img
                  src="/images/brand/logo-tici.png"
                  alt="TICI Crest"
                  className="w-7 h-7 object-contain"
                />
                <div>
                  <span className="text-amber-400 block text-[10px] uppercase tracking-wider">TICI UNIVERSITY CREST</span>
                  <span>JASON TRINIDAD • MIAMI CAMPUS</span>
                </div>
              </div>

              {/* Floating 3D Badge Bottom-Right */}
              <div className="hidden sm:flex absolute -bottom-5 -right-3 z-30 items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-xs border-2 border-emerald-300 shadow-[0_6px_0_0_#047857] animate-float-delayed">
                <Sparkles className="w-4 h-4 fill-white" />
                <span>REAL CLASSROOM FUN & 100% INTERACTIVE!</span>
              </div>

              {/* Grand 3D Hero Showcase Frame */}
              <div className="frame-3d-hero">
                {/* Frame Mode Switcher Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-[11px] font-black text-blue-200 uppercase tracking-wider ml-2">
                      3D Campus & Studio Frame
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('group')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                        heroShowcaseMode === 'group'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🎉 Front Group Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('graduation')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                        heroShowcaseMode === 'graduation'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🎓 Graduation
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('selfie')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                        heroShowcaseMode === 'selfie'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🤳 Class Fun
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroShowcaseMode('audio')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                        heroShowcaseMode === 'audio'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      🔊 Audio Demo
                    </button>
                  </div>
                </div>

                {/* MODE 1: MAIN FRONT GROUP PHOTO (INTERNATIONAL FAIR WITH JASON TRINIDAD) */}
                {heroShowcaseMode === 'group' && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 group">
                    <img
                      src="/images/brand/hero-group-fair.jpg"
                      alt="Founder Jason Trinidad and International Students at TICI EnglishMiami International Fair"
                      className="w-full h-[360px] sm:h-[430px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                          ★ Official Front Campus Group Photo
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-white">
                          International Fair & Classroom Celebration with Jason Trinidad
                        </h3>
                        <p className="text-xs text-slate-200 font-medium max-w-xl">
                          Founder Jason Trinidad alongside 15+ smiling international students in front of our interactive smartboard in Miami.
                        </p>
                      </div>
                      <a
                        href="#campus-fun"
                        className="btn-3d-amber text-xs font-black px-4 py-2.5 rounded-xl shrink-0 text-center"
                      >
                        View All 13 Photos →
                      </a>
                    </div>
                  </div>
                )}

                {/* MODE 2: LA GORCE COUNTRY CLUB GRADUATION WITH JASON TRINIDAD */}
                {heroShowcaseMode === 'graduation' && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/60 group">
                    <img
                      src="/images/brand/jason-graduation-group.jpg"
                      alt="Jason Trinidad with Graduates at La Gorce Country Club"
                      className="w-full h-[360px] sm:h-[430px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        🎓 La Gorce Country Club • Miami Beach
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                        Founder Jason Trinidad & Official Certificate Graduates
                      </h3>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        Proud adult learners holding their framed TICI / EnglishMiami diplomas alongside university owner Jason Trinidad.
                      </p>
                    </div>
                  </div>
                )}

                {/* MODE 3: CLASSROOM SELFIE WITH JASON TRINIDAD */}
                {heroShowcaseMode === 'selfie' && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/60 group">
                    <img
                      src="/images/brand/jason-classroom-selfie.jpg"
                      alt="Jason Trinidad Classroom Selfie with Students"
                      className="w-full h-[360px] sm:h-[430px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                        🤳 High-Energy Miami Classroom
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                        Learning English with Warmth, Smiles & Family Spirit
                      </h3>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        Jason Trinidad (left) brings unmatched enthusiasm, humor, and real-world confidence to every class session.
                      </p>
                    </div>
                  </div>
                )}

                {/* MODE 4: INTERACTIVE AUDIO PHONICS & CEFR STUDIO */}
                {heroShowcaseMode === 'audio' && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-sm">
                          Interactive CEFR Audio Studio
                        </h3>
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Tap any level to test live native pronunciation
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['A0', 'B1', 'C2'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setActiveDemoTab(lvl)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              activeDemoTab === lvl
                                ? 'bg-blue-700 text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {currentDemo.badge}
                          </span>
                          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                            "{currentDemo.phrase}"
                          </p>
                          <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {currentDemo.phonetic}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => playNativeAudio(currentDemo.phrase)}
                          className="w-12 h-12 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-[0_4px_0_0_#1e3a8a] cursor-pointer"
                        >
                          <Volume2 className={`w-6 h-6 ${speakingSample ? 'animate-bounce' : ''}`} />
                        </button>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {currentDemo.translation}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="font-extrabold text-amber-800 dark:text-amber-300">💡 Phonics Note: </strong>
                      {currentDemo.tip}
                    </div>
                  </div>
                )}

                {/* Thumbnail Strip inside 3D Hero Frame */}
                <div className="grid grid-cols-4 gap-2.5 mt-3 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setHeroShowcaseMode('group')}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                      heroShowcaseMode === 'group' ? 'border-amber-400 scale-[1.03]' : 'border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src="/images/brand/hero-group-fair.jpg" alt="Group Fair" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-black text-white py-0.5">
                      Front Group
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroShowcaseMode('graduation')}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                      heroShowcaseMode === 'graduation' ? 'border-amber-400 scale-[1.03]' : 'border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src="/images/brand/jason-graduation-group.jpg" alt="Graduation" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-black text-white py-0.5">
                      Graduation
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroShowcaseMode('selfie')}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                      heroShowcaseMode === 'selfie' ? 'border-amber-400 scale-[1.03]' : 'border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src="/images/brand/jason-classroom-selfie.jpg" alt="Jason Selfie" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] font-black text-white py-0.5">
                      Jason & Class
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroShowcaseMode('audio')}
                    className={`rounded-xl h-14 border-2 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-600 to-emerald-800 text-white transition-all cursor-pointer ${
                      heroShowcaseMode === 'audio' ? 'border-amber-400 scale-[1.03]' : 'border-emerald-500/50 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[9px] font-black mt-0.5">Live Audio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          DEDICATED SECTION: FOUNDER & UNIVERSITY OWNER — JASON TRINIDAD
          (LIFE STORY, VISION, ACHIEVEMENTS & 3D OWNER PORTRAIT FRAMES)
         ===================================================================== */}
      <section
        id="founder"
        className="py-24 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden border-b-4 border-amber-500/80"
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 space-y-16">
          {/* Top Crest & Section Title */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-400/15 border-2 border-amber-400/60 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg">
              <img src="/images/brand/logo-tici.png" alt="TICI Crest" className="w-6 h-6 object-contain" />
              <span>University Owner & Visionary Founder</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              Jason Trinidad:{' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                The Heart & Vision Behind TICI
              </span>
            </h2>

            <p className="text-base sm:text-xl text-blue-100/90 leading-relaxed font-medium">
              Founder, President & Owner of <strong className="text-amber-300">Trinidad International Cultural Institute (TICI) • EnglishMiami</strong> — transforming lives through cultural immersion, smartboard innovation, and real-world English leadership.
            </p>
          </div>

          {/* Life Story & Achievements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT 7 COLUMNS: JASON TRINIDAD'S LIFE STORY & ACHIEVEMENTS */}
            <div className="lg:col-span-7 space-y-8">
              {/* Biography Story Card */}
              <div className="p-7 sm:p-9 rounded-3xl bg-slate-900/90 border-2 border-amber-400/50 shadow-[0_10px_0_0_#78350f,0_25px_50px_-12px_rgba(0,0,0,0.7)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 p-1.5 shadow-[0_4px_0_0_#78350f] flex items-center justify-center shrink-0">
                      <img
                        src="/images/brand/logo-tici.png"
                        alt="TICI Crest"
                        className="w-13 h-13 object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block">
                        Life Story & Educational Legacy
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        Jason Trinidad
                      </h3>
                      <p className="text-xs sm:text-sm font-bold text-blue-300">
                        Founder, Owner & Chancellor • TICI University & EnglishMiami
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-black self-start sm:self-center">
                    ★ Miami’s Premier ESL Leader
                  </div>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  <p>
                    <strong className="text-amber-300 font-extrabold">Jason Trinidad</strong> founded the <strong className="text-white">Trinidad International Cultural Institute (TICI) • EnglishMiami</strong> with a singular, life-changing conviction: <em>language is not meant to be memorized in silence—it is meant to be lived, celebrated, and spoken with joy.</em>
                  </p>
                  <p>
                    Over his distinguished career in South Florida, Jason recognized that talented immigrants, international professionals, and dedicated hospitality teams often felt intimidated by traditional, rigid language schools. He built TICI as a warm, family-spirited university where learners from Latin America, Europe, Asia, and the Middle East come together as one global community.
                  </p>
                  <p>
                    In Jason’s classrooms, students don’t just fill in worksheets—they step up to the <strong className="text-amber-300">interactive smartboard</strong> with a microphone or remote in hand to present on <strong className="text-white">Miami luxury architecture, NASA Artemis space missions, IEEE neurotechnology, and ICA Miami fashion exhibitions</strong>. Beyond campus walls, Jason personally leads executive and workplace English diploma programs for iconic Miami institutions, including the prestigious <strong className="text-amber-300">La Gorce Country Club</strong> in Miami Beach.
                  </p>
                </div>

                {/* Quote from Jason Trinidad */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/90 to-slate-900 border-l-4 border-amber-400 flex items-start gap-3.5">
                  <Quote className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm sm:text-base italic font-bold text-amber-100">
                      "When a student smiles, stands in front of the smartboard, and shares their story in English without fear—that is the moment their entire career and life in America transforms."
                    </p>
                    <p className="text-xs font-black uppercase tracking-wider text-amber-400 mt-2">
                      — Jason Trinidad, Founder & Owner of TICI • EnglishMiami
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Key Achievements Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-amber-400/60 transition-all shadow-[0_6px_0_0_#0f172a]">
                  <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black mb-3 shadow-[0_3px_0_0_#b45309]">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-base text-white">
                    1. Founder of TICI University & Brand
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Established the Trinidad International Cultural Institute (TICI) crest & CEFR A0–C2 curriculum uniting classroom immersion with 3D digital learning.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-amber-400/60 transition-all shadow-[0_6px_0_0_#0f172a]">
                  <div className="w-11 h-11 rounded-xl bg-emerald-400 text-slate-950 flex items-center justify-center font-black mb-3 shadow-[0_3px_0_0_#047857]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-base text-white">
                    2. La Gorce Country Club Partner
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Personally mentors and certifies hospitality professionals at Miami Beach’s historic La Gorce Country Club, awarding official framed diplomas.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-amber-400/60 transition-all shadow-[0_6px_0_0_#0f172a]">
                  <div className="w-11 h-11 rounded-xl bg-blue-400 text-slate-950 flex items-center justify-center font-black mb-3 shadow-[0_3px_0_0_#1e3a8a]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-base text-white">
                    3. Smartboard Immersion Pioneer
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Replaced passive lectures with live student keynotes on Miami real estate, NASA science, neurotechnology, and international cultural fairs.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-amber-400/60 transition-all shadow-[0_6px_0_0_#0f172a]">
                  <div className="w-11 h-11 rounded-xl bg-purple-400 text-slate-950 flex items-center justify-center font-black mb-3 shadow-[0_3px_0_0_#6b21a8]">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-base text-white">
                    4. Global Multicultural Family
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Empowered thousands of adult learners from 40+ countries to achieve career promotions, university admissions, and fearless fluency.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT 5 COLUMNS: JASON TRINIDAD'S 3D ROYAL GOLD PORTRAIT FRAMES (WITH CUSTOM UPLOAD FOR FUTURE SOLO PHOTOS) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-xs font-extrabold text-amber-200">
                    3D Royal Gold Owner Frames • Click <span className="underline">"Add / Change Owner Photo"</span> on any frame to add new solo photos of Jason Trinidad anytime!
                  </p>
                </div>
              </div>

              {defaultOwnerSlots.map((slot) => {
                const activePhoto = customOwnerPhotos[slot.id] || slot.defaultImage;
                const isCustom = Boolean(customOwnerPhotos[slot.id]);
                return (
                  <div key={slot.id} className="frame-3d-gold">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-amber-600/50 bg-slate-950 group">
                      <img
                        src={activePhoto}
                        alt={slot.title}
                        className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                          ★ {slot.roleTag}
                        </span>
                        <img
                          src="/images/brand/logo-tici.png"
                          alt="TICI Crest"
                          className="w-9 h-9 object-contain bg-slate-950/80 rounded-xl p-1 border border-amber-400/60"
                        />
                      </div>

                      {/* Bottom Info & Upload Button */}
                      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-white">
                            {slot.title}
                          </h4>
                          <p className="text-xs text-amber-100/90 font-medium mt-0.5">
                            {slot.caption}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] shadow-[0_3px_0_0_#92400e] transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isCustom ? 'Change Photo' : 'Add / Swap Photo'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleOwnerPhotoUpload(slot.id, e)}
                              className="hidden"
                            />
                          </label>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => resetOwnerPhoto(slot.id)}
                              className="p-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer"
                              title="Reset to default photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3D CLASSROOM FUN, SMARTBOARD PRESENTATIONS & GRADUATIONS GALLERY
         ===================================================================== */}
      <section
        id="campus-fun"
        className="py-24 bg-slate-100 dark:bg-slate-900/90 border-b-2 border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
          {/* Header & Filter Pills */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Real Miami Campus Moments in 3D Frames</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Classroom Fun, Smartboard Talks & Graduations
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                See how Founder <strong className="text-slate-900 dark:text-white">Jason Trinidad</strong> and our international students make learning English an unforgettable adventure every single day. Click any 3D frame to inspect in fullscreen!
              </p>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All 12 3D Frames' },
                { id: 'fun', label: '🎉 Smartboard & Classroom Fun' },
                { id: 'jason', label: '👑 Jason Trinidad & Community' },
                { id: 'graduation', label: '🎓 La Gorce Graduations' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryFilter(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    galleryFilter === tab.id
                      ? 'btn-3d-primary'
                      : 'btn-3d-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Framed Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className={`${item.goldFrame ? 'frame-3d-gold' : 'frame-3d'} cursor-pointer group flex flex-col justify-between`}
              >
                <div className="relative rounded-2xl overflow-hidden h-64 sm:h-72 bg-slate-900">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Top Badge & Expand Icon */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md ${
                        item.goldFrame
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-blue-700 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-950/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* TICI Watermark Crest */}
                  <img
                    src="/images/brand/logo-tici.png"
                    alt="TICI"
                    className="absolute bottom-3 right-3 w-8 h-8 object-contain opacity-90 drop-shadow-md"
                  />
                </div>

                <div className="p-4 pt-4 space-y-1.5">
                  <h3
                    className={`font-black text-base sm:text-lg leading-snug ${
                      item.goldFrame
                        ? 'text-slate-950 dark:text-amber-200'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed font-medium ${
                      item.goldFrame
                        ? 'text-slate-800 dark:text-amber-100/80'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fullscreen 3D Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-4xl w-full frame-3d-gold overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={lightboxItem.src}
                alt={lightboxItem.title}
                className="w-full max-h-[72vh] object-contain mx-auto"
              />
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 p-2.5 rounded-2xl bg-slate-900/90 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950">
                  {lightboxItem.badge}
                </span>
                <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1.5">
                  {lightboxItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-amber-100 font-medium mt-0.5">
                  {lightboxItem.subtitle}
                </p>
              </div>
              <img
                src="/images/brand/logo-tici.png"
                alt="TICI Crest"
                className="w-14 h-14 object-contain shrink-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEVEN-LEVEL CEFR 3D CURRICULUM EXPLORER (A0 TO C2)
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Structured CEFR Roadmap
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Seven 3D Stages to Complete Mastery
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
              Click any CEFR level below to inspect its units or jump straight into the interactive learning path.
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
          8 CORE COMPETENCIES: 3D BENTO GRID
         ===================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y-2 border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
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
          PRICING SECTION: 3D TACTILE PLANS
         ===================================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              Transparent Tuition Plans
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Start Free. Upgrade Anytime.
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
              Complete A0 and A1 foundational tracks are 100% free forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Free Starter */}
            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Foundational lessons for absolute beginners.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Complete A0 & A1 3D Learn Path</li>
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

            {/* Weekly Pro */}
            <div className="card-3d p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Weekly Sprint</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Ideal for fast job interview or exam prep.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">$6.99</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ week</span>
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
                Choose Weekly Pro
              </Link>
            </div>

            {/* Monthly Pro (Featured 3D Card) */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-[0_8px_0_0_#059669,0_20px_35px_-10px_rgba(5,150,105,0.25)] flex flex-col justify-between -translate-y-1">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                ★ Most Popular • Recommended
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Monthly Pro</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Full comprehensive fluency & certification.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">$19.99</span>
                  <span className="text-xs font-bold text-slate-500 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited Access to All 7 CEFR Levels</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited AI Coach & Speech Labs</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Live Wikipedia ESL Reading Studio</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Cambridge/IELTS Writing Lab grading</li>
                  <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Official Verifiable TICI Certificates</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="mt-8 btn-3d-emerald block text-center py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider"
              >
                Start Monthly Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          LEARNER TESTIMONIALS
         ===================================================================== */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t-2 border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Global Student Community
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              Loved by Learners in Miami & Across 40+ Countries
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
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-200/80 dark:border-slate-800/80 transition-colors">
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
          FINAL 3D CTA BANNER WITH TICI CREST
         ===================================================================== */}
      <section className="py-20 bg-gradient-to-b from-blue-900 to-slate-950 text-white relative overflow-hidden border-t-2 border-blue-800">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-6 relative z-10">
          <div className="mx-auto w-20 h-20 rounded-3xl crest-3d-badge p-2 flex items-center justify-center">
            <img
              src="/images/brand/logo-tici.png"
              alt="TICI Official Crest"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Join Jason Trinidad’s TICI • EnglishMiami Community Today
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto font-medium">
            Jump straight into A0 Phonics & Greetings or test your CEFR level in 5 minutes.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/learn"
              className="btn-3d-emerald text-sm font-black px-8 py-4 rounded-2xl inline-flex items-center gap-2 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Open 3D Learn Path Now</span>
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
