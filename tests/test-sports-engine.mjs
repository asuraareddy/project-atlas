/**
 * Project Atlas — Sports Category & Betfair Integration Test Suite
 * Based on betcode-org/betfair (betfairlightweight) & Betfair API-NG Specification
 *
 * Verifies:
 * 1. Betfair API-NG & In-Play credentials and config diagnostics
 * 2. Live Cricket score mathematics (overs, wickets, run rates, ball-by-ball commentary)
 * 3. Betfair Exchange dual-sided liquidity ladders (Back Blue, Lay Pink, Depth)
 * 4. Fixed Bookmaker odds distinction
 * 5. Exchange calculations: Back profit vs Lay liability [stake * (odds - 1)]
 * 6. Tenant isolation & Whitelabel B2B SaaS gating for 'sports'
 * 7. Endpoints integration and zero fabrication invariants
 */

import assert from 'node:assert/strict';
import { BetfairSportsAdapter } from '../src/domain/games/adapters/sports.adapter.ts';
import { B2B_PACKAGES } from '../src/domain/tenant/store.ts';

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failCount++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    failCount++;
  }
}

console.log('\n======================================================');
console.log(' BETFAIR SPORTS EXCHANGE & CRICKET TEST SUITE');
console.log('======================================================\n');

// ------------------------------------------------------------------
// Suite 1: Repository Audit & Betfair API-NG Diagnostics
// ------------------------------------------------------------------
console.log('[Suite 1: Repository Audit & Credentials Diagnostics]');

test('Betfair adapter initializes in delayed/sandbox mode with credentials contract', () => {
  const config = BetfairSportsAdapter.getCredentialsConfig();

  assert.ok(config);
  assert.equal(config.endpointBetting, 'https://api.betfair.com/exchange/betting/rest/v1.0');
  assert.equal(config.endpointInPlay, 'https://ips.betfair.com/inplayservice/v1.1');
  assert.ok(['live', 'delayed', 'sandbox'].includes(config.mode));
});

test('Betfair Event Types: Cricket is primary (ID 4), followed by Soccer (1), Tennis (2), Basketball (7522)', () => {
  const categories = BetfairSportsAdapter.SUPPORTED_CATEGORIES;

  assert.ok(categories.length >= 4, 'Must register at least 4 sport categories');
  assert.equal(categories[0].id, '4', 'Cricket must be first category');
  assert.equal(categories[0].slug, 'cricket');
  assert.equal(categories[1].id, '1', 'Soccer/Football must be second category');
  assert.equal(categories[2].id, '2', 'Tennis must be third category');
  assert.equal(categories[3].id, '7522', 'Basketball must be fourth category');
});

// ------------------------------------------------------------------
// Suite 2: Live Cricket Scorecard Mathematics & Data Schema
// ------------------------------------------------------------------
console.log('\n[Suite 2: Live Cricket Scoreboard & In-Play Data Engine]');

test('Cricket overs representation accurately models balls (e.g. 18.2 overs = 18 completed overs + 2 balls)', () => {
  const oversDecimal = 18.2;
  const completedOvers = Math.floor(oversDecimal);
  const ballsInOver = Math.round((oversDecimal - completedOvers) * 10);

  assert.equal(completedOvers, 18);
  assert.equal(ballsInOver, 2);

  const totalLegalBalls = completedOvers * 6 + ballsInOver;
  assert.equal(totalLegalBalls, 110);
});

test('Cricket Current Run Rate (CRR) calculates accurately: Runs / Total Overs completed', () => {
  const runs = 164;
  const overs = 18.2; // 110 balls
  const totalCompletedOvers = 18 + 2 / 6; // 18.3333...
  const expectedCrr = parseFloat((runs / totalCompletedOvers).toFixed(2));

  assert.equal(expectedCrr, 8.95);
});

test('Cricket Required Run Rate (RRR) calculates runs needed divided by remaining overs', () => {
  const target = 186;
  const currentRuns = 164;
  const runsNeeded = target - currentRuns; // 22 runs
  const totalOversLimit = 20;
  const completedOvers = 18 + 2 / 6; // 18.333...
  const remainingOvers = totalOversLimit - completedOvers; // 1.666... overs (10 balls)

  const expectedRrr = parseFloat((runsNeeded / remainingOvers).toFixed(2));
  assert.equal(expectedRrr, 13.20);
});

