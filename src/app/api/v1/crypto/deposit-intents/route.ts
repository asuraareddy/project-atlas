import { NextRequest, NextResponse } from 'next/server';
import { CryptoWatcherService } from '@/domain/crypto/watcher';
import { RbacService } from '@/domain/rbac/service';
import { UserContext } from '@/domain/rbac/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { network, asset, amountGbpMinor } = body;

    if (!network || !asset || !amountGbpMinor) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Network, asset and amount in GBP pence required.' } },
        { status: 400 }
      );
    }

    const userCtx: UserContext = {
      id: 'usr_player_01',
      email: 'player@atlas-gaming.co.uk',
      role: 'PLAYER',
      organizationId: 'org_atlas_uk_001',
      accountStatus: 'active',
      kycStatus: 'verified'
    };

    // Assert eligibility
    RbacService.assertPlayerEligibility(userCtx);

    const intent = await CryptoWatcherService.createDepositIntent(
      userCtx.id,
      network,
      asset,
      amountGbpMinor
    );

    return NextResponse.json({
      data: {
        intent
      },
      meta: {
        correlationId: `corr_dep_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'DEPOSIT_INTENT_FAILED', message: err.message } },
      { status: 400 }
    );
  }
}
