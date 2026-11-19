import {
  CarromCoin,
  CarromPocket,
  CarromPlayer,
  CarromGameState,
  CoinType,
  QueenState,
  CarromBettingConfig
} from './types';
import {
  CarromPhysicsEngine,
  BOARD_SIZE,
  COIN_RADIUS,
  STRIKER_RADIUS,
  POCKET_RADIUS,
  COIN_MASS,
  STRIKER_MASS
} from './physics';

export const BASELINE_BOTTOM_Y = 640;
export const BASELINE_TOP_Y = 160;
export const BASELINE_MIN_X = 180;
export const BASELINE_MAX_X = 620;

export class CarromEngine {
  /**
   * Initializes standard 19-coin tournament Carrom board + Striker
   */
  static createGame(
    sessionId: string,
    mode: 'vs_ai' | 'pass_play' | 'multiplayer_room' = 'vs_ai',
    bettingOptions?: { stakeMinor?: number; rakePercentage?: number; isRealMoney?: boolean }
  ): CarromGameState {
    const p1: CarromPlayer = {
      id: 'usr_player_01',
      name: 'Player 1 (You)',
      side: 'bottom',
      assignedColor: 'white',
      score: 0,
      pocketedCoins: [],
      isBot: false,
      avatar: '👑'
    };

    const p2: CarromPlayer = {
      id: mode === 'pass_play' ? 'usr_player_02' : 'bot_ace_striker',
      name: mode === 'pass_play' ? 'Player 2' : 'AceStriker (AI)',
      side: 'top',
      assignedColor: 'black',
      score: 0,
      pocketedCoins: [],
      isBot: mode === 'vs_ai',
      avatar: mode === 'pass_play' ? '🎯' : '🤖'
    };

    // 4 Corner Pockets
    const pockets: CarromPocket[] = [
      { id: 1, x: 54, y: 54, radius: POCKET_RADIUS },
      { id: 2, x: BOARD_SIZE - 54, y: 54, radius: POCKET_RADIUS },
      { id: 3, x: 54, y: BOARD_SIZE - 54, radius: POCKET_RADIUS },
      { id: 4, x: BOARD_SIZE - 54, y: BOARD_SIZE - 54, radius: POCKET_RADIUS }
    ];

    // Standard Tournament Rack at center (400, 400)
    const coins: CarromCoin[] = [];
    const centerX = 400;
    const centerY = 400;

    // 1. Queen at exact center (Red)
    coins.push({
      id: 0,
      type: 'queen',
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
      radius: COIN_RADIUS,
      mass: COIN_MASS,
      color: '#E52424',
      isPocketed: false
    });

    // 2. Inner Ring of 6 coins (alternating White & Black)
    const innerRadius = COIN_RADIUS * 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const type: CoinType = i % 2 === 0 ? 'white' : 'black';
      coins.push({
        id: coins.length,
        type,
        x: centerX + Math.cos(angle) * innerRadius,
        y: centerY + Math.sin(angle) * innerRadius,
        vx: 0,
        vy: 0,
        radius: COIN_RADIUS,
        mass: COIN_MASS,
        color: type === 'white' ? '#FFFFFF' : '#1A1A1A',
        isPocketed: false
      });
    }

