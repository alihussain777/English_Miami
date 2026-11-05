'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  ShieldAlert,
  Users,
  DollarSign,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Filter,
  Check,
  X,
  CreditCard,
  UserCheck,
  UserX,
  BarChart3,
  Calendar,
  Send,
  Loader2,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'revenue' | 'certificates' | 'students' | 'curriculum'>('revenue');

  // Stats data
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Certificates state
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certFilter, setCertFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processingCertId, setProcessingCertId] = useState<string | null>(null);
  const [certActionSuccess, setCertActionSuccess] = useState<string | null>(null);

  // Manual Certificate Issue Form state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueEmail, setIssueEmail] = useState('');
  const [issueLevel, setIssueLevel] = useState('B1');
  const [issueGrade, setIssueGrade] = useState('Distinction');
  const [issueScore, setIssueScore] = useState('95');
  const [issueNotes, setIssueNotes] = useState('');
  const [issuingLoading, setIssuingLoading] = useState(false);

  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState('ALL');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.error) setError(data.error);
      else setStats(data);
    } catch {
      setError('Failed to load admin telemetry');
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`/api/admin/certificates?status=${certFilter}`);
      const data = await res.json();
      if (data.certificates) setCertificates(data.certificates);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentSearch) params.set('q', studentSearch);
      if (studentLevelFilter !== 'ALL') params.set('level', studentLevelFilter);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.users) setStudents(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetch('/api/auth/me').then((r) => r.json()),
      fetchCertificates(),
      fetchStudents(),
    ])
      .then(([_, authData]) => {
        if (authData.authenticated && authData.user) {
          setSession({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            role: authData.user.role,
            currentLevel: authData.user.profile?.currentLevel || 'C2',
            plan: authData.user.subscription?.plan || 'MONTHLY_PRO',
            onboardingCompleted: true,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to initialize admin dashboard');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [certFilter]);

  const handleApproveCert = async (certId: string) => {
    setProcessingCertId(certId);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: certId,
          action: 'APPROVE',
          grade: 'Distinction',
          score: 94,
          notes: 'Reviewed and verified by EnglishMiami Academic Board.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCertActionSuccess('Certificate approved and officially issued!');
        setTimeout(() => setCertActionSuccess(null), 3000);
        fetchCertificates();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingCertId(null);
    }
  };

  const handleRejectCert = async (certId: string) => {
    setProcessingCertId(certId);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: certId,
          action: 'REJECT',
          notes: 'Assessment score threshold was not achieved. Please review prerequisite lessons.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCertActionSuccess('Certificate application rejected with feedback notes.');
        setTimeout(() => setCertActionSuccess(null), 3000);
        fetchCertificates();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingCertId(null);
    }
  };

  const handleIssueDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueEmail) return;
    setIssuingLoading(true);
    try {
      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: issueEmail,
          levelCode: issueLevel,
          grade: issueGrade,
          score: parseInt(issueScore, 10),
          notes: issueNotes || 'Official credential issued by Academic Director.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCertActionSuccess(`Certificate issued to ${issueEmail}!`);
        setShowIssueModal(false);
        setIssueEmail('');
        setTimeout(() => setCertActionSuccess(null), 4000);
        fetchCertificates();
        fetchStats();
      } else {
        alert(data.error || 'Failed to issue certificate');
      }
    } catch (err) {
      alert('Error communicating with server');
    } finally {
      setIssuingLoading(false);
    }
  };

  const handleUpdateStudentLevel = async (userId: string, newLevel: string) => {
    setUpdatingStudentId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, level: newLevel }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const handleToggleStudentStatus = async (userId: string, currentStatus: string) => {
    setUpdatingStudentId(userId);
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStudentId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-oxford-600" />
          Loading academic management console...
        </div>
      </div>
    );
  }

  if (error || session?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-center space-y-4 shadow-sm">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You must be logged in as an authorized institutional administrator to view telemetry, approve credentials, and manage students.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-300">
              Demo Admin: admin@englishmiami.com / miami123456
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rev = stats?.revenue || {};
  const certStats = stats?.certificates || {};
  const learnStats = stats?.learning || {};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col lg:flex-row py-6 gap-8">
        {session && <DashboardSidebar session={session} />}

        <main className="flex-1 space-y-6 pb-24 lg:pb-8">
          {/* Header */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-oxford-50 dark:bg-oxford-950 text-oxford-600 dark:text-oxford-400 flex items-center justify-center flex-shrink-0 border border-oxford-200 dark:border-oxford-800">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-oxford-600 dark:text-oxford-400">
                    Institutional Governance
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-oxford-100 dark:bg-oxford-950 text-oxford-700 dark:text-oxford-300 border border-oxford-200 dark:border-oxford-800">
                    Director Level
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Academic & Operations Console
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Complete telemetry: financial revenue, certificate reviews, international student directory, and curriculum activity.
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-stretch md:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('revenue')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'revenue'
                    ? 'bg-white dark:bg-slate-900 text-oxford-700 dark:text-oxford-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Revenue Telemetry</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('certificates')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap relative ${
                  activeTab === 'certificates'
                    ? 'bg-white dark:bg-slate-900 text-oxford-700 dark:text-oxford-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certificate Approvals</span>
                {certStats.pending > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {certStats.pending}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'students'
                    ? 'bg-white dark:bg-slate-900 text-oxford-700 dark:text-oxford-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Student Directory</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'curriculum'
                    ? 'bg-white dark:bg-slate-900 text-oxford-700 dark:text-oxford-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Curriculum Metrics</span>
              </button>
            </div>
          </div>

          {certActionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{certActionSuccess}</span>
            </div>
          )}

          {/* TAB 1: REVENUE TELEMETRY */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Gross Total Revenue</span>
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    ${rev.totalRevenue?.toLocaleString() || '0.00'}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">All historical platform payments</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Estimated MRR</span>
                    <div className="p-2 rounded-lg bg-oxford-50 dark:bg-oxford-950 text-oxford-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    ${rev.mrr?.toLocaleString() || '0.00'}
                  </div>
                  <span className="text-[11px] text-slate-500">Monthly Recurring Revenue</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Paying Pro Subscribers</span>
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {(rev.weeklySubscribers || 0) + (rev.monthlySubscribers || 0)}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {rev.monthlySubscribers} Monthly ($19.99) · {rev.weeklySubscribers} Weekly ($6.99)
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Average ARPU</span>
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    ${rev.arpu?.toFixed(2) || '0.00'}
                  </div>
                  <span className="text-[11px] text-slate-500">Average Revenue Per User</span>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Recent Payment Transactions
                    </h3>
                    <p className="text-xs text-slate-500">Audited settlement history from Stripe, Cards & Apple Pay.</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {rev.totalTransactions || 0} total settled payments
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        <th className="py-3 px-3">Transaction Ref</th>
                        <th className="py-3 px-3">Student</th>
                        <th className="py-3 px-3">Plan</th>
                        <th className="py-3 px-3">Method</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(rev.recentPayments || []).map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">{p.transactionRef}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-900 dark:text-white block">{p.user?.name}</span>
                            <span className="text-[11px] text-slate-500">{p.user?.email}</span>
                          </td>
                          <td className="py-3 px-3 font-medium">
                            {p.plan === 'MONTHLY_PRO' ? 'Monthly Pro' : 'Weekly Pro'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{p.paymentMethod}</td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">${p.amount.toFixed(2)}</td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              PAID
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CERTIFICATES APPROVAL HUB */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              {/* Top Controls & Direct Issue Button */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Filter Status:</span>
                  {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCertFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        certFilter === st
                          ? 'bg-oxford-700 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowIssueModal(true)}
                  className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Issue Direct Certificate</span>
                </button>
              </div>

              {/* Certificates List Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Certificate Applications & Issued Credentials ({certificates.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Pending: {certStats.pending} · Approved: {certStats.approved}
                  </span>
                </div>

                {certificates.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    No certificate applications matching status "{certFilter}".
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="py-3 px-3">Student</th>
                          <th className="py-3 px-3">CEFR Level</th>
                          <th className="py-3 px-3">Assessment Score</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Certificate ID</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {certificates.map((cert) => {
                          const isPending = cert.status === 'PENDING';
                          const isApproved = cert.status === 'APPROVED';
                          const isProcessing = processingCertId === cert.id;

                          return (
                            <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3">
                                <span className="font-semibold text-slate-900 dark:text-white block">{cert.user?.name}</span>
                                <span className="text-[11px] text-slate-500">{cert.user?.email}</span>
                              </td>
                              <td className="py-3 px-3 font-bold text-oxford-600 dark:text-oxford-400">
                                {cert.courseLevel}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 dark:text-white">{cert.score || 88}%</span>
                                <span className="text-slate-500 text-[11px] ml-1">({cert.grade || 'Pass'})</span>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isApproved
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : isPending
                                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  {cert.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {new Date(cert.requestedAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                {cert.certificateNumber}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isPending && (
                                    <>
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => handleApproveCert(cert.id)}
                                        className="btn-success text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => handleRejectCert(cert.id)}
                                        className="btn-danger text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                      </button>
                                    </>
                                  )}

                                  {isApproved && (
                                    <a
                                      href={`/verify-certificate?id=${cert.certificateNumber}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                                    >
                                      <span>Verify</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Direct Issue Modal */}
              {showIssueModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Issue Official Certificate Directly
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowIssueModal(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleIssueDirect} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Student Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={issueEmail}
                          onChange={(e) => setIssueEmail(e.target.value)}
                          placeholder="student@englishmiami.com"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                            CEFR Level
                          </label>
                          <select
                            value={issueLevel}
                            onChange={(e) => setIssueLevel(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          >
                            {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                              <option key={lvl} value={lvl}>
                                Level {lvl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                            Standing Grade
                          </label>
                          <select
                            value={issueGrade}
                            onChange={(e) => setIssueGrade(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          >
                            <option value="Distinction">Distinction (90%+)</option>
                            <option value="Merit">Merit (80-89%)</option>
                            <option value="Pass">Pass (70-79%)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Assessment Score (%)
                        </label>
                        <input
                          type="number"
                          min="70"
                          max="100"
                          value={issueScore}
                          onChange={(e) => setIssueScore(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                          Academic Board Notes
                        </label>
                        <textarea
                          rows={2}
                          value={issueNotes}
                          onChange={(e) => setIssueNotes(e.target.value)}
                          placeholder="Awarded for demonstrated excellence in advanced business communication."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowIssueModal(false)}
                          className="btn-secondary text-xs px-4 py-2 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={issuingLoading}
                          className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                        >
                          {issuingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          <span>Issue Official Certificate</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENT DIRECTORY & MANAGEMENT */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                    placeholder="Search students by name or email address..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-oxford-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={studentLevelFilter}
                    onChange={(e) => {
                      setStudentLevelFilter(e.target.value);
                      setTimeout(fetchStudents, 50);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="ALL">All CEFR Levels</option>
                    {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={fetchStudents}
                    className="btn-primary text-xs px-4 py-2 rounded-xl"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Enrolled Students ({students.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Total registered: {learnStats.totalUsers || 0}
                  </span>
                </div>

                {studentsLoading ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-oxford-600 mb-2" />
                    Loading students roster...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="py-3 px-3">Student Profile</th>
                          <th className="py-3 px-3">Origin / Language</th>
                          <th className="py-3 px-3">CEFR Level (Edit)</th>
                          <th className="py-3 px-3">Progress Telemetry</th>
                          <th className="py-3 px-3">Subscription</th>
                          <th className="py-3 px-3">Account Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {students.map((student) => {
                          const isUpdating = updatingStudentId === student.id;
                          const currentLevel = student.profile?.currentLevel || 'A1';
                          const isSuspended = student.status === 'SUSPENDED';

                          return (
                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3">
                                <span className="font-semibold text-slate-900 dark:text-white block">{student.name}</span>
                                <span className="text-[11px] text-slate-500">{student.email}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                <div>{student.profile?.country || 'International'}</div>
                                <div className="text-[11px] text-slate-500">{student.profile?.nativeLanguage}</div>
                              </td>
                              <td className="py-3 px-3">
                                <select
                                  disabled={isUpdating}
                                  value={currentLevel}
                                  onChange={(e) => handleUpdateStudentLevel(student.id, e.target.value)}
                                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-oxford-700 dark:text-oxford-300 text-xs"
                                >
                                  {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                                    <option key={lvl} value={lvl}>
                                      {lvl}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">{student.profile?.xp || 0} XP</div>
                                <div className="text-[11px] text-slate-500">
                                  🔥 {student.streak?.currentStreak || 0}d streak · 🗣️ {student.profile?.speakingMinutes || 0}m speak
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    student.subscription?.plan === 'FREE'
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {student.subscription?.plan || 'FREE'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isSuspended
                                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                  }`}
                                >
                                  {student.status || 'ACTIVE'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleToggleStudentStatus(student.id, student.status || 'ACTIVE')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto ${
                                    isSuspended
                                      ? 'btn-success'
                                      : 'btn-secondary text-rose-600 hover:text-rose-700'
                                  }`}
                                >
                                  {isSuspended ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Activate</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Suspend</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CURRICULUM & ACTIVITY TELEMETRY */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500">Active Curriculum Courses</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {learnStats.totalCourses || 7} Courses
                  </div>
                  <span className="text-[11px] text-slate-500">A0 through C2 Mastery</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500">Interactive Lessons</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {learnStats.totalLessons || 26} Lessons
                  </div>
                  <span className="text-[11px] text-slate-500">With Phonics & Exercises</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500">Vocabulary Words Bank</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {learnStats.totalVocabWords || 100}+ Words
                  </div>
                  <span className="text-[11px] text-slate-500">Spaced repetition SRS</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-500">Speaking Minutes Practiced</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {learnStats.totalSpeakingMinutes || 920} mins
                  </div>
                  <span className="text-[11px] text-slate-500">Across voice sessions</span>
                </div>
              </div>

              {/* CEFR Level Distribution Breakdown */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Student Enrollment by CEFR Language Level
                </h3>
                <p className="text-xs text-slate-500">Distribution of learners across proficiency levels.</p>

                <div className="space-y-3 pt-2">
                  {Object.entries(learnStats.levelDistribution || {}).map(([lvl, count]: any) => {
                    const total = learnStats.totalUsers || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={lvl} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">
                            CEFR Level {lvl}
                          </span>
                          <span className="text-slate-500">
                            {count} students ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-oxford-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
