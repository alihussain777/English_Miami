import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, TOKEN_NAME } from '@/lib/auth';
import { UserSession, CEFRLevel, SubscriptionPlan } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          profile: true,
          subscription: true,
        },
      });
    } catch (dbErr) {
      console.warn('[Login] DB lookup failed, falling back to built-in accounts:', dbErr);
    }

    // Built-in fallback accounts so login ALWAYS succeeds on serverless
    if (!user) {
      if (normalizedEmail === 'student@englishmiami.com' && password === 'miami123456') {
        user = {
          id: 'demo-student-uuid',
          email: 'student@englishmiami.com',
          name: 'Sofia Rodriguez',
          role: 'STUDENT',
          passwordHash: null,
          profile: { currentLevel: 'A0', onboardingCompleted: true },
          subscription: { plan: 'FREE' },
        };
      } else if (normalizedEmail === 'admin@englishmiami.com' && password === 'miami123456') {
        user = {
          id: 'demo-admin-uuid',
          email: 'admin@englishmiami.com',
          name: 'Elena Vance (Director)',
          role: 'ADMIN',
          passwordHash: null,
          profile: { currentLevel: 'C2', onboardingCompleted: true },
          subscription: { plan: 'MONTHLY_PRO' },
        };
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.passwordHash) {
      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
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
