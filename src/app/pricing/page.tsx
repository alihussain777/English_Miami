'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  RotateCcw,
  Loader2,
  X
} from 'lucide-react';
import { playFanfareSound } from '@/lib/audio-feedback';
import { SubscriptionPlan, UserSession } from '@/types';

export default function PricingPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/subscriptions').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([subData, authData]) => {
        if (subData.currentSubscription) setSubscription(subData.currentSubscription);
        if (subData.paymentHistory) setPayments(subData.paymentHistory);
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
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!session) {
      window.location.href = '/signup';
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        setCheckoutPlan(null);
        setSuccessMsg(data.message);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        playFanfareSound();
        const authData = await fetch('/api/auth/me').then((r) => r.json());
        if (authData.user) {
          setSession((prev: any) => ({ ...prev, plan: authData.user.subscription?.plan }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSubscription(data.subscription);
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentPlan = session?.plan || subscription?.plan || 'FREE';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-8 pb-24 lg:pb-8">
          {/* Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-oxford-600 dark:text-oxford-400">
              Institutional & Individual Tuition
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Invest in Your English Fluency
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Transparent plans with immediate access to speech analysis, AI coaching, and certified CEFR testing.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-sm font-semibold text-center">
              {successMsg}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Foundation for absolute beginners.</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs text-slate-400 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> A0 & A1 Beginner Courses</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 10 AI Coach chats / day</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 5 min speaking practice / day</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Wikipedia ESL Reader access</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Basic vocabulary tests</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                {currentPlan === 'FREE' ? (
                  <span className="block text-center py-2.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800">
                    Current Active Plan
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubscribe('FREE')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  >
                    Downgrade to Free
                  </button>
                )}
              </div>
            </div>

            {/* Weekly Pro */}
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Weekly Pro</h3>
                <p className="text-xs text-slate-500 mt-1">Flexible for short-term interview preparation.</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$6.99</span>
                  <span className="text-xs text-slate-400 ml-1">/ week</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> All CEFR levels (A0 to C2)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> 200 AI messages daily</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> 60 min speaking practice daily</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Wikipedia Reader & Vocab Bank</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Writing Lab grading</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                {currentPlan === 'WEEKLY_PRO' ? (
                  <span className="block text-center py-2.5 rounded-xl text-xs font-semibold text-oxford-700 dark:text-oxford-300 bg-oxford-50 dark:bg-oxford-950">
                    Current Active Plan
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan('WEEKLY_PRO')}
                    className="w-full btn-secondary text-xs font-semibold py-2.5 rounded-xl"
                  >
                    Upgrade to Weekly Pro
                  </button>
                )}
              </div>
            </div>

            {/* Monthly Pro */}
            <div className="relative p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-oxford-600 dark:border-oxford-500 shadow-md flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-oxford-700 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Best Value • Most Popular
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Monthly Pro</h3>
                <p className="text-xs text-slate-500 mt-1">Unlimited comprehensive fluency package.</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-oxford-700 dark:text-oxford-400">$19.99</span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2 font-semibold"><Check className="w-4 h-4 text-oxford-600" /> Unlimited AI Coach & Grammar Doctor</li>
                  <li className="flex items-center gap-2 font-semibold"><Check className="w-4 h-4 text-oxford-600" /> Unlimited Speaking & Pronunciation</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Cambridge / IELTS Writing Lab</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Official Verifiable CEFR Certificates</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-oxford-600" /> Priority Gemini Flash Speed</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                {currentPlan === 'MONTHLY_PRO' ? (
                  <span className="block text-center py-2.5 rounded-xl text-xs font-semibold text-oxford-700 dark:text-oxford-300 bg-oxford-50 dark:bg-oxford-950">
                    Current Active Plan
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan('MONTHLY_PRO')}
                    className="w-full btn-primary text-xs font-semibold py-3 rounded-xl"
                  >
                    Upgrade to Monthly Pro
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Subscription Status & Cancellation */}
          {session && subscription && currentPlan !== 'FREE' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Subscription Active ({currentPlan.replace('_', ' ')})
                </h4>
                <p className="text-xs text-slate-500">
                  {subscription.cancelAtPeriodEnd
                    ? 'Your subscription will conclude at the end of the current period.'
                    : `Renews automatically on ${new Date(subscription.endDate || Date.now()).toLocaleDateString()}.`}
                </p>
              </div>

              {!subscription.cancelAtPeriodEnd && (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50"
                >
                  Cancel Renewal
                </button>
              )}
            </div>
          )}

          {/* Billing History */}
          {payments.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Billing & Payment History
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {payments.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{p.plan.replace('_', ' ')}</span>
                      <span className="text-slate-400 block">{new Date(p.createdAt).toLocaleDateString()} • Ref: {p.transactionRef}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">${p.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block uppercase">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkout Modal */}
          {checkoutPlan && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Confirm {checkoutPlan.replace('_', ' ')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-oxford-50 dark:bg-oxford-950/40 border border-oxford-200 dark:border-oxford-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-oxford-900 dark:text-oxford-200">
                    {checkoutPlan === 'WEEKLY_PRO' ? '$6.99 USD / week' : '$19.99 USD / month'}
                  </span>
                  <span className="text-[11px] font-semibold text-oxford-700">Immediate Full Access</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      defaultValue={session?.name || 'Sofia Rodriguez'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Card Details (Simulated Test Card)</label>
                    <input
                      type="text"
                      defaultValue="•••• •••• •••• 4242 (Stripe Verified)"
                      disabled
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-mono text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-bit encrypted checkout architecture. Cancel anytime.</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="flex-1 btn-secondary text-xs py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handleSubscribe(checkoutPlan)}
                    className="flex-1 btn-primary text-xs py-2 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>Confirm Subscription</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
