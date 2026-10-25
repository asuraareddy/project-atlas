import { NextResponse } from 'next/server';
import { carromAdapter } from '@/domain/games/adapters/carrom.adapter';

export async function GET() {
  try {
    const rooms = await carromAdapter.getActiveRooms();
    return NextResponse.json({
      data: {
        rooms,
        capabilities: carromAdapter.getCapabilities()
      },
      meta: {
        correlationId: `corr_crm_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'CARROM_FETCH_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
