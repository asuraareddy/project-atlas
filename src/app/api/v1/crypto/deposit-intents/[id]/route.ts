import { NextRequest, NextResponse } from 'next/server';
import { CryptoWatcherService } from '@/domain/crypto/watcher';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const intent = CryptoWatcherService.getIntent(id);

  if (!intent) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: `Deposit intent ${id} not found.` } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: {
      intent
    },
    meta: {
      correlationId: `corr_dep_${Date.now()}`
    }
  });
}
