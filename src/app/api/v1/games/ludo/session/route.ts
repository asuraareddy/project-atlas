import { NextRequest, NextResponse } from 'next/server';
import { LudoSessionStore } from '@/domain/games/ludo/session-store';
import { LudoEngine } from '@/domain/games/ludo/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'vs_ai';
    const playerCount = body.playerCount === 2 ? 2 : 4;
    const stakeMinor = typeof body.stakeMinor === 'number' ? body.stakeMinor : 200;
    const rakePercentage = typeof body.rakePercentage === 'number' ? body.rakePercentage : 10;
    const isRealMoney = Boolean(body.isRealMoney);
    const userId = body.userId || 'usr_player_01';

    const session = await LudoSessionStore.createSession(
      mode,
      playerCount,
      { stakeMinor, rakePercentage, isRealMoney },
      userId
    );

    const validMoves = session.currentDiceRoll !== null
      ? LudoEngine.getValidMoves(session, session.currentDiceRoll)
      : [];

    return NextResponse.json({
      success: true,
      data: {
        session,
        validMoves
      },
      meta: {
        correlationId: `corr_ludo_sess_${Date.now()}`
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

    const session = LudoSessionStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: { code: 'SESSION_NOT_FOUND', message: 'Ludo session not found' } },
        { status: 404 }
      );
    }

    const validMoves = session.currentDiceRoll !== null
      ? LudoEngine.getValidMoves(session, session.currentDiceRoll)
      : [];

    return NextResponse.json({
      data: {
        session,
        validMoves
      }
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
    const reason = url.searchParams.get('reason') || 'Player aborted matchmaking';

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAM', message: 'sessionId is required' } },
        { status: 400 }
      );
    }

    const session = await LudoSessionStore.cancelSession(sessionId, reason);
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
