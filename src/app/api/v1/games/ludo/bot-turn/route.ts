import { NextRequest, NextResponse } from 'next/server';
import { LudoSessionStore } from '@/domain/games/ludo/session-store';
import { LudoEngine } from '@/domain/games/ludo/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'sessionId is required' } },
        { status: 400 }
      );
    }

    const { state, acted } = await LudoSessionStore.processBotTurnIfActive(sessionId);
    const validMoves = state.currentDiceRoll !== null
      ? LudoEngine.getValidMoves(state, state.currentDiceRoll)
      : [];

    return NextResponse.json({
      success: true,
      acted,
      data: {
        session: state,
        validMoves
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'BOT_TURN_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
