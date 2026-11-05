import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const level = searchParams.get('level') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (level && level !== 'ALL') {
      where.profile = {
        currentLevel: level
      };
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          createdAt: true,
          profile: {
            select: {
              currentLevel: true,
              targetLevel: true,
              nativeLanguage: true,
              country: true,
              xp: true,
              speakingMinutes: true,
              dailyTargetMinutes: true,
              learningGoal: true
            }
          },
          subscription: {
            select: {
              plan: true,
              status: true,
              price: true,
              currency: true,
              startDate: true
            }
          },
          streak: {
            select: {
              currentStreak: true,
              longestStreak: true
            }
          },
          _count: {
            select: {
              lessonProgress: true,
              testAttempts: true,
              certificates: true,
              speakingSessions: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch students list' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, level, status, role, xpAdjustment } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update User model fields
    const userUpdateData: any = {};
    if (status && ['ACTIVE', 'SUSPENDED'].includes(status)) {
      userUpdateData.status = status;
    }
    if (role && ['STUDENT', 'ADMIN'].includes(role)) {
      userUpdateData.role = role;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }

    // Update Profile model fields if level or xp was modified
    if (level || xpAdjustment) {
      const profileUpdateData: any = {};
      if (level && ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) {
        profileUpdateData.currentLevel = level;
      }
      if (typeof xpAdjustment === 'number') {
        profileUpdateData.xp = { increment: xpAdjustment };
      }

      if (Object.keys(profileUpdateData).length > 0) {
        await prisma.profile.upsert({
          where: { userId },
          update: profileUpdateData,
          create: {
            userId,
            currentLevel: level || 'A1',
            xp: xpAdjustment > 0 ? xpAdjustment : 100
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Student details updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update student profile' }, { status: 500 });
  }
}
