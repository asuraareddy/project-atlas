import {
  PlayingCard,
  Suit,
  Rank,
  Ace2ThreeGameState,
  PlayerState,
  CutForSeatResult,
  CardGroup,
} from './types';
import { autoGroupHand, evaluateCardGroup, validateHandDeclaration } from './validator';

export const SUITS: Suit[] = ['C', 'D', 'H', 'S'];
export const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function getRankLabel(rank: Rank): string {
  switch (rank) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return rank.toString();
  }
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'C':
      return '♣';
    case 'D':
      return '♦';
    case 'H':
      return '♥';
    case 'S':
      return '♠';
  }
}

export function createFreshDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  let idx = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      idx++;
      deck.push({
        id: `${suit}-${rank}-${idx}`,
        suit,
        rank,
        isWildJoker: false,
        assetUrl: `/games/ace2three/cards/${suit}-${rank}.png`,
      });
    }
  }
  return deck;
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function startNewGameSession(
  player1Name: string = 'You (Player 1)',
  player2Name: string = 'RummyBot (AI)',
  stake: number = 250 // minor units e.g. £2.50
): Ace2ThreeGameState {
  const deck = shuffle(createFreshDeck());

  // Cut for seat
  const p1Cut = deck.pop()!;
  const p2Cut = deck.pop()!;
  const p1Val = p1Cut.rank === 1 ? 14 : p1Cut.rank;
  const p2Val = p2Cut.rank === 1 ? 14 : p2Cut.rank;
  const starterId = p1Val >= p2Val ? 'player_1' : 'player_2';
  const starterName = starterId === 'player_1' ? player1Name : player2Name;

  const cutForSeat: CutForSeatResult = {
    playerCard: p1Cut,
    opponentCard: p2Cut,
    winnerId: starterId,
    message: `${starterName} won Cut for Seat with ${getSuitSymbol(
      starterId === 'player_1' ? p1Cut.suit : p2Cut.suit
    )}${getRankLabel(starterId === 'player_1' ? p1Cut.rank : p2Cut.rank)} and starts the hand!`,
  };

  // Re-shuffle for game round
  const roundDeck = shuffle(createFreshDeck());

  // Deal 13 cards to each player
  const p1Cards: PlayingCard[] = [];
  const p2Cards: PlayingCard[] = [];
  for (let i = 0; i < 13; i++) {
    p1Cards.push(roundDeck.pop()!);
    p2Cards.push(roundDeck.pop()!);
  }

  // Draw Wild Joker Card
  const wildJoker = roundDeck.pop()!;
  const wildJokerRank = wildJoker.rank;

  // Mark all matching ranks as Wild Jokers in hands & remaining deck
  const markJokers = (card: PlayingCard): PlayingCard => ({
    ...card,
    isWildJoker: card.rank === wildJokerRank,
  });

  const p1Hand = p1Cards.map(markJokers);
  const p2Hand = p2Cards.map(markJokers);
  const closedDeck = roundDeck.map(markJokers);

  // Draw top card to start Open Deck
  const openDeck: PlayingCard[] = [closedDeck.pop()!];

  const p1Groups = autoGroupHand(p1Hand, wildJokerRank);
  const p2Groups = autoGroupHand(p2Hand, wildJokerRank);

  const players: [PlayerState, PlayerState] = [
    {
      id: 'player_1',
      name: player1Name,
      avatar: '/games/ace2three/ui/001-man.png',
      hand: p1Hand,
      groups: p1Groups,
      score: 0,
      chips: 5000,
      isAi: false,
      hasDrawnThisTurn: false,
    },
    {
      id: 'player_2',
      name: player2Name,
      avatar: '/games/ace2three/ui/012-woman.png',
      hand: p2Hand,
      groups: p2Groups,
      score: 0,
      chips: 5000,
      isAi: true,
      hasDrawnThisTurn: false,
    },
  ];

  return {
    sessionId: `a23_${Date.now()}`,
    phase: 'cut_for_seat',
    turnPlayerId: starterId,
    turnState: 'draw',
    stake,
    wildJoker,
    closedDeck,
    openDeck,
    players,
    cutForSeat,
    lastActionMessage: cutForSeat.message,
    winnerId: null,
    history: [cutForSeat.message, `Wild Joker is ${getSuitSymbol(wildJoker.suit)}${getRankLabel(wildJoker.rank)}`],
  };
}

