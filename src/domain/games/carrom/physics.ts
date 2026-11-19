import { CarromCoin, CarromPocket, CoinType } from './types';

export const BOARD_SIZE = 800;
export const BOARD_PADDING = 48; // Cushion edge
export const MIN_BOUND = BOARD_PADDING;
export const MAX_BOUND = BOARD_SIZE - BOARD_PADDING;

export const COIN_RADIUS = 15;
export const STRIKER_RADIUS = 22;
export const POCKET_RADIUS = 36;

export const COIN_MASS = 1.0;
export const STRIKER_MASS = 3.0;

export const FRICTION_COEFFICIENT = 0.984; // Per sub-step friction decay
export const RESTITUTION = 0.92;           // Coin-to-coin elasticity
export const CUSHION_RESTITUTION = 0.80;   // Cushion bounce elasticity
export const STOP_VELOCITY_EPSILON = 0.12; // Complete rest threshold

export interface SimulationResult {
  finalCoins: CarromCoin[];
  pocketedInShot: CoinType[];
  strikerPocketed: boolean;
  stepCount: number;
}

export class CarromPhysicsEngine {
  /**
   * Advances physics by one sub-step
   */
  static step(
    coins: CarromCoin[],
    pockets: CarromPocket[]
  ): { pocketed: CoinType[]; strikerPocketed: boolean } {
    const pocketed: CoinType[] = [];
    let strikerPocketed = false;

    // 1. Position update & friction deceleration
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (c.isPocketed) continue;

      c.x += c.vx;
      c.y += c.vy;

      // Friction
      c.vx *= FRICTION_COEFFICIENT;
      c.vy *= FRICTION_COEFFICIENT;

      if (Math.hypot(c.vx, c.vy) < STOP_VELOCITY_EPSILON) {
        c.vx = 0;
        c.vy = 0;
      }
    }

    // 2. Cushion / Boundary collisions
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (c.isPocketed) continue;

      // Left cushion
      if (c.x - c.radius < MIN_BOUND) {
        c.x = MIN_BOUND + c.radius;
        c.vx = -c.vx * CUSHION_RESTITUTION;
      }
      // Right cushion
      if (c.x + c.radius > MAX_BOUND) {
        c.x = MAX_BOUND - c.radius;
        c.vx = -c.vx * CUSHION_RESTITUTION;
      }
      // Top cushion
      if (c.y - c.radius < MIN_BOUND) {
        c.y = MIN_BOUND + c.radius;
        c.vy = -c.vy * CUSHION_RESTITUTION;
      }
      // Bottom cushion
      if (c.y + c.radius > MAX_BOUND) {
        c.y = MAX_BOUND - c.radius;
        c.vy = -c.vy * CUSHION_RESTITUTION;
      }
    }

    // 3. Disc-to-disc elastic collisions (Impulse-momentum with positional separation)
    for (let i = 0; i < coins.length; i++) {
      const c1 = coins[i];
      if (c1.isPocketed) continue;

      for (let j = i + 1; j < coins.length; j++) {
        const c2 = coins[j];
        if (c2.isPocketed) continue;

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = c1.radius + c2.radius;

        if (dist > 0 && dist < minDist) {
          // Normal unit vector
          const nx = dx / dist;
          const ny = dy / dist;

          // Positional overlap resolution (push apart equally based on mass)
          const overlap = minDist - dist;
          const totalMass = c1.mass + c2.mass;
          const m1Ratio = c2.mass / totalMass;
          const m2Ratio = c1.mass / totalMass;

          c1.x -= nx * overlap * m1Ratio;
          c1.y -= ny * overlap * m1Ratio;
          c2.x += nx * overlap * m2Ratio;
          c2.y += ny * overlap * m2Ratio;

          // Relative velocity along normal
          const kx = c1.vx - c2.vx;
          const ky = c1.vy - c2.vy;
          const normalVel = kx * nx + ky * ny;

          // Only collide if moving towards each other
          if (normalVel > 0) {
            const impulse = (-(1 + RESTITUTION) * normalVel) / (1 / c1.mass + 1 / c2.mass);

            c1.vx += (impulse / c1.mass) * nx;
            c1.vy += (impulse / c1.mass) * ny;
            c2.vx -= (impulse / c2.mass) * nx;
            c2.vy -= (impulse / c2.mass) * ny;
          }
        }
      }
    }

    // 4. Pocket detection
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (c.isPocketed) continue;

      for (const p of pockets) {
        const distToPocket = Math.hypot(c.x - p.x, c.y - p.y);
        // Fall into pocket if center of piece is within pocket aperture
        if (distToPocket < p.radius) {
          c.isPocketed = true;
          c.vx = 0;
          c.vy = 0;
          c.x = p.x;
          c.y = p.y;

          if (c.type === 'striker') {
            strikerPocketed = true;
          } else {
            pocketed.push(c.type);
          }
          break;
        }
      }
    }

    return { pocketed, strikerPocketed };
  }

  /**
   * Checks if any active coin or striker is currently moving
   */
  static areCoinsInMotion(coins: CarromCoin[]): boolean {
    return coins.some((c) => !c.isPocketed && (Math.abs(c.vx) > 0.05 || Math.abs(c.vy) > 0.05));
  }

  /**
   * Simulates full shot trajectory until complete board settlement
   */
  static simulateShot(
    initialCoins: CarromCoin[],
    pockets: CarromPocket[],
    maxSteps: number = 700
  ): SimulationResult {
    // Deep clone coins for simulation
    const coins: CarromCoin[] = initialCoins.map((c) => ({ ...c }));
    const pocketedInShot: CoinType[] = [];
    let strikerPocketed = false;
    let stepCount = 0;

    while (this.areCoinsInMotion(coins) && stepCount < maxSteps) {
      const res = this.step(coins, pockets);
      for (const p of res.pocketed) {
        pocketedInShot.push(p);
      }
      if (res.strikerPocketed) {
        strikerPocketed = true;
      }
      stepCount++;
    }

    // Ensure all remaining velocities are zeroed
    coins.forEach((c) => {
      c.vx = 0;
      c.vy = 0;
    });

    return {
      finalCoins: coins,
      pocketedInShot,
      strikerPocketed,
      stepCount
    };
  }
}
