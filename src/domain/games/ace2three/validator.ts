import { PlayingCard, CardGroup, DeclareValidationResult, Rank, Suit } from './types';

export function getCardValue(rank: Rank): number {
  if (rank === 1) return 10; // Ace
  if (rank >= 10) return 10; // 10, J, Q, K
  return rank;
}

export function isPureSequence(cards: PlayingCard[], wildJokerRank?: Rank): boolean {
  if (cards.length < 3) return false;
  const suit = cards[0].suit;
  if (!cards.every((c) => c.suit === suit)) return false;

  // In pure sequence, no card can be used as a wild joker (unless it's naturally in place)
  // Extract ranks and sort ascending
  const ranks = cards.map((c) => c.rank).sort((a, b) => a - b);

  // Check no duplicates
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] === ranks[i + 1]) return false;
  }

  // Check standard consecutive sequence (e.g. 3, 4, 5 or 9, 10, 11, 12)
  let isNormalRun = true;
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i + 1] !== ranks[i] + 1) {
      isNormalRun = false;
      break;
    }
  }
  if (isNormalRun) return true;

  // Check Ace-high sequence (e.g., Q, K, A => 11, 12, 13, 1 => ranks: 1, 11, 12, 13)
  if (ranks[0] === 1) {
    const highRanks = [...ranks.slice(1), 14]; // treat Ace as 14
    let isHighRun = true;
    for (let i = 0; i < highRanks.length - 1; i++) {
      if (highRanks[i + 1] !== highRanks[i] + 1) {
        isHighRun = false;
        break;
      }
    }
    if (isHighRun) return true;
  }

  return false;
}

export function isImpureSequence(cards: PlayingCard[], wildJokerRank: Rank): boolean {
  if (cards.length < 3) return false;

  // Separate non-jokers and jokers
  const nonJokers = cards.filter((c) => c.rank !== wildJokerRank && !c.isWildJoker);
  const jokersCount = cards.length - nonJokers.length;

  if (jokersCount === 0) return isPureSequence(cards, wildJokerRank);
  if (nonJokers.length === 0) return false; // cannot be all jokers

  // All non-jokers must be same suit
  const suit = nonJokers[0].suit;
  if (!nonJokers.every((c) => c.suit === suit)) return false;

  const ranks = nonJokers.map((c) => c.rank).sort((a, b) => a - b);
  // Check no duplicate non-jokers
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] === ranks[i + 1]) return false;
  }

  // Helper to check gaps fillable by jokers
  const checkRun = (runRanks: number[]): boolean => {
    let neededJokers = 0;
    for (let i = 0; i < runRanks.length - 1; i++) {
      const gap = runRanks[i + 1] - runRanks[i] - 1;
      if (gap < 0) return false;
      neededJokers += gap;
    }
    const spareJokers = jokersCount - neededJokers;
    if (spareJokers < 0) return false;

    // Any remaining jokers can sit before or after the run (boundary within 1..13 or 2..14)
    const runSpan = runRanks[runRanks.length - 1] - runRanks[0] + 1 + spareJokers;
    return runSpan <= 14;
  };

  if (checkRun(ranks)) return true;

  // Try Ace as high rank (14) if Ace present
  if (ranks[0] === 1) {
    const highRanks = [...ranks.slice(1), 14];
    if (checkRun(highRanks)) return true;
  }

  return false;
}

export function isValidSet(cards: PlayingCard[], wildJokerRank: Rank): boolean {
  if (cards.length < 3 || cards.length > 4) return false;

  const nonJokers = cards.filter((c) => c.rank !== wildJokerRank && !c.isWildJoker);
  if (nonJokers.length === 0) return false;

  const targetRank = nonJokers[0].rank;
  if (!nonJokers.every((c) => c.rank === targetRank)) return false;

  // Suits of non-jokers must all be distinct
  const suits = new Set(nonJokers.map((c) => c.suit));
  if (suits.size !== nonJokers.length) return false;

  return true;
}

export function evaluateCardGroup(cards: PlayingCard[], wildJokerRank: Rank): CardGroup {
  const groupId = cards.length > 0 ? `grp_${cards.map((c) => c.id).join('_')}` : 'grp_empty';
  if (cards.length === 0) {
    return { id: groupId, cards: [], isValid: false, type: 'invalid', score: 0 };
  }

  const isPure = isPureSequence(cards, wildJokerRank);
  if (isPure) {
    return { id: groupId, cards, isValid: true, type: 'pure_sequence', score: 0 };
  }

  const isImpure = isImpureSequence(cards, wildJokerRank);
  if (isImpure) {
    return { id: groupId, cards, isValid: true, type: 'impure_sequence', score: 0 };
  }

  const isSet = isValidSet(cards, wildJokerRank);
  if (isSet) {
    return { id: groupId, cards, isValid: true, type: 'set', score: 0 };
  }

  // Calculate deadwood score for invalid group
  const score = cards.reduce((acc, c) => {
    if (c.rank === wildJokerRank || c.isWildJoker) return acc;
    return acc + getCardValue(c.rank);
  }, 0);

  return { id: groupId, cards, isValid: false, type: 'invalid', score };
}

