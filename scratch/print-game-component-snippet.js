import fs from 'fs';

const js = fs.readFileSync('scratch/game-component.js', 'utf8');

const idx = js.indexOf('game-providers.games.demo-url');
console.log('Context around game launch:');
console.log(js.substring(Math.max(0, idx - 300), Math.min(js.length, idx + 800)));
