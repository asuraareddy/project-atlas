import { NextRequest, NextResponse } from 'next/server';
import { TenantStore, B2B_PACKAGES } from '@/domain/tenant/store';
import { GameKey, TenantGameEntitlement } from '@/domain/tenant/types';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const tenant = TenantStore.getTenantById(id) || TenantStore.getTenantBySlug(id);
    if (!tenant) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: `Tenant "${id}" not found` },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { packageCode, gameConfigs } = body;

    if (packageCode) {
      const pkg = B2B_PACKAGES.find((p) => p.code === packageCode);
      if (pkg) {
        tenant.packageCode = pkg.code;
        // If caller didn't pass explicit gameConfigs, auto-apply package inclusions
        if (!gameConfigs) {
          tenant.gameConfigs = tenant.gameConfigs.map((cfg) => ({
            ...cfg,
            isEnabled: pkg.includedGames.includes(cfg.gameKey),
          }));
        }
      }
    }

    if (Array.isArray(gameConfigs)) {
      tenant.gameConfigs = gameConfigs;
    }

    TenantStore.saveTenant(tenant);

    return NextResponse.json({
      data: {
        tenantId: tenant.id,
        packageCode: tenant.packageCode,
        gameConfigs: tenant.gameConfigs,
        enabledGames: tenant.gameConfigs.filter((c) => c.isEnabled).map((c) => c.gameKey),
      },
      message: 'Tenant game entitlements and commercial package updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