export function validateHandDeclaration(
  groups: CardGroup[],
  wildJokerRank: Rank
): DeclareValidationResult {
  const evaluatedGroups = groups.map((g) => evaluateCardGroup(g.cards, wildJokerRank));
  const totalCards = evaluatedGroups.reduce((acc, g) => acc + g.cards.length, 0);

  let pureSequences = 0;
  let impureSequences = 0;
  let sets = 0;
  let invalidGroups = 0;
  let deadwood = 0;

  for (const g of evaluatedGroups) {
    if (g.type === 'pure_sequence') pureSequences++;
    else if (g.type === 'impure_sequence') impureSequences++;
    else if (g.type === 'set') sets++;
    else {
      invalidGroups++;
      deadwood += g.score;
    }
  }

  // Check 13 cards condition
  if (totalCards !== 13) {
    return {
      isValid: false,
      reason: `Hand must contain exactly 13 cards (currently has ${totalCards} cards).`,
      pureSequencesCount: pureSequences,
      totalSequencesCount: pureSequences + impureSequences,
      invalidCardsCount: 13 - totalCards,
      deadwoodScore: Math.min(80, deadwood || 80),
      groups: evaluatedGroups,
    };
  }

  // Must have at least 1 Pure Sequence
  if (pureSequences < 1) {
    return {
      isValid: false,
      reason: 'Mandatory Pure Sequence missing! You need at least 1 sequence without any Jokers.',
      pureSequencesCount: 0,
      totalSequencesCount: pureSequences + impureSequences,
      invalidCardsCount: 0,
      deadwoodScore: Math.min(80, 80), // Maximum penalty for invalid show
      groups: evaluatedGroups,
    };
  }

  // Must have at least 2 sequences in total
  if (pureSequences + impureSequences < 2) {
    return {
      isValid: false,
      reason: 'At least 2 sequences required (1 pure + 1 second sequence).',
      pureSequencesCount: pureSequences,
      totalSequencesCount: pureSequences + impureSequences,
      invalidCardsCount: 0,
      deadwoodScore: Math.min(80, 80),
      groups: evaluatedGroups,
    };
  }

  // All groups must be valid
  if (invalidGroups > 0) {
    return {
      isValid: false,
      reason: `One or more groups are invalid. Groups must only consist of pure sequences, impure sequences, or sets.`,
      pureSequencesCount: pureSequences,
      totalSequencesCount: pureSequences + impureSequences,
      invalidCardsCount: 0,
      deadwoodScore: Math.min(80, deadwood || 80),
      groups: evaluatedGroups,
    };
  }

  return {
    isValid: true,
    reason: 'Valid Rummy Show! Hand meets all Ace2Three pure sequence and set requirements.',
    pureSequencesCount: pureSequences,
    totalSequencesCount: pureSequences + impureSequences,
    invalidCardsCount: 0,
    deadwoodScore: 0,
    groups: evaluatedGroups,
  };
}

// Group cards by suit and sorted rank into standard Rummy suit columns
export function sortCardsBySuits(cards: PlayingCard[], wildJokerRank: Rank): CardGroup[] {
  const suits: Suit[] = ['S', 'H', 'C', 'D'];
  const groups: CardGroup[] = [];

  for (const suit of suits) {
    const suitCards = cards
      .filter((c) => c.suit === suit)
      .sort((a, b) => a.rank - b.rank);
    if (suitCards.length > 0) {
      groups.push(evaluateCardGroup(suitCards, wildJokerRank));
    }
  }

  return groups;
}

