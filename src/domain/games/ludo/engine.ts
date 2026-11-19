import crypto from 'node:crypto';
import {
  LudoColor,
  TokenState,
  LudoToken,
  LudoPlayer,
  LudoGameState,
  ValidMove,
  StepCoord,
  GridCoord,
  LudoBettingConfig,
  LastMoveExecution
} from './types';
import {
  TRACK_COORDS,
  HOME_PATH_COORDS,
  CENTER_GOAL_COORDS,
  BASE_SLOT_COORDS
} from '@/components/ludo/board-coords';

export const START_SQUARES: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

export const SAFE_SQUARES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);
export const TOTAL_PATH_STEPS = 57; // Step 1 is start square, Step 57 is home.

export class LudoEngine {
  /**
   * Initializes a new deterministic Ludo game with betting & prize pool
   */
  static createGame(
    sessionId: string,
    mode: 'vs_ai' | 'pass_play' | 'multiplayer_room' = 'vs_ai',
    playerCount: 2 | 4 = 4,
    bettingOptions?: { stakeMinor?: number; rakePercentage?: number; isRealMoney?: boolean }
  ): LudoGameState {
    let colors: LudoColor[] = [];
    if (playerCount === 2) {
      colors = ['red', 'yellow'];
    } else {
      colors = ['red', 'green', 'yellow', 'blue'];
    }

    const stakeMinor = bettingOptions?.stakeMinor ?? 200; // Default £2.00
    const rakePercentage = bettingOptions?.rakePercentage ?? 10; // 10% platform fee
    const grossStakes = stakeMinor * colors.length;
    const platformFeeMinor = Math.round((grossStakes * rakePercentage) / 100);
    const prizePoolMinor = grossStakes - platformFeeMinor;
    const isRealMoney = bettingOptions?.isRealMoney ?? false;

    const betting: LudoBettingConfig = {
      stakeMinor,
      entryFeeMinor: stakeMinor,
      prizePoolMinor,
      platformFeeMinor,
      rakePercentage,
      isRealMoney,
      settlementStatus: stakeMinor > 0 ? 'reserved' : 'none'
    };

    const AVATARS = {
      red: '👑',
      green: '⚡',
      yellow: '🔥',
      blue: '💎'
    };

    const players: LudoPlayer[] = colors.map((color, idx) => {
      const isBot = mode === 'vs_ai' ? idx > 0 : false;
      const isHuman = !isBot;
      const tokens: LudoToken[] = [0, 1, 2, 3].map((id) => ({
        id,
        color,
        state: 'base',
        position: id,
        stepCount: 0
      }));

      const botNames = {
        green: 'AceBot',
        yellow: 'GrandMaster',
        blue: 'SwiftChallenger'
      };

      const name = isBot
        ? botNames[color as keyof typeof botNames] || `AI (${color.toUpperCase()})`
        : idx === 0
        ? 'You (Host)'
        : `Player (${color.toUpperCase()})`;

      return {
        id: `player_${color}`,
        name,
        color,
        avatar: AVATARS[color],
        isBot,
        isHuman,
        connectionStatus: isBot ? 'bot' : 'online',
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
      lastMoveNotice: `Match ready! ${colors[0].toUpperCase()}'s turn to roll the dice.`,
      winnerColor: null,
      status: 'active',
      betting,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Computes exact intermediate path coordinates for smooth step-by-step movement
   */
  static computeStepPath(
    color: LudoColor,
    fromState: TokenState,
    fromStepCount: number,
    roll: number
  ): StepCoord[] {
    const path: StepCoord[] = [];

    // 1. Exiting from Base yard on a 6
    if (fromState === 'base') {
      const startTrackIdx = START_SQUARES[color];
      const startCoord = TRACK_COORDS[startTrackIdx];
      path.push({
        r: startCoord.r,
        c: startCoord.c,
        stepCount: 1,
        isHome: false
      });
      return path;
    }

    // 2. Advancing along track or home column step by step
    for (let s = 1; s <= roll; s++) {
      const currStep = fromStepCount + s;

      if (currStep <= 51) {
        // Common 52-tile circuit
        const startTrackIdx = START_SQUARES[color];
        const trackIdx = (startTrackIdx + currStep - 1) % 52;
        const coord = TRACK_COORDS[trackIdx];
        path.push({
          r: coord.r,
          c: coord.c,
          stepCount: currStep,
          isHome: false
        });
      } else if (currStep >= 52 && currStep <= 56) {
        // Colored Home path column
        const homeIdx = currStep - 52; // 0..4
        const coord = HOME_PATH_COORDS[color][homeIdx];
        path.push({
          r: coord.r,
          c: coord.c,
          stepCount: currStep,
          isHome: false
        });
      } else if (currStep === TOTAL_PATH_STEPS) {
        // Center Goal (Home)
        const coord = CENTER_GOAL_COORDS[color];
        path.push({
          r: coord.r,
          c: coord.c,
          stepCount: currStep,
          isHome: true
        });
      }
    }

    return path;
  }

  /**
   * Calculate valid moves for the active player with complete step-by-step path coordinates
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
          const captureInfo = this.checkCapture(state, player.color, startSquare);
          const stepPath = this.computeStepPath(player.color, 'base', 0, 6);

          validMoves.push({
            tokenId: token.id,
            color: player.color,
            fromState: 'base',
            fromPosition: token.position,
            toState: 'track',
            toPosition: startSquare,
            stepPath,
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
        const stepPath = this.computeStepPath(player.color, token.state, token.stepCount, diceRoll);
        validMoves.push({
          tokenId: token.id,
          color: player.color,
          fromState: token.state,
          fromPosition: token.position,
          toState: 'home',
          toPosition: 5,
          stepPath,
          isCapture: false,
          isHome: true
        });
        continue;
      }

      // Moving along home column (steps 52..56)
      if (newStepCount > 51) {
        const homePathIndex = newStepCount - 52; // 0..4
        const stepPath = this.computeStepPath(player.color, token.state, token.stepCount, diceRoll);
        validMoves.push({
          tokenId: token.id,
          color: player.color,
          fromState: token.state,
          fromPosition: token.position,
          toState: 'home_path',
          toPosition: homePathIndex,
          stepPath,
          isCapture: false,
          isHome: false
        });
        continue;
      }

      // Moving on common 52-tile track
      const startSquare = START_SQUARES[player.color];
      const targetTrackPos = (startSquare + newStepCount - 1) % 52;
      const captureInfo = this.checkCapture(state, player.color, targetTrackPos);
      const stepPath = this.computeStepPath(player.color, token.state, token.stepCount, diceRoll);

      validMoves.push({
        tokenId: token.id,
        color: player.color,
        fromState: token.state,
        fromPosition: token.position,
        toState: 'track',
        toPosition: targetTrackPos,
        stepPath,
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
  ): { isCapture: boolean; capturedToken?: { color: LudoColor; tokenId: number; baseCoord: GridCoord } } {
    if (SAFE_SQUARES.has(trackPos)) {
      return { isCapture: false };
    }

    for (const player of state.players) {
      if (player.color === currentColor) continue;

      for (const token of player.tokens) {
        if (token.state === 'track' && token.position === trackPos) {
          const baseCoord = BASE_SLOT_COORDS[player.color][token.id];
          return {
            isCapture: true,
            capturedToken: {
              color: player.color,
              tokenId: token.id,
              baseCoord
            }
          };
        }
      }
    }

    return { isCapture: false };
  }

  /**
   * Cryptographically secure CSPRNG dice roll generator
   */
  static generateRandomRoll(): number {
    try {
      return crypto.randomInt(1, 7);
    } catch (e) {
      return Math.floor(Math.random() * 6) + 1;
    }
  }

  /**
   * Authoritative Dice Roll Action
   */
  static processRoll(state: LudoGameState, forcedRoll?: number): LudoGameState {
    if (state.turnPhase !== 'need_roll') {
      throw new Error(`INVALID_PHASE: Cannot roll dice during '${state.turnPhase}' phase.`);
    }

    const roll = forcedRoll ?? this.generateRandomRoll();

    let consecutiveSixes = state.consecutiveSixes;
    if (roll === 6) {
      consecutiveSixes += 1;
    } else {
      consecutiveSixes = 0;
    }

    // Rule: Three consecutive 6s voids the turn
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
   * Authoritative Token Move Execution with full step-by-step path recording
   */
  static processMove(state: LudoGameState, tokenId: number): LudoGameState {
    if (state.turnPhase !== 'need_move' || state.currentDiceRoll === null) {
      throw new Error(`INVALID_ACTION: No active dice roll to execute move.`);
    }

    const roll = state.currentDiceRoll;
    const validMoves = this.getValidMoves(state, roll);
    const selectedMove = validMoves.find((m) => m.tokenId === tokenId);

    if (!selectedMove) {
      throw new Error(`ILLEGAL_MOVE: Token ${tokenId} cannot move with roll ${roll}.`);
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
              nextStepCount = token.stepCount + roll;
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
          score: player.score + (selectedMove.isHome ? 50 : selectedMove.isCapture ? 25 : roll)
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

    const lastExecutedMove: LastMoveExecution = {
      tokenId,
      color: state.currentTurnColor,
      roll,
      stepPath: selectedMove.stepPath,
      isCapture: selectedMove.isCapture,
      capturedToken: selectedMove.capturedToken,
      isHome: selectedMove.isHome,
      timestamp: new Date().toISOString()
    };

    // Check Win Condition
    if (activePlayer && activePlayer.hasWon) {
      return {
        ...state,
        players: updatedPlayers,
        turnPhase: 'game_over',
        status: 'completed',
        winnerColor: activePlayer.color,
        lastExecutedMove,
        lastMoveNotice: `VICTORY! ${activePlayer.name} has moved all 4 tokens home and won the prize pool of ${(state.betting.prizePoolMinor / 100).toFixed(2)}!`,
        updatedAt: new Date().toISOString()
      };
    }

    // Determine Extra Turn
    const getsExtraTurn = roll === 6 || selectedMove.isCapture || selectedMove.isHome;
    const nextColor = getsExtraTurn ? state.currentTurnColor : this.getNextPlayerColor(state);

    let notice = `${state.currentTurnColor.toUpperCase()} moved token ${tokenId + 1}.`;
    if (selectedMove.isCapture) {
      notice = `CAPTURE! ${state.currentTurnColor.toUpperCase()} captured ${selectedMove.capturedToken?.color.toUpperCase()}'s token! Extra turn granted.`;
    } else if (selectedMove.isHome) {
      notice = `HOME! ${state.currentTurnColor.toUpperCase()} reached home! Extra turn granted.`;
    } else if (roll === 6) {
      notice = `${state.currentTurnColor.toUpperCase()} rolled a 6! Extra turn granted.`;
    }

    return {
      ...state,
      players: updatedPlayers,
      currentTurnColor: nextColor,
      turnPhase: 'need_roll',
      currentDiceRoll: null,
      extraTurnPending: getsExtraTurn,
      lastExecutedMove,
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
