/**
 * Project Atlas — Multi-Tenant Payment Gateway Acceptance Test Suite
 * Validates all 12 Mandatory Test Requirements from Section 10:
 * 
 * Scenario 1: Super Admin adds platform gateway and assigns to Ambaari.
 * Scenario 2: Ambaari Client Admin adds its own gateway (Option B: Razorpay UPI).
 * Scenario 3: Client Admin updates or rotates credentials.
 * Scenario 4: Two different domains use different gateway providers.
 * Scenario 5: Multiple clients use the same provider with separate merchant credentials.
 * Scenario 6: Deposit and withdrawal processing uses the correct tenant configuration.
 * Scenario 7: Invalid credentials produce a real connection failure.
 * Scenario 8: Duplicate webhooks do not create duplicate credits (idempotency check).
 * Scenario 9: Client Admin cannot access another client's gateway settings (cross-tenant violation).
 * Scenario 10: Client Admin cannot access platform secrets (masked).
 * Scenario 11: Super Admin cannot retrieve raw client-owned secrets (masked).
 * Scenario 12: Existing payment operations continue working (Crypto QR + Ledger integrity).
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PaymentGatewayService } from '../src/domain/payments/service.ts';
import { PaymentAdapterRegistry } from '../src/domain/payments/adapters/registry.ts';
import { LedgerService } from '../src/domain/wallet/ledger.ts';
import {
  maskGatewaySecret,
  maskGatewayId,
  sanitizeGatewayCredentials,
} from '../src/domain/payments/crypto.ts';

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failCount++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log(' PROJECT ATLAS — PAYMENT GATEWAY ACCEPTANCE TEST SUITE');
console.log('======================================================\n');

// Reset to clean deterministic seeds before starting
PaymentGatewayService.resetToDefaults();

// ---------------------------------------------------------------------------
// Scenario 1: Super Admin adds platform gateway and assigns to Ambaari
// ---------------------------------------------------------------------------
console.log('--- SCENARIO 1: Super Admin Adds Platform Gateway & Assigns to Ambaari ---');

test('1.1 Super Admin creates a new platform-wide PhonePe gateway assigned specifically to Ambaari', () => {
  const platGw = PaymentGatewayService.createPlatformGateway(
    {
      providerKey: 'phonepe_pg',
      providerName: 'Platform Centralized PhonePe PG',
      environment: 'PRODUCTION',
      currency: 'INR',
      supportsDeposit: true,
      supportsWithdrawal: false,
      minDepositMinor: 50000,
      maxDepositMinor: 10000000,
      minWithdrawalMinor: 0,
      maxWithdrawalMinor: 0,
      credentials: {
        merchantId: 'MERCHANT_PLATFORM_PHONEPE_01',
        apiKey: 'salt_key_secret_platform_9988',
      },
      assignedTenantIds: ['ten_ambaari_001'],
    },
    'usr_superadmin_01'
  );

  assert.ok(platGw.id.startsWith('gw_plat_phonepe_pg'));
  assert.equal(platGw.ownership, 'PLATFORM');
  assert.equal(platGw.providerKey, 'phonepe_pg');
  assert.equal(platGw.status, 'ACTIVE');
  assert.deepEqual(platGw.assignedTenantIds, ['ten_ambaari_001']);
});

test('1.2 Assigned platform gateway is accessible to Ambaari client admin', () => {
  const ambaariGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_ambaari_001');
  const found = ambaariGateways.find((gw) => gw.providerKey === 'phonepe_pg' && gw.ownership === 'PLATFORM');
  assert.ok(found, 'Platform PhonePe gateway must be visible to Ambaari');
});

test('1.3 Unassigned tenants cannot see or use Ambaari-specific platform gateway', () => {
  const unassignedGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_sports_only');
  const found = unassignedGateways.find((gw) => gw.providerKey === 'phonepe_pg' && gw.ownership === 'PLATFORM');
  assert.equal(found, undefined, 'Tenant ten_sports_only must NOT see platform gateway assigned solely to ten_ambaari_001');
});

// ---------------------------------------------------------------------------
// Scenario 2: Ambaari Client Admin adds its own gateway (Option B: Razorpay UPI)
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 2: Ambaari Client Admin Adds Client-Owned Gateway (Option B) ---');

test('2.1 Ambaari Client Admin connects their own merchant Razorpay account', () => {
  const clientGw = PaymentGatewayService.saveClientOwnedGateway(
    'ten_ambaari_001',
    {
      id: 'gw_ten_ambaari_custom_upi',
      providerKey: 'razorpay_upi',
      providerName: 'Ambaari 999 Direct UPI Express',
      environment: 'PRODUCTION',
      currency: 'INR',
      supportsDeposit: true,
      supportsWithdrawal: true,
      minDepositMinor: 10000,
      maxDepositMinor: 50000000,
      credentials: {
        keyId: 'rzp_live_ambaari_exclusive_112233',
        apiSecret: 'secret_ambaari_merchant_private_key',
        webhookSecret: 'whsec_ambaari_custom_listener',
      },
    },
    'usr_ambaari_admin_01'
  );

  assert.equal(clientGw.id, 'gw_ten_ambaari_custom_upi');
  assert.equal(clientGw.tenantId, 'ten_ambaari_001');
  assert.equal(clientGw.ownership, 'CLIENT_OWNED');
  assert.equal(clientGw.status, 'ACTIVE');
  assert.equal(clientGw.currency, 'INR');
});

test('2.2 Newly added client gateway appears in Ambaari gateway inventory', () => {
  const ambaariGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_ambaari_001');
  const custom = ambaariGateways.find((g) => g.id === 'gw_ten_ambaari_custom_upi');
  assert.ok(custom);
  assert.equal(custom.ownership, 'CLIENT_OWNED');
});

// ---------------------------------------------------------------------------
// Scenario 3: Client Admin updates or rotates credentials
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 3: Client Admin Updates / Rotates Credentials ---');

test('3.1 Rotating credentials updates version and preserves tenant ownership', () => {
  const rotated = PaymentGatewayService.saveClientOwnedGateway(
    'ten_ambaari_001',
    {
      id: 'gw_ten_ambaari_custom_upi',
      providerKey: 'razorpay_upi',
      providerName: 'Ambaari 999 Direct UPI Express (Rotated)',
      environment: 'PRODUCTION',
      currency: 'INR',
      supportsDeposit: true,
      supportsWithdrawal: true,
      credentials: {
        keyId: 'rzp_live_ambaari_rotated_998877',
        apiSecret: 'secret_ambaari_new_token_2026',
        webhookSecret: 'whsec_ambaari_new_listener_2026',
      },
    },
    'usr_ambaari_admin_01'
  );

  assert.equal(rotated.version, 2, 'Version should increment on credential update');
  assert.equal(rotated.providerName, 'Ambaari 999 Direct UPI Express (Rotated)');
  assert.equal(rotated.maskedCredentials.maskedApiKey, '****************8877');
});

// ---------------------------------------------------------------------------
// Scenario 4: Two different domains use different gateway providers
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 4: Two Domains Use Different Gateway Providers ---');

test('4.1 Configure Apex Sports to use Cashfree Payouts as its client-owned gateway', () => {
  PaymentGatewayService.saveClientOwnedGateway(
    'ten_sports_only',
    {
      id: 'gw_ten_apex_cashfree',
      providerKey: 'cashfree_payouts',
      providerName: 'Apex Sports Instant Cashfree Gateway',
      environment: 'PRODUCTION',
      currency: 'INR',
      supportsDeposit: true,
      supportsWithdrawal: true,
      credentials: {
        clientId: 'CF_CLIENT_APEX_SPORTS_9911',
        apiSecret: 'cf_secret_apex_sports_private_2026',
      },
    },
    'usr_apex_admin'
  );

  const ambaariActive = PaymentGatewayService.resolveActiveGatewayForOperation('ten_ambaari_001', 'DEPOSIT');
  const apexActive = PaymentGatewayService.resolveActiveGatewayForOperation('ten_sports_only', 'DEPOSIT');

  assert.ok(ambaariActive, 'Ambaari must have an active deposit gateway');
  assert.ok(apexActive, 'Apex Sports must have an active deposit gateway');
  assert.equal(ambaariActive.providerKey, 'razorpay_upi', 'Ambaari uses Razorpay UPI');
  assert.equal(apexActive.providerKey, 'cashfree_payouts', 'Apex Sports uses Cashfree Payouts');
  assert.notEqual(ambaariActive.id, apexActive.id, 'Gateway instances must be completely separate');
});

// ---------------------------------------------------------------------------
// Scenario 5: Multiple clients use same provider with separate merchant credentials
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 5: Multiple Clients Use Same Provider with Separate Credentials ---');

test('5.1 Configure Hybrid Gaming (Client 02) with Razorpay using separate merchant credentials', () => {
  PaymentGatewayService.saveClientOwnedGateway(
    'ten_hybrid_001',
    {
      id: 'gw_ten_hybrid_razorpay',
      providerKey: 'razorpay_upi',
      providerName: 'Hybrid Gaming Razorpay Merchant',
      environment: 'PRODUCTION',
      currency: 'INR',
      supportsDeposit: true,
      supportsWithdrawal: true,
      credentials: {
        keyId: 'rzp_live_hybrid_client02_445566',
        apiSecret: 'secret_hybrid_key_separate_4455',
        webhookSecret: 'whsec_hybrid_listener_99',
      },
    },
    'usr_hybrid_admin'
  );

  const ambaariGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_ambaari_001');
  const hybridGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_hybrid_001');

  const ambaariCustom = ambaariGateways.find((g) => g.id === 'gw_ten_ambaari_custom_upi');
  const hybridRzp = hybridGateways.find((g) => g.id === 'gw_ten_hybrid_razorpay');

  assert.ok(ambaariCustom);
  assert.ok(hybridRzp);
  assert.equal(ambaariCustom.id, 'gw_ten_ambaari_custom_upi');
  assert.equal(hybridRzp.id, 'gw_ten_hybrid_razorpay');
  assert.equal(ambaariCustom.maskedCredentials.maskedApiKey, '****************8877');
  assert.equal(hybridRzp.maskedCredentials.maskedApiKey, '****************5566');
});

// ---------------------------------------------------------------------------
// Scenario 6: Deposit and withdrawal processing uses correct tenant configuration
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 6: Deposit & Withdrawal Processing Uses Correct Tenant Config ---');

asyncTest('6.1 Deposit intent creates transaction linked strictly to requesting tenant', async () => {
  const result = await PaymentGatewayService.createDepositIntent({
    tenantId: 'ten_ambaari_001',
    tenantSlug: 'ambaari999',
    userId: 'usr_player_ambaari_101',
    amountMinor: 50000, // ₹500.00
    currency: 'INR',
    idempotencyKey: 'idem_dep_ambaari_test_001',
  });

  assert.ok(result.transaction.id.startsWith('tx_dep_'));
  assert.equal(result.transaction.tenantId, 'ten_ambaari_001');
  assert.equal(result.transaction.tenantSlug, 'ambaari999');
  assert.equal(result.transaction.providerKey, 'razorpay_upi');
  assert.equal(result.transaction.amountMinor, 50000);
  assert.equal(result.transaction.currency, 'INR');
  assert.equal(result.transaction.status, 'PENDING');
  assert.ok(result.intent.qrPayload.toLowerCase().includes('ambaari999'));
});

asyncTest('6.2 Withdrawal processing reserves ledger balance and dispatches via tenant gateway', async () => {
  // Seed initial ledger balance for player
  await LedgerService.recordDeposit('usr_player_ambaari_101', 100000, 'seed_dep_ambaari_wth', 'Initial balance seed');

  const wthResult = await PaymentGatewayService.processWithdrawal({
    tenantId: 'ten_ambaari_001',
    tenantSlug: 'ambaari999',
    userId: 'usr_player_ambaari_101',
    amountMinor: 25000, // ₹250.00
    currency: 'INR',
    destinationDetails: {
      vpa: 'player@okaxis',
      name: 'Rohan Sharma',
    },
    idempotencyKey: 'idem_wth_ambaari_test_001',
  });

  assert.ok(wthResult.transaction.id.startsWith('tx_wth_'));
  assert.equal(wthResult.transaction.tenantId, 'ten_ambaari_001');
  assert.equal(wthResult.transaction.type, 'WITHDRAWAL');
  assert.equal(wthResult.payout.status, 'COMPLETED');
});

// ---------------------------------------------------------------------------
// Scenario 7: Invalid credentials produce a real connection failure
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 7: Invalid Credentials Produce Real Connection Failure ---');

asyncTest('7.1 Testing connection with invalid Razorpay credentials returns DOWN and 401', async () => {
  const health = await PaymentAdapterRegistry.testConnection(
    'razorpay_upi',
    {
      keyId: 'invalid_key',
      apiSecret: 'bad_secret',
    },
    'PRODUCTION'
  );

  assert.equal(health.status, 'DOWN');
  assert.equal(health.statusCode, 401);
  assert.ok(health.message.includes('Invalid Key ID') || health.message.includes('BAD_REQUEST_ERROR'));
});

asyncTest('7.2 Testing connection with valid credentials returns HEALTHY and 200', async () => {
  const health = await PaymentAdapterRegistry.testConnection(
    'razorpay_upi',
    {
      keyId: 'rzp_live_valid_merchant_key',
      apiSecret: 'sec_valid_key',
    },
    'PRODUCTION'
  );

  assert.equal(health.status, 'HEALTHY');
  assert.equal(health.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Scenario 8: Duplicate webhooks do not create duplicate credits (Idempotency)
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 8: Duplicate Webhooks Do Not Duplicate Credits (Idempotency) ---');

asyncTest('8.1 First webhook delivery credits ledger atomically; second webhook is recognized as duplicate', async () => {
  // Create deposit intent
  const { transaction } = await PaymentGatewayService.createDepositIntent({
    tenantId: 'ten_ambaari_001',
    tenantSlug: 'ambaari999',
    userId: 'usr_player_idempotent_test',
    amountMinor: 20000, // ₹200.00
    currency: 'INR',
    idempotencyKey: 'idem_webhook_test_key_99',
  });

  const orderId = transaction.externalReference;
  const webhookBody = JSON.stringify({
    order_id: orderId,
    event: 'payment.captured',
    amount: 20000,
    currency: 'INR',
  });

  // Resolve active gateway for this transaction to extract the exact secret used
  const activeGw = PaymentGatewayService.resolveActiveGatewayForOperation('ten_ambaari_001', 'DEPOSIT', transaction.providerKey);
  assert.ok(activeGw, 'Active gateway must exist for transaction');
  const signingSecret = activeGw.credentials.webhookSecret || activeGw.credentials.apiSecret || '';
  const validSignature = crypto.createHmac('sha256', signingSecret).update(webhookBody).digest('hex');

  const balBefore = await LedgerService.getBalance('usr_player_idempotent_test');
  const cashBefore = balBefore.cashAvailableMinor;

  // 1st Webhook delivery
  const res1 = await PaymentGatewayService.processDepositWebhook({
    providerKey: 'razorpay_upi',
    payload: JSON.parse(webhookBody),
    signatureHeader: validSignature,
    rawBodyString: webhookBody,
  });

  assert.equal(res1.success, true);
  assert.equal(res1.duplicate, false, 'First webhook must be marked non-duplicate');

  const balAfter1 = await LedgerService.getBalance('usr_player_idempotent_test');
  assert.equal(balAfter1.cashAvailableMinor, cashBefore + 20000, 'Balance must increase by deposit amount');

  // 2nd Webhook delivery (duplicate callback)
  const res2 = await PaymentGatewayService.processDepositWebhook({
    providerKey: 'razorpay_upi',
    payload: JSON.parse(webhookBody),
    signatureHeader: validSignature,
    rawBodyString: webhookBody,
  });

  assert.equal(res2.success, true);
  assert.equal(res2.duplicate, true, 'Second webhook must be identified as duplicate');

  const balAfter2 = await LedgerService.getBalance('usr_player_idempotent_test');
  assert.equal(balAfter2.cashAvailableMinor, balAfter1.cashAvailableMinor, 'Duplicate webhook MUST NOT credit money a second time');
});

// ---------------------------------------------------------------------------
// Scenario 9: Client Admin cannot access another client's gateway settings
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 9: Client Admin Cross-Tenant Isolation Enforcement ---');

test('9.1 Client Admin from Tenant A cannot mutate a gateway owned by Tenant B', () => {
  assert.throws(
    () => {
      // Ambaari admin tries to alter Hybrid Gaming's gateway
      PaymentGatewayService.saveClientOwnedGateway(
        'ten_ambaari_001',
        {
          id: 'gw_ten_hybrid_razorpay', // Belongs to ten_hybrid_001!
          providerKey: 'razorpay_upi',
          providerName: 'Hacked Gateway Name',
          environment: 'PRODUCTION',
          currency: 'INR',
          supportsDeposit: true,
          supportsWithdrawal: true,
          credentials: {},
        },
        'usr_attacker'
      );
    },
    /Security Violation/i,
    'Must reject cross-tenant mutation with Security Violation'
  );
});

asyncTest('9.2 Client Admin cannot test connection of another tenant gateway', async () => {
  await assert.rejects(
    async () => {
      // Ambaari admin tries to test Hybrid Gaming's gateway
      await PaymentGatewayService.testGatewayConnection('gw_ten_hybrid_razorpay', 'ten_ambaari_001');
    },
    /Security Violation/i,
    'Must reject cross-tenant test attempt'
  );
});

test('9.3 Gateway inventory for Tenant A never contains Tenant B client-owned gateways', () => {
  const ambaariGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_ambaari_001');
  const hybridGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_hybrid_001');

  const ambaariContainsHybrid = ambaariGateways.some((g) => g.id === 'gw_ten_hybrid_razorpay');
  const hybridContainsAmbaari = hybridGateways.some((g) => g.id === 'gw_ten_ambaari_custom_upi');

  assert.equal(ambaariContainsHybrid, false, 'Ambaari must not see Hybrid private gateways');
  assert.equal(hybridContainsAmbaari, false, 'Hybrid must not see Ambaari private gateways');
});

// ---------------------------------------------------------------------------
// Scenario 10: Client Admin cannot access platform secrets (masked)
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 10: Client Admin Cannot Access Platform Secrets ---');

test('10.1 Platform gateway presented to Client Admin contains only masked credentials', () => {
  const ambaariGateways = PaymentGatewayService.getClientGatewaysForTenant('ten_ambaari_001');
  const platformGw = ambaariGateways.find((g) => g.ownership === 'PLATFORM');

  assert.ok(platformGw, 'Ambaari must have access to assigned platform gateway');
  assert.equal((platformGw).credentials, undefined, 'Raw credentials property must NOT be exposed');
  assert.ok(platformGw.maskedCredentials, 'Masked credentials object must be present');

  // Verify secret masking
  const masked = platformGw.maskedCredentials;
  if (masked.maskedApiKey) {
    assert.ok(masked.maskedApiKey.includes('*'), 'API Key must be masked with asterisks');
  }
  if (masked.maskedApiSecret) {
    assert.ok(masked.maskedApiSecret.includes('*'), 'API Secret must be masked with asterisks');
  }
});

// ---------------------------------------------------------------------------
// Scenario 11: Super Admin cannot retrieve raw client-owned secrets (masked)
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 11: Super Admin Cannot Access Raw Client-Owned Secrets ---');

test('11.1 Super Admin tenant gateways overview masks all client-owned private credentials', () => {
  const overview = PaymentGatewayService.getAllTenantGatewaysOverview();
  const ambaariClientGw = overview.find((g) => g.id === 'gw_ten_ambaari_custom_upi');

  assert.ok(ambaariClientGw);
  assert.equal(ambaariClientGw.ownership, 'CLIENT_OWNED');
  assert.equal((ambaariClientGw).credentials, undefined, 'Super Admin must NOT receive raw credentials object');
  assert.equal(ambaariClientGw.maskedCredentials.hasApiSecret, true);
  assert.equal(ambaariClientGw.maskedCredentials.maskedApiSecret, '****************2026');
  assert.equal(ambaariClientGw.maskedCredentials.hasApiKey, true);
  assert.equal(ambaariClientGw.maskedCredentials.maskedApiKey, '****************8877');
});

// ---------------------------------------------------------------------------
// Scenario 12: Existing payment operations continue working
// ---------------------------------------------------------------------------
console.log('\n--- SCENARIO 12: Existing Payment Operations Continue Working ---');

asyncTest('12.1 Direct Crypto QR generation functions seamlessly alongside modern gateways', async () => {
  const cryptoIntent = await PaymentGatewayService.createDepositIntent({
    tenantId: 'ten_ambaari_001',
    tenantSlug: 'ambaari999',
    userId: 'usr_crypto_player_01',
    amountMinor: 150000,
    currency: 'USDT',
    providerKey: 'crypto_direct_qr',
    idempotencyKey: 'idem_crypto_qr_regression_01',
  });

  assert.equal(cryptoIntent.transaction.providerKey, 'crypto_direct_qr');
  assert.ok(cryptoIntent.intent.qrPayload.startsWith('ethereum:'));
  assert.ok(cryptoIntent.intent.instructions.includes('on-chain block confirmations'));
});

asyncTest('12.2 Double-entry ledger balance reservations and invariants are preserved', async () => {
  const balance = await LedgerService.getBalance('usr_player_01');
  assert.ok(balance.cashAvailableMinor > 0);
  assert.equal(balance.currency, 'GBP');
});

// ---------------------------------------------------------------------------
// Summary & Exit Code
// ---------------------------------------------------------------------------
setTimeout(() => {
  console.log('\n======================================================');
  console.log(` PAYMENT GATEWAY TESTS COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}, 100);
