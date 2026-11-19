import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';
import { TenantStore } from '@/domain/tenant/store';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function resolveTenantFromRequest(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  const queryTenant = request.nextUrl.searchParams.get('tenant');
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  const cookieTenant = request.cookies.get('atlas_tenant')?.value;
  const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

  const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);
  return TenantStore.getTenantById(tenantCtx.tenantId);
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tenant = resolveTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Tenant not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const overrideCreds = body.credentials;

    const health = await PaymentGatewayService.testGatewayConnection(id, tenant.id, overrideCreds);

    return NextResponse.json({
      data: health,
      success: health.status === 'HEALTHY',
    });
  } catch (err: any) {
    const isForbidden = err.message && err.message.toLowerCase().includes('security violation');
    const isNotFound = err.message && err.message.toLowerCase().includes('not found');
    const status = isForbidden ? 403 : isNotFound ? 404 : 400;
    return NextResponse.json(
      { error: isForbidden ? 'FORBIDDEN' : isNotFound ? 'NOT_FOUND' : 'TEST_FAILED', message: err.message },
      { status }
    );
  }
}

