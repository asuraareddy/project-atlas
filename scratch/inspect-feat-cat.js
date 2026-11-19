const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('FeaturedCategories:', json.games?.external?.featuredCategories);
