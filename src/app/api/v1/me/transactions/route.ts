import { NextResponse } from 'next/server';
import { LedgerService } from '@/domain/wallet/ledger';

export async function GET() {
  const userId = 'usr_player_01';
  const transactions = await LedgerService.getTransactionHistory(userId);

  return NextResponse.json({
    data: {
      transactions
    },
    meta: {
      correlationId: `corr_tx_${Date.now()}`
    }
  });
}
