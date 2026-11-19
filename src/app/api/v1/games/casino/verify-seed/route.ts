import { NextRequest, NextResponse } from 'next/server';
import { FlexrixCasinoAdapter } from '@/domain/games/adapters/casino.adapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverSeed, clientSeed, nonce = 1 } = body;

    if (!serverSeed || !clientSeed) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'serverSeed and clientSeed are required' },
        { status: 400 }
      );
    }

    const verificationResult = FlexrixCasinoAdapter.verifyProvablyFair(
      serverSeed,
      clientSeed,
      Number(nonce)
    );

    return NextResponse.json({
      data: verificationResult,
      meta: {
        timestamp: new Date().toISOString(),
        algorithm: 'HMAC-SHA256',
        standard: '1Stake Provably Fair Specification v2.0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
