const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('Images:', json.content?.images);
console.log('Home content config:', json.config?.content?.home);
console.log('Welcome guest image:', json.content?.images?.homeWelcomeGuest);
