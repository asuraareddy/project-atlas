import { CarromGameState } from './types';
import { CarromEngine } from './engine';
import { LedgerService } from '@/domain/wallet/ledger';
import { CarromAnalyticsService } from './analytics';

declare global {
  var __projectAtlasCarromSessions: Map<string, CarromGameState> | undefined;
  var __projectAtlasCarromSessionUsers: Map<string, string> | undefined;
}

export class CarromSessionStore {
  private static get sessions(): Map<string, CarromGameState> {
    if (!globalThis.__projectAtlasCarromSessions) {
      globalThis.__projectAtlasCarromSessions = new Map();
    }
    return globalThis.__projectAtlasCarromSessions;
  }

  private static get sessionUsers(): Map<string, string> {
    if (!globalThis.__projectAtlasCarromSessionUsers) {
      globalThis.__projectAtlasCarromSessionUsers = new Map();
    }
    return globalThis.__projectAtlasCarromSessionUsers;
  }

  static async createSession(
    mode: 'vs_ai' | 'pass_play' | 'multiplayer_room' = 'vs_ai',
    bettingOptions?: { stakeMinor?: number; rakePercentage?: number; isRealMoney?: boolean },
    userId: string = 'usr_player_01'
  ): Promise<CarromGameState> {
    const sessionId = `carrom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const stake = bettingOptions?.stakeMinor ?? 200;

    // Secure double-entry stake reservation
    if (stake > 0) {
      await LedgerService.reserveCash(userId, stake, sessionId);
    }

    const game = CarromEngine.createGame(sessionId, mode, bettingOptions);
    this.sessions.set(sessionId, game);
    this.sessionUsers.set(sessionId, userId);
    CarromAnalyticsService.recordMatchStart(sessionId);

    return game;
  }

  static getSession(sessionId: string): CarromGameState | null {
    return this.sessions.get(sessionId) || null;
  }

  static saveSession(state: CarromGameState): void {
    this.sessions.set(state.sessionId, state);
  }

  static positionStriker(sessionId: string, x: number): CarromGameState {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Carrom session ${sessionId} does not exist.`);
    }

    const updated = CarromEngine.positionStriker(session, x);
    this.saveSession(updated);
    return updated;
  }

  static async executeShot(
    sessionId: string,
    angle: number,
    power: number
  ): Promise<CarromGameState> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Carrom session ${sessionId} does not exist.`);
    }

    if (session.status !== 'active') {
      throw new Error(`GAME_INACTIVE: Game is ${session.status}.`);
    }

    const updated = CarromEngine.processShot(session, angle, power);

    // Atomically settle match on Ledger if completed
    if (updated.status === 'completed' && updated.betting && !updated.betting.isSettled) {
      await this.settleGameMatch(updated);
    }

    this.saveSession(updated);
    return updated;
  }

  /**
   * Executes autonomous AI Bot Shot if active player is Bot
   */
  static async processBotShotIfActive(
    sessionId: string
  ): Promise<{ state: CarromGameState; acted: boolean; shotDetails?: { angle: number; power: number; strikerX: number } }> {
    let session = this.getSession(sessionId);
    if (!session || session.status !== 'active') return { state: session!, acted: false };

    const activePlayer = session.players.find((p) => p.id === session!.currentTurnPlayerId);
    if (!activePlayer || !activePlayer.isBot) {
      return { state: session, acted: false };
    }

    // 1. Calculate intelligent aim angle, power, and striker baseline position
    const botPlan = CarromEngine.selectBestBotShot(session);

    // 2. Position striker
    session = CarromEngine.positionStriker(session, botPlan.strikerX);

    // 3. Fire shot
    session = CarromEngine.processShot(session, botPlan.angle, botPlan.power);

    if (session.status === 'completed' && session.betting && !session.betting.isSettled) {
      await this.settleGameMatch(session);
    }

    this.saveSession(session);
    return { state: session, acted: true, shotDetails: botPlan };
  }

  private static async settleGameMatch(session: CarromGameState): Promise<void> {
    if (!session.betting) return;

    const userId = this.sessionUsers.get(session.sessionId) || 'usr_player_01';
    const stakeMinor = session.betting.stakeMinor;
    const prizePoolMinor = session.betting.prizePoolMinor;
    const humanPlayer = session.players.find((p) => !p.isBot);

    const isHumanWinner = humanPlayer && session.winnerId === humanPlayer.id;
    const payoutMinor = isHumanWinner ? prizePoolMinor : 0;
    const idempotencyKey = `idemp_carrom_settle_${session.sessionId}`;

    if (stakeMinor > 0) {
      await LedgerService.settleWager(userId, stakeMinor, payoutMinor, session.sessionId, idempotencyKey);
    }

    session.betting.isSettled = true;
    session.betting.settlementStatus = 'settled';

    CarromAnalyticsService.recordMatchCompletion(session);
  }

  static async cancelSession(sessionId: string, reason: string = 'Match abandoned'): Promise<CarromGameState | null> {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const userId = this.sessionUsers.get(sessionId) || 'usr_player_01';
    const stakeMinor = session.betting?.stakeMinor ?? 0;

    if (stakeMinor > 0 && session.betting?.settlementStatus === 'reserved') {
      await LedgerService.releaseReservedCash(userId, stakeMinor);
    }

    session.status = 'cancelled';
    if (session.betting) {
      session.betting.settlementStatus = 'refunded';
    }

    CarromAnalyticsService.recordMatchCancellation(session);
    this.saveSession(session);
    return session;
  }
}
