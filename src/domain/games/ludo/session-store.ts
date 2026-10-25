import { LudoGameState, LudoColor, LudoGameMode } from './types';
import { LudoEngine } from './engine';

declare global {
  var __projectAtlasLudoSessions: Map<string, LudoGameState> | undefined;
}

export class LudoSessionStore {
  private static get sessions(): Map<string, LudoGameState> {
    if (!globalThis.__projectAtlasLudoSessions) {
      globalThis.__projectAtlasLudoSessions = new Map();
    }
    return globalThis.__projectAtlasLudoSessions;
  }

  static createSession(
    mode: LudoGameMode = 'vs_ai',
    playerCount: 2 | 4 = 4
  ): LudoGameState {
    const sessionId = `ludo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const game = LudoEngine.createGame(sessionId, mode, playerCount);
    this.sessions.set(sessionId, game);
    return game;
  }

  static getSession(sessionId: string): LudoGameState | null {
    return this.sessions.get(sessionId) || null;
  }

  static saveSession(state: LudoGameState): void {
    this.sessions.set(state.sessionId, state);
  }

  static rollDice(sessionId: string, color: LudoColor): LudoGameState {
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
    this.saveSession(updated);
    return updated;
  }

  static moveToken(sessionId: string, color: LudoColor, tokenId: number): LudoGameState {
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
    this.saveSession(updated);
    return updated;
  }

  /**
   * Automatically executes turn for a Bot player if active
   */
  static processBotTurnIfActive(sessionId: string): { state: LudoGameState; acted: boolean } {
    let session = this.getSession(sessionId);
    if (!session || session.status !== 'active') return { state: session!, acted: false };

    const activePlayer = session.players.find((p) => p.color === session!.currentTurnColor);
    if (!activePlayer || !activePlayer.isBot) {
      return { state: session, acted: false };
    }

    // 1. Bot Rolls
    if (session.turnPhase === 'need_roll') {
      session = LudoEngine.processRoll(session);
      this.saveSession(session);
    }

    // 2. If valid move is needed, bot chooses best move
    if (session.turnPhase === 'need_move' && session.currentDiceRoll !== null) {
      const validMoves = LudoEngine.getValidMoves(session, session.currentDiceRoll);
      const bestMove = LudoEngine.selectBestBotMove(session, validMoves);
      if (bestMove) {
        session = LudoEngine.processMove(session, bestMove.tokenId);
        this.saveSession(session);
      }
    }

    return { state: session, acted: true };
  }
}
