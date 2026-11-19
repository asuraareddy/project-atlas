/**
 * 8-Ball Pool Pro - Physics & Collision Engine
 * Project Atlas In-House 2D Rigid Disc Simulation
 *
 * Provides:
 * 1. Table geometry, cushions, and pockets
 * 2. Elastic ball-to-ball collisions with impulse resolution
 * 3. Segmented cushion rail reflections with restitution
 * 4. Pocket suction and drop detection
 * 5. Deterministic multi-step simulation
 * 6. Ray-cast aim prediction and ghost-ball guideline calculations
 */

import { PoolBall, PoolPocket, Vector2D, PoolShotEvent, PoolAimTrajectory } from './types';

export const POOL_TABLE_CONFIG = {
  width: 1000,
  height: 500,
  cushionWidth: 44,
  ballRadius: 13,
  ballMass: 1.0,
  restitutionBall: 0.94,
  restitutionCushion: 0.82,
  friction: 0.986,
  restVelocityThreshold: 0.08,
  maxImpulse: 36, // Maximum initial speed at power = 1.0
  headStringX: 250,
  footSpotX: 750,
  centerSpotY: 250,
};

export const POOL_POCKETS: PoolPocket[] = [
  { id: 1, name: 'TL', x: 44, y: 44, radius: 32, dropRadius: 22 },
  { id: 2, name: 'TM', x: 500, y: 34, radius: 28, dropRadius: 20 },
  { id: 3, name: 'TR', x: 956, y: 44, radius: 32, dropRadius: 22 },
  { id: 4, name: 'BL', x: 44, y: 456, radius: 32, dropRadius: 22 },
  { id: 5, name: 'BM', x: 500, y: 466, radius: 28, dropRadius: 20 },
  { id: 6, name: 'BR', x: 956, y: 456, radius: 32, dropRadius: 22 },
];

export interface RailSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  normal: Vector2D;
}

// 6 cushion rails (Top-Left, Top-Right, Bottom-Left, Bottom-Right, Left, Right)
export const POOL_RAILS: RailSegment[] = [
  // Top Left rail
  { x1: 72, y1: 44, x2: 472, y2: 44, normal: { x: 0, y: 1 } },
  // Top Right rail
  { x1: 528, y1: 44, x2: 928, y2: 44, normal: { x: 0, y: 1 } },
  // Bottom Left rail
  { x1: 72, y1: 456, x2: 472, y2: 456, normal: { x: 0, y: -1 } },
  // Bottom Right rail
  { x1: 528, y1: 456, x2: 928, y2: 456, normal: { x: 0, y: -1 } },
  // Left rail
  { x1: 44, y1: 72, x2: 44, y2: 428, normal: { x: 1, y: 0 } },
  // Right rail
  { x1: 956, y1: 72, x2: 956, y2: 428, normal: { x: -1, y: 0 } },
];

/**
 * Check if a 2D point is inside a pocket radius
 */
export function getPocketCapture(x: number, y: number): PoolPocket | null {
  for (const pocket of POOL_POCKETS) {
    const dx = x - pocket.x;
    const dy = y - pocket.y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= pocket.radius * pocket.radius) {
      return pocket;
    }
  }
  return null;
}

/**
 * Resolve cushion bounce for a ball
 */
function resolveCushionBounce(ball: PoolBall): boolean {
  if (ball.isPocketed) return false;

  const r = ball.radius;
  let bounced = false;

  // Check against each rail segment
  for (const rail of POOL_RAILS) {
    if (rail.normal.y === 1) {
      // Top rail
      if (ball.y - r <= rail.y1 && ball.x >= rail.x1 && ball.x <= rail.x2) {
        if (ball.vy < 0) {
          ball.vy = -ball.vy * POOL_TABLE_CONFIG.restitutionCushion;
          ball.y = rail.y1 + r;
          bounced = true;
        }
      }
    } else if (rail.normal.y === -1) {
      // Bottom rail
      if (ball.y + r >= rail.y1 && ball.x >= rail.x1 && ball.x <= rail.x2) {
        if (ball.vy > 0) {
          ball.vy = -ball.vy * POOL_TABLE_CONFIG.restitutionCushion;
          ball.y = rail.y1 - r;
          bounced = true;
        }
      }
    } else if (rail.normal.x === 1) {
      // Left rail
      if (ball.x - r <= rail.x1 && ball.y >= rail.y1 && ball.y <= rail.y2) {
        if (ball.vx < 0) {
          ball.vx = -ball.vx * POOL_TABLE_CONFIG.restitutionCushion;
          ball.x = rail.x1 + r;
          bounced = true;
        }
      }
    } else if (rail.normal.x === -1) {
      // Right rail
      if (ball.x + r >= rail.x1 && ball.y >= rail.y1 && ball.y <= rail.y2) {
        if (ball.vx > 0) {
          ball.vx = -ball.vx * POOL_TABLE_CONFIG.restitutionCushion;
          ball.x = rail.x1 - r;
          bounced = true;
        }
      }
    }
  }

  // Safety bounding fallback for table exterior (if outside rails but not pocketed)
  const minX = POOL_TABLE_CONFIG.cushionWidth + r;
  const maxX = POOL_TABLE_CONFIG.width - POOL_TABLE_CONFIG.cushionWidth - r;
  const minY = POOL_TABLE_CONFIG.cushionWidth + r;
  const maxY = POOL_TABLE_CONFIG.height - POOL_TABLE_CONFIG.cushionWidth - r;

  // Only clamp if not near a pocket opening
  const nearPocket = getPocketCapture(ball.x, ball.y);
  if (!nearPocket) {
    if (ball.x < minX) {
      ball.x = minX;
      ball.vx = Math.abs(ball.vx) * POOL_TABLE_CONFIG.restitutionCushion;
      bounced = true;
    } else if (ball.x > maxX) {
      ball.x = maxX;
      ball.vx = -Math.abs(ball.vx) * POOL_TABLE_CONFIG.restitutionCushion;
      bounced = true;
    }
    if (ball.y < minY) {
      ball.y = minY;
      ball.vy = Math.abs(ball.vy) * POOL_TABLE_CONFIG.restitutionCushion;
      bounced = true;
    } else if (ball.y > maxY) {
      ball.y = maxY;
      ball.vy = -Math.abs(ball.vy) * POOL_TABLE_CONFIG.restitutionCushion;
      bounced = true;
    }
  }

  return bounced;
}

