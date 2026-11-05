import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, TOKEN_NAME } from '@/lib/auth';
import { UserSession } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        profile: {
          create: {
            currentLevel: 'A0',
            targetLevel: 'B2',
            nativeLanguage: 'Spanish',
            learningGoal: 'Speaking English',
            onboardingCompleted: false,
            xp: 50, // Welcome XP
          },
        },
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
            price: 0,
          },
        },
        streak: {
          create: {
            currentStreak: 1,
            longestStreak: 1,
          },
        },
      },
      include: {
        profile: true,
        subscription: true,
      },
    });

    const sessionPayload: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'STUDENT',
      currentLevel: 'A0',
      plan: 'FREE',
      onboardingCompleted: false,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: 'Account created successfully!',
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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
