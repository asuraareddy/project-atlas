import {
  LudoColor,
  TokenState,
  LudoToken,
  LudoPlayer,
  LudoGameState,
  ValidMove
} from './types';

/**
 * Standard Ludo Track Map Constants
 * Common track: 52 squares (0..51)
 * Colors move clockwise around 52 tiles, then enter a 5-tile home column to Home (tile 57).
 */
export const START_SQUARES: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

/**
 * Safe squares on common track where tokens cannot be captured.
 * - 4 color starting squares: 0, 13, 26, 39
 * - 4 star squares: 8, 21, 34, 47
 */
export const SAFE_SQUARES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

export const TOTAL_PATH_STEPS = 57; // Step 1 is start square, Step 57 is home.

export class LudoEngine {
  /**
   * Initializes a new deterministic Ludo game
   */
  static createGame(
    sessionId: string,
    mode: 'vs_ai' | 'pass_play' | 'multiplayer_room' = 'vs_ai',
    playerCount: 2 | 4 = 4
  ): LudoGameState {
    let colors: LudoColor[] = [];
    if (playerCount === 2) {
      // 2-Player: Red vs Yellow (opposite sides)
      colors = ['red', 'yellow'];
    } else {
      // 4-Player: Red, Green, Yellow, Blue
      colors = ['red', 'green', 'yellow', 'blue'];
    }

    const players: LudoPlayer[] = colors.map((color, idx) => {
      // In vs_ai mode, Player 1 (Red) is human, others are bots
      const isBot = mode === 'vs_ai' ? idx > 0 : false;
      const tokens: LudoToken[] = [0, 1, 2, 3].map((id) => ({
        id,
        color,
        state: 'base',
        position: id,
        stepCount: 0
      }));

      return {
        id: `player_${color}`,
        name: isBot ? `Bot (${color.toUpperCase()})` : `Player (${color.toUpperCase()})`,
        color,
        isBot,
        tokens,
        score: 0,
        hasWon: false
      };
    });

    return {
      sessionId,
      mode,
      playerCount,
      players,
      currentTurnColor: colors[0],
      turnPhase: 'need_roll',
      currentDiceRoll: null,
      consecutiveSixes: 0,
      extraTurnPending: false,
      lastMoveNotice: `Game started! ${colors[0].toUpperCase()}'s turn to roll the dice.`,
      winnerColor: null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculate valid moves for the active player given a dice roll
   */
  static getValidMoves(state: LudoGameState, diceRoll: number): ValidMove[] {
    if (state.turnPhase !== 'need_move' && state.turnPhase !== 'need_roll') {
      return [];
    }

    const player = state.players.find((p) => p.color === state.currentTurnColor);
    if (!player || player.hasWon) return [];

    const validMoves: ValidMove[] = [];

    for (const token of player.tokens) {
      // 1. Token in BASE: Can ONLY exit on a 6
      if (token.state === 'base') {
        if (diceRoll === 6) {
          const startSquare = START_SQUARES[player.color];
          // Check if destination on track has opponent token
          const captureInfo = this.checkCapture(state, player.color, startSquare);
          validMoves.push({
            tokenId: token.id,
            color: player.color,
            fromState: 'base',
            fromPosition: token.position,
            toState: 'track',
            toPosition: startSquare,
            isCapture: captureInfo.isCapture,
            capturedToken: captureInfo.capturedToken,
            isHome: false
          });
        }
        continue;
      }

      // 2. Token already HOME: Cannot move
      if (token.state === 'home') {
        continue;
      }

      // 3. Token on TRACK or HOME_PATH
      const newStepCount = token.stepCount + diceRoll;

      // Overshot Home: not allowed
      if (newStepCount > TOTAL_PATH_STEPS) {
        continue;
      }

      // Reaching exact Home
      if (newStepCount === TOTAL_PATH_STEPS) {
        validMoves.push({
          tokenId: token.id,
          color: player.color,
          fromState: token.state,
          fromPosition: token.position,
          toState: 'home',
          toPosition: 5,
          isCapture: false,
          isHome: true
        });
        continue;
      }

      // Moving along home column (steps 52..56)
      if (newStepCount > 51) {
        const homePathIndex = newStepCount - 52; // 0..4
        validMoves.push({
          tokenId: token.id,
          color: player.color,
          fromState: token.state,
          fromPosition: token.position,
          toState: 'home_path',
          toPosition: homePathIndex,
          isCapture: false,
          isHome: false
        });
        continue;
      }

      // Moving on common 52-tile track
      const startSquare = START_SQUARES[player.color];
      const targetTrackPos = (startSquare + newStepCount - 1) % 52;
      const captureInfo = this.checkCapture(state, player.color, targetTrackPos);

      validMoves.push({
        tokenId: token.id,
        color: player.color,
        fromState: token.state,
        fromPosition: token.position,
        toState: 'track',
        toPosition: targetTrackPos,
        isCapture: captureInfo.isCapture,
        capturedToken: captureInfo.capturedToken,
        isHome: false
      });
    }

    return validMoves;
  }

  /**
   * Checks if moving to trackPos captures an opponent token
   */
  private static checkCapture(
    state: LudoGameState,
    currentColor: LudoColor,
    trackPos: number
  ): { isCapture: boolean; capturedToken?: { color: LudoColor; tokenId: number } } {
    if (SAFE_SQUARES.has(trackPos)) {
      return { isCapture: false };
    }

    for (const player of state.players) {
      if (player.color === currentColor) continue;

      for (const token of player.tokens) {
        if (token.state === 'track' && token.position === trackPos) {
          return {
            isCapture: true,
            capturedToken: { color: player.color, tokenId: token.id }
          };
        }
      }
    }

    return { isCapture: false };
  }

  /**
   * Authoritative Dice Roll Action
   */
  static processRoll(state: LudoGameState, forcedRoll?: number): LudoGameState {
    if (state.turnPhase !== 'need_roll') {
      throw new Error(`INVALID_PHASE: Cannot roll dice during '${state.turnPhase}' phase.`);
    }

    // Cryptographic pseudo-random roll 1..6
    const roll = forcedRoll ?? Math.floor(Math.random() * 6) + 1;

    let consecutiveSixes = state.consecutiveSixes;
    if (roll === 6) {
      consecutiveSixes += 1;
    } else {
      consecutiveSixes = 0;
    }

    // Rule: Three consecutive 6s voids the turn!
    if (consecutiveSixes === 3) {
      const nextColor = this.getNextPlayerColor(state);
      return {
        ...state,
        currentDiceRoll: roll,
        consecutiveSixes: 0,
        extraTurnPending: false,
        turnPhase: 'need_roll',
        currentTurnColor: nextColor,
        lastMoveNotice: `${state.currentTurnColor.toUpperCase()} rolled three 6s in a row! Turn forfeited.`,
        updatedAt: new Date().toISOString()
      };
    }

    const stateWithRoll: LudoGameState = {
      ...state,
      currentDiceRoll: roll,
      consecutiveSixes,
      turnPhase: 'need_move',
      updatedAt: new Date().toISOString()
    };

    const validMoves = this.getValidMoves(stateWithRoll, roll);

    // If no valid moves exist: turn passes automatically
    if (validMoves.length === 0) {
      const nextColor = this.getNextPlayerColor(state);
      return {
        ...stateWithRoll,
        turnPhase: 'need_roll',
        currentTurnColor: nextColor,
        lastMoveNotice: `${state.currentTurnColor.toUpperCase()} rolled a ${roll} with no legal moves. Passing turn to ${nextColor.toUpperCase()}.`,
        extraTurnPending: false
      };
    }

    return {
      ...stateWithRoll,
      lastMoveNotice: `${state.currentTurnColor.toUpperCase()} rolled a ${roll}! ${validMoves.length} valid move(s) available.`
    };
  }

  /**
   * Authoritative Token Move Execution
   */
  static processMove(state: LudoGameState, tokenId: number): LudoGameState {
    if (state.turnPhase !== 'need_move' || state.currentDiceRoll === null) {
      throw new Error(`INVALID_ACTION: No active dice roll to execute move.`);
    }

    const validMoves = this.getValidMoves(state, state.currentDiceRoll);
    const selectedMove = validMoves.find((m) => m.tokenId === tokenId);

    if (!selectedMove) {
      throw new Error(`ILLEGAL_MOVE: Token ${tokenId} cannot move with roll ${state.currentDiceRoll}.`);
    }

    const updatedPlayers = state.players.map((player) => {
      // 1. Update moving player's token
      if (player.color === state.currentTurnColor) {
        const updatedTokens = player.tokens.map((token) => {
          if (token.id === tokenId) {
            let nextStepCount = token.stepCount;
            if (selectedMove.toState === 'track' && token.state === 'base') {
              nextStepCount = 1;
            } else if (selectedMove.toState === 'home') {
              nextStepCount = TOTAL_PATH_STEPS;
            } else {
              nextStepCount = token.stepCount + (state.currentDiceRoll || 0);
            }

            return {
              ...token,
              state: selectedMove.toState,
              position: selectedMove.toPosition,
              stepCount: nextStepCount
            };
          }
          return token;
        });

        const hasWon = updatedTokens.every((t) => t.state === 'home');

        return {
          ...player,
          tokens: updatedTokens,
          hasWon,
          score: player.score + (selectedMove.isHome ? 50 : selectedMove.isCapture ? 20 : (state.currentDiceRoll || 0))
        };
      }

      // 2. Handle captured token (return to base)
      if (selectedMove.isCapture && selectedMove.capturedToken?.color === player.color) {
        const updatedTokens = player.tokens.map((token) => {
          if (token.id === selectedMove.capturedToken?.tokenId) {
            return {
              ...token,
              state: 'base' as TokenState,
              position: token.id,
              stepCount: 0
            };
          }
          return token;
        });
        return {
          ...player,
          tokens: updatedTokens
        };
      }

      return player;
    });

    const activePlayer = updatedPlayers.find((p) => p.color === state.currentTurnColor);

    // Check Win Condition
    if (activePlayer && activePlayer.hasWon) {
      return {
        ...state,
        players: updatedPlayers,
        turnPhase: 'game_over',
        status: 'completed',
        winnerColor: activePlayer.color,
        lastMoveNotice: `VICTORY! ${activePlayer.color.toUpperCase()} has moved all 4 tokens home and won the game!`,
        updatedAt: new Date().toISOString()
      };
    }

    // Determine Extra Turn:
    // 1. Rolled a 6
    // 2. Captured an opponent token
    // 3. Reached home
    const getsExtraTurn =
      state.currentDiceRoll === 6 || selectedMove.isCapture || selectedMove.isHome;

    const nextColor = getsExtraTurn
      ? state.currentTurnColor
      : this.getNextPlayerColor(state);

    let notice = `${state.currentTurnColor.toUpperCase()} moved token ${tokenId + 1}.`;
    if (selectedMove.isCapture) {
      notice = `CAPTURE! ${state.currentTurnColor.toUpperCase()} captured ${selectedMove.capturedToken?.color.toUpperCase()}'s token! Extra turn granted.`;
    } else if (selectedMove.isHome) {
      notice = `HOME! ${state.currentTurnColor.toUpperCase()} reached home! Extra turn granted.`;
    } else if (state.currentDiceRoll === 6) {
      notice = `${state.currentTurnColor.toUpperCase()} rolled a 6! Extra turn granted.`;
    }

    return {
      ...state,
      players: updatedPlayers,
      currentTurnColor: nextColor,
      turnPhase: 'need_roll',
      currentDiceRoll: null,
      extraTurnPending: getsExtraTurn,
      lastMoveNotice: notice,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Helper to rotate to next active player
   */
  static getNextPlayerColor(state: LudoGameState): LudoColor {
    const activeColors: LudoColor[] = state.playerCount === 2
      ? ['red', 'yellow']
      : ['red', 'green', 'yellow', 'blue'];

    const currentIndex = activeColors.indexOf(state.currentTurnColor);
    const nextIndex = (currentIndex + 1) % activeColors.length;
    return activeColors[nextIndex];
  }

  /**
   * Intelligent Heuristic Bot Move Selector
   * Priority:
   * 1. Capture opponent token
   * 2. Reach home
   * 3. Exit base on 6
   * 4. Move token safely or advance furthest token
   */
  static selectBestBotMove(state: LudoGameState, validMoves: ValidMove[]): ValidMove | null {
    if (validMoves.length === 0) return null;
    if (validMoves.length === 1) return validMoves[0];

    // Priority 1: Capture opponent
    const captureMove = validMoves.find((m) => m.isCapture);
    if (captureMove) return captureMove;

    // Priority 2: Enter Home
    const homeMove = validMoves.find((m) => m.isHome);
    if (homeMove) return homeMove;

    // Priority 3: Exit Base on 6
    const exitBaseMove = validMoves.find((m) => m.fromState === 'base');
    if (exitBaseMove) return exitBaseMove;

    // Priority 4: Advance furthest token
    return validMoves.reduce((best, cur) => {
      return cur.toPosition > best.toPosition ? cur : best;
    }, validMoves[0]);
  }
}
