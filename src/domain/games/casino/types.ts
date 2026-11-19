/**
 * Project Atlas - 1Stake Online Casino Platform Integration Contracts & DTOs
 * Reference: https://github.com/1stake/online-casino-platform
 * Test Mode Only - Turnkey iGaming, Provably Fair In-House & Aggregated Providers
 */

export type CasinoCategory =
  | 'all'
  | 'in_house'
  | 'live_casino'
  | 'table_games'
  | 'slots'
  | 'crash_instant'
  | 'lottery_raffles';

export type GameAvailabilityStatus =
  | 'playable_demo'
  | 'live_studio'
  | 'pending_credentials'
  | 'unavailable';

export interface CasinoGame {
  id: string;                          // e.g. '1stake_dice', '1stake_crash', 'evo_lightning_roulette'
  name: string;                        // e.g. '1Stake Provably Fair Dice'
  provider: string;                    // e.g. '1Stake In-House', 'Evolution', 'Pragmatic Play'
  category: CasinoCategory;
  thumbnail: string;
  hasDemo: boolean;
  rtp?: number;                        // e.g. 99.0
  isPopular?: boolean;
  status: GameAvailabilityStatus;      // Explicit honest status as required by audit
  isProvablyFair?: boolean;            // 1Stake in-house cryptographically verifiable randomness
  houseEdge?: number;                  // e.g. 1.0%
  description?: string;
}

export interface ProvablyFairSeedState {
  clientSeed: string;
  serverSeedHash: string;
  nonce: number;
}

export interface ProvablyFairVerificationResult {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  calculatedHash: string;
  derivedOutcome: number | string;
  isValid: boolean;
}

export interface CasinoLaunchRequest {
  playerId: string;
  gameId: string;
  currency?: 'GC' | 'SC' | 'GBP';
  language?: string;
  mode?: 'demo' | 'sandbox';
}

export interface CasinoLaunchResult {
  ok: boolean;
  launchUrl: string;
  mode: 'demo' | 'sandbox' | 'live_test';
  gameId: string;
  gameName: string;
  provider: string;
  sessionToken: string;
  expiresAt: string;
  status: GameAvailabilityStatus;
  liveStreamUrl?: string;
}

export interface FlexrixHmacHeaders {
  'X-Merchant-Id': string;
  'X-Timestamp': string;
  'X-Nonce': string;
  'X-Signature': string;
}

export type SeamlessWalletAction = 'bet' | 'win' | 'refund';

export interface SeamlessWalletCallbackPayload {
  action: SeamlessWalletAction;
  player_id: string;
  amount: number;
  currency: string;
  round_id: string;
  tx_id: string;
  game_id?: string;
  client_seed?: string;
  nonce?: number;
}

export interface SeamlessWalletCallbackResponse {
  ok: boolean;
  balance: number;
  error?: string;
  isSandbox: boolean;
  duplicate?: boolean;
}

export interface CasinoConfigStatus {
  isConfigured: boolean;
  isSandboxMode: boolean;
  testModeEnabled: boolean;
  providerUrl: string;
  merchantIdConfigured: boolean;
  merchantSecretConfigured: boolean;
  supportedProviders: string[];
  totalGamesCount: number;
  inHouseGamesCount: number;
  sweepstakesEnabled: boolean;
}
