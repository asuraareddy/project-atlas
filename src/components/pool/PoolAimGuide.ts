/**
 * 8-Ball Pool Pro - Aim Guideline & Trajectory Calculations
 *
 * Mathematical model adapted from Jonathan Silva's 8BallPool (MIT License).
 * Computes:
 * - Line of centers (ghost ball contact location)
 * - Object ball exit vector towards target pocket
 * - Tangent cue ball deflection angle
 * - Cut angle and potting probability
 */

import { PoolBall, PoolPocket, Vector2D } from '@/domain/games/pool/types';
import { POOL_TABLE_CONFIG, POOL_POCKETS } from '@/domain/games/pool/physics';

export interface AimGuideResult {
  cueStart: Vector2D;
  aimAngle: number;
  aimRayEnd: Vector2D;
  hasTarget: boolean;
  targetBall: PoolBall | null;
  ghostBall: Vector2D | null;
  targetLineEnd: Vector2D | null;
  cueDeflectEnd: Vector2D | null;
  targetPocket: PoolPocket | null;
  cutAngleDeg: number;
  isPotCandidate: boolean;
}

export function computeAimGuide(
  cueBall: PoolBall,
  aimAngle: number,
  allBalls: PoolBall[]
): AimGuideResult {
  const cueStart: Vector2D = { x: cueBall.x, y: cueBall.y };
  const r = cueBall.radius;
  const rayDir: Vector2D = {
    x: Math.cos(aimAngle),
    y: Math.sin(aimAngle),
  };

  const maxRayLen = 850;
  let aimRayEnd: Vector2D = {
    x: cueBall.x + rayDir.x * maxRayLen,
    y: cueBall.y + rayDir.y * maxRayLen,
  };

  let closestDist = Infinity;
  let targetBall: PoolBall | null = null;
  let ghostBall: Vector2D | null = null;
  let targetLineEnd: Vector2D | null = null;
  let cueDeflectEnd: Vector2D | null = null;
  let targetPocket: PoolPocket | null = null;
  let cutAngleDeg = 0;
  let isPotCandidate = false;

  // Intersect ray with every unpocketed ball
  for (const b of allBalls) {
    if (b.id === cueBall.id || b.isPocketed) continue;

    const ox = b.x - cueBall.x;
    const oy = b.y - cueBall.y;
    const proj = ox * rayDir.x + oy * rayDir.y;

    if (proj <= 0) continue; // Behind cue ball

    const perpSq = ox * ox + oy * oy - proj * proj;
    const twoR = 2 * r;

    if (perpSq <= twoR * twoR) {
      const dHit = Math.sqrt(Math.max(0, twoR * twoR - perpSq));
      const distToImpact = proj - dHit;

      if (distToImpact > 0 && distToImpact < closestDist) {
        closestDist = distToImpact;
        targetBall = b;

        // Position where cue ball contacts object ball
        const gbx = cueBall.x + rayDir.x * distToImpact;
        const gby = cueBall.y + rayDir.y * distToImpact;
        ghostBall = { x: gbx, y: gby };
        aimRayEnd = { x: gbx, y: gby };

        // Normal vector from ghost ball to target ball (line of centers)
        const nx = b.x - gbx;
        const ny = b.y - gby;
        const nlen = Math.hypot(nx, ny) || 1;
        const normDir: Vector2D = { x: nx / nlen, y: ny / nlen };

        // Target ball trajectory line
        targetLineEnd = {
          x: b.x + normDir.x * 200,
          y: b.y + normDir.y * 200,
        };

        // Tangent deflection vector for cue ball
        const dot = rayDir.x * normDir.x + rayDir.y * normDir.y;
        const tanX = rayDir.x - normDir.x * dot;
        const tanY = rayDir.y - normDir.y * dot;
        const tanLen = Math.hypot(tanX, tanY) || 1;

        cueDeflectEnd = {
          x: gbx + (tanX / tanLen) * 90,
          y: gby + (tanY / tanLen) * 90,
        };

        cutAngleDeg = Math.round(
          Math.acos(Math.min(1, Math.max(-1, dot))) * (180 / Math.PI)
        );

        // Find if target normal points toward any pocket
        for (const p of POOL_POCKETS) {
          const pdx = p.x - b.x;
          const pdy = p.y - b.y;
          const plen = Math.hypot(pdx, pdy) || 1;
          const pdirX = pdx / plen;
          const pdirY = pdy / plen;

          const align = normDir.x * pdirX + normDir.y * pdirY;
          if (align > 0.96) {
            targetPocket = p;
            isPotCandidate = true;
            // Extend target line all the way into pocket!
            targetLineEnd = { x: p.x, y: p.y };
            break;
          }
        }
      }
    }
  }

  return {
    cueStart,
    aimAngle,
    aimRayEnd,
    hasTarget: !!targetBall,
    targetBall,
    ghostBall,
    targetLineEnd,
    cueDeflectEnd,
    targetPocket,
    cutAngleDeg,
    isPotCandidate,
  };
}
