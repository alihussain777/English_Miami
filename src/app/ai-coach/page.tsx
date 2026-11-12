'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import SpeechRecognitionButton from '@/components/SpeechRecognitionButton';
import {
  Brain,
  Send,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Volume2,
  MessageSquare,
  ShieldCheck,
  Zap,
  Briefcase,
  Coffee,
  Plane,
  Building,
  UserPlus,
  Stethoscope,
  ShoppingBag,
} from 'lucide-react';
import { UserSession } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  coachingTip?: string;
  grammarCorrection?: {
    original: string;
    corrected: string;
    reason: string;
  };
}

export default function AICoachPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [mode, setMode] = useState<'tutor' | 'grammar' | 'vocab' | 'roleplay'>('tutor');
  const [scenario, setScenario] = useState('Restaurant');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm **Miami AI Coach** 🌴.\n\nI adapt to your personal English level and native language. Type anything you want to practice, tap the microphone to speak, or select a quick action above!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [roleplayReport, setRoleplayReport] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            currentLevel: data.user.profile?.currentLevel || 'A2',
            plan: data.user.subscription?.plan || 'FREE',
            onboardingCompleted: true,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (mode === 'roleplay') {
        const res = await fetch('/api/ai/roleplay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario,
            message: text,
            history: messages.slice(-4),
          }),
        });
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}`,
              role: 'assistant',
              content: data.reply,
              coachingTip: data.coachingTip,
            },
          ]);
        }
      } else {
        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            prompt: text,
            sentence: mode === 'grammar' ? text : undefined,
            word: mode === 'vocab' ? text : undefined,
            history: messages.slice(-4),
          }),
        });
        const data = await res.json();

        if (data.mode === 'grammar' && data.result) {
          const r = data.result;
          const formatted = r.hasErrors
            ? `**Correction:**\n❌ Original: *${r.original}*\n✅ Better: **${r.corrected}**\n\n**Why?**\n${r.explanation}`
            : `✅ **Great job!** "${r.original}" is grammatically accurate and natural.\n\n${r.explanation}`;

          setMessages((prev) => [
            ...prev,
            { id: `asst-${Date.now()}`, role: 'assistant', content: formatted },
          ]);
        } else if (data.mode === 'vocab' && data.result) {
          const v = data.result;
          const formatted = `### 📚 Vocabulary Focus: **${v.word}** (${v.partOfSpeech})\n*Phonetic:* \`${v.phonetic}\`\n\n**Definition:**\n${v.meaning}\n\n**Example:**\n*"${v.example}"*\n\n**Common Synonyms:** ${v.synonyms?.join(', ')}`;
          setMessages((prev) => [
            ...prev,
            { id: `asst-${Date.now()}`, role: 'assistant', content: formatted },
          ]);
        } else if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: `asst-${Date.now()}`,
              role: 'assistant',
              content: data.reply,
              grammarCorrection: data.grammarCorrection,
            },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I ran into a network hiccup. Let’s try that again!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishRoleplay = async () => {
    try {
      const res = await fetch('/api/ai/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, finishSession: true }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setRoleplayReport(data.evaluation);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scenariosList = [
    { name: 'Restaurant', icon: Coffee, desc: 'Ordering food & wine' },
    { name: 'Job Interview', icon: Briefcase, desc: 'Professional interview' },
    { name: 'Airport Check-in', icon: Plane, desc: 'Luggage & boarding' },
    { name: 'Hotel Concierge', icon: Building, desc: 'Room requests & check-in' },
    { name: 'Doctor Visit', icon: Stethoscope, desc: 'Describing symptoms' },
    { name: 'Shopping', icon: ShoppingBag, desc: 'Asking sizes & prices' },
    { name: 'Making Friends', icon: UserPlus, desc: 'Casual social chat' },
  ];

  const quickPrompts = [
    'Explain the difference between "look", "see", and "watch".',
    'Correct this: "I am agree with your opinion."',
    'Teach me 3 business idioms for negotiations.',
    'Give me a 60-second speaking challenge!',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col lg:flex-row gap-6">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 flex flex-col w-full h-[calc(100vh-6rem)]">
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src="/images/brand/logo-tici.png"
                alt="TICI Miami AI Logo"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div>
                <h1 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Miami AI Academic Coach</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    CEFR {session?.currentLevel || 'A2'}
                  </span>
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Online & Ready</span>
                </div>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setMode('tutor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'tutor'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Tutor
              </button>
              <button
                type="button"
                onClick={() => setMode('grammar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === 'grammar'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Grammar Drills
              </button>
              <button
                type="button"
                onClick={() => setMode('vocab')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'vocab'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Vocab Coach
              </button>
              <button
                type="button"
                onClick={() => setMode('roleplay')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'roleplay'
                    ? 'bg-white dark:bg-slate-900 text-ocean-600 dark:text-ocean-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Roleplay
              </button>
            </div>
          </div>

          {/* Roleplay Scenario Selector Banner (if in roleplay mode) */}
          {mode === 'roleplay' && (
            <div className="p-3 mb-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto flex-shrink-0">
              <span className="text-[11px] font-bold uppercase text-slate-400 pl-2">Scenario:</span>
              {scenariosList.map((sc) => {
                const Icon = sc.icon;
                const isSelected = scenario === sc.name;
                return (
                  <button
                    key={sc.name}
                    type="button"
                    onClick={() => {
                      setScenario(sc.name);
                      setMessages([
                        {
                          id: `sc-start-${Date.now()}`,
                          role: 'assistant',
                          content: `Welcome to the **${sc.name}** roleplay simulation! Speak or type in English as if we are really there. Whenever you are finished, click "Finish & Review Session" to see your evaluation report!`,
                        },
                      ]);
                      setRoleplayReport(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                      isSelected
                        ? 'bg-ocean-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{sc.name}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleFinishRoleplay}
                className="ml-auto bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xs flex-shrink-0 transition-colors"
              >
                Finish & Review
              </button>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <img
                    src="/images/brand/logo-tici.png"
                    alt="Miami AI"
                    className="w-9 h-9 object-contain flex-shrink-0 mt-0.5"
                  />
                )}

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed space-y-2 ${
                    m.role === 'user'
                      ? 'bg-blue-700 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {m.coachingTip && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900">
                      💡 {m.coachingTip}
                    </div>
                  )}

                  {m.role === 'assistant' && (
                    <div className="pt-1 flex items-center justify-end">
                      <TextToSpeechButton text={m.content} size="sm" showSpeedControl />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-coral-500 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-ocean-500 animate-bounce delay-200" />
                <span>Miami Coach is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* End-of-session Roleplay Evaluation Report Modal / View */}
          {roleplayReport && (
            <div className="mt-3 p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border-2 border-teal-500 shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-900 dark:text-blue-400" />
                  <span>Roleplay Evaluation Report ({scenario})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setRoleplayReport(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 space-y-1">
                  <span className="font-bold text-rose-500 uppercase tracking-wider block">Grammar Polish</span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {roleplayReport.grammarMistakes?.map((g: string, i: number) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 space-y-1">
                  <span className="font-bold text-emerald-600 uppercase tracking-wider block">Natural Better Sentences</span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {roleplayReport.betterSentences?.map((b: string, i: number) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs">
                <strong>Fluency Rating:</strong> {roleplayReport.fluencyScore}% • {roleplayReport.overallFeedback}
              </div>
            </div>
          )}

          {/* Quick Prompts Chips */}
          <div className="py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qp)}
                className="px-3 py-1 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500 flex-shrink-0 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box with Voice & Speech Recognition */}
          <div className="pt-2 flex items-center gap-2 flex-shrink-0">
            <SpeechRecognitionButton
              onResult={(speechText) => {
                setInput(speechText);
                handleSendMessage(speechText);
              }}
              buttonText="Voice"
              className="py-3 px-3.5 rounded-2xl flex-shrink-0"
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                mode === 'grammar'
                  ? 'Type any sentence to fix (e.g. "I have went yesterday")...'
                  : mode === 'vocab'
                  ? 'Type any word or concept (e.g. "Negotiate", "Serendipity")...'
                  : 'Message Miami AI Coach in English...'
              }
              className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />

            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => handleSendMessage()}
              className="bg-blue-900 hover:bg-blue-800 text-white p-3.5 rounded-xl shadow-xs disabled:opacity-40 transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