export function drawCardAction(
  state: Ace2ThreeGameState,
  playerId: string,
  source: 'closed' | 'open'
): Ace2ThreeGameState {
  if (state.phase !== 'playing') return state;
  if (state.turnPlayerId !== playerId) return state;
  if (state.turnState !== 'draw') return state;

  const playerIdx = state.players.findIndex((p) => p.id === playerId);
  if (playerIdx === -1) return state;

  const player = state.players[playerIdx];
  const newClosed = [...state.closedDeck];
  const newOpen = [...state.openDeck];
  let drawnCard: PlayingCard | undefined;

  if (source === 'open') {
    if (newOpen.length === 0) return state;
    drawnCard = newOpen.pop();
  } else {
    if (newClosed.length === 0) {
      // Reshuffle open deck (excluding top card)
      if (newOpen.length <= 1) return state;
      const topOpen = newOpen.pop()!;
      const reshuffled = shuffle(newOpen);
      newClosed.push(...reshuffled);
      newOpen.length = 0;
      newOpen.push(topOpen);
    }
    drawnCard = newClosed.pop();
  }

  if (!drawnCard) return state;

  const updatedHand = [...player.hand, drawnCard];
  const updatedGroups = autoGroupHand(updatedHand, state.wildJoker!.rank);

  const updatedPlayer: PlayerState = {
    ...player,
    hand: updatedHand,
    groups: updatedGroups,
    hasDrawnThisTurn: true,
  };

  const updatedPlayers: [PlayerState, PlayerState] = [...state.players] as any;
  updatedPlayers[playerIdx] = updatedPlayer;

  const actionMsg = `${player.name} picked a card from the ${source === 'open' ? 'Open Discard Pile' : 'Closed Deck'}.`;

  return {
    ...state,
    closedDeck: newClosed,
    openDeck: newOpen,
    players: updatedPlayers,
    turnState: 'discard',
    lastActionMessage: actionMsg,
    history: [actionMsg, ...state.history.slice(0, 19)],
  };
}

export function discardCardAction(
  state: Ace2ThreeGameState,
  playerId: string,
  cardId: string
): Ace2ThreeGameState {
  if (state.phase !== 'playing') return state;
  if (state.turnPlayerId !== playerId) return state;
  if (state.turnState !== 'discard') return state;

  const playerIdx = state.players.findIndex((p) => p.id === playerId);
  if (playerIdx === -1) return state;

  const player = state.players[playerIdx];
  const cardIdx = player.hand.findIndex((c) => c.id === cardId);
  if (cardIdx === -1) return state;

  const discardedCard = player.hand[cardIdx];
  const updatedHand = player.hand.filter((c) => c.id !== cardId);
  const updatedGroups = autoGroupHand(updatedHand, state.wildJoker!.rank);

  const updatedPlayer: PlayerState = {
    ...player,
    hand: updatedHand,
    groups: updatedGroups,
    hasDrawnThisTurn: false,
  };

  const updatedPlayers: [PlayerState, PlayerState] = [...state.players] as any;
  updatedPlayers[playerIdx] = updatedPlayer;

  const nextTurnId = playerId === 'player_1' ? 'player_2' : 'player_1';
  const nextPlayer = state.players.find((p) => p.id === nextTurnId)!;
  const actionMsg = `${player.name} discarded ${getSuitSymbol(discardedCard.suit)}${getRankLabel(
    discardedCard.rank
  )}. Now it's ${nextPlayer.name}'s turn.`;

  return {
    ...state,
    openDeck: [...state.openDeck, discardedCard],
    players: updatedPlayers,
    turnPlayerId: nextTurnId,
    turnState: 'draw',
    lastActionMessage: actionMsg,
    history: [actionMsg, ...state.history.slice(0, 19)],
  };
}

