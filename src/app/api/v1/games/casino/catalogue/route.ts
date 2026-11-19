import { NextRequest, NextResponse } from 'next/server';
import { FlexrixCasinoAdapter } from '@/domain/games/adapters/casino.adapter';
import { TenantStore } from '@/domain/tenant/store';
import { CasinoCategory } from '@/domain/games/casino/types';

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  const queryTenant = request.nextUrl.searchParams.get('tenant');
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  const cookieTenant = request.cookies.get('atlas_tenant')?.value;
  const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

  const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);

  // 1. Verify tenant entitlement
  const isEnabled = TenantStore.isGameEnabledForTenant(tenantCtx.tenantId, 'casino');
  if (!isEnabled) {
    return NextResponse.json(
      {
        error: 'FORBIDDEN_403',
        message: `Casino module is not enabled for tenant "${tenantCtx.tenantName}". Please upgrade subscription package.`,
        tenantId: tenantCtx.tenantId,
      },
      { status: 403 }
    );
  }

  // 2. Parse search & filter parameters
  const category = (request.nextUrl.searchParams.get('category') || 'all') as CasinoCategory;
  const search = request.nextUrl.searchParams.get('search') || undefined;
  const provider = request.nextUrl.searchParams.get('provider') || undefined;

  const result = await FlexrixCasinoAdapter.fetchCatalogue({
    category,
    search,
    provider,
  });

  const config = FlexrixCasinoAdapter.getConfigStatus();

  return NextResponse.json({
    data: {
      games: result.games,
      isSandbox: result.isSandbox,
      isConfigured: result.isConfigured,
      providers: FlexrixCasinoAdapter.SUPPORTED_PROVIDERS,
      configStatus: {
        isConfigured: config.isConfigured,
        isSandboxMode: config.isSandboxMode,
        testModeEnabled: config.testModeEnabled,
      },
    },
    meta: {
      total: result.games.length,
      tenantId: tenantCtx.tenantId,
      timestamp: new Date().toISOString(),
    },
  });
}
