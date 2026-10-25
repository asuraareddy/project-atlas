import { NextRequest, NextResponse } from 'next/server';
import { CryptoWatcherService } from '@/domain/crypto/watcher';
import { ChainTransactionRecord } from '@/domain/crypto/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intentId, confirmations, simulateWrongNetwork, simulateDuplicate } = body;

    const intent = CryptoWatcherService.getIntent(intentId);
    if (!intent) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Intent not found' } },
        { status: 404 }
      );
    }

    // Generate mock on-chain transaction record as observed by the node
    const txHash = simulateDuplicate
      ? '0xdup_hash_98374829374982734892374982374982'
      : `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const chainTx: ChainTransactionRecord = {
      txHash,
      network: simulateWrongNetwork ? ('bitcoin' as any) : intent.network,
      asset: intent.asset,
      destinationAddress: intent.receivingAddress,
      amountBaseUnits: intent.quotedCryptoBaseUnits,
      confirmations: confirmations || intent.requiredConfirmations,
      blockNumber: 52194820,
      status: 'SUCCESS'
    };

    // Independent server-side chain verification
    const updatedIntent = await CryptoWatcherService.verifyAndProcessChainTransaction(
      intentId,
      chainTx
    );

    return NextResponse.json({
      data: {
        intent: updatedIntent,
        observedChainTx: chainTx,
        status: updatedIntent.status
      },
      meta: {
        correlationId: `corr_sim_${Date.now()}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'CHAIN_WATCHER_ERROR', message: err.message } },
      { status: 400 }
    );
  }
}
