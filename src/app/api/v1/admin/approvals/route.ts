import { NextRequest, NextResponse } from 'next/server';
import { ApprovalRequest, UserContext } from '@/domain/rbac/types';
import { RbacService } from '@/domain/rbac/service';

// In-memory approval requests store
const pendingApprovals: ApprovalRequest[] = [
  {
    id: 'appr_req_01',
    actionType: 'WITHDRAWAL_APPROVAL',
    resourceType: 'WITHDRAWAL',
    resourceId: 'wd_req_01',
    makerId: 'usr_player_01',
    checkerId: null,
    status: 'pending',
    reason: 'High-value customer withdrawal exceeding automated limit (50.00).',
    requestedPayload: { amountMinor: 5000, currency: 'GBP', destination: 'Sort 20-04-12 Acc 8912' },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'appr_req_02',
    actionType: 'WALLET_ADJUSTMENT',
    resourceType: 'WALLET',
    resourceId: 'usr_player_02',
    makerId: 'usr_payments_op_01',
    checkerId: null,
    status: 'pending',
    reason: 'Goodwill compensation for delayed result settlement in Kalyan Night.',
    requestedPayload: { amountMinor: 1500, direction: 'CREDIT', currency: 'GBP' },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'appr_req_03',
    actionType: 'GAME_RESULT_PUBLISH',
    resourceType: 'GAME_ROUND',
    resourceId: 'round_mkt_milan_day_1025',
    makerId: 'usr_game_ops_01',
    checkerId: null,
    status: 'pending',
    reason: 'Milan Day closing draw result verification: 147-21-489.',
    requestedPayload: { openPana: '147', jodi: '21', closePana: '489' },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({
    data: {
      approvals: pendingApprovals
    },
    meta: {
      correlationId: `corr_appr_${Date.now()}`,
      count: pendingApprovals.length
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { approvalId, decision, checkerId } = body;

    const approval = pendingApprovals.find((a) => a.id === approvalId);
    if (!approval) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Approval request not found.' } },
        { status: 404 }
      );
    }

    if (decision === 'APPROVED') {
      // STRICT MAKER-CHECKER ENFORCEMENT: Nobody approves their own action!
      RbacService.verifyMakerChecker(approval.makerId, checkerId);

      approval.status = 'approved';
      approval.checkerId = checkerId;
      approval.decidedAt = new Date().toISOString();
    } else {
      approval.status = 'rejected';
      approval.checkerId = checkerId;
      approval.decidedAt = new Date().toISOString();
    }

    return NextResponse.json({
      data: {
        approval,
        message: `Approval request ${decision.toLowerCase()} successfully by checker ${checkerId}.`
      },
      meta: {
        correlationId: `corr_appr_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'MAKER_CHECKER_REJECTED', message: err.message } },
      { status: 403 }
    );
  }
}
