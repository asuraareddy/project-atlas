import { NextRequest, NextResponse } from 'next/server';
import { FlexrixCasinoAdapter } from '@/domain/games/adapters/casino.adapter';
import { SeamlessWalletCallbackPayload } from '@/domain/games/casino/types';

export async function POST(request: NextRequest) {
  try {
    const body: SeamlessWalletCallbackPayload = await request.json();

    const headers: Record<string, string | undefined> = {
      'x-signature': request.headers.get('x-signature') || undefined,
      'x-timestamp': request.headers.get('x-timestamp') || undefined,
      'x-nonce': request.headers.get('x-nonce') || undefined,
      'x-merchant-id': request.headers.get('x-merchant-id') || undefined,
    };

    const response = FlexrixCasinoAdapter.processSandboxCallback(body, headers);

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: response.error },
        { status: 400 }
      );
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: `Malformed callback request: ${error.message}` },
      { status: 400 }
    );
  }
}
