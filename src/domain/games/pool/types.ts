/**
 * 8-Ball Pool Pro - Domain Types & Data Contracts
 * Project Atlas In-House 8-Ball Pool Engine
 *
 * Reference: Jonathan Silva 8BallPool (MIT License) - Geometry & Trajectory principles
 * Self-contained, zero external dependencies.
 */

export type PoolBallType = 'cue' | 'solid' | 'stripe' | 'eight';

export type PoolPlayerGroup = 'solids' | 'stripes' | null;

export interface Vector2D {
  x: number;
  y: number;
}

export interface PoolBall {
  id: number;              // 0 = cue, 1-7 = solids, 8 = eight, 9-15 = stripes
  number: number;
  type: PoolBallType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;           // Base hex color
  stripeColor?: string;     // Secondary color for stripes
  isPocketed: boolean;
  pocketedOrder?: number;
}

export interface PoolPocket {
  id: number;
  name: 'TL' | 'TM' | 'TR' | 'BL' | 'BM' | 'BR';
  x: number;
  y: number;
  radius: number;
  dropRadius: number;
}

export interface PoolPlayer {
  id: string;
  name: string;
  avatar: string;
  group: PoolPlayerGroup;
  score: number;
  isBot: boolean;
  consecutiveFouls: number;
}

export type PoolGameMode = 'pvp_local' | 'vs_bot' | 'practice';

export type PoolTurnPhase =
  | 'aiming'
  | 'shooting'
  | 'simulating'
  | 'ball_in_hand'
  | 'game_over';

export interface PoolShotCommand {
  angle: number;       // Radians (0 to 2*PI), 0 pointing Right (+X)
  power: number;       // Normalized 0.0 to 1.0 (clamped to max impulse)
  cueBallOffset?: {    // Optional spin/english offset (-1 to 1)
    x: number;
    y: number;
  };
}

export interface PoolShotEvent {
  cueHit: boolean;
  firstBallHit: number | null;
  cushionHits: number;
  pocketedBalls: number[];
  scratch: boolean;
  foul: boolean;
  foulReason?: string;
}

export interface PoolAimTrajectory {
  cueStart: Vector2D;
  aimAngle: number;
  impactPoint: Vector2D | null;
  targetBallId: number | null;
  ghostBallCenter: Vector2D | null;
  targetDirection: Vector2D | null;
  cueDeflection: Vector2D | null;
  targetPocket: PoolPocket | null;
  cutAngleDeg: number | null;
}

export interface PoolGameState {
  sessionId: string;
  mode: PoolGameMode;
  status: 'active' | 'completed';
  winner: string | null;
  winReason?: string;
  turnPhase: PoolTurnPhase;
  activePlayerIndex: number; // 0 or 1
  players: [PoolPlayer, PoolPlayer];
  balls: PoolBall[];
  openTable: boolean;
  breakShotTaken: boolean;
  ballInHand: boolean;
  ballInHandPlayerId: string | null;
  lastShot?: PoolShotEvent;
  shotCount: number;
  turnCount: number;
  createdAt: number;
  updatedAt: number;
}
