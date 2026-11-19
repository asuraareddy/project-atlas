/**
 * Project Atlas - B2B In-Memory / Cached Tenant Data Store
 * Manages tenant records, domain mapping, branding, and commercial packages.
 */

import type {
  TenantRecord,
  B2BCommercialPackage,
  TenantContextPayload,
  GameKey,
} from './types.ts';

export const B2B_PACKAGES: B2BCommercialPackage[] = [
  {
    id: 'pkg_matka_only',
    code: 'MATKA_ONLY',
    name: 'Matka Starter Suite',
    description: 'Standalone live Matka draw markets, cut-offs, and historical result charts.',
    includedGames: ['matka'],
    monthlyPriceMinor: 49900, // £499.00
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_matka_ludo',
    code: 'MATKA_LUDO',
    name: 'Matka & Ludo Duo',
    description: 'Live Matka number draws plus multiplayer cryptographic Ludo circuit racing.',
    includedGames: ['matka', 'ludo'],
    monthlyPriceMinor: 89900, // £899.00
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_matka_carrom',
    code: 'MATKA_CARROM',
    name: 'Matka & Carrom Duo',
    description: 'Live Matka markets plus 2D physics tabletop Carrom tournament tables.',
    includedGames: ['matka', 'carrom'],
    monthlyPriceMinor: 89900, // £899.00
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_matka_ludo_carrom',
    code: 'MATKA_LUDO_CARROM',
    name: 'Classic Trio Suite',
    description: 'Matka number draws, Ludo racing, and Carrom tabletop challenge.',
    includedGames: ['matka', 'ludo', 'carrom'],
    monthlyPriceMinor: 129900, // £1,299.00
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_casino_suite',
    code: 'CASINO_SUITE',
    name: 'Casino & Draw Starter Suite',
    description: 'Aggregated casino slots & tables (Sandbox Test Mode) plus live Matka draws.',
    includedGames: ['matka', 'casino'],
    monthlyPriceMinor: 119900, // £1,199.00
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_complete_pro',
    code: 'COMPLETE_PRO_SUITE',
    name: 'Grand Master Full Suite',
    description: 'Every gaming title: Matka, Ludo, Carrom, 8-Ball Pool Pro, Other Games, Casino Games, and Betfair Sports Exchange.',
    includedGames: ['matka', 'carrom', 'ludo', 'pool', 'other-games', 'casino', 'sports'],
    monthlyPriceMinor: 199900, // £1,999.00
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_sports_suite',
    code: 'CUSTOM',
    name: 'Sports & Exchange Specialist Suite',
    description: 'Betfair API-NG live exchange markets, in-play cricket scoreboards, and bookmaker odds.',
    includedGames: ['sports'],
    monthlyPriceMinor: 129900,
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'pkg_custom',
    code: 'CUSTOM',
    name: 'Custom Operator Package',
    description: 'Operator-specific bespoke game selection and tailored limits.',
    includedGames: ['matka', 'pool'],
    monthlyPriceMinor: 99900,
    currency: 'GBP',
    isActive: true,
  },
];

declare global {
  var __projectAtlasTenantRecords: Map<string, TenantRecord> | undefined;
  var __projectAtlasDomainIndex: Map<string, string> | undefined; // hostname -> tenantId
}

