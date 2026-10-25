import { NextResponse } from 'next/server';
import { CryptoWatcherService } from '@/domain/crypto/watcher';
import { CryptoNetwork, CryptoAsset } from '@/domain/crypto/types';

export async function GET() {
  const assets = CryptoWatcherService.getWhitelistedAssets();
  return NextResponse.json({
    data: {
      assets
    },
    meta: {
      correlationId: `corr_wl_${Date.now()}`
    }
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { 
      network, 
      asset, 
      receivingAddress, 
      rateToGbp, 
      requiredConfirmations, 
      minDepositGbpMinor, 
      maxDepositGbpMinor, 
      enabled, 
      networkLabel 
    } = body;

    if (!network || !asset) {
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMETERS', message: 'network and asset are required' } },
        { status: 400 }
      );
    }

    const updated = await CryptoWatcherService.updateAssetConfig(
      network as CryptoNetwork,
      asset as CryptoAsset,
      {
        receivingAddress,
        rateToGbp: rateToGbp !== undefined ? Number(rateToGbp) : undefined,
        requiredConfirmations: requiredConfirmations !== undefined ? Number(requiredConfirmations) : undefined,
        minDepositGbpMinor: minDepositGbpMinor !== undefined ? Number(minDepositGbpMinor) : undefined,
        maxDepositGbpMinor: maxDepositGbpMinor !== undefined ? Number(maxDepositGbpMinor) : undefined,
        enabled,
        networkLabel
      }
    );

    // Generate updated live QR preview
    const qrPreview = await CryptoWatcherService.generatePreviewQr(
      updated.network,
      updated.receivingAddress
    );

    return NextResponse.json({
      success: true,
      data: {
        asset: updated,
        qrPreview
      },
      meta: {
        correlationId: `corr_wl_upd_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'UPDATE_FAILED', message: err.message || 'Failed to update asset config' } },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Dynamic Live QR Preview generator (Used by Admin as they type or paste addresses)
    if (body.action === 'preview_qr') {
      const { network, receivingAddress, sampleAmount } = body;
      if (!network || !receivingAddress) {
        return NextResponse.json(
          { error: { code: 'INVALID_PARAMETERS', message: 'network and receivingAddress required' } },
          { status: 400 }
        );
      }
      const qrPreview = await CryptoWatcherService.generatePreviewQr(
        network as CryptoNetwork,
        receivingAddress,
        sampleAmount ? Number(sampleAmount) : 25
      );
      return NextResponse.json({
        data: qrPreview
      });
    }

    // 2. Add new asset
    const added = await CryptoWatcherService.addAssetConfig(body.assetConfig);
    const qrPreview = await CryptoWatcherService.generatePreviewQr(
      added.network,
      added.receivingAddress
    );

    return NextResponse.json({
      success: true,
      data: {
        asset: added,
        qrPreview
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'CREATION_FAILED', message: err.message || 'Failed to add asset config' } },
      { status: 400 }
    );
  }
}
