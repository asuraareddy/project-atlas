import { NextResponse } from 'next/server';
import { LedgerService } from '@/domain/wallet/ledger';

export async function GET() {
  const userId = 'usr_player_01';
  const wallet = await LedgerService.getBalance(userId);

  return NextResponse.json({
    data: {
      id: userId,
      email: 'player@atlas-gaming.co.uk',
      displayName: 'Alex P.',
      role: 'PLAYER',
      organizationId: 'org_atlas_uk_001',
      accountStatus: 'active',
      kycStatus: 'verified',
      limits: {
        dailyDepositLimitGbp: 500,
        dailyLossLimitGbp: 250,
        sessionTimeoutMinutes: 60
      },
      wallet
    },
    meta: {
      correlationId: `corr_me_${Date.now()}`
    }
  });
}
