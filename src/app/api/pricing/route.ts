import { NextRequest, NextResponse } from 'next/server';
import { readSiteConfig, writeSiteConfig } from '@/lib/site-config-store';

export const dynamic = 'force-dynamic';

function mapCountryCodeToTierId(countryCode: string): {
  tierId: string;
  countryName: string;
} {
  const code = (countryCode || '').toUpperCase().trim();
  if (code === 'PK') {
    return { tierId: 'pk', countryName: 'Pakistan' };
  }
  if (['IN', 'BD', 'NP', 'LK', 'AF', 'MV'].includes(code)) {
    const names: Record<string, string> = {
      IN: 'India',
      BD: 'Bangladesh',
      NP: 'Nepal',
      LK: 'Sri Lanka',
      AF: 'Afghanistan',
      MV: 'Maldives',
    };
    return { tierId: 'south-asia', countryName: names[code] || 'South Asia' };
  }
  if (
    [
      'MX',
      'BR',
      'CO',
      'AR',
      'CL',
      'PE',
      'EC',
      'VE',
      'GT',
      'CR',
      'PA',
      'UY',
      'DO',
    ].includes(code)
  ) {
    return { tierId: 'latam', countryName: 'Latin America' };
  }
  if (
    [
      'AE',
      'SA',
      'QA',
      'KW',
      'OM',
      'BH',
      'TR',
      'EG',
      'JO',
      'MA',
      'JP',
      'KR',
      'VN',
      'TH',
      'ID',
      'MY',
      'PH',
    ].includes(code)
  ) {
    return { tierId: 'mena-asia', countryName: 'Middle East & Asia' };
  }
  return { tierId: 'us-eu', countryName: 'United States / Europe' };
}

export async function GET(req: NextRequest) {
  const config = readSiteConfig();

  // 1. Check standard CDN / Edge Geo-IP headers first
  const headerCountry =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country-code') ||
    '';

  const forwardedFor = req.headers.get('x-forwarded-for');
  const visitorIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '';

  let detectedCountryCode = headerCountry.toUpperCase();
  let detectedCountryName = '';
  let detectedIp = visitorIp;

  // 2. If running on localhost or without CDN headers, attempt a fast server-side IP lookup
  if (!detectedCountryCode) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const geoRes = await fetch('https://ipwho.is/', {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.country_code) {
          detectedCountryCode = String(geoData.country_code).toUpperCase();
          detectedCountryName = String(geoData.country || '');
          detectedIp = String(geoData.ip || visitorIp || '');
        }
      }
    } catch {
      // Fallback handled on client side via ipwho.is / ipapi.co + timezone
    }
  }

  const mapped = mapCountryCodeToTierId(detectedCountryCode || 'PK');

  return NextResponse.json({
    globalDiscountActive: config.globalDiscountActive,
    globalDiscountBanner: config.globalDiscountBanner,
    regionalPricing: config.regionalPricing,
    detectedCountryCode: detectedCountryCode || '',
    detectedCountryName: detectedCountryName || mapped.countryName,
    detectedIp,
    detectedTierId: detectedCountryCode ? mapped.tierId : '',
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
