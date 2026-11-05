'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  BookmarkCheck,
  Plus,
  Volume2,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Loader2,
  X
} from 'lucide-react';
import { UserSession } from '@/types';

export default function VocabularyPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, mastered: 0, dueToday: 0 });
  const [filter, setFilter] = useState<'all' | 'review' | 'mastered' | 'learning'>('all');
  const [loading, setLoading] = useState(true);

  // Add word modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newLevel, setNewLevel] = useState('B1');
  const [addingWord, setAddingWord] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vocabulary?filter=${filter}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([vData, authData]) => {
        setVocabList(vData.vocabulary || []);
        if (vData.stats) setStats(vData.stats);
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
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const handleCreateCustomWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newMeaning) return;
    setAddingWord(true);
    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: newWord,
          meaning: newMeaning,
          example: newExample,
          cefrLevel: newLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewWord('');
        setNewMeaning('');
        setNewExample('');
        // Refresh
        const refresh = await fetch(`/api/vocabulary?filter=${filter}`).then((r) => r.json());
        setVocabList(refresh.vocabulary || []);
        if (refresh.stats) setStats(refresh.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingWord(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center flex-shrink-0 border border-oxford-200 dark:border-oxford-800">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                  Spaced Repetition (SuperMemo SM-2)
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Vocabulary Bank
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Scientifically scheduled memory reviews to convert new terms into lifelong active recall.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Word</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold uppercase block">Total Words</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-oxford-600 dark:text-oxford-400 font-semibold uppercase block">Due Today</span>
              <span className="text-2xl font-bold text-oxford-700 dark:text-oxford-300">{stats.dueToday}</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-amber-600 font-semibold uppercase block">In Progress</span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.learning || (stats.total - stats.mastered)}</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs text-emerald-600 font-semibold uppercase block">Mastered</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.mastered}</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {[
              { id: 'all', label: 'All Words' },
              { id: 'review', label: 'Review Today (SRS)' },
              { id: 'learning', label: 'Learning' },
              { id: 'mastered', label: 'Mastered' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === t.id
                    ? 'bg-oxford-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Vocabulary Cards Grid */}
          {loading ? (
            <div className="text-center py-12 text-xs font-semibold text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-oxford-600 mb-2" />
              Loading words bank...
            </div>
          ) : vocabList.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <BookmarkCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">
                No words in this view
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete lessons or read Wikipedia articles in the Reading Lab to automatically add terms to your vocabulary bank.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabList.map((v) => (
                <div
                  key={v.id}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-oxford-300 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300">
                        {v.cefrLevel}
                      </span>
                      <TextToSpeechButton text={v.word} size="sm" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                        {v.word}
                      </h4>
                      {v.phonetic && (
                        <span className="text-[11px] text-slate-400 font-mono">{v.phonetic}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {v.definition}
                    </p>

                    {v.translation && (
                      <p className="text-xs font-semibold text-oxford-700 dark:text-oxford-400">
                        {v.translation}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Status: <strong className="text-oxford-700 dark:text-oxford-300">{v.status || 'LEARNING'}</strong></span>
                    <span>Reviews: {v.reviewCount || 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Word Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Add Word to Vocabulary Bank
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomWord} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Word or Phrase
                    </label>
                    <input
                      type="text"
                      required
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="e.g. Resilient"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Meaning / Definition
                    </label>
                    <input
                      type="text"
                      required
                      value={newMeaning}
                      onChange={(e) => setNewMeaning(e.target.value)}
                      placeholder="Able to withstand or recover quickly from difficult conditions."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Example Sentence (Optional)
                    </label>
                    <input
                      type="text"
                      value={newExample}
                      onChange={(e) => setNewExample(e.target.value)}
                      placeholder="He showed a resilient attitude despite setbacks."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 btn-secondary text-xs py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingWord}
                      className="flex-1 btn-primary text-xs py-2 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      {addingWord ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Save Word</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
