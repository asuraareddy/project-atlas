const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'casino');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const imagesToDownload = [
  { file: 'dice.webp', url: 'https://demo.1stake.app/images/games/dice/thumb.webp' },
  { file: 'crash.webp', url: 'https://demo.1stake.app/images/games/crash/thumb.webp' },
  { file: 'plinko.webp', url: 'https://demo.1stake.app/images/games/plinko/thumb.webp' },
  { file: 'mines.webp', url: 'https://static.1stake.app/images/providers/spribe/thumbs/mines.webp' },
  { file: 'heads-or-tails.webp', url: 'https://demo.1stake.app/images/games/heads-or-tails/thumb.webp' },
  { file: 'keno.webp', url: 'https://demo.1stake.app/images/games/keno/thumb.webp' },
  { file: 'lucky-wheel.webp', url: 'https://demo.1stake.app/images/games/lucky-wheel/thumb.webp' },
  { file: 'horse-racing.webp', url: 'https://demo.1stake.app/images/games/horse-racing/thumb.webp' },
  { file: 'crypto-prediction.webp', url: 'https://demo.1stake.app/images/games/crypto-prediction/thumb.webp' },
  { file: 'european-roulette.webp', url: 'https://demo.1stake.app/images/games/european-roulette/thumb.webp' },
  { file: 'american-roulette.webp', url: 'https://demo.1stake.app/images/games/american-roulette/thumb.webp' },
  { file: 'blackjack.webp', url: 'https://demo.1stake.app/images/games/blackjack/thumb.webp' },
  { file: 'multiplayer-blackjack.webp', url: 'https://demo.1stake.app/images/games/multiplayer-blackjack/thumb.webp' },
  { file: 'multiplayer-roulette.webp', url: 'https://demo.1stake.app/images/games/multiplayer-roulette/thumb.webp' },
  { file: 'baccarat.webp', url: 'https://demo.1stake.app/images/games/baccarat/thumb.webp' },
  { file: 'sic-bo.webp', url: 'https://demo.1stake.app/images/games/sic-bo/thumb.webp' },
  { file: 'casino-holdem.webp', url: 'https://demo.1stake.app/images/games/casino-holdem/thumb.webp' },
  { file: 'caribbean-poker.webp', url: 'https://demo.1stake.app/images/games/caribbean-poker/thumb.webp' },
  { file: 'video-poker.webp', url: 'https://demo.1stake.app/images/games/video-poker/thumb.webp' },
  { file: 'slots-gold-rush.webp', url: 'https://demo.1stake.app/images/games/slots/2/thumb.webp' },
  { file: 'slots-3d.webp', url: 'https://demo.1stake.app/images/games/slots-3d/thumb.webp' },
  { file: 'raffle.webp', url: 'https://demo.1stake.app/images/games/raffle/thumb.webp' },
  { file: 'dice-3d.webp', url: 'https://demo.1stake.app/images/games/dice-3d/thumb.webp' },
  { file: 'aviator.webp', url: 'https://static.1stake.app/images/providers/spribe/thumbs/aviator.webp' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✓ Downloaded:', path.basename(dest));
          resolve(true);
        });
      } else {
        console.error('Failed to download', url, 'Status:', res.statusCode);
        resolve(false);
      }
    }).on('error', (e) => {
      console.error('Network error', url, e.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Starting official 1Stake banner download to public/images/casino/ ...');
  for (const item of imagesToDownload) {
    const dest = path.join(targetDir, item.file);
    await download(item.url, dest);
  }
  console.log('Finished downloading 1Stake game assets.');
}

run();