// Intelligent auto-grouping: identifies Pure Sequences, Sets, and Impure Sequences first,
// leaving deadwood in its own group.
export function autoGroupHand(cards: PlayingCard[], wildJokerRank: Rank): CardGroup[] {
  if (!cards || cards.length === 0) return [];

  const remaining = [...cards];
  const groups: CardGroup[] = [];

  // Helper to remove cards from remaining pool
  const extractCards = (toRemove: PlayingCard[]) => {
    const ids = new Set(toRemove.map((c) => c.id));
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (ids.has(remaining[i].id)) {
        remaining.splice(i, 1);
      }
    }
  };

  // 1. Extract Pure Sequences (3 to 5 consecutive cards of same suit without Jokers)
  const suits: Suit[] = ['S', 'H', 'C', 'D'];
  for (const suit of suits) {
    const suitCards = remaining
      .filter((c) => c.suit === suit && c.rank !== wildJokerRank && !c.isWildJoker)
      .sort((a, b) => a.rank - b.rank);

    // Remove duplicates of same rank for sequence searching
    const uniqueCards: PlayingCard[] = [];
    for (const c of suitCards) {
      if (!uniqueCards.some((u) => u.rank === c.rank)) {
        uniqueCards.push(c);
      }
    }

    // Check for runs of lengths 5 down to 3
    for (let len = 5; len >= 3; len--) {
      for (let start = 0; start <= uniqueCards.length - len; start++) {
        const sub = uniqueCards.slice(start, start + len);
        if (isPureSequence(sub, wildJokerRank)) {
          groups.push(evaluateCardGroup(sub, wildJokerRank));
          extractCards(sub);
          break;
        }
      }
    }

    // Check Ace-high sequence (e.g., Q-K-A => 12, 13, 1)
    const ace = uniqueCards.find((c) => c.rank === 1);
    const king = uniqueCards.find((c) => c.rank === 13);
    const queen = uniqueCards.find((c) => c.rank === 12);
    const jack = uniqueCards.find((c) => c.rank === 11);
    const ten = uniqueCards.find((c) => c.rank === 10);

    if (ace && king && queen && jack && ten && remaining.some((c) => c.id === ace.id)) {
      const run = [ten, jack, queen, king, ace];
      groups.push(evaluateCardGroup(run, wildJokerRank));
      extractCards(run);
    } else if (ace && king && queen && jack && remaining.some((c) => c.id === ace.id)) {
      const run = [jack, queen, king, ace];
      groups.push(evaluateCardGroup(run, wildJokerRank));
      extractCards(run);
    } else if (ace && king && queen && remaining.some((c) => c.id === ace.id)) {
      const run = [queen, king, ace];
      groups.push(evaluateCardGroup(run, wildJokerRank));
      extractCards(run);
    }
  }

  // 2. Extract Sets (3 or 4 cards of same rank across distinct suits)
  const nonJokers = remaining.filter((c) => c.rank !== wildJokerRank && !c.isWildJoker);
  const byRank = new Map<Rank, PlayingCard[]>();
  for (const c of nonJokers) {
    const list = byRank.get(c.rank) || [];
    list.push(c);
    byRank.set(c.rank, list);
  }

  for (const [, rankCards] of byRank) {
    // Unique suits
    const distinctSuitCards: PlayingCard[] = [];
    const usedSuits = new Set<Suit>();
    for (const c of rankCards) {
      if (!usedSuits.has(c.suit)) {
        usedSuits.add(c.suit);
        distinctSuitCards.push(c);
      }
    }
    if (distinctSuitCards.length >= 3) {
      const setToUse = distinctSuitCards.slice(0, 4);
      groups.push(evaluateCardGroup(setToUse, wildJokerRank));
      extractCards(setToUse);
    }
  }

  // 3. Extract Impure Sequences using available Wild Jokers
  const jokers = remaining.filter((c) => c.rank === wildJokerRank || c.isWildJoker);
  if (jokers.length > 0) {
    for (const suit of suits) {
      if (jokers.length === 0) break;
      const suitRemaining = remaining
        .filter((c) => c.suit === suit && c.rank !== wildJokerRank && !c.isWildJoker)
        .sort((a, b) => a.rank - b.rank);

      if (suitRemaining.length >= 2) {
        for (let i = 0; i < suitRemaining.length - 1; i++) {
          const c1 = suitRemaining[i];
          const c2 = suitRemaining[i + 1];
          // Consecutive or 1-gap (e.g. 4 and 6, or 4 and 5)
          const gap = c2.rank - c1.rank;
          if ((gap === 1 || gap === 2) && jokers.length > 0) {
            const jokerToUse = jokers.pop()!;
            const impureRun = [c1, jokerToUse, c2];
            groups.push(evaluateCardGroup(impureRun, wildJokerRank));
            extractCards([c1, c2, jokerToUse]);
            break;
          }
        }
      }
    }
  }

  // 4. Remaining cards grouped by suit for clean display
  if (remaining.length > 0) {
    for (const suit of suits) {
      const suitLeft = remaining
        .filter((c) => c.suit === suit)
        .sort((a, b) => a.rank - b.rank);
      if (suitLeft.length > 0) {
        groups.push(evaluateCardGroup(suitLeft, wildJokerRank));
      }
    }
  }

  return groups.length > 0 ? groups : sortCardsBySuits(cards, wildJokerRank);
}
