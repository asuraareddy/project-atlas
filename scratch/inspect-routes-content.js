const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('Routes keys:', Object.keys(json.routes || {}));
console.log('Content keys:', Object.keys(json.content || {}));
console.log('User model:', json.user);
console.log('Content.home:', json.content?.home);
console.log('All routes sample:', Object.entries(json.routes || {}).slice(0, 15));
