/**
 * 8-Ball Pool Pro - In-Memory Session Store
 * Project Atlas Non-Wagering Gameplay State Management
 */

import { PoolGameState, PoolGameMode, PoolShotCommand, PoolShotEvent } from './types';
import {
  createInitialPoolGameState,
  applyShotImpulse,
  evaluateShotRules,
  placeCueBall,
  computeBotShot,
} from './engine';
import { simulateUntilRest } from './physics';

declare global {
  var __projectAtlasPoolSessions: Map<string, PoolGameState> | undefined;
}

export class PoolSessionStore {
  private static get sessions(): Map<string, PoolGameState> {
    if (!globalThis.__projectAtlasPoolSessions) {
      globalThis.__projectAtlasPoolSessions = new Map();
    }
    return globalThis.__projectAtlasPoolSessions;
  }

  /**
   * Create or reset a pool session
   */
  static createSession(
    mode: PoolGameMode = 'vs_bot',
    player1Name = 'Player 1',
    player2Name = 'AceCue (Bot)'
  ): PoolGameState {
    const sessionId = `pool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session = createInitialPoolGameState(sessionId, mode, player1Name, player2Name);
    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Retrieve session by ID
   */
  static getSession(sessionId: string): PoolGameState | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Update and save session
   */
  static saveSession(state: PoolGameState): void {
    state.updatedAt = Date.now();
    this.sessions.set(state.sessionId, state);
  }

  /**
   * Execute shot on session
   */
  static executeShot(
    sessionId: string,
    command: PoolShotCommand
  ): { state: PoolGameState; shotEvent: PoolShotEvent; message: string } {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Pool session ${sessionId} not found`);
    }

    if (session.status === 'completed') {
      throw new Error('Game is already completed');
    }

    // Apply impulse to cue ball
    const shotEvent = applyShotImpulse(session, command);

    // Run physics simulation until all balls stop
    simulateUntilRest(session.balls, shotEvent);

    // Apply 8-ball rules
    const { state, message } = evaluateShotRules(session, shotEvent);
    this.saveSession(state);

    return { state, shotEvent, message };
  }

  /**
   * Place cue ball when Ball In Hand is active
   */
  static setBallInHand(
    sessionId: string,
    x: number,
    y: number
  ): { state: PoolGameState; success: boolean; error?: string } {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Pool session ${sessionId} not found`);
    }

    const res = placeCueBall(session, x, y);
    if (res.success) {
      this.saveSession(session);
    }

    return { state: session, success: res.success, error: res.error };
  }

  /**
   * Trigger bot shot
   */
  static executeBotShot(
    sessionId: string
  ): { state: PoolGameState; command: PoolShotCommand; shotEvent: PoolShotEvent; message: string } {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Pool session ${sessionId} not found`);
    }

    const command = computeBotShot(session);
    const { state, shotEvent, message } = this.executeShot(sessionId, command);

    return { state, command, shotEvent, message };
  }
}
