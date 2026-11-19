/**
 * 8-Ball Pool Pro - Game Engine & Rules Evaluator
 * Project Atlas In-House 8-Ball BCA/WPA Rules Implementation
 */

import {
  PoolBall,
  PoolGameState,
  PoolGameMode,
  PoolPlayer,
  PoolPlayerGroup,
  PoolShotCommand,
  PoolShotEvent,
  PoolBallType,
  Vector2D,
} from './types';
import {
  POOL_TABLE_CONFIG,
  POOL_POCKETS,
  stepPhysics,
  simulateUntilRest,
  calculateAimTrajectory,
} from './physics';

export const BALL_COLOR_MAP: Record<number, { color: string; stripeColor?: string; type: PoolBallType }> = {
  0: { color: '#ffffff', type: 'cue' },
  1: { color: '#fbbf24', type: 'solid' },       // Yellow
  2: { color: '#3b82f6', type: 'solid' },       // Blue
  3: { color: '#ef4444', type: 'solid' },       // Red
  4: { color: '#a855f7', type: 'solid' },       // Purple
  5: { color: '#f97316', type: 'solid' },       // Orange
  6: { color: '#22c55e', type: 'solid' },       // Green
  7: { color: '#881337', type: 'solid' },       // Maroon
  8: { color: '#18181b', type: 'eight' },       // Black 8-Ball
  9: { color: '#fbbf24', stripeColor: '#ffffff', type: 'stripe' }, // Yellow Stripe
  10: { color: '#3b82f6', stripeColor: '#ffffff', type: 'stripe' }, // Blue Stripe
  11: { color: '#ef4444', stripeColor: '#ffffff', type: 'stripe' }, // Red Stripe
  12: { color: '#a855f7', stripeColor: '#ffffff', type: 'stripe' }, // Purple Stripe
  13: { color: '#f97316', stripeColor: '#ffffff', type: 'stripe' }, // Orange Stripe
  14: { color: '#22c55e', stripeColor: '#ffffff', type: 'stripe' }, // Green Stripe
  15: { color: '#881337', stripeColor: '#ffffff', type: 'stripe' }, // Maroon Stripe
};

/**
 * Creates the standard 15-ball triangular rack at the foot spot + cue ball at head string
 */
export function initializePoolBalls(): PoolBall[] {
  const balls: PoolBall[] = [];
  const r = POOL_TABLE_CONFIG.ballRadius;
  const spacing = r * 2.05; // Tight rack spacing
  const footSpotX = POOL_TABLE_CONFIG.footSpotX;
  const footSpotY = POOL_TABLE_CONFIG.centerSpotY;

  // 1. Cue Ball (id: 0) behind head string
  balls.push({
    id: 0,
    number: 0,
    type: 'cue',
    x: POOL_TABLE_CONFIG.headStringX,
    y: POOL_TABLE_CONFIG.centerSpotY,
    vx: 0,
    vy: 0,
    radius: r,
    mass: POOL_TABLE_CONFIG.ballMass,
    color: '#ffffff',
    isPocketed: false,
  });

  // Standard triangular rack layout (5 rows):
  // Row 0: 1 ball (Apex)
  // Row 1: 2 balls
  // Row 2: 3 balls (Center is 8-ball)
  // Row 3: 4 balls
  // Row 4: 5 balls (Corners must be one solid and one stripe)
  // Standard pattern: [1, 9, 2, 8, 10, 3, 14, 4, 11, 5, 12, 6, 13, 7, 15]
  const rackNumbers = [
    1,
    9, 2,
    10, 8, 3,
    4, 11, 5, 12,
    6, 13, 7, 14, 15,
  ];

  const dxRow = spacing * Math.cos(Math.PI / 6); // ~ r * sqrt(3)
  let ballIdx = 0;

  for (let row = 0; row < 5; row++) {
    const numBallsInRow = row + 1;
    const rowX = footSpotX + row * dxRow;
    const startY = footSpotY - ((numBallsInRow - 1) * spacing) / 2;

    for (let col = 0; col < numBallsInRow; col++) {
      const num = rackNumbers[ballIdx++];
      const spec = BALL_COLOR_MAP[num];
      const by = startY + col * spacing;

      balls.push({
        id: num,
        number: num,
        type: spec.type,
        x: rowX,
        y: by,
        vx: 0,
        vy: 0,
        radius: r,
        mass: POOL_TABLE_CONFIG.ballMass,
        color: spec.color,
        stripeColor: spec.stripeColor,
        isPocketed: false,
      });
    }
  }

  return balls;
}

/**
 * Create a new initial game state
 */
