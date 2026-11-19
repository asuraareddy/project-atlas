import QRCode from 'qrcode';
import {
  WhitelistedAssetConfig,
  CryptoDepositIntent,
  CryptoNetwork,
  CryptoAsset,
  ChainTransactionRecord
} from './types';
import { LedgerService } from '../wallet/ledger';

/**
 * Direct Crypto QR Deposit & Blockchain Observation Service
 * Per Document 21_CRYPTO_QR_DEPOSITS.md
 * - Strictly NO payment gateways
 * - Independent server-side blockchain observation & validation
 * - Double-entry ledger credit upon confirmed block finality
 */
declare global {
  var __projectAtlasCryptoWhitelist: WhitelistedAssetConfig[] | undefined;
  var __projectAtlasCryptoIntents: Map<string, CryptoDepositIntent> | undefined;
  var __projectAtlasProcessedTxHashes: Set<string> | undefined;
}

const DEFAULT_WHITELISTED_ASSETS: WhitelistedAssetConfig[] = [
  {
    network: 'polygon',
    networkLabel: 'Polygon (POS)',
    asset: 'USDT',
    tokenContractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    requiredConfirmations: 12,
    minDepositGbpMinor: 1000,   // £10.00
    maxDepositGbpMinor: 500000, // £5,000.00
    receivingAddress: '0x71C8364b4c7365A5424D0A0b58e723c34a2e87B1',
    rateToGbp: 0.77, // 1 USDT = £0.77 GBP
    enabled: true
  },
  {
    network: 'ethereum',
    networkLabel: 'Ethereum (ERC-20)',
    asset: 'USDT',
    tokenContractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    requiredConfirmations: 2,
    minDepositGbpMinor: 5000,   // £50.00 (Due to gas)
    maxDepositGbpMinor: 1000000, // £10,000.00
    receivingAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    rateToGbp: 0.77,
    enabled: true
  },
  {
    network: 'bitcoin',
    networkLabel: 'Bitcoin Network',
    asset: 'BTC',
    decimals: 8,
    requiredConfirmations: 3,
    minDepositGbpMinor: 2500,   // £25.00
    maxDepositGbpMinor: 2000000, // £20,000.00
    receivingAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
    rateToGbp: 52000.00, // 1 BTC = £52,000.00 GBP
    enabled: true
  },
  {
    network: 'ethereum',
    networkLabel: 'Ethereum Native',
    asset: 'ETH',
    decimals: 18,
    requiredConfirmations: 2,
    minDepositGbpMinor: 2000,
    maxDepositGbpMinor: 1000000,
    receivingAddress: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    rateToGbp: 2200.00,
    enabled: true
  }
];

/**
 * Direct Crypto QR Deposit & Blockchain Observation Service
 * Per Document 21_CRYPTO_QR_DEPOSITS.md
 * - Strictly NO payment gateways
 * - Independent server-side blockchain observation & validation
 * - Double-entry ledger credit upon confirmed block finality
 */
export class CryptoWatcherService {
  private static get whitelist(): WhitelistedAssetConfig[] {
    if (!globalThis.__projectAtlasCryptoWhitelist) {
      globalThis.__projectAtlasCryptoWhitelist = [...DEFAULT_WHITELISTED_ASSETS];
    }
    return globalThis.__projectAtlasCryptoWhitelist;
  }

  private static get intents(): Map<string, CryptoDepositIntent> {
    if (!globalThis.__projectAtlasCryptoIntents) {
      globalThis.__projectAtlasCryptoIntents = new Map();
    }
    return globalThis.__projectAtlasCryptoIntents;
  }

  private static get processedTxHashes(): Set<string> {
    if (!globalThis.__projectAtlasProcessedTxHashes) {
      globalThis.__projectAtlasProcessedTxHashes = new Set();
    }
    return globalThis.__projectAtlasProcessedTxHashes;
  }

  static getWhitelistedAssets(): WhitelistedAssetConfig[] {
    return [...this.whitelist];
  }

  static getAssetConfig(network: CryptoNetwork, asset: CryptoAsset): WhitelistedAssetConfig | null {
    return (
      this.whitelist.find(
        (cfg) => cfg.network === network && cfg.asset === asset && cfg.enabled
      ) || null
    );
  }

