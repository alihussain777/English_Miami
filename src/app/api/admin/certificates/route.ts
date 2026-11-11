import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                currentLevel: true,
                country: true,
                xp: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    const pendingCount = await prisma.certificate.count({ where: { status: 'PENDING' } });
    const approvedCount = await prisma.certificate.count({ where: { status: 'APPROVED' } });
    const rejectedCount = await prisma.certificate.count({ where: { status: 'REJECTED' } });

    return NextResponse.json({
      certificates,
      metrics: {
        total: certificates.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error) {
    console.warn('Error fetching admin certificates, returning fallback:', error);
    return NextResponse.json({
      certificates: [],
      metrics: { total: 0, pending: 0, approved: 0, rejected: 0 },
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, notes, grade, score } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Certificate ID and action (APPROVE/REJECT) are required' }, { status: 400 });
    }

    const existingCert = await prisma.certificate.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingCert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.certificate.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          issueDate: new Date(),
          grade: grade || existingCert.grade || 'Distinction',
          score: score ? parseInt(score, 10) : existingCert.score || 92,
          notes: notes || 'Reviewed and officially approved by EnglishMiami Academic Board.',
        },
      });

      try {
        await prisma.notification.create({
          data: {
            userId: existingCert.userId,
            title: 'Certificate Approved & Issued!',
            message: `Congratulations! Your ${existingCert.courseLevel} certificate has been officially reviewed and approved with ${updated.grade}.`,
            type: 'ACHIEVEMENT',
            link: `/verify-certificate?id=${existingCert.certificateNumber}`,
          },
        });
      } catch {}

      return NextResponse.json({ success: true, certificate: updated, message: 'Certificate approved successfully' });
    } else if (action === 'REJECT') {
      const updated = await prisma.certificate.update({
        where: { id },
        data: {
          status: 'REJECTED',
          notes: notes || 'Certificate application did not meet the minimum assessment criteria.',
        },
      });

      return NextResponse.json({ success: true, certificate: updated, message: 'Certificate rejected' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json({ error: 'Failed to process certificate' }, { status: 500 });
  }
}

// POST: Issue direct certificate to a student
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, levelCode = 'B1', title, grade = 'Distinction', score = 95, notes } = body;

    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const targetUser = await prisma.user.findUnique({ where: { email: userEmail.trim().toLowerCase() } });
      if (!targetUser) {
        return NextResponse.json({ error: 'Student with this email was not found' }, { status: 404 });
      }
      targetUserId = targetUser.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Valid Student ID or Email is required' }, { status: 400 });
    }

    const certNum = `MIA-${new Date().getFullYear()}-${levelCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const certTitle = title || `Official CEFR ${levelCode} English Competence Certificate`;

    const cert = await prisma.certificate.create({
      data: {
        userId: targetUserId,
        certificateNumber: certNum,
        courseLevel: `CEFR Level ${levelCode}`,
        title: certTitle,
        status: 'APPROVED',
        requestedAt: new Date(),
        approvedAt: new Date(),
        issueDate: new Date(),
        grade,
        score: parseInt(score, 10) || 95,
        notes: notes || 'Direct academic issuance by Platform Director.',
        verificationUrl: `/verify-certificate?id=${certNum}`,
      },
    });

    return NextResponse.json({ success: true, certificate: cert, message: 'Certificate issued successfully' });
  } catch (error) {
    console.error('Error creating admin certificate:', error);
    return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 });
  }
}
