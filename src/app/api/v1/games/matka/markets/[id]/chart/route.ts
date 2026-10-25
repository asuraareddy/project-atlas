import { NextRequest, NextResponse } from 'next/server';
import { matkaAdapter } from '@/domain/games/adapters/matka.adapter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chart = await matkaAdapter.getMarketChart(id);
    return NextResponse.json({
      data: {
        marketId: id,
        chart
      },
      meta: {
        correlationId: `corr_chart_${Date.now()}`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: 'CHART_FETCH_ERROR',
          message: error.message || 'Failed to fetch panel chart',
          correlationId: `err_${Date.now()}`
        }
      },
      { status: 500 }
    );
  }
}
