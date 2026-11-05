import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, TOKEN_NAME } from '@/lib/auth';
import { UserSession, CEFRLevel, SubscriptionPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const sessionPayload: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'ADMIN',
      currentLevel: (user.profile?.currentLevel as CEFRLevel) || 'A0',
      plan: (user.subscription?.plan as SubscriptionPlan) || 'FREE',
      avatar: user.avatar || undefined,
      onboardingCompleted: user.profile?.onboardingCompleted ?? false,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Logged in successfully!',
    });

    response.cookies.set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Failed to authenticate.',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
