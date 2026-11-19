import { NextRequest, NextResponse } from 'next/server';
import { CarromSessionStore } from '@/domain/games/carrom/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'vs_ai';
    const stakeMinor = typeof body.stakeMinor === 'number' ? body.stakeMinor : 200;
    const rakePercentage = typeof body.rakePercentage === 'number' ? body.rakePercentage : 10;
    const isRealMoney = Boolean(body.isRealMoney);
    const userId = body.userId || 'usr_player_01';

    const session = await CarromSessionStore.createSession(
      mode,
      { stakeMinor, rakePercentage, isRealMoney },
      userId
    );

    return NextResponse.json({
      success: true,
      data: { session },
      meta: {
        correlationId: `corr_carrom_sess_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SESSION_CREATE_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAM', message: 'sessionId is required' } },
        { status: 400 }
      );
    }

    const session = CarromSessionStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Carrom session not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { session }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SESSION_FETCH_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const reason = url.searchParams.get('reason') || 'Player aborted Carrom match';

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAM', message: 'sessionId is required' } },
        { status: 400 }
      );
    }

    const session = await CarromSessionStore.cancelSession(sessionId, reason);
    return NextResponse.json({
      success: true,
      data: { session }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SESSION_CANCEL_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
