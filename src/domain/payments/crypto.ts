/**
 * Project Atlas — Multi-Tenant Payment Gateway Secrets Encryption & Masking
 * Implements AES-256-GCM encryption for gateway secrets at rest and strict two-tier role masking.
 */

import crypto from 'node:crypto';
import type { PaymentGatewayCredentials, MaskedGatewayCredentials } from './types.ts';

const MASTER_SECRET = process.env.PAYMENT_GATEWAY_MASTER_KEY || 'atlas-multi-tenant-gateway-master-key-2026';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getDerivedKey(): Buffer {
  return crypto.scryptSync(MASTER_SECRET, 'project-atlas-payment-salt', 32);
}

/**
 * Encrypt gateway secret using AES-256-GCM
 */
export function encryptGatewaySecret(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getDerivedKey(), iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt gateway secret
 */
export function decryptGatewaySecret(cipherPayload: string): string {
  if (!cipherPayload) return '';
  if (!cipherPayload.includes(':')) return cipherPayload; // Fallback for plain/mock

  try {
    const [ivHex, tagHex, encryptedHex] = cipherPayload.split(':');
    if (!ivHex || !tagHex || !encryptedHex) return cipherPayload;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getDerivedKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return cipherPayload;
  }
}

/**
 * Mask secret string: e.g. ****************ABCD
 */
export function maskGatewaySecret(val?: string | null): string {
  if (!val) return '';
  const clean = val.trim();
  if (clean.length <= 4) return '****';
  const lastFour = clean.slice(-4);
  return `${'*'.repeat(16)}${lastFour}`;
}

/**
 * Mask Client ID / Merchant ID: e.g. ********1234
 */
export function maskGatewayId(val?: string | null): string {
  if (!val) return '';
  const clean = val.trim();
  if (clean.length <= 4) return clean;
  const lastFour = clean.slice(-4);
  return `********${lastFour}`;
}

/**
 * Sanitize gateway credentials for UI consumption
 * Super Admin or Client Admin viewing masked representations
 */
export function sanitizeGatewayCredentials(creds: PaymentGatewayCredentials): MaskedGatewayCredentials {
  return {
    hasMerchantId: !!creds.merchantId,
    maskedMerchantId: creds.merchantId ? maskGatewayId(creds.merchantId) : undefined,
    hasApiKey: !!creds.apiKey || !!creds.keyId,
    maskedApiKey: (creds.apiKey || creds.keyId) ? maskGatewaySecret(creds.apiKey || creds.keyId) : undefined,
    hasApiSecret: !!creds.apiSecret,
    maskedApiSecret: creds.apiSecret ? maskGatewaySecret(creds.apiSecret) : undefined,
    hasClientId: !!creds.clientId,
    maskedClientId: creds.clientId ? maskGatewayId(creds.clientId) : undefined,
    hasWebhookSecret: !!creds.webhookSecret,
    maskedWebhookSecret: creds.webhookSecret ? maskGatewaySecret(creds.webhookSecret) : undefined,
    receivingAddress: creds.receivingAddress,
  };
}

