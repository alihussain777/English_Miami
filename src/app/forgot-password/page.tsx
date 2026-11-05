'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full p-8 rounded-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
            <Mail className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reset Password</h1>
          <p className="text-xs text-slate-500">
            Enter your email and we'll send you a password recovery verification link.
          </p>

          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm space-y-3">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
              <p>Instructions have been dispatched to your email address.</p>
              <Link
                href="/reset-password"
                className="bg-blue-900 hover:bg-blue-800 block py-2.5 rounded-xl text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Go to Reset Password Form
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </form>
          )}

          <div className="pt-2 text-xs text-slate-500">
            Remembered your password?{' '}
            <Link href="/login" className="font-semibold text-blue-900 dark:text-blue-400">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
