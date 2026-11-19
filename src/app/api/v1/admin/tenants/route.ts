import { NextRequest, NextResponse } from 'next/server';
import { TenantStore, B2B_PACKAGES } from '@/domain/tenant/store';
import { TenantRecord, GameKey } from '@/domain/tenant/types';

export async function GET(request: NextRequest) {
  const tenants = TenantStore.getAllTenants();
  return NextResponse.json({
    data: {
      tenants,
      packages: B2B_PACKAGES,
    },
    meta: {
      total: tenants.length,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, contactEmail, packageCode, primaryHostname, branding } = body;

    if (!name || !slug || !contactEmail) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Name, slug, and contact email are required' },
        { status: 400 }
      );
    }

    const existingSlug = TenantStore.getTenantBySlug(slug);
    if (existingSlug) {
      return NextResponse.json(
        { error: 'CONFLICT', message: `Tenant slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    const pkg = B2B_PACKAGES.find((p) => p.code === packageCode) || B2B_PACKAGES[0];
    const tenantId = `ten_${slug.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now().toString(36)}`;

    // Build default game entitlements based on package
    const allGames: GameKey[] = ['matka', 'carrom', 'ludo', 'pool', 'other-games', 'casino', 'sports'];
    const gameConfigs = allGames.map((gameKey, index) => ({
      gameKey,
      isEnabled: pkg.includedGames.includes(gameKey),
      displayOrder: index + 1,
    }));

    const newTenant: TenantRecord = {
      id: tenantId,
      slug: slug.toLowerCase(),
      name,
      status: 'ACTIVE',
      packageCode: pkg.code,
      contactEmail,
      branding: {
        brandName: branding?.brandName || name.toUpperCase(),
        tagline: branding?.tagline || 'Multi-Gaming Lounge',
        logoUrl: branding?.logoUrl || '/icons/icon-192.png',
        faviconUrl: branding?.faviconUrl || '/favicon.ico',
        primaryColor: branding?.primaryColor || '#7e0ac2',
        primaryColorHover: branding?.primaryColorHover || '#9a13e6',
        secondaryColor: branding?.secondaryColor || '#b45df0',
        backgroundColor: branding?.backgroundColor || '#18181b',
        textColor: branding?.textColor || '#ffffff',
        accentGlowColor: branding?.accentGlowColor || 'rgba(126,10,194,0.3)',
        heroHeading: branding?.heroHeading || `${name} Entertainment Arena`,
        heroSubheading:
          branding?.heroSubheading || 'Certified high-integrity multiplayer skill and draw gaming.',
        footerText: branding?.footerText || `${name} Platform — Powered by Project Atlas.`,
        supportEmail: contactEmail,
      },
      domains: primaryHostname
        ? [
            {
              id: `dom_${Date.now()}`,
              tenantId,
              hostname: primaryHostname.toLowerCase(),
              isPrimary: true,
              verificationStatus: 'VERIFIED',
              verificationToken: `v_tok_${Math.random().toString(36).substring(2, 10)}`,
              sslStatus: 'ACTIVE',
              verifiedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      gameConfigs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    TenantStore.saveTenant(newTenant);

    return NextResponse.json({
      data: {
        tenant: newTenant,
      },
      message: 'Tenant successfully provisioned and indexed',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
