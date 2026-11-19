/**
 * Carrom Striker Aiming & Shooting Helpers
 *
 * Pure, framework-free geometry used by the Carrom board UI for:
 *  - converting pointer/touch coordinates into board coordinates
 *  - striker placement along the active baseline
 *  - slingshot-style "pull back & release" aiming (direction + power)
 *  - an aim-guide ray cast (first coin contact or cushion bounce)
 *
 * Written independently for Project Atlas. It does NOT perform physics —
 * shots are still executed by the existing CarromPhysicsEngine / CarromEngine.
 * Kept dependency-free (erasable TypeScript only) so it can be unit tested
 * directly by Node's type stripping from tests/run-all-tests.mjs.
 */

export interface Point {
  x: number;
  y: number;
}

export interface AimObstacle {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface BoardRectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PullShotConfig {
  /** Board-px pull distance ignored before a shot is "armed" (tap tolerance). */
  deadZone: number;
  /** Board-px pull distance that maps to maximum power. */
  maxPull: number;
  minPower: number;
  maxPower: number;
}

export const DEFAULT_PULL_CONFIG: PullShotConfig = {
  deadZone: 14,
  maxPull: 230,
  minPower: 10,
  maxPower: 100
};

export interface PullShot {
  /** Shot direction in radians (opposite to the pull vector). */
  angle: number;
  /** Shot power on the engine's 0..100 scale (minPower..maxPower when armed). */
  power: number;
  /** Raw pull distance in board px. */
  pullDistance: number;
  /** True once the pull exceeds the dead zone; releasing then fires the shot. */
  isArmed: boolean;
}

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

/** Maps a client (CSS px) pointer position into square board coordinates. */
export function clientToBoard(
  clientX: number,
  clientY: number,
  rect: BoardRectLike,
  boardSize: number
): Point {
  const w = rect.width || 1;
  const h = rect.height || 1;
  return {
    x: ((clientX - rect.left) / w) * boardSize,
    y: ((clientY - rect.top) / h) * boardSize
  };
}

/** Clamps a requested striker X to the legal baseline span. */
export function clampStrikerX(x: number, minX: number, maxX: number): number {
  if (!Number.isFinite(x)) return (minX + maxX) / 2;
  return clamp(x, minX, maxX);
}

/** Default aim for a side: straight up the board for bottom, straight down for top. */
export function defaultAimAngle(side: 'bottom' | 'top' | undefined): number {
  return side === 'top' ? Math.PI / 2 : -Math.PI / 2;
}

/** True when the pointer is on (or close enough to grab) the striker. */
export function isPointerOnStriker(
  pointer: Point,
  striker: Point,
  strikerRadius: number,
  touchSlop = 2.2
): boolean {
  return Math.hypot(pointer.x - striker.x, pointer.y - striker.y) <= strikerRadius * touchSlop;
}

/** True when the pointer is inside the draggable baseline strip of the active player. */
export function isPointerOnBaseline(
  pointer: Point,
  baselineY: number,
  minX: number,
  maxX: number,
  tolerance = 34
): boolean {
  return (
    Math.abs(pointer.y - baselineY) <= tolerance &&
    pointer.x >= minX - tolerance &&
    pointer.x <= maxX + tolerance
  );
}

/**
 * Slingshot aiming: dragging away from the striker pulls it back; the shot fires
 * in the opposite direction with power proportional to the pull distance.
 */
export function computePullShot(
  striker: Point,
  pointer: Point,
  config: PullShotConfig = DEFAULT_PULL_CONFIG
): PullShot {
  const dx = pointer.x - striker.x;
  const dy = pointer.y - striker.y;
  const pullDistance = Math.hypot(dx, dy);
  const isArmed = pullDistance > config.deadZone;

  const span = Math.max(1, config.maxPull - config.deadZone);
  const t = clamp((pullDistance - config.deadZone) / span, 0, 1);
  const power = Math.round(config.minPower + t * (config.maxPower - config.minPower));

  return {
    angle: isArmed ? Math.atan2(-dy, -dx) : 0,
    power: isArmed ? power : config.minPower,
    pullDistance,
    isArmed
  };
}

/** Rotates an angle by a number of degrees (used by fine-aim nudge buttons). */
export function nudgeAngle(angle: number, degrees: number): number {
  const next = angle + (degrees * Math.PI) / 180;
  // Normalise into (-PI, PI]
  return Math.atan2(Math.sin(next), Math.cos(next));
}

/** Green → amber → red colour ramp for power feedback. */
export function powerColor(power: number): string {
  const t = clamp(power / 100, 0, 1);
  const hue = Math.round(140 - 140 * t);
  return `hsl(${hue}, 85%, 52%)`;
}

export interface AimGuide {
  /** Where the striker centre ends up at first contact (coin ghost or cushion). */
  end: Point;
  /** Id of the first coin the striker would touch, if any. */
  hitCoinId: number | null;
  /** Unit direction the hit coin would initially travel (contact normal). */
  targetDirection: Point | null;
  /** Cushion that is reached first when no coin is hit. */
  wall: 'x' | 'y' | null;
  /** End point of a short reflected segment after a cushion bounce. */
  reflectedEnd: Point | null;
}

/**
 * Casts the aim ray from the striker and reports the first contact.
 * Visual guidance only — the real outcome is decided by the physics engine.
 */
export function projectAimGuide(
  origin: Point,
  angle: number,
  movingRadius: number,
  obstacles: AimObstacle[],
  bounds: { min: number; max: number },
  reflectLength = 110
): AimGuide {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  // Nearest coin contact (ray vs. circle expanded by striker radius)
  let bestT = Infinity;
  let hit: AimObstacle | null = null;
  for (const o of obstacles) {
    const fx = origin.x - o.x;
    const fy = origin.y - o.y;
    const R = movingRadius + o.radius;
    const c = fx * fx + fy * fy - R * R;
    if (c <= 0) continue; // already overlapping — ignore for guidance
    const b = fx * dx + fy * dy;
    const disc = b * b - c;
    if (disc < 0) continue;
    const t = -b - Math.sqrt(disc);
    if (t > 0 && t < bestT) {
      bestT = t;
      hit = o;
    }
  }

  // Cushion contact (striker edge meets inner frame)
  const lo = bounds.min + movingRadius;
  const hi = bounds.max - movingRadius;
  const tx = dx > 1e-9 ? (hi - origin.x) / dx : dx < -1e-9 ? (lo - origin.x) / dx : Infinity;
  const ty = dy > 1e-9 ? (hi - origin.y) / dy : dy < -1e-9 ? (lo - origin.y) / dy : Infinity;
  const tWall = Math.max(0, Math.min(tx, ty));

  if (hit && bestT <= tWall) {
    const end = { x: origin.x + dx * bestT, y: origin.y + dy * bestT };
    const nx = hit.x - end.x;
    const ny = hit.y - end.y;
    const n = Math.hypot(nx, ny) || 1;
    return {
      end,
      hitCoinId: hit.id,
      targetDirection: { x: nx / n, y: ny / n },
      wall: null,
      reflectedEnd: null
    };
  }

  const end = { x: origin.x + dx * tWall, y: origin.y + dy * tWall };
  const wall: 'x' | 'y' = tx <= ty ? 'x' : 'y';
  const rdx = wall === 'x' ? -dx : dx;
  const rdy = wall === 'y' ? -dy : dy;
  return {
    end,
    hitCoinId: null,
    targetDirection: null,
    wall,
    reflectedEnd: {
      x: clamp(end.x + rdx * reflectLength, lo, hi),
      y: clamp(end.y + rdy * reflectLength, lo, hi)
    }
  };
}
