import fs from 'fs';

const js = fs.readFileSync('scratch/azure-game-bundle.js', 'utf8');

const idx = js.indexOf('videoPlayer');
let cur = 0;
while ((cur = js.indexOf('videoPlayer', cur)) !== -1) {
  console.log('=== MATCH AT', cur, '===');
  console.log(js.substring(Math.max(0, cur - 200), Math.min(js.length, cur + 500)));
  cur += 11;
}
