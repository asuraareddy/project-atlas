import { NextResponse } from 'next/server';
import { ludoAdapter } from '@/domain/games/adapters/ludo.adapter';

export async function GET() {
  try {
    const rooms = await ludoAdapter.getActiveRooms();
    return NextResponse.json({
      data: {
        rooms,
        capabilities: ludoAdapter.getCapabilities()
      },
      meta: {
        correlationId: `corr_ludo_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'LUDO_FETCH_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