export function declareHandAction(
  state: Ace2ThreeGameState,
  playerId: string,
  finishCardId?: string
): { nextState: Ace2ThreeGameState; result: ReturnType<typeof validateHandDeclaration> } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || !state.wildJoker) {
    throw new Error('Invalid game state for declaration');
  }

  // A standard hand has 13 cards. If player currently holds 14 cards (after drawing),
  // 1 card is placed on the finish/declare slot and the remaining 13 are evaluated.
  let cardsToEvaluate = player.hand;
  if (player.hand.length === 14) {
    if (finishCardId) {
      cardsToEvaluate = player.hand.filter((c) => c.id !== finishCardId);
    } else {
      // Find candidate finish card that leaves a valid 13-card declare, or drop highest rank
      let bestRemaining = player.hand.slice(0, 13);
      for (let i = 0; i < player.hand.length; i++) {
        const test13 = player.hand.filter((_, idx) => idx !== i);
        const testGroups = autoGroupHand(test13, state.wildJoker.rank);
        const testVal = validateHandDeclaration(testGroups, state.wildJoker.rank);
        if (testVal.isValid) {
          bestRemaining = test13;
          break;
        }
      }
      cardsToEvaluate = bestRemaining;
    }
  }

  const groups = autoGroupHand(cardsToEvaluate, state.wildJoker.rank);
  const validation = validateHandDeclaration(groups, state.wildJoker.rank);

  let winnerId: string;
  let summaryMessage: string;

  if (validation.isValid) {
    winnerId = playerId;
    summaryMessage = `🎉 ${player.name} declared a valid Rummy show and won the round!`;
  } else {
    winnerId = playerId === 'player_1' ? 'player_2' : 'player_1';
    const opponent = state.players.find((p) => p.id === winnerId)!;
    summaryMessage = `❌ ${player.name} made an invalid declaration (${validation.reason}). ${opponent.name} wins by default!`;
  }

  const updatedPlayers: [PlayerState, PlayerState] = state.players.map((p) => {
    if (p.id === winnerId) {
      return { ...p, chips: p.chips + state.stake };
    } else {
      return { ...p, chips: Math.max(0, p.chips - state.stake), score: p.score + validation.deadwoodScore };
    }
  }) as any;

  const nextState: Ace2ThreeGameState = {
    ...state,
    phase: 'game_over',
    winnerId,
    players: updatedPlayers,
    lastActionMessage: summaryMessage,
    history: [summaryMessage, ...state.history.slice(0, 19)],
  };

  return { nextState, result: validation };
}

export function dropHandAction(state: Ace2ThreeGameState, playerId: string): Ace2ThreeGameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const winnerId = playerId === 'player_1' ? 'player_2' : 'player_1';
  const opponent = state.players.find((p) => p.id === winnerId)!;

  // First drop (if player has not drawn or early) is 20 points, middle drop 40 points
  const dropPenalty = player.hasDrawnThisTurn ? 40 : 20;
  const msg = `${player.name} dropped out of the hand (${dropPenalty} penalty points). ${opponent.name} wins ${state.stake} chips.`;

  const updatedPlayers: [PlayerState, PlayerState] = state.players.map((p) => {
    if (p.id === winnerId) {
      return { ...p, chips: p.chips + state.stake };
    } else {
      return { ...p, chips: Math.max(0, p.chips - state.stake), score: p.score + dropPenalty };
    }
  }) as any;

  return {
    ...state,
    phase: 'game_over',
    winnerId,
    players: updatedPlayers,
    lastActionMessage: msg,
    history: [msg, ...state.history.slice(0, 19)],
  };
}

