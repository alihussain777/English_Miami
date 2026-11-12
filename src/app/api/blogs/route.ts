import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, BlogPostItem } from '@/lib/site-config-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const config = readSiteConfig();

  if (slug) {
    const found = config.blogs.find((b) => b.slug === slug || b.id === slug);
    if (!found) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    return NextResponse.json({ blog: found });
  }

  return NextResponse.json({ blogs: config.blogs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      excerpt,
      category = 'English Fluency',
      readTimeMinutes = 5,
      coverImage = '/images/brand/hero-group-fair.jpg',
      accentColor = 'blue',
      authorName = 'Jason Trinidad',
      authorRole = 'Founder, TICI Language Institute Miami',
      seoKeywords = [],
      contentHtml = '',
      featured = true,
    } = body;

    if (!title || !contentHtml) {
      return NextResponse.json(
        { error: 'Blog title and content are required' },
        { status: 400 }
      );
    }

    const slug =
      body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const config = readSiteConfig();
    const newBlog: BlogPostItem = {
      id: `blog-${Date.now()}`,
      slug,
      title: title.trim(),
      excerpt:
        excerpt?.trim() ||
        contentHtml.replace(/<[^>]*>/g, '').slice(0, 160) + '...',
      category,
      readTimeMinutes: Number(readTimeMinutes) || 5,
      coverImage,
      accentColor,
      authorName,
      authorRole,
      seoKeywords: Array.isArray(seoKeywords)
        ? seoKeywords
        : String(seoKeywords)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      contentHtml,
      publishedAt: new Date().toISOString().split('T')[0],
      featured,
    };

    config.blogs = [newBlog, ...config.blogs];
    writeSiteConfig(config);

    return NextResponse.json({
      success: true,
      blog: newBlog,
      blogs: config.blogs,
    });
  } catch (err) {
    console.error('Create blog error:', err);
    return NextResponse.json({ error: 'Failed to publish blog' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const config = readSiteConfig();
    if (id) {
      config.blogs = config.blogs.filter((b) => b.id !== id && b.slug !== id);
      writeSiteConfig(config);
    }
    return NextResponse.json({
      success: true,
      blogs: config.blogs,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
