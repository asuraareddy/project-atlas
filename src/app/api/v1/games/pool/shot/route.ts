import { NextRequest, NextResponse } from 'next/server';
import { PoolSessionStore } from '@/domain/games/pool/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, angle, power, cueBallOffset } = body;

    if (!sessionId || typeof angle !== 'number' || typeof power !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid shot parameters: sessionId, angle, and power are required' },
        { status: 400 }
      );
    }

    const result = PoolSessionStore.executeShot(sessionId, {
      angle,
      power,
      cueBallOffset,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Shot execution failed' },
      { status: 400 }
    );
  }
}
