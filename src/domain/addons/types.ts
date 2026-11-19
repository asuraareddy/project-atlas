/**
 * Project Atlas — White-Label B2B Addon Marketplace & Plugin Contracts
 * Defines the plug-and-play addon interface for modular platform extensions.
 */

export type AddonCategory =
  | 'SPORTS'
  | 'CASINO'
  | 'SKILL_GAMES'
  | 'LOTTERY_DRAWS'
  | 'FINANCE'
  | 'SERVICES';

export type AddonStatus = 'ACTIVE' | 'INACTIVE' | 'BETA' | 'MAINTENANCE';

export interface AddonNavigationItem {
  label: string;
  path: string;
  icon: string;
  order: number;
  badge?: string;
}

export interface AddonHealthResult {
  addonId: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs: number;
  providerStatus: string;
  details?: Record<string, any>;
  checkedAt: string;
}

export interface AddonLifecycleHooks {
  onInstall?: (tenantId: string, config: Record<string, any>) => Promise<void> | void;
  onActivate?: (tenantId: string) => Promise<void> | void;
  onDeactivate?: (tenantId: string) => Promise<void> | void;
  onUninstall?: (tenantId: string) => Promise<void> | void;
}

export interface AddonDefinition {
  id: string;                         // Unique Addon ID e.g. 'sports', 'casino'
  name: string;                       // Display name e.g. 'Sports Exchange & Bookmaker'
  version: string;                    // Semantic version e.g. '1.0.0'
  category: AddonCategory;
  status: AddonStatus;
  description: string;
  iconName: string;
  routePrefix: string;                // e.g. '/sports', '/casino'
  routes: string[];                   // Array of route paths
  apiPrefix: string;                  // e.g. '/api/v1/games/sports'
  requiredPermissions: string[];
  dependentServices: string[];
  configurationSchema: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'json';
    label: string;
    description: string;
    required: boolean;
    default?: any;
    isSecret?: boolean;
  }>;
  healthCheckEndpoint: string;
  providerRequirements: string[];
  navigation: AddonNavigationItem;
  tenantAvailability: {
    supportedPackages: string[];
    defaultEnabled: boolean;
  };
  lifecycle?: AddonLifecycleHooks;
}

export interface TenantAddonRecord {
  id: string;
  tenantId: string;
  addonId: string;
  isEnabled: boolean;
  version: string;
  config: Record<string, any>;
  activatedAt?: string;
  updatedAt: string;
}

