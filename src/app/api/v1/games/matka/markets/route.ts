import { NextResponse } from 'next/server';
import { matkaAdapter } from '@/domain/games/adapters/matka.adapter';

export async function GET() {
  try {
    const markets = await matkaAdapter.getMarkets();
    return NextResponse.json({
      data: {
        markets
      },
      meta: {
        correlationId: `corr_mkt_${Date.now()}`,
        count: markets.length
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: 'PROVIDER_ERROR',
          message: error.message || 'Failed to fetch Matka markets',
          correlationId: `err_${Date.now()}`
        }
      },
      { status: 500 }
    );
  }
}
