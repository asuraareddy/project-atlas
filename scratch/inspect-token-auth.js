import fs from 'fs';

const js = fs.readFileSync('scratch/azure-game-bundle.js', 'utf8');

const keywords = ['tokenAuth', 'clientId', 'game_id', 'init-game', 'stream', 'hls', 'webrtc', 'video', 'websocket', 'wss'];
keywords.forEach(kw => {
  let idx = 0;
  console.log(`=== KEYWORD: ${kw} ===`);
  let count = 0;
  while ((idx = js.indexOf(kw, idx)) !== -1 && count < 5) {
    console.log(js.substring(Math.max(0, idx - 150), Math.min(js.length, idx + 250)));
    console.log('---');
    idx += kw.length;
    count++;
  }
});
