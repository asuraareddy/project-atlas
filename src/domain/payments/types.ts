/**
 * Project Atlas — Multi-Tenant Payment Gateway Architecture
 * Domain models for Two-Tier Payment Gateways:
 * 1. White Label Super Admin (Platform-wide integrations & tenant allocations)
 * 2. Client Admin (Independent client-owned gateways & credential rotation)
 */

export type PaymentGatewayProvider =
  | 'razorpay_upi'
  | 'stripe_checkout'
  | 'crypto_direct_qr'
  | 'phonepe_pg'
  | 'cashfree_payouts'
  | 'custom_gateway';

export type GatewayOwnership = 'PLATFORM' | 'CLIENT_OWNED';

export type GatewayMode = 'SANDBOX' | 'PRODUCTION';

export type GatewayStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type GatewayFeature = 'DEPOSIT' | 'WITHDRAWAL' | 'REFUND' | 'WEBHOOK_SIGNATURE';

export interface PaymentGatewayCredentials {
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
  keyId?: string;
  clientId?: string;
  webhookSecret?: string;
  callbackUrl?: string;
  encryptionKey?: string;
  receivingAddress?: string; // For Crypto QR
  additionalSettings?: Record<string, any>;
}

export interface MaskedGatewayCredentials {
  hasMerchantId: boolean;
  maskedMerchantId?: string;
  hasApiKey: boolean;
  maskedApiKey?: string;
  hasApiSecret: boolean;
  maskedApiSecret?: string;
  hasClientId: boolean;
  maskedClientId?: string;
  hasWebhookSecret: boolean;
  maskedWebhookSecret?: string;
  receivingAddress?: string;
}

export interface GatewayHealthCheck {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNTESTED';
  checkedAt: string;
  latencyMs?: number;
  statusCode?: number;
  message?: string;
  testedEndpoint?: string;
}

export interface PaymentGatewayConfig {
  id: string;
  tenantId: string; // 'platform' or specific tenantId (e.g. 'ten_ambaari_001')
  tenantSlug?: string;
  providerKey: PaymentGatewayProvider;
  providerName: string;
  ownership: GatewayOwnership;
  environment: GatewayMode;
  status: GatewayStatus;
  supportsDeposit: boolean;
  supportsWithdrawal: boolean;
  currency: string; // 'INR', 'GBP', 'USD', 'USDT'
  minDepositMinor: number;
  maxDepositMinor: number;
  minWithdrawalMinor: number;
  maxWithdrawalMinor: number;
  credentials: PaymentGatewayCredentials;
  assignedTenantIds?: string[]; // For platform gateways: tenants allowed to use this
  lastHealthCheck?: GatewayHealthCheck;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface MaskedPaymentGatewayConfig extends Omit<PaymentGatewayConfig, 'credentials'> {
  maskedCredentials: MaskedGatewayCredentials;
}

export interface TenantPaymentPolicy {
  tenantId: string;
  allowClientOwned: boolean;      // Can client add own merchant credentials?
  allowPlatformGateway: boolean;  // Can client use platform-managed gateway?
  permittedProviders: PaymentGatewayProvider[];
  dailyDepositLimitMinor: number;
  dailyWithdrawalLimitMinor: number;
  autoApproveWithdrawalsUnderMinor: number;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  tenantSlug: string;
  userId: string;
  gatewayId: string;
  providerKey: PaymentGatewayProvider;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amountMinor: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  paymentUrlOrQr?: string;
  externalReference?: string;
  idempotencyKey: string;
  gatewayResponse?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface GatewayAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  tenantId: string;
  action:
    | 'ADD_PLATFORM_GATEWAY'
    | 'UPDATE_PLATFORM_GATEWAY'
    | 'ADD_CLIENT_GATEWAY'
    | 'UPDATE_CLIENT_GATEWAY'
    | 'ROTATE_CREDENTIALS'
    | 'TOGGLE_GATEWAY_STATUS'
    | 'TEST_CONNECTION'
    | 'UPDATE_POLICY';
  gatewayId: string;
  providerKey: PaymentGatewayProvider;
  details: Record<string, any>; // Strictly sanitized, zero secrets
}

