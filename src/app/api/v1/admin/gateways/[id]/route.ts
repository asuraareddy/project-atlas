import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    const updated = PaymentGatewayService.updatePlatformGateway(id, body, userId);

    return NextResponse.json({
      data: updated,
      message: `Platform gateway "${updated.providerName}" updated successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: err.message },
      { status: 400 }
    );
  }
}

