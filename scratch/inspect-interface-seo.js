const fs = require('fs');
const json = JSON.parse(fs.readFileSync('scratch/1stake-demo-store.json', 'utf8'));

console.log('Interface:', JSON.stringify(json.config?.settings?.interface, null, 2));
console.log('Seo:', JSON.stringify(json.content?.seo, null, 2));
