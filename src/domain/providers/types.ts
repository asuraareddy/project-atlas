/**
 * Project Atlas — Centralized API & Provider Management
 * Domain types for White-Label B2B Provider Registry, Dynamic Credentials & Tenant Routing
 */

export type ProviderCategory =
  | 'sports_data'
  | 'sports_odds'
  | 'casino'
  | 'live_casino'
  | 'game_providers'
  | 'lottery_matka'
  | 'payment_crypto'
  | 'custom';

export type AuthMethod =
  | 'API_KEY_HEADER'
  | 'BEARER_TOKEN'
  | 'BASIC_AUTH'
  | 'OAUTH2_CLIENT_CREDENTIALS'
  | 'HMAC_SHA1'
  | 'CUSTOM';

export type ProviderEnvironment = 'SANDBOX' | 'PRODUCTION';

export type ProviderStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface ProviderCredentials {
  clientId?: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  certFile?: string;
  keyFile?: string;
  customHeaders?: Record<string, string>;
  additionalParams?: Record<string, string>;
}

export interface MaskedProviderCredentials {
  clientId?: string;
  hasApiKey: boolean;
  maskedApiKey?: string;
  hasApiSecret: boolean;
  maskedApiSecret?: string;
  hasUsername: boolean;
  maskedUsername?: string;
  hasPassword: boolean;
  hasAccessToken: boolean;
  maskedAccessToken?: string;
  authMethod: AuthMethod;
}

export interface ProviderHealthCheck {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNTESTED';
  checkedAt: string;
  latencyMs?: number;
  statusCode?: number;
  message?: string;
  endpointTested?: string;
}

export interface ProviderRecord {
  id: string;
  name: string;
  category: ProviderCategory;
  categoryLabel?: string;
  logoUrl?: string;
  apiBaseUrl: string;
  apiVersion: string;
  authMethod: AuthMethod;
  environment: ProviderEnvironment;
  status: ProviderStatus;
  notes?: string;
  credentials: ProviderCredentials;
  assignedTenantIds: string[]; // Tenant IDs assigned (or ['*'] for global fallback)
  isDefaultFallback?: boolean;
  lastHealthCheck?: ProviderHealthCheck;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface MaskedProviderRecord extends Omit<ProviderRecord, 'credentials'> {
  maskedCredentials: MaskedProviderCredentials;
}

export interface ProviderAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail?: string;
  action:
    | 'CREATE_PROVIDER'
    | 'UPDATE_CONFIG'
    | 'UPDATE_CREDENTIALS'
    | 'UPDATE_CLIENT_ID'
    | 'UPDATE_ENDPOINT'
    | 'TOGGLE_STATUS'
    | 'ASSIGN_TENANT'
    | 'TEST_CONNECTION'
    | 'ROLLBACK';
  providerId: string;
  providerName: string;
  tenantId?: string;
  details: Record<string, any>; // Strictly sanitized, zero raw secrets
}

export interface ProviderSnapshot {
  version: number;
  timestamp: string;
  userId: string;
  record: ProviderRecord;
}

