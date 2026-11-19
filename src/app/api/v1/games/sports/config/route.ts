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
    const isEnabled = TenantStore.isGameEnabledForTenant(tenantCtx.tenantId, 'sports');

    const config = BetfairSportsAdapter.getCredentialsConfig();

    return NextResponse.json({
      data: {
        ...config,
        isTenantEnabled: isEnabled,
        tenantId: tenantCtx.tenantId,
        supportedSports: BetfairSportsAdapter.SUPPORTED_CATEGORIES,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
