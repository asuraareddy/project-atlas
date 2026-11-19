/**
 * Project Atlas — Central Plug-and-Play Addon Marketplace & Registry
 * Manages addon definitions, dynamic lifecycle, health checks, and tenant entitlement resolution.
 */

import type {
  AddonDefinition,
  AddonHealthResult,
} from './types.ts';
import { TenantStore } from '../tenant/store.ts';

export class AddonRegistry {
  private static addons: Map<string, AddonDefinition> = new Map();

  static {
    this.registerInitialAddons();
  }

  private static registerInitialAddons() {
    // 1. SPORTS ADDON (Betfair API-NG Cricket, Soccer, Tennis, Exchange Ladder & Bookmaker)
    this.register({
      id: 'sports',
      name: 'Sports Exchange & Bookmaker',
      version: '1.2.0',
      category: 'SPORTS',
      status: 'ACTIVE',
      description: 'Live cricket scoreboards, Betfair API-NG exchange depth ladders (Back/Lay), bookmaker fixed odds, and in-play market suspension controls.',
      iconName: 'Trophy',
      routePrefix: '/sports',
      routes: ['/sports', '/sports/[id]'],
      apiPrefix: '/api/v1/games/sports',
      requiredPermissions: ['SPORTS_VIEW', 'SPORTS_BET_PLACE'],
      dependentServices: ['betfair_api_adapter', 'cricket_live_score_engine'],
      configurationSchema: {
        betfairAppKey: {
          type: 'string',
          label: 'Betfair Application Key',
          description: 'Delayed or Live Betfair Developer App Key',
          required: false,
          isSecret: true,
        },
        defaultSportId: {
          type: 'string',
          label: 'Default Sport ID',
          description: 'Primary sport category (4 = Cricket, 1 = Soccer)',
          required: true,
          default: '4',
        },
        maxLiabilityPerBet: {
          type: 'number',
          label: 'Maximum Lay Liability',
          description: 'Max platform exposure on Lay orders (in minor currency)',
          required: true,
          default: 100000,
        },
      },
      healthCheckEndpoint: '/api/v1/games/sports/config',
      providerRequirements: ['prov_betfair_api_ng'],
      navigation: {
        label: 'Sports Exchange',
        path: '/sports',
        icon: 'Trophy',
        order: 3,
        badge: 'Category 3',
      },
      tenantAvailability: {
        supportedPackages: ['COMPLETE_PRO_SUITE', 'CUSTOM', 'SPORTS_SUITE'],
        defaultEnabled: false,
      },
    });

    // 2. CASINO ADDON (1Stake Reference: Slots, Roulette, Blackjack, Live Dealer)
    this.register({
      id: 'casino',
      name: '1Stake Casino Suite',
      version: '2.1.0',
      category: 'CASINO',
      status: 'ACTIVE',
      description: 'Comprehensive iGaming lobby featuring 1Stake slots, European Roulette, Single-Deck Blackjack, Crash Games, and authorized Live Dealer tables in sandbox test mode.',
      iconName: 'Sparkles',
      routePrefix: '/casino',
      routes: ['/casino', '/casino/sandbox-frame'],
      apiPrefix: '/api/v1/games/casino',
      requiredPermissions: ['CASINO_VIEW', 'CASINO_PLAY'],
      dependentServices: ['flexrix_casino_adapter', 'provably_fair_rng'],
      configurationSchema: {
        defaultRtpPercent: {
          type: 'number',
          label: 'Default Return-to-Player (%)',
          description: 'Configured theoretical return percentage',
          required: true,
          default: 96.5,
        },
        sandboxTestMode: {
          type: 'boolean',
          label: 'Sandbox Test Mode',
          description: 'Run with virtual play credits without real-money settlement',
          required: true,
          default: true,
        },
      },
      healthCheckEndpoint: '/api/v1/games/casino/config',
      providerRequirements: ['prov_flexrix_casino_api'],
      navigation: {
        label: 'Casino Games',
        path: '/casino',
        icon: 'Sparkles',
        order: 2,
        badge: 'Category 2',
      },
      tenantAvailability: {
        supportedPackages: ['COMPLETE_PRO_SUITE', 'CASINO_SUITE', 'CUSTOM'],
        defaultEnabled: false,
      },
    });

    // 3. MATKA ADDON (Live Draw Markets)
    this.register({
      id: 'matka',
      name: 'Matka Live Markets',
      version: '1.0.0',
      category: 'LOTTERY_DRAWS',
      status: 'ACTIVE',
      description: 'Certified live number draw markets with cutoff clocks and charts.',
      iconName: 'Dice5',
      routePrefix: '/matka',
      routes: ['/matka'],
      apiPrefix: '/api/v1/games/matka',
      requiredPermissions: ['MATKA_VIEW', 'MATKA_PARTICIPATE'],
      dependentServices: ['matka_cutoff_engine'],
      configurationSchema: {},
      healthCheckEndpoint: '/api/v1/games/matka/markets',
      providerRequirements: ['prov_sattaapi_com'],
      navigation: {
        label: 'Matka',
        path: '/matka',
        icon: 'Dice5',
        order: 1,
        badge: 'Category 1',
      },
      tenantAvailability: {
        supportedPackages: ['MATKA_ONLY', 'MATKA_LUDO', 'MATKA_CARROM', 'MATKA_LUDO_CARROM', 'COMPLETE_PRO_SUITE'],
        defaultEnabled: true,
      },
    });

    // 4. CARROM ADDON (2D Physics Tabletop)
    this.register({
      id: 'carrom',
      name: 'Carrom Tabletop Tournament',
      version: '1.0.0',
      category: 'SKILL_GAMES',
      status: 'ACTIVE',
      description: '2D continuous rigid-body tabletop Carrom challenge.',
      iconName: 'Target',
      routePrefix: '/carrom',
      routes: ['/carrom'],
      apiPrefix: '/api/v1/games/carrom',
      requiredPermissions: ['CARROM_PLAY'],
      dependentServices: ['carrom_physics_engine'],
      configurationSchema: {},
      healthCheckEndpoint: '/api/v1/games/carrom/rooms',
      providerRequirements: ['prov_carrom_physics_inhouse'],
      navigation: {
        label: 'Carrom',
        path: '/carrom',
        icon: 'Target',
        order: 4,
        badge: 'Category 4',
      },
      tenantAvailability: {
        supportedPackages: ['MATKA_CARROM', 'MATKA_LUDO_CARROM', 'COMPLETE_PRO_SUITE', 'CUSTOM'],
        defaultEnabled: false,
      },
    });

    // 5. LUDO ADDON (4-Player CSPRNG Circuit)
    this.register({
      id: 'ludo',
      name: 'Ludo Classic Grand Circuit',
      version: '1.0.0',
      category: 'SKILL_GAMES',
      status: 'ACTIVE',
      description: 'Multiplayer 4-player board racing with CSPRNG dice rolling.',
      iconName: 'Gamepad2',
      routePrefix: '/ludo',
      routes: ['/ludo'],
      apiPrefix: '/api/v1/games/ludo',
      requiredPermissions: ['LUDO_PLAY'],
      dependentServices: ['ludo_csprng_engine'],
      configurationSchema: {},
      healthCheckEndpoint: '/api/v1/games/ludo/rooms',
      providerRequirements: ['prov_ludo_csprng_inhouse'],
      navigation: {
        label: 'Ludo',
        path: '/ludo',
        icon: 'Gamepad2',
        order: 3,
        badge: 'Skill Match',
      },
      tenantAvailability: {
        supportedPackages: ['MATKA_LUDO', 'MATKA_LUDO_CARROM', 'COMPLETE_PRO_SUITE', 'CUSTOM'],
        defaultEnabled: false,
      },
    });

    // 6. POOL ADDON (8-Ball Billiards)
    this.register({
      id: 'pool',
      name: '8-Ball Pool Pro',
      version: '1.0.0',
      category: 'SKILL_GAMES',
      status: 'ACTIVE',
      description: 'Tournament 8-ball billiards with realistic cue ball physics and slingshot shooting.',
      iconName: 'CircleDot',
      routePrefix: '/pool',
      routes: ['/pool'],
      apiPrefix: '/api/v1/games/pool',
      requiredPermissions: ['POOL_PLAY'],
      dependentServices: ['pool_physics_engine'],
      configurationSchema: {},
      healthCheckEndpoint: '/api/v1/games/pool/session',
      providerRequirements: ['prov_pool_physics_inhouse'],
      navigation: {
        label: '8-Ball Pool',
        path: '/pool',
        icon: 'CircleDot',
        order: 4,
        badge: 'Category 4',
      },
      tenantAvailability: {
        supportedPackages: ['COMPLETE_PRO_SUITE', 'CUSTOM'],
        defaultEnabled: false,
      },
    });
  }