export class TenantStore {
  private static get tenants(): Map<string, TenantRecord> {
    if (!globalThis.__projectAtlasTenantRecords) {
      globalThis.__projectAtlasTenantRecords = new Map();
      this.seedDefaultTenants();
    }
    // Self-healing: Ensure atlas tenant has casino & sports enabled, and categories ordered Category 1 -> 4
    const atlas = globalThis.__projectAtlasTenantRecords.get('org_atlas_uk_001');
    if (atlas) {
      const matkaCfg = atlas.gameConfigs.find((g) => g.gameKey === 'matka');
      if (matkaCfg) {
        matkaCfg.displayOrder = 1;
        matkaCfg.customBadge = 'Category 1';
      }

      const casinoCfg = atlas.gameConfigs.find((g) => g.gameKey === 'casino');
      if (casinoCfg) {
        casinoCfg.displayOrder = 2;
        casinoCfg.customBadge = 'Category 2';
      } else {
        atlas.gameConfigs.push({
          gameKey: 'casino',
          isEnabled: true,
          displayOrder: 2,
          customBadge: 'Category 2',
        });
      }

      const sportsCfg = atlas.gameConfigs.find((g) => g.gameKey === 'sports');
      if (sportsCfg) {
        sportsCfg.displayOrder = 3;
        sportsCfg.customBadge = 'Category 3';
      } else {
        atlas.gameConfigs.push({
          gameKey: 'sports',
          isEnabled: true,
          displayOrder: 3,
          customBadge: 'Category 3',
        });
      }

      const otherCfg = atlas.gameConfigs.find((g) => g.gameKey === 'other-games');
      if (otherCfg) {
        otherCfg.displayOrder = 4;
        otherCfg.customBadge = 'Category 4';
      } else {
        atlas.gameConfigs.push({
          gameKey: 'other-games',
          isEnabled: true,
          displayOrder: 4,
          customBadge: 'Category 4',
        });
      }
    }
    return globalThis.__projectAtlasTenantRecords;
  }

  private static get domainIndex(): Map<string, string> {
    if (!globalThis.__projectAtlasDomainIndex) {
      globalThis.__projectAtlasDomainIndex = new Map();
      this.rebuildDomainIndex();
    }
    return globalThis.__projectAtlasDomainIndex;
  }

