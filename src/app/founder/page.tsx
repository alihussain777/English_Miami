'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Award,
  Trophy,
  Building2,
  Sparkles,
  Heart,
  Upload,
  X,
  Quote,
  ArrowRight,
  CheckCircle2,
  Users,
  Camera,
} from 'lucide-react';

interface OwnerPortraitSlot {
  id: string;
  title: string;
  roleTag: string;
  caption: string;
  defaultImage: string;
}

export default function MeetFounderPage() {
  const defaultOwnerSlots: OwnerPortraitSlot[] = [
    {
      id: 'owner-slot-1',
      title: 'Executive Leadership & Graduation',
      roleTag: 'Founder Portrait Frame #1',
      caption: 'Honoring certified graduates at the La Gorce Country Club Diploma Ceremony in Miami Beach.',
      defaultImage: '/images/brand/jason-graduation-quartet.jpg',
    },
    {
      id: 'owner-slot-2',
      title: 'Classroom Mentorship',
      roleTag: 'Founder Portrait Frame #2',
      caption: 'Creating a warm, encouraging classroom environment with international students.',
      defaultImage: '/images/brand/jason-classroom-selfie.jpg',
    },
    {
      id: 'owner-slot-3',
      title: 'La Gorce Country Club Cohort',
      roleTag: 'Founder Portrait Frame #3',
      caption: 'Standing with diploma recipients upon completion of their professional English track.',
      defaultImage: '/images/brand/jason-graduation-group.jpg',
    },
    {
      id: 'owner-slot-4',
      title: 'Solo Owner Portrait Slot',
      roleTag: 'Ready 3D Portrait Frame #4',
      caption: 'Dedicated 3D frame ready for additional solo portraits — click "Change Photo" anytime to update.',
      defaultImage: '/images/brand/group-lounge.jpg',
    },
  ];

  const [customOwnerPhotos, setCustomOwnerPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tici_owner_custom_photos');
      if (saved) {
        setCustomOwnerPhotos(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOwnerPhotoUpload = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...customOwnerPhotos, [slotId]: result };
      setCustomOwnerPhotos(updated);
      try {
        localStorage.setItem('tici_owner_custom_photos', JSON.stringify(updated));
      } catch (err) {
        console.error('Could not save photo to localStorage:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetOwnerPhoto = (slotId: string) => {
    const updated = { ...customOwnerPhotos };
    delete updated[slotId];
    setCustomOwnerPhotos(updated);
    try {
      localStorage.setItem('tici_owner_custom_photos', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 space-y-16">
        {/* Clean Professional Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <img
            src="/images/brand/logo-tici.png"
            alt="TICI Logo"
            className="w-24 h-24 object-contain mx-auto"
          />
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Meet the Founder
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Jason Trinidad
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Founder & President of TICI • EnglishMiami — dedicated to empowering international students and hospitality professionals through practical, confidence-building English education.
          </p>
        </div>

        {/* Main Biography & Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 7 Columns: Life Story & Vision */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card-3d p-8 sm:p-10 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Biography & Educational Vision
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  A Lifelong Commitment to Student Success
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong className="text-slate-900 dark:text-white">Jason Trinidad</strong> established the <strong className="text-slate-900 dark:text-white">Trinidad International Cultural Institute (TICI) • EnglishMiami</strong> with a clear mission: to make English education engaging, practical, and welcoming for adult learners from every background.
                </p>
                <p>
                  Recognizing that traditional textbook-heavy classes often leave students hesitant to speak in real-life situations, Jason developed an interactive classroom methodology centered around active communication, smartboard presentations, and cultural exchange.
                </p>
                <p>
                  In addition to leading campus programs for international students across South Florida, Jason partners with premier hospitality organizations—including <strong className="text-slate-900 dark:text-white">La Gorce Country Club</strong> in Miami Beach—to deliver tailored workplace English training and verifiable CEFR diploma programs.
                </p>
              </div>

              {/* Clean Quote Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border-l-4 border-blue-600 flex items-start gap-3.5">
                <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-base italic font-semibold text-slate-800 dark:text-slate-200">
                    "True fluency begins when a student feels supported enough to stand up, share their ideas, and connect with others in English without hesitation."
                  </p>
                  <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-2">
                    — Jason Trinidad, Founder
                  </p>
                </div>
              </div>
            </div>

            {/* Key Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-3d p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Institute Founder
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Architected the TICI • EnglishMiami CEFR A0–C2 curriculum combining live classroom immersion with interactive digital study tools.
                </p>
              </div>

              <div className="card-3d p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Hospitality & Corporate Programs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Leads on-site professional English and certification programs for respected Miami institutions including La Gorce Country Club.
                </p>
              </div>

              <div className="card-3d p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Interactive Presentation Method
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pioneered daily student smartboard talks on science, architecture, technology, and culture to build real public-speaking confidence.
                </p>
              </div>

              <div className="card-3d p-6 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Global Student Community
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Guided learners from over 40 countries toward career advancement, academic success, and everyday fluency in the United States.
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Featured 3D Portrait Frame */}
          <div className="lg:col-span-5 space-y-6">
            <div className="frame-3d">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900">
                <img
                  src="/images/brand/jason-graduation-group.jpg"
                  alt="Jason Trinidad with Graduates at La Gorce Country Club"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                <img
                  src="/images/brand/logo-tici.png"
                  alt="TICI Logo"
                  className="absolute top-3 right-3 w-13 h-13 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]"
                />
                <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-600 text-white">
                    La Gorce Country Club • Miami Beach
                  </span>
                  <h3 className="text-lg font-extrabold mt-2">
                    Jason Trinidad with Official Certificate Graduates
                  </h3>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Celebrating academic achievement and career advancement with adult learners.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-3d p-6 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Educational Philosophy</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Every course at TICI • EnglishMiami combines structured CEFR grammar and phonics with real-world speaking practice, ensuring students can immediately apply what they learn at work and in daily life.
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated 3D Portrait Frames Section (Ready for Owner Photos) */}
        <div className="space-y-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                3D Portrait Gallery
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                Founder Moments & Portrait Frames
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                You can also update or add new solo portraits of Jason Trinidad in any 3D frame below using the "Change Photo" button.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {defaultOwnerSlots.map((slot) => {
              const activePhoto = customOwnerPhotos[slot.id] || slot.defaultImage;
              const isCustom = Boolean(customOwnerPhotos[slot.id]);
              return (
                <div key={slot.id} className="frame-3d flex flex-col justify-between">
                  <div className="relative rounded-2xl overflow-hidden h-72 sm:h-80 bg-slate-900">
                    <img
                      src={activePhoto}
                      alt={slot.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-xl bg-slate-900/80 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                        {slot.roleTag}
                      </span>
                    </div>
                    <img
                      src="/images/brand/logo-tici.png"
                      alt="TICI Logo"
                      className="absolute bottom-3 right-3 w-12 h-12 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.75)]"
                    />
                  </div>

                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {slot.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {slot.caption}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-3d-secondary text-xs font-bold">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isCustom ? 'Change Photo' : 'Add / Change Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOwnerPhotoUpload(slot.id, e)}
                          className="hidden"
                        />
                      </label>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => resetOwnerPhoto(slot.id)}
                          className="p-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold cursor-pointer"
                          title="Reset to default photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
