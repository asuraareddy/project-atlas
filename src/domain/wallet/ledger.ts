/**
 * Immutable Double-Entry Ledger System
 * Implements specifications in Document 08_WALLET_PAYMENTS_LEDGER.md
 */

export interface WalletBalance {
  userId: string;
  currency: string;
  cashAvailableMinor: number; // Integer GBP pence
  cashReservedMinor: number;  // Currently committed in wagers / pending withdrawals
  bonusMinor: number;         // Restricted promotional balance
  pointsBalance: number;      // Non-cash loyalty points
  lastUpdated: string;
}

export interface LedgerEntry {
  id: string;
  transactionGroupId: string;
  accountCode: 'CUSTOMER_CASH_LIABILITY' | 'PSP_CRYPTO_CLEARING' | 'GAME_STAKES' | 'PRIZE_PAYOUT' | 'BONUS_EXPENSE' | 'OPERATOR_REVENUE';
  direction: 'DEBIT' | 'CREDIT';
  amountMinor: number;
  currency: string;
  createdAt: string;
}

export interface LedgerTransactionGroup {
  id: string;
  sourceType: 'CRYPTO_DEPOSIT' | 'WAGER_STAKE' | 'WAGER_SETTLEMENT' | 'WITHDRAWAL_REQUEST' | 'WITHDRAWAL_PAID' | 'MANUAL_ADJUSTMENT' | 'VOID_REFUND';
  sourceId: string;
  idempotencyKey: string;
  reasonCode: string;
  actorId: string;
  entries: LedgerEntry[];
  createdAt: string;
}

export class LedgerService {
  // In-memory persistent balance snapshot projection for speed & atomic concurrency
  private static balances: Map<string, WalletBalance> = new Map([
    [
      'usr_player_01',
      {
        userId: 'usr_player_01',
        currency: 'GBP',
        cashAvailableMinor: 25000, // £250.00
        cashReservedMinor: 0,
        bonusMinor: 1000,          // £10.00
        pointsBalance: 450,
        lastUpdated: new Date().toISOString()
      }
    ],
    [
      'usr_player_02',
      {
        userId: 'usr_player_02',
        currency: 'GBP',
        cashAvailableMinor: 5000,  // £50.00
        cashReservedMinor: 0,
        bonusMinor: 0,
        pointsBalance: 120,
        lastUpdated: new Date().toISOString()
      }
    ]
  ]);

  private static processedIdempotencyKeys: Set<string> = new Set();
  private static journalTransactions: LedgerTransactionGroup[] = [];

  /**
   * Retrieves current wallet balance projection
   */
  static async getBalance(userId: string): Promise<WalletBalance> {
    if (!this.balances.has(userId)) {
      this.balances.set(userId, {
        userId,
        currency: 'GBP',
        cashAvailableMinor: 0,
        cashReservedMinor: 0,
        bonusMinor: 0,
        pointsBalance: 100, // Safe default welcome points
        lastUpdated: new Date().toISOString()
      });
    }
    return { ...this.balances.get(userId)! };
  }

  /**
   * Atomic Stake / Funds Reservation
   * Prevents double-spend under concurrent requests
   */
  static async reserveCash(userId: string, amountMinor: number, sourceId: string): Promise<boolean> {
    const wallet = await this.getBalance(userId);

    if (amountMinor <= 0) {
      throw new Error('INVALID_AMOUNT: Reservation amount must be greater than zero.');
    }

    if (wallet.cashAvailableMinor < amountMinor) {
      throw new Error(`INSUFFICIENT_FUNDS: Available cash ${(wallet.cashAvailableMinor / 100).toFixed(2)} is less than required ${(amountMinor / 100).toFixed(2)}`);
    }

    // Atomic state adjustment
    wallet.cashAvailableMinor -= amountMinor;
    wallet.cashReservedMinor += amountMinor;
    wallet.lastUpdated = new Date().toISOString();
    this.balances.set(userId, wallet);

    return true;
  }

  /**
   * Release reserved funds back to available balance (e.g. cancelled/voided round or rejected withdrawal)
   */
  static async releaseReservedCash(userId: string, amountMinor: number): Promise<void> {
    const wallet = await this.getBalance(userId);
    const releaseAmount = Math.min(amountMinor, wallet.cashReservedMinor);
    wallet.cashReservedMinor -= releaseAmount;
    wallet.cashAvailableMinor += releaseAmount;
    wallet.lastUpdated = new Date().toISOString();
    this.balances.set(userId, wallet);
  }

  /**
   * Post confirmed Crypto Deposit into Ledger
   * Debits PSP_CRYPTO_CLEARING, Credits CUSTOMER_CASH_LIABILITY
   * Strictly idempotent: same idempotencyKey cannot credit twice!
   */
  static async postCryptoDeposit(
    userId: string,
    amountMinor: number,
    idempotencyKey: string,
    cryptoTxHash: string
  ): Promise<LedgerTransactionGroup> {
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      console.warn(`Idempotent replay detected for key: ${idempotencyKey}`);
      const existing = this.journalTransactions.find((t) => t.idempotencyKey === idempotencyKey);
      if (existing) return existing;
    }

    if (amountMinor <= 0) {
      throw new Error('INVALID_DEPOSIT: Deposit amount must be positive.');
    }

    const txGroupId = `tx_grp_dep_${Date.now()}`;
    const now = new Date().toISOString();

