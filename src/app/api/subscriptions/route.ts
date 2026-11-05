import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { PLAN_CONFIGS } from '@/lib/subscription-gates';
import { SubscriptionPlan } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);

    let userSubscription = null;
    let paymentHistory: any[] = [];

    if (session) {
      userSubscription = await prisma.subscription.findUnique({
        where: { userId: session.id },
      });

      paymentHistory = await prisma.payment.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    }

    return NextResponse.json({
      plans: PLAN_CONFIGS,
      currentSubscription: userSubscription || { plan: 'FREE', status: 'ACTIVE' },
      paymentHistory,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Please log in to change your plan.' }, { status: 401 });
    }

    const { plan } = (await req.json()) as { plan: SubscriptionPlan };

    if (!['FREE', 'WEEKLY_PRO', 'MONTHLY_PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid subscription plan.' }, { status: 400 });
    }

    const price = plan === 'WEEKLY_PRO' ? 6.99 : plan === 'MONTHLY_PRO' ? 19.99 : 0.0;
    const durationDays = plan === 'WEEKLY_PRO' ? 7 : plan === 'MONTHLY_PRO' ? 30 : 365;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscription = await prisma.subscription.upsert({
      where: { userId: session.id },
      update: {
        plan,
        status: 'ACTIVE',
        price,
        startDate: new Date(),
        endDate,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: session.id,
        plan,
        status: 'ACTIVE',
        price,
        startDate: new Date(),
        endDate,
        cancelAtPeriodEnd: false,
      },
    });

    // Record payment if paid plan
    if (price > 0) {
      await prisma.payment.create({
        data: {
          userId: session.id,
          subscriptionId: subscription.id,
          amount: price,
          plan,
          status: 'PAID',
          paymentMethod: 'Card (Visa / Stripe)',
          transactionRef: `tx_miami_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: `Congratulations! You are now subscribed to ${PLAN_CONFIGS[plan].name}!`,
    });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updated = await prisma.subscription.update({
      where: { userId: session.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your subscription will not renew after the current billing cycle.',
      subscription: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
