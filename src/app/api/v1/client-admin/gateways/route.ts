import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';
import { TenantStore } from '@/domain/tenant/store';

function resolveTenantFromRequest(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  const queryTenant = request.nextUrl.searchParams.get('tenant');
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  const cookieTenant = request.cookies.get('atlas_tenant')?.value;
  const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

  const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);
  return TenantStore.getTenantById(tenantCtx.tenantId);
}

/**
 * GET /api/v1/client-admin/gateways
 * Client Admin: List payment gateways accessible for this specific tenant
 */
export async function GET(request: NextRequest) {
  try {
    const tenant = resolveTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Tenant not found.' }, { status: 404 });
    }

    const gateways = PaymentGatewayService.getClientGatewaysForTenant(tenant.id);
    const policy = PaymentGatewayService.getTenantPaymentPolicy(tenant.id);
    const transactions = PaymentGatewayService.getTransactionsForTenant(tenant.id);

    return NextResponse.json({
      data: {
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        brandName: tenant.branding?.brandName || tenant.name,
        gateways,
        policy,
        transactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

/**
 * POST /api/v1/client-admin/gateways
 * Client Admin: Connect a new client-owned payment gateway
 */
export async function POST(request: NextRequest) {
  try {
    const tenant = resolveTenantFromRequest(request);
    if (!tenant) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Tenant not found.' }, { status: 404 });
    }

    const body = await request.json();
    const userId = request.headers.get('x-user-id') || `client_admin_${tenant.slug}`;

    const saved = PaymentGatewayService.saveClientOwnedGateway(tenant.id, body, userId);

    return NextResponse.json(
      {
        data: saved,
        message: `Payment gateway "${saved.providerName}" connected successfully for ${tenant.branding?.brandName || tenant.name}.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'BAD_REQUEST', message: err.message }, { status: 400 });
  }
}

