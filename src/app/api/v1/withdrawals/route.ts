import { NextRequest, NextResponse } from 'next/server';
import { LedgerService } from '@/domain/wallet/ledger';
import { RbacService } from '@/domain/rbac/service';
import { UserContext } from '@/domain/rbac/types';

interface WithdrawalRecord {
  id: string;
  userId: string;
  amountMinor: number;
  currency: string;
  payoutMethod: string;
  destinationAccount: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';
  makerId: string;
  checkerId?: string | null;
  createdAt: string;
}

// In-memory queue of withdrawals
const withdrawalQueue: WithdrawalRecord[] = [
  {
    id: 'wd_req_01',
    userId: 'usr_player_01',
    amountMinor: 5000, // £50.00
    currency: 'GBP',
    payoutMethod: 'UK_FASTER_PAYMENTS',
    destinationAccount: 'Sort: 20-04-12, Acc: ****8912',
    status: 'APPROVED',
    makerId: 'usr_player_01',
    checkerId: 'usr_fin_mgr_01',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({
    data: {
      withdrawals: withdrawalQueue
    },
    meta: {
      correlationId: `corr_wd_${Date.now()}`
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amountGbpMinor, payoutMethod, destinationAccount } = body;

    if (!amountGbpMinor || amountGbpMinor <= 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_AMOUNT', message: 'Withdrawal amount must be greater than zero.' } },
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

    RbacService.assertPlayerEligibility(userCtx);

    // Atomically reserve cash
    const reqId = `wd_req_${Date.now()}`;
    await LedgerService.reserveCash(userCtx.id, amountGbpMinor, reqId);

    const record: WithdrawalRecord = {
      id: reqId,
      userId: userCtx.id,
      amountMinor: amountGbpMinor,
      currency: 'GBP',
      payoutMethod: payoutMethod || 'UK_BANK_TRANSFER',
      destinationAccount: destinationAccount || 'Verified Bank Account',
      status: 'PENDING_APPROVAL',
      makerId: userCtx.id,
      createdAt: new Date().toISOString()
    };

    withdrawalQueue.unshift(record);

    return NextResponse.json({
      data: {
        withdrawal: record,
        message: 'Withdrawal request created. Amount reserved and submitted to finance review queue.'
      },
      meta: {
        correlationId: `corr_wd_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'WITHDRAWAL_FAILED', message: err.message } },
      { status: 400 }
    );
  }
}
