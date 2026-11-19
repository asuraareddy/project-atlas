const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('Settings.content.home:', JSON.stringify(json.config?.settings?.content?.home, null, 2));
