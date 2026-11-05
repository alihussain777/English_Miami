'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Award,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfareSound } from '@/lib/audio-feedback';
import { UserSession } from '@/types';

export default function CertificatesPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activeCertModal, setActiveCertModal] = useState<any>(null);
  const [generatingLevel, setGeneratingLevel] = useState('B1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/certificates').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ])
      .then(([certData, authData]) => {
        if (certData.certificates) setCertificates(certData.certificates);
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

  const handleApplyForCertificate = async () => {
    setIsGenerating(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelCode: generatingLevel, score: 88 }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.certificate) {
        setCertificates((prev) => [data.certificate, ...prev]);
        setFeedbackMsg({
          type: 'success',
          text: 'Certificate application submitted successfully! Our Academic Board will review and approve it shortly.'
        });
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        playFanfareSound();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: data.error || 'Failed to submit certificate request.'
        });
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: 'Network communication error.'
      });
    } finally {
      setIsGenerating(false);
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
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                  Accredited Language Milestones
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Official CEFR Certificates
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Verifiable academic credentials certifying English language competence reviewed by our Academic Board.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={generatingLevel}
                onChange={(e) => setGeneratingLevel(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleApplyForCertificate}
                className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                <span>Apply for Certificate</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-800 dark:text-rose-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Certificate Cards Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              My Credentials Registry ({certificates.length})
            </h3>

            {certificates.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No certificate applications found yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete lessons and tests for your level, then click "Apply for Certificate" above to submit your credentials to the Academic Board.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => {
                  const isApproved = cert.status === 'APPROVED';
                  const isPending = cert.status === 'PENDING';

                  return (
                    <div
                      key={cert.id}
                      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : isPending
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isApproved ? 'OFFICIALLY APPROVED' : isPending ? 'PENDING FACULTY REVIEW' : 'REVISED'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {cert.certificateNumber}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {cert.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {cert.courseLevel} • Standing: <strong>{cert.grade || 'Merit'}</strong> ({cert.score || 88}%)
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">
                          {cert.issueDate ? `Issued: ${new Date(cert.issueDate).toLocaleDateString()}` : `Requested: ${new Date(cert.requestedAt).toLocaleDateString()}`}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveCertModal(cert)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            View Diploma
                          </button>
                          {isApproved && (
                            <a
                              href={`/verify-certificate?id=${cert.certificateNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-primary px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                            >
                              <span>Verify</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Certificate Modal */}
          {activeCertModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-2xl w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
                <div className="border-4 border-double border-oxford-800 dark:border-oxford-600 p-8 rounded-xl space-y-4">
                  <div className="inline-flex p-3 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-oxford-700 dark:text-oxford-400 block">
                      EnglishMiami Academic Examination Board
                    </span>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mt-1">
                      Certificate of Language Competence
                    </h2>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    This credential formally certifies that
                  </p>

                  <div className="text-xl font-bold text-slate-900 dark:text-white underline decoration-oxford-500 underline-offset-4">
                    {session?.name || 'Sofia Rodriguez'}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    has successfully demonstrated communicative and grammatical competence in the English language in accordance with CEFR standards at:
                  </p>

                  <div className="text-lg font-bold text-oxford-700 dark:text-oxford-400">
                    {activeCertModal.courseLevel} ({activeCertModal.grade || 'Distinction'})
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Registry ID: {activeCertModal.certificateNumber}</span>
                    <span>Status: {activeCertModal.status}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCertModal(null)}
                    className="btn-secondary text-xs px-4 py-2 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