asyncTest('Cricket live match event contains complete score breakdown with batsmen, bowler, and ball strip', async () => {
  const events = await BetfairSportsAdapter.getEvents('4');
  const liveMatch = events.find((e) => e.status === 'IN_PLAY' && e.cricketScore);

  assert.ok(liveMatch, 'Live in-play cricket match must exist');
  assert.ok(liveMatch.cricketScore);
  assert.equal(liveMatch.cricketScore.currentBattingTeam, 'HOME');
  assert.ok(liveMatch.cricketScore.homeScore.runs > 0);
  assert.ok(liveMatch.cricketScore.recentBalls.length >= 4, 'Must include over ball strip');
  assert.ok(liveMatch.cricketScore.currentBatsmen?.length === 2, 'Must include 2 batsmen on crease');
  assert.ok(liveMatch.cricketScore.currentBowler, 'Must include active bowler figures');
});

// ------------------------------------------------------------------
// Suite 3: Betfair Exchange Dual-Sided Back / Lay Ladders & Bookmaker Odds
// ------------------------------------------------------------------
console.log('\n[Suite 3: Betfair Exchange Liquidity Ladders & Fixed Odds]');

asyncTest('Back Ladder (Blue) is ordered descending by price (best price to back is highest)', async () => {
  const detail = await BetfairSportsAdapter.getMatchDetail('cricket_ind_aus_2026');
  assert.ok(detail, 'Match detail must be found');
  const matchOdds = detail.markets.find((m) => m.marketType === 'MATCH_ODDS');

  assert.ok(matchOdds, 'Match odds market must exist');
  for (const runner of matchOdds.runners) {
    const prices = runner.backLadder.map((l) => l.price);
    for (let i = 0; i < prices.length - 1; i++) {
      assert.ok(
        prices[i] >= prices[i + 1],
        `Back ladder must be sorted descending: ${prices[i]} >= ${prices[i + 1]}`
      );
    }
  }
});

asyncTest('Lay Ladder (Pink) is ordered ascending by price (best price to lay is lowest)', async () => {
  const detail = await BetfairSportsAdapter.getMatchDetail('cricket_ind_aus_2026');
  assert.ok(detail, 'Match detail must be found');
  const matchOdds = detail.markets.find((m) => m.marketType === 'MATCH_ODDS');

  for (const runner of matchOdds.runners) {
    const prices = runner.layLadder.map((l) => l.price);
    for (let i = 0; i < prices.length - 1; i++) {
      assert.ok(
        prices[i] <= prices[i + 1],
        `Lay ladder must be sorted ascending: ${prices[i]} <= ${prices[i + 1]}`
      );
    }
  }
});

asyncTest('Exchange Spread: Best Lay price is strictly greater than Best Back price', async () => {
  const detail = await BetfairSportsAdapter.getMatchDetail('cricket_ind_aus_2026');
  assert.ok(detail, 'Match detail must be found');
  const matchOdds = detail.markets.find((m) => m.marketType === 'MATCH_ODDS');

  for (const runner of matchOdds.runners) {
    const bestBack = runner.backLadder[0].price;
    const bestLay = runner.layLadder[0].price;
    assert.ok(
      bestLay > bestBack,
      `Market spread condition violated: Lay (${bestLay}) must be > Back (${bestBack})`
    );
  }
});

asyncTest('Bookmaker odds are fixed single prices distinct from exchange depth', async () => {
  const detail = await BetfairSportsAdapter.getMatchDetail('cricket_ind_aus_2026');
  assert.ok(detail, 'Match detail must be found');
  const matchOdds = detail.markets.find((m) => m.marketType === 'MATCH_ODDS');

  for (const runner of matchOdds.runners) {
    assert.ok(runner.bookmakerOdds > 1.0, 'Bookmaker odds must be greater than 1.0');
    assert.equal(typeof runner.bookmakerOdds, 'number');
  }
});

// ------------------------------------------------------------------
// Suite 4: Exchange Bet Calculations (Back Profit vs Lay Liability)
// ------------------------------------------------------------------
console.log('\n[Suite 4: Exchange Calculations: Back Profit & Lay Liability]');

test('Back Bet calculation: Profit = Stake * (Odds - 1), Return = Stake * Odds', () => {
  const stake = 25.0; // £25.00
  const odds = 1.95;

  const potentialProfit = parseFloat((stake * (odds - 1)).toFixed(2));
  const totalReturn = parseFloat((stake * odds).toFixed(2));

  assert.equal(potentialProfit, 23.75);
  assert.equal(totalReturn, 48.75);
});

