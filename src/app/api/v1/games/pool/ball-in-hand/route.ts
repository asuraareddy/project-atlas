import { NextRequest, NextResponse } from 'next/server';
import { PoolSessionStore } from '@/domain/games/pool/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, x, y } = body;

    if (!sessionId || typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json(
        { success: false, error: 'sessionId, x, and y coordinates are required' },
        { status: 400 }
      );
    }

    const result = PoolSessionStore.setBallInHand(sessionId, x, y);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid cue ball placement' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ball in hand placement failed' },
      { status: 500 }
    );
  }
}
