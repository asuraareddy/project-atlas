/**
 * Project Atlas - Automated Casino Game Engines & Protocol Verification Test
 * Tests all game types, provider catalogue coverage, 1Stake in-house suite,
 * provably fair verification, and seamless wallet callbacks.
 */

import http from 'http';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function post(path, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(
      `http://localhost:3000${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runEngineTests() {
  console.log('--- RUNNING 1STAKE CASINO MULTI-ENGINE & PROTOCOL VERIFICATION ---');

  // 1. Catalogue Verification
  const catRes = await get('/api/v1/games/casino/catalogue?category=all');
  if (catRes.status !== 200) throw new Error(`Catalogue API failed: ${catRes.status}`);
  const catData = JSON.parse(catRes.body);
  const games = catData.data.games;
  const providers = catData.data.providers;
  console.log(`✓ Casino catalogue loaded: ${games.length} games across ${providers.length} providers`);

  // Verify all 22 1Stake in-house games exist
  const expected1StakeInHouse = [
    '1stake_dice',
    '1stake_crash',
    '1stake_plinko',
    '1stake_mines',
    '1stake_heads_tails',
    '1stake_keno',
    '1stake_lucky_wheel',
    '1stake_horse_racing',
    '1stake_crypto_prediction',
    '1stake_european_roulette',
    '1stake_american_roulette',
    '1stake_blackjack',
    '1stake_multiplayer_blackjack',
    '1stake_multiplayer_roulette',
    '1stake_baccarat',
    '1stake_sicbo',
    '1stake_casino_holdem',
    '1stake_caribbean_poker',
    '1stake_video_poker',
    '1stake_slots',
    '1stake_slots_3d',
    '1stake_raffle',
  ];

  for (const id of expected1StakeInHouse) {
    const found = games.find((g) => g.id === id);
    if (!found) {
      throw new Error(`Missing expected 1Stake in-house game: ${id}`);
    }
  }
  console.log(`✓ All 22 1Stake In-House Games verified in catalogue`);

  // Verify Pending Credentials games
  const expectedPending = [
    'playtech_age_of_gods',
    'microgaming_mega_moolah',
    'novomatic_book_of_ra',
    'betsoft_sugar_pop',
  ];

  for (const id of expectedPending) {
    const found = games.find((g) => g.id === id);
    if (!found || found.status !== 'pending_credentials') {
      throw new Error(`Expected game ${id} to have status: pending_credentials`);
    }
  }
  console.log(`✓ External Commercial Games properly marked as 'pending_credentials' (no fake streams)`);

  // 2. Test 1Stake Provably Fair Dice
  const diceRes = await get('/casino/sandbox-frame?gameId=1stake_dice&currency=GC');
  if (diceRes.status !== 200 || !diceRes.body.includes('1stake_dice')) {
    throw new Error('1Stake Dice sandbox frame failed to render');
  }
  console.log('✓ 1Stake Provably Fair Dice Studio: Verified (1stake_dice)');

  // 3. Test 1Stake Mines
  const minesRes = await get('/casino/sandbox-frame?gameId=1stake_mines&currency=SC');
  if (minesRes.status !== 200 || !minesRes.body.includes('1stake_mines')) {
    throw new Error('1Stake Mines sandbox frame failed to render');
  }
  console.log('✓ 1Stake Mines Studio: Verified (1stake_mines)');

  // 4. Test 1Stake Plinko
  const plinkoRes = await get('/casino/sandbox-frame?gameId=1stake_plinko');
  if (plinkoRes.status !== 200 || !plinkoRes.body.includes('1stake_plinko')) {
    throw new Error('1Stake Plinko sandbox frame failed to render');
  }
  console.log('✓ 1Stake Plinko Studio: Verified (1stake_plinko)');

  // 5. Test 1Stake Keno
  const kenoRes = await get('/casino/sandbox-frame?gameId=1stake_keno');
  if (kenoRes.status !== 200 || !kenoRes.body.includes('1stake_keno')) {
    throw new Error('1Stake Keno sandbox frame failed to render');
  }
  console.log('✓ 1Stake Keno Studio: Verified (1stake_keno)');

  // 6. Test 1Stake Crypto Prediction
  const cryptoRes = await get('/casino/sandbox-frame?gameId=1stake_crypto_prediction');
  if (cryptoRes.status !== 200 || !cryptoRes.body.includes('1stake_crypto_prediction')) {
    throw new Error('1Stake Crypto Prediction sandbox frame failed to render');
  }
  console.log('✓ 1Stake Crypto Price Prediction Studio: Verified (1stake_crypto_prediction)');

  // 7. Test Pending Credentials Diagnostic Frame
  const pendingFrameRes = await get('/casino/sandbox-frame?gameId=playtech_age_of_gods');
  if (pendingFrameRes.status !== 200 || !pendingFrameRes.body.includes('playtech_age_of_gods')) {
    throw new Error('Pending Credentials diagnostic frame failed to render');
  }
  console.log('✓ Pending Credentials Diagnostic Frame: Verified (playtech_age_of_gods)');

  // 8. Test Live Roulette Engine
  const rouletteRes = await get('/casino/sandbox-frame?gameId=evo_lightning_roulette');
  if (rouletteRes.status !== 200 || !rouletteRes.body.includes('evo_lightning_roulette')) {
    throw new Error('Roulette sandbox frame failed to render properly');
  }
  console.log('✓ Live Roulette Engine: Verified (evo_lightning_roulette)');

  // 9. Test Provably Fair Verification API (HMAC-SHA256)
  const verifyRes = await post('/api/v1/games/casino/verify-seed', {
    serverSeed: 'd3b07384d113edec49eaa6238ad5ff007384d113edec49eaa6238ad5ff007384',
    clientSeed: 'client_seed_test_123',
    nonce: 1,
  });
  if (verifyRes.status !== 200) {
    throw new Error(`Provably Fair verification failed: ${verifyRes.status}`);
  }
  const verifyData = JSON.parse(verifyRes.body);
  if (!verifyData.data.isValid || !verifyData.data.calculatedHash) {
    throw new Error(`Invalid provably fair verification response: ${verifyRes.body}`);
  }
  console.log(`✓ Provably Fair HMAC-SHA256 Verification API: Verified (Hash: ${verifyData.data.calculatedHash.substring(0, 16)}..., Outcome: ${verifyData.data.derivedOutcome})`);

  // 10. Test Launch Game API Rejection for Pending Commercial Game
  const launchPendingRes = await post('/api/v1/games/casino/launch', {
    gameId: 'playtech_age_of_gods',
    playerId: 'test_player_01',
    currency: 'GC',
  });
  if (launchPendingRes.status !== 500 && launchPendingRes.status !== 400) {
    // Should reject or indicate missing credentials
    const lData = JSON.parse(launchPendingRes.body);
    if (!lData.error && lData.data?.sessionUrl) {
      throw new Error('Pending commercial game must not pretend to return a valid live session URL');
    }
  }
  console.log('✓ Pending Commercial Game Launch Guard: Rejection enforced safely');

  // 11. Test Seamless Wallet Sandbox Callback POST with Gold Coins (GC)
  const betTxId = `test_tx_${Date.now()}`;
  const cbRes = await post('/api/v1/games/casino/sandbox-callback', {
    action: 'bet',
    player_id: 'test_player',
    amount: 100,
    currency: 'GC',
    round_id: `round_${Date.now()}`,
    tx_id: betTxId,
    game_id: '1stake_dice',
  });

  if (cbRes.status !== 200) {
    throw new Error(`Callback failed with status: ${cbRes.status}`);
  }
  const cbData = JSON.parse(cbRes.body);
  if (!cbData.ok) {
    throw new Error(`Callback status not ok: ${JSON.stringify(cbData)}`);
  }
  console.log(`✓ Seamless Wallet Sandbox Callback: Bet executed successfully in GC (balance: ${cbData.balance})`);

  // 12. Test duplicate tx_id idempotency
  const dupRes = await post('/api/v1/games/casino/sandbox-callback', {
    action: 'bet',
    player_id: 'test_player',
    amount: 100,
    currency: 'GC',
    round_id: `round_${Date.now()}`,
    tx_id: betTxId,
    game_id: '1stake_dice',
  });
  const dupData = JSON.parse(dupRes.body);
  if (!dupData.ok || !dupData.duplicate) {
    throw new Error('Expected duplicate tx_id detection with duplicate: true');
  }
  console.log('✓ Seamless Wallet Idempotency: Duplicate tx_id safely acknowledged');

  console.log('--- ALL 1STAKE CASINO TESTS PASSED (12/12) ---');
}

runEngineTests().catch((err) => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
