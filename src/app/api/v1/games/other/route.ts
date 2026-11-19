import { NextResponse } from 'next/server';
import { otherGamesAdapter } from '@/domain/games/adapters/other-games.adapter';
import { carromAdapter } from '@/domain/games/adapters/carrom.adapter';
import { ludoAdapter } from '@/domain/games/adapters/ludo.adapter';

export async function GET() {
  try {
    const [games, poolRooms, carromRooms, ludoRooms] = await Promise.all([
      otherGamesAdapter.getGames(),
      otherGamesAdapter.getPoolRooms(),
      carromAdapter.getActiveRooms(),
      ludoAdapter.getActiveRooms(),
    ]);
    return NextResponse.json({
      data: {
        games,
        poolRooms,
        carromRooms,
        ludoRooms,
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
