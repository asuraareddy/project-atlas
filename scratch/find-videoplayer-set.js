import fs from 'fs';

const js = fs.readFileSync('scratch/azure-game-bundle.js', 'utf8');

const target = 'GW.videoPlayer=';
let idx = js.indexOf(target);
console.log('Index of GW.videoPlayer= :', idx);
if (idx !== -1) {
  console.log(js.substring(Math.max(0, idx - 200), Math.min(js.length, idx + 400)));
} else {
  console.log('Searching .videoPlayer =');
  const matches = js.matchAll(/\.videoPlayer\s*=\s*[^;,]+/g);
  for (const m of matches) {
    console.log(m[0]);
  }
}