  /**
   * Generates a live QR preview data URL for a given network and receiving address
   */
  static async generatePreviewQr(
    network: CryptoNetwork,
    receivingAddress: string,
    sampleAmount: number = 25
  ): Promise<{ qrPayload: string; qrDataUrl: string }> {
    let qrPayload = '';
    if (network === 'bitcoin') {
      qrPayload = `bitcoin:${receivingAddress}?amount=${(sampleAmount / 52000).toFixed(6)}`;
    } else {
      qrPayload = `ethereum:${receivingAddress}@${network === 'polygon' ? 137 : 1}`;
    }

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.warn('QR code generation preview failed', e);
    }

    return { qrPayload, qrDataUrl };
  }

  /**
   * Operator/Admin mutation: Update receiving address, exchange rates, depth, or active state
   */
  static async updateAssetConfig(
    network: CryptoNetwork,
    asset: CryptoAsset,
    updates: Partial<WhitelistedAssetConfig>
  ): Promise<WhitelistedAssetConfig> {
    const index = this.whitelist.findIndex(
      (c) => c.network === network && c.asset === asset
    );
    if (index === -1) {
      throw new Error(`Asset ${asset} on ${network} not found in whitelist.`);
    }

    const current = this.whitelist[index];
    const updated: WhitelistedAssetConfig = {
      ...current,
      network: current.network, // preserve key
      asset: current.asset      // preserve key
    };

    if (updates.receivingAddress !== undefined) {
      const addr = updates.receivingAddress.trim();
      if (!addr || addr.length < 15) {
        throw new Error('INVALID_ADDRESS: Operator receiving address is invalid or too short.');
      }
      updated.receivingAddress = addr;
    }

    if (updates.rateToGbp !== undefined) {
      const rate = Number(updates.rateToGbp);
      if (isNaN(rate) || rate <= 0) {
        throw new Error('INVALID_RATE: Rate to GBP must be a positive number.');
      }
      updated.rateToGbp = rate;
    }

    if (updates.requiredConfirmations !== undefined) {
      const conf = Number(updates.requiredConfirmations);
      if (isNaN(conf) || conf < 1) {
        throw new Error('INVALID_CONFIRMATIONS: Confirmation depth must be at least 1.');
      }
      updated.requiredConfirmations = conf;
    }

    if (updates.minDepositGbpMinor !== undefined) {
      const minVal = Number(updates.minDepositGbpMinor);
      if (!isNaN(minVal) && minVal > 0) {
        updated.minDepositGbpMinor = minVal;
      }
    }

    if (updates.maxDepositGbpMinor !== undefined) {
      const maxVal = Number(updates.maxDepositGbpMinor);
      if (!isNaN(maxVal) && maxVal > 0) {
        updated.maxDepositGbpMinor = maxVal;
      }
    }

    if (updates.networkLabel) {
      updated.networkLabel = updates.networkLabel;
    }

    if (updates.enabled !== undefined) {
      updated.enabled = Boolean(updates.enabled);
    }

    this.whitelist[index] = updated;
    return updated;
  }

  /**
   * Operator/Admin mutation: Add new whitelisted cryptocurrency asset
   */
  static async addAssetConfig(config: WhitelistedAssetConfig): Promise<WhitelistedAssetConfig> {
    const existingIndex = this.whitelist.findIndex(
      (c) => c.network === config.network && c.asset === config.asset
    );
    if (existingIndex !== -1) {
      return this.updateAssetConfig(config.network, config.asset, config);
    }

    if (!config.receivingAddress || config.receivingAddress.trim().length < 15) {
      throw new Error('INVALID_ADDRESS: Operator receiving address is required.');
    }

    this.whitelist.push({
      ...config,
      enabled: config.enabled ?? true
    });
    return config;
  }

  /**
   * Creates a backend-controlled deposit intent with dynamic QR
   */
  static async createDepositIntent(
    userId: string,
    network: CryptoNetwork,
    asset: CryptoAsset,
    amountGbpMinor: number
  ): Promise<CryptoDepositIntent> {
    const config = this.getAssetConfig(network, asset);
    if (!config) {
      throw new Error(`UNSUPPORTED_ASSET: Pair ${asset} on ${network} is not in the approved allowlist.`);
    }

    if (amountGbpMinor < config.minDepositGbpMinor || amountGbpMinor > config.maxDepositGbpMinor) {
      throw new Error(
        `AMOUNT_LIMIT: Minimum deposit is ${(config.minDepositGbpMinor / 100).toFixed(
          2
        )}, Maximum is ${(config.maxDepositGbpMinor / 100).toFixed(2)}`
      );
    }

    const gbpAmount = amountGbpMinor / 100;
    const cryptoAmount = gbpAmount / config.rateToGbp;
    const baseUnitsMultiplier = Math.pow(10, config.decimals);
    const baseUnits = Math.round(cryptoAmount * baseUnitsMultiplier).toString();

    // Standard crypto URI QR payload
    let qrPayload = '';
    if (network === 'bitcoin') {
      qrPayload = `bitcoin:${config.receivingAddress}?amount=${cryptoAmount.toFixed(6)}`;
    } else {
      qrPayload = `ethereum:${config.receivingAddress}@${network === 'polygon' ? 137 : 1}?value=${baseUnits}`;
    }

    // Generate QR Data URL
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (e) {
      console.warn('QR code generation fallback to string payload');
    }

    const intentId = `dep_intent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30-minute quote lock

    const intent: CryptoDepositIntent = {
      id: intentId,
      userId,
      network,
      asset,
      amountGbpMinor,
      quotedCryptoAmount: cryptoAmount.toFixed(4),
      quotedCryptoBaseUnits: baseUnits,
      exchangeRateGbp: config.rateToGbp,
      receivingAddress: config.receivingAddress,
      qrPayload,
      qrDataUrl,
      status: 'awaiting_transfer',
      confirmationsObserved: 0,
      requiredConfirmations: config.requiredConfirmations,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    this.intents.set(intentId, intent);
    return intent;
  }

  static getIntent(intentId: string): CryptoDepositIntent | null {
    return this.intents.get(intentId) || null;
  }

  static getAllIntents(): CryptoDepositIntent[] {
    return Array.from(this.intents.values());
  }

  /**
   * Independent Chain Observation Engine
   * Validates blockchain transfer against intent and commits double-entry credit once confirmed.
   * STRICT: Screenshot or user-supplied tx hash NEVER credits directly without this independent validation!
   */
  static async verifyAndProcessChainTransaction(
    intentId: string,
    chainTx: ChainTransactionRecord
  ): Promise<CryptoDepositIntent> {
    const intent = this.intents.get(intentId);
    if (!intent) {
      throw new Error(`INTENT_NOT_FOUND: No active deposit intent found for ${intentId}`);
    }

    if (intent.status === 'credited') {
      return intent;
    }

    // 1. Validate destination address matches assigned receiving address
    if (chainTx.destinationAddress.toLowerCase() !== intent.receivingAddress.toLowerCase()) {
      intent.status = 'wrong_asset';
      this.intents.set(intentId, intent);
      throw new Error('MISMATCHED_DESTINATION: Transfer destination address does not match intent receiving address.');
    }

    // 2. Validate network
    if (chainTx.network !== intent.network) {
      intent.status = 'wrong_network';
      this.intents.set(intentId, intent);
      throw new Error('WRONG_NETWORK: Transaction detected on incompatible blockchain network.');
    }

    // 3. Prevent duplicate hash reuse (Replay attack prevention)
    if (this.processedTxHashes.has(chainTx.txHash)) {
      throw new Error(`DUPLICATE_TX_HASH: Blockchain transaction ${chainTx.txHash} has already been credited.`);
    }

    // 4. Update status with observed confirmations
    intent.detectedTxHash = chainTx.txHash;
    intent.confirmationsObserved = chainTx.confirmations;

    if (chainTx.confirmations < intent.requiredConfirmations) {
      intent.status = 'confirming';
      this.intents.set(intentId, intent);
      return intent;
    }

    // 5. Block height confirmation reached: Post idempotent ledger credit!
    const idempotencyKey = `dep_onchain_${chainTx.network}_${chainTx.txHash}`;
    const ledgerTx = await LedgerService.postCryptoDeposit(
      intent.userId,
      intent.amountGbpMinor,
      idempotencyKey,
      chainTx.txHash
    );

    intent.status = 'credited';
    intent.creditedAt = new Date().toISOString();
    intent.reconciliationId = ledgerTx.id;
    this.processedTxHashes.add(chainTx.txHash);
    this.intents.set(intentId, intent);

    return intent;
  }
}
