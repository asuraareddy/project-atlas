/**
 * Project Atlas — Provider Secrets Cryptographic Storage & Masking Utility
 * Implements AES-256-GCM encryption for credentials at rest and safe masking for UI/API responses.
 */

import crypto from 'node:crypto';
import type { ProviderCredentials, MaskedProviderCredentials } from './types.ts';

// Master encryption key derived from environment or secure local fallback
const MASTER_SECRET = process.env.PROVIDER_ENCRYPTION_KEY || 'atlas-b2b-super-admin-master-secrets-key-2026';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function getDerivedKey(): Buffer {
  return crypto.scryptSync(MASTER_SECRET, 'project-atlas-salt-salt', 32);
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getDerivedKey(), iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM ciphertext
 */
export function decryptSecret(cipherPayload: string): string {
  if (!cipherPayload) return '';
  // Check if it's already plain or legacy unencrypted
  if (!cipherPayload.includes(':')) return cipherPayload;

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
    // If decryption fails, safely fallback or return as-is
    return cipherPayload;
  }
}

/**
 * Mask secret string for dashboard display: e.g. ****************ABCD
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '';
  const clean = secret.trim();
  if (clean.length <= 4) {
    return '****';
  }
  const lastFour = clean.slice(-4);
  const starsCount = Math.max(8, clean.length - 4);
  return `${'*'.repeat(Math.min(starsCount, 16))}${lastFour}`;
}

/**
 * Mask client ID: e.g. ********1234
 */
export function maskClientId(clientId?: string | null): string {
  if (!clientId) return '';
  const clean = clientId.trim();
  if (clean.length <= 4) return clean;
  const lastFour = clean.slice(-4);
  return `********${lastFour}`;
}

/**
 * Convert full credentials into safe masked structure for frontend serialization
 */
export function sanitizeCredentialsForFrontend(creds: ProviderCredentials): MaskedProviderCredentials {
  return {
    clientId: creds.clientId ? maskClientId(creds.clientId) : undefined,
    hasApiKey: !!creds.apiKey,
    maskedApiKey: creds.apiKey ? maskSecret(creds.apiKey) : undefined,
    hasApiSecret: !!creds.apiSecret,
    maskedApiSecret: creds.apiSecret ? maskSecret(creds.apiSecret) : undefined,
    hasUsername: !!creds.username,
    maskedUsername: creds.username ? maskClientId(creds.username) : undefined,
    hasPassword: !!creds.password,
    hasAccessToken: !!creds.accessToken,
    maskedAccessToken: creds.accessToken ? maskSecret(creds.accessToken) : undefined,
    authMethod: (creds as any).authMethod || 'API_KEY_HEADER',
  };
}

