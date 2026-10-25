import { NextRequest, NextResponse } from 'next/server';
import { matkaAdapter } from '@/domain/games/adapters/matka.adapter';
import { LedgerService } from '@/domain/wallet/ledger';
import { RbacService } from '@/domain/rbac/service';
import { UserContext } from '@/domain/rbac/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      marketId,
      entryType,
      selectedValues,
      stakeMinor,
      currency,
      idempotencyKey,
      date,
      gameType,
      category,
      entries,
      totalPoints
    } = body;

    // Validate marketId & entryType
    if (!marketId || !entryType) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing required marketId or entryType' } },
        { status: 400 }
      );
    }

    // Support both multi-entry array and single value
    const hasEntries = Array.isArray(entries) && entries.length > 0;
    const finalSelectedValues = selectedValues || (hasEntries ? entries.map((e: any) => e.pattiNumber).join(',') : '');

    if (!finalSelectedValues && !hasEntries) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing selected Patti numbers or entries' } },
        { status: 400 }
      );
    }

    // Calculate effective total points and stake
    let effectiveStakeMinor = stakeMinor;
    if (!effectiveStakeMinor && (totalPoints || hasEntries)) {
      const calculatedPoints = totalPoints || entries.reduce((acc: number, e: any) => acc + (e.points || 1), 0);
      // 1 point = £1.00 (100 minor units)
      effectiveStakeMinor = Math.round(calculatedPoints * 100);
    }

    if (!effectiveStakeMinor || effectiveStakeMinor <= 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_STAKE', message: 'Stake amount or total points must be greater than zero' } },
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
    await LedgerService.reserveCash(userCtx.id, effectiveStakeMinor, `matka_stake_${marketId}`);

    // 3. Adapter Validation & Submission (Cut-off strictly checked on server)
    const receipt = await matkaAdapter.submitParticipation({
      marketId,
      entryType,
      selectedValues: finalSelectedValues,
      stakeMinor: effectiveStakeMinor,
      currency: currency || 'GBP',
      userId: userCtx.id,
      idempotencyKey: idempotencyKey || `part_idem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: date || new Date().toISOString().split('T')[0],
      gameType: gameType || 'OPEN',
      category,
      entries,
      totalPoints
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
