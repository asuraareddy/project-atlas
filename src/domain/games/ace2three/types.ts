export type Suit = 'C' | 'D' | 'H' | 'S';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface PlayingCard {
  id: string;
  suit: Suit;
  rank: Rank;
  isWildJoker?: boolean;
  assetUrl: string;
}

export type GamePhase = 'lobby' | 'cut_for_seat' | 'dealing' | 'playing' | 'round_end' | 'game_over';
export type TurnState = 'draw' | 'discard';

export interface CardGroup {
  id: string;
  cards: PlayingCard[];
  isValid: boolean;
  type: 'pure_sequence' | 'impure_sequence' | 'set' | 'invalid';
  score: number;
}

export interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  hand: PlayingCard[];
  groups: CardGroup[];
  score: number;
  chips: number;
  isAi: boolean;
  hasDrawnThisTurn: boolean;
}

export interface CutForSeatResult {
  playerCard: PlayingCard;
  opponentCard: PlayingCard;
  winnerId: string;
  message: string;
}

export interface DeclareValidationResult {
  isValid: boolean;
  reason: string;
  pureSequencesCount: number;
  totalSequencesCount: number;
  invalidCardsCount: number;
  deadwoodScore: number;
  groups: CardGroup[];
}

export interface Ace2ThreeGameState {
  sessionId: string;
  phase: GamePhase;
  turnPlayerId: string;
  turnState: TurnState;
  stake: number;
  wildJoker: PlayingCard | null;
  closedDeck: PlayingCard[];
  openDeck: PlayingCard[];
  players: [PlayerState, PlayerState];
  cutForSeat: CutForSeatResult | null;
  lastActionMessage: string;
  winnerId: string | null;
  history: string[];
}

