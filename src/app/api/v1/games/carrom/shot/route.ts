import { NextRequest, NextResponse } from 'next/server';
import { CarromSessionStore } from '@/domain/games/carrom/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, angle, power } = body;

    if (!sessionId || angle === undefined || power === undefined) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'sessionId, angle, and power are required' } },
        { status: 400 }
      );
    }

    const session = await CarromSessionStore.executeShot(sessionId, Number(angle), Number(power));

    return NextResponse.json({
      success: true,
      data: { session }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'SHOT_EXECUTION_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
