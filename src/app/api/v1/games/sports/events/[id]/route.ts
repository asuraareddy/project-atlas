import { NextRequest, NextResponse } from 'next/server';
import { BetfairSportsAdapter } from '@/domain/games/adapters/sports.adapter';
import { TenantStore } from '@/domain/tenant/store';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await props.params;

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

    const detail = await BetfairSportsAdapter.getMatchDetail(eventId);
    if (!detail) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Sports event "${eventId}" not found or inactive.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: detail,
      meta: {
        tenantId: tenantCtx.tenantId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message || 'Failed to retrieve match detail' },
      { status: 500 }
    );
  }
}
