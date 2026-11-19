import { NextRequest, NextResponse } from 'next/server';
import { CarromSessionStore } from '@/domain/games/carrom/session-store';

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

    const { state, acted, shotDetails } = await CarromSessionStore.processBotShotIfActive(sessionId);

    return NextResponse.json({
      success: true,
      acted,
      shotDetails,
      data: { session: state }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'BOT_SHOT_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