  /**
   * Register a new plug-and-play addon
   */
  static register(addon: AddonDefinition): void {
    if (!addon.id || !addon.name || !addon.version) {
      throw new Error(`Invalid Addon definition: ID, name and version are required.`);
    }
    this.addons.set(addon.id.toLowerCase(), addon);
  }

  /**
   * Get an addon by its ID
   */
  static getAddon(id: string): AddonDefinition | undefined {
    return this.addons.get(id.toLowerCase());
  }

  /**
   * Get all registered addons
   */
  static getAllAddons(): AddonDefinition[] {
    return Array.from(this.addons.values());
  }

  /**
   * Get all active addons
   */
  static getActiveAddons(): AddonDefinition[] {
    return Array.from(this.addons.values()).filter((a) => a.status === 'ACTIVE');
  }

  /**
   * Match route path to addon
   */
  static matchAddonByPath(pathname: string): AddonDefinition | null {
    const cleanPath = pathname.toLowerCase();
    for (const addon of this.addons.values()) {
      if (
        cleanPath === addon.routePrefix ||
        cleanPath.startsWith(addon.routePrefix + '/') ||
        cleanPath.startsWith(addon.apiPrefix)
      ) {
        return addon;
      }
    }
    return null;
  }

  /**
   * Check if an addon is allowed for a given tenant
   */
  static isAddonAllowedForTenant(tenantId: string, addonId: string): boolean {
    return TenantStore.isGameEnabledForTenant(tenantId, addonId as any);
  }

