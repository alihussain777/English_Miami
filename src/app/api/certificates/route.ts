import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const certNumber = searchParams.get('id');

    if (certNumber) {
      // Public verification
      const cert = await prisma.certificate.findUnique({
        where: { certificateNumber: certNumber },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });

      if (!cert) {
        return NextResponse.json({ verified: false, error: 'Certificate not found' }, { status: 404 });
      }

      return NextResponse.json({
        verified: cert.status === 'APPROVED',
        certificate: {
          id: cert.id,
          certificateNumber: cert.certificateNumber,
          userName: cert.user.name,
          courseLevel: cert.courseLevel,
          title: cert.title,
          status: cert.status,
          issueDate: cert.issueDate,
          approvedAt: cert.approvedAt,
          grade: cert.grade,
          score: cert.score,
          notes: cert.notes
        },
      });
    }

    // Get current user's certificates
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ certificates: [] });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: session.id },
      orderBy: { requestedAt: 'desc' },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to apply for a certificate' }, { status: 401 });
    }

    const { levelCode = 'B1', score = 88 } = await req.json();

    // Check if an existing certificate for this level is already pending or approved
    const existing = await prisma.certificate.findFirst({
      where: {
        userId: session.id,
        courseLevel: { contains: levelCode },
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: `You already have an active or pending certificate for Level ${levelCode}. (ID: ${existing.certificateNumber})`
      }, { status: 400 });
    }

    const certNum = `MIA-${new Date().getFullYear()}-${levelCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Student requests certificate; sets status to PENDING for academic approval
    const cert = await prisma.certificate.create({
      data: {
        userId: session.id,
        certificateNumber: certNum,
        courseLevel: `CEFR Level ${levelCode}`,
        title: `Official CEFR ${levelCode} English Competence Certificate`,
        status: 'PENDING',
        score: parseInt(score, 10) || 88,
        grade: score >= 90 ? 'Distinction' : score >= 80 ? 'Merit' : 'Pass',
        requestedAt: new Date(),
        issueDate: null,
        verificationUrl: `/verify-certificate?id=${certNum}`,
        notes: 'Submitted for faculty verification.'
      },
    });

    return NextResponse.json({
      success: true,
      certificate: cert,
      message: 'Certificate application submitted successfully! Our Academic Board will review and approve it shortly.',
    });
  } catch (error) {
    console.error('Certificate submission error:', error);
    return NextResponse.json({ error: 'Failed to submit certificate request' }, { status: 500 });
  }
}
