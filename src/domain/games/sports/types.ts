/**
 * Project Atlas - Sports Category Types & Contracts
 * Based on Betfair API-NG Specification & betcode-org/betfair (betfairlightweight)
 * Reference: https://github.com/betcode-org/betfair
 *
 * Implements:
 * 1. Betfair Event Types (Cricket ID=4, Soccer ID=1, Tennis ID=2, Basketball ID=7522)
 * 2. In-Play Cricket Scoreboards (Runs, Wickets, Overs, Balls, Run Rate, Commentary, Batting/Bowling state)
 * 3. Betfair Exchange Liquidity Ladder (Back = Blue, Lay = Pink with price & depth size)
 * 4. Fixed Bookmaker Odds Comparison
 * 5. Multi-Tenant Entitlement & Safe Sandbox Mode
 */

export interface SportCategory {
  id: string; // Betfair Event Type ID, e.g. "4" for Cricket
  name: string;
  slug: string;
  icon: string;
  activeEventCount: number;
  inPlayCount: number;
}

export interface CricketBatsman {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isStriker: boolean;
}

export interface CricketBowler {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface CricketInningsScore {
  runs: number;
  wickets: number;
  overs: number; // e.g. 18.2 means 18 overs and 2 balls completed
  inning: number;
  declarations?: number;
  target?: number;
}

export interface CricketScore {
  homeScore: CricketInningsScore;
  awayScore: CricketInningsScore;
  currentBattingTeam: 'HOME' | 'AWAY';
  matchType: 'T20' | 'ODI' | 'TEST' | 'THE_HUNDRED';
  oversLimit?: number; // 20 for T20, 50 for ODI
  currentRunRate: number;
  requiredRunRate?: number;
  recentBalls: string[]; // e.g. ['1', '4', 'W', '0', '6', '1']
  commentary: string;
  lastUpdated: string;
  currentBatsmen?: CricketBatsman[];
  currentBowler?: CricketBowler;
}

export interface SportsEvent {
  id: string; // Betfair Event ID, e.g. "33445566"
  eventTypeId: string; // "4" = Cricket
  sportName: string;
  competition: string;
  competitionId?: string;
  name: string; // e.g. "India vs Australia"
  homeTeam: string;
  awayTeam: string;
  openDate: string; // ISO 8601
  countryCode: string;
  venue?: string;
  status: 'IN_PLAY' | 'PRE_MATCH' | 'COMPLETED' | 'SUSPENDED';
  isInPlay: boolean;
  marketCount: number;
  totalMatched: number; // GBP matched on Betfair Exchange
  cricketScore?: CricketScore;
}

export interface ExchangePrice {
  price: number; // e.g. 1.95
  size: number; // Available liquidity in GBP, e.g. 4250.00
}

export interface MarketRunner {
  selectionId: number;
  runnerName: string;
  handicap: number;
  sortPriority: number;
  status: 'ACTIVE' | 'WINNER' | 'LOSER' | 'REMOVED';
  backLadder: ExchangePrice[]; // Available to Back (Blue) - Best to worst
  layLadder: ExchangePrice[]; // Available to Lay (Pink) - Best to worst
  bookmakerOdds: number; // Fixed Bookmaker odds for comparison
  lastTradedPrice?: number;
  totalMatched?: number;
}

export interface SportsMarket {
  marketId: string; // e.g. "1.23456789"
  marketName: string; // "Match Odds", "Completed Match", "Top Batsman", etc.
  marketType: 'MATCH_ODDS' | 'TIED_MATCH' | 'COMPLETED_MATCH' | 'OVER_UNDER' | 'SPECIALS';
  eventId: string;
  status: 'OPEN' | 'SUSPENDED' | 'CLOSED';
  inplay: boolean;
  totalMatched: number;
  numberOfActiveRunners: number;
  runners: MarketRunner[];
  lastRefreshTime: string;
}

export interface MatchDetailResponse {
  event: SportsEvent;
  markets: SportsMarket[];
  meta: {
    provider: 'Betfair API-NG & In-Play Service';
    connectionType: 'API_POLLING_FALLBACK' | 'BETFAIR_LIVE_FEED';
    isDelayedKey: boolean;
    dataTimestamp: string;
    isTestMode: boolean;
  };
}

export interface BetfairCredentialsConfig {
  appKey: string;
  username: string;
  isConfigured: boolean;
  isCertAuth: boolean;
  mode: 'live' | 'delayed' | 'sandbox';
  endpointBetting: string;
  endpointInPlay: string;
}

export interface BetSlipSelection {
  marketId: string;
  marketName: string;
  eventId: string;
  eventName: string;
  selectionId: number;
  runnerName: string;
  type: 'BACK' | 'LAY' | 'BOOKMAKER';
  odds: number;
  stake: number;
  potentialProfit: number;
  liability?: number;
}
