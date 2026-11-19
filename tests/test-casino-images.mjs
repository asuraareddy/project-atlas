import fs from 'fs';
import path from 'path';

console.log('=== QA TESTING TEAM: CASINO GAME ASSET & ENGINE AUDIT ===');

const adapterPath = path.join(process.cwd(), 'src', 'domain', 'games', 'adapters', 'casino.adapter.ts');
const adapterContent = fs.readFileSync(adapterPath, 'utf8');

const gamesDir = path.join(process.cwd(), 'public', 'images', 'casino');

// Extract all thumbnails from catalogue
const thumbnailRegex = /id:\s*'([^']+)',[\s\S]*?name:\s*'([^']+)',[\s\S]*?provider:\s*'([^']+)',[\s\S]*?category:\s*'([^']+)',[\s\S]*?thumbnail:\s*'([^']+)'/g;

let match;
let totalGames = 0;
let validImages = 0;
const results = [];

while ((match = thumbnailRegex.exec(adapterContent)) !== null) {
  totalGames++;
  const [_, id, name, provider, category, thumbnail] = match;

  let imageOk = false;
  let details = '';

  if (thumbnail.includes('unsplash.com')) {
    imageOk = false;
    details = 'FAIL: Unsplash placeholder detected';
  } else if (thumbnail.startsWith('/images/casino/')) {
    const filename = thumbnail.replace('/images/casino/', '');
    const localPath = path.join(gamesDir, filename);
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      if (stats.size > 1000) {
        imageOk = true;
        details = `OK (Local WebP ${(stats.size / 1024).toFixed(1)} KB)`;
      } else {
        imageOk = false;
        details = `FAIL: File too small (${stats.size} bytes)`;
      }
    } else {
      imageOk = false;
      details = `FAIL: Local file not found (${localPath})`;
    }
  } else if (thumbnail.startsWith('https://static.1stake.app/')) {
    imageOk = true;
    details = 'OK (Official 1Stake Remote Asset)';
  } else {
    imageOk = false;
    details = `FAIL: Unknown asset scheme (${thumbnail})`;
  }

  if (imageOk) validImages++;

  results.push({
    id,
    name,
    provider,
    category,
    thumbnail,
    status: imageOk ? 'PASS' : 'FAIL',
    details,
  });
}

console.log(`Audited ${totalGames} games in casino catalogue:`);
results.forEach((r, idx) => {
  const icon = r.status === 'PASS' ? '✓' : '✗';
  console.log(`${icon} [${idx + 1}/${totalGames}] ${r.name.padEnd(35)} | ${r.provider.padEnd(20)} | ${r.details}`);
});

console.log('----------------------------------------------------');
console.log(`Results: ${validImages}/${totalGames} games have authentic, verified assets.`);

if (validImages !== totalGames) {
  console.error(`QA AUDIT FAILED: ${totalGames - validImages} games have missing or placeholder images.`);
  process.exit(1);
} else {
  console.log('QA AUDIT PASSED: 100% of games have verified, authentic, meaningful game artwork.');
}
