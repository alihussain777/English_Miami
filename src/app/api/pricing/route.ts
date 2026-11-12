import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig } from '@/lib/site-config-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = readSiteConfig();
  return NextResponse.json({
    globalDiscountActive: config.globalDiscountActive,
    globalDiscountBanner: config.globalDiscountBanner,
    regionalPricing: config.regionalPricing,
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const config = readSiteConfig();

    if (typeof body.globalDiscountActive === 'boolean') {
      config.globalDiscountActive = body.globalDiscountActive;
    }
    if (typeof body.globalDiscountBanner === 'string') {
      config.globalDiscountBanner = body.globalDiscountBanner;
    }
    if (Array.isArray(body.regionalPricing)) {
      config.regionalPricing = body.regionalPricing;
    }

    // Update a single tier if tierUpdate is passed
    if (body.tierUpdate && body.tierUpdate.id) {
      config.regionalPricing = config.regionalPricing.map((t) =>
        t.id === body.tierUpdate.id ? { ...t, ...body.tierUpdate } : t
      );
    }

    writeSiteConfig(config);
    return NextResponse.json({
      success: true,
      globalDiscountActive: config.globalDiscountActive,
      globalDiscountBanner: config.globalDiscountBanner,
      regionalPricing: config.regionalPricing,
    });
  } catch (err) {
    console.error('Pricing update error:', err);
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
  }
}
