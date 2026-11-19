import { NextRequest, NextResponse } from 'next/server';
import { startNewGameSession } from '@/domain/games/ace2three/engine';
import { validateHandDeclaration } from '@/domain/games/ace2three/validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const player1Name = body.player1Name || 'Player 1 (You)';
    const player2Name = body.player2Name || 'Ace2Three Bot (AI)';
    const stake = typeof body.stake === 'number' ? body.stake : 250;

    const session = startNewGameSession(player1Name, player2Name, stake);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Ace2Three session' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { groups, wildJokerRank } = body;

    if (!Array.isArray(groups) || typeof wildJokerRank !== 'number') {
      return NextResponse.json(
        { success: false, error: 'groups and wildJokerRank are required' },
        { status: 400 }
      );
    }

    const validation = validateHandDeclaration(groups, wildJokerRank as any);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate declare' },
      { status: 500 }
    );
  }
}
