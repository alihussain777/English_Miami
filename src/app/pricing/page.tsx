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
  Loader2,
  X,
  Globe,
  Tag,
} from 'lucide-react';
import { playFanfareSound } from '@/lib/audio-feedback';
import { SubscriptionPlan, UserSession } from '@/types';
import type { RegionalPricingTier } from '@/lib/site-config-store';

export default function PricingPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Regional Pricing & Discount State controlled by Admin Panel
  const [regionalTiers, setRegionalTiers] = useState<RegionalPricingTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>('pk');
  const [globalDiscountActive, setGlobalDiscountActive] = useState<boolean>(true);
  const [globalDiscountBanner, setGlobalDiscountBanner] = useState<string>('');
  const [ipGeoStatus, setIpGeoStatus] = useState<{
    countryName: string;
    countryCode: string;
    ip: string;
    autoDetected: boolean;
  }>({
    countryName: 'Detecting via IP...',
    countryCode: '',
    ip: '',
    autoDetected: false,
  });

  useEffect(() => {
    const mapCodeToTier = (code: string, tiersList: RegionalPricingTier[]) => {
      const c = (code || '').toUpperCase().trim();
      if (c === 'PK' && tiersList.some((t) => t.id === 'pk')) return 'pk';
      if (['PK', 'IN', 'BD', 'NP', 'LK'].includes(c)) {
        return c === 'PK' ? 'pk' : 'south-asia';
      }
      if (['MX', 'BR', 'CO', 'AR', 'CL', 'PE'].includes(c)) return 'latam';
      if (['AE', 'SA', 'QA', 'KW', 'TR', 'JP', 'KR'].includes(c)) return 'mena-asia';
      return 'us-eu';
    };

    Promise.all([
      fetch('/api/subscriptions').then((r) => r.json()).catch(() => ({})),
      fetch('/api/auth/me').then((r) => r.json()).catch(() => ({})),
      fetch('/api/pricing').then((r) => r.json()).catch(() => ({})),
    ])
      .then(async ([subData, authData, priceData]) => {
        if (subData.currentSubscription) setSubscription(subData.currentSubscription);
        if (subData.paymentHistory) setPayments(subData.paymentHistory);

        const tiers: RegionalPricingTier[] = priceData.regionalPricing || [];
        setRegionalTiers(tiers);
        setGlobalDiscountActive(priceData.globalDiscountActive ?? true);
        setGlobalDiscountBanner(priceData.globalDiscountBanner || '');

        let detectedTier = priceData.detectedTierId || '';
        let detectedCountryName = priceData.detectedCountryName || '';
        let detectedCountryCode = priceData.detectedCountryCode || '';
        let detectedIp = priceData.detectedIp || '';

        // Fast Client-Side IP Geo Detection (so visitor's real public IP is checked directly)
        if (!detectedCountryCode) {
          try {
            const ipRes = await fetch('https://ipwho.is/');
            if (ipRes.ok) {
              const ipJson = await ipRes.json();
              if (ipJson && ipJson.country_code) {
                detectedCountryCode = String(ipJson.country_code).toUpperCase();
                detectedCountryName = String(ipJson.country || '');
                detectedIp = String(ipJson.ip || '');
                detectedTier = mapCodeToTier(detectedCountryCode, tiers);
              }
            }
          } catch {}
        }

        // Timezone fallback if IP API is blocked by adblocker
        if (!detectedTier) {
          try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            if (/Karachi/i.test(tz)) {
              detectedTier = tiers.some((t) => t.id === 'pk') ? 'pk' : 'south-asia';
              detectedCountryName = 'Pakistan';
              detectedCountryCode = 'PK';
            } else if (/Calcutta|Kolkata|Dhaka|Colombo|Kathmandu/i.test(tz)) {
              detectedTier = 'south-asia';
              detectedCountryName = 'South Asia';
              detectedCountryCode = 'IN';
            } else if (/Mexico|Bogota|Sao_Paulo|Buenos_Aires|Lima|Santiago/i.test(tz)) {
              detectedTier = 'latam';
              detectedCountryName = 'Latin America';
            } else if (/Dubai|Riyadh|Istanbul|Tokyo|Seoul/i.test(tz)) {
              detectedTier = 'mena-asia';
              detectedCountryName = 'Middle East & Asia';
            } else {
              detectedTier = 'us-eu';
              detectedCountryName = 'United States & Europe';
            }
          } catch {
            detectedTier = 'pk';
          }
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

        setIpGeoStatus({
          countryName: detectedCountryName || 'Pakistan',
          countryCode: detectedCountryCode || 'PK',
          ip: detectedIp,
          autoDetected: true,
        });
        setSelectedTierId(detectedTier || 'pk');
      })
      .catch(() => {});
  }, []);

  const activeTier =
    regionalTiers.find((t) => t.id === selectedTierId) ||
    regionalTiers[0] || {
      id: 'us-eu',
      regionName: 'United States, UK & Europe',
      countriesLabel: 'USA, UK, Europe',
      flag: '🇺🇸🇪🇺',
      currencySymbol: '$',
      currencyCode: 'USD',
      monthlyProPrice: 19,
      annualProMonthlyPrice: 12,
      annualProTotal: 144,
      discountPercent: 25,
      promoCode: 'MIAMI25',
      promoBannerText: '25% OFF Welcome Discount',
      active: true,
    };

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentPlan = session?.plan || subscription?.plan || 'FREE';

  const originalMonthly =
    activeTier.discountPercent > 0
      ? Math.round(activeTier.monthlyProPrice / (1 - activeTier.discountPercent / 100))
      : activeTier.monthlyProPrice;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-8 pb-24 lg:pb-8">
          {/* Global Discount Banner if active */}
          {globalDiscountActive && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center font-black text-xs sm:text-sm shadow-sm flex flex-wrap items-center justify-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{globalDiscountBanner || activeTier.promoBannerText}</span>
              {activeTier.promoCode && (
                <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-white font-mono text-xs">
                  Code: {activeTier.promoCode} ({activeTier.discountPercent}% OFF Applied)
                </span>
              )}
            </div>
          )}

          {/* Header & Visitor Country/Region Pricing Selector */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-400">
              Country-Wise Fair Tuition & Institutional Plans
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Invest in Your English Fluency
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Localized pricing adjusted for your region with full access to 23-language Duolingo paths, Speaking Lab, Wikipedia Study Cards, and CEFR Certificates.
            </p>

            {/* Live IP Country Auto-Detection Badge */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-extrabold text-blue-800 dark:text-blue-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                📍 IP Auto-Detected Location:{' '}
                <strong className="font-black text-slate-900 dark:text-white">
                  {activeTier.flag} {ipGeoStatus.countryName || activeTier.regionName}
                </strong>
                {ipGeoStatus.ip ? ` (IP: ${ipGeoStatus.ip})` : ''} — Showing Admin Regional Rate ({activeTier.currencySymbol}{activeTier.monthlyProPrice}/mo)
              </span>
            </div>

            {/* Region Selector Bar */}
            {regionalTiers.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 flex items-center gap-1 mr-1">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Country / Region Plan:</span>
                </span>
                {regionalTiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      selectedTierId === tier.id
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <span>{tier.flag}</span>
                    <span>{tier.regionName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-sm font-bold text-center">
              {successMsg}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Free Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Foundation for absolute beginners.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    {activeTier.currencySymbol}0
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ forever</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 23-Language Basic Learn Path (A0 & A1)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 10 Miami AI Coach chats / day</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Speaking Lab pronunciation checks</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Wikipedia Reading Study Cards</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Official CEFR Placement Diagnostic</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                {currentPlan === 'FREE' ? (
                  <span className="block text-center py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800">
                    Current Active Plan
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubscribe('FREE')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    Switch to Free Starter
                  </button>
                )}
              </div>
            </div>

            {/* Monthly Pro (Regional Price) */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-700 dark:border-blue-500 shadow-lg flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full whitespace-nowrap">
                {activeTier.flag} {activeTier.discountPercent}% Regional Discount Applied
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Monthly Pro</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Full unlimited fluency suite for {activeTier.regionName}.
                </p>
                <div className="my-6 flex items-baseline gap-2">
                  {activeTier.discountPercent > 0 && (
                    <span className="text-lg font-bold text-slate-400 line-through">
                      {activeTier.currencySymbol}{originalMonthly}
                    </span>
                  )}
                  <span className="text-4xl font-black text-blue-700 dark:text-blue-400">
                    {activeTier.currencySymbol}{activeTier.monthlyProPrice}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2 font-extrabold"><Check className="w-4 h-4 text-emerald-600" /> All CEFR Levels (A0 to C2 Mastery)</li>
                  <li className="flex items-center gap-2 font-extrabold"><Check className="w-4 h-4 text-emerald-600" /> Unlimited Speaking Lab & Word Scoring</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlimited Miami AI Coach & Roleplay</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Official Verifiable CEFR Certificates</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Personalized Spaced Repetition Bank</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                {currentPlan === 'MONTHLY_PRO' ? (
                  <span className="block text-center py-2.5 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950">
                    Current Active Plan
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan('MONTHLY_PRO')}
                    className="w-full btn-3d-primary text-xs font-black py-3.5 rounded-xl cursor-pointer"
                  >
                    Upgrade to Monthly Pro ({activeTier.currencySymbol}{activeTier.monthlyProPrice}/mo)
                  </button>
                )}
              </div>
            </div>

            {/* Annual Pro Scholarship */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-600 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">Annual Pro</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
                    Best Savings
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Billed annually ({activeTier.currencySymbol}{activeTier.annualProTotal}/year).
                </p>
                <div className="my-6">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    {activeTier.currencySymbol}{activeTier.annualProMonthlyPrice}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Everything in Monthly Pro</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Save extra 35% with Annual Billing</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Priority Graduation Certificate Review</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Full Offline & Mobile Study Access</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 30-Day Satisfaction Guarantee</li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCheckoutPlan('MONTHLY_PRO')}
                  className="w-full btn-3d-emerald text-xs font-black py-3.5 rounded-xl cursor-pointer"
                >
                  Claim Annual Scholarship ({activeTier.currencySymbol}{activeTier.annualProMonthlyPrice}/mo)
                </button>
              </div>
            </div>
          </div>

          {/* Active Subscription Status & Cancellation */}
          {session && subscription && currentPlan !== 'FREE' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 cursor-pointer"
                >
                  Cancel Renewal
                </button>
              )}
            </div>
          )}

          {/* Billing History */}
          {payments.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
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
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    Confirm {checkoutPlan.replace('_', ' ')} ({activeTier.regionName})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Region:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeTier.flag} {activeTier.regionName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Regional Price:</span>
                    <span className="font-black text-emerald-600">
                      {activeTier.currencySymbol}{activeTier.monthlyProPrice}/month ({activeTier.discountPercent}% OFF)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>256-bit SSL Encrypted • Cancel anytime with 1 click</span>
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleSubscribe(checkoutPlan)}
                  className="w-full btn-3d-emerald text-xs font-black py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating Plan...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Complete Enrollment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