/**
 * Resolve 2D elastic collision between two spherical balls
 */
function resolveBallCollision(b1: PoolBall, b2: PoolBall): boolean {
  if (b1.isPocketed || b2.isPocketed) return false;

  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const distSq = dx * dx + dy * dy;
  const minDist = b1.radius + b2.radius;

  if (distSq >= minDist * minDist || distSq === 0) {
    return false;
  }

  const dist = Math.sqrt(distSq);

  // Normal vector from b1 to b2
  const nx = dx / dist;
  const ny = dy / dist;

  // Separate overlapping balls to prevent sticking
  const overlap = 0.5 * (minDist - dist);
  b1.x -= nx * overlap;
  b1.y -= ny * overlap;
  b2.x += nx * overlap;
  b2.y += ny * overlap;

  // Relative velocity
  const kx = b1.vx - b2.vx;
  const ky = b1.vy - b2.vy;

  // Velocity along normal
  const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

  // Only resolve if balls are moving towards each other
  if (nx * kx + ny * ky > 0) {
    const e = POOL_TABLE_CONFIG.restitutionBall;
    b1.vx -= p * b2.mass * nx * e;
    b1.vy -= p * b2.mass * ny * e;
    b2.vx += p * b1.mass * nx * e;
    b2.vy += p * b1.mass * ny * e;
    return true;
  }

  return false;
}

/**
 * Advance physics by a single discrete timestep (dt)
 */
export function stepPhysics(
  balls: PoolBall[],
  shotEvent?: PoolShotEvent
): { anyMoving: boolean; newPocketed: number[] } {
  let anyMoving = false;
  const newPocketed: number[] = [];

  // 1. Move balls & apply friction
  for (const b of balls) {
    if (b.isPocketed) continue;

    b.x += b.vx;
    b.y += b.vy;

    // Apply rolling friction
    b.vx *= POOL_TABLE_CONFIG.friction;
    b.vy *= POOL_TABLE_CONFIG.friction;

    // Check velocity threshold to stop
    const speed = Math.hypot(b.vx, b.vy);
    if (speed < POOL_TABLE_CONFIG.restVelocityThreshold) {
      b.vx = 0;
      b.vy = 0;
    } else {
      anyMoving = true;
    }

    // 2. Pocket suction & detection
    const pocket = getPocketCapture(b.x, b.y);
    if (pocket) {
      const pdx = pocket.x - b.x;
      const pdy = pocket.y - b.y;
      const pdist = Math.hypot(pdx, pdy);

      // Suction pull towards pocket cup center
      b.vx += (pdx / (pdist || 1)) * 0.45;
      b.vy += (pdy / (pdist || 1)) * 0.45;

      if (pdist < pocket.dropRadius) {
        b.isPocketed = true;
        b.vx = 0;
        b.vy = 0;
        b.x = pocket.x;
        b.y = pocket.y;
        newPocketed.push(b.id);
        if (shotEvent) {
          shotEvent.pocketedBalls.push(b.id);
          if (b.type === 'cue') {
            shotEvent.scratch = true;
          }
        }
      }
    } else {
      // 3. Cushion collisions
      const cushionHit = resolveCushionBounce(b);
      if (cushionHit && shotEvent) {
        shotEvent.cushionHits++;
      }
    }
  }

  // 4. Ball-to-ball collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i];
      const b2 = balls[j];
      const hit = resolveBallCollision(b1, b2);

      if (hit && shotEvent) {
        // Record first ball contacted by cue ball (id 0)
        if (b1.id === 0 && shotEvent.firstBallHit === null) {
          shotEvent.firstBallHit = b2.id;
        } else if (b2.id === 0 && shotEvent.firstBallHit === null) {
          shotEvent.firstBallHit = b1.id;
        }
      }
    }
  }

  return { anyMoving, newPocketed };
}

