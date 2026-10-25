/**
 * Canonical Game Provider Integration Contracts
 * Derived from Documents 07_GAME_CATALOG.md, 18_PROVIDER_API_INTEGRATION.md, and 19_MATKA_UI_AND_API_MAPPING.md
 */

export type ProviderStatus =
  | 'available'
  | 'open'
  | 'closed'
  | 'suspended'
  | 'maintenance'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'final'
  | 'unknown';

export interface ProviderRef {
  providerId: string;
  externalId: string;
  externalVersion?: string;
}

export interface MarketSummary {
  id: string; // Platform ID
  providerRef: ProviderRef;
  name: string;
  status: ProviderStatus;
  timezone: string;
  opensAt: string; // ISO timestamp
  closesAt: string; // ISO timestamp
  cutoffAt: string; // ISO timestamp (enforced on server)
  lastUpdatedAt: string;
  capabilities: string[];
  latestResult?: {
    openPana?: string;
    closePana?: string;
    jodi?: string;
    status: 'provisional' | 'final' | 'corrected' | 'void';
    publishedAt: string;
  };
}

export interface ChartRecord {
  date: string;
  day: string;
  openPana: string;
  jodi: string;
  closePana: string;
  sourceResultRef: string;
}

export interface ParticipationCommand {
  marketId: string;
  entryType: 'single_digit' | 'jodi_digit' | 'single_pana' | 'double_pana' | 'triple_pana';
  selectedValues: string;
  stakeMinor: number; // Integer GBP pence
  currency: string;
  userId: string;
  idempotencyKey: string;
}

export interface ParticipationReceipt {
  participationId: string;
  marketId: string;
  marketName: string;
  entryType: string;
  selectedValues: string;
  stakeMinor: number;
  currency: string;
  status: 'accepted' | 'pending' | 'rejected';
  acceptedAt: string;
  providerReference: string;
}

export interface GameRoom {
  roomId: string;
  category: 'carrom' | 'ludo' | 'pool';
  name: string;
  stakeMinor: number;
  currency: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in_progress' | 'settled';
  mode: 'classic' | 'points' | 'tournament';
}

export interface GameAdapter {
  getCapabilities(): {
    realtimeSockets: boolean;
    serverAuthoritativeTurns: boolean;
    independentRng: boolean;
    historicalCharts: boolean;
  };
  validateAction?(action: any): Promise<boolean>;
  getStatus?(sessionId: string): Promise<string>;
}

export interface MatkaProviderAdapter extends GameAdapter {
  getMarkets(): Promise<MarketSummary[]>;
  getMarket(marketId: string): Promise<MarketSummary | null>;
  getMarketChart(marketId: string): Promise<ChartRecord[]>;
  submitParticipation(command: ParticipationCommand): Promise<ParticipationReceipt>;
}

export interface CarromProviderAdapter extends GameAdapter {
  getActiveRooms(): Promise<GameRoom[]>;
  createRoom(name: string, stakeMinor: number, mode: string): Promise<GameRoom>;
  joinRoom(roomId: string, userId: string): Promise<{ sessionId: string; status: string }>;
}

export interface LudoProviderAdapter extends GameAdapter {
  getActiveRooms(): Promise<GameRoom[]>;
  createRoom(name: string, stakeMinor: number, mode: string): Promise<GameRoom>;
  joinRoom(roomId: string, userId: string): Promise<{ sessionId: string; status: string }>;
}

export interface OtherGamesProviderAdapter extends GameAdapter {
  getGames(): Promise<Array<{ id: string; name: string; category: string; description: string; status: string }>>;
  getPoolRooms(): Promise<GameRoom[]>;
}
