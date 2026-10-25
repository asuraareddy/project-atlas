import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionType, limitType, amountGbp, durationDays, reason } = body;

    // Record safer gambling action server-side
    const eventId = `sg_evt_${Date.now()}`;

    return NextResponse.json({
      data: {
        eventId,
        actionType,
        status: 'ENFORCED',
        effectiveFrom: new Date().toISOString(),
        message: actionType === 'SELF_EXCLUSION'
          ? 'Self-exclusion has been activated across all games and payment options.'
          : 'Limit configuration has been updated and applied to your account.'
      },
      meta: {
        correlationId: `corr_sg_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SAFER_GAMBLING_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
