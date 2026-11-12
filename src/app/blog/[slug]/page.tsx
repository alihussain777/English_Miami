'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TextToSpeechButton from '@/components/TextToSpeechButton';
import {
  ArrowLeft,
  Clock,
  Compass,
  Tag,
} from 'lucide-react';

interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTimeMinutes: number;
  coverImage: string;
  accentColor: 'blue' | 'emerald' | 'indigo' | 'amber';
  authorName: string;
  authorRole: string;
  seoKeywords: string[];
  contentHtml: string;
  publishedAt: string;
  featured: boolean;
}

export default function SingleBlogPostPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === 'string'
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : '';

  const [blog, setBlog] = useState<BlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        setBlog(data.blog || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Article Not Found</h1>
          <Link href="/blog" className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-black">
            Back to All Articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const plainTextForAudio = `${blog.title}. ${blog.excerpt}. ${blog.contentHtml.replace(/<[^>]+>/g, ' ')}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All English Guides & Blogs</span>
          </Link>

          <TextToSpeechButton
            text={plainTextForAudio}
            size="sm"
            showSpeedControl
          />
        </div>

        <article className="card-3d overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative h-72 sm:h-96 bg-slate-900 overflow-hidden">
            <img
              src={blog.coverImage || '/images/brand/hero-group-fair.jpg'}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <img
              src="/images/brand/logo-tici.png"
              alt="TICI"
              className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider">
                  {blog.category}
                </span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {blog.readTimeMinutes} min read • {blog.publishedAt}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black leading-tight">
                {blog.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white font-black flex items-center justify-center">
                  {(blog.authorName || 'J').charAt(0)}
                </div>
                <div>
                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    {blog.authorName}
                  </div>
                  <div className="text-xs text-slate-500">{blog.authorRole}</div>
                </div>
              </div>
            </div>

            <div
              className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed space-y-4 text-sm sm:text-base [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:text-blue-700 dark:[&_h3]:text-blue-400 [&_h3]:mt-4 [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
            />

            {blog.seoKeywords?.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                {blog.seoKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Bottom CTA to Start Learning Path */}
        <div className="p-7 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-200">
              Put This Article Into Practice Today
            </span>
            <h3 className="text-xl font-black">
              Start Your Interactive Native-to-English Learning Path
            </h3>
          </div>
          <Link
            href="/learn"
            className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Open Learn Path</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