// AI Bot decision step
export function executeBotTurn(state: Ace2ThreeGameState): Ace2ThreeGameState {
  if (state.phase !== 'playing') return state;
  if (state.turnPlayerId !== 'player_2') return state;

  try {
    let currentState = state;
    const bot = currentState.players.find((p) => p.id === 'player_2') || currentState.players[1];
    if (!bot) return state;

    // 1. Draw phase (if bot hasn't drawn yet)
    if (currentState.turnState === 'draw') {
      const topOpen = currentState.openDeck[currentState.openDeck.length - 1];
      let pickOpen = false;

      // Intelligent check: if topOpen matches any card of same suit or same rank in bot hand
      if (
        topOpen &&
        (topOpen.isWildJoker ||
          bot.hand.some(
            (c) =>
              (c.suit === topOpen.suit && Math.abs(c.rank - topOpen.rank) <= 2) ||
              c.rank === topOpen.rank
          ))
      ) {
        pickOpen = true;
      }

      currentState = drawCardAction(
        currentState,
        'player_2',
        pickOpen && currentState.openDeck.length > 0 ? 'open' : 'closed'
      );
    }

    // Bot now holds 14 cards
    const updatedBot = currentState.players.find((p) => p.id === 'player_2') || currentState.players[1];
    if (!updatedBot) return currentState;

    // 2. Check if bot can declare
    if (currentState.turnState === 'discard' && currentState.wildJoker) {
      for (let i = 0; i < updatedBot.hand.length; i++) {
        const candidateFinish = updatedBot.hand[i];
        const remaining13 = updatedBot.hand.filter((_, idx) => idx !== i);
        const testGroups = autoGroupHand(remaining13, currentState.wildJoker.rank);
        const val = validateHandDeclaration(testGroups, currentState.wildJoker.rank);
        if (val.isValid) {
          const { nextState } = declareHandAction(currentState, 'player_2', candidateFinish.id);
          return nextState;
        }
      }
    }

    // 3. Discard phase: discard the worst deadwood card
    if (currentState.turnState === 'discard') {
      const nonJokers = updatedBot.hand.filter(
        (c) => !c.isWildJoker && c.rank !== currentState.wildJoker?.rank
      );
      const candidates = nonJokers.length > 0 ? nonJokers : updatedBot.hand;
      let cardToDiscard = candidates[0];

      // Pick highest rank non-joker that doesn't fit any pair or sequence
      let highestScore = -1;
      for (const c of candidates) {
        const hasAdjacent = candidates.some(
          (other) => other.id !== c.id && other.suit === c.suit && Math.abs(other.rank - c.rank) <= 2
        );
        const hasRankPair = candidates.some((other) => other.id !== c.id && other.rank === c.rank);
        let penalty = c.rank >= 10 || c.rank === 1 ? 10 : c.rank;
        if (!hasAdjacent && !hasRankPair) {
          penalty += 20; // prioritize discarding isolated cards
        }
        if (penalty > highestScore) {
          highestScore = penalty;
          cardToDiscard = c;
        }
      }

      if (cardToDiscard) {
        currentState = discardCardAction(currentState, 'player_2', cardToDiscard.id);
      }
    }

    return currentState;
  } catch (err) {
    console.error('Error during executeBotTurn:', err);
    // Robust fallback: ensure turn passes back to player_1 cleanly
    const p2 = state.players.find((p) => p.id === 'player_2') || state.players[1];
    const discardCard = p2?.hand?.[0];
    if (discardCard) {
      return discardCardAction(state, 'player_2', discardCard.id);
    }
    return {
      ...state,
      turnPlayerId: 'player_1',
      turnState: 'draw',
      lastActionMessage: 'Your Turn: Draw a card from Closed Deck or Open Discard Pile.',
    };
  }
}
