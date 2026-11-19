import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';
import { TenantStore } from '@/domain/tenant/store';

export async function GET() {
  try {
    const tenants = TenantStore.getAllTenants();
    const policies = tenants.map((t) => ({
      tenant: { id: t.id, slug: t.slug, brandName: t.branding?.brandName || t.name },
      policy: PaymentGatewayService.getTenantPaymentPolicy(t.id),
    }));

    return NextResponse.json({
      data: { policies },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

