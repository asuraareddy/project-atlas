import { NextResponse } from 'next/server';
import { CryptoWatcherService } from '@/domain/crypto/watcher';

export async function GET() {
  const assets = CryptoWatcherService.getWhitelistedAssets();
  return NextResponse.json({
    data: {
      assets
    },
    meta: {
      correlationId: `corr_wl_${Date.now()}`
    }
  });
}
