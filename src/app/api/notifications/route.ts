import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig, BroadcastNotification } from '@/lib/site-config-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = readSiteConfig();
  return NextResponse.json({
    notifications: config.notifications,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, type = 'info', actionUrl = '/learn', actionLabel = 'View Now' } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const config = readSiteConfig();
    const newNotif: BroadcastNotification = {
      id: `notif-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      actionUrl,
      actionLabel,
      createdAt: new Date().toISOString(),
    };

    config.notifications = [newNotif, ...config.notifications];
    writeSiteConfig(config);

    return NextResponse.json({
      success: true,
      notification: newNotif,
      notifications: config.notifications,
    });
  } catch (err) {
    console.error('Create notification error:', err);
    return NextResponse.json({ error: 'Failed to broadcast notification' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const config = readSiteConfig();
    if (id) {
      config.notifications = config.notifications.filter((n) => n.id !== id);
      writeSiteConfig(config);
    }
    return NextResponse.json({
      success: true,
      notifications: config.notifications,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