    // Double-entry balanced journal entries: Total Debit == Total Credit
    const entries: LedgerEntry[] = [
      {
        id: `entry_${Date.now()}_1`,
        transactionGroupId: txGroupId,
        accountCode: 'PSP_CRYPTO_CLEARING',
        direction: 'DEBIT',
        amountMinor,
        currency: 'GBP',
        createdAt: now
      },
      {
        id: `entry_${Date.now()}_2`,
        transactionGroupId: txGroupId,
        accountCode: 'CUSTOMER_CASH_LIABILITY',
        direction: 'CREDIT',
        amountMinor,
        currency: 'GBP',
        createdAt: now
      }
    ];

    const group: LedgerTransactionGroup = {
      id: txGroupId,
      sourceType: 'CRYPTO_DEPOSIT',
      sourceId: cryptoTxHash,
      idempotencyKey,
      reasonCode: 'DIRECT_CRYPTO_QR_DEPOSIT_CONFIRMED',
      actorId: 'SYSTEM_BLOCKCHAIN_OBSERVER',
      entries,
      createdAt: now
    };

    // Commit to ledger
    this.journalTransactions.unshift(group);
    this.processedIdempotencyKeys.add(idempotencyKey);

    // Update wallet available balance
    const wallet = await this.getBalance(userId);
    wallet.cashAvailableMinor += amountMinor;
    wallet.lastUpdated = now;
    this.balances.set(userId, wallet);

    return group;
  }

  /**
   * Commit Final Game Settlement
   * Deducts reserved cash for loss, or credits winnings
   */
  static async settleWager(
    userId: string,
    stakeMinor: number,
    winningsMinor: number,
    gameSessionId: string,
    idempotencyKey: string
  ): Promise<LedgerTransactionGroup> {
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      const existing = this.journalTransactions.find((t) => t.idempotencyKey === idempotencyKey);
      if (existing) return existing;
    }

    const wallet = await this.getBalance(userId);
    const txGroupId = `tx_grp_set_${Date.now()}`;
    const now = new Date().toISOString();

    // Release reservation
    wallet.cashReservedMinor = Math.max(0, wallet.cashReservedMinor - stakeMinor);

    const entries: LedgerEntry[] = [];

    // Stake settlement: Debit Customer Liability, Credit Game Stakes
    entries.push({
      id: `entry_${Date.now()}_s1`,
      transactionGroupId: txGroupId,
      accountCode: 'CUSTOMER_CASH_LIABILITY',
      direction: 'DEBIT',
      amountMinor: stakeMinor,
      currency: 'GBP',
      createdAt: now
    });
    entries.push({
      id: `entry_${Date.now()}_s2`,
      transactionGroupId: txGroupId,
      accountCode: 'GAME_STAKES',
      direction: 'CREDIT',
      amountMinor: stakeMinor,
      currency: 'GBP',
      createdAt: now
    });

    // Payout if win: Debit Prize Payout, Credit Customer Liability
    if (winningsMinor > 0) {
      entries.push({
        id: `entry_${Date.now()}_w1`,
        transactionGroupId: txGroupId,
        accountCode: 'PRIZE_PAYOUT',
        direction: 'DEBIT',
        amountMinor: winningsMinor,
        currency: 'GBP',
        createdAt: now
      });
      entries.push({
        id: `entry_${Date.now()}_w2`,
        transactionGroupId: txGroupId,
        accountCode: 'CUSTOMER_CASH_LIABILITY',
        direction: 'CREDIT',
        amountMinor: winningsMinor,
        currency: 'GBP',
        createdAt: now
      });

      wallet.cashAvailableMinor += winningsMinor;
    }

    wallet.lastUpdated = now;
    this.balances.set(userId, wallet);

    const group: LedgerTransactionGroup = {
      id: txGroupId,
      sourceType: 'WAGER_SETTLEMENT',
      sourceId: gameSessionId,
      idempotencyKey,
      reasonCode: winningsMinor > 0 ? 'GAME_WIN_SETTLEMENT' : 'GAME_LOSS_SETTLEMENT',
      actorId: 'GAME_ORCHESTRATOR',
      entries,
      createdAt: now
    };

    this.journalTransactions.unshift(group);
    this.processedIdempotencyKeys.add(idempotencyKey);

    return group;
  }

  /**
   * Generic Payment Gateway Deposit Recording
   * Debits PSP_CRYPTO_CLEARING, Credits CUSTOMER_CASH_LIABILITY, credits available balance
   */
  static async recordDeposit(
    userId: string,
    amountMinor: number,
    idempotencyKey: string,
    referenceNote: string = 'Payment Gateway Deposit'
  ): Promise<LedgerTransactionGroup> {
    return this.postCryptoDeposit(userId, amountMinor, idempotencyKey, referenceNote);
  }

  /**
   * Request / Reserve Withdrawal
   * Reserves available funds in user wallet atomically
   */
  static async requestWithdrawal(
    userId: string,
    amountMinor: number,
    transactionId: string
  ): Promise<boolean> {
    return this.reserveCash(userId, amountMinor, transactionId);
  }

  /**
   * Returns recent ledger transactions
   */
  static async getTransactionHistory(userId?: string): Promise<LedgerTransactionGroup[]> {
    return [...this.journalTransactions];
  }
}
