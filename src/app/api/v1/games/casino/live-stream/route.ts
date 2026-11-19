import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveDealerStreamUrl } from '@/domain/games/casino/live-stream';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId') || 'blackjack';

    const streamUrl = await fetchLiveDealerStreamUrl(gameId);

    return NextResponse.json({
      ok: true,
      gameId,
      streamUrl,
      provider: 'JackTop Studios',
      streamQuality: '1080p HD Ultra-Low Latency',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to retrieve live stream URL' },
      { status: 500 }
    );
  }
}