/**
 * Simulate all balls until they come to a complete rest.
 * Max safety limit of 1500 steps.
 */
export function simulateUntilRest(
  balls: PoolBall[],
  shotEvent: PoolShotEvent,
  maxSteps = 1500
): { steps: number; shotEvent: PoolShotEvent } {
  let steps = 0;
  while (steps < maxSteps) {
    const { anyMoving } = stepPhysics(balls, shotEvent);
    steps++;
    if (!anyMoving) break;
  }
  return { steps, shotEvent };
}

/**
 * Ray-cast aim prediction and ghost ball calculation
 * Adapted from Jonathan Silva's 8BallPool guideline geometry
 */
export function calculateAimTrajectory(
  cueBall: PoolBall,
  aimAngle: number,
  allBalls: PoolBall[]
): PoolAimTrajectory {
  const cueStart: Vector2D = { x: cueBall.x, y: cueBall.y };
  const r = cueBall.radius;
  const rayDir: Vector2D = {
    x: Math.cos(aimAngle),
    y: Math.sin(aimAngle),
  };

  let closestDist = Infinity;
  let targetBall: PoolBall | null = null;
  let ghostBallCenter: Vector2D | null = null;
  let targetDirection: Vector2D | null = null;
  let cueDeflection: Vector2D | null = null;
  let targetPocket: PoolPocket | null = null;
  let cutAngleDeg: number | null = null;

  // Find nearest object ball along ray
  for (const b of allBalls) {
    if (b.id === cueBall.id || b.isPocketed) continue;

    // Vector from cue to object ball
    const ox = b.x - cueBall.x;
    const oy = b.y - cueBall.y;

    // Project onto ray
    const proj = ox * rayDir.x + oy * rayDir.y;
    if (proj <= 0) continue; // Behind cue ball

    // Perpendicular distance squared from line
    const perpSq = (ox * ox + oy * oy) - (proj * proj);
    const twoR = 2 * r;

    if (perpSq <= twoR * twoR) {
      // Ball is in path of ray!
      const dHit = Math.sqrt(Math.max(0, twoR * twoR - perpSq));
      const distToImpact = proj - dHit;

      if (distToImpact > 0 && distToImpact < closestDist) {
        closestDist = distToImpact;
        targetBall = b;

        // Ghost ball center (where cue ball will be when touching target ball)
        const gbx = cueBall.x + rayDir.x * distToImpact;
        const gby = cueBall.y + rayDir.y * distToImpact;
        ghostBallCenter = { x: gbx, y: gby };

        // Normal from ghost ball to target ball (line of centers)
        const normalX = b.x - gbx;
        const normalY = b.y - gby;
        const normalLen = Math.hypot(normalX, normalY) || 1;
        const normDir: Vector2D = { x: normalX / normalLen, y: normalY / normalLen };
        targetDirection = normDir;

        // Tangent deflection for cue ball
        const dot = rayDir.x * normDir.x + rayDir.y * normDir.y;
        cueDeflection = {
          x: rayDir.x - normDir.x * dot,
          y: rayDir.y - normDir.y * dot,
        };

        // Cut angle in degrees
        cutAngleDeg = Math.round(Math.acos(Math.min(1, Math.max(-1, dot))) * (180 / Math.PI));

        // Find nearest pocket aligned with target direction
        let bestPocketDot = -Infinity;
        for (const pocket of POOL_POCKETS) {
          const pdx = pocket.x - b.x;
          const pdy = pocket.y - b.y;
          const plen = Math.hypot(pdx, pdy) || 1;
          const pdot = (pdx / plen) * normDir.x + (pdy / plen) * normDir.y;
          if (pdot > bestPocketDot) {
            bestPocketDot = pdot;
            targetPocket = pocket;
          }
        }
      }
    }
  }

  const impactPoint: Vector2D | null = ghostBallCenter
    ? {
        x: ghostBallCenter.x + ((targetBall ? targetBall.x - ghostBallCenter.x : 0) * 0.5),
        y: ghostBallCenter.y + ((targetBall ? targetBall.y - ghostBallCenter.y : 0) * 0.5),
      }
    : null;

  return {
    cueStart,
    aimAngle,
    impactPoint,
    targetBallId: targetBall ? targetBall.id : null,
    ghostBallCenter,
    targetDirection,
    cueDeflection,
    targetPocket,
    cutAngleDeg,
  };
}