export function createInitialPoolGameState(
  sessionId: string,
  mode: PoolGameMode = 'vs_bot',
  player1Name = 'Player 1',
  player2Name = 'AceCue (Bot)'
): PoolGameState {
  const p1: PoolPlayer = {
    id: 'p1',
    name: player1Name,
    avatar: '🎱',
    group: null,
    score: 0,
    isBot: false,
    consecutiveFouls: 0,
  };

  const p2: PoolPlayer = {
    id: 'p2',
    name: mode === 'vs_bot' ? 'AceCue (Pro)' : player2Name,
    avatar: mode === 'vs_bot' ? '🤖' : '🎯',
    group: null,
    score: 0,
    isBot: mode === 'vs_bot',
    consecutiveFouls: 0,
  };

  return {
    sessionId,
    mode,
    status: 'active',
    winner: null,
    turnPhase: 'aiming',
    activePlayerIndex: 0,
    players: [p1, p2],
    balls: initializePoolBalls(),
    openTable: true,
    breakShotTaken: false,
    ballInHand: false,
    ballInHandPlayerId: null,
    shotCount: 0,
    turnCount: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Count remaining unpocketed balls for a group
 */
export function getRemainingBallsForGroup(balls: PoolBall[], group: PoolPlayerGroup): number {
  if (!group) return 7;
  return balls.filter(
    (b) => !b.isPocketed && ((group === 'solids' && b.type === 'solid') || (group === 'stripes' && b.type === 'stripe'))
  ).length;
}

/**
 * Apply shot impulse to cue ball
 */
export function applyShotImpulse(
  state: PoolGameState,
  command: PoolShotCommand
): PoolShotEvent {
  const cueBall = state.balls.find((b) => b.id === 0);
  if (!cueBall || cueBall.isPocketed) {
    throw new Error('Cue ball is not on the table to shoot.');
  }

  const clampedPower = Math.max(0.05, Math.min(1.0, command.power));
  const impulse = clampedPower * POOL_TABLE_CONFIG.maxImpulse;

  cueBall.vx = Math.cos(command.angle) * impulse;
  cueBall.vy = Math.sin(command.angle) * impulse;

  // Record shot event
  const shotEvent: PoolShotEvent = {
    cueHit: true,
    firstBallHit: null,
    cushionHits: 0,
    pocketedBalls: [],
    scratch: false,
    foul: false,
  };

  return shotEvent;
}

/**
 * Evaluate standard 8-ball rules after all balls come to rest
 */
export function evaluateShotRules(
  state: PoolGameState,
  shotEvent: PoolShotEvent
): { state: PoolGameState; message: string } {
  const activePlayer = state.players[state.activePlayerIndex];
  const opponent = state.players[1 - state.activePlayerIndex];
  state.shotCount++;
  state.updatedAt = Date.now();

  const cueBall = state.balls.find((b) => b.id === 0)!;
  const eightBall = state.balls.find((b) => b.id === 8)!;

  let foul = false;
  let foulReason = '';
  let continueTurn = false;
  let message = '';

  const activeGroup = activePlayer.group;
  const remainingActiveGroup = getRemainingBallsForGroup(state.balls, activeGroup);

  // 1. Check Scratch
  if (shotEvent.scratch) {
    foul = true;
    foulReason = 'Scratch: Cue ball was pocketed!';
  }

  // 2. Check 8-Ball pocketed
  if (eightBall.isPocketed) {
    if (shotEvent.scratch) {
      // Pocketed 8-ball AND scratched: Instant Loss
      state.status = 'completed';
      state.winner = opponent.id;
      state.winReason = `${activePlayer.name} scratched while pocketing the 8-Ball. ${opponent.name} wins!`;
      message = state.winReason;
      return { state, message };
    }

    if (remainingActiveGroup > 0) {
      // Pocketed 8-ball prematurely: Instant Loss
      state.status = 'completed';
      state.winner = opponent.id;
      state.winReason = `${activePlayer.name} pocketed the 8-Ball prematurely before clearing all group balls. ${opponent.name} wins!`;
      message = state.winReason;
      return { state, message };
    }

    // Legal 8-ball pocketed after clearing group: WIN!
    state.status = 'completed';
    state.winner = activePlayer.id;
    state.winReason = `${activePlayer.name} legally pocketed the 8-Ball! Victory!`;
    message = state.winReason;
    return { state, message };
  }

  // 3. Break Shot Specifics
  if (!state.breakShotTaken) {
    state.breakShotTaken = true;
    if (foul) {
      message = `Break Foul: ${foulReason} Opponent gets Ball in Hand!`;
    } else {
      message = `Break shot complete! Table is Open.`;
    }
  } else {
    // 4. Regular Shot Foul Checking
    if (!foul) {
      // Must hit a ball
      if (shotEvent.firstBallHit === null) {
        foul = true;
        foulReason = 'Foul: Cue ball failed to contact any ball!';
      } else {
        const hitBall = state.balls.find((b) => b.id === shotEvent.firstBallHit);
        if (hitBall) {
          if (!state.openTable) {
            // Must hit player's own group first, unless on 8-ball
            if (remainingActiveGroup > 0) {
              const isOwnGroup =
                (activeGroup === 'solids' && hitBall.type === 'solid') ||
                (activeGroup === 'stripes' && hitBall.type === 'stripe');
              if (!isOwnGroup) {
                foul = true;
                foulReason = `Foul: Must contact your own group (${activeGroup}) first!`;
              }
            } else {
              // Player is on the 8-ball, must hit 8-ball first
              if (hitBall.type !== 'eight') {
                foul = true;
                foulReason = 'Foul: Must hit the 8-Ball when clearing remaining balls!';
              }
            }
          } else {
            // Open table: cannot hit 8-ball first
            if (hitBall.type === 'eight') {
              foul = true;
              foulReason = 'Foul: Cannot hit the 8-Ball first on an open table!';
            }
          }
        }
      }
    }
  }

  // 5. Evaluate Pocketed Balls & Group Assignment
  const pocketedObjectBalls = shotEvent.pocketedBalls
    .map((id) => state.balls.find((b) => b.id === id)!)
    .filter((b) => b && b.id !== 0 && b.id !== 8);

  if (!foul && pocketedObjectBalls.length > 0) {
    if (state.openTable && state.breakShotTaken) {
      // First legal ball pocketed claims group!
      const firstPocketed = pocketedObjectBalls[0];
      if (firstPocketed.type === 'solid') {
        activePlayer.group = 'solids';
        opponent.group = 'stripes';
        state.openTable = false;
        continueTurn = true;
        message = `${activePlayer.name} pocketed a Solid! Assigned Solids. Turn continues.`;
      } else if (firstPocketed.type === 'stripe') {
        activePlayer.group = 'stripes';
        opponent.group = 'solids';
        state.openTable = false;
        continueTurn = true;
        message = `${activePlayer.name} pocketed a Stripe! Assigned Stripes. Turn continues.`;
      }
    } else if (!state.openTable) {
      // Check if player pocketed at least one ball of their own group
      const pocketedOwn = pocketedObjectBalls.some(
        (b) =>
          (activeGroup === 'solids' && b.type === 'solid') ||
          (activeGroup === 'stripes' && b.type === 'stripe')
      );
      if (pocketedOwn) {
        continueTurn = true;
        message = `${activePlayer.name} pocketed a ${activeGroup === 'solids' ? 'Solid' : 'Stripe'}! Turn continues.`;
      } else {
        message = `${activePlayer.name} did not pocket their own ball. Turn passes.`;
      }
    }
  } else if (!foul) {
    message = `${activePlayer.name} did not pocket any ball. Turn passes.`;
  }

  // 6. Handle Foul Penalties & Ball In Hand
  if (foul) {
    shotEvent.foul = true;
    shotEvent.foulReason = foulReason;
    state.ballInHand = true;
    state.ballInHandPlayerId = opponent.id;
    state.turnPhase = 'ball_in_hand';
    state.activePlayerIndex = 1 - state.activePlayerIndex;
    state.turnCount++;

    // If cue ball was pocketed (scratch), respawn on table
    if (cueBall.isPocketed) {
      cueBall.isPocketed = false;
      cueBall.x = POOL_TABLE_CONFIG.headStringX;
      cueBall.y = POOL_TABLE_CONFIG.centerSpotY;
      cueBall.vx = 0;
      cueBall.vy = 0;
    }

    message = `Foul! ${foulReason} ${opponent.name} gets Ball in Hand!`;
  } else if (continueTurn) {
    state.turnPhase = 'aiming';
    state.ballInHand = false;
    state.ballInHandPlayerId = null;
  } else {
    // Switch turn
    state.activePlayerIndex = 1 - state.activePlayerIndex;
    state.turnCount++;
    state.turnPhase = 'aiming';
    state.ballInHand = false;
    state.ballInHandPlayerId = null;
  }

  state.lastShot = shotEvent;
  return { state, message };
}

/**
 * Place cue ball for Ball In Hand
 */
export function placeCueBall(
  state: PoolGameState,
  x: number,
  y: number
): { success: boolean; error?: string } {
  const r = POOL_TABLE_CONFIG.ballRadius;
  const minX = POOL_TABLE_CONFIG.cushionWidth + r + 2;
  const maxX = POOL_TABLE_CONFIG.width - POOL_TABLE_CONFIG.cushionWidth - r - 2;
  const minY = POOL_TABLE_CONFIG.cushionWidth + r + 2;
  const maxY = POOL_TABLE_CONFIG.height - POOL_TABLE_CONFIG.cushionWidth - r - 2;

  if (x < minX || x > maxX || y < minY || y > maxY) {
    return { success: false, error: 'Cue ball position is outside table bounds.' };
  }

  // Check collision with other unpocketed balls
  for (const b of state.balls) {
    if (b.id === 0 || b.isPocketed) continue;
    const dist = Math.hypot(b.x - x, b.y - y);
    if (dist < 2 * r) {
      return { success: false, error: 'Cue ball overlaps another ball.' };
    }
  }

  const cueBall = state.balls.find((b) => b.id === 0);
  if (!cueBall) return { success: false, error: 'Cue ball missing.' };

  cueBall.x = x;
  cueBall.y = y;
  cueBall.vx = 0;
  cueBall.vy = 0;
  cueBall.isPocketed = false;

  state.ballInHand = false;
  state.ballInHandPlayerId = null;
  state.turnPhase = 'aiming';
  state.updatedAt = Date.now();

  return { success: true };
}

/**
 * Heuristic AI Bot ("AceCue")
 * Calculates best shot based on pocket alignment and obstruction
 */
export function computeBotShot(state: PoolGameState): PoolShotCommand {
  const cueBall = state.balls.find((b) => b.id === 0);
  if (!cueBall || cueBall.isPocketed) {
    return { angle: 0, power: 0.5 };
  }

  const botPlayer = state.players[state.activePlayerIndex];
  const botGroup = botPlayer.group;
  const remainingOwnBalls = getRemainingBallsForGroup(state.balls, botGroup);

  // Eligible target balls
  const candidateBalls = state.balls.filter((b) => {
    if (b.id === 0 || b.isPocketed) return false;
    if (state.openTable) {
      return b.id !== 8; // Open table: any except 8
    }
    if (remainingOwnBalls > 0) {
      return (botGroup === 'solids' && b.type === 'solid') || (botGroup === 'stripes' && b.type === 'stripe');
    }
    // On 8-ball
    return b.id === 8;
  });

  if (candidateBalls.length === 0) {
    // Fallback: hit 8-ball or closest ball
    return { angle: 0, power: 0.6 };
  }

  let bestScore = -Infinity;
  let bestAngle = 0;
  let bestPower = 0.55;

  // Evaluate each candidate ball against each pocket
  for (const target of candidateBalls) {
    for (const pocket of POOL_POCKETS) {
      // Vector from target ball to pocket
      const tpx = pocket.x - target.x;
      const tpy = pocket.y - target.y;
      const tpDist = Math.hypot(tpx, tpy) || 1;
      const tpDirX = tpx / tpDist;
      const tpDirY = tpy / tpDist;

      // Desired ghost ball position (contact point on opposite side of target towards pocket)
      const r = POOL_TABLE_CONFIG.ballRadius;
      const gbx = target.x - tpDirX * (2 * r);
      const gby = target.y - tpDirY * (2 * r);

      // Cue vector to ghost ball
      const cgx = gbx - cueBall.x;
      const cgy = gby - cueBall.y;
      const cgDist = Math.hypot(cgx, cgy) || 1;
      const cgDirX = cgx / cgDist;
      const cgDirY = cgy / cgDist;

      // Cut angle alignment: dot product between cue-to-ghost and ghost-to-pocket
      const cutAlignment = cgDirX * tpDirX + cgDirY * tpDirY;

      // If cut is too thin (greater than 80 deg), difficult shot
      if (cutAlignment < 0.2) continue;

      // Distance penalty
      const score = (cutAlignment * 100) - (tpDist * 0.05) - (cgDist * 0.03);

      if (score > bestScore) {
        bestScore = score;
        bestAngle = Math.atan2(cgy, cgx);
        // Power scales with combined distance
        const totalDist = tpDist + cgDist;
        bestPower = Math.min(0.9, Math.max(0.35, totalDist / 900));
      }
    }
  }

  // If no good pocket alignment was found, aim directly at closest candidate ball
  if (bestScore === -Infinity) {
    const closest = candidateBalls[0];
    const dx = closest.x - cueBall.x;
    const dy = closest.y - cueBall.y;
    bestAngle = Math.atan2(dy, dx);
    bestPower = 0.6;
  }

  return {
    angle: bestAngle,
    power: bestPower,
  };
}
