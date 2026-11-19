import { NextRequest, NextResponse } from 'next/server';
import { TenantStore } from '@/domain/tenant/store';
import { GameKey } from '@/domain/tenant/types';

export interface GameCategoryDto {
  key: string;
  label: string;
  route: string;
  order: number;
  enabled: boolean;
  status: 'available' | 'maintenance' | 'coming_soon' | 'disabled';
  description: string;
  badge?: string;
  artworkIcon: string;
}

const DEFAULT_DEFINITIONS: Record<GameKey, Omit<GameCategoryDto, 'order' | 'enabled'>> = {
  matka: {
    key: 'matka',
    label: 'Matka',
    route: '/matka',
    status: 'available',
    description: 'Classic number draw markets with server-verified draw schedules, cut-offs, and live result charts.',
    badge: 'Category 1',
    artworkIcon: 'Dice5',
  },
  casino: {
    key: 'casino',
    label: 'Casino Games',
    route: '/casino',
    status: 'available',
    description: 'Unified iGaming aggregation featuring slots, live dealer tables, and crash games in test mode.',
    badge: 'Category 2',
    artworkIcon: 'Sparkles',
  },
  sports: {
    key: 'sports',
    label: 'Sports Exchange',
    route: '/sports',
    status: 'available',
    description: 'Betfair API-NG live exchange markets, in-play cricket scoreboards, and bookmaker odds.',
    badge: 'Category 3',
    artworkIcon: 'Trophy',
  },
  'other-games': {
    key: 'other-games',
    label: 'Other Games',
    route: '/other-games',
    status: 'available',
    description: 'Explore certified 8-Ball Pool Pro, Carrom Tabletop, Ludo Grand Circuit, and Ace2Three Indian Rummy.',
    badge: 'Category 4',
    artworkIcon: 'Layers',
  },
  carrom: {
    key: 'carrom',
    label: 'Carrom',
    route: '/carrom',
    status: 'available',
    description: 'Precision tabletop multiplayer board challenge. Real-time turn state and shot validation.',
    badge: 'Category 4',
    artworkIcon: 'Target',
  },
  ludo: {
    key: 'ludo',
    label: 'Ludo',
    route: '/ludo',
    status: 'available',
    description: 'Competitive 2-4 player board action with cryptographic randomness and anti-collusion monitoring.',
    badge: 'Category 4',
    artworkIcon: 'Gamepad2',
  },
  pool: {
    key: 'pool',
    label: '8-Ball Pool Pro',
    route: '/pool',
    status: 'available',
    description: 'Tournament 8-ball billiards with realistic cue ball physics, slingshot shooting, and pocketing.',
    badge: 'Category 4',
    artworkIcon: 'CircleDot',
  },
};

export async function GET(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost';
  const queryTenant = request.nextUrl.searchParams.get('tenant');
  const headerTenant = request.headers.get('x-tenant-id') || request.headers.get('x-tenant-slug');
  const cookieTenant = request.cookies.get('atlas_tenant')?.value;
  const requestedTenant = queryTenant || headerTenant || cookieTenant || null;

  const tenantCtx = TenantStore.getTenantContext(host, requestedTenant);
  const tenant = TenantStore.getTenantById(tenantCtx.tenantId);

  let categories: GameCategoryDto[] = [];

  // Category-wise canonical mapping & ordering
  const CANONICAL_CATEGORIES: Record<string, { order: number; badge: string }> = {
    matka: { order: 1, badge: 'Category 1' },
    casino: { order: 2, badge: 'Category 2' },
    sports: { order: 3, badge: 'Category 3' },
    'other-games': { order: 4, badge: 'Category 4' },
  };

  if (tenant && tenant.gameConfigs) {
    // Carrom, Ludo, and Pool are moved under Other Games (Category 4)
    const isUnderOtherGames = (k: string) => k === 'carrom' || k === 'ludo' || k === 'pool';
    const hasOtherGameEnabled = tenant.gameConfigs.some(
      (cfg) => cfg.isEnabled && (cfg.gameKey === 'other-games' || isUnderOtherGames(cfg.gameKey))
    );

    categories = tenant.gameConfigs
      .filter((cfg) => cfg.isEnabled && DEFAULT_DEFINITIONS[cfg.gameKey] && !isUnderOtherGames(cfg.gameKey))
      .map((cfg) => {
        const base = DEFAULT_DEFINITIONS[cfg.gameKey];
        const canon = CANONICAL_CATEGORIES[cfg.gameKey];

        // Replace legacy badges ("Test Mode" -> "Category 2", "Live Odds" -> "Category 3", etc.)
        let badge = canon ? canon.badge : (cfg.customBadge || base.badge);
        if (cfg.customBadge && !['Test Mode', 'Live Odds', 'Live Cricket', 'Carrom, Ludo & Pool', 'Main Draw'].includes(cfg.customBadge)) {
          badge = cfg.customBadge;
        }

        return {
          ...base,
          label: cfg.customTitle || base.label,
          badge,
          order: canon ? canon.order : cfg.displayOrder,
          enabled: true,
          status: 'available',
        };
      });

    // Ensure Other Games (Category 4) is present if any subgame (Carrom, Ludo, Pool, Other) is enabled
    if (hasOtherGameEnabled && !categories.some((c) => c.key === 'other-games')) {
      const otherDef = DEFAULT_DEFINITIONS['other-games'];
      categories.push({
        ...otherDef,
        badge: 'Category 4',
        order: 4,
        enabled: true,
        status: 'available',
      });
    }

    // Sort strictly Category-wise in Order: Category 1 -> Category 2 -> Category 3 -> Category 4
    categories.sort((a, b) => a.order - b.order);
  }

  // Fallback if tenant has no games configured
  if (categories.length === 0) {
    const keys: GameKey[] = ['matka', 'casino', 'sports', 'other-games'];
    categories = keys.map((key) => {
      const canon = CANONICAL_CATEGORIES[key];
      return {
        ...DEFAULT_DEFINITIONS[key],
        badge: canon?.badge || DEFAULT_DEFINITIONS[key].badge,
        order: canon?.order || 1,
        enabled: true,
        status: 'available',
      };
    });
    categories.sort((a, b) => a.order - b.order);
  }

  return NextResponse.json({
    data: {
      categories,
      tenant: {
        id: tenantCtx.tenantId,
        slug: tenantCtx.tenantSlug,
        name: tenantCtx.tenantName,
        branding: tenantCtx.branding,
        pointConfig: tenantCtx.pointConfig,
        enabledGames: tenantCtx.enabledGames,
      },
    },
    meta: {
      correlationId: `corr_${Date.now()}`,
      count: categories.length,
      tenantId: tenantCtx.tenantId,
    },
  });
}
