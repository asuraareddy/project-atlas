const https = require('https');

const paths = [
  '/images/games/dice/thumb.webp',
  '/images/games/crash/thumb.webp',
  '/images/games/plinko/thumb.webp',
  '/images/games/mines/thumb.webp',
  '/images/games/keno/thumb.webp',
  '/images/games/lucky-wheel/thumb.webp',
  '/images/games/horse-racing/thumb.webp',
  '/images/games/heads-or-tails/thumb.webp',
  '/images/games/crypto-prediction/thumb.webp',
  '/images/games/european-roulette/thumb.webp',
  '/images/games/american-roulette/thumb.webp',
  '/images/games/blackjack/thumb.webp',
  '/images/games/multiplayer-blackjack/thumb.webp',
  '/images/games/multiplayer-roulette/thumb.webp',
  '/images/games/baccarat/thumb.webp',
  '/images/games/sic-bo/thumb.webp',
  '/images/games/casino-holdem/thumb.webp',
  '/images/games/caribbean-poker/thumb.webp',
  '/images/games/video-poker/thumb.webp',
  '/images/games/slots/2/thumb.webp',
  '/images/games/slots-3d/thumb.webp',
  '/images/games/raffle/thumb.webp',
  '/images/games/dice-3d/thumb.webp',
];

async function checkPaths() {
  for (const p of paths) {
    await new Promise((resolve) => {
      https.get(`https://demo.1stake.app${p}`, (res) => {
        console.log(p, '->', res.statusCode, res.headers['content-type']);
        resolve();
      }).on('error', (e) => {
        console.log(p, '-> ERROR', e.message);
        resolve();
      });
    });
  }
}

checkPaths();
