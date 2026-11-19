const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

const allGames = [
  ...(json.games?.original || []),
  ...(json.games?.external?.games || [])
];

const minesMatches = allGames.filter(g => g.name?.toLowerCase().includes('mines') || g.id?.toLowerCase().includes('mines'));
console.log('Mines matches:', minesMatches.map(m => ({ id: m.id, name: m.name, banner: m.banner })));
