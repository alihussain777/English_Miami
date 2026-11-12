'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Search,
  Globe,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Layers,
  ArrowRight,
  ArrowLeft,
  Gauge,
} from 'lucide-react';
import { UserSession } from '@/types';
import { playSuccessSound, playErrorSound } from '@/lib/audio-feedback';
import { speakRealisticText, stopSpeaking } from '@/lib/voice-engine';

export default function ReadingComprehensionPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeMode, setActiveMode] = useState<'wikipedia' | 'curated'>('wikipedia');

  // Step 1: Listen & Study Cards -> Step 2: Comprehension Test
  const [studyStep, setStudyStep] = useState<'cards' | 'quiz'>('cards');
  const [activeCardIdx, setActiveCardIdx] = useState(0);

  // Realistic Voice & Speed State
  const [voiceSpeed, setVoiceSpeed] = useState<number>(0.95);
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);

  // Wikipedia Live State
  const [wikiSearchQuery, setWikiSearchQuery] = useState('');
  const [wikiSearchResults, setWikiSearchResults] = useState<any[]>([]);
  const [featuredTopics, setFeaturedTopics] = useState<any[]>([]);
  const [wikiArticle, setWikiArticle] = useState<any>(null);
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [clickedWord, setClickedWord] = useState<{ word: string; note?: string } | null>(null);
  const [wikiQuizAnswers, setWikiQuizAnswers] = useState<Record<number, string>>({});
  const [wikiQuizSubmitted, setWikiQuizSubmitted] = useState(false);

  // Curated Reading Passages State
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [selectedGlossaryWord, setSelectedGlossaryWord] = useState<{
    word: string;
    meaning: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/labs/reading').then((r) => r.json()),
      fetch('/api/wikipedia').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([readData, wikiData, authData]) => {
        const list = readData.articles || [];
        setArticles(list);
        if (list.length > 0) setSelectedArticle(list[0]);

        const topics = wikiData.featuredTopics || [];
        setFeaturedTopics(topics);

        if (authData.authenticated && authData.user) {
          setSession({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            role: authData.user.role,
            currentLevel: authData.user.profile?.currentLevel || 'A2',
            plan: authData.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
        setLoading(false);
        loadWikipediaArticle('Artificial intelligence');
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });

    return () => {
      stopSpeaking();
    };
  }, []);

  const loadWikipediaArticle = async (title: string) => {
    stopSpeaking();
    setPlayingCardId(null);
    setLoadingWiki(true);
    setWikiQuizAnswers({});
    setWikiQuizSubmitted(false);
    setClickedWord(null);
    setStudyStep('cards');
    setActiveCardIdx(0);

    try {
      const res = await fetch(`/api/wikipedia?title=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.article) {
        setWikiArticle(data.article);
        setWikiSearchResults([]);
      }
    } catch (err) {
      console.error('Failed to load Wikipedia article:', err);
    } finally {
      setLoadingWiki(false);
    }
  };

  const handleWikiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wikiSearchQuery.trim()) return;
    setLoadingWiki(true);
    try {
      const res = await fetch(`/api/wikipedia?q=${encodeURIComponent(wikiSearchQuery)}`);
      const data = await res.json();
      setWikiSearchResults(data.results || []);
    } catch (err) {
      console.error('Wikipedia search error:', err);
    } finally {
      setLoadingWiki(false);
    }
  };

  const handleListenCard = (cardId: string, textToSpeak: string) => {
    if (playingCardId === cardId) {
      stopSpeaking();
      setPlayingCardId(null);
      return;
    }

    setPlayingCardId(cardId);
    speakRealisticText(textToSpeak, {
      rate: voiceSpeed,
      preferBrowserTTS: true,
      onStart: () => setPlayingCardId(cardId),
      onEnd: () => setPlayingCardId(null),
    });
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setVoiceSpeed(newSpeed);
    if (playingCardId && wikiArticle) {
      const card = (wikiArticle.studyCards || []).find((c: any) => c.id === playingCardId);
      if (card) {
        speakRealisticText(card.text, {
          rate: newSpeed,
          preferBrowserTTS: true,
          onStart: () => setPlayingCardId(card.id),
          onEnd: () => setPlayingCardId(null),
        });
      }
    }
  };

  const handleSelectArticle = (art: any) => {
    stopSpeaking();
    setPlayingCardId(null);
    setSelectedArticle(art);
    setSelectedGlossaryWord(null);
    setAnswers({});
    setSubmitted(false);
  };

  const handleCheckAnswers = () => {
    setSubmitted(true);
    const firstQ = selectedArticle?.questions?.[0];
    if (firstQ && answers[firstQ.id] === firstQ.correct) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  };

  const handleCheckWikiQuiz = () => {
    setWikiQuizSubmitted(true);
    const firstQ = wikiArticle?.questions?.[0];
    if (firstQ && wikiQuizAnswers[0] === firstQ.correctAnswer) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  };

  const studyCards = wikiArticle?.studyCards || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col lg:flex-row gap-6">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 w-full pb-24 lg:pb-8">
          {/* Header Banner with Mode Toggle & Realistic Voice Speed Bar */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
                  <Layers className="w-4 h-4" />
                  <span>Step 1: Listen & Read Cards → Step 2: Balanced Test</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Wikipedia & ESL Reading Study Cards
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Listen to bite-sized study cards with realistic voice & adjustable speed, tap any word for pronunciation, then test your comprehension.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
                <button
                  type="button"
                  onClick={() => setActiveMode('wikipedia')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeMode === 'wikipedia'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Wikipedia Study Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('curated')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeMode === 'curated'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>CEFR Stories</span>
                </button>
              </div>
            </div>

            {/* Realistic Voice Speed Control Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>Realistic Voice Speed Control:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { rate: 0.65, label: '🐢 0.65x Very Slow' },
                  { rate: 0.85, label: '🎧 0.85x Clear' },
                  { rate: 0.95, label: '🔊 1.0x Natural' },
                  { rate: 1.15, label: '⚡ 1.15x Fast' },
                ].map((s) => (
                  <button
                    key={s.rate}
                    type="button"
                    onClick={() => handleChangeSpeed(s.rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      voiceSpeed === s.rate
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-[0_2px_0_0_#047857]'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* MODE 1: WIKIPEDIA STUDY CARDS & BALANCED COMPREHENSION TEST     */}
          {/* =============================================================== */}
          {activeMode === 'wikipedia' && (
            <div className="space-y-6">
              {/* Search Bar + Featured Topic Pills */}
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <form onSubmit={handleWikiSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={wikiSearchQuery}
                      onChange={(e) => setWikiSearchQuery(e.target.value)}
                      placeholder="Search any Wikipedia topic (e.g., Space Exploration, Miami, Albert Einstein, Football)..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingWiki}
                    className="btn-3d-primary text-xs font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{loadingWiki ? 'Loading Cards...' : 'Generate Study Cards'}</span>
                  </button>
                </form>

                {/* Featured ESL Topics */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    Curated Topics (Tap to Load Cards):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {featuredTopics.map((topic) => {
                      const isCurrent = wikiArticle?.title === topic.title;
                      return (
                        <button
                          key={topic.title}
                          type="button"
                          onClick={() => loadWikipediaArticle(topic.title)}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            isCurrent
                              ? 'border-blue-700 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 ring-2 ring-blue-700'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-200 text-[10px] font-black">
                            {topic.level}
                          </span>
                          <span>{topic.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {wikiSearchResults.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        Select a Wikipedia article to build Study Cards:
                      </span>
                      <button
                        type="button"
                        onClick={() => setWikiSearchResults([])}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {wikiSearchResults.map((item) => (
                        <button
                          key={item.pageid}
                          type="button"
                          onClick={() => loadWikipediaArticle(item.title)}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-700 bg-slate-50 dark:bg-slate-800/40 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-sm text-blue-900 dark:text-blue-400">
                            {item.title}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {item.snippet}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Wikipedia Article Cards & Comprehension Test */}
              {loadingWiki ? (
                <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-500">
                    Preparing interactive listening & reading study cards...
                  </p>
                </div>
              ) : (
                wikiArticle && (
                  <div className="space-y-6">
                    {/* Top Topic Header + Step 1 / Step 2 Switcher */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        {wikiArticle.thumbnail && (
                          <img
                            src={wikiArticle.thumbnail}
                            alt={wikiArticle.title}
                            className="w-18 h-18 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-700 text-white font-black text-xs">
                              CEFR {wikiArticle.cefrLevel}
                            </span>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              { studyCards.length } Study Cards • {wikiArticle.readingMinutes} min
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {wikiArticle.title}
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">
                            {wikiArticle.description}
                          </p>
                        </div>
                      </div>

                      {/* Step 1 (Listen & Read Cards) vs Step 2 (Comprehension Test) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setStudyStep('cards')}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                            studyStep === 'cards'
                              ? 'btn-3d-primary'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>1. Study & Listen Cards ({studyCards.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            stopSpeaking();
                            setPlayingCardId(null);
                            setStudyStep('quiz');
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                            studyStep === 'quiz'
                              ? 'btn-3d-emerald'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>2. Comprehension Test ({wikiArticle.questions?.length || 2})</span>
                        </button>
                      </div>
                    </div>

                    {/* STEP 1: INTERACTIVE STUDY & LISTENING CARDS */}
                    {studyStep === 'cards' && (
                      <div className="space-y-6">
                        {/* Clicked Word Instant Dictionary Bar */}
                        {clickedWord && (
                          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 flex items-center justify-between gap-4 animate-in fade-in duration-150">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-base text-slate-900 dark:text-white">
                                  {clickedWord.word}
                                </span>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                                  Instant Word Audio & Meaning
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {clickedWord.note}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                speakRealisticText(clickedWord.word, {
                                  rate: 0.85,
                                  preferBrowserTTS: true,
                                })
                              }
                              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Pronounce</span>
                            </button>
                          </div>
                        )}

                        {/* Study Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {studyCards.map((card: any, cIdx: number) => {
                            const isPlayingThis = playingCardId === card.id;
                            const isFocused = activeCardIdx === cIdx;

                            return (
                              <div
                                key={card.id}
                                onClick={() => setActiveCardIdx(cIdx)}
                                className={`card-3d p-6 flex flex-col justify-between space-y-5 transition-all cursor-pointer border-2 ${
                                  isPlayingThis
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20'
                                    : isFocused
                                    ? 'border-blue-600 dark:border-blue-500'
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                              >
                                <div className="space-y-4">
                                  {/* Card Top Badge & Listen Button */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-black text-xs">
                                      Card {cIdx + 1} of {studyCards.length}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleListenCard(card.id, card.text);
                                      }}
                                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                                        isPlayingThis
                                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_3px_0_0_#1e3a8a]'
                                      }`}
                                    >
                                      {isPlayingThis ? (
                                        <>
                                          <VolumeX className="w-3.5 h-3.5" />
                                          <span>Stop ({voiceSpeed}x)</span>
                                        </>
                                      ) : (
                                        <>
                                          <Volume2 className="w-3.5 h-3.5" />
                                          <span>Listen ({voiceSpeed}x)</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">
                                    {card.heading}
                                  </h3>

                                  {/* Interactive Clickable Words inside Card */}
                                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                                    {card.text.split(' ').map((token: string, i: number) => {
                                      const clean = token.replace(/[.,!?;:()"']/g, '');
                                      const vocabMatch = wikiArticle.vocabulary?.find(
                                        (v: any) => v.word.toLowerCase() === clean.toLowerCase()
                                      );

                                      return (
                                        <span
                                          key={i}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (clean.length > 2) {
                                              speakRealisticText(clean, {
                                                rate: 0.85,
                                                preferBrowserTTS: true,
                                              });
                                              setClickedWord({
                                                word: clean,
                                                note:
                                                  vocabMatch?.note ||
                                                  `Tap "Pronounce" to hear "${clean}" clearly at slow speed.`,
                                              });
                                            }
                                          }}
                                          className={`inline-block mr-1 rounded px-0.5 transition-colors cursor-pointer ${
                                            vocabMatch
                                              ? 'font-black text-blue-700 dark:text-blue-400 underline decoration-dotted underline-offset-4 hover:bg-blue-50 dark:hover:bg-blue-950/60'
                                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                          }`}
                                        >
                                          {token}
                                        </span>
                                      );
                                    })}
                                  </p>
                                </div>

                                {/* Key Term Highlight Footer on Each Card */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                        🔑 Key Word: {card.keyTerm}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          speakRealisticText(card.keyTerm, {
                                            rate: 0.85,
                                            preferBrowserTTS: true,
                                          });
                                        }}
                                        className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-bold cursor-pointer"
                                      >
                                        🔊 Hear Word
                                      </button>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                                      {card.keyDefinition}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Proceed to Step 2 Comprehension Test CTA */}
                        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                          <div className="space-y-1 text-center sm:text-left">
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
                              Finished Listening & Reading the Cards?
                            </span>
                            <h3 className="text-lg sm:text-xl font-black">
                              Step 2: Take the {wikiArticle.title} Comprehension Test
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              stopSpeaking();
                              setPlayingCardId(null);
                              setStudyStep('quiz');
                            }}
                            className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-emerald-50 cursor-pointer shrink-0"
                          >
                            <span>Start Comprehension Test</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: BALANCED COMPREHENSION TEST */}
                    {studyStep === 'quiz' && (
                      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in duration-150">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Step 2 • Reading & Listening Verification
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                              Comprehension Test: {wikiArticle.title}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => setStudyStep('cards')}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back to Study Cards</span>
                          </button>
                        </div>

                        {wikiArticle.questions?.map((q: any, qIdx: number) => (
                          <div
                            key={qIdx}
                            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                {qIdx + 1}. {q.question}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  speakRealisticText(q.question, {
                                    rate: voiceSpeed,
                                    preferBrowserTTS: true,
                                  })
                                }
                                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0 cursor-pointer"
                                title="Listen to question"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt: string, oIdx: number) => {
                                const isSelected = wikiQuizAnswers[qIdx] === opt;
                                const isCorrect = opt === q.correctAnswer;
                                const letter = String.fromCharCode(65 + oIdx);

                                let style =
                                  'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-blue-400';

                                if (wikiQuizSubmitted) {
                                  if (isCorrect) {
                                    style =
                                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-bold';
                                  } else if (isSelected && !isCorrect) {
                                    style =
                                      'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                                  }
                                } else if (isSelected) {
                                  style =
                                    'border-blue-700 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 font-bold ring-2 ring-blue-700';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    disabled={wikiQuizSubmitted}
                                    onClick={() =>
                                      setWikiQuizAnswers((prev) => ({
                                        ...prev,
                                        [qIdx]: opt,
                                      }))
                                    }
                                    className={`w-full p-4 rounded-xl border-2 text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${style}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center shrink-0">
                                        {letter}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {wikiQuizSubmitted && isCorrect && (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    )}
                                    {wikiQuizSubmitted && isSelected && !isCorrect && (
                                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {wikiQuizSubmitted && (
                              <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-950 dark:text-blue-200">
                                💡 {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <a
                            href={wikiArticle.pageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline"
                          >
                            <span>View Original Wikipedia Source</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {!wikiQuizSubmitted ? (
                            <button
                              type="button"
                              disabled={Object.keys(wikiQuizAnswers).length === 0}
                              onClick={handleCheckWikiQuiz}
                              className="btn-3d-emerald text-xs font-black px-8 py-3.5 rounded-xl disabled:opacity-40 cursor-pointer"
                            >
                              Check Test Answers
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setWikiQuizAnswers({});
                                setWikiQuizSubmitted(false);
                              }}
                              className="btn-3d-secondary text-xs font-black px-6 py-3 rounded-xl cursor-pointer"
                            >
                              Retry Test
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* MODE 2: CURATED CEFR SHORT STORIES                              */}
          {/* =============================================================== */}
          {activeMode === 'curated' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {articles.map((art) => {
                  const isSelected = selectedArticle?.id === art.id;
                  return (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => handleSelectArticle(art)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-700'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <span className="px-2 py-0.5 rounded bg-blue-900 text-white font-bold text-[10px]">
                        {art.level}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                        {art.title}
                      </h3>
                    </button>
                  );
                })}
              </div>

              {selectedArticle && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">
                          Level {selectedArticle.level} Story Card
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedArticle.title}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleListenCard(selectedArticle.id, selectedArticle.passage)
                        }
                        className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>
                          {playingCardId === selectedArticle.id
                            ? 'Stop Audio'
                            : `Listen (${voiceSpeed}x)`}
                        </span>
                      </button>
                    </div>

                    <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                      {selectedArticle.passage.split(' ').map((word: string, i: number) => {
                        const clean = word.toLowerCase().replace(/[.,!?;:]/g, '');
                        const gloss = selectedArticle.wordGlosses?.[clean];
                        if (gloss) {
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                speakRealisticText(clean, { rate: 0.85, preferBrowserTTS: true });
                                setSelectedGlossaryWord({ word: clean, meaning: gloss });
                              }}
                              className="inline-block mr-1.5 font-black text-blue-900 dark:text-blue-300 underline decoration-dotted underline-offset-4 hover:bg-blue-50 dark:hover:bg-blue-950 px-1 rounded transition-colors cursor-pointer"
                            >
                              {word}
                            </button>
                          );
                        }
                        return <span key={i}>{word} </span>;
                      })}
                    </div>

                    {selectedGlossaryWord && (
                      <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
                        <div className="text-xs space-y-0.5">
                          <span className="font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                            Vocabulary Definition: &ldquo;{selectedGlossaryWord.word}&rdquo;
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {selectedGlossaryWord.meaning}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            speakRealisticText(selectedGlossaryWord.word, {
                              rate: 0.85,
                              preferBrowserTTS: true,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                        >
                          🔊 Listen
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comprehension Quiz */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-900 dark:text-blue-400" />
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Comprehension Check
                      </h3>
                    </div>

                    {selectedArticle.questions.map((q: any) => (
                      <div key={q.id} className="space-y-3">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {q.prompt}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt: string) => {
                            const isSelected = answers[q.id] === opt;
                            const isCorrect = opt === q.correct;
                            let btnStyle =
                              'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';

                            if (submitted) {
                              if (isCorrect) {
                                btnStyle =
                                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold';
                              } else if (isSelected && !isCorrect) {
                                btnStyle =
                                  'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                              }
                            } else if (isSelected) {
                              btnStyle =
                                'border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-900';
                            }

                            return (
                              <button
                                key={opt}
                                type="button"
                                disabled={submitted}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                                }
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {submitted && isCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                                {submitted && isSelected && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {submitted && (
                          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                            <span className="font-bold block mb-0.5">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!submitted ? (
                      <button
                        type="button"
                        disabled={Object.keys(answers).length === 0}
                        onClick={handleCheckAnswers}
                        className="w-full btn-3d-emerald font-black text-xs py-3 rounded-xl disabled:opacity-40 cursor-pointer"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAnswers({});
                          setSubmitted(false);
                        }}
                        className="w-full btn-3d-secondary font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
