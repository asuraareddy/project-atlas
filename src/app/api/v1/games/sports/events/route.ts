import { NextRequest, NextResponse } from 'next/server';
import { BetfairSportsAdapter } from '@/domain/games/adapters/sports.adapter';
import { TenantStore } from '@/domain/tenant/store';

export async function GET(request: NextRequest) {
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
    const queryTenant = request.nextUrl.searchParams.get('tenant');
    const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
    const cookieTenant = request.cookies.get('atlas_tenant')?.value;
    const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

    const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);

    // 1. Verify tenant entitlement for Sports module
    const isEnabled = TenantStore.isGameEnabledForTenant(tenantCtx.tenantId, 'sports');
    if (!isEnabled) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN_403',
          message: 'Sports & Exchange module is not enabled for this tenant domain.',
        },
        { status: 403 }
      );
    }

    const categoryId = request.nextUrl.searchParams.get('category') || '4'; // Default to 4 (Cricket)

    const [events, categories] = await Promise.all([
      BetfairSportsAdapter.getEvents(categoryId),
      BetfairSportsAdapter.getCategories(),
    ]);

    const credentialsConfig = BetfairSportsAdapter.getCredentialsConfig();

    return NextResponse.json({
      data: {
        activeCategoryId: categoryId,
        events,
        categories,
        credentials: {
          mode: credentialsConfig.mode,
          isConfigured: credentialsConfig.isConfigured,
          appKeyMasked: credentialsConfig.appKey,
        },
      },
      meta: {
        provider: 'Betfair API-NG & In-Play Service',
        tenantId: tenantCtx.tenantId,
        timestamp: new Date().toISOString(),
        isTestMode: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message || 'Failed to fetch sports events' },
      { status: 500 }
    );
  }
}