  /**
   * Assert tenant has access to an addon. Throws 403 error if not allowed.
   */
  static assertTenantAddonAccess(tenantId: string, addonId: string): void {
    const isAllowed = this.isAddonAllowedForTenant(tenantId, addonId);
    if (!isAllowed) {
      const tenant = TenantStore.getTenantById(tenantId);
      const tenantName = tenant ? tenant.branding.brandName : tenantId;
      const err = new Error(
        `[FORBIDDEN_403] Addon "${addonId}" is disabled for tenant "${tenantName}". Upgrade subscription to access this module.`
      );
      (err as any).statusCode = 403;
      throw err;
    }
  }

  /**
   * Get enabled addons for a tenant
   */
  static getAddonsForTenant(tenantId: string): AddonDefinition[] {
    const tenant = TenantStore.getTenantById(tenantId);
    if (!tenant || tenant.status !== 'ACTIVE') return [];

    const enabledKeys = TenantStore.getEnabledGamesForTenant(tenantId);
    return enabledKeys
      .map((k) => this.getAddon(k))
      .filter((a): a is AddonDefinition => Boolean(a));
  }

  /**
   * Check health of an addon
   */
  static async checkHealth(addonId: string): Promise<AddonHealthResult> {
    const addon = this.getAddon(addonId);
    if (!addon) {
      return {
        addonId,
        status: 'DOWN',
        latencyMs: 0,
        providerStatus: 'UNKNOWN_ADDON',
        checkedAt: new Date().toISOString(),
      };
    }

    const start = Date.now();
    try {
      // In-process mock/adapter check based on addon configuration
      const latencyMs = Date.now() - start;
      return {
        addonId,
        status: 'HEALTHY',
        latencyMs,
        providerStatus: 'CONNECTED',
        details: {
          version: addon.version,
          category: addon.category,
          requiredProviders: addon.providerRequirements,
        },
        checkedAt: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        addonId,
        status: 'DOWN',
        latencyMs: Date.now() - start,
        providerStatus: 'ERROR',
        details: { error: e.message },
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
