import { NextRequest, NextResponse } from 'next/server';
import { TenantStore } from '@/domain/tenant/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenant = TenantStore.getTenantById(id) || TenantStore.getTenantBySlug(id);

  if (!tenant) {
    return NextResponse.json({ error: `Tenant '${id}' not found.` }, { status: 404 });
  }

  const pointConfig = tenant.pointConfig || {
    pointToCurrencyRate: 1.0,
    currencyCode: 'UNDEFINED',
    currencySymbol: '',
    pointUnitName: 'PTS',
    displayAsPointsOnly: true,
  };

  return NextResponse.json({
    data: {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      pointConfig,
      description: 'Point valuation is configured per client. By default, 1 Point = 1 (currency undefined / points only).',
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const tenant = TenantStore.getTenantById(id) || TenantStore.getTenantBySlug(id);
  if (!tenant) {
    return NextResponse.json({ error: `Tenant '${id}' not found.` }, { status: 404 });
  }

  const rate =
    typeof body.pointToCurrencyRate === 'number' && body.pointToCurrencyRate > 0
      ? body.pointToCurrencyRate
      : 1.0;
  const currency =
    typeof body.currencyCode === 'string' && body.currencyCode.trim()
      ? body.currencyCode.trim().toUpperCase()
      : 'UNDEFINED';
  const unit =
    typeof body.pointUnitName === 'string' && body.pointUnitName.trim()
      ? body.pointUnitName.trim().toUpperCase()
      : 'PTS';

  tenant.pointConfig = {
    pointToCurrencyRate: rate,
    currencyCode: currency,
    currencySymbol: '',
    pointUnitName: unit,
    displayAsPointsOnly: true,
  };
  tenant.updatedAt = new Date().toISOString();

  // Also sync to C# backend if active
  try {
    await fetch(`http://localhost:5000/api/v1/admin/tenants/${tenant.id}/point-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pointToCurrencyRate: rate,
        currencyCode: currency,
        pointUnitName: unit,
      }),
    });
  } catch (err) {
    // Non-blocking sync
  }

  return NextResponse.json({
    data: {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      pointConfig: tenant.pointConfig,
      message: `Point configuration updated successfully. 1 Point = ${rate} ${currency}.`,
    },
  });
}
