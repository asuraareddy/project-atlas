import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const overrideCreds = body.credentials;

    const health = await PaymentGatewayService.testGatewayConnection(id, undefined, overrideCreds);

    return NextResponse.json({
      data: health,
      success: health.status === 'HEALTHY',
    });
  } catch (err: any) {
    const isNotFound = err.message && err.message.toLowerCase().includes('not found');
    return NextResponse.json(
      { error: isNotFound ? 'NOT_FOUND' : 'TEST_FAILED', message: err.message },
      { status: isNotFound ? 404 : 400 }
    );
  }
}

