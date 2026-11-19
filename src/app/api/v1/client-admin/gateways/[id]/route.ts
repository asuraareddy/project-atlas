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

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tenant = resolveTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Tenant not found.' }, { status: 404 });
    }

    const body = await request.json();
    const userId = request.headers.get('x-user-id') || `client_admin_${tenant.slug}`;

    const saved = PaymentGatewayService.saveClientOwnedGateway(
      tenant.id,
      {
        ...body,
        id,
      },
      userId
    );

    return NextResponse.json({
      data: saved,
      message: `Gateway "${saved.providerName}" updated successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'BAD_REQUEST', message: err.message }, { status: 400 });
  }
}

