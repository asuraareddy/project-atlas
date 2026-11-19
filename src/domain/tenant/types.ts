/**
 * Project Atlas - B2B White-Label Multi-Tenancy Contracts
 * Supports multi-tenant branding, domain mapping, game packages, and isolation.
 */

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING' | 'ARCHIVED';

export type DomainVerificationStatus = 'VERIFIED' | 'PENDING_DNS' | 'FAILED' | 'REVOKED';

export type GameKey = 'matka' | 'carrom' | 'ludo' | 'pool' | 'other-games' | 'casino' | 'sports';

export interface TenantBrandingConfig {
  brandName: string;
  tagline?: string;
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;       // Accent / CTA buttons (e.g., #7e0ac2, #ff5722, #059669)
  primaryColorHover: string;
  secondaryColor: string;     // Highlights & badges (e.g., #b45df0, #fbbf24)
  backgroundColor: string;    // Theme background
  textColor: string;          // Main text
  accentGlowColor: string;    // Glowing aura color
  heroHeading: string;
  heroSubheading: string;
  footerText: string;
  supportEmail: string;
  layoutTheme?: 'default' | 'ambaari';
  customBannerUrls?: string[];
}

export interface TenantDomainRecord {
  id: string;
  tenantId: string;
  hostname: string;           // e.g., 'play.kalyanclub.com', 'vegasmaster.uk'
  isPrimary: boolean;
  verificationStatus: DomainVerificationStatus;
  verificationToken: string;
  sslStatus: 'ACTIVE' | 'PENDING' | 'ERROR';
  verifiedAt?: string | null;
  createdAt: string;
}

export interface TenantGameEntitlement {
  gameKey: GameKey;
  isEnabled: boolean;
  displayOrder: number;
  customTitle?: string;
  customBadge?: string;
  customConfig?: Record<string, any>;
}

export interface B2BCommercialPackage {
  id: string;
  code: 'MATKA_ONLY' | 'MATKA_LUDO' | 'MATKA_CARROM' | 'MATKA_LUDO_CARROM' | 'COMPLETE_PRO_SUITE' | 'CASINO_SUITE' | 'CUSTOM';
  name: string;
  description: string;
  includedGames: GameKey[];
  monthlyPriceMinor: number;  // in GBP pence
  currency: string;
  isActive: boolean;
}

export interface TenantPointConfig {
  pointToCurrencyRate: number; // Default 1.0 (1 point = 1)
  currencyCode?: string;       // "UNDEFINED", or custom reference
  currencySymbol?: string;     // default "" (no fiat symbols like £/€/$)
  pointUnitName?: string;      // default "PTS"
  displayAsPointsOnly?: boolean;
}

export interface TenantRecord {
  id: string;                 // ULID or UUID, e.g. 'org_atlas_uk_001', 'ten_kalyan_01'
  slug: string;               // URL-safe slug, e.g. 'atlas', 'kalyan-club', 'board-masters'
  name: string;               // Legal operator business name
  status: TenantStatus;
  packageCode: B2BCommercialPackage['code'];
  contactEmail: string;
  branding: TenantBrandingConfig;
  pointConfig?: TenantPointConfig;
  domains: TenantDomainRecord[];
  gameConfigs: TenantGameEntitlement[];
  createdAt: string;
  updatedAt: string;
}

export interface TenantContextPayload {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  status: TenantStatus;
  branding: TenantBrandingConfig;
  pointConfig?: TenantPointConfig;
  enabledGames: GameKey[];
  isCustomDomain: boolean;
  matchedHost: string;
}
