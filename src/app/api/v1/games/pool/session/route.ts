import { NextRequest, NextResponse } from 'next/server';
import { PoolSessionStore } from '@/domain/games/pool/session-store';
import { PoolGameMode } from '@/domain/games/pool/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode: PoolGameMode = body.mode || 'vs_bot';
    const player1Name = body.player1Name || 'Player 1';
    const player2Name = body.player2Name || (mode === 'vs_bot' ? 'AceCue (Pro)' : 'Player 2');

    const session = PoolSessionStore.createSession(mode, player1Name, player2Name);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId parameter required' },
        { status: 400 }
      );
    }

    const session = PoolSessionStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get session' },
      { status: 500 }
    );
  }
}
