import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';
import type { PaymentGatewayProvider } from '@/domain/payments/types';

interface RouteContext {
  params: Promise<{ provider: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { provider } = await context.params;
    const rawBody = await request.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    const signature =
      request.headers.get('x-razorpay-signature') ||
      request.headers.get('stripe-signature') ||
      request.headers.get('x-verify') ||
      request.headers.get('x-signature') ||
      null;

    const result = await PaymentGatewayService.processDepositWebhook({
      providerKey: provider as PaymentGatewayProvider,
      payload,
      signatureHeader: signature,
      rawBodyString: rawBody,
    });

    return NextResponse.json({
      status: 'success',
      data: result,
      message: result.duplicate ? 'Webhook acknowledged (already processed).' : 'Deposit processed successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'WEBHOOK_REJECTED', message: err.message },
      { status: 400 }
    );
  }
}

