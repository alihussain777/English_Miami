'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  BookOpen,
  CheckCircle2,
  BookmarkPlus,
  Info,
  Search,
  Globe,
  ExternalLink,
  BookMarked,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { playSuccessSound, playErrorSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

export default function ReadingLabPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'wikipedia' | 'graded'>('wikipedia');

  // Graded articles state
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticleIdx, setSelectedArticleIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [activeWordGloss, setActiveWordGloss] = useState<{ word: string; definition: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Wikipedia state
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiSearchResults, setWikiSearchResults] = useState<any[]>([]);
  const [wikiArticle, setWikiArticle] = useState<any>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState<string | null>(null);
  const [featuredTopics, setFeaturedTopics] = useState<any[]>([]);
  const [wikiAnswers, setWikiAnswers] = useState<Record<number, string>>({});
  const [wikiFeedback, setWikiFeedback] = useState<Record<number, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/labs/reading').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/wikipedia').then((r) => r.json()),
    ])
      .then(([readData, authData, wikiData]) => {
        setArticles(readData.articles || []);
        if (wikiData.featuredTopics) {
          setFeaturedTopics(wikiData.featuredTopics);
        }
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
        // Load default Wikipedia topic (Artificial intelligence)
        loadWikiArticle('Artificial intelligence');
      })
      .catch(() => {});
  }, []);

  const loadWikiArticle = async (title: string) => {
    setWikiLoading(true);
    setWikiError(null);
    setWikiAnswers({});
    setWikiFeedback({});
    try {
      const res = await fetch(`/api/wikipedia?title=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (res.ok && data.article) {
        setWikiArticle(data.article);
        setWikiSearchResults([]);
      } else {
        setWikiError(data.error || 'Failed to load Wikipedia article.');
      }
    } catch (err) {
      setWikiError('Network error connecting to Wikipedia.');
    } finally {
      setWikiLoading(false);
    }
  };

  const handleWikiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wikiQuery.trim()) return;
    setWikiLoading(true);
    setWikiError(null);
    try {
      const res = await fetch(`/api/wikipedia?q=${encodeURIComponent(wikiQuery.trim())}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setWikiSearchResults(data.results);
      } else {
        setWikiError(`No Wikipedia entries found for "${wikiQuery}".`);
      }
    } catch (err) {
      setWikiError('Search request failed.');
    } finally {
      setWikiLoading(false);
    }
  };

  const currentArticle = articles[selectedArticleIdx];

  const handleSelectOption = (qId: string, opt: string, correct: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
    const isCorrect = opt.trim().toLowerCase() === correct.trim().toLowerCase();
    setFeedback((prev) => ({ ...prev, [qId]: isCorrect }));

    if (isCorrect) playSuccessSound();
    else playErrorSound();
  };

  const handleWikiAnswer = (qIdx: number, opt: string, correct: string) => {
    setWikiAnswers((prev) => ({ ...prev, [qIdx]: opt }));
    const isCorrect = opt.trim().toLowerCase() === correct.trim().toLowerCase();
    setWikiFeedback((prev) => ({ ...prev, [qIdx]: isCorrect }));

    if (isCorrect) playSuccessSound();
    else playErrorSound();
  };

  const handleSaveWord = async (word: string, meaning: string, level = 'B1') => {
    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          meaning,
          cefrLevel: level,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(`"${word}" saved to your Spaced Repetition vocabulary bank!`);
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center flex-shrink-0 border border-oxford-200 dark:border-oxford-800">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                    ESL Reading & Comprehension Lab
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Live Wikipedia Integrated
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Real-World Reading & Vocabulary
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Read live encyclopedic articles and graded ESL stories with audio reader and vocabulary acquisition.
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-stretch md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('wikipedia')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'wikipedia'
                    ? 'bg-white dark:bg-slate-900 text-oxford-700 dark:text-oxford-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Wikipedia Real-World Reader</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('graded')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'graded'
                    ? 'bg-white dark:bg-slate-900 text-oxford-700 dark:text-oxford-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Graded ESL Stories</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* TAB 1: WIKIPEDIA REAL-WORLD READER */}
          {activeTab === 'wikipedia' && (
            <div className="space-y-6">
              {/* Search Bar & Preset Chips */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <form onSubmit={handleWikiSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={wikiQuery}
                      onChange={(e) => setWikiQuery(e.target.value)}
                      placeholder="Search any English topic on Wikipedia (e.g. Space, Quantum, London, Psychology, History)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-oxford-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={wikiLoading}
                    className="btn-primary text-xs px-5 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    {wikiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </form>

                {/* Preset ESL Topic Chips */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Recommended ESL Knowledge Topics:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {featuredTopics.map((top: any) => (
                      <button
                        key={top.title}
                        type="button"
                        onClick={() => loadWikiArticle(top.title)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-oxford-50 dark:hover:bg-oxford-950/60 hover:text-oxford-700 dark:hover:text-oxford-300 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white dark:bg-slate-700 text-oxford-700 dark:text-oxford-300">
                          {top.level}
                        </span>
                        <span>{top.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Search Results List */}
                {wikiSearchResults.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-500 block">Search Results:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {wikiSearchResults.map((res: any) => (
                        <button
                          key={res.pageid}
                          type="button"
                          onClick={() => loadWikiArticle(res.title)}
                          className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-oxford-400 transition-colors"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{res.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{res.snippet}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wikiError && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs">
                    {wikiError}
                  </div>
                )}
              </div>

              {/* Active Wikipedia Article Display */}
              {wikiLoading ? (
                <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-oxford-600 mb-2" />
                  <p className="text-xs text-slate-500">Fetching live article from Wikipedia knowledge base...</p>
                </div>
              ) : wikiArticle ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Article Text (2 Columns) */}
                  <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-oxford-100 dark:bg-oxford-950 text-oxford-800 dark:text-oxford-300">
                            CEFR Level: {wikiArticle.cefrLevel}
                          </span>
                          <span className="text-xs text-slate-500">
                            ~{wikiArticle.readingMinutes} min read
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                          {wikiArticle.title}
                        </h2>
                        <p className="text-xs text-slate-500 italic mt-0.5">{wikiArticle.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <TextToSpeechButton text={wikiArticle.extract} size="sm" showSpeedControl={true} />
                        <a
                          href={wikiArticle.pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                        >
                          <span>Full Wiki</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Article Body */}
                    <div className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 font-serif">
                      <p>{wikiArticle.extract}</p>
                    </div>

                    {/* Comprehension Quiz */}
                    {wikiArticle.questions && wikiArticle.questions.length > 0 && (
                      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Reading Comprehension Assessment:
                        </h3>

                        {wikiArticle.questions.map((q: any, idx: number) => {
                          const userAns = wikiAnswers[idx];
                          const isCorrect = wikiFeedback[idx];

                          return (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                              <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {idx + 1}. {q.question}
                              </div>
                              <div className="space-y-1.5">
                                {q.options.map((opt: string) => {
                                  const isSelected = userAns === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => handleWikiAnswer(idx, opt, q.correctAnswer)}
                                      className={`w-full p-2.5 text-left text-xs rounded-lg border transition-colors ${
                                        isSelected
                                          ? isCorrect
                                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                                            : 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>

                              {isCorrect !== undefined && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                  💡 {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Vocabulary Extraction Sidebar (1 Column) */}
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-oxford-600" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          Extracted Key Vocabulary
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        High-frequency academic and topical words automatically identified in this article.
                      </p>

                      <div className="space-y-2">
                        {wikiArticle.vocabulary?.map((v: any) => (
                          <div
                            key={v.word}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                {v.word}
                              </span>
                              <span className="text-[11px] text-slate-500">{v.note}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveWord(v.word, `From Wikipedia article on ${wikiArticle.title}`, wikiArticle.cefrLevel)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 hover:bg-oxford-100 border border-oxford-200 dark:border-oxford-800 flex items-center gap-1"
                            >
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 2: GRADED ESL STORIES */}
          {activeTab === 'graded' && (
            <div className="space-y-6">
              {/* Article tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {articles.map((art, idx) => (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => {
                      setSelectedArticleIdx(idx);
                      setAnswers({});
                      setFeedback({});
                      setActiveWordGloss(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                      selectedArticleIdx === idx
                        ? 'bg-oxford-700 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="px-1.5 py-0.5 rounded bg-white/20 text-[10px]">{art.level}</span>
                    <span>{art.title}</span>
                  </button>
                ))}
              </div>

              {/* Active Article Card */}
              {currentArticle && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mr-2">
                        Level {currentArticle.level}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                        {currentArticle.title}
                      </h2>
                    </div>
                    <TextToSpeechButton text={currentArticle.passage} size="sm" showSpeedControl={true} />
                  </div>

                  {/* Passage text */}
                  <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 space-y-4 font-serif">
                    <p>{currentArticle.passage}</p>
                  </div>

                  {/* Interactive Vocabulary Gloss Chips */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5" />
                      <span>Tap highlighted words for definitions & to save:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(currentArticle.wordGlosses || {}).map(([w, def]: any) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setActiveWordGloss({ word: w, definition: def })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-oxford-700 dark:text-oxford-300 hover:bg-oxford-50"
                        >
                          {w}
                        </button>
                      ))}
                    </div>

                    {activeWordGloss && (
                      <div className="mt-3 p-3.5 rounded-xl bg-oxford-50 dark:bg-oxford-950/60 border border-oxford-200 dark:border-oxford-800 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-bold text-sm text-oxford-950 dark:text-oxford-200 capitalize">
                            {activeWordGloss.word}:
                          </span>
                          <p className="text-xs text-oxford-800 dark:text-oxford-300 mt-0.5">
                            {activeWordGloss.definition}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveWord(activeWordGloss.word, activeWordGloss.definition, currentArticle.level)}
                          className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 flex-shrink-0"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save Word</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comprehension Quiz */}
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Reading Comprehension Check:
                    </h4>

                    {currentArticle.questions?.map((q: any) => {
                      const isCorrect = feedback[q.id];
                      const userAns = answers[q.id];

                      return (
                        <div key={q.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                          <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{q.prompt}</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options?.map((opt: string) => {
                              const isSelected = userAns === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, opt, q.correct)}
                                  className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                                    isSelected
                                      ? isCorrect
                                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                                        : 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {isCorrect !== undefined && (
                            <p className="text-xs text-slate-500 italic">💡 {q.explanation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
