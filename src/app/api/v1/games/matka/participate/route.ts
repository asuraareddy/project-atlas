import { NextRequest, NextResponse } from 'next/server';
import { matkaAdapter } from '@/domain/games/adapters/matka.adapter';
import { LedgerService } from '@/domain/wallet/ledger';
import { RbacService } from '@/domain/rbac/service';
import { UserContext } from '@/domain/rbac/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, entryType, selectedValues, stakeMinor, currency, idempotencyKey } = body;

    if (!marketId || !entryType || !selectedValues || !stakeMinor) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing required participation parameters' } },
        { status: 400 }
      );
    }

    // Default test user context in development
    const userCtx: UserContext = {
      id: 'usr_player_01',
      email: 'player@atlas-gaming.co.uk',
      role: 'PLAYER',
      organizationId: 'org_atlas_uk_001',
      accountStatus: 'active',
      kycStatus: 'verified'
    };

    // 1. Central Eligibility Verification
    RbacService.assertPlayerEligibility(userCtx);

    // 2. Atomic Stake Reservation from Wallet Ledger
    await LedgerService.reserveCash(userCtx.id, stakeMinor, `matka_stake_${marketId}`);

    // 3. Adapter Validation & Submission (Cut-off strictly checked on server)
    const receipt = await matkaAdapter.submitParticipation({
      marketId,
      entryType,
      selectedValues,
      stakeMinor,
      currency: currency || 'GBP',
      userId: userCtx.id,
      idempotencyKey: idempotencyKey || `part_idem_${Date.now()}`
    });

    return NextResponse.json({
      data: {
        receipt,
        status: 'CONFIRMED'
      },
      meta: {
        correlationId: `corr_part_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: 'PARTICIPATION_REJECTED',
          message: err.message || 'Participation could not be accepted',
          correlationId: `err_${Date.now()}`
        }
      },
      { status: 400 }
    );
  }
}
