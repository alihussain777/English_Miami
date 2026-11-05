import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    const contact = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject?.trim() || 'General Inquiry',
        message: message.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out! Our pedagogical team will reply within 24 hours.',
      contactId: contact.id,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit contact message' }, { status: 500 });
  }
}