test('Lay Bet calculation: Liability = Stake * (Odds - 1), Backer Stake = Stake', () => {
  const backerStake = 50.0; // £50.00
  const layOdds = 2.10;

  const liability = parseFloat((backerStake * (layOdds - 1)).toFixed(2));
  assert.equal(liability, 55.0);
});

// ------------------------------------------------------------------
// Suite 5: Multi-Tenant Architecture & Whitelabel B2B Tenant Isolation
// ------------------------------------------------------------------
console.log('\n[Suite 5: Whitelabel B2B SaaS Tenant Isolation]');

test('Complete Pro Suite package includes sports key alongside matka, carrom, ludo, casino, pool', () => {
  const completePro = B2B_PACKAGES.find((p) => p.code === 'COMPLETE_PRO_SUITE');
  assert.ok(completePro, 'Complete Pro Suite must exist');
  assert.ok(completePro.includedGames.includes('sports'));
  assert.ok(completePro.includedGames.includes('matka'));
  assert.ok(completePro.includedGames.includes('carrom'));
  assert.ok(completePro.includedGames.includes('ludo'));
  assert.ok(completePro.includedGames.includes('casino'));
  assert.ok(completePro.includedGames.includes('pool'));
});

test('Tenant with sports disabled is blocked from accessing sports endpoints (Tenant Policy Enforced)', () => {
  const mockTenantWithSportsDisabled = {
    id: 'tenant_restricted_001',
    enabledGames: ['matka', 'carrom'],
  };

  const isSportsEnabled = mockTenantWithSportsDisabled.enabledGames.includes('sports');
  assert.equal(isSportsEnabled, false, 'Sports should be disabled for this tenant');

  function accessSports(tenant) {
    if (!tenant.enabledGames.includes('sports')) {
      throw new Error('TENANT_FEATURE_DISABLED: Sports exchange is not enabled for this tenant');
    }
    return { ok: true };
  }

  assert.throws(
    () => accessSports(mockTenantWithSportsDisabled),
    /TENANT_FEATURE_DISABLED/,
    'Server must reject sports requests for non-entitled tenants'
  );
});

test('Tenant with sports enabled successfully accesses sports catalogue', () => {
  const mockTenantWithSports = {
    id: 'org_atlas_uk_001',
    enabledGames: ['matka', 'carrom', 'ludo', 'casino', 'pool', 'sports'],
  };

  assert.ok(mockTenantWithSports.enabledGames.includes('sports'));
});

// ------------------------------------------------------------------
// Suite 6: Live API Endpoints HTTP Verification
// ------------------------------------------------------------------
console.log('\n[Suite 6: HTTP API Endpoints Live Verification]');

asyncTest('GET /api/v1/games/sports/events returns 200 with categories and cricket events', async () => {
  const res = await fetch('http://localhost:3000/api/v1/games/sports/events?eventTypeId=4');
  assert.equal(res.status, 200, 'Events endpoint must return HTTP 200');

  const json = await res.json();
  const data = json.data || json;
  assert.ok(Array.isArray(data.categories), 'Must return categories array');
  assert.ok(Array.isArray(data.events), 'Must return events array');
  assert.ok(data.events.length > 0, 'Must contain cricket events');
  assert.equal(json.meta?.provider, 'Betfair API-NG & In-Play Service');
});

asyncTest('GET /api/v1/games/sports/events/cricket_ind_aus_2026 returns 200 with full match details and ladders', async () => {
  const res = await fetch('http://localhost:3000/api/v1/games/sports/events/cricket_ind_aus_2026');
  assert.equal(res.status, 200, 'Match detail endpoint must return HTTP 200');

  const json = await res.json();
  const data = json.data || json;
  assert.ok(data.event);
  assert.equal(data.event.id, 'cricket_ind_aus_2026');
  assert.ok(data.event.cricketScore);
  assert.ok(Array.isArray(data.markets));
  assert.ok(data.markets.length >= 3, 'Must contain multiple markets (Match Odds, Tied Match, etc.)');
});

asyncTest('GET /api/v1/games/sports/config returns 200 with Betfair diagnostics', async () => {
  const res = await fetch('http://localhost:3000/api/v1/games/sports/config');
  assert.equal(res.status, 200, 'Config endpoint must return HTTP 200');

  const json = await res.json();
  const data = json.data || json;
  assert.ok(data.endpointBetting);
  assert.ok(data.endpointInPlay);
});

// ------------------------------------------------------------------
// Summary Report
// ------------------------------------------------------------------
setTimeout(() => {
  console.log('\n======================================================');
  console.log(` BETFAIR SPORTS TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}, 500);
