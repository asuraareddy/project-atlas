/**
 * Canonical Ludo Game Engine Types
 * Deterministic board rules, tokens, step-by-step pathing, betting, and session state.
 */

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export type TokenState = 'base' | 'track' | 'home_path' | 'home';

export interface GridCoord {
  r: number;
  c: number;
}

export interface StepCoord extends GridCoord {
  stepCount: number;
  isHome?: boolean;
}

export interface LudoToken {
  id: number; // 0, 1, 2, 3
  color: LudoColor;
  state: TokenState;
  /**
   * position:
   * - In 'base': slot index 0..3
   * - In 'track': common track index 0..51
   * - In 'home_path': home column step 0..4
   * - In 'home': 5 (completed)
   */
  position: number;
  /** Total steps moved since exiting base (0 to 57, where 57 is home) */
  stepCount: number;
}

export interface LudoPlayer {
  id: string;
  name: string;
  color: LudoColor;
  avatar: string;
  isBot: boolean;
  isHuman: boolean;
  connectionStatus: 'online' | 'reconnecting' | 'bot';
  tokens: LudoToken[];
  score: number;
  hasWon: boolean;
  rank?: number;
}

export type LudoGameMode = 'vs_ai' | 'pass_play' | 'multiplayer_room';

export type LudoTurnPhase = 'need_roll' | 'need_move' | 'animating' | 'game_over';

export interface ValidMove {
  tokenId: number;
  color: LudoColor;
  fromState: TokenState;
  fromPosition: number;
  toState: TokenState;
  toPosition: number;
  stepPath: StepCoord[]; // Sequential cell-by-cell coordinates for smooth animation
  isCapture: boolean;
  capturedToken?: { color: LudoColor; tokenId: number; baseCoord: GridCoord };
  isHome: boolean;
}

export interface LastMoveExecution {
  tokenId: number;
  color: LudoColor;
  roll: number;
  stepPath: StepCoord[];
  isCapture: boolean;
  capturedToken?: { color: LudoColor; tokenId: number; baseCoord: GridCoord };
  isHome: boolean;
  timestamp: string;
}

export interface LudoBettingConfig {
  stakeMinor: number;        // e.g. 200 = £2.00, 0 = Practice
  entryFeeMinor: number;     // Equivalent to stakeMinor
  prizePoolMinor: number;    // Gross stakes minus commission
  platformFeeMinor: number;  // Platform commission (e.g. 10%)
  rakePercentage: number;    // e.g. 10%
  isRealMoney: boolean;      // False by default in development
  isSettled?: boolean;
  settlementStatus: 'none' | 'reserved' | 'settled' | 'refunded';
  payoutTxId?: string;
}

export interface LudoGameState {
  sessionId: string;
  mode: LudoGameMode;
  playerCount: 2 | 4;
  players: LudoPlayer[];
  currentTurnColor: LudoColor;
  turnPhase: LudoTurnPhase;
  currentDiceRoll: number | null;
  consecutiveSixes: number;
  extraTurnPending: boolean;
  lastMoveNotice: string;
  lastExecutedMove?: LastMoveExecution;
  winnerColor: LudoColor | null;
  status: 'active' | 'completed' | 'abandoned' | 'cancelled';
  betting: LudoBettingConfig;
  turnHistoryCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MoveRequest {
  sessionId: string;
  color: LudoColor;
  tokenId: number;
}

export interface RollRequest {
  sessionId: string;
  color: LudoColor;
}

export interface LudoMatchmakingRequest {
  mode: LudoGameMode;
  playerCount: 2 | 4;
  stakeMinor: number;
  userId?: string;
  playerName?: string;
}
