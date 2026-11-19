import { NextRequest, NextResponse } from 'next/server';
import { CarromAnalyticsService } from '@/domain/games/carrom/analytics';

export async function GET(_req: NextRequest) {
  try {
    const summary = CarromAnalyticsService.getSummary();
    return NextResponse.json({
      success: true,
      data: summary,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'ANALYTICS_FETCH_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
