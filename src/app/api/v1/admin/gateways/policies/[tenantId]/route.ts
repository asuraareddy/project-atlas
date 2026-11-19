import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';

interface RouteContext {
  params: Promise<{ tenantId: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { tenantId } = await context.params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    const updated = PaymentGatewayService.setTenantPaymentPolicy(tenantId, body, userId);

    return NextResponse.json({
      data: updated,
      message: `Payment policy for tenant "${tenantId}" updated.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: err.message },
      { status: 400 }
    );
  }
}

