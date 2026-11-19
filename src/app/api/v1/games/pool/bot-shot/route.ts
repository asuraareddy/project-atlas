import { NextRequest, NextResponse } from 'next/server';
import { PoolSessionStore } from '@/domain/games/pool/session-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const result = PoolSessionStore.executeBotShot(sessionId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Bot shot execution failed' },
      { status: 400 }
    );
  }
}
