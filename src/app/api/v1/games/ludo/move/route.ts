import { NextRequest, NextResponse } from 'next/server';
import { LudoSessionStore } from '@/domain/games/ludo/session-store';
import { LudoEngine } from '@/domain/games/ludo/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, color, tokenId } = body;

    if (!sessionId || !color || tokenId === undefined) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'sessionId, color, and tokenId are required' } },
        { status: 400 }
      );
    }

    const session = await LudoSessionStore.moveToken(sessionId, color, Number(tokenId));
    const validMoves = session.currentDiceRoll !== null
      ? LudoEngine.getValidMoves(session, session.currentDiceRoll)
      : [];

    return NextResponse.json({
      success: true,
      data: {
        session,
        validMoves
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'TOKEN_MOVE_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