    // 3. Outer Ring of 12 coins (alternating)
    const outerRadius = COIN_RADIUS * 4;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      const type: CoinType = i % 2 === 0 ? 'black' : 'white';
      coins.push({
        id: coins.length,
        type,
        x: centerX + Math.cos(angle) * outerRadius,
        y: centerY + Math.sin(angle) * outerRadius,
        vx: 0,
        vy: 0,
        radius: COIN_RADIUS,
        mass: COIN_MASS,
        color: type === 'white' ? '#FFFFFF' : '#1A1A1A',
        isPocketed: false
      });
    }

    // 4. Initial Striker on Player 1's Baseline
    coins.push({
      id: 19,
      type: 'striker',
      x: centerX,
      y: BASELINE_BOTTOM_Y,
      vx: 0,
      vy: 0,
      radius: STRIKER_RADIUS,
      mass: STRIKER_MASS,
      color: '#FBD706',
      isPocketed: false
    });

    const stakeMinor = bettingOptions?.stakeMinor ?? 200; // £2.00 default
    const rakePercentage = bettingOptions?.rakePercentage ?? 10;
    const grossStakes = stakeMinor * 2;
    const platformFeeMinor = Math.round((grossStakes * rakePercentage) / 100);
    const prizePoolMinor = grossStakes - platformFeeMinor;
    const isRealMoney = bettingOptions?.isRealMoney ?? false;

    const betting: CarromBettingConfig = {
      stakeMinor,
      entryFeeMinor: stakeMinor,
      prizePoolMinor,
      platformFeeMinor,
      rakePercentage,
      isRealMoney,
      settlementStatus: stakeMinor > 0 ? 'reserved' : 'settled'
    };

    return {
      sessionId,
      mode,
      players: [p1, p2],
      currentTurnPlayerId: p1.id,
      turnPhase: 'aiming',
      turnNumber: 1,
      coins,
      pockets,
      queenState: {
        isPocketed: false,
        pocketedBy: null,
        isCovered: false,
        pocketedOnTurnNumber: null
      },
      strikerPlacement: {
        x: centerX,
        y: BASELINE_BOTTOM_Y,
        minX: BASELINE_MIN_X,
        maxX: BASELINE_MAX_X
      },
      lastNotice: 'Match started! Player 1 (White) has the opening strike.',
      winnerId: null,
      status: 'active',
      betting,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Updates striker position along active player's baseline
   */
  static positionStriker(state: CarromGameState, x: number): CarromGameState {
    if (state.turnPhase !== 'aiming' && state.turnPhase !== 'positioning') {
      return state;
    }

    const clampedX = Math.max(state.strikerPlacement.minX, Math.min(state.strikerPlacement.maxX, x));
    const activePlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
    const baselineY = activePlayer?.side === 'top' ? BASELINE_TOP_Y : BASELINE_BOTTOM_Y;

    const updatedCoins = state.coins.map((c) => {
      if (c.type === 'striker') {
        return {
          ...c,
          x: clampedX,
          y: baselineY,
          vx: 0,
          vy: 0,
          isPocketed: false
        };
      }
      return c;
    });

    return {
      ...state,
      coins: updatedCoins,
      strikerPlacement: {
        ...state.strikerPlacement,
        x: clampedX,
        y: baselineY
      },
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Executes a shot with aim angle and power, simulates physics, and applies Carrom tournament rules
   */
  static processShot(
    state: CarromGameState,
    angle: number,
    power: number
  ): CarromGameState {
    if (state.status !== 'active') return state;

    const activePlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
    if (!activePlayer) return state;

    const clampedPower = Math.max(5, Math.min(100, power));
    // Velocity scalar factor: 100% power ~ 26 units/frame initial velocity
    const speed = clampedPower * 0.26;

    // Apply impulse to striker
    const coinsBeforeShot: CarromCoin[] = state.coins.map((c) => {
      if (c.type === 'striker') {
        return {
          ...c,
          x: state.strikerPlacement.x,
          y: state.strikerPlacement.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          isPocketed: false
        };
      }
      return { ...c, vx: 0, vy: 0 };
    });

    // Run deterministic physics simulation until all pieces settle
    const simResult = CarromPhysicsEngine.simulateShot(coinsBeforeShot, state.pockets);

    let updatedCoins = simResult.finalCoins;
    let queenState: QueenState = { ...state.queenState };
    let foulCommitted = false;
    let notice = '';
    let shouldRetainTurn = false;

    // Track coins pocketed this shot
    const pocketed = simResult.pocketedInShot;
    const playerAssigned = activePlayer.assignedColor;
    const opponent = state.players.find((p) => p.id !== activePlayer.id)!;

    // 1. FOUL CHECK: Did striker fall into pocket?
    if (simResult.strikerPocketed) {
      foulCommitted = true;
      notice = `FOUL! ${activePlayer.name} pocketed the Striker. `;

      // Penalty: Return 1 pocketed coin to center if available
      const penaltyCoinType = activePlayer.pocketedCoins.find((t) => t === playerAssigned);
      if (penaltyCoinType) {
        // Remove from player's pocketed tray
        const idx = activePlayer.pocketedCoins.indexOf(penaltyCoinType);
        activePlayer.pocketedCoins.splice(idx, 1);
        activePlayer.score = Math.max(0, activePlayer.score - 1);

        // Respawn coin at center (or offset if center is occupied)
        const unpocketedPenalty = updatedCoins.find(
          (c) => c.isPocketed && c.type === penaltyCoinType
        );
        if (unpocketedPenalty) {
          unpocketedPenalty.isPocketed = false;
          unpocketedPenalty.x = 400;
          unpocketedPenalty.y = 400;
          notice += 'Penalty: 1 coin returned to center board.';
        }
      }
    }

    // 2. QUEEN POCKETING & COVER RULES
    const queenPocketedThisShot = pocketed.includes('queen');
    const myCoinsPocketed = pocketed.filter((t) => t === playerAssigned).length;
    const opponentCoinsPocketed = pocketed.filter((t) => t === opponent.assignedColor).length;

    // If Queen was already pending cover from previous turn:
    if (queenState.isPocketed && !queenState.isCovered && queenState.pocketedBy === activePlayer.id) {
      if (myCoinsPocketed > 0 && !foulCommitted) {
        // Covered successfully!
        queenState.isCovered = true;
        activePlayer.score += 3;
        activePlayer.pocketedCoins.push('queen');
        notice += `Queen COVERED by ${activePlayer.name}! (+3 pts). `;
        shouldRetainTurn = true;
      } else {
        // Cover failed! Queen returns to center
        queenState.isPocketed = false;
        queenState.pocketedBy = null;
        queenState.pocketedOnTurnNumber = null;

        const queenCoin = updatedCoins.find((c) => c.type === 'queen');
        if (queenCoin) {
          queenCoin.isPocketed = false;
          queenCoin.x = 400;
          queenCoin.y = 400;
        }
        notice += `Queen cover failed — Queen returns to center circle. `;
      }
    }

    // If Queen was pocketed on this current shot:
    if (queenPocketedThisShot && !foulCommitted) {
      queenState.isPocketed = true;
      queenState.pocketedBy = activePlayer.id;
      queenState.pocketedOnTurnNumber = state.turnNumber;

      if (myCoinsPocketed > 0) {
        // Same-shot cover!
        queenState.isCovered = true;
        activePlayer.score += 3;
        activePlayer.pocketedCoins.push('queen');
        notice += `QUEEN POCKETED & COVERED on same shot! (+3 pts). `;
        shouldRetainTurn = true;
      } else {
        notice += `Queen pocketed by ${activePlayer.name}! Must cover with a ${playerAssigned} coin on next shot. `;
        shouldRetainTurn = true;
      }
    }

    // 3. REGULAR COIN SCORING
    if (myCoinsPocketed > 0 && !foulCommitted) {
      activePlayer.score += myCoinsPocketed;
      for (let i = 0; i < myCoinsPocketed; i++) {
        activePlayer.pocketedCoins.push(playerAssigned);
      }
      notice += `Pocketed ${myCoinsPocketed} ${playerAssigned} coin(s)! `;
      shouldRetainTurn = true;
    }

    if (opponentCoinsPocketed > 0) {
      opponent.score += opponentCoinsPocketed;
      for (let i = 0; i < opponentCoinsPocketed; i++) {
        opponent.pocketedCoins.push(opponent.assignedColor);
      }
      notice += `Accidentally pocketed ${opponentCoinsPocketed} ${opponent.assignedColor} coin(s) for opponent. `;
    }

    // If foul was committed, turn is always forfeit
    if (foulCommitted) {
      shouldRetainTurn = false;
    }

    // 4. WIN CONDITION CHECK
    const whiteCoinsRemaining = updatedCoins.filter((c) => !c.isPocketed && c.type === 'white').length;
    const blackCoinsRemaining = updatedCoins.filter((c) => !c.isPocketed && c.type === 'black').length;

    let winnerId: string | null = null;
    let gameStatus: 'active' | 'completed' = 'active';

    if (whiteCoinsRemaining === 0) {
      const whitePlayer = state.players.find((p) => p.assignedColor === 'white')!;
      winnerId = whitePlayer.id;
      gameStatus = 'completed';
      notice = `MATCH COMPLETED! ${whitePlayer.name} has pocketed all White coins and won the Carrom Tournament!`;
    } else if (blackCoinsRemaining === 0) {
      const blackPlayer = state.players.find((p) => p.assignedColor === 'black')!;
      winnerId = blackPlayer.id;
      gameStatus = 'completed';
      notice = `MATCH COMPLETED! ${blackPlayer.name} has pocketed all Black coins and won the Carrom Tournament!`;
    }

    // 5. TURN TRANSITION & STRIKER RESET
    const nextPlayer = shouldRetainTurn && gameStatus === 'active' ? activePlayer : opponent;
    const nextBaselineY = nextPlayer.side === 'top' ? BASELINE_TOP_Y : BASELINE_BOTTOM_Y;

    // Reposition striker at center of next player's baseline
    updatedCoins = updatedCoins.map((c) => {
      if (c.type === 'striker') {
        return {
          ...c,
          x: 400,
          y: nextBaselineY,
          vx: 0,
          vy: 0,
          isPocketed: false
        };
      }
      return c;
    });

    if (!notice) {
      notice = `${activePlayer.name}'s shot settled. Turn passes to ${nextPlayer.name}.`;
    }

    return {
      ...state,
      coins: updatedCoins,
      players: state.players.map((p) => {
        if (p.id === activePlayer.id) return { ...activePlayer };
        if (p.id === opponent.id) return { ...opponent };
        return p;
      }),
      currentTurnPlayerId: nextPlayer.id,
      turnPhase: gameStatus === 'completed' ? 'game_over' : 'aiming',
      turnNumber: state.turnNumber + 1,
      queenState,
      strikerPlacement: {
        x: 400,
        y: nextBaselineY,
        minX: BASELINE_MIN_X,
        maxX: BASELINE_MAX_X
      },
      lastShot: {
        playerId: activePlayer.id,
        angle,
        power: clampedPower,
        strikerStartX: state.strikerPlacement.x,
        strikerStartY: state.strikerPlacement.y,
        pocketedInShot: pocketed,
        foulCommitted,
        turnNumber: state.turnNumber,
        timestamp: new Date().toISOString()
      },
      lastNotice: notice.trim(),
      winnerId,
      status: gameStatus,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Calculates intelligent AI Bot Shot (aim angle & power)
   */
  static selectBestBotShot(state: CarromGameState): { angle: number; power: number; strikerX: number } {
    const activePlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
    const targetColor = activePlayer?.assignedColor || 'black';

    // Prioritize Queen if unpocketed, else bot's assigned coins
    let targetCoins = state.coins.filter((c) => !c.isPocketed && c.type === targetColor);
    if (!state.queenState.isPocketed) {
      const queen = state.coins.find((c) => !c.isPocketed && c.type === 'queen');
      if (queen) targetCoins.unshift(queen);
    }

    if (targetCoins.length === 0) {
      // Fallback: hit any active coin
      targetCoins = state.coins.filter((c) => !c.isPocketed && c.type !== 'striker');
    }

    // Default shot values
    let bestStrikerX = 400;
    let bestAngle = Math.PI / 2; // Downwards for top player
    let bestPower = 65;
    let minScore = Infinity;

    // Evaluate possible target coin + pocket combinations
    for (const coin of targetCoins.slice(0, 5)) {
      for (const pocket of state.pockets) {
        // Vector from coin to pocket
        const c2pX = pocket.x - coin.x;
        const c2pY = pocket.y - coin.y;
        const c2pDist = Math.hypot(c2pX, c2pY);
        if (c2pDist === 0) continue;

        // Ghost ball position (where striker must hit coin)
        const ghostX = coin.x - (c2pX / c2pDist) * (COIN_RADIUS + STRIKER_RADIUS);
        const ghostY = coin.y - (c2pY / c2pDist) * (COIN_RADIUS + STRIKER_RADIUS);

        // Striker baseline position (clamp ghostX to baseline)
        const candidateStrikerX = Math.max(BASELINE_MIN_X, Math.min(BASELINE_MAX_X, ghostX));
        const strikerY = activePlayer?.side === 'top' ? BASELINE_TOP_Y : BASELINE_BOTTOM_Y;

        // Vector from striker to ghost position
        const s2gX = ghostX - candidateStrikerX;
        const s2gY = ghostY - strikerY;
        const s2gDist = Math.hypot(s2gX, s2gY);

        const score = c2pDist + s2gDist;
        if (score < minScore) {
          minScore = score;
          bestStrikerX = candidateStrikerX;
          bestAngle = Math.atan2(s2gY, s2gX);
          // Scale power: further shots need more punch
          bestPower = Math.min(88, Math.max(48, Math.round(s2gDist * 0.14 + c2pDist * 0.08)));
        }
      }
    }

    return {
      angle: bestAngle,
      power: bestPower,
      strikerX: bestStrikerX
    };
  }
}
