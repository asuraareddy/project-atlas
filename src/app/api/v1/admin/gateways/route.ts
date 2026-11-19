import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/domain/payments/service';

/**
 * GET /api/v1/admin/gateways
 * Super Admin: Get all platform-owned gateways and tenant gateway overview (Masked)
 */
export async function GET(request: NextRequest) {
  try {
    const platformGateways = PaymentGatewayService.getPlatformGateways();
    const allTenantGateways = PaymentGatewayService.getAllTenantGatewaysOverview();

    return NextResponse.json({
      data: {
        platformGateways,
        allTenantGateways,
        totalGateways: allTenantGateways.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/gateways
 * Super Admin: Create a new platform gateway integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || 'usr_super_admin';

    const created = PaymentGatewayService.createPlatformGateway(body, userId);

    return NextResponse.json(
      {
        data: created,
        message: `Platform payment gateway "${created.providerName}" registered.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: err.message },
      { status: 400 }
    );
  }
}

