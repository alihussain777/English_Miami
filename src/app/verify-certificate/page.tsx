'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Clock
} from 'lucide-react';

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [certId, setCertId] = useState(initialId);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/certificates?id=${encodeURIComponent(idToVerify.trim())}`);
      const data = await res.json();
      if (data.verified && data.certificate) {
        setResult(data.certificate);
      } else if (data.certificate && data.certificate.status === 'PENDING') {
        setError('This certificate request has been submitted and is currently PENDING review by the Academic Board.');
        setResult(null);
      } else {
        setError('No verified certificate matching this identifier was found in our registry.');
        setResult(null);
      }
    } catch (err) {
      setError('Failed to query certificate verification service.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      verify(initialId);
    }
  }, [initialId]);

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 mb-2 border border-oxford-200 dark:border-oxford-800">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Certificate Verification Registry
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Verify the authenticity of an official EnglishMiami CEFR Language Competence Certificate registered with our Academic Board.
        </p>
      </div>

      {/* Search input */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(certId);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. MIA-2026-B1-ABC123)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-oxford-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs px-6 py-3 rounded-xl"
          >
            {loading ? 'Verifying...' : 'Verify Credential'}
          </button>
        </form>
      </div>

      {/* Verification Result */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm font-medium flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
              Official Credential Verified
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {result.title}
            </h2>
          </div>

          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Recipient Name</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{result.userName}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">CEFR Level & Standing</span>
              <span className="font-bold text-sm text-oxford-600 dark:text-oxford-400">
                {result.courseLevel} ({result.grade || 'Distinction'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Certificate Identifier</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{result.certificateNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Date of Official Issuance</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {result.issueDate ? new Date(result.issueDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Verified'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            This credential is secure, cryptographically validated, and officially authenticated by the EnglishMiami Academic Examination Board.
          </p>
        </div>
      )}
    </main>
  );
}

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center text-xs text-slate-400">Loading verification registry...</div>}>
        <VerifyCertificateContent />
      </Suspense>
      <Footer />
    </div>
  );
}
