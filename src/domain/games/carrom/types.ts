/**
 * Canonical Carrom Game Types & Physics Data Structures
 * Server-authoritative physics, tournament betting, and rules state.
 */

export type CoinType = 'white' | 'black' | 'queen' | 'striker';

export interface Vector2D {
  x: number;
  y: number;
}

export interface CarromCoin {
  id: number;
  type: CoinType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  isPocketed: boolean;
}

export interface CarromPocket {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export type PlayerSide = 'bottom' | 'top';

export interface CarromPlayer {
  id: string;
  name: string;
  side: PlayerSide;
  assignedColor: 'white' | 'black';
  score: number;
  pocketedCoins: CoinType[];
  isBot: boolean;
  avatar: string;
}

export type CarromTurnPhase =
  | 'positioning' // Player is positioning striker along baseline
  | 'aiming'      // Player is setting angle & power
  | 'simulating'  // Shot in motion, physics updating
  | 'game_over';  // Match finished

export interface CarromBettingConfig {
  stakeMinor: number;
  entryFeeMinor: number;
  prizePoolMinor: number;
  platformFeeMinor: number;
  rakePercentage: number;
  isRealMoney: boolean;
  isSettled?: boolean;
  settlementStatus: 'none' | 'reserved' | 'settled' | 'refunded';
  payoutTxId?: string;
}

export interface QueenState {
  isPocketed: boolean;
  pocketedBy: string | null;     // Player ID who pocketed the queen
  isCovered: boolean;            // Queen cover status
  pocketedOnTurnNumber: number | null;
}

export interface CarromShotRecord {
  playerId: string;
  angle: number;       // In radians
  power: number;       // Magnitude (0 to 100)
  strikerStartX: number;
  strikerStartY: number;
  pocketedInShot: CoinType[];
  foulCommitted: boolean;
  turnNumber: number;
  timestamp: string;
}

export interface CarromGameState {
  sessionId: string;
  mode: 'vs_ai' | 'pass_play' | 'multiplayer_room';
  players: CarromPlayer[];
  currentTurnPlayerId: string;
  turnPhase: CarromTurnPhase;
  turnNumber: number;
  coins: CarromCoin[];
  pockets: CarromPocket[];
  queenState: QueenState;
  strikerPlacement: {
    x: number;
    y: number;
    minX: number;
    maxX: number;
  };
  lastShot?: CarromShotRecord;
  lastNotice: string;
  winnerId: string | null;
  status: 'active' | 'completed' | 'abandoned' | 'cancelled';
  betting: CarromBettingConfig;
  createdAt: string;
  updatedAt: string;
}
