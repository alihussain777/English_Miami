import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // For security, always return success even if email doesn't exist
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, reset instructions have been sent.',
      demoResetToken: user ? `reset-${user.id.slice(0, 8)}` : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
