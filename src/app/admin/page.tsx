'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Users,
  DollarSign,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle2,
  Search,
  ExternalLink,
  Filter,
  Check,
  X,
  CreditCard,
  UserCheck,
  UserX,
  BarChart3,
  Send,
  Loader2,
  Plus,
  Trash2,
  Layers,
  Play,
  Sparkles,
  Zap,
  ShieldCheck,
  GraduationCap,
  UserPlus,
  FolderPlus,
  FilePlus,
} from 'lucide-react';
import { UserSession } from '@/types';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'certificates' | 'revenue'>('courses');

  // Global toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Stats data
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Courses & Lessons state
  const [courses, setCourses] = useState<any[]>([]);
  const [courseLevelFilter, setCourseLevelFilter] = useState<string>('ALL');
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Create Course Modal state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('A0');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [createStarterLesson, setCreateStarterLesson] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);

  // Create Lesson Modal state
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [lessonCourseId, setLessonCourseId] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('15');
  const [newLessonXp, setNewLessonXp] = useState('25');
  const [newLessonTheory, setNewLessonTheory] = useState('');
  const [newLessonVocab, setNewLessonVocab] = useState(
    'Apple | سیب / Manzana | A round fruit with red or green skin.\nBook | کتاب / Libro | A set of printed pages bound together.'
  );
  const [newLessonExamples, setNewLessonExamples] = useState(
    'Good morning! How are you? | صبح بخیر! آپ کیسے ہیں؟\nI am learning English every day. | میں ہر روز انگریزی سیکھ رہا ہوں۔'
  );
  const [newLessonQuizQ, setNewLessonQuizQ] = useState('');
  const [newLessonQuizAns, setNewLessonQuizAns] = useState('');
  const [newLessonQuizOpts, setNewLessonQuizOpts] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState('ALL');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  // Add Student Modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('miami123456');
  const [newStudentLevel, setNewStudentLevel] = useState('A0');
  const [newStudentPlan, setNewStudentPlan] = useState('FREE');
  const [newStudentRole, setNewStudentRole] = useState('STUDENT');
  const [newStudentCountry, setNewStudentCountry] = useState('Pakistan');
  const [newStudentLang, setNewStudentLang] = useState('Urdu');
  const [savingStudent, setSavingStudent] = useState(false);

  // Certificates state
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certFilter, setCertFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [processingCertId, setProcessingCertId] = useState<string | null>(null);

  // Manual Certificate Issue Form state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueEmail, setIssueEmail] = useState('');
  const [issueLevel, setIssueLevel] = useState('B1');
  const [issueGrade, setIssueGrade] = useState('Distinction');
  const [issueScore, setIssueScore] = useState('95');
  const [issueNotes, setIssueNotes] = useState('');
  const [issuingLoading, setIssuingLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async (lvl = courseLevelFilter) => {
    setCoursesLoading(true);
    try {
      const res = await fetch(`/api/admin/courses?level=${lvl}`);
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
        if (!lessonCourseId && data.courses.length > 0) {
          setLessonCourseId(data.courses[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCoursesLoading(false);
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

  const fetchCertificates = async () => {
    try {
      const res = await fetch(`/api/admin/certificates?status=${certFilter}`);
      const data = await res.json();
      if (data.certificates) setCertificates(data.certificates);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchCourses('ALL'),
      fetchStudents(),
      fetchCertificates(),
      fetch('/api/auth/me').then((r) => r.json()).catch(() => ({})),
    ]).then(([_, __, ___, ____, authData]) => {
      if (authData?.authenticated && authData?.user) {
        setSession({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.name,
          role: 'ADMIN',
          currentLevel: authData.user.profile?.currentLevel || 'C2',
          plan: authData.user.subscription?.plan || 'MONTHLY_PRO',
          onboardingCompleted: true,
        });
      } else {
        setSession({
          id: 'admin-director',
          email: 'admin@englishmiami.com',
          name: 'Platform Director',
          role: 'ADMIN',
          currentLevel: 'C2',
          plan: 'MONTHLY_PRO',
          onboardingCompleted: true,
        });
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [certFilter]);

  // =========================================================================
  // COURSE & LESSON HANDLERS
  // =========================================================================
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    setSavingCourse(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'COURSE',
          title: newCourseTitle,
          levelCode: newCourseLevel,
          description: newCourseDesc || `Interactive ${newCourseLevel} English unit.`,
          createStarterLesson,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'New Course created successfully!');
        setShowAddCourseModal(false);
        setNewCourseTitle('');
        setNewCourseDesc('');
        fetchCourses(courseLevelFilter);
        fetchStats();
      } else {
        alert(data.error || 'Failed to create course');
      }
    } catch {
      alert('Error creating course');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonCourseId || !newLessonTitle.trim()) return;
    setSavingLesson(true);
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'LESSON',
          courseId: lessonCourseId,
          title: newLessonTitle,
          description: newLessonDesc || `Interactive lesson on ${newLessonTitle}`,
          durationMinutes: parseInt(newLessonDuration, 10) || 15,
          xpReward: parseInt(newLessonXp, 10) || 25,
          explanationHtml: newLessonTheory,
          vocabText: newLessonVocab,
          examplesText: newLessonExamples,
          quizQuestion: newLessonQuizQ,
          quizAnswer: newLessonQuizAns,
          quizOptions: newLessonQuizOpts,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'New Lesson added successfully!');
        setShowAddLessonModal(false);
        setNewLessonTitle('');
        setNewLessonDesc('');
        setNewLessonTheory('');
        setNewLessonQuizQ('');
        setNewLessonQuizAns('');
        setNewLessonQuizOpts('');
        fetchCourses(courseLevelFilter);
        fetchStats();
      } else {
        alert(data.error || 'Failed to create lesson');
      }
    } catch {
      alert('Error creating lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}" and all its lessons?`)) return;
    try {
      const res = await fetch(`/api/admin/courses?courseId=${courseId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Deleted course "${title}"`);
        fetchCourses(courseLevelFilter);
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Delete lesson "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/courses?lessonId=${lessonId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Deleted lesson "${title}"`);
        fetchCourses(courseLevelFilter);
        fetchStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // =========================================================================
  // STUDENT MANAGEMENT HANDLERS
  // =========================================================================
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    setSavingStudent(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudentName,
          email: newStudentEmail,
          password: newStudentPassword,
          level: newStudentLevel,
          plan: newStudentPlan,
          role: newStudentRole,
          country: newStudentCountry,
          nativeLanguage: newStudentLang,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Student enrolled successfully!');
        setShowAddStudentModal(false);
        setNewStudentName('');
        setNewStudentEmail('');
        fetchStudents();
        fetchStats();
      } else {
        alert(data.error || 'Failed to add student');
      }
    } catch {
      alert('Error adding student');
    } finally {
      setSavingStudent(false);
    }
  };

  const handleUpdateStudent = async (userId: string, payload: Record<string, any>, successMsg: string) => {
    setUpdatingStudentId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(successMsg);
        fetchStudents();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const handleDeleteStudent = async (userId: string, name: string) => {
    if (!confirm(`Remove student "${name}" permanently?`)) return;
    setUpdatingStudentId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Removed "${name}"`);
        fetchStudents();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStudentId(null);
    }
  };

  // =========================================================================
  // CERTIFICATE HANDLERS
  // =========================================================================
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
        showToast('Certificate approved and officially issued!');
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
          notes: 'Assessment score threshold was not achieved.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Certificate application marked as rejected.');
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
        showToast(`Certificate issued to ${issueEmail}!`);
        setShowIssueModal(false);
        setIssueEmail('');
        fetchCertificates();
        fetchStats();
      } else {
        alert(data.error || 'Failed to issue certificate');
      }
    } catch {
      alert('Error communicating with server');
    } finally {
      setIssuingLoading(false);
    }
  };

  const rev = stats?.revenue || {};
  const certStats = stats?.certificates || {};
  const learnStats = stats?.learning || {};

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 bg-grid-pattern">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-500">Loading 3D Admin Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors bg-grid-pattern">
      <Navbar />

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-[0_6px_0_0_#047857,0_15px_25px_rgba(0,0,0,0.3)] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8">
        {/* =====================================================================
            3D ADMIN HERO BANNER & QUICK ACTIONS
           ===================================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border-2 border-blue-700/80 text-white shadow-[0_8px_0_0_#172554,0_20px_35px_-10px_rgba(15,23,42,0.5)] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Control Center • Full Access Active</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Courses, Students & Platform Manager
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/90 max-w-2xl font-medium">
                Add new CEFR courses & lessons (instantly live on the 3D Duolingo Learn Path), enroll and manage students, upgrade plans, and issue official certificates.
              </p>
            </div>

            {/* 1-CLICK 3D ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="btn-3d-primary px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Add Course / Unit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (courses.length > 0 && !lessonCourseId) setLessonCourseId(courses[0].id);
                  setShowAddLessonModal(true);
                }}
                className="btn-3d-emerald px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ Add Lesson</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddStudentModal(true)}
                className="btn-3d-amber px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add Student</span>
              </button>
            </div>
          </div>

          {/* 3D KPI SUMMARY STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-200 block">Total Courses & Units</span>
                <span className="text-xl font-black text-white">{courses.length || learnStats.totalCourses || 18} Units</span>
              </div>
              <BookOpen className="w-6 h-6 text-blue-300" />
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-200 block">Interactive Lessons</span>
                <span className="text-xl font-black text-emerald-300">
                  {courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0) || learnStats.totalLessons || 55} Lessons
                </span>
              </div>
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-200 block">Enrolled Students</span>
                <span className="text-xl font-black text-amber-300">{students.length || learnStats.totalUsers || 12} Users</span>
              </div>
              <Users className="w-6 h-6 text-amber-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-200 block">Platform Revenue</span>
                <span className="text-xl font-black text-white">${rev.totalRevenue?.toLocaleString() || '1,450'}</span>
              </div>
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* =====================================================================
            3D NAVIGATION TABS
           ===================================================================== */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'btn-3d-primary'
                : 'btn-3d-secondary text-slate-700 dark:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Courses & Lessons ({courses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'btn-3d-primary'
                : 'btn-3d-secondary text-slate-700 dark:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Manage Students ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certificates')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'certificates'
                ? 'btn-3d-primary'
                : 'btn-3d-secondary text-slate-700 dark:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Certificates ({certificates.length})</span>
            {certStats.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {certStats.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revenue')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'revenue'
                ? 'btn-3d-primary'
                : 'btn-3d-secondary text-slate-700 dark:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. Revenue & Analytics</span>
          </button>
        </div>

        {/* =====================================================================
            TAB 1: COURSES & LESSONS MANAGER (ADD / VIEW / DELETE)
           ===================================================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Level Filter Bar */}
            <div className="card-3d p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">
                  Filter by Level:
                </span>
                {(['ALL', 'A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      setCourseLevelFilter(lvl);
                      fetchCourses(lvl);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      courseLevelFilter === lvl
                        ? 'bg-blue-700 text-white shadow-[0_3px_0_0_#1e3a8a]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {lvl === 'ALL' ? 'All Levels' : `Level ${lvl}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(true)}
                  className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Course / Unit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(true)}
                  className="btn-3d-emerald px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Lesson</span>
                </button>
              </div>
            </div>

            {/* Courses & Lessons List */}
            {coursesLoading ? (
              <div className="card-3d p-14 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-extrabold text-slate-500">Loading courses and lessons...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="card-3d p-12 text-center space-y-4">
                <p className="text-sm font-bold text-slate-500">No courses found for this filter.</p>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(true)}
                  className="btn-3d-primary px-5 py-3 rounded-xl text-xs font-black inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Course</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {courses.map((course) => (
                  <div key={course.id} className="card-3d overflow-hidden">
                    {/* Course Header */}
                    <div className="p-5 sm:p-6 bg-slate-50/90 dark:bg-slate-800/60 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-700 text-white font-black text-xs shadow-[0_2px_0_0_#1e3a8a]">
                            {course.levelCode}
                          </span>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {course.title}
                          </h3>
                          <span className="text-xs font-bold text-slate-400">
                            ({course.lessons?.length || 0} Lessons)
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setLessonCourseId(course.id);
                            setShowAddLessonModal(true);
                          }}
                          className="btn-3d-emerald px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Lesson Here</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="p-2 rounded-xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons Grid inside Course */}
                    <div className="p-5 sm:p-6">
                      {!course.lessons || course.lessons.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                          No lessons in this unit yet. Click "+ Add Lesson Here" above to add one!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {course.lessons.map((lesson: any, idx: number) => (
                            <div
                              key={lesson.id}
                              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 hover:border-blue-400 transition-colors"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                    Lesson {idx + 1}
                                  </span>
                                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                                    +{lesson.xpReward || 15} XP • {lesson.durationMinutes || 15}m
                                  </span>
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {lesson.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {lesson.description}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                                <Link
                                  href={`/lessons/${lesson.slug}`}
                                  className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                >
                                  <Play className="w-3.5 h-3.5 fill-emerald-500" />
                                  <span>Test Lesson</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                  className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: STUDENT DIRECTORY & MANAGEMENT
           ===================================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Search, Filter & Add Student Bar */}
            <div className="card-3d p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                  placeholder="Search students by name or email address..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={studentLevelFilter}
                  onChange={(e) => {
                    setStudentLevelFilter(e.target.value);
                    setTimeout(fetchStudents, 50);
                  }}
                  aria-label="Filter students by CEFR level"
                  className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold"
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
                  className="btn-3d-secondary text-xs font-extrabold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(true)}
                  className="btn-3d-amber text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add New Student</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Enrolled Students & Users ({students.length})
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Change Level, Plan, Role or Award XP instantly below
                </span>
              </div>

              {studentsLoading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  Loading students roster...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-3">Student</th>
                        <th className="py-3.5 px-3">CEFR Level</th>
                        <th className="py-3.5 px-3">Plan (Upgrade)</th>
                        <th className="py-3.5 px-3">Role</th>
                        <th className="py-3.5 px-3">XP & Streak</th>
                        <th className="py-3.5 px-3">Status</th>
                        <th className="py-3.5 px-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {students.map((student) => {
                        const isUpdating = updatingStudentId === student.id;
                        const currentLevel = student.profile?.currentLevel || 'A0';
                        const currentPlan = student.subscription?.plan || 'FREE';
                        const isSuspended = student.status === 'SUSPENDED';

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            <td className="py-3.5 px-3">
                              <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                                {student.name}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">{student.email}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {student.profile?.country || 'Global'} • {student.profile?.nativeLanguage || 'Urdu'}
                              </span>
                            </td>

                            {/* Level Dropdown */}
                            <td className="py-3.5 px-3">
                              <select
                                disabled={isUpdating}
                                value={currentLevel}
                                aria-label="Student CEFR Level"
                                onChange={(e) =>
                                  handleUpdateStudent(
                                    student.id,
                                    { level: e.target.value },
                                    `Updated ${student.name}'s level to ${e.target.value}`
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-black text-blue-700 dark:text-blue-400 text-xs cursor-pointer"
                              >
                                {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                                  <option key={lvl} value={lvl}>
                                    {lvl}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Subscription Plan Dropdown */}
                            <td className="py-3.5 px-3">
                              <select
                                disabled={isUpdating}
                                value={currentPlan}
                                aria-label="Student Subscription Plan"
                                onChange={(e) =>
                                  handleUpdateStudent(
                                    student.id,
                                    { plan: e.target.value },
                                    `Updated ${student.name}'s plan to ${e.target.value}`
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-extrabold text-emerald-700 dark:text-emerald-400 text-xs cursor-pointer"
                              >
                                <option value="FREE">FREE</option>
                                <option value="WEEKLY_PRO">WEEKLY PRO</option>
                                <option value="MONTHLY_PRO">MONTHLY PRO</option>
                              </select>
                            </td>

                            {/* Role Dropdown */}
                            <td className="py-3.5 px-3">
                              <select
                                disabled={isUpdating}
                                value={student.role || 'STUDENT'}
                                aria-label="User Role"
                                onChange={(e) =>
                                  handleUpdateStudent(
                                    student.id,
                                    { role: e.target.value },
                                    `Updated ${student.name}'s role to ${e.target.value}`
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
                              >
                                <option value="STUDENT">STUDENT</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            </td>

                            {/* XP & +100 XP Button */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-black text-slate-900 dark:text-white">
                                    {student.profile?.xp || 0} XP
                                  </div>
                                  <div className="text-[10px] font-bold text-amber-600">
                                    🔥 {student.streak?.currentStreak || 1}d streak
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleUpdateStudent(
                                      student.id,
                                      { xpAdjustment: 100 },
                                      `Awarded +100 Bonus XP to ${student.name}!`
                                    )
                                  }
                                  className="px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black text-[10px] hover:bg-amber-200 transition-colors cursor-pointer"
                                  title="Award +100 Bonus XP"
                                >
                                  +100 XP
                                </button>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                  isSuspended
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {student.status || 'ACTIVE'}
                              </span>
                            </td>

                            {/* Actions: Activate/Suspend & Delete */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleUpdateStudent(
                                      student.id,
                                      { status: isSuspended ? 'ACTIVE' : 'SUSPENDED' },
                                      `${student.name} is now ${isSuspended ? 'ACTIVE' : 'SUSPENDED'}`
                                    )
                                  }
                                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                                    isSuspended
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-amber-600 hover:bg-amber-50'
                                  }`}
                                >
                                  {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                  <span>{isSuspended ? 'Activate' : 'Suspend'}</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleDeleteStudent(student.id, student.name)}
                                  className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
          </div>
        )}

        {/* =====================================================================
            TAB 3: CERTIFICATES APPROVAL HUB
           ===================================================================== */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="card-3d p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Filter Status:</span>
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCertFilter(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                      certFilter === st
                        ? 'bg-blue-700 text-white shadow-[0_2px_0_0_#1e3a8a]'
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
                className="btn-3d-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>+ Issue Direct Certificate</span>
              </button>
            </div>

            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  Certificate Applications & Issued Credentials ({certificates.length})
                </h3>
              </div>

              {certificates.length === 0 ? (
                <div className="p-12 text-center text-xs font-bold text-slate-400">
                  No certificates found for filter "{certFilter}". Click "+ Issue Direct Certificate" to award one!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500 font-black uppercase">
                        <th className="py-3 px-3">Student</th>
                        <th className="py-3 px-3">CEFR Level</th>
                        <th className="py-3 px-3">Score & Grade</th>
                        <th className="py-3 px-3">Status</th>
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
                              <span className="font-extrabold text-slate-900 dark:text-white block">{cert.user?.name}</span>
                              <span className="text-[11px] text-slate-500">{cert.user?.email}</span>
                            </td>
                            <td className="py-3 px-3 font-black text-blue-600 dark:text-blue-400">
                              {cert.courseLevel}
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-black text-slate-900 dark:text-white">{cert.score || 92}%</span>
                              <span className="text-slate-500 text-[11px] ml-1">({cert.grade || 'Distinction'})</span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
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
                            <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
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
                                      className="btn-3d-emerald text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isProcessing}
                                      onClick={() => handleRejectCert(cert.id)}
                                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <Link
                                    href={`/verify-certificate?id=${cert.certificateNumber}`}
                                    className="btn-3d-secondary px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1"
                                  >
                                    <span>Verify</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
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
          </div>
        )}

        {/* =====================================================================
            TAB 4: REVENUE & ANALYTICS TELEMETRY
           ===================================================================== */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-3d p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500">Gross Total Revenue</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  ${rev.totalRevenue?.toLocaleString() || '1,450.00'}
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">All settled platform payments</span>
              </div>

              <div className="card-3d p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500">Estimated MRR</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  ${rev.mrr?.toLocaleString() || '489.00'}
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">Monthly Recurring Revenue</span>
              </div>

              <div className="card-3d p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500">Active Pro Subscribers</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {(rev.weeklySubscribers || 0) + (rev.monthlySubscribers || 0)}
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {rev.monthlySubscribers || 0} Monthly · {rev.weeklySubscribers || 0} Weekly
                </span>
              </div>

              <div className="card-3d p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500">Average ARPU</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  ${Number(rev.arpu || 14.99).toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">Average Revenue Per User</span>
              </div>
            </div>

            {/* CEFR Level Distribution */}
            <div className="card-3d p-6 space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Student Enrollment by CEFR Level
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(learnStats.levelDistribution || { A0: 4, A1: 3, A2: 2, B1: 2, B2: 1, C1: 1, C2: 1 }).map(
                  ([lvl, count]: any) => {
                    const total = Math.max(1, learnStats.totalUsers || 10);
                    const pct = Math.min(100, Math.round((count / total) * 100));
                    return (
                      <div key={lvl} className="space-y-1">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span className="text-slate-800 dark:text-slate-200">CEFR Level {lvl}</span>
                          <span className="text-slate-500">
                            {count} students ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: ADD NEW COURSE / UNIT
         ========================================================================= */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card-3d w-full max-w-lg p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-[0_3px_0_0_#1e3a8a]">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Add New Course / Unit</h3>
                  <p className="text-xs font-medium text-slate-500">Appears immediately on the 3D Learn Path</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Select CEFR Level *
                </label>
                <select
                  value={newCourseLevel}
                  onChange={(e) => setNewCourseLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black"
                >
                  <option value="A0">A0 — Absolute Beginner (Phonics & Survival)</option>
                  <option value="A1">A1 — Beginner (Daily Routines & Basics)</option>
                  <option value="A2">A2 — Elementary (Travel & Conversations)</option>
                  <option value="B1">B1 — Intermediate (Career & Workplace)</option>
                  <option value="B2">B2 — Upper Intermediate (Business & Idioms)</option>
                  <option value="C1">C1 — Advanced (Academic & Rhetoric)</option>
                  <option value="C2">C2 — Proficiency (Near-Native Mastery)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Course / Unit Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. Unit 4: Daily Shopping & Market Phrases"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Course Description
                </label>
                <textarea
                  rows={2}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  placeholder="Master practical phrases, pronunciation, and grammar for this unit."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createStarterLesson}
                  onChange={(e) => setCreateStarterLesson(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Auto-create a starter lesson with Theory, Audio Vocab & Duolingo Quiz
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="btn-3d-secondary text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="btn-3d-primary text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {savingCourse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW LESSON (WITH THEORY, VOCABULARY, EXAMPLES & QUIZ)
         ========================================================================= */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card-3d w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-[0_3px_0_0_#047857]">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Add New Interactive Lesson</h3>
                  <p className="text-xs font-medium text-slate-500">
                    Includes Study Sheet Theory, Audio Flashcards & Quiz
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLessonModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Parent Course / Unit *
                  </label>
                  <select
                    required
                    value={lessonCourseId}
                    onChange={(e) => setLessonCourseId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.levelCode}] {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="e.g. Ordering Coffee & Polite Requests"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={newLessonDesc}
                    onChange={(e) => setNewLessonDesc(e.target.value)}
                    placeholder="Key phrases & pronunciation"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    value={newLessonXp}
                    onChange={(e) => setNewLessonXp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Theory & Phonics Explanation (Shown in Study Guide)
                </label>
                <textarea
                  rows={3}
                  value={newLessonTheory}
                  onChange={(e) => setNewLessonTheory(e.target.value)}
                  placeholder="Write the grammar rules, phonics tips, or Urdu/English explanation for students..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Vocabulary Words (1 per line: Word | Urdu/Spanish Translation | Definition)
                </label>
                <textarea
                  rows={2}
                  value={newLessonVocab}
                  onChange={(e) => setNewLessonVocab(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  3. Conversational Phrases (1 per line: English Phrase | Translation)
                </label>
                <textarea
                  rows={2}
                  value={newLessonExamples}
                  onChange={(e) => setNewLessonExamples(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2.5">
                <span className="text-[11px] font-black uppercase text-blue-800 dark:text-blue-300 block">
                  Optional Custom Quiz Question (Sentence Builder is also generated automatically!)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={newLessonQuizQ}
                    onChange={(e) => setNewLessonQuizQ(e.target.value)}
                    placeholder="Question prompt..."
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    value={newLessonQuizAns}
                    onChange={(e) => setNewLessonQuizAns(e.target.value)}
                    placeholder="Correct Answer"
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    value={newLessonQuizOpts}
                    onChange={(e) => setNewLessonQuizOpts(e.target.value)}
                    placeholder="Options (comma separated)"
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="btn-3d-secondary text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="btn-3d-emerald text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {savingLesson ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save & Publish Lesson</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD NEW STUDENT / ADMIN USER
         ========================================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card-3d w-full max-w-md p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_3px_0_0_#b45309]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">Enroll New Student / Admin</h3>
                  <p className="text-xs font-medium text-slate-500">Create a ready-to-use account immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Ali Hussain"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@englishmiami.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                  Password *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Level
                  </label>
                  <select
                    value={newStudentLevel}
                    onChange={(e) => setNewStudentLevel(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black"
                  >
                    {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Plan
                  </label>
                  <select
                    value={newStudentPlan}
                    onChange={(e) => setNewStudentPlan(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="FREE">FREE</option>
                    <option value="WEEKLY_PRO">WEEKLY</option>
                    <option value="MONTHLY_PRO">MONTHLY</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Role
                  </label>
                  <select
                    value={newStudentRole}
                    onChange={(e) => setNewStudentRole(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newStudentCountry}
                    onChange={(e) => setNewStudentCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block mb-1">
                    Native Language
                  </label>
                  <input
                    type="text"
                    value={newStudentLang}
                    onChange={(e) => setNewStudentLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="btn-3d-secondary text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="btn-3d-amber text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {savingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ISSUE DIRECT CERTIFICATE
         ========================================================================= */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="card-3d max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Issue Official Certificate Directly
              </h3>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueDirect} className="space-y-3">
              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                  Student Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={issueEmail}
                  onChange={(e) => setIssueEmail(e.target.value)}
                  placeholder="student@englishmiami.com"
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                    CEFR Level
                  </label>
                  <select
                    value={issueLevel}
                    onChange={(e) => setIssueLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                    Standing Grade
                  </label>
                  <select
                    value={issueGrade}
                    onChange={(e) => setIssueGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="Distinction">Distinction (90%+)</option>
                    <option value="Merit">Merit (80-89%)</option>
                    <option value="Pass">Pass (70-79%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                  Assessment Score (%)
                </label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  value={issueScore}
                  onChange={(e) => setIssueScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                  Academic Board Notes
                </label>
                <textarea
                  rows={2}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="Awarded for demonstrated excellence in English proficiency."
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="btn-3d-secondary text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuingLoading}
                  className="btn-3d-primary text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {issuingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Issue Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
