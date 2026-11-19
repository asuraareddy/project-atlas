import { NextRequest, NextResponse } from 'next/server';
import { CarromSessionStore } from '@/domain/games/carrom/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, x } = body;

    if (!sessionId || x === undefined) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'sessionId and x are required' } },
        { status: 400 }
      );
    }

    const session = CarromSessionStore.positionStriker(sessionId, Number(x));

    return NextResponse.json({
      success: true,
      data: { session }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'POSITION_UPDATE_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