  private static seedDefaultTenants() {
    // 1. Default Platform Tenant: Project Atlas (Full Suite)
    const atlasTenant: TenantRecord = {
      id: 'org_atlas_uk_001',
      slug: 'atlas',
      name: 'Project Atlas Global Ltd',
      status: 'ACTIVE',
      packageCode: 'COMPLETE_PRO_SUITE',
      contactEmail: 'admin@atlasgaming.uk',
      branding: {
        brandName: 'PROJECT ATLAS',
        tagline: 'Multi-Gaming B2B Enterprise Platform',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#7e0ac2',
        primaryColorHover: '#9a13e6',
        secondaryColor: '#b45df0',
        backgroundColor: '#1f1f1f',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(126,10,194,0.35)',
        heroHeading: 'Next-Gen Multi-Gaming & Skill Lounge',
        heroSubheading: 'Certified transparent gameplay, instant crypto QR deposits, and double-entry settlements.',
        footerText: 'Project Atlas Platform — Certified Multi-Tenant Enterprise Gaming System.',
        supportEmail: 'support@atlasgaming.uk',
      },
      domains: [
        {
          id: 'dom_atlas_01',
          tenantId: 'org_atlas_uk_001',
          hostname: 'localhost',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_atlas_local',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_atlas_02',
          tenantId: 'org_atlas_uk_001',
          hostname: '127.0.0.1',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_atlas_ip',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_atlas_03',
          tenantId: 'org_atlas_uk_001',
          hostname: 'platform.atlasgaming.uk',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_atlas_prod',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'matka', isEnabled: true, displayOrder: 1, customBadge: 'Category 1' },
        { gameKey: 'casino', isEnabled: true, displayOrder: 2, customBadge: 'Category 2' },
        { gameKey: 'sports', isEnabled: true, displayOrder: 3, customBadge: 'Category 3' },
        { gameKey: 'other-games', isEnabled: true, displayOrder: 4, customBadge: 'Category 4' },
        { gameKey: 'carrom', isEnabled: true, displayOrder: 5, customBadge: 'Category 4' },
        { gameKey: 'ludo', isEnabled: true, displayOrder: 6, customBadge: 'Category 4' },
        { gameKey: 'pool', isEnabled: true, displayOrder: 7, customBadge: 'Category 4' },
      ],
      createdAt: new Date('2026-10-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Client Tenant A: Kalyan Club (Matka ONLY)
    const kalyanTenant: TenantRecord = {
      id: 'ten_kalyan_001',
      slug: 'kalyan-club',
      name: 'Kalyan Club International Ltd',
      status: 'ACTIVE',
      packageCode: 'MATKA_ONLY',
      contactEmail: 'contact@kalyanclub.com',
      branding: {
        brandName: 'KALYAN CLUB',
        tagline: 'Premier Number Draw & Satta Results Lounge',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#f59e0b',       // Royal Amber / Gold
        primaryColorHover: '#d97706',
        secondaryColor: '#fbbf24',
        backgroundColor: '#18181b',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(245,158,11,0.3)',
        heroHeading: 'Premier Number Draws & Realtime Satta Markets',
        heroSubheading: 'Direct provider live results with server-verified cutoff schedules.',
        footerText: 'Kalyan Club — Authoritative Live Draw Syndicate.',
        supportEmail: 'desk@kalyanclub.com',
      },
      domains: [
        {
          id: 'dom_kalyan_01',
          tenantId: 'ten_kalyan_001',
          hostname: 'kalyanclub.com',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_kalyan_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_kalyan_02',
          tenantId: 'ten_kalyan_001',
          hostname: 'play.kalyanclub.com',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_kalyan_02',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'matka', isEnabled: true, displayOrder: 1, customBadge: 'Featured Draws' },
        { gameKey: 'carrom', isEnabled: false, displayOrder: 2 },
        { gameKey: 'ludo', isEnabled: false, displayOrder: 3 },
        { gameKey: 'pool', isEnabled: false, displayOrder: 4 },
        { gameKey: 'other-games', isEnabled: false, displayOrder: 5 },
        { gameKey: 'casino', isEnabled: false, displayOrder: 6 },
        { gameKey: 'sports', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-10-10').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Client Tenant B: Board Masters (Matka + Ludo)
    const boardMastersTenant: TenantRecord = {
      id: 'ten_board_002',
      slug: 'board-masters',
      name: 'Board Masters Gaming Group',
      status: 'ACTIVE',
      packageCode: 'MATKA_LUDO',
      contactEmail: 'hello@boardmasters.uk',
      branding: {
        brandName: 'BOARD MASTERS',
        tagline: 'Multiplayer Ludo Racing & Live Matka Draws',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#10b981',       // Emerald Green
        primaryColorHover: '#059669',
        secondaryColor: '#34d399',
        backgroundColor: '#18181b',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(16,185,129,0.3)',
        heroHeading: 'High-Stakes Ludo Circuit & Certified Draws',
        heroSubheading: 'Provably fair CSPRNG board rolling with rapid multi-table action.',
        footerText: 'Board Masters UK — Certified Multiplayer Skill Platform.',
        supportEmail: 'support@boardmasters.uk',
      },
      domains: [
        {
          id: 'dom_board_01',
          tenantId: 'ten_board_002',
          hostname: 'boardmasters.uk',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_board_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_board_02',
          tenantId: 'ten_board_002',
          hostname: 'play.boardmasters.uk',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_board_02',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'matka', isEnabled: true, displayOrder: 1, customBadge: 'Live Draw' },
        { gameKey: 'ludo', isEnabled: true, displayOrder: 2, customBadge: 'Grand Circuit' },
        { gameKey: 'carrom', isEnabled: false, displayOrder: 3 },
        { gameKey: 'pool', isEnabled: false, displayOrder: 4 },
        { gameKey: 'other-games', isEnabled: false, displayOrder: 5 },
        { gameKey: 'casino', isEnabled: false, displayOrder: 6 },
        { gameKey: 'sports', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-10-15').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Client Tenant C: Pro Cue Lounge (Carrom + 8-Ball Pool Pro)
    const proCueTenant: TenantRecord = {
      id: 'ten_cue_003',
      slug: 'pro-cue',
      name: 'Pro Cue & Tabletop Lounge Ltd',
      status: 'ACTIVE',
      packageCode: 'CUSTOM',
      contactEmail: 'club@procue.com',
      branding: {
        brandName: 'PRO CUE LOUNGE',
        tagline: 'Tournament 8-Ball Pool & Tabletop Carrom Arena',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#0284c7',       // Ocean Sky / Blue
        primaryColorHover: '#0369a1',
        secondaryColor: '#38bdf8',
        backgroundColor: '#18181b',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(2,132,199,0.35)',
        heroHeading: 'Certified 8-Ball Pool & Carrom Championships',
        heroSubheading: 'Millimeter-accurate 2D rigid disc physics and realistic cue ball trajectory.',
        footerText: 'Pro Cue Lounge — Certified Tabletop Cue Sports Provider.',
        supportEmail: 'tournaments@procue.com',
      },
      domains: [
        {
          id: 'dom_cue_01',
          tenantId: 'ten_cue_003',
          hostname: 'procue.com',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_cue_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'carrom', isEnabled: true, displayOrder: 1, customBadge: 'Tabletop PVP' },
        { gameKey: 'pool', isEnabled: true, displayOrder: 2, customBadge: '8-Ball Pro' },
        { gameKey: 'other-games', isEnabled: true, displayOrder: 3, customBadge: 'Skill Lounge' },
        { gameKey: 'matka', isEnabled: false, displayOrder: 4 },
        { gameKey: 'ludo', isEnabled: false, displayOrder: 5 },
        { gameKey: 'casino', isEnabled: false, displayOrder: 6 },
        { gameKey: 'sports', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-10-20').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 5. Test Tenant A (Section 13 Acceptance Tests): Apex Sports (Sports ONLY)
    const apexSportsTenant: TenantRecord = {
      id: 'ten_sports_only',
      slug: 'apex-sports',
      name: 'Apex Sports Exchange Ltd',
      status: 'ACTIVE',
      packageCode: 'CUSTOM',
      contactEmail: 'desk@apexsports.bet',
      branding: {
        brandName: 'APEX SPORTS',
        tagline: 'Live Cricket Scoreboards & Betfair Exchange Ladders',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#2563eb',       // Electric Blue
        primaryColorHover: '#1d4ed8',
        secondaryColor: '#60a5fa',
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(37,99,235,0.35)',
        heroHeading: 'Premier Live Cricket & Sportsbook Exchange',
        heroSubheading: 'Real-time ball-by-ball scorecards, Betfair exchange market depth, and bookmaker odds.',
        footerText: 'Apex Sports — Licensed Sports Betting & Exchange Technology.',
        supportEmail: 'support@apexsports.bet',
      },
      domains: [
        {
          id: 'dom_apex_01',
          tenantId: 'ten_sports_only',
          hostname: 'apexsports.bet',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_apex_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_apex_02',
          tenantId: 'ten_sports_only',
          hostname: 'play.apexsports.bet',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_apex_02',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'sports', isEnabled: true, displayOrder: 1, customBadge: 'Live Cricket' },
        { gameKey: 'casino', isEnabled: false, displayOrder: 2 },
        { gameKey: 'matka', isEnabled: false, displayOrder: 3 },
        { gameKey: 'carrom', isEnabled: false, displayOrder: 4 },
        { gameKey: 'ludo', isEnabled: false, displayOrder: 5 },
        { gameKey: 'pool', isEnabled: false, displayOrder: 6 },
        { gameKey: 'other-games', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-11-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 6. Test Tenant B (Section 13 Acceptance Tests): Royal Casino (Casino ONLY)
    const royalCasinoTenant: TenantRecord = {
      id: 'ten_casino_only',
      slug: 'royal-casino',
      name: 'Royal Casino Lounge Ltd',
      status: 'ACTIVE',
      packageCode: 'CASINO_SUITE',
      contactEmail: 'vip@royalcasino.live',
      branding: {
        brandName: 'ROYAL CASINO',
        tagline: '1Stake Vegas Slots, Roulette & Live Dealer Lounge',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#dc2626',       // Crimson Red
        primaryColorHover: '#b91c1c',
        secondaryColor: '#f87171',
        backgroundColor: '#18181b',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(220,38,38,0.35)',
        heroHeading: 'Exclusive 1Stake Casino & Live Table Lounge',
        heroSubheading: 'Provably fair slots, European Roulette, Single-Deck Blackjack, and immersive live dealer streams.',
        footerText: 'Royal Casino Lounge — Certified iGaming Entertainment.',
        supportEmail: 'support@royalcasino.live',
      },
      domains: [
        {
          id: 'dom_royal_01',
          tenantId: 'ten_casino_only',
          hostname: 'royalcasino.live',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_royal_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_royal_02',
          tenantId: 'ten_casino_only',
          hostname: 'play.royalcasino.live',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_royal_02',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'casino', isEnabled: true, displayOrder: 1, customBadge: 'Vegas Suite' },
        { gameKey: 'sports', isEnabled: false, displayOrder: 2 },
        { gameKey: 'matka', isEnabled: false, displayOrder: 3 },
        { gameKey: 'carrom', isEnabled: false, displayOrder: 4 },
        { gameKey: 'ludo', isEnabled: false, displayOrder: 5 },
        { gameKey: 'pool', isEnabled: false, displayOrder: 6 },
        { gameKey: 'other-games', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-11-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 7. Test Tenant C (Section 13 Acceptance Tests): Titan Gaming (BOTH Sports & Casino)
    const titanGamingTenant: TenantRecord = {
      id: 'ten_hybrid_001',
      slug: 'titan-gaming',
      name: 'Titan Gaming Group Ltd',
      status: 'ACTIVE',
      packageCode: 'COMPLETE_PRO_SUITE',
      contactEmail: 'contact@titangaming.vip',
      branding: {
        brandName: 'TITAN GAMING',
        tagline: 'Unified Sports Exchange & Vegas Casino Platform',
        logoUrl: '/icons/icon-192.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#7c3aed',       // Royal Violet
        primaryColorHover: '#6d28d9',
        secondaryColor: '#a78bfa',
        backgroundColor: '#13111c',
        textColor: '#ffffff',
        accentGlowColor: 'rgba(124,58,237,0.35)',
        heroHeading: 'The Ultimate Hybrid Sports & Casino Arena',
        heroSubheading: 'Seamlessly switch between live cricket Betfair exchange ladders and 1Stake casino games.',
        footerText: 'Titan Gaming Group — Authorized Multi-Tenant B2B Platform.',
        supportEmail: 'concierge@titangaming.vip',
      },
      domains: [
        {
          id: 'dom_titan_01',
          tenantId: 'ten_hybrid_001',
          hostname: 'titangaming.vip',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_titan_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_titan_02',
          tenantId: 'ten_hybrid_001',
          hostname: 'play.titangaming.vip',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_titan_02',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'sports', isEnabled: true, displayOrder: 3, customBadge: 'Category 3' },
        { gameKey: 'casino', isEnabled: true, displayOrder: 2, customBadge: 'Category 2' },
        { gameKey: 'matka', isEnabled: false, displayOrder: 3 },
        { gameKey: 'carrom', isEnabled: false, displayOrder: 4 },
        { gameKey: 'ludo', isEnabled: false, displayOrder: 5 },
        { gameKey: 'pool', isEnabled: false, displayOrder: 6 },
        { gameKey: 'other-games', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-11-01').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 8. Client-Specific Domain Tenant: AMBAARI999 (Sports & Casino Exclusively)
    // Reference: https://www.ambaari999.com/
    const ambaariTenant: TenantRecord = {
      id: 'ten_ambaari_001',
      slug: 'ambaari999',
      name: 'Ambaari 999 Entertainment Ltd',
      status: 'ACTIVE',
      packageCode: 'CUSTOM',
      contactEmail: 'support@ambaari999.com',
      branding: {
        brandName: 'AMBAARI999',
        tagline: 'Premium Sports Exchange & Live Casino',
        logoUrl: '/icons/ambaari-logo.png',
        faviconUrl: '/favicon.ico',
        primaryColor: '#0088CC',       // Ocean Cyan Blue (exact from ambaari999.com)
        primaryColorHover: '#0077B5',
        secondaryColor: '#2C3E50',     // Dark Slate Navy (exact from ambaari999.com)
        backgroundColor: '#f2f4f7',
        textColor: '#1f2937',
        accentGlowColor: 'rgba(0,136,204,0.35)',
        heroHeading: "India's Premier Sports & Live Casino Exchange",
        heroSubheading: 'Real-time ball-by-ball cricket exchange rates, Betfair market liquidity, and certified live dealer casino tables.',
        footerText: '© 2026 AMBAARI999. All Rights Reserved. 18+ Responsible Gaming.',
        supportEmail: 'help@ambaari999.com',
        layoutTheme: 'ambaari',
      },
      domains: [
        {
          id: 'dom_ambaari_01',
          tenantId: 'ten_ambaari_001',
          hostname: 'www.ambaari999.com',
          isPrimary: true,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_ambaari_01',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_ambaari_02',
          tenantId: 'ten_ambaari_001',
          hostname: 'ambaari999.com',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_ambaari_02',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'dom_ambaari_03',
          tenantId: 'ten_ambaari_001',
          hostname: 'play.ambaari999.com',
          isPrimary: false,
          verificationStatus: 'VERIFIED',
          verificationToken: 'v_ambaari_03',
          sslStatus: 'ACTIVE',
          verifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      gameConfigs: [
        { gameKey: 'sports', isEnabled: true, displayOrder: 1, customBadge: 'Live Cricket' },
        { gameKey: 'casino', isEnabled: true, displayOrder: 2, customBadge: 'Live Dealer' },
        { gameKey: 'matka', isEnabled: false, displayOrder: 3 },
        { gameKey: 'carrom', isEnabled: false, displayOrder: 4 },
        { gameKey: 'ludo', isEnabled: false, displayOrder: 5 },
        { gameKey: 'pool', isEnabled: false, displayOrder: 6 },
        { gameKey: 'other-games', isEnabled: false, displayOrder: 7 },
      ],
      createdAt: new Date('2026-11-05').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tenants.set(atlasTenant.id, atlasTenant);
    this.tenants.set(kalyanTenant.id, kalyanTenant);
    this.tenants.set(boardMastersTenant.id, boardMastersTenant);
    this.tenants.set(proCueTenant.id, proCueTenant);
    this.tenants.set(apexSportsTenant.id, apexSportsTenant);
    this.tenants.set(royalCasinoTenant.id, royalCasinoTenant);
    this.tenants.set(titanGamingTenant.id, titanGamingTenant);
    this.tenants.set(ambaariTenant.id, ambaariTenant);
  }

  private static rebuildDomainIndex() {
    this.domainIndex.clear();
    for (const tenant of this.tenants.values()) {
      for (const dom of tenant.domains) {
        if (dom.verificationStatus === 'VERIFIED') {
          this.domainIndex.set(dom.hostname.toLowerCase(), tenant.id);
        }
      }
      // Also register slug as fallback resolution
      this.domainIndex.set(tenant.slug.toLowerCase(), tenant.id);
    }
  }

  /**
   * Get all tenants (Super Admin)
   */
  static getAllTenants(): TenantRecord[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Get tenant by ID
   */
  static getTenantById(id: string): TenantRecord | null {
    return this.tenants.get(id) || null;
  }

  /**
   * Get tenant by slug
   */
  static getTenantBySlug(slug: string): TenantRecord | null {
    const s = slug.toLowerCase();
    for (const tenant of this.tenants.values()) {
      if (tenant.slug.toLowerCase() === s) return tenant;
    }
    return null;
  }

  /**
   * Resolve tenant by hostname / domain
   */
  static resolveTenantByHost(host: string): TenantRecord {
    const cleanHost = host.split(':')[0].toLowerCase();
    const tenantId = this.domainIndex.get(cleanHost);

    if (tenantId && this.tenants.has(tenantId)) {
      const tenant = this.tenants.get(tenantId)!;
      if (tenant.status === 'ACTIVE') return tenant;
    }

    // Fallback by slug match if domain is in format [slug].platform.com
    const parts = cleanHost.split('.');
    if (parts.length > 2) {
      const subdomainSlug = parts[0];
      const bySlug = this.getTenantBySlug(subdomainSlug);
      if (bySlug && bySlug.status === 'ACTIVE') return bySlug;
    }

    // Default tenant fallback: Project Atlas
    return this.tenants.get('org_atlas_uk_001')!;
  }

  /**
   * Create or update tenant
   */
  static saveTenant(tenant: TenantRecord): void {
    tenant.updatedAt = new Date().toISOString();
    this.tenants.set(tenant.id, tenant);
    this.rebuildDomainIndex();
  }

  /**
   * Check if a game is enabled for a tenant
   */
  static isGameEnabledForTenant(tenantId: string, gameKey: GameKey): boolean {
    const tenant = this.getTenantById(tenantId);
    if (!tenant || tenant.status !== 'ACTIVE') return false;

    const config = tenant.gameConfigs.find((c) => c.gameKey === gameKey);
    return config ? config.isEnabled : false;
  }

  /**
   * Get enabled games for a tenant in display order
   */
  static getEnabledGamesForTenant(tenantId: string): GameKey[] {
    const tenant = this.getTenantById(tenantId);
    if (!tenant || tenant.status !== 'ACTIVE') return [];

    return tenant.gameConfigs
      .filter((c) => c.isEnabled)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => c.gameKey);
  }

  /**
   * Get resolved context payload for request
   */
  static getTenantContext(host: string, requestedTenantSlugOrId?: string | null): TenantContextPayload {
    const cleanHost = host.split(':')[0].toLowerCase();
    const isLocalOrPlatform = ['localhost', '127.0.0.1'].includes(cleanHost) || cleanHost.endsWith('.platform.internal');

    let tenant: TenantRecord;

    // Security: On verified custom client domains (e.g. www.ambaari999.com), the domain binding is AUTHORITATIVE.
    // Query param and cookie overrides from untrusted client requests are strictly ignored to prevent tenant hijacking.
    if (!isLocalOrPlatform) {
      tenant = this.resolveTenantByHost(host);
    } else if (requestedTenantSlugOrId) {
      const byId = this.getTenantById(requestedTenantSlugOrId);
      const bySlug = this.getTenantBySlug(requestedTenantSlugOrId);
      tenant = byId || bySlug || this.resolveTenantByHost(host);
    } else {
      tenant = this.resolveTenantByHost(host);
    }

    const enabledGames = tenant.gameConfigs
      .filter((c) => c.isEnabled)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => c.gameKey);

    return {
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      status: tenant.status,
      branding: tenant.branding,
      pointConfig: tenant.pointConfig || {
        pointToCurrencyRate: 1.0,
        currencyCode: 'UNDEFINED',
        currencySymbol: '',
        pointUnitName: 'PTS',
        displayAsPointsOnly: true,
      },
      enabledGames,
      isCustomDomain: !['localhost', '127.0.0.1'].includes(host.split(':')[0]),
      matchedHost: host,
    };
  }

  /**
   * Delete tenant by ID
   */
  static deleteTenant(id: string): boolean {
    const deleted = this.tenants.delete(id);
    if (deleted) {
      this.rebuildDomainIndex();
    }
    return deleted;
  }

  /**
   * Reset store to default seed (useful for deterministic tests)
   */
  static resetToDefaults(): void {
    if (globalThis.__projectAtlasTenantRecords) {
      globalThis.__projectAtlasTenantRecords.clear();
    }
    if (globalThis.__projectAtlasDomainIndex) {
      globalThis.__projectAtlasDomainIndex.clear();
    }
    this.seedDefaultTenants();
    this.rebuildDomainIndex();
  }

  /**
   * Strict Tenant Data Isolation Guard:
   * Throws an error if a requesting tenant attempts to access records belonging to another tenant.
   */
  static assertTenantIsolation(requestingTenantId: string, recordTenantId: string): void {
    if (requestingTenantId !== recordTenantId) {
      const err = new Error(
        `[SECURITY_VIOLATION_TENANT_ISOLATION] Access Denied: Tenant "${requestingTenantId}" is strictly prohibited from accessing data belonging to Tenant "${recordTenantId}".`
      );
      (err as any).statusCode = 403;
      throw err;
    }
  }
}
