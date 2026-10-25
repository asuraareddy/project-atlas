import { NextResponse } from 'next/server';
import { otherGamesAdapter } from '@/domain/games/adapters/other-games.adapter';

export async function GET() {
  try {
    const games = await otherGamesAdapter.getGames();
    const poolRooms = await otherGamesAdapter.getPoolRooms();
    return NextResponse.json({
      data: {
        games,
        poolRooms,
        capabilities: otherGamesAdapter.getCapabilities()
      },
      meta: {
        correlationId: `corr_other_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'OTHER_GAMES_FETCH_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
