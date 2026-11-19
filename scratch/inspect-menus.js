const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('Menus:', JSON.stringify(json.content?.menus, null, 2));
