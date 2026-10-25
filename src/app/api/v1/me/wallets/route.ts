import { NextResponse } from 'next/server';
import { LedgerService } from '@/domain/wallet/ledger';

export async function GET() {
  const userId = 'usr_player_01';
  const wallet = await LedgerService.getBalance(userId);

  return NextResponse.json({
    data: {
      wallet
    },
    meta: {
      correlationId: `corr_wal_${Date.now()}`
    }
  });
}
