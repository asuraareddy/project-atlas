import { NextRequest, NextResponse } from 'next/server';
import { FlexrixCasinoAdapter } from '@/domain/games/adapters/casino.adapter';
import { TenantStore } from '@/domain/tenant/store';

export async function POST(request: NextRequest) {
  try {
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
          message: 'Casino module is not enabled for this tenant domain.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { gameId, playerId = 'demo_player_001', currency = 'GBP', language = 'en' } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'gameId is required to launch casino session' },
        { status: 400 }
      );
    }

    // 2. Launch game in sandbox/demo test mode
    const launchResult = await FlexrixCasinoAdapter.launchGame({
      playerId,
      gameId,
      currency,
      language,
      mode: 'sandbox',
    });

    return NextResponse.json({
      data: launchResult,
      meta: {
        isTestMode: true,
        realMoneyAllowed: false,
        tenantId: tenantCtx.tenantId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
