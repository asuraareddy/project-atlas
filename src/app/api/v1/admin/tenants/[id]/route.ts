import { NextRequest, NextResponse } from 'next/server';
import { TenantStore } from '@/domain/tenant/store';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const tenant = TenantStore.getTenantById(id) || TenantStore.getTenantBySlug(id);
  if (!tenant) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: `Tenant "${id}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: { tenant },
  });
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const tenant = TenantStore.getTenantById(id) || TenantStore.getTenantBySlug(id);
    if (!tenant) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Tenant "${id}" not found` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, contactEmail, status, branding, domains } = body;

    if (name) tenant.name = name;
    if (contactEmail) tenant.contactEmail = contactEmail;
    if (status) tenant.status = status;
    if (branding) tenant.branding = { ...tenant.branding, ...branding };
    if (domains) tenant.domains = domains;

    TenantStore.saveTenant(tenant);

    return NextResponse.json({
      data: { tenant },
      message: 'Tenant details successfully updated',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
