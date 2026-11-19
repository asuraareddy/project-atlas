import { LudoGameState, LudoColor, LudoGameMode } from './types';
import { LudoEngine } from './engine';
import { LedgerService } from '@/domain/wallet/ledger';
import { LudoAnalyticsService } from './analytics';

declare global {
  var __projectAtlasLudoSessions: Map<string, LudoGameState> | undefined;
  var __projectAtlasLudoSessionUsers: Map<string, string> | undefined;
}

export class LudoSessionStore {
  private static get sessions(): Map<string, LudoGameState> {
    if (!globalThis.__projectAtlasLudoSessions) {
      globalThis.__projectAtlasLudoSessions = new Map();
    }
    return globalThis.__projectAtlasLudoSessions;
  }

  private static get sessionUsers(): Map<string, string> {
    if (!globalThis.__projectAtlasLudoSessionUsers) {
      globalThis.__projectAtlasLudoSessionUsers = new Map();
    }
    return globalThis.__projectAtlasLudoSessionUsers;
  }

  static async createSession(
    mode: LudoGameMode = 'vs_ai',
    playerCount: 2 | 4 = 4,
    bettingOptions?: { stakeMinor?: number; rakePercentage?: number; isRealMoney?: boolean },
    userId: string = 'usr_player_01'
  ): Promise<LudoGameState> {
    const sessionId = `ludo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const stake = bettingOptions?.stakeMinor ?? 200;

    // Secure server-authoritative stake reservation through LedgerService
    if (stake > 0) {
      await LedgerService.reserveCash(userId, stake, sessionId);
    }

    const game = LudoEngine.createGame(sessionId, mode, playerCount, bettingOptions);
    if (game.betting) {
      game.betting.settlementStatus = stake > 0 ? 'reserved' : 'settled';
    }

    this.sessions.set(sessionId, game);
    this.sessionUsers.set(sessionId, userId);
    LudoAnalyticsService.recordMatchStart(sessionId);

    return game;
  }

  static getSession(sessionId: string): LudoGameState | null {
    return this.sessions.get(sessionId) || null;
  }

  static saveSession(state: LudoGameState): void {
    this.sessions.set(state.sessionId, state);
  }

  static async rollDice(sessionId: string, color: LudoColor): Promise<LudoGameState> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Game session ${sessionId} does not exist.`);
    }

    if (session.status !== 'active') {
      throw new Error(`GAME_INACTIVE: Game is ${session.status}.`);
    }

    if (session.currentTurnColor !== color) {
      throw new Error(`NOT_YOUR_TURN: It is currently ${session.currentTurnColor.toUpperCase()}'s turn.`);
    }

    const updated = LudoEngine.processRoll(session);
    if (updated.currentDiceRoll !== null) {
      LudoAnalyticsService.recordDiceRoll(updated.currentDiceRoll);
    }
    this.saveSession(updated);
    return updated;
  }

  static async moveToken(sessionId: string, color: LudoColor, tokenId: number): Promise<LudoGameState> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`SESSION_NOT_FOUND: Game session ${sessionId} does not exist.`);
    }

    if (session.status !== 'active') {
      throw new Error(`GAME_INACTIVE: Game is ${session.status}.`);
    }

    if (session.currentTurnColor !== color) {
      throw new Error(`NOT_YOUR_TURN: It is currently ${session.currentTurnColor.toUpperCase()}'s turn.`);
    }

    const updated = LudoEngine.processMove(session, tokenId);

    // If match finished, atomically settle winnings / loss on Ledger
    if (updated.status === 'completed' && updated.betting && !updated.betting.isSettled) {
      await this.settleGameMatch(updated);
    }

    this.saveSession(updated);
    return updated;
  }

  /**
   * Automatically executes turn for a Bot player if active
   */
  static async processBotTurnIfActive(sessionId: string): Promise<{ state: LudoGameState; acted: boolean }> {
    let session = this.getSession(sessionId);
    if (!session || session.status !== 'active') return { state: session!, acted: false };

    const activePlayer = session.players.find((p) => p.color === session!.currentTurnColor);
    if (!activePlayer || !activePlayer.isBot) {
      return { state: session, acted: false };
    }

    // 1. Bot Rolls
    if (session.turnPhase === 'need_roll') {
      session = LudoEngine.processRoll(session);
      if (session.currentDiceRoll !== null) {
        LudoAnalyticsService.recordDiceRoll(session.currentDiceRoll);
      }
      this.saveSession(session);
    }

    // 2. If valid move is needed, bot chooses best move
    if (session.turnPhase === 'need_move' && session.currentDiceRoll !== null) {
      const validMoves = LudoEngine.getValidMoves(session, session.currentDiceRoll);
      const bestMove = LudoEngine.selectBestBotMove(session, validMoves);
      if (bestMove) {
        session = LudoEngine.processMove(session, bestMove.tokenId);
        if (session.status === 'completed' && session.betting && !session.betting.isSettled) {
          await this.settleGameMatch(session);
        }
        this.saveSession(session);
      }
    }

    return { state: session, acted: true };
  }

  /**
   * Settles final wager payout or loss through double-entry ledger
   */
  private static async settleGameMatch(session: LudoGameState): Promise<void> {
    if (!session.betting) return;

    const userId = this.sessionUsers.get(session.sessionId) || 'usr_player_01';
    const stakeMinor = session.betting.stakeMinor;
    const prizePoolMinor = session.betting.prizePoolMinor;
    const humanPlayer = session.players.find((p) => !p.isBot);

    const isHumanWinner = humanPlayer && session.winnerColor === humanPlayer.color;
    const payoutMinor = isHumanWinner ? prizePoolMinor : 0;
    const idempotencyKey = `idemp_ludo_settle_${session.sessionId}`;

    if (stakeMinor > 0) {
      await LedgerService.settleWager(userId, stakeMinor, payoutMinor, session.sessionId, idempotencyKey);
    }

    session.betting.isSettled = true;
    session.betting.settlementStatus = 'settled';

    LudoAnalyticsService.recordMatchCompletion(session);
  }

  /**
   * Cancel and refund match in case of disconnection or abandonment
   */
  static async cancelSession(sessionId: string, reason: string = 'Player abandoned match'): Promise<LudoGameState | null> {
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

    LudoAnalyticsService.recordMatchCancellation(session, reason);
    this.saveSession(session);
    return session;
  }
}
