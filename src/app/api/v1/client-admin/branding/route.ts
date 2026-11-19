import { NextRequest, NextResponse } from 'next/server';
import { TenantStore } from '@/domain/tenant/store';

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  const queryTenant = request.nextUrl.searchParams.get('tenant');
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  const cookieTenant = request.cookies.get('atlas_tenant')?.value;
  const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

  const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);
  const tenant = TenantStore.getTenantById(tenantCtx.tenantId);

  if (!tenant) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Tenant not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      tenantId: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      branding: tenant.branding,
      domains: tenant.domains,
      enabledGames: tenant.gameConfigs.filter((c) => c.isEnabled).map((c) => c.gameKey),
    },
  });
}

export async function PUT(request: NextRequest) {
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
    const queryTenant = request.nextUrl.searchParams.get('tenant');
    const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
    const cookieTenant = request.cookies.get('atlas_tenant')?.value;
    const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

    const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);
    const tenant = TenantStore.getTenantById(tenantCtx.tenantId);

    if (!tenant) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Tenant not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { branding } = body;

    if (branding) {
      tenant.branding = {
        ...tenant.branding,
        ...branding,
      };
      TenantStore.saveTenant(tenant);
    }

    return NextResponse.json({
      data: {
        tenantId: tenant.id,
        branding: tenant.branding,
      },
      message: 'Branding configuration updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
