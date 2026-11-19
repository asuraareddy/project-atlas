import fs from 'fs';

const js = fs.readFileSync('scratch/azure-game-bundle.js', 'utf8');

const regex = /videoPlayer/g;
let m;
while ((m = regex.exec(js)) !== null) {
  console.log('videoPlayer at', m.index);
  console.log(js.substring(Math.max(0, m.index - 100), Math.min(js.length, m.index + 200)));
  console.log('---');
}
