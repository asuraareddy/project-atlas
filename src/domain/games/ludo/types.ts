/**
 * Canonical Ludo Game Engine Types
 * Deterministic board rules, tokens, player turns, and session state.
 */

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export type TokenState = 'base' | 'track' | 'home_path' | 'home';

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
  isBot: boolean;
  tokens: LudoToken[];
  score: number;
  hasWon: boolean;
  rank?: number;
}

export type LudoGameMode = 'vs_ai' | 'pass_play' | 'multiplayer_room';

export type LudoTurnPhase = 'need_roll' | 'need_move' | 'game_over';

export interface ValidMove {
  tokenId: number;
  color: LudoColor;
  fromState: TokenState;
  fromPosition: number;
  toState: TokenState;
  toPosition: number;
  isCapture: boolean;
  capturedToken?: { color: LudoColor; tokenId: number };
  isHome: boolean;
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
  winnerColor: LudoColor | null;
  status: 'active' | 'completed' | 'abandoned';
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
