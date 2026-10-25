/**
 * Direct Crypto QR Deposit Types
 * Derived from Document 21_CRYPTO_QR_DEPOSITS.md
 */

export type CryptoNetwork = 'polygon' | 'ethereum' | 'bitcoin';

export type CryptoAsset = 'USDT' | 'USDC' | 'BTC' | 'ETH';

export interface WhitelistedAssetConfig {
  network: CryptoNetwork;
  networkLabel: string;
  asset: CryptoAsset;
  tokenContractAddress?: string;
  decimals: number;
  requiredConfirmations: number;
  minDepositGbpMinor: number;
  maxDepositGbpMinor: number;
  receivingAddress: string;
  rateToGbp: number; // 1 unit in GBP
  enabled: boolean;
}

export interface CryptoDepositIntent {
  id: string;
  userId: string;
  network: CryptoNetwork;
  asset: CryptoAsset;
  amountGbpMinor: number;
  quotedCryptoAmount: string; // Human readable
  quotedCryptoBaseUnits: string; // Integer base units
  exchangeRateGbp: number;
  receivingAddress: string;
  qrPayload: string;
  qrDataUrl?: string;
  status:
    | 'awaiting_transfer'
    | 'detected'
    | 'confirming'
    | 'risk_review'
    | 'credited'
    | 'expired_unmatched'
    | 'wrong_asset'
    | 'wrong_network'
    | 'underpaid';
  expiresAt: string;
  createdAt: string;
  detectedTxHash?: string;
  confirmationsObserved: number;
  requiredConfirmations: number;
  creditedAt?: string;
  reconciliationId?: string;
}

export interface ChainTransactionRecord {
  txHash: string;
  network: CryptoNetwork;
  asset: CryptoAsset;
  tokenContract?: string;
  destinationAddress: string;
  amountBaseUnits: string;
  confirmations: number;
  blockNumber: number;
  status: 'SUCCESS' | 'REVERTED';
}
