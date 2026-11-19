/**
 * Project Atlas - Modular Game Plugin Registry
 * Central registry declaring each game module, metadata, provider requirements,
 * route paths, and server-side tenant entitlement authorization.
 */

import type { GameKey } from '../tenant/types.ts';
import { TenantStore } from '../tenant/store.ts';

export interface GamePlugin {
  key: GameKey;
  name: string;
  routePath: string;
  category: string;
  description: string;
  iconName: string;
  requiredProvider: string;
  minPlayers: number;
  maxPlayers: number;
  isSkillBased: boolean;
  regulatoryClassification:
    | 'CERTIFIED_RNG_DRAW'
    | 'PHYSICS_RIGID_BODY_SKILL'
    | 'CSPRNG_BOARD_STRATEGY'
    | 'AGGREGATED_CASINO_SLOT'
    | 'EXCHANGE_SPORTS_BOOKMAKER';
}

export const GAME_PLUGINS: Record<GameKey, GamePlugin> = {
  matka: {
    key: 'matka',
    name: 'Matka Live Markets',
    routePath: '/matka',
    category: 'Category 1',
    description: 'Live authorized satta number draws, open/close cutoff clocks, and historical charts.',
    iconName: 'Dice5',
    requiredProvider: 'prov_sattaapi_com',
    minPlayers: 1,
    maxPlayers: 100000,
    isSkillBased: false,
    regulatoryClassification: 'CERTIFIED_RNG_DRAW',
  },
  carrom: {
    key: 'carrom',
    name: 'Carrom Tabletop Tournament',
    routePath: '/carrom',
    category: 'Category 4',
    description: '2D continuous rigid body disc collisions, smooth striker cursor drag-and-release.',
    iconName: 'Target',
    requiredProvider: 'prov_carrom_physics_inhouse',
    minPlayers: 2,
    maxPlayers: 4,
    isSkillBased: true,
    regulatoryClassification: 'PHYSICS_RIGID_BODY_SKILL',
  },
  ludo: {
    key: 'ludo',
    name: 'Ludo Classic Grand Circuit',
    routePath: '/ludo',
    category: 'Category 4',
    description: 'Cryptographically seeded multiplayer 4-player board racing with safe zones and cutting.',
    iconName: 'Gamepad2',
    requiredProvider: 'prov_ludo_csprng_inhouse',
    minPlayers: 2,
    maxPlayers: 4,
    isSkillBased: true,
    regulatoryClassification: 'CSPRNG_BOARD_STRATEGY',
  },
  'other-games': {
    key: 'other-games',
    name: 'Other Games Hub',
    routePath: '/other-games',
    category: 'Category 4',
    description: 'Tabletop lounge hub hosting cue sports, arcade challenges, and tournaments.',
    iconName: 'Layers',
    requiredProvider: 'prov_atlas_hub',
    minPlayers: 1,
    maxPlayers: 8,
    isSkillBased: true,
    regulatoryClassification: 'PHYSICS_RIGID_BODY_SKILL',
  },
  pool: {
    key: 'pool',
    name: '8-Ball Pool Pro',
    routePath: '/pool',
    category: 'Category 4',
    description: 'Physics-based 8-ball billiards with cursor pull-back slingshot shooting and pocketing.',
    iconName: 'CircleDot',
    requiredProvider: 'prov_pool_physics_inhouse',
    minPlayers: 2,
    maxPlayers: 2,
    isSkillBased: true,
    regulatoryClassification: 'PHYSICS_RIGID_BODY_SKILL',
  },
  casino: {
    key: 'casino',
    name: 'Casino Games',
    routePath: '/casino',
    category: 'Category 2',
    description: 'Unified iGaming aggregation (slots, live tables) in sandbox test mode via Flexrix API adapter.',
    iconName: 'Sparkles',
    requiredProvider: 'prov_flexrix_casino_api',
    minPlayers: 1,
    maxPlayers: 1000,
    isSkillBased: false,
    regulatoryClassification: 'AGGREGATED_CASINO_SLOT',
  },
  sports: {
    key: 'sports',
    name: 'Sports Exchange & Bookmaker',
    routePath: '/sports',
    category: 'Category 3',
    description: 'Betfair API-NG live exchange markets, in-play cricket scoreboards, bookmaker odds & liquidity.',
    iconName: 'Trophy',
    requiredProvider: 'prov_betfair_api_ng',
    minPlayers: 1,
    maxPlayers: 500000,
    isSkillBased: false,
    regulatoryClassification: 'EXCHANGE_SPORTS_BOOKMAKER',
  },
};

export class GameRegistry {
  /**
   * Get all registered games
   */
  static getAllGames(): GamePlugin[] {
    return Object.values(GAME_PLUGINS);
  }

  /**
   * Get plugin by GameKey
   */
  static getGame(key: GameKey): GamePlugin | undefined {
    return GAME_PLUGINS[key];
  }

  /**
   * Match a URL pathname to a registered game plugin
   */
  static matchGameByPath(pathname: string): GamePlugin | null {
    const cleanPath = pathname.toLowerCase();
    for (const game of Object.values(GAME_PLUGINS)) {
      if (cleanPath === game.routePath || cleanPath.startsWith(game.routePath + '/')) {
        return game;
      }
    }
    return null;
  }

  /**
   * Check if a path is allowed for a tenant
   */
  static isPathAllowedForTenant(tenantId: string, pathname: string): boolean {
    const matched = this.matchGameByPath(pathname);
    if (!matched) return true; // non-game path is not gated by game entitlement

    return TenantStore.isGameEnabledForTenant(tenantId, matched.key);
  }

  /**
   * Assert tenant has access to game; throws Error with 403 status code if not.
   */
  static assertTenantGameAccess(tenantId: string, gameKey: GameKey): void {
    const isAllowed = TenantStore.isGameEnabledForTenant(tenantId, gameKey);
    if (!isAllowed) {
      const err = new Error(
        `[FORBIDDEN_403] Game "${gameKey}" is not enabled under tenant subscription package.`
      );
      (err as any).statusCode = 403;
      throw err;
    }
  }
}
