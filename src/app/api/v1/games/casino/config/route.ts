import { NextResponse } from 'next/server';
import { FlexrixCasinoAdapter } from '@/domain/games/adapters/casino.adapter';

export async function GET() {
  const config = FlexrixCasinoAdapter.getConfigStatus();

  return NextResponse.json({
    data: {
      ...config,
      // Strictly do not return secrets
      merchantSecretMasked: config.merchantSecretConfigured ? '••••••••••••••••' : null,
    },
  });
}
