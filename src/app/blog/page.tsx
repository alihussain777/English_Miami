'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
  User,
  Tag,
} from 'lucide-react';
import type { BlogPostItem } from '@/lib/site-config-store';

export default function BlogDirectoryPage() {
  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/blogs')
      .then((r) => r.json())
      .then((data) => {
        setBlogs(data.blogs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(blogs.map((b) => b.category)))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQ =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      (b.seoKeywords || []).some((k) => k.toLowerCase().includes(q));
    return matchesCat && matchesQ;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-10">
        {/* Hero Header */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white border border-blue-800 shadow-lg space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold text-emerald-300">
            <Sparkles className="w-4 h-4" />
            <span>TICI Language Institute • Official English Learning Blog & Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl leading-tight">
            Proven Strategies to Speak, Read & Master English Faster
          </h1>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
            Explore expert articles on pronunciation, CEFR exam preparation, thinking in English without translating, and real-world conversational fluency.
          </p>

          {/* Search & Category Filter */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search English guides, pronunciation tips, CEFR roadmaps..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              {cat === 'ALL' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Blog Cards Grid */}
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-bold">No blog articles matched your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredBlogs.map((blog) => (
              <article
                key={blog.id}
                className="card-3d overflow-hidden flex flex-col justify-between group border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all"
              >
                <div>
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={blog.coverImage || '/images/brand/hero-group-fair.jpg'}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider">
                      {blog.category}
                    </span>
                    <img
                      src="/images/brand/logo-tici.png"
                      alt="TICI"
                      className="absolute top-3 right-3 w-8 h-8 object-contain drop-shadow-md"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {blog.readTimeMinutes} min read
                      </span>
                      <span>•</span>
                      <span>{blog.publishedAt}</span>
                    </div>

                    <Link href={`/blog/${blog.slug}`}>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {blog.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{blog.authorName}</span>
                  </div>

                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
